"use client";

import { cn } from "@/lib/utils";
import { useVenueConfig } from "@/lib/nightos/use-venue-config";

export type CustomerScope = "tantou" | "help";

interface Props {
  value: CustomerScope;
  onChange: (scope: CustomerScope) => void;
}

/**
 * お客様リストの絞り込みを切り替える。
 * - 担当: 自分が担当（manager_cast_id === 自分）の顧客
 * - ヘルプ: ヘルプで入った顧客（担当は他キャスト）
 */
export function CustomerScopeToggle({ value, onChange }: Props) {
  const relation = useVenueConfig().labels.customerRelation;
  return (
    <div className="inline-flex items-center rounded-full bg-champagne-soft/60/40 border border-gold/30 p-0.5">
      <button
        type="button"
        onClick={() => onChange("tantou")}
        className={cn(
          "h-7 px-3 rounded-full text-[10px] font-medium transition-all",
          value === "tantou"
            ? "bg-wine-deep text-pearl-light"
            : "text-gold-deep",
        )}
      >
        {relation}
      </button>
      <button
        type="button"
        onClick={() => onChange("help")}
        className={cn(
          "h-7 px-3 rounded-full text-[10px] font-medium transition-all",
          value === "help" ? "bg-wine-deep text-pearl-light" : "text-gold-deep",
        )}
      >
        ヘルプ
      </button>
    </div>
  );
}
