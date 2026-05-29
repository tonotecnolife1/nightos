interface Props {
  points: { week: string; label: string; rate: number }[];
}

export function CastRepeatTrend({ points }: Props) {
  return (
    <div className="space-y-3">
      {points.map((p) => (
        <div key={p.week}>
          <div className="flex items-center justify-between text-label-sm mb-1">
            <span className="text-ink-soft">{p.label}</span>
            <span className="text-ink font-medium">
              {Math.round(p.rate * 100)}%
            </span>
          </div>
          <div className="h-2.5 bg-pearl-soft rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-rose-gold transition-all"
              style={{ width: `${p.rate * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
