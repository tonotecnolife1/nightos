# NIGHTOS UI Design Guidelines

夜職向けワークスペース NIGHTOS の UI 指針。**ボルドーサロン × シャンパンゴールド × 高級感** を同時に満たすことを目標にする。

> **更新履歴**
> - v1 (2026-04-30): AIテンプレ排除を主目的に禁欲的すぎた
> - v2 (2026-05-01): 上品さのために装飾を積極的に使う方向に転換。明朝＋blushグラデ＋gold差色
> - v3 (2026-05-19): "Luxury Lady Night" pearl 基調 (採用見送り)
> - **v5 (2026-05-30): Bordeaux Salon ← 現行**
>   - 明るい pearl ベースから **dark wine Hero + champagne-tinted pearl ページ地** に転換
>   - rose-gold metallic から **champagne-gold metallic** へ
>   - 主要 CTA は wine-deep solid (本文中) と champagne-gold solid (Hero 内反転)
>   - 銀座のクラブのドアを開けた瞬間の空気感

---

## 0. ゴール

- スクリーンショット 1 枚で「銀座の高級クラブの中の業務ツール」と伝わる
- 装飾を消しても用件が成立する。装飾は**意味のある演出にだけ**使う
- 「AI テンプレ感」を徹底排除（§7 参照）
- **金色は塗らない、メタリックグラデで使う**

---

## 1. カラートークン (V5 Bordeaux Salon)

### 1.1 サーフェス

| 用途 | CSS var | hex / gradient |
|---|---|---|
| ページ地 | `--v5-page-bg` | `linear-gradient(180deg, #f3eadb 0%, #efe5d4 100%)` (champagne-tinted pearl) |
| Hero 背景 | `--v5-hero-bg` | dark wine #2D1818 → #1A0F0F + 暖色 radial lamp ×3 |
| さくらママカード地 | `--v5-sakura-bg` | bordeaux #3A1F1F → #5E3838 + wine radial |
| 通常カード | `pearl-light` | `rgba(253,248,240,0.82)` (glass) |

### 1.2 メタリックグラデーション

塗りには使わない。**テキストクリップ / ribbon / hairline / 上端 KPI ハイライト**にのみ使う。

| トークン | gradient |
|---|---|
| `--v5-champ-gold` | `linear-gradient(135deg, #EBD9A8 0%, #C8A672 50%, #8C6F44 100%)` |
| `--v5-champ-gold-soft` | `linear-gradient(135deg, #F4E2B0 0%, #D8BC82 100%)` |
| `--v5-bordeaux` | `linear-gradient(135deg, #8E4C4C 0%, #5E3838 50%, #3A1F1F 100%)` |
| `--v5-wine-met` | `linear-gradient(135deg, #C18888 0%, #9A5D5D 50%, #5E3838 100%)` |

### 1.3 アクセント (塗り OK)

| 用途 | Tailwind class | hex |
|---|---|---|
| 主要 CTA / アクティブ tab | `bg-wine-deep` / `text-wine-deep` | `#5E3838` |
| 強調アクセント | `bg-wine` / `text-wine` | `#9A5D5D` |
| 装飾的ピル背景 | `bg-wine-soft` | `#d4a8a8` |
| Hero 上 gold アクセント | `text-[var(--v5-gold-on-dark)]` | `#EBD9A8` |
| eyebrow gold | `text-[var(--v5-gold-mid)]` | `#C8A672` |

### 1.4 テキスト

#### Light 地 (champagne-tinted pearl 上)

| トークン | hex | 用途 |
|---|---|---|
| `text-ink` | `#2b232a` | 主テキスト |
| `text-ink-soft` | `#6b5a58` | 副テキスト |
| `text-ink-mute` | `#a89a96` | 三次テキスト / プレースホルダ |

#### Dark 地 (Hero / さくらママカード上)

