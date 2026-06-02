import { PageHeader } from "@/components/nightos/page-header";
import { NotificationsList } from "@/features/cast-home/components/notifications-list";
import { getCastNotifications } from "@/features/cast-home/notifications-data";
import { getCurrentCastId } from "@/lib/nightos/auth";

export const dynamic = "force-dynamic";

export default async function CastNotificationsPage() {
  const castId = await getCurrentCastId();
  const { messages, visits } = await getCastNotifications(castId);

  return (
    <div className="animate-fade-in min-h-screen bg-pearl">
      <PageHeader title="通知" showBack backHref="/cast/home" />
      <div className="px-4 pt-4 pb-24">
        <NotificationsList messages={messages} visits={visits} />
      </div>
    </div>
  );
}
