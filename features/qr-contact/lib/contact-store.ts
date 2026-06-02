"use client";

/**
 * QR で交換した連絡先を localStorage に保存するストア。
 * モックデータには永続層がないので、交換した相手はこのストアに溜まる。
 * 他タブ / 他コンポーネントへ反映するため CustomEvent で購読できる。
 */

import type { ContactPayload } from "./contact-payload";

const KEY = "nightos.qr-contacts.v1";
const EVENT = "nightos:qr-contacts-changed";

export interface ExchangedContact {
  id: string;
  name: string;
  role?: string;
  store?: string;
  note?: string;
  /** 交換日時 (ISO)。 */
  exchangedAt: string;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function load(): ExchangedContact[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ExchangedContact[]) : [];
  } catch {
    return [];
  }
}

function save(contacts: ExchangedContact[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(contacts));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    // quota 等は黙って無視。
  }
}

/** 交換日時の新しい順で一覧を返す。 */
export function listContacts(): ExchangedContact[] {
  return load().sort((a, b) => b.exchangedAt.localeCompare(a.exchangedAt));
}

export function getContact(id: string): ExchangedContact | null {
  return load().find((c) => c.id === id) ?? null;
}

export function hasContact(id: string): boolean {
  return load().some((c) => c.id === id);
}

/**
 * ペイロードから連絡先を追加 / 更新する。
 * 既に同じ ID があれば交換日時はそのままに、プロフィールだけ最新化する。
 */
export function upsertContactFromPayload(
  payload: ContactPayload,
): ExchangedContact {
  const all = load();
  const existing = all.find((c) => c.id === payload.id);
  const entry: ExchangedContact = {
    id: payload.id,
    name: payload.name,
    role: payload.role,
    store: payload.store,
    note: payload.note,
    exchangedAt: existing?.exchangedAt ?? new Date().toISOString(),
  };
  const next = existing
    ? all.map((c) => (c.id === payload.id ? entry : c))
    : [...all, entry];
  save(next);
  return entry;
}

export function removeContact(id: string): void {
  save(load().filter((c) => c.id !== id));
}

/** 一覧の変化を購読する。返り値を呼ぶと解除。 */
export function subscribeContacts(listener: () => void): () => void {
  if (!isBrowser()) return () => {};
  const onChange = () => listener();
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
