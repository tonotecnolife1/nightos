import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SAKURA_MAMA_MODEL } from "@/lib/nightos/constants";
import { buildRegionContextLine } from "@/lib/nightos/regions";
import { getCustomerContext } from "@/lib/nightos/supabase-queries";
import { parseBody, suggestBottleSchema } from "@/lib/nightos/validation";
import type { CustomerContext } from "@/types/nightos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM_PROMPT = `あなたは銀座のクラブのママ「さくらママ」です。30年経験。
キャストの代わりに、ある顧客の「次におすすめするボトル候補」を提案します。

# 入力
- 顧客のカルテ（カテゴリ、職業、好きなお酒、現在のキープボトル、前回の話題など）

# タスク
顧客の好み・予算感・グレード感に合いそうなボトル候補を**3本だけ**提案してください。

# 出力フォーマット

必ず以下のJSON形式のみを返してください。前置きや説明文は不要、コードブロックも不要。

{
  "recommendations": [
    {
      "brand": "ボトル名（例: 山崎18年）",
      "reason": "なぜこのお客様におすすめなのか、1〜2文で具体的に",
      "tier": "premium または standard または entry"
    },
    ...3本
  ]
}

# 提案のルール
- VIP顧客には premium 寄り（山崎18年、響21年、森伊蔵、マッカラン25年など）
- 常連には standard 中心（山崎12年、白州12年、響JH、グレンフィディック15年など）
- 新規には entry 寄り（白州NA、響JH、シーバスリーガル12年など）
- 現在キープしているボトルと同じ銘柄はNG
- ボトルキープはウイスキーと焼酎のみ。シャンパンは対象外なので提案しない
- 好きなお酒の系統（ウイスキー / 焼酎 / バーボンなど）に合わせる
- 1本ずつ、明確に「なぜこのお客様か」が分かる理由をつける
`;

interface RequestBody {
  customerId: string;
  castId: string;
}

interface BottleRecommendation {
  brand: string;
  reason: string;
  tier: "premium" | "standard" | "entry";
}

interface ApiResponse {
  isStub: boolean;
  recommendations: BottleRecommendation[];
}

export async function POST(req: Request) {
  const parsed = await parseBody(req, suggestBottleSchema);
  if (parsed instanceof NextResponse) return parsed;
  const body: RequestBody = parsed;

  const context = await getCustomerContext(body.castId, body.customerId);
  if (!context) {
    return NextResponse.json({ error: "customer_not_found" }, { status: 404 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json<ApiResponse>({
      isStub: true,
      recommendations: buildStubRecommendations(context),
    });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const userMessage = buildUserPrompt(context);
    const response = await client.messages.create({
      model: SAKURA_MAMA_MODEL,
      max_tokens: 600,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });
    const text = extractText(response.content);
    const recommendations = parseJson(text);
    return NextResponse.json<ApiResponse>({ isStub: false, recommendations });
  } catch (err) {
    console.error("[suggest-bottle] Claude call failed:", err);
    return NextResponse.json<ApiResponse>({
      isStub: true,
      recommendations: buildStubRecommendations(context),
    });
  }
}

function buildUserPrompt(context: CustomerContext): string {
  const { customer, bottles, memo } = context;
  const lines: string[] = [];
  lines.push("[顧客カルテ]");
  lines.push(`名前: ${customer.name}`);
  if (customer.job) lines.push(`職業: ${customer.job}`);
  lines.push(
    `カテゴリ: ${customer.category === "vip" ? "VIP" : customer.category === "new" ? "新規" : "常連"}`,
  );
  if (customer.favorite_drink) lines.push(`好きなお酒: ${customer.favorite_drink}`);
  if (customer.region) {
    const regionLine = buildRegionContextLine(customer.region);
    if (regionLine) lines.push(regionLine);
  }
  if (bottles.length > 0) {
    lines.push(
      `現在のキープボトル: ${bottles.map((b) => `${b.brand}（残${b.remaining_glasses}杯）`).join("、")}`,
    );
  }
  if (memo?.last_topic) lines.push(`前回の話題: ${memo.last_topic}`);
  if (memo?.service_tips) lines.push(`接客のコツ: ${memo.service_tips}`);
  lines.push("");
  lines.push(
    "このお客様の次のキープボトル候補を3本、JSON形式で提案してください。",
  );
  return lines.join("\n");
}

function buildStubRecommendations(
  context: CustomerContext,
): BottleRecommendation[] {
  const cat = context.customer.category;
  if (cat === "vip") {
    return [
      {
        brand: "山崎18年",
        reason: "ロックがお好きなので、より熟成された深みを楽しんでいただける一本。VIPの定番アップグレード。",
        tier: "premium",
      },
      {
        brand: "響21年",
        reason: "華やかさと複雑さで「特別な夜」を演出。記念日や接待にも使いやすい。",
        tier: "premium",
      },
      {
        brand: "マッカラン18年",
        reason: "現在キープ中のマッカラン12年からの自然なステップアップ。シェリー樽の甘みがVIPに人気。",
        tier: "premium",
      },
    ];
  }
  if (cat === "new") {
    return [
      {
        brand: "白州NA",
        reason: "ハイボールがお好きとのことで、爽やかで飲みやすく、新規のお客様にも親しみやすい一本。",
        tier: "entry",
      },
      {
        brand: "シーバスリーガル12年",
        reason: "クセがなく、夜の長い時間を楽しむのにちょうどいい標準的な選択肢。",
        tier: "entry",
      },
      {
        brand: "響JH",
        reason: "日本人に人気の柔らかさ。次回ご来店の理由として「これも一度試してください」と提案しやすい。",
        tier: "standard",
      },
    ];
  }
  return [
    {
      brand: "山崎12年",
      reason: "常連の定番。安心感と品のバランスが取れていて、長くキープできる一本。",
      tier: "standard",
    },
    {
      brand: "白州12年",
      reason: "山崎と並べるとお店での選択肢が増える。爽やかな日もこちらをロックで。",
      tier: "standard",
    },
    {
      brand: "グレンフィディック15年",
      reason: "シングルモルト好きなら次に試したい一本。会話のフックにもなる。",
      tier: "standard",
    },
  ];
}

function extractText(content: Anthropic.Messages.ContentBlock[]): string {
  return content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}

function parseJson(text: string): BottleRecommendation[] {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    const parsed = JSON.parse(cleaned);
    const recs = parsed.recommendations;
    if (!Array.isArray(recs)) return [];
    return recs.slice(0, 3).map((r: { brand?: unknown; reason?: unknown; tier?: unknown }) => ({
      brand: typeof r.brand === "string" ? r.brand : "（不明）",
      reason: typeof r.reason === "string" ? r.reason : "",
      tier:
        r.tier === "premium" || r.tier === "standard" || r.tier === "entry"
          ? r.tier
          : "standard",
    }));
  } catch {
    return [];
  }
}
