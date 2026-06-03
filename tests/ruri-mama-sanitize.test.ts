import { describe, expect, it } from "vitest";
import { sanitizeStoredMessages } from "@/features/ruri-mama/lib/sanitize-messages";

describe("sanitizeStoredMessages", () => {
  it("非配列は空配列に正規化する", () => {
    expect(sanitizeStoredMessages(null)).toEqual([]);
    expect(sanitizeStoredMessages(undefined)).toEqual([]);
    expect(sanitizeStoredMessages("oops")).toEqual([]);
    expect(sanitizeStoredMessages({})).toEqual([]);
  });

  it("正常なメッセージはそのまま保持する", () => {
    const input = [
      { role: "user", content: "こんばんは" },
      { role: "assistant", content: "いらっしゃい", isStub: true },
    ];
    expect(sanitizeStoredMessages(input)).toEqual(input);
  });

  it("不正な role のメッセージを落とす", () => {
    const input = [
      { role: "system", content: "x" },
      { role: "user", content: "ok" },
    ];
    expect(sanitizeStoredMessages(input)).toEqual([
      { role: "user", content: "ok" },
    ]);
  });

  it("content も画像もない空メッセージを落とす", () => {
    const input = [
      { role: "user", content: "" },
      { role: "assistant" },
      { role: "user", content: "残る" },
    ];
    expect(sanitizeStoredMessages(input)).toEqual([
      { role: "user", content: "残る" },
    ]);
  });

  it("不正な画像 src を取り除く（next/image の同期 throw を防ぐ）", () => {
    const input = [
      {
        role: "user",
        content: "写真です",
        images: ["", "blob:xyz", "javascript:alert(1)", "data:image/png;base64,AAA"],
      },
    ];
    const out = sanitizeStoredMessages(input);
    expect(out).toHaveLength(1);
    expect(out[0].images).toEqual(["data:image/png;base64,AAA"]);
  });

  it("有効な画像が1枚も無ければ images を外し、content だけ残す", () => {
    const input = [{ role: "user", content: "テキスト", images: ["bad", ""] }];
    const out = sanitizeStoredMessages(input);
    expect(out).toEqual([{ role: "user", content: "テキスト" }]);
  });

  it("content も無く画像が全て不正なら、そのメッセージごと落とす", () => {
    const input = [{ role: "user", content: "", images: ["bad"] }];
    expect(sanitizeStoredMessages(input)).toEqual([]);
  });

  it("正常な3択 options は保持する", () => {
    const options = [
      { id: "A", style: "safe", label: "A案", content: "あ" },
      { id: "B", style: "warm", label: "B案", content: "い" },
    ];
    const out = sanitizeStoredMessages([
      { role: "assistant", content: "どれにする？", options },
    ]);
    expect(out[0].options).toEqual(options);
  });

  it("壊れた options は外す（2件未満や不正な形）", () => {
    const out = sanitizeStoredMessages([
      {
        role: "assistant",
        content: "x",
        options: [{ id: "Z", style: "bogus", label: 1, content: null }],
      },
    ]);
    expect(out[0].options).toBeUndefined();
  });

  it("壊れた1件があっても他の正常なメッセージは生き残る", () => {
    const input = [
      { role: "user", content: "1件目" },
      null,
      42,
      { role: "user", content: "" },
      { role: "assistant", content: "最後" },
    ];
    expect(sanitizeStoredMessages(input)).toEqual([
      { role: "user", content: "1件目" },
      { role: "assistant", content: "最後" },
    ]);
  });
});
