import { describe, it, expect } from "vitest";
import { mergeCastPlans } from "@/lib/nightos/schedule-sync";
import type { PlanEntry } from "@/lib/nightos/plan-store";

function plan(id: string, castId: string, date = "2026-06-01"): PlanEntry {
  return { id, castId, date, title: `plan ${id}` };
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
