import { cn } from "@/lib/utils";
import type { TrendPoint } from "@/lib/nightos/store-mock-data";

interface Props {
  points: TrendPoint[];
}

/**
 * Simple stacked-bar chart. No external library — we scale to the local max
 * and render two rose/amethyst bars per day so the trend is scannable.
 */
export function NominationTrendBars({ points }: Props) {
  const max = Math.max(
    ...points.map((p) => p.cast1 + p.cast2),
    1, // avoid div-by-zero
  );

  return (
    <div>
      <div className="flex items-end gap-1 h-32">
        {points.map((p) => {
          const total = p.cast1 + p.cast2;
          const heightPct = (total / max) * 100;
          const cast1Pct = total === 0 ? 0 : (p.cast1 / total) * 100;
          return (
            <div
              key={p.date}
              className="flex-1 flex flex-col items-center justify-end h-full group"
              title={`${p.date} — あかり: ${p.cast1} / ゆき: ${p.cast2}`}
            >
              <div
                className={cn(
                  "w-full rounded-t-sm overflow-hidden flex flex-col-reverse",
                  "bg-pearl-soft",
                )}
                style={{ height: `${heightPct}%` }}
              >
                <div
                  className="w-full bg-gradient-rose-gold"
                  style={{ height: `${cast1Pct}%` }}
                />
                <div
                  className="w-full bg-gradient-amethyst"
                  style={{ height: `${100 - cast1Pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {/* Dates (only show every 3rd to avoid crowding) */}
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
      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-label-sm">
        <div className="flex items-center gap-1.5 text-ink-soft">
          <span className="w-2.5 h-2.5 rounded-sm bg-gradient-rose-gold" />
          あかり
        </div>
        <div className="flex items-center gap-1.5 text-ink-soft">
          <span className="w-2.5 h-2.5 rounded-sm bg-gradient-amethyst" />
          ゆき
        </div>
      </div>
    </div>
  );
}
