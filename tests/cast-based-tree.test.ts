import { describe, expect, it } from "vitest";
import { buildCastBasedTree } from "@/lib/nightos/referral-tree";
import type { Cast, Customer, Visit } from "@/types/nightos";

function cast(id: string, name: string): Cast {
  return { id, store_id: "s1", name, nomination_count: 0, monthly_sales: 0, repeat_rate: 0 };
}
function customer(id: string, managerId: string, castId: string): Customer {
  return {
    id,
    store_id: "s1",
    cast_id: castId,
    name: id,
    birthday: null,
    job: null,
    favorite_drink: null,
    category: "regular",
    store_memo: null,
    created_at: "2026-01-01T00:00:00+09:00",
    manager_cast_id: managerId,
  };
}
function visit(customerId: string, castId: string): Visit {
  return {
    id: `${customerId}-${castId}`,
    store_id: "s1",
    customer_id: customerId,
    cast_id: castId,
    table_name: null,
    is_nominated: false,
    sales_amount: 0,
    visited_at: "2026-03-01T20:00:00+09:00",
  };
}

const casts = [cast("yuki", "ゆき"), cast("akari", "あかり"), cast("mio", "みお")];
// ゆき管理・担当もゆきの顧客
const cust = customer("c1", "yuki", "yuki");

describe("buildCastBasedTree help buckets (多対多)", () => {
  it("visits なしなら担当バケットのみ", () => {
    const tree = buildCastBasedTree({ customers: [cust], casts });
    expect(tree).toHaveLength(1);
    expect(tree[0].byCast).toHaveLength(1);
    expect(tree[0].byCast[0].kind).toBe("assigned");
  });

  it("複数ヘルプが入った顧客は各ヘルプ配下に現れる", () => {
    const visits = [
      visit("c1", "yuki"), // マスター本人＝ヘルプではない
      visit("c1", "akari"), // ヘルプ
      visit("c1", "mio"), // ヘルプ
    ];
    const tree = buildCastBasedTree({ customers: [cust], casts, visits });
    const buckets = tree[0].byCast;
    const help = buckets.filter((b) => b.kind === "help");
    expect(help.map((b) => b.cast?.id).sort()).toEqual(["akari", "mio"]);
    // どちらのヘルプ配下にも同じ顧客が出る（多対多）
    expect(help.every((b) => b.customers.some((c) => c.id === "c1"))).toBe(true);
    // 担当バケットは assigned が先頭
    expect(buckets[0].kind).toBe("assigned");
  });
});
