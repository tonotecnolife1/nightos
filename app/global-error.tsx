"use client";

import { useEffect, useState } from "react";
import { reportError } from "@/lib/nightos/error-reporter";

/**
 * チャンク読み込み失敗（デプロイ後の版ずれ / 回線瞬断 / SW のキャッシュ
 * 不整合）かどうかを判定する。これらは reset() の再レンダリングでは
 * 直らず、ページの再取得が必要。
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

/**
 * 最終防衛のハード回復。global-error はルートレイアウトごと落ちている
 * ＝ ServiceWorkerRegister も動いていない状態なので、ここで自前に
 * SW の登録解除とキャッシュ全削除を行い、SW が原因の手詰まりでも
 * 確実に自己回復できるようにする。
 */
async function hardRecover(): Promise<void> {
  try {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if (typeof caches !== "undefined") {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    // 解除に失敗してもリロードは試みる
  }
  if (typeof window !== "undefined") window.location.reload();
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    reportError(error, {
      scope: "app.global-error-boundary",
      extra: { digest: error.digest, name: error.name },
    });
  }, [error]);

  // チャンク読み込み失敗は再レンダリングでは回復しないので、一度だけ
  // ハード回復（SW/キャッシュ破棄 + リロード）する。sessionStorage で
  // 「直近に試行済み」を記録し無限ループを防ぐ。
  useEffect(() => {
    if (!isChunkLoadError(error)) return;
    if (typeof window === "undefined") return;
    const KEY = "nightos.global-recover-at";
    const last = Number(window.sessionStorage.getItem(KEY) || "0");
    const now = Date.now();
    if (now - last < 15_000) return; // ループ防止
    window.sessionStorage.setItem(KEY, String(now));
    void hardRecover();
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
    // チャンクエラーはハード回復、それ以外は通常の reset()
    if (chunkError) {
      void hardRecover();
      return;
    }
    reset();
  };

  const heading = offline
    ? "オフラインのようです"
    : chunkError
      ? "最新版に更新します"
      : "予期しないエラーが発生しました";

  const body = offline
    ? "電波の届く場所で、もう一度お試しください。"
    : chunkError
      ? "アプリが更新されました。読み込み直すと最新の状態になります。"
      : "申し訳ございません。ページの読み込み中にエラーが発生しました。もう一度お試しください。";

  return (
    <html lang="ja">
      <body className="bg-[#faf6f1] text-[#2b232a] font-sans">
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-md text-center space-y-3">
            <h1
              className="text-[24px] leading-tight font-medium"
              style={{
                fontFamily:
                  '"Cormorant Garamond", "Noto Serif JP", Georgia, serif',
              }}
            >
              {heading}
            </h1>
            <p className="text-sm text-[#675d66] leading-relaxed">{body}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="px-6 py-3 rounded-full text-[#2b232a] font-medium"
              style={{
                background:
                  "linear-gradient(135deg, #f4d4cf 0%, #e8b9a5 100%)",
                boxShadow:
                  "0 4px 12px rgba(201, 141, 128, 0.14), 0 16px 32px rgba(201, 141, 128, 0.10)",
              }}
            >
              {chunkError ? "読み込み直す" : "もう一度試す"}
            </button>
            {error.digest && (
              <p className="text-[10px] text-[#a39ba1] pt-3">
                参照ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
