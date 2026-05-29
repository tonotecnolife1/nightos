import { Card } from "@/components/nightos/card";
import type { Customer } from "@/types/nightos";

interface Props {
  customers: Customer[];
}

export function CategoryBreakdown({ customers }: Props) {
  const total = customers.length;
  if (total === 0) return null;

  const vip = customers.filter((c) => c.category === "vip").length;
  const regular = customers.filter((c) => c.category === "regular").length;
  const newC = customers.filter((c) => c.category === "new").length;

  const segments = [
    { label: "VIP", count: vip, pct: Math.round((vip / total) * 100), color: "bg-rose-gold-metallic" },
    { label: "常連", count: regular, pct: Math.round((regular / total) * 100), color: "bg-champagne-dark" },
    { label: "新規", count: newC, pct: Math.round((newC / total) * 100), color: "bg-roseGold-deep" },
  ];

  return (
    <Card className="p-4 space-y-3">
      {/* Stacked bar */}
      <div className="h-5 rounded-full overflow-hidden flex">
        {segments.map((seg) =>
          seg.count > 0 ? (
            <div
              key={seg.label}
              className={`${seg.color} transition-all`}
              style={{ width: `${seg.pct}%` }}
              title={`${seg.label}: ${seg.count}人 (${seg.pct}%)`}
            />
          ) : null,
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-around text-label-sm">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-sm ${seg.color}`} />
            <span className="text-ink-soft">
              {seg.label} {seg.count}人
            </span>
            <span className="text-ink-mute">({seg.pct}%)</span>
          </div>
        ))}
      </div>

      {/* Insight */}
      <div className="text-label-sm text-ink-mute">
        全{total}人
        {vip > 0 && regular > 0 && (
          <>
            。VIP比率{segments[0].pct}%
            {segments[0].pct < 20
              ? " — VIP化の余地があります"
              : segments[0].pct > 40
                ? " — VIP層が厚く、安定した売上基盤"
                : ""}
          </>
        )}
      </div>
    </Card>
  );
}
