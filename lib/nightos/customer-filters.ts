// ═══════════════ Customer filter helpers (shared) ═══════════════
// 顧客リストで共通利用するフィルター。

import type { Customer } from "@/types/nightos";
import { normalizeForSearch } from "./kana";

export type CategoryFilter = "all" | "vip" | "regular" | "new";
export type FunnelFilter = "all" | "store_only" | "assigned" | "line_exchanged";
export type ReferrerFilter = "all" | "yes" | "no";

export interface CustomerFilters {
  query: string;
  category: CategoryFilter;
  funnelStage: FunnelFilter;
  /** "" = 全て */
  managerId: string;
  /** "" = 全て */
  castId: string;
  hasReferrer: ReferrerFilter;
}

export const DEFAULT_CUSTOMER_FILTERS: CustomerFilters = {
  query: "",
  category: "all",
  funnelStage: "all",
  managerId: "",
  castId: "",
  hasReferrer: "all",
};

export function isFilterActive(f: CustomerFilters): boolean {
  return (
    f.query.trim() !== "" ||
    f.category !== "all" ||
    f.funnelStage !== "all" ||
    f.managerId !== "" ||
    f.castId !== "" ||
    f.hasReferrer !== "all"
  );
}

export function activeFilterCount(f: CustomerFilters): number {
  let n = 0;
  if (f.query.trim() !== "") n++;
  if (f.category !== "all") n++;
  if (f.funnelStage !== "all") n++;
  if (f.managerId !== "") n++;
  if (f.castId !== "") n++;
  if (f.hasReferrer !== "all") n++;
  return n;
}

/**
 * 顧客のテキスト検索一致判定（共通）。
 *
 * 氏名・読み仮名・呼び名・職業・好きなお酒（＋呼び出し側が渡す追加項目）に対し、
 * ひらがな/カタカナ/全角半角の差を吸収して部分一致する。漢字氏名だけでは
 * 当たらない「ひらがな打鍵」も name_kana 経由でヒットする。
 */
export function customerMatchesQuery(
  c: Customer,
  rawQuery: string,
  extraFields: (string | null | undefined)[] = [],
): boolean {
  const q = normalizeForSearch(rawQuery);
  if (!q) return true;
  const fields = [
    c.name,
    c.name_kana,
    c.nickname,
    c.job,
    c.favorite_drink,
    ...extraFields,
  ];
  return fields.some((f) => f != null && normalizeForSearch(f).includes(q));
}

export function applyCustomerFilters<T extends Customer>(
  customers: T[],
  f: CustomerFilters,
): T[] {
  let result = customers;

  const q = f.query.trim();
  if (q) {
    result = result.filter((c) => customerMatchesQuery(c, q));
  }

  if (f.category !== "all") {
    result = result.filter((c) => c.category === f.category);
  }

  if (f.funnelStage !== "all") {
    result = result.filter(
      (c) => (c.funnel_stage ?? "store_only") === f.funnelStage,
    );
  }

  if (f.managerId !== "") {
    result = result.filter((c) => c.manager_cast_id === f.managerId);
  }

  if (f.castId !== "") {
    result = result.filter((c) => c.cast_id === f.castId);
  }

  if (f.hasReferrer === "yes") {
    result = result.filter((c) => !!c.referred_by_customer_id);
  } else if (f.hasReferrer === "no") {
    result = result.filter((c) => !c.referred_by_customer_id);
  }

  return result;
}

// ═══════════════ localStorage persistence ═══════════════

export function loadFilters(key: string): CustomerFilters {
  if (typeof window === "undefined") return DEFAULT_CUSTOMER_FILTERS;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return DEFAULT_CUSTOMER_FILTERS;
    const parsed = JSON.parse(raw) as Partial<CustomerFilters>;
    return { ...DEFAULT_CUSTOMER_FILTERS, ...parsed };
  } catch {
    return DEFAULT_CUSTOMER_FILTERS;
  }
}

export function saveFilters(key: string, f: CustomerFilters): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(f));
  } catch {
    // ignore
  }
}
