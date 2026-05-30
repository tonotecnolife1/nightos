import { Calendar, Sparkles, User } from "lucide-react";
import { Card } from "@/components/nightos/card";
import type { Visit } from "@/types/nightos";

interface Props {
  visits: Visit[];
  /** How many recent visits to show. Defaults to 5. */
  limit?: number;
}

export function VisitHistory({ visits, limit = 5 }: Props) {
  if (visits.length === 0) {
    return null;
  }

  // Visits are already sorted desc by visited_at in getCustomerContext
  const recent = visits.slice(0, limit);

  return (
    <section className="space-y-2">
      <h3 className="text-display-sm text-ink flex items-center gap-1.5">
        <Calendar size={16} className="text-ink-soft" />
        来店履歴
        <span className="text-label-sm text-ink-mute">直近{recent.length}回</span>
      </h3>

      <Card className="p-0 overflow-hidden">
        <ul className="divide-y divide-pearl-soft">
          {recent.map((visit, idx) => (
            <li
              key={visit.id}
              className="flex items-center gap-3 px-4 py-2.5"
            >
              {/* Timeline marker */}
              <div className="relative flex flex-col items-center">
                <span
                  className={`w-2 h-2 rounded-full ${
                    idx === 0 ? "bg-wine-deep" : "bg-pearl-soft"
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-body-md ${
                      idx === 0 ? "text-ink font-semibold" : "text-ink"
                    }`}
                  >
                    {formatDate(visit.visited_at)}
                  </span>
                  {idx === 0 && (
                    <span className="text-label-sm text-wine-deep">
                      最新
                    </span>
                  )}
                </div>
                {visit.table_name && (
                  <div className="text-label-sm text-ink-mute">
                    テーブル: {visit.table_name}
                  </div>
                )}
              </div>

              {visit.is_nominated ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-badge bg-champagne-soft/60 text-wine-deep text-label-sm font-medium border border-gold/30">
                  <Sparkles size={10} />
                  指名
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-badge bg-pearl-soft text-ink-soft text-label-sm">
                  <User size={10} />
                  フリー
                </span>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const wd = weekdays[d.getDay()];
  return `${month}/${day}（${wd}）`;
}
