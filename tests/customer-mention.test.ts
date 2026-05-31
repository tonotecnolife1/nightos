import { describe, expect, it } from "vitest";
import {
  detectCustomer,
  searchCustomers,
  type MentionCustomer,
} from "@/features/team-chat/lib/customer-mention";

const customers: MentionCustomer[] = [
  { id: "c1", name: "田中", nickname: "たなか社長", category: "vip" },
  { id: "c2", name: "佐藤", nickname: null, category: "regular" },
  { id: "c3", name: "山", nickname: null, category: "regular" }, // 1文字（短すぎ）
  { id: "c4", name: "鈴木", name_kana: "すずき", category: "regular" },
];

describe("searchCustomers (@mention autocomplete)", () => {
  it("空クエリは全件（VIPを先頭に）", () => {
    const res = searchCustomers(customers, "");
    expect(res).toHaveLength(4);
    expect(res[0].id).toBe("c1"); // VIP first
  });

  it("前方一致を中間一致より優先する", () => {
    const res = searchCustomers(customers, "たなか");
    expect(res[0].id).toBe("c1");
  });

  it("name_kana でもヒットする", () => {
    const res = searchCustomers(customers, "すずき");
    expect(res.map((c) => c.id)).toContain("c4");
  });

  it("一致なしは空配列", () => {
    expect(searchCustomers(customers, "存在しない名前")).toEqual([]);
  });
});

describe("detectCustomer (受動検出)", () => {
  it("本文に名前が含まれれば検出する", () => {
    const r = detectCustomer(customers, "今日は田中さんが来店された");
    expect(r?.customer.id).toBe("c1");
  });

  it("ニックネームでも検出する", () => {
    const r = detectCustomer(customers, "たなか社長にお礼LINEした");
    expect(r?.customer.id).toBe("c1");
  });

  it("1文字の極端に短い名前は誤検出しない", () => {
    // "山" は2文字未満なので除外され、別の語にマッチして山さんが拾われない
    const r = detectCustomer(customers, "山手線で移動中");
    expect(r?.customer.id).not.toBe("c3");
  });

  it("名前が無ければ null", () => {
    expect(detectCustomer(customers, "おはようございます")).toBeNull();
  });

  it("複数一致なら ambiguous に候補が入る", () => {
    const r = detectCustomer(customers, "田中さんと佐藤さんが同伴");
    expect(r).not.toBeNull();
    expect(r!.ambiguous.length).toBeGreaterThanOrEqual(2);
  });
});
