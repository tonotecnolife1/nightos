// ═══════════════ 同伴: マネージャー横断読み取り ═══════════════
// ママ・姉さんが店舗内の他キャストの同伴を参照するためのクライアント
// ヘルパー (/api/douhans/manager 経由)。認証済みならサーバーの実データ、
// mock / 未認証なら null を返して呼び出し側が localStorage にフォール
// バックする。

import type { Douhan } from "@/types/nightos";

const ENDPOINT = "/api/douhans/manager";

/**
 * 今月のキャンセル件数をキャスト別に取得。
 * 戻り値 null = 未認証 (呼び出し側で localStorage 集計にフォールバック)。
 */
export async function fetchCancellationCounts(): Promise<Record<
  string,
  number
> | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch(`${ENDPOINT}?view=cancellation-counts`);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      authenticated: boolean;
      counts?: Record<string, number>;
    };
    if (!data.authenticated) return null;
    return data.counts ?? {};
  } catch {
    return null;
  }
}

/**
 * 指定キャストのキャンセル同伴を新しい順に取得。
 * 戻り値 null = 未認証 (呼び出し側で localStorage にフォールバック)。
 */
export async function fetchCancelledDouhansForCast(
  castId: string,
): Promise<Douhan[] | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch(
      `${ENDPOINT}?view=cancelled&castId=${encodeURIComponent(castId)}`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      authenticated: boolean;
      douhans?: Douhan[];
    };
    if (!data.authenticated) return null;
    return data.douhans ?? [];
  } catch {
    return null;
  }
}
