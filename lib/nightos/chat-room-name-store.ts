// Room name override store — localStorage only. A room's display name is
// normally the channel name, or (for DMs/groups without one) the joined member
// names. Letting a cast rename a thread is a UI affordance that must also work
// for synthetic DM/group rooms that have no DB row, so we keep it client-side
// — same rationale as chat-room-pin-store.

const STORAGE_KEY = "nightos.chatRoomNames.v1";

type NameMap = Record<string, string>;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readAll(): NameMap {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as NameMap) : {};
  } catch {
    return {};
  }
}

function writeAll(map: NameMap): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

export function getRoomName(roomId: string): string | null {
  return readAll()[roomId] ?? null;
}

export function setRoomName(roomId: string, name: string): string {
  const trimmed = name.trim();
  const map = readAll();
  if (trimmed) {
    map[roomId] = trimmed;
  } else {
    delete map[roomId];
  }
  writeAll(map);
  return trimmed;
}

export function clearRoomName(roomId: string): void {
  const map = readAll();
  if (map[roomId]) {
    delete map[roomId];
    writeAll(map);
  }
}
