// Team schedule helpers — マネージャー (ママ / 姉さん) の「チーム予定」カレンダー用。
//
// 配下キャストの予定を Google カレンダー風に色分け・ON/OFF して重ねるための
// 補助ロジックをまとめる。可視性 (どのレイヤーを表示するか) は localStorage に
// 永続化する。出勤シフトは現状 mock では本人端末のローカルにしか無いため、
// 配下キャスト分は deterministically に生成する (実 DB 連携時に差し替え)。

import type { ShiftEntry } from "./schedule-store";

/** 表示レイヤーの ON/OFF を記憶する localStorage キー。 */
export const TEAM_CAL_VISIBLE_KEY = "nightos.team-cal-visible.v1";

/** 「自分」(マネージャー本人) レイヤーの色 = bordeaux / wine-deep。最も濃く強調する。 */
export const OWN_LAYER_COLOR = "#5e3838";

/**
 * 配下キャストに割り当てるレイヤー色。サロン調のミュートカラーのみ。
 * Tailwind の legacy class を避けるため inline style で生 hex を使う。
 */
export const TEAM_LAYER_COLORS = [
  "#7a9477", // dusty sage (success)
  "#c8a063", // champagne (warning)
  "#9a5d5d", // wine (danger)
  "#6e8a9c", // dusty blue
  "#9a7bbb", // muted plum
  "#8c6f44", // brass / gold-mid
  "#b08968", // warm taupe
];

/** index 番目の配下キャストの色。色数を超えたら循環させる。 */
export function colorForCast(index: number): string {
  return TEAM_LAYER_COLORS[index % TEAM_LAYER_COLORS.length];
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** 保存済みの可視レイヤー id 配列。未保存なら null (= 既定で全表示)。 */
export function loadVisibleLayers(): string[] | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(TEAM_CAL_VISIBLE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : null;
  } catch {
    return null;
  }
}

export function saveVisibleLayers(ids: string[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(TEAM_CAL_VISIBLE_KEY, JSON.stringify(ids));
  } catch {}
}

// ───────────────────────── mock shift 生成 ─────────────────────────

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// 曜日 (0=日) の出勤パターン。キャストごとに hash で 1 つ選ぶ。
const SHIFT_PATTERNS: number[][] = [
  [2, 3, 5, 6], // 火・水・金・土
  [1, 4, 5, 6], // 月・木・金・土
  [0, 2, 4, 6], // 日・火・木・土
  [1, 3, 5, 6], // 月・水・金・土
];

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * 配下キャストの出勤シフト (mock)。指定した年月ぶんを deterministically に生成する。
 * 実 DB 連携時はここを per-cast の schedule クエリに差し替える。
 */
export function getMockShiftsForCast(
  castId: string,
  year: number,
  month: number, // 0-indexed
): ShiftEntry[] {
  const h = hashStr(castId);
  const pattern = SHIFT_PATTERNS[h % SHIFT_PATTERNS.length];
  const startHour = 19 + (h % 3); // 19:00 / 20:00 / 21:00
  const start = `${pad2(startHour)}:00`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const out: ShiftEntry[] = [];
  for (let d = 1; d <= lastDay; d++) {
    const dow = new Date(year, month, d).getDay();
    if (pattern.includes(dow)) {
      out.push({
        date: `${year}-${pad2(month + 1)}-${pad2(d)}`,
        status: "working",
        startTime: start,
        endTime: "01:00",
      });
    }
  }
  return out;
}
