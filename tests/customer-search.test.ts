import { describe, it, expect } from "vitest";
import {
  isKanaReading,
  katakanaToHiragana,
  normalizeForSearch,
} from "@/lib/nightos/kana";
import { customerMatchesQuery } from "@/lib/nightos/customer-filters";
import type { Customer } from "@/types/nightos";

function customer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: "c1",
    store_id: "s1",
    cast_id: "cast1",
    name: "小林 一郎",
    name_kana: "こばやし いちろう",
    nickname: null,
    birthday: null,
    job: null,
    favorite_drink: null,
    category: "regular",
    store_memo: null,
    created_at: "2025-01-01",
    funnel_stage: "assigned",
    ...overrides,
  };
}

describe("kana utils", () => {
  it("カタカナをひらがなへ変換する", () => {
    expect(katakanaToHiragana("コバヤシ")).toBe("こばやし");
    expect(katakanaToHiragana("田中タロウ")).toBe("田中たろう");
  });

  it("かな列のみ true、漢字混じりは false", () => {
    expect(isKanaReading("たなか")).toBe(true);
    expect(isKanaReading("タナカ タロウ")).toBe(true);
    expect(isKanaReading("田中")).toBe(false);
    expect(isKanaReading("")).toBe(false);
  });

  it("検索正規化はかな種別・空白・大小文字の差を吸収する", () => {
    expect(normalizeForSearch("コバヤシ")).toBe("こばやし");
    expect(normalizeForSearch("こばやし いちろう")).toBe("こばやしいちろう");
    expect(normalizeForSearch("ＡＢＣ")).toBe("abc");
  });
});

describe("customerMatchesQuery", () => {
  it("ひらがな打鍵で読み仮名にヒットする（漢字氏名だけでは当たらないケース）", () => {
    const c = customer();
    expect(customerMatchesQuery(c, "こば")).toBe(true);
    expect(customerMatchesQuery(c, "いちろう")).toBe(true);
  });

  it("カタカナ打鍵でもひらがな読みにヒットする", () => {
    expect(customerMatchesQuery(customer(), "コバヤシ")).toBe(true);
  });

  it("漢字氏名の部分一致も従来どおり当たる", () => {
    expect(customerMatchesQuery(customer(), "小林")).toBe(true);
  });

  it("呼び名・職業・追加項目（メモ）にもヒットする", () => {
    const c = customer({ nickname: "たっちゃん", job: "経営者" });
    expect(customerMatchesQuery(c, "たっちゃん")).toBe(true);
    expect(customerMatchesQuery(c, "経営")).toBe(true);
    expect(customerMatchesQuery(c, "紹介", ["紹介: 吉田様"])).toBe(true);
  });

  it("読みが無くても落ちない / 空クエリは全件一致", () => {
    const c = customer({ name_kana: null });
    expect(customerMatchesQuery(c, "")).toBe(true);
    expect(customerMatchesQuery(c, "こば")).toBe(false);
    expect(customerMatchesQuery(c, "小林")).toBe(true);
  });
});
