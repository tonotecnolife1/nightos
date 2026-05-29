"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronRight, XCircle } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { countThisMonthCancellationsByCast } from "@/lib/nightos/douhan-store";
import type { Cast } from "@/types/nightos";

interface Props {
  teamCasts: Cast[];
  /** この人数以上キャンセルしてるキャストを警告対象にする */
  threshold?: number;
}

interface AlertEntry {
  cast: Cast;
  count: number;
}

/**
 * お店のキャストのうち、今月キャンセルが threshold 件以上の者を警告する。
 * localStorage の同伴ストアから動的に読み込むため、キャストがキャンセルすると即反映。
 */
export function CancellationAlert({ teamCasts, threshold = 2 }: Props) {
  const [alerts, setAlerts] = useState<AlertEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const counts = countThisMonthCancellationsByCast(new Date());
    const list: AlertEntry[] = [];
    for (const cast of teamCasts) {
      const c = counts[cast.id] ?? 0;
      if (c >= threshold) list.push({ cast, count: c });
    }
    list.sort((a, b) => b.count - a.count);
    setAlerts(list);
    setLoaded(true);
  }, [teamCasts, threshold]);

  if (!loaded || alerts.length === 0) return null;

  const topAlert = alerts[0];
  const topLink = `/mama/team/${topAlert.cast.id}`;

  return (
    <Link href={topLink} className="block active:scale-[0.99] transition-transform">
      <Card className="p-3 border !border-rose/30 !bg-rose/5">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-rose shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-body-sm font-medium text-rose flex items-center gap-1">
              <XCircle size={12} />
              同伴キャンセル多め
            </div>
            <div className="text-[11px] text-ink-soft mt-0.5">
              今月{threshold}件以上: {alerts
                .map((a) => `${a.cast.name}さん(${a.count}件)`)
                .join("・")}
            </div>
            <div className="text-[10px] text-ink-mute mt-0.5">
              タップで理由を確認
            </div>
          </div>
          <ChevronRight size={14} className="text-ink-mute shrink-0" />
        </div>
      </Card>
    </Link>
  );
}
