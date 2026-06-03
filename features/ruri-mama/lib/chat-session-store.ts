"use client";

import type { ChatMessage } from "@/types/nightos";
import { sanitizeStoredMessages } from "./sanitize-messages";
import { pushSession, removeSessionRemote } from "./chat-sync";

export const CHAT_SESSIONS_KEY = "nightos.chat-sessions";
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

/**
 * 保存済みセッション 1 件を「描画しても落ちない」形に正規化する。
 *
 * なぜ必要か:
 *   相談履歴サイドバーは `s.title.toLowerCase()` / `m.content.toLowerCase()`
 *   等で各セッションを描画・検索する。古いアプリ版の形や壊れたデータが
 *   1 件でも混ざると、ここで同期例外が飛びエラーバウンダリに落ちる。
 *   そして唯一の復帰手段が「相談履歴をリセット」= 全削除だったため、
 *   ユーザーの資産である相談履歴ごと失われていた（報告された不具合）。
 *   メッセージ本文は `sanitizeStoredMessages` で正規化し、その他のフィールドも
 *   安全な型に寄せることで、壊れた 1 件が画面全体を巻き込むのを防ぐ。
 */
function sanitizeSession(raw: unknown): ChatSession | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  if (typeof s.id !== "string" || s.id.length === 0) return null;

  const now = new Date().toISOString();
  return {
    id: s.id,
    customerId: typeof s.customerId === "string" ? s.customerId : null,
    customerName: typeof s.customerName === "string" ? s.customerName : null,
    title:
      typeof s.title === "string" && s.title.length > 0 ? s.title : "相談",
    messages: sanitizeStoredMessages(s.messages),
    createdAt: typeof s.createdAt === "string" ? s.createdAt : now,
    updatedAt: typeof s.updatedAt === "string" ? s.updatedAt : now,
  };
}

export function loadSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CHAT_SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const out: ChatSession[] = [];
    for (const item of parsed) {
      const clean = sanitizeSession(item);
      if (clean) out.push(clean);
    }
    return out;
  } catch {
    return [];
  }
}

/** localStorage にセッション一覧をそのまま書き込む（同期/再入なし）。 */
export function writeSessionsRaw(sessions: ChatSession[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      CHAT_SESSIONS_KEY,
      JSON.stringify(sessions.slice(0, MAX_SESSIONS)),
    );
  } catch {
    // quota 等 — UI はメモリ上の状態で動き続ける
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
  writeSessionsRaw(trimmed);
  // 同一アカウントの他端末へミラー（mock/未認証では no-op）。
  pushSession(session);
}

export function deleteSession(id: string) {
  if (typeof window === "undefined") return;
  const sessions = loadSessions().filter((s) => s.id !== id);
  writeSessionsRaw(sessions);
  // サーバー側からも削除（mock/未認証では no-op）。
  removeSessionRemote(id);
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
