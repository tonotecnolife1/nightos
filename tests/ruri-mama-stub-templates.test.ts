import { describe, expect, it } from "vitest";
import { generateStubOptions } from "@/features/ruri-mama/data/stub-responses";

describe("generateStubOptions — テンプレ反映", () => {
  it("castTemplates があれば B 案をテンプレ調整版に差し替える", () => {
    const options = generateStubOptions({
      intent: "follow",
      hearingContext: { purpose: "来店のお礼" },
      customer: null,
      userText: "お礼を送りたい",
      castTemplates: [
        { category: "thanks", label: "常連お礼", body: "{姓}さま、昨日はありがとう🌸" },
      ],
    });
    const b = options.find((o) => o.id === "B");
    expect(b?.label).toContain("常連お礼");
    expect(b?.content).toContain("あなたが普段使っている型");
  });

  it("templateSeed があれば A 案をテンプレ忠実版に差し替える", () => {
    const options = generateStubOptions({
      intent: "follow",
      hearingContext: { purpose: "来店のお礼" },
      customer: null,
      userText: "お礼",
      templateSeed: { label: "VIP向け", body: "{姓}さま、ご無沙汰しております。" },
    });
    const a = options.find((o) => o.id === "A");
    expect(a?.label).toContain("VIP向け");
  });

  it("テンプレが無ければ既定の3案のまま", () => {
    const options = generateStubOptions({
      intent: "follow",
      hearingContext: {},
      customer: null,
      userText: "お礼",
    });
    expect(options).toHaveLength(3);
    expect(options.find((o) => o.id === "B")?.label).toBe("端的で実用的");
  });
});
