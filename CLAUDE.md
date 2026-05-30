# Claude Code Instructions — NIGHTOS

このファイルは Claude Code が自動で読み込むプロジェクト指示書です。UI / デザイン関連の作業をする前に必ず参照してください。

---

## 1. UI / デザイン

### 1.1 必ず参照する

- **`design.md`** — V5 Bordeaux Salon の正典。新規 UI 実装 / UI 変更時は最初に読むこと
- **`docs/design/TOKENS.md`** — どのクラスをいつ使うかの早見表
- **`docs/design/v6/cast-home-v5.jsx`** — Claude Design のリファレンス実装 (V5 ソース)
- **`app/globals.css`** の `:root` 内 `--v5-*` トークンと `.v5-*` ユーティリティ

### 1.2 デザイン原則

**V5 Bordeaux Salon (2026-05-30 採用)**:
- ベース: dark wine #2D1818 → #1A0F0F の Hero + champagne-tinted pearl #f3eadb のページ地
- アクセント: champagne-gold metallic (`--v5-champ-gold`) を**クリップ / ribbon / hairline で使う、塗りには使わない**
- 主要 CTA (本文): `bg-wine-deep text-pearl-light` + shadow-warm
- 主要 CTA (Hero 内): `.v5-cta-primary` (champagne-gold solid + dark text、反転)
- 見出し: `font-serif` (Noto Serif JP) + `v5-metallic` クリップ
- 数字: `font-display` (Cormorant Garamond) + `tabular-nums`
- eyebrow: `tracking-luxe` 以上 + `--v5-gold-mid` or `text-wine-deep`

### 1.3 禁止事項

以下のクラスは本番コードから排除済み。新規追加禁止 (tailwind config に互換 alias は残置している):

```
✗ bg-roseGold-* / text-roseGold-* / border-roseGold-*
✗ bg-blush-* / text-blush-*
✗ bg-amethyst-* / text-amethyst-*
✗ bg-bg / text-text-*
✗ bg-gradient-rose-gold / bg-gradient-amethyst
✗ shadow-glow-* / shadow-soft-card / shadow-elevated-light
✗ rose-gradient / ruri-gradient (CSS class)
✗ text-rose / bg-rose/* / text-amber / bg-amber/* / text-emerald / bg-emerald/*
```

state 色は v6 semantic token を使う:
```
✓ text-success / bg-success/* / border-success/*  (dusty sage #7a9477)
✓ text-warning / bg-warning/* / border-warning/*  (#c8a063)
✓ text-wine-deep / bg-wine/* / border-wine/*       (#5e3838) — error / VIP
```

### 1.4 Hero 設計ルール

- "Tonight" / "Welcome" のような汎用挨拶を見出しに置かない
- 「いってらっしゃい」など内容ゼロの励まし禁止
- 副 CTA に機能がない「あとで」を置かない
- 主要 CTA だけで足りる場合は全幅にして、副情報 (eyebrow + brass hairline + リスト等) で視覚バランスを取る
- 採用済 Hero パターン: `features/cast-home/components/cast-home-hero.tsx` (案 A — 今夜のスケジュール)

### 1.5 自動検査

UI 変更後は必ず実行:

```bash
npm run check:design   # legacy class 検知
npm run build          # 型 / Tailwind 解決
npm test               # vitest
```

### 1.6 design.md の更新義務

UI ガイドラインに該当する変更を加えた場合、**コードと同じ PR で `design.md` も更新**すること。トークン追加 / 削除、コンポーネントレシピ変更、Hero パターン採用 → 必ず反映。

---

## 2. 一般的なコーディング規約

### 2.1 Git

- **作業ブランチ**: 機能ごとに `claude/<feature>` でブランチを切る (一人開発でも履歴の単位として有用)
- マージ先は `main`
- コミットメッセージは日本語可、`feat(scope): ...` / `fix(scope): ...` / `chore(...)` / `docs(...)` を推奨
- **PR は任意** — 一人開発でデプロイ前確認 (Vercel preview) を活用したい場合のみ

### 2.2 検証

コミット前に最低限:

```bash
npm run build
npm test
```

両方が緑であること。

### 2.3 依存

- **Next.js 14 (App Router)**
- **React 18.3 / TypeScript 5**
- **Tailwind CSS 3.4** (config: `tailwind.config.ts`)
- **Supabase** (`@supabase/ssr` + `@supabase/supabase-js`)
- **Anthropic SDK** (`@anthropic-ai/sdk`) — さくらママ AI 機能
- **Lucide React** アイコン
- 新規依存追加は最小限。代替が標準ライブラリにあるなら追加しない

### 2.4 データ層

- Mock データ: `lib/nightos/mock-data.ts`
- localStorage ストア: `lib/nightos/{schedule,douhan,contacted}-store.ts` 等
- Supabase クエリ: `lib/nightos/supabase-queries.ts`
- 認証: `lib/nightos/auth.ts`

クライアントコンポーネントから localStorage を読むときは `typeof window !== 'undefined'` ガードを書く (SSR 対策)。

### 2.5 命名

- ルート: `kebab-case` (例: `app/cast/customers/new/page.tsx`)
- コンポーネント: `kebab-case.tsx` 内に `PascalCase` の関数を export
- フック / 型: `PascalCase` (`useCastId`, `CastHomeData`)
- 顧客の敬称: 「{name}さま」(顧客向け文面) / 「{name}さん」(キャスト/スタッフ間)

---

## 3. ロール / 業態

このアプリは 4 ロール × 2 業態の組み合わせを扱う:

| ロール | URL prefix |
|---|---|
| Cast (キャスト) | `/cast/...` |
| Customer (来店客) | `/customer/...` |
| Store (店舗オーナー / スタッフ) | `/store/...` |
| Mama (ママ / 姉さん) | `/mama/...` |

業態:
- **Club**: 担当制。同伴と継続来店を重視 (`venueType === "club"`)
- **Cabaret**: 指名制。指名化と来店頻度を重視 (`venueType === "cabaret"`)

`getCurrentVenueType()` で判定し、画面を切り替える (例: `cast-home-club.tsx` / `cast-home-cabaret.tsx`)。

---

## 4. AI 機能 (さくらママ)

- ブランド名は「**さくらママ**」(コード内変数 / route は `ruri-mama` のまま、UI 表示だけ「さくらママ」)
- 定数: `SAKURA_MAMA_DISPLAY_NAME` / `SAKURA_MAMA_CHAT_NAME` (`lib/nightos/constants.ts`)
- アバター: `/public/cast/sakura-mama.jpg` (V5 ヒーロー用) / `/public/ruri-mama-*.svg` (バリエーション)
- API キー: `ANTHROPIC_API_KEY` (未設定時は stub モード)

---

## 5. デプロイ

- 本番: Vercel (URL: `nightos-*.vercel.app`)
- main ブランチへの push で自動デプロイ
- preview deployment は PR ごと

---

最終更新: 2026-05-30 (V5 Bordeaux Salon 採用に伴い新規作成)
