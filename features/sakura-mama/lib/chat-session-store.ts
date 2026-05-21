"use client";

import type { ChatMessage } from "@/types/nightos";

const KEY = "nightos.chat-sessions";
const MAX_SESSIONS = 50;

export interface ChatSession {
  id: string;
  customerId: string | null;
  customerName: string | null;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export function loadSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChatSession[];
  } catch {
    return [];
  }
}

export function saveSession(session: ChatSession) {
  if (typeof window === "undefined") return;
  const sessions = loadSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.unshift(session);
  }
  // Trim old sessions
  const trimmed = sessions.slice(0, MAX_SESSIONS);
  window.localStorage.setItem(KEY, JSON.stringify(trimmed));
}

export function deleteSession(id: string) {
  if (typeof window === "undefined") return;
  const sessions = loadSessions().filter((s) => s.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(sessions));
}

export function newSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

/** Group sessions by customer for the history view. */
export function groupByCustomer(
  sessions: ChatSession[],
): { customerName: string | null; customerId: string | null; sessions: ChatSession[] }[] {
  const groups = new Map<string, ChatSession[]>();
  for (const s of sessions) {
    const key = s.customerId ?? "__none__";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }
  const result: { customerName: string | null; customerId: string | null; sessions: ChatSession[] }[] = [];
  // "No customer" group at the end
  const noCustomer = groups.get("__none__");
  groups.delete("__none__");
  // Customer groups sorted by most recent
  const customerEntries = Array.from(groups.entries()).sort((a, b) => {
    const aLatest = a[1][0]?.updatedAt ?? "";
    const bLatest = b[1][0]?.updatedAt ?? "";
    return bLatest.localeCompare(aLatest);
  });
  for (const [, sessions] of customerEntries) {
    result.push({
      customerName: sessions[0]?.customerName ?? null,
      customerId: sessions[0]?.customerId ?? null,
      sessions,
    });
  }
  if (noCustomer && noCustomer.length > 0) {
    result.push({ customerName: null, customerId: null, sessions: noCustomer });
  }
  return result;
}
