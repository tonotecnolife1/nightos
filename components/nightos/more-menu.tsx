"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CAST_NAV_ITEMS, isTabBarVisible } from "./cast-nav";

interface Props {
  /** 配色トーン。"ruri" だと半透明白文字（gradient ヒーロー用）。 */
  tone?: "default" | "ruri";
}

/**
 * 全画面ナビゲーション用の「☰」メニュー。
 *
 * - bottom tab が非表示の画面（さくらママ・チャット詳細）では全タブへ届く
 * - bottom tab 表示中は重複を避け、tab bar に無い導線（予定）と設定だけ出す
 *
 * シート本体は document.body へ portal する。PageHeader 等の `backdrop-blur`
 * を持つ sticky 親は `position: fixed` の含有ブロックになり、portal しないと
 * シートがヘッダー内に閉じ込められて画面外へはみ出すため。
 */
export function MoreMenu({ tone = "default" }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // open 直後に true へ倒して右からのスライドインを transition で駆動する
  // （tailwind に slide-in-right の keyframe を増やさず実現するため）。
  const [shown, setShown] = useState(false);
  const pathname = usePathname() ?? "";

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => setShown(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      setShown(false);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isRuri = tone === "ruri";

  // tab bar 表示中はそこに出ている導線を除外（重複排除）。
  // tab bar 非表示の画面ではメニューが唯一のナビなので全項目を出す。
  // いずれの場合も現在地そのものは出さない（例: スケジュール画面の「予定」）。
  const tabBarVisible = isTabBarVisible(pathname);
  const items = CAST_NAV_ITEMS.filter(
    (it) => (tabBarVisible ? !it.inTabBar : true) && !it.match(pathname),
  );

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

      {open &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[70]">
            <div
              className="absolute inset-0 bg-ink/40 animate-fade-overlay"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            {/* 右ドロワー: ハンバーガー (右上) からそのまま伸びるように右端から出す */}
            <div
              className={cn(
                "absolute top-0 right-0 bottom-0 flex flex-col w-[min(84vw,320px)] rounded-l-[24px] bg-pearl-warm shadow-warm",
                "transition-transform duration-300 ease-out",
                shown ? "translate-x-0" : "translate-x-full",
              )}
            >
              <div className="shrink-0 flex items-center justify-between border-b border-ink/[0.06] px-5 pb-3 pt-safe">
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

              <ul className="flex-1 overflow-y-auto px-3 pt-3 pb-4">
                {items.map((it) => {
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

              <div className="shrink-0 px-3 pt-2 pb-safe border-t border-ink/[0.06]">
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
          </div>,
          document.body,
        )}
    </>
  );
}
