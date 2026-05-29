"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Ticket, Wine } from "lucide-react";
import { cn } from "@/lib/utils";

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
    href: "/customer/home",
    icon: Home,
    match: (p) => p === "/customer/home",
  },
  {
    key: "bottles",
    label: "マイボトル",
    href: "/customer/bottles",
    icon: Wine,
    match: (p) => p.startsWith("/customer/bottles"),
  },
  {
    key: "coupons",
    label: "クーポン",
    href: "/customer/coupons",
    icon: Ticket,
    match: (p) => p.startsWith("/customer/coupons"),
  },
];

export function CustomerTabBar() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="mx-auto max-w-[520px] px-4 pb-safe pointer-events-auto">
        <div className="rounded-full glass border border-ink/[0.08] shadow-warm flex items-center justify-around px-2 py-2">
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
                  <Icon size={18} strokeWidth={active ? 1.8 : 1.5} />
                  <span
                    className={cn(
                      "text-[10px] tracking-[0.06em]",
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
