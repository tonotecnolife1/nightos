"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { CAST_NAV_ITEMS, isTabBarVisible } from "./cast-nav";

interface Props {
  /** 配色トーン。"ruri" だと半透明白文字（gradient ヒーロー用）。 */
  tone?: "default" | "ruri";
}

/**
 * 全画面ナビゲーション用の「☰」メニュー。
 *
 * V5: ハンバーガー直下に上向きキャレット付きの吹き出し (bordeaux gradient +
 * cream text + champagne-gold アクセント) を出す。さくらママカードと同じ
 * dark-on-light の正典パターン。
 *
 * - bottom tab が非表示の画面（さくらママ・チャット詳細）では全タブへ届く
 * - bottom tab 表示中は重複を避け、tab bar に無い導線（予定）と設定だけ出す
 * - 現在地そのものは出さない（例: スケジュール画面の「予定」）
 *
 * 吹き出しはボタンの相対配置に対する `absolute` で出すため、PageHeader の
 * `backdrop-blur` 内でも画面外へはみ出さない（`fixed` を使わない）。
 */
export function MoreMenu({ tone = "default" }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname() ?? "";

  // 外側クリック / Escape で閉じる。
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const isRuri = tone === "ruri";

  // tab bar 表示中はそこに出ている導線を除外（重複排除）。
  // tab bar 非表示の画面ではメニューが唯一のナビなので全項目を出す。
  // いずれの場合も現在地そのものは出さない（例: スケジュール画面の「予定」）。
  const tabBarVisible = isTabBarVisible(pathname);
  const navItems = CAST_NAV_ITEMS.filter(
    (it) => (tabBarVisible ? !it.inTabBar : true) && !it.match(pathname),
  );

  const items = [
    ...navItems.map((it) => ({
      key: it.key,
      label: it.label,
      href: it.href,
      icon: it.icon,
      active: it.match(pathname),
    })),
    {
      key: "settings",
      label: "アカウント設定",
      href: "/settings",
      icon: Settings,
      active: pathname.startsWith("/settings"),
    },
  ];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="メニュー"
        aria-expanded={open}
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center transition",
          // tone="ruri" のヘッダーも地は淡い pearl なので、旧 dark-hero 用の
          // 半透明白文字だと地に溶けて見えない。wine アクセントで視認性を確保する。
          isRuri
            ? "bg-wine-deep/10 hover:bg-wine-deep/20 text-wine-deep"
            : "bg-pearl-warm/70 hover:bg-pearl-warm text-ink-soft",
          open && "bg-wine-deep/15 text-wine-deep",
        )}
      >
        <Menu size={18} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2.5 z-[70] w-[208px] origin-top-right animate-fade-in"
        >
          {/* 上向きキャレット (吹き出しの尻尾) */}
          <span
            aria-hidden
            className="absolute -top-1.5 right-3 w-3 h-3 rotate-45 rounded-[2px]"
            style={{
              background: "var(--v5-bordeaux-deep)",
              boxShadow: "var(--v5-shadow-luxe)",
            }}
          />
          <div
            className="relative overflow-hidden rounded-[18px] p-1.5"
            style={{
              background: "var(--v5-bordeaux)",
              boxShadow: "var(--v5-shadow-luxe)",
              border: "1px solid rgba(235,217,168,0.18)",
            }}
          >
            <ul className="flex flex-col">
              {items.map((it) => {
                const Icon = it.icon;
                return (
                  <li key={it.key}>
                    <Link
                      href={it.href}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                      className={cn(
                        "group flex items-center justify-between gap-3 rounded-[12px] pl-3.5 pr-2 py-2.5 transition-colors",
                        it.active
                          ? "bg-[rgba(20,10,10,0.45)]"
                          : "hover:bg-[rgba(20,10,10,0.28)]",
                      )}
                    >
                      <span
                        className="text-[13px] font-medium tracking-[0.06em]"
                        style={{
                          color: it.active
                            ? "var(--v5-gold-on-dark)"
                            : "var(--v5-ink-on-dark)",
                        }}
                      >
                        {it.label}
                      </span>
                      <span
                        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                        style={{
                          background: "rgba(235,217,168,0.12)",
                          color: "var(--v5-gold-on-dark)",
                        }}
                      >
                        <Icon size={14} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
