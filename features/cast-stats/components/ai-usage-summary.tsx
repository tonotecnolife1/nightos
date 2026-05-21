"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { getStyleStats } from "@/features/sakura-mama/lib/option-choice-store";
import type { ReplyOptionStyle } from "@/types/nightos";

const STYLE_LABELS: Record<ReplyOptionStyle, string> = {
  safe: "丁寧に寄り添う",
  practical: "端的で実用的",
  warm: "温かみと遊び心",
};

export function AiUsageSummary() {
  const [loaded, setLoaded] = useState(false);
  const [stats, setStats] = useState({
    safe: 0,
    practical: 0,
    warm: 0,
    total: 0,
    topStyle: null as ReplyOptionStyle | null,
  });

  useEffect(() => {
    const s = getStyleStats();
    const total = s.safe + s.practical + s.warm;
    let topStyle: ReplyOptionStyle | null = null;
    if (total > 0) {
      const max = Math.max(s.safe, s.practical, s.warm);
      topStyle =
        s.safe === max ? "safe" : s.practical === max ? "practical" : "warm";
    }
    setStats({ ...s, total, topStyle });
    setLoaded(true);
  }, []);

  if (!loaded || stats.total === 0) return null;

  return (
    <Card className="p-3 !bg-amethyst-muted/30 !border-amethyst-border">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles size={13} className="text-amethyst-dark" />
        <span className="text-body-sm font-semibold text-ink">
          さくらママ活用度
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-display-sm font-display text-ink leading-none">
            {stats.total}
            <span className="text-[11px] text-ink-muted ml-1">回相談</span>
          </div>
        </div>
        {stats.topStyle && (
          <div className="text-right">
            <div className="text-[10px] text-ink-muted">よく選ぶスタイル</div>
            <div className="text-body-sm text-amethyst-dark font-medium">
              {STYLE_LABELS[stats.topStyle]}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
