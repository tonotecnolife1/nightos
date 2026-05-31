"use client";

import { useEffect } from "react";

/**
 * Service Worker を登録するクライアントコンポーネント。
 *
 * - 本番ビルドでのみ登録する（dev では Next.js の HMR と干渉するため）。
 * - 新しい SW を検知したら自動で skipWaiting → 次回リロードで最新版に。
 *   モバイルでアプリを開きっぱなしでも、デプロイ後の古いチャンク参照
 *   (ChunkLoadError) を起こしにくくする。
 *
 * 何も描画しない（副作用専用）。
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let refreshing = false;
    // 初回登録時は controller が null。clients.claim() による初回の
    // controllerchange ではリロードせず、「既に制御されている状態からの
    // 切り替え」= 実際のデプロイ更新時のみリロードする。
    const hadController = Boolean(navigator.serviceWorker.controller);

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");

        // 新しい SW がインストールされたら、待機させず即適用を促す
        reg.addEventListener("updatefound", () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (
              installing.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              installing.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
      } catch {
        // 登録失敗してもアプリ本体は動くので握りつぶす
      }
    };

    // 制御 SW が切り替わったら一度だけリロードして新バージョンを反映
    const onControllerChange = () => {
      if (refreshing || !hadController) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );

    void register();

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
    };
  }, []);

  return null;
}
