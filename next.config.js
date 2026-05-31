/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // クライアント側 Router Cache の保持時間。最近見たページへ戻る/再訪する
    // 遷移をサーバー往復ゼロで瞬時にする。Next 14.2 の既定は dynamic:0
    // （毎回再取得）なので、保守的に有効化して体感を改善する。
    //   dynamic: cookie 等で動的描画されるページ（本アプリの大半）の保持秒数
    //   static : prefetch 済み/静的ページの保持秒数
    // ※ トレードオフ: 再訪時に最大この秒数だけデータが古い可能性がある。
    //    値を下げれば鮮度寄り、0 で無効化。
    staleTimes: {
      dynamic: 20,
      static: 180,
    },
  },
  images: {
    // MVPではexternal画像を使う可能性があるため
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Supabase Storage (チャット添付画像など)
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
    // ローカル画像のfallback用
    unoptimized: true,
  },
};

module.exports = nextConfig;
