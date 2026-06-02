import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SAKURA_MAMA_MODEL } from "@/lib/nightos/constants";
import { getAllCustomers, getStoreDashboardData } from "@/lib/nightos/supabase-queries";
import { selectFollowTargets } from "@/features/cast-home/data/follow-selector";
import { MOCK_TODAY, mockBottles, mockCastMemos, mockVisits } from "@/lib/nightos/mock-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM_PROMPT = `あなたは「さくらママ」です。30年経験の銀座クラブのママ。
今日は店舗スタッフに向けて、今夜の営業の重要ポイントを伝えます。

# タスク
入力された店舗データ（キャスト成績、リスク顧客、ボトル状況）を見て、
店舗スタッフへの1日の始まりのメッセージを書いてください。

# 出力ルール
- 3〜4文の短いメッセージ
- 「スタッフの皆さん」と呼びかける
- キャストの名前を出して具体的に
- 絵文字は1個まで
- 定型的な「お疲れ様です」は使わない
- 「〜んよ」のような砕けた・方言調の語尾は使わない（正しくは「〜のよ」「〜のね」）
- 売上目標・リスク顧客・キャスト管理のうち1〜2つに焦点
- 実用的な指示を含める（例: 「あかりさんに渡辺様のバースデー準備を伝えてください」）
- メッセージ本文のみ返す。前置き・見出し不要
`;

interface BriefingResponse {
  isStub: boolean;
  briefing: string;
}

export async function POST() {
  const data = await getStoreDashboardData();
  const customers = await getAllCustomers();

  // Build risk summary
  const lowBottles = mockBottles.filter((b) => b.remaining_glasses <= 5);
  const followTargets = selectFollowTargets({
    customers,
    visits: mockVisits,
    bottles: mockBottles,
    memos: mockCastMemos,
    today: process.env.NEXT_PUBLIC_SUPABASE_URL ? new Date() : MOCK_TODAY,
  });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json<BriefingResponse>({
      isStub: true,
      briefing: buildStubBriefing(data, followTargets.length, lowBottles.length),
    });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const prompt = buildPrompt(data, followTargets.length, lowBottles.length);
    const response = await client.messages.create({
      model: SAKURA_MAMA_MODEL,
      max_tokens: 350,
      temperature: 0.8,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });
    const briefing = response.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();
    return NextResponse.json<BriefingResponse>({ isStub: false, briefing });
  } catch (err) {
    console.error("[store-briefing]", err);
    return NextResponse.json<BriefingResponse>({
      isStub: true,
      briefing: buildStubBriefing(data, followTargets.length, lowBottles.length),
    });
  }
}

function buildPrompt(
  data: Awaited<ReturnType<typeof getStoreDashboardData>>,
  riskCount: number,
  lowBottleCount: number,
): string {
  const lines: string[] = [];
  lines.push("[店舗データ]");
  lines.push(`月間指名: ${data.totalNominations}本`);
  lines.push(`月間売上: ¥${data.totalSales.toLocaleString()}`);
  lines.push(`平均連絡達成率: ${Math.round(data.averageFollowRate * 100)}%`);
  lines.push("");
  lines.push("[キャスト別]");
  data.castStats.forEach((s) => {
    lines.push(
      `- ${s.cast.name}: 指名${s.cast.nomination_count}本, 連絡達成率${Math.round(s.followRate * 100)}%, 担当${s.customerCount}人`,
    );
  });
  lines.push("");
  lines.push(`[リスク顧客] ${riskCount}人が連絡が必要`);
  lines.push(`[ボトル残量注意] ${lowBottleCount}本が残りわずか`);
  lines.push("");
  lines.push("今夜の営業に向けてスタッフに伝えるべきポイントを書いてください。");
  return lines.join("\n");
}

function buildStubBriefing(
  data: Awaited<ReturnType<typeof getStoreDashboardData>>,
  riskCount: number,
  lowBottleCount: number,
): string {
  const topCast = data.castStats.sort(
    (a, b) => b.cast.monthly_sales - a.cast.monthly_sales,
  )[0];
  const lowCast = data.castStats.sort(
    (a, b) => a.followRate - b.followRate,
  )[0];
  return `スタッフの皆さん、今夜もよろしくお願いします🌙 ${topCast ? `${topCast.cast.name}さんは指名${topCast.cast.nomination_count}本で好調です。` : ""}${lowCast && lowCast.followRate < 0.7 ? `${lowCast.cast.name}さんの連絡達成率が${Math.round(lowCast.followRate * 100)}%なので、今日はLINE送信を促してあげてください。` : ""}${riskCount > 0 ? `今日連絡するお客様は${riskCount}人、` : ""}${lowBottleCount > 0 ? `ボトル残量注意は${lowBottleCount}本。` : ""}各テーブルの準備をお願いします。`;
}
