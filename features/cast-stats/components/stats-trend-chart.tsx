interface Props {
  /** rate は 0..1。月次など任意の粒度。id は React key + 一意性に使う。 */
  points: { id: string; label: string; rate: number }[];
}

/**
 * 再来店率の推移ライン (SVG)。
 * champagne fill + rose-gold metallic 線 + 末尾ドット。
 * (design ref: cast-stats.jsx TrendChart — 実データの月次 points に bind)
 */
export function StatsTrendChart({ points }: Props) {
  const W = 320;
  const H = 140;
  const padL = 30;
  const padR = 8;
  const padT = 12;
  const padB = 22;

  const pct = points.map((p) => Math.round(p.rate * 100));
  const last = pct.length ? pct[pct.length - 1] : 0;

  // y 軸レンジ: データを内包する 10 刻みの帯にスナップ。
  const lo = Math.min(...pct, 100);
  const hi = Math.max(...pct, 0);
  const minY = Math.max(0, Math.floor((lo - 8) / 10) * 10);
  const maxY = Math.min(100, Math.ceil((hi + 8) / 10) * 10);
  const span = Math.max(10, maxY - minY);

  const xStep =
    points.length > 1 ? (W - padL - padR) / (points.length - 1) : 0;
  const yScale = (v: number) =>
    padT + (1 - (v - minY) / span) * (H - padT - padB);

  const coords = pct.map((v, i) => [padL + i * xStep, yScale(v)] as const);
  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c[0]},${c[1]}`)
    .join(" ");
  const fillPath = coords.length
    ? `${linePath} L${coords[coords.length - 1][0]},${H - padB} L${coords[0][0]},${H - padB} Z`
    : "";

  // y 目盛り (帯を 10 刻みで)
  const yTicks: number[] = [];
  for (let t = minY; t <= maxY; t += 10) yTicks.push(t);
  const midTick = yTicks[Math.floor(yTicks.length / 2)];

  return (
    <div
      className="relative overflow-hidden rounded-[24px] px-3.5 pt-3.5 pb-3 border border-ink/[0.08] shadow-soft"
      style={{
        background: "rgba(255, 253, 248, 0.82)",
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
      }}
    >
      <span
        aria-hidden
        className="absolute left-0 right-0 top-0 h-px"
        style={{ background: "var(--gold-metallic)", opacity: 0.55 }}
      />

      <div className="flex items-end justify-between mb-2">
        <div>
          <div
            className="font-sans text-[10px] leading-none text-ink-mute"
            style={{ letterSpacing: "0.16em" }}
          >
            RETENTION · MONTHLY
          </div>
          <div
            className="mt-1.5 font-serif text-[16px] leading-none font-medium text-ink"
            style={{ letterSpacing: "0.02em" }}
          >
            再来店率の動き
          </div>
        </div>
        <div className="text-right">
          <span
            className="font-display text-[28px] leading-none tabular-nums"
            style={{ letterSpacing: "0.02em", color: "var(--rose-gold-ink)" }}
          >
            {last}
          </span>
          <span
            className="font-sans text-[11px] leading-none text-ink-mute pl-0.5"
            style={{ letterSpacing: "0.04em" }}
          >
            % 現在
          </span>
        </div>
      </div>

      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block", overflow: "visible" }}
      >
        {/* y gridlines */}
        {yTicks.map((y) => (
          <g key={y}>
            <line
              x1={padL}
              y1={yScale(y)}
              x2={W - padR}
              y2={yScale(y)}
              stroke="rgba(42,31,26,0.06)"
              strokeWidth="1"
              strokeDasharray={y === midTick ? "none" : "2 3"}
            />
            <text
              x={padL - 6}
              y={yScale(y) + 3}
              fill="var(--ink-mute)"
              textAnchor="end"
              style={{ font: "400 9px/1 var(--font-display, serif)" }}
            >
              {y}
            </text>
          </g>
        ))}

        <defs>
          <linearGradient id="statsFillG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0e2c8" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#f0e2c8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="statsLineG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#D4A88B" />
            <stop offset="100%" stopColor="#A0644A" />
          </linearGradient>
        </defs>

        {fillPath && <path d={fillPath} fill="url(#statsFillG)" />}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="url(#statsLineG)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* point dots */}
        {coords.map((c, i) => (
          <circle
            key={points[i].id}
            cx={c[0]}
            cy={c[1]}
            r={i === coords.length - 1 ? 3.5 : 2.5}
            fill={i === coords.length - 1 ? "#B07A5C" : "#D4A88B"}
            stroke="#fdfcf9"
            strokeWidth="1.5"
          />
        ))}

        {/* x labels */}
        {points.map((p, i) => (
          <text
            key={p.id}
            x={padL + i * xStep}
            y={H - 4}
            fill="var(--ink-mute)"
            textAnchor="middle"
            style={{ font: "400 9px/1 var(--font-display, serif)" }}
          >
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
