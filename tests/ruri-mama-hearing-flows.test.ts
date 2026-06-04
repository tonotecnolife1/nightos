import { describe, expect, it } from "vitest";
import { getHearingFlows } from "@/features/ruri-mama/data/system-prompt";

/**
 * 業態（club=担当制 / cabaret=指名制）でヒアリングの選択肢が
 * 出し分けられることを保証する。クラブには指名制度がないので、
 * 指名前提の選択肢を出すと違和感が出る（このリグレッションを防ぐ）。
 */
describe("getHearingFlows — 業態別ヒアリング", () => {
  const club = getHearingFlows("club");
  const cabaret = getHearingFlows("cabaret");

  const situationOptions = (flows: ReturnType<typeof getHearingFlows>) =>
    flows.serving.steps[0].options;
  const causeOptions = (flows: ReturnType<typeof getHearingFlows>) =>
    flows.strategy.steps.find((s) => s.id === "cause")!.options;

  it("cabaret は接客中・戦略ともに指名前提の選択肢を出す", () => {
    expect(situationOptions(cabaret)).toContain("指名につなげたい");
    expect(causeOptions(cabaret)).toContain("指名化できない");
  });

  it("club は指名前提の選択肢を一切出さない（担当制）", () => {
    expect(situationOptions(club)).not.toContain("指名につなげたい");
    expect(causeOptions(club)).not.toContain("指名化できない");
    // 担当制に沿った言い回しに置き換わっている
    expect(situationOptions(club)).toContain("また来てほしい");
    expect(causeOptions(club)).toContain("担当客が増えない");
  });

  it("業態に依存しない選択肢は共通", () => {
    expect(situationOptions(club)).toContain("会話が続かない");
    expect(situationOptions(cabaret)).toContain("会話が続かない");
    expect(situationOptions(club)).toContain("ボトル提案したい");
    // follow フローは業態中立で同一
    expect(club.follow).toEqual(cabaret.follow);
  });

  it("どちらの業態も4つの intent を網羅する", () => {
    for (const flows of [club, cabaret]) {
      expect(Object.keys(flows).sort()).toEqual(
        ["follow", "freeform", "serving", "strategy"].sort(),
      );
    }
  });
});
