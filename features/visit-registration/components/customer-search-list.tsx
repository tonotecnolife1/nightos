"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/nightos/badge";
import { cn } from "@/lib/utils";
import type { Customer } from "@/types/nightos";

interface Props {
  customers: Customer[]; // already sorted with most-recent first
  value: string | null;
  onChange: (id: string | null) => void;
}

export function CustomerSearchList({ customers, value, onChange }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.includes(q) ||
        c.job?.includes(q) ||
        c.favorite_drink?.includes(q),
    );
  }, [customers, query]);

  return (
    <div className="space-y-2">
      <div className="text-label-md text-ink font-medium">お客様</div>
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="名前・職業で検索"
          className="w-full h-11 pl-9 pr-3 rounded-btn bg-pearl-warm border border-pearl-soft text-ink text-body-md outline-none focus:border-champagne-dark"
        />
      </div>
      <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="text-body-sm text-ink-mute py-4 text-center">
            該当する顧客が見つかりません
          </p>
        ) : (
          filtered.map((c) => {
            const active = value === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onChange(active ? null : c.id)}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-btn border text-left transition-all",
                  active
                    ? "bg-champagne border-champagne-dark"
                    : "bg-pearl-warm border-pearl-soft hover:border-champagne-dark",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-body-md text-ink">{c.name}</div>
                  <div className="text-label-sm text-ink-mute truncate">
                    {c.job ?? "—"}
                  </div>
                </div>
                <Badge
                  tone={
                    c.category === "vip"
                      ? "vip"
                      : c.category === "new"
                        ? "new"
                        : "regular"
                  }
                >
                  {c.category === "vip"
                    ? "VIP"
                    : c.category === "new"
                      ? "新規"
                      : "常連"}
                </Badge>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
