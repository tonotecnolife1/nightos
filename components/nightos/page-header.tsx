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
   * 戻るボタンの遷移先。指定すると router.back() の代わりにこの URL へ
   * 遷移する (履歴に依存せず確実に特定画面へ戻したいとき)。
   */
  backHref?: string;
  /**
   * Right-side actions. When omitted, the default
   * `[予定 icon][☰ menu]` cluster is shown so navigation is reachable
   * from every page.
   */
  right?: ReactNode;
  className?: string;
  tone?: "default" | "ruri";
}

// v6: sticky header — glass-pearl + serif title。tone="ruri" は rose-gold halo。
export function PageHeader({
  title,
  subtitle,
  showBack,
  backHref,
  right,
  className,
  tone = "default",
}: Props) {
  const router = useRouter();
  const isRuri = tone === "ruri";
  return (
    <header
      className={cn(
        "sticky top-0 z-50 px-5 py-4 backdrop-blur-md border-b",
        isRuri ? "border-[rgba(140,111,68,0.18)]" : "border-[rgba(140,111,68,0.18)]",
        className,
      )}
      style={{
        background: "rgba(247,238,221,0.92)",
      }}
    >
      <div className="flex items-center gap-3">
        {showBack &&
          (backHref ? (
            <Link
              href={backHref}
              aria-label="戻る"
              className="p-1.5 -ml-1.5 rounded-full transition-colors text-ink hover:bg-pearl-soft"
            >
              <ArrowLeft size={22} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="戻る"
              className="p-1.5 -ml-1.5 rounded-full transition-colors text-ink hover:bg-pearl-soft"
            >
              <ArrowLeft size={22} />
            </button>
          ))}
        {isRuri && <RuriMamaAvatar size={44} withGlow />}
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-[20px] leading-tight font-medium tracking-[0.04em] text-ink">
            {title}
          </h1>
          {subtitle && (
            <p className="text-body-sm text-ink-soft">
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
  // スケジュール画面では「予定」ショートカットは現在地そのものなので出さない。
  const onSchedule = pathname.startsWith("/cast/schedule");
  return (
    <div className="flex items-center gap-1.5">
      {!onSchedule && (
        <Link
          href="/cast/schedule"
          aria-label="予定"
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center transition",
            isRuri
              ? "bg-white/15 hover:bg-white/25 text-pearl-light"
              : "bg-pearl-warm/70 hover:bg-pearl-warm text-ink-soft",
          )}
        >
          <CalendarDays size={17} />
        </Link>
      )}
      <MoreMenu tone={tone} />
    </div>
  );
}
