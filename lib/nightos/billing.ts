// Billing / plan foundation.
//
// まだ Stripe は繋いでいない。ここは「無制限プラン (無料) は期間限定で、
// 4ヶ月目から有料になる」という事実を UI に透明に伝えるための単一情報源。
// 折衷案 (登録時カード任意・移行前に登録を促し、未登録なら 4ヶ月目に利用制限)
// を採用しているため、課金状態の本体は将来 Stripe + Supabase 側に持つ。
// このモジュールは「今が無料期間のどのフェーズか」を日付だけで判定する純粋関数。
//
// 日付はすべて日本時間 (JST, UTC+9) の暦日で扱う。
//
// ── 期間設定 ──
// リリース日基準。「今 (2026-06) から 3ヶ月 = 6/7/8 月が無料、4ヶ月目の
// 9 月から有料」という想定。実際のリリース日が動いたらこの 2 行を直すだけでよい。
export const FREE_PERIOD_END = "2026-08-31"; // 無制限プラン (無料) 最終日
export const PAID_START = "2026-09-01"; // 有料プラン開始日 (= 4ヶ月目初日)

// 月額料金 (円, 税込)。確定したら数値を入れる。null の間は「準備中」と表示する。
export const MONTHLY_PRICE_YEN: number | null = null;

// 残りこの日数以内になったら「まもなく有料」の強調表示に切り替える。
export const ENDING_SOON_DAYS = 14;

export type PlanPhase = "free" | "ending_soon" | "paid";

export interface PlanStatus {
  /** free: 無料期間中 / ending_soon: 終了間近 / paid: 有料期間に入った */
  phase: PlanPhase;
  /** 無料期間最終日 (YYYY-MM-DD) */
  freePeriodEnd: string;
  /** 有料プラン開始日 (YYYY-MM-DD) */
  paidStart: string;
  /** 無料期間終了までの残り日数。終了後は 0。 */
  daysRemaining: number;
  /** 月額料金 (円)。未定の場合は null。 */
  monthlyPriceYen: number | null;
}

const MS_PER_DAY = 86_400_000;
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** "YYYY-MM-DD" → その暦日 0:00 を表す UTC タイムスタンプ。 */
function ymdToUtc(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** 任意の時刻 → JST での暦日 "YYYY-MM-DD"。 */
export function toJstDate(now: Date): string {
  const jst = new Date(now.getTime() + JST_OFFSET_MS);
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(jst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 現在 (既定 = now) がどの料金フェーズかを日付だけで判定する。 */
export function getPlanStatus(now: Date = new Date()): PlanStatus {
  const todayUtc = ymdToUtc(toJstDate(now));
  const endUtc = ymdToUtc(FREE_PERIOD_END);
  const paidUtc = ymdToUtc(PAID_START);

  const daysRemaining = Math.max(0, Math.round((endUtc - todayUtc) / MS_PER_DAY));

  let phase: PlanPhase;
  if (todayUtc >= paidUtc) {
    phase = "paid";
  } else if (daysRemaining <= ENDING_SOON_DAYS) {
    phase = "ending_soon";
  } else {
    phase = "free";
  }

  return {
    phase,
    freePeriodEnd: FREE_PERIOD_END,
    paidStart: PAID_START,
    daysRemaining,
    monthlyPriceYen: MONTHLY_PRICE_YEN,
  };
}

/** "2026-09-01" → "2026年9月1日"。 */
export function formatJpDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}

/** 月額表示。未定なら「月額（準備中）」。 */
export function formatMonthlyPrice(yen: number | null = MONTHLY_PRICE_YEN): string {
  if (yen == null) return "月額（準備中）";
  return `月額${yen.toLocaleString("ja-JP")}円`;
}
