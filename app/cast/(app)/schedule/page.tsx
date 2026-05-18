import { PageHeader } from "@/components/nightos/page-header";
import { ScheduleCalendar } from "@/features/schedule/components/schedule-calendar";
import { getCurrentCastId } from "@/lib/nightos/auth";
import { getCustomersForCast } from "@/lib/nightos/supabase-queries";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const castId = await getCurrentCastId();
  const customers = await getCustomersForCast(castId);

  return (
    <div className="animate-fade-in">
      <PageHeader title="スケジュール" />
      <div className="px-4 pt-3 pb-6">
        <ScheduleCalendar castId={castId} customers={customers} />
      </div>
    </div>
  );
}
