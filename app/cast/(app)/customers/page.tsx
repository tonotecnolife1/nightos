import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { PageHeader } from "@/components/nightos/page-header";
import { StatCard } from "@/components/nightos/stat-card";
import { CustomerPageShell } from "@/features/cast-customers/components/customer-page-shell";
import {
  getAllCasts,
  getCustomersForCast,
} from "@/lib/nightos/supabase-queries";
import { getCurrentCastId, getCurrentVenueType } from "@/lib/nightos/auth";
import { calculateFunnelStats } from "@/lib/nightos/referral-tree";

export const dynamic = "force-dynamic";

export default async function CastCustomerListPage() {
  const castId = await getCurrentCastId();
  const [allCasts, allCustomers, venueType] = await Promise.all([
    getAllCasts(),
    getCustomersForCast(castId),
    getCurrentVenueType(),
  ]);
  const isCabaret = venueType === "cabaret";

  // Split: customers this cast manages vs. customers they assist (not managing)
  const myCustomers = allCustomers.filter(
    (c) => c.manager_cast_id === castId || c.cast_id === castId && !c.manager_cast_id,
  );
  // Help customers: assigned to this cast but managed by someone else
  const helpCustomers = allCustomers.filter(
    (c) => c.cast_id === castId && c.manager_cast_id && c.manager_cast_id !== castId,
  );
  const customers = isCabaret ? allCustomers : myCustomers;

  const funnel = calculateFunnelStats(customers);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="顧客リスト"
        subtitle={`${customers.length}人のお客様`}
        showBack
        right={
          <Link
            href="/cast/customers/new"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-pill bg-wine-deep text-pearl-light-light text-label-sm font-semibold tracking-[0.04em] shadow-soft hover:-translate-y-px transition"
          >
            <UserPlus size={14} />
            新規
          </Link>
        }
      />
      <div className="px-5 pt-3 pb-6 space-y-5">
        {/* Funnel snapshot */}
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard
            label="店舗登録のみ"
            value={funnel.storeOnly}
            unit="人"
            tone="default"
          />
          <StatCard
            label={isCabaret ? "フリー" : "担当あり"}
            value={funnel.assigned}
            unit="人"
            tone="rose"
          />
          <StatCard
            label="LINE交換済み"
            value={funnel.lineExchanged}
            unit="人"
            tone="amethyst"
          />
        </div>

        {customers.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <p className="text-body-md text-ink">
              まだ顧客が登録されていません
            </p>
            <p className="text-body-sm text-ink-soft">
              担当のお客様を追加すると、ここから来店履歴やボトル、メモを管理できます。
            </p>
            <Link
              href="/cast/customers/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-pill bg-wine-deep text-pearl-light-light text-body-sm font-semibold tracking-[0.04em] shadow-luxe"
            >
              <UserPlus size={14} />
              最初の顧客を追加
            </Link>
          </Card>
        ) : (
          <CustomerPageShell
            allCasts={allCasts}
            allMyCustomers={customers}
            helpCustomers={!isCabaret ? helpCustomers : []}
          />
        )}
      </div>
    </div>
  );
}
