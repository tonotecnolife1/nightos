"use client";

import { ChevronDown, Search, UserCircle2, X } from "lucide-react";
import { useState } from "react";
import { cn, customerMatchesQuery, formatCustomerName } from "@/lib/utils";
import type { Customer } from "@/types/nightos";

interface Props {
  customers: Customer[];
  helpCastNames?: Record<string, string>;
  selectedId?: string;
  onSelect: (id: string | undefined) => void;
}

function categoryLabel(category: Customer["category"]): string {
  return category === "vip" ? "VIP" : category === "new" ? "新規" : "常連";
}

/**
 * 初手のママメッセージの下に出す、「お客様を選ぶ」インライン導線。
 * 目立つ形状で配置し、顧客選択を自然に促す。
 * 氏名(漢字)・読み仮名(ひらがな)・ニックネームで検索できる。
 */
export function CustomerSelectInline({
  customers,
  helpCastNames = {},
  selectedId,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(!selectedId);
  const [query, setQuery] = useState("");
  const selected = customers.find((c) => c.id === selectedId);

  const filtered = query.trim()
    ? customers.filter((c) => customerMatchesQuery(c, query))
    : customers;

  return (
    <div className="rounded-card border border-gold/30 bg-champagne-soft/30 p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-label-sm text-gold-deep font-medium">
        <UserCircle2 size={14} />
        誰のご相談ですか？
      </div>

      {/* Current selection / CTA */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center gap-2 px-3 h-10 rounded-btn border text-left transition-all active:scale-[0.99]",
          selected
            ? "bg-pearl-warm border-gold/30"
            : "bg-pearl-warm border-gold/30 animate-shimmer",
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="text-body-sm text-ink truncate">
            {selected ? (
              <>
                {formatCustomerName(selected.name)}
                {selected.nickname && (
                  <span className="text-ink-soft">（{selected.nickname}）</span>
                )}
              </>
            ) : (
              "お客様を選択してください"
            )}
          </div>
          {selected && (
            <div className="text-[10px] text-ink-mute truncate">
              {selected.job ?? "—"} · {categoryLabel(selected.category)}
            </div>
          )}
        </div>
        {selected && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(undefined);
              setOpen(true);
            }}
            aria-label="クリア"
            className="p-1 rounded-full hover:bg-pearl-soft"
          >
            <X size={12} className="text-ink-mute" />
          </button>
        )}
        <ChevronDown
          size={14}
          className={cn(
            "text-ink-mute transition-transform shrink-0",
            open && "rotate-180",
          )}
        />
      </button>

      {/* List (expanded by default when no selection) */}
      {open && (
        <div className="space-y-2">
          {/* Search box */}
          <div className="flex items-center gap-2 px-3 h-10 rounded-btn bg-pearl-warm border border-pearl-soft focus-within:border-gold/40 transition-colors">
            <Search size={14} className="text-ink-mute shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="名前・読み仮名・ニックネームで検索"
              className="flex-1 min-w-0 bg-transparent text-body-sm text-ink placeholder:text-ink-mute focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="検索をクリア"
                className="p-0.5 rounded-full hover:bg-pearl-soft"
              >
                <X size={12} className="text-ink-mute" />
              </button>
            )}
          </div>

          <div className="rounded-btn bg-pearl-warm border border-pearl-soft max-h-[44vh] overflow-y-auto divide-y divide-pearl-soft">
            {!query.trim() && (
              <button
                type="button"
                onClick={() => {
                  onSelect(undefined);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-pearl-soft text-body-sm text-ink-soft"
              >
                指定なしで相談する
              </button>
            )}
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-[11px] text-ink-mute">
                「{query}」に一致するお客様がいません
              </div>
            ) : (
              filtered.map((c) => {
                const helpName = c.cast_id ? helpCastNames[c.cast_id] : undefined;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onSelect(c.id);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 hover:bg-pearl-soft",
                      selectedId === c.id && "bg-champagne-soft/60",
                    )}
                  >
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-body-sm text-ink">
                        {formatCustomerName(c.name)}
                      </span>
                      {c.nickname && (
                        <span className="text-[11px] text-gold-deep">
                          （{c.nickname}）
                        </span>
                      )}
                      {helpName && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-champagne-soft text-ink-soft">
                          {helpName}担当
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-ink-mute">
                      {c.job ?? "—"} · {categoryLabel(c.category)}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
