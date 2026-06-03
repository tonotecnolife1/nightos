import type { ReactNode } from "react";

type Accent = "ink" | "rose" | "wine" | "gold" | "amber";

const ACCENT_COLOR: Record<Accent, string> = {
  ink: "var(--ink)",
  rose: "var(--rose-gold-ink)",
  wine: "var(--wine-deep)",
  gold: "var(--gold-deep)",
  amber: "#c8761f",
};

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  prefix?: string;
  accent?: Accent;
  /** lucide icon (size は呼び出し側で 11 程度に) */
  icon?: ReactNode;
  /** 集計期間バッジ。「今月」(当月集計) / 「累計」(継続・通算) を右上に表示。 */
  period?: "今月" | "累計";
}

/**
 * 小型 KPI タイル — pearl glass + 上端 gold hairline + Cormorant 数字。
 * (design ref: cast-stats.jsx MiniKpi)
 */
export function StatsMiniKpi({
  label,
  value,
  unit,
  prefix,
  accent = "ink",
  icon,
  period,
}: Props) {
  const color = ACCENT_COLOR[accent];
  return (
    <div
      className="relative overflow-hidden flex-1 min-w-0 px-3 py-3 rounded-[24px] border border-ink/[0.08] shadow-soft flex flex-col gap-1.5"
      style={{
        background: "rgba(255, 253, 248, 0.82)",
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
      }}
    >
      <span
        aria-hidden
        className="absolute left-0 right-0 top-0 h-[1.5px]"
        style={{ background: "var(--gold-metallic)", opacity: 0.55 }}
      />
      {period && (
        <span
          className="absolute top-2 right-2.5 font-sans text-[8px] leading-none tracking-[0.12em] text-ink-soft rounded-full px-1.5 py-[3px]"
          style={{ background: "rgba(45, 24, 24, 0.06)" }}
        >
          {period}
        </span>
      )}
      <div className="flex items-center gap-1.5">
        {icon && (
          <span className="inline-flex" style={{ color }}>
            {icon}
          </span>
        )}
        <span
          className="font-sans text-[9.5px] leading-[1.2] text-ink-mute"
          style={{ letterSpacing: "0.14em" }}
        >
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-0.5">
        {prefix && (
          <span className="font-display text-[12px] leading-none text-ink-soft">
            {prefix}
          </span>
        )}
        <span
          className="font-display text-[24px] leading-none tabular-nums"
          style={{ letterSpacing: "0.01em", color }}
        >
          {value}
        </span>
        {unit && (
          <span className="font-sans text-[10.5px] leading-none text-ink-soft pl-px">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
