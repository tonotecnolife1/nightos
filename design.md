# NIGHTOS UI Design Guidelines (v3)

夜職向けワークスペース「NIGHTOS」のUI指針。コンセプトを **「Luxury Lady Night」** に再定義する。
夜のホテルラウンジで間接照明に照らされたドレッサーのような、**落ち着き × 高級感 × 毎日開きたくなる微かな高揚** を同時に満たす。

> **更新履歴**
> - v1 (2026-04-30): AIテンプレ排除を主目的に禁欲的すぎた
> - v2 (2026-05-01): 上品さのため装飾を**積極的に**使う方向に転換。明朝＋blushグラデ＋gold差色
> - v3 (2026-05-19): **Luxury Lady Night** へ昇格。rose-gold 主役化、glass / nocturne / wine 追加、暖色統一（info 廃止）、実装との乖離を解消

参考: Pinterest（pearl / champagne / rose-gold 系のラグジュアリーモバイル UI）、添付の Emily Catter / Dune Dweller / Luxury LP 画像。

---

## 0. ゴール

- スクリーンショット1枚で「夜職向けの大人ラグジュアリーなワークスペース」と伝わる
- **女性ユーザー（キャスト）の所有欲を刺激する** 高級ホテル系の質感
- 装飾を消しても用件が成立する。装飾は **意味のある演出にだけ**使う
- それでも「AIテンプレ感」は徹底排除（§5 参照）

---

## 1. カラートークン

**Light theme 前提**。dark mode は将来別途定義。
プレビュー: `public/design-preview.html`（v3 全パレットの視覚資料）。

### 1.1 Base（紙と墨）

実装は `tailwind.config.ts` の値が正。v3 では bg をやや**ダスティ**に調整する余地あり（移行は段階的）。

| トークン | hex | 用途 |
|----------|-----|------|
| `pearl` | `#faf7f2` | ページ全体（warm pearl）|
| `pearl-warm` | `#fdfcf9` | カード地（ほぼ白、glass の不透明地）|
| `pearl-soft` | `#f5efe6` | 一段沈める領域 |
| `ink` | `#2b232a` | 主テキスト |
| `ink-secondary` | `#675d66` | 副次テキスト |
| `ink-muted` | `#a39ba1` | 補助・プレースホルダー |
| `line` | `rgba(43, 35, 42, 0.06–0.08)` | 罫線（極薄、`border-ink/[0.06]`〜`[0.08]`）|

> v3 検討中の調整: `pearl` を `#f1e9dd` に深める案。コントラスト検証後に決定。**当面は `#faf7f2` を維持**。

### 1.2 Signature 3色（v3 主役の役者）

v2 で「線のみ」だった gold と、新規 **rose-gold** を含む 3 役で構成。

| 役割 | トークン | soft | default | deep | 使う場面 |
|------|----------|------|---------|------|---------|
| **主役 CTA・ヒーロー** | **`rose-gold`** 🆕 | `#f3d8c8` | **`#dba98e`** | `#a87560` | Primary ボタンメタリック、KPI 強調、主役カード |
| 副・カード地・KPI下地 | `champagne` | `#f3e6c8` | **`#e6cda5`** | `#b89455` | カード地、KPI 背景、Secondary ボタン |
| 線・縁取り・VIP・小アイコン | `gold` | `#d8be86` | **`#b89455`** | `#8a6e3d` | 細線、VIP バッジ、メタリックアイコン |
| サブ（v2 互換・キュート用） | `blush` | `#f4d4cf` | **`#e8b9a5`** | `#c98d80` | 二次的な装飾、キュート寄り表現 |

**メタリックグラデ（v3 新規）**:

```ts
// 明背景用（標準）
rose-gold-metallic:       linear-gradient(135deg, #f0c5af 0%, #d4a486 50%, #a87560 100%)
gold-metallic:            linear-gradient(135deg, #e8d0a0 0%, #c8a672 50%, #8c6f44 100%)

// 暗背景用（nocturne 上で使う）
rose-gold-metallic-light: linear-gradient(135deg, #fce4d4 0%, #f0c5af 50%, #dba98e 100%)
```

