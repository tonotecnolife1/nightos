"use client";

import {
  ChevronRight,
  MessageCircle,
  Pencil,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Intent } from "@/types/nightos";

interface IntentOption {
  value: Intent;
  icon: typeof MessageCircle;
  label: string;
  description: string;
  tone: "rose" | "amethyst" | "champagne" | "blush";
}

const INTENT_OPTIONS: IntentOption[] = [
  {
    value: "follow",
    icon: MessageCircle,
    label: "LINEで連絡したい",
    description: "お礼・お誘い・お祝い・季節の挨拶",
    tone: "rose",
  },
  {
    value: "serving",
    icon: Sparkles,
    label: "今、接客中で困っている",
    description: "会話・指名・ボトル提案など",
    tone: "amethyst",
  },
  {
    value: "strategy",
    icon: TrendingUp,
    label: "営業戦略の相談",
    description: "売上・指名化・常連離れ",
    tone: "champagne",
  },
  {
    value: "freeform",
    icon: Pencil,
    label: "自由に話す",
    description: "話しかけても、書いてもOK",
    tone: "blush",
  },
];

const toneClasses: Record<
  IntentOption["tone"],
  { bg: string; iconBg: string; border: string }
> = {
  rose: {
    bg: "bg-pearl-warm hover:bg-roseGold-muted",
    iconBg: "bg-gradient-rose-gold text-pearl",
    border: "border-roseGold-border",
  },
  amethyst: {
    bg: "bg-pearl-warm hover:bg-amethyst-muted",
    iconBg: "bg-gradient-amethyst text-pearl",
    border: "border-amethyst-border",
  },
  champagne: {
    bg: "bg-pearl-warm hover:bg-champagne-light",
    iconBg: "bg-champagne-dark text-ink",
    border: "border-champagne-dark",
  },
  blush: {
    bg: "bg-pearl-warm hover:bg-blush-light",
    iconBg: "bg-blush text-pearl",
    border: "border-blush-light",
  },
};

interface Props {
  onPick: (intent: Intent) => void;
}

export function IntentPicker({ onPick }: Props) {
  return (
    <div className="space-y-2.5 animate-fade-in pt-1">
      <p className="text-label-md text-amethyst-dark text-center font-medium">
        どんな相談から始める？
      </p>
      <div className="space-y-2">
        {INTENT_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const cls = toneClasses[opt.tone];
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onPick(opt.value)}
              className={cn(
                "w-full text-left rounded-card border shadow-soft-card transition-all active:scale-[0.98]",
                cls.bg,
                cls.border,
              )}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <div
                  className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center shrink-0",
                    cls.iconBg,
                  )}
                >
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-body-md font-semibold text-ink">
                    {opt.label}
                  </div>
                  <div className="text-label-sm text-ink-secondary">
                    {opt.description}
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className="text-ink-muted shrink-0"
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
