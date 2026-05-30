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
        <div
          className="rounded-full flex items-center justify-around px-2 py-2"
          style={{
            background: "rgba(247,238,221,0.82)",
            backdropFilter: "blur(16px) saturate(160%)",
            WebkitBackdropFilter: "blur(16px) saturate(160%)",
            border: "1px solid rgba(140,111,68,0.18)",
            boxShadow: "var(--v5-shadow-warm)",
          }}
        >
          {TABS.map((tab) => {
            const active = tab.match(pathname);
            const Icon = tab.icon;
            return (
              <Link key={tab.key} href={tab.href} className="flex-1">
                <div
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-0.5 h-12 rounded-full transition-all",
                    active ? "text-wine-deep" : "text-ink-mute hover:text-ink-soft",
                  )}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute top-0 w-[28px] h-[2px] rounded-full"
                      style={{
                        background: "var(--v5-champ-gold)",
                        boxShadow: "0 1px 4px rgba(140,111,68,0.45)",
                      }}
                    />
                  )}
                  <Icon size={18} strokeWidth={active ? 1.8 : 1.5} />
                  <span
                    className={cn(
                      "text-[10px]",
                      active ? "text-ink font-medium" : "font-normal",
                    )}
                    style={{ letterSpacing: "0.10em" }}
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
