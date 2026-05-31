import { Flame, JapaneseYen, Users, UsersRound } from "lucide-react";
import { StatsSubHeader } from "@/features/cast-stats/components/stats-sub-header";
import { StatsGoalCard } from "@/features/cast-stats/components/stats-goal-card";
import { StatsMiniKpi } from "@/features/cast-stats/components/stats-mini-kpi";
import { AiUsageSummary } from "@/features/cast-stats/components/ai-usage-summary";
import { StatsTrendChart } from "@/features/cast-stats/components/stats-trend-chart";
import { StatsSectionHead } from "@/features/cast-stats/components/stats-section-head";
import { StatsWorkDaysKpi } from "@/features/cast-stats/components/stats-workdays-kpi";
import { StatsAnalysis } from "@/features/cast-stats/components/stats-analysis";
import { getCurrentCastId } from "@/lib/nightos/auth";
import { getCastStatsData } from "@/lib/nightos/supabase-queries";

export default async function CastStatsPage() {
  const castId = await getCurrentCastId();
  const data = await getCastStatsData(castId);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // 年間売上をコンパクト表示 (¥6.2M)。小さなタイルでも桁あふれしない。
  const annualSalesM = (data.yearly.sales / 1_000_000).toFixed(1);

  return (
    <div
      className="animate-fade-in min-h-full"
      style={{ background: "linear-gradient(180deg, #f3eadb 0%, #efe5d4 100%)" }}
    >
      <StatsSubHeader year={year} month={month} />

      <main className="px-5 pt-[18px] flex flex-col gap-[22px]">
        {/* ── 月次成績 ── */}
        <section className="flex flex-col gap-[22px]">
          <StatsSectionHead title="月次成績" sub={`${year} MONTHLY`} />

          {/* 目標進捗 */}
          <div className="flex flex-col gap-3">
            <StatsGoalCard
              label="今月の売上"
              current={data.monthly.sales}
              goal={data.targets.salesGoal}
              prefix="¥"
              barColor="var(--gold-metallic)"
            />
            {data.targets.douhanGoal > 0 && (
              <StatsGoalCard
                label="今月の同伴"
                current={data.monthly.douhanCount}
                goal={data.targets.douhanGoal}
                unit="回"
                barColor="linear-gradient(90deg, var(--champagne) 0%, var(--champagne-deep) 100%)"
              />
            )}
          </div>

          {/* 上段: 結果指標 */}
          <div className="flex gap-2">
            <StatsMiniKpi
              label="担当顧客"
              value={data.monthly.totalCustomerCount}
              unit="人"
              accent="ink"
              icon={<Users size={11} strokeWidth={1.7} />}
              period="累計"
            />
            <StatsMiniKpi
              label="新規"
              value={data.monthly.newCustomerCount}
              unit="人"
              accent="wine"
              period="今月"
            />
            <StatsMiniKpi
              label="再来店率"
              value={Math.round(data.monthly.repeatRate * 100)}
              unit="%"
              accent="rose"
              period="今月"
            />
          </div>

          {/* 下段: アクション指標 */}
          <div className="flex gap-2">
            <StatsMiniKpi
              label="連絡達成率"
              value={Math.round(data.monthly.followRate * 100)}
              unit="%"
              accent="ink"
              period="今月"
            />
            <StatsMiniKpi
              label="連続連絡"
              value={data.followStreakDays}
              unit="日"
              accent="amber"
              icon={<Flame size={11} strokeWidth={1.7} />}
              period="累計"
            />
            <StatsWorkDaysKpi />
          </div>
        </section>

        {/* ── さくらママ活用度 ── */}
        <AiUsageSummary />

        {/* ── 再来店率の動き (月次) ── */}
        <StatsTrendChart points={data.repeatTrendMonthly} />

        {/* ── 年間成績 ── */}
        <section className="flex flex-col gap-3">
          <StatsSectionHead title="年間成績" sub={`${year} ANNUAL`} />
          <div className="grid grid-cols-2 gap-2">
            <StatsMiniKpi
              label="年間売上"
              prefix="¥"
              value={annualSalesM}
              unit="M"
              accent="rose"
              icon={<JapaneseYen size={11} strokeWidth={1.7} />}
            />
            <StatsMiniKpi
              label="年間再来店率"
              value={Math.round(data.yearly.repeatRate * 100)}
              unit="%"
              accent="ink"
            />
            <StatsMiniKpi
              label="年間新規"
              value={data.yearly.newCustomerCount}
              unit="人"
              accent="wine"
              icon={<Users size={11} strokeWidth={1.7} />}
            />
            {data.yearly.douhanCount > 0 && (
              <StatsMiniKpi
                label="年間同伴"
                value={data.yearly.douhanCount}
                unit="回"
                accent="gold"
                icon={<UsersRound size={11} strokeWidth={1.7} />}
              />
            )}
          </div>
        </section>

        {/* ── さくらママに成績を見てもらう ── */}
        <StatsAnalysis castId={castId} name={data.cast.name} />
      </main>
    </div>
  );
}
