"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Home,
  Menu,
  MessageCircle,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { SAKURA_MAMA_DISPLAY_NAME } from "@/lib/nightos/constants";
import { cn } from "@/lib/utils";

interface MoreMenuItem {
  key: string;
  label: string;
  href: string;
  icon: typeof Home;
  match: (pathname: string) => boolean;
}

const ITEMS: MoreMenuItem[] = [
  {
    key: "home",
    label: "ホーム",
    href: "/cast/home",
    icon: Home,
    match: (p) => p === "/cast/home",
  },
  {
    key: "customers",
    label: "顧客",
    href: "/cast/customers",
    icon: Users,
    match: (p) => p.startsWith("/cast/customers"),
  },
  {
    key: "ruri-mama",
    label: SAKURA_MAMA_DISPLAY_NAME,
    href: "/cast/ruri-mama",
    icon: Sparkles,
    match: (p) => p.startsWith("/cast/ruri-mama"),
  },
  {
    key: "chat",
    label: "チャット",
    href: "/cast/chat",
    icon: MessageCircle,
    match: (p) => p.startsWith("/cast/chat"),
  },
  {
    key: "schedule",
    label: "予定",
    href: "/cast/schedule",
    icon: CalendarDays,
    match: (p) => p.startsWith("/cast/schedule"),
  },
  {
    key: "stats",
    label: "成績",
    href: "/cast/stats",
    icon: TrendingUp,
    match: (p) => p.startsWith("/cast/stats"),
  },
];

interface Props {
  /** 配色トーン。"ruri" だと半透明白文字（gradient ヒーロー用）。 */
  tone?: "default" | "ruri";
}

/**
 * 全画面ナビゲーション用の「☰」メニュー。
 *
 * - bottom tab が非表示の画面（さくらママ・チャット詳細）でも全タブへ届く
 * - PageHeader の右上に常設して、設定・他ロール画面（あれば）への近道としても使う
 */
export function MoreMenu({ tone = "default" }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isRuri = tone === "ruri";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="メニュー"
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center transition",
          // tone="ruri" のヘッダーも地は淡い pearl なので、旧 dark-hero 用の
          // 半透明白文字だと地に溶けて見えない。wine アクセントで視認性を確保する。
          isRuri
            ? "bg-wine-deep/10 hover:bg-wine-deep/20 text-wine-deep"
            : "bg-pearl-warm/70 hover:bg-pearl-warm text-ink-soft",
        )}
      >
        <Menu size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[70]">
          <div
            className="absolute inset-0 bg-ink/40 animate-fade-overlay"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80dvh] overflow-y-auto rounded-t-[28px] bg-pearl-warm shadow-warm animate-slide-up">
            <div className="sticky top-0 z-10 flex items-center justify-between bg-pearl-warm border-b border-ink/[0.06] px-5 pb-3 pt-5">
              <h2 className="font-display text-[18px] leading-tight font-medium text-ink">
                メニュー
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="閉じる"
                className="w-8 h-8 rounded-full border border-ink/[0.08] bg-pearl-warm flex items-center justify-center text-ink-secondary hover:bg-pearl-soft"
              >
                <X size={14} />
              </button>
            </div>

            <ul className="px-3 pt-3 pb-4">
              {ITEMS.map((it) => {
                const Icon = it.icon;
                const active = it.match(pathname);
                return (
                  <li key={it.key}>
                    <Link
                      href={it.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-card border transition",
                        active
                          ? "border-gold/30 bg-champagne-soft/60 text-gold-deep"
                          : "border-transparent text-ink hover:bg-pearl-soft",
                      )}
                    >
                      <Icon size={18} />
                      <span className="text-body-md font-medium">
                        {it.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="px-3 pb-6 pt-2 border-t border-ink/[0.06]">
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-card text-ink-secondary hover:bg-pearl-soft"
              >
                <Settings size={16} />
                <span className="text-body-md">アカウント設定</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
