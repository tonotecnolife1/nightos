import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind クラスをマージする */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 顧客名に「さま」を付けて表示する。
 * キャスト向けUI全般で使う（テンプレート用の挿入などは別関数）。
 */
export function formatCustomerName(name: string | null | undefined): string {
  if (!name) return "";
  return `${name}さま`;
}

/** カタカナ → ひらがな (検索の表記ゆれ吸収用)。 */
function toHiragana(s: string): string {
  return s.replace(/[ァ-ヶ]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60),
  );
}

/** 検索用に正規化: trim + 小文字化 + カナをひらがなに統一 + 空白除去。 */
function normalizeForSearch(s: string): string {
  return toHiragana(s.trim().toLowerCase()).replace(/\s+/g, "");
}

/**
 * 顧客が検索クエリにマッチするか判定する。
 * 氏名(漢字) / 読み仮名(ひらがな) / ニックネーム のいずれかに
 * 部分一致すればヒット。カナ・かなの表記ゆれは吸収する。
 *
 * 「ひらがなで予測」したい場合、漢字からの自動読み変換は不安定なため
 * 各顧客カルテの読み仮名(name_kana)を使う前提。未登録の顧客は
 * 氏名(漢字)とニックネームでのみヒットする。
 */
export function customerMatchesQuery(
  customer: {
    name: string;
    name_kana?: string | null;
    nickname?: string | null;
  },
  query: string,
): boolean {
  const q = normalizeForSearch(query);
  if (!q) return true;
  const haystack = [
    customer.name,
    customer.name_kana ?? "",
    customer.nickname ?? "",
  ]
    .map(normalizeForSearch)
    .join(" ");
  return haystack.includes(q);
}

/** 円表示フォーマット（¥1,234） */
export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

/** 円表示（符号付き: +¥1,234 / -¥1,234） */
export function formatCurrencySigned(amount: number): string {
  const prefix = amount >= 0 ? "+" : "";
  return `${prefix}¥${Math.abs(amount).toLocaleString("ja-JP")}`;
}

/** 日付フォーマット（2026年3月8日） */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/** 時刻フォーマット（19:30） */
export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * ボトルの残量を「約X%」形式でフォーマット。
 * 実際に何杯残っているか正確にはわからないので 10%刻みで概算表示する。
 */
export function formatBottleRemainingPct(
  remaining: number,
  total: number,
): string {
  if (total <= 0) return "約0%";
  const pct = Math.max(0, Math.min(100, (remaining / total) * 100));
  const rounded = Math.round(pct / 10) * 10;
  return `約${rounded}%`;
}

/**
 * Copy text to clipboard.
 *
 * Uses `navigator.clipboard` when available (HTTPS / localhost), and falls
 * back to a hidden textarea + `document.execCommand('copy')` so LAN demos
 * over plain HTTP (e.g. 192.168.x.x:3000) still work.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  // Modern secure-context API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to legacy path
    }
  }

  // Legacy fallback — works on LAN HTTP and old browsers
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.opacity = "0";
    textarea.setAttribute("readonly", "");
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
