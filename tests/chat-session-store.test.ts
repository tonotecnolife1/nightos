import { beforeEach, describe, expect, it } from "vitest";

// node 環境には window / localStorage が無いので最小スタブを差し込む。
class MemoryStorage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  key(i: number) {
    return Array.from(this.store.keys())[i] ?? null;
  }
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
globalThis.window = {
  localStorage: storage,
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {},
} as unknown as Window & typeof globalThis;

import {
  CHAT_SESSIONS_KEY,
  loadSessions,
  type ChatSession,
} from "@/features/ruri-mama/lib/chat-session-store";
import { mergeSessionsById } from "@/features/ruri-mama/lib/chat-sync";

function session(
  id: string,
  updatedAt: string,
  extra: Partial<ChatSession> = {},
): ChatSession {
  return {
    id,
    customerId: null,
    customerName: null,
    title: `相談 ${id}`,
    messages: [{ role: "user", content: `m-${id}` }],
    createdAt: updatedAt,
    updatedAt,
    ...extra,
  };
}

describe("loadSessions (sanitize on load — クラッシュ防止)", () => {
  beforeEach(() => storage.clear());

  it("壊れた JSON は空配列にフォールバックする", () => {
    storage.setItem(CHAT_SESSIONS_KEY, "{not json");
    expect(loadSessions()).toEqual([]);
  });

  it("配列でない値は空配列にフォールバックする", () => {
    storage.setItem(CHAT_SESSIONS_KEY, JSON.stringify({ foo: 1 }));
    expect(loadSessions()).toEqual([]);
  });

  it("id を持たない壊れたセッションは黙って取り除く", () => {
    storage.setItem(
      CHAT_SESSIONS_KEY,
      JSON.stringify([{ title: "no id" }, session("s1", "2026-06-01")]),
    );
    const loaded = loadSessions();
    expect(loaded.map((s) => s.id)).toEqual(["s1"]);
  });

  it("title 欠落は '相談' に、customerName 非文字列は null に寄せる", () => {
    storage.setItem(
      CHAT_SESSIONS_KEY,
      JSON.stringify([
        { id: "s1", messages: [{ role: "user", content: "x" }], customerName: 42 },
      ]),
    );
    const [s] = loadSessions();
    expect(s.title).toBe("相談");
    expect(s.customerName).toBeNull();
  });

  it("描画すると落ちる壊れたメッセージ（role 不正 / content 欠落）を除去する", () => {
    storage.setItem(
      CHAT_SESSIONS_KEY,
      JSON.stringify([
        {
          id: "s1",
          title: "t",
          messages: [
            { role: "system", content: "drop me" },
            { role: "user" }, // content 欠落
            { role: "assistant", content: "keep" },
          ],
          createdAt: "2026-06-01",
          updatedAt: "2026-06-01",
        },
      ]),
    );
    const [s] = loadSessions();
    expect(s.messages).toEqual([{ role: "assistant", content: "keep" }]);
  });
});

describe("mergeSessionsById (端末をまたいだ履歴の union)", () => {
  it("両端末にしか無いセッションをどちらも残す", () => {
    const local = [session("a", "2026-06-01")];
    const server = [session("b", "2026-06-02")];
    const merged = mergeSessionsById(local, server);
    expect(merged.map((s) => s.id).sort()).toEqual(["a", "b"]);
  });

  it("同じ id は updatedAt の新しい方を採用する", () => {
    const local = [session("a", "2026-06-05", { title: "local-new" })];
    const server = [session("a", "2026-06-01", { title: "server-old" })];
    const merged = mergeSessionsById(local, server);
    expect(merged).toHaveLength(1);
    expect(merged[0].title).toBe("local-new");
  });

  it("結果は updatedAt 降順で返る", () => {
    const merged = mergeSessionsById(
      [session("a", "2026-06-01"), session("c", "2026-06-10")],
      [session("b", "2026-06-05")],
    );
    expect(merged.map((s) => s.id)).toEqual(["c", "b", "a"]);
  });
});
