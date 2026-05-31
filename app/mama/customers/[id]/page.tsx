import { notFound } from "next/navigation";
import { PageHeader } from "@/components/nightos/page-header";
import { CustomerHeader } from "@/features/customer-card/components/customer-header";
import { CustomerStats } from "@/features/customer-card/components/customer-stats";
import { LineHistoryTimeline } from "@/features/customer-card/components/line-history-timeline";
import { MemoSection } from "@/features/customer-card/components/memo-section";
import { StoreInfoSection } from "@/features/customer-card/components/store-info-section";
import { VisitHistory } from "@/features/customer-card/components/visit-history";
import {
  getCustomerContext,
  getScreenshotsForCustomer,
} from "@/lib/nightos/supabase-queries";
import { mockCasts } from "@/lib/nightos/mock-data";

/**
 * Mama が配下の顧客を閲覧する画面。担当キャスト経由でコンテキスト取得。
 */
export default async function MamaCustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Find which cast this customer belongs to (mama sees team-wide)
  const customerOwner = findOwnerCastId(params.id);
  if (!customerOwner) notFound();

  const [context, screenshots] = await Promise.all([
    getCustomerContext(customerOwner, params.id),
    getScreenshotsForCustomer(customerOwner, params.id),
  ]);
  if (!context) notFound();

  const assignedCast = mockCasts.find((c) => c.id === customerOwner);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="お客様カルテ"
        subtitle={`係: ${assignedCast?.name ?? "不明"}さん`}
        showBack
      />
      <div className="px-5 pt-4 pb-6 space-y-5">
        <CustomerHeader customer={context.customer} />
        <CustomerStats context={context} />
        <VisitHistory visits={context.visits} />
        <StoreInfoSection context={context} />
        <MemoSection customer={context.customer} memo={context.memo} />
        <LineHistoryTimeline
          screenshots={screenshots}
          customerName={context.customer.name}
        />
      </div>
    </div>
  );
}

function findOwnerCastId(customerId: string): string | null {
  // Find customer across all casts by scanning mock data
  // In production this would be a DB query
  const { mockCustomers } = require("@/lib/nightos/mock-data") as {
    mockCustomers: Array<{ id: string; cast_id: string }>;
  };
  const found = mockCustomers.find((c) => c.id === customerId);
  return found?.cast_id ?? null;
}
