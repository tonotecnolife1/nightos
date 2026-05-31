// ═══════════════ Cast schedule cross-device sync ═══════════════
// Client-side glue between the synchronous localStorage stores
// (schedule-store / plan-store) and the server (migration 013, via
// /api/cast-schedule). Keeps reads synchronous off localStorage while
// mirroring writes to Supabase so the same account stays consistent
// across devices.
//
// Behavior:
//   - pullCastSchedule(): hydrate the localStorage cache from the
//     server on mount. No-op (returns false) for mock / unauthenticated
//     sessions, so local dev & demos stay fully offline.
//   - pushSchedule(): debounced mirror of a save to the server.
//
// Server is treated as authoritative on load, except we never clobber a
// local edit the user made while the pull was in flight.

import type { ShiftEntry } from "./schedule-store";
import { SCHEDULE_STORAGE_KEY } from "./schedule-store";
import type { PlanEntry } from "./plan-store";
import { PLANS_STORAGE_KEY } from "./plan-store";

interface SchedulePayload {
  shifts?: ShiftEntry[];
  plans?: PlanEntry[];
}

interface PullResponse {
  authenticated: boolean;
  castId?: string;
  shifts?: ShiftEntry[];
  plans?: PlanEntry[];
}

const ENDPOINT = "/api/cast-schedule";

// null = unknown (not pulled yet). false = confirmed mock/offline, skip
// network. true = real authenticated session, mirror writes.
let syncActive: boolean | null = null;
let lastPushAt = 0;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// ── Debounced push ──────────────────────────────────────────────
let pendingPush: SchedulePayload = {};
let pushTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Mirror a save to the server. Fire-and-forget and debounced so a burst
 * of edits collapses into one round trip. Skipped entirely once we know
 * the session is mock/offline.
 */
export function pushSchedule(payload: SchedulePayload): void {
  if (!isBrowser() || syncActive === false) return;

  if (payload.shifts) pendingPush.shifts = payload.shifts;
  if (payload.plans) pendingPush.plans = payload.plans;
  lastPushAt = Date.now();

  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(flushPush, 400);
}

async function flushPush(): Promise<void> {
  pushTimer = null;
  const body = pendingPush;
  pendingPush = {};
  if (!body.shifts && !body.plans) return;

  try {
    const res = await fetch(ENDPOINT, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    // 401 => mock/unauthenticated. Remember it so later saves skip the net.
    if (res.status === 401) {
      syncActive = false;
      return;
    }
    if (res.ok) syncActive = true;
  } catch {
    // Offline / transient — the localStorage cache already holds the edit,
    // and the next successful pull/push will reconcile.
  }
}

// ── Pull / hydrate ──────────────────────────────────────────────

/**
 * Hydrate the localStorage cache from the server. Returns true when
 * server data was applied (the caller should re-read the stores to
 * refresh the UI), false for mock/offline sessions or on error.
 */
export async function pullCastSchedule(): Promise<boolean> {
  if (!isBrowser()) return false;

  const pullStartedAt = Date.now();
  let data: PullResponse;
  try {
    const res = await fetch(ENDPOINT, { method: "GET" });
    if (!res.ok) return false;
    data = (await res.json()) as PullResponse;
  } catch {
    return false;
  }

  if (!data.authenticated) {
    syncActive = false;
    return false;
  }
  syncActive = true;

  // Don't overwrite a local edit the user made while this pull was in
  // flight — that edit was already pushed and is newer than the snapshot.
  if (lastPushAt > pullStartedAt) return false;

  applyServerData(data);
  return true;
}

/** Write server data into the localStorage cache without re-triggering a push. */
function applyServerData(data: PullResponse): void {
  try {
    if (data.shifts) {
      localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(data.shifts));
    }
    if (data.plans) {
      // Plans are stored across all casts in one key; replace only the
      // signed-in cast's entries, preserving any other cached casts.
      const merged = mergeCastPlans(readPlans(), data.plans, data.castId);
      localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(merged));
    }
  } catch {
    // Cache write failed (quota/parse) — UI will fall back to local data.
  }
}

/**
 * Replace the signed-in cast's plans with the server's set while keeping
 * any other casts' cached plans intact. When `castId` is unknown we can't
 * tell entries apart, so the server set wins wholesale.
 */
export function mergeCastPlans(
  existing: PlanEntry[],
  serverPlans: PlanEntry[],
  castId: string | undefined,
): PlanEntry[] {
  if (!castId) return serverPlans;
  const others = existing.filter((p) => p.castId !== castId);
  return [...others, ...serverPlans];
}

function readPlans(): PlanEntry[] {
  try {
    const raw = localStorage.getItem(PLANS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PlanEntry[]) : [];
  } catch {
    return [];
  }
}
