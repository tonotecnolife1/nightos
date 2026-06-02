// 学び (learnings) cache — localStorage store.
//
// The 学び tab asks the AI to read the cast's pinned messages and organise them
// into a handful of remember-this cards grouped by theme. Because that call
// costs a round-trip, we cache the result here keyed by a signature of the
// pins it was built from, so re-opening the tab is instant and we only
// re-organise when the pins actually changed.

export interface Learning {
  /** Customer this learning is about; null/「全般」 when it isn't tied to one. */
  customer?: string | null;
  category: string;
  title: string;
  body: string;
}

export interface LearningsSnapshot {
  learnings: Learning[];
  /** Signature of the pins this was built from (pin ids joined). */
  signature: string;
  generatedAt: string;
}

const STORAGE_KEY = "nightos.chatLearnings.v1";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getLearningsSnapshot(): LearningsSnapshot | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LearningsSnapshot) : null;
  } catch {
    return null;
  }
}

export function setLearningsSnapshot(snap: LearningsSnapshot): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
  } catch {}
}

/** Stable signature for a set of pins (id + memo + customer), order-independent. */
export function pinsSignature(
  pins: { id: string; memo?: string; customerId?: string | null }[],
): string {
  return pins
    .map((p) => `${p.id}:${p.memo ?? ""}:${p.customerId ?? ""}`)
    .sort()
    .join("|");
}
