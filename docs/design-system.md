# NIGHTOS デザイン規約 (Design System)

> このドキュメントは NIGHTOS アプリの統一デザインを維持するためのルールブックです。
> 新機能追加やUI修正の際は必ず参照してください。

---

## 1. カラーパレット

### プライマリ（NIGHTOS ライトテーマ）

| トークン | 用途 | HEX |
|---------|------|-----|
| `pearl` | 背景ベース | `#faf7f2` |
| `pearl-soft` | セカンダリ背景・ボーダー | `#f5efe6` |
| `pearl-warm` | カード背景・入力フィールド | `#fdfcf9` |
| `champagne` | アクセント背景 | `#f1e7d0` |
| `champagne-dark` | アクティブ状態・ボーダー | `#e6d6b0` |
| `roseGold` | メインアクセント（CTA） | `#c98d80` |
| `roseGold-dark` | ボタン・テキスト強調 | `#a6695c` |
| `amethyst` | プレミアム・AIアクセント | `#9a7bbb` |
| `amethyst-dark` | さくらママ・アクティブタブ | `#6e4f8f` |
| `amethyst-muted` | 薄い紫背景 | `rgba(154,123,187,0.1)` |
| `blush` | セカンダリピンク | `#e4a3b0` |
| `blush-dark` | ピンクテキスト | `#c57786` |
| `ink` | メインテキスト | `#2b232a` |
| `ink-secondary` | サブテキスト | `#675d66` |
| `ink-muted` | 補助テキスト・タイムスタンプ | `#a39ba1` |
| `beige` | 閲覧専用セクション背景 | `#f5ede0` |

### セマンティック

| 用途 | トークン |
|------|---------|
| 成功・完了 | `emerald` (`#4ade80`) |
| エラー・危険 | `rose` (`#ef4444`) |
| 警告・残りわずか | `amber` (`#f59e0b`) |

### グラデーション

```
rose-gradient:  135deg — #d9a99e → #c98d80 → #a6695c
sakura-gradient:  135deg — #b89cd3 → #9a7bbb → #6e4f8f
gradient-pearl: 180deg — #fdfcf9 → #faf7f2 → #f5efe6
gradient-champagne: 135deg — #f7f0de → #f1e7d0
```

### カラー使い分けルール

- **背景**: 常に `bg-pearl`（`#faf7f2`）。グラデーション背景は禁止（スクリーンショットで崩れる）
- **カード背景**: `bg-pearl-warm`（白に近い暖色）
- **ボーダー**: `border-pearl-soft` がデフォルト
- **CTA ボタン**: `rose-gradient`（ローズゴールド）
- **AI 関連**: `sakura-gradient`（アメジスト紫）
- **テキスト**: `text-ink` → `text-ink-secondary` → `text-ink-muted` の3段階

---

## 2. タイポグラフィ

### フォント

| 用途 | フォント | CSS クラス |
|------|---------|-----------|
| 本文 | Noto Sans JP | `font-sans`（デフォルト） |
| 見出し・数値 | Cormorant Garamond | `font-display` |
| コード | Geist Mono | `font-mono` |

### テキストサイズ

| トークン | サイズ | 行高 | ウェイト | 用途 |
|---------|--------|------|---------|------|
| `text-display-lg` | 32px | 1.2 | 700 | ページタイトル |
| `text-display-sm` | 20px | 1.3 | 600 | セクション見出し |
| `text-body-lg` | 16px | 1.6 | 400 | 大きな本文 |
| `text-body-md` | 14px | 1.5 | 400 | 標準本文 |
| `text-body-sm` | 12px | 1.5 | 400 | 小さな本文 |
| `text-label-md` | 14px | 1.0 | 500 | ラベル・ボタン |
| `text-label-sm` | 12px | 1.0 | 500 | 補助ラベル |

### 使い方パターン

```tsx
// ページタイトル（ホーム）
<h1 className="font-display font-semibold text-ink text-[clamp(1.4rem,5vw,2rem)]">

// セクション見出し
<h2 className="text-display-sm text-ink">

// 統計値（大きな数字）
<span className="font-display text-[2rem] leading-none font-semibold">

// 本文
<p className="text-body-md text-ink leading-relaxed">

// ラベル
<span className="text-label-sm text-ink-muted">

// カテゴリ（UPPERCASE）
<div className="text-label-sm text-ink-muted tracking-wider uppercase">
```

### 禁止事項

- `text-xs`、`text-sm` などの Tailwind デフォルトサイズは使わない → 常に `text-body-*` / `text-label-*` を使う
- フォントサイズ 16px 未満の入力フィールドは iOS でズームが発生するため禁止 → `style={{ fontSize: "16px" }}`

---

## 3. スペーシング

### ページ構造

