import Link from "next/link";
import { ArrowRight, Bell, CalendarDays, UserCircle } from "lucide-react";

interface HeroScheduleLine {
  time: string;
  venue?: string;
  table: string;
}

interface Props {
  /** Eyebrow date label e.g. "5月23日 (金)" */
  dateLabel?: string;
  /** Hero metallic headline */
  title: string;
  /** Short greeting / tonight intro */
  subtitle?: string;
  /** Optional tonight schedule */
  scheduleLines?: HeroScheduleLine[];
  /** Notification dot visible */
  hasNotification?: boolean;
}

// V5 Bordeaux Salon Hero — dark wine/nocturne base + champagne-gold metallic accents.
export function CastHomeHero({
  dateLabel,
  title,
  subtitle,
  scheduleLines,
  hasNotification = false,
}: Props) {
  return (
    <section className="v5-hero px-5 pt-12 pb-14">
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
            href="/cast/schedule"
            aria-label="スケジュール"
            className="w-9 h-9 rounded-full v5-ring-gold flex items-center justify-center hover:bg-white/10 transition"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(253,252,249,0.85)",
            }}
          >
            <CalendarDays size={17} strokeWidth={1.6} />
          </Link>
          <Link
            href="/cast/my"
            aria-label="マイページ"
            className="w-9 h-9 rounded-full v5-ring-gold flex items-center justify-center hover:bg-white/10 transition"
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

      {/* Champagne-gold foil headline */}
      <h1
        className="relative m-0 font-serif font-normal v5-metallic"
        style={{
          fontSize: "2.375rem",
          lineHeight: 1.1,
          letterSpacing: "0.05em",
          marginBottom: 8,
        }}
      >
        {title}
      </h1>

      {/* Brass plate hairline */}
      <span
        aria-hidden
        className="v5-brass-line"
        style={{ width: "32ch", maxWidth: "60%", marginBottom: 14 }}
      />

      {subtitle && (
        <p
          className="relative m-0 font-sans text-[13px] leading-[1.7]"
          style={{
            color: "var(--v5-ink-on-dark-soft)",
            maxWidth: "32ch",
            letterSpacing: "0.02em",
            marginBottom: 14,
          }}
        >
          {subtitle}
        </p>
      )}

      {/* Schedule */}
      {scheduleLines && scheduleLines.length > 0 && (
        <div className="relative">
          {scheduleLines.map((line, i) => (
            <div
              key={`${line.time}-${i}`}
              className={
                i === scheduleLines.length - 1 ? "" : "v5-line-divider"
              }
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 16,
                padding: "14px 0",
              }}
            >
              <div
                className="font-display tabular-nums"
                style={{
                  fontSize: 26,
                  lineHeight: 1,
                  fontWeight: 400,
                  letterSpacing: "0.04em",
                  color: "var(--v5-gold-on-dark)",
                  minWidth: 76,
                }}
              >
                {line.time}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="font-serif"
                  style={{
                    fontSize: 22,
                    lineHeight: 1.25,
                    fontWeight: 500,
                    letterSpacing: "0.02em",
                    color: "var(--v5-ink-on-dark)",
                  }}
                >
                  {line.table}
                </div>
                {line.venue && (
                  <div
                    className="font-sans mt-0.5"
                    style={{
                      fontSize: 11.5,
                      lineHeight: 1.3,
                      letterSpacing: "0.06em",
                      color: "var(--v5-ink-on-dark-mute)",
                    }}
                  >
                    {line.venue}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTAs — champagne-gold solid + ghost gold border */}
      <div className="relative mt-5 flex gap-2.5">
        <Link
          href="/cast/schedule"
          className="v5-cta-primary flex-1 h-[50px] rounded-pill inline-flex items-center justify-center gap-2 font-sans font-semibold transition active:scale-[0.98]"
          style={{ letterSpacing: "0.08em", fontSize: 14 }}
        >
          スケジュールを見る
          <ArrowRight size={15} strokeWidth={1.8} />
        </Link>
        <button
          type="button"
          className="v5-cta-ghost h-[50px] px-[22px] rounded-pill font-sans font-medium whitespace-nowrap"
          style={{ letterSpacing: "0.06em", fontSize: 14 }}
        >
          あとで
        </button>
      </div>
    </section>
  );
}
