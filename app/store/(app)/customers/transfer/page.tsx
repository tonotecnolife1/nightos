import { PageHeader } from "@/components/nightos/page-header";
import { CustomerTransferForm } from "@/features/store-customers/components/customer-transfer-form";
import { getAllCasts, getAllCustomers } from "@/lib/nightos/supabase-queries";

export default async function CustomerTransferPage() {
  const [customers, casts] = await Promise.all([
    getAllCustomers(),
    getAllCasts(),
  ]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="担当移管"
        subtitle="キャスト間のお客様引き継ぎ"
        showBack
      />
      <div className="px-5 pt-4 pb-6">
        <CustomerTransferForm customers={customers} casts={casts} />
      </div>
    </div>
  );
}
