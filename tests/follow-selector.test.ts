import { describe, it, expect } from "vitest";
import {
  selectFollowTargets,
  isBottleKeepBrand,
} from "@/features/cast-home/data/follow-selector";
import type { Bottle, CastMemo, Customer, Visit } from "@/types/nightos";

const TODAY = new Date("2026-03-19T00:00:00+09:00");

function customer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: "c1",
    store_id: "s1",
    cast_id: "cast1",
    name: "テスト 太郎",
    birthday: null,
    job: null,
    favorite_drink: null,
    category: "regular",
    store_memo: null,
    created_at: "2025-01-01",
    funnel_stage: "assigned",
    ...overrides,
  };
}

function visit(
  customerId: string,
  daysAgo: number,
  nominated = false,
): Visit {
  const d = new Date(TODAY.getTime() - daysAgo * 86400_000);
  return {
    id: `v_${customerId}_${daysAgo}`,
    store_id: "s1",
    customer_id: customerId,
    cast_id: "cast1",
    table_name: "T1",
    is_nominated: nominated,
    visited_at: d.toISOString(),
  };
}

function bottle(customerId: string, remaining = 5): Bottle {
  return {
    id: `b_${customerId}`,
    store_id: "s1",
    customer_id: customerId,
    brand: "山崎12年",
    total_glasses: 20,
    remaining_glasses: remaining,
    kept_at: "2026-01-01",
  };
}

function memo(customerId: string, topic = "テスト話題"): CastMemo {
  return {
    id: `m_${customerId}`,
    customer_id: customerId,
    cast_id: "cast1",
    last_topic: topic,
    service_tips: null,
    next_topics: null,
    visit_notes: null,
    updated_at: "2026-03-01",
  };
}

