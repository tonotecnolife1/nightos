"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { MoreMenu } from "@/components/nightos/more-menu";

interface Props {
  /** 西暦 (例: 2026) */
  year: number;
  /** 月 (1-12) */
  month: number;
}

/**
 * /cast/stats 専用サブヘッダー。
 * pearl glass + 下端 brass hairline、戻る chevron + 見出し + 年月 chip。
 * (design ref: cast-stats.jsx StSubHeader)
 */
export function StatsSubHeader({ year, month }: Props) {
  const router = useRouter();
  const mm = String(month).padStart(2, "0");

  return (
    <header
      className="sticky top-0 z-40 relative px-5 pt-6 pb-4 border-b border-ink/[0.08]"
      style={{
        background:
          "radial-gradient(ellipse at top right, var(--champagne-soft) 0%, transparent 60%)," +
          "linear-gradient(180deg, rgba(253,248,240,0.94) 0%, rgba(253,248,240,0.82) 100%)",
        backdropFilter: "blur(18px) saturate(160%)",
        WebkitBackdropFilter: "blur(18px) saturate(160%)",
      }}
    >
      <span
        aria-hidden
        className="absolute left-0 right-0 -bottom-px h-px"
        style={{ background: "var(--gold-metallic)", opacity: 0.45 }}
      />
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="戻る"
          className="-ml-2 w-9 h-9 rounded-full flex items-center justify-center text-ink-soft hover:bg-pearl-soft transition-colors"
        >
          <ChevronLeft size={20} strokeWidth={1.8} />
        </button>
        <div className="flex-1 min-w-0">
          <h1
            className="m-0 font-serif text-[22px] leading-[1.2] font-medium text-ink"
            style={{ letterSpacing: "0.02em" }}
          >
            あなたの成績
          </h1>
        </div>
        <span
          className="shrink-0 px-3 py-1.5 rounded-pill border border-ink/[0.14] text-ink-soft font-sans text-[11px] leading-none"
          style={{
            background: "rgba(253,248,240,0.85)",
            letterSpacing: "0.08em",
          }}
        >
          {year} / {mm}
        </span>
        <MoreMenu />
      </div>
    </header>
  );
}
