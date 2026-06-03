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
  // V5 主要操作 — wine-deep solid + shadow (pearl 地で使う)
  // `!text-pearl-light`: globals.css の非レイヤー .t-*/.v5-* 文字色クラスが
  // Tailwind の @layer utilities より後勝ちするため、CTA の文字色が地色に
  // 埋もれない（黒く見える）よう important で確定させる。
  primary:
    "bg-wine-deep !text-pearl-light hover:bg-wine-deep/95 active:bg-wine-deep shadow-warm",
  // 副次 — pearl-light + line-strong border
  secondary:
    "bg-pearl-light text-wine-deep border border-line-strong hover:border-wine-deep/50 shadow-soft",
  // テキストリンク調
  ghost:
    "text-ink-soft hover:text-ink hover:bg-pearl-soft hover:translate-y-0",
  // primary と同義 (v1 名残のエイリアス)
  ruri: "bg-wine-deep !text-pearl-light hover:bg-wine-deep/95 shadow-warm",
  // outline — wine-deep 細線
  outline:
    "bg-transparent text-wine-deep border border-wine-deep hover:bg-wine/10",
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
