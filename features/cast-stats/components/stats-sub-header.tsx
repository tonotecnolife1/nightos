"use client";

import { ChevronLeft, ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MoreMenu } from "@/components/nightos/more-menu";

interface Props {
  /** 西暦 (例: 2026) */
  year: number;
  /** 月 (1-12) */
  month: number;
}

/** 直近 N ヶ月 (当月含む) の {year, month} リストを新しい順で返す。 */
function recentMonths(count: number): { year: number; month: number }[] {
  const now = new Date();
  const list: { year: number; month: number }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    list.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return list;
}

/**
 * /cast/stats 専用サブヘッダー。
 * pearl glass + 下端 brass hairline、戻る chevron + 見出し + 年月ピッカー。
 * 年月 chip をタップすると過去 12 ヶ月から選択でき、?month=YYYY-MM へ遷移する。
 * (design ref: cast-stats.jsx StSubHeader)
 */
export function StatsSubHeader({ year, month }: Props) {
  const router = useRouter();
  const mm = String(month).padStart(2, "0");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // 外側タップ / Esc で閉じる
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const now = new Date();
  const isCurrent =
    year === now.getFullYear() && month === now.getMonth() + 1;

  const select = (y: number, mo: number) => {
    setOpen(false);
    const cur =
      y === now.getFullYear() && mo === now.getMonth() + 1;
    // 当月はクエリ無しの素のパスへ戻す
    router.push(cur ? "/cast/stats" : `/cast/stats?month=${y}-${String(mo).padStart(2, "0")}`);
  };

  const months = recentMonths(12);

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

        {/* 年月ピッカー */}
        <div ref={wrapRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label="表示する月を選ぶ"
            className="flex items-center gap-1 px-3 py-1.5 rounded-pill border border-ink/[0.14] text-ink-soft font-sans text-[11px] leading-none hover:bg-pearl-soft transition-colors"
            style={{
              background: "rgba(253,248,240,0.85)",
              letterSpacing: "0.08em",
            }}
          >
            <span>
              {year} / {mm}
            </span>
            <ChevronDown
              size={13}
              strokeWidth={1.8}
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <div
              role="listbox"
              className="absolute right-0 top-[calc(100%+8px)] z-50 w-36 max-h-64 overflow-y-auto rounded-2xl border border-ink/[0.10] py-1.5 shadow-warm"
              style={{
                background: "rgba(253,248,240,0.98)",
                backdropFilter: "blur(18px) saturate(160%)",
                WebkitBackdropFilter: "blur(18px) saturate(160%)",
              }}
            >
              {months.map((m) => {
                const sel = m.year === year && m.month === month;
                const cur =
                  m.year === now.getFullYear() &&
                  m.month === now.getMonth() + 1;
                return (
                  <button
                    key={`${m.year}-${m.month}`}
                    type="button"
                    role="option"
                    aria-selected={sel}
                    onClick={() => select(m.year, m.month)}
                    className={`flex w-full items-center justify-between px-3.5 py-2 text-left font-sans text-[12px] leading-none transition-colors hover:bg-pearl-soft ${
                      sel ? "text-ink font-medium" : "text-ink-soft"
                    }`}
                    style={{ letterSpacing: "0.04em" }}
                  >
                    <span>
                      {m.year}年{m.month}月
                      {cur && (
                        <span className="ml-1.5 text-ink-mute text-[10px]">
                          今月
                        </span>
                      )}
                    </span>
                    {sel && (
                      <Check
                        size={13}
                        strokeWidth={2}
                        style={{ color: "var(--gold-mid, var(--gold-metallic))" }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <MoreMenu />
      </div>
    </header>
  );
}
