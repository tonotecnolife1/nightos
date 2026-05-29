"use client";

import { CheckCircle2, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/nightos/card";
import { cn } from "@/lib/utils";

interface CastFollowStatus {
  castName: string;
  targetCount: number;
  contactedCount: number;
}

/**
 * Shows store managers which casts have completed their daily
 * follow-ups. Reads from the same localStorage key that the cast
 * home uses — in a real multi-device setup this would be a server
 * query, but for MVP single-device demo it works.
 */
export function TodayFollowStatus({
  casts,
}: {
  casts: { id: string; name: string; targetCount: number }[];
}) {
  const [statuses, setStatuses] = useState<CastFollowStatus[]>([]);

  useEffect(() => {
    // Read contacted data from localStorage (same keys the cast app writes)
    const todayKey = (() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    })();

    const results: CastFollowStatus[] = casts.map((cast) => {
      try {
        const raw = window.localStorage.getItem("nightos.contacted-today");
        if (!raw) return { castName: cast.name, targetCount: cast.targetCount, contactedCount: 0 };
        const parsed = JSON.parse(raw) as { date: string; ids: string[] };
        if (parsed.date !== todayKey) return { castName: cast.name, targetCount: cast.targetCount, contactedCount: 0 };
        return {
          castName: cast.name,
          targetCount: cast.targetCount,
          contactedCount: parsed.ids.length,
        };
      } catch {
        return { castName: cast.name, targetCount: cast.targetCount, contactedCount: 0 };
      }
    });
    setStatuses(results);
  }, [casts]);

  if (statuses.length === 0) return null;

  return (
    <Card className="p-4 space-y-3">
      <h3 className="text-label-md font-semibold text-ink flex items-center gap-1.5">
        <CheckCircle2 size={14} className="text-emerald" />
        今日の連絡状況
      </h3>
      <div className="space-y-2.5">
        {statuses.map((s) => {
          const pct =
            s.targetCount > 0
              ? Math.round((s.contactedCount / s.targetCount) * 100)
              : 0;
          const isDone = s.contactedCount >= s.targetCount && s.targetCount > 0;
          return (
            <div key={s.castName}>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-medium text-ink">{s.castName}</span>
                <span
                  className={cn(
                    "font-semibold",
                    isDone ? "text-emerald" : pct > 0 ? "text-amber" : "text-ink-mute",
                  )}
                >
                  {isDone ? "✅ 完了" : `${s.contactedCount}/${s.targetCount}人`}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-pearl-soft overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    isDone ? "bg-emerald" : pct > 0 ? "bg-amber" : "bg-pearl-soft",
                  )}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
