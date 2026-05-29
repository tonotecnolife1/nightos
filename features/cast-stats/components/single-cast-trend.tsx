import { cn } from "@/lib/utils";

interface Props {
  points: { date: string; count: number }[];
}

/**
 * Single-cast bar chart for the last 14 days.
 * 縦軸（0 / 中央値 / 最大値）と各バー上の数値を表示。
 */
export function SingleCastTrend({ points }: Props) {
  const max = Math.max(...points.map((p) => p.count), 1);
  // Y-axis ticks (上から max → max/2 → 0)
  const tickValues = [max, Math.round(max / 2), 0];

  return (
    <div className="flex gap-2">
      {/* Y-axis */}
      <div className="flex flex-col justify-between h-32 pb-[1px] text-[9px] text-ink-mute text-right pr-1 w-6 shrink-0">
        {tickValues.map((v, i) => (
          <span key={i}>{v}</span>
        ))}
      </div>

      <div className="flex-1 min-w-0">
        {/* Plot area with gridlines */}
        <div className="relative h-32">
          {/* Horizontal gridlines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {tickValues.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "border-t border-dashed",
                  i === tickValues.length - 1
                    ? "border-ink-muted/40"
                    : "border-pearl-soft",
                )}
              />
            ))}
          </div>

          {/* Bars */}
          <div className="absolute inset-0 flex items-end gap-1">
            {points.map((p) => {
              const heightPct = (p.count / max) * 100;
              return (
                <div
                  key={p.date}
                  className="flex-1 flex flex-col items-center justify-end h-full min-w-0"
                  title={`${p.date}: ${p.count}本`}
                >
                  {/* Value label on top of bar */}
                  {p.count > 0 && (
                    <span className="text-[9px] font-semibold text-ink-soft mb-0.5">
                      {p.count}
                    </span>
                  )}
                  <div
                    className={cn(
                      "w-full rounded-t-sm bg-gradient-rose-gold transition-all",
                      p.count === 0 && "bg-pearl-soft",
                    )}
                    style={{ height: `${Math.max(2, heightPct)}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        {/* X-axis (dates) */}
        <div className="flex items-start gap-1 mt-1">
          {points.map((p, i) => (
            <div
              key={p.date}
              className="flex-1 text-center text-[9px] text-ink-mute"
            >
              {i % 3 === 0 ? p.date.slice(-5) : ""}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
