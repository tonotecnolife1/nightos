import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SAKURA_MAMA_MODEL } from "@/lib/nightos/constants";
import { buildRegionContextLine } from "@/lib/nightos/regions";
import { getCustomerContext } from "@/lib/nightos/supabase-queries";
import {
  mockBottles,
  mockCustomers,
  mockDouhans,
  mockScreenshots,
} from "@/lib/nightos/mock-data";
import type { CastMemo, Customer } from "@/types/nightos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface RequestBody {
  castId: string;
  customerId: string;
}

export interface RefreshedMemo {
  last_topic: string | null;
  service_tips: string | null;
  next_topics: string | null;
  summary: string; // 変更点のサマリー
}

const SYSTEM_PROMPT = `あなたは銀座の高級クラブのママ「さくらママ」。
顧客カルテの「個人メモ」を、アプリ内の最新情報を元に自動ブラッシュアップしてください。

# タスク
入力される情報（顧客プロフィール・来店履歴・キープボトル・同伴履歴・LINEスクショ解析結果・既存メモ）
を統合して、今のメモをより有用なものに書き直す。

# 書き直しのルール
- last_topic: 前回の会話で出た最新の話題を1文で
- service_tips: 接客で気をつける点を2〜3行で（NG話題や好み）
- next_topics: 次回使える話題候補を2〜3個箇条書き

# 口調
- summary はさくらママの語り口で。「〜んよ」のような砕けた・方言調の語尾は使わない（正しくは「〜のよ」「〜のね」）

# 出力
JSON のみ、前後の説明文は不要。

{
  "last_topic": "...",
  "service_tips": "...",
  "next_topics": "...",
  "summary": "今回の更新のポイント（キャストへの1行メッセージ）"
}

既存のメモから大きく変える必要がなければ、そのまま保って summary に「大きな変化はありません」と書いてください。
`;

export async function POST(req: Request) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.castId || !body.customerId) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const context = await getCustomerContext(body.castId, body.customerId);
  if (!context) {
    return NextResponse.json({ error: "customer_not_found" }, { status: 404 });
  }

  // Gather related data
  const douhans = mockDouhans.filter((d) => d.customer_id === body.customerId);
  const screenshots = mockScreenshots.filter(
    (s) => s.customer_id === body.customerId,
  );

  // Referrer
  const referrer = context.customer.referred_by_customer_id
    ? mockCustomers.find((c) => c.id === context.customer.referred_by_customer_id)
    : null;

  const prompt = buildPrompt({
    customer: context.customer,
    memo: context.memo,
    visits: context.visits,
    bottles: mockBottles.filter((b) => b.customer_id === body.customerId),
    douhans,
    screenshots,
    referrerName: referrer?.name ?? null,
  });

  // Stub mode
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json<RefreshedMemo>(generateStubMemo(context.memo));
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: SAKURA_MAMA_MODEL,
      max_tokens: 800,
      temperature: 0.5,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });
    const text = response.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();
    const parsed = parseMemo(text);
    if (!parsed) {
      return NextResponse.json<RefreshedMemo>(generateStubMemo(context.memo));
    }
    return NextResponse.json<RefreshedMemo>(parsed);
  } catch (err) {
    console.error("[refresh-customer-memo] Claude failed:", err);
    return NextResponse.json<RefreshedMemo>(generateStubMemo(context.memo));
  }
}

function buildPrompt(args: {
  customer: Customer;
  memo: CastMemo | null;
  visits: Array<{ visited_at: string; is_nominated: boolean }>;
  bottles: Array<{ brand: string; remaining_glasses: number; total_glasses: number }>;
  douhans: Array<{ date: string; status: string; note: string | null }>;
  screenshots: Array<{ extracted: { summary: string } }>;
  referrerName: string | null;
}): string {
  const { customer, memo, visits, bottles, douhans, screenshots, referrerName } = args;
  const lines: string[] = [];
  lines.push("[顧客プロフィール]");
  lines.push(`名前: ${customer.name}`);
  if (customer.job) lines.push(`職業: ${customer.job}`);
  if (customer.birthday) lines.push(`誕生日: ${customer.birthday}`);
  lines.push(
    `カテゴリ: ${customer.category === "vip" ? "VIP" : customer.category === "new" ? "新規" : "常連"}`,
  );
  if (customer.favorite_drink) lines.push(`好きなお酒: ${customer.favorite_drink}`);
  if (customer.region) {
    const regionLine = buildRegionContextLine(customer.region);
    if (regionLine) lines.push(regionLine);
  }
  if (customer.store_memo) lines.push(`店舗メモ: ${customer.store_memo}`);
  if (referrerName) lines.push(`紹介元: ${referrerName}さま`);
  if (customer.funnel_stage) {
    lines.push(
      `ファネル: ${customer.funnel_stage === "line_exchanged" ? "LINE交換済み" : customer.funnel_stage === "assigned" ? "担当あり" : "店舗登録のみ"}`,
    );
  }
  lines.push("");

  lines.push("[来店履歴]");
  lines.push(`来店回数: ${visits.length}回`);
  if (visits.length > 0) {
    lines.push(`最終来店: ${visits[0].visited_at.slice(0, 10)}`);
  }
  lines.push("");

  if (bottles.length > 0) {
    lines.push("[キープボトル]");
    for (const b of bottles) {
      lines.push(`- ${b.brand}（残${b.remaining_glasses}/${b.total_glasses}杯）`);
    }
    lines.push("");
  }

  if (douhans.length > 0) {
    lines.push("[同伴履歴]");
    for (const d of douhans) {
      lines.push(`- ${d.date} (${d.status}) ${d.note ?? ""}`);
    }
    lines.push("");
  }

  if (screenshots.length > 0) {
    lines.push("[LINEスクショ解析履歴]");
    for (const s of screenshots.slice(-5)) {
      lines.push(`- ${s.extracted.summary}`);
    }
    lines.push("");
  }

  lines.push("[既存メモ]");
  lines.push(`前回の話題: ${memo?.last_topic ?? "(なし)"}`);
  lines.push(`接客のコツ: ${memo?.service_tips ?? "(なし)"}`);
  lines.push(`次回話題候補: ${memo?.next_topics ?? "(なし)"}`);
  lines.push("");

  lines.push("上の情報を統合して、メモをより使いやすい形に書き直してください。");
  return lines.join("\n");
}

function parseMemo(text: string): RefreshedMemo | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (typeof parsed !== "object" || parsed === null) return null;
    return {
      last_topic: typeof parsed.last_topic === "string" ? parsed.last_topic : null,
      service_tips:
        typeof parsed.service_tips === "string" ? parsed.service_tips : null,
      next_topics:
        typeof parsed.next_topics === "string" ? parsed.next_topics : null,
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
    };
  } catch {
    return null;
  }
}

function generateStubMemo(existing: CastMemo | null): RefreshedMemo {
  return {
    last_topic: existing?.last_topic ?? "（Claude API 未設定のためスタブ応答）",
    service_tips:
      existing?.service_tips ??
      "APIキー設定後に自動でアプリ内情報から最新メモを合成します。",
    next_topics:
      existing?.next_topics ?? "（来店履歴・LINE解析・同伴履歴から自動生成）",
    summary:
      "ANTHROPIC_API_KEY 未設定のため実際の合成は行われていません。本番では過去データを統合して更新します。",
  };
}
