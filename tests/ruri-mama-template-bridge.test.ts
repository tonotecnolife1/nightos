import { describe, expect, it } from "vitest";
import {
  extractMessageText,
  purposeToCategory,
  templatize,
} from "@/features/ruri-mama/lib/template-bridge";

describe("purposeToCategory", () => {
  it("follow の purpose をテンプレ category に対応づける", () => {
    expect(purposeToCategory("来店のお礼")).toBe("thanks");
    expect(purposeToCategory("お誘い・同伴")).toBe("invite");
    expect(purposeToCategory("お祝い・記念日")).toBe("birthday");
    expect(purposeToCategory("ご無沙汰の挨拶")).toBe("invite");
  });

  it("対応しない purpose は null", () => {
    expect(purposeToCategory("その他")).toBeNull();
    expect(purposeToCategory(undefined)).toBeNull();
  });
});

describe("extractMessageText", () => {
  it("【文面例】セクションだけを抜き出す", () => {
    const content =
      "【アドバイス】軽くいきましょう。\n【文面例】田中さま、昨日はありがとう🌸\n【なぜ効くか】負担にならないから。";
    expect(extractMessageText(content)).toBe("田中さま、昨日はありがとう🌸");
  });

  it("見出しが無ければ全文を返す", () => {
    expect(extractMessageText("そのままの一文です。")).toBe(
      "そのままの一文です。",
    );
  });

  it("文面が無ければ先頭セクションを返す", () => {
    expect(extractMessageText("【アドバイス】まず落ち着いて。")).toBe(
      "まず落ち着いて。",
    );
  });
});

describe("templatize", () => {
  it("フルネームと姓をプレースホルダに戻す", () => {
    const text = "田中 大輔さま、また田中さまにお会いしたいです。";
    expect(templatize(text, { fullName: "田中 大輔" })).toBe(
      "{顧客名}さま、また{姓}さまにお会いしたいです。",
    );
  });

  it("姓のみ登場するケースも {姓} に置換", () => {
    expect(templatize("田中さま、お元気ですか？", { fullName: "田中 大輔" })).toBe(
      "{姓}さま、お元気ですか？",
    );
  });

  it("氏名が無ければ原文のまま", () => {
    expect(templatize("お客様、ありがとう。", { fullName: null })).toBe(
      "お客様、ありがとう。",
    );
  });
});
