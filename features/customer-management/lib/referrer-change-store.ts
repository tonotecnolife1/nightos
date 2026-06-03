"use client";

/**
 * 顧客の紹介者（referred_by_customer_id）変更申請を localStorage で管理。
 * 将来 Supabase 移行時はそのまま customer_referrer_change_requests へ移植できる。
 *
 * 背景: 紹介者は「誰がこのお客様を連れてきたか」という売上配分にも関わる情報なので、
 * 登録後の付け替えは紹介者側の担当キャストの承認を必須とする。
 *
 * - 申請: 顧客の担当が「紹介者を変更したい」→ 紹介者の担当（不在ならオーナー）の承認待ちへ
 * - 承認: override に適用（カルテ側が mock データの上にマージして表示）
 * - 却下: status を rejected にして記録
 *
 * NOTE: 実チャット送信（紹介者の担当への通知）は本実装ではスタブ。
 *       UI 上の「依頼を送信しました」フィードバックのみで、Supabase 移行時に
 *       team-chat の sendCastRequest と接続する想定。
 */

const REQUESTS_KEY = "nightos.referrer-change-requests";
const OVERRIDE_KEY = "nightos.referrer-overrides";

export type ReferrerRequestStatus = "pending" | "applied" | "rejected";

export interface ReferrerChangeRequest {
  id: string;
  customerId: string;
  customerName: string;
  fromReferrerId: string | null;
  fromReferrerName: string | null;
  toReferrerId: string | null;
  toReferrerName: string | null;
  requestedByCastId: string;
  requestedByName: string;
  /** 紹介者の担当（変更先優先・無ければ変更元）。null = オーナーへフォールバック */
  approverCastId: string | null;
  approverName: string | null;
  reason: string | null;
  status: ReferrerRequestStatus;
  requestedAt: string;
  resolvedAt: string | null;
  resolvedByName: string | null;
}

// ─────── Requests ───────

export function loadReferrerRequests(): ReferrerChangeRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(REQUESTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ReferrerChangeRequest[];
  } catch {
    return [];
  }
}

function saveReferrerRequests(list: ReferrerChangeRequest[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REQUESTS_KEY, JSON.stringify(list));
}

export function addReferrerChangeRequest(
  input: Omit<
    ReferrerChangeRequest,
    "id" | "status" | "requestedAt" | "resolvedAt" | "resolvedByName"
  >,
): ReferrerChangeRequest {
  const req: ReferrerChangeRequest = {
    ...input,
    id: `rcr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status: "pending",
    requestedAt: new Date().toISOString(),
    resolvedAt: null,
    resolvedByName: null,
  };
  // 同一顧客の既存 pending は重複なので破棄（最新の依頼で上書き）
  const list = loadReferrerRequests().filter(
    (r) => !(r.status === "pending" && r.customerId === req.customerId),
  );
  list.push(req);
  saveReferrerRequests(list);
  return req;
}

/** 指定顧客に紐づく承認待ち申請（カルテ内インライン用）。 */
export function listPendingReferrerRequestsForCustomer(
  customerId: string,
): ReferrerChangeRequest[] {
  return loadReferrerRequests().filter(
    (r) => r.status === "pending" && r.customerId === customerId,
  );
}

export function resolveReferrerRequest(
  id: string,
  resolution: "approve" | "reject",
  resolvedByName: string,
): ReferrerChangeRequest | null {
  const list = loadReferrerRequests();
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  const req = list[idx];
  const updated: ReferrerChangeRequest = {
    ...req,
    status: resolution === "approve" ? "applied" : "rejected",
    resolvedAt: new Date().toISOString(),
    resolvedByName,
  };
  list[idx] = updated;
  if (resolution === "approve") {
    setReferrerOverride(req.customerId, req.toReferrerId);
  }
  saveReferrerRequests(list);
  return updated;
}

// ─────── Local override (applied referrer changes) ───────
// mockCustomers を UI から直接変更できないため、承認済みの値を
// override マップに保持し、カルテ側が mock データの上にマージして表示する。

export function loadReferrerOverrides(): Record<string, string | null> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(OVERRIDE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string | null>;
  } catch {
    return {};
  }
}

export function setReferrerOverride(
  customerId: string,
  referrerId: string | null,
) {
  if (typeof window === "undefined") return;
  const map = loadReferrerOverrides();
  map[customerId] = referrerId;
  window.localStorage.setItem(OVERRIDE_KEY, JSON.stringify(map));
}
