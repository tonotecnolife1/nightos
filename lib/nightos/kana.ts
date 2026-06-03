// ═══════════════ かな処理ユーティリティ ═══════════════
// 氏名の読み仮名（name_kana）の自動採取・検索正規化に使う純粋関数群。
// 依存ライブラリは増やさず、標準 String API のみで完結させる。

/** カタカナ（全角）をひらがなへ変換する。それ以外の文字は素通し。 */
export function katakanaToHiragana(input: string): string {
  return input.replace(/[ァ-ヶ]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60),
  );
}

// ひらがな / カタカナ（全角）/ 長音符 / 全角・半角スペースのみで構成されるか。
// NFKC 正規化後に判定する前提（半角カナは事前に全角化される）。
const KANA_ONLY = /^[ぁ-ゖァ-ヶー　\s]+$/;

/**
 * IME 変換途中の文字列が「読み」として採用できるかな列かどうか。
 * 漢字混じり（変換確定後）は false になり、読みの上書きを防ぐ。
 */
export function isKanaReading(input: string): boolean {
  if (!input) return false;
  return KANA_ONLY.test(input.normalize("NFKC"));
}

/**
 * 検索用のゆるい正規化。
 *  - NFKC（全角英数・半角カナを正規化）
 *  - カタカナ → ひらがな（かなの種類差を吸収）
 *  - 小文字化
 *  - 空白除去（姓名間スペースの有無を無視）
 *
 * これにより「ひらがな」「カタカナ」「漢字」「英字」いずれの打鍵でも、
 * name / name_kana / nickname などの該当フィールドにヒットしやすくなる。
 */
export function normalizeForSearch(input: string): string {
  return katakanaToHiragana(input.normalize("NFKC"))
    .toLowerCase()
    .replace(/[\s　]+/g, "");
}
