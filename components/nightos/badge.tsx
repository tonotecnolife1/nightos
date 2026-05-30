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

// V5 Bordeaux Salon: wine + champagne + gold の 3 色軸。
// VIP は champagne-gold メタリック細枠 (塗りなし)、誕生日は wine、その他は champagne / pearl。
const toneStyles: Record<Tone, string> = {
  vip: "v5-ring-gold bg-transparent text-gold-deep",
  regular: "bg-champagne-soft/60 text-ink-soft border border-line-strong",
  new: "bg-wine-soft/40 text-wine-deep border border-wine/25",
  interval: "bg-pearl-soft text-ink-soft border border-line-strong",
  birthday: "bg-wine-soft/50 text-wine-deep border border-wine/25",
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
