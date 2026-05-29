import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "ruri" | "outline";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

// v6: pill 形状 + shadow tier (matte philosophy: drop shadow only)
const base =
  "inline-flex items-center justify-center gap-2 rounded-pill font-semibold tracking-[0.04em] transition will-change-transform select-none hover:-translate-y-px active:translate-y-px disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0";

const variants: Record<Variant, string> = {
  // 主要操作 — v6 rose-gold-deep solid + shadow-luxe
  primary:
    "bg-roseGold-deep text-pearl-light shadow-luxe hover:bg-roseGold-deep/95 active:bg-roseGold-deep",
  // 副次 — glass-pearl + line-strong border
  secondary:
    "glass text-roseGold-ink hover:bg-pearl-warm/70",
  // テキストリンク調
  ghost:
    "text-ink-soft hover:text-ink hover:bg-pearl-soft hover:translate-y-0",
  // primary と同義 (v1 名残のエイリアス)
  ruri: "bg-roseGold-deep text-pearl-light shadow-luxe hover:bg-roseGold-deep/95",
  // outline — rose-gold-deep 細線
  outline:
    "bg-transparent text-roseGold-deep border border-roseGold-deep hover:bg-roseGold-soft/30",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-body-sm",
  md: "h-12 px-6 text-body-md",
  lg: "h-14 px-7 text-body-lg",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", fullWidth, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    />
  );
});
