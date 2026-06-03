import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SAKURA_MAMA_MODEL } from "@/lib/nightos/constants";
import { getCastStatsData } from "@/lib/nightos/supabase-queries";
import type { CastStatsData } from "@/lib/nightos/supabase-queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM_PROMPT = `あなたは銀座のクラブのママ「さくらママ」です。30年経験。
担当キャストの今月の成績データを見て、本人に語りかけるように分析します。

# タスク

入力された成績の数字を読んで、3つのパートで分析を返してください。

1. genjou（現状）— 今の数字をどう見るか。良い点はちゃんと褒める。事実ベースで。
2. kadai（課題）— 数字の中で一番のボトルネック。何が足りないかを1点に絞る。
3. action（取るべきアクション）— 明日から実行できる超具体的な行動を1〜2個。

# 口調・ルール

- さくらママの語り口調。「〜ね」「〜よ」「〜わね」「〜しましょ」を自然に
- 「〜んよ」のような砕けた・方言調の語尾は使わない（正しくは「〜のよ」「〜のね」）
- 各パート 2〜3文の短さ。長文禁止
- 数字に必ず触れる（「売上75%」「連続連絡5日」など）。抽象論は禁止
- 絵文字は全体で1〜2個まで（🌸 ✨ 💌 ☕ など、品が落ちないもの）
- 説教くさくしない。寄り添いつつ背中を押す
- AIっぽい前置き（「了解しました」「素晴らしい質問ですね」など）は禁止
- actionは「誰に・何を・いつ」が分かる具体性で

# 出力フォーマット

必ず以下のJSONだけを返してください。前後に説明文やマークダウンの装飾は不要：

