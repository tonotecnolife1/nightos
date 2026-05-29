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
import { LineCommunicationSummary } from "@/features/customer-card/components/line-communication-summary";
import { MemoSection } from "@/features/customer-card/components/memo-section";
import { RefreshMemoButton } from "@/features/customer-card/components/refresh-memo-button";
import { StoreInfoSection } from "@/features/customer-card/components/store-info-section";
import { VisitHistory } from "@/features/customer-card/components/visit-history";
import { CustomerPhotoUpload } from "@/features/customer-card/components/customer-photo-upload";
import { CollapsibleSection } from "@/features/customer-card/components/collapsible-section";
import { getCurrentCastId, getCurrentVenueType } from "@/lib/nightos/auth";
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

  const [context, allCasts, venueType] = await Promise.all([
    getCustomerContext(castId, params.id),
    getAllCasts(),
    getCurrentVenueType(),
  ]);
  if (!context) notFound();
  const isCabaret = venueType === "cabaret";
  const isManager = context.customer.manager_cast_id === castId;
  const screenshots = await getScreenshotsForCustomer(castId, params.id, isManager);

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
            className="ml-auto text-[10px] text-roseGold-deep underline underline-offset-2"
          >
            + この方のお連れ様として登録
          </a>
        </div>

        <CustomerPhotoUpload customerId={customer.id} customerName={customer.name} />

        {/* Manager + change button (club only) */}
        {!isCabaret && (
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
        )}

        <CustomerStats context={context} />

        {/* Quick-register shortcuts → store app */}
        <div className="flex gap-2">
          <Link
            href={`/store/visits/new?customerId=${customer.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-pill border border-roseGold-deep/70 bg-transparent text-body-sm font-medium text-roseGold-deep hover:bg-roseGold-soft/30 active:scale-[0.98] transition"
          >
            <CalendarPlus size={14} />
            来店を記録
          </Link>
          <Link
            href={`/store/bottles/new?customerId=${customer.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-pill border border-gold/40 bg-champagne-soft/60 text-body-sm font-medium text-gold-deep hover:bg-champagne-soft/80 active:scale-[0.98] transition"
          >
            <Wine size={14} />
            ボトルを記録
          </Link>
        </div>

        {/* LINE exchange action */}
        <LineExchangeButton
          customerId={customer.id}
          castId={castId}
          initiallyExchanged={customer.funnel_stage === "line_exchanged"}
          initialExchangedAt={customer.line_exchanged_at ?? null}
        />

        {/* ── 来店・店舗情報（折りたたみ） ── */}
        <div className="border-t border-ink/[0.06] pt-2">
          <CollapsibleSection title="来店・店舗情報" defaultOpen>
            <VisitHistory visits={context.visits} />
            <StoreInfoSection context={context} />
          </CollapsibleSection>
        </div>

        {/* ── メモ・AI提案（折りたたみ） ── */}
        <div className="border-t border-ink/[0.06] pt-2">
          <CollapsibleSection title="メモ・AI提案">
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
            <LineCommunicationSummary
              customerId={customer.id}
              customerName={customer.name}
              castName={allCasts.find((c) => c.id === castId)?.name ?? "キャスト"}
              screenshots={screenshots}
            />
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
