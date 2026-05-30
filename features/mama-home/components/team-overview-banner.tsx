import Link from "next/link";
import { ChevronRight, Crown, TrendingUp } from "lucide-react";
import { GemCard } from "@/components/nightos/card";
import type { Cast } from "@/types/nightos";
import { formatCurrency } from "@/lib/utils";

interface Props {
  teamCasts: Cast[];
  teamCustomerCount: number;
}

export function TeamOverviewBanner({ teamCasts, teamCustomerCount }: Props) {
  const totalSales = teamCasts.reduce((sum, c) => sum + c.monthly_sales, 0);

  return (
    <Link href="/mama/team" className="block active:scale-[0.99] transition-transform">
      <GemCard className="p-5">
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 mb-3 text-label-xs tracking-luxe text-wine-deep">
            <Crown size={11} strokeWidth={1.8} />
            メンバーの状況
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-serif text-[22px] leading-tight font-medium tracking-[0.02em] text-ink">
                メンバー <span className="font-display text-[26px] text-wine-deep">{teamCasts.length}</span>人
              </div>
              <div className="text-body-sm text-ink-soft mt-0.5">
                {teamCustomerCount}人のお客様を担当
              </div>
            </div>
            <ChevronRight size={18} className="text-wine-deep" />
          </div>

          <div className="mt-3 pt-3 border-t border-line">
            <div className="text-label-xs tracking-luxe text-ink-mute flex items-center gap-1 uppercase">
              <TrendingUp size={10} />
              今月の売上合計
            </div>
            <div className="font-display text-[1.5rem] font-normal tabular-nums text-ink mt-1">
              {formatCurrency(totalSales)}
            </div>
          </div>
        </div>
      </GemCard>
    </Link>
  );
}
