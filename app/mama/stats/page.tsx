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
              icon={<Heart size={12} className="text-blush-dark" />}
            />
          </div>
          <StatCard
            label="連絡達成率"
            value={Math.round(data.monthly.followRate * 100)}
            unit="%"
            tone="amethyst"
            icon={<TrendingUp size={12} className="text-amethyst-dark" />}
          />
          <StatCard
            label="今月の新規お客様"
            value={data.monthly.newCustomerCount}
            unit="人"
            tone="default"
            icon={<UserPlus size={12} className="text-amethyst-dark" />}
          />
        </div>

        <StatCard
          label="連続連絡"
          value={data.followStreakDays}
          unit="日"
          tone="default"
          icon={<Flame size={12} className="text-amber" />}
          className="!flex-row items-center justify-between"
        />

        <section>
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-display-sm text-ink">再来店率の動き</h2>
            <span className="text-label-sm text-ink-mute">この1ヶ月</span>
          </div>
          <Card className="p-4">
            <CastRepeatTrend points={data.repeatTrend} />
          </Card>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-ink-soft" />
            <h2 className="text-display-sm text-ink">年間成績</h2>
          </div>
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

        <Card className="!bg-gradient-champagne !border-champagne-dark p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-roseGold/20 flex items-center justify-center shrink-0">
              <Award size={18} className="text-roseGold-dark" />
            </div>
            <div className="flex-1">
              <div className="text-label-md font-semibold text-ink mb-1">
                <Sparkles size={11} className="inline mr-1" />
                {data.cast.name}さんへ
              </div>
              <p className="text-body-sm text-ink leading-relaxed">
                ご自身の成績は全体の指針になります。メンバータブで配下の動きも確認してみてくださいね。
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
