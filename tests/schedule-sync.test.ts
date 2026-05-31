import { describe, it, expect } from "vitest";
import {
  mergeCastDouhans,
  mergeCastPlans,
} from "@/lib/nightos/schedule-sync";
import type { PlanEntry } from "@/lib/nightos/plan-store";
import type { Douhan } from "@/types/nightos";

function plan(id: string, castId: string, date = "2026-06-01"): PlanEntry {
  return { id, castId, date, title: `plan ${id}` };
}

function douhan(id: string, castId: string): Douhan {
  return {
    id,
    cast_id: castId,
    customer_id: "cust1",
    store_id: "store1",
    date: "2026-06-01",
    status: "scheduled",
    note: null,
    created_at: "2026-06-01",
  };
}

describe("mergeCastPlans", () => {
  it("replaces only the signed-in cast's plans, keeping other casts", () => {
    const existing = [
      plan("a", "cast1"),
      plan("b", "cast1"),
      plan("z", "cast2"),
    ];
    const serverPlans = [plan("c", "cast1")];

    const merged = mergeCastPlans(existing, serverPlans, "cast1");

    expect(merged.map((p) => p.id).sort()).toEqual(["c", "z"]);
    // other cast untouched
    expect(merged.find((p) => p.id === "z")?.castId).toBe("cast2");
  });

  it("drops the cast's plans when the server has none for them", () => {
    const existing = [plan("a", "cast1"), plan("z", "cast2")];

    const merged = mergeCastPlans(existing, [], "cast1");

    expect(merged.map((p) => p.id)).toEqual(["z"]);
  });

  it("returns the server set wholesale when castId is unknown", () => {
    const existing = [plan("a", "cast1")];
    const serverPlans = [plan("c", "cast1"), plan("d", "cast1")];

    const merged = mergeCastPlans(existing, serverPlans, undefined);

    expect(merged).toEqual(serverPlans);
  });
});

describe("mergeCastDouhans", () => {
  it("replaces only the signed-in cast's douhans, keeping other casts", () => {
    const existing = [
      douhan("a", "cast1"),
      douhan("b", "cast1"),
      douhan("z", "cast2"),
    ];
    const server = [douhan("c", "cast1")];

    const merged = mergeCastDouhans(existing, server, "cast1");

    expect(merged.map((d) => d.id).sort()).toEqual(["c", "z"]);
    expect(merged.find((d) => d.id === "z")?.cast_id).toBe("cast2");
  });

  it("clears the cast's douhans when the server has none", () => {
    const existing = [douhan("a", "cast1"), douhan("z", "cast2")];

    const merged = mergeCastDouhans(existing, [], "cast1");

    expect(merged.map((d) => d.id)).toEqual(["z"]);
  });
});
