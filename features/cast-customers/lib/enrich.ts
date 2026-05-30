import type { Bottle, CastMemo, Customer, Visit } from "@/types/nightos";
import type { NextAction } from "./action-store";
import type { Priority } from "./priority-store";

const DAY_MS = 24 * 60 * 60 * 1000;
const SIX_MONTHS_MS = 180 * DAY_MS;

export type CustomerStatus =
  | "active"     // 通常ペースで来店中
  | "at_risk"    // 来店間隔が通常の1.5倍以上
  | "dormant"    // 30日以上来店なし
  | "new"        // 来店3回以下
  | "vip_alert"; // VIPで来店間隔が空いている

export const STATUS_CONFIG: Record<
  CustomerStatus,
  { label: string; emoji: string; color: string; sortOrder: number }
> = {
  vip_alert: {
    label: "大事なお客様！",
    emoji: "🔴",
    color: "text-wine-deep bg-wine/10 border-wine/20",
    sortOrder: 0,
  },
  at_risk: {
    label: "連絡しよう",
    emoji: "🟡",
    color: "text-warning bg-warning/10 border-warning/20",
    sortOrder: 1,
  },
  new: {
    label: "新しいお客様",
    emoji: "🔵",
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    sortOrder: 2,
  },
  active: {
    label: "順調",
    emoji: "🟢",
    color: "text-success bg-success/10 border-success/20",
    sortOrder: 3,
  },
  dormant: {
    label: "しばらく来てない",
    emoji: "⚪",
    color: "text-ink-mute bg-pearl-soft border-pearl-soft",
    sortOrder: 4,
  },
};

export type ContactMethod = "line" | "instagram" | "other";

export const CONTACT_METHOD_CONFIG: Record<
  ContactMethod,
  { label: string; icon: string }
> = {
  line: { label: "LINE", icon: "💬" },
  instagram: { label: "Instagram", icon: "📷" },
  other: { label: "その他", icon: "📱" },
};

export interface EnrichedCustomer {
  customer: Customer;
  memo: CastMemo | null;
  bottles: Bottle[];
  visits: Visit[];
  // Computed
  daysSinceLastVisit: number;
  totalVisitCount: number;
  recentVisitCount: number; // last 6 months
  avgInterval: number; // days
  status: CustomerStatus;
  lastVisitDate: string | null;
  hasBirthday: boolean; // within 14 days
  contactMethod: ContactMethod;
  // From localStorage
  priority: Priority;
  nextAction: NextAction | null;
}

