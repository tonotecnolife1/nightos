"use client";

import { cn } from "@/lib/utils";
import { MOCK_TABLES } from "@/lib/nightos/store-mock-data";

interface Props {
  value: string | null;
  onChange: (id: string | null) => void;
}

export function TableGrid({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <div className="text-label-md text-ink font-medium">テーブル</div>
      <div className="grid grid-cols-4 gap-2">
        {MOCK_TABLES.map((t) => {
          const active = value === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange(active ? null : t.id)}
              className={cn(
                "h-16 rounded-btn border text-center transition-all active:scale-95",
                active
                  ? "bg-rose-gold-metallic text-wine-deep border border-gold/30 shadow-luxe"
                  : "bg-pearl-warm border-pearl-soft text-ink hover:border-champagne-dark",
              )}
            >
              <div className="text-label-md font-semibold">{t.label}</div>
              <div
                className={cn(
                  "text-[10px]",
                  active ? "text-pearl-light/80" : "text-ink-mute",
                )}
              >
                {t.seats}席
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
