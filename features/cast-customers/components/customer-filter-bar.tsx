"use client";

import { ChevronDown, ChevronUp, Filter, RotateCcw, Search, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  activeFilterCount,
  DEFAULT_CUSTOMER_FILTERS,
  type CategoryFilter,
  type CustomerFilters,
  type FunnelFilter,
  type ReferrerFilter,
} from "@/lib/nightos/customer-filters";
import type { Cast } from "@/types/nightos";

interface Props {
  filters: CustomerFilters;
  onChange: (next: CustomerFilters) => void;
  /** 係候補（ママ/姉さん） */
  managerOptions: Cast[];
  /** ヘルプ候補（全キャスト） */
  castOptions: Cast[];
  /** 全件数 */
  totalCount: number;
  /** フィルター適用後の件数 */
  filteredCount: number;
}

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "全タイプ" },
  { value: "vip", label: "VIP" },
  { value: "regular", label: "常連" },
  { value: "new", label: "新規" },
];

const FUNNEL_OPTIONS: { value: FunnelFilter; label: string }[] = [
  { value: "all", label: "全段階" },
  { value: "store_only", label: "店舗のみ" },
  { value: "assigned", label: "担当付き" },
  { value: "line_exchanged", label: "LINE済み" },
];

const REFERRER_OPTIONS: { value: ReferrerFilter; label: string }[] = [
  { value: "all", label: "全て" },
  { value: "yes", label: "お連れ様あり" },
  { value: "no", label: "ルート顧客" },
];

export function CustomerFilterBar({
  filters,
  onChange,
  managerOptions,
  castOptions,
  totalCount,
  filteredCount,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const activeCount = activeFilterCount(filters);

  const update = <K extends keyof CustomerFilters>(
    key: K,
    value: CustomerFilters[K],
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const reset = () => onChange(DEFAULT_CUSTOMER_FILTERS);

  return (
    <div className="space-y-2">
      {/* Always-visible: search + filter toggle button */}
      <div className="flex gap-2 items-stretch">
        <div className="relative flex-1">
          <Search
            size={12}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"
          />
          <input
            value={filters.query}
            onChange={(e) => update("query", e.target.value)}
            placeholder="名前・職業・好きなお酒で検索"
            style={{ fontSize: "13px" }}
            className="w-full h-9 pl-8 pr-8 rounded-full bg-pearl-warm border border-pearl-soft text-ink outline-none focus:border-champagne-dark placeholder:text-ink-mute"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => update("query", "")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-mute hover:text-ink"
              aria-label="検索クリア"
            >
              <X size={12} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "flex items-center gap-1 h-9 px-3 rounded-full text-[11px] font-medium border transition-all active:scale-95",
            activeCount > 0
              ? "bg-wine-deep text-pearl-light border-gold/40"
              : "bg-pearl-warm text-ink-soft border-pearl-soft",
          )}
        >
          <Filter size={11} />
          フィルター
          {activeCount > 0 && (
            <span className="bg-pearl/30 text-pearl-light text-[9px] min-w-[16px] h-[16px] flex items-center justify-center rounded-full">
              {activeCount}
            </span>
          )}
          {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>
      </div>

      {/* Expanded filter panel */}
      {expanded && (
        <div className="rounded-card bg-pearl-warm border border-pearl-soft p-3 space-y-2.5">
          {/* Category */}
          <FilterRow label="カテゴリ">
            <div className="flex flex-wrap gap-1">
              {CATEGORY_OPTIONS.map((opt) => (
                <ChipButton
                  key={opt.value}
                  active={filters.category === opt.value}
                  onClick={() => update("category", opt.value)}
                  tone="roseGold"
                >
                  {opt.label}
                </ChipButton>
              ))}
            </div>
          </FilterRow>

          {/* Funnel stage */}
          <FilterRow label="ステージ">
            <div className="flex flex-wrap gap-1">
              {FUNNEL_OPTIONS.map((opt) => (
                <ChipButton
                  key={opt.value}
                  active={filters.funnelStage === opt.value}
                  onClick={() => update("funnelStage", opt.value)}
                  tone="amethyst"
                >
                  {opt.label}
                </ChipButton>
              ))}
            </div>
          </FilterRow>

          {/* Manager + Cast (selects) */}
          <div className="grid grid-cols-2 gap-2">
            <FilterRow label="係">
              <select
                value={filters.managerId}
                onChange={(e) => update("managerId", e.target.value)}
                style={{ fontSize: "12px" }}
                className="w-full h-8 px-2 rounded-btn bg-pearl border border-pearl-soft text-ink outline-none cursor-pointer"
              >
                <option value="">全員</option>
                {managerOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </FilterRow>
            <FilterRow label="ヘルプ">
              <select
                value={filters.castId}
                onChange={(e) => update("castId", e.target.value)}
                style={{ fontSize: "12px" }}
                className="w-full h-8 px-2 rounded-btn bg-pearl border border-pearl-soft text-ink outline-none cursor-pointer"
              >
                <option value="">全員</option>
                {castOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </FilterRow>
          </div>

          {/* Referrer */}
          <FilterRow label="お連れ様">
            <div className="flex flex-wrap gap-1">
              {REFERRER_OPTIONS.map((opt) => (
                <ChipButton
                  key={opt.value}
                  active={filters.hasReferrer === opt.value}
                  onClick={() => update("hasReferrer", opt.value)}
                  tone="amethyst"
                >
                  {opt.label}
                </ChipButton>
              ))}
            </div>
          </FilterRow>

          {/* Footer: reset + count */}
          <div className="flex items-center justify-between pt-1.5 border-t border-pearl-soft">
            <span className="text-[11px] text-ink-mute">
              {filteredCount}人 / 全{totalCount}人
            </span>
            <button
              type="button"
              onClick={reset}
              disabled={activeCount === 0}
              className={cn(
                "flex items-center gap-1 h-7 px-2.5 rounded-full text-[10px] font-medium transition-all active:scale-95 border",
                activeCount > 0
                  ? "bg-pearl text-ink-soft border-pearl-soft hover:border-ink-muted"
                  : "bg-pearl text-ink-mute border-pearl-soft opacity-50 cursor-not-allowed",
              )}
            >
              <RotateCcw size={10} />
              リセット
            </button>
          </div>
        </div>
      )}

      {/* When collapsed but filters active: compact summary */}
      {!expanded && activeCount > 0 && (
        <div className="flex items-center justify-between text-[11px] text-ink-mute px-1">
          <span>
            <span className="text-gold-deep font-medium">
              {filteredCount}人
            </span>
            <span> 表示 / 全{totalCount}人</span>
          </span>
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1 text-ink-mute hover:text-ink"
          >
            <RotateCcw size={10} />
            リセット
          </button>
        </div>
      )}
    </div>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] text-ink-mute font-medium uppercase tracking-wider">
        {label}
      </div>
      {children}
    </div>
  );
}

function ChipButton({
  active,
  onClick,
  tone,
  children,
}: {
  active: boolean;
  onClick: () => void;
  tone: "roseGold" | "amethyst";
  children: React.ReactNode;
}) {
  const activeClass =
    tone === "roseGold"
      ? "bg-wine-deep text-pearl-light border border-wine-deep"
      : "bg-wine-deep text-pearl-light border-gold/40";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-2.5 h-7 rounded-full text-[11px] font-medium transition-all active:scale-95 border",
        active
          ? activeClass
          : "bg-pearl text-ink-soft border-pearl-soft hover:border-ink-muted",
      )}
    >
      {children}
    </button>
  );
}