> **重要ルール**: メタリックグラデを **dark 背景に乗せる時は必ず `-light` 系を使う**。標準版は deep が `#a87560`（暗茶）なので nocturne-deep に沈む。

### 1.3 Nocturne（新規・夜の奥行き）

ヒーローのオーバーレイ、写真上の文字背景、glass の背後に使う。**塗りで主役にはしない**。

| トークン | hex | 用途 |
|----------|-----|------|
| `nocturne-mist` | `#dccfc1` | フォギーな霞・グラデ中間 |
| `nocturne-dusk` | `#b5a594` | 暖かい taupe、hero 背景の深い側 |
| `nocturne-deep` | `#3d2e2a` | dark hero、写真上の半透明オーバーレイ |

### 1.4 Wine（新規・洗練アクセント）

danger と VIP の両用。v2 の `#c2575b` より沈んだ赤。

| トークン | hex | 用途 |
|----------|-----|------|
| `wine-soft` | `#d4a8a8` | アラート背景 |
| `wine` | `#9a5d5d` | error / VIP / 重要強調 |
| `wine-deep` | `#5e3838` | hover、dark accent |

### 1.5 State 色

| 役割 | hex | 備考 |
|------|-----|------|
| success | `#6b8e6f` (emerald) | dusty sage。実装済み |
| warning | `#b89455` (gold default) | gold deep を流用 |
| danger | `#9a5d5d` (= wine) | v2 の赤を wine に置換 |
| ~~info~~ | ~~`#8aa3b3` (dusty blue)~~ | **v3 で削除**。情報表現は `text-ink-secondary` で代替 |

### 1.6 Glass トークン（新規）

frosted glass を安定運用するための半透明 + blur 定義。

```ts
glass: {
  pearl:     "rgba(253, 252, 249, 0.65)",  // 通常カード（pearl-warm 由来）
  champagne: "rgba(230, 205, 165, 0.55)",  // KPI カード
  nocturne:  "rgba(61, 46, 42, 0.45)",     // hero / 写真上の文字背景
}
backdropBlur: {
  xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "32px"
}
```

### 1.7 シャドウ（再定義込み）

**現行（v2 から継続して使う）**:

```css
/* shadow-soft — リスト行・通常カード */
0 2px 4px rgba(184, 148, 85, 0.04), 0 8px 24px rgba(184, 148, 85, 0.08)

/* shadow-float — 主要ボタン・アクティブカード */
0 4px 12px rgba(201, 141, 128, 0.14), 0 16px 32px rgba(201, 141, 128, 0.10)

/* shadow-warm — ヒーロー、BottomSheet、FAB */
0 8px 24px rgba(201, 141, 128, 0.10), 0 24px 48px rgba(184, 148, 85, 0.08)
```

**v3 新規**:

```css
/* shadow-luxe — メタリック CTA、glass の浮き */
0 1px 2px rgba(255, 255, 255, 0.6) inset,
0 6px 18px rgba(168, 117, 96, 0.18),
0 20px 48px rgba(61, 46, 42, 0.12)
```

**禁止（残存しているが新規利用不可）**:
- `shadow-glow-gold` / `shadow-glow-amethyst` / `shadow-glow-rose` — テンプレ感
- `shadow-elevated-light` — 浮きすぎ。`shadow-soft` か `shadow-warm` で代替
- `shadow-card` — 旧定義

ホバー / 押下時はわずかに `hover:-translate-y-px` / `active:translate-y-px` でフロート感。

### 1.8 使用ルール

- 1画面の **塗りは最大 2色**:
  - 標準: `pearl` (bg) + `rose-gold` (主CTA)
  - KPI画面: `pearl` (bg) + `champagne` (KPI地) + `rose-gold` (アクセント1点)
  - Hero夜: `nocturne-deep` + `rose-gold-metallic-light` 文字
