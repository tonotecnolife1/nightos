import {
  Award,
  Calendar,
  Flame,
  Heart,
  MessageCircle,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { Card, GemCard } from "@/components/nightos/card";
import { PageHeader } from "@/components/nightos/page-header";
import { StatCard } from "@/components/nightos/stat-card";
import {
  GoalProgress,
  currencyFormatter,
} from "@/features/cast-stats/components/goal-progress";
import { CastRepeatTrend } from "@/features/cast-stats/components/repeat-trend";
import { AiUsageSummary } from "@/features/cast-stats/components/ai-usage-summary";
import { getCurrentCastId } from "@/lib/nightos/auth";
import { getCastStatsData } from "@/lib/nightos/supabase-queries";

export default async function CastStatsPage() {
  const castId = await getCurrentCastId();
  const data = await getCastStatsData(castId);

  return (
    <div className="animate-fade-in">
      <PageHeader title="あなたの成績" subtitle="今月のがんばり" showBack />

      <div className="px-5 pt-4 pb-6 space-y-5">
        {/* ── 目標進捗 ── */}
        <div className="grid grid-cols-1 gap-3">
          <GoalProgress
            label="今月の売上"
            current={data.monthly.sales}
            goal={data.targets.salesGoal}
            unit=""
            formatter={currencyFormatter}
          />
          <GoalProgress
            label="今月の同伴"
            current={data.monthly.douhanCount}
            goal={data.targets.douhanGoal}
            unit="回"
          />
        </div>

        {/* ── 月次スコア ── */}
        <div className="grid grid-cols-3 gap-2.5">
          <div id="repeat">
            <StatCard
              label="再来店率"
              value={Math.round(data.monthly.repeatRate * 100)}
              unit="%"
              tone="rose"
              icon={<Heart size={12} className="text-wine-deep" />}
            />
          </div>
          <StatCard
            label="連絡達成率"
            value={Math.round(data.monthly.followRate * 100)}
            unit="%"
            tone="amethyst"
            icon={<TrendingUp size={12} className="text-gold-deep" />}
          />
          <StatCard
            label="今月の新規"
            value={data.monthly.newCustomerCount}
            unit="人"
            tone="default"
            icon={<UserPlus size={12} className="text-gold-deep" />}
          />
        </div>

        {/* ── 担当・継続 ── */}
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard
            label="担当顧客"
            value={data.monthly.totalCustomerCount}
            unit="人"
            tone="rose"
            icon={<Users size={12} className="text-wine-deep" />}
          />
          <StatCard
            label="連続連絡"
            value={data.followStreakDays}
            unit="日"
            tone="default"
            icon={<Flame size={12} className="text-warning" />}
          />
        </div>

        {/* ── AI usage ── */}
        <AiUsageSummary />

        {/* ── 再来店率の動き ── */}
        <section>
          <header className="relative flex items-baseline justify-between pl-3.5 mb-3">
            <span
              aria-hidden
              className="absolute left-0 top-1 bottom-1 w-[3px] rounded"
              style={{ background: "var(--v5-champ-gold)" }}
            />
            <h2 className="font-serif text-[19px] leading-[1.3] font-medium tracking-[0.04em] text-ink">
              再来店率の動き
            </h2>
            <span className="text-label-xs tracking-luxe text-ink-mute uppercase">
              この1ヶ月
            </span>
          </header>
          <Card className="p-4">
            <CastRepeatTrend points={data.repeatTrend} />
          </Card>
        </section>

        {/* ── 年間成績 ── */}
        <section>
          <header className="relative flex items-baseline gap-2 pl-3.5 mb-3">
            <span
              aria-hidden
              className="absolute left-0 top-1 bottom-1 w-[3px] rounded"
              style={{ background: "var(--v5-champ-gold)" }}
            />
            <Calendar size={16} className="text-ink-soft" />
            <h2 className="font-serif text-[19px] leading-[1.3] font-medium tracking-[0.04em] text-ink">
              年間成績
            </h2>
          </header>
          <div className="grid grid-cols-2 gap-2.5">
            <StatCard
              label="年間売上"
              value={currencyFormatter(data.yearly.sales)}
              tone="rose"
            />
            <StatCard
              label="年間再来店率"
              value={Math.round(data.yearly.repeatRate * 100)}
              unit="%"
              tone="default"
            />
            <StatCard
              label="年間新規"
              value={data.yearly.newCustomerCount}
              unit="人"
              tone="amethyst"
            />
            {data.yearly.douhanCount > 0 && (
              <StatCard
                label="年間同伴"
                value={data.yearly.douhanCount}
                unit="回"
                tone="default"
              />
            )}
          </div>
        </section>

        {/* ── さくらママからの励まし ── */}
        <GemCard className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-full border border-gold/35 flex items-center justify-center shrink-0"
              style={{
                background: "var(--champagne-metallic)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.6)",
              }}
            >
              <Award size={18} className="text-wine-deep" />
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 text-label-xs tracking-luxe text-wine-deep mb-2">
                <Sparkles size={11} strokeWidth={1.8} />
                <span>{data.cast.name}さんへ</span>
              </div>
              <p className="font-serif text-[14.5px] leading-[1.75] font-medium tracking-[0.01em] text-ink">
                {buildEncouragement(data)}
              </p>
            </div>
          </div>
        </GemCard>
      </div>
    </div>
  );
}

function buildEncouragement(data: Awaited<ReturnType<typeof getCastStatsData>>): string {
  const salesPct = Math.round(
    (data.monthly.sales / data.targets.salesGoal) * 100,
  );
  const douhanPct = data.targets.douhanGoal > 0
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