describe("selectFollowTargets", () => {
  it("returns empty for no customers", () => {
    const result = selectFollowTargets({
      customers: [],
      visits: [],
      bottles: [],
      memos: [],
      today: TODAY,
    });
    expect(result).toEqual([]);
  });

  it("skips customer with no visits", () => {
    const result = selectFollowTargets({
      customers: [customer()],
      visits: [],
      bottles: [],
      memos: [],
      today: TODAY,
    });
    expect(result).toEqual([]);
  });

  it("detects interval gap (rule a)", () => {
    // Visits every ~5 days, then 20 days gap → triggers interval rule
    const c = customer({ id: "c_interval" });
    const v = [
      visit("c_interval", 20), // 20 days ago (gap)
      visit("c_interval", 25), // 25 days ago
      visit("c_interval", 30), // 30 days ago
    ];
    const result = selectFollowTargets({
      customers: [c],
      visits: v,
      bottles: [],
      memos: [memo("c_interval")],
      today: TODAY,
    });
    expect(result).toHaveLength(1);
    expect(result[0].reason).toBe("interval");
    expect(result[0].daysSinceLastVisit).toBe(20);
    expect(result[0].lastTopic).toBe("テスト話題");
  });

  it("detects upcoming birthday (rule b)", () => {
    // Birthday is March 25 → 6 days from TODAY (Mar 19)
    const c = customer({ id: "c_bday", birthday: "1985-03-25" });
    const v = [visit("c_bday", 2)];
    const result = selectFollowTargets({
      customers: [c],
      visits: v,
      bottles: [],
      memos: [],
      today: TODAY,
    });
    expect(result).toHaveLength(1);
    expect(result[0].reason).toBe("birthday");
    expect(result[0].reasonDetail).toContain("3月25日");
  });

  it("does not trigger birthday > 14 days out", () => {
    // Birthday is May 1 → 43 days from TODAY
    // Mark as nominated so nomination_chance doesn't trigger
    const c = customer({ id: "c_bday_far", birthday: "1990-05-01" });
    const v = [visit("c_bday_far", 2, true)];
    const result = selectFollowTargets({
      customers: [c],
      visits: v,
      bottles: [],
      memos: [],
      today: TODAY,
    });
    expect(result).toHaveLength(0);
  });

  it("detects nomination chance (rule c)", () => {
    // 2 visits, last 5 days ago, no nominations
    const c = customer({ id: "c_nom" });
    const v = [visit("c_nom", 5), visit("c_nom", 10)];
    const result = selectFollowTargets({
      customers: [c],
      visits: v,
      bottles: [],
      memos: [],
      today: TODAY,
    });
    expect(result).toHaveLength(1);
    expect(result[0].reason).toBe("nomination_chance");
  });

  it("does not trigger nomination_chance if already nominated", () => {
    const c = customer({ id: "c_nom2" });
    const v = [visit("c_nom2", 5, true), visit("c_nom2", 10)];
    const result = selectFollowTargets({
      customers: [c],
      visits: v,
      bottles: [],
      memos: [],
      today: TODAY,
    });
    expect(result).toHaveLength(0);
  });

  it("does not trigger nomination_chance if >3 visits", () => {
    const c = customer({ id: "c_nom3" });
    const v = [
      visit("c_nom3", 2),
      visit("c_nom3", 5),
      visit("c_nom3", 8),
      visit("c_nom3", 11),
    ];
    const result = selectFollowTargets({
      customers: [c],
      visits: v,
      bottles: [],
      memos: [],
      today: TODAY,
    });
    // 4 visits, no nomination → no nomination_chance
    // avg interval = 3 days, last visit 2 days ago → no interval gap
    expect(result).toHaveLength(0);
  });

  it("birthday has highest priority when multiple rules match", () => {
    const c1 = customer({ id: "c_int", name: "間隔" });
    const c2 = customer({ id: "c_bd", name: "誕生日", birthday: "1980-03-22" });
    const c3 = customer({ id: "c_nom", name: "指名" });

    const v = [
      // c1: interval gap
      visit("c_int", 20),
      visit("c_int", 25),
      visit("c_int", 30),
      // c2: birthday (Mar 22 = 3 days away)
      visit("c_bd", 2),
      // c3: nomination chance
      visit("c_nom", 5),
      visit("c_nom", 10),
    ];

    const result = selectFollowTargets({
      customers: [c1, c2, c3],
      visits: v,
      bottles: [],
      memos: [],
      today: TODAY,
    });

    expect(result).toHaveLength(3);
    expect(result[0].reason).toBe("birthday");
    expect(result[1].reason).toBe("interval");
    expect(result[2].reason).toBe("nomination_chance");
  });

  it("attaches bottle and memo info to targets", () => {
    const c = customer({ id: "c_info", birthday: "1990-03-20" });
    const result = selectFollowTargets({
      customers: [c],
      visits: [visit("c_info", 3)],
      bottles: [bottle("c_info", 8)],
      memos: [memo("c_info", "ゴルフの話")],
      today: TODAY,
    });
    expect(result).toHaveLength(1);
    expect(result[0].bottle?.brand).toBe("山崎12年");
    expect(result[0].bottle?.remaining_glasses).toBe(8);
    expect(result[0].lastTopic).toBe("ゴルフの話");
  });

  it("excludes champagne from the bottle-keep slot (rule: whisky/shochu only)", () => {
    // ボトルテーブルにシャンパンが混入していても、ボトルキープ枠には出さない。
    const c = customer({ id: "c_champ", birthday: "1990-03-20" });
    const champagne: Bottle = {
      ...bottle("c_champ", 12),
      id: "b_champ",
      brand: "モエ・エ・シャンドン",
    };
    const result = selectFollowTargets({
      customers: [c],
      visits: [visit("c_champ", 3)],
      bottles: [champagne],
      memos: [],
      today: TODAY,
    });
    expect(result).toHaveLength(1);
    // シャンパンしかキープが無い → ボトルキープ枠は空
    expect(result[0].bottle).toBeUndefined();
  });

  it("prefers a whisky/shochu keep over a champagne row for the same customer", () => {
    const c = customer({ id: "c_mix", birthday: "1990-03-20" });
    const champagne: Bottle = {
      ...bottle("c_mix", 90),
      id: "b_mix_champ",
      brand: "ドンペリニヨン",
    };
    const whisky: Bottle = {
      ...bottle("c_mix", 30),
      id: "b_mix_whisky",
      brand: "山崎12年",
    };
    const result = selectFollowTargets({
      customers: [c],
      visits: [visit("c_mix", 3)],
      bottles: [champagne, whisky],
      memos: [],
      today: TODAY,
    });
    expect(result).toHaveLength(1);
    expect(result[0].bottle?.brand).toBe("山崎12年");
  });
});

describe("isBottleKeepBrand", () => {
  it("accepts whisky and shochu brands", () => {
    for (const brand of [
      "山崎12年",
      "白州12年",
      "響 JH",
      "マッカラン18年",
      "森伊蔵",
      "魔王",
      "村尾",
      "竹鶴17年",
      "グレンリベット12年",
    ]) {
      expect(isBottleKeepBrand(brand)).toBe(true);
    }
  });

  it("rejects champagne / sparkling brands", () => {
    for (const brand of [
      "シャンパン (モエ)",
      "ドンペリニヨン",
      "ドンペリ白",
      "ヴーヴ・クリコ",
      "クリュッグ グランキュヴェ",
      "モエ・エ・シャンドン",
      "Dom Pérignon",
      "Moët",
    ]) {
      expect(isBottleKeepBrand(brand)).toBe(false);
    }
  });

  it("rejects wine, cognac and brandy brands", () => {
    for (const brand of [
      "レミーマルタンXO",
      "ヘネシー VSOP",
      "コニャック",
      "ブランデー",
      "オーパス・ワン",
      "ロマネ・コンティ",
    ]) {
      expect(isBottleKeepBrand(brand)).toBe(false);
    }
  });
});
