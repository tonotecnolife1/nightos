"use client";

import { CalendarPlus, Check, ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/nightos/card";
import { cn } from "@/lib/utils";
import {
  EVENT_LABELS,
  todayJST,
  upsertScheduleEvent,
  type ScheduleEventType,
} from "@/lib/nightos/schedule-store";

type EventTypeOption = Extract<ScheduleEventType, "douhan" | "raiten">;

const TYPES: { value: EventTypeOption; hint: string }[] = [
  { value: "douhan", hint: "お迎えして一緒に来店" },
  { value: "raiten", hint: "来店予約" },
];

interface Props {
  castId: string;
  customerId: string;
  customerName: string;
}

export function AddToScheduleButton({ castId, customerId, customerName }: Props) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<EventTypeOption>("raiten");
  const [date, setDate] = useState(todayJST());
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = () => {
    upsertScheduleEvent(castId, {
      id: `sch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      cast_id: castId,
      date,
      time: time || undefined,
      type,
      customer_id: customerId,
      customer_name: customerName,
      note: note.trim() || undefined,
      created_at: new Date().toISOString(),
    });
    setDone(true);
    setTimeout(() => {
      setOpen(false);
      setDone(false);
      setTime("");
      setNote("");
    }, 1200);
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-center gap-1.5 h-10 rounded-pill border text-body-sm transition",
          open
            ? "border-amethyst-border bg-amethyst-muted text-amethyst-dark"
            : "border-ink/[0.12] bg-pearl-soft text-ink-secondary hover:border-amethyst-border hover:bg-amethyst-muted hover:text-amethyst-dark",
        )}
      >
        <CalendarPlus size={14} />
        スケジュールに追加
        <ChevronDown
          size={12}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-body-sm font-medium text-ink">
              {customerName}さまを予定に追加
            </p>
            <button type="button" onClick={() => setOpen(false)} className="text-ink-muted">
              <X size={15} />
            </button>
          </div>

          {/* Type */}
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={cn(
                  "flex flex-col items-start px-3 py-2 rounded-2xl border text-left transition",
                  type === opt.value
                    ? "border-amethyst-border bg-amethyst-muted"
                    : "border-ink/[0.06] bg-pearl-warm",
                )}
              >
                <span className="text-[12px] font-semibold text-ink">
                  {EVENT_LABELS[opt.value]}
                </span>
                <span className="text-[9px] text-ink-muted mt-0.5">{opt.hint}</span>
              </button>
            ))}
          </div>

          {/* Date */}
          <div className="space-y-1">
            <label className="text-label-sm text-ink-secondary">日付</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-10 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-sm text-ink focus:outline-none focus:border-amethyst-border"
              style={{ fontSize: "16px" }}
            />
          </div>

          {/* Time */}
          <div className="space-y-1">
            <label className="text-label-sm text-ink-secondary">時間（任意）</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full h-10 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-sm text-ink focus:outline-none focus:border-amethyst-border"
              style={{ fontSize: "16px" }}
            />
          </div>

          {/* Note */}
          <div className="space-y-1">
            <label className="text-label-sm text-ink-secondary">メモ（任意）</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="場所など"
              className="w-full h-10 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-amethyst-border"
              style={{ fontSize: "16px" }}
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!date || done}
            className={cn(
              "w-full h-10 rounded-full text-label-sm font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-1.5",
              done
                ? "bg-emerald/15 text-emerald border border-emerald/30"
                : "bg-amethyst text-pearl shadow-soft hover:-translate-y-px",
            )}
          >
            {done ? (
              <>
                <Check size={14} />
                登録しました
              </>
            ) : (
              "登録する"
            )}
          </button>
        </Card>
      )}
    </div>
  );
}
