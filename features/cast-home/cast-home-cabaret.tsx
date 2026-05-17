import Link from "next/link";
import { Bookmark, Star, UserCircle, Users } from "lucide-react";
import { StatCard } from "@/components/nightos/stat-card";
import { RuriMamaEntryCard } from "./components/ruri-mama-entry-card";
import { FollowTargetList } from "./components/follow-target-list";
import { MorningBriefing } from "./components/morning-briefing";
import { StoreMessageBanner } from "./components/store-message-banner";
import { VisitNotificationPoller } from "./components/visit-notification-poller";
import type { CastHomeData } from "@/types/nightos";

interface Props {
  data: CastHomeData;
  storeMessages: { id: string; message: string; sent_at: string }[];
}

export function CastHomeCabaret({ data, storeMessages }: Props) {
  const repeatPct = Math.round(data.summary.repeatRate * 100);

  return (
    <div>
      <VisitNotificationPoller castId={data.cast.id} />

      {/* ── Hero ── */}
      <div className="relative bg-gradient-hero px-5 pt-4 pb-4 flex items-center justify-between">
        <h1 className="font-display text-[20px] leading-[1.2] font-medium tracking-wide text-ink">
          ホーム
        </h1>
        <Link
          href="/cast/my"
          aria-label="マイページ"
          className="w-9 h-9 rounded-full bg-pearl-warm/60 backdrop-blur-sm flex items-center justify-center hover:bg-pearl-warm/80 transition shadow-soft"
        >
          <UserCircle size={22} className="text-ink-secondary" />
        </Link>
      </div>

      <div className="px-5 pt-5 pb-8 space-y-5">
        <StoreMessageBanner
          castId={data.cast.id}
          initialMessages={storeMessages}
        />

        {/* ── 指名 KPI ── */}
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard
            label="今月の指名"
            value={data.summary.nominationCount}
            unit="本"
            icon={<Bookmark size={12} className="text-gold" />}
            tone="rose"
          />
          <StatCard
            label="再来店率"
            value={repeatPct}
            unit="%"
            icon={<Star size={12} className="text-gold" />}
            tone="rose"
          />
          <StatCard
            label="今月の新規"
            value={data.summary.newCustomerCount}
            unit="人"
            icon={<Users size={12} className="text-gold" />}
            tone="amethyst"
          />
        </div>

        <MorningBriefing castId={data.cast.id} />

        <RuriMamaEntryCard />

        {/* ── フォロー対象 ── */}
        <section className="space-y-3">
          <header className="flex items-baseline justify-between px-1">
            <h2 className="font-display text-[20px] leading-tight font-medium text-ink">
              今日連絡したいお客様
            </h2>
            <span className="text-[11px] text-ink-muted">
              {data.targets.length}人
            </span>
          </header>
          <FollowTargetList targets={data.targets} />
        </section>

      </div>
    </div>
  );
}
