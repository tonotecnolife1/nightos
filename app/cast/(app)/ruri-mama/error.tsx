"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { reportError } from "@/lib/nightos/error-reporter";

/**
 * さくらママ専用のエラーバウンダリ（ルートスコープ）。
 *
 * ルートの `app/error.tsx` は reset()/リロードしか復帰手段を持たない。
 * ところがさくらママのチャットは localStorage から履歴を復元するため、
 * 壊れた履歴が原因で描画が落ちているケースでは reset() もリロードも
 * 同じデータを読み直して再発し、ユーザーは永久に復帰できない
 * （= 報告された「ボタンを押してもリロードしても直らない」状態）。
 *
 * そこでこの境界では:
 *  1. チャンク読み込み失敗（デプロイ版ずれ / 回線瞬断）は一度だけ
 *     ハードリロードして取り直す。
 *  2. それ以外は、まず「もう一度試す」(reset) を出しつつ、保存済みの
 *     相談履歴を消して確実に復帰できる「履歴を消して開き直す」も用意する。
 *
 * (app) レイアウト配下にネストしているので、この画面でも下部タブバーは
 * 残り、ユーザーは他ページへ離脱できる。
 */

function isChunkLoadError(error: Error): boolean {
  const name = error.name || "";
  const msg = error.message || "";
  return (
    name === "ChunkLoadError" ||
    /Loading chunk [\d]+ failed/i.test(msg) ||
    /Loading CSS chunk/i.test(msg) ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /importing a module script failed/i.test(msg)
  );
}

/** さくらママのチャット関連 localStorage を全消去する。 */
function clearRuriMamaStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const keysToDrop: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key) continue;
      // 個別の会話キャッシュ（nightos.chat.<castId>）/ セッション一覧 /
      // 成績ページからの引き継ぎ。チャットの復元に関わるものをすべて落とす。
      if (
        key.startsWith("nightos.chat") ||
        key === "nightos.stats-consult-handoff"
      ) {
        keysToDrop.push(key);
      }
    }
    keysToDrop.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // localStorage が使えない環境でも reset は試みる
  }
}

export default function RuriMamaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    reportError(error, {
      scope: "ruri-mama.error-boundary",
      extra: { digest: error.digest, name: error.name },
    });
  }, [error]);

  // チャンク読み込み失敗は再レンダリングでは直らないので一度だけリロード。
  useEffect(() => {
    if (!isChunkLoadError(error)) return;
    if (typeof window === "undefined") return;
    const KEY = "nightos.chunk-reload-at";
    const last = Number(window.sessionStorage.getItem(KEY) || "0");
    const now = Date.now();
    if (now - last < 10_000) return; // ループ防止
    window.sessionStorage.setItem(KEY, String(now));
    window.location.reload();
  }, [error]);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const update = () => setOffline(navigator.onLine === false);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const chunkError = isChunkLoadError(error);

  const handleRetry = () => {
    if (chunkError && typeof window !== "undefined") {
      window.location.reload();
      return;
    }
    reset();
  };

  // 履歴を消してから reset。壊れた保存データが原因の手詰まりを確実に解く。
  const handleClearAndReset = () => {
    clearRuriMamaStorage();
    reset();
  };

  const heading = offline
    ? "オフラインのようです"
    : chunkError
      ? "最新版に更新します"
      : "さくらママを開けませんでした";

  const body = offline
    ? "電波の届く場所で、もう一度お試しください。"
    : chunkError
      ? "アプリが更新されました。読み込み直すと最新の状態になります。"
      : "通信状況を確認して、もう一度お試しください。直らないときは、相談履歴をリセットすると開けるようになります。";

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 bg-pearl">
      <div className="max-w-sm text-center space-y-4">
        <h2 className="font-display text-[22px] font-medium text-ink">
          {heading}
        </h2>
        <p className="text-body-sm text-ink-soft leading-relaxed">{body}</p>
        <div className="flex flex-col items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-1.5 px-6 py-3 rounded-pill bg-wine-deep text-pearl-light text-body-md font-semibold tracking-[0.04em] hover:-translate-y-px active:translate-y-px transition shadow-luxe will-change-transform"
          >
            <RotateCcw size={15} />
            {chunkError ? "読み込み直す" : "もう一度試す"}
          </button>
          {!chunkError && !offline && (
            <button
              type="button"
              onClick={handleClearAndReset}
              className="inline-flex items-center gap-1 text-label-sm text-ink-mute hover:text-wine-deep underline underline-offset-2"
            >
              <Trash2 size={12} />
              相談履歴をリセットして開き直す
            </button>
          )}
        </div>
        {error.digest && (
          <p className="text-[10px] text-ink-mute pt-2">
            参照ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
