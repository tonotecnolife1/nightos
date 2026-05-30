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
        担当顧客
      </button>
      <button
        type="button"
        onClick={() => onChange("cast")}
        className={cn(
          "h-7 px-3 rounded-full text-[10px] font-medium transition-all",
          value === "cast" ? "bg-wine-deep text-pearl-light" : "text-gold-deep",
        )}
      >
        ヘルプ顧客
      </button>
    </div>
  );
}
