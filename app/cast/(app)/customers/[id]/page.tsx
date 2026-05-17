import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarPlus, Wine } from "lucide-react";
import { PageHeader } from "@/components/nightos/page-header";
import { ActionButtons } from "@/features/customer-card/components/action-buttons";
import { ChangeManagerButton } from "@/features/customer-management/components/change-manager-button";
import { CustomerHeader } from "@/features/customer-card/components/customer-header";
import { CustomerStats } from "@/features/customer-card/components/customer-stats";
import { FunnelBadge } from "@/features/customer-card/components/funnel-badge";
import { LineExchangeButton } from "@/features/customer-card/components/line-exchange-button";
import { LineImportPanel } from "@/features/customer-card/components/line-import-panel";
import { LineHistoryTimeline } from "@/features/customer-card/components/line-history-timeline";
import { MemoSection } from "@/features/customer-card/components/memo-section";
import { RefreshMemoButton } from "@/features/customer-card/components/refresh-memo-button";
import { StoreInfoSection } from "@/features/customer-card/components/store-info-section";
import { VisitHistory } from "@/features/customer-card/components/visit-history";
import { CustomerPhotoUpload } from "@/features/customer-card/components/customer-photo-upload";
import { CollapsibleSection } from "@/features/customer-card/components/collapsible-section";
import { AddToScheduleButton } from "@/features/cast-schedule/add-to-schedule-button";
import { getCurrentCastId } from "@/lib/nightos/auth";
import { mockCustomers } from "@/lib/nightos/mock-data";
import {
  getAllCasts,
  getCustomerContext,
  getScreenshotsForCustomer,
} from "@/lib/nightos/supabase-queries";

export default async function CustomerCardPage({
  params,
}: {
  params: { id: string };
}) {
  const castId = await getCurrentCastId();

  const [context, screenshots, allCasts] = await Promise.all([
    getCustomerContext(castId, params.id),
    getScreenshotsForCustomer(castId, params.id),
    getAllCasts(),
  ]);
  if (!context) notFound();

  // Resolve referrer name (if any) for the mini badge
  const customer = context.customer;
  const referrer = customer.referred_by_customer_id
    ? mockCustomers.find((c) => c.id === customer.referred_by_customer_id)
    : null;

  return (
    <div className="animate-fade-in">
      <PageHeader title="顧客カルテ" showBack />
      <div className="px-5 pt-4 pb-6 space-y-5">
        <CustomerHeader customer={customer} />

        {/* Funnel stage + referrer info */}
        <div className="flex items-center gap-2 flex-wrap">
          <FunnelBadge stage={customer.funnel_stage ?? "store_only"} />
          {referrer && (
            <span className="text-[10px] text-ink-muted">
              ご本人: {referrer.name}さま
            </span>
          )}
          <a
            href={`/store/customers/new?referrer=${customer.id}`}
            className="ml-auto text-[10px] text-amethyst-dark underline underline-offset-2"
          >
            + この方のお連れ様として登録
          </a>
        </div>

        <CustomerPhotoUpload customerId={customer.id} customerName={customer.name} />

        {/* Manager + change button */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] text-ink-secondary">
          <span>
            管理:{" "}
            <span className="text-ink font-medium">
              {allCasts.find((c) => c.id === customer.manager_cast_id)?.name ?? "—"}
            </span>
            {" / 担当: "}
            <span className="text-ink font-medium">
              {allCasts.find((c) => c.id === customer.cast_id)?.name ?? "—"}
            </span>
          </span>
          <ChangeManagerButton
            customerId={customer.id}
            customerName={customer.name}
            currentManagerId={customer.manager_cast_id ?? null}
            allCasts={allCasts}
            requesterCastId={castId}
            requesterName={allCasts.find((c) => c.id === castId)?.name ?? "キャスト"}
          />
        </div>

        <CustomerStats context={context} />

        {/* Quick-register shortcuts → store app */}
        <div className="flex gap-2">
          <Link
            href={`/store/visits/new?customerId=${customer.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-pill border border-ink/[0.12] bg-pearl-soft text-body-sm text-ink-secondary hover:border-gold/40 hover:bg-pearl-warm transition"
          >
            <CalendarPlus size={14} />
            来店を記録
          </Link>
          <Link
            href={`/store/bottles/new?customerId=${customer.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-pill border border-ink/[0.12] bg-pearl-soft text-body-sm text-ink-secondary hover:border-gold/40 hover:bg-pearl-warm transition"
          >
            <Wine size={14} />
            ボトルを記録
          </Link>
        </div>

        <AddToScheduleButton
          castId={castId}
          customerId={customer.id}
          customerName={customer.name}
        />

        {/* LINE exchange action */}
        <LineExchangeButton
          customerId={customer.id}
          castId={castId}
          initiallyExchanged={customer.funnel_stage === "line_exchanged"}
          initialExchangedAt={customer.line_exchanged_at ?? null}
        />

        {/* ── 来店履歴（折りたたみ） ── */}
        <div className="border-t border-ink/[0.06] pt-2">
          <CollapsibleSection title="来店履歴" defaultOpen>
            <VisitHistory visits={context.visits} />
          </CollapsibleSection>
        </div>

        {/* ── 店舗情報（折りたたみ） ── */}
        <div className="border-t border-ink/[0.06] pt-2">
          <CollapsibleSection title="店舗情報">
            <StoreInfoSection context={context} />
          </CollapsibleSection>
        </div>

        {/* ── メモ（折りたたみ） ── */}
        <div className="border-t border-ink/[0.06] pt-2">
          <CollapsibleSection title="メモ">
            <MemoSection customer={customer} memo={context.memo} />
            <RefreshMemoButton
              customerId={customer.id}
              castId={castId}
              current={{
                last_topic: context.memo?.last_topic ?? null,
                service_tips: context.memo?.service_tips ?? null,
                next_topics: context.memo?.next_topics ?? null,
              }}
            />
          </CollapsibleSection>
        </div>

        {/* ── LINE・連絡（折りたたみ） ── */}
        <div className="border-t border-ink/[0.06] pt-2">
          <CollapsibleSection title="LINE・連絡履歴">
            <LineImportPanel
              customer={customer}
              memo={context.memo}
              screenshots={screenshots}
            />
            <LineHistoryTimeline
              screenshots={screenshots}
              customerName={customer.name}
            />
          </CollapsibleSection>
        </div>

        <ActionButtons customerId={customer.id} />
      </div>
    </div>
  );
}
