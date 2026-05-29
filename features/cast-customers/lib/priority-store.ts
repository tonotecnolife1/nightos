"use client";

/**
 * Cast-local priority management.
 * Stored per-cast in localStorage so each cast can prioritize their own way.
 * Priority: 3 = 最優先, 2 = 高, 1 = 通常, 0 = 低 (default)
 */

const KEY_PREFIX = "nightos.priorities";

export type Priority = 0 | 1 | 2 | 3;

export const PRIORITY_LABELS: Record<Priority, string> = {
  3: "最優先",
  2: "高",
  1: "通常",
  0: "低",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  3: "text-rose bg-rose/15 border-rose/30",
  2: "text-amber bg-amber/15 border-amber/30",
  1: "text-ink-soft bg-pearl-soft border-pearl-soft",
  0: "text-ink-mute bg-transparent border-transparent",
};

function key(castId: string): string {
  return `${KEY_PREFIX}.${castId}`;
}

export function loadPriorities(castId: string): Record<string, Priority> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(key(castId));
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, Priority>;
  } catch {
    return {};
  }
}

export function setPriority(
  castId: string,
  customerId: string,
  priority: Priority,
) {
  if (typeof window === "undefined") return;
  const current = loadPriorities(castId);
  if (priority === 0) {
    delete current[customerId];
  } else {
    current[customerId] = priority;
  }
  window.localStorage.setItem(key(castId), JSON.stringify(current));
}

/** Cycle: 0 → 1 → 2 → 3 → 0 */
export function cyclePriority(current: Priority): Priority {
  return ((current + 1) % 4) as Priority;
}
