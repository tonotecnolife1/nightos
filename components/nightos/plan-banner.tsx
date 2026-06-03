import { Sparkles } from "lucide-react";
import { FREE_PLAN_LABEL, FREE_PERIOD_END, formatJpDate } from "@/lib/nightos/billing";

/**
 * プラン告知バナー。運営側ユーザー (cast / store / mama) のレイアウト上部に常設し、
 * 課金モデルを透明に伝える 1 行バー。
 */
export function PlanBanner() {
  return (
    <div className="px-4 pt-2 flex items-center justify-center gap-2">
      <Sparkles size={11} className="text-gold-deep shrink-0" />
      <span className="text-label-sm text-ink-mute">
        {FREE_PLAN_LABEL} · {formatJpDate(FREE_PERIOD_END)}まで
      </span>
    </div>
  );
}
