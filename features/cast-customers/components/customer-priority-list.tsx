"use client";

import { ChevronDown, Crown, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Customer, Visit } from "@/types/nightos";
import { cn, formatCustomerName } from "@/lib/utils";
import {
  enrichCustomers,
  sortCustomers,
  STATUS_CONFIG,
  type CustomerStatus,
  type EnrichedCustomer,
  type SortKey,
} from "../lib/enrich";
import {
  cyclePriority,
  loadPriorities,
  PRIORITY_LABELS,
  setPriority,
  type Priority,
} from "../lib/priority-store";

/** セグメント表示（大事な順）のときの並び順 */
const SEGMENT_ORDER: CustomerStatus[] = [
  "vip_alert",
  "at_risk",
  "new",
  "active",
  "dormant",
];
/** 1 セグメントで最初に見せる件数（以降は「もっと見る」） */
const TOP_N = 8;

interface Props {
  castId: string;
  customers: Customer[];
  visits: Visit[];
  sortKey: SortKey;
}

/**
 * お客様リストの「優先」表示。
 * - 自動: enrich の状態（要フォロー/新規/常連/休眠）＆スコアで並べる
 * - 手動: ★ で優先度（最優先〜通常）をつけ、ピン留め帯に常に最上段表示
 * - スケール対策: セグメント折りたたみ + 上位 N 件 + もっと見る
 */
export function CustomerPriorityList({
  castId,
  customers,
  visits,
  sortKey,
}: Props) {
  const [priorities, setPriorities] = useState<Record<string, Priority>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPriorities(loadPriorities(castId));
    setMounted(true);
  }, [castId]);

  const visitsByCustomer = useMemo(() => {
    const m: Record<string, Visit[]> = {};
    for (const v of visits) {
      (m[v.customer_id] ??= []).push(v);
    }
    return m;
  }, [visits]);

  const enriched = useMemo(() => {
    const contexts = customers.map((c) => ({
      customer: c,
      memo: null,
      bottles: [],
      visits: visitsByCustomer[c.id] ?? [],
    }));
    return enrichCustomers(customers, contexts, priorities, {}, new Date());
  }, [customers, visitsByCustomer, priorities]);

  const handleCyclePriority = (id: string) => {
    const cur = priorities[id] ?? 0;
    const next = cyclePriority(cur);
    setPriority(castId, id, next);
    setPriorities((prev) => {
      const n = { ...prev };
      if (next === 0) delete n[id];
      else n[id] = next;
      return n;
    });
  };

  if (!mounted) return null;

  const pinned = sortCustomers(
    enriched.filter((e) => e.priority > 0),
    "priority",
  );
  const rest = enriched.filter((e) => e.priority === 0);

  return (
    <div className="space-y-2">
      {pinned.length > 0 && (
        <Segment
          icon={<Star size={12} className="fill-current text-gold-deep" />}
          label="ピン留め"
          items={pinned}
          onCyclePriority={handleCyclePriority}
          limitable={false}
        />
      )}

      {sortKey === "priority" ? (
        SEGMENT_ORDER.map((status) => {
          const items = sortCustomers(
            rest.filter((e) => e.status === status),
            "priority",
          );
          const cfg = STATUS_CONFIG[status];
          return (
            <Segment
              key={status}
              icon={<span className="text-[12px] leading-none">{cfg.emoji}</span>}
              label={cfg.label}
              items={items}
              onCyclePriority={handleCyclePriority}
              defaultOpen={status === "vip_alert" || status === "at_risk" || status === "new"}
            />
          );
        })
      ) : (
        <Segment
          icon={null}
          label="お客様"
          items={sortCustomers(rest, sortKey)}
          onCyclePriority={handleCyclePriority}
          hideHeader
        />
      )}
    </div>
  );
}

function Segment({
  icon,
  label,
  items,
  onCyclePriority,
  defaultOpen = true,
  limitable = true,
  hideHeader = false,
}: {
  icon: React.ReactNode;
  label: string;
  items: EnrichedCustomer[];
  onCyclePriority: (id: string) => void;
  defaultOpen?: boolean;
  limitable?: boolean;
  hideHeader?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [showAll, setShowAll] = useState(false);

  if (items.length === 0) return null;

  const shown = limitable && !showAll ? items.slice(0, TOP_N) : items;
  const remaining = items.length - shown.length;

  return (
    <section>
      {!hideHeader && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center gap-1.5 px-1 py-1.5 text-left"
        >
          {icon}
          <span className="text-[12px] font-semibold text-ink">{label}</span>
          <span className="text-[10px] text-ink-mute">{items.length}人</span>
          <ChevronDown
            size={14}
            className={cn(
              "ml-auto text-ink-mute transition-transform",
              open ? "" : "-rotate-90",
            )}
          />
        </button>
      )}

      {(open || hideHeader) && (
        <div className="space-y-0.5">
          {shown.map((e) => (
            <PriorityRow
              key={e.customer.id}
              e={e}
              onCycle={() => onCyclePriority(e.customer.id)}
            />
          ))}
          {limitable && remaining > 0 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="w-full text-center py-2 text-[11px] text-gold-deep font-medium hover:bg-pearl-soft rounded-btn"
            >
              もっと見る（あと{remaining}人）
            </button>
          )}
        </div>
      )}
    </section>
  );
}

function PriorityRow({
  e,
  onCycle,
}: {
  e: EnrichedCustomer;
  onCycle: () => void;
}) {
  const c = e.customer;
  const isVip = c.category === "vip";
  const lastLabel = e.lastVisitDate
    ? e.daysSinceLastVisit === 0
      ? "今日来店"
      : `${e.daysSinceLastVisit}日前`
    : "来店記録なし";
  const cfg = STATUS_CONFIG[e.status];

  return (
    <div className="flex items-start gap-1.5 px-1.5 py-2 rounded-btn hover:bg-pearl-soft">
      <button
        type="button"
        onClick={onCycle}
        aria-label="優先度を変更"
        className="shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center hover:bg-pearl-warm active:scale-90 transition"
      >
        <Star
          size={15}
          className={cn(
            e.priority > 0
              ? "fill-current text-gold-deep"
              : "text-ink-mute",
          )}
        />
      </button>

      <Link
        href={`/cast/customers/${c.id}`}
        className="flex-1 min-w-0 block"
      >
        <div className="flex items-center gap-1.5">
          {isVip && <Crown size={12} className="text-gold-deep shrink-0" />}
          <span className="text-[13px] text-ink truncate font-medium">
            {formatCustomerName(c.name)}
          </span>
          {e.priority > 0 && (
            <span className="shrink-0 text-[9px] text-wine-deep border border-wine/30 rounded-badge px-1 py-0.5">
              {PRIORITY_LABELS[e.priority]}
            </span>
          )}
        </div>
        <div className="text-[10px] text-ink-mute truncate mt-0.5">
          {c.job ? `${c.job} · ` : ""}
          {lastLabel}
          {e.status !== "active" && ` · ${cfg.emoji}${cfg.label}`}
        </div>
      </Link>
    </div>
  );
}
