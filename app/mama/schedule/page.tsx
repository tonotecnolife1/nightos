import { PageHeader } from "@/components/nightos/page-header";
import { TeamScheduleCalendar } from "@/features/schedule/components/team-schedule-calendar";
import { getCurrentManagerId } from "@/lib/nightos/auth";
import {
  getSubordinateCasts,
  getTeamCustomers,
} from "@/lib/nightos/supabase-queries";
import { MOCK_TODAY } from "@/lib/nightos/mock-data";

export const dynamic = "force-dynamic";

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function MamaSchedulePage() {
  const managerId = await getCurrentManagerId();
  const [teamCasts, teamCustomers] = await Promise.all([
    getSubordinateCasts(managerId),
    getTeamCustomers(managerId),
  ]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="チーム予定"
        subtitle="担当キャストの出勤・同伴を重ねて確認"
        showBack
        backHref="/mama/team"
      />
      <div className="px-4 pt-3 pb-6">
        <TeamScheduleCalendar
          managerId={managerId}
          casts={teamCasts.map((c) => ({ id: c.id, name: c.name }))}
          customers={teamCustomers}
          today={toYMD(MOCK_TODAY)}
        />
      </div>
    </div>
  );
}
