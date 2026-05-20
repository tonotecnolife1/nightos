"use client";

import { useEffect, useState } from "react";
import { getUpcomingShifts, type ShiftEntry } from "@/lib/nightos/schedule-store";

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function ScheduleLine({
  time,
  table,
  venue,
  isLast,
}: {
  time: string;
  table: string;
  venue?: string;
  isLast?: boolean;
}) {
  return (
    <div
      className="flex items-baseline gap-4 py-3.5"
      style={{
        borderBottom: isLast ? "none" : "1px solid rgba(43, 35, 42, 0.08)",
      }}
    >
      <div
        className="font-display text-[26px] leading-none text-rose-gold-deep"
        style={{
          letterSpacing: "0.02em",
          minWidth: 76,
          fontWeight: 400,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {time}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="font-display text-[22px] leading-[1.25] text-ink"
          style={{ letterSpacing: "0.02em", fontWeight: 500 }}
        >
          {table}
        </div>
        {venue && (
          <div
            className="mt-[3px] text-[11.5px] leading-[1.3] text-ink-muted"
            style={{ letterSpacing: "0.04em" }}
          >
            {venue}
          </div>
        )}
      </div>
    </div>
  );
}

export function TonightSchedule() {
  const [shifts, setShifts] = useState<ShiftEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const today = todayISO();
    const upcoming = getUpcomingShifts(today, 1);
    setShifts(upcoming.filter((s) => s.date === today && s.status === "working"));
    setLoaded(true);
  }, []);

  if (!loaded) {
    // Reserve hero vertical rhythm during hydration.
    return <div style={{ minHeight: 60 }} aria-hidden />;
  }

  if (shifts.length === 0) {
    return (
      <div
        className="text-[13px] leading-[1.6] text-ink-secondary"
        style={{ maxWidth: "32ch" }}
      >
        今夜の予定はありません。ゆっくり休んでください。
      </div>
    );
  }

  return (
    <div>
      {shifts.map((s, i) => (
        <ScheduleLine
          key={`${s.date}-${i}`}
          time={s.startTime ?? "—"}
          table="出勤"
          venue={s.note ?? undefined}
          isLast={i === shifts.length - 1}
        />
      ))}
    </div>
  );
}
