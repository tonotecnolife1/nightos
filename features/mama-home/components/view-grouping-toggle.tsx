"use client";

import { cn } from "@/lib/utils";

export type ViewGrouping = "customer" | "cast";

interface Props {
  value: ViewGrouping;
  onChange: (mode: ViewGrouping) => void;
}

/**
 * お客様の並べ方を切り替える。
 * - 担当: 担当グループ（紹介チェーン）ごとに表示
 * - ヘルプ: 管理者→キャスト→お客様 の階層。各管理者の下に「担当」バケットに加え
 *   来店由来の「ヘルプ」バケットを表示し、1顧客が複数ヘルプ配下に現れうる（多対多）
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
        担当
      </button>
      <button
        type="button"
        onClick={() => onChange("cast")}
        className={cn(
          "h-7 px-3 rounded-full text-[10px] font-medium transition-all",
          value === "cast" ? "bg-wine-deep text-pearl-light" : "text-gold-deep",
        )}
      >
        ヘルプ
      </button>
    </div>
  );
}
