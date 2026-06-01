"use client";

/**
 * 顧客プロフィール変更「提案」と履歴を localStorage で管理。
 * 将来 Supabase 移行時はそのまま customer_profile_change_requests へ移植できる。
 *
 * 背景: ヘルプ（接客しただけで担当でもマスターでもないキャスト）は共有プロフィールを
 * 直接編集できず「提案」までとする (docs/master-vs-help-customers.md / UI改善C・Q6)。
 *
 * - 提案: ヘルプが出す → 顧客のマスター/担当（不在ならオーナー）の承認待ちへ
 * - 承認: 差分を適用 (profile override) + 履歴に追加
 * - 却下: 履歴に "rejected" として記録
 */

import type { CustomerProfileEdit } from "@/features/customer-card/actions";

const REQUESTS_KEY = "nightos.profile-change-requests";
const HISTORY_KEY = "nightos.profile-change-history";
const OVERRIDE_KEY = "nightos.profile-overrides";

export type ProfileRequestStatus = "pending" | "approved" | "rejected" | "applied";

/** 提案で扱う項目（name は同定の核なので提案対象外＝必須・不変扱い）。 */
export type ProfileChangeField = Exclude<keyof CustomerProfileEdit, "name">;

/** 1項目の差分 */
export interface ProfileFieldDiff {
  from: string | null;
  to: string | null;
}

export type ProfileChangeSet = Partial<Record<ProfileChangeField, ProfileFieldDiff>>;

export interface ProfileChangeRequest {
  id: string;
  customerId: string;
  customerName: string;
  /** 差分のみ。{ 項目: { from, to } } */
  changes: ProfileChangeSet;
  requestedByCastId: string;
  requestedByName: string;
  /** 一次承認者（マスター優先・無ければ担当）。null = オーナーへフォールバック */
  approverCastId: string | null;
  reason: string | null;
  status: ProfileRequestStatus;
  requestedAt: string;
  resolvedAt: string | null;
  resolvedByName: string | null;
}

export interface ProfileChangeHistoryEntry {
  id: string;
  customerId: string;
  customerName: string;
  changes: ProfileChangeSet;
  changedByCastId: string;
  changedByName: string;
  /** "approved" (提案承認) or "rejected" */
  mode: "approved" | "rejected";
  changedAt: string;
  reason: string | null;
}

// ─────── Requests ───────

export function loadProfileRequests(): ProfileChangeRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(REQUESTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ProfileChangeRequest[];
  } catch {
    return [];
  }
}

function saveProfileRequests(list: ProfileChangeRequest[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REQUESTS_KEY, JSON.stringify(list));
}

