import { PageHeader } from "@/components/nightos/page-header";
import { StatCard } from "@/components/nightos/stat-card";
import { MamaCustomerPageShell } from "@/features/mama-home/components/mama-customer-page-shell";
import { getCurrentManagerId } from "@/lib/nightos/auth";
import {
  getAllCasts,
  getTeamCustomers,
  getVisitsForCustomers,
} from "@/lib/nightos/supabase-queries";
import { calculateFunnelStats } from "@/lib/nightos/referral-tree";

export default async function MamaCustomersPage() {
  const managerId = await getCurrentManagerId();
  const [customers, allCasts] = await Promise.all([
    getTeamCustomers(managerId),
    getAllCasts(),
  ]);
  // 「ヘルプ」ビューの多対多導出に来店履歴を渡す
  const visits = await getVisitsForCustomers(customers.map((c) => c.id));

  const funnel = calculateFunnelStats(customers);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="全てのお客様"
        subtitle={`${customers.length}人のお客様`}
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
            label="担当あり"
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

        <MamaCustomerPageShell
          customers={customers}
          allCasts={allCasts}
          visits={visits}
        />
      </div>
    </div>
  );
}
