import { Card } from "@/components/nightos/card";
import { cn, formatCurrency } from "@/lib/utils";

interface Props {
  label: string;
  current: number;
  goal: number;
  unit: string;
  formatter?: (n: number) => string;
}

export function GoalProgress({
  label,
  current,
  goal,
  unit,
  formatter,
}: Props) {
  const pct = goal === 0 ? 0 : Math.min(1, current / goal);
  const remaining = Math.max(0, goal - current);
  const fmt = formatter ?? ((n: number) => n.toString());

  return (
    <Card className="p-4 space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-label-md text-ink-soft">{label}</span>
        <span className="text-label-xs tracking-luxe text-ink-mute uppercase">
          目標 {fmt(goal)}
          {unit}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            "font-display text-[2.5rem] leading-none font-normal tabular-nums tracking-[0.01em]",
            pct >= 1 ? "text-success" : "text-roseGold-deep",
          )}
        >
          {fmt(current)}
        </span>
        <span className="text-body-sm text-ink-soft pb-0.5">{unit}</span>
      </div>
      <div className="h-2 rounded-full bg-pearl-soft overflow-hidden">
        <div
          className={cn(
            "h-full transition-all",
            pct >= 1 ? "bg-success" : "bg-rose-gold-metallic",
          )}
          style={{ width: `${Math.round(pct * 100)}%` }}
        />
      </div>
      <div className="text-label-sm text-ink-mute">
        {pct >= 1 ? (
          <span className="text-success font-medium">目標達成 ✨</span>
        ) : (
          <>
            あと {fmt(remaining)}
            {unit}（{Math.round(pct * 100)}%）
          </>
        )}
      </div>
    </Card>
  );
}

export const currencyFormatter = (n: number) =>
  formatCurrency(n).replace("¥", "¥");
