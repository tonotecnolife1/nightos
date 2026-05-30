import { Calendar, Coins } from "lucide-react";
import { StatCard } from "@/components/nightos/stat-card";
import { formatCurrency } from "@/lib/utils";
import type { CustomerContext } from "@/types/nightos";

// Rough sales estimate per visit by category. Used for the cumulative-sales
// figure on C-2 since the schema doesn't store per-visit amounts in PR-2.
const AVG_SPEND_PER_VISIT: Record<
  CustomerContext["customer"]["category"],
  number
> = {
  vip: 40_000,
  regular: 22_000,
  new: 15_000,
};

export function CustomerStats({ context }: { context: CustomerContext }) {
  const visitCount = context.visits.length;
  const estimatedSales =
    visitCount * AVG_SPEND_PER_VISIT[context.customer.category];

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <StatCard
        label="来店"
        value={visitCount}
        unit="回"
        icon={<Calendar size={12} className="text-ink-soft" />}
      />
      <StatCard
        label="使ってくれた金額"
        value={formatCurrency(estimatedSales).replace("¥", "")}
        unit="円"
        icon={<Coins size={12} className="text-wine-deep" />}
        tone="rose"
      />
    </div>
  );
}
