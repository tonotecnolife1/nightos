import { PageHeader } from "@/components/nightos/page-header";
import {
  TemplateWorkspace,
  type CustomerLookup,
} from "@/features/templates/components/template-workspace";
import { getCurrentCastId } from "@/lib/nightos/auth";
import {
  getCustomerContext,
  getCustomersForCast,
} from "@/lib/nightos/supabase-queries";

interface Props {
  searchParams: { customerId?: string };
}

export default async function TemplatesPage({ searchParams }: Props) {
  const castId = await getCurrentCastId();
  const customers = await getCustomersForCast(castId);

  // Pre-fetch context for every customer so placeholder filling is instant
  // on the client. The list is small (per-cast) so this is cheap.
  const lookups: CustomerLookup[] = await Promise.all(
    customers.map(async (c) => {
      const ctx = await getCustomerContext(castId, c.id);
      return {
        customer: c,
        bottle: ctx?.bottles[0] ?? null,
        memo: ctx?.memo ?? null,
      };
    }),
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="メッセージテンプレート"
        subtitle="お客様情報を自動で挿入"
        showBack
      />
      <div className="px-5 pt-4 pb-6">
        <TemplateWorkspace
          customers={customers}
          lookups={lookups}
          initialCustomerId={searchParams.customerId}
        />
      </div>
    </div>
  );
}
