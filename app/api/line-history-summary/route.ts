import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SAKURA_MAMA_MODEL } from "@/lib/nightos/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM_PROMPT = `あなたは銀座のクラブのベテランママ「さくらママ」です。
キャストと顧客の間で交わされたLINEのやり取りの履歴を読んで、連絡の経緯を自然な日本語でまとめてください。

# 出力ルール
- **3〜5文**にまとめる（長文禁止）
- 時系列に沿って「最初は〜、その後〜、今は〜」の流れで書く
- 具体的な話題・変化・現在の関係性が伝わるように
- キャストへのアドバイスを最後に1文添える（「次は〜を話題にするといいわ」など）
- 絵文字は1〜2個まで（💌 ✨ 🌸 など）
- 前置き・見出し・箇条書き禁止。会話するように書く
`;

interface ScreenshotSummary {
  date: string;
  summary: string;
  last_topic: string | null;
  service_tips: string | null;
  next_topics: string | null;
}

interface RequestBody {
  customerName: string;
  castName: string;
  summaries: ScreenshotSummary[];
}

export interface LineSummaryResponse {
  isStub: boolean;
  narrative: string;
  generatedAt: string;
}

export async function POST(req: Request) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.summaries?.length) {
    return NextResponse.json({ error: "no_summaries" }, { status: 400 });
  }

  const prompt = buildPrompt(body);

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      isStub: true,
      narrative: buildStubNarrative(body),
      generatedAt: new Date().toISOString(),
    } satisfies LineSummaryResponse);
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: SAKURA_MAMA_MODEL,
      max_tokens: 400,
      temperature: 0.8,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });
    const narrative = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("")
      .trim();

    return NextResponse.json({
      isStub: false,
      narrative,
      generatedAt: new Date().toISOString(),
    } satisfies LineSummaryResponse);
  } catch (err) {
    console.error("[line-history-summary] Claude failed:", err);
    return NextResponse.json({
      isStub: true,
      narrative: buildStubNarrative(body),
      generatedAt: new Date().toISOString(),
    } satisfies LineSummaryResponse);
  }
}

function buildPrompt(body: RequestBody): string {
  const lines: string[] = [
    `[キャスト] ${body.castName}`,
    `[お客様] ${body.customerName}さま`,
    `[LINEやり取りの履歴（古い順）]`,
  ];
  for (const s of body.summaries) {
    lines.push(`\n● ${s.date}`);
    lines.push(`内容: ${s.summary}`);
    if (s.last_topic) lines.push(`話題: ${s.last_topic}`);
    if (s.service_tips) lines.push(`ポイント: ${s.service_tips}`);
    if (s.next_topics) lines.push(`次の話題候補: ${s.next_topics}`);
  }
  lines.push("\nこのやり取りの経緯を、キャストへのアドバイスを添えて3〜5文でまとめてください。");
  return lines.join("\n");
}

function buildStubNarrative(body: RequestBody): string {
  const count = body.summaries.length;
  const first = body.summaries[0];
  const last = body.summaries[count - 1];
  const topic = last?.last_topic ?? first?.last_topic ?? "近況";
  return `${body.customerName}さまとは${count}回のやり取りを重ねてきたわね。最初は軽いご挨拶から始まって、だんだんと距離が縮まってきた感じよ ✨ 最近は「${topic}」が共通の話題になっているみたい。次回は前回の会話の続きから自然に入ると、もっと親しみを感じてもらえるわよ💌`;
}
