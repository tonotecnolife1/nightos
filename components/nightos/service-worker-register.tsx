"use client";

import { useEffect } from "react";

/**
 * Service Worker クリーンアップ専用コンポーネント。
 *
 * 以前 SW（/_next/static の cache-first 等）を導入したが、デプロイ後の
 * 版ずれで全画面エラーから復帰できない不具合が出たため SW 機能を停止した。
 *
 * このコンポーネントは「新規登録は一切せず、既に登録されている SW を
 * 解除し、SW が作ったキャッシュを削除する」だけを行う。過去に旧 SW を
 * 登録してしまった端末（＝不具合が出ている端末）を、次回アクセス時に
 * 自動でクリーンな状態へ戻すのが目的。
 *
 * 何も描画しない（副作用専用）。SW を再び有効化したくなったら、この
 * コンポーネントを登録処理に戻し、public/sw.js を実装し直すこと。
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    void (async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        if (regs.length === 0) return; // 登録が無ければ何もしない
        await Promise.all(regs.map((r) => r.unregister()));
        if (typeof caches !== "undefined") {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
      } catch {
        // 失敗してもアプリ本体には影響しないので握りつぶす
      }
    })();
  }, []);

  return null;
}
