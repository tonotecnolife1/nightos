# NIGHTOS Performance Notes

`RELEASE_CHECKLIST.md` R4 の作業メモ。**フィールド計測ではなく
コードベースから読める懸念点**を列挙。本番ドメイン稼働後に
Lighthouse / Vercel Analytics の数値で裏付けて優先度を決める。

---

## 🔍 既知の懸念

### 1. mock-data.ts (~1,800 行 / 100KB+) が本番 bundle に含まれる
**症状**: `lib/nightos/supabase-queries.ts` が `mockCasts` `mockCustomers` 等を
import しているため、Supabase 経由のクエリしか走らない本番でも
mock データが client/server bundle に焼き込まれている。

**影響**: 初回ロード時の JS パース時間 + メモリ。モバイル環境で 100ms+ の
無駄を生む可能性。

**対応案**:
- `mock-data.ts` を `dynamic import` に切り替えて mock 経路だけで
  読み込む（`withFallback` の中で `await import("./mock-data")`）。
- もしくは `process.env.NEXT_PUBLIC_SUPABASE_URL` の有無で
  bundle 分岐 (`next.config.js` で `webpack.NormalModuleReplacementPlugin`)。
- 計測順: 先に `next build` の出力を `.next/analyze` で観測してから判断。

### 2. AVATAR / ICON の SVG が `<link rel="apple-touch-icon" href="/sakura-mama-b.svg" />`
**症状**: PNG/ICO 版がない。iOS が SVG を apple-touch-icon に使えない端末がある。

**対応**: 180x180 PNG を `public/apple-touch-icon.png` として配置。

### 3. Google Fonts を `<link>` で 3 ファミリー読み込み
**症状**: Noto Sans JP + Noto Serif JP + Cormorant Garamond の 3 family。
Noto Serif JP は日本語 weight が大きい。LCP に影響しうる。

**対応案**:
- `next/font/google` に切り替えて自己ホスト化 + サブセット化。
- 利用 weight を 400 / 500 のみに絞る（既に 500 中心、500 / 400 のみで OK）。

### 4. MorningBriefing が page mount で fetch + LocalStorage cache
コード自体は良いが、AI 応答が遅いとき `Loader2` が長く回る。
`Suspense` 境界に入れて、AI 回答の可視化に時間がかかっても本体描画は
続行できるようにする選択肢あり。

### 5. customer/home の `getCustomerStoreOverviews`
B4 で並列化済み (Promise.all)。1 ユーザの DB 往復は 4 並列 + 後続 2 並列で
合計 ≤ 2 ラウンドトリップ。これ以上の最適化は `select` 指定で payload 削減
（現在 `*`）。

### 6. SVG / 画像最適化
LINE スクショは `line_screenshots.image_data` に base64 で DB 保存。
1 枚 100KB〜数MB 想定。**Supabase Storage への移行**を中期で検討。
DB 行が肥大化すると `select *` クエリが重くなる。

---

## 計測手順（本番ドメイン稼働後）

### Lighthouse (本番 URL)

```sh
npx lighthouse https://nightos.example.com --view
# 注目指標: LCP < 2.5s / CLS < 0.1 / TTFB < 600ms
```

### Vercel Analytics
- Vercel Dashboard → Analytics → Web Vitals
- 異常値が出ているページから先に対処

### Bundle 分析

```sh
ANALYZE=true npm run build
# .next/analyze/*.html を確認 — どの module が重いか可視化
```
※ 上記には `@next/bundle-analyzer` の追加が必要。
package.json への追加は perf 改善着手時に。

### Edge / Serverless cold start

Vercel Function Logs で `Init Duration` 列を確認。Server Action 経由で
重い import（`@supabase/supabase-js` + `@anthropic-ai/sdk`）を
読むので、未利用の API ルートは `runtime: "edge"` を検討。

---

## 着手の優先順

1. **(a) mock-data.ts の動的ロード** — bundle で一番わかりやすい節約
2. **(b) apple-touch-icon の PNG 化** — iOS 確認時に困るので早めに
3. **(c) next/font 移行** — LCP に効く
4. **(d) Lighthouse 実測** — 上記 3 つの後、本当にボトルネックがどこか確認

すべて launch 後に着手で良い。MVP 段階での LCP 数値が悪くなければ
そのまま運用 → ユーザー数が増えてから (a) から潰す方針。
