import Link from "next/link";
import { Heart, MessageCircle, TrendingUp, UserPlus } from "lucide-react";
import { StatCard } from "@/components/nightos/stat-card";
import { CastHomeHero } from "./components/cast-home-hero";
import { RuriMamaEntryCard } from "./components/ruri-mama-entry-card";
import { FollowTargetList } from "./components/follow-target-list";
import { MorningBriefing } from "./components/morning-briefing";
import { StoreMessageBanner } from "./components/store-message-banner";
import { VisitNotificationPoller } from "./components/visit-notification-poller";
import { DouhanTracker } from "./components/douhan-tracker";
import { DouhanQuickAdd } from "./components/douhan-quick-add";
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

export function CastHomeClub({ data, storeMessages, customers }: Props) {
  const { summary } = data;
  const repeatPct = Math.round(summary.repeatRate * 100);
  const dateLabel = formatDateLabel(new Date());
  const hasNotification = storeMessages.length > 0;

  return (
    <div className="relative min-h-screen bg-pearl pb-28">
      <VisitNotificationPoller castId={data.cast.id} />

      <CastHomeHero
        castId={data.cast.id}
        customers={customers}
        dateLabel={dateLabel}
        hasNotification={hasNotification}
      />

      <main className="px-5 flex flex-col gap-6">
        {/* KPI を hero の seam にオーバーラップさせシームをブリッジ
           (StoreMessageBanner より先に置いて橋渡しを成立させる) */}
        <div className="-mt-9 grid grid-cols-3 gap-2.5">
          <StatCard
            label="今月の売上"
            value={Math.round(summary.monthlySales / 10000)}
            unit="万円"
            icon={<TrendingUp size={11} className="text-gold" />}
            tone="rose"
          />
          <Link href="/cast/stats#repeat" className="block">
            <StatCard
              label="再来店率"
              value={repeatPct}
              unit="%"
              icon={<Heart size={11} className="text-gold" />}
              tone="amethyst"
              className="h-full cursor-pointer hover:shadow-float hover:-translate-y-px transition will-change-transform"
            />
          </Link>
          <Link href="/cast/customers" className="block">
            <StatCard
              label="フォロー対象"
              value={summary.followTargetCount}
              unit="人"
              icon={<MessageCircle size={11} className="text-gold" />}
              tone="wine"
              className="h-full cursor-pointer hover:shadow-float hover:-translate-y-px transition will-change-transform"
            />
          </Link>
        </div>

        <DouhanTracker customers={customers} />

        <RuriMamaEntryCard />

        <StoreMessageBanner
          castId={data.cast.id}
          initialMessages={storeMessages}
        />

        <MorningBriefing castId={data.cast.id} />

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

        <DouhanQuickAdd customers={customers} />
      </main>

      {/* V5 FAB: wine-deep solid + multi-layer champagne-gold ring */}
      <Link
        href="/cast/customers/new"
        className="fixed bottom-24 right-5 z-50 w-[60px] h-[60px] rounded-full bg-wine-deep text-pearl-light flex items-center justify-center active:scale-95 transition-all"
        aria-label="お客様を新規登録"
        style={{
          boxShadow:
            "0 0 0 1px rgba(235,217,168,0.65), 0 0 0 4px #5e3838, 0 0 0 5px rgba(235,217,168,0.40), var(--v5-shadow-luxe)",
        }}
      >
        <UserPlus size={24} strokeWidth={1.8} />
      </Link>
    </div>
  );
}
