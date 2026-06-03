"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronRight, XCircle } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { countThisMonthCancellationsByCast } from "@/lib/nightos/douhan-store";
import { fetchCancellationCounts } from "@/lib/nightos/douhan-manager";
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
 * 認証済みならサーバー (店舗横断) のキャンセル件数を、mock / 未認証なら
 * localStorage の同伴ストアを集計する。
 */
export function CancellationAlert({ teamCasts, threshold = 2 }: Props) {
  const [alerts, setAlerts] = useState<AlertEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const build = (counts: Record<string, number>) => {
      const list: AlertEntry[] = [];
      for (const cast of teamCasts) {
        const c = counts[cast.id] ?? 0;
        if (c >= threshold) list.push({ cast, count: c });
      }
      list.sort((a, b) => b.count - a.count);
      return list;
    };

    void fetchCancellationCounts().then((serverCounts) => {
      if (cancelled) return;
      // null = 未認証 → localStorage 集計にフォールバック
      const counts =
        serverCounts ?? countThisMonthCancellationsByCast(new Date());
      setAlerts(build(counts));
      setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [teamCasts, threshold]);

  if (!loaded || alerts.length === 0) return null;

  const topAlert = alerts[0];
  const topLink = `/mama/team/${topAlert.cast.id}`;

  return (
    <Link href={topLink} className="block active:scale-[0.99] transition-transform">
      <Card className="p-3 border !border-wine/30 !bg-wine/5">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-wine-deep shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-body-sm font-medium text-wine-deep flex items-center gap-1">
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
