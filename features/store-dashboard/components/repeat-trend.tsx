import type { RepeatPoint } from "@/lib/nightos/store-mock-data";

interface Props {
  points: RepeatPoint[];
}

export function RepeatTrend({ points }: Props) {
  return (
    <div className="space-y-3">
      {points.map((p) => (
        <div key={p.week}>
          <div className="flex items-center justify-between text-label-sm mb-1">
            <span className="text-ink-soft">{p.label}</span>
            <span className="text-ink">
              あかり {Math.round(p.cast1 * 100)}% / ゆき{" "}
              {Math.round(p.cast2 * 100)}%
            </span>
          </div>
          <div className="flex gap-1 h-2.5">
            <div className="flex-1 bg-pearl-soft rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-gold-metallic transition-all"
                style={{ width: `${p.cast1 * 100}%` }}
              />
            </div>
            <div className="flex-1 bg-pearl-soft rounded-full overflow-hidden">
              <div
                className="h-full bg-gold-metallic transition-all"
                style={{ width: `${p.cast2 * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
