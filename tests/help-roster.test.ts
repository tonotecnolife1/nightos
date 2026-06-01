import { describe, expect, it } from "vitest";
import { aggregateHelpCastsByCustomer } from "@/lib/nightos/master-help-split";
import type { Cast, Customer, Visit } from "@/types/nightos";

function cast(id: string, name: string): Cast {
  return {
    id,
    store_id: "store1",
    name,
    nomination_count: 0,
    monthly_sales: 0,
    repeat_rate: 0,
  };
}

function visit(id: string, customerId: string, castId: string, visitedAt: string): Visit {
  return {
    id,
    store_id: "store1",
    customer_id: customerId,
    cast_id: castId,
    table_name: null,
    is_nominated: false,
    sales_amount: 0,
    visited_at: visitedAt,
  };
}

const customer: Customer = {
  id: "cust1",
  store_id: "store1",
  cast_id: "master1", // 主要担当 = マスター本人
  name: "田中太郎",
  birthday: null,
  job: null,
  favorite_drink: null,
  category: "regular",
  store_memo: null,
  created_at: "2026-01-01T00:00:00+09:00",
  manager_cast_id: "master1",
};

const allCasts = [
  cast("master1", "ゆき"),
  cast("helpA", "あかり"),
  cast("helpB", "みお"),
];

describe("aggregateHelpCastsByCustomer", () => {
  it("来店ごとに別ヘルプが入っても全員を集約する（多対多）", () => {
    const visits = [
      visit("v1", "cust1", "helpA", "2026-03-01T20:00:00+09:00"),
      visit("v2", "cust1", "helpB", "2026-03-10T20:00:00+09:00"),
      visit("v3", "cust1", "helpA", "2026-03-20T20:00:00+09:00"),
    ];
    const roster = aggregateHelpCastsByCustomer({ customer, visits, allCasts });

    expect(roster.masterName).toBe("ゆき");
    expect(roster.helps).toHaveLength(2);
    // lastHelpedAt 降順: helpA(3/20) が先
    expect(roster.helps[0].cast.id).toBe("helpA");
    expect(roster.helps[0].visitCount).toBe(2);
    expect(roster.helps[0].firstHelpedAt).toBe("2026-03-01T20:00:00+09:00");
    expect(roster.helps[0].lastHelpedAt).toBe("2026-03-20T20:00:00+09:00");
    expect(roster.helps[1].cast.id).toBe("helpB");
    expect(roster.helps[1].visitCount).toBe(1);
  });

  it("マスター・主要担当の接客はヘルプに含めない", () => {
    const visits = [
      visit("v1", "cust1", "master1", "2026-03-01T20:00:00+09:00"), // マスター
      visit("v2", "cust1", "helpA", "2026-03-10T20:00:00+09:00"),
    ];
    const roster = aggregateHelpCastsByCustomer({ customer, visits, allCasts });
    expect(roster.helps).toHaveLength(1);
    expect(roster.helps[0].cast.id).toBe("helpA");
  });

  it("他顧客の来店・未知キャストは無視する", () => {
    const visits = [
      visit("v1", "other", "helpA", "2026-03-01T20:00:00+09:00"),
      visit("v2", "cust1", "ghost", "2026-03-10T20:00:00+09:00"),
    ];
    const roster = aggregateHelpCastsByCustomer({ customer, visits, allCasts });
    expect(roster.helps).toHaveLength(0);
  });
});
