"use client";

import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { StatsMiniKpi } from "./stats-mini-kpi";
import { loadSchedule } from "@/lib/nightos/schedule-store";

/**
 * 今月の出勤日数 KPI タイル。
 * シフト (schedule-store / localStorage) から今月の「出勤」日を数える。
 * localStorage 依存のためクライアント側で集計する。
 */
export function StatsWorkDaysKpi() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const days = loadSchedule().filter(
      (e) => e.status === "working" && e.date.startsWith(monthPrefix),
    ).length;
    setCount(days);
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
