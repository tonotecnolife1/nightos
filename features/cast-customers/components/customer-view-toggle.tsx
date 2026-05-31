"use client";

import { cn } from "@/lib/utils";

export type CustomerView = "priority" | "customer" | "cast";

interface Props {
  value: CustomerView;
  onChange: (mode: CustomerView) => void;
  /** ヘルプ顧客がいない場合は「ヘルプ」を出さない */
  showHelp?: boolean;
}

const OPTIONS: { v: CustomerView; label: string }[] = [
  { v: "priority", label: "優先" },
  { v: "customer", label: "担当" },
  { v: "cast", label: "ヘルプ" },
];

/**
 * お客様リストの表示方法を切り替える。
 * - 優先: 大事な順 / 状態セグメント + ピン留め（スケール対策）
 * - 担当: 紹介チェーンごとのツリー
 * - ヘルプ: 管理者→担当キャスト→お客様 の階層
 */
export function CustomerViewToggle({ value, onChange, showHelp = true }: Props) {
  const options = showHelp ? OPTIONS : OPTIONS.filter((o) => o.v !== "cast");
  return (
    <div className="inline-flex items-center rounded-full bg-champagne-soft/60/40 border border-gold/30 p-0.5">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={cn(
            "h-7 px-3 rounded-full text-[10px] font-medium transition-all",
            value === o.v ? "bg-wine-deep text-pearl-light" : "text-gold-deep",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
