"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, Menu, Settings, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CAST_NAV_ITEMS, isTabBarVisible } from "@/components/nightos/cast-nav";

interface Props {
  /**
   * 未読通知の件数 (店舗メッセージ + 直近の来店)。0 より大きいとハンバーガーと
   * 「通知」行にドット、メニュー内に件数バッジを出す。
   */
  notificationCount?: number;
}

/**
 * ホーム Hero (dark wine) 専用の「☰」メニュー。
 *
 * 以前は Hero 右上に [マイページ][通知] の 2 アイコンを並べていたが、他画面
 * (PageHeader → MoreMenu) と同じハンバーガー 1 個に集約し、その 2 つを
 * メニュー内へ収めた。bottom tab bar に出ている導線 (ホーム/顧客/さくらママ/
 * チャット/成績) は重複するので除外し、MoreMenu と同じ「tab bar に無い導線
 * (予定) + マイページ + 通知 + アカウント設定」だけを出す。
 *
 * MoreMenu (components/nightos) は light ヘッダー用の配色なので流用せず、dark
 * hero 用にボタンを v5-ring-gold (champagne-gold ヘアライン + 半透明ガラス) で
 * 起こす。吹き出しは MoreMenu と同じ bordeaux gradient + キャレットの正典。
 *
 * 「通知」は専用ページ (/cast/notifications) へ遷移し、未読件数を件数バッジで
 * 出す。件数は店舗メッセージ + 直近の来店を合算した値。
 */
export function CastHomeMenu({ notificationCount = 0 }: Props) {
  const hasNotification = notificationCount > 0;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname() ?? "";

  // 外側クリック / Escape で閉じる (MoreMenu と同じ挙動)。
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

  // tab bar 表示中はそこに出ている導線を除外し、現在地そのものも出さない。
  // 「予定」は Hero 本文の「スケジュールを見る」CTA と重複するので除外する。
  const tabBarVisible = isTabBarVisible(pathname);
  const navItems = CAST_NAV_ITEMS.filter(
    (it) =>
      it.key !== "schedule" &&
      (tabBarVisible ? !it.inTabBar : true) &&
      !it.match(pathname),
  );

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="メニュー"
        aria-expanded={open}
        className="relative w-9 h-9 rounded-full v5-ring-gold flex items-center justify-center transition"
        style={{
          background: open ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
          color: "rgba(253,252,249,0.85)",
        }}
      >
        <Menu size={18} strokeWidth={1.6} />
        {hasNotification && !open && (
          <span
            className="absolute top-1.5 right-1.5 w-[7px] h-[7px] rounded-full"
            style={{
              background: "var(--v5-gold-mid)",
              border: "1.5px solid #2D1818",
            }}
          />
        )}
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
              {/* マイページ — 旧右上アイコンその 1 */}
              <li>
                <MenuLink
                  href="/cast/my"
                  label="マイページ"
                  icon={UserCircle}
                  active={pathname.startsWith("/cast/my")}
                  onSelect={() => setOpen(false)}
                />
              </li>

              {/* 通知 — 旧右上アイコンその 2。専用ページ + 未読件数バッジ。 */}
              <li>
                <Link
                  href="/cast/notifications"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group flex w-full items-center justify-between gap-3 rounded-[12px] pl-3.5 pr-2 py-2.5 transition-colors",
                    pathname.startsWith("/cast/notifications")
                      ? "bg-[rgba(20,10,10,0.45)]"
                      : "hover:bg-[rgba(20,10,10,0.28)]",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="text-[13px] font-medium tracking-[0.06em]"
                      style={{ color: "var(--v5-ink-on-dark)" }}
                    >
                      通知
                    </span>
                    {hasNotification && (
                      <span
                        className="min-w-[18px] text-center text-[10px] font-semibold tabular-nums tracking-[0.04em] px-1.5 py-0.5 rounded-full"
                        style={{
                          background: "rgba(235,217,168,0.16)",
                          color: "var(--v5-gold-on-dark)",
                        }}
                      >
                        {notificationCount > 99 ? "99+" : notificationCount}
                      </span>
                    )}
                  </span>
                  <span
                    className="relative shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(235,217,168,0.12)",
                      color: "var(--v5-gold-on-dark)",
                    }}
                  >
                    <Bell size={14} />
                    {hasNotification && (
                      <span
                        className="absolute top-0.5 right-0.5 w-[6px] h-[6px] rounded-full"
                        style={{
                          background: "var(--v5-gold-mid)",
                          border: "1.5px solid var(--v5-bordeaux)",
                        }}
                      />
                    )}
                  </span>
                </Link>
              </li>

              {/* tab bar に無い導線 (予定) + アカウント設定 — MoreMenu と同一の正典 */}
              {navItems.map((it) => (
                <li key={it.key}>
                  <MenuLink
                    href={it.href}
                    label={it.label}
                    icon={it.icon}
                    active={it.match(pathname)}
                    onSelect={() => setOpen(false)}
                  />
                </li>
              ))}
              <li>
                <MenuLink
                  href="/settings"
                  label="アカウント設定"
                  icon={Settings}
                  active={pathname.startsWith("/settings")}
                  onSelect={() => setOpen(false)}
                />
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  label,
  icon: Icon,
  active,
  onSelect,
}: {
  href: string;
  label: string;
  icon: typeof Menu;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onSelect}
      className={cn(
        "group flex items-center justify-between gap-3 rounded-[12px] pl-3.5 pr-2 py-2.5 transition-colors",
        active ? "bg-[rgba(20,10,10,0.45)]" : "hover:bg-[rgba(20,10,10,0.28)]",
      )}
    >
      <span
        className="text-[13px] font-medium tracking-[0.06em]"
        style={{
          color: active ? "var(--v5-gold-on-dark)" : "var(--v5-ink-on-dark)",
        }}
      >
        {label}
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
  );
}
