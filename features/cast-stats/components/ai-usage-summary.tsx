"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { getStyleStats } from "@/features/ruri-mama/lib/option-choice-store";
import type { ReplyOptionStyle } from "@/types/nightos";

const STYLE_LABELS: Record<ReplyOptionStyle, string> = {
  safe: "丁寧に寄り添う",
  practical: "端的で実用的",
  warm: "温かみと遊び心",
};

/**
 * さくらママ活用度 — pearl glass + sparkle avatar + champagne→gold バー。
 * バーは「よく選ぶスタイル」の占有率を表す (実データ getStyleStats 由来)。
 * (design ref: cast-stats.jsx AiUsageCard)
 */
export function AiUsageSummary() {
  const [loaded, setLoaded] = useState(false);
  const [stats, setStats] = useState({
    safe: 0,
    practical: 0,
    warm: 0,
    total: 0,
    topStyle: null as ReplyOptionStyle | null,
    topShare: 0,
  });

  useEffect(() => {
    const s = getStyleStats();
    const total = s.safe + s.practical + s.warm;
    let topStyle: ReplyOptionStyle | null = null;
    let topShare = 0;
    if (total > 0) {
      const max = Math.max(s.safe, s.practical, s.warm);
      topStyle =
        s.safe === max ? "safe" : s.practical === max ? "practical" : "warm";
      topShare = Math.round((max / total) * 100);
    }
    setStats({ ...s, total, topStyle, topShare });
    setLoaded(true);
  }, []);

  if (!loaded || stats.total === 0) return null;

  return (
    <div
      className="relative overflow-hidden px-4 py-3.5 rounded-card border border-ink/[0.08] shadow-soft flex items-center gap-3.5"
      style={{
        background: "rgba(255, 253, 248, 0.82)",
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
      }}
    >
      <span
        aria-hidden
        className="absolute left-0 right-0 top-0 h-px"
        style={{ background: "var(--gold-metallic)", opacity: 0.55 }}
      />
      <span
        className="w-[38px] h-[38px] rounded-full shrink-0 flex items-center justify-center text-wine-soft"
        style={{
          background: "rgba(245,232,210,0.6)",
          border: "1px solid rgba(184,148,85,0.32)",
        }}
      >
        <Sparkles size={17} strokeWidth={1.7} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-1.5 mb-1.5">
          <span
            className="font-serif text-[12px] leading-none text-ink font-medium"
            style={{ letterSpacing: "0.02em" }}
          >
            今月のさくらママ活用
          </span>
          <span className="flex items-baseline gap-0.5">
            <span
              className="font-display text-[20px] leading-none text-ink tabular-nums"
              style={{ letterSpacing: "0.02em" }}
            >
              {stats.total}
            </span>
            <span className="font-sans text-[11px] leading-none text-ink-mute">
              回相談
            </span>
          </span>
        </div>
        <div
          className="h-[5px] rounded-pill overflow-hidden relative"
          style={{
            background: "var(--pearl-soft)",
            boxShadow: "inset 0 1px 1px rgba(42,31,26,0.08)",
          }}
        >
          <div
            className="absolute left-0 top-0 bottom-0 rounded-pill"
            style={{
              width: `${stats.topShare}%`,
              background:
                "linear-gradient(90deg, var(--champagne) 0%, var(--gold-deep) 100%)",
            }}
          />
        </div>
        {stats.topStyle && (
          <div
            className="mt-1.5 font-sans text-[10.5px] leading-none text-ink-mute"
            style={{ letterSpacing: "0.04em" }}
          >
            よく選ぶスタイル ·{" "}
            <span className="text-gold-deep font-medium">
              {STYLE_LABELS[stats.topStyle]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
