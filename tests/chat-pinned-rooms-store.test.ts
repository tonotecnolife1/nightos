import { beforeEach, describe, expect, it } from "vitest";

// node 環境には window / localStorage が無いので最小スタブを差し込む。
class MemoryStorage {
  private store = new Map<string, string>();
  getItem(k: string) {
    return this.store.has(k) ? this.store.get(k)! : null;
  }
  setItem(k: string, v: string) {
    this.store.set(k, v);
  }
  removeItem(k: string) {
    this.store.delete(k);
  }
  clear() {
    this.store.clear();
  }
}

const storage = new MemoryStorage();
globalThis.localStorage = storage as unknown as Storage;
// dispatchEvent/addEventListener はノーオペでよい（購読は別途テスト不要）。
globalThis.window = {
  localStorage: storage,
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {},
} as unknown as Window & typeof globalThis;

import {
  getPinnedRoomIds,
  getPinnedRoomIdSet,
  isRoomPinned,
  pinRoom,
  toggleRoomPin,
  unpinRoom,
} from "@/lib/nightos/chat-pinned-rooms-store";

describe("chat-pinned-rooms-store", () => {
  beforeEach(() => storage.clear());

  it("空のときは何もピンされていない", () => {
    expect(getPinnedRoomIds()).toEqual([]);
    expect(isRoomPinned("room1")).toBe(false);
  });

  it("ピン留めすると最前面に積まれる（新しい順）", () => {
    pinRoom("room1");
    pinRoom("room2");
    expect(getPinnedRoomIds()).toEqual(["room2", "room1"]);
    expect(isRoomPinned("room1")).toBe(true);
    expect(getPinnedRoomIdSet().has("room2")).toBe(true);
  });

  it("同じ部屋を二重にピンしても重複しない", () => {
    pinRoom("room1");
    pinRoom("room1");
    expect(getPinnedRoomIds()).toEqual(["room1"]);
  });

  it("ピンを解除できる", () => {
    pinRoom("room1");
    pinRoom("room2");
    unpinRoom("room1");
    expect(getPinnedRoomIds()).toEqual(["room2"]);
    expect(isRoomPinned("room1")).toBe(false);
  });

  it("toggle は状態を反転し、新しい状態を返す", () => {
    expect(toggleRoomPin("room1")).toBe(true);
    expect(isRoomPinned("room1")).toBe(true);
    expect(toggleRoomPin("room1")).toBe(false);
    expect(isRoomPinned("room1")).toBe(false);
  });
});
