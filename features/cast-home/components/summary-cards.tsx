"use client";

import Link from "next/link";
import { Heart, MessageCircle, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/nightos/stat-card";
import type { CastHomeSummary } from "@/types/nightos";

export function SummaryCards({ summary }: { summary: CastHomeSummary }) {
  const repeatPct = Math.round(summary.repeatRate * 100);
  return (
    <div className="grid grid-cols-3 gap-2.5">
      <StatCard
        label="今月の売上"
        value={Math.round(summary.monthlySales / 10000)}
        unit="万円"
        icon={<TrendingUp size={12} className="text-gold" />}
        tone="rose"
      />
      <Link href="/cast/stats#repeat" className="block">
        <StatCard
          label="再来店率"
          value={repeatPct}
          unit="%"
          icon={<Heart size={12} className="text-gold" />}
          tone="rose"
          className="h-full cursor-pointer hover:border-gold/30 hover:shadow-float hover:-translate-y-px transition will-change-transform"
        />
      </Link>
      <Link href="/cast/customers" className="block">
        <StatCard
          label="フォロー対象"
          value={summary.followTargetCount}
          unit="人"
          icon={<MessageCircle size={12} className="text-gold" />}
          tone="amethyst"
          className="h-full cursor-pointer hover:border-roseGold-deep/30 hover:shadow-float hover:-translate-y-px transition will-change-transform"
        />
      </Link>
    </div>
  );
}
