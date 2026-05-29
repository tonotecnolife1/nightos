"use client";

import { cn } from "@/lib/utils";

export type ViewGrouping = "customer" | "cast";

interface Props {
  value: ViewGrouping;
  onChange: (mode: ViewGrouping) => void;
}

/**
 * 顧客の並べ方を切り替える。
 * - 担当顧客: 担当顧客グループ（紹介チェーン）ごとに表示
 * - ヘルプ顧客: 管理者→担当キャスト→顧客 の階層
 */
export function ViewGroupingToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center rounded-full bg-amethyst-muted/40 border border-amethyst-border p-0.5">
      <button
        type="button"
        onClick={() => onChange("customer")}
        className={cn(
          "h-7 px-3 rounded-full text-[10px] font-medium transition-all",
          value === "customer"
            ? "bg-roseGold-deep text-pearl-light"
            : "text-amethyst-dark",
        )}
      >
        担当顧客
      </button>
      <button
        type="button"
        onClick={() => onChange("cast")}
        className={cn(
          "h-7 px-3 rounded-full text-[10px] font-medium transition-all",
          value === "cast" ? "bg-roseGold-deep text-pearl-light" : "text-amethyst-dark",
        )}
      >
        ヘルプ顧客
      </button>
    </div>
  );
}
