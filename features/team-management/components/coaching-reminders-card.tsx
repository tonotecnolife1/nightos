import Link from "next/link";
import { ChevronRight, MessageCircle, Target } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { mockChatRooms } from "@/features/team-chat/lib/mock-chat-data";
import { mockCastGoals } from "@/lib/nightos/mock-data";
import { cn } from "@/lib/utils";
import type { Cast } from "@/types/nightos";

interface Props {
  leaderId: string;
  teamCasts: Cast[];
  today: Date;
  /** 1on1 未実施しきい値（日） */
  staleThresholdDays?: number;
  /** 表示する最大件数 */
  maxItems?: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

interface Reminder {
  cast: Cast;
  daysSinceCoaching: number | null; // null = 未実施
  goalNoteMissing: boolean;
  roomId: string | null;
}

/**
 * 育成アクションのリマインダ。
 * 条件：直近の 1on1 が 7 日以上空いている or 目標ノート未入力。
 * 出し惜しみせず要注意のキャストを最大 maxItems 件まで列挙する。
 */
export function CoachingRemindersCard({
  leaderId,
  teamCasts,
  today,
  staleThresholdDays = 7,
  maxItems = 3,
}: Props) {
  const reminders: Reminder[] = teamCasts
    .filter((c) => c.id !== leaderId)
    .map((cast) => {
      // Coaching room with leader (direct 1on1)
      const room = mockChatRooms.find(
        (r) =>
          r.type === "coaching" &&
          r.member_ids.includes(leaderId) &&
          r.member_ids.includes(cast.id),
      );
      const lastAt = room?.last_message?.sent_at;
      const daysSinceCoaching = lastAt
        ? Math.floor(
            (today.getTime() - new Date(lastAt).getTime()) / DAY_MS,
          )
        : null;

      const goal = mockCastGoals.find((g) => g.castId === cast.id);
      const goalNoteMissing = !goal || !goal.note;

      return {
        cast,
        daysSinceCoaching,
        goalNoteMissing,
        roomId: room?.id ?? null,
      };
    })
    .filter(
      (r) =>
        r.daysSinceCoaching === null ||
        r.daysSinceCoaching >= staleThresholdDays ||
        r.goalNoteMissing,
    )
    .sort((a, b) => {
      const aDays = a.daysSinceCoaching ?? Infinity;
      const bDays = b.daysSinceCoaching ?? Infinity;
      return bDays - aDays;
    })
    .slice(0, maxItems);

  if (reminders.length === 0) {
    return (
      <Card className="p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Target size={14} className="text-gold-deep" />
          <span className="text-body-sm font-semibold text-ink">
            育成リマインダ
          </span>
        </div>
        <p className="text-[11px] text-ink-mute pt-1">
          1on1・目標ともに追いついています
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Target size={14} className="text-gold-deep" />
          <span className="text-body-sm font-semibold text-ink">
            育成リマインダ
          </span>
        </div>
        <span className="text-[10px] text-ink-mute">
          要対応 {reminders.length}件
        </span>
      </div>

      <ul className="space-y-1.5 pt-1.5 border-t border-pearl-soft">
        {reminders.map((r) => {
          const reasons: { icon: JSX.Element; text: string; tone: string }[] =
            [];
          if (r.daysSinceCoaching === null) {
            reasons.push({
              icon: <MessageCircle size={10} />,
              text: "1on1未実施",
              tone: "bg-wine/15 text-wine-deep",
            });
          } else if (r.daysSinceCoaching >= staleThresholdDays) {
            reasons.push({
              icon: <MessageCircle size={10} />,
              text: `1on1 ${r.daysSinceCoaching}日空き`,
              tone: "bg-warning/15 text-warning",
            });
          }
          if (r.goalNoteMissing) {
            reasons.push({
              icon: <Target size={10} />,
              text: "目標ノート未",
              tone: "bg-champagne-soft/60 text-gold-deep",
            });
          }
          return (
            <li key={r.cast.id} className="flex items-center gap-2 pt-0.5">
              <div className="flex-1 min-w-0">
                <div className="text-body-sm text-ink truncate">
                  {r.cast.name}さん
                </div>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {reasons.map((reason, i) => (
                    <span
                      key={i}
                      className={cn(
                        "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-badge text-[9px] font-semibold",
                        reason.tone,
                      )}
                    >
                      {reason.icon}
                      {reason.text}
                    </span>
                  ))}
                </div>
              </div>
              <Link
                href={`/mama/team/${r.cast.id}`}
                className="flex items-center gap-0.5 text-[10px] text-gold-deep font-medium shrink-0"
              >
                開く
                <ChevronRight size={12} />
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
