/**
 * 月次の再来店率トレンドを生成する純粋ヘルパー。
 *
 * MVP ではキャストの現在の再来店率を基準に、過去 N ヶ月へ向けて
 * 緩やかに下降する近似系列を作る（実テーブルに月次スナップショットが
 * 入るまでの暫定）。mock / real 双方から呼ばれる。
 */
export interface MonthlyTrendPoint {
  /** React key 用の安定 id (例: "2026-5") */
  id: string;
  /** x 軸ラベル (例: "5月") */
  label: string;
  /** 0..1 の再来店率 */
  rate: number;
}

export function buildMonthlyRepeatTrend(
  currentRate: number,
  now: Date,
  months = 6,
): MonthlyTrendPoint[] {
  const points: MonthlyTrendPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    // 直近月 = currentRate、過去へ向かって 1 ヶ月あたり 0.03 下降。
    const rate = Math.max(0, Math.min(1, currentRate - 0.03 * i));
    points.push({
      id: `${d.getFullYear()}-${d.getMonth() + 1}`,
      label: `${d.getMonth() + 1}月`,
      rate,
    });
  }
  return points;
}
