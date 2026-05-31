import { PageHeader } from "@/components/nightos/page-header";
import { ApprovalQueue } from "@/features/store-hub/components/approval-queue";
import { OwnerGuard } from "@/features/store-hub/components/owner-guard";

export default function StoreApprovalsPage() {
  return (
    <OwnerGuard>
      <div className="animate-fade-in">
        <PageHeader
          title="承認キュー"
          subtitle="係変更の承認待ち"
          showBack
        />
        <div className="px-5 pt-4 pb-6">
          <ApprovalQueue />
        </div>
      </div>
    </OwnerGuard>
  );
}
