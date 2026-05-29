import { notFound } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Heart,
  User,
} from "lucide-react";
import { Card } from "@/components/nightos/card";
import { PageHeader } from "@/components/nightos/page-header";
import { StatCard } from "@/components/nightos/stat-card";
import { CancelledDouhanSection } from "@/features/team-management/components/cancelled-douhan-section";
import { GoalSettingCard } from "@/features/team-management/components/goal-setting-card";
import {
  getCastGoal,
  getCastStatsData,
} from "@/lib/nightos/supabase-queries";
import {
  mockCasts,
  mockCustomers,
} from "@/lib/nightos/mock-data";
import { getCurrentManagerId } from "@/lib/nightos/auth";
import { formatCustomerName } from "@/lib/utils";

export default async function MamaTeamCastDetailPage({
  params,
}: {
  params: { castId: string };
}) {
  const managerId = await getCurrentManagerId();
  const cast = mockCasts.find((c) => c.id === params.castId);
  if (!cast) notFound();

  const [stats, goal] = await Promise.all([
    getCastStatsData(params.castId),
    getCastGoal(params.castId),
  ]);

  const coachingRoomId = `coaching_${managerId}_${params.castId}`;

  const setterCast = goal.setBy
    ? mockCasts.find((c) => c.id === goal.setBy)
    : null;

  const castCustomers = mockCustomers.filter(
    (c) => c.cast_id === params.castId,
  );

  return (
    <div className="animate-fade-in">
      <PageHeader title={`${cast.name}さん`} subtitle="キャスト" showBack />

      <div className="px-5 pt-4 pb-6 space-y-5">
        {/* Monthly stats */}
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard
            label="今月の売上"
            value={Math.round(cast.monthly_sales / 10000)}
            unit="万円"
            tone="rose"
          />
          <StatCard
            label="再来店率"
            value={Math.round(cast.repeat_rate * 100)}
            unit="%"
            tone="rose"
            icon={<Heart size={12} className="text-blush-dark" />}
          />
          <StatCard
            label="新規顧客"
            value={stats.monthly.newCustomerCount}
            unit="人"
            tone="amethyst"
          />
        </div>

        <Card className="p-3 flex items-center justify-between">
          <span className="text-body-sm text-ink-soft">連絡達成率</span>
          <span className="text-body-md text-ink font-medium">
            {Math.round(stats.monthly.followRate * 100)}%
          </span>
        </Card>

        {/* Goal setting */}
        <GoalSettingCard
          castId={params.castId}
          castName={cast.name}
          goal={goal}
          setterName={setterCast?.name}
        />

        {/* Coaching chat link */}
        <Link
          href={`/cast/chat/${coachingRoomId}`}
          className="flex items-center justify-between p-3 rounded-btn border border-emerald/30 bg-emerald/5 hover:bg-emerald/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-emerald shrink-0" />
            <div>
              <div className="text-body-sm font-medium text-ink">
                指導ノートを開く
              </div>
              <div className="text-[10px] text-ink-mute mt-0.5">
                チャットで指導メモを送る
              </div>
            </div>
          </div>
          <ChevronRight size={14} className="text-ink-mute shrink-0" />
        </Link>

        {/* Customers */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-display-sm text-ink">担当のお客様</h2>
            <span className="text-label-sm text-ink-mute">
              {castCustomers.length}人
            </span>
          </div>
          {castCustomers.length === 0 ? (
            <Card className="p-4 text-center text-body-sm text-ink-mute">
              担当しているお客様はいません
            </Card>
          ) : (
            castCustomers.map((c) => (
              <Link
                key={c.id}
                href={`/mama/customers/${c.id}`}
                className="block active:scale-[0.99] transition-transform"
              >
                <Card className="p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-pearl-soft flex items-center justify-center shrink-0">
                    <User size={14} className="text-ink-soft" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <span className="text-body-sm font-medium text-ink truncate">
                        {formatCustomerName(c.name)}
                      </span>
                      <span className="text-[10px] text-ink-mute shrink-0 ml-2">
                        {c.category === "vip"
                          ? "VIP"
                          : c.category === "new"
                            ? "新規"
                            : "常連"}
                      </span>
                    </div>
                    {c.job && (
                      <div className="text-[10px] text-ink-mute truncate">
                        {c.job}
                      </div>
                    )}
                  </div>
                  <ChevronRight size={14} className="text-ink-mute" />
                </Card>
              </Link>
            ))
          )}
        </section>

        {/* Cancelled douhans */}
        <CancelledDouhanSection
          castId={params.castId}
          customers={mockCustomers}
        />

        <div className="text-center pt-2">
          <Link
            href={`/cast/customers`}
            className="inline-flex items-center gap-1 text-[11px] text-ink-mute underline underline-offset-2"
          >
            <Calendar size={10} />
            詳細な顧客カルテはキャスト画面から閲覧
          </Link>
        </div>
      </div>
    </div>
  );
}
