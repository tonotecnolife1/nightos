"use client";

import type { ReplyOptionStyle } from "@/types/nightos";

/**
 * ユーザーが3つの選択肢からどれを選んだかを記録する。
 * 将来 Supabase に移行して全社でA/B集計する想定だが、今はlocalStorageで。
 */

const KEY = "nightos.sakura-option-choices";
const MAX_STORED = 500;

export interface OptionChoice {
  id: string;
  pickedStyle: ReplyOptionStyle;
  pickedId: "A" | "B" | "C";
  pickedLabel: string;
  /** intent category when the pick happened (follow/serving/strategy/freeform) */
  intent?: string;
  /** VIP/regular/new — 顧客属性に応じた好みの分析用 */
  customerCategory?: string;
  pickedAt: string; // ISO
  castId: string;
}

export function loadChoices(): OptionChoice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as OptionChoice[];
  } catch {
    return [];
  }
}

export function recordChoice(choice: OptionChoice) {
  if (typeof window === "undefined") return;
  try {
    const current = loadChoices();
    current.push(choice);
    // cap growth
    const trimmed = current.slice(-MAX_STORED);
    window.localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    // ignore quota errors
  }
}

/**
 * スタイル別の選択回数を集計。
 * A/B テスト用に「どのスタイルが選ばれやすいか」を可視化できる。
 */
export function getStyleStats(castId?: string): Record<ReplyOptionStyle, number> {
  const choices = loadChoices();
  const filtered = castId ? choices.filter((c) => c.castId === castId) : choices;
  const stats: Record<ReplyOptionStyle, number> = {
    safe: 0,
    practical: 0,
    warm: 0,
  };
  for (const c of filtered) {
    stats[c.pickedStyle] = (stats[c.pickedStyle] ?? 0) + 1;
  }
  return stats;
}
