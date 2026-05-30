"use client";

import { ArrowLeft, CalendarDays } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MoreMenu } from "./more-menu";
import { RuriMamaAvatar } from "./ruri-mama-avatar";

interface Props {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  /**
   * Right-side actions. When omitted, the default
   * `[予定 icon][☰ menu]` cluster is shown so navigation is reachable
   * from every page.
   */
  right?: ReactNode;
  className?: string;
  tone?: "default" | "ruri";
}

export function PageHeader({
  title,
  subtitle,
  showBack,
  right,
  className,
  tone = "default",
}: Props) {
  const router = useRouter();
  const isRuri = tone === "ruri";
  return (
    <header
      className={cn(
        "sticky top-0 z-50 px-5 py-4 backdrop-blur-md",
        isRuri
          ? "bg-gradient-blush text-ink shadow-soft"
          : "bg-pearl-warm/85 border-b border-ink/[0.06]",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="戻る"
            className="p-1.5 -ml-1.5 rounded-full transition-colors text-ink hover:bg-pearl-soft"
          >
            <ArrowLeft size={22} />
          </button>
        )}
        {isRuri && <RuriMamaAvatar size={44} withGlow />}
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-[20px] leading-tight font-medium tracking-wide text-ink">
            {title}
          </h1>
          {subtitle && (
            <p className="text-body-sm text-ink-secondary">
              {subtitle}
            </p>
          )}
        </div>
        {right ?? <DefaultRightActions tone={tone} />}
      </div>
    </header>
  );
}

/**
 * Default right-side actions for cast-area headers.
 * Always-on access to 予定 (1 タップ) and the ☰ menu (全タブ + 設定).
 *
 * `/store/*` `/mama/*` 配下は別ナビなので、`/cast/*` のときだけ自動付与する
 * （他ロールへの誤導線を防ぐ）。
 */
function DefaultRightActions({ tone }: { tone: "default" | "ruri" }) {
  const pathname = usePathname() ?? "";
  if (!pathname.startsWith("/cast")) return null;

  const isRuri = tone === "ruri";
  return (
    <div className="flex items-center gap-1.5">
      <Link
        href="/cast/schedule"
        aria-label="予定"
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center transition",
          isRuri
            ? "bg-white/15 hover:bg-white/25 text-pearl"
            : "bg-pearl-warm/70 hover:bg-pearl-warm text-ink-secondary",
        )}
      >
        <CalendarDays size={17} />
      </Link>
      <MoreMenu tone={tone} />
    </div>
  );
}