| CSS var | rgba | 用途 |
|---|---|---|
| `--v5-ink-on-dark` | `#fdfcf9` | 主テキスト (クリーム) |
| `--v5-ink-on-dark-soft` | `rgba(253,252,249,0.72)` | 副テキスト |
| `--v5-ink-on-dark-mute` | `rgba(253,252,249,0.55)` | 三次テキスト |
| `--v5-gold-on-dark` | `#EBD9A8` | 時刻 / アクセント数字 |
| `--v5-gold-mid` | `#C8A672` | eyebrow (NIGHTOS タグ) |

### 1.5 State 色

| 用途 | Tailwind class | hex |
|---|---|---|
| 達成 / 完了 | `text-success`, `bg-success/15` | `#7a9477` (dusty sage) |
| 注意 | `text-warning`, `bg-warning/15` | `#c8a063` |
| エラー / 削除 / VIP | `text-wine-deep`, `bg-wine/10` | `#5e3838` |

派手な蛍光緑 (#10b981 など) / 赤 (#ef4444 など) は禁止。

### 1.6 禁止トークン / レガシー

以下は本番コードから排除済 (tailwind config に alias として残置しているのは互換のため):
- `roseGold-*` / `blush-*` (v3 で使ったが V5 で wine-deep に振り直し)
- `amethyst-*` (v1 紫の名残、現在は gold エイリアス)
- `bg-bg` / `text-text-*` (旧 dark プロダクト残骸)
- `bg-gradient-rose-gold` / `bg-gradient-amethyst` (V5 では `bg-rose-gold-metallic` / `bg-gold-metallic` を使う)
- `shadow-glow-*`, `shadow-soft-card`, `shadow-elevated-light` (V5 は `shadow-warm` / `shadow-luxe` / `var(--v5-shadow-*)`)

---

## 2. タイポグラフィ

### 2.1 フォントファミリー

| Tailwind class | 用途 | font-family |
|---|---|---|
| `font-sans` | UI / ボディ / ラベル | Noto Sans JP |
| `font-serif` | 見出し / 章立て / カード名 | Noto Serif JP |
| `font-display` | KPI 数字 / 時刻 / Cormorant 装飾 | Cormorant Garamond → Noto Serif JP fallback |
| `font-mono` | コード / 招待コード | Geist Mono |

### 2.2 サイズ / 用途

| Tailwind | サイズ | 用途 |
|---|---|---|
| `display-xl` | 28px / 1.3 / 500 | hero 見出し (V5 は `2.5rem` で個別指定することも多い) |
| `display-lg` | 32px / 1.2 / 700 | 旧 v2 — 互換のため残置 |
| `display-md` | 22px / 1.3 / 500 | カード見出し |
| `display-sm` | 18px / 1.4 / 500 | 副見出し |
| `body-lg` | 16px / 1.6 / 400 | 本文 |
| `body-md` | 14px / 1.6 / 400 | 本文小 |
| `body-sm` | 12px / 1.5 / 400 | 注釈 |
| `label-md` | 14px / 1 / 500 | ボタン / ラベル |
| `label-sm` | 12px / 1 / 500 | ピル / バッジ |
| `label-xs` | 11px / 1 / 500 | eyebrow / tracking-luxe ラベル |
| `kpi-xl` | 56px / 1 / 400 | Hero KPI 数字 (Cormorant) |
| `kpi-md` | 32px / 1 / 400 | KPI 数字 (Cormorant) |
| `kpi-sm` | 16px / 1 / 500 | 小 KPI / 単位 |

### 2.3 letter-spacing

| Tailwind | 値 | 用途 |
|---|---|---|
| `tracking-normal` | 0 | デフォルト |
| `tracking-wide` | 0.02em | 見出し全般 |
| `tracking-[0.04em]` | 0.04em | 見出し V5 + CTA + section title |
| `tracking-[0.06em]` | 0.06em | 時刻 / 数値 (Cormorant) |
| `tracking-[0.08em]` | 0.08em | 主要 CTA (V5) |
| `tracking-luxe` | 0.18em | eyebrow 標準 |
| `tracking-[0.20em]` | 0.20em | KPI ラベル |
| `tracking-[0.32em]` | 0.32em | "NIGHTOS" eyebrow (V5 ヒーロー) |

ALL CAPS の `tracking-wider` (0.05em〜0.10em) は禁止。eyebrow は必ず `tracking-luxe` 以上。

---

## 3. レイアウト

### 3.1 半径

| Tailwind | 値 | 用途 |
|---|---|---|
| `rounded-pill` | 999px | 主要ボタン / アクティブ tab / アバター |
| `rounded-hero` | 28px | hero / large sheet / 励ましカード |
| `rounded-card` | 22px | 通常カード / list row |
| `rounded-btn` | 16px | 入力欄 / 小ボタン (V5 では `rounded-pill` を優先) |
| `rounded-2xl` (Tailwind default) | 16px | textarea / 中サイズ |
| `rounded-sheet` | 28px 28px 0 0 | bottom sheet |
| `rounded-badge` | 999px | バッジ |

「迷ったら 1 段大きい方」が基調。

### 3.2 影

V5 では「matte philosophy」: drop shadow のみ、inset highlight 禁止。

| Tailwind / var | 値 |
|---|---|
| `shadow-soft` | 軽い浮遊感 (カード / ピル) |
| `shadow-warm` | 標準カード / TabBar |
| `shadow-luxe` | 主要 CTA / FAB / 強調 |
| `var(--v5-shadow-luxe)` | V5 専用、wine-tinted で更に深い |
| `var(--v5-shadow-warm)` | TabBar / card V5 hint |

### 3.3 セーフエリア

| 用途 | utility |
|---|---|
| 上端 | `pt-12` (44 + 4) または `.pt-safe` |
| 下端 (TabBar 上) | `.pb-safe` |
| Hero 上端 | `pt-12` (status bar 込み) |

---

## 4. コンポーネント・レシピ

### 4.1 Hero (V5 Bordeaux Salon)

`.v5-hero` ユーティリティを使う (`app/globals.css`)。

```tsx
<section className="v5-hero px-5 pt-12 pb-10">
  {/* eyebrow row */}
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-baseline gap-3">
      <span style={{ letterSpacing: "0.32em", color: "var(--v5-gold-mid)" }}>NIGHTOS</span>
      <span style={{ color: "var(--v5-ink-on-dark-mute)", letterSpacing: "0.06em" }}>
        {dateLabel}
      </span>
    </div>
    {/* bell / utility icons with v5-ring-gold */}
  </div>

  {/* 見出し: champagne-gold metallic clip serif */}
  <h1 className="font-serif font-normal v5-metallic"
      style={{ fontSize: "2.5rem", letterSpacing: "0.04em" }}>
    18:00 同伴
  </h1>

  {/* brass plate hairline */}
  <span aria-hidden className="v5-brass-line"
        style={{ width: "32ch", maxWidth: "60%", marginBottom: 14 }}/>

  {/* 副情報 */}
  <p style={{ color: "var(--v5-ink-on-dark-soft)" }}>...</p>

  {/* 主要 CTA — full width, no secondary */}
  <Link className="v5-cta-primary w-full h-[52px] rounded-pill ..." />
</section>
```

`.v5-hero` には上端 (1px champagne-gold) と下端 (horizon hairline) の brass edge が自動で付く。

### 4.2 さくらママカード (dark bordeaux)

`.v5-sakura-surface` を使う。Hero と地続きの暗ボルドー。

- 写真は **champagne-gold metallic padded フレーム + bordeaux 内縁**
- 見出しは **v5-metallic** (champagne-gold clip + drop-shadow)
- eyebrow は `tracking-[0.32em]` + `--v5-gold-mid`
- 本文は serif、`var(--v5-ink-on-dark)`

### 4.3 KPI タイル (pearl glass, Hero と seam overlap)

- 背景 `rgba(253,248,240,0.82)` + backdrop-blur 16
- 上端に 2px の **champagne-gold metallic hairline** (`--v5-champ-gold` 70% opacity)
- 数字は Cormorant Garamond, tracking 0.02em, tabular-nums
- ラベルは tracking 0.20em
- Hero 直下に `-mt-9` でオーバーラップ配置 — **StoreMessageBanner や他の要素を間に挟まないこと**

### 4.4 Priority Stack (フォロー対象カード)

- pearl-light/glass + 左 4px **champagne-gold metallic ribbon**
- 上位 2 件は `var(--v5-shadow-warm)`, 残りは `shadow-soft`
- アバター: **champagne-gold metallic 枠 + pearl-light 中身**, serif イニシャル
- CTA: `bg-wine-deep` solid / `border border-wine-deep` outline
- VIP バッジ: `.v5-ring-gold` (masked champagne-gold metallic 細枠) — 塗りなし

### 4.5 ボタン (`components/nightos/button.tsx`)

| variant | 見た目 |
|---|---|
| `primary` | `bg-wine-deep text-pearl-light` + `shadow-warm` |
| `secondary` | `bg-pearl-light text-wine-deep` + `border border-line-strong` |
| `outline` | `bg-transparent text-wine-deep` + `border border-wine-deep` |
| `ghost` | `text-ink-soft hover:bg-pearl-soft` |
| `ruri` | primary と同義 (legacy alias) |

V5 Hero 内の主要 CTA だけ例外で **champagne-gold solid + dark text (反転)**:
```tsx
<Link className="v5-cta-primary ..." />
```

### 4.6 TabBar (3 ロール共通)

- 背景 `rgba(247,238,221,0.82)` (champagne-warm pearl) + backdrop-blur
- ボーダー `rgba(140,111,68,0.18)`
- アクティブ: 文字 `text-wine-deep`, 上端 **champagne-gold metallic underline** (28px × 2px)
- 非アクティブ: `text-ink-mute`

### 4.7 PageHeader

- sticky top + `rgba(247,238,221,0.92)` 半透明
- 下端 1px champagne ボーダー
- 見出しは `font-serif text-[20px] tracking-[0.04em]`
- 戻るボタン + 右側 slot

---

## 5. ヒーローの内容ルール (案 A 基準)

Hero は **見出し1つを最も重要な情報に当てる**。「Tonight」のような曖昧な装飾語は禁止。

### 採用パターン (cast/home)

1. **今夜のスケジュール (現行)** — 「18:00 同伴」+ 顧客名/会場 + 残りの予定
2. 今月の進捗 — 「24.8万円 / 30万」(候補 B)
3. 今日のミッション — 「7件」(候補 C)
4. 今日の主役 — 「田中 太郎さま」(候補 D)

### 禁止パターン

- "Tonight" / "Welcome" のような汎用挨拶
- 「いってらっしゃい」など内容ゼロの励まし
- 副 CTA の「あとで」(機能なし)

### 副 CTA の扱い

主要 CTA のみ全幅で配置するのを基本。副 CTA を置くのは:
- ホームへの戻り / dismiss など明確な意味がある
- かつ高頻度操作 (週 1-2 回より多い)

その両方を満たさない場合は副 CTA を置かず、主要 CTA を全幅にしてその下の情報密度で視覚バランスを取る。

---

## 6. 装飾ルール

### 6.1 必ず使う

- **brass hairline**: 見出しの下、Section の境目。`v5-brass-line` (champagne-gold gradient, 1px)
- **eyebrow**: 見出しの上、`tracking-luxe` 以上 + `--v5-gold-mid` or `text-wine-deep`
- **左 ribbon**: Section header の左 3px **champagne-gold metallic**
- **上端 hairline**: KPI タイルの上 2px **champagne-gold metallic 70%**
- **Cormorant numerals**: 数字は必ず Cormorant Garamond (時刻 / KPI / カウント)

### 6.2 控えめに使う

- shadow: 必ず `shadow-warm` / `shadow-luxe` / `var(--v5-shadow-*)`、自作禁止
- backdrop-blur: glass のみ `16px saturate(140%)`、glass 以外で使わない

### 6.3 禁止

- 大面積メタリック塗り (champagne-gold を背景全面に貼らない、必ずクリップかリボン)
- text-shadow / box-shadow を CSS で直接書く (token を使う)
- 蛍光色 / ネオン
- 透過率 < 0.4 の glass (背景が透けすぎ可読性低下)

---

## 7. AI テンプレ感の排除

- emoji を装飾に使わない (バッジに 🌸 等は OK、見出しは NG)
- "✨" / "🎉" を CTA に置かない
- Gemini / GPT 風の白カード + 紫グラデを避ける
- 数字は Cormorant Garamond、商用 sans-serif の数字は KPI で使わない

---

## 8. ライティング指針

| やる | 避ける |
|---|---|
| 「18:00 同伴」 | 「Tonight」 |
| 「目標まで残り 5.2 万」 | 「もう少し！」 |
| 「次の出勤 3 日後」 | 「お休みです」 |
| 「LINE 文面を作る」 | 「メッセージを生成」 |
| 「{name}さま」 | 「{name}さん」 (キャスト → 顧客は「さま」) |

---

## 9. アクセシビリティ

- 主要 CTA `bg-wine-deep` (#5E3838) on `pearl-light` (#fdfcf9) → 約 8.5:1 (AAA)
- `bg-champ-gold` (中央 #C8A672) on `bordeaux-deep` (#2D1818) → 約 8.6:1 (AAA)
- `--v5-gold-on-dark` (#EBD9A8) on `bordeaux-deep` (#2D1818) → 約 10.5:1 (AAA)
- 文字サイズ最小 11px、tracking-luxe 以上を併用
- focus ring: `var(--ring)` (3px gold 35% transparent)

---

## 10. 参照実装

- **Hero**: `features/cast-home/components/cast-home-hero.tsx` (案 A — 今夜のスケジュール)
- **トークン**: `tailwind.config.ts` + `app/globals.css` (`:root` の `--v5-*` 群)
- **ユーティリティ**: `app/globals.css` の `.v5-hero`, `.v5-sakura-surface`, `.v5-metallic`, `.v5-brass-line`, `.v5-cta-primary`, `.v5-cta-ghost`, `.v5-ring-gold`, `.v5-line-divider`
- **共通プリミティブ**:
  - `components/nightos/button.tsx`
  - `components/nightos/stat-card.tsx`
  - `components/nightos/card.tsx`
  - `components/nightos/page-header.tsx`
  - `components/nightos/badge.tsx`
  - `components/nightos/{cast,customer,store}-tab-bar.tsx`
- **トークン早見表**: `docs/design/TOKENS.md`
- **Claude Design ソース**: `docs/design/v6/cast-home-v5.jsx` (V5 Bordeaux Salon リファレンス)

---

## 11. ガードレール

新規 UI 実装時の自己チェック:

1. **Hero に "Tonight" 級の汎用語を置いていないか**
2. **見出しは serif (Noto Serif JP / Cormorant) か**
3. **eyebrow に `tracking-luxe` 以上を当てているか**
4. **数字は `font-display` + `tabular-nums` か**
5. **brass hairline / 左 ribbon を要所に置いたか**
6. **金色は塗らずグラデで使ったか**
7. **legacy class (amethyst / blush / shadow-glow / gradient-rose-gold / text-rose / text-amber / text-emerald) を入れていないか**
8. **`npm run check:design` をパスするか** (legacy class 検知)

---

このガイドラインは V5 Bordeaux Salon (採用 2026-05-30) に準拠。今後 UI を変更する際は本書を最新版に更新したうえでコードに反映すること。
