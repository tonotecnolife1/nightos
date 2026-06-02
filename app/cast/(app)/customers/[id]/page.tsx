import { notFound } from "next/navigation";
import { PageHeader } from "@/components/nightos/page-header";
import { ActionButtons } from "@/features/customer-card/components/action-buttons";
import { BusinessCardSection } from "@/features/customer-card/components/business-card-section";
import { ChangeManagerButton } from "@/features/customer-management/components/change-manager-button";
import { CustomerHeader } from "@/features/customer-card/components/customer-header";
import { CustomerInfoSection } from "@/features/customer-card/components/customer-info-section";
import { CustomerPhotoUpload } from "@/features/customer-card/components/customer-photo-upload";
import { ReferrerSection } from "@/features/customer-card/components/referrer-section";
import { LineCommunicationSummary } from "@/features/customer-card/components/line-communication-summary";
import { LineExchangeButton } from "@/features/customer-card/components/line-exchange-button";
import { LineHistoryTimeline } from "@/features/customer-card/components/line-history-timeline";
import { LineImportPanel } from "@/features/customer-card/components/line-import-panel";
import { MemoSection } from "@/features/customer-card/components/memo-section";
import { RefreshMemoButton } from "@/features/customer-card/components/refresh-memo-button";
import { VisitInfoSection } from "@/features/customer-card/components/visit-info-section";
import { SectionHeader } from "@/features/customer-card/components/section-header";
import { CollapsibleSection } from "@/features/customer-card/components/collapsible-section";
import { HelpRosterSection } from "@/features/customer-card/components/help-roster-section";
import { ProfileProposalsInline } from "@/features/customer-card/components/profile-proposals-inline";
import { aggregateHelpCastsByCustomer } from "@/lib/nightos/master-help-split";
import {
  canEditCustomerDirectly,
  getCustomerRelationship,
  resolveApproverCastId,
} from "@/lib/nightos/customer-relationship";
import { getCurrentCastId, getCurrentVenueType } from "@/lib/nightos/auth";
import {
  getAllCasts,
  getAllCustomers,
  getCustomerContext,
  getScreenshotsForCustomer,
} from "@/lib/nightos/supabase-queries";

export default async function CustomerCardPage({
  params,
}: {
  params: { id: string };
}) {
  const castId = await getCurrentCastId();

  const [context, allCasts, venueType, allCustomers] = await Promise.all([
    getCustomerContext(castId, params.id),
    getAllCasts(),
    getCurrentVenueType(),
    getAllCustomers(),
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

  // 紹介者候補: 自分自身を除く店舗の全顧客（承認者の解決に担当 cast を持たせる）
  const referrerCandidates = allCustomers
    .filter((c) => c.id !== customer.id)
    .map((c) => ({
      id: c.id,
      name: c.name,
      managerCastId: c.manager_cast_id ?? c.cast_id ?? null,
    }));

  // 関係性（マスター / 担当 / ヘルプ）— 編集 vs 提案の分岐に使う
  const relationship = getCustomerRelationship(customer, castId);
  const canEdit = canEditCustomerDirectly(relationship);
  const approverCastId = resolveApproverCastId(customer);
  const castName = allCasts.find((c) => c.id === castId)?.name ?? "キャスト";
  const helpRoster = aggregateHelpCastsByCustomer({
    customer,
    visits: context.visits,
    allCasts,
  });

  return (
    <div className="animate-fade-in">
      <PageHeader title="お客様カルテ" showBack />
      <div className="px-5 pt-4 pb-6 space-y-5">
        {/* ── Header ─────────────────────────────────── */}
        <CustomerHeader customer={customer} />

        {/* 紹介者（表示 + 変更は紹介者の担当の承認が必要） */}
        <ReferrerSection
          customerId={customer.id}
          customerName={customer.name}
          initialReferrerId={customer.referred_by_customer_id ?? null}
          candidates={referrerCandidates}
          allCasts={allCasts}
          currentCastId={castId}
          currentCastName={castName}
        />

        <CustomerPhotoUpload
          customerId={customer.id}
          customerName={customer.name}
        />

        {/* Manager / change button (club only) */}
        {!isCabaret && (
          <div className="flex items-center gap-2 flex-wrap text-[11px] text-ink-soft">
            <span>
              担当:{" "}
              <span className="text-ink font-medium">
                {allCasts.find((c) => c.id === customer.manager_cast_id)?.name ??
                  allCasts.find((c) => c.id === customer.cast_id)?.name ??
                  "—"}
              </span>
              {customer.cast_id &&
                customer.manager_cast_id &&
                customer.cast_id !== customer.manager_cast_id && (
                  <>
                    {" / ヘルプ: "}
                    <span className="text-ink font-medium">
                      {allCasts.find((c) => c.id === customer.cast_id)?.name ??
                        "—"}
                    </span>
                  </>
                )}
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

        {/* ── §1 顧客情報 ── 覚えたら見ない情報なのでタップで開閉 ── */}
        <div className="border-t border-line pt-4">
          <CustomerInfoSection
            customer={customer}
            canEditDirectly={canEdit}
            requesterCastId={castId}
            requesterName={castName}
            approverCastId={approverCastId}
          />
        </div>

        {/* 変更提案（承認者には承認/却下、提案者には進捗） */}
        <ProfileProposalsInline
          customerId={customer.id}
          canApprove={canEdit}
          approverName={castName}
        />

        {/* 名刺（登録導線 + 登録済みの確認） */}
        <div className="border-t border-ink/[0.06] pt-2">
          <CollapsibleSection title="名刺">
            <BusinessCardSection
              customerId={customer.id}
              customerName={customer.name}
            />
          </CollapsibleSection>
        </div>

        {/* ── §2 来店情報 ─────────────────────────────── */}
        <div className="border-t border-ink/[0.06] pt-4">
          <VisitInfoSection context={context} />
        </div>

        {/* 歴代ヘルプ（来店ごとに入れ替わる複数ヘルプ） */}
        {helpRoster.helps.length > 0 && (
          <div className="border-t border-ink/[0.06] pt-4">
            <HelpRosterSection helps={helpRoster.helps} />
          </div>
        )}

        {/* ── §3 連絡履歴（LINE・連絡）── 重要なので常時表示（畳まない）── */}
        <div className="border-t border-ink/[0.06] pt-4 space-y-4">
          <SectionHeader title="LINE・連絡" />
          <LineExchangeButton
            customerId={customer.id}
            castId={castId}
            initiallyExchanged={customer.funnel_stage === "line_exchanged"}
            initialExchangedAt={customer.line_exchanged_at ?? null}
          />
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
        </div>

        {/* ── §4 個人メモ ── 重要なので常時表示（畳まない）──── */}
        {/* 見出しは MemoCard（"個人メモ"）が持つので SectionHeader は不要 */}
        <div className="border-t border-ink/[0.06] pt-4 space-y-4">
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
        </div>

        <ActionButtons customerId={customer.id} />
      </div>
    </div>
  );
}
