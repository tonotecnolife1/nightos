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

export function CustomerContextPicker({
  customers,
  selectedId,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = customers.find((c) => c.id === selectedId);

  return (
    <div className="relative z-50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl bg-pearl-warm border border-amethyst-border shadow-soft-card text-left active:scale-[0.99]"
      >
        <UserCircle2 size={18} className="text-amethyst-dark shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-label-sm text-ink-muted">顧客コンテキスト</div>
          <div className="text-body-md text-ink truncate">
            {selected ? formatCustomerName(selected.name) : "指定なしで相談"}
          </div>
        </div>
        {selected && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(undefined);
            }}
            aria-label="クリア"
            className="p-1 rounded-full hover:bg-pearl-soft"
          >
            <X size={14} className="text-ink-muted" />
          </button>
        )}
        <ChevronDown
          size={16}
          className={cn(
            "text-ink-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Backdrop — closes dropdown and hides content behind */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 rounded-2xl bg-pearl-warm border border-amethyst-border shadow-elevated-light overflow-hidden animate-fade-in max-h-[60vh] overflow-y-auto">
          <button
            type="button"
            onClick={() => {
              onSelect(undefined);
              setOpen(false);
            }}
            className="w-full text-left px-4 py-3 hover:bg-pearl-soft border-b border-pearl-soft"
          >
            <div className="text-body-md text-ink-secondary">
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
                "w-full text-left px-4 py-3 hover:bg-pearl-soft border-b border-pearl-soft last:border-b-0",
                selectedId === c.id && "bg-amethyst-muted",
              )}
            >
              <div className="text-body-md text-ink">{formatCustomerName(c.name)}</div>
              <div className="text-label-sm text-ink-muted">
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
