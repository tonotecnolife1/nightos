import { describe, it, expect } from "vitest";
import {
  buildContactUrl,
  decodeContactPayload,
  encodeContactPayload,
  parseContactFromText,
  type ContactPayload,
} from "@/features/qr-contact/lib/contact-payload";

const sample: ContactPayload = {
  v: 1,
  id: "cast1",
  name: "あかり",
  role: "キャスト",
  store: "NIGHTOS 銀座",
  note: "週末はだいたい出勤しています🌙",
};

describe("contact payload encode/decode", () => {
  it("round-trips a payload through base64url", () => {
    const token = encodeContactPayload(sample);
    expect(decodeContactPayload(token)).toEqual(sample);
  });

  it("preserves multibyte (Japanese / emoji) content", () => {
    const token = encodeContactPayload(sample);
    const back = decodeContactPayload(token);
    expect(back?.name).toBe("あかり");
    expect(back?.note).toContain("🌙");
  });

  it("returns null for garbage tokens", () => {
    expect(decodeContactPayload("not-a-real-token!!")).toBeNull();
    expect(decodeContactPayload("")).toBeNull();
  });

  it("rejects payloads with a wrong version", () => {
    const bad = encodeContactPayload(sample).slice(0, -2);
    // 壊れたトークンは null になる (例外を投げない)。
    expect(decodeContactPayload(bad)).toBeNull();
  });
});

describe("buildContactUrl / parseContactFromText", () => {
  it("builds an add URL and parses it back", () => {
    const url = buildContactUrl("https://nightos.example.com", sample);
    expect(url).toContain("/cast/connect/add?c=");
    expect(parseContactFromText(url)).toEqual(sample);
  });

  it("strips trailing slashes on origin", () => {
    const url = buildContactUrl("https://nightos.example.com///", sample);
    expect(url).toContain("https://nightos.example.com/cast/connect/add?c=");
  });

  it("accepts a raw token without a URL wrapper", () => {
    const token = encodeContactPayload(sample);
    expect(parseContactFromText(token)).toEqual(sample);
  });

  it("returns null for unrelated text or URLs", () => {
    expect(parseContactFromText("https://example.com/foo")).toBeNull();
    expect(parseContactFromText("こんばんは")).toBeNull();
  });
});
