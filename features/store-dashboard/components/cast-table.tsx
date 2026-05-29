import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { cn, formatCurrency } from "@/lib/utils";
import type { StoreDashboardData } from "@/lib/nightos/supabase-queries";

export function CastTable({
  stats,
}: {
  stats: StoreDashboardData["castStats"];
}) {
  // Compute ROI = monthly_sales / customers — rough revenue per customer
  // and rank casts so the top performer gets a green up-arrow
  const ranked = [...stats].sort(
    (a, b) => b.cast.monthly_sales - a.cast.monthly_sales,
  );
  const topId = ranked[0]?.cast.id;
  const bottomId = ranked[ranked.length - 1]?.cast.id;

  return (
    <Card className="p-4 space-y-3">
      <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.6fr_1fr] gap-2 text-label-sm text-ink-mute border-b border-pearl-soft pb-2">
        <div>キャスト</div>
        <div className="text-right">再来店率</div>
        <div className="text-right">連絡率</div>
        <div className="text-right">担当</div>
        <div className="text-right">月売上</div>
      </div>
      {stats.map((s) => {
        const isTop = s.cast.id === topId && stats.length > 1;
        const isBottom = s.cast.id === bottomId && stats.length > 1;
        const arpc =
          s.customerCount > 0
            ? Math.round(s.cast.monthly_sales / s.customerCount)
            : 0;
        return (
          <div
            key={s.cast.id}
            className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.6fr_1fr] gap-2 text-body-sm text-ink py-1.5 items-center"
          >
            <div className="flex items-center gap-1 font-medium">
              {isTop && (
                <TrendingUp size={12} className="text-success shrink-0" />
              )}
              {isBottom && stats.length > 1 && !isTop && (
                <TrendingDown size={12} className="text-warning shrink-0" />
              )}
              <span>{s.cast.name}</span>
            </div>
            <div className="text-right">
              {Math.round(s.cast.repeat_rate * 100)}%
            </div>
            <div
              className={cn(
                "text-right",
                s.followRate >= 0.7
                  ? "text-success font-medium"
                  : s.followRate < 0.5
                    ? "text-warning"
                    : "",
              )}
            >
              {Math.round(s.followRate * 100)}%
            </div>
            <div className="text-right text-ink-soft">
              {s.customerCount}人
            </div>
            <div className="text-right">
              <div className="font-medium">
                {formatCurrency(s.cast.monthly_sales)}
              </div>
              {arpc > 0 && (
                <div className="text-[10px] text-ink-mute">
                  ARPU {formatCurrency(arpc)}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="pt-2 border-t border-pearl-soft text-label-sm text-ink-mute space-y-0.5">
        <div className="flex items-center gap-1">
          <TrendingUp size={10} className="text-success" />
          売上トップ
        </div>
        <div>
          連絡達成率: <span className="text-success font-medium">緑70%↑</span>
          /<span className="text-warning"> 黄50%↓</span>
        </div>
        <div>ARPU = 月売上 ÷ 担当顧客数</div>
      </div>
    </Card>
  );
}
