/**
 * 全教師データの集約とRAG検索。
 * システムプロンプトには全量を入れず、相談内容にマッチする3件だけ動的注入する。
 */

import { BATCH_1_LINE } from "./training-batch-1-line";
import { BATCH_2_SERVING_STRATEGY } from "./training-batch-2-serving-strategy";
import { BATCH_3_MIXED } from "./training-batch-3-mixed";
import { BATCH_4_LINE_EXTRA } from "./training-batch-4-line-extra";
import { BATCH_5_LINE_SERVING } from "./training-batch-5-line-serving";
import { BATCH_6_SERVING_STRATEGY } from "./training-batch-6-serving-strategy";
import { BATCH_7_STRATEGY_BOTTLE } from "./training-batch-7-strategy-bottle";
import { BATCH_8_BOTTLE_DOUHAN_VIP } from "./training-batch-8-bottle-douhan-vip";
import { BATCH_9_VIP_DIFFICULT } from "./training-batch-9-vip-difficult";
import { BATCH_10_CAST_SEASON } from "./training-batch-10-cast-season";
import type { TrainingExample } from "./training-types";

export const ALL_EXAMPLES: TrainingExample[] = [
  ...BATCH_1_LINE,
  ...BATCH_2_SERVING_STRATEGY,
  ...BATCH_3_MIXED,
  ...BATCH_4_LINE_EXTRA,
  ...BATCH_5_LINE_SERVING,
  ...BATCH_6_SERVING_STRATEGY,
  ...BATCH_7_STRATEGY_BOTTLE,
  ...BATCH_8_BOTTLE_DOUHAN_VIP,
  ...BATCH_9_VIP_DIFFICULT,
  ...BATCH_10_CAST_SEASON,
];

/**
 * キーワードと intent から関連する例を取得する。
 * RAG的な簡易検索。上位3件を返す。
 */
export function retrieveRelevantExamples(opts: {
  userText: string;
  intent?: string;
  customerCategory?: "vip" | "regular" | "new";
  limit?: number;
}): TrainingExample[] {
  const { userText, intent, customerCategory, limit = 3 } = opts;
  const text = userText.toLowerCase();

  // Keyword → tag weight map
  const keywordMap: Array<{ keywords: string[]; tags: string[]; weight: number }> = [
    { keywords: ["お礼", "ありがとう", "翌日"], tags: ["お礼"], weight: 3 },
    { keywords: ["ボトル", "キープ", "残量", "空", "銘柄"], tags: ["ボトル"], weight: 3 },
    { keywords: ["誕生日", "バースデー"], tags: ["誕生日"], weight: 4 },
    { keywords: ["同伴", "食事", "アフター"], tags: ["同伴"], weight: 4 },
    { keywords: ["既読", "返信", "スルー"], tags: ["既読スルー"], weight: 4 },
    { keywords: ["会話", "沈黙", "続かない", "話題"], tags: ["会話続かない"], weight: 3 },
    { keywords: ["機嫌", "不機嫌", "元気ない"], tags: ["不機嫌"], weight: 3 },
    { keywords: ["指名", "フリー", "指名化"], tags: ["指名化"], weight: 3 },
    { keywords: ["line", "LINE", "らいん"], tags: ["line"], weight: 2 },
    { keywords: ["誘い", "お誘い", "来てほしい"], tags: ["お誘い"], weight: 3 },
    { keywords: ["酔", "絡", "しつこ"], tags: ["酔っ払い"], weight: 4 },
    { keywords: ["悪口", "陰口"], tags: ["悪口"], weight: 4 },
    { keywords: ["接待", "クライアント"], tags: ["接待"], weight: 4 },
    { keywords: ["断られ", "ドタキャン", "キャンセル"], tags: ["ドタキャン", "断られた"], weight: 4 },
    { keywords: ["3回目", "三回目"], tags: ["3回目"], weight: 3 },
    { keywords: ["初回", "初めて"], tags: ["1回目"], weight: 3 },
    { keywords: ["年末", "年始", "クリスマス", "師走"], tags: ["年末"], weight: 3 },
  ];

  // Category matching
  const categoryTags: string[] = [];
  if (customerCategory === "vip") categoryTags.push("vip");
  if (customerCategory === "new") categoryTags.push("新規", "1回目");
  if (customerCategory === "regular") categoryTags.push("常連");

  // Intent bias
  const intentTags: Record<string, string[]> = {
    follow: ["line", "お礼", "お誘い", "誕生日"],
    serving: ["接客中", "会話続かない", "不機嫌"],
    strategy: ["指名化", "3回目", "常連維持"],
    freeform: [],
  };

  // Score each example
  const scored = ALL_EXAMPLES.map((ex) => {
    let score = 0;
    // Keyword matches
    for (const km of keywordMap) {
      const matched = km.keywords.some((k) => text.includes(k.toLowerCase()));
      if (matched) {
        const tagHit = ex.tags.some((t) => km.tags.includes(t));
        if (tagHit) score += km.weight;
      }
    }
    // Customer category match
    for (const ct of categoryTags) {
      if (ex.tags.includes(ct)) score += 2;
    }
    // Intent match
    const iTags = intent ? intentTags[intent] ?? [] : [];
    for (const it of iTags) {
      if (ex.tags.includes(it)) score += 1;
    }
    return { ex, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.filter((s) => s.score > 0).slice(0, limit);
  return top.map((s) => s.ex);
}

/**
 * few-shot としてシステムプロンプトに埋め込むための文字列化。
 */
export function formatExamplesForPrompt(examples: TrainingExample[]): string {
  if (examples.length === 0) return "";
  const lines: string[] = ["", "# 本物の銀座のママの思考パターン（関連例）", ""];
  examples.forEach((ex, i) => {
    lines.push(`## 例${i + 1}: ${ex.category}`);
    lines.push(`**状況**: ${ex.situation}`);
    lines.push(`**キャストの相談**: ${ex.cast_query}`);
    lines.push(`**さくらママの答え方**:`);
    lines.push(ex.sakura_answer);
    lines.push(`**なぜこれが効くか**: ${ex.why_it_works}`);
    lines.push(`**NG例**: ${ex.ng_example}`);
    lines.push("");
  });
  lines.push("上の思考パターンを参考に、今回の相談にもこの粒度で答えてください。");
  lines.push("");
  return lines.join("\n");
}
