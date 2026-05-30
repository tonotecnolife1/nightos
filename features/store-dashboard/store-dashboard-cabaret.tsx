import type { ReactNode } from "react";
import { PageHeader } from "@/components/nightos/page-header";
import { Card } from "@/components/nightos/card";
import { StatCard } from "@/components/nightos/stat-card";
import { OwnerGuard } from "@/features/store-hub/components/owner-guard";
import { AtRiskCustomers } from "./components/at-risk-customers";
import { CastTable } from "./components/cast-table";
import { NominationTrendBars } from "./components/trend-bars";
import { RepeatTrend } from "./components/repeat-trend";
import { formatCurrency } from "@/lib/utils";
import type { FollowTarget, Customer } from "@/types/nightos";
import type { StoreDashboardData } from "@/lib/nightos/supabase-queries";

interface Props {
  data: StoreDashboardData;
  customers: Customer[];
  allTargets: FollowTarget[];
}

function V6Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <header className="relative flex items-baseline pl-3.5 mb-3">
        <span aria-hidden className="absolute left-0 top-1 bottom-1 w-[3px] rounded bg-rose-gold-metallic" />
        <h2 className="font-serif text-[19px] leading-[1.3] font-medium tracking-[0.02em] text-ink">
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

export function StoreDashboardCabaret({ data, customers, allTargets }: Props) {
  const totalCustomers = customers.length;
  const nominationRate =
    totalCustomers > 0
      ? Math.round((data.totalNominations / totalCustomers) * 100)
      : 0;

  return (
    <OwnerGuard>
      <div className="animate-fade-in">
        <PageHeader
          title="ダッシュボード"
          subtitle="全キャストの成績"
          showBack
        />

        <div className="px-5 pt-4 pb-6 space-y-5">
          {/* キャバクラ主要KPI: 指名転換率を前面に */}
          <div className="grid grid-cols-2 gap-2.5">
            <StatCard
              label="月間指名本数"
              value={data.totalNominations}
              unit="本"
              tone="rose"
            />
            <StatCard
              label="指名転換率"
              value={nominationRate}
              unit="%"
              tone="rose"
            />
            <StatCard
              label="月間売上"
              value={formatCurrency(data.totalSales).replace("¥", "")}
              unit="円"
            />
            <StatCard
              label="平均リピート率"
              value={Math.round(data.averageRepeatRate * 100)}
              unit="%"
              tone="amethyst"
            />
          </div>

          <V6Section title="離脱リスク顧客">
            <AtRiskCustomers targets={allTargets} />
          </V6Section>

          <V6Section title="指名数の推移">
            <Card className="p-4">
              <NominationTrendBars points={data.nominationTrend} />
            </Card>
          </V6Section>

          <V6Section title="リピート率の推移">
            <Card className="p-4">
              <RepeatTrend points={data.repeatTrend} />
            </Card>
          </V6Section>

          <V6Section title="キャスト別成績">
            <CastTable stats={data.castStats} />
          </V6Section>
        </div>
      </div>
    </OwnerGuard>
  );
}
