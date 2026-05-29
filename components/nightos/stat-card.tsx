import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "rose" | "amethyst" | "wine";
  className?: string;
}

// v6: KPI 数字 — Cormorant Garamond + ロール別アクセント色
const toneAccent: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-ink",
  rose: "text-roseGold-ink",
  amethyst: "text-gold-deep",
  wine: "text-wine-deep",
};

export function StatCard({
  label,
  value,
  unit,
  hint,
  icon,
  tone = "default",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-hero bg-pearl-light/72 backdrop-blur-md border border-ink/[0.08] shadow-soft px-3.5 py-3.5 flex flex-col gap-1.5",
        className,
      )}
    >
      {/* 上端 hairline (rose-gold-metallic) — Stack タイル左リボンと呼応 */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5 bg-rose-gold-metallic opacity-60"
      />
      <div className="flex items-center gap-1.5 text-label-xs text-ink-mute tracking-[0.16em]">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-baseline gap-0.5 whitespace-nowrap">
        <span
          className={cn(
            "font-display text-[2.125rem] leading-none font-normal tracking-[0.01em] tabular-nums",
            toneAccent[tone],
          )}
        >
          {value}
        </span>
        {unit && (
          <span className="text-body-sm text-ink-soft pl-0.5">{unit}</span>
        )}
      </div>
      {hint && <div className="text-label-xs text-ink-mute">{hint}</div>}
    </div>
  );
}
