import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Hero } from "./components/v3/hero";
import { KpiRow } from "./components/v3/kpi-row";
import { SakuraMamaEntry } from "./components/v3/sakura-mama-entry";
import {
  FollowSectionHead,
  FollowTargetStack,
} from "./components/v3/follow-target-stack";
import { StoreMessageBanner } from "./components/store-message-banner";
import { VisitNotificationPoller } from "./components/visit-notification-poller";
import type { CastHomeData, Customer } from "@/types/nightos";

interface Props {
  data: CastHomeData;
  storeMessages: { id: string; message: string; sent_at: string }[];
  customers: Customer[];
}

export function CastHomeClub({ data, storeMessages }: Props) {
  return (
    <div className="relative" style={{ background: "#f1e9dd" }}>
      <VisitNotificationPoller castId={data.cast.id} />

      <Hero castName={data.cast.name} />

      <main
        className="px-5 flex flex-col"
        style={{ gap: 24, paddingBottom: 40 }}
      >
        {/* KPI overlaps the hero seam */}
        <div style={{ marginTop: -34 }}>
          <KpiRow summary={data.summary} />
        </div>

        {storeMessages.length > 0 && (
          <StoreMessageBanner
            castId={data.cast.id}
            initialMessages={storeMessages}
          />
        )}

        <SakuraMamaEntry />

        <section className="flex flex-col" style={{ gap: 14 }}>
          <FollowSectionHead
            title="今日連絡したいお客様"
            count={`${data.targets.length} 名`}
            sub="優先度順"
          />
          <FollowTargetStack targets={data.targets} />
        </section>
      </main>

      {/* FAB — 顧客新規登録 (1タップ) */}
      <Link
        href="/cast/customers/new"
        aria-label="お客様を新規登録"
        className="fixed z-50 inline-flex items-center justify-center bg-rose-gold-deep text-pearl-warm shadow-luxe"
        style={{
          right: 18,
          bottom: 96,
          width: 60,
          height: 60,
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.18)",
        }}
      >
        <UserPlus size={24} strokeWidth={1.8} />
      </Link>
    </div>
  );
}
