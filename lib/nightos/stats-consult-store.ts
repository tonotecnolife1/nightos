// 成績ページ → さくらママ相談 への一回限りの引き継ぎ (handoff)。
//
// 「もっと相談する」を押したとき、成績の分析結果をさくらママのチャットに
// 持ち込んで会話の続きができるようにする。チャット側 (chat-window) が
// マウント時にこの handoff を読み取り、会話履歴へ追記してから消費する。

const KEY = "nightos.stats-consult-handoff";

export interface StatsConsultHandoff {
  castId: string;
  /** チャットに「ユーザー発言」として表示する一文 */
  userText: string;
  /** さくらママの分析 (assistant 発言として表示) */
  assistantReply: string;
}

export function setStatsConsultHandoff(handoff: StatsConsultHandoff): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(handoff));
  } catch {
    // ignore quota errors
  }
}

/** 引き継ぎを読み取り、同時に削除する (一回限り)。 */
export function takeStatsConsultHandoff(
  castId: string,
): StatsConsultHandoff | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    window.localStorage.removeItem(KEY);
    const parsed = JSON.parse(raw) as StatsConsultHandoff;
    if (!parsed || parsed.castId !== castId) return null;
    if (!parsed.userText || !parsed.assistantReply) return null;
    return parsed;
  } catch {
    return null;
  }
}
