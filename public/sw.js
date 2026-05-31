/* NIGHTOS Service Worker — 自前実装（next-pwa 等の依存を足さない軽量版）
 *
 * 目的: モバイル回線の瞬断でも「ページを読み込めませんでした」全画面に
 * 落ちにくくする。具体的には:
 *  - /_next/static/ の content-hash 付きチャンクを cache-first で永続化
 *    → 一度読んだ JS/CSS チャンクはオフラインでも使え、デプロイ後の
 *      ChunkLoadError も緩和される
 *  - ナビゲーション(HTML)は network-first。失敗時は直近のキャッシュ、
 *    それも無ければ /offline.html を返す（白画面/標準エラーを避ける）
 *  - /api/ は一切キャッシュしない（常に最新・古いデータを出さない）
 *
 * 更新戦略: CACHE_VERSION を変えると activate で旧キャッシュを破棄。
 * skipWaiting + clients.claim で、リロード時に新 SW が即座に有効化される。
 */

const CACHE_VERSION = "nightos-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGES_CACHE = `${CACHE_VERSION}-pages`;
const OFFLINE_URL = "/offline.html";

// インストール時に必ず持っておきたい最小資産
const PRECACHE_URLS = [OFFLINE_URL, "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            // 今のバージョン以外のキャッシュは破棄
            .filter((key) => !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ページ側から { type: "SKIP_WAITING" } を受けたら即座に有効化
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/cast/") ||
    /\.(?:js|css|woff2?|ttf|otf|png|jpe?g|svg|gif|webp|ico)$/.test(
      url.pathname,
    )
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // GET 以外・別オリジンには介入しない
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // API は SW を通さず常にネットワーク（古いデータを出さない）
  if (url.pathname.startsWith("/api/")) return;

  // content-hash 付きの静的資産 → cache-first（高速 & オフライン耐性）
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const clone = response.clone();
              caches
                .open(STATIC_CACHE)
                .then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => cached);
      }),
    );
    return;
  }

  // ナビゲーション(HTML) → network-first、失敗時はキャッシュ→offline.html
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 成功したページは控えに取っておく（次回オフライン時の保険）
          const clone = response.clone();
          caches.open(PAGES_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const offline = await caches.match(OFFLINE_URL);
          if (offline) return offline;
          return new Response("オフラインです", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }),
    );
  }
});
