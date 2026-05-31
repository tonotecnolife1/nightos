"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
import {
  loadAllDouhans,
  upsertDouhan,
  deleteDouhan,
} from "@/lib/nightos/douhan-store";
import { CURRENT_STORE_ID } from "@/lib/nightos/constants";
import type { Customer, Douhan } from "@/types/nightos";

const DOW = ["日", "月", "火", "水", "木", "金", "土"];

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

  useEffect(() => {
    setSchedule(loadSchedule());
    setDouhans(loadAllDouhans().filter((d) => d.cast_id === castId));
    setPlans(loadPlansForCast(castId));
  }, [castId]);

  const refresh = useCallback(() => setSchedule(loadSchedule()), []);
  const refreshDouhans = useCallback(
    () => setDouhans(loadAllDouhans().filter((d) => d.cast_id === castId)),
    [castId],
  );
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
  while (cells.length % 7 !== 0) cells.push(null);

  const shiftMap = new Map(schedule.map((e) => [e.date, e]));
  const douhanMap = new Map<string, Douhan[]>();
  for (const d of douhans) {
    const existing = douhanMap.get(d.date) ?? [];
    existing.push(d);
    douhanMap.set(d.date, existing);
  }
  const planMap = new Map<string, PlanEntry[]>();
  for (const p of plans) {
    const existing = planMap.get(p.date) ?? [];
    existing.push(p);
    planMap.set(p.date, existing);
  }

  const handleSaveShift = (entry: ShiftEntry) => {
    if (entry.status === "unknown") {
      removeShift(entry.date);
    } else {
      upsertShift(entry);
    }
    refresh();
  };

  const handleAddDouhan = (
    date: string,
    customerId: string,
    note: string,
    time?: string,
  ) => {
    const entry: Douhan = {
      id: `d_${Date.now()}`,
      cast_id: castId,
      customer_id: customerId,
      store_id: CURRENT_STORE_ID,
      date,
      time: time || null,
      note: note || null,
      status: "scheduled",
      created_at: new Date().toISOString(),
    };
    upsertDouhan(entry);
    refreshDouhans();
  };
  const handleUpdateDouhan = (d: Douhan) => {
    upsertDouhan(d);
    refreshDouhans();
  };
  const handleDeleteDouhan = (id: string) => {
    deleteDouhan(id);
    refreshDouhans();
  };

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
              onClick={() => setSelected(date)}
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
              <span className="leading-none">{parseYMD(date).getDate()}</span>
              {isWorking && (
                <span className="text-[9px] opacity-80 leading-none mt-0.5">
                  {shift?.startTime ?? "出勤"}
                </span>
              )}
              {(hasDouhan || hasPlan) && (
                <span className="flex items-center gap-1 mt-1">
                  {hasDouhan && (
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                  )}
                  {hasPlan && (
                    <span className="w-1.5 h-1.5 rounded-full bg-wine-soft" />
                  )}
                </span>
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
          <span className="w-1.5 h-1.5 rounded-full bg-wine-soft inline-block" />
          予定あり
        </span>
      </div>

      {/* Day sheet */}
      {selected && (
        <DaySheet
          date={selected}
          shift={shiftMap.get(selected) ?? { date: selected, status: "unknown" }}
          douhans={douhanMap.get(selected) ?? []}
          plans={planMap.get(selected) ?? []}
          customers={customers}
          onCancel={() => setSelected(null)}
          onSaveShift={handleSaveShift}
          onAddDouhan={(cid, note, time) => handleAddDouhan(selected, cid, note, time)}
          onUpdateDouhan={handleUpdateDouhan}
          onDeleteDouhan={handleDeleteDouhan}
          onAddPlan={(data) => handleAddPlan(selected, data)}
          onUpdatePlan={(id, data) => handleUpdatePlan(id, selected, data)}
          onDeletePlan={handleDeletePlan}
        />
      )}
    </div>
  );
}

// ───────────────────────── Day sheet ─────────────────────────

type Screen = "timeline" | "picker" | "form";
type FormKind = "shift" | "douhan" | "plan";