- **gold の塗りは禁止**。線・縁取り・小アイコン・VIPバッジのみ
- **メタリックグラデは light/dark 背景で使い分け**（§1.2 参照）
- danger（wine）は **エラー文字とエラー枠、VIP表記**だけ
- **info（dusty blue）は使わない**。冷色は Luxury Lady Night と矛盾

---

## 2. タイポグラフィ

### 2.1 フォント

| 用途 | フォント | 備考 |
|------|---------|------|
| 見出し（日本語） | **Noto Serif JP** 500 | `font-display` クラスは Cormorant + Noto Serif JP fallback |
| 見出し（英数字混在） | **Cormorant Garamond** 500 | Latin 優先、JP は Noto Serif にフォールバック |
| 本文・UI | **Noto Sans JP** 400 | `font-sans`。操作要素はすべてこれ |
| 数値（KPI） | **Cormorant Garamond** 300 | 大きく細く |

`app/layout.tsx` で Google Fonts から `Noto Sans JP (400-700)`, `Noto Serif JP (400-600)`, `Cormorant Garamond (300-700)` を読み込み。

### 2.2 ヒエラルキー（実装準拠）

`tailwind.config.ts` の `fontSize` 拡張を正とする:

| クラス | サイズ / 行高 / weight | 用途 |
|--------|----------------------|------|
| `text-display-lg` | 32 / 1.2 / 700 | LP / 大ヒーロー |
| `text-display-md` | 24 / 1.3 / 700 | 画面主タイトル |
| `text-display-sm` | 20 / 1.3 / 600 | カード見出し |
| `text-body-lg` | 16 / 1.6 / 400 | 本文・フォーム |
| `text-body-md` | 14 / 1.6 / 400 | リスト本文 |
| `text-body-sm` | 12 / 1.5 / 400 | 補助 |
| `text-label-md` | 14 / 1 / 500 | バッジ |
| `text-label-sm` | 12 / 1 / 500 | バッジ小 |

KPI 数値は専用クラスを置かず `font-display text-[2rem] font-light` 等で運用（`StatCard` 参照）。

### 2.3 タイポルール

- 見出し（`text-display-*`）は **必ず `font-display` を併用**して明朝に
- 本文・操作要素はゴシック（`font-sans` がデフォルト）
- **`tracking-wider uppercase` の英語ラベル禁止**（§5 #3）
- 数字（金額・件数・KPI）は Cormorant Garamond 細字（`font-display font-light`）
- 画面の主タイトルは**左寄せ**。中央寄せはヒーロー時のみ

---

## 3. 余白・角丸・影

### 3.1 余白スケール（Tailwind 標準 + 拡張）

```
xs  4px     アイコンと文字の隙間（gap-1）
sm  8px     入力欄内・ピル内（gap-2）
md  12px    リスト行間・カード内段（gap-3）
lg  16px    カード内外余白（標準）（gap-4 / p-4）
xl  24px    セクション間（gap-6）
2xl 32px    画面トップ余白（gap-8 / pt-8）
```

### 3.2 角丸

| クラス | 値 | 用途 |
|--------|---|------|
| `rounded-sm` 〜 `rounded-md` | 〜16px | 入力欄、極小バッジ |
| `rounded-card` | **22px** | **カード標準**・リスト行・StatCard |
| `rounded-2xl` | 24px | シート上端、大ヒーロー、glass 大カード |
| `rounded-pill` / `rounded-full` | 999px | **ボタン全般**・アバター・タブ |
| ~~`rounded-btn` (16px)~~ | 16px | **deprecated**。既存箇所も順次 `rounded-pill` へ |

ボタンは **すべて `rounded-pill`** が原則。矩形ボタンは使わない。

### 3.3 影

§1.7 を参照。新規コードは `shadow-soft` / `shadow-float` / `shadow-warm` / **`shadow-luxe`（v3新規）** から選ぶ。

---

## 4. コンポーネント仕様

### 4.1 Card

実装: `components/nightos/card.tsx`

```jsx
<div className="rounded-card bg-pearl-warm border border-ink/[0.06] shadow-soft p-4">
```

