import { PageHeader } from "@/components/nightos/page-header";
import { CustomerForm } from "@/features/customer-registration/components/customer-form";
import { buildDuplicateIndex } from "@/features/customer-registration/lib/duplicate-candidates";
import { getCurrentCast } from "@/lib/nightos/auth";
import { mockCasts } from "@/lib/nightos/mock-data";
import {
  getAllCasts,
  getAllCustomers,
  getCustomersForCast,
} from "@/lib/nightos/supabase-queries";

export const dynamic = "force-dynamic";

export default async function CastNewCustomerPage() {
  const currentCast = (await getCurrentCast()) ?? mockCasts[0];

  // Limit the store's cast roster to ones that could show as manager
  // options, plus the referrer list to customers the cast already owns
  // (so they don't see unrelated people in the dropdown).
  // allStoreCustomers は重複登録チェック専用（最小情報に落として渡す）。
  const [allCasts, myCustomers, allStoreCustomers] = await Promise.all([
    getAllCasts(),
    getCustomersForCast(currentCast.id),
    getAllCustomers(),
  ]);

  const duplicateIndex = buildDuplicateIndex(allStoreCustomers, allCasts);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="お客様を追加"
        showBack
      />
      <div className="px-5 pt-4 pb-6">
        <CustomerForm
          casts={allCasts}
          existingCustomers={myCustomers}
          duplicateIndex={duplicateIndex}
          lockedCastId={currentCast.id}
          submitLabel="登録する"
          successTemplate="%name%さまを登録しました"
          successListHref="/cast/customers"
        />
      </div>
    </div>
  );
}
