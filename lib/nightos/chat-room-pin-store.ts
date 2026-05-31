// Room ↔ customer pin store — localStorage only (migration 017 added a
// per-message `customer_id`, but a *room-level* pin is a UI affordance that
// also needs to work for synthetic DM rooms that have no DB row). Pinning a
// customer to a room surfaces a karte shortcut in the header and makes new
// messages auto-link to that customer.

export interface RoomCustomerPin {
  customerId: string;
  customerName: string;
  pinnedAt: string; // ISO
}

const STORAGE_KEY = "nightos.chatRoomPins.v1";

type PinMap = Record<string, RoomCustomerPin>;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readAll(): PinMap {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PinMap) : {};
  } catch {
    return {};
  }
}

function writeAll(map: PinMap): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

export function getRoomPin(roomId: string): RoomCustomerPin | null {
  return readAll()[roomId] ?? null;
}

export function setRoomPin(
  roomId: string,
  customer: { id: string; name: string },
): RoomCustomerPin {
  const map = readAll();
  const pin: RoomCustomerPin = {
    customerId: customer.id,
    customerName: customer.name,
    pinnedAt: new Date().toISOString(),
  };
  map[roomId] = pin;
  writeAll(map);
  return pin;
}

export function clearRoomPin(roomId: string): void {
  const map = readAll();
  if (map[roomId]) {
    delete map[roomId];
    writeAll(map);
  }
}
