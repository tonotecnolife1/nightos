import { describe, it, expect } from "vitest";
import { pinsSignature } from "@/lib/nightos/chat-learnings-store";

describe("pinsSignature", () => {
  it("is order-independent", () => {
    const a = pinsSignature([
      { id: "1", memo: "x" },
      { id: "2", memo: "y" },
    ]);
    const b = pinsSignature([
      { id: "2", memo: "y" },
      { id: "1", memo: "x" },
    ]);
    expect(a).toBe(b);
  });

  it("changes when a memo changes", () => {
    const before = pinsSignature([{ id: "1", memo: "x" }]);
    const after = pinsSignature([{ id: "1", memo: "x!" }]);
    expect(before).not.toBe(after);
  });

  it("changes when a customer link changes", () => {
    const before = pinsSignature([{ id: "1", customerId: null }]);
    const after = pinsSignature([{ id: "1", customerId: "cust1" }]);
    expect(before).not.toBe(after);
  });

  it("treats missing memo/customer as empty consistently", () => {
    const a = pinsSignature([{ id: "1" }]);
    const b = pinsSignature([{ id: "1", memo: "", customerId: null }]);
    expect(a).toBe(b);
  });
});
