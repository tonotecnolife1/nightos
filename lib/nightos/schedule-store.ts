// Shift schedule store — localStorage cache + server sync (migration 013).
// Stores which days a cast is working (出勤) or off (公休). Reads stay
// synchronous off localStorage; writes also mirror to Supabase so the
// same account stays consistent across devices.

import { pushSchedule } from "./schedule-sync";

export type ShiftStatus = "working" | "off" | "unknown";

export interface ShiftEntry {
  date: string; // YYYY-MM-DD
  status: ShiftStatus;
  startTime?: string; // HH:mm  e.g. "20:00"
  endTime?: string;   // HH:mm  e.g. "01:00"
  note?: string;
}

export const SCHEDULE_STORAGE_KEY = "nightos.schedule.v1";
const STORAGE_KEY = SCHEDULE_STORAGE_KEY;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadSchedule(): ShiftEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ShiftEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveSchedule(entries: ShiftEntry[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
  // Mirror to the server so the schedule syncs across devices (migration
  // 013). No-op for mock / unauthenticated sessions.
  void pushSchedule({ shifts: entries });
}

export function upsertShift(entry: ShiftEntry): void {
  const all = loadSchedule();
  const idx = all.findIndex((e) => e.date === entry.date);
  if (idx >= 0) {
    all[idx] = entry;
  } else {
    all.push(entry);
  }
  saveSchedule(all);
}

export function removeShift(date: string): void {
  const all = loadSchedule().filter((e) => e.date !== date);
  saveSchedule(all);
}

export function getShiftForDate(date: string): ShiftEntry | undefined {
  return loadSchedule().find((e) => e.date === date);
}

export function getUpcomingShifts(fromDate: string, count = 7): ShiftEntry[] {
  const all = loadSchedule();
  return all
    .filter((e) => e.date >= fromDate && e.status === "working")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, count);
}
