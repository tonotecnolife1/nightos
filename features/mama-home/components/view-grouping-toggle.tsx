"use client";

import { cn } from "@/lib/utils";

export type ViewGrouping = "customer" | "cast";

interface Props {
  value: ViewGrouping;
  onChange: (mode: ViewGrouping) => void;
}

/**
 * お客様の並べ方を切り替える。
 * - お客様: 紹介チェーンごとに表示
 * - 係: 係→ヘルプ→お客様 の階層
 */
export function ViewGroupingToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center rounded-full bg-champagne-soft/60/40 border border-gold/30 p-0.5">
      <button
        type="button"
        onClick={() => onChange("customer")}
        className={cn(
          "h-7 px-3 rounded-full text-[10px] font-medium transition-all",
          value === "customer"
            ? "bg-wine-deep text-pearl-light"
            : "text-gold-deep",
        )}
      >
        お客様
      </button>
      <button
        type="button"
        onClick={() => onChange("cast")}
        className={cn(
          "h-7 px-3 rounded-full text-[10px] font-medium transition-all",
          value === "cast" ? "bg-wine-deep text-pearl-light" : "text-gold-deep",
        )}
      >
        係
      </button>
    </div>
  );
}
