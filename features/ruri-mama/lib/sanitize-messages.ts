import type { ChatMessage, Intent, ReplyOption } from "@/types/nightos";

/**
 * localStorage に保存されたチャット履歴を「描画しても落ちない」形に正規化する。
 *
 * なぜ必要か:
 *   さくらママのチャットは `nightos.chat.<castId>` に JSON で永続化され、
 *   ページを開くたびに復元される。ここに 1 件でも壊れたメッセージ
 *   （古いアプリ版の形 / 不正な画像 src / content 欠落 等）が混ざると、
 *   `MessageBubble` の描画中に同期例外が飛び、ルートのエラーバウンダリ
 *   (`app/error.tsx`「ページを読み込めませんでした」) に落ちる。さらに
 *   その壊れたデータは localStorage に残り続けるため、リロードしても
 *   同じ復元 → 同じ例外で、ユーザーは永久に復帰できなくなる。
 *
 * 対策として、JSON.parse はできたが形が不正なものをここで落とし、
 * 安全に描画できるメッセージだけを残す。これにより「壊れた 1 件」が
 * 画面全体を巻き込んで落とすことを防ぐ。
 */

const VALID_ROLES = new Set<ChatMessage["role"]>(["user", "assistant"]);
const VALID_INTENTS = new Set<Intent>([
  "follow",
  "serving",
  "strategy",
  "freeform",
]);
const VALID_OPTION_IDS = new Set<ReplyOption["id"]>(["A", "B", "C"]);
const VALID_OPTION_STYLES = new Set<ReplyOption["style"]>([
  "safe",
  "practical",
  "warm",
]);

/**
 * `next/image` の src として安全に渡せる文字列か。
 * data URL / http(s) / 先頭スラッシュの相対パスのみ許可する。
 * （これ以外を src に渡すと next/image が同期 throw する。）
 */
function isRenderableImageSrc(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) return false;
  return (
    value.startsWith("data:image/") ||
    value.startsWith("https://") ||
    value.startsWith("http://") ||
    value.startsWith("/")
  );
}

function sanitizeImages(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const safe = raw.filter(isRenderableImageSrc);
  return safe.length > 0 ? safe : undefined;
}

function sanitizeOptions(raw: unknown): ReplyOption[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const safe = raw.filter(
    (o): o is ReplyOption =>
      !!o &&
      typeof o === "object" &&
      VALID_OPTION_IDS.has((o as ReplyOption).id) &&
      VALID_OPTION_STYLES.has((o as ReplyOption).style) &&
      typeof (o as ReplyOption).label === "string" &&
      typeof (o as ReplyOption).content === "string",
  );
  // 選択肢ピッカーは 2 件以上ないと意味がないので、それ未満は捨てる。
  return safe.length >= 2 ? safe : undefined;
}

function sanitizeMessage(raw: unknown): ChatMessage | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;

  if (typeof m.role !== "string" || !VALID_ROLES.has(m.role as ChatMessage["role"])) {
    return null;
  }

  // content は文字列必須。欠けていれば空文字に寄せる（画像のみメッセージ対策）。
  const content = typeof m.content === "string" ? m.content : "";
  const images = sanitizeImages(m.images);

  // 中身が何もないメッセージ（文字も画像もない）は描画ノイズなので捨てる。
  if (content.length === 0 && !images) return null;

  const clean: ChatMessage = {
    role: m.role as ChatMessage["role"],
    content,
  };
  if (images) clean.images = images;
  if (typeof m.id === "string") clean.id = m.id;
  if (m.feedback === "helpful" || m.feedback === "not_helpful" || m.feedback === null) {
    clean.feedback = m.feedback;
  }
  if (typeof m.isStub === "boolean") clean.isStub = m.isStub;
  const options = sanitizeOptions(m.options);
  if (options) clean.options = options;
  if (
    typeof m.pickedOptionId === "string" &&
    VALID_OPTION_IDS.has(m.pickedOptionId as ReplyOption["id"])
  ) {
    clean.pickedOptionId = m.pickedOptionId;
  }
  // 再生成（別の3案）・テンプレ保存導線が復元後も効くよう、文脈情報を保持する。
  if (typeof m.genIntent === "string" && VALID_INTENTS.has(m.genIntent as Intent)) {
    clean.genIntent = m.genIntent as Intent;
  }
  if (m.genHearing && typeof m.genHearing === "object" && !Array.isArray(m.genHearing)) {
    const entries = Object.entries(m.genHearing as Record<string, unknown>).filter(
      (e): e is [string, string] => typeof e[1] === "string",
    );
    if (entries.length > 0) clean.genHearing = Object.fromEntries(entries);
  }
  if (typeof m.templateSeedId === "string") {
    clean.templateSeedId = m.templateSeedId;
  }
  return clean;
}

/**
 * 任意の（信用できない）値を、安全に描画できる ChatMessage[] に正規化する。
 * 配列でない / 壊れている要素は黙って取り除く。1 件も残らなければ空配列。
 */
export function sanitizeStoredMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  const out: ChatMessage[] = [];
  for (const item of raw) {
    const clean = sanitizeMessage(item);
    if (clean) out.push(clean);
  }
  return out;
}
