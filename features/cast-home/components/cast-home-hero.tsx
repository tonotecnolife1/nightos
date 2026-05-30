"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Bell, UserCircle } from "lucide-react";
import { loadSchedule, type ShiftEntry } from "@/lib/nightos/schedule-store";
import { loadDouhansForCast } from "@/lib/nightos/douhan-store";
import type { Customer, Douhan } from "@/types/nightos";

interface Props {
  /** Cast ID — to look up today's douhans from localStorage */
  castId: string;
  /** Customers for this cast — used to resolve douhan customer names */
  customers: Customer[];
  /** Eyebrow date label e.g. "5月30日 (土)" */
  dateLabel?: string;
  /** Notification dot visible */
  hasNotification?: boolean;
}

interface TonightEvent {
  /** Sort key e.g. "18:00" — used for ordering only */
  sortTime: string;
  /** Display time, e.g. "18:00" */
  time: string;
  /** Headline label, e.g. "同伴" / "出勤" */
  label: string;
  /** Subtitle, e.g. "六本木 / 田中さま" */
  detail?: string;
}

function todayYMD(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return `${m}月${d}日 (${days[dt.getDay()]})`;
}

function daysBetween(fromYmd: string, toYmd: string): number {
  const f = new Date(`${fromYmd}T00:00:00`);
  const t = new Date(`${toYmd}T00:00:00`);
  return Math.round((t.getTime() - f.getTime()) / 86_400_000);
}

