import { AlertTriangle } from "lucide-react";
import { StoreInfoCard } from "@/components/nightos/card";
import { cn, formatBottleRemainingPct } from "@/lib/utils";
import type { Bottle, CustomerContext } from "@/types/nightos";
import { BottleSuggestion } from "./bottle-suggestion";

const LOW_THRESHOLD = 25;

export function StoreInfoSection({ context }: { context: CustomerContext }) {
  const { customer, bottles } = context;
  const hasAny =
    customer.favorite_drink || bottles.length > 0 || customer.store_memo;

  if (!hasAny) return null;

  const hasLowBottle = bottles.some((b) => b.remaining_glasses <= LOW_THRESHOLD);

  return (
    <StoreInfoCard title="店舗からの共有情報">
      {/* 気をつけること — 最上部に目立つ警告カードとして表示 */}
      {customer.store_memo && (
        <div className="flex gap-2.5 rounded-2xl bg-amber/10 border border-amber/40 px-3 py-2.5 mb-3">
          <AlertTriangle size={15} className="text-amber shrink-0 mt-0.5" />
          <div>
            <p className="text-label-sm font-semibold text-amber mb-1">気をつけること</p>
            <p className="text-body-sm text-ink leading-relaxed whitespace-pre-wrap">
              {customer.store_memo}
            </p>
          </div>
        </div>
      )}

      {(customer.favorite_drink || bottles.length > 0) && (
        <dl className="space-y-2.5">
          {customer.favorite_drink && (
            <div>
              <dt className="text-label-sm text-ink-soft mb-0.5">
                好きなお酒
              </dt>
              <dd className="text-body-md text-ink">{customer.favorite_drink}</dd>
            </div>
          )}
          {bottles.length > 0 && (
            <div>
              <dt className="text-label-sm text-ink-soft mb-0.5">
                キープボトル
              </dt>
              <dd className="space-y-1">
                {bottles.map((b) => (
                  <BottleRow key={b.id} bottle={b} />
                ))}
              </dd>
              {hasLowBottle && <BottleSuggestion customerId={customer.id} />}
            </div>
          )}
        </dl>
      )}
    </StoreInfoCard>
  );
}

function BottleRow({ bottle }: { bottle: Bottle }) {
  const isLow = bottle.remaining_glasses <= LOW_THRESHOLD;
  return (
    <div className="flex items-center gap-2 text-body-md text-ink">
      <span>
        {bottle.brand}（残 {formatBottleRemainingPct(
          bottle.remaining_glasses,
          bottle.total_glasses,
        )}）
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
    </div>
  );
}
