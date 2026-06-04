"use client";

// さくらママ相談 ⇆ マイテンプレートの橋渡し。
// - 参照: 相談カテゴリに対応するテンプレを集めて API へ渡す / 画面に出す
// - 保存: 採用した文面から「送る本文」を抜き出し、顧客名をプレースホルダに戻す

import {
  TEMPLATES,
  surnameOf,
  type Template,
  type TemplateCategory,
} from "@/features/templates/data/templates";
import {
  applyOverride,
  loadCustomTemplates,
  loadTemplateOverrides,
} from "@/features/templates/lib/custom-template-store";

/**
 * さくらママの follow ヒアリング purpose → マイテンプレ category。
 * テンプレに対応しない purpose（その他 等）は null。
 */
export function purposeToCategory(purpose?: string): TemplateCategory | null {
  switch (purpose) {
    case "来店のお礼":
      return "thanks";
    case "お誘い・同伴":
      return "invite";
    case "お祝い・記念日":
      return "birthday";
    case "ご無沙汰の挨拶":
      return "invite";
    default:
      return null;
  }
}

/**
 * 該当カテゴリの参照テンプレ一覧。
 * マイテンプレ（キャスト固有）を先に、上書き反映済みの定型を後に並べる。
 */
export function referenceTemplates(
  castId: string,
  category: TemplateCategory,
): Template[] {
  const overrides = loadTemplateOverrides(castId);
  const custom = loadCustomTemplates(castId).filter(
    (t) => t.category === category,
  );
  const defaults = TEMPLATES.filter((t) => t.category === category).map((t) =>
    applyOverride(t, overrides),
  );
  return [...custom, ...defaults];
}

/**
 * API へ渡す軽量テンプレ（label + body のみ）。
 * follow インテントで purpose がテンプレに対応する時だけ中身が入る。
 */
export function templatesForRequest(
  castId: string,
  purpose?: string,
  limit = 4,
): { category: string; label: string; body: string }[] {
  const category = purposeToCategory(purpose);
  if (!category) return [];
  return referenceTemplates(castId, category)
    .slice(0, limit)
    .map((t) => ({ category: t.category, label: t.label, body: t.body }));
}

/** このキャストが該当カテゴリに保存している「自分の」テンプレ数。 */
export function customTemplateCount(
  castId: string,
  category: TemplateCategory,
): number {
  return loadCustomTemplates(castId).filter((t) => t.category === category)
    .length;
}

/**
 * id からテンプレを解決する。マイテンプレ（custom）か定型（default）かも返す。
 * 保存時に「上書き先」を正しく選ぶために使う。
 * - custom  → saveCustomTemplate(id 上書き)
 * - default → saveTemplateOverride(templateId)
 */
export function findTemplateById(
  castId: string,
  id: string,
): { template: Template; kind: "custom" | "default" } | null {
  const custom = loadCustomTemplates(castId).find((t) => t.id === id);
  if (custom) return { template: custom, kind: "custom" };
  const def = TEMPLATES.find((t) => t.id === id);
  if (def) {
    const overrides = loadTemplateOverrides(castId);
    return { template: applyOverride(def, overrides), kind: "default" };
  }
  return null;
}

/**
 * さくらママの content（【文面例】【なぜ効くか】…の複数セクション）から
 * 「送る本文」部分だけを抽出する。reply-option-picker の parseSections と同じ規約。
 */
export function extractMessageText(content: string): string {
  const re = /【([^】]+)】/g;
  const heads: { name: string; index: number; len: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    heads.push({ name: m[1], index: m.index, len: m[0].length });
  }
  if (heads.length === 0) return content.trim();
  const sections = heads.map((h, i) => {
    const start = h.index + h.len;
    const end = i + 1 < heads.length ? heads[i + 1].index : content.length;
    return { name: h.name, body: content.slice(start, end).trim() };
  });
  const msg = sections.find((s) => s.name.includes("文面"));
  return (msg ?? sections[0]).body;
}

/**
 * 具体的な顧客名をプレースホルダに戻して再テンプレ化する。
 * クライアントで確実に分かるのは氏名のみ（ボトル名 / 前回の話題はサーバー側の
 * カルテ情報なので対象外 → 保存シートでキャストが手動調整する）。
 */
export function templatize(
  text: string,
  ctx: { fullName?: string | null },
): string {
  let result = text;
  const full = ctx.fullName?.trim();
  if (!full) return result;
  // フルネーム一致を先に {顧客名} へ、次に姓を {姓} へ。
  result = result.split(full).join("{顧客名}");
  const surname = surnameOf(full);
  if (surname && surname !== full) {
    result = result.split(surname).join("{姓}");
  }
  return result;
}
