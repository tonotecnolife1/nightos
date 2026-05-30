"use client";

import { useEffect, useState } from "react";
import { Cake } from "lucide-react";

interface Props {
  value: string; // "" | "YYYY-MM-DD" | "0000-MM-DD"
  onChange: (value: string) => void;
  label?: string;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function maxDays(month: number): number {
  // Allow 29 for Feb (leap year unknown), otherwise standard max
  return [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 31;
}

function parse(raw: string) {
  if (!raw) return { year: "", month: "", day: "" };
  const parts = raw.split("-");
  if (parts.length !== 3) return { year: "", month: "", day: "" };
  const [y, m, d] = parts;
  return {
    year: y === "0000" ? "" : (y ?? ""),
    month: m ? String(parseInt(m, 10)) : "",
    day: d ? String(parseInt(d, 10)) : "",
  };
}

function toValue(year: string, month: string, day: string): string {
  if (!month && !day) return "";
  const y = year.trim() ? year.trim().padStart(4, "0") : "0000";
  const m = (month || "0").padStart(2, "0");
  const d = (day || "0").padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function BirthdayInput({ value, onChange, label = "誕生日" }: Props) {
  const parsed = parse(value);
  const [year, setYear] = useState(parsed.year);
  const [month, setMonth] = useState(parsed.month);
  const [day, setDay] = useState(parsed.day);

  // Sync external value changes (e.g., form reset)
  useEffect(() => {
    const p = parse(value);
    setYear(p.year);
    setMonth(p.month);
    setDay(p.day);
  }, [value]);

  const emit = (y: string, m: string, d: string) => {
    onChange(toValue(y, m, d));
  };

  const handleMonth = (m: string) => {
    setMonth(m);
    // Clamp day to valid range
    const max = m ? maxDays(parseInt(m, 10)) : 31;
    const clampedDay = day && parseInt(day, 10) > max ? String(max) : day;
    setDay(clampedDay);
    emit(year, m, clampedDay);
  };

  const handleDay = (d: string) => {
    setDay(d);
    emit(year, month, d);
  };

  const handleYear = (y: string) => {
    // Only digits, max 4
    const cleaned = y.replace(/\D/g, "").slice(0, 4);
    setYear(cleaned);
    emit(cleaned, month, day);
  };

  const days = month ? Array.from({ length: maxDays(parseInt(month, 10)) }, (_, i) => i + 1) : Array.from({ length: 31 }, (_, i) => i + 1);

  const selectClass =
    "h-11 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-md text-ink focus:outline-none focus:border-gold/30 focus:ring-1 focus:ring-amethyst-border/30 transition appearance-none cursor-pointer";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Cake size={13} className="text-gold-deep" />
        <label className="text-label-md text-ink font-medium">{label}</label>
      </div>

      <div className="flex items-center gap-2">
        {/* Month */}
        <div className="flex-1 relative">
          <select
            value={month}
            onChange={(e) => handleMonth(e.target.value)}
            className={selectClass + " w-full pr-7"}
            style={{ fontSize: "16px" }}
          >
            <option value="">月</option>
            {MONTHS.map((m) => (
              <option key={m} value={String(m)}>
                {m}月
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted text-xs">▾</span>
        </div>

        {/* Day */}
        <div className="flex-1 relative">
          <select
            value={day}
            onChange={(e) => handleDay(e.target.value)}
            className={selectClass + " w-full pr-7"}
            style={{ fontSize: "16px" }}
          >
            <option value="">日</option>
            {days.map((d) => (
              <option key={d} value={String(d)}>
                {d}日
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted text-xs">▾</span>
        </div>

        {/* Year (optional) */}
        <div className="w-[88px]">
          <input
            type="text"
            inputMode="numeric"
            value={year}
            onChange={(e) => handleYear(e.target.value)}
            placeholder="年（任意）"
            maxLength={4}
            className={selectClass + " w-full text-center"}
            style={{ fontSize: "16px" }}
          />
        </div>
      </div>

      <p className="text-label-sm text-ink-muted">
        年がわからない場合は月・日だけでOKです
      </p>
    </div>
  );
}
