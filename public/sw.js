/* NIGHTOS Service Worker — 無効化（自己解除）版
 *
 * 以前のバージョンの SW がキャッシュ起因の不具合（デプロイ後の版ずれで
 * 全画面エラーから復帰できない）を引き起こしたため、Service Worker 機能を
 * 一旦停止する。
 *
 * このファイルは「自分自身を登録解除し、全キャッシュを削除する」だけの
 * SW になっている。ブラウザは sw.js を定期的に再取得して更新チェックする
 * ため、過去に旧 SW を登録した端末も、この自己解除版に置き換わって
 * 自動的にクリーンアップされる。
 */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {
        // ignore
      }
      await self.clients.claim();
      // 自分自身を登録解除（次回ナビゲーションからは SW なしになる）
      await self.registration.unregister();
    })(),
  );
});

// 念のため fetch には一切介入しない（常に素通し）。
