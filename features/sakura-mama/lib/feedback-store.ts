"use client";

/**
 * Stores per-message feedback locally so future Sakura-Mama prompts can
 * reference recent helpful/unhelpful signals to improve quality.
 *
 * Each entry is a (snippet, feedback, timestamp) tuple keyed by the cast.
 * We store only the first ~120 chars of the assistant message as the
 * snippet so the localStorage stays small.
 */

const STORAGE_KEY = "nightos.sakura-feedback";
const MAX_ENTRIES = 30;

export type FeedbackValue = "helpful" | "not_helpful";

export interface FeedbackEntry {
  snippet: string;
  feedback: FeedbackValue;
  timestamp: number;
}

function key(castId: string): string {
  return `${STORAGE_KEY}.${castId}`;
}

export function loadFeedback(castId: string): FeedbackEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key(castId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as FeedbackEntry[];
  } catch {
    return [];
  }
}

export function saveFeedback(
  castId: string,
  assistantContent: string,
  feedback: FeedbackValue,
) {
  if (typeof window === "undefined") return;
  try {
    const existing = loadFeedback(castId);
    const snippet = assistantContent.slice(0, 120);
    // Replace any existing entry with the same snippet (so toggling works)
    const filtered = existing.filter((e) => e.snippet !== snippet);
    filtered.push({ snippet, feedback, timestamp: Date.now() });
    const trimmed = filtered.slice(-MAX_ENTRIES);
    window.localStorage.setItem(key(castId), JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}

export function getFeedbackFor(
  castId: string,
  assistantContent: string,
): FeedbackValue | null {
  const entries = loadFeedback(castId);
  const snippet = assistantContent.slice(0, 120);
  const found = entries.find((e) => e.snippet === snippet);
  return found?.feedback ?? null;
}

/**
 * Returns the most recent N feedback samples to be sent as context to
 * the next API call. Excludes very old entries (>30 days).
 */
export function recentFeedbackSamples(
  castId: string,
  limit = 10,
): { helpful: string[]; notHelpful: string[] } {
  const entries = loadFeedback(castId);
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recent = entries
    .filter((e) => e.timestamp >= cutoff)
    .slice(-limit);
  return {
    helpful: recent.filter((e) => e.feedback === "helpful").map((e) => e.snippet),
    notHelpful: recent
      .filter((e) => e.feedback === "not_helpful")
      .map((e) => e.snippet),
  };
}
