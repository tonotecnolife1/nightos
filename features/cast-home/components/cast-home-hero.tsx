import Link from "next/link";
import { ArrowRight, Bell, CalendarDays, UserCircle } from "lucide-react";

interface HeroScheduleLine {
  time: string;
  venue?: string;
  table: string;
}

interface Props {
  /** Eyebrow date label e.g. "5月20日 (火)" */
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

// v6 Hero — Pearl + rose-gold/champagne radial halos,
// metallic serif headline, glass utility buttons, CTAs at the foot.
export function CastHomeHero({
  dateLabel,
  title,
  subtitle,
  scheduleLines,
  hasNotification = false,
}: Props) {
  return (
    <section
      className="relative overflow-hidden px-5 pt-12 pb-14"
      style={{
        background:
          "radial-gradient(ellipse at top left, var(--rose-gold-soft) 0%, transparent 55%)," +
          "radial-gradient(ellipse at bottom right, var(--champagne-soft) 0%, transparent 60%)," +
          "linear-gradient(180deg, var(--pearl-light) 0%, var(--pearl) 100%)",
      }}
    >
      {/* Top row — eyebrow + utility icons */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-2.5">
          <span className="text-label-xs tracking-luxe text-roseGold-deep">
            NIGHTOS
          </span>
          {dateLabel && (
            <span className="font-display text-[12px] leading-none tracking-[0.08em] text-ink-mute">
              {dateLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/cast/schedule"
            aria-label="スケジュール"
            className="w-9 h-9 rounded-full glass flex items-center justify-center text-ink-soft hover:bg-pearl-warm/80 transition"
          >
            <CalendarDays size={17} strokeWidth={1.6} />
          </Link>
          <Link
            href="/cast/my"
            aria-label="マイページ"
            className="w-9 h-9 rounded-full glass flex items-center justify-center text-ink-soft hover:bg-pearl-warm/80 transition"
          >
            <UserCircle size={20} strokeWidth={1.6} />
          </Link>
          <button
            type="button"
            aria-label="通知"
            className="relative w-9 h-9 rounded-full glass flex items-center justify-center text-ink-soft"
          >
            <Bell size={17} strokeWidth={1.6} />
            {hasNotification && (
              <span
                className="absolute top-1.5 right-1.5 w-[7px] h-[7px] rounded-full bg-roseGold-deep"
                style={{ border: "1.5px solid var(--pearl-light)" }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Metallic headline */}
      <h1 className="m-0 mb-1 font-serif text-[2.25rem] leading-[1.15] font-medium tracking-[0.02em] t-metallic">
        {title}
      </h1>
      {subtitle && (
        <p className="m-0 mb-3 font-sans text-[13px] leading-[1.6] text-ink-soft max-w-[32ch]">
          {subtitle}
        </p>
      )}

      {/* Schedule */}
      {scheduleLines && scheduleLines.length > 0 && (
        <div className="mt-2">
          {scheduleLines.map((line, i) => (
            <div
              key={`${line.time}-${i}`}
              className="flex items-baseline gap-4 py-3.5"
              style={{
                borderBottom:
                  i === scheduleLines.length - 1
                    ? "none"
                    : "1px solid var(--line)",
              }}
            >
              <div
                className="font-display text-[26px] leading-none font-normal tracking-[0.02em] tabular-nums text-roseGold-deep"
                style={{ minWidth: 76 }}
              >
                {line.time}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-serif text-[22px] leading-[1.25] font-medium tracking-[0.02em] text-ink">
                  {line.table}
                </div>
                {line.venue && (
                  <div className="mt-0.5 font-sans text-[11.5px] leading-[1.3] tracking-[0.04em] text-ink-mute">
                    {line.venue}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTAs */}
      <div className="mt-5 flex gap-2.5">
        <Link
          href="/cast/schedule"
          className="flex-1 h-[50px] rounded-pill bg-roseGold-deep text-pearl-light shadow-luxe inline-flex items-center justify-center gap-2 font-sans text-[14px] font-semibold tracking-[0.04em] active:scale-[0.98] transition"
        >
          スケジュールを見る
          <ArrowRight size={15} strokeWidth={1.8} />
        </Link>
        <button
          type="button"
          className="h-[50px] px-[22px] rounded-pill glass text-roseGold-ink font-sans text-[14px] font-medium tracking-[0.04em] whitespace-nowrap"
          style={{ borderColor: "var(--line-strong)" }}
        >
          あとで
        </button>
      </div>
    </section>
  );
}