```tsx
// 全ページ共通レイアウト
<div className="mx-auto max-w-[520px] min-h-dvh pb-28">

// ヘッダー領域
<div className="px-5 pt-8 pb-2">

// コンテンツ領域
<div className="px-5 pt-3 pb-6 space-y-5">
```

### セクション間隔

| 間隔 | トークン | 用途 |
|------|---------|------|
| 20px | `space-y-5` / `gap-5` | メインセクション間 |
| 12px | `space-y-3` / `gap-3` | カード群 / コンポーネント間 |
| 10px | `gap-2.5` | StatCard グリッド |
| 8px | `space-y-2` | 小さなコンポーネント間 |
| 6px | `space-y-1.5` | ラベル〜入力フィールド |

### カード内パディング

| パターン | 用途 |
|---------|------|
| `p-5` / `px-5 py-4` | 標準カード |
| `p-4` / `px-4 py-3.5` | StatCard |
| `p-3` | コンパクトカード |
| `px-3.5 py-2.5` | 入力フィールド内 |

### ルール

- ページ横パディングは常に `px-5`（20px）
- タブバーの下余白は `pb-28`（112px）
- `max-w-[520px]` を超えるコンテンツ幅は禁止

---

## 4. コンポーネント

### Card

```tsx
// 標準カード
<Card className="p-4">
// → bg-pearl-warm border border-pearl-soft shadow-soft-card rounded-card

// プレミアムカード（さくらママ）
<GemCard className="p-4">
// → sakura-gradient text-pearl shadow-glow-amethyst rounded-card

// 閲覧専用（店舗メモ）
<StoreInfoCard>
// → bg-beige border-beige-border + "閲覧のみ" バッジ

// 編集可能（個人メモ）
<MemoCard>
// → memo-dashed（ピンク破線ボーダー） + "編集OK" バッジ
```

### Badge

```tsx
// 共通: px-2.5 py-1 rounded-badge text-label-sm font-medium

<Badge tone="vip">     // ローズゴールドグラデ + 白文字
<Badge tone="regular">  // シャンパン背景
<Badge tone="new">      // ブラッシュ（ピンク）
<Badge tone="neutral">  // パールソフト背景
```

### Button

```tsx
// プライマリ（CTA）
<Button variant="primary">  // rose-gradient + 白文字
<Button variant="sakura">     // sakura-gradient + 白文字（AI関連）
<Button variant="secondary"> // pearl-soft + ボーダー
<Button variant="ghost">    // テキストのみ
<Button variant="outline">  // ボーダー + roseGold テキスト

// サイズ
<Button size="sm">  // h-9  px-4
<Button size="md">  // h-11 px-5（デフォルト）
<Button size="lg">  // h-14 px-7
```

### StatCard

```tsx
<StatCard
  label="指名（今月）"
  value={18}
  unit="本"
  tone="rose"     // "default" | "rose" | "amethyst"
  icon={<Bookmark size={12} />}
/>
// → 数値は font-display text-[2rem]
// → 3列グリッドで使う: grid grid-cols-3 gap-2.5
```

### PageHeader

```tsx
// 標準（パール背景）
<PageHeader title="タイトル" subtitle="サブ" showBack />

// さくらママ専用（紫グラデーション）
<PageHeader title="さくらママ" tone="sakura" />

// → sticky top-0 z-50, backdrop-blur-md
```

### 入力フィールド

```tsx
// テキスト入力
<TextInput name="..." />
// → h-11 rounded-btn bg-pearl-warm border-pearl-soft
// → focus: border-champagne-dark bg-white

// セレクト
<SelectInput name="...">
  <option>...</option>
</SelectInput>

// テキストエリア
<TextAreaInput name="..." />
// → AutoResizeTextarea, fontSize: 16px
```

---

## 5. 角丸 (Border Radius)

| トークン | 値 | 用途 |
|---------|-----|------|
| `rounded-card` | 14px | カード・コンテナ |
| `rounded-btn` | 10px | ボタン・入力・フォーム |
| `rounded-badge` | 20px | バッジ・ピル型 |
| `rounded-full` | 50% | アバター・丸ボタン |

### ルール

- Tailwind デフォルトの `rounded-lg`、`rounded-xl` は使わない → 常にカスタムトークンを使用

---

## 6. シャドウ

| トークン | 用途 |
|---------|------|
| `shadow-soft-card` | 標準カードの軽い影 |
| `shadow-elevated-light` | タブバー・ヘッダーの浮遊感 |
| `shadow-glow-amethyst` | さくらママ関連のグロー |
| `shadow-glow-rose` | ローズゴールドのグロー |

### ルール

- Tailwind デフォルトの `shadow-md`、`shadow-lg` は使わない

---

## 7. アニメーション

| クラス | 効果 | 用途 |
|--------|------|------|
| `animate-fade-in` | Y8px→0 + フェードイン 0.4s | ページ遷移 |
| `animate-slide-up` | Y100%→0 0.3s | ボトムシート |
| `animate-fade-overlay` | フェードイン 0.2s | オーバーレイ背景 |
| `animate-shimmer` | 明滅ループ | ローディング |

