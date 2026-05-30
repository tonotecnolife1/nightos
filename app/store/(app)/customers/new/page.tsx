import { PageHeader } from "@/components/nightos/page-header";
import { CustomerForm } from "@/features/customer-registration/components/customer-form";
import {
  getAllCasts,
  getAllCustomers,
} from "@/lib/nightos/supabase-queries";

interface Props {
  searchParams: { referrer?: string };
}

export default async function NewCustomerPage({ searchParams }: Props) {
  const [casts, customers] = await Promise.all([
    getAllCasts(),
    getAllCustomers(),
  ]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="お客様登録" subtitle="約2分で完了" showBack />
      <div className="px-5 pt-4 pb-6">
        <CustomerForm
          casts={casts}
          existingCustomers={customers}
          initialReferrerId={searchParams.referrer}
        />
      </div>
    </div>
  );
}