export function enrichCustomers(
  customers: Customer[],
  contexts: {
    customer: Customer;
    memo: CastMemo | null;
    bottles: Bottle[];
    visits: Visit[];
  }[],
  priorities: Record<string, Priority>,
  actions: Record<string, NextAction>,
  today: Date,
): EnrichedCustomer[] {
  return contexts.map((ctx) => {
    const { customer, memo, bottles, visits } = ctx;
    const sortedVisits = [...visits].sort(
      (a, b) =>
        new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime(),
    );

    const totalVisitCount = sortedVisits.length;
    const lastVisit = sortedVisits[0];
    const daysSinceLastVisit = lastVisit
      ? Math.floor(
          (today.getTime() - new Date(lastVisit.visited_at).getTime()) /
            DAY_MS,
        )
      : 999;
    const lastVisitDate = lastVisit?.visited_at ?? null;

    // Recent visits (last 6 months)
    const sixMonthsAgo = today.getTime() - SIX_MONTHS_MS;
    const recentVisitCount = sortedVisits.filter(
      (v) => new Date(v.visited_at).getTime() >= sixMonthsAgo,
    ).length;

    // Average interval
    let avgInterval = 0;
    if (sortedVisits.length >= 2) {
      const gaps: number[] = [];
      for (let i = 0; i < sortedVisits.length - 1; i++) {
        const a = new Date(sortedVisits[i].visited_at).getTime();
        const b = new Date(sortedVisits[i + 1].visited_at).getTime();
        gaps.push(Math.floor((a - b) / DAY_MS));
      }
      avgInterval = Math.round(gaps.reduce((s, g) => s + g, 0) / gaps.length);
    }

    // Status
    const status = computeStatus(
      customer,
      totalVisitCount,
      daysSinceLastVisit,
      avgInterval,
    );

    // Birthday within 14 days
    let hasBirthday = false;
    if (customer.birthday) {
      const parts = customer.birthday.split("-").map((n) => parseInt(n, 10));
      if (parts.length >= 3 && parts[1] && parts[2]) {
        let next = new Date(today.getFullYear(), parts[1] - 1, parts[2]);
        if (next.getTime() < today.getTime()) {
          next = new Date(today.getFullYear() + 1, parts[1] - 1, parts[2]);
        }
        const daysUntil = Math.floor(
          (next.getTime() - today.getTime()) / DAY_MS,
        );
        hasBirthday = daysUntil >= 0 && daysUntil <= 14;
      }
    }

    // Contact method — derive from localStorage or default.
    // In a real app this would be a field on the customer record.
    // For MVP, use a simple heuristic: VIPs tend to use LINE,
    // younger customers (new) might use Instagram.
    const contactMethod: ContactMethod =
      loadContactMethod(customer.id) ??
      (customer.category === "new" ? "instagram" : "line");

    return {
      customer,
      memo,
      bottles,
      visits: sortedVisits,
      daysSinceLastVisit,
      totalVisitCount,
      recentVisitCount,
      avgInterval,
      status,
      lastVisitDate,
      hasBirthday,
      contactMethod,
      priority: priorities[customer.id] ?? 0,
      nextAction: actions[customer.id] ?? null,
    };
  });
}

// ═══════════════ Contact method localStorage ═══════════════

const CONTACT_KEY = "nightos.contact-methods";

function loadContactMethod(customerId: string): ContactMethod | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONTACT_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, ContactMethod>;
    return map[customerId] ?? null;
  } catch {
    return null;
  }
}

export function saveContactMethod(
  customerId: string,
  method: ContactMethod,
) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(CONTACT_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, ContactMethod>) : {};
    map[customerId] = method;
    window.localStorage.setItem(CONTACT_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function computeStatus(
  customer: Customer,
  visitCount: number,
  daysSinceLastVisit: number,
  avgInterval: number,
): CustomerStatus {
  if (visitCount <= 3) return "new";
  if (daysSinceLastVisit > 30) return "dormant";
  if (
    customer.category === "vip" &&
    avgInterval > 0 &&
    daysSinceLastVisit > avgInterval * 1.5
  ) {
    return "vip_alert";
  }
  if (avgInterval > 0 && daysSinceLastVisit > avgInterval * 1.5) {
    return "at_risk";
  }
  return "active";
}

export type SortKey =
  | "priority"
  | "daysSince"
  | "visitCount"
  | "recentVisits"
  | "name";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "priority", label: "大事な順" },
  { value: "daysSince", label: "来てない順" },
  { value: "visitCount", label: "来店が多い順" },
  { value: "recentVisits", label: "最近よく来る順" },
  { value: "name", label: "名前順" },
];

export function sortCustomers(
  customers: EnrichedCustomer[],
  sortKey: SortKey,
): EnrichedCustomer[] {
  const sorted = [...customers];
  switch (sortKey) {
    case "priority":
      sorted.sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return (
          STATUS_CONFIG[a.status].sortOrder -
          STATUS_CONFIG[b.status].sortOrder
        );
      });
      break;
    case "daysSince":
      sorted.sort((a, b) => b.daysSinceLastVisit - a.daysSinceLastVisit);
      break;
    case "visitCount":
      sorted.sort((a, b) => b.totalVisitCount - a.totalVisitCount);
      break;
    case "recentVisits":
      sorted.sort((a, b) => b.recentVisitCount - a.recentVisitCount);
      break;
    case "name":
      sorted.sort((a, b) =>
        a.customer.name.localeCompare(b.customer.name, "ja"),
      );
      break;
  }
  return sorted;
}
