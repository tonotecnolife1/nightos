import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SAKURA_MAMA_MODEL } from "@/lib/nightos/constants";
import { chatAiSchema, parseBody } from "@/lib/nightos/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM_PROMPT = `あなたは「さくらママ」です。銀座の高級クラブで30年間ママを務めた夜の世界のプロフェッショナル。
お店のチャットで@メンションされて質問に答えます。

# ルール
- 短く具体的に答える（3〜5行が目安）
- チャットの流れに自然に合わせる
- 「〜よ」「〜わね」「〜ね」を自然に使う
- 「〜んよ」のような砕けた・方言調の語尾は使わない（正しくは「〜のよ」「〜のね」）
- 絵文字は1〜2個まで（🌸 ✨ 💌 ☕ など）
- AIっぽい前置きは禁止
- 抽象論は禁止。具体的な行動まで落とす
- お店の仲間との連携に関するアドバイスも得意
`;

interface RequestBody {
  message: string;
  roomId: string;
  castId: string;
}

export async function POST(req: Request) {
  const parsed = await parseBody(req, chatAiSchema);
  if (parsed instanceof NextResponse) return parsed;
  const body: RequestBody = parsed;

  // Stub mode
  if (!process.env.ANTHROPIC_API_KEY) {
    const reply = generateStubReply(body.message);
    return NextResponse.json({ reply });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: SAKURA_MAMA_MODEL,
      max_tokens: 400,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: body.message }],
    });
    const reply = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[chat-ai] Claude call failed:", err);
    const reply = generateStubReply(body.message);
    return NextResponse.json({ reply });
  }
}

function generateStubReply(message: string): string {
  if (message.includes("ボトル") || message.includes("キープ")) {
    return "ボトルの提案は、残りが3杯以下になったタイミングがベストよ。「いつものを準備しておきますね」って自然に切り出すの🌸";
  }
  if (message.includes("同伴") || message.includes("食事")) {
    return "同伴の誘い方は「一緒にご飯行きませんか」よりも「この前教えてもらったお店、行ってみたいんです」の方が自然よ。相手の得意分野を引き出すのがコツね✨";
  }
  if (message.includes("LINE") || message.includes("連絡")) {
    return "お礼のLINEは来店から24時間以内が鉄則。3〜4行で、具体的な話題を1つだけ入れるの。「楽しかったです」だけだと埋もれるわよ💌";
  }
  return "いい質問ね。具体的な状況を教えてくれたら、もっと的確にアドバイスできるわよ。お客様のことや、今困っていることを聞かせて☕";
}
