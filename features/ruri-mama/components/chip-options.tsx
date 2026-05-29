"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  question: string;
  options: string[];
  onPick: (value: string) => void;
  onSkip?: () => void;
}

export function ChipOptions({ question, options, onPick, onSkip }: Props) {
  const [picked, setPicked] = useState<string | null>(null);

  const handlePick = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    onPick(opt);
  };

  return (
    <div className="rounded-2xl border border-amethyst-border bg-amethyst-muted px-4 py-3.5 space-y-2.5 animate-fade-in">
      <p className="text-label-md text-amethyst-dark">{question}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handlePick(opt)}
            disabled={!!picked}
            className={cn(
              "px-3.5 h-9 rounded-badge text-body-sm border transition-all active:scale-95",
              picked === opt
                ? "bg-roseGold-deep text-pearl-light border-amethyst-dark scale-95 shadow-soft"
                : picked
                  ? "bg-pearl-soft text-ink-muted border-pearl-soft opacity-50"
                  : "bg-pearl-warm text-amethyst-dark border-amethyst-border hover:bg-amethyst hover:text-pearl hover:border-amethyst-dark",
            )}
          >
            {opt}
          </button>
        ))}
        {onSkip && !picked && (
          <button
            type="button"
            onClick={onSkip}
            className="px-3.5 h-9 rounded-badge text-body-sm bg-transparent text-ink-secondary underline underline-offset-2 hover:text-amethyst-dark"
          >
            お任せ
          </button>
        )}
      </div>
    </div>
  );
}