export function addProfileChangeRequest(
  input: Omit<
    ProfileChangeRequest,
    "id" | "status" | "requestedAt" | "resolvedAt" | "resolvedByName"
  >,
): ProfileChangeRequest {
  const req: ProfileChangeRequest = {
    ...input,
    id: `pcr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status: "pending",
    requestedAt: new Date().toISOString(),
    resolvedAt: null,
    resolvedByName: null,
  };
  const list = loadProfileRequests();
  list.push(req);
  saveProfileRequests(list);
  return req;
}

/**
 * 承認待ちの提案を返す。
 * approverCastId を渡すと「自分宛て（マスター/担当）」のみに絞る。
 * 省略時は全件（オーナーが全提案を見る用途）。
 */
export function listPendingProfileRequests(
  approverCastId?: string,
): ProfileChangeRequest[] {
  return loadProfileRequests().filter(
    (r) =>
      r.status === "pending" &&
      (approverCastId === undefined ||
        r.approverCastId === approverCastId ||
        r.approverCastId === null),
  );
}

/** 指定顧客に紐づく承認待ち提案。カルテ内インライン承認用。 */
export function listPendingProfileRequestsForCustomer(
  customerId: string,
): ProfileChangeRequest[] {
  return loadProfileRequests().filter(
    (r) => r.status === "pending" && r.customerId === customerId,
  );
}

export function resolveProfileRequest(
  id: string,
  resolution: "approve" | "reject",
  resolvedByName: string,
): ProfileChangeRequest | null {
  const list = loadProfileRequests();
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  const req = list[idx];
  const updated: ProfileChangeRequest = {
    ...req,
    status: resolution === "approve" ? "applied" : "rejected",
    resolvedAt: new Date().toISOString(),
    resolvedByName,
  };
  list[idx] = updated;

  if (resolution === "approve") {
    applyProfileOverride(req.customerId, req.changes);
    // 同一顧客・同一項目の他 pending は自動却下（競合提案の解消）
    const changedFields = Object.keys(req.changes) as ProfileChangeField[];
    for (let i = 0; i < list.length; i++) {
      const other = list[i];
      if (other.id === req.id) continue;
      if (other.status !== "pending") continue;
      if (other.customerId !== req.customerId) continue;
      const overlaps = Object.keys(other.changes).some((f) =>
        changedFields.includes(f as ProfileChangeField),
      );
      if (overlaps) {
        list[i] = {
          ...other,
          status: "rejected",
          resolvedAt: new Date().toISOString(),
          resolvedByName,
        };
      }
    }
  }
  saveProfileRequests(list);

  addProfileHistoryEntry({
    customerId: req.customerId,
    customerName: req.customerName,
    changes: req.changes,
    changedByCastId: req.requestedByCastId,
    changedByName: req.requestedByName,
    mode: resolution === "approve" ? "approved" : "rejected",
    reason: req.reason,
  });

  return updated;
}

// ─────── History ───────

export function loadProfileHistory(
  customerId?: string,
): ProfileChangeHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as ProfileChangeHistoryEntry[];
    return customerId ? all.filter((h) => h.customerId === customerId) : all;
  } catch {
    return [];
  }
}

function saveProfileHistory(list: ProfileChangeHistoryEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}

export function addProfileHistoryEntry(
  input: Omit<ProfileChangeHistoryEntry, "id" | "changedAt">,
): ProfileChangeHistoryEntry {
  const entry: ProfileChangeHistoryEntry = {
    ...input,
    id: `phist_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    changedAt: new Date().toISOString(),
  };
  const list = loadProfileHistory();
  list.push(entry);
  const trimmed = list.slice(-500);
  saveProfileHistory(trimmed);
  return entry;
}

// ─────── Local override (applied profile changes) ───────
// mockCustomers を UI から直接変更できないため、承認済みの差分を
// override マップに保持し、カルテ側が mock データの上にマージして表示する。

/** customerId → 適用済みフィールド値 */
export type ProfileOverrideMap = Record<string, Partial<Record<ProfileChangeField, string | null>>>;

export function loadProfileOverrides(): ProfileOverrideMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(OVERRIDE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProfileOverrideMap;
  } catch {
    return {};
  }
}

export function applyProfileOverride(customerId: string, changes: ProfileChangeSet) {
  if (typeof window === "undefined") return;
  const map = loadProfileOverrides();
  const current = map[customerId] ?? {};
  for (const [field, diff] of Object.entries(changes)) {
    if (!diff) continue;
    current[field as ProfileChangeField] = diff.to;
  }
  map[customerId] = current;
  window.localStorage.setItem(OVERRIDE_KEY, JSON.stringify(map));
}

// ─────── Helpers ───────

const PROFILE_FIELD_LABELS: Record<ProfileChangeField, string> = {
  name_kana: "ふりがな",
  nickname: "呼び名",
  birthday: "誕生日",
  job: "職業",
  favorite_drink: "好きな飲み物",
  region: "エリア",
};

export function profileFieldLabel(field: ProfileChangeField): string {
  return PROFILE_FIELD_LABELS[field] ?? field;
}

/**
 * 現在値と提案値から差分セットを作る（変化のある項目のみ）。
 * name は提案対象外なので無視する。
 */
export function buildProfileChangeSet(
  current: Pick<CustomerProfileEdit, ProfileChangeField>,
  next: Pick<CustomerProfileEdit, ProfileChangeField>,
): ProfileChangeSet {
  const fields: ProfileChangeField[] = [
    "name_kana",
    "nickname",
    "birthday",
    "job",
    "favorite_drink",
    "region",
  ];
  const changes: ProfileChangeSet = {};
  for (const f of fields) {
    const from = current[f] ?? null;
    const to = next[f] ?? null;
    if (from !== to) changes[f] = { from, to };
  }
  return changes;
}
