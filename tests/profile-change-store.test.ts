import { beforeEach, describe, expect, it } from "vitest";

// node 環境には localStorage が無いので最小スタブを差し込む。
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

// @ts-expect-error – test shim
globalThis.window = { localStorage: new MemoryStorage() };

import {
  addProfileChangeRequest,
  buildProfileChangeSet,
  listPendingProfileRequests,
  listPendingProfileRequestsForCustomer,
  loadProfileOverrides,
  resolveProfileRequest,
} from "@/features/customer-management/lib/profile-change-store";

beforeEach(() => {
  (globalThis.window as unknown as { localStorage: MemoryStorage }).localStorage.clear();
});

const base = {
  customerId: "cust1",
  customerName: "田中太郎",
  requestedByCastId: "helpA",
  requestedByName: "あかり",
  approverCastId: "master1",
  reason: null,
};

describe("buildProfileChangeSet", () => {
  it("変化した項目のみ差分にする（name は無視）", () => {
    const changes = buildProfileChangeSet(
      { name_kana: null, nickname: "たな", birthday: null, job: "医師", favorite_drink: null, region: null },
      { name_kana: "たなか", nickname: "たな", birthday: null, job: "弁護士", favorite_drink: null, region: null },
    );
    expect(Object.keys(changes).sort()).toEqual(["job", "name_kana"]);
    expect(changes.name_kana).toEqual({ from: null, to: "たなか" });
    expect(changes.job).toEqual({ from: "医師", to: "弁護士" });
  });
});

describe("profile change request lifecycle", () => {
  it("提案→承認で override に反映され、status は applied", () => {
    const req = addProfileChangeRequest({
      ...base,
      changes: { job: { from: null, to: "医師" } },
    });
    expect(listPendingProfileRequestsForCustomer("cust1")).toHaveLength(1);

    const resolved = resolveProfileRequest(req.id, "approve", "ゆき");
    expect(resolved?.status).toBe("applied");
    expect(listPendingProfileRequestsForCustomer("cust1")).toHaveLength(0);
    expect(loadProfileOverrides()["cust1"]?.job).toBe("医師");
  });

  it("却下では override に反映されない", () => {
    const req = addProfileChangeRequest({
      ...base,
      changes: { nickname: { from: null, to: "たろちゃん" } },
    });
    resolveProfileRequest(req.id, "reject", "ゆき");
    expect(loadProfileOverrides()["cust1"]).toBeUndefined();
  });

  it("承認時、同一顧客・同一項目の競合 pending は自動却下される", () => {
    const r1 = addProfileChangeRequest({ ...base, changes: { job: { from: null, to: "医師" } } });
    addProfileChangeRequest({ ...base, requestedByCastId: "helpB", changes: { job: { from: null, to: "弁護士" } } });
    expect(listPendingProfileRequestsForCustomer("cust1")).toHaveLength(2);

    resolveProfileRequest(r1.id, "approve", "ゆき");
    // 競合した helpB の提案は自動却下され pending は 0
    expect(listPendingProfileRequestsForCustomer("cust1")).toHaveLength(0);
    expect(loadProfileOverrides()["cust1"]?.job).toBe("医師");
  });

  it("listPendingProfileRequests は承認者で絞れる（null=オーナーは常に含む）", () => {
    addProfileChangeRequest({ ...base, approverCastId: "master1", changes: { job: { from: null, to: "A" } } });
    addProfileChangeRequest({ ...base, approverCastId: "master2", changes: { region: { from: null, to: "東京" } } });
    addProfileChangeRequest({ ...base, approverCastId: null, changes: { nickname: { from: null, to: "x" } } });

    expect(listPendingProfileRequests("master1")).toHaveLength(2); // 自分宛て + null
    expect(listPendingProfileRequests()).toHaveLength(3); // 全件
  });
});
