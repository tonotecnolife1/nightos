"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Crown, Search, Users } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { cn } from "@/lib/utils";
import {
  PACE_STATUS_CONFIG,
} from "@/lib/nightos/douhan-pace";
import type { Cast, Customer, DouhanPaceStats, DouhanPaceStatus } from "@/types/nightos";

// ═══════════════ Types ═══════════════

type SortKey = "risk" | "sales" | "repeat";

interface CastListShellProps {
  teamCasts: Cast[];
  teamCustomers: Customer[];
  paceList: DouhanPaceStats[];
}

// ═══════════════ Constants ═══════════════

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "risk", label: "要注意" },
  { key: "sales", label: "売上" },
  { key: "repeat", label: "リピート" },
];

const STATUS_ORDER: Record<DouhanPaceStatus, number> = {
  meeting_risk: 0,
  behind: 1,
  on_pace: 2,
};

// ═══════════════ Shell ═══════════════

export function CastListShell({
  teamCasts,
  teamCustomers,
  paceList,
}: CastListShellProps) {
  const [sort, setSort] = useState<SortKey>("risk");
  const [query, setQuery] = useState("");

  const paceById = useMemo(
    () => new Map(paceList.map((p) => [p.castId, p])),
    [paceList],
  );

  const customerCountByCast = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of teamCustomers) {
      map.set(c.cast_id, (map.get(c.cast_id) ?? 0) + 1);
    }
    return map;
  }, [teamCustomers]);


  const filtered = useMemo(() => {
    let list = teamCasts;

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }

    const sorted = [...list];
    switch (sort) {
      case "risk": {
        sorted.sort((a, b) => {
          const pa = paceById.get(a.id);
          const pb = paceById.get(b.id);
          const sa = pa ? STATUS_ORDER[pa.status as DouhanPaceStatus] : 3;
          const sb = pb ? STATUS_ORDER[pb.status as DouhanPaceStatus] : 3;
          return sa - sb || b.monthly_sales - a.monthly_sales;
        });
        break;
      }
      case "sales":
        sorted.sort((a, b) => b.monthly_sales - a.monthly_sales);
        break;
      case "repeat":
        sorted.sort((a, b) => b.repeat_rate - a.repeat_rate);
        break;
    }
    return sorted;
  }, [teamCasts, paceById, query, sort]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-display-sm text-ink">
          キャスト一覧（{teamCasts.length}人）
        </h2>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="名前で検索"
          className="w-full pl-8 pr-3 py-2 rounded-btn border border-pearl-soft bg-pearl-warm text-body-sm text-ink placeholder:text-ink-mute focus:outline-none focus:border-amethyst-border"
        />
      </div>

      {/* Sort pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setSort(opt.key)}
            className={cn(
              "px-3 py-1 rounded-badge text-[11px] font-medium border whitespace-nowrap transition-colors",
              sort === opt.key
                ? "bg-amethyst-muted text-amethyst-dark border-amethyst-border"
                : "bg-pearl-warm text-ink-mute border-pearl-soft",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Cast list */}
      {filtered.length === 0 ? (
        <Card className="p-6 text-center text-body-sm text-ink-mute">
          該当するキャストがいません
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((cast) => (
            <CastCard
              key={cast.id}
              cast={cast}
              customerCount={customerCountByCast.get(cast.id) ?? 0}
              pace={paceById.get(cast.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ═══════════════ CastCard ═══════════════

interface CastCardProps {
  cast: Cast;
  customerCount: number;
  pace?: DouhanPaceStats;
}

function CastCard({ cast, customerCount, pace }: CastCardProps) {
  const repeatPct = Math.round(cast.repeat_rate * 100);
  const paceCfg = pace ? PACE_STATUS_CONFIG[pace.status as DouhanPaceStatus] : null;

  return (
    <Link
      href={`/mama/team/${cast.id}`}
      className="block active:scale-[0.99] transition-transform"
    >
      <Card
        className={cn(
          "p-3",
          pace?.status === "meeting_risk" && "!border-rose/30 !bg-rose/5",
          pace?.status === "behind" && "!border-amber/30 !bg-amber/5",
        )}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-body-md font-semibold text-ink">
                {cast.name}
              </h3>
              {paceCfg && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-badge text-[9px] font-semibold border",
                    paceCfg.bg,
                    paceCfg.color,
                  )}
                >
                  {paceCfg.emoji} {pace?.thisMonthCount}/{pace?.monthTarget}
                </span>
              )}
            </div>
            <div className="text-[10px] text-ink-mute mt-0.5">
              {customerCount}人担当
            </div>
          </div>
          <ChevronRight size={14} className="text-ink-mute shrink-0 mt-1" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-btn bg-pearl-soft py-1.5 text-center">
            <div className="font-display text-body-md text-roseGold-dark">
              {(cast.monthly_sales / 10000).toFixed(0)}
            </div>
            <div className="text-[9px] text-ink-mute">万円</div>
          </div>
          <div className="rounded-btn bg-pearl-soft py-1.5 text-center">
            <div className="font-display text-body-md text-amethyst-dark">
              {repeatPct}
            </div>
            <div className="text-[9px] text-ink-mute">% 再来店</div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
