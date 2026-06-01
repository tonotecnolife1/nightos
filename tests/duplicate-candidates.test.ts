import { describe, expect, it } from "vitest";
import {
  findDuplicateCandidates,
  type DuplicateCandidate,
} from "@/features/customer-registration/lib/duplicate-candidates";

const index: DuplicateCandidate[] = [
  { id: "c1", name: "田中太郎", nameKana: "たなかたろう", nickname: "たろちゃん", masterName: "ゆき" },
  { id: "c2", name: "鈴木一郎", nameKana: "すずきいちろう", nickname: null, masterName: "あかり" },
  { id: "c3", name: "佐藤花子", nameKana: null, nickname: null, masterName: null },
];

describe("findDuplicateCandidates", () => {
  it("漢字氏名の部分一致で拾う", () => {
    const hits = findDuplicateCandidates(index, { name: "田中" });
    expect(hits.map((h) => h.id)).toEqual(["c1"]);
  });

  it("ひらがな（読み）でも当たる", () => {
    const hits = findDuplicateCandidates(index, { name: "", nameKana: "すずき" });
    expect(hits.map((h) => h.id)).toEqual(["c2"]);
  });

  it("呼び名でヒットする", () => {
    const hits = findDuplicateCandidates(index, { name: "", nickname: "たろちゃん" });
    expect(hits.map((h) => h.id)).toEqual(["c1"]);
  });

  it("2文字未満の入力は誤検知防止のため無視", () => {
    expect(findDuplicateCandidates(index, { name: "田" })).toHaveLength(0);
  });

  it("一致が無ければ空", () => {
    expect(findDuplicateCandidates(index, { name: "山田" })).toHaveLength(0);
  });
});
