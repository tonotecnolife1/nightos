import Link from "next/link";
import { Bookmark, Star, Users } from "lucide-react";
import { StatCard } from "@/components/nightos/stat-card";
import { CastHomeHero } from "./components/cast-home-hero";
import { SakuraMamaCard } from "./components/sakura-mama-card";
import { FollowTargetList } from "./components/follow-target-list";
import { StoreMessageBanner } from "./components/store-message-banner";
import { VisitNotificationPoller } from "./components/visit-notification-poller";
import type { CastHomeData, Customer } from "@/types/nightos";

interface Props {
  data: CastHomeData;
  storeMessages: { id: string; message: string; sent_at: string }[];
  customers: Customer[];
}

function formatDateLabel(date: Date): string {
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return `${date.getMonth() + 1}月${date.getDate()}日 (${days[date.getDay()]})`;
}

export function CastHomeCabaret({ data, storeMessages }: Props) {
  const repeatPct = Math.round(data.summary.repeatRate * 100);
  const dateLabel = formatDateLabel(new Date());
  const hasNotification = storeMessages.length > 0;

  return (
    <div className="relative min-h-screen bg-pearl pb-28">
      <VisitNotificationPoller castId={data.cast.id} />

      <CastHomeHero
        castId={data.cast.id}
        customers={[]}
        dateLabel={dateLabel}
        hasNotification={hasNotification}
      />

      <main className="px-5 flex flex-col gap-6">
        {/* KPI を hero の seam にオーバーラップ。tap → /cast/stats へ */}
        <div className="-mt-9 grid grid-cols-3 gap-2.5">
          <Link href="/cast/stats#nominations" className="block">
            <StatCard
              label="指名"
              value={data.summary.nominationCount}
              unit="本"
              icon={<Bookmark size={11} className="text-gold" />}
              tone="rose"
              className="h-full cursor-pointer hover:shadow-warm hover:-translate-y-px transition will-change-transform"
            />
          </Link>
          <Link href="/cast/stats#repeat" className="block">
            <StatCard
              label="再来店率"
              value={repeatPct}
              unit="%"
              icon={<Star size={11} className="text-gold" />}
              tone="amethyst"
              className="h-full cursor-pointer hover:shadow-warm hover:-translate-y-px transition will-change-transform"
            />
          </Link>
          <Link href="/cast/stats#new" className="block">
            <StatCard
              label="新規"
              value={data.summary.newCustomerCount}
              unit="人"
              icon={<Users size={11} className="text-gold" />}
              tone="wine"
              className="h-full cursor-pointer hover:shadow-warm hover:-translate-y-px transition will-change-transform"
            />
          </Link>
        </div>

        <SakuraMamaCard castId={data.cast.id} />

        <StoreMessageBanner
          castId={data.cast.id}
          initialMessages={storeMessages}
        />

        {/* ── Priority Stack ── */}
        <section className="flex flex-col gap-3.5">
          <header className="relative flex items-baseline justify-between pl-3.5 pr-0.5">
            <span
              aria-hidden
              className="absolute left-0 top-1 bottom-1 w-[3px] rounded"
              style={{ background: "var(--v5-champ-gold)" }}
            />
            <div className="flex items-baseline gap-2.5">
              <h2 className="m-0 font-serif text-[19px] leading-[1.3] font-medium tracking-[0.04em] text-ink">
                今日連絡したいお客様
              </h2>
              <span className="font-display text-[18px] leading-none tabular-nums tracking-[0.04em] text-wine-deep">
                {data.targets.length} 名
              </span>
            </div>
            <span className="text-label-xs tracking-luxe text-ink-mute uppercase">
              優先度順
            </span>
          </header>
          <FollowTargetList targets={data.targets} />
        </section>
      </main>
    </div>
  );
}
