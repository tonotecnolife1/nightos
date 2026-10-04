import { describe, expect, it } from "vitest";
import {
  buildFactsBlock,
  buildStubRefinedReport,
  buildStubReport,
  type HelpReportFacts,
} from "@/features/help-report/data/report-prompt";

function baseFacts(overrides: Partial<HelpReportFacts> = {}): HelpReportFacts {
  return {
    customerName: "田中太郎",
    masterName: "ゆき",
    helperName: "あかり",
    notes: "",
    category: "vip",
    favoriteDrink: null,
    visitSummary: null,
    table: null,
    bottles: null,
    storeMemo: null,
    lastTopic: null,
    serviceTips: null,
    ...overrides,
  };
}

describe("buildStubReport — ヘルプ報告のフォールバック", () => {
  it("見出し・宛先・署名を含む定型を返す", () => {
    const report = buildStubReport(baseFacts());
    expect(report).toContain("【ヘルプ報告】田中太郎さま");
    expect(report).toContain("（ゆきさん 担当）");
    expect(report).toContain("■ 来店");
    expect(report).toContain("■ 引き継ぎ / 次回");
    expect(report).toContain("— あかり より");
  });

  it("担当不明のときは担当の括弧書きを付けない", () => {
    const report = buildStubReport(baseFacts({ masterName: null }));
    expect(report).toContain("【ヘルプ報告】田中太郎さま");
    expect(report).not.toContain("担当）");
  });

  it("ヘルプのメモを「ご様子」に反映する", () => {
    const report = buildStubReport(
      baseFacts({ notes: "ゴルフの話で終始ご機嫌でした" }),
    );
    expect(report).toContain("ゴルフの話で終始ご機嫌でした");
  });

  it("ボトル残量が少ないと引き継ぎに声がけ提案を足す", () => {
    const report = buildStubReport(
      baseFacts({ bottles: "ドンペリ白（残10%）" }),
    );
    expect(report).toContain("ボトルが残り少なめ");
  });
});

describe("buildFactsBlock — 事実ブロック", () => {
  it("提供された項目のみを列挙し、無い項目は出さない", () => {
    const block = buildFactsBlock(
      baseFacts({ favoriteDrink: "芋焼酎", visitSummary: "来店5回・最終来店今日" }),
    );
    expect(block).toContain("好きなお酒: 芋焼酎");
    expect(block).toContain("来店状況: 来店5回・最終来店今日");
    expect(block).not.toContain("卓:");
  });

  it("メモが空なら（特記なし）を入れる", () => {
    const block = buildFactsBlock(baseFacts({ notes: "" }));
    expect(block).toContain("（特記なし）");
  });
});

describe("buildStubRefinedReport — 方向性の反映（スタブ）", () => {
  it("元の報告を保ちつつ方向性メモを添える", () => {
    const result = buildStubRefinedReport({
      previousReport: "【ヘルプ報告】田中太郎さま\n■ 来店\n本日ご来店。",
      direction: "もっと簡潔に",
    });
    expect(result).toContain("【ヘルプ報告】田中太郎さま");
    expect(result).toContain("もっと簡潔に");
  });
});
