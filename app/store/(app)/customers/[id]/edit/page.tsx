import { notFound } from "next/navigation";
import { PageHeader } from "@/components/nightos/page-header";
import { EditCustomerForm } from "@/features/store-customers/components/edit-customer-form";
import {
  getAllCasts,
  getCustomerById,
} from "@/lib/nightos/supabase-queries";

export default async function EditCustomerPage({
  params,
}: {
  params: { id: string };
}) {
  const [customer, casts] = await Promise.all([
    getCustomerById(params.id),
    getAllCasts(),
  ]);
  if (!customer) notFound();

  return (
    <div className="animate-fade-in">
      <PageHeader title="お客様編集" subtitle={customer.name} showBack />
      <div className="px-5 pt-4 pb-6">
        <EditCustomerForm customer={customer} casts={casts} />
      </div>
    </div>
  );
}
