// Pinned chat rooms — localStorage store.
//
// "ピン留め" here means keeping a whole talk (room) pinned to the top of the
// チャット一覧. This is distinct from:
//   - chat-room-pin-store: pins a *customer* to a room (karte linkage)
//   - chat-pin-store:      keeps a single *message* into the キープ tab
//
// As with those stores, this stays client-side (localStorage) so it also works
// for synthetic DM/group rooms that have no DB row. We keep an ordered list of
// room ids (most-recently pinned first) so the list can stack pinned talks on
// top deterministically.

const STORAGE_KEY = "nightos.chatPinnedRooms.v1";
const EVENT = "nightos:chat-pinned-rooms-changed";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readAll(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

function writeAll(ids: string[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {}
}

/** Pinned room ids, most-recently pinned first. */
export function getPinnedRoomIds(): string[] {
  return readAll();
}

/** A set of pinned room ids, for cheap lookups in the room list. */
export function getPinnedRoomIdSet(): Set<string> {
  return new Set(readAll());
}

export function isRoomPinned(roomId: string): boolean {
  return readAll().includes(roomId);
}

export function pinRoom(roomId: string): void {
  const ids = readAll();
  if (ids.includes(roomId)) return;
  // Newest pin goes to the front so it sits on top of the stack.
  writeAll([roomId, ...ids]);
}

export function unpinRoom(roomId: string): void {
  const ids = readAll();
  if (!ids.includes(roomId)) return;
  writeAll(ids.filter((id) => id !== roomId));
}

/** Toggle a room's pinned state; returns the new state (true = pinned). */
export function toggleRoomPin(roomId: string): boolean {
  if (isRoomPinned(roomId)) {
    unpinRoom(roomId);
    return false;
  }
  pinRoom(roomId);
  return true;
}

/** Subscribe to pin changes (same-tab CustomEvent + cross-tab storage). */
export function subscribePinnedRooms(cb: () => void): () => void {
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
