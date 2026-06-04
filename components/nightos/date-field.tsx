"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  /** Selected date as "YYYY-MM-DD", or "" when none chosen yet. */
  value: string;
  onChange: (value: string) => void;
  label?: string;
  /** Placeholder shown on the trigger when no date is selected. */
  placeholder?: string;
}

const DOW = ["日", "月", "火", "水", "木", "金", "土"];

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function parseYMD(s: string): Date | null {
  const parts = s.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d);
}

function formatLabel(s: string): string {
  const d = parseYMD(s);
  if (!d) return "";
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${DOW[d.getDay()]}）`;
}

/**
 * In-app calendar date picker — replaces the native `<input type="date">`,
 * whose iOS overlay (リセット / ✓ buttons) we cannot control or style.
 * Provides a clear label and a working「今日」reset button.
 */
export function DateField({
  value,
  onChange,
  label = "日付",
  placeholder = "日付を選ぶ",
}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calendar view follows the selected value (or today when none chosen yet).
  const initial = parseYMD(value) ?? new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  // When the popover opens, snap the view to the selected date / today.
  useEffect(() => {
    if (!open) return;
    const base = parseYMD(value) ?? new Date();
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
  }, [open, value]);

  // Close on outside tap.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const today = toYMD(new Date());

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  };

  // Build the month grid.
  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);
  const startPad = firstDay.getDay();
  const cells: (string | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) =>
      toYMD(new Date(viewYear, viewMonth, i + 1)),
    ),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const pick = (date: string) => {
    onChange(date);
    setOpen(false);
  };

  const resetToToday = () => {
    const t = new Date();
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
    onChange(today);
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <div className="flex items-center gap-1.5">
        <CalendarCheck size={13} className="text-gold-deep" />
        <label className="text-label-md text-ink font-medium">{label}</label>
      </div>

      {/* Trigger — styled to match the other form fields. */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full h-10 rounded-2xl border bg-pearl-warm px-3 text-left text-body-sm transition focus:outline-none",
          open ? "border-wine-deep" : "border-ink/[0.06]",
          value ? "text-ink" : "text-ink-mute",
        )}
      >
        {value ? formatLabel(value) : placeholder}
      </button>

      {open && (
        <div className="rounded-2xl border border-ink/[0.08] bg-pearl-light p-3 shadow-soft space-y-2">
          {/* Month nav */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="前の月"
              className="p-1.5 rounded-full hover:bg-pearl-soft text-ink-soft"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-serif text-[15px] font-medium tracking-[0.02em] text-ink">
              {viewYear}年{viewMonth + 1}月
            </span>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="次の月"
              className="p-1.5 rounded-full hover:bg-pearl-soft text-ink-soft"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day-of-week header */}
          <div className="grid grid-cols-7 gap-0.5">
            {DOW.map((d, i) => (
              <div
                key={d}
                className={cn(
                  "text-center text-[10px] font-medium py-0.5",
                  i === 0
                    ? "text-wine-deep-400"
                    : i === 6
                      ? "text-sky-400"
                      : "text-ink-mute",
                )}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((date, idx) => {
              if (!date) return <div key={`pad-${idx}`} />;
              const isSelected = date === value;
              const isToday = date === today;
              const dow = new Date(date).getDay();
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => pick(date)}
                  className={cn(
                    "aspect-square flex items-center justify-center rounded-xl text-[13px] font-medium transition-all active:scale-95",
                    isSelected
                      ? "bg-wine-deep text-pearl-light shadow-luxe"
                      : "hover:bg-pearl-soft text-ink",
                    isToday && !isSelected && "ring-1 ring-gold/50",
                    dow === 0 && !isSelected && "text-wine-deep-400",
                    dow === 6 && !isSelected && "text-sky-400",
                  )}
                >
                  {Number(date.slice(-2))}
                </button>
              );
            })}
          </div>

          {/* Footer — working reset to today. */}
          <div className="flex items-center justify-between pt-0.5">
            <button
              type="button"
              onClick={resetToToday}
              className="h-8 px-3 rounded-full bg-pearl-soft text-ink-soft text-[11px] font-medium active:scale-95"
            >
              今日
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-8 px-3 rounded-full text-ink-mute text-[11px] font-medium"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
