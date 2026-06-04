"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn, formatCustomerName } from "@/lib/utils";
import { type ShiftEntry, loadSchedule } from "@/lib/nightos/schedule-store";
import { type PlanEntry, loadPlansForCast } from "@/lib/nightos/plan-store";
import { loadAllDouhans } from "@/lib/nightos/douhan-store";
import { pullCastSchedule } from "@/lib/nightos/schedule-sync";
import {
  type TeamCalView,
  OWN_LAYER_COLOR,
  colorForCast,
  getMockShiftForCastDate,
  loadCalView,
  loadVisibleLayers,
  saveCalView,
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

type EventKind = "shift" | "douhan" | "plan";

/** カレンダー上の 1 予定 (閲覧専用)。 */
interface CalEvent {
  layerId: string;
  layerLabel: string;
  color: string;
  isOwn: boolean;
  kind: EventKind;
  sort: string; // 並び替え用の時刻文字列
  time?: string;
  title: string;
  sub?: string;
}

const KIND_ORDER: Record<EventKind, number> = { shift: 0, douhan: 1, plan: 2 };
const KIND_LABEL: Record<EventKind, string> = {
  shift: "出勤",
  douhan: "同伴",
  plan: "その他",
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
function toYMD(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function parseYMD(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}
function startOfWeek(d: Date): Date {
  return addDays(d, -d.getDay()); // 日曜始まり
}

// ─────────────────── 種類マーカー (色=担当者 / 形=種類) ───────────────────

function EventMarker({
  color,
  kind,
  isOwn,
  size = "sm",
}: {
  color: string;
  kind: EventKind;
  isOwn: boolean;
  size?: "sm" | "rail";
}) {
  const ring = isOwn
    ? { boxShadow: "0 0 0 1px #faf7f2, 0 0 0 2px rgba(43,35,42,0.35)" }
    : undefined;
  const dim = size === "rail" ? 9 : 7;
  if (kind === "shift") {
    return (
      <span
        className="inline-block shrink-0 rounded-full"
        style={{ width: dim, height: dim, background: color, ...ring }}
      />
    );
  }
  if (kind === "douhan") {
    return (
      <span
        className="inline-block shrink-0"
        style={{
          width: dim,
          height: dim,
          background: color,
          borderRadius: 1.5,
          transform: "rotate(45deg)",
          ...ring,
        }}
      />
    );
  }
  // plan — short bar
  return (
    <span
      className="inline-block shrink-0"
      style={{
        width: dim + 2,
        height: 3,
        background: color,
        borderRadius: 2,
        ...ring,
      }}
    />
  );
}

export function TeamScheduleCalendar({
  managerId,
  casts,
  customers,
  today,
}: Props) {
  const [view, setView] = useState<TeamCalView>("month");
  const [anchor, setAnchor] = useState<Date>(() => parseYMD(today));

  const [douhans, setDouhans] = useState<Douhan[]>([]);
  const [ownShifts, setOwnShifts] = useState<ShiftEntry[]>([]);
  const [ownPlans, setOwnPlans] = useState<PlanEntry[]>([]);

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
    setVisible(
      saved
        ? new Set(saved.filter((id) => allIds.includes(id)))
        : new Set(allIds),
    );
    hydrated.current = true;
  }, [layers]);

  // 保存済みビューを反映。
  useEffect(() => {
    const v = loadCalView();
    if (v) setView(v);
  }, []);

  // データ読み込み — まず localStorage、その後サーバーと突き合わせ。
  useEffect(() => {
    const reload = () => {
      setOwnShifts(loadSchedule());
      setOwnPlans(loadPlansForCast(managerId));
      setDouhans(loadAllDouhans());
    };
    reload();
    let cancelled = false;
    void pullCastSchedule().then((applied) => {
      if (applied && !cancelled) reload();
    });
    return () => {
      cancelled = true;
    };
  }, [managerId]);

  const changeView = (v: TeamCalView) => {
    setView(v);
    saveCalView(v);
  };

  const toggleLayer = (id: string) => {
    setVisible((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (hydrated.current) saveVisibleLayers(Array.from(next));
      return next;
    });
  };

  // 指定日のイベント (可視レイヤーのみ) を時系列で。
  const eventsForDate = useCallback(
    (dateObj: Date): CalEvent[] => {
      const ymd = toYMD(dateObj);
      const out: CalEvent[] = [];
      for (const layer of layers) {
        if (!visible.has(layer.id)) continue;

        // 出勤シフト
        const shift = layer.isOwn
          ? ownShifts.find((s) => s.date === ymd && s.status === "working")
          : getMockShiftForCastDate(layer.id, dateObj);
        if (shift && shift.status === "working") {
          const range = shift.startTime
            ? `${shift.startTime}${shift.endTime ? `〜${shift.endTime}` : ""}`
            : undefined;
          out.push({
            layerId: layer.id,
            layerLabel: layer.label,
            color: layer.color,
            isOwn: layer.isOwn,
            kind: "shift",
            sort: shift.startTime ?? "20:00",
            time: shift.startTime,
            title: "出勤",
            sub: [range, shift.note].filter(Boolean).join(" · ") || undefined,
          });
        }

        // 同伴 (顧客に紐づく予定 = 担当が関わる予定)
        const myDouhans = douhans.filter(
          (d) =>
            d.cast_id === layer.id &&
            d.date === ymd &&
            d.status !== "cancelled",
        );
        for (const d of myDouhans) {
          const cust = customers.find((c) => c.id === d.customer_id);
          out.push({
            layerId: layer.id,
            layerLabel: layer.label,
            color: layer.color,
            isOwn: layer.isOwn,
            kind: "douhan",
            sort: d.time ?? "18:00",
            time: d.time ?? undefined,
            title: cust ? `${formatCustomerName(cust.name)}さま` : "同伴",
            sub: d.note ?? undefined,
          });
        }

        // その他の予定 (私用) — 自分のみ表示 (メンバーのプライベートは出さない)
        if (layer.isOwn) {
          const myPlans = ownPlans.filter((p) => p.date === ymd);
          for (const p of myPlans) {
            out.push({
              layerId: layer.id,
              layerLabel: layer.label,
              color: layer.color,
              isOwn: layer.isOwn,
              kind: "plan",
              sort: p.time ?? "99:99",
              time: p.time,
              title: p.title,
              sub: p.note,
            });
          }
        }
      }
      out.sort(
        (a, b) =>
          a.sort.localeCompare(b.sort) ||
          (a.isOwn === b.isOwn ? 0 : a.isOwn ? -1 : 1) ||
          KIND_ORDER[a.kind] - KIND_ORDER[b.kind],
      );
      return out;
    },
    [layers, visible, ownShifts, ownPlans, douhans, customers],
  );

  // ビューに応じた範囲移動。
  const goPrev = () => {
    if (view === "month")
      setAnchor((a) => new Date(a.getFullYear(), a.getMonth() - 1, 1));
    else setAnchor((a) => addDays(a, view === "week" ? -7 : view === "four" ? -4 : -1));
  };
  const goNext = () => {
    if (view === "month")
      setAnchor((a) => new Date(a.getFullYear(), a.getMonth() + 1, 1));
    else setAnchor((a) => addDays(a, view === "week" ? 7 : view === "four" ? 4 : 1));
  };

  // 範囲ヘッダのタイトル
  const { rangeTitle, rangeSub } = useMemo(() => {
    if (view === "month") {
      return {
        rangeTitle: `${anchor.getFullYear()}年${anchor.getMonth() + 1}月`,
        rangeSub: "月ビュー",
      };
    }
    if (view === "day") {
      return {
        rangeTitle: `${anchor.getMonth() + 1}/${anchor.getDate()}（${DOW[anchor.getDay()]}）`,
        rangeSub: "日ビュー",
      };
    }
    const start = view === "week" ? startOfWeek(anchor) : anchor;
    const end = addDays(start, view === "week" ? 6 : 3);
    return {
      rangeTitle: `${start.getMonth() + 1}/${start.getDate()} – ${end.getMonth() + 1}/${end.getDate()}`,
      rangeSub: view === "week" ? "週ビュー" : "4日ビュー",
    };
  }, [view, anchor]);

  const jumpToDay = (dateObj: Date) => {
    setAnchor(dateObj);
    changeView("day");
  };

  return (
    <div className="space-y-4">
      {/* カレンダー (レイヤー) パネル — Google カレンダー風の ON/OFF */}
      <div className="rounded-2xl bg-pearl-warm border border-ink/[0.06] p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-label-xs tracking-luxe text-gold-deep uppercase">
            表示するカレンダー
          </span>
          <span className="text-[10px] text-ink-mute">{layers.length}件</span>
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
                  "flex items-center gap-1.5 rounded-full pl-1.5 pr-2.5 py-1 border transition-all",
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
                    boxShadow:
                      on && layer.isOwn
                        ? "0 0 0 1.5px #faf7f2, 0 0 0 3px rgba(94,56,56,0.55)"
                        : undefined,
                  }}
                >
                  {on && (
                    <Check size={11} className="text-pearl-light" strokeWidth={3} />
                  )}
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

      {/* ビュー切替 (月 / 週 / 4日 / 日) */}
      <div className="flex bg-pearl-soft border border-ink/[0.06] rounded-full p-[3px]">
        {(
          [
            ["month", "月"],
            ["week", "週"],
            ["four", "4日"],
            ["day", "日"],
          ] as [TeamCalView, string][]
        ).map(([v, label]) => (
          <button
            key={v}
            type="button"
            onClick={() => changeView(v)}
            className={cn(
              "flex-1 py-1.5 rounded-full text-[13px] font-semibold tracking-[0.04em] transition-all",
              view === v
                ? "bg-wine-deep text-pearl-light shadow-warm"
                : "text-ink-mute hover:text-ink-soft",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 範囲ナビ */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={goPrev}
          aria-label="前へ"
          className="p-2 rounded-full hover:bg-pearl-soft text-ink-soft"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <div className="font-serif text-[20px] leading-tight font-medium tracking-[0.02em] text-ink">
            {rangeTitle}
          </div>
          <div className="text-label-xs tracking-luxe text-ink-mute uppercase mt-0.5">
            {rangeSub}
          </div>
        </div>
        <button
          type="button"
          onClick={goNext}
          aria-label="次へ"
          className="p-2 rounded-full hover:bg-pearl-soft text-ink-soft"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {view === "month" ? (
        <MonthView
          anchor={anchor}
          today={today}
          eventsForDate={eventsForDate}
          onPickDay={jumpToDay}
        />
      ) : (
        <AgendaView
          view={view}
          anchor={anchor}
          today={today}
          eventsForDate={eventsForDate}
        />
      )}
    </div>
  );
}

// ───────────────────────── Month view ─────────────────────────

function MonthView({
  anchor,
  today,
  eventsForDate,
  onPickDay,
}: {
  anchor: Date;
  today: string;
  eventsForDate: (d: Date) => CalEvent[];
  onPickDay: (d: Date) => void;
}) {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const cells: (Date | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-3">
      {/* 種類の凡例 */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl bg-pearl-soft border border-ink/[0.06] px-3 py-2 text-[11px] text-ink-soft">
        <span className="text-[10px] text-ink-mute">種類:</span>
        <span className="flex items-center gap-1.5">
          <EventMarker color="#6b5a58" kind="shift" isOwn={false} /> 出勤
        </span>
        <span className="flex items-center gap-1.5">
          <EventMarker color="#6b5a58" kind="douhan" isOwn={false} /> 同伴
        </span>
        <span className="flex items-center gap-1.5">
          <EventMarker color="#6b5a58" kind="plan" isOwn={false} /> その他
        </span>
        <span className="text-[10px] text-ink-mute ml-auto">色 = 担当者</span>
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
          const ymd = toYMD(date);
          const evs = eventsForDate(date);
          const isToday = ymd === today;
          const isPast = ymd < today;
          const dow = date.getDay();
          return (
            <button
              key={ymd}
              type="button"
              onClick={() => onPickDay(date)}
              className={cn(
                "relative aspect-square flex flex-col items-center justify-start pt-1.5 rounded-xl text-[13px] font-medium transition-all active:scale-95 hover:bg-pearl-soft",
                isToday && "ring-2 ring-wine-deep/40 ring-offset-1",
                isPast && evs.length === 0 && "opacity-45",
                dow === 0 && "text-wine-deep-400",
                dow === 6 && "text-sky-400",
              )}
            >
              <span className="leading-none text-ink">{date.getDate()}</span>
              {evs.length > 0 && (
                <span className="flex flex-wrap items-center justify-center gap-[2.5px] mt-1 px-0.5 max-w-full">
                  {evs.slice(0, 5).map((ev, i) => (
                    <EventMarker
                      key={`${ev.layerId}-${ev.kind}-${i}`}
                      color={ev.color}
                      kind={ev.kind}
                      isOwn={ev.isOwn}
                    />
                  ))}
                  {evs.length > 5 && (
                    <span className="text-[8px] leading-none text-ink-mute">
                      +{evs.length - 5}
                    </span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-[10px] text-ink-mute px-1 leading-relaxed">
        色は担当者ごと（自分＝bordeaux、枠付き）。形は予定の種類。マスをタップすると日ビューで詳細が見られます。その他の私用予定は自分の分のみ表示します。
      </p>
    </div>
  );
}

// ───────────────────────── Agenda view (週 / 4日 / 日) ─────────────────────────

function AgendaView({
  view,
  anchor,
  today,
  eventsForDate,
}: {
  view: TeamCalView;
  anchor: Date;
  today: string;
  eventsForDate: (d: Date) => CalEvent[];
}) {
  const dense = view !== "day"; // 週/4日 = 1行コンパクト、日 = フルカード
  const dates: Date[] = useMemo(() => {
    if (view === "day") return [anchor];
    const start = view === "week" ? startOfWeek(anchor) : anchor;
    const len = view === "week" ? 7 : 4;
    return Array.from({ length: len }, (_, i) => addDays(start, i));
  }, [view, anchor]);

  return (
    <div className="flex flex-col gap-1">
      {dates.map((date) => {
        const ymd = toYMD(date);
        const evs = eventsForDate(date);
        const isToday = ymd === today;
        const dow = date.getDay();
        return (
          <div
            key={ymd}
            className={cn(
              "rounded-2xl border overflow-hidden bg-pearl-light",
              isToday ? "border-wine-deep/40 ring-1 ring-wine-deep/25" : "border-ink/[0.06]",
            )}
          >
            <div className="flex items-center gap-2 px-3 py-2 bg-pearl-warm border-b border-ink/[0.06]">
              <span className="font-display tabular-nums text-[18px] font-semibold text-ink leading-none">
                {date.getDate()}
              </span>
              <span
                className={cn(
                  "text-[12px] font-semibold",
                  dow === 0
                    ? "text-wine-deep-400"
                    : dow === 6
                      ? "text-sky-400"
                      : "text-ink-soft",
                )}
              >
                {DOW[dow]}
              </span>
              {isToday && (
                <span className="ml-auto text-[10px] font-bold tracking-[0.06em] text-pearl-light bg-wine-deep px-2 py-0.5 rounded-full">
                  今日
                </span>
              )}
            </div>

            {evs.length === 0 ? (
              <div className="px-3 py-2.5 text-[12px] text-ink-mute">予定なし</div>
            ) : dense ? (
              <div className="p-1.5 flex flex-col gap-1.5">
                {evs.map((ev, i) => (
                  <div
                    key={`${ev.layerId}-${ev.kind}-${i}`}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-pearl border border-ink/[0.06]"
                    style={{ borderLeft: `4px solid ${ev.color}` }}
                  >
                    <span className="font-display tabular-nums text-[14px] font-semibold text-wine-deep w-[42px] shrink-0">
                      {ev.time ?? "終日"}
                    </span>
                    <span className="text-[12px] font-semibold text-ink whitespace-nowrap">
                      {ev.layerLabel}
                    </span>
                    <span
                      className="text-[10px] text-pearl-light px-1.5 py-px rounded-md shrink-0"
                      style={{ background: ev.color }}
                    >
                      {KIND_LABEL[ev.kind]}
                    </span>
                    <span className="text-[12px] text-ink-soft truncate">
                      {ev.kind === "shift" ? ev.sub ?? "" : ev.title}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-1.5 flex flex-col gap-1.5">
                {evs.map((ev, i) => (
                  <div
                    key={`${ev.layerId}-${ev.kind}-${i}`}
                    className="flex gap-3 px-3 py-2.5 rounded-2xl bg-pearl border border-ink/[0.06]"
                    style={{ borderLeft: `4px solid ${ev.color}` }}
                  >
                    <span className="font-display tabular-nums text-[15px] font-semibold text-wine-deep w-[46px] shrink-0 pt-0.5">
                      {ev.time ?? "終日"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-[10px] font-semibold text-pearl-light px-2 py-px rounded-md"
                          style={{ background: ev.color }}
                        >
                          {ev.layerLabel}
                        </span>
                        <span className="text-[10px] text-ink-mute">
                          {KIND_LABEL[ev.kind]}
                        </span>
                      </div>
                      <div className="text-[14px] text-ink font-medium mt-1">
                        {ev.kind === "shift" ? "出勤" : ev.title}
                      </div>
                      {ev.sub && (
                        <div className="text-[11px] text-ink-mute mt-0.5">{ev.sub}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