**バリアント**:
- `Card` — 標準（neutral）
- `StoreInfoCard` — `bg-beige border-beige-border` + 「閲覧のみ」badge
- `MemoCard` — `.memo-dashed`（破線枠 + blush soft グラデ）+ 「編集OK」badge
- `GemCard` — `bg-gradient-to-br from-blush-soft via-blush to-blush-deep text-ink shadow-warm`（premium CTA 用）

**v3 追加バリアント（実装予定）**:
- `GlassCard` — `bg-glass-pearl backdrop-blur-md border border-white/30 shadow-luxe`
- `KPIGlassCard` — `bg-glass-champagne backdrop-blur-md` + 中央に Cormorant 数値

色付き枠（`!border-amethyst-border` 等）は禁止。

### 4.2 Button

実装: `components/nightos/button.tsx`

**全て `rounded-pill` 形状**。

```jsx
// primary — v2: blush グラデ + フロート影（既存）
<button className="rounded-pill bg-gradient-blush text-ink shadow-float
                   hover:brightness-[1.02] hover:-translate-y-px active:translate-y-px transition" />

// secondary — pearl-warm + 極薄ボーダー
<button className="rounded-pill bg-pearl-warm text-ink border border-ink/[0.08] shadow-soft" />

// outline — gold 細線
<button className="rounded-pill border border-gold/30 text-ink" />

// ghost — テキストリンク的
<button className="text-ink-secondary hover:text-ink" />
```

**v3 追加バリアント（実装予定）**:

```jsx
// luxe — rose-gold メタリック（v3 主役 CTA）
<button className="rounded-pill bg-rose-gold-metallic text-white shadow-luxe
                   border border-white/40 hover:-translate-y-px" />
```

ルール:
- 角丸は **pill 一択**。`rounded-btn` (16px) は順次廃止
- 主要ボタンの padding は大きめ (`px-6 py-3.5`)
- **`bg-ink` ベタ黒は禁止**（v1 で導入、v2 で廃止）
- ホバーで `-translate-y-px` を付ける

### 4.3 Input

```jsx
<input className="rounded-md border border-ink/[0.08] bg-pearl-warm px-3 py-2.5 text-body-lg
                  focus:border-blush-deep focus:outline-none" />
```

- 角丸 14px、border 極薄、focus で blush-deep（v3: rose-gold default 検討中）
- font-size は **16px**（モバイル zoom 防止）

### 4.4 Hero

**v2: 標準パステルグラデ**（既存・継続）:

```jsx
<header className="bg-gradient-hero pt-10 pb-8 px-6">
  <h1 className="font-display text-display-md tracking-wide text-ink">おかえりなさい</h1>
</header>
```

`bg-gradient-hero` = `linear-gradient(180deg, #f4d4cf 0%, #faf0e8 40%, #faf6f1 100%)`

**v3: Nocturne Hero**（新規・夜の主役画面用）:

```jsx
<header className="relative overflow-hidden rounded-2xl px-7 py-10 shadow-luxe
                   bg-[radial-gradient(ellipse_at_top,_#b5a594_0%,_#3d2e2a_100%)]">
  <span className="text-rose-gold-soft text-[11px] tracking-[0.22em]">TONIGHT</span>
  <h1 className="font-display text-display-md
                 bg-rose-gold-metallic-light bg-clip-text text-transparent">
    おかえりなさい、ゆりさん
  </h1>
  <p className="text-[rgba(252,240,224,0.88)] mt-2">…</p>
</header>
```

- 写真は使わない（重い・選定コスト高）。グラデ + nocturne で代替
- 文字色は必ず **light 系メタリック** か `rgba(252,240,224,0.88)` 以上

### 4.5 KPI（数値）

```jsx
<div className="flex items-baseline gap-1.5">
  <span className="font-display text-[2rem] font-light text-ink">12</span>
  <span className="text-body-sm text-ink-muted">件</span>
</div>
```

