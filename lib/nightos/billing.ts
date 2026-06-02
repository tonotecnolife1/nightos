// Billing / plan foundation.
//
// 課金モデル: フリーミアム (pay-as-you-go)。
//   - カード登録はお願いするが、基本機能はずっと無料で使える (期間制限なし)。
//   - 一部の機能を必要に応じて使ったときだけ従量課金が発生する。
//
// まだ Stripe は繋いでいないので、ここは課金モデルを UI に透明に伝えるための
// 単一情報源。従量課金の対象機能 / 単価が固まるまでは「準備中」として最小限の
// 情報だけを持ち、UI からは「基本無料・必要に応じて課金」という事実だけを伝える。
// 実際の課金状態 (カード登録済みか・今月の従量利用額) は将来 Stripe + Supabase
// 側に持つ。

/** 基本プラン名 (UI 表示)。 */
export const BASE_PLAN_NAME = "無料プラン";

/** バナー / 料金欄で使う一言。不安を煽らず事実だけを伝える。 */
export const PLAN_TAGLINE = "基本無料・必要に応じて課金";

/**
 * 従量課金の対象機能・単価が確定したら true にする。
 * false の間は具体的な金額を出さず「必要に応じて課金」とだけ伝える。
 */
export const METERED_BILLING_READY = false;

export interface PlanStatus {
  /** 基本機能が無料で使えるか (本モデルでは常に true)。 */
  freeBaseline: boolean;
  /** 従量課金がすでに有効か (対象機能・単価の確定後に true)。 */
  meteredBillingReady: boolean;
}

/**
 * 現在の課金状態。基本無料は無期限なので日付には依存しない。
 * 将来カード登録状態や今月の利用額を反映する拡張ポイントとして関数で包んでおく。
 */
export function getPlanStatus(): PlanStatus {
  return {
    freeBaseline: true,
    meteredBillingReady: METERED_BILLING_READY,
  };
}
