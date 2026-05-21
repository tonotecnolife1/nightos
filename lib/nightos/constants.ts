// Hardcoded defaults for the MVP (no auth).
// `CURRENT_CAST_ID` is the cast shown after picking "キャスト（あかり）" on the role selector.

export const CURRENT_STORE_ID = "store1";
export const CURRENT_CAST_ID = "cast1"; // あかり
// ママ/姉さんアプリのデモログイン用 = ゆき（姉さんの最上位）
export const CURRENT_MAMA_ID = "cast_oneesan2";

export const CURRENT_CUSTOMER_ID = "cust1"; // 田中太郎（来店客モード用）

/**
 * Demo tenancy IDs. Anything in this list is treated as shared demo
 * content: seeded data, visible when someone taps 「デモを見る」, and
 * hidden from the real-signup onboarding store picker so new testers
 * can't accidentally land in the demo sandbox and collide with it.
 */
export const DEMO_STORE_IDS: readonly string[] = ["store1"];
export const DEMO_CAST_IDS: readonly string[] = [
  "cast1",
  "cast_oneesan2",
  "cast_help2",
  "cast_oneesan3",
  "cast_oneesan4",
];

export const ROLE_STORAGE_KEY = "nightos.role";
export const VENUE_TYPE_STORAGE_KEY = "nightos.venue-type";

// ── Venue type ──
// クラブ: ママ・お姉さん・キャストの階層構造。同伴が重要。担当制。
// キャバクラ: 指名制。フリー→指名の指名化が最重要。
export type VenueType = "club" | "cabaret";

// ── Club role hierarchy ──
// ママ: 店舗のオーナー/管理者。役職給あり。全顧客を管理。
// お姉さん: 担当を持つ。同伴ノルマあり。お姉さんの売上はママの売上に直結しない。
// キャスト（help 役割）: お姉さんの補助。担当なし。
export type ClubRole = "mama" | "oneesan" | "help";

// Claude Haiku 4.5 — コスパ重視。
export const SAKURA_MAMA_MODEL = "claude-haiku-4-5-20251001";

/**
 * UI に表示するさくらママの名前。
 * 通常の UI では「さくらママ」のみを表示する。
 * お店のチャットなど、人間のキャストと AI が混在する場面では
 * SAKURA_MAMA_CHAT_NAME で「(AI)」付きを使って区別する。
 */
export const SAKURA_MAMA_DISPLAY_NAME = "さくらママ";

/**
 * お店のチャットで人間と区別するための表示名。
 * 他のキャストのメッセージと並んだ時に AI と一目で分かるように「(AI)」を付与。
 */
export const SAKURA_MAMA_CHAT_NAME = "さくらママ(AI)";