### ルール

- 全ページのルート `<div>` に `animate-fade-in` を付ける
- ボタンの押下フィードバック: `active:scale-[0.98]`
- hover は `transition-all` か `transition-colors` を付ける

---

## 8. レイアウトパターン

### ページ基本構造

```tsx
<div className="animate-fade-in">
  {/* ヘッダー（非固定） */}
  <div className="px-5 pt-8 pb-2">
    <div className="text-label-sm text-ink-muted tracking-wider uppercase mb-1">
      NIGHTOS
    </div>
    <h1 className="font-display font-semibold text-ink text-[clamp(1.4rem,5vw,2rem)]">
      タイトル
    </h1>
  </div>

  {/* コンテンツ */}
  <div className="px-5 pt-3 pb-6 space-y-5">
    {/* セクション群 */}
  </div>
</div>
```

### セクション見出しパターン

```tsx
<section className="space-y-3">
  <header className="flex items-baseline justify-between">
    <h2 className="text-display-sm text-ink">セクション名</h2>
    <span className="text-label-sm text-ink-muted">3件</span>
  </header>
  {/* コンテンツ */}
</section>
```

### 3列統計グリッド

```tsx
<div className="grid grid-cols-3 gap-2.5">
  <StatCard ... tone="rose" />
  <StatCard ... tone="rose" />
  <StatCard ... tone="amethyst" />
</div>
```

### タブバー（固定下部）

```tsx
<nav className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
  <div className="mx-auto max-w-[520px] px-4 pb-safe pointer-events-auto">
    <div className="rounded-full bg-pearl-warm/95 backdrop-blur-md border border-pearl-soft shadow-elevated-light">
      {/* タブ */}
    </div>
  </div>
</nav>
```

---

## 9. ロール別カラー使い分け

| ロール | メインカラー | アクティブタブ | アバター背景 |
|--------|------------|-------------|------------|
| キャスト/お姉さん | roseGold | amethyst-muted | roseGold/20 |
| ママ | champagne | champagne | gradient-champagne |
| ヘルプ | pearl-soft | pearl-soft | pearl-soft |
| さくらママ(AI) | amethyst | — | sakura-gradient |
| 店舗スタッフ | champagne | champagne | champagne-dark |
| 来店客 | amethyst | champagne | sakura-gradient |

---

## 10. チャットUI規約

### メッセージバブル

```tsx
// 送信者アバター: w-10 h-10 rounded-full
// ママ: bg-gradient-champagne text-ink
// お姉さん: bg-roseGold/20 text-roseGold-dark
// ヘルプ: bg-pearl-soft text-ink-secondary
// BOT: SakuraMamaAvatar コンポーネント

// 役職バッジ: px-1.5 py-0.5 rounded text-[9px] font-semibold
// ママ: bg-champagne-dark text-ink
// お姉さん: bg-roseGold/20 text-roseGold-dark
// BOT: bg-amethyst-muted text-amethyst-dark
```

### @メンション

```tsx
// @さくらママ のハイライト
<span className="px-1 py-0.5 rounded bg-amethyst-muted text-amethyst-dark font-semibold text-body-sm">
  @さくらママ
</span>
```

---

## 11. 禁止事項チェックリスト

- [ ] ページ背景にグラデーションを使っていない（`bg-pearl` のソリッドのみ）
- [ ] 入力フィールドの font-size が 16px 以上
- [ ] Tailwind デフォルトの `rounded-lg` / `shadow-md` を使っていない
- [ ] Tailwind デフォルトの `text-sm` / `text-xs` を使っていない
- [ ] `max-w-[520px]` を超えるコンテンツ幅がない
- [ ] 全ページのルートに `animate-fade-in` がある
- [ ] ボタンに `active:scale-[0.98]` がある
- [ ] `px-5` のページ横パディングが統一されている
- [ ] カード内に `rounded-card` を使っている
- [ ] z-index: ヘッダー z-50 > タブバー z-40 > ピッカー z-30

---

## 12. アイコン

- ライブラリ: **lucide-react**
- デフォルトサイズ: `size={16}`（本文内）、`size={18}`（タブ・ヘッダー）、`size={12}`（StatCard 内）
- カラー: 親の `text-*` を継承、または `className="text-roseGold-dark"` で個別指定

---

## 13. iOS / モバイル対応

- `min-h-dvh` — 動的ビューポート高さ（アドレスバー考慮）
- `pb-safe` — iPhone のホームインジケーター回避
- `-webkit-tap-highlight-color: transparent` — タップハイライト無効
- `-webkit-font-smoothing: antialiased` — フォントスムージング
- `enterKeyHint="enter"` — キーボードのエンターキーラベル
- `inputMode="text"` — 適切なキーボード表示
