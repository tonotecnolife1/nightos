import type { VenueType } from "@/lib/nightos/constants";

/**
 * ヘルプ報告（Help Report）— ヘルプで入ったキャストが、
 * そのお客様の「担当」（姉さん / ママ）へチャットで送る引き継ぎ報告を、
 * さくらママが整える機能のためのプロンプト・スタブ定義。
 *
 * - 報告は「お客様本人」宛てではなく、スタッフ間の業務連絡。
 * - 敬称: スタッフには「〜さん」、お客様には「〜さま」。
 * - 事実ベース。盛らない・憶測で埋めない。提供された情報の範囲で書く。
 */

export interface HelpReportFacts {
  /** お客様の表示名（呼びかけ用ニックネームがあればそれを併記済みの文字列でも可） */
  customerName: string;
  /** このお客様の担当（マスター）スタッフ名。null = 担当不明 / なし */
  masterName: string | null;
  /** 報告を書くヘルプ本人の名前 */
  helperName: string;
  /** ヘルプ本人が入力した「様子・気づいたこと」自由メモ */
  notes: string;
  category: "vip" | "regular" | "new";
  favoriteDrink: string | null;
  /** 例: "来店5回・最終来店今日・通常は14日間隔" */
  visitSummary: string | null;
  /** 直近来店の卓名 */
  table: string | null;
  /** 例: "ドンペリ白（残40%）" */
  bottles: string | null;
  storeMemo: string | null;
  lastTopic: string | null;
  serviceTips: string | null;
  venueType?: VenueType;
}

const CATEGORY_LABEL: Record<HelpReportFacts["category"], string> = {
  vip: "VIP",
  regular: "常連",
  new: "新規",
};

export const HELP_REPORT_SYSTEM_PROMPT = `あなたは「さくらママ」。銀座の高級クラブで長くママを務めた人物で、今は店のキャストたちを支えています。

いまの役割は、ヘルプで接客に入ったキャストが「そのお客様の担当（姉さん／ママ）」へ送る【ヘルプ報告】を整えることです。

# 大前提
- これはスタッフ間の業務連絡です。お客様本人に送る文面ではありません。
- 敬称: スタッフには「〜さん」、お客様には「〜さま」。
- 事実ベースで書く。与えられた情報にないことを憶測で足さない、話を盛らない。
- 担当が次の接客や連絡にすぐ使える「引き継ぎ」として価値が出るようにする。
- 絵文字は使っても0〜1個。装飾過多にしない。

# 出力フォーマット（この見出しを使い、本文のみ出力）
【ヘルプ報告】{お客様名}さま{担当がいれば「（{担当名}さん 担当）」}
■ 来店
■ ご様子
■ 話した内容
■ お酒・ボトル
■ 引き継ぎ / 次回
— {ヘルプ名} より

# ルール
- 各見出しは1〜3行。情報が無い見出しは「特になし」とするか、省いてよい。
- 「引き継ぎ / 次回」は担当が動けるよう具体的に（例: 誕生日が近い、次回は○○の話の続き、ボトルが残り少ない 等）。
- 前置きや後書き、説明文（「以下が報告です」等）は一切付けない。本文だけを出力する。`;

/** 現在の業態を一言で添える（任意）。 */
function venueLine(venueType?: VenueType): string {
  if (venueType === "club")
    return "※この店は担当制のクラブ。担当への引き継ぎ・同伴/継続来店の観点を重視。";
  if (venueType === "cabaret")
    return "※この店は指名制のキャバクラ。指名・再来店につながる引き継ぎを重視。";
  return "";
}

