// 学びストック (stocked learnings) — localStorage store.
//
// The 学び tab shows AI-organised cards built from the current pins, and that
// snapshot is overwritten every time the cast taps 整理し直す. To keep the good
// ones, the cast can ストック (stock) a card here. Stocked learnings live in
// their own bucket so they survive re-organising and pin changes.

import type { Learning } from "./chat-learnings-store";

export interface StockedLearning extends Learning {
  /** Stable id derived from the learning content. */
  id: string;
  /** When it was stocked (ISO). */
  stockedAt: string;
}

const STORAGE_KEY = "nightos.learningStock.v1";
const EVENT = "nightos:learning-stock-changed";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Stable key for a learning, so the same card toggles consistently. */
export function learningKey(l: Learning): string {
  return [l.customer ?? "", l.category, l.title, l.body].join("|").trim();
}

function readAll(): StockedLearning[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StockedLearning[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: StockedLearning[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {}
}

/** All stocked learnings, newest stocked first. */
export function getStockedLearnings(): StockedLearning[] {
  return readAll().sort(
    (a, b) => new Date(b.stockedAt).getTime() - new Date(a.stockedAt).getTime(),
  );
}

/** A live set of stocked learning ids, for cheap lookups in the card list. */
export function getStockedIds(): Set<string> {
  return new Set(readAll().map((s) => s.id));
}

export function isStocked(learning: Learning): boolean {
  const id = learningKey(learning);
  return readAll().some((s) => s.id === id);
}

/** Add a learning to the stock (no-op if already there). */
export function stockLearning(learning: Learning): StockedLearning {
  const list = readAll();
  const id = learningKey(learning);
  const existing = list.find((s) => s.id === id);
  if (existing) return existing;
  const stocked: StockedLearning = {
    id,
    customer: learning.customer ?? null,
    category: learning.category,
    title: learning.title,
    body: learning.body,
    stockedAt: new Date().toISOString(),
  };
  writeAll([...list, stocked]);
  return stocked;
}

export function unstockLearning(id: string): void {
  const list = readAll();
  if (list.some((s) => s.id === id)) {
    writeAll(list.filter((s) => s.id !== id));
  }
}

/** Toggle stock state for a learning; returns true if now stocked. */
export function toggleStock(learning: Learning): boolean {
  if (isStocked(learning)) {
    unstockLearning(learningKey(learning));
    return false;
  }
  stockLearning(learning);
  return true;
}

/** Subscribe to stock changes (same-tab CustomEvent + cross-tab storage). */
export function subscribeStock(cb: () => void): () => void {
  if (!isBrowser()) return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}
