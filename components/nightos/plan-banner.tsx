import { Sparkles } from "lucide-react";
import { PLAN_TAGLINE } from "@/lib/nightos/billing";

/**
 * プラン告知バナー。運営側ユーザー (cast / store / mama) のレイアウト上部に常設し、
 * 課金モデルを透明に伝える。
 *
 * フリーミアム — 「基本機能はずっと無料、必要に応じてだけ課金」を穏やかに伝える
 * 1 行バーにとどめる。期間限定無料→有料の強調 (旧モデル) は廃止した。
 */
export function PlanBanner() {
  return (
    <div className="px-4 pt-2 flex items-center justify-center gap-2">
      <Sparkles size={11} className="text-gold-deep shrink-0" />
      <span className="text-label-sm text-ink-mute">{PLAN_TAGLINE}</span>
    </div>
  );
}
