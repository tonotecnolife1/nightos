# NIGHTOS 本番リリース 残タスク

実装/コードレベルで本番化に必要なタスクを優先度別にまとめる。
（UI ブラッシュアップは別途）

凡例: 🔴 ブロッカー / 🟡 必須 / 🟢 推奨 / 🔵 運用

---

## 🔴 ブロッカー — これがないと本番デプロイ不可

### B1. Supabase スキーマを本番 DB に適用
`supabase/migrations/` の 002〜006 を本番プロジェクトの SQL Editor で順次実行。
特に **006 は前回 fix で追加**したもので、これを当てないと新規登録の店舗作成が落ちる。

- [ ] 002_nightos_schema.sql
- [ ] 003_schema_additions.sql（`auth_user_id` 等を追加）
- [ ] 004_team_chat.sql
- [ ] 005_customer_region.sql
- [ ] 006_signup_rls_fix.sql（**最重要 — RLS off + grant**）
- [ ] migration 適用後、`select * from nightos_casts limit 1` 等で各テーブル疎通確認

### B2. 本番環境変数を Vercel Production に設定
`.env.example` の通り。Production と Preview の両方で同じ値。

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`（**サーバーサイドのみ**。Public 設定にしないこと）
- [ ] `ANTHROPIC_API_KEY`（さくらママ AI / 名刺OCR / メモ抽出が依存）
- [ ] `NIGHTOS_DISABLE_MOCK_AUTH=true`（**未設定だとデモログインが本番で生きてしまう**）

### B3. デモ専用エンドポイントを本番から遮断
**現状リスク**: `/setup` ページと `/api/setup-auth` が `secret=nightos-setup-2026` という**ハードコード文字列**でのみ保護されている。URL を知る人なら誰でも `nightos2026` というパスワードで `cast1〜cast_oneesan4` のテストユーザーを生成できる。

- [ ] `app/api/setup-auth/route.ts` に `if (process.env.NODE_ENV === "production") return 404;` または **強い env secret 必須**化
- [ ] `app/api/setup/route.ts` も同様
- [ ] `app/setup/page.tsx` を本番ビルドで除外（または env ガード）
- [ ] 同梱の `mockCasts` import を本番 bundle に入れない方針を決める（dynamic import + env 分岐）

### B4. 主要機能の Supabase 永続化が未実装
**現状**: 40 個の query 関数のうち **9 個が mock 専用**。本番でも in-memory mock data に書き、サーバー再起動・別インスタンスで消える。複数ユーザー同士でデータが混線する。

mock 専用のまま残っている機能（要 real impl 追加）:

- [ ] `getCustomerCoupons`（来店客のクーポン一覧）
- [ ] `getCustomerStoreOverviews`（来店客 home の店舗別サマリ）
- [ ] `getCustomerBottleViews`（来店客のキープボトル一覧）
- [ ] `sendCastMessage` / `getUnreadCastMessages` / `markCastMessageRead`（店舗→キャスト連絡）
- [ ] `sendCastRequest` / `getUnresolvedCastRequests` / `resolveCastRequest`（キャスト→店舗依頼）
- [ ] `getDouhanSummary`（同伴サマリ）

→ 各機能について `lib/nightos/supabase-real.ts` に `〜Real` を実装、`supabase-queries.ts` で `withFallback` に組み込む。
→ 必要なテーブルが未作成なら migration 007 で追加。

### B5. RLS 方針の確定 ✅ 決定: **off で運用**
`006_signup_rls_fix.sql` + `007_b4_rls_extra_tables.sql` で全テーブル off。
権限チェックは Server Action / 認証 cookie 経由で行う前提（`getCurrentCast()`
や `auth_user_id` ベースの絞り込み）。本番化で再検討する場合は migration
006/007 のコメントアウト済みポリシーを足場に policy を書き起こす。

- [x] 方針決定済み: **RLS off**
- [x] migration 006 / 007 が実装済み

### B6. デモ tenancy が本番に紛れない仕組み ✅ 決定: **本番にデモを入れない**
`DEMO_STORE_IDS` `DEMO_CAST_IDS` のシードを本番 DB に投入しない。

- [x] 方針決定済み: **本番でシード投入しない**
- [x] `/api/setup` は B3 で `NIGHTOS_SETUP_SECRET` 必須化済み。本番で env を
      設定しなければシード投入そのものが不可能 → 自然に対策完了
- [x] フロントの「デモを試す」ボタンは `NIGHTOS_DISABLE_MOCK_AUTH=true` で
      非表示になることを確認 → **B2 デプロイ後に動作確認すること**

---

## 🟡 必須 — リリース当日までに

### M1. 認証フローの完全動作確認
- [ ] Supabase Auth の **Email Confirmation 設定**を決定（Dashboard → Authentication → Email Auth → Confirm email）
- [x] パスワードリセット導線 — `/auth/reset-password` + `/auth/update-password` 実装済み（ログイン画面から導線）
- [x] パスワード変更フロー — `/settings` から `/auth/reset-password` に誘導（同じリセット導線で対応）
- [x] 退会／アカウント削除フロー — `/settings` 実装済み（`SUPABASE_SERVICE_ROLE_KEY` が必要）
- [ ] メールアドレス変更フロー — Supabase Dashboard で `supabase.auth.updateUser({ email })` のメール確認設定済みなら導線追加だけで済む。次バッチ

### M2. 法務ページ
- [x] プライバシーポリシー — `/legal/privacy`（**雛形**。〔事業者名〕等を本番情報に置換要）
- [x] 利用規約 — `/legal/terms`（雛形）
- [x] 特定商取引法表記 — `/legal/tokutei`（雛形）
- [x] ログイン画面・新規登録画面の下に 3 リンクを設置済み
- [ ] Cookie 同意バナー（個人情報の Cookie 利用がある場合）— 次バッチ

### M3. エラー追跡 / ログ
- [x] エラーレポーター shim 追加（`lib/nightos/error-reporter.ts`）— Vercel Logs に構造化 JSON で出力。Sentry に切替時はファイル内のコメント参照
- [x] `app/error.tsx` / `app/global-error.tsx` を v2 デザインに刷新 + reportError 呼び出し
- [x] Server Action の `console.error` を `reportError` に統一（onboarding / deleteAccount）
- [x] `/api/setup-auth` のテストアカウント情報は B3 で env 必須化したので、シークレット非公開
- [ ] **Sentry の SDK を入れる**（vendor 選定後）— 次バッチ

### M4. AI 機能の本番モード切替
- [ ] `ANTHROPIC_API_KEY` を Vercel Production に設定（手順は `supabase/MIGRATE.md` B2）
- [ ] レート制限 / コスト上限（Anthropic console 側で月額上限を設定推奨）
- [ ] AI 応答の保存ポリシー（Anthropic はデフォルト学習に使わない。プライバシーポリシー §4 に記載済）

### M5. 本番ドメイン & SSL
- [x] `metadata.metadataBase` を `NEXT_PUBLIC_APP_URL` 経由に変更（`app/layout.tsx`）
- [x] OpenGraph siteName / locale / robots を追加（リリース前 `index: false`）
- [ ] 独自ドメイン取得・Vercel に紐付け
- [ ] `NEXT_PUBLIC_APP_URL` を Vercel env に設定
- [ ] OG 画像（`/opengraph-image.png` または `app/opengraph-image.tsx`）
- [ ] favicon の本番版
- [ ] Manifest の `name` / `short_name` / `start_url` 確認
- [ ] 公開タイミングで `metadata.robots` を `{ index: true, follow: true }` に上書き

### M6. データ取り扱い
- [ ] 本番 Supabase の **Point-in-time Recovery** 有効化（Pro プラン必要）
- [ ] バックアップの定期取得（Supabase Dashboard → Database → Backups）
- [ ] 顧客個人情報（氏名・誕生日・職業・LINE スクショ）の保管方針 → プライバシーポリシー §2, §6 で定義済
- [ ] スクショ画像のストレージ場所（`line_screenshots.image_data` は base64 で DB に保存中。サイズ大きい場合は Supabase Storage へ移行検討）
- [ ] 退会時のデータ削除動作テスト（M1b の deleteAccount を実 DB で疎通確認）

---

## 🟢 推奨 — リリース直後〜1ヶ月内

### R1. UI ブラッシュアップ（design.md §7 残）
※ 後でやる宣言済み。残スコープ:
- [ ] cast home の SummaryCards / DouhanTracker / FollowTargetList サブコンポーネント
- [ ] store dashboard / funnel / douhan-pace
- [ ] sakura-mama 画面 / customer-card 詳細
- [ ] mama 系画面群

### R2. テスト
- [x] E2E テスト雛形（Playwright）— `e2e/` に配置、`playwright.config.ts` 追加
  - [x] auth.spec.ts: ログイン UI / 新規登録フォーム / 法務ページ / デモログイン (顧客 + キャスト 5名)
  - [ ] 店舗作成 → 顧客登録 → 来店登録（要 Supabase 接続のため別 suite に分割）
  - [x] デモログイン 4 役割（customer 動作確認 + cast 5 ペルソナの可視性）
- [x] 既存 vitest 83 件（CSV 6 件含む）パス
- [ ] **ローカルで `@playwright/test` インストール → `npx playwright test` 実行で疎通確認**

### R3. オンボーディング UX
※ UI ブラッシュアップが先と決定済み。ブラッシュアップ後に再着手。
- [ ] サインアップ後の最初のチュートリアル
- [ ] サンプルデータ生成オプション（個人 demo 用）
- [ ] 各画面のヘルプテキスト / FAQ

### R4. パフォーマンス
- [x] パフォーマンス監査ノート — `PERF_NOTES.md` に既知の懸念 6 件と着手順を整理
- [ ] 本番ドメイン稼働後に Lighthouse / Vercel Analytics で実測
- [ ] mock-data.ts (~100KB) の動的ロード化（実測後の優先度次第）
- [ ] apple-touch-icon PNG 化
- [ ] `next/font/google` 移行（Noto Serif JP の LCP 影響評価次第）

### R5. 機能完備
- [ ] 通知（プッシュ / メール）— launch 後の優先機能
- [x] PWA インストール導線 — `components/nightos/install-prompt.tsx`
      - Android / Edge: `beforeinstallprompt` をキャプチャしてシート表示
      - iOS Safari: 「共有 → ホーム画面に追加」ヒントを 4秒後に表示
      - 14 日間の dismiss 記憶
      - manifest の theme_color / background_color を v2 トークンに
- [x] CSV エクスポート — `lib/nightos/csv.ts` + `CsvDownloadButton`
      - 顧客一覧 / 来店履歴 / ボトル管理の 3 画面に配置
      - UTF-8 BOM 付き（Excel for JP で 文字化けしない）
      - 検索フィルタ後の rows のみエクスポート（顧客一覧）
- [ ] PDF / 印刷用レイアウト

---

## 🔵 運用 — リリース後継続

### O1. 監視・アラート
- [x] 推奨アラート設定の早見表 — `OPS_RUNBOOK.md` §D1
- [x] ログ集約方針（Vercel Function Logs → 構造化 JSON `[nightos:error]` で grep）— §D2
- [ ] **Vercel Cron** で `/api/health` を 5 分おきに叩いて Slack/Discord に通知（要 webhook URL 取得）
- [ ] Anthropic console で月額予算アラート設定
- [ ] Supabase Reports でエラーレートのアラート

### O2. インシデント対応
- [x] 症状逆引き runbook — `OPS_RUNBOOK.md` §A
- [x] データ復旧手順 — `OPS_RUNBOOK.md` §B
- [x] セキュリティインシデント手順（service_role 漏洩 / anon key 漏洩 / setup endpoint 誤公開）— §C
- [x] デプロイ・ロールバック手順 — §E
- [ ] **連絡先テンプレート** (`OPS_RUNBOOK.md` §F) を実情報に置換
- [ ] セキュリティ脆弱性開示窓口メールアドレスの取得

### O3. ドキュメント
- [x] `README.md` に「本番運用ドキュメント」リンクと環境変数表を追加
- [x] migration 適用手順 — `supabase/MIGRATE.md`（B1 で作成済み）
- [x] **`DEPLOY_RUNBOOK.md`** — 初回デプロイ 30〜45 分の手順書
- [x] **`OPS_RUNBOOK.md`** — 障害対応・データ復旧・セキュリティ・月次オペ
- [x] `PERF_NOTES.md` — パフォーマンス監査メモ（R4 で作成済み）
- [x] `design.md` — UI/デザイン指針
- [x] 環境変数表のメンテ — README に追加 + `.env.example` に最新コメント

---

## まとめ

| Tier | 状態 |
|------|------|
| 🔴 ブロッカー (B1-B6) | コードレベル完了 (B1/B2 はユーザー側ダッシュボード操作のみ) |
| 🟡 必須 (M1-M6) | 約 90% (Sentry SDK / 法務雛形→本番値 / OG 画像 / 独自ドメイン残) |
| 🟢 推奨 (R2/R4/R5) | R3 (オンボーディング UX) 以外完了 |
| 🔵 運用 (O1-O3) | ドキュメント完了。Vercel Cron / Anthropic アラート設定はユーザー操作 |

**復帰時にやることは `DEPLOY_RUNBOOK.md` 1 つを上から順に**。
本番稼働中に異常があれば `OPS_RUNBOOK.md` で症状逆引き。
