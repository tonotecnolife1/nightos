// ═══════════════ 同伴データ共有ストア ═══════════════
// キャスト画面とママ・姉さん画面の両方から読み書きされる。
// localStorage ベース（MVP）、Supabase 化は後段で差し替え可能。
//
// - 初回ロード時は mockDouhans をシードとして展開する。
// - すべてのキャストの同伴が一つの key に保存される（cast_id で絞り込み）。
// - DouhanTracker はキャストの視点から自分の同伴だけ取り扱う。
// - ママ/姉さんの画面は配下のキャストの同伴を参照できる。

import type { Douhan } from "@/types/nightos";
import { mockDouhans } from "./mock-data";
import { isRealSession, pushSchedule } from "./schedule-sync";

export const DOUHANS_STORAGE_KEY = "nightos.douhans.v2";
const STORAGE_KEY = DOUHANS_STORAGE_KEY;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * 全キャストの同伴データを返す。
 *
 * mock / デモセッションでは初回に mockDouhans をシードして返す。
 * Supabase 認証済みセッション (isRealSession) では mock を一切シードせず、
 * サーバー (migration 014 / /api/cast-schedule) の pull で実データを流し込む。
 * SSR 時は mockDouhans をそのまま返す（localStorage 不可）。
 */
export function loadAllDouhans(): Douhan[] {
  if (!isBrowser()) return mockDouhans;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // 実アカウントと分かっている端末では mock をシードしない
      // (他人のダミー同伴が一瞬でも見えるのを防ぐ)。
      if (isRealSession()) return [];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockDouhans));
      return mockDouhans;
    }
    return JSON.parse(raw) as Douhan[];
  } catch {
    return mockDouhans;
  }
}

export function saveAllDouhans(list: Douhan[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore quota errors
  }
  // Mirror to the server so the cast's own douhans sync across devices
  // (migration 014). The server keeps only rows for the signed-in cast;
  // no-op for mock / unauthenticated sessions.
  void pushSchedule({ douhans: list });
}

export function loadDouhansForCast(castId: string): Douhan[] {
  return loadAllDouhans().filter((d) => d.cast_id === castId);
}

export function upsertDouhan(entry: Douhan): Douhan[] {
  const all = loadAllDouhans();
  const idx = all.findIndex((d) => d.id === entry.id);
  const next = [...all];
  if (idx >= 0) next[idx] = entry;
  else next.push(entry);
  saveAllDouhans(next);
  return next;
}

export function deleteDouhan(id: string): Douhan[] {
  const next = loadAllDouhans().filter((d) => d.id !== id);
  saveAllDouhans(next);
  return next;
}

/**
 * 指定キャストのキャンセル履歴を日付降順で返す。
 * ママ・姉さんが配下キャストを見る時に利用。
 */
export function loadCancelledDouhansForCast(castId: string): Douhan[] {
  return loadDouhansForCast(castId)
    .filter((d) => d.status === "cancelled")
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * 全キャストの「今月の」キャンセル件数を集計。
 * ママのホーム警告に使う。
 */
export function countThisMonthCancellationsByCast(
  today: Date,
): Record<string, number> {
  const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const counts: Record<string, number> = {};
  for (const d of loadAllDouhans()) {
    if (d.status === "cancelled" && d.date.startsWith(monthKey)) {
      counts[d.cast_id] = (counts[d.cast_id] ?? 0) + 1;
    }
  }
  return counts;
}