{"genjou":"…","kadai":"…","action":"…"}
`;

interface RequestBody {
  castId: string;
}

interface AnalysisResponse {
  isStub: boolean;
  genjou: string;
  kadai: string;
  action: string;
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

  const data = await getCastStatsData(body.castId);

  // Stub mode — API キー未設定
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(buildStubResponse(data));
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const prompt = buildUserPrompt(data);
    const response = await client.messages.create({
      model: SAKURA_MAMA_MODEL,
      max_tokens: 700,
      temperature: 0.8,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });
    const text = extractText(response.content);
    const parsed = parseAnalysis(text);
    if (!parsed) {
      return NextResponse.json(buildStubResponse(data));
    }
    const apiResponse: AnalysisResponse = {
      isStub: false,
      genjou: parsed.genjou,
      kadai: parsed.kadai,
      action: parsed.action,
      generatedAt: new Date().toISOString(),
    };
    return NextResponse.json(apiResponse);
  } catch (err) {
    console.error("[stats-analysis] Claude call failed:", err);
    return NextResponse.json(buildStubResponse(data));
  }
}

function pct(n: number, d: number): number {
  if (!d) return 0;
  return Math.round((n / d) * 100);
}

function buildUserPrompt(data: CastStatsData): string {
  const salesPct = pct(data.monthly.sales, data.targets.salesGoal);
  const douhanPct =
    data.targets.douhanGoal > 0
      ? pct(data.monthly.douhanCount, data.targets.douhanGoal)
      : null;
  const lines: string[] = [];
  lines.push(`[キャスト]`);
  lines.push(`名前: ${data.cast.name}`);
  lines.push("");
  lines.push(`[今月の成績]`);
  lines.push(
    `売上: ¥${data.monthly.sales.toLocaleString()} / 目標 ¥${data.targets.salesGoal.toLocaleString()}（達成率 ${salesPct}%）`,
  );
  if (douhanPct !== null) {
    lines.push(
      `同伴: ${data.monthly.douhanCount}回 / 目標 ${data.targets.douhanGoal}回（達成率 ${douhanPct}%）`,
    );
  } else {
    lines.push(`同伴: ${data.monthly.douhanCount}回`);
  }
  lines.push(`担当顧客数: ${data.monthly.totalCustomerCount}人`);
  lines.push(`今月の新規顧客: ${data.monthly.newCustomerCount}人`);
  lines.push(`再来店率: ${Math.round(data.monthly.repeatRate * 100)}%`);
  lines.push(`連絡達成率: ${Math.round(data.monthly.followRate * 100)}%`);
  lines.push(`お客様への連続連絡: ${data.followStreakDays}日`);
  lines.push("");

  if (data.repeatTrendMonthly.length > 0) {
    const trend = data.repeatTrendMonthly
      .map((p) => `${p.label}=${Math.round(p.rate * 100)}%`)
      .join(", ");
    lines.push(`[再来店率の推移（月次）]`);
    lines.push(trend);
    lines.push("");
  }

  lines.push(`[今年の累計]`);
  lines.push(`年間売上: ¥${data.yearly.sales.toLocaleString()}`);
  lines.push(`年間再来店率: ${Math.round(data.yearly.repeatRate * 100)}%`);
  lines.push(`年間新規: ${data.yearly.newCustomerCount}人`);
  lines.push(`年間同伴: ${data.yearly.douhanCount}回`);
  lines.push("");
  lines.push(
    `この成績を、${data.cast.name}さん本人に語りかけるように分析してください。`,
  );
  return lines.join("\n");
}

function parseAnalysis(
  text: string,
): { genjou: string; kadai: string; action: string } | null {
  try {
    // JSON ブロックを抽出（前後に余計な文字があっても拾う）
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    const json = JSON.parse(text.slice(start, end + 1)) as Record<
      string,
      unknown
    >;
    const genjou = typeof json.genjou === "string" ? json.genjou.trim() : "";
    const kadai = typeof json.kadai === "string" ? json.kadai.trim() : "";
    const action = typeof json.action === "string" ? json.action.trim() : "";
    if (!genjou || !kadai || !action) return null;
    return { genjou, kadai, action };
  } catch {
    return null;
  }
}

function buildStubResponse(data: CastStatsData): AnalysisResponse {
  const name = data.cast.name;
  const salesPct = pct(data.monthly.sales, data.targets.salesGoal);
  const douhanPct =
    data.targets.douhanGoal > 0
      ? pct(data.monthly.douhanCount, data.targets.douhanGoal)
      : null;
  const followPct = Math.round(data.monthly.followRate * 100);
  const repeatPct = Math.round(data.monthly.repeatRate * 100);

  // 現状
  const genjouParts: string[] = [`${name}さん、今月の成績を一緒に見ましょうね。`];
  if (salesPct >= 100) {
    genjouParts.push(`売上は目標を達成（${salesPct}%）、本当によく頑張ったわ🌸`);
  } else if (salesPct >= 60) {
    genjouParts.push(`売上は目標の${salesPct}%まで来てて、いいペースよ。`);
  } else {
    genjouParts.push(`売上は目標の${salesPct}%。まだ伸びしろがたっぷりあるわね。`);
  }
  if (douhanPct !== null && douhanPct >= 100) {
    genjouParts.push(`同伴も目標達成、お客様との約束を守れてる証拠ね。`);
  }

  // 課題
  let kadai: string;
  if (followPct < 50) {
    kadai = `気になるのは連絡達成率が${followPct}%なところ。せっかくの${data.monthly.totalCustomerCount}人のお客様との縁が、連絡不足で薄くなっちゃうのが一番もったいないのよ。`;
  } else if (repeatPct < 50) {
    kadai = `再来店率が${repeatPct}%なのが今月の課題ね。新規${data.monthly.newCustomerCount}人を一度きりで終わらせず、二度目につなげる工夫が要るわ。`;
  } else if (salesPct < 100) {
    kadai = `あと${100 - salesPct}%で売上目標。連続連絡は${data.followStreakDays}日続いてるから、あとはその連絡を「来店のお誘い」までつなげられるかね。`;
  } else {
    kadai = `大きな穴はないけれど、この勢いを来月も続けられるかが本当の課題よ。一度上がった数字を保つのが一番むずかしいの。`;
  }

  // アクション
  let action: string;
  if (followPct < 50) {
    action = `まずは明日から「1日3人」だけ、前回の話題に触れたお礼LINEを送ってみて。続けば連絡達成率は自然に上がるわ。迷ったらさくらママに文面を相談してね💌`;
  } else if (repeatPct < 50) {
    action = `今月来てくれた新規のお客様に、3日以内に「次の楽しみ」を一言添えてLINEして。次回予約のきっかけ作りが再来店率を上げる近道よ。`;
  } else {
    action = `担当顧客の中でしばらく来店がない人を3人ピックアップして、今週中に近況伺いを送りましょ。誰に何を送るか、さくらママと一緒に決めましょうね。`;
  }

  return {
    isStub: true,
    genjou: genjouParts.join(" "),
    kadai,
    action,
    generatedAt: new Date().toISOString(),
  };
}

function extractText(content: Anthropic.Messages.ContentBlock[]): string {
  return content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}
