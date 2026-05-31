// Plan store — localStorage-based MVP.
// 1日に複数登録できる「予定」(同伴 / アフター / 私用 等)。
// 出勤シフト (ShiftEntry, schedule-store) とは別軸で、ホーム画面の
// 出勤判定には影響しない。

export interface PlanEntry {
  id: string;
  castId: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm — 未指定は「終日 / 時刻未定」扱い
  title: string;
  note?: string;
}

const STORAGE_KEY = "nightos.plans.v1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadPlans(): PlanEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PlanEntry[]) : [];
  } catch {
    return [];
  }
}

export function savePlans(list: PlanEntry[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export function loadPlansForCast(castId: string): PlanEntry[] {
  return loadPlans().filter((p) => p.castId === castId);
}

function newId(): string {
  if (isBrowser() && typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `plan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** id ありで既存更新 / id なしで新規追加。更新後の全件を返す。 */
export function upsertPlan(
  entry: Omit<PlanEntry, "id"> & { id?: string },
): PlanEntry[] {
  const all = loadPlans();
  if (entry.id) {
    const idx = all.findIndex((p) => p.id === entry.id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...entry, id: entry.id };
    } else {
      all.push({ ...entry, id: entry.id } as PlanEntry);
    }
  } else {
    all.push({ ...entry, id: newId() } as PlanEntry);
  }
  savePlans(all);
  return all;
}

export function deletePlan(id: string): PlanEntry[] {
  const all = loadPlans().filter((p) => p.id !== id);
  savePlans(all);
  return all;
}
