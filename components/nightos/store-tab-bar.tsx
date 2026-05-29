"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStorePermission } from "@/lib/nightos/store-permission-store";

interface Tab {
  key: string;
  label: string;
  icon: typeof Home;
  href: string;
  match: (p: string) => boolean;
  ownerOnly?: boolean;
}

const TABS: Tab[] = [
  {
    key: "home",
    label: "ホーム",
    icon: Home,
    href: "/store",
    match: (p) =>
      p === "/store" ||
      p.startsWith("/store/customers") ||
      p.startsWith("/store/visits") ||
      p.startsWith("/store/bottles"),
  },
  {
    key: "dashboard",
    label: "ダッシュボード",
    icon: BarChart3,
    href: "/store/dashboard",
    match: (p) => p.startsWith("/store/dashboard"),
    ownerOnly: true,
  },
];

export function StoreTabBar() {
  const pathname = usePathname() ?? "";
  const [isOwner, setIsOwner] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setIsOwner(getStorePermission() === "owner");
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  const visibleTabs = TABS.filter((t) => !t.ownerOnly || isOwner);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="mx-auto max-w-[520px] px-4 pb-safe pointer-events-auto">
        <div className="rounded-full glass border border-ink/[0.08] shadow-warm flex items-center justify-around px-2 py-2">
          {visibleTabs.map((tab) => {
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
