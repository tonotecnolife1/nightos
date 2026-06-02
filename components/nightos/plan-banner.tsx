"use client";

import { useEffect, useState } from "react";
import { Clock, Sparkles } from "lucide-react";
import {
  formatJpDate,
  formatMonthlyPrice,
  getPlanStatus,
  type PlanStatus,
} from "@/lib/nightos/billing";

/**
 * プラン告知バナー。運営側ユーザー (cast / store / mama) のレイアウト上部に常設し、
 * 「今は無制限プラン (無料) だが、4ヶ月目から有料になる」ことを透明に伝える。
 *
 * 透明性 = 解約・苦情・チャージバックの予防になる。フェーズに応じて表示を変える:
 *   - free        : 薄い 1 行バー (邪魔しない)
 *   - ending_soon : 残り日数を強調したカード
 *   - paid        : 非表示 (将来の課金設定ページが現プランを表示する)
 *
 * 日付判定は SSR と一致するが、ハイドレーション安定のため初回マウント後に確定させる。
 */
export function PlanBanner() {
  const [status, setStatus] = useState<PlanStatus | null>(null);

  useEffect(() => {
    setStatus(getPlanStatus());
  }, []);

  if (!status || status.phase === "paid") return null;

  if (status.phase === "ending_soon") {
    return (
      <div className="px-4 pt-3">
        <div className="rounded-card border border-warning/40 bg-warning/5 px-4 py-3">
          <div className="flex items-start gap-3">
            <Clock size={18} className="text-warning shrink-0 mt-0.5" />
            <div>
              <div className="text-body-md font-semibold text-ink">
                無料期間はあと{status.daysRemaining}日
              </div>
              <p className="text-body-sm text-ink-soft mt-1">
                {formatJpDate(status.paidStart)}から
                {formatMonthlyPrice(status.monthlyPriceYen)}の有料プランに移行します。
                お支払い方法を登録すると、利用が途切れず自動で継続できます。
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // free — 薄い 1 行バー
  return (
    <div className="px-4 pt-2 flex items-center justify-center gap-2">
      <Sparkles size={11} className="text-gold-deep shrink-0" />
      <span className="text-label-sm text-ink-mute">
        無制限プラン（無料）· {formatJpDate(status.freePeriodEnd)}まで
        <span className="text-ink-soft/70">
          {" "}
          / {formatJpDate(status.paidStart)}から有料
        </span>
      </span>
    </div>
  );
}
