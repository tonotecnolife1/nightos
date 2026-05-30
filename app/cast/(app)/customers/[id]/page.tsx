import { notFound } from "next/navigation";
import { PageHeader } from "@/components/nightos/page-header";
import { ActionButtons } from "@/features/customer-card/components/action-buttons";
import { ChangeManagerButton } from "@/features/customer-management/components/change-manager-button";
import { CustomerHeader } from "@/features/customer-card/components/customer-header";
import { CustomerInfoSection } from "@/features/customer-card/components/customer-info-section";
import { CustomerPhotoUpload } from "@/features/customer-card/components/customer-photo-upload";
import { FunnelBadge } from "@/features/customer-card/components/funnel-badge";
import { LineCommunicationSummary } from "@/features/customer-card/components/line-communication-summary";
import { LineExchangeButton } from "@/features/customer-card/components/line-exchange-button";
import { LineHistoryTimeline } from "@/features/customer-card/components/line-history-timeline";
import { LineImportPanel } from "@/features/customer-card/components/line-import-panel";
import { MemoSection } from "@/features/customer-card/components/memo-section";
import { RefreshMemoButton } from "@/features/customer-card/components/refresh-memo-button";
import { VisitInfoSection } from "@/features/customer-card/components/visit-info-section";
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
  const screenshots = await getScreenshotsForCustomer(
    castId,
    params.id,
    isManager,
  );

  const customer = context.customer;
  const referrer = customer.referred_by_customer_id
    ? mockCustomers.find((c) => c.id === customer.referred_by_customer_id)
    : null;

  return (
    <div className="animate-fade-in">
      <PageHeader title="顧客カルテ" showBack />
      <div className="px-5 pt-4 pb-6 space-y-5">
        {/* ── Header ─────────────────────────────────── */}
        <CustomerHeader customer={customer} />

        {/* Funnel + referrer */}
        <div className="flex items-center gap-2 flex-wrap">
          <FunnelBadge stage={customer.funnel_stage ?? "store_only"} />
          {referrer && (
            <span className="text-[10px] text-ink-mute">
              ご本人: {referrer.name}さま
            </span>
          )}
          <a
            href={`/store/customers/new?referrer=${customer.id}`}
            className="ml-auto text-[10px] text-wine-deep underline underline-offset-2"
          >
            + この方のお連れ様として登録
          </a>
        </div>

        <CustomerPhotoUpload
          customerId={customer.id}
          customerName={customer.name}
        />

        {/* Manager / change button (club only) */}
        {!isCabaret && (
          <div className="flex items-center gap-2 flex-wrap text-[11px] text-ink-soft">
            <span>
              管理:{" "}
              <span className="text-ink font-medium">
                {allCasts.find((c) => c.id === customer.manager_cast_id)?.name ??
                  "—"}
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
              requesterName={
                allCasts.find((c) => c.id === castId)?.name ?? "キャスト"
              }
            />
          </div>
        )}

        {/* ── §1 顧客情報 ─────────────────────────────── */}
        <div className="border-t border-line pt-4">
          <CustomerInfoSection customer={customer} />
        </div>

        {/* ── §2 来店情報 ─────────────────────────────── */}
        <div className="border-t border-ink/[0.06] pt-4">
          <VisitInfoSection context={context} />
        </div>

        {/* ── §3 その他メモ ──────────────────────────── */}
        <div className="border-t border-ink/[0.06] pt-2">
          <CollapsibleSection title="その他メモ">
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

        {/* ── §4 LINE・連絡 ──────────────────────────── */}
        <div className="border-t border-ink/[0.06] pt-2">
          <CollapsibleSection title="LINE・連絡">
            <LineExchangeButton
              customerId={customer.id}
              castId={castId}
              initiallyExchanged={customer.funnel_stage === "line_exchanged"}
              initialExchangedAt={customer.line_exchanged_at ?? null}
            />
            <LineCommunicationSummary
              customerId={customer.id}
              customerName={customer.name}
              castName={
                allCasts.find((c) => c.id === castId)?.name ?? "キャスト"
              }
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
