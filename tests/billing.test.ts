import { describe, it, expect } from "vitest";
import {
  FREE_PERIOD_END,
  PAID_START,
  ENDING_SOON_DAYS,
  getPlanStatus,
  toJstDate,
  formatJpDate,
  formatMonthlyPrice,
} from "@/lib/nightos/billing";

// JST 正午 (= UTC 03:00) を作るヘルパ。境界 (深夜) のブレを避ける。
function jstNoon(ymd: string): Date {
  return new Date(`${ymd}T03:00:00Z`);
}

describe("getPlanStatus", () => {
  it("無料期間のど真ん中は free フェーズ", () => {
    const s = getPlanStatus(jstNoon("2026-06-15"));
    expect(s.phase).toBe("free");
    expect(s.daysRemaining).toBeGreaterThan(ENDING_SOON_DAYS);
  });

  it("終了 14 日以内は ending_soon フェーズ", () => {
    const s = getPlanStatus(jstNoon("2026-08-25")); // 終了まで 6 日
    expect(s.phase).toBe("ending_soon");
    expect(s.daysRemaining).toBe(6);
  });

  it("ちょうど ENDING_SOON_DAYS 前は ending_soon", () => {
    const s = getPlanStatus(jstNoon("2026-08-17")); // 8/31 まで 14 日
    expect(s.daysRemaining).toBe(ENDING_SOON_DAYS);
    expect(s.phase).toBe("ending_soon");
  });

  it("無料最終日 (8/31) はまだ free 扱い (paid 開始前)", () => {
    const s = getPlanStatus(jstNoon(FREE_PERIOD_END));
    expect(s.phase).toBe("ending_soon");
    expect(s.daysRemaining).toBe(0);
  });

  it("有料開始日 (9/1) 以降は paid フェーズ・残り 0 日", () => {
    const s = getPlanStatus(jstNoon(PAID_START));
    expect(s.phase).toBe("paid");
    expect(s.daysRemaining).toBe(0);
  });

  it("十分先の日付は paid", () => {
    expect(getPlanStatus(jstNoon("2027-01-01")).phase).toBe("paid");
  });
});

describe("toJstDate", () => {
  it("UTC 深夜の境界を JST で翌日に繰り上げる", () => {
    // 2026-06-14 18:00Z = 2026-06-15 03:00 JST
    expect(toJstDate(new Date("2026-06-14T18:00:00Z"))).toBe("2026-06-15");
  });
});

describe("formatJpDate", () => {
  it("YYYY-MM-DD を和文に整形 (ゼロ埋めしない)", () => {
    expect(formatJpDate("2026-09-01")).toBe("2026年9月1日");
    expect(formatJpDate("2026-08-31")).toBe("2026年8月31日");
  });
});

describe("formatMonthlyPrice", () => {
  it("null は準備中", () => {
    expect(formatMonthlyPrice(null)).toBe("月額（準備中）");
  });
  it("数値は 3 桁区切りの円表示", () => {
    expect(formatMonthlyPrice(3980)).toBe("月額3,980円");
    expect(formatMonthlyPrice(12000)).toBe("月額12,000円");
  });
});