- 数字は Cormorant Garamond 32px font-light
- 単位は `text-body-sm text-ink-muted`
- glass 上に乗せる時は `bg-glass-champagne backdrop-blur-md` のコンテナで包む

### 4.6 ListRow

```jsx
<button className="w-full flex items-center gap-3 px-4 py-3 rounded-card
                   border border-ink/[0.06] bg-pearl-warm
                   hover:border-champagne hover:shadow-soft transition">
  <span className="w-9 h-9 rounded-full border border-gold/40 flex items-center justify-center text-ink-secondary">
    <Icon size={16} />
  </span>
  <span className="flex-1 min-w-0 text-left">
    <span className="block text-body-md font-medium text-ink">タイトル</span>
    <span className="block text-body-sm text-ink-muted truncate">説明</span>
  </span>
  <ChevronRight size={16} className="text-ink-muted" />
</button>
```

- アイコン円は **塗りつぶさない**。gold 細ラインで縁取り
- `rose-gradient` / `sakura-gradient` の塗り円は廃止

### 4.7 BottomSheet

- 背景 `bg-pearl-warm`、上端のみ `rounded-t-2xl` (24px)、`shadow-warm`
- ヘッダーに `text-display-sm font-display`
- 中身は ListRow を最大 4–5 行

### 4.8 TabBar（CastTabBar）

実装: `components/nightos/cast-tab-bar.tsx`

**現状（v2 未文書化、v3 で正式定義）**:
```jsx
<nav className="bg-pearl-warm/95 backdrop-blur-md shadow-warm"> {/* shadow-elevated-light は禁止に変更 */}
  <button className="data-[active=true]:bg-rose-gold-soft data-[active=true]:text-rose-gold-deep">
```

- 背景は半透明 + blur で glass 化
- active state は **`bg-rose-gold-soft text-rose-gold-deep`**（旧 `bg-amethyst-muted text-amethyst-dark` から移行）
- shadow は `shadow-warm` に変更（`shadow-elevated-light` 廃止）

### 4.9 FAB（Floating Action Button）

実装: `app/cast/(app)/home` 系で使用。**現状 v2 違反、v3 で要修正**。

**v3 正しい実装**:
```jsx
<button className="fixed bottom-20 right-4 w-14 h-14 rounded-full
                   bg-rose-gold-metallic text-white shadow-luxe
                   border border-white/40 hover:-translate-y-0.5 transition">
  <UserPlus size={20} />
</button>
```

- bg は **`rose-gold-metallic`**（旧 `bg-amethyst` = gold 塗り は禁止）
- shadow は **`shadow-luxe`**（旧 `shadow-elevated-light` は禁止）
- text 色は `text-white`（`text-pearl` は dark palette 由来で廃止）

### 4.10 Badge

実装: `components/nightos/badge.tsx`

| variant | 実装 |
|---------|------|
| `vip` | `bg-rose-gold-metallic text-white` (v3) — v2 では `bg-gradient-blush` |
| `regular` | `bg-champagne-soft text-ink-secondary` |
| `new` | `bg-blush-soft text-blush-deep` |
| `interval` | `bg-pearl-soft border-gold/30` |
| `birthday` | `bg-blush-soft border-blush-deep/30` |
| `nomination` | `bg-champagne-soft border-gold/30` |

VIP バッジは v3 で rose-gold メタリックに昇格（高級感サイン）。

---

## 5. やめるパターン（テンプレ感の元凶 / v2 違反）

