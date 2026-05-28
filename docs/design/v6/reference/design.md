# NIGHTOS UI Design Guidelines (v2)

夜職向けワークスペース「NIGHTOS」のUI指針。**落ち着き × かわいさ × 明るさ × 上品さ** を同時に満たすことを目標にする。

参考: Pinterest 3枚（pearl / blush / champagne 系のラグジュアリーモバイル UI）。

> **更新履歴**
> - v1 (2026-04-30): AIテンプレ排除を主目的に禁欲的すぎた
> - v2 (2026-05-01): 上品さのために装飾を**積極的に**使う方向に転換。明朝＋blushグラデ＋gold差色

---

## 0. ゴール

- スクリーンショット1枚で「夜職向けの大人かわいいワークスペース」と伝わる
- 装飾を消しても用件が成立する。装飾は **意味のある演出にだけ**使う
- それでも「AIテンプレ感」は徹底排除（§5 参照）

---

## 1. カラートークン

すべて **light theme** 前提。dark mode は将来別途定義。

### 1.1 ベース

| トークン | hex | 用途 |
|----------|-----|------|
| `bg` | `#faf6f1` | ページ全体（pearl warm） |
| `bg-elevated` | `#fffefb` | 上に重ねるカード（ほぼ白）|
| `bg-soft` | `#f5ede2` | 一段沈める領域 |
| `text` | `#2b232a` | 主テキスト |
| `text-secondary` | `#675d66` | 副次 |
| `text-muted` | `#a39ba1` | 補助・プレースホルダー |
| `line` | `rgba(43, 35, 42, 0.08)` | 罫線（極薄）|

### 1.2 アクセント 3色セット

| 役割 | トークン | hex | 使う場面 |
|------|----------|-----|---------|
| メイン強調 | `blush` | `#e8b9a5` | 主要CTA塗り、選択状態 |
| 副強調 | `champagne` | `#e6cda5` | カード境界、KPI下地 |
| 高級感差色 | `gold` | `#b89455` | 細線・小アイコン・「VIP」マーク。**塗りには使わない** |

それぞれ 3 段階：

```ts
blush:     { soft: "#f4d4cf", default: "#e8b9a5", deep: "#c98d80" }
champagne: { soft: "#f3e6c8", default: "#e6cda5", deep: "#b89455" }
gold:      { soft: "#d8be86", default: "#b89455", deep: "#8a6e3d" }
```

### 1.3 状態色

```ts
success #6b8e6f   // dusty sage — 派手にしない
warning #c8a063   // gold deep を流用
danger  #c2575b   // 上品な赤
info    #8aa3b3   // dusty blue（情報カード等、限定使用）
```

### 1.4 使用ルール

- 1画面の **塗り**は最大 **2色**（blush + bg、または blush + champagne）
- **gold は線・小アイコン・「VIP」マーク**だけ。塗りには使わない
- danger は **エラー文字とエラー枠**だけ
- info（dusty blue）は売上下落・低調指標などデータ表現に限定

---

## 2. タイポグラフィ

### 2.1 フォント

| 用途 | フォント | 備考 |
|------|---------|------|
| 見出し | **Noto Serif JP** 500 | 日本語の主軸 |
| 見出し（英数字混在時） | **Cormorant Garamond** 500 | 英数字部分のみ。日本語には使わない |
| 本文・UI | **Noto Sans JP** 400 | 操作要素はすべてこれ |
| 数値（KPI） | **Cormorant Garamond** 300 | 大きく細く |
| mono | Geist Mono | コード表示等 |

`app/layout.tsx` で Google Fonts から読み込む。Latin プリロード優先。

### 2.2 ヒエラルキー（モバイル基準）

| 名前 | フォント | サイズ / 行高 / weight | 用途 |
|------|---------|----------------------|------|
| `display-xl` | Noto Serif JP | 28 / 1.3 / 500 | 画面主タイトル |
| `display-md` | Noto Serif JP | 22 / 1.3 / 500 | セクション見出し |
| `display-sm` | Noto Serif JP | 18 / 1.4 / 500 | カード見出し |
| `body-lg` | Noto Sans JP | 16 / 1.6 / 400 | 本文（フォーム） |
| `body-md` | Noto Sans JP | 14 / 1.6 / 400 | リスト本文 |
| `body-sm` | Noto Sans JP | 12 / 1.5 / 400 | 補助 |
| `label` | Noto Sans JP | 11 / 1 / 500 | バッジ |
| `kpi` | Cormorant Garamond | 32 / 1 / 300 | 数値 |

