import { z } from "zod";

/**
 * QR連絡先交換のペイロード。
 *
 * LINE の「マイQR」と同じ発想で、自分のプロフィールを 1 つの QR に詰め込み、
 * 相手に読み取ってもらうことで連絡先を交換する。QR には
 * `${origin}/cast/connect/add?c=<token>` 形式の URL を入れるので、
 * - アプリ内スキャナで読む → `c` パラメータを取り出して即追加
 * - スマホ標準カメラで読む → 追加ページが開く
 * の両方で同じ追加フローに合流できる。
 */

export const CONTACT_PAYLOAD_VERSION = 1 as const;

export const ContactPayloadSchema = z.object({
  v: z.literal(CONTACT_PAYLOAD_VERSION),
  /** 交換相手を一意に識別する ID (キャスト ID 等)。 */
  id: z.string().min(1).max(128),
  /** 表示名。 */
  name: z.string().min(1).max(80),
  /** ロール表示用ラベル ("キャスト" 等)。 */
  role: z.string().max(40).optional(),
  /** 所属店舗名。 */
  store: z.string().max(80).optional(),
  /** ひとことメモ。 */
  note: z.string().max(140).optional(),
});

export type ContactPayload = z.infer<typeof ContactPayloadSchema>;

/** 追加ページに渡す URL のクエリキー。 */
export const CONTACT_QUERY_KEY = "c";

/** 追加ページの相対パス。 */
export const CONTACT_ADD_PATH = "/cast/connect/add";

// ── base64url (unicode-safe) ─────────────────────────────────────────────

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const b64 =
    typeof btoa !== "undefined"
      ? btoa(bin)
      : Buffer.from(bytes).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(input: string): Uint8Array {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const bin =
    typeof atob !== "undefined"
      ? atob(padded)
      : Buffer.from(padded, "base64").toString("binary");
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// ── encode / decode ──────────────────────────────────────────────────────

/** ペイロードを QR / URL に埋め込む base64url トークンへ変換する。 */
export function encodeContactPayload(payload: ContactPayload): string {
  const json = JSON.stringify(ContactPayloadSchema.parse(payload));
  const bytes = new TextEncoder().encode(json);
  return bytesToBase64Url(bytes);
}

/** トークンを検証付きでデコードする。壊れていれば null。 */
export function decodeContactPayload(token: string): ContactPayload | null {
  try {
    const bytes = base64UrlToBytes(token.trim());
    const json = new TextDecoder().decode(bytes);
    const parsed = ContactPayloadSchema.safeParse(JSON.parse(json));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** ペイロードから QR に焼く URL を組み立てる。 */
export function buildContactUrl(origin: string, payload: ContactPayload): string {
  const token = encodeContactPayload(payload);
  const base = origin.replace(/\/+$/, "");
  return `${base}${CONTACT_ADD_PATH}?${CONTACT_QUERY_KEY}=${token}`;
}

/**
 * スキャン結果のテキストからペイロードを取り出す。
 * - 完全な URL ("https://.../connect/add?c=xxx") でも
 * - 生のトークン ("eyJ2...") でも受け付ける。
 */
export function parseContactFromText(text: string): ContactPayload | null {
  const raw = text.trim();
  if (!raw) return null;

  // URL の場合は c パラメータを取り出す。
  try {
    const url = new URL(raw);
    const token = url.searchParams.get(CONTACT_QUERY_KEY);
    if (token) return decodeContactPayload(token);
  } catch {
    // URL でなければ生トークンとして扱う。
  }

  return decodeContactPayload(raw);
}
