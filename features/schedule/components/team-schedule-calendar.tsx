"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import { cn, formatCustomerName } from "@/lib/utils";
import { type ShiftEntry, loadSchedule } from "@/lib/nightos/schedule-store";
import { loadAllDouhans } from "@/lib/nightos/douhan-store";
import { pullCastSchedule } from "@/lib/nightos/schedule-sync";
import {
  OWN_LAYER_COLOR,
  colorForCast,
  getMockShiftsForCast,
  loadVisibleLayers,
  saveVisibleLayers,
} from "@/lib/nightos/team-schedule-store";
import type { Customer, Douhan } from "@/types/nightos";

const DOW = ["日", "月", "火", "水", "木", "金", "土"];

interface TeamCalCast {
  id: string;
  name: string;
}

interface Props {
  /** マネージャー本人の cast id (= 「自分」レイヤー)。 */
  managerId: string;
  /** 配下キャスト (選択して重ねられるレイヤー)。 */
  casts: TeamCalCast[];
  /** 同伴の顧客名解決用。自分 + 配下の担当顧客。 */
  customers: Customer[];
  /** 「今日」 YYYY-MM-DD。mock では MOCK_TODAY を渡す。 */
  today: string;
}

/** 1 レイヤー = 自分 or 配下キャスト 1 人。 */
interface Layer {
  id: string;
  label: string;
  color: string;
  isOwn: boolean;
}

