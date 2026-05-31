"use client";

import Link from "next/link";
import {
  Cake,
  Check,
  Clock,
  Sparkles,
  TrendingUp,
  Wine,
} from "lucide-react";
import { useState } from "react";
import { cn, formatBottleRemainingPct, formatCustomerName } from "@/lib/utils";
import type { FollowReason, FollowTarget } from "@/types/nightos";

const BOTTLE_LOW_THRESHOLD = 5;

const reasonConfig: Record<
  FollowReason,
  { icon: typeof Clock; color: string; bg: string; border: string }
> = {
  interval: {
    icon: Clock,
    color: "text-ink-soft",
    bg: "bg-pearl-soft",
    border: "border-line-strong",
  },
  birthday: {
    icon: Cake,
    color: "text-wine-deep",
    bg: "bg-[#f5dcd8]",
    border: "border-wine/25",
  },
  nomination_chance: {
    icon: TrendingUp,
    color: "text-gold-deep",
    bg: "bg-[rgba(184,148,85,0.16)]",
    border: "border-gold/30",
  },
};

const categoryLabel: Record<string, { text: string; cls: string }> = {
  vip: {
    text: "VIP",
    cls: "border border-gold/55 bg-transparent text-gold-deep",
  },
  new: {
    text: "新規",
    cls: "bg-champagne-soft/60 text-wine-deep border border-gold/30",
  },
  regular: {
    text: "常連",
    cls: "bg-champagne-soft/60 text-ink-soft border border-line-strong",
  },
};

/**
 * 連絡優先度リボン（カード左端）。rank が小さい＝優先度が高いほど、
 * 帯を太く・金色を濃く（メタリック）して、一覧をスクロールせずとも
 * 「どの順で連絡すべきか」が一目で分かるようにする。
 */
function priorityRibbon(rank: number): { width: string; background: string } {
  if (rank <= 2)
    return { width: "6px", background: "var(--v5-champ-gold)" }; // 最優先: 強いメタリックゴールド
  if (rank <= 5)
    return { width: "4px", background: "var(--gold)" }; // 中優先: 単色ゴールド
  return { width: "3px", background: "rgba(140,111,68,0.3)" }; // それ以下: 淡いブラス
}

interface Props {
  target: FollowTarget;
  contacted: boolean;
  onToggleContacted: (customerId: string) => void;
  rank?: number;
}