// V5 Bordeaux Salon Hero (案 A — 今夜のスケジュール).
// Single full-width primary CTA — no balancing sub CTA needed because
// the hero body is information-dense (label + headline + brass + sub +
// schedule rows). 副 CTA を消した分、見出しサイズと余白で再均衡。
export function CastHomeHero({
  castId,
  customers,
  dateLabel,
  hasNotification = false,
}: Props) {
  const [events, setEvents] = useState<TonightEvent[]>([]);
  const [nextWorkingDate, setNextWorkingDate] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const today = todayYMD();

    // Today's shift (出勤/公休)
    const allShifts: ShiftEntry[] = loadSchedule();
    const todayShift = allShifts.find(
      (e) => e.date === today && e.status === "working",
    );

    // Today's scheduled douhans (status === 'scheduled')
    const allDouhans: Douhan[] = loadDouhansForCast(castId);
    const todayDouhans = allDouhans.filter(
      (d) => d.date === today && d.status === "scheduled",
    );
    const customerById = new Map(customers.map((c) => [c.id, c]));

    const list: TonightEvent[] = [];
    for (const d of todayDouhans) {
      const customer = customerById.get(d.customer_id);
      list.push({
        sortTime: "18:00", // 同伴は具体的な時刻が無いので仮で 18:00 にソート
        time: "18:00",
        label: "同伴",
        detail: customer ? `${customer.name}さま${d.note ? ` · ${d.note}` : ""}` : d.note ?? undefined,
      });
    }
    if (todayShift) {
      list.push({
        sortTime: todayShift.startTime ?? "20:00",
        time: todayShift.startTime ?? "20:00",
        label: "出勤",
        detail: todayShift.note ?? undefined,
      });
    }
    list.sort((a, b) => a.sortTime.localeCompare(b.sortTime));

    // Fallback: next working day
    let nextDate: string | null = null;
    if (list.length === 0) {
      const upcoming = allShifts
        .filter((e) => e.date > today && e.status === "working")
        .sort((a, b) => a.date.localeCompare(b.date))[0];
      nextDate = upcoming?.date ?? null;
    }

    setEvents(list);
    setNextWorkingDate(nextDate);
    setLoaded(true);
  }, [castId, customers]);

  // ── Rendered text — switches between three states ──
  const hasEvents = events.length > 0;
  const mainEvent = events[0];
  const restEvents = events.slice(1);

  // No-event fallback content
  const noEventNextLabel = nextWorkingDate
    ? `次の出勤 ${daysBetween(todayYMD(), nextWorkingDate)} 日後`
    : "次の出勤未定";
  const noEventNextDate = nextWorkingDate ? formatDate(nextWorkingDate) : null;

  return (
    <section className="v5-hero px-5 pt-12 pb-16">
      {/* Top row — eyebrow + utility icons */}
      <div className="relative flex items-center justify-between mb-5">
        <div className="flex items-baseline gap-3">
          <span
            className="font-sans text-[11px] leading-none font-medium uppercase"
            style={{ letterSpacing: "0.32em", color: "var(--v5-gold-mid)" }}
          >
            NIGHTOS
          </span>
          {dateLabel && (
            <span
              className="font-display text-[13px] leading-none"
              style={{
                color: "var(--v5-ink-on-dark-mute)",
                letterSpacing: "0.06em",
              }}
            >
              {dateLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/cast/my"
            aria-label="マイページ"
            className="w-9 h-9 rounded-full v5-ring-gold flex items-center justify-center transition"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(253,252,249,0.85)",
            }}
          >
            <UserCircle size={20} strokeWidth={1.6} />
          </Link>
          <button
            type="button"
            aria-label="通知"
            className="relative w-9 h-9 rounded-full v5-ring-gold flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(253,252,249,0.85)",
            }}
          >
            <Bell size={17} strokeWidth={1.6} />
            {hasNotification && (
              <span
                className="absolute top-1.5 right-1.5 w-[7px] h-[7px] rounded-full"
                style={{
                  background: "var(--v5-gold-mid)",
                  border: "1.5px solid #2D1818",
                }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Small eyebrow above headline */}
      <div
        className="relative font-sans font-medium uppercase"
        style={{
          fontSize: 11,
          lineHeight: 1,
          letterSpacing: "0.20em",
          color: "var(--v5-ink-on-dark-mute)",
          marginBottom: 10,
        }}
      >
        {!loaded
          ? "今夜の予定"
          : hasEvents
            ? `今夜の予定 · ${events.length} 軒`
            : "今夜は予定なし"}
      </div>

      {/* Champagne-gold foil headline */}
      <h1
        className="relative m-0 font-serif font-normal v5-metallic"
        style={{
          fontSize: hasEvents ? "2.5rem" : "2rem",
          lineHeight: 1.1,
          letterSpacing: "0.04em",
          marginBottom: 8,
        }}
      >
        {!loaded ? (
          // SSR + first paint placeholder (avoids hydration mismatch)
          <span style={{ opacity: 0.5 }}>—</span>
        ) : hasEvents ? (
          <>
            <span
              className="font-display tabular-nums"
              style={{ fontSize: "2.5rem", marginRight: 14 }}
            >
              {mainEvent.time}
            </span>
            {mainEvent.label}
          </>
        ) : (
          noEventNextLabel
        )}
      </h1>

      {/* Brass plate hairline */}
      <span
        aria-hidden
        className="v5-brass-line"
        style={{ width: "32ch", maxWidth: "60%", marginBottom: 14 }}
      />

      {/* Detail / subtitle */}
      {loaded && (
        <p
          className="relative m-0 font-sans"
          style={{
            fontSize: 13,
            lineHeight: 1.7,
            color: "var(--v5-ink-on-dark-soft)",
            maxWidth: "32ch",
            letterSpacing: "0.02em",
            marginBottom: hasEvents && restEvents.length > 0 ? 6 : 22,
          }}
        >
          {hasEvents
            ? (mainEvent.detail ?? "今夜もいってらっしゃい。")
            : noEventNextDate
              ? `${noEventNextDate} 出勤予定。ゆっくり充電して。`
              : "スケジュールを編集して出勤日を登録しましょう。"}
        </p>
      )}

      {/* Additional schedule rows (case A only, when ≥2 events) */}
      {loaded && hasEvents && restEvents.length > 0 && (
        <div className="relative" style={{ marginBottom: 4 }}>
          {restEvents.map((ev, i) => (
            <div
              key={`${ev.time}-${i}`}
              className={i === restEvents.length - 1 ? "" : "v5-line-divider"}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 16,
                padding: "12px 0",
                borderTop:
                  i === 0 ? "1px solid rgba(235,217,168,0.16)" : undefined,
              }}
            >
              <div
                className="font-display tabular-nums"
                style={{
                  fontSize: 22,
                  lineHeight: 1,
                  fontWeight: 400,
                  letterSpacing: "0.04em",
                  color: "var(--v5-gold-on-dark)",
                  minWidth: 64,
                }}
              >
                {ev.time}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="font-serif"
                  style={{
                    fontSize: 18,
                    lineHeight: 1.25,
                    fontWeight: 500,
                    letterSpacing: "0.02em",
                    color: "var(--v5-ink-on-dark)",
                  }}
                >
                  {ev.label}
                </div>
                {ev.detail && (
                  <div
                    className="font-sans mt-0.5"
                    style={{
                      fontSize: 11.5,
                      lineHeight: 1.3,
                      letterSpacing: "0.06em",
                      color: "var(--v5-ink-on-dark-mute)",
                    }}
                  >
                    {ev.detail}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Primary CTA — centered, intrinsic width (not full-bleed) */}
      <div className="relative mt-6 flex justify-center">
        <Link
          href="/cast/schedule"
          className="v5-cta-primary h-11 px-6 rounded-pill inline-flex items-center justify-center gap-2 font-sans font-semibold transition active:scale-[0.99]"
          style={{ letterSpacing: "0.08em", fontSize: 13 }}
        >
          {loaded && !hasEvents
            ? "スケジュールを編集"
            : "スケジュールを見る"}
          <ArrowRight size={15} strokeWidth={1.8} />
        </Link>
      </div>
    </section>
  );
}
