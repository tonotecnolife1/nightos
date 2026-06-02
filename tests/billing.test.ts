import { describe, it, expect } from "vitest";
import {
  BASE_PLAN_NAME,
  PLAN_TAGLINE,
  METERED_BILLING_READY,
  getPlanStatus,
} from "@/lib/nightos/billing";

describe("getPlanStatus", () => {
  it("基本機能は常に無料 (期間制限なし)", () => {
    expect(getPlanStatus().freeBaseline).toBe(true);
  });

  it("従量課金フラグは定数と一致する", () => {
    expect(getPlanStatus().meteredBillingReady).toBe(METERED_BILLING_READY);
  });
});

describe("plan copy", () => {
  it("基本プラン名が定義されている", () => {
    expect(BASE_PLAN_NAME).toBeTruthy();
  });

  it("タグラインは無料と課金の両方に触れる", () => {
    expect(PLAN_TAGLINE).toContain("無料");
    expect(PLAN_TAGLINE).toContain("課金");
  });
});