| # | NG | 理由 |
|---|----|------|
| 1 | `Sparkles` ✨ + 「MVP」「NEW」バッジ | テンプレ感の最大要因 |
| 2 | センター大配置の "NIGHTOS" 巨大ロゴ | スタートアップHP感 |
| 3 | `tracking-wider uppercase` 英語ラベル | テンプレ感（v3 でも厳守）|
| 4 | `rose-gradient` / `sakura-gradient` 塗り円 | 派手・AI感。legacy 残存箇所は段階的に置換 |
| 5 | `shadow-glow-*` ハロー | 浮きすぎ。**残存7箇所要修正**（templates, sakura-mama, customer-card）|
| 6 | パステル4色以上を1画面に | 散漫 |
| 7 | `bg-ink` ベタ黒のボタン | 冷たすぎる（v1 で導入、v2 で廃止）|
| 8 | 角丸 < 12px | 硬すぎる。`rounded-btn` (16px) も段階廃止 |
| 9 | gold の塗り | 安っぽくなる。線だけ |
| 10 | 写真ヒーロー | 重い・選定コスト高。グラデ + nocturne で代替 |
| 11 🆕 | `bg-amethyst` 塗り | gold 系の塗り。**FAB の v2 違反、v3 で `rose-gold-metallic` へ** |
| 12 🆕 | `shadow-elevated-light` | 浮きすぎ。`shadow-warm` / `shadow-soft` で代替 |
| 13 🆕 | dusty blue (`info` 色) | 暖色統一の Luxury Lady Night と矛盾 |
| 14 🆕 | メタリックグラデを dark 背景にそのまま使用 | deep 側が背景に沈む。`-light` 版を使うこと |
| 15 🆕 | `text-pearl` を light theme で使用 | dark palette 由来。`text-white` / `text-ink` を使う |

---

## 6. 採用ヒエラルキー（迷ったら）

1. **読みやすさ** > 装飾
2. **静けさ（夜の落ち着き）** > にぎやかさ
3. **明朝 ＋ rose-gold メタリック** で「高級感」を出す
4. **gold 細線** で「夜職らしさ」のサイン
5. **rose-gold 塗り** は1画面 1–2箇所に絞る（主役 CTA / 強調 KPI）
6. **glass card** はデータ密度の高い画面で使い、装飾用には乱用しない

---

## 7. 適用順（v3 ロードマップ）

### Phase 1: 基盤（完了 / 部分完了）
- [x] design.md v3 確定（このドキュメント）
- [ ] `tailwind.config.ts` に rose-gold / nocturne / wine / glass / shadow-luxe / メタリックグラデ追加
- [ ] `public/design-preview.html`（実装済み、`/design-preview.html` で確認可）

### Phase 2: Pilot — `/cast/home`
- [ ] `app/cast/(app)/home/page.tsx` および `features/cast-home/cast-home-club.tsx` / `cast-home-cabaret.tsx`
- [ ] FAB を `rose-gold-metallic` + `shadow-luxe` に修正（v2 違反解消）
- [ ] Hero を v3 Nocturne 版 or v2 グラデ強化版から選択
- [ ] StatCard を glass 化検討
- [ ] CastTabBar を rose-gold active + `shadow-warm` に

### Phase 3: 共有コンポーネント
- [ ] `components/nightos/button.tsx` に `luxe` variant 追加
- [ ] `components/nightos/card.tsx` に `GlassCard` / `KPIGlassCard` 追加
- [ ] `components/nightos/badge.tsx` の VIP を rose-gold メタリックに

### Phase 4: 横展開
- [ ] `/cast/customers` / `/cast/chat` / `/cast/stats` / `/cast/schedule` / `/cast/my` を v3 化
- [ ] Store / Customer サイドの主要画面

### Phase 5: 負債解消
- [ ] `features/templates/*` / `features/sakura-mama/*` の `rose-gradient` / `sakura-gradient` / `shadow-glow-*` / `rounded-btn` 撤去
- [ ] `components/ui/button.tsx` の dark palette 残骸（`from-gold-dark`, `text-bg`）クリーンアップ
- [ ] `app/store/dashboard/store-dashboard-club.tsx` の `tracking-wider uppercase` 1箇所修正

各 Phase でログイン後 `/cast/home` の preview を見て微調整、その上で次へ進む。

---

## 8. レビューチェックリスト

PR を出す前に毎回:

