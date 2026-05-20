import type { CastHomeSummary } from "@/types/nightos";

type Accent = "rose" | "gold" | "wine";

function KpiCard({
  label,
  value,
  unit,
  sub,
  accent = "rose",
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  accent?: Accent;
}) {
  const accentColor =
    accent === "rose"
      ? "var(--rg-ink)"
      : accent === "gold"
        ? "var(--gold-deep)"
        : "var(--wine-deep)";
  return (
    <div
      className="relative overflow-hidden bg-glass-pearl border border-ink/[0.08] shadow-soft flex-1 min-w-0 flex flex-col"
      style={{
        padding: "14px 14px",
        borderRadius: 24,
        gap: 6,
        // Local CSS variables — keep token names out of Tailwind core
        ["--rg-ink" as never]: "#6e4736",
        ["--gold-deep" as never]: "#8a6e3d",
        ["--wine-deep" as never]: "#5e3838",
      }}
    >
      {/* Top hairline accent — matches Stack tile left ribbon */}
      <span
        aria-hidden
        className="absolute left-0 right-0 top-0 bg-gradient-rose-gold-metallic"
        style={{ height: 2, opacity: 0.55 }}
      />
      <div
        className="text-[10px] leading-none text-ink-muted"
        style={{ letterSpacing: "0.16em", fontWeight: 500 }}
      >
        {label}
      </div>
      <div className="flex items-baseline gap-[3px] whitespace-nowrap">
        <span
          className="font-display"
          style={{
            fontSize: 34,
            lineHeight: 1,
            fontWeight: 400,
            letterSpacing: "0.01em",
            color: accentColor,
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="text-[12px] leading-none text-ink-secondary"
            style={{ paddingLeft: 1, whiteSpace: "nowrap" }}
          >
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <div className="text-[10.5px] leading-[1.3] text-ink-muted">{sub}</div>
      )}
    </div>
  );
}

function formatMan(yen: number): string {
  return (yen / 10000).toFixed(1);
}

export function KpiRow({ summary }: { summary: CastHomeSummary }) {
  const douhanCount = summary.douhanCount ?? summary.nominationCount;
  const douhanGoal = summary.douhanGoal;
  return (
    <div className="flex gap-[9px]">
      <KpiCard
        label="今月の同伴"
        value={String(douhanCount)}
        unit="件"
        sub={douhanGoal ? `目標 ${douhanGoal}件` : undefined}
        accent="rose"
      />
      <KpiCard
        label="今月の売上"
        value={formatMan(summary.monthlySales)}
        unit="万円"
        sub="今月"
        accent="gold"
      />
      <KpiCard
        label="新規"
        value={String(summary.newCustomerCount)}
        unit="名"
        sub="今月"
        accent="wine"
      />
    </div>
  );
}
