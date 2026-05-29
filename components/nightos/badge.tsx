import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone =
  | "vip"
  | "regular"
  | "new"
  | "interval"
  | "birthday"
  | "nomination"
  | "neutral";

interface Props extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

// v6: rose-gold + champagne + gold + wine の 4 色セット。
// VIP は gold hairline (塗りなし)、新規/誕生日は wine 系、常連は champagne。
const toneStyles: Record<Tone, string> = {
  vip: "bg-transparent text-gold-deep border border-gold/55",
  regular: "bg-champagne-soft/60 text-ink-soft border border-line-strong",
  new: "bg-roseGold-soft/60 text-roseGold-deep border border-roseGold/30",
  interval: "bg-pearl-soft text-ink-soft border border-line-strong",
  birthday: "bg-[#f5dcd8] text-wine-deep border border-wine/25",
  nomination: "bg-[rgba(184,148,85,0.16)] text-gold-deep border border-gold/30",
  neutral: "bg-pearl-soft text-ink-soft border border-line",
};

export function Badge({ tone = "neutral", className, ...rest }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-badge text-[11px] font-medium tracking-[0.04em]",
        toneStyles[tone],
        className,
      )}
      {...rest}
    />
  );
}
