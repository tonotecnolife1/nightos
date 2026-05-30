# NIGHTOS デザイントークン早見表

V5 Bordeaux Salon 準拠 (2026-05-30 採用)。詳細は `design.md` を参照。

---

## 「これを書きたい」→「このクラス」

### Hero (dark wine 背景)

| やりたいこと | 書くもの |
|---|---|
| Hero 全体 | `<section className="v5-hero px-5 pt-12 pb-10">` |
| 上下 brass hairline | `.v5-hero` が自動で `::before` / `::after` で付与 |
| eyebrow "NIGHTOS" | `style={{ letterSpacing: "0.32em", color: "var(--v5-gold-mid)" }}` |
| 日付ラベル | `font-display` + `letterSpacing: "0.06em"` + `var(--v5-ink-on-dark-mute)` |
| 主見出し (Tonight 級) | `font-serif font-normal v5-metallic` + `fontSize: "2.5rem"` |
| 見出し下の brass hairline | `<span className="v5-brass-line" />` |
| 副文 | `style={{ color: "var(--v5-ink-on-dark-soft)" }}` |
| 時刻 (大) | `font-display tabular-nums` + `color: "var(--v5-gold-on-dark)"` |
| Hero 内の主要 CTA | `<Link className="v5-cta-primary w-full h-[52px] rounded-pill" />` |
| Hero 内の副 CTA (なるべく置かない) | `<button className="v5-cta-ghost h-[50px] rounded-pill" />` |
| Hero 内 icon の gold ring | `<button className="v5-ring-gold">` |
| schedule 行の divider | `<div className="v5-line-divider">` |

### さくらママカード (dark bordeaux 背景)

| やりたいこと | 書くもの |
|---|---|
| カード全体 | `<div className="v5-sakura-surface rounded-hero p-5">` |
| 写真フレーム | champagne-gold padded ring → bordeaux 内縁 (`docs/design/v6/cast-home-v5.jsx` 参照) |
| 見出し | `font-serif v5-metallic` |
| eyebrow | `letterSpacing: "0.32em"` + `color: "var(--v5-gold-mid)"` |
| 本文 | `font-serif` + `color: "var(--v5-ink-on-dark)"` |

### 通常のページ (champagne-tinted pearl 背景)

| やりたいこと | 書くもの |
|---|---|
| 主要 CTA | `<Button variant="primary">` (= `bg-wine-deep text-pearl-light shadow-warm`) |
| 副 CTA | `<Button variant="secondary">` |
| outline CTA | `<Button variant="outline">` |
| ghost link | `<Button variant="ghost">` |
| Section header | 左 ribbon `<span style={{ background: "var(--v5-champ-gold)" }}>` + `font-serif tracking-[0.04em]` |
| Section の count 数字 | `font-display tabular-nums text-wine-deep` |
| Section の eyebrow ("優先度順" 等) | `text-label-xs tracking-luxe text-ink-mute uppercase` |
| KPI タイル | `<StatCard tone="rose|amethyst|wine|default" />` (自動で上端 champagne hairline + Cormorant 数字) |
| Card | `<Card>` (= pearl-light/85 glass + shadow-soft) |
| GemCard (radial halo) | `<GemCard>` |
| MemoCard (pink dashed) | `<MemoCard title="...">` |
| Badge VIP | `<Badge tone="vip">` (= `.v5-ring-gold` champagne-gold masked) |
| Badge 新規/誕生日 | `<Badge tone="new|birthday">` (= wine 系) |
| EmptyState | `<EmptyState tone="default|amethyst|rose" />` |
| Bottom TabBar | `<CastTabBar />` / `<CustomerTabBar />` / `<StoreTabBar />` |

### テキスト

