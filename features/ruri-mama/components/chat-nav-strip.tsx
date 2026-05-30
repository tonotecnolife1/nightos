"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, MessageCircle, Users } from "lucide-react";

const ITEMS = [
  { label: "ホーム", path: "/home", icon: Home },
  { label: "顧客", path: "/customers", icon: Users },
  { label: "チャット", path: "/chat", icon: MessageCircle },
  { label: "予定", path: "/schedule", icon: CalendarDays },
] as const;

/**
 * さくらママのチャット画面で、入力欄の上に出す軽量タブストリップ。
 * 一度「戻る」を押さずに他の主要タブへ移動できるようにする導線。
 */
export function ChatNavStrip() {
  const pathname = usePathname() ?? "";
  const base = pathname.startsWith("/mama") ? "/mama" : "/cast";

  return (
    <nav className="px-4 pt-1.5">
      <div
        className="flex items-center justify-around rounded-full px-1 py-1"
        style={{
          background: "rgba(247,238,221,0.82)",
          backdropFilter: "blur(12px) saturate(150%)",
          WebkitBackdropFilter: "blur(12px) saturate(150%)",
          border: "1px solid rgba(140,111,68,0.18)",
        }}
      >
        {ITEMS.map(({ label, path, icon: Icon }) => (
          <Link
            key={path}
            href={`${base}${path}`}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 h-10 rounded-full text-ink-mute hover:text-wine-deep transition-colors"
          >
            <Icon size={17} strokeWidth={1.6} />
            <span className="text-[9px]" style={{ letterSpacing: "0.08em" }}>
              {label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
