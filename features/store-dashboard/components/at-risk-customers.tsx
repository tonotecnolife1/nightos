import { AlertTriangle, Clock } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { Badge } from "@/components/nightos/badge";
import type { FollowTarget } from "@/types/nightos";

interface Props {
  targets: FollowTarget[];
}

/**
 * Shows the store a summary of customers at risk of churn (i.e. the
 * same list that appears on the cast home, but presented from the
 * store's perspective with a management-level framing).
 */
export function AtRiskCustomers({ targets }: Props) {
  if (targets.length === 0) {
    return (
      <Card className="p-4 text-center text-body-sm text-ink-soft">
        現在連絡が必要な顧客はいません ✅
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2 text-ink">
        <AlertTriangle size={14} className="text-warning" />
        <span className="text-label-md font-semibold">
          連絡が必要な顧客 — {targets.length}人
        </span>
      </div>
      <div className="space-y-2">
        {targets.slice(0, 5).map((t) => (
          <div
            key={t.customer.id}
            className="flex items-center gap-3 rounded-btn bg-pearl-soft px-3 py-2"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-body-sm font-semibold text-ink truncate">
                  {t.customer.name}
                </span>
                <Badge
                  tone={
                    t.reason === "birthday"
                      ? "birthday"
                      : t.reason === "interval"
                        ? "interval"
                        : "nomination"
                  }
                >
                  {t.reasonLabel}
                </Badge>
              </div>
              <div className="text-label-sm text-ink-mute">
                {t.reasonDetail}
              </div>
            </div>
            <div className="flex items-center gap-1 text-label-sm text-ink-mute shrink-0">
              <Clock size={11} />
              {t.daysSinceLastVisit}日前
            </div>
          </div>
        ))}
      </div>
      {targets.length > 5 && (
        <div className="text-label-sm text-ink-mute text-center">
          他 {targets.length - 5}人
        </div>
      )}
    </Card>
  );
}
