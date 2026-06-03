interface Props {
  label: string;
  current: number;
  goal: number;
  /** 接頭辞 (例: "¥")。数値の前に付く。 */
  prefix?: string;
  /** 単位 (例: "回")。数値の後に付く。 */
  unit?: string;
  /** 進捗バーの塗り (CSS background)。 */
  barColor: string;
}

const nf = (n: number) => n.toLocaleString("ja-JP");

/**
 * 目標進捗カード — pearl glass + 上端 gold hairline + 左 gold ribbon。
 * 大数字 (Cormorant) + 進捗バー + 達成率 + 残量。
 * (design ref: cast-stats.jsx GoalCard)
 */
export function StatsGoalCard({
  label,
  current,
  goal,
  prefix,
  unit,
  barColor,
}: Props) {
  const pct = goal === 0 ? 0 : Math.round((current / goal) * 100);
  const remaining = Math.max(0, goal - current);
  const done = pct >= 100;

  return (
    <div
      className="relative overflow-hidden rounded-[24px] px-[18px] pt-4 pb-[18px] border border-ink/[0.08] shadow-warm"
      style={{
        background: "rgba(255, 253, 248, 0.82)",
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
      }}
    >
      <span
        aria-hidden
        className="absolute left-0 right-0 top-0 h-px"
        style={{ background: "var(--gold-metallic)", opacity: 0.6 }}
      />
      <span
        aria-hidden
        className="absolute left-0 top-3.5 bottom-3.5 w-[3px]"
        style={{ background: "var(--gold-metallic)" }}
      />

      <div
        className="font-sans text-[10px] leading-none text-ink-mute mb-2.5"
        style={{ letterSpacing: "0.18em" }}
      >
        {label}
      </div>

      <div className="flex items-baseline gap-1.5 flex-wrap">
        {prefix && (
          <span className="font-display text-[22px] leading-none text-ink-soft">
            {prefix}
          </span>
        )}
        <span
          className="font-display text-[38px] leading-none text-ink tabular-nums"
          style={{ letterSpacing: "0.01em" }}
        >
          {nf(current)}
        </span>
        {unit && (
          <span className="font-sans text-[13px] leading-none text-ink-soft pl-px">
            {unit}
          </span>
        )}
        <span
          className="ml-auto font-sans text-[12px] leading-none text-ink-mute"
          style={{ letterSpacing: "0.04em" }}
        >
          目標 {prefix}
          <span className="font-display text-[14px] leading-none text-ink-soft tabular-nums">
            {nf(goal)}
          </span>
          {unit}
        </span>
      </div>

      {/* progress bar */}
      <div
        className="mt-3.5 h-2.5 rounded-pill relative overflow-hidden"
        style={{
          background: "var(--pearl-soft)",
          boxShadow: "inset 0 1px 2px rgba(42,31,26,0.08)",
        }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 rounded-pill"
          style={{
            width: `${Math.min(pct, 100)}%`,
            background: done ? "var(--rose-gold-metallic)" : barColor,
            boxShadow:
              "inset 0 1px 0 rgba(253,248,240,0.7), 0 1px 3px rgba(110,42,51,0.18)",
          }}
        />
      </div>

      <div className="mt-2 flex items-baseline justify-between">
        <span
          className="font-display text-[22px] leading-none tabular-nums"
          style={{
            letterSpacing: "0.02em",
            color: done ? "var(--wine-deep)" : "var(--rose-gold-ink)",
          }}
        >
          {pct}
          <span
            className="font-sans text-[11px] leading-none text-ink-mute pl-0.5"
            style={{ letterSpacing: "0.04em" }}
          >
            %
          </span>
        </span>
        <span
          className="font-sans text-[11px] leading-none text-ink-mute"
          style={{ letterSpacing: "0.04em" }}
        >
          {done ? (
            <span className="text-wine-deep font-medium">目標達成 ✨</span>
          ) : (
            <>
              残り {prefix}
              <span className="font-display text-[13px] leading-none text-ink-soft tabular-nums">
                {nf(remaining)}
              </span>
              {unit}
            </>
          )}
        </span>
      </div>
    </div>
  );
}
