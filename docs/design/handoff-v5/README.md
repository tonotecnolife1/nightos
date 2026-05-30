# Claude Design 受け渡しセット — V5 Bordeaux Salon (clean seed)

このフォルダは **Claude Design (`claude.ai/design`) の新規プロジェクトに丸ごとドラッグするための、正典だけを集めた clean なコンテキスト**です。

旧 `docs/design/v6/` には V3 / 旧パレットの混在ファイル
(`reference/design-preview-v3.html`, `colors_and_type.css`, v5 以外の `cast-*.jsx` 等) が
残っており、それを context に与えると Claude Design が古いスタイルに引っ張られます。
このフォルダにはその汚染源を **一切含めていません**。

最終更新: 2026-05-30

---

## 使い方

1. `claude.ai/design` で **新規プロジェクト**を作る (既存の "NIGHTOS Design System" は旧ファイル混在のため使わない)
2. このフォルダ (`handoff-v5/`) を **そのままドラッグ＆ドロップ**して context にする
3. 下の「CTA 改善プロンプト」を貼って生成
4. 生成結果は本番へ移植する (移植は Claude Code 側で対応可能)

---

## 含まれるファイルと役割

| ファイル | 役割 | 優先度 |
|---|---|---|
| `design.md` | V5 Bordeaux Salon の正典。原則・禁止事項・Hero ルール | ★最優先 |
| `TOKENS.md` | どのクラスをいつ使うかの早見表 | ★ |
| `globals.css` | **本物の** `--v5-*` トークンと `.v5-*` ユーティリティ | ★ |
| `tailwind.config.ts` | クラス解決・semantic token | |
| `cast-home-v5.jsx` | 唯一の V5 コンポーネント参照実装 | ★ |
| `cast-home-hero.tsx` | 現在の本番 Hero 実装 (現状把握用) | |

> ⚠️ `colors_and_type.css` は旧パレットなので **意図的に除外**しています。色は `globals.css` の `--v5-*` が source of truth。

---

## CTA 改善プロンプト (コピペ用)

```
cast-home-v5.jsx の Hero 最下部「スケジュールを見る」CTA を改善して。

問題: 今は champagne-gold ソリッドの全幅バーで、ゴールドの面積が大きく
視覚的に重い。中央寄せ自動幅の単独 pill にしても宙に浮いて見える。

制約 (design.md / CLAUDE.md 準拠):
- gold は塗りに使わず clip / ribbon / hairline 寄りで使う
- 機能のない「あとで」副ボタンは置かない (CLAUDE.md §1.4 で明文禁止)
- 主 CTA 単独で成立させる。軽さは中央寄せ自動幅か wine-deep 系の
  落ち着いた配色 + brass hairline で出す
- Hero は dark wine 地。CTA は反転 (gold solid + dark text) が既定だが、
  面積を絞るか wine-deep + pearl text の落ち着いた版も候補

出力: cast-home-v5.jsx と同じ構成・トークンで、CTA 部分の改善案を
2-3 パターン。各案の狙い (なぜ重さが解消するか) も短く添えて。
```

---

## 本番への移植 (Claude Code 側)

生成された JSX を貼ってもらえれば、Claude Code 側で:

1. `features/cast-home/components/cast-home-hero.tsx` (Next.js / Tailwind / `Link`) へ移植
2. `design.md` の Hero CTA レシピ・副 CTA 方針を新デザインに整合更新
3. `npm run build` / `npm test` / `npm run check:design` で検証
4. ブランチ commit → `main` マージ → push (Vercel 自動デプロイ)

まで対応します。