### 2.3 タイポルール

- 見出し（`display-*`）は明朝、字間は `tracking-wide`
- 本文・操作要素はゴシック
- 大文字英語ラベル（`tracking-wider uppercase`）は **禁止**
- 数字（金額・件数・KPI）は Cormorant Garamond 細字
- 画面の主タイトルは**左寄せ**。中央寄せはヒーロー時のみ

---

## 3. 余白・角丸・影

### 3.1 余白スケール

```
xs  4px     アイコンと文字の隙間
sm  8px     入力欄内、ピル内
md  12px    リスト行間、カード内段
lg  16px    カード内外余白（標準）
xl  24px    セクション間
2xl 32px    画面トップ余白
```

### 3.2 角丸

「角丸を大胆に」がブランドの基調。迷ったら**1段大きい方**を選ぶ。

| トークン | 値 | 用途 |
|----------|---|------|
| `sm` | 12px | 入力欄、極小バッジ |
| `md` | 16px | （非常用）矩形カード |
| `lg` | 22px | カード（標準）・リスト行 |
| `xl` | 28px | シート上端、大ヒーロー |
| `pill` | 999px | **ボタン全般・アバター・タブ** |

ボタンは **すべて pill** が原則。矩形ボタンは使わない（参考画像準拠）。

### 3.3 影（フローティング）

カードもボタンも「机の上から少し浮いている」質感を出す。**2 段重ねの影**で実現する。

```css
/* shadow-soft — リスト行・カード */
box-shadow:
  0 2px 4px rgba(184, 148, 85, 0.04),
  0 8px 24px rgba(184, 148, 85, 0.08);

/* shadow-float — 主要ボタン・アクティブカード */
box-shadow:
  0 4px 12px rgba(201, 141, 128, 0.14),
  0 16px 32px rgba(201, 141, 128, 0.10);

/* shadow-warm — ヒーロー、BottomSheet */
box-shadow:
  0 8px 24px rgba(201, 141, 128, 0.10),
  0 24px 48px rgba(184, 148, 85, 0.08);
```

ホバー / 押下時はわずかに `translate-y-[-1px]` してフロート感を強調。

`shadow-glow-*` `shadow-elevated` は **使用禁止**。

---

## 4. コンポーネント仕様

### 4.1 Card

```jsx
<div className="rounded-lg bg-bg-elevated/90 border border-line p-4 shadow-soft">
```

- 角丸 18px
- 背景は半透明 elevated（`/90`）でガラス質
- 装飾用色付き枠（`!border-amethyst-border` 等）は禁止

### 4.2 Button

**全て pill 形状**（角丸フル）。3 バリアント：

```jsx
// Primary — blush ソフトグラデ + フロート影
<button className="rounded-pill bg-gradient-blush text-text px-6 py-3.5 font-medium tracking-wide
                   shadow-float hover:translate-y-[-1px] active:translate-y-[1px] transition">

// Secondary — 半透明白 + gold 細線
<button className="rounded-pill border border-gold/30 bg-bg-elevated/80 text-text px-6 py-3.5
                   shadow-soft hover:border-gold/50 hover:translate-y-[-1px] transition">

// Quiet — テキストリンク的
<button className="text-blush-deep hover:underline underline-offset-2">
```

`bg-gradient-blush` = `linear-gradient(135deg, #f4d4cf 0%, #e8b9a5 100%)`

ルール：
- 角丸は **pill 一択**。`rounded-md` (16px) ボタンは使わない
- 主要ボタンの **paddingは大きめ** (`px-6 py-3.5`)。タップ面積と余白で上品さを出す
- v1 の **bg-ink ベタ黒は廃止**（冷たすぎる）
- ホバーで `translate-y-[-1px]` を必ず付ける（フローティング感）

### 4.3 Input

```jsx
<input className="rounded-md border border-line bg-bg-elevated px-3 py-2.5 text-body-lg focus:border-blush-deep" />
```

- 角丸 14px、border 極薄、focus で blush-deep の細線
- font-size は **16px**（モバイル zoom 防止）

### 4.4 ヒーロー

縦パステルグラデを背景にする：

