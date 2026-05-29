"use client";

import { Check, Heart, Sparkles, Wand2, Zap } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ReplyOption, ReplyOptionStyle } from "@/types/nightos";

const STYLE_ICON: Record<ReplyOptionStyle, typeof Heart> = {
  safe: Heart,
  practical: Zap,
  warm: Sparkles,
};

const STYLE_TONE: Record<
  ReplyOptionStyle,
  { bg: string; border: string; text: string; selectedBg: string; selectedText: string }
> = {
  safe: {
    bg: "bg-roseGold-muted",
    border: "border-roseGold-border",
    text: "text-roseGold-dark",
    selectedBg: "bg-gradient-rose-gold",
    selectedText: "text-pearl",
  },
  practical: {
    bg: "bg-champagne",
    border: "border-champagne-dark",
    text: "text-ink",
    selectedBg: "bg-champagne-dark",
    selectedText: "text-ink",
  },
  warm: {
    bg: "bg-champagne-soft/60",
    border: "border-gold/30",
    text: "text-gold-deep",
    selectedBg: "bg-gradient-amethyst",
    selectedText: "text-pearl",
  },
};

interface Props {
  options: ReplyOption[];
  onPick: (option: ReplyOption) => void;
}

export function ReplyOptionPicker({ options, onPick }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handlePick = (opt: ReplyOption) => {
    if (selectedId) return; // prevent double-tap
    setSelectedId(opt.id);
    // brief delay so the selected state is visible before the picker collapses
    setTimeout(() => onPick(opt), 400);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] text-ink-mute px-1">
        <Sparkles size={11} className="text-gold-deep" />
        3つの返し方から選んでください
      </div>

      {/* Horizontal scroll cards */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
        {options.map((opt) => {
          const Icon = STYLE_ICON[opt.style];
          const tone = STYLE_TONE[opt.style];
          const isSelected = selectedId === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handlePick(opt)}
              disabled={!!selectedId}
              className={cn(
                "flex-shrink-0 w-[72vw] max-w-[280px] text-left rounded-card border transition-all snap-start",
                "shadow-soft active:scale-[0.98]",
                isSelected
                  ? cn(tone.selectedBg, "border-transparent scale-[1.02] shadow-warm")
                  : cn("bg-pearl-warm", tone.border, "hover:shadow-warm"),
              )}
            >
              {/* Header */}
              <div
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-t-card border-b",
                  isSelected
                    ? "bg-white/10 border-white/20"
                    : cn(tone.bg, tone.border),
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-1.5 text-label-sm font-semibold",
                    isSelected ? tone.selectedText : tone.text,
                  )}
                >
                  {isSelected ? (
                    <Check size={12} className="animate-fade-in" />
                  ) : (
                    <Icon size={12} />
                  )}
                  <span>パターン{opt.id}</span>
                  <span className="text-[10px] font-normal opacity-80">
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
              <div
                className={cn(
                  "px-3 py-2.5 text-body-sm whitespace-pre-wrap leading-relaxed",
                  isSelected ? tone.selectedText : "text-ink",
                )}
              >
                {opt.content}
              </div>
            </button>
          );
        })}
      </div>

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
        tone.bg,
        tone.text,
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
