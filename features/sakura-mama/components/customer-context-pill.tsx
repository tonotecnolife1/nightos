"use client";

import { ChevronDown, UserCircle2, X } from "lucide-react";
import { useState } from "react";
import { cn, formatCustomerName } from "@/lib/utils";
import type { Customer } from "@/types/nightos";

interface Props {
  customers: Customer[];
  selectedId?: string;
  onSelect: (id: string | undefined) => void;
}

/**
 * 相談相手を常に表示する細いピル型 UI。
 * チャット最上部に固定表示して、会話が長くなっても
 * 「今誰の相談をしているか」が一目でわかるようにする。
 * タップで全顧客リストのドロップダウンを開閉。
 */
export function CustomerContextPill({
  customers,
  selectedId,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = customers.find((c) => c.id === selectedId);

  return (
    <div className="relative z-30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center gap-2 px-3 h-9 rounded-full border transition-all active:scale-[0.99]",
          selected
            ? "bg-amethyst-muted border-amethyst-border text-amethyst-dark"
            : "bg-pearl-warm border-pearl-soft text-ink-secondary",
        )}
      >
        <UserCircle2 size={13} className="shrink-0" />
        <div className="flex-1 flex items-center gap-1 min-w-0 text-left">
          <span className="text-[10px] opacity-70">相談相手</span>
          <span className="text-label-sm font-medium truncate">
            {selected ? formatCustomerName(selected.name) : "指定なし"}
          </span>
        </div>
        {selected && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(undefined);
            }}
            aria-label="クリア"
            className="p-0.5 rounded-full hover:bg-white/40"
          >
            <X size={11} />
          </button>
        )}
        <ChevronDown
          size={12}
          className={cn(
            "transition-transform shrink-0",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-1.5 left-0 right-0 z-50 rounded-card bg-pearl-warm border border-amethyst-border shadow-elevated-light overflow-hidden animate-fade-in max-h-[60vh] overflow-y-auto">
          <button
            type="button"
            onClick={() => {
              onSelect(undefined);
              setOpen(false);
            }}
            className={cn(
              "w-full text-left px-3 py-2.5 hover:bg-pearl-soft border-b border-pearl-soft",
              !selectedId && "bg-amethyst-muted",
            )}
          >
            <div className="text-body-sm text-ink-secondary">
              指定なしで相談
            </div>
          </button>
          {customers.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onSelect(c.id);
                setOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-2.5 hover:bg-pearl-soft border-b border-pearl-soft last:border-b-0",
                selectedId === c.id && "bg-amethyst-muted",
              )}
            >
              <div className="text-body-sm text-ink">
                {formatCustomerName(c.name)}
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
          ))}
        </div>
      )}
    </div>
  );
}
