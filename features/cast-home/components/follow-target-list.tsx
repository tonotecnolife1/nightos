"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, Check, PartyPopper } from "lucide-react";
import { EmptyState } from "@/components/nightos/empty-state";
import type { FollowTarget } from "@/types/nightos";
import { loadContactedToday, toggleContacted } from "../lib/contacted-store";
import { FollowTargetCard } from "./follow-target-card";

export function FollowTargetList({ targets }: { targets: FollowTarget[] }) {
  const [contacted, setContacted] = useState<Set<string>>(new Set());

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
        <span className="text-[10px] text-ink-muted shrink-0 flex items-center gap-1">
          {allDone ? (
            <PartyPopper size={10} className="text-emerald" />
          ) : (
            <Check size={10} className={doneCount > 0 ? "text-emerald" : "text-ink-muted"} />
          )}
          {doneCount}/{total}
        </span>
      </div>

      {allDone && (
        <div className="text-center py-2 rounded-card bg-emerald/5 border border-emerald/15">
          <p className="text-[11px] text-emerald font-medium">
            全員に連絡できた！おつかれさま🌸
          </p>
        </div>
      )}

      {sorted.map((t, i) => (
        <FollowTargetCard
          key={t.customer.id}
          target={t}
          contacted={contacted.has(t.customer.id)}
          onToggleContacted={handleToggle}
          rank={i + 1}
        />
      ))}
    </div>
  );
}
