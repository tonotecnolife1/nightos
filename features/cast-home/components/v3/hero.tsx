import Link from "next/link";
import { Bell, ArrowRight } from "lucide-react";
import { TonightSchedule } from "./tonight-schedule";

function formatTodayJP(d: Date): string {
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  return `${d.getMonth() + 1}月${d.getDate()}日 (${weekdays[d.getDay()]})`;
}

export function Hero({ castName }: { castName?: string }) {
  const today = formatTodayJP(new Date());

  return (
    <section className="relative overflow-hidden bg-hero-pearl px-5 pt-14 pb-14">
      {/* Eyebrow + bell */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-2.5">
          <span
            className="text-[11px] leading-none text-rose-gold-deep tracking-luxe"
            style={{ fontWeight: 500 }}
          >
            NIGHTOS
          </span>
          <span
            className="font-display text-[12px] leading-none text-ink-muted"
            style={{ letterSpacing: "0.08em", fontWeight: 400 }}
          >
            {today}
          </span>
        </div>
        <Link
          href="/cast/my"
          aria-label="お知らせ"
          className="relative w-[38px] h-[38px] rounded-full flex items-center justify-center bg-glass-pearl border border-ink/[0.08] text-ink-secondary"
        >
          <Bell size={17} strokeWidth={1.6} />
          <span
            aria-hidden
            className="absolute top-[6px] right-[7px] w-[7px] h-[7px] rounded-full bg-rose-gold-deep"
            style={{ border: "1.5px solid #fdfcf9" }}
          />
        </Link>
      </div>

      {/* Metallic headline */}
      <h1
        className="text-metallic font-display"
        style={{
          margin: "0 0 4px",
          fontSize: 36,
          lineHeight: 1.15,
          fontWeight: 500,
          letterSpacing: "0.02em",
        }}
      >
        Tonight
      </h1>
      <p
        className="text-[13px] leading-[1.6] text-ink-secondary"
        style={{ margin: "0 0 14px", maxWidth: "32ch" }}
      >
        {castName ? `${castName}さん、` : ""}今夜の予定です。いってらっしゃい。
      </p>

      <TonightSchedule />

      {/* CTAs */}
      <div className="mt-5 flex gap-2.5">
        <Link
          href="/cast/schedule"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-rose-gold-deep text-pearl-warm shadow-luxe"
          style={{
            height: 50,
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: "0.04em",
          }}
        >
          スケジュールを見る
          <ArrowRight size={15} strokeWidth={1.8} />
        </Link>
        <Link
          href="/cast/my"
          className="inline-flex items-center justify-center rounded-full bg-glass-pearl border border-ink/[0.14] text-rose-gold-ink"
          style={{
            height: 50,
            padding: "0 22px",
            fontWeight: 500,
            fontSize: 14,
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          あとで
        </Link>
      </div>
    </section>
  );
}
