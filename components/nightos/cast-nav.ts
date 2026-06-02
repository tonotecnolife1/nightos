import {
  CalendarDays,
  Home,
  MessageCircle,
  QrCode,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { SAKURA_MAMA_DISPLAY_NAME } from "@/lib/nightos/constants";

export interface CastNavItem {
  key: string;
  label: string;
  href: string;
  icon: typeof Home;
  match: (pathname: string) => boolean;
  /**
   * bottom tab bar に常設されている導線か。
   * ☰ メニューはこのフラグを使って、tab bar 表示中は重複項目を除外する。
   */
  inTabBar: boolean;
}

/**
 * /cast 配下の全ナビゲーション項目。tab bar と ☰ メニューの単一の正典。
 * 並びはそのまま tab bar / メニューの表示順に使う。
 */
export const CAST_NAV_ITEMS: CastNavItem[] = [
  {
    key: "home",
    label: "ホーム",
    href: "/cast/home",
    icon: Home,
    match: (p) => p === "/cast/home",
    inTabBar: true,
  },
  {
    key: "customers",
    label: "顧客",
    href: "/cast/customers",
    icon: Users,
    match: (p) => p.startsWith("/cast/customers"),
    inTabBar: true,
  },
  {
    key: "ruri-mama",
    label: SAKURA_MAMA_DISPLAY_NAME,
    href: "/cast/ruri-mama",
    icon: Sparkles,
    match: (p) =>
      p.startsWith("/cast/ruri-mama") || p.startsWith("/mama/ruri-mama"),
    inTabBar: true,
  },
  {
    key: "chat",
    label: "チャット",
    href: "/cast/chat",
    icon: MessageCircle,
    match: (p) => p.startsWith("/cast/chat") || p.startsWith("/mama/chat"),
    inTabBar: true,
  },
  {
    key: "schedule",
    label: "予定",
    href: "/cast/schedule",
    icon: CalendarDays,
    match: (p) => p.startsWith("/cast/schedule"),
    inTabBar: false,
  },
  {
    key: "connect",
    label: "連絡先交換",
    href: "/cast/connect",
    icon: QrCode,
    match: (p) => p.startsWith("/cast/connect"),
    inTabBar: false,
  },
  {
    key: "stats",
    label: "成績",
    href: "/cast/stats",
    icon: TrendingUp,
    match: (p) => p.startsWith("/cast/stats"),
    inTabBar: true,
  },
];

/** bottom tab bar を隠す画面（さくらママ・チャット詳細）。 */
export const TAB_BAR_HIDE_PATTERNS = [
  /^\/cast\/ruri-mama/,
  /^\/cast\/chat\/.+/,
  /^\/mama\/ruri-mama/,
  /^\/mama\/chat\/.+/,
];

/** 現在の pathname で bottom tab bar が表示されるか。 */
export function isTabBarVisible(pathname: string): boolean {
  return !TAB_BAR_HIDE_PATTERNS.some((re) => re.test(pathname));
}
