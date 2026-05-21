"use client";

import { X } from "lucide-react";
import { REFINE_DIRECTIONS, type RefineDirection } from "../data/refine-directions";

interface Props {
  onPick: (direction: RefineDirection) => void;
  onCancel: () => void;
}

/**
 * ブラッシュアップの方向性を選ぶチップUI。
 * 「もっと温かく」「もっと短く」など6方向からユーザーが1つ選択。
 */
export function RefineDirectionPicker({ onPick, onCancel }: Props) {
  return (
    <div className="rounded-card border border-amethyst-border bg-amethyst-muted/30 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-label-sm text-amethyst-dark font-medium">
          どの方向でブラッシュアップしますか？
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="p-0.5 text-ink-muted hover:text-ink-secondary"
          aria-label="キャンセル"
        >
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {REFINE_DIRECTIONS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => onPick(d)}
            className="flex items-center justify-center gap-1 h-9 rounded-full bg-pearl-warm border border-amethyst-border text-[11px] text-ink active:scale-[0.97] hover:bg-amethyst-muted/50 transition-all"
          >
            <span>{d.emoji}</span>
            <span>{d.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
