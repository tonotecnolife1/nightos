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
      <GemCard className="p-4">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(400px_160px_at_120%_-20%,rgba(255,255,255,0.35),transparent_60%)]"
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2 text-[11px] text-ink-soft">
            <Crown size={12} />
            メンバーの状況
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-display-sm font-display text-ink">
                メンバー {teamCasts.length}人
              </div>
              <div className="text-body-sm text-ink-soft mt-0.5">
                {teamCustomerCount}人のお客様を担当
              </div>
            </div>
            <ChevronRight size={18} className="text-ink-mute" />
          </div>

          <div className="mt-3 pt-3 border-t border-ink/[0.08]">
            <div className="text-[10px] text-ink-mute flex items-center gap-1">
              <TrendingUp size={10} />
              今月の売上合計
            </div>
            <div className="text-body-md font-display text-ink mt-0.5">
              {formatCurrency(totalSales)}
            </div>
          </div>
        </div>
      </GemCard>
    </Link>
  );
}
