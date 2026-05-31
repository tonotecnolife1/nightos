import type { Customer } from "@/types/nightos";

/** Minimal customer shape the chat composer needs for @mentions. */
export interface MentionCustomer {
  id: string;
  name: string;
  nickname?: string | null;
  name_kana?: string | null;
  category?: string;
}

export function toMentionCustomer(c: Customer): MentionCustomer {
  return {
    id: c.id,
    name: c.name,
    nickname: c.nickname ?? null,
    name_kana: c.name_kana ?? null,
    category: c.category,
  };
}

function norm(s: string): string {
  return s.toLowerCase().replace(/\s|　/g, "");
}

/**
 * Filter the cast's customers for the `@` autocomplete. `query` is the text
 * typed after the `@` (without the `@`). Empty query returns all (VIP first).
 */
export function searchCustomers(
  customers: MentionCustomer[],
  query: string,
  limit = 6,
): MentionCustomer[] {
  const q = norm(query);
  const ranked = customers
    .map((c) => {
      const fields = [c.name, c.nickname, c.name_kana]
        .filter(Boolean)
        .map((f) => norm(f as string));
      if (!q) return { c, score: c.category === "vip" ? 2 : 1 };
      let score = 0;
      for (const f of fields) {
        if (f === q) score = Math.max(score, 100);
        else if (f.startsWith(q)) score = Math.max(score, 60);
        else if (f.includes(q)) score = Math.max(score, 30);
      }
      return { c, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return ranked.map((r) => r.c);
}

/**
 * Passive detection (mechanism B): given a sent message, find which of the
 * cast's customers it most likely refers to — purely by name/nickname match,
 * scoped to the sender's own customers to minimise ambiguity.
 *
 * Returns a single confident candidate, or null when there's no match or it's
 * ambiguous (the caller should then offer a small picker / stay silent).
 */
export function detectCustomer(
  customers: MentionCustomer[],
  text: string,
): { customer: MentionCustomer; ambiguous: MentionCustomer[] } | null {
  const t = norm(text);
  if (!t) return null;

  const hits = customers.filter((c) => {
    const keys = [c.name, c.nickname]
      .filter(Boolean)
      .map((k) => norm(k as string))
      // 1〜2文字の極端に短い名前は誤検出の元なので除外
      .filter((k) => k.length >= 2);
    return keys.some((k) => t.includes(k));
  });

  if (hits.length === 0) return null;
  // 単一一致 → 確信度高。複数一致 → ambiguous として候補を返す。
  return { customer: hits[0], ambiguous: hits };
}
