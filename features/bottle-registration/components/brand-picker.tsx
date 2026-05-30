"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { TextInput } from "@/components/nightos/input";
import { MOCK_BRANDS_CLUB } from "@/lib/nightos/store-mock-data";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function BrandPicker({ value, onChange }: Props) {
  const [addingNew, setAddingNew] = useState(false);

  if (addingNew) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-label-md text-ink font-medium">銘柄（新規）</label>
          <button
            type="button"
            onClick={() => {
              setAddingNew(false);
              onChange("");
            }}
            className="text-label-sm text-ink-soft underline"
          >
            マスタから選ぶ
          </button>
        </div>
        <TextInput
          name="brand_new"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="例: 山崎25年"
          autoFocus
        />
        <p className="text-[10px] text-ink-mute">
          ※ 取り扱いはウイスキー / 焼酎 のみです
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-label-md text-ink font-medium">
          銘柄（ウイスキー / 焼酎）
        </label>
        <button
          type="button"
          onClick={() => {
            setAddingNew(true);
            onChange("");
          }}
          className="flex items-center gap-1 text-label-sm text-wine-deep"
        >
          <Plus size={12} />
          新規追加
        </button>
      </div>
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {MOCK_BRANDS_CLUB.map((category) => (
          <div key={category.category} className="space-y-1.5">
            <div className="text-label-sm text-ink-mute px-1">
              {category.category}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {category.brands.map((brand) => {
                const active = value === brand;
                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => onChange(brand)}
                    className={cn(
                      "h-11 px-3 rounded-btn border text-body-sm text-left transition-all",
                      active
                        ? "bg-champagne border-champagne-dark text-ink font-semibold"
                        : "bg-pearl-warm border-pearl-soft text-ink hover:border-champagne-dark",
                    )}
                  >
                    {brand}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
