"use client";

import { cn } from "@/lib/utils";
import {
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
} from "../data/templates";

interface Props {
  value: TemplateCategory;
  onChange: (value: TemplateCategory) => void;
}

export function CategoryTabs({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-4 gap-1.5 p-1 rounded-pill bg-pearl-soft border border-line-strong">
      {TEMPLATE_CATEGORIES.map((cat) => {
        const active = cat.value === value;
        return (
          <button
            key={cat.value}
            type="button"
            onClick={() => onChange(cat.value)}
            className={cn(
              "h-9 rounded-pill text-label-sm font-medium tracking-[0.04em] transition-all active:scale-95",
              active
                ? "bg-wine-deep text-pearl-light shadow-luxe"
                : "text-ink-soft hover:text-ink",
            )}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
