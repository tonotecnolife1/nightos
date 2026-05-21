import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "sakura" | "outline";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

// design.md §4.2 — pill 形状 + フローティング影 + hover で 1px 持ち上げ
const base =
  "inline-flex items-center justify-center gap-2 rounded-pill font-medium tracking-wide transition will-change-transform select-none hover:-translate-y-px active:translate-y-px disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0";

const variants: Record<Variant, string> = {
  // 主要操作 — blush ソフトグラデ + フロート影
  primary:
    "bg-gradient-blush text-ink shadow-float hover:brightness-[1.02]",
  // 副次 — 半透明白 + 細枠
  secondary:
    "bg-pearl-warm text-ink border border-ink/[0.08] shadow-soft hover:border-gold/30",
  // テキストリンク調
  ghost:
    "text-ink-secondary hover:text-ink hover:bg-pearl-soft hover:translate-y-0",
  // primary と同義（sakura は v1 名残のエイリアス。新しい画面では primary を使う）
  sakura: "bg-gradient-blush text-ink shadow-float hover:brightness-[1.02]",
  // outline — gold 細線
  outline:
    "bg-pearl-warm/80 text-ink border border-gold/30 shadow-soft hover:border-gold/50",
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
