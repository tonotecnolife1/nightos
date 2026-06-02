// Kept (キープ) chat messages — localStorage store.
//
// A "キープ" is a single important message bubble that the cast long-pressed
// and chose to keep. Unlike `chat-room-pin-store` (which pins a *customer* to a
// whole room), this keeps a snapshot of one message plus an optional customer
// link and a free-text memo. These accumulate in the キープ tab and feed the
// 学び (AI-organised learnings) view.
//
// Note: internal identifiers still use "pin" for continuity; the user-facing
// label is キープ (renamed to avoid clashing with LINE-style トーク/メッセージのピン留め).

export interface PinnedMessage {
  /** Stable id for this pin (derived from the message id). */
  id: string;
  messageId: string;
  roomId: string;
  /** Room display name at keep time (for the キープ list). */
  roomName: string;
  /** Snapshot of the message text. */
  content: string;
  senderName: string;
  /** When the original message was sent (ISO). */
  messageAt: string;
  /** When it was pinned (ISO). */
  pinnedAt: string;
  customerId?: string | null;
  customerName?: string | null;
  /** Free-text memo the cast attached when pinning. */
  memo?: string;
}

const STORAGE_KEY = "nightos.chatPins.v1";
const EVENT = "nightos:chat-pins-changed";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readAll(): PinnedMessage[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PinnedMessage[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: PinnedMessage[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {}
}

/** All pins, newest pinned first. */
export function getPinnedMessages(): PinnedMessage[] {
  return readAll().sort(
    (a, b) => new Date(b.pinnedAt).getTime() - new Date(a.pinnedAt).getTime(),
  );
}

export function getPin(messageId: string): PinnedMessage | null {
  return readAll().find((p) => p.messageId === messageId) ?? null;
}

export function isPinned(messageId: string): boolean {
  return readAll().some((p) => p.messageId === messageId);
}

/** A live set of pinned message ids, for cheap lookups in the message list. */
export function getPinnedIds(): Set<string> {
  return new Set(readAll().map((p) => p.messageId));
}

/**
 * Create or update a pin for a message. Passing `customerId`/`memo` overwrites
 * the previous values; omit them to keep what was there.
 */
export function upsertPin(
  input: Omit<PinnedMessage, "id" | "pinnedAt"> &
    Partial<Pick<PinnedMessage, "pinnedAt">>,
): PinnedMessage {
  const list = readAll();
  const existing = list.find((p) => p.messageId === input.messageId);
  const pin: PinnedMessage = {
    id: input.messageId,
    messageId: input.messageId,
    roomId: input.roomId,
    roomName: input.roomName,
    content: input.content,
    senderName: input.senderName,
    messageAt: input.messageAt,
    pinnedAt: input.pinnedAt ?? existing?.pinnedAt ?? new Date().toISOString(),
    customerId: input.customerId ?? existing?.customerId ?? null,
    customerName: input.customerName ?? existing?.customerName ?? null,
    memo: input.memo ?? existing?.memo ?? "",
  };
  const next = existing
    ? list.map((p) => (p.messageId === input.messageId ? pin : p))
    : [...list, pin];
  writeAll(next);
  return pin;
}

export function removePin(messageId: string): void {
  const list = readAll();
  if (list.some((p) => p.messageId === messageId)) {
    writeAll(list.filter((p) => p.messageId !== messageId));
  }
}

/** Subscribe to pin changes (same-tab CustomEvent + cross-tab storage). */
export function subscribePins(cb: () => void): () => void {
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
