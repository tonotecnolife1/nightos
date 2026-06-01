import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SAKURA_MAMA_MODEL } from "@/lib/nightos/constants";
import { chatLearningsSchema, parseBody } from "@/lib/nightos/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM_PROMPT = `あなたは「さくらママ」です。銀座の高級クラブで30年間ママを務めた夜の世界のプロフェッショナル。
キャストがチャットでピン留め（保存）した会話を読み、「覚えておくべき学び」として整理します。

# やること
- ピン留めされた会話・メモを読み、共通するテーマでまとめる
- 「次に活かせる行動」「お客様対応のコツ」「自分の気づき」など、実務で思い出せる形にする
- 個別の出来事ではなく、再現できる学びに昇華する

# ルール
- 学びは3〜6件にまとめる（無理に増やさない）
- 各学びは category（短いテーマ名・最大8文字）, title（一文の要点）, body（2〜3行の具体策）で構成
- title は体言止め or 「〜する」、抽象論は禁止。具体的な行動まで落とす
- 出力は必ず次のJSONのみ。前置き・説明・コードフェンスは禁止:
{"learnings":[{"category":"...","title":"...","body":"..."}]}
`;

interface Pin {
  content: string;
  senderName?: string;
  memo?: string;
  customerName?: string | null;
}

export interface Learning {
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
        return {
          category: String(item.category ?? "学び").slice(0, 12),
          title: String(item.title ?? "").trim(),
          body: String(item.body ?? "").trim(),
        };
      })
      .filter((l) => l.title.length > 0)
      .slice(0, 6);
  } catch {
    return [];
  }
}

/**
 * Offline / no-key fallback: bucket pins by simple keyword themes so the 学び
 * tab still produces something coherent from the cast's pins + memos.
 */
function stubLearnings(pins: Pin[]): Learning[] {
  const buckets: { category: string; keys: string[]; hits: string[] }[] = [
    { category: "同伴", keys: ["同伴", "食事", "ご飯", "ランチ"], hits: [] },
    { category: "連絡", keys: ["LINE", "連絡", "メッセージ", "お礼"], hits: [] },
    { category: "ドリンク", keys: ["ボトル", "キープ", "シャンパン", "ドリンク"], hits: [] },
    { category: "接客", keys: ["接客", "席", "会話", "話題"], hits: [] },
  ];
  const other: string[] = [];

  for (const p of pins) {
    const text = `${p.content} ${p.memo ?? ""}`;
    const tag = p.customerName ? `（${p.customerName}さん）` : "";
    const snippet = `${tag}${(p.memo?.trim() || p.content).trim()}`.slice(0, 120);
    const bucket = buckets.find((b) => b.keys.some((k) => text.includes(k)));
    if (bucket) bucket.hits.push(snippet);
    else other.push(snippet);
  }

  const learnings: Learning[] = buckets
    .filter((b) => b.hits.length > 0)
    .map((b) => ({
      category: b.category,
      title: `${b.category}で覚えておくこと（${b.hits.length}件）`,
      body: b.hits.slice(0, 4).map((h) => `・${h}`).join("\n"),
    }));

  if (other.length > 0) {
    learnings.push({
      category: "気づき",
      title: `その他の気づき（${other.length}件）`,
      body: other.slice(0, 4).map((h) => `・${h}`).join("\n"),
    });
  }

  return learnings;
}
