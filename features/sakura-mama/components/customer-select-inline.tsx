"use client";

import { ChevronDown, UserCircle2, X } from "lucide-react";
import { useState } from "react";
import { cn, formatCustomerName } from "@/lib/utils";
import type { Customer } from "@/types/nightos";

interface Props {
  customers: Customer[];
  helpCastNames?: Record<string, string>;
  selectedId?: string;
  onSelect: (id: string | undefined) => void;
}

/**
 * 初手のママメッセージの下に出す、「お客様を選ぶ」インライン導線。
 * 目立つ形状で配置し、顧客選択を自然に促す。
 * 会話内に埋め込む設計なので、選択された後も会話の一部として記録的に残る。
 */
export function CustomerSelectInline({
  customers,
  helpCastNames = {},
  selectedId,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(!selectedId);
  const selected = customers.find((c) => c.id === selectedId);

  return (
    <div className="rounded-card border border-amethyst-border bg-amethyst-muted/30 p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-label-sm text-amethyst-dark font-medium">
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
            ? "bg-pearl-warm border-amethyst-border"
            : "bg-pearl-warm border-amethyst-border animate-shimmer",
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="text-body-sm text-ink truncate">
            {selected
              ? formatCustomerName(selected.name)
              : "お客様を選択してください"}
          </div>
          {selected && (
            <div className="text-[10px] text-ink-muted truncate">
              {selected.job ?? "—"} ·{" "}
              {selected.category === "vip"
                ? "VIP"
                : selected.category === "new"
                  ? "新規"
                  : "常連"}
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
            <X size={12} className="text-ink-muted" />
          </button>
        )}
        <ChevronDown
          size={14}
          className={cn(
            "text-ink-muted transition-transform shrink-0",
            open && "rotate-180",
          )}
        />
      </button>

      {/* List (expanded by default when no selection) */}
      {open && (
        <div className="rounded-btn bg-pearl-warm border border-pearl-soft max-h-[50vh] overflow-y-auto divide-y divide-pearl-soft">
          <button
            type="button"
            onClick={() => {
              onSelect(undefined);
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 hover:bg-pearl-soft text-body-sm text-ink-secondary"
          >
            指定なしで相談する
          </button>
          {customers.map((c) => {
            const helpName = c.cast_id ? helpCastNames[c.cast_id] : undefined;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onSelect(c.id);
                  setOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 hover:bg-pearl-soft",
                  selectedId === c.id && "bg-amethyst-muted",
                )}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-body-sm text-ink">
                    {formatCustomerName(c.name)}
                  </span>
                  {helpName && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-champagne-soft text-ink-secondary">
                      {helpName}担当
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-ink-muted">
                  {c.job ?? "—"} ·{" "}
                  {c.category === "vip"
                    ? "VIP"
                    : c.category === "new"
                      ? "新規"
                      : "常連"}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
