// 顧客の名刺ストア — localStorage のみ。新規登録時の名刺は抽出してフォームに
// 反映するだけで、名刺そのものは保存していなかった。既存顧客のカルテからも
// 名刺を登録・あとから確認できるよう、顧客ごとに抽出結果と画像を保存する。
// 画像は容量が大きいので customer-photo-upload と同じく顧客単位のキーに分け、
// 1 件保存するたびに全件を再シリアライズしないようにする。

import type { ExtractedBusinessCard } from "@/features/customer-registration/components/business-card-upload";

const STORAGE_PREFIX = "nightos.businessCard.v1";

export interface StoredBusinessCard extends ExtractedBusinessCard {
  /** 読み取った名刺画像（data URL）。容量超過時は保存されないことがある。 */
  image: string | null;
  /** 登録（読み取り）した日時 ISO 文字列。 */
  capturedAt: string;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function keyFor(customerId: string): string {
  return `${STORAGE_PREFIX}.${customerId}`;
}

export function getBusinessCard(customerId: string): StoredBusinessCard | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(keyFor(customerId));
    return raw ? (JSON.parse(raw) as StoredBusinessCard) : null;
  } catch {
    return null;
  }
}

export function saveBusinessCard(
  customerId: string,
  card: StoredBusinessCard,
): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(keyFor(customerId), JSON.stringify(card));
  } catch {
    // 容量超過 — 画像を落として情報だけでも残す
    try {
      localStorage.setItem(
        keyFor(customerId),
        JSON.stringify({ ...card, image: null }),
      );
    } catch {}
  }
}

export function clearBusinessCard(customerId: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(keyFor(customerId));
  } catch {}
}
