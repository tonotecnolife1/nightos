import type { Visit } from "@/types/nightos";

/**
 * 成績画面の数値を visits（来店）から実集計する純粋関数群。
 * mock / real 双方のデータ層から呼ばれ、集計ロジックの二重実装を防ぐ。
 *
 * 「ズレ」の根本対応: これまで成績は nightos_casts.monthly_sales /
 * repeat_rate の静的列を直読みしていたが、登録した来店と連動しなかった。
 * 本モジュールで visits.sales_amount / 来店回数から都度集計する。
 */

export interface MonthlyTrendPoint {
  /** React key 用の安定 id (例: "2026-5") */
  id: string;
  /** x 軸ラベル (例: "5月") */
  label: string;
  /** 0..1 の再来店率 */
  rate: number;
}

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1);

/** 期間内 [from, to] の来店だけに絞る。to 省略時は上限なし。 */
function inRange(visited: Date, from: Date, to?: Date): boolean {
  if (visited.getTime() < from.getTime()) return false;
  if (to && visited.getTime() > to.getTime()) return false;
  return true;
}

/** 指定キャストの、期間内 [from, to] 売上合計（円）。 */
export function sumSales(
  visits: Visit[],
  castId: string,
  from: Date,
  to?: Date,
): number {
  return visits.reduce((sum, v) => {
    if (v.cast_id !== castId) return sum;
    if (!inRange(new Date(v.visited_at), from, to)) return sum;
    return sum + (v.sales_amount ?? 0);
  }, 0);
}

/**
 * 再来店率 = 期間内に 2 回以上来店した担当顧客 ÷ 担当顧客総数。
 * 担当顧客が 0 のときは 0 を返す。
 */
export function computeRepeatRate(
  visits: Visit[],
  castId: string,
  customerIds: string[],
  from: Date,
  to?: Date,
): number {
  if (customerIds.length === 0) return 0;
  const counts = new Map<string, number>();
  for (const v of visits) {
    if (v.cast_id !== castId) continue;
    if (!customerIds.includes(v.customer_id)) continue;
    if (!inRange(new Date(v.visited_at), from, to)) continue;
    counts.set(v.customer_id, (counts.get(v.customer_id) ?? 0) + 1);
  }
  const repeaters = Array.from(counts.values()).filter((n) => n >= 2).length;
  return Math.min(1, repeaters / customerIds.length);
}

/** 今月の売上合計。 */
export function monthlySales(visits: Visit[], castId: string, now: Date): number {
  return sumSales(visits, castId, startOfMonth(now), now);
}

/** 年間（暦年）の売上合計。 */
export function yearlySales(visits: Visit[], castId: string, now: Date): number {
  return sumSales(visits, castId, startOfYear(now), now);
}

/** 今月の再来店率。 */
export function monthlyRepeatRate(
  visits: Visit[],
  castId: string,
  customerIds: string[],
  now: Date,
): number {
  return computeRepeatRate(visits, castId, customerIds, startOfMonth(now), now);
}

/** 年間の再来店率。 */
export function yearlyRepeatRate(
  visits: Visit[],
  castId: string,
  customerIds: string[],
  now: Date,
): number {
  return computeRepeatRate(visits, castId, customerIds, startOfYear(now), now);
}

/**
 * 直近 N ヶ月の再来店率トレンドを visits から実集計する。
 * 各月について「その月に 2 回以上来店した担当顧客 ÷ 担当顧客総数」。
 */
export function buildMonthlyRepeatTrend(
  visits: Visit[],
  castId: string,
  customerIds: string[],
  now: Date,
  months = 6,
): MonthlyTrendPoint[] {
  const points: MonthlyTrendPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const from = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const to = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    points.push({
      id: `${from.getFullYear()}-${from.getMonth() + 1}`,
      label: `${from.getMonth() + 1}月`,
      rate: computeRepeatRate(visits, castId, customerIds, from, to),
    });
  }
  return points;
}