/** タイムライン1行ぶんの正規化データ */
type DayItem =
  | { kind: "shift"; sort: string; time?: string; title: string; sub?: string }
  | { kind: "douhan"; sort: string; time?: string; title: string; sub?: string; ref: Douhan }
  | { kind: "plan"; sort: string; time?: string; title: string; sub?: string; ref: PlanEntry };

const KIND_META: Record<FormKind, { label: string; chip: string }> = {
  shift: { label: "出勤", chip: "bg-wine-deep text-pearl-light" },
  douhan: { label: "同伴", chip: "bg-gold/25 text-wine-deep" },
  plan: { label: "その他", chip: "bg-pearl-soft text-ink-soft" },
};

function DaySheet({
  date,
  shift,
  douhans,
  plans,
  customers,
  onCancel,
  onSaveShift,
  onAddDouhan,
  onUpdateDouhan,
  onDeleteDouhan,
  onAddPlan,
  onUpdatePlan,
  onDeletePlan,
}: {
  date: string;
  shift: ShiftEntry;
  douhans: Douhan[];
  plans: PlanEntry[];
  customers: Customer[];
  onCancel: () => void;
  onSaveShift: (e: ShiftEntry) => void;
  onAddDouhan: (customerId: string, note: string, time?: string) => void;
  onUpdateDouhan: (d: Douhan) => void;
  onDeleteDouhan: (id: string) => void;
  onAddPlan: (data: PlanInput) => void;
  onUpdatePlan: (id: string, data: PlanInput) => void;
  onDeletePlan: (id: string) => void;
}) {
  const [screen, setScreen] = useState<Screen>("timeline");
  const [formKind, setFormKind] = useState<FormKind>("shift");

  // ドラッグで閉じる (下スワイプ / 下ドラッグ)
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragging = useRef(false);
  const [dragY, setDragY] = useState(0);

  const onDragStart = (clientY: number) => {
    // スクロール最上部からのみドラッグ開始 (中身スクロールと両立)
    if ((sheetRef.current?.scrollTop ?? 0) > 0) return;
    dragStartY.current = clientY;
    dragging.current = true;
  };
  const onDragMove = (clientY: number) => {
    if (!dragging.current || dragStartY.current === null) return;
    const dy = clientY - dragStartY.current;
    if (dy > 0) setDragY(dy);
    else {
      dragging.current = false;
      setDragY(0);
    }
  };
  const onDragEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (dragY > 110) onCancel();
    else setDragY(0);
  };

  // shift form
  const [status, setStatus] = useState<ShiftStatus>("working");
  const [startTime, setStartTime] = useState("20:00");
  const [endTime, setEndTime] = useState("01:00");
  const [shiftNote, setShiftNote] = useState("");

  // douhan form
  const [editingDouhanId, setEditingDouhanId] = useState<string | null>(null);
  const [douhanCustomerId, setDouhanCustomerId] = useState("");
  const [douhanTime, setDouhanTime] = useState("");
  const [douhanNote, setDouhanNote] = useState("");

  // plan form
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planTime, setPlanTime] = useState("");
  const [planTitle, setPlanTitle] = useState("");
  const [planNote, setPlanNote] = useState("");

  const dateObj = parseYMD(date);
  const label = `${dateObj.getMonth() + 1}/${dateObj.getDate()}（${DOW[dateObj.getDay()]}）`;

  // Build the time-ordered timeline of confirmed items
  const items: DayItem[] = [];
  if (shift.status === "working") {
    const range = shift.startTime
      ? `${shift.startTime}${shift.endTime ? `〜${shift.endTime}` : ""}`
      : undefined;
    items.push({
      kind: "shift",
      sort: shift.startTime ?? "20:00",
      time: shift.startTime,
      title: "出勤",
      sub: [range, shift.note].filter(Boolean).join(" · ") || undefined,
    });
  }
  for (const d of douhans) {
    const cust = customers.find((c) => c.id === d.customer_id);
    items.push({
      kind: "douhan",
      sort: d.time ?? "18:00",
      time: d.time ?? undefined,
      title: `${cust?.name ?? "不明"}さま`,
      sub: d.note ?? undefined,
      ref: d,
    });
  }
  for (const p of plans) {
    items.push({
      kind: "plan",
      sort: p.time ?? "99:99",
      time: p.time,
      title: p.title,
      sub: p.note,
      ref: p,
    });
  }
  items.sort((a, b) => a.sort.localeCompare(b.sort));

  // ── form openers ──
  const openPicker = () => setScreen("picker");

  const openShiftForm = () => {
    setFormKind("shift");
    setStatus(shift.status === "unknown" ? "working" : shift.status);
    setStartTime(shift.startTime ?? "20:00");
    setEndTime(shift.endTime ?? "01:00");
    setShiftNote(shift.note ?? "");
    setScreen("form");
  };
  const openDouhanForm = (d?: Douhan) => {
    setFormKind("douhan");
    setEditingDouhanId(d?.id ?? null);
    setDouhanCustomerId(d?.customer_id ?? "");
    setDouhanTime(d?.time ?? "");
    setDouhanNote(d?.note ?? "");
    setScreen("form");
  };
  const openPlanForm = (p?: PlanEntry) => {
    setFormKind("plan");
    setEditingPlanId(p?.id ?? null);
    setPlanTime(p?.time ?? "");
    setPlanTitle(p?.title ?? "");
    setPlanNote(p?.note ?? "");
    setScreen("form");
  };

  const pickKind = (kind: FormKind) => {
    if (kind === "shift") openShiftForm();
    else if (kind === "douhan") openDouhanForm();
    else openPlanForm();
  };

  const editItem = (it: DayItem) => {
    if (it.kind === "shift") openShiftForm();
    else if (it.kind === "douhan") openDouhanForm(it.ref);
    else openPlanForm(it.ref);
  };

  // ── form submitters (return to timeline) ──
  const submitShift = () => {
    onSaveShift({
      date,
      status,
      startTime: status === "working" ? startTime : undefined,
      endTime: status === "working" ? endTime : undefined,
      note: shiftNote || undefined,
    });
    setScreen("timeline");
  };
  const deleteShift = () => {
    onSaveShift({ date, status: "unknown" });
    setScreen("timeline");
  };
  const submitDouhan = () => {
    if (!douhanCustomerId) return;
    if (editingDouhanId) {
      const original = douhans.find((d) => d.id === editingDouhanId);
      if (original) {
        onUpdateDouhan({
          ...original,
          customer_id: douhanCustomerId,
          time: douhanTime || null,
          note: douhanNote || null,
        });
      }
    } else {
      onAddDouhan(douhanCustomerId, douhanNote, douhanTime || undefined);
    }
    setScreen("timeline");
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
    setScreen("timeline");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => onDragStart(e.touches[0].clientY)}
        onTouchMove={(e) => onDragMove(e.touches[0].clientY)}
        onTouchEnd={onDragEnd}
        style={{
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          transition: dragging.current ? "none" : "transform 0.25s ease",
        }}
        className="w-full max-w-[520px] max-h-[88vh] overflow-y-auto bg-pearl rounded-t-3xl px-5 pb-safe pb-5 space-y-4 shadow-warm animate-slide-up touch-pan-y"
      >
        {/* Drag handle — 下スワイプで閉じる */}
        <div className="sticky top-0 -mx-5 px-5 pt-2.5 pb-2 bg-pearl flex justify-center">
          <span className="w-10 h-1 rounded-full bg-ink/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {screen !== "timeline" && (
              <button
                type="button"
                onClick={() => setScreen("timeline")}
                aria-label="戻る"
                className="w-8 h-8 -ml-1 rounded-full flex items-center justify-center text-ink-soft hover:bg-pearl-soft"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <h3 className="font-serif text-[18px] leading-tight font-medium tracking-[0.02em] text-ink">
              {label}
            </h3>
          </div>
          <button type="button" onClick={onCancel} className="w-8 h-8 rounded-full bg-pearl-soft flex items-center justify-center text-ink-soft">
            <X size={16} />
          </button>
        </div>

        {screen === "timeline" && (
          <>
            {shift.status === "off" && (
              <button
                type="button"
                onClick={openShiftForm}
                className="w-full flex items-center justify-between rounded-2xl bg-pearl-soft border border-ink/[0.08] px-3 py-2.5"
              >
                <span className="text-body-sm font-medium text-ink-soft">公休</span>
                <Pencil size={14} className="text-ink-mute" />
              </button>
            )}

            {items.length === 0 && shift.status !== "off" ? (
              <p className="text-body-sm text-ink-mute py-2">
                確定した予定はありません。下のボタンから登録できます。
              </p>
            ) : (
              <div className="space-y-1.5">
                {items.map((it, i) => {
                  const meta = KIND_META[it.kind];
                  return (
                    <button
                      key={`${it.kind}-${i}`}
                      type="button"
                      onClick={() => editItem(it)}
                      className="w-full flex items-stretch gap-3 text-left"
                    >
                      {/* time rail */}
                      <div className="w-11 shrink-0 pt-2 text-right font-display tabular-nums text-[13px] text-wine-deep">
                        {it.time ?? "—"}
                      </div>
                      <div className="flex flex-col items-center pt-2.5">
                        <span className="w-2 h-2 rounded-full bg-wine-deep" />
                        {i < items.length - 1 && (
                          <span className="flex-1 w-px bg-ink/[0.12] mt-1" />
                        )}
                      </div>
                      {/* content */}
                      <div className="flex-1 min-w-0 rounded-2xl bg-pearl-warm border border-ink/[0.06] px-3 py-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className={cn("px-1.5 py-0.5 rounded-md text-[10px] font-medium", meta.chip)}>
                            {meta.label}
                          </span>
                          <span className="text-body-sm text-ink truncate">{it.title}</span>
                          <Pencil size={12} className="ml-auto shrink-0 text-ink-mute" />
                        </div>
                        {it.sub && (
                          <div className="text-[11px] text-ink-mute truncate mt-0.5">{it.sub}</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={openPicker}
              className="w-full h-12 rounded-2xl bg-wine-deep text-pearl-light font-semibold tracking-[0.04em] text-body-md flex items-center justify-center gap-1.5"
            >
              <Plus size={16} strokeWidth={2} /> 新規で予定を登録
            </button>
          </>
        )}

        {screen === "picker" && (
          <div className="space-y-2">
            <p className="text-label-sm text-ink-soft">登録する予定の種類</p>
            {(["shift", "douhan", "plan"] as FormKind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => pickKind(k)}
                className="w-full flex items-center gap-3 rounded-2xl bg-pearl-warm border border-ink/[0.06] px-4 h-14 hover:border-wine-deep/30 transition-all"
              >
                <span className={cn("px-2 py-1 rounded-md text-[11px] font-medium", KIND_META[k].chip)}>
                  {KIND_META[k].label}
                </span>
                <span className="text-body-md text-ink">
                  {k === "shift" ? "出勤・公休を登録" : k === "douhan" ? "同伴を登録" : "その他の予定を登録"}
                </span>
                <ChevronRight size={18} className="ml-auto text-ink-mute" />
              </button>
            ))}
          </div>
        )}

        {screen === "form" && formKind === "shift" && (
          <>
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
                  {s === "working" ? "出勤" : "公休"}
                </button>
              ))}
            </div>

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

            <div className="space-y-1">
              <label className="text-label-sm text-ink-soft">メモ（任意）</label>
              <input
                type="text"
                value={shiftNote}
                onChange={(e) => setShiftNote(e.target.value)}
                placeholder="例: 早上がり予定"
                className="w-full h-11 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-md text-ink placeholder:text-ink-mute"
                style={{ fontSize: "16px" }}
              />
            </div>

            <div className="flex gap-2">
              {shift.status !== "unknown" && (
                <button
                  type="button"
                  onClick={deleteShift}
                  className="px-4 h-12 rounded-2xl border border-ink/[0.06] text-body-sm text-ink-mute hover:bg-pearl-soft"
                >
                  削除
                </button>
              )}
              <button
                type="button"
                onClick={submitShift}
                className="flex-1 h-12 rounded-2xl bg-wine-deep text-pearl-light font-semibold tracking-[0.04em] text-body-md"
              >
                保存
              </button>
            </div>
          </>
        )}

        {screen === "form" && formKind === "douhan" && (
          <>
            <div className="space-y-1">
              <label className="text-label-sm text-ink-soft">お客様（必須）</label>
              <select
                value={douhanCustomerId}
                onChange={(e) => setDouhanCustomerId(e.target.value)}
                className="w-full h-11 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-md text-ink focus:outline-none focus:border-wine-deep"
                style={{ fontSize: "16px" }}
              >
                <option value="" disabled>
                  お客様を選ぶ
                </option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-[120px_1fr] gap-2">
              <div className="space-y-1">
                <label className="text-label-sm text-ink-soft">時間（任意）</label>
                <input
                  type="time"
                  value={douhanTime}
                  onChange={(e) => setDouhanTime(e.target.value)}
                  className="w-full h-11 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-md text-ink"
                  style={{ fontSize: "16px" }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-label-sm text-ink-soft">場所やメモ（任意）</label>
                <input
                  type="text"
                  value={douhanNote}
                  onChange={(e) => setDouhanNote(e.target.value)}
                  placeholder="例: 〇〇で待ち合わせ"
                  className="w-full h-11 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-md text-ink placeholder:text-ink-mute"
                  style={{ fontSize: "16px" }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              {editingDouhanId && (
                <button
                  type="button"
                  onClick={() => {
                    onDeleteDouhan(editingDouhanId);
                    setScreen("timeline");
                  }}
                  className="px-4 h-12 rounded-2xl border border-ink/[0.06] text-body-sm text-ink-mute hover:bg-pearl-soft"
                >
                  削除
                </button>
              )}
              <button
                type="button"
                onClick={submitDouhan}
                disabled={!douhanCustomerId}
                className="flex-1 h-12 rounded-2xl bg-wine-deep text-pearl-light font-semibold tracking-[0.04em] text-body-md disabled:opacity-40"
              >
                {editingDouhanId ? "更新" : "同伴を登録"}
              </button>
            </div>
          </>
        )}

        {screen === "form" && formKind === "plan" && (
          <>
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <div className="space-y-1">
                <label className="text-label-sm text-ink-soft">時間（任意）</label>
                <input
                  type="time"
                  value={planTime}
                  onChange={(e) => setPlanTime(e.target.value)}
                  className="w-full h-11 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-md text-ink"
                  style={{ fontSize: "16px" }}
                />
              </div>
              <div className="space-y-1">
                <label className="text-label-sm text-ink-soft">予定（必須）</label>
                <input
                  type="text"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  placeholder="例: アフター / 私用 / 美容院"
                  className="w-full h-11 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-md text-ink placeholder:text-ink-mute"
                  style={{ fontSize: "16px" }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-label-sm text-ink-soft">メモ（任意）</label>
              <input
                type="text"
                value={planNote}
                onChange={(e) => setPlanNote(e.target.value)}
                placeholder="補足があれば"
                className="w-full h-11 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-md text-ink placeholder:text-ink-mute"
                style={{ fontSize: "16px" }}
              />
            </div>

            <div className="flex gap-2">
              {editingPlanId && (
                <button
                  type="button"
                  onClick={() => {
                    onDeletePlan(editingPlanId);
                    setScreen("timeline");
                  }}
                  className="px-4 h-12 rounded-2xl border border-ink/[0.06] text-body-sm text-ink-mute hover:bg-pearl-soft"
                >
                  削除
                </button>
              )}
              <button
                type="button"
                onClick={submitPlan}
                disabled={!planTitle.trim()}
                className="flex-1 h-12 rounded-2xl bg-wine-deep text-pearl-light font-semibold tracking-[0.04em] text-body-md disabled:opacity-40"
              >
                {editingPlanId ? "更新" : "登録"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
