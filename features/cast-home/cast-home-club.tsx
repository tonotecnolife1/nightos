import Link from "next/link";
import { CalendarDays, UserCircle, UserPlus } from "lucide-react";
import { SummaryCards } from "./components/summary-cards";
import { RuriMamaEntryCard } from "./components/ruri-mama-entry-card";
import { FollowTargetList } from "./components/follow-target-list";
import { MorningBriefing } from "./components/morning-briefing";
import { StoreMessageBanner } from "./components/store-message-banner";
import { VisitNotificationPoller } from "./components/visit-notification-poller";
import { DouhanTracker } from "./components/douhan-tracker";
import type { CastHomeData } from "@/types/nightos";
import type { Customer } from "@/types/nightos";

interface Props {
  data: CastHomeData;
  storeMessages: { id: string; message: string; sent_at: string }[];
  customers: Customer[];
}

export function CastHomeClub({ data, storeMessages, customers }: Props) {
  return (
    <div className="relative">
      <VisitNotificationPoller castId={data.cast.id} />

      {/* ── Hero ── */}
      <div className="relative bg-gradient-hero px-5 pt-4 pb-4 flex items-center justify-between">
        <h1 className="font-display text-[20px] leading-[1.2] font-medium tracking-wide text-ink">
          ホーム
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href="/cast/schedule"
            aria-label="スケジュール"
            className="w-9 h-9 rounded-full bg-pearl-warm/60 backdrop-blur-sm flex items-center justify-center hover:bg-pearl-warm/80 transition shadow-soft"
          >
            <CalendarDays size={18} className="text-ink-secondary" />
          </Link>
          <Link
            href="/cast/my"
            aria-label="マイページ"
            className="w-9 h-9 rounded-full bg-pearl-warm/60 backdrop-blur-sm flex items-center justify-center hover:bg-pearl-warm/80 transition shadow-soft"
          >
            <UserCircle size={22} className="text-ink-secondary" />
          </Link>
        </div>
      </div>

      <div className="px-5 pt-5 pb-8 space-y-5">
        <StoreMessageBanner
          castId={data.cast.id}
          initialMessages={storeMessages}
        />

        <SummaryCards summary={data.summary} />

        <DouhanTracker customers={customers} />

        <RuriMamaEntryCard />

        <MorningBriefing castId={data.cast.id} />

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

      {/* FAB: 顧客新規登録 (1タップ) */}
      <Link
        href="/cast/customers/new"
        className="fixed bottom-24 right-5 z-50 w-14 h-14 rounded-full bg-amethyst shadow-elevated-light flex items-center justify-center text-pearl hover:bg-amethyst-dark active:scale-95 transition-all"
        aria-label="お客様を新規登録"
      >
        <UserPlus size={22} />
      </Link>
    </div>
  );
}
