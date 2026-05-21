# NIGHTOS

夜のお店（キャバクラ・ラウンジ・クラブ）向けワークスペースの検証版 MVP。
**「店舗が入力 → お姉さん/ママが育成 → キャストが活用」** のデータフローが動作します。

> **本番運用ドキュメント** (リリース時に必読)
> - `RELEASE_CHECKLIST.md` — 残タスク優先度別一覧
> - `DEPLOY_RUNBOOK.md` — 初回デプロイ 30〜45 分手順
> - `OPS_RUNBOOK.md` — 障害時の症状別対応
> - `supabase/MIGRATE.md` — DB マイグレーション詳細
> - `PERF_NOTES.md` — パフォーマンス改善メモ
> - `design.md` — UI / デザイン指針

---

## 動作モード

NIGHTOS は 3 つのモードを自動で切り替えます。

| モード | トリガー | 用途 |
|---|---|---|
| **モック** | 環境変数なし | ローカル開発・デモ |
| **Supabase 接続** | `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 永続化テスト |
| **AI (Claude)** | `ANTHROPIC_API_KEY` | さくらママの実応答（他 2 モードと併用可） |

どのモードでも UI は同一。クエリ層 (`lib/nightos/supabase-queries.ts`) が env を見て切り替えます。

---

## 1分で動かす（モック / ローカル）

```bash
git clone https://github.com/tonotecnolife1/nightos.git
cd nightos
npm install
npm run dev
```

ブラウザで **http://localhost:3000** → 自動で `/auth/login` に遷移  → キャストを選んでログイン。
環境変数の設定は**一切不要**です。

- モックデータで全画面が動作（in-memory）
- さくらママ AI は API キーなしでもペルソナ準拠のスタブ応答
- ログアウトはアプリ右上の「切替」から

---

## Vercel デプロイ手順（最短）

本リポジトリの `main` ブランチが Vercel に自動デプロイされる構成です。

1. https://vercel.com/new で `tonotecnolife1/nightos` をインポート
2. Production Branch = `main`
3. Environment Variables は空のままでも動作します（モックモード）
4. Deploy → `https://<your-project>.vercel.app`

`/` にアクセスすると `/auth/login` にリダイレクトされ、キャスト選択後にアプリへ入ります。

### 開発ブランチを検証したい時

Vercel は PR ごとに Preview URL を自動発行します。`claude/nightos-mvp-development-nQHc4` 等の作業ブランチに push すると、コメントに Preview URL が貼られます。

---

## Supabase 実接続モード（永続化テスト）

モックは「タブを閉じたら消える」ので、複数ユーザーで同じデータを見たいときは Supabase に接続します。

### 手順

