"use client";

// ═══════════════ さくらママ 相談履歴のクロスデバイス同期 ═══════════════
// chat-session-store（同期的な localStorage 読み書き）と
// /api/cast-chat-sessions（migration 020）の間をつなぐクライアント glue。
// 読みは localStorage から同期的に保ったまま、書きをサーバーへミラーし、
// 同一アカウントなら端末をまたいで相談履歴が整合するようにする。
//
// 方針:
//   - pullChatSessions(): mount 時にサーバーから取り込み、ローカルと
//     id 単位で union マージして両端末の履歴を失わない。mock / 未認証
//     セッションでは何もしない（ローカル開発 / デモは完全オフライン）。
//   - pushSession(): 保存のたびに該当セッションをサーバーへ debounce ミラー。
//   - removeSessionRemote(): 削除をサーバーへ反映。
//
// 同期は「履歴という資産を失わない」ことを最優先にし、衝突時は
// updatedAt の新しい方を採用しつつ、id の和集合を常に残す。

import {
  loadSessions,
  writeSessionsRaw,
  type ChatSession,
} from "./chat-session-store";

const ENDPOINT = "/api/cast-chat-sessions";

// chat-session-store の MAX_SESSIONS と揃える（同期で増えすぎないよう上限）。
const MAX_SYNC_SESSIONS = 50;

// schedule-sync と共有するフラグ。一度でも本物の Supabase セッションを
// 確認したら、以降の端末でネットワークを試みる。
const REAL_SESSION_KEY = "nightos.sync.real";

// null = 未確認。false = mock/オフライン確定（ネットを叩かない）。
// true = 本物の認証セッション（ミラーする）。
let syncActive: boolean | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function markRealSession(): void {
  syncActive = true;
  try {
    localStorage.setItem(REAL_SESSION_KEY, "1");
  } catch {
    // quota — メモリ上のフラグだけでこのロードは動く
  }
}

/**
 * ローカルとサーバーのセッションを id で union マージする。
 * 同じ id は updatedAt の新しい方を採用。どちらか一方にしかない id は
 * そのまま残す（端末をまたいだ履歴を失わないため）。
 */
export function mergeSessionsById(
  local: ChatSession[],
  server: ChatSession[],
): ChatSession[] {
  const byId = new Map<string, ChatSession>();
  for (const s of [...local, ...server]) {
    const existing = byId.get(s.id);
    if (!existing || s.updatedAt.localeCompare(existing.updatedAt) > 0) {
      byId.set(s.id, s);
    }
  }
  return Array.from(byId.values()).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

// ── Debounced push ──────────────────────────────────────────────
const pending = new Map<string, ChatSession>();
let pushTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * セッションの保存をサーバーへミラーする。fire-and-forget かつ debounce。
 * mock/オフライン確定後は完全にスキップ。
 */
export function pushSession(session: ChatSession): void {
  if (!isBrowser() || syncActive === false) return;
  pending.set(session.id, session);
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(flushPush, 600);
}

async function flushPush(): Promise<void> {
  pushTimer = null;
  if (pending.size === 0) return;
  const sessions = Array.from(pending.values());
  pending.clear();
  await putSessions(sessions);
}

async function putSessions(sessions: ChatSession[]): Promise<void> {
  if (sessions.length === 0) return;
  try {
    const res = await fetch(ENDPOINT, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessions }),
    });
    if (res.status === 401) {
      syncActive = false; // mock/未認証 — 以降ネットを叩かない
      return;
    }
    if (res.ok) markRealSession();
  } catch {
    // オフライン / 一時障害 — localStorage には既に保存済みで、
    // 次の pull/push で整合する。
  }
}

/** セッションをサーバーから削除する。fire-and-forget。 */
export function removeSessionRemote(id: string): void {
  if (!isBrowser() || syncActive === false) return;
  // まだ送っていない pending からも除く
  pending.delete(id);
  void (async () => {
    try {
      const res = await fetch(ENDPOINT, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.status === 401) {
        syncActive = false;
        return;
      }
      if (res.ok) markRealSession();
    } catch {
      // 次回の pull では既にローカルから消えているので大きな問題はない
    }
  })();
}

// ── Pull / hydrate ──────────────────────────────────────────────

interface PullResponse {
  authenticated: boolean;
  castId?: string;
  sessions?: ChatSession[];
}

/**
 * サーバーから相談履歴を取り込み、ローカルと union マージして
 * localStorage を更新する。返り値はマージ後のセッション一覧（呼び出し側は
 * これで一覧を再描画する）。mock/オフライン/エラー時は null。
 *
 * マージ後、サーバーに無い / ローカルの方が新しいセッションはサーバーへ
 * 押し戻し、サーバー側も両端末の和集合へ収束させる。
 */
export async function pullChatSessions(): Promise<ChatSession[] | null> {
  if (!isBrowser()) return null;

  let data: PullResponse;
  try {
    const res = await fetch(ENDPOINT, { method: "GET" });
    if (!res.ok) return null;
    data = (await res.json()) as PullResponse;
  } catch {
    return null;
  }

  if (!data.authenticated) {
    syncActive = false;
    return null;
  }
  markRealSession();

  const local = loadSessions();
  const server = Array.isArray(data.sessions) ? data.sessions : [];
  // 新しい順に上限件数まで残す（store の MAX_SESSIONS と揃える）。
  const merged = mergeSessionsById(local, server).slice(0, MAX_SYNC_SESSIONS);

  // ローカルに反映。
  writeSessionsRaw(merged);

  // サーバーに無い / ローカルが新しいものを押し戻してサーバーも収束させる。
  const serverById = new Map(server.map((s) => [s.id, s]));
  const toPush = merged.filter((m) => {
    const s = serverById.get(m.id);
    return !s || m.updatedAt.localeCompare(s.updatedAt) > 0;
  });
  if (toPush.length > 0) void putSessions(toPush);

  // 返り値は loadSessions 経由で sanitize 済みの形にそろえる。
  return loadSessions();
}
