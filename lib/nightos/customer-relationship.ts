import type { Customer } from "@/types/nightos";

/**
 * あるキャストと顧客の関係性。
 * - manager : 管理責任者 (manager_cast_id)
 * - assigned: 主要担当 (cast_id)。manager とは別人のケース
 * - help    : 上記いずれでもない（ヘルプで接客しただけ）
 *
 * 編集権限のレイヤー分けに使う (docs/master-vs-help-customers.md UI改善C)。
 */
export type CustomerRelationship = "manager" | "assigned" | "help";

export function getCustomerRelationship(
  customer: Pick<Customer, "manager_cast_id" | "cast_id">,
  castId: string,
): CustomerRelationship {
  if (customer.manager_cast_id === castId) return "manager";
  if (customer.cast_id === castId) return "assigned";
  return "help";
}

/** 共有プロフィールを直接編集できるのは manager / assigned のみ。help は「提案」まで。 */
export function canEditCustomerDirectly(rel: CustomerRelationship): boolean {
  return rel === "manager" || rel === "assigned";
}

/**
 * 提案の一次承認者。マスター優先、無ければ担当。どちらも不在なら null（=オーナーへ）。
 */
export function resolveApproverCastId(
  customer: Pick<Customer, "manager_cast_id" | "cast_id">,
): string | null {
  return customer.manager_cast_id ?? customer.cast_id ?? null;
}
