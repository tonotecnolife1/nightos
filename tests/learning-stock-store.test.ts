import { beforeEach, describe, expect, it } from "vitest";

// node 環境には localStorage / window が無いので最小スタブを差し込む。
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

const memoryStorage = new MemoryStorage();
// @ts-expect-error – test shim
globalThis.localStorage = memoryStorage;
// @ts-expect-error – test shim
globalThis.window = {
  localStorage: memoryStorage,
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {},
};
// CustomEvent は jsdom 無し環境には無いので最小スタブ。
// @ts-expect-error – test shim
globalThis.CustomEvent = class {
  constructor(public type: string) {}
};

import type { Learning } from "@/lib/nightos/chat-learnings-store";
import {
  getStockedIds,
  getStockedLearnings,
  isStocked,
  learningKey,
  stockLearning,
  toggleStock,
  unstockLearning,
} from "@/lib/nightos/learning-stock-store";

beforeEach(() => {
  memoryStorage.clear();
});

const sample: Learning = {
  category: "顧客管理",
  title: "早期段階での過度な接近打診は警戒信号",
  body: "初回〜数回の来店で誘ってくるお客様は要注意。",
};

describe("learning-stock-store", () => {
  it("stocks a learning and reads it back", () => {
    stockLearning(sample);
    const all = getStockedLearnings();
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe(sample.title);
    expect(all[0].id).toBe(learningKey(sample));
    expect(isStocked(sample)).toBe(true);
  });

  it("does not create duplicates for the same learning", () => {
    stockLearning(sample);
    stockLearning(sample);
    expect(getStockedLearnings()).toHaveLength(1);
  });

  it("unstocks by id", () => {
    stockLearning(sample);
    unstockLearning(learningKey(sample));
    expect(getStockedLearnings()).toHaveLength(0);
    expect(isStocked(sample)).toBe(false);
  });

  it("toggles on and off", () => {
    expect(toggleStock(sample)).toBe(true);
    expect(isStocked(sample)).toBe(true);
    expect(toggleStock(sample)).toBe(false);
    expect(isStocked(sample)).toBe(false);
  });

  it("exposes a live set of stocked ids", () => {
    stockLearning(sample);
    expect(getStockedIds().has(learningKey(sample))).toBe(true);
  });

  it("treats learnings with different content as distinct", () => {
    stockLearning(sample);
    stockLearning({ ...sample, title: "別の学び" });
    expect(getStockedLearnings()).toHaveLength(2);
  });
});
