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

// V5 Bordeaux Salon — pearl glass tile + champagne-gold hairline top + Cormorant accent
const toneAccent: Record<NonNullable<Props["tone"]>, string> = {
  default: "text-ink",
  rose: "text-wine",
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
        "relative overflow-hidden rounded-[22px] border border-ink/[0.08] px-3.5 py-3.5 flex flex-col gap-1.5",
        className,
      )}
      style={{
        background: "rgba(253, 248, 240, 0.82)",
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
        boxShadow:
          "0 4px 12px rgba(94,56,56,0.10), 0 16px 32px rgba(58,31,31,0.08)",
      }}
    >
      {/* V5: 上端 champagne-gold hairline (Section ribbon と呼応) */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ background: "var(--v5-champ-gold)", opacity: 0.7 }}
      />
      <div
        className="flex items-center gap-1.5 text-label-xs text-ink-mute"
        style={{ letterSpacing: "0.20em" }}
      >
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-baseline gap-0.5 whitespace-nowrap">
        <span
          className={cn(
            "font-display text-[2.125rem] leading-none font-normal tabular-nums",
            toneAccent[tone],
          )}
          style={{ letterSpacing: "0.02em" }}
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
