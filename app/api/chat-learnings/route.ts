import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SAKURA_MAMA_MODEL } from "@/lib/nightos/constants";
import { chatLearningsSchema, parseBody } from "@/lib/nightos/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM_PROMPT = `あなたは「さくらママ」です。銀座の高級クラブで30年間ママを務めた夜の世界のプロフェッショナル。
キャストがチャットでピン留め（保存）した会話を読み、「お客様ごとに覚えておくべきこと」として整理します。

# やること
- ピン留めされた会話・メモを、登場するお客様ごとにまとめる
- 各お客様について、好み・注意点・話題・来店傾向など、次の接客で役立つ"その人固有の情報"を抜き出す
- 一般論ではなく、そのお客様にしか当てはまらない具体的な事実・気づきに落とす
- お客様が特定できないピンは customer を「全般」とし、再現できる学びとしてまとめる

# ルール
- 1人のお客様につき学びは1〜3件。お客様の数だけ繰り返してよい（全体で最大8件）
- 各学びは customer（お客様の名前。特定できなければ「全般」）, category（短いタグ・最大6文字。例: 好み / 注意 / 話題 / 来店）, title（一文の要点）, body（2〜3行の具体策）で構成
- title は体言止め or 「〜する」、抽象論は禁止。具体的な事実・行動まで落とす
- body をさくらママ口調で書く場合、「〜んよ」のような砕けた・方言調の語尾は使わない（正しくは「〜のよ」「〜のね」）
- 出力は必ず次のJSONのみ。前置き・説明・コードフェンスは禁止:
{"learnings":[{"customer":"...","category":"...","title":"...","body":"..."}]}
`;

interface Pin {
  content: string;
  senderName?: string;
  memo?: string;
  customerName?: string | null;
}

export interface Learning {
  customer?: string | null;
  category: string;
  title: string;
  body: string;
}

export async function POST(req: Request) {
  const parsed = await parseBody(req, chatLearningsSchema);
  if (parsed instanceof NextResponse) return parsed;
  const { pins } = parsed;

  // Stub mode — group heuristically so the tab works without an API key.
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ learnings: stubLearnings(pins) });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: SAKURA_MAMA_MODEL,
      max_tokens: 1200,
      temperature: 0.4,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: formatPins(pins) }],
    });
    const text = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();
    const learnings = parseLearnings(text);
    if (learnings.length === 0) {
      return NextResponse.json({ learnings: stubLearnings(pins) });
    }
    return NextResponse.json({ learnings });
  } catch (err) {
    console.error("[chat-learnings] Claude call failed:", err);
    return NextResponse.json({ learnings: stubLearnings(pins) });
  }
}

function formatPins(pins: Pin[]): string {
  const lines = pins.map((p, i) => {
    const parts = [`【${i + 1}】`];
    if (p.customerName) parts.push(`（お客様: ${p.customerName}）`);
    if (p.senderName) parts.push(`${p.senderName}: `);
    parts.push(p.content.trim());
    if (p.memo?.trim()) parts.push(`\n  ↳ メモ: ${p.memo.trim()}`);
    return parts.join("");
  });
  return `次のピン留めされた会話を、覚えておくべき学びに整理して。\n\n${lines.join("\n\n")}`;
}

/** Tolerant JSON extraction — strips code fences / prose around the object. */
function parseLearnings(text: string): Learning[] {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return [];
  try {
    const obj = JSON.parse(text.slice(start, end + 1)) as {
      learnings?: unknown;
    };
    if (!Array.isArray(obj.learnings)) return [];
    return obj.learnings
      .map((l) => {
        const item = l as Partial<Learning>;
        const customer = String(item.customer ?? "").trim();
        return {
          customer: customer.length > 0 ? customer : null,
          category: String(item.category ?? "学び").slice(0, 12),
          title: String(item.title ?? "").trim(),
          body: String(item.body ?? "").trim(),
        };
      })
      .filter((l) => l.title.length > 0)
      .slice(0, 8);
  } catch {
    return [];
  }
}

/**
 * Offline / no-key fallback: group pins by customer so the 学び tab still
 * produces something coherent (per-customer notes + a 全般 bucket) from the
 * cast's pins + memos.
 */
function stubLearnings(pins: Pin[]): Learning[] {
  const groups = new Map<string, string[]>();
  for (const p of pins) {
    const key = p.customerName?.trim() || "全般";
    const snippet = (p.memo?.trim() || p.content).trim().slice(0, 120);
    if (!snippet) continue;
    const list = groups.get(key) ?? [];
    list.push(snippet);
    groups.set(key, list);
  }

  const learnings: Learning[] = [];
  groups.forEach((snippets, customer) => {
    const isGeneral = customer === "全般";
    learnings.push({
      customer: isGeneral ? null : customer,
      category: isGeneral ? "気づき" : "メモ",
      title: isGeneral
        ? `全般で覚えておくこと（${snippets.length}件）`
        : `${customer}さんについて覚えておくこと（${snippets.length}件）`,
      body: snippets.slice(0, 4).map((h) => `・${h}`).join("\n"),
    });
  });

  // Per-customer notes first, 全般 last.
  return learnings
    .sort((a, b) => (a.customer === null ? 1 : b.customer === null ? -1 : 0))
    .slice(0, 8);
}
