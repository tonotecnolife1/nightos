import { GitBranch, Users } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { PageHeader } from "@/components/nightos/page-header";
import { StatCard } from "@/components/nightos/stat-card";
import { MamaCustomerPageShell } from "@/features/mama-home/components/mama-customer-page-shell";
import { getCurrentManagerId } from "@/lib/nightos/auth";
import {
  getAllCasts,
  getTeamCustomers,
} from "@/lib/nightos/supabase-queries";
import { mockCasts } from "@/lib/nightos/mock-data";
import {
  buildReferralTree,
  calculateFunnelStats,
} from "@/lib/nightos/referral-tree";

export default async function MamaCustomersPage() {
  const managerId = await getCurrentManagerId();
  const [customers, allCasts] = await Promise.all([
    getTeamCustomers(managerId),
    getAllCasts(),
  ]);

  const funnel = calculateFunnelStats(customers);
  const tree = buildReferralTree({ customers, casts: mockCasts });
  const totalReferralChains = tree.filter((n) => n.children.length > 0).length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="全顧客"
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

        <Card className="p-3 flex items-center justify-between">
          <span className="text-body-sm text-ink-soft flex items-center gap-1.5">
            <GitBranch size={13} className="text-amethyst-dark" />
            お連れ様の繋がり数
          </span>
          <span className="text-body-md text-ink font-medium">
            {totalReferralChains}本
          </span>
        </Card>

        <MamaCustomerPageShell customers={customers} allCasts={allCasts} />
      </div>
    </div>
  );
}
