"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Home,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SAKURA_MAMA_DISPLAY_NAME } from "@/lib/nightos/constants";

interface Tab {
  key: string;
  label: string;
  icon: typeof Home;
  href: string;
  match: (pathname: string) => boolean;
}

const TABS: Tab[] = [
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
    match: (p) =>
      p.startsWith("/cast/ruri-mama") || p.startsWith("/mama/ruri-mama"),
  },
  {
    key: "chat",
    label: "チャット",
    href: "/cast/chat",
    icon: MessageCircle,
    match: (p) => p.startsWith("/cast/chat") || p.startsWith("/mama/chat"),
  },
  {
    key: "schedule",
    label: "予定",
    href: "/cast/schedule",
    icon: CalendarDays,
    match: (p) => p.startsWith("/cast/schedule"),
  },
];

const HIDE_PATTERNS = [
  /^\/cast\/ruri-mama/,
  /^\/cast\/chat\/.+/,
  /^\/mama\/ruri-mama/,
  /^\/mama\/chat\/.+/,
];

export function CastTabBar() {
  const pathname = usePathname() ?? "";

  if (HIDE_PATTERNS.some((re) => re.test(pathname))) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="mx-auto max-w-[520px] px-3 pb-safe pointer-events-auto">
        <div className="rounded-full glass border border-ink/[0.08] shadow-warm flex items-center justify-around px-1.5 py-2">
          {TABS.map((tab) => {
            const active = tab.match(pathname);
            const Icon = tab.icon;
            return (
              <Link key={tab.key} href={tab.href} className="flex-1">
                <div
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-0.5 h-12 rounded-full transition-all",
                    active
                      ? "text-roseGold-deep"
                      : "text-ink-mute hover:text-ink-soft",
                  )}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute top-0 w-[26px] h-[2.5px] rounded-full bg-gold-metallic"
                      style={{ boxShadow: "0 1px 4px rgba(184,148,85,0.5)" }}
                    />
                  )}
                  <Icon size={17} strokeWidth={active ? 1.8 : 1.5} />
                  <span
                    className={cn(
                      "text-[9px] tracking-[0.06em]",
                      active ? "text-ink font-medium" : "font-normal",
                    )}
                  >
                    {tab.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