| やりたいこと | 書くもの |
|---|---|
| 主テキスト (light 地) | `text-ink` |
| 副テキスト (light 地) | `text-ink-soft` |
| 三次テキスト (light 地) | `text-ink-mute` |
| 主テキスト (dark 地) | `style={{ color: "var(--v5-ink-on-dark)" }}` |
| 副テキスト (dark 地) | `style={{ color: "var(--v5-ink-on-dark-soft)" }}` |
| eyebrow gold | `style={{ color: "var(--v5-gold-mid)", letterSpacing: "0.32em" }}` |
| metallic clip 見出し | `className="v5-metallic"` (drop-shadow 込) |

### State

| やりたいこと | 書くもの |
|---|---|
| 達成 / 完了 | `text-success` / `bg-success/15` / `border-success/25` |
| 注意 / 期限 | `text-warning` / `bg-warning/15` / `border-warning/30` |
| エラー / 削除 / VIP 強調 | `text-wine-deep` / `bg-wine/10` / `border-wine/25` |

### 影 / 半径

| やりたいこと | 書くもの |
|---|---|
| 軽い浮遊 | `shadow-soft` |
| 標準カード | `shadow-warm` |
| 主要 CTA / FAB | `shadow-luxe` |
| V5 専用 wine-tinted | `style={{ boxShadow: "var(--v5-shadow-luxe)" }}` |
| ボタン半径 | `rounded-pill` |
| カード半径 | `rounded-card` (22px) |
| Hero / 大カード | `rounded-hero` (28px) |

### 数字 / 時刻

| やりたいこと | 書くもの |
|---|---|
| KPI 数字 | `<span className="font-display tabular-nums">` (= Cormorant Garamond) |
| 時刻 (Hero) | 同上 + `color: "var(--v5-gold-on-dark)"` + `tracking-[0.04em]` |
| カウント | `font-display tabular-nums text-wine-deep` |

---

## ❌ 禁止クラス (新規追加禁止)

```
✗ bg-roseGold-deep / text-roseGold-deep / border-roseGold-deep
✗ bg-blush-deep / text-blush-deep / bg-blush-soft
✗ bg-amethyst / text-amethyst-dark / bg-amethyst-muted / border-amethyst-border
✗ bg-bg / bg-bg-card / text-text-primary / text-text-secondary
✗ bg-gradient-rose-gold / bg-gradient-amethyst / bg-gradient-blush / bg-gradient-hero
✗ shadow-glow-amethyst / shadow-glow-rose / shadow-soft-card / shadow-elevated-light
✗ rose-gradient / ruri-gradient (CSS class)
✗ text-rose / bg-rose/* (Tailwind デフォルト rose ではなく)
✗ text-amber / bg-amber/* (semantic 'warning' を使う)
✗ text-emerald / bg-emerald/* (semantic 'success' を使う)
✗ text-pearl (= text-pearl-light に統一)
```

代替表:

| 旧 | V5 |
|---|---|
| `bg-roseGold-deep text-pearl-light` | `bg-wine-deep text-pearl-light` |
| `text-roseGold-deep` | `text-wine-deep` |
| `bg-blush-soft` | `bg-roseGold-soft/60` (legacy alias 経由でも) |
| `bg-amethyst-muted` | `bg-champagne-soft/60` |
| `text-amethyst-dark` | `text-gold-deep` |
| `bg-gradient-rose-gold` | `bg-rose-gold-metallic` |
| `bg-gradient-amethyst` | `bg-gold-metallic` |
| `shadow-glow-amethyst` | `shadow-luxe` |
| `text-rose` / `bg-rose/10` | `text-wine-deep` / `bg-wine/10` |
| `text-amber` / `bg-amber/15` | `text-warning` / `bg-warning/15` |
| `text-emerald` / `bg-emerald/15` | `text-success` / `bg-success/15` |
| `rose-gradient` (CSS) | `bg-roseGold-deep` (今は wine-deep alias) |
| `bg-amethyst text-pearl` | `bg-wine-deep text-pearl-light` (or `bg-gold-deep text-pearl-light`) |

---

## 自動検査

`npm run check:design` で禁止クラスの混入を検知できます。CI で必須。
