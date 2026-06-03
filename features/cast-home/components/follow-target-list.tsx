"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, Check, ChevronDown, PartyPopper } from "lucide-react";
import { EmptyState } from "@/components/nightos/empty-state";
import { cn } from "@/lib/utils";
import type { FollowTarget } from "@/types/nightos";
import { loadContactedToday, toggleContacted } from "../lib/contacted-store";
import { FollowTargetCard } from "./follow-target-card";

const VISIBLE_LIMIT = 3;

export function FollowTargetList({ targets }: { targets: FollowTarget[] }) {
  const [contacted, setContacted] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setContacted(loadContactedToday());
  }, []);

  const handleToggle = (customerId: string) => {
    const updated = toggleContacted(customerId);
    setContacted(new Set(updated));
  };

  if (targets.length === 0) {
    return (
      <EmptyState
        icon={<CalendarCheck size={22} />}
        title="今日は一息つける日"
        description="急ぎで連絡するお客様はいません。明日の準備やセルフケアに使ってくださいね。"
        tone="amethyst"
      />
    );
  }

  const doneCount = targets.filter((t) => contacted.has(t.customer.id)).length;
  const total = targets.length;
  const allDone = doneCount === total;
  const pct = Math.round((doneCount / total) * 100);

  // Sort: uncontacted first
  const sorted = [...targets].sort((a, b) => {
    const aD = contacted.has(a.customer.id) ? 1 : 0;
    const bD = contacted.has(b.customer.id) ? 1 : 0;
    return aD - bD;
  });

  const visible = expanded ? sorted : sorted.slice(0, VISIBLE_LIMIT);
  const overflowCount = sorted.length - VISIBLE_LIMIT;

  return (
    <div className="space-y-2.5">
      {/* Compact progress */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-pearl-soft overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[10px] text-ink-mute shrink-0 flex items-center gap-1">
          {allDone ? (
            <PartyPopper size={10} className="text-success" />
          ) : (
            <Check size={10} className={doneCount > 0 ? "text-success" : "text-ink-mute"} />
          )}
          {doneCount}/{total}
        </span>
      </div>

      {allDone && (
        <div className="text-center py-2 rounded-card bg-success/5 border border-success/15">
          <p className="text-[11px] text-success font-medium">
            全員に連絡できた！おつかれさま🌸
          </p>
        </div>
      )}

      {visible.map((t, i) => (
        <FollowTargetCard
          key={t.customer.id}
          target={t}
          contacted={contacted.has(t.customer.id)}
          onToggleContacted={handleToggle}
          rank={i + 1}
        />
      ))}

      {overflowCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-pill border border-wine-deep/30 bg-transparent text-wine-deep text-[12px] font-medium tracking-[0.04em] active:scale-[0.99] transition"
        >
          <ChevronDown
            size={14}
            className={cn("transition-transform", expanded && "rotate-180")}
          />
          {expanded ? "閉じる" : `残り${overflowCount}名を表示`}
        </button>
      )}
    </div>
  );
}
