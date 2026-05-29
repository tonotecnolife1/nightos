import { Calendar } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { cn } from "@/lib/utils";
import type { Cast, Customer, Douhan } from "@/types/nightos";

interface Props {
  teamCasts: Cast[];
  douhans: Douhan[];
  customers: Customer[];
  today: Date;
  daysAhead?: number;
}

const pad = (n: number) => String(n).padStart(2, "0");
const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function labelForDate(
  dateStr: string,
  todayStr: string,
): { text: string; tone: "today" | "tomorrow" | "later" } {
  if (dateStr === todayStr) return { text: "今日", tone: "today" };
  const d = new Date(dateStr);
  const today = new Date(todayStr);
  const diff = Math.round(
    (d.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (diff === 1) return { text: "明日", tone: "tomorrow" };
  return { text: `${d.getMonth() + 1}/${d.getDate()}`, tone: "later" };
}

export function UpcomingDouhanList({
  teamCasts,
  douhans,
  customers,
  today,
  daysAhead = 7,
}: Props) {
  const castIds = new Set(teamCasts.map((c) => c.id));
  const castsById = new Map(teamCasts.map((c) => [c.id, c]));
  const customersById = new Map(customers.map((c) => [c.id, c]));

  const todayStr = toDateStr(today);
  const end = new Date(today);
  end.setDate(end.getDate() + daysAhead - 1);
  const endStr = toDateStr(end);

  const upcoming = douhans
    .filter(
      (d) =>
        d.status === "scheduled" &&
        castIds.has(d.cast_id) &&
        d.date >= todayStr &&
        d.date <= endStr,
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-roseGold-dark" />
          <span className="text-body-sm font-semibold text-ink">
            今週の同伴予定
          </span>
        </div>
        <span className="text-[10px] text-ink-mute">
          {upcoming.length}件 / 次{daysAhead}日
        </span>
      </div>

      {upcoming.length === 0 ? (
        <p className="text-[11px] text-ink-mute py-2 text-center">
          予定なし
        </p>
      ) : (
        <ul className="space-y-1.5 pt-1.5 border-t border-pearl-soft">
          {upcoming.slice(0, 6).map((d) => {
            const cast = castsById.get(d.cast_id);
            const cust = customersById.get(d.customer_id);
            const label = labelForDate(d.date, todayStr);
            return (
              <li key={d.id} className="flex items-center gap-2 pt-0.5">
                <span
                  className={cn(
                    "w-10 text-center text-[10px] font-semibold py-0.5 rounded-badge shrink-0",
                    label.tone === "today" && "bg-wine/15 text-wine-deep",
                    label.tone === "tomorrow" && "bg-warning/15 text-warning",
                    label.tone === "later" && "bg-pearl-soft text-ink-mute",
                  )}
                >
                  {label.text}
                </span>
                <span className="text-body-sm text-ink truncate">
                  {cast?.name ?? "?"}さん × {cust?.name ?? "?"}さん
                </span>
              </li>
            );
          })}
          {upcoming.length > 6 && (
            <li className="text-[10px] text-ink-mute text-center pt-1">
              他 {upcoming.length - 6}件
            </li>
          )}
        </ul>
      )}
    </Card>
  );
}
