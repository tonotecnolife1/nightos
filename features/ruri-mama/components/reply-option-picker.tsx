"use client";

import {
  Check,
  ChevronRight,
  Heart,
  MessageCircle,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { ReplyOption, ReplyOptionStyle } from "@/types/nightos";

const STYLE_ICON: Record<ReplyOptionStyle, typeof Heart> = {
  safe: Heart,
  practical: Zap,
  warm: Sparkles,
};

/**
 * 3 パターンを「ひと目で違う」と分かるようにアクセントを大きく分ける。
 * - safe(A): 深いワイン（最もフォーマル）
 * - practical(B): ゴールド（端的・実用）
 * - warm(C): 柔らかなローズ（温かみ）
 * 本文は near-white にして圧迫感を減らし、アクセントは ribbon / 見出し / 引用枠に集約する。
 */
const STYLE_TONE: Record<
  ReplyOptionStyle,
  {
    ribbon: string;
    headerTint: string;
    accentText: string;
    accentBorder: string;
    dot: string;
    selectedBg: string;
    selectedText: string;
  }
> = {
  safe: {
    ribbon: "bg-wine-deep",
    headerTint: "bg-wine/[0.06]",
    accentText: "text-wine-deep",
    accentBorder: "border-wine/30",
    dot: "bg-wine-deep",
    selectedBg: "bg-rose-gold-metallic",
    selectedText: "text-pearl-light",
  },
  practical: {
    ribbon: "bg-gold-metallic",
    headerTint: "bg-champagne-soft/70",
    accentText: "text-gold-deep",
    accentBorder: "border-gold/40",
    dot: "bg-gold-deep",
    selectedBg: "bg-champagne-dark",
    selectedText: "text-ink",
  },
  warm: {
    ribbon: "bg-wine-soft",
    headerTint: "bg-wine/[0.04]",
    accentText: "text-wine",
    accentBorder: "border-wine/25",
    dot: "bg-wine-soft",
    selectedBg: "bg-gold-metallic",
    selectedText: "text-pearl-light",
  },
};

/** 【見出し】本文… の塊をセクション配列に分解する。 */
function parseSections(content: string): { heading: string; body: string }[] {
  const regex = /【([^】]+)】/g;
  const sections: { heading: string; body: string }[] = [];
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  let lastHeading: string | null = null;

  while ((match = regex.exec(content)) !== null) {
    if (lastHeading !== null) {
      sections.push({
        heading: lastHeading,
        body: content.slice(lastIndex, match.index).trim(),
      });
    }
    lastHeading = match[1];
    lastIndex = regex.lastIndex;
  }
  if (lastHeading !== null) {
    sections.push({ heading: lastHeading, body: content.slice(lastIndex).trim() });
  }
  if (sections.length === 0) {
    sections.push({ heading: "", body: content.trim() });
  }
  return sections;
}

interface Props {
  options: ReplyOption[];
  onPick: (option: ReplyOption) => void;
}

export function ReplyOptionPicker({ options, onPick }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handlePick = (opt: ReplyOption) => {
    if (selectedId) return; // prevent double-tap
    setSelectedId(opt.id);
    // brief delay so the selected state is visible before the picker collapses
    setTimeout(() => onPick(opt), 400);
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || options.length === 0) return;
    const cardW = el.scrollWidth / options.length;
    setActiveIndex(
      Math.min(options.length - 1, Math.max(0, Math.round(el.scrollLeft / cardW))),
    );
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  };

  const showScrollHint = options.length > 1 && !selectedId;

  return (
    <div className="space-y-2">
      {/* Caption row: instruction + position counter */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-[11px] text-ink-mute">
          <Sparkles size={11} className="text-gold-deep" />
          3つの返し方から選んでください
        </div>
        {options.length > 1 && (
          <span className="text-[10px] font-medium text-ink-mute tabular-nums">
            {activeIndex + 1}
            <span className="opacity-50"> / {options.length}</span>
          </span>
        )}
      </div>

      {/* Horizontal scroll cards (with right-edge fade affordance) */}
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory scroll-pl-1"
        >
          {options.map((opt) => {
            const Icon = STYLE_ICON[opt.style];
            const tone = STYLE_TONE[opt.style];
            const isSelected = selectedId === opt.id;
            const sections = parseSections(opt.content);
            const hero =
              sections.find((s) => s.heading.includes("文面")) ?? sections[0];
            const rest = sections.filter((s) => s !== hero);
            const heroIsMessage = hero.heading.includes("文面");

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handlePick(opt)}
                disabled={!!selectedId}
                className={cn(
                  "flex-shrink-0 w-[74vw] max-w-[300px] text-left rounded-card overflow-hidden border transition-all snap-start",
                  "shadow-soft active:scale-[0.98]",
                  isSelected
                    ? cn(tone.selectedBg, "border-transparent scale-[1.02] shadow-warm")
                    : cn("bg-pearl-light", tone.accentBorder, "hover:shadow-warm"),
                )}
              >
                {/* Accent ribbon — ひと目でパターンを区別する */}
                {!isSelected && <div className={cn("h-1 w-full", tone.ribbon)} />}

                {/* Header */}
                <div
                  className={cn(
                    "flex items-center justify-between px-3 py-1.5 border-b",
                    isSelected
                      ? "bg-white/10 border-white/20"
                      : cn(tone.headerTint, "border-transparent"),
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center gap-1.5 text-[12px] font-semibold",
                      isSelected ? tone.selectedText : tone.accentText,
                    )}
                  >
                    {isSelected ? (
                      <Check size={12} className="animate-fade-in" />
                    ) : (
                      <Icon size={12} />
                    )}
                    <span>パターン{opt.id}</span>
                    <span className="text-[10px] font-normal opacity-75">
                      · {opt.label}
                    </span>
                  </div>
                  {isSelected ? (
                    <span
                      className={cn(
                        "text-[10px] font-medium animate-fade-in",
                        tone.selectedText,
                      )}
                    >
                      選択済み ✓
                    </span>
                  ) : (
                    <span className="text-[10px] text-ink-mute">タップ →</span>
                  )}
                </div>

                {/* Body */}
                <div className="px-2.5 py-2.5 space-y-2">
                  {/* 文面例 — そのまま送れる文面を主役に見せる */}
                  <div
                    className={cn(
                      "rounded-xl border px-2.5 py-2",
                      isSelected
                        ? "bg-white/15 border-white/25"
                        : cn("bg-pearl-warm/70", tone.accentBorder),
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-1 text-[9px] font-semibold tracking-[0.12em] mb-1",
                        isSelected ? tone.selectedText : tone.accentText,
                      )}
                    >
                      <MessageCircle size={10} />
                      {heroIsMessage ? "そのまま送れる文面" : hero.heading}
                    </div>
                    <p
                      className={cn(
                        "text-[12px] leading-relaxed whitespace-pre-wrap",
                        isSelected ? tone.selectedText : "text-ink",
                      )}
                    >
                      {hero.body}
                    </p>
                  </div>

                  {/* 補足（アドバイス / なぜ効く 等）は小さく控えめに */}
                  {rest.map((sec, i) => (
                    <div key={i} className="px-0.5">
                      {sec.heading && (
                        <span
                          className={cn(
                            "text-[9px] font-semibold tracking-[0.1em]",
                            isSelected ? tone.selectedText : "text-ink-mute",
                          )}
                        >
                          {sec.heading}
                        </span>
                      )}
                      <p
                        className={cn(
                          "text-[11px] leading-snug whitespace-pre-wrap",
                          isSelected ? tone.selectedText : "text-ink-soft",
                        )}
                      >
                        {sec.body}
                      </p>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* 右端フェード + chevron で「まだ続く」を示す */}
        {showScrollHint && !atEnd && (
          <div className="pointer-events-none absolute top-0 bottom-1 right-0 w-12 flex items-center justify-end pr-0.5 bg-gradient-to-l from-pearl via-pearl/80 to-transparent">
            <ChevronRight size={18} className="text-gold-deep animate-pulse" />
          </div>
        )}
      </div>

      {/* Position dots + swipe hint */}
      {options.length > 1 && !selectedId && (
        <div className="flex items-center justify-center gap-2 pt-0.5">
          <span className="text-[10px] text-ink-mute">← スワイプ</span>
          <div className="flex items-center gap-1">
            {options.map((opt, i) => (
              <span
                key={opt.id}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === activeIndex
                    ? cn("w-4", STYLE_TONE[opt.style].dot)
                    : "w-1.5 bg-ink-mute/30",
                )}
              />
            ))}
          </div>
          <span className="text-[10px] text-ink-mute">スワイプ →</span>
        </div>
      )}

      {selectedId && (
        <p className="text-[11px] text-gold-deep px-1 animate-fade-in flex items-center gap-1">
          <Check size={11} />
          パターン{selectedId}を選択しました。反映中…
        </p>
      )}
    </div>
  );
}

export function PickedOptionBadge({ option }: { option: ReplyOption }) {
  const tone = STYLE_TONE[option.style];
  const Icon = STYLE_ICON[option.style];
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-badge text-[10px] font-medium mb-1",
        tone.headerTint,
        tone.accentText,
      )}
    >
      <Check size={10} />
      <Icon size={9} />
      パターン{option.id} · {option.label}
    </div>
  );
}

export function RefineTriggerButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-medium border border-gold/30 transition-all active:scale-[0.97]",
        disabled
          ? "bg-pearl-soft text-ink-mute cursor-not-allowed"
          : "bg-champagne-soft/60 text-gold-deep hover:bg-champagne-soft/60/80",
      )}
    >
      <Wand2 size={11} />
      この文面をブラッシュアップする
    </button>
  );
}
