# NIGHTOS Design System v6 (Claude Design export)

このディレクトリは Claude Design (`claude.ai/design`) で作成した v6 デザイン一式の参照用エクスポートです。
ビルドには含まれません。本番コード (`app/`, `features/`, `components/`, `tailwind.config.ts`, `app/globals.css`) への移植時の参照ソースとして使用します。

## 含まれるもの

- 各 Cast 画面の HTML / JSX ペア (cast-home, cast-chat, cast-customers, cast-schedule, cast-stats, cast-my, cast-templates, cast-sakura-mama 等)
- `component-sheet.html`: デザインシステム総覧
- `colors_and_type.css`: 色 / typography トークン (CSS)
- `preview/`: パレット・タイポ・コンポーネント・スペーシングの個別プレビュー
- `reference/`: Claude Design に渡した既存 repo のミラー (tailwind.config.ts / globals.css / design.md)
- `assets/`: ruri-mama / sakura-mama 画像
- `ui_kits/cast/`: iOS フレーム入りの Cast 画面束

## 含まれないもの (今後追加予定)

- Customer / Store / Mama / Auth / Onboarding 画面の v6 デザイン
