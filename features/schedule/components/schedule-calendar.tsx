"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type ShiftEntry,
  type ShiftStatus,
  loadSchedule,
  upsertShift,
  removeShift,
} from "@/lib/nightos/schedule-store";
import {
  type PlanEntry,
  loadPlansForCast,
  upsertPlan,
  deletePlan,
} from "@/lib/nightos/plan-store";
import { loadAllDouhans } from "@/lib/nightos/douhan-store";
import type { Customer, Douhan } from "@/types/nightos";

const DOW = ["日", "月", "火", "水", "木", "金", "土"];

const STATUS_STYLE: Record<ShiftStatus, { bg: string; text: string; label: string }> = {
  working: { bg: "bg-wine-deep", text: "text-pearl-light", label: "出勤" },
  off: { bg: "bg-pearl-soft border border-ink/[0.08]", text: "text-ink-mute", label: "公休" },
  unknown: { bg: "", text: "", label: "" },
};

/** 予定追加・編集フォームが返すペイロード */
interface PlanInput {
  time?: string;
  title: string;
  note?: string;
}

interface Props {
  castId: string;
  customers: Customer[];
}

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseYMD(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function ScheduleCalendar({ castId, customers }: Props) {
  const today = toYMD(new Date());
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [schedule, setSchedule] = useState<ShiftEntry[]>([]);
  const [douhans, setDouhans] = useState<Douhan[]>([]);
  const [plans, setPlans] = useState<PlanEntry[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [editEntry, setEditEntry] = useState<ShiftEntry | null>(null);

  useEffect(() => {
    setSchedule(loadSchedule());
    setDouhans(loadAllDouhans().filter((d) => d.cast_id === castId));
    setPlans(loadPlansForCast(castId));
  }, [castId]);

  const refresh = useCallback(() => setSchedule(loadSchedule()), []);
  const refreshPlans = useCallback(
    () => setPlans(loadPlansForCast(castId)),
    [castId],
  );

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);
  const startPad = firstDay.getDay(); // 0=Sun
  const cells: (string | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) =>
      toYMD(new Date(viewYear, viewMonth, i + 1)),
    ),
  ];
  // Pad to complete weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const shiftMap = new Map(schedule.map((e) => [e.date, e]));
  const douhanMap = new Map<string, Douhan[]>();
  for (const d of douhans) {
    const existing = douhanMap.get(d.date) ?? [];
    existing.push(d);
    douhanMap.set(d.date, existing);
  }
  const planMap = new Map<string, PlanEntry[]>();
  const sortedPlans = [...plans].sort((a, b) =>
    (a.time ?? "99:99").localeCompare(b.time ?? "99:99"),
  );
  for (const p of sortedPlans) {
    const existing = planMap.get(p.date) ?? [];
    existing.push(p);
    planMap.set(p.date, existing);
  }

  const handleCellTap = (date: string) => {
    const existing = shiftMap.get(date);
    setSelected(date);
    setEditEntry(existing ?? { date, status: "unknown" });
  };

  const handleSave = (entry: ShiftEntry) => {
    if (entry.status === "unknown") {
      removeShift(entry.date);
    } else {
      upsertShift(entry);
    }
    refresh();
    setSelected(null);
    setEditEntry(null);
  };

  const handleCancel = () => {
    setSelected(null);
    setEditEntry(null);
  };

  // ── Plan CRUD (immediate persistence) ──
  const handleAddPlan = (date: string, data: PlanInput) => {
    upsertPlan({ castId, date, ...data });
    refreshPlans();
  };
  const handleUpdatePlan = (id: string, date: string, data: PlanInput) => {
    upsertPlan({ id, castId, date, ...data });
    refreshPlans();
  };
  const handleDeletePlan = (id: string) => {
    deletePlan(id);
    refreshPlans();
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  const workingCount = schedule.filter(
    (e) =>
      e.status === "working" &&
      e.date.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`),
  ).length;

  return (
    <div className="space-y-4">
      {/* Month nav */}
      <div className="flex items-center justify-between px-1">
        <button type="button" onClick={prevMonth} className="p-2 rounded-full hover:bg-pearl-soft text-ink-soft">
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <div className="font-serif text-[22px] leading-tight font-medium tracking-[0.02em] text-ink">
            {viewYear}年{viewMonth + 1}月
          </div>
          <div className="text-label-xs tracking-luxe text-ink-mute uppercase mt-0.5">
            出勤 {workingCount}日
          </div>
        </div>
        <button type="button" onClick={nextMonth} className="p-2 rounded-full hover:bg-pearl-soft text-ink-soft">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 gap-0.5">
        {DOW.map((d, i) => (
          <div
            key={d}
            className={cn(
              "text-center text-[11px] font-medium py-1",
              i === 0 ? "text-wine-deep-400" : i === 6 ? "text-sky-400" : "text-ink-mute",
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((date, idx) => {
          if (!date) {
            return <div key={`pad-${idx}`} />;
          }
          const shift = shiftMap.get(date);
          const hasDouhan = (douhanMap.get(date)?.length ?? 0) > 0;
          const hasPlan = (planMap.get(date)?.length ?? 0) > 0;
          const isToday = date === today;
          const isPast = date < today;
          const dow = new Date(date).getDay();
          const isWorking = shift?.status === "working";

          return (
            <button
              key={date}
              type="button"
              onClick={() => handleCellTap(date)}
              className={cn(
                "relative aspect-square flex flex-col items-center justify-center rounded-xl text-[13px] font-medium transition-all active:scale-95",
                isWorking
                  ? "bg-wine-deep text-pearl-light shadow-luxe"
                  : shift?.status === "off"
                    ? "bg-pearl-soft border border-ink/[0.08] text-ink-mute"
                    : "hover:bg-pearl-soft text-ink",
                isToday && !shift && "ring-2 ring-amethyst/40 ring-offset-1",
                isPast && !shift && "opacity-50",
                dow === 0 && !shift && "text-wine-deep-400",
                dow === 6 && !shift && "text-sky-400",
              )}
            >
              <span>{parseYMD(date).getDate()}</span>
              {isWorking && (
                <span className="text-[9px] opacity-80 leading-tight">
                  {shift?.startTime ?? "出勤"}
                </span>
              )}
              {hasDouhan && (
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-gold" />
              )}
              {hasPlan && (
                <span
                  className={cn(
                    "absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full",
                    isWorking ? "bg-pearl-light/85" : "bg-wine-deep",
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-1 text-[10px] text-ink-mute">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-wine-deep inline-block" />
          出勤
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-pearl-soft border border-ink/[0.08] inline-block" />
          公休
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
          同伴あり
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-wine-deep inline-block" />
          予定あり
        </span>
      </div>

      {/* Edit sheet */}
      {selected && editEntry && (
        <ShiftEditSheet
          entry={editEntry}
          onSave={handleSave}
          onCancel={handleCancel}
          customers={customers}
          douhans={douhanMap.get(selected) ?? []}
          plans={planMap.get(selected) ?? []}
          onAddPlan={(data) => handleAddPlan(selected, data)}
          onUpdatePlan={(id, data) => handleUpdatePlan(id, selected, data)}
          onDeletePlan={handleDeletePlan}
        />
      )}
    </div>
  );
}

function ShiftEditSheet({
  entry,
  onSave,
  onCancel,
  customers,
  douhans,
  plans,
  onAddPlan,
  onUpdatePlan,
  onDeletePlan,
}: {
  entry: ShiftEntry;
  onSave: (e: ShiftEntry) => void;
  onCancel: () => void;
  customers: Customer[];
  douhans: Douhan[];
  plans: PlanEntry[];
  onAddPlan: (data: PlanInput) => void;
  onUpdatePlan: (id: string, data: PlanInput) => void;
  onDeletePlan: (id: string) => void;
}) {
  const [status, setStatus] = useState<ShiftStatus>(entry.status === "unknown" ? "working" : entry.status);
  const [startTime, setStartTime] = useState(entry.startTime ?? "20:00");
  const [endTime, setEndTime] = useState(entry.endTime ?? "01:00");
  const [note, setNote] = useState(entry.note ?? "");

  // 予定フォーム state
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planTime, setPlanTime] = useState("");
  const [planTitle, setPlanTitle] = useState("");
  const [planNote, setPlanNote] = useState("");

  const startAddPlan = () => {
    setEditingPlanId(null);
    setPlanTime("");
    setPlanTitle("");
    setPlanNote("");
    setShowPlanForm(true);
  };
  const startEditPlan = (p: PlanEntry) => {
    setEditingPlanId(p.id);
    setPlanTime(p.time ?? "");
    setPlanTitle(p.title);
    setPlanNote(p.note ?? "");
    setShowPlanForm(true);
  };
  const cancelPlanForm = () => {
    setShowPlanForm(false);
    setEditingPlanId(null);
  };
  const submitPlan = () => {
    const title = planTitle.trim();
    if (!title) return;
    const data: PlanInput = {
      time: planTime || undefined,
      title,
      note: planNote.trim() || undefined,
    };
    if (editingPlanId) onUpdatePlan(editingPlanId, data);
    else onAddPlan(data);
    setShowPlanForm(false);
    setEditingPlanId(null);
  };

  const dateObj = parseYMD(entry.date);
  const label = `${dateObj.getMonth() + 1}/${dateObj.getDate()}（${DOW[dateObj.getDay()]}）`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-[520px] max-h-[88vh] overflow-y-auto bg-pearl rounded-t-3xl p-5 pb-safe space-y-4 shadow-warm animate-slide-up">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-[18px] leading-tight font-medium tracking-[0.02em] text-ink">{label}</h3>
          <button type="button" onClick={onCancel} className="w-8 h-8 rounded-full bg-pearl-soft flex items-center justify-center text-ink-soft">
            <X size={16} />
          </button>
        </div>

        {/* Status toggle */}
        <div className="flex gap-2">
          {(["working", "off"] as ShiftStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn(
                "flex-1 h-10 rounded-2xl border text-body-sm font-medium transition-all",
                status === s
                  ? s === "working"
                    ? "bg-wine-deep text-pearl-light border-gold/40"
                    : "bg-pearl-soft border-ink/[0.08] text-ink"
                  : "bg-pearl-warm border-ink/[0.06] text-ink-soft hover:border-wine-deep/30",
              )}
            >
              {STATUS_STYLE[s].label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onSave({ ...entry, status: "unknown" })}
            className="px-3 h-10 rounded-2xl border border-ink/[0.06] text-body-sm text-ink-mute hover:bg-pearl-soft"
          >
            削除
          </button>
        </div>

        {/* Time pickers (working only) */}
        {status === "working" && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-label-sm text-ink-soft">開始時間</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full h-11 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-md text-ink"
                style={{ fontSize: "16px" }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-label-sm text-ink-soft">終了時間</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full h-11 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-md text-ink"
                style={{ fontSize: "16px" }}
              />
            </div>
          </div>
        )}

        {/* Note */}
        <div className="space-y-1">
          <label className="text-label-sm text-ink-soft">メモ（任意）</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例: 早上がり予定"
            className="w-full h-11 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-md text-ink placeholder:text-ink-mute"
            style={{ fontSize: "16px" }}
          />
        </div>

        <button
          type="button"
          onClick={() => onSave({ date: entry.date, status, startTime: status === "working" ? startTime : undefined, endTime: status === "working" ? endTime : undefined, note: note || undefined })}
          className="w-full h-12 rounded-2xl bg-wine-deep text-pearl-light font-semibold tracking-[0.04em] text-body-md"
        >
          出勤・公休を保存
        </button>

        {/* ── 予定 (複数登録可) ── */}
        <div className="pt-1 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-label-sm text-ink-soft">予定</p>
            {!showPlanForm && (
              <button
                type="button"
                onClick={startAddPlan}
                className="flex items-center gap-1 text-[12px] font-medium text-wine-deep"
              >
                <Plus size={14} strokeWidth={2} /> 予定を追加
              </button>
            )}
          </div>

          {plans.length === 0 && !showPlanForm && (
            <p className="text-body-sm text-ink-mute">まだ予定はありません</p>
          )}

          {plans.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 rounded-2xl bg-pearl-warm border border-ink/[0.06] px-3 py-2"
            >
              <span className="font-display tabular-nums text-[14px] text-wine-deep min-w-[46px]">
                {p.time ?? "終日"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-body-sm text-ink truncate">{p.title}</div>
                {p.note && (
                  <div className="text-[11px] text-ink-mute truncate">{p.note}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => startEditPlan(p)}
                aria-label="予定を編集"
                className="p-1.5 rounded-full text-ink-soft hover:bg-pearl-soft"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => onDeletePlan(p.id)}
                aria-label="予定を削除"
                className="p-1.5 rounded-full text-ink-mute hover:bg-pearl-soft"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {showPlanForm && (
            <div className="rounded-2xl bg-champagne-soft/50 border border-gold/20 p-3 space-y-2">
              <div className="grid grid-cols-[88px_1fr] gap-2">
                <input
                  type="time"
                  value={planTime}
                  onChange={(e) => setPlanTime(e.target.value)}
                  className="h-10 rounded-xl border border-ink/[0.06] bg-pearl px-2 text-body-sm text-ink"
                  style={{ fontSize: "16px" }}
                />
                <input
                  type="text"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  placeholder="予定（例: 同伴 / アフター / 私用）"
                  className="h-10 rounded-xl border border-ink/[0.06] bg-pearl px-3 text-body-sm text-ink placeholder:text-ink-mute"
                  style={{ fontSize: "16px" }}
                />
              </div>
              <input
                type="text"
                value={planNote}
                onChange={(e) => setPlanNote(e.target.value)}
                placeholder="メモ（任意）"
                className="w-full h-10 rounded-xl border border-ink/[0.06] bg-pearl px-3 text-body-sm text-ink placeholder:text-ink-mute"
                style={{ fontSize: "16px" }}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={cancelPlanForm}
                  className="flex-1 h-10 rounded-xl border border-ink/[0.06] text-body-sm text-ink-soft hover:bg-pearl-soft"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={submitPlan}
                  disabled={!planTitle.trim()}
                  className="flex-1 h-10 rounded-xl bg-wine-deep text-pearl-light text-body-sm font-medium disabled:opacity-40"
                >
                  {editingPlanId ? "更新" : "追加"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* この日の同伴 (読み取り専用) */}
        {douhans.length > 0 && (
          <div className="rounded-2xl bg-champagne-soft/60 px-3 py-2.5 space-y-1">
            <p className="text-[11px] font-medium text-ink-soft">この日の同伴</p>
            {douhans.map((d) => {
              const cust = customers.find((c) => c.id === d.customer_id);
              return (
                <div key={d.id} className="text-body-sm text-ink">
                  {cust?.name ?? "不明"} — {d.note ?? "（メモなし）"}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
