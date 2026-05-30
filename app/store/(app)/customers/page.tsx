import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/nightos/page-header";
import { CustomerListClient } from "@/features/store-customers/components/customer-list-client";
import {
  getAllCasts,
  getAllCustomers,
} from "@/lib/nightos/supabase-queries";

export default async function StoreCustomersPage() {
  const [customers, casts] = await Promise.all([
    getAllCustomers(),
    getAllCasts(),
  ]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="顧客一覧" subtitle="検索・編集・削除" showBack />
      <div className="px-5 pt-4 pb-6 space-y-4">
        <Link
          href="/store/customers/transfer"
          className="flex items-center justify-between w-full p-3 rounded-btn border border-gold/30 bg-champagne-soft/60/30 hover:bg-champagne-soft/60/50 transition-colors"
        >
          <div>
            <div className="text-body-sm font-medium text-ink">担当移管</div>
            <div className="text-[10px] text-ink-mute mt-0.5">
              キャスト間で顧客の担当を引き継ぐ
            </div>
          </div>
          <ArrowRight size={14} className="text-gold-deep shrink-0" />
        </Link>
        <CustomerListClient customers={customers} casts={casts} />
      </div>
    </div>
  );
}