```jsx
<header className="bg-gradient-to-b from-blush-soft via-bg to-bg pt-10 pb-8 px-6">
  <h1 className="font-display text-display-xl text-text">ようこそ</h1>
  <p className="text-body-md text-text-secondary mt-1">サインインしてください</p>
</header>
```

- 写真は使わない（v2 ではグラデのみ）
- 3点グラデ `from-blush-soft via-bg to-bg`

### 4.5 KPI（数値）

```jsx
<div className="flex items-baseline gap-1.5">
  <span className="font-display text-kpi text-text">12</span>
  <span className="text-body-sm text-text-muted">件</span>
</div>
```

- 数字は Cormorant Garamond 32px 細字
- 単位は body-sm muted

### 4.6 リスト行（ListRow）

```jsx
<button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-line bg-bg-elevated hover:border-champagne hover:shadow-soft transition">
  <span className="w-9 h-9 rounded-pill border border-gold/40 flex items-center justify-center text-text-secondary">
    <Icon size={16} />
  </span>
  <span className="flex-1 min-w-0 text-left">
    <span className="block text-body-md font-medium text-text">タイトル</span>
    <span className="block text-body-sm text-text-muted truncate">説明</span>
  </span>
  <ChevronRight size={16} className="text-text-muted" />
</button>
```

- アイコン円は **塗りつぶさない**。gold 細ラインで縁取り
- `rose-gradient` / `ruri-gradient` の塗り円は廃止

### 4.7 BottomSheet

- 背景 `bg`、上端のみ角丸 24px、`shadow-warm`
- ヘッダーに `display-md`
- 中身は ListRow を最大 4–5 行

---

## 5. やめるパターン（テンプレ感の元凶）

| # | NG | 理由 |
|---|----|------|
| 1 | `Sparkles` ✨ + 「MVP」「NEW」バッジ | テンプレ感の最大要因 |
| 2 | センター大配置の "NIGHTOS" 巨大ロゴ | スタートアップHP感 |
| 3 | `tracking-wider uppercase` 英語ラベル | テンプレ感 |
| 4 | `rose-gradient` / `ruri-gradient` 塗り円 | 派手・AI感 |
| 5 | `shadow-glow-*` ハロー | 浮きすぎ |
| 6 | パステル4色以上を1画面に | 散漫 |
| 7 | bg-ink ベタ黒のボタン | 冷たすぎる（v1 で導入したが v2 で廃止） |
| 8 | 角丸 < 8px | 硬すぎる |
| 9 | gold の塗り | 安っぽくなる。線だけ |
| 10 | 写真ヒーロー | v2 では使わない（重い・選定コスト高） |

---

## 6. 採用ヒエラルキー（迷ったら）

優先順位：

1. **読みやすさ** > 装飾
2. **静けさ（落ち着き）** > にぎやかさ
3. **明朝 ＋ blushグラデ** で「上品さ」を出す
4. **gold 細線** で「夜職らしさ」のサイン
5. **blush 塗り** は1画面 1–2箇所に絞る

---

## 7. 適用順

1. 認証 / オンボーディング（`app/auth/login`, `signup`, `app/onboarding`）— v2 最初に適用
2. ロール選択（`app/role-selector.tsx`）
3. Cast ホーム（`app/cast/home`）
4. Store ダッシュボード（`app/store/dashboard`）
5. Customer ホーム（`app/customer/home`）

各ステップでログイン画面の preview を見て微調整、その上で次へ進む。

---

## 8. レビューチェックリスト

PR を出す前に毎回：

- [ ] 見出しは Noto Serif JP（明朝）
- [ ] 本文・操作は Noto Sans JP
- [ ] 塗りは 1画面で blush + champagne の 2色まで
- [ ] gold は線・小アイコンだけ。塗りで使っていない
- [ ] グラデは `blush-soft → bg` の縦のみ
- [ ] Sparkles / MVP バッジが入っていない
- [ ] `tracking-wider uppercase` 英語ラベルなし
- [ ] `shadow-glow-*` 使用なし
- [ ] 角丸 < 8px のところがない
- [ ] エラー以外で danger 色を使っていない

---

## 9. 例外

ルールから外す場合は **PR本文に1行で理由**を書く。例:「ピッチ画面は LP 寄せのため display-xl を 36px に拡大」。
