import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SAKURA_MAMA_MODEL } from "@/lib/nightos/constants";
import { getCastHomeData } from "@/lib/nightos/supabase-queries";
import type { CastHomeData, FollowTarget } from "@/types/nightos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM_PROMPT = `あなたは銀座のクラブのママ「さくらママ」です。30年経験。
キャストの今日の朝の準備をサポートします。

# タスク

入力された「今日連絡するお客様リスト」を見て、キャストへの朝のメッセージを書いてください。
今日の優先順位と接客のポイントを伝えるのが目的です。

# 出力ルール

- **3〜4文の短いメッセージ**（長文禁止）
- キャスト名で呼びかける（「あかりさん、おはよう」など）
- 1〜2人の顧客に絞って具体的に。全員触れない
- 絵文字は1〜2個まで（🌸 ✨ 💌 ☕ など、品が落ちないもの）
- 「今日も頑張りましょう」「素敵な1日を」など定型句は使わない
- 朝の挨拶 → 重要顧客 → 一言アドバイス、の流れ
- 親しみやすいけど品のある口調。「〜よ」「〜わね」「〜ね」を自然に
- AIっぽい前置き（「了解しました」「もちろんです」など）は禁止

# 出力フォーマット

メッセージ本文のみを返してください。前置きや見出しは不要、装飾も不要。
`;

interface ShiftEntry {
  date: string;
  status: string;
  startTime?: string;
  endTime?: string;
  note?: string;
}

interface RequestBody {
  castId: string;
  upcomingShifts?: ShiftEntry[];
}

interface BriefingResponse {
  isStub: boolean;
  briefing: string;
  generatedAt: string;
}

export async function POST(req: Request) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body.castId) {
    return NextResponse.json({ error: "missing_castId" }, { status: 400 });
  }

  const data = await getCastHomeData(body.castId);

  // Stub mode
  if (!process.env.ANTHROPIC_API_KEY) {
    const briefing = buildStubBriefing(data);
    const response: BriefingResponse = {
      isStub: true,
      briefing,
      generatedAt: new Date().toISOString(),
    };
    return NextResponse.json(response);
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const prompt = buildUserPrompt(data, body.upcomingShifts);
    const response = await client.messages.create({
      model: SAKURA_MAMA_MODEL,
      max_tokens: 350,
      temperature: 0.85,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });
    const briefing = extractText(response.content);
    const apiResponse: BriefingResponse = {
      isStub: false,
      briefing,
      generatedAt: new Date().toISOString(),
    };
    return NextResponse.json(apiResponse);
  } catch (err) {
    console.error("[morning-briefing] Claude call failed:", err);
    const briefing = buildStubBriefing(data);
    const response: BriefingResponse = {
      isStub: true,
      briefing,
      generatedAt: new Date().toISOString(),
    };
    return NextResponse.json(response);
  }
}

function buildUserPrompt(data: CastHomeData, upcomingShifts?: ShiftEntry[]): string {
  const lines: string[] = [];
  lines.push(`[キャスト]`);
  lines.push(`名前: ${data.cast.name}`);
  lines.push(`今月の指名: ${data.cast.nomination_count}本`);
  lines.push(`リピート率: ${Math.round(data.cast.repeat_rate * 100)}%`);
  lines.push("");

  if (upcomingShifts && upcomingShifts.length > 0) {
    lines.push(`[直近の出勤予定]`);
    upcomingShifts.forEach((s) => {
      const timeStr = s.startTime ? ` ${s.startTime}〜${s.endTime ?? ""}` : "";
      lines.push(`- ${s.date}${timeStr}${s.note ? ` (${s.note})` : ""}`);
    });
    lines.push("");
  }

  if (data.targets.length === 0) {
    lines.push(`[今日連絡するお客様]`);
    lines.push(`今日特に急ぎの対象はいません。`);
  } else {
    lines.push(`[今日連絡するお客様（優先順位順）]`);
    data.targets.forEach((target, idx) => {
      lines.push(formatTarget(idx + 1, target));
    });
  }
  lines.push("");
  lines.push(`このキャストに、今朝の準備として伝えたい一言を書いてください。`);
  return lines.join("\n");
}

function formatTarget(idx: number, target: FollowTarget): string {
  const c = target.customer;
  const lines: string[] = [];
  lines.push(`${idx}. ${c.name}（${c.category === "vip" ? "VIP" : c.category === "new" ? "新規" : "常連"}）`);
  lines.push(`   理由: ${target.reasonLabel}（${target.reasonDetail}）`);
  if (target.bottle) {
    lines.push(`   キープ: ${target.bottle.brand}（残${target.bottle.remaining_glasses}杯）`);
  }
  if (target.lastTopic) {
    lines.push(`   前回の話題: ${target.lastTopic}`);
  }
  return lines.join("\n");
}

function buildStubBriefing(data: CastHomeData): string {
  const castName = data.cast.name;
  const top = data.targets[0];
  if (!top) {
    return `${castName}さん、おはよう☕ 今日は急ぎの連絡はなさそうね。落ち着いた一日になりそうよ。`;
  }
  const customer = top.customer;
  const reasonText =
    top.reason === "birthday"
      ? "誕生日が近いから、お祝いの一言を準備しておきましょ"
      : top.reason === "interval"
        ? "ちょっと来店間隔が空いてるから、軽く近況を聞いてみて"
        : "新規で温度が高いから、次回の指名につなげるチャンスね";
  return `${castName}さん、おはよう🌸 今日は${customer.name}さまを最優先で。${reasonText}。連絡が必要なお客様は${data.targets.length}人いるけど、まずこの一人に集中して動きましょ。`;
}

function extractText(content: Anthropic.Messages.ContentBlock[]): string {
  return content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}