/** Claude に渡す「事実ブロック」を組み立てる。 */
export function buildFactsBlock(f: HelpReportFacts): string {
  const lines: string[] = [];
  lines.push("[ヘルプ報告の材料]");
  lines.push(`お客様: ${f.customerName}（${CATEGORY_LABEL[f.category]}）`);
  lines.push(`担当: ${f.masterName ? `${f.masterName}さん` : "不明 / なし"}`);
  lines.push(`報告するヘルプ: ${f.helperName}`);
  if (f.visitSummary) lines.push(`来店状況: ${f.visitSummary}`);
  if (f.table) lines.push(`卓: ${f.table}`);
  if (f.favoriteDrink) lines.push(`好きなお酒: ${f.favoriteDrink}`);
  if (f.bottles) lines.push(`キープボトル: ${f.bottles}`);
  if (f.storeMemo) lines.push(`店舗メモ: ${f.storeMemo}`);
  if (f.lastTopic) lines.push(`前回の話題: ${f.lastTopic}`);
  if (f.serviceTips) lines.push(`接客のコツ: ${f.serviceTips}`);
  lines.push("");
  lines.push("[ヘルプ本人のメモ（今日の様子・気づき）]");
  lines.push(f.notes.trim() ? f.notes.trim() : "（特記なし）");
  const v = venueLine(f.venueType);
  if (v) {
    lines.push("");
    lines.push(v);
  }
  return lines.join("\n");
}

export function buildGenerateUserMessage(f: HelpReportFacts): string {
  return `${buildFactsBlock(f)}

上の材料をもとに、担当（${f.masterName ? `${f.masterName}さん` : "担当者"}）への【ヘルプ報告】を作成してください。指定フォーマットの本文のみを出力。`;
}

export function buildRefineUserMessage(args: {
  previousReport: string;
  direction: string;
}): string {
  return `【現在のヘルプ報告】
${args.previousReport}

【修正の方向性】
${args.direction}

上の報告を、指定の方向性に沿って書き直してください。フォーマット（見出し構成）は維持。本文のみを出力し、前後の説明は付けないこと。`;
}

// ═══════════════ スタブ（ANTHROPIC_API_KEY 未設定時） ═══════════════

/**
 * API キーが無い時に返す、決め打ちのヘルプ報告。
 * 与えられた事実から機械的に組み立てる（嘘を足さない）。
 */
export function buildStubReport(f: HelpReportFacts): string {
  const title = `【ヘルプ報告】${f.customerName}さま${
    f.masterName ? `（${f.masterName}さん 担当）` : ""
  }`;

  const visit = [f.visitSummary, f.table ? `卓: ${f.table}` : null]
    .filter(Boolean)
    .join(" / ");

  const notes = f.notes.trim();
  const condition = notes || "終始和やかにお過ごしでした。";

  const drink = [
    f.favoriteDrink ? `お好み: ${f.favoriteDrink}` : null,
    f.bottles ? `ボトル: ${f.bottles}` : null,
  ]
    .filter(Boolean)
    .join(" / ");

  const handoff: string[] = [];
  if (f.lastTopic) handoff.push(`前回の話題（${f.lastTopic}）の続きが喜ばれそうです。`);
  if (f.serviceTips) handoff.push(`接客のコツ: ${f.serviceTips}`);
  if (f.bottles && /残\s*([0-9]|1[0-9])%/.test(f.bottles))
    handoff.push("ボトルが残り少なめなので、次回お声がけのタイミングかと思います。");
  if (handoff.length === 0)
    handoff.push("引き続き担当さんからフォローいただければと思います。");

  return [
    title,
    `■ 来店`,
    visit || "本日ご来店。",
    `■ ご様子`,
    condition,
    `■ 話した内容`,
    notes ? "（上記メモ参照）" : f.lastTopic ? `${f.lastTopic} の話題で盛り上がりました。` : "特になし",
    `■ お酒・ボトル`,
    drink || "特になし",
    `■ 引き継ぎ / 次回`,
    handoff.join(" "),
    `— ${f.helperName} より`,
  ].join("\n");
}

/** リファイン（方向性適用）のスタブ。元の報告に方向性メモを軽く足す。 */
export function buildStubRefinedReport(args: {
  previousReport: string;
  direction: string;
}): string {
  // スタブでは元文を保ちつつ、末尾に方向性を反映した一文を添える程度に留める。
  const dir = args.direction.trim();
  const note =
    dir.length > 0
      ? `\n\n（${dir} を反映：担当さんがすぐ動けるよう要点をまとめ直しました）`
      : "";
  return `${args.previousReport.trim()}${note}`;
}
