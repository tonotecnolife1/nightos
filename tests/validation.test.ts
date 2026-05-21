import { describe, it, expect } from "vitest";
import {
  sakuraMamaSchema,
  chatAiSchema,
  extractMemoSchema,
  extractBusinessCardSchema,
  generateTemplateSchema,
  suggestBottleSchema,
} from "@/lib/nightos/validation";

describe("sakuraMamaSchema", () => {
  const valid = {
    messages: [{ role: "user", content: "hello" }],
    castId: "cast1",
    intent: "follow" as const,
  };

  it("accepts valid input", () => {
    expect(sakuraMamaSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects empty messages", () => {
    const r = sakuraMamaSchema.safeParse({ ...valid, messages: [] });
    expect(r.success).toBe(false);
  });

  it("rejects missing castId", () => {
    const { castId: _, ...noCast } = valid;
    expect(sakuraMamaSchema.safeParse(noCast).success).toBe(false);
  });

  it("rejects invalid intent", () => {
    const r = sakuraMamaSchema.safeParse({ ...valid, intent: "hack" });
    expect(r.success).toBe(false);
  });

  it("rejects castId with special characters", () => {
    const r = sakuraMamaSchema.safeParse({
      ...valid,
      castId: "'; DROP TABLE--",
    });
    expect(r.success).toBe(false);
  });

  it("accepts optional fields", () => {
    const r = sakuraMamaSchema.safeParse({
      ...valid,
      customerId: "cust1",
      hearingContext: { purpose: "お礼" },
    });
    expect(r.success).toBe(true);
  });

  it("rejects message content exceeding limit", () => {
    const r = sakuraMamaSchema.safeParse({
      ...valid,
      messages: [{ role: "user", content: "x".repeat(21000) }],
    });
    expect(r.success).toBe(false);
  });
});

describe("chatAiSchema", () => {
  it("accepts valid input", () => {
    const r = chatAiSchema.safeParse({
      message: "hello",
      roomId: "room1",
      castId: "cast1",
    });
    expect(r.success).toBe(true);
  });

  it("rejects empty message", () => {
    const r = chatAiSchema.safeParse({
      message: "",
      roomId: "room1",
      castId: "cast1",
    });
    expect(r.success).toBe(false);
  });
});

describe("extractMemoSchema", () => {
  const validImage =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD";

  it("accepts valid input", () => {
    const r = extractMemoSchema.safeParse({
      imageBase64: validImage,
      customerId: "cust1",
      castId: "cast1",
    });
    expect(r.success).toBe(true);
  });

  it("rejects non-data-url image", () => {
    const r = extractMemoSchema.safeParse({
      imageBase64: "not-a-data-url",
      customerId: "cust1",
      castId: "cast1",
    });
    expect(r.success).toBe(false);
  });
});

describe("extractBusinessCardSchema", () => {
  it("rejects missing image", () => {
    const r = extractBusinessCardSchema.safeParse({});
    expect(r.success).toBe(false);
  });
});

describe("generateTemplateSchema", () => {
  it("accepts valid categories", () => {
    for (const cat of ["thanks", "invite", "birthday", "seasonal"]) {
      const r = generateTemplateSchema.safeParse({
        customerId: "c1",
        castId: "cast1",
        category: cat,
      });
      expect(r.success).toBe(true);
    }
  });

  it("rejects invalid category", () => {
    const r = generateTemplateSchema.safeParse({
      customerId: "c1",
      castId: "cast1",
      category: "unknown",
    });
    expect(r.success).toBe(false);
  });
});

describe("suggestBottleSchema", () => {
  it("accepts valid input", () => {
    const r = suggestBottleSchema.safeParse({
      customerId: "cust1",
      castId: "cast1",
    });
    expect(r.success).toBe(true);
  });

  it("rejects overly long ID", () => {
    const r = suggestBottleSchema.safeParse({
      customerId: "x".repeat(100),
      castId: "cast1",
    });
    expect(r.success).toBe(false);
  });
});
