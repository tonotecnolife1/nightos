import { Users } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { PageHeader } from "@/components/nightos/page-header";
import { StatCard } from "@/components/nightos/stat-card";
import { TeamPaceAlert } from "@/features/mama-home/components/team-pace-alert";
import { CancellationAlert } from "@/features/mama-home/components/cancellation-alert";
import { UpcomingDouhanList } from "@/features/team-management/components/upcoming-douhan-list";
import { CoachingRemindersCard } from "@/features/team-management/components/coaching-reminders-card";
import { CastListShell } from "@/features/team-management/components/cast-list-shell";
import { getCurrentManagerId } from "@/lib/nightos/auth";
import {
  getSubordinateCasts,
  getTeamCustomers,
} from "@/lib/nightos/supabase-queries";
import { formatCurrency } from "@/lib/utils";
import { calculateDouhanPaceForAll } from "@/lib/nightos/douhan-pace";
import { MOCK_TODAY, mockDouhans } from "@/lib/nightos/mock-data";

export default async function MamaTeamPage() {
  const managerId = await getCurrentManagerId();
  const [teamCasts, teamCustomers] = await Promise.all([
    getSubordinateCasts(managerId),
    getTeamCustomers(managerId),
  ]);

  const totalSales = teamCasts.reduce((s, c) => s + c.monthly_sales, 0);
  const avgRepeat =
    teamCasts.length > 0
      ? teamCasts.reduce((s, c) => s + c.repeat_rate, 0) / teamCasts.length
      : 0;

  const paceList = calculateDouhanPaceForAll({
    casts: teamCasts,
    douhans: mockDouhans,
    today: MOCK_TODAY,
  });

  return (
    <div className="animate-fade-in">
      <PageHeader title="メンバー管理" subtitle="キャスト・顧客の動き" showBack />

      <div className="px-5 pt-4 pb-6 space-y-5">
        {/* Tonight's summary */}
        <section className="space-y-2">
          <h2 className="text-display-sm text-ink">今夜のサマリー</h2>
          <TeamPaceAlert paceList={paceList} />
          <CancellationAlert teamCasts={teamCasts} />
          <UpcomingDouhanList
            teamCasts={teamCasts}
            douhans={mockDouhans}
            customers={teamCustomers}
            today={MOCK_TODAY}
          />
          <CoachingRemindersCard
            leaderId={managerId}
            teamCasts={teamCasts}
            today={MOCK_TODAY}
          />
        </section>

        {/* Team totals */}
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard
            label="売上合計"
            value={formatCurrency(totalSales).replace("¥", "")}
            unit="円"
            tone="rose"
          />
          <StatCard
            label="メンバー人数"
            value={teamCasts.length}
            unit="人"
            tone="amethyst"
            icon={<Users size={12} className="text-amethyst-dark" />}
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Card className="p-3 flex items-center justify-between">
            <span className="text-body-sm text-ink-soft">お客様合計</span>
            <span className="text-body-md text-ink font-medium">
              {teamCustomers.length}人
            </span>
          </Card>
          <Card className="p-3 flex items-center justify-between">
            <span className="text-body-sm text-ink-soft">平均リピート</span>
            <span className="text-body-md text-ink font-medium">
              {Math.round(avgRepeat * 100)}%
            </span>
          </Card>
        </div>

        {/* Cast list — client shell with sort/search */}
        <CastListShell
          teamCasts={teamCasts}
          teamCustomers={teamCustomers}
          paceList={paceList}
        />
      </div>
    </div>
  );
}
