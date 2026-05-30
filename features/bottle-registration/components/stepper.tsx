"use client";

import { Minus, Plus } from "lucide-react";

interface Props {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

export function Stepper({
  label,
  value,
  min = 1,
  max = 60,
  step = 1,
  unit,
  onChange,
}: Props) {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));

  return (
    <div className="space-y-1.5">
      <label className="block text-label-md text-ink font-medium">{label}</label>
      <div className="flex items-center gap-3 bg-pearl-warm border border-pearl-soft rounded-btn px-2 py-2">
        <button
          type="button"
          onClick={dec}
          disabled={value <= min}
          className="w-10 h-10 rounded-btn bg-pearl-soft text-ink hover:bg-champagne disabled:opacity-40 flex items-center justify-center active:scale-95"
          aria-label="減らす"
        >
          <Minus size={16} />
        </button>
        <div className="flex-1 text-center">
          <span className="font-display text-[2rem] leading-none text-ink">
            {value}
          </span>
          {unit && <span className="ml-1 text-body-sm text-ink-soft">{unit}</span>}
        </div>
        <button
          type="button"
          onClick={inc}
          disabled={value >= max}
          className="w-10 h-10 rounded-btn bg-pearl-soft text-ink hover:bg-champagne disabled:opacity-40 flex items-center justify-center active:scale-95"
          aria-label="増やす"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
