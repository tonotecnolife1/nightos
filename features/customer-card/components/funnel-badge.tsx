import { MessageCircle, Store, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type FunnelStage = "store_only" | "assigned" | "line_exchanged";

const CONFIG: Record<
  FunnelStage,
  { label: string; emoji: string; icon: typeof Store; bg: string; text: string }
> = {
  store_only: {
    label: "店舗登録のみ",
    emoji: "🏪",
    icon: Store,
    bg: "bg-pearl-soft border-line-strong",
    text: "text-ink-mute",
  },
  assigned: {
    label: "担当あり",
    emoji: "👤",
    icon: UserCheck,
    bg: "bg-champagne-soft/60 border-gold/30",
    text: "text-gold-deep",
  },
  line_exchanged: {
    label: "LINE交換済み",
    emoji: "💬",
    icon: MessageCircle,
    bg: "bg-success/15 border-success/25",
    text: "text-success",
  },
};

interface Props {
  stage?: FunnelStage | null;
  compact?: boolean;
  className?: string;
}

export function FunnelBadge({ stage = "store_only", compact, className }: Props) {
  const cfg = CONFIG[stage ?? "store_only"];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-badge border text-[10px] font-medium",
        cfg.bg,
        cfg.text,
        compact ? "px-1.5 py-0.5" : "px-2 py-0.5",
        className,
      )}
    >
      <Icon size={compact ? 9 : 10} />
      {!compact && cfg.label}
    </span>
  );
}
