import {
  Award,
  Calendar,
  Flame,
  Heart,
  Sparkles,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { Card } from "@/components/nightos/card";
import { PageHeader } from "@/components/nightos/page-header";
import { StatCard } from "@/components/nightos/stat-card";
import {
  GoalProgress,
  currencyFormatter,
} from "@/features/cast-stats/components/goal-progress";
import { CastRepeatTrend } from "@/features/cast-stats/components/repeat-trend";
import { getCurrentManagerId } from "@/lib/nightos/auth";
import { getCastStatsData } from "@/lib/nightos/supabase-queries";

export default async function MamaStatsPage() {
  const managerId = await getCurrentManagerId();
  const data = await getCastStatsData(managerId);

  return (
    <div className="animate-fade-in">
      <PageHeader title="自分の成績" subtitle="あなた個人の今月" showBack />

      <div className="px-5 pt-4 pb-6 space-y-5">
        <div className="grid grid-cols-1 gap-3">
          <GoalProgress
            label="今月の売上"
            current={data.monthly.sales}
            goal={data.targets.salesGoal}
            unit=""
            formatter={currencyFormatter}
          />
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div id="repeat">
            <StatCard
              label="再来店率"
              value={Math.round(data.monthly.repeatRate * 100)}
              unit="%"
              tone="rose"
              icon={<Heart size={12} className="text-roseGold-deep" />}
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
            label="今月の新規お客様"
            value={data.monthly.newCustomerCount}
            unit="人"
            tone="default"
            icon={<UserPlus size={12} className="text-gold-deep" />}
          />
        </div>

        <StatCard
          label="連続連絡"
          value={data.followStreakDays}
          unit="日"
          tone="default"
          icon={<Flame size={12} className="text-warning" />}
          className="!flex-row items-center justify-between"
        />

        <section>
          <header className="relative flex items-baseline justify-between pl-3.5 mb-3">
            <span aria-hidden className="absolute left-0 top-1 bottom-1 w-[3px] rounded bg-rose-gold-metallic" />
            <h2 className="font-serif text-[19px] leading-[1.3] font-medium tracking-[0.02em] text-ink">再来店率の動き</h2>
            <span className="text-label-xs tracking-luxe text-ink-mute uppercase">この1ヶ月</span>
          </header>
          <Card className="p-4">
            <CastRepeatTrend points={data.repeatTrend} />
          </Card>
        </section>

        <section>
          <header className="relative flex items-baseline gap-2 pl-3.5 mb-3">
            <span aria-hidden className="absolute left-0 top-1 bottom-1 w-[3px] rounded bg-rose-gold-metallic" />
            <Calendar size={16} className="text-ink-soft" />
            <h2 className="font-serif text-[19px] leading-[1.3] font-medium tracking-[0.02em] text-ink">年間成績</h2>
          </header>
          <div className="grid grid-cols-2 gap-2.5">
            <StatCard
              label="年間売上"
              value={currencyFormatter(data.yearly.sales)}
              tone="rose"
            />
            <StatCard
              label="年間リピート"
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
          </div>
        </section>

        <div
          className="rounded-hero shadow-warm relative overflow-hidden border border-ink/[0.08] p-5"
          style={{
            background:
              "radial-gradient(ellipse at top left, var(--rose-gold-soft) 0%, transparent 55%)," +
              "radial-gradient(ellipse at bottom right, var(--champagne-soft) 0%, transparent 60%)," +
              "linear-gradient(180deg, var(--pearl-light) 0%, var(--pearl) 100%)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-11 h-11 rounded-full border border-gold/35 flex items-center justify-center shrink-0"
              style={{
                background: "var(--champagne-metallic)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.6)",
              }}
            >
              <Award size={18} className="text-roseGold-deep" />
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 text-label-xs tracking-luxe text-roseGold-deep mb-2">
                <Sparkles size={11} strokeWidth={1.8} />
                <span>{data.cast.name}さんへ</span>
              </div>
              <p className="font-serif text-[14.5px] leading-[1.75] font-medium tracking-[0.01em] text-ink">
                ご自身の成績は全体の指針になります。メンバータブで配下の動きも確認してみてくださいね。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
