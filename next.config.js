/** @type {import('next').NextConfig} */
const nextConfig = {
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
