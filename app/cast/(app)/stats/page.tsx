import { Flame, JapaneseYen, Users, UsersRound } from "lucide-react";
import { StatsSubHeader } from "@/features/cast-stats/components/stats-sub-header";
import { StatsGoalCard } from "@/features/cast-stats/components/stats-goal-card";
import { StatsMiniKpi } from "@/features/cast-stats/components/stats-mini-kpi";
import { AiUsageSummary } from "@/features/cast-stats/components/ai-usage-summary";
import { StatsTrendChart } from "@/features/cast-stats/components/stats-trend-chart";
import { StatsSectionHead } from "@/features/cast-stats/components/stats-section-head";
import { StatsWorkDaysKpi } from "@/features/cast-stats/components/stats-workdays-kpi";
import { StatsEncouragement } from "@/features/cast-stats/components/stats-encouragement";
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

          {/* 月次スコア (当月集計) */}
          <div className="flex gap-2">
            <StatsMiniKpi
              label="再来店率"
              value={Math.round(data.monthly.repeatRate * 100)}
              unit="%"
              accent="rose"
              period="今月"
            />
            <StatsMiniKpi
              label="連絡達成率"
              value={Math.round(data.monthly.followRate * 100)}
              unit="%"
              accent="ink"
              period="今月"
            />
            <StatsMiniKpi
              label="新規"
              value={data.monthly.newCustomerCount}
              unit="人"
              accent="wine"
              period="今月"
            />
          </div>

          {/* 担当・継続 (累計) ＋ 当月の出勤 */}
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

        {/* ── さくらママからの励まし ── */}
        <StatsEncouragement name={data.cast.name} message={buildEncouragement(data)} />
      </main>
    </div>
  );
}

function buildEncouragement(
  data: Awaited<ReturnType<typeof getCastStatsData>>,
): string {
  const salesPct = Math.round(
    (data.monthly.sales / data.targets.salesGoal) * 100,
  );
  const douhanPct =
    data.targets.douhanGoal > 0
      ? Math.round((data.monthly.douhanCount / data.targets.douhanGoal) * 100)
      : 0;
  const followPct = Math.round(data.monthly.followRate * 100);

  if (salesPct >= 100 && douhanPct >= 100) {
    return `売上も同伴も目標達成🌸 今月は本当によく頑張ったわね。来月もこの調子で✨`;
  }
  if (salesPct >= 100) {
    return `今月の売上目標を達成🌸 同伴もあと少し。お客様との約束を大切にね✨`;
  }
  if (douhanPct >= 100) {
    return `今月の同伴目標を達成！素晴らしいわ💕 売上も${salesPct}%まで来てるから、もう一息よ。`;
  }
  if (followPct < 50) {
    return `連絡達成率${followPct}%はちょっと寂しいわね💌 1日3人だけ、お礼メッセージを送る習慣からスタートして。`;
  }
  return `売上${salesPct}%、同伴${data.monthly.douhanCount}回の進捗ね。連続${data.followStreakDays}日お客様に連絡できてるから、このペースで続けましょ☕`;
}
