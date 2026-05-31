"use client";

import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { StatsMiniKpi } from "./stats-mini-kpi";
import { loadSchedule } from "@/lib/nightos/schedule-store";
import { pullCastSchedule } from "@/lib/nightos/schedule-sync";

/**
 * 今月の出勤日数 KPI タイル。
 * シフト (schedule-store) から今月の「出勤」日を数える。サーバー同期
 * (migration 013) で他端末の登録も反映する。
 */
export function StatsWorkDaysKpi() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const countWorkdays = () => {
      const now = new Date();
      const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      return loadSchedule().filter(
        (e) => e.status === "working" && e.date.startsWith(monthPrefix),
      ).length;
    };
    setCount(countWorkdays());
    let cancelled = false;
    void pullCastSchedule().then((applied) => {
      if (applied && !cancelled) setCount(countWorkdays());
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <StatsMiniKpi
      label="出勤"
      value={count}
      unit="日"
      accent="gold"
      icon={<CalendarCheck size={11} strokeWidth={1.7} />}
      period="今月"
    />
  );
}