/** カレンダー上の 1 予定 (閲覧専用)。 */
interface CalEvent {
  layerId: string;
  layerLabel: string;
  color: string;
  kind: "shift" | "douhan";
  sort: string; // 並び替え用の時刻文字列
  time?: string;
  title: string;
  sub?: string;
}

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseYMD(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function TeamScheduleCalendar({
  managerId,
  casts,
  customers,
  today,
}: Props) {
  const initial = parseYMD(today);
  const [viewYear, setViewYear] = useState(() => initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => initial.getMonth());
  // 同伴は全キャスト分が 1 つの key に入っている (cast_id で絞る)。
  const [douhans, setDouhans] = useState<Douhan[]>([]);
  // 自分の出勤シフトは本人端末ローカル。配下キャストは mock 生成 (下で month 毎)。
  const [ownShifts, setOwnShifts] = useState<ShiftEntry[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  // レイヤー定義 — 「自分」を先頭に、配下キャストを色付きで。
  const layers: Layer[] = useMemo(() => {
    const own: Layer = {
      id: managerId,
      label: "自分",
      color: OWN_LAYER_COLOR,
      isOwn: true,
    };
    const rest = casts.map((c, i) => ({
      id: c.id,
      label: c.name,
      color: colorForCast(i),
      isOwn: false,
    }));
    return [own, ...rest];
  }, [managerId, casts]);

  // 可視レイヤー (ON/OFF)。未保存なら既定で全 ON。
  const [visible, setVisible] = useState<Set<string>>(() => new Set());
  const hydrated = useRef(false);
  useEffect(() => {
    const saved = loadVisibleLayers();
    const allIds = layers.map((l) => l.id);
    if (saved) {
      // 既存レイヤーに残っているものだけ採用 (退職等で消えた id を除外)。
      setVisible(new Set(saved.filter((id) => allIds.includes(id))));
    } else {
      setVisible(new Set(allIds));
    }
    hydrated.current = true;
  }, [layers]);

  // データ読み込み — まず localStorage、その後サーバーと突き合わせ。
  useEffect(() => {
    setOwnShifts(loadSchedule());
    setDouhans(loadAllDouhans());
    let cancelled = false;
    void pullCastSchedule().then((applied) => {
      if (applied && !cancelled) {
        setOwnShifts(loadSchedule());
        setDouhans(loadAllDouhans());
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleLayer = (id: string) => {
    setVisible((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (hydrated.current) saveVisibleLayers(Array.from(next));
      return next;
    });
  };

  // 月内の全予定を date → CalEvent[] に集約 (可視レイヤーのみ)。
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
    const push = (date: string, ev: CalEvent) => {
      if (!date.startsWith(monthPrefix)) return;
      const arr = map.get(date) ?? [];
      arr.push(ev);
      map.set(date, arr);
    };

    for (const layer of layers) {
      if (!visible.has(layer.id)) continue;

      // 出勤シフト
      const shifts = layer.isOwn
        ? ownShifts.filter((s) => s.status === "working")
        : getMockShiftsForCast(layer.id, viewYear, viewMonth);
      for (const s of shifts) {
        if (s.status !== "working") continue;
        const range = s.startTime
          ? `${s.startTime}${s.endTime ? `〜${s.endTime}` : ""}`
          : undefined;
        push(s.date, {
          layerId: layer.id,
          layerLabel: layer.label,
          color: layer.color,
          kind: "shift",
          sort: s.startTime ?? "20:00",
          time: s.startTime,
          title: "出勤",
          sub: [range, s.note].filter(Boolean).join(" · ") || undefined,
        });
      }

      // 同伴 (顧客に紐づく予定 = 担当が関わる予定)
      const myDouhans = douhans.filter(
        (d) => d.cast_id === layer.id && d.status !== "cancelled",
      );
      for (const d of myDouhans) {
        const cust = customers.find((c) => c.id === d.customer_id);
        push(d.date, {
          layerId: layer.id,
          layerLabel: layer.label,
          color: layer.color,
          kind: "douhan",
          sort: d.time ?? "18:00",
          time: d.time ?? undefined,
          title: cust ? `${formatCustomerName(cust.name)}さま` : "同伴",
          sub: d.note ?? undefined,
        });
      }
    }

    map.forEach((arr) => arr.sort((a, b) => a.sort.localeCompare(b.sort)));
    return map;
  }, [layers, visible, ownShifts, douhans, customers, viewYear, viewMonth]);

  // カレンダーグリッド
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

  // この月に表示中の予定がある日数 (サマリー用)
  const activeDayCount = useMemo(() => {
    let n = 0;
    eventsByDate.forEach((arr) => {
      if (arr.length > 0) n++;
    });
    return n;
  }, [eventsByDate]);

  return (
    <div className="space-y-4">
      {/* カレンダー (レイヤー) パネル — Google カレンダー風の ON/OFF */}
      <div className="rounded-2xl bg-pearl-warm border border-ink/[0.06] p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-label-xs tracking-luxe text-gold-deep uppercase">
            表示するカレンダー
          </span>
          <span className="text-[10px] text-ink-mute">
            {casts.length + 1}件
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {layers.map((layer) => {
            const on = visible.has(layer.id);
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => toggleLayer(layer.id)}
                aria-pressed={on}
                className={cn(
                  "group flex items-center gap-1.5 rounded-full pl-1.5 pr-2.5 py-1 border transition-all",
                  on
                    ? "border-ink/[0.12] bg-pearl"
                    : "border-ink/[0.06] bg-transparent opacity-50",
                )}
              >
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: on ? layer.color : "transparent",
                    border: on ? "none" : `1.5px solid ${layer.color}`,
                  }}
                >
                  {on && <Check size={11} className="text-pearl-light" strokeWidth={3} />}
                </span>
                <span
                  className={cn(
                    "text-[12px] font-medium",
                    on ? "text-ink" : "text-ink-mute line-through",
                    layer.isOwn && "font-semibold",
                  )}
                >
                  {layer.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 月ナビ */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={prevMonth}
          aria-label="前の月"
          className="p-2 rounded-full hover:bg-pearl-soft text-ink-soft"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <div className="font-serif text-[22px] leading-tight font-medium tracking-[0.02em] text-ink">
            {viewYear}年{viewMonth + 1}月
          </div>
          <div className="text-label-xs tracking-luxe text-ink-mute uppercase mt-0.5">
            予定 {activeDayCount}日
          </div>
        </div>
        <button
          type="button"
          onClick={nextMonth}
          aria-label="次の月"
          className="p-2 rounded-full hover:bg-pearl-soft text-ink-soft"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-0.5">
        {DOW.map((d, i) => (
          <div
            key={d}
            className={cn(
              "text-center text-[11px] font-medium py-1",
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

      {/* グリッド */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((date, idx) => {
          if (!date) return <div key={`pad-${idx}`} />;
          const evs = eventsByDate.get(date) ?? [];
          // 日のドットはレイヤー単位 (同じ人の複数予定は 1 ドット)。
          const layerColors: string[] = [];
          for (const ev of evs) {
            if (!layerColors.includes(ev.color)) layerColors.push(ev.color);
          }
          const isToday = date === today;
          const isPast = date < today;
          const dow = new Date(date).getDay();

          return (
            <button
              key={date}
              type="button"
              onClick={() => setSelected(date)}
              className={cn(
                "relative aspect-square flex flex-col items-center justify-start pt-1.5 rounded-xl text-[13px] font-medium transition-all active:scale-95 hover:bg-pearl-soft",
                isToday && "ring-2 ring-wine-deep/40 ring-offset-1",
                isPast && layerColors.length === 0 && "opacity-45",
                dow === 0 && "text-wine-deep-400",
                dow === 6 && "text-sky-400",
              )}
            >
              <span className="leading-none text-ink">{parseYMD(date).getDate()}</span>
              {layerColors.length > 0 && (
                <span className="flex flex-wrap items-center justify-center gap-0.5 mt-1 px-0.5 max-w-full">
                  {layerColors.slice(0, 4).map((c, i) => (
                    <span
                      key={`${c}-${i}`}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: c }}
                    />
                  ))}
                  {layerColors.length > 4 && (
                    <span className="text-[8px] leading-none text-ink-mute">
                      +{layerColors.length - 4}
                    </span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 凡例 */}
      <p className="text-[10px] text-ink-mute px-1 leading-relaxed">
        色は担当者ごとのカレンダー。日付をタップすると、その日の出勤・同伴の予定（閲覧専用）が見られます。
      </p>

      {/* 日詳細シート (閲覧専用) */}
      {selected && (
        <DaySheet
          date={selected}
          events={eventsByDate.get(selected) ?? []}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

// ───────────────────────── Day sheet (read-only) ─────────────────────────

const KIND_LABEL: Record<CalEvent["kind"], string> = {
  shift: "出勤",
  douhan: "同伴",
};

function DaySheet({
  date,
  events,
  onClose,
}: {
  date: string;
  events: CalEvent[];
  onClose: () => void;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragging = useRef(false);
  const [dragY, setDragY] = useState(0);

  const onDragStart = (clientY: number) => {
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
    if (dragY > 110) onClose();
    else setDragY(0);
  };

  const dateObj = parseYMD(date);
  const label = `${dateObj.getMonth() + 1}/${dateObj.getDate()}（${DOW[dateObj.getDay()]}）`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
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
        className="w-full max-w-[520px] max-h-[80vh] overflow-y-auto bg-pearl rounded-t-3xl px-5 pb-safe pb-5 space-y-4 shadow-warm animate-slide-up touch-pan-y"
      >
        <div className="sticky top-0 -mx-5 px-5 pt-2.5 pb-2 bg-pearl flex justify-center">
          <span className="w-10 h-1 rounded-full bg-ink/20" />
        </div>

        <div className="flex items-center justify-between">
          <h3 className="font-serif text-[18px] leading-tight font-medium tracking-[0.02em] text-ink">
            {label}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="w-8 h-8 rounded-full bg-pearl-soft flex items-center justify-center text-ink-soft"
          >
            <X size={16} />
          </button>
        </div>

        {events.length === 0 ? (
          <p className="text-body-sm text-ink-mute py-2">
            この日に表示中の予定はありません。
          </p>
        ) : (
          <div className="space-y-1.5">
            {events.map((ev, i) => (
              <div
                key={`${ev.layerId}-${ev.kind}-${i}`}
                className="flex items-stretch gap-3"
              >
                {/* time rail */}
                <div className="w-11 shrink-0 pt-2 text-right font-display tabular-nums text-[13px] text-wine-deep">
                  {ev.time ?? "—"}
                </div>
                {/* color rail */}
                <div className="flex flex-col items-center pt-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: ev.color }}
                  />
                  {i < events.length - 1 && (
                    <span className="flex-1 w-px bg-ink/[0.12] mt-1" />
                  )}
                </div>
                {/* content */}
                <div className="flex-1 min-w-0 rounded-2xl bg-pearl-warm border border-ink/[0.06] px-3 py-2 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="px-1.5 py-0.5 rounded-md text-[10px] font-medium text-pearl-light"
                      style={{ background: ev.color }}
                    >
                      {ev.layerLabel}
                    </span>
                    <span className="text-[10px] text-ink-mute">
                      {KIND_LABEL[ev.kind]}
                    </span>
                    <span className="text-body-sm text-ink truncate">
                      {ev.title}
                    </span>
                  </div>
                  {ev.sub && (
                    <div className="text-[11px] text-ink-mute truncate mt-0.5">
                      {ev.sub}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