1. **Supabase プロジェクト作成** (https://supabase.com/dashboard)
2. **SQL Editor** で `supabase/migrations/` 配下を **番号順** に実行:

   | 順 | ファイル | 役割 |
   |----|---------|------|
   | 1 | `002_nightos_schema.sql` | 主要テーブル |
   | 2 | `003_schema_additions.sql` | `auth_user_id` 等を追加 |
   | 3 | `004_team_chat.sql` | チームチャット |
   | 4 | `005_customer_region.sql` | `customers.region` 追加 |
   | 5 | `006_signup_rls_fix.sql` | **🔴 必須** — RLS off + grant (新規登録のため) |
   | 6 | `007_b4_rls_extra_tables.sql` | **🔴 必須** — クーポン / 連絡 / 同伴 等の RLS off |

   いずれも `if not exists` / `if exists` 付きで冪等。詳細は `supabase/MIGRATE.md`。

3. **env 設定** (`.env.local` またはVercel):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```

4. **テストデータ投入** (任意 — 個人検証用のみ。**本番では実行しない**):
   - 環境変数 `NIGHTOS_SETUP_SECRET=<openssl rand -hex 24 で作った値>` を設定
   - `/setup?secret=<その値>` を開く → 「テストデータを投入」
   - シークレット未設定 / クエリ不一致だと **404**（本番では未設定にしてエンドポイントを隠す）

5. **動作確認**: `/auth/login` → 新規登録 or 「デモを試す」

---

## 本物のさくらママ (Claude API) を有効化

```bash
cp .env.example .env.local
# .env.local に ANTHROPIC_API_KEY=sk-ant-... を設定
```

Vercel の場合は Environment Variables に `ANTHROPIC_API_KEY` を追加するだけ。

- モデル: `claude-haiku-4-5-20251001`（コスパ重視。約 $0.005/回）
- システムプロンプト: `features/sakura-mama/data/system-prompt.ts`
- キー無効・通信失敗時はスタブ応答に自動フォールバック

---

## 認証について

NIGHTOS は 2 つのログイン方式を併用しています。

### デモモード（キャスト選択 / mock-auth）
- `/auth/login` の「デモを試す」から **キャスト / 店舗スタッフ / 店舗オーナー / 来店客** の 4 ロールを選択
- httpOnly cookie `nightos.mock-cast-id` を発行
- 環境変数なしで動作

### 実モード（メール / パスワード）
- Supabase Auth を使用
- 新規登録: `/auth/signup` → onboarding (`/onboarding`) で店舗 / 役割 / 源氏名
- パスワード再設定: `/auth/reset-password` → `/auth/update-password`
- アカウント設定 / 退会: `/settings`
- テスト Auth ユーザーの一括作成: `/api/setup-auth?secret=$NIGHTOS_SETUP_SECRET`（**本番では env 未設定にしてエンドポイントを 404 化**）

`middleware.ts` がどちらの cookie でも認証済みと判定。`getCurrentCast()` は Supabase セッションを優先し、無ければ mock cookie を読みます。

### 本番で mock auth を無効化

`NIGHTOS_DISABLE_MOCK_AUTH=true` を **必ず**設定:

- `/auth/login` の「デモを試す」UI が非表示
- `mockLogin` server action がエラーを投げる
- `middleware.ts` が `nightos.mock-cast-id` cookie を認証として受け付けない
- `getCurrentCast()` が mock cookie を読まない

ローカル開発では設定不要（未設定 = mock auth 有効）。

---

## 環境変数

`.env.example` 全項目を要点だけまとめた表。詳細はファイル本体のコメントを。

| Key | 必須 | スコープ | 説明 |
|---|:---:|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 本番○ | Public | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 本番○ | Public | Supabase anon (公開可) |
| `SUPABASE_SERVICE_ROLE_KEY` | 本番○ | **Server only** | 退会フロー / setup-auth で必要 |
| `ANTHROPIC_API_KEY` | 推奨 | Server only | さくらママ AI / 名刺OCR / メモ抽出 |
| `NIGHTOS_DISABLE_MOCK_AUTH` | **本番必須** | Server only | `true` でデモログイン全面停止 |
| `NIGHTOS_SETUP_SECRET` | 本番では**未設定** | Server only | `/setup` `/api/setup{,-auth}` のゲート（≥16 chars） |
| `NEXT_PUBLIC_APP_URL` | 推奨 | Public | OG / metadataBase 用の本番 URL |
| `NEXT_PUBLIC_SENTRY_DSN` | 任意 | Public | Sentry SDK を入れる場合 |

> **本番で「未設定にする」のが正解**な変数:
> - `NIGHTOS_SETUP_SECRET` — 設定するとデモ用エンドポイントが復活してしまう

---

## 3分デモシナリオ

### 【前半】キャスト側の価値提案
1. `/auth/login` → **「あかり」** を選択
2. `/cast/home` で画面上部を見せる
   - **指名18本・リピート率72%・連絡が必要3人** のサマリ
   - アメジスト色の **「さくらママに相談」** カード
   - 今日連絡するお客様3人（渡辺=誕生日、田中=間隔空き、高橋=指名化チャンス）
3. **田中太郎** をタップ → `/cast/customers/cust1`
   - ベージュの **「店舗からの共有情報」(閲覧のみ)**
   - ピンク破線の **「個人メモ」(編集OK)** を書き換え → 保存
4. **「テンプレートで連絡」** → お礼テンプレートに `{姓}` `{前回の話題}` が埋まる → コピー
5. 下タブ **「さくらママ」** → 田中太郎を選択して「お礼のLINEを送りたい」
   - チップで段階ヒアリング → アドバイス+文面例+理由 の 3 点セット応答

### 【中盤】ママ / お姉さん側の育成
6. 「切替」→ 「ゆき」でログイン → `/mama/home`
7. `/mama/team` で **育成リマインダ**（1on1 空き・目標ノート未設定）を確認
8. キャスト別カルテで目標設定・1on1 チャットへ導線

### 【後半】店舗側の入力フロー
9. 「切替」→ 店舗スタッフ → `/store`
10. 顧客登録 → 来店登録 → ボトル登録 → ダッシュボードで効果確認
11. キャストに戻ると入力結果が連絡リストに反映されている

---

## 主要ルート

| ロール | パス | 内容 |
|---|---|---|
| 共通 | `/auth/login` | ログイン (本番) / デモ選択 (開発) |
| 共通 | `/auth/signup` | 新規登録 |
| 共通 | `/auth/reset-password` | パスワード再設定リクエスト |
| 共通 | `/auth/update-password` | パスワード再設定完了 |
| 共通 | `/onboarding` | 業態 / 店舗 / 源氏名 入力 |
| 共通 | `/settings` | アカウント設定・退会 |
| 共通 | `/legal/privacy` | プライバシーポリシー |
| 共通 | `/legal/terms` | 利用規約 |
| 共通 | `/legal/tokutei` | 特定商取引法表記 |
| 共通 | `/setup` | Supabase シード UI（**`NIGHTOS_SETUP_SECRET` 必須**。本番では 404）|
| キャスト | `/cast/home` | 連絡リスト・サマリ |
| キャスト | `/cast/customers/[id]` | 顧客カルテ |
| キャスト | `/cast/templates` | メッセージテンプレート |
| キャスト | `/cast/sakura-mama` | さくらママ AI |
| キャスト | `/cast/stats` | 個人の売上・指名推移 |
| キャスト | `/cast/chat` | チーム内チャット |
| ママ | `/mama/home` | ママダッシュボード |
| ママ | `/mama/team` | チーム一覧・育成リマインダ |
| ママ | `/mama/team/[castId]` | キャスト別カルテ |
| ママ | `/mama/customers` | 全顧客 / マップ |
| 店舗 | `/store` | 店舗ハブ |
| 店舗 | `/store/customers` | 顧客一覧 + CSV エクスポート |
| 店舗 | `/store/customers/new` | 顧客登録 |
| 店舗 | `/store/visits` | 来店履歴 + CSV エクスポート |
| 店舗 | `/store/visits/new` | 来店登録 |
| 店舗 | `/store/bottles` | ボトル管理 + CSV エクスポート |
| 店舗 | `/store/bottles/new` | ボトル登録 |
| 店舗 | `/store/dashboard` | 効果ダッシュボード |
| 店舗 | `/store/approvals` | キャスト申請承認 |
| 来店客 | `/customer/home` | 自分のキープボトル / クーポン / ランク |
| API | `/api/sakura-mama` | Claude 呼出し |
| API | `/api/setup` | Supabase シード投入（gated）|
| API | `/api/setup-auth` | Auth ユーザー作成 + cast 紐付け（gated）|

---

## 技術スタック

- Next.js 14 (App Router) + TypeScript strict
- Tailwind CSS（pearl / champagne / rose-gold / amethyst / blush）
- Noto Sans JP + Cormorant Garamond
- Supabase (Postgres)
- Anthropic Claude API (`claude-haiku-4-5-20251001`)
- Lucide React

---

## ディレクトリ構成

```
app/
  auth/login/              キャスト選択ログイン
  setup/                   Supabase シード投入 UI
  cast/                    キャスト向け
  mama/                    ママ / お姉さん向け
  store/                   店舗スタッフ向け
  api/
    sakura-mama/route.ts     Claude 呼出し
    setup/route.ts         DB シード

components/nightos/        NIGHTOS 用 UI kit

features/
  cast-home/               連絡リスト
  customer-card/           顧客カルテ
  templates/               テンプレート
  sakura-mama/               AI チャット
  team-management/         ママ側チーム管理
  team-chat/               1on1 / グループチャット
  store-dashboard/         店舗ダッシュボード
  customer-registration/   顧客登録
  visit-registration/      来店登録
  bottle-registration/     ボトル登録

lib/nightos/
  auth.ts                  ログイン cast 解決
  cast-context.tsx         クライアント用 CastProvider
  constants.ts             CURRENT_CAST_ID, MOCK_TODAY 等
  mock-data.ts             モックシード
  supabase-queries.ts      withFallback パターンで mock/real 切替
  supabase-real.ts         Supabase 実クエリ

middleware.ts              未ログインリダイレクト
supabase/migrations/
  002_nightos_schema.sql
  003_schema_additions.sql
```

---

## 設計方針

- **3 層フォールバック**: env 無し→モック / Supabase エラー→モック / Claude エラー→スタブ。どのモードでも画面は止まらない
- **クエリ境界でモード判定**: `lib/nightos/supabase-queries.ts` の各関数が env を見て切替。Supabase client factory は env 必須なので、呼ぶ前にチェックする必要がある
- **CastProvider**: サーバーで cookie から cast を解決 → Context でクライアントに渡す（propドリル禁止）
- **Server Component 優先**: インタラクティブ部分のみ Client
- **Server Actions**: フォーム送信は Server Actions + `revalidatePath`
- **TEXT PK**: 全テーブル PK が TEXT でモック ID と DB ID が同じ値になる（モード切替時のデータ互換性）

---

## トラブルシューティング

詳細な逆引きは **`OPS_RUNBOOK.md`** を参照。よく見る症状:

| 症状 | 一次切り分け |
|------|------------|
| ログイン画面がループする | ブラウザ cookie をクリア → 再度ログイン。続くなら OPS_RUNBOOK §A2 |
| 新規登録で何も起きない | Vercel Function Logs で `[nightos:error]` を grep → OPS_RUNBOOK §A3 |
| 入力したデータが消える | RLS 設定の確認。migration 006/007 を再適用 → OPS_RUNBOOK §A4 |
| `/setup` でエラー | env 未設定 / migration 未実行 / `NIGHTOS_SETUP_SECRET` 不一致（本番では 404 が正常） |
| さくらママが「デモ応答です」 | `ANTHROPIC_API_KEY` 未設定 → 設定 + Redeploy |
| サイトが 5xx | Vercel Deployments → 一つ前の Ready ビルドを Promote (ロールバック) |