export function FollowTargetCard({
  target,
  contacted,
  onToggleContacted,
  rank = 1,
}: Props) {
  const { icon: ReasonIcon, color, bg, border } = reasonConfig[target.reason];
  const { customer, bottle, lastTopic } = target;
  const [confirming, setConfirming] = useState(false);
  const cat = categoryLabel[customer.category] ?? categoryLabel.regular;
  const isTop = rank <= 2;
  const ribbon = priorityRibbon(rank);

  const initial = formatCustomerName(customer.name).charAt(0) || "客";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-card border border-ink/[0.08] backdrop-blur-md transition-all",
        isTop ? "shadow-warm bg-pearl-light/75" : "shadow-soft bg-pearl-light/65",
        contacted && "opacity-50",
      )}
    >
      {/* V5: 優先度リボン (左端 champagne-gold metallic)。rank で太さ・濃さを段階表示 */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0"
        style={{ width: ribbon.width, background: ribbon.background }}
      />

      {/* ── Contacted banner ── */}
      {contacted && (
        <div className="bg-success/10 px-3 py-1.5 flex items-center justify-between border-b border-success/20 pl-4">
          <span className="text-[11px] text-success font-medium flex items-center gap-1">
            <Check size={11} />
            連絡済み
          </span>
          <button
            type="button"
            onClick={() => onToggleContacted(customer.id)}
            className="text-[11px] text-ink-mute underline underline-offset-2"
          >
            戻す
          </button>
        </div>
      )}

      {/* ── Main content ── */}
      <Link
        href={`/cast/customers/${customer.id}`}
        className="block pl-5 pr-3.5 pt-3 pb-2.5"
      >
        <div className="flex items-start gap-3">
          {/* V5: champagne-gold metallic frame + pearl center */}
          <div
            className="w-10 h-10 rounded-full flex-shrink-0 p-[1.5px]"
            style={{ background: "var(--v5-champ-gold)" }}
          >
            <div
              className="w-full h-full rounded-full flex items-center justify-center font-serif text-[16px] leading-none font-medium tracking-[0.04em] text-ink"
              style={{ background: "var(--pearl-light)" }}
            >
              {initial}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            {/* Name + category */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1.5 min-w-0">
                <h3 className="font-serif text-[15.5px] leading-[1.2] font-medium tracking-[0.01em] text-ink truncate">
                  {formatCustomerName(customer.name)}
                </h3>
                {customer.job && (
                  <span className="text-[10px] text-ink-mute shrink-0">
                    {customer.job}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "shrink-0 ml-2 px-1.5 py-0.5 rounded-badge text-[9px] font-medium",
                  cat.cls,
                )}
              >
                {cat.text}
              </span>
            </div>

            {/* Reason badge + detail */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-badge text-[10px] font-medium border",
                  bg,
                  color,
                  border,
                )}
              >
                <ReasonIcon size={10} />
                {target.reasonLabel}
              </span>
              <span className="text-[10px] text-ink-mute truncate">
                {target.reasonDetail}
              </span>
            </div>

            {/* Details */}
            <div className="space-y-0.5 text-[10px] text-ink-soft">
              {bottle && (
                <div className="flex items-center gap-1">
                  <Wine size={10} className="text-gold shrink-0" />
                  <span>
                    {bottle.brand}（残{" "}
                    {formatBottleRemainingPct(
                      bottle.remaining_glasses,
                      bottle.total_glasses,
                    )}
                    ）
                  </span>
                  {bottle.remaining_glasses <= BOTTLE_LOW_THRESHOLD && (
                    <span className="text-warning">⚠️</span>
                  )}
                </div>
              )}
              {lastTopic && (
                <div className="truncate">前回: {lastTopic}</div>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* ── Action bar ── */}
      <div className="pl-5 pr-3.5 pb-3 pt-2 border-t border-ink/[0.06]">
        {confirming ? (
          <div className="flex items-center gap-2 rounded-btn border border-wine-deep/20 bg-wine-deep/[0.05] px-3 py-2">
            <span className="flex-1 text-[12px] text-ink leading-snug">
              {formatCustomerName(customer.name)}に連絡しましたか？
            </span>
            <button
              type="button"
              onClick={() => {
                onToggleContacted(customer.id);
                setConfirming(false);
              }}
              className="inline-flex items-center gap-1 h-8 px-3.5 rounded-pill bg-wine-deep text-pearl-light text-[12px] font-semibold active:scale-[0.98] transition-transform"
            >
              <Check size={12} />
              はい
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="h-8 px-3 rounded-pill border border-ink/15 bg-transparent text-ink-soft text-[12px] font-medium active:scale-[0.98] transition-transform"
            >
              やめる
            </button>
          </div>
        ) : (
          <div className="flex items-stretch gap-1.5">
            {!contacted ? (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-pill bg-wine-deep text-pearl-light text-[12px] font-semibold tracking-[0.06em] shadow-soft active:scale-[0.98] transition-transform"
              >
                <Check size={13} />
                連絡した
              </button>
            ) : (
              <div className="flex-1" />
            )}
            <Link
              href={`/cast/ruri-mama?customerId=${customer.id}`}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-pill text-[12px] font-medium tracking-[0.04em] border border-wine-deep bg-transparent text-wine-deep active:scale-[0.98] transition-transform"
              onClick={(e) => e.stopPropagation()}
            >
              <Sparkles size={12} />
              文面を作る
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
