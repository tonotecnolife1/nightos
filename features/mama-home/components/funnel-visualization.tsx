import Link from "next/link";
import { ChevronRight, TrendingUp } from "lucide-react";
import { Card } from "@/components/nightos/card";
import {
  calculateFunnelByCast,
  calculateFunnelStats,
} from "@/lib/nightos/referral-tree";
import { cn } from "@/lib/utils";
import type { Cast, Customer } from "@/types/nightos";

interface Props {
  customers: Customer[];
  teamCasts: Cast[];
}

/**
 * 顧客ファネル (店舗登録 → 担当付き → LINE交換) をスタックバーで可視化。
 * お店全体の転換率とキャスト別 TOP3 を表示。
 */
export function FunnelVisualization({ customers, teamCasts }: Props) {
  const stats = calculateFunnelStats(customers);
  const perCast = calculateFunnelByCast({ customers, casts: teamCasts })
    .filter((item) => item.stats.total > 0)
    .sort((a, b) => b.stats.lineExchangedRate - a.stats.lineExchangedRate);

  const topCasts = perCast.slice(0, 3);
  const storeOnlyPct = stats.total === 0 ? 0 : (stats.storeOnly / stats.total) * 100;
  const assignedPct = stats.total === 0 ? 0 : (stats.assigned / stats.total) * 100;
  const linePct = stats.total === 0 ? 0 : (stats.lineExchanged / stats.total) * 100;

  return (
    <section className="space-y-2.5">
      <header className="relative flex items-center justify-between pl-3.5">
        <span aria-hidden className="absolute left-0 top-1 bottom-1 w-[3px] rounded bg-rose-gold-metallic" />
        <h2 className="font-serif text-[19px] leading-[1.3] font-medium tracking-[0.02em] text-ink flex items-center gap-1.5">
          <TrendingUp size={16} className="text-gold-deep" />
          顧客ファネル
        </h2>
        <span className="text-label-xs tracking-luxe text-ink-mute uppercase">全{stats.total}人</span>
      </header>

      <Card className="p-3 space-y-3">
        {/* Stacked bar */}
        <div className="space-y-1.5">
          <div className="flex h-4 rounded-full overflow-hidden bg-pearl-soft">
            {stats.storeOnly > 0 && (
              <div
                className="h-full bg-pearl-soft border-r border-pearl-warm"
                style={{ width: `${storeOnlyPct}%` }}
                title={`店舗登録のみ: ${stats.storeOnly}人`}
              />
            )}
            {stats.assigned > 0 && (
              <div
                className="h-full bg-champagne border-r border-pearl-warm"
                style={{ width: `${assignedPct}%` }}
                title={`担当付き: ${stats.assigned}人`}
              />
            )}
            {stats.lineExchanged > 0 && (
              <div
                className="h-full bg-emerald"
                style={{ width: `${linePct}%` }}
                title={`LINE交換済み: ${stats.lineExchanged}人`}
              />
            )}
          </div>
          {/* Legend with counts */}
          <div className="flex items-center justify-between text-[10px] text-ink-soft">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-pearl-soft border border-ink-muted" />
              店舗のみ {stats.storeOnly}
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-champagne" />
              担当 {stats.assigned}
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald" />
              LINE {stats.lineExchanged}
            </div>
          </div>
        </div>

        {/* Conversion rates */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-pearl-soft">
          <div>
            <div className="text-[10px] text-ink-mute">担当化率</div>
            <div className="text-body-md font-display text-champagne-dark">
              {Math.round(stats.assignedRate * 100)}
              <span className="text-[10px] text-ink-mute ml-0.5">%</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-ink-mute">LINE交換率</div>
            <div className="text-body-md font-display text-success">
              {Math.round(stats.lineExchangedRate * 100)}
              <span className="text-[10px] text-ink-mute ml-0.5">%</span>
            </div>
          </div>
        </div>

        {/* Top 3 casts by line rate */}
        {topCasts.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-pearl-soft">
            <div className="text-[10px] text-ink-mute font-medium uppercase tracking-wider">
              LINE交換率 TOP{topCasts.length}
            </div>
            {topCasts.map((item, idx) => (
              <CastFunnelRow key={item.cast.id} rank={idx + 1} item={item} />
            ))}
          </div>
        )}

        {/* Footer link */}
        <Link
          href="/mama/customers"
          className="flex items-center justify-between pt-2 border-t border-line text-[11px] text-roseGold-deep"
        >
          <span>顧客リストで見る</span>
          <ChevronRight size={12} />
        </Link>
      </Card>
    </section>
  );
}

function CastFunnelRow({
  rank,
  item,
}: {
  rank: number;
  item: { cast: Cast; stats: ReturnType<typeof calculateFunnelStats> };
}) {
  const { cast, stats } = item;
  const linePct = Math.round(stats.lineExchangedRate * 100);
  const storeOnlyPct = stats.total === 0 ? 0 : (stats.storeOnly / stats.total) * 100;
  const assignedPct = stats.total === 0 ? 0 : (stats.assigned / stats.total) * 100;
  const lineExPct = stats.total === 0 ? 0 : (stats.lineExchanged / stats.total) * 100;

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center shrink-0",
          rank === 1
            ? "bg-roseGold text-pearl-light"
            : rank === 2
              ? "bg-champagne-dark text-ink"
              : "bg-pearl-soft text-ink-soft",
        )}
      >
        {rank}
      </span>
      <span className="text-[11px] text-ink truncate w-16 shrink-0">
        {cast.name}
      </span>
      <div className="flex h-2 rounded-full overflow-hidden bg-pearl-soft flex-1">
        <div
          className="h-full bg-pearl-soft"
          style={{ width: `${storeOnlyPct}%` }}
        />
        <div
          className="h-full bg-champagne"
          style={{ width: `${assignedPct}%` }}
        />
        <div className="h-full bg-emerald" style={{ width: `${lineExPct}%` }} />
      </div>
      <span className="text-[10px] text-success font-medium shrink-0 w-9 text-right">
        {linePct}%
      </span>
    </div>
  );
}
