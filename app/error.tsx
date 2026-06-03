"use client";

import { useEffect, useState } from "react";
import { reportError } from "@/lib/nightos/error-reporter";

/**
 * チャンク読み込み失敗かどうかを判定する。
 *
 * モバイルでこの全画面エラーが「頻発」する最大要因がこれ:
 *  - 本番デプロイ後、古いタブ / キャッシュが参照する JS チャンク URL が
 *    404 になり、画面遷移時に ChunkLoadError が投げられる
 *  - 回線瞬断で dynamic import のチャンク取得に失敗する
 * いずれも `reset()`（再レンダリング）では直らず、ページの再取得が必要。
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

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    reportError(error, {
      scope: "app.error-boundary",
      extra: { digest: error.digest, name: error.name },
    });
  }, [error]);

  // チャンク読み込み失敗は再レンダリングでは回復しないので、
  // 一度だけハードリロードして新しいチャンクを取り直す。
  // sessionStorage で「直近にリロード済み」を記録し無限ループを防ぐ。
  useEffect(() => {
    if (!isChunkLoadError(error)) return;
    if (typeof window === "undefined") return;
    const KEY = "nightos.chunk-reload-at";
    const last = Number(window.sessionStorage.getItem(KEY) || "0");
    const now = Date.now();
    // 直近10秒以内に既にリロードしている場合はループ防止のため止める
    if (now - last < 10_000) return;
    window.sessionStorage.setItem(KEY, String(now));
    window.location.reload();
  }, [error]);

  // オフライン状態を反映（文言とアクションを切り替える）
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

  // オンラインに戻ったら（チャンクエラー時は）自動で取り直せるよう reload を優先
  const handleRetry = () => {
    if (chunkError && typeof window !== "undefined") {
      window.location.reload();
      return;
    }
    reset();
  };

  const heading = offline
    ? "オフラインのようです"
    : chunkError
      ? "最新版に更新します"
      : "ページを読み込めませんでした";

  const body = offline
    ? "電波の届く場所で、もう一度お試しください。"
    : chunkError
      ? "アプリが更新されました。読み込み直すと最新の状態になります。"
      : "通信状況を確認して、もう一度お試しください。";

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 bg-pearl">
      <div className="max-w-sm text-center space-y-3">
        <h2 className="font-display text-[22px] font-medium text-ink">
          {heading}
        </h2>
        <p className="text-body-sm text-ink-soft leading-relaxed">{body}</p>
        <button
          type="button"
          onClick={handleRetry}
          className="px-6 py-3 rounded-pill bg-wine-deep text-pearl-light text-body-md font-semibold tracking-[0.04em] hover:-translate-y-px active:translate-y-px transition shadow-luxe will-change-transform"
        >
          {chunkError ? "読み込み直す" : "もう一度試す"}
        </button>
        {error.digest && (
          <p className="text-[10px] text-ink-mute pt-3">
            参照ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