- [ ] 見出しは `font-display`（明朝）を併用
- [ ] 本文・操作は `font-sans`（Noto Sans JP）
- [ ] 塗りは 1画面で **rose-gold + champagne の 2色まで**（または rose-gold + bg）
- [ ] **gold は線・縁取り・小アイコンだけ。塗りで使っていない**
- [ ] グラデは `gradient-hero` / `gradient-blush` / `rose-gold-metallic` のみ
- [ ] **メタリックグラデの light/dark 背景使い分け OK**
- [ ] Sparkles / MVP バッジが入っていない
- [ ] `tracking-wider uppercase` 英語ラベルなし
- [ ] **`shadow-glow-*` / `shadow-elevated-light` 使用なし**
- [ ] **`bg-amethyst` 塗り使用なし**
- [ ] 角丸 < 12px のところがない
- [ ] エラー / VIP 以外で wine 色を使っていない
- [ ] **info (dusty blue) 使用なし**
- [ ] dark 背景で `text-pearl` を使っていない（`text-white` を使う）
- [ ] glass card に `backdrop-blur-md` 以上が付いている

---

## 9. 例外

ルールから外す場合は **PR本文に1行で理由**を書く。
例:「ピッチ画面は LP 寄せのため `text-display-lg` を 36px に拡大」「legacy templates の段階移行中につき `rose-gradient` を一時残置」。

---

## 付録 A: 既知の v2 違反箇所（v3 で要修正）

監査結果（2026-05-19）より。優先度順:

| # | 箇所 | 違反 | 修正 |
|---|------|------|------|
| 🔴 高 | `cast-home-club.tsx` の FAB | `bg-amethyst shadow-elevated-light text-pearl` | `bg-rose-gold-metallic shadow-luxe text-white` |
| 🔴 高 | `cast-tab-bar.tsx` | `shadow-elevated-light` + `bg-amethyst-muted` active | `shadow-warm` + `bg-rose-gold-soft` active |
| 🟠 中高 | `features/templates/*` 多数 | `rose-gradient` / `shadow-glow-*` / `rounded-btn` | v3 トークンに置換、Phase 5 |
| 🟠 中高 | `features/sakura-mama/*` chat bubble | `rose-gradient` + `shadow-soft-card` | rose-gold メタリック + `shadow-luxe` |
| 🟡 中 | `components/ui/button.tsx` | `from-gold-dark` / `text-bg`（dark palette 残骸） | rose-gold / `text-ink` に置換 |
| 🟢 低 | `store-dashboard-club.tsx` | `tracking-wider uppercase` 1箇所 | 通常の `tracking-wide` |

## 付録 B: パレットクイックリファレンス

```
BASE
  pearl       #faf7f2  (page bg)
  pearl-warm  #fdfcf9  (card)
  pearl-soft  #f5efe6  (sunken)
  ink         #2b232a  / ink-secondary #675d66 / ink-muted #a39ba1

SIGNATURE (3 役)
  rose-gold   #f3d8c8 / #dba98e / #a87560     ← v3 主役
  champagne   #f3e6c8 / #e6cda5 / #b89455     ← 副・KPI地
  gold        #d8be86 / #b89455 / #8a6e3d     ← 線のみ
  blush       #f4d4cf / #e8b9a5 / #c98d80     ← サブ（v2互換）

METALLIC
  rose-gold-metallic       135deg, #f0c5af → #d4a486 → #a87560  (明背景)
  rose-gold-metallic-light 135deg, #fce4d4 → #f0c5af → #dba98e  (暗背景)
  gold-metallic            135deg, #e8d0a0 → #c8a672 → #8c6f44

NOCTURNE (奥行き)
  mist #dccfc1 / dusk #b5a594 / deep #3d2e2a

WINE (danger + VIP)
  soft #d4a8a8 / default #9a5d5d / deep #5e3838

STATE
  success #6b8e6f  warning #b89455  danger #9a5d5d  (info 廃止)

GLASS
  pearl     rgba(253,252,249,0.65) + blur 16px
  champagne rgba(230,205,165,0.55) + blur 16px
  nocturne  rgba(61,46,42,0.45)    + blur 16px

SHADOW
  soft  / float / warm  (v2 継続)
  luxe                  (v3 新規・メタリック用)
```
