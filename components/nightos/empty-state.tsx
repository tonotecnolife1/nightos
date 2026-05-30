import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "default" | "amethyst" | "rose";
  className?: string;
}

const toneConfig = {
  default: {
    bg: "bg-pearl-light/85 backdrop-blur-md border-ink/[0.08]",
    iconBg: "bg-pearl-soft text-ink-mute",
  },
  amethyst: {
    bg: "bg-pearl-light/85 backdrop-blur-md border-gold/30",
    iconBg: "bg-champagne-soft/60 text-gold-deep",
  },
  rose: {
    bg: "bg-pearl-light/85 backdrop-blur-md border-gold/30",
    iconBg: "bg-champagne-soft/60 text-wine-deep",
  },
};

/**
 * 空状態（データが無い時）の統一デザイン。
 * アイコン + タイトル + 説明 + CTAボタンの4段構成。
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = "default",
  className,
}: Props) {
  const cfg = toneConfig[tone];
  return (
    <div
      className={cn(
        "rounded-card border p-6 text-center space-y-3",
        cfg.bg,
        className,
      )}
    >
      {icon && (
        <div
          className={cn(
            "w-14 h-14 rounded-full mx-auto flex items-center justify-center",
            cfg.iconBg,
          )}
        >
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <h3 className="font-serif text-[16px] leading-tight font-medium tracking-[0.02em] text-ink">{title}</h3>
        {description && (
          <p className="text-body-sm text-ink-soft leading-relaxed max-w-xs mx-auto">
            {description}
          </p>
        )}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
