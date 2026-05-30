import Link from "next/link";
import { AlertTriangle, CalendarPlus, Wine } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { cn, formatBottleRemainingPct } from "@/lib/utils";
import type { Bottle, CustomerContext } from "@/types/nightos";
import { BottleSuggestion } from "./bottle-suggestion";
import { CustomerStats } from "./customer-stats";
import { VisitHistory } from "./visit-history";

const LOW_THRESHOLD = 25;

interface Props {
  context: CustomerContext;
}

/**
 * 来店情報セクション：
 *  - 来店サマリ (回数 / 売上推定)
 *  - 来店履歴 (直近 5 件)
 *  - キープボトル一覧
 *  - 「来店を記録」「ボトルを記録」のクイック導線
 */
export function VisitInfoSection({ context }: Props) {
  const { customer, bottles, visits } = context;
  const hasLowBottle = bottles.some(
    (b) => b.remaining_glasses <= LOW_THRESHOLD,
  );

  return (
    <section className="space-y-3">
      <header className="px-1">
        <h2 className="font-display text-[20px] leading-tight font-medium text-ink">
          来店情報
        </h2>
      </header>

      <CustomerStats context={context} />

      {visits.length > 0 && <VisitHistory visits={visits} />}

      {bottles.length > 0 && (
        <Card className="p-4 space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Wine size={14} className="text-gold-deep" />
            <h3 className="text-label-md font-semibold text-ink">
              キープボトル
            </h3>
          </div>
          <ul className="space-y-1">
            {bottles.map((b) => (
              <BottleRow key={b.id} bottle={b} />
            ))}
          </ul>
          {hasLowBottle && <BottleSuggestion customerId={customer.id} />}
        </Card>
      )}

      {/* クイック登録（来店・ボトル） */}
      <div className="flex gap-2">
        <Link
          href={`/store/visits/new?customerId=${customer.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-pill border border-ink/[0.12] bg-pearl-soft text-body-sm text-ink-secondary hover:border-gold/40 hover:bg-pearl-warm transition"
        >
          <CalendarPlus size={14} />
          来店を記録
        </Link>
        <Link
          href={`/store/bottles/new?customerId=${customer.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-pill border border-ink/[0.12] bg-pearl-soft text-body-sm text-ink-secondary hover:border-gold/40 hover:bg-pearl-warm transition"
        >
          <Wine size={14} />
          ボトルを記録
        </Link>
      </div>
    </section>
  );
}

function BottleRow({ bottle }: { bottle: Bottle }) {
  const isLow = bottle.remaining_glasses <= LOW_THRESHOLD;
  return (
    <li className="flex items-center gap-2 text-body-md text-ink">
      <span>
        {bottle.brand}（残{" "}
        {formatBottleRemainingPct(
          bottle.remaining_glasses,
          bottle.total_glasses,
        )}
        ）
      </span>
      {isLow && (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-badge text-[10px] font-medium",
            "bg-amber/20 text-amber border border-amber/40",
          )}
        >
          <AlertTriangle size={9} />
          残りわずか
        </span>
      )}
    </li>
  );
}
