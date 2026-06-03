import { PageHeader } from "@/components/nightos/page-header";
import { Card } from "@/components/nightos/card";
import { StatCard } from "@/components/nightos/stat-card";
import { OwnerGuard } from "@/features/store-hub/components/owner-guard";
import { CollapsibleSection } from "@/features/customer-card/components/collapsible-section";
import { AtRiskCustomers } from "./components/at-risk-customers";
import { CastTable } from "./components/cast-table";
import { CategoryBreakdown } from "./components/category-breakdown";
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

export function StoreDashboardClub({ data, customers, allTargets }: Props) {
  return (
    <OwnerGuard>
      <div className="animate-fade-in">
        <PageHeader
          title="効果ダッシュボード"
          subtitle="全キャストの成績"
          showBack
        />

        <div className="px-5 pt-4 pb-6 space-y-5">
          <div className="grid grid-cols-2 gap-2.5">
            <StatCard
              label="月間売上合計"
              value={formatCurrency(data.totalSales).replace("¥", "")}
              unit="円"
              tone="rose"
            />
            <StatCard
              label="平均再来店率"
              value={Math.round(data.averageRepeatRate * 100)}
              unit="%"
              tone="amethyst"
            />
            <StatCard
              label="平均連絡達成率"
              value={Math.round(data.averageFollowRate * 100)}
              unit="%"
              tone="rose"
            />
            <StatCard
              label="担当顧客数"
              value={data.castStats.reduce((s, c) => s + c.customerCount, 0)}
              unit="人"
              tone="amethyst"
            />
          </div>

          {/* ── 今夜のアクション ── */}
          <section>
            <h2 className="text-label-xs tracking-luxe text-wine-deep uppercase mb-2">今夜のアクション</h2>
            <AtRiskCustomers targets={allTargets} />
          </section>

          {/* ── キャスト別成績 ── */}
          <section>
            <header className="relative flex items-baseline pl-3.5 mb-3">
              <span aria-hidden className="absolute left-0 top-1 bottom-1 w-[3px] rounded bg-rose-gold-metallic" />
              <h2 className="font-serif text-[19px] leading-[1.3] font-medium tracking-[0.02em] text-ink">キャスト別成績</h2>
            </header>
            <CastTable stats={data.castStats} />
          </section>

          {/* ── 顧客構成 ── */}
          <section>
            <header className="relative flex items-baseline pl-3.5 mb-3">
              <span aria-hidden className="absolute left-0 top-1 bottom-1 w-[3px] rounded bg-rose-gold-metallic" />
              <h2 className="font-serif text-[19px] leading-[1.3] font-medium tracking-[0.02em] text-ink">顧客カテゴリ構成</h2>
            </header>
            <CategoryBreakdown customers={customers} />
          </section>

          {/* ── トレンドチャート（折りたたみ） ── */}
          <div className="border-t border-ink/[0.06] pt-2">
            <CollapsibleSection title="トレンドグラフ">
              <section>
                <h2 className="text-display-sm text-ink mb-2">再来店率の推移</h2>
                <Card className="p-4">
                  <RepeatTrend points={data.repeatTrend} />
                </Card>
              </section>
            </CollapsibleSection>
          </div>
        </div>
      </div>
    </OwnerGuard>
  );
}
