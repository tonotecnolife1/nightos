import { normalizeForSearch } from "@/lib/nightos/kana";
import type { Cast, Customer } from "@/types/nightos";

/**
 * 重複登録防止のための最小限の既存顧客インデックス。
 * プライバシー配慮で氏名・読み・呼び名・マスター名のみ持つ
 * （プロフィール詳細は含めない）。
 */
export interface DuplicateCandidate {
  id: string;
  name: string;
  nameKana: string | null;
  nickname: string | null;
  masterName: string | null;
}

/** 店舗全顧客から最小インデックスを作る。 */
export function buildDuplicateIndex(
  customers: Customer[],
  allCasts: Cast[],
): DuplicateCandidate[] {
  const nameById = new Map(allCasts.map((c) => [c.id, c.name]));
  return customers.map((c) => ({
    id: c.id,
    name: c.name,
    nameKana: c.name_kana ?? null,
    nickname: c.nickname ?? null,
    masterName: c.manager_cast_id
      ? (nameById.get(c.manager_cast_id) ?? null)
      : null,
  }));
}

/**
 * 入力中の氏名/読み/呼び名から、同一人物の可能性がある既存顧客を返す。
 * 双方向の部分一致（入力⊃候補 or 候補⊃入力）で広めに拾い、確定はキャストに委ねる。
 */
export function findDuplicateCandidates(
  index: DuplicateCandidate[],
  input: { name: string; nameKana?: string; nickname?: string },
  limit = 5,
): DuplicateCandidate[] {
  const queries = [input.name, input.nameKana, input.nickname]
    .map((q) => (q ? normalizeForSearch(q) : ""))
    // 2文字未満は誤検知が多いので無視
    .filter((q) => q.length >= 2);
  if (queries.length === 0) return [];

  const matched = index.filter((cand) => {
    const fields = [cand.name, cand.nameKana, cand.nickname]
      .filter((f): f is string => !!f)
      .map((f) => normalizeForSearch(f));
    return queries.some((q) =>
      fields.some((f) => f.includes(q) || q.includes(f)),
    );
  });

  return matched.slice(0, limit);
}
