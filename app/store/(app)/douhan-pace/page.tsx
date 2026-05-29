"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Calendar, Clock, Filter } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { PageHeader } from "@/components/nightos/page-header";
import { OwnerGuard } from "@/features/store-hub/components/owner-guard";
import {
  PACE_STATUS_CONFIG,
  calculateDouhanPaceForAll,
} from "@/lib/nightos/douhan-pace";
import {
  MOCK_TODAY,
  mockCasts,
  mockDouhans,
} from "@/lib/nightos/mock-data";
import { CURRENT_STORE_ID } from "@/lib/nightos/constants";
import { cn } from "@/lib/utils";

type RoleFilter = "all" | "mama" | "cast";

const FILTERS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "全員" },
  { value: "cast", label: "キャスト" },
  { value: "mama", label: "店長" },
];

export default function StoreDouhanPacePage() {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  const storeCasts = useMemo(
    () => mockCasts.filter((c) => c.store_id === CURRENT_STORE_ID),
    [],
  );

  const paceList = useMemo(
    () =>
      calculateDouhanPaceForAll({
        casts: storeCasts,
        douhans: mockDouhans,
        today: MOCK_TODAY,
      }),
    [storeCasts],
  );

  const filtered = useMemo(() => {
    if (roleFilter === "all") return paceList;
    return paceList.filter((p) => {
      const cast = storeCasts.find((c) => c.id === p.castId);
      if (roleFilter === "mama") return cast?.club_role === "mama";
      return cast?.club_role !== "mama";
    });
  }, [paceList, storeCasts, roleFilter]);

  const meetingRiskCount = paceList.filter(
    (p) => p.status === "meeting_risk",
  ).length;
  const behindCount = paceList.filter((p) => p.status === "behind").length;

  return (
    <OwnerGuard>
    <div className="animate-fade-in">
      <PageHeader title="同伴ペース" subtitle="週2回・月7回の達成状況" showBack />

      <div className="px-5 pt-4 pb-6 space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-2.5">
          <Card className="p-3 !border-rose/30 !bg-rose/5">
            <div className="text-[10px] text-rose flex items-center gap-1">
              <AlertTriangle size={10} />
              ミーティング注意
            </div>
            <div className="text-display-sm font-display text-rose mt-0.5">
              {meetingRiskCount}人
            </div>
          </Card>
          <Card className="p-3 !border-amber/30 !bg-amber/5">
            <div className="text-[10px] text-amber flex items-center gap-1">
              <Clock size={10} />
              ペース遅れ
            </div>
            <div className="text-display-sm font-display text-amber mt-0.5">
              {behindCount}人
            </div>
          </Card>
        </div>

        {/* Role filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto scroll-x">
          <Filter size={12} className="text-ink-mute shrink-0" />
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setRoleFilter(f.value)}
              className={cn(
                "px-3 h-7 rounded-full text-[11px] font-medium shrink-0 transition-colors",
                roleFilter === f.value
                  ? "bg-champagne text-ink"
                  : "bg-pearl-soft text-ink-soft",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Cast list */}
        <section className="space-y-2">
          {filtered.length === 0 ? (
            <Card className="p-4 text-center text-body-sm text-ink-mute">
              該当するキャストがいません
            </Card>
          ) : (
            filtered.map((pace) => {
              const cast = storeCasts.find((c) => c.id === pace.castId);
              const cfg = PACE_STATUS_CONFIG[pace.status];
              const weekPct =
                pace.weekTarget === 0
                  ? 0
                  : Math.min(100, (pace.thisWeekCount / pace.weekTarget) * 100);
              const monthPct =
                pace.monthTarget === 0
                  ? 0
                  : Math.min(100, (pace.thisMonthCount / pace.monthTarget) * 100);
              return (
                <Card
                  key={pace.castId}
                  className={cn(
                    "p-3 space-y-2",
                    pace.status === "meeting_risk" &&
                      "!border-rose/30 !bg-rose/5",
                    pace.status === "behind" && "!border-amber/30 !bg-amber/5",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-body-md font-semibold text-ink">
                        {pace.castName}
                      </span>
                      {cast?.club_role && (
                        <span className="text-[10px] text-ink-mute">
                          {cast.club_role === "mama" ? "店長" : "キャスト"}
                        </span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-badge text-[10px] font-semibold border",
                        cfg.bg,
                        cfg.color,
                      )}
                    >
                      {cfg.emoji} {cfg.label}
                    </span>
                  </div>

                  {/* Week progress */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] mb-0.5">
                      <span className="text-ink-mute">今週</span>
                      <span className="text-ink">
                        {pace.thisWeekCount} / {pace.weekTarget} 回
                      </span>
                    </div>
                    <div className="h-1.5 bg-pearl-soft rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-rose-gold rounded-full transition-all"
                        style={{ width: `${weekPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Month progress */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] mb-0.5">
                      <span className="text-ink-mute flex items-center gap-1">
                        <Calendar size={9} />
                        今月
                      </span>
                      <span className="text-ink">
                        {pace.thisMonthCount} / {pace.monthTarget} 回 · 残り
                        {pace.daysLeftInMonth}日
                      </span>
                    </div>
                    <div className="h-1.5 bg-pearl-soft rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-amethyst rounded-full transition-all"
                        style={{ width: `${monthPct}%` }}
                      />
                    </div>
                    {pace.status === "meeting_risk" && (
                      <div className="text-[10px] text-rose mt-1">
                        見込み {pace.projectedMonthCount}回 (目標未達)
                        → ミーティング対象
                      </div>
                    )}
                    {pace.status === "behind" && (
                      <div className="text-[10px] text-amber mt-1">
                        見込み {pace.projectedMonthCount}回 — あと
                        {Math.max(0, pace.monthTarget - pace.thisMonthCount)}回
                        必要
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </section>
      </div>
    </div>
    </OwnerGuard>
  );
}
