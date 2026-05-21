# NIGHTOS 運用 Runbook

**目的**: 本番運用中に何かおかしくなったとき、**症状から原因と対応を逆引き**できるようにする。

> 関連ドキュメント
> - 初回デプロイ → `DEPLOY_RUNBOOK.md`
> - スキーマ詳細 → `supabase/MIGRATE.md`
> - パフォーマンス懸念 → `PERF_NOTES.md`

---

## 🆘 真っ先に見る場所（症状別）

| 症状 | まず見る | 詳細 |
|------|---------|------|
| サイトが開かない / 5xx | Vercel Deployments → 最新の Status | §A1 |
| ログインできない | Supabase Dashboard → Authentication → Users | §A2 |
| 新規登録が完了しない | **Vercel Function Logs で `[nightos:error]` を grep** | §A3 |
| 入力したデータが消える | Supabase → Table Editor → 該当テーブル | §A4 |
| さくらママが「デモ応答です」 | Vercel env vars → `ANTHROPIC_API_KEY` | §A5 |
| 突然遅い | Vercel Analytics → Function Duration | §A6 |
| クーポン / 連絡が共有されていない | Supabase → `cast_messages` `coupons` 行 | §A7 |
| AI コストが急増 | Anthropic console → Usage | §A8 |

---

## A. 症状別の詳細

### A1. サイトが開かない / 5xx

1. **Vercel Dashboard → Deployments** で最新の Status を確認
   - **Building** → ビルド中。待つ
   - **Ready** → 配信されているはず。次の step
   - **Error** → ビルドログを開いて型エラー / 構文エラーを確認

2. Ready なのに 5xx → **Functions** タブ → エラー率の高い関数を特定

3. ロールバック手順:
   - Deployments → 一つ前の Ready ビルドを選択 → **Promote to Production**
   - 復旧後に原因の修正 PR を作成

### A2. ログインできない

#### a) ユーザーがパスワードを忘れた
- 自分で `/auth/reset-password` から再設定リンクを送れる
- 届かない場合: Supabase → Authentication → Users → 該当ユーザー → **Send password recovery**

#### b) アカウントが存在しない / 削除済み
- Supabase → Authentication → Users で email を検索
- 退会済みの場合 (`/settings` → 削除) は同じアドレスで再登録可能

#### c) ログインしたのに `/onboarding` ループに入る
- `nightos_casts` テーブルにそのユーザーの `auth_user_id` を持つ行がない
- 原因: migration **003** または **006/007** が当たっていない、または cast 行作成中に失敗
- 確認:
  ```sql
  select id, name, store_id, auth_user_id
    from nightos_casts
   where auth_user_id = '<user-uuid>';
  ```
- 行があるのにループする場合 → A3 の post-insert read-back エラーの可能性

### A3. 新規登録が完了しない

**症状**: 「はじめる」を押しても何も起きない / エラーが出る

1. **Vercel Function Logs** で次を検索：
   ```
   [nightos:error]
   ```
2. JSON の `scope` フィールドが原因の所在を示す：

   | scope | 何が起きた | 対応 |
   |-------|----------|------|
   | `onboarding.store-insert` | 店舗の作成失敗 | message + hint を確認。`column ... does not exist` → migration 不適用。`new row violates row-level security policy` → migration 006 不適用 |
   | `onboarding.cast-insert` | キャスト作成失敗 | 同上。`auth_user_id` カラム不足なら migration 003 |
   | `onboarding.post-insert-readback` | insert 直後の読み戻しが空 | RLS が SELECT を弾いている。migration 006/007 を再適用 |

3. 一時対応: 影響を受けたユーザーには「30 分後に再度お試しください」と案内 + Supabase で migration 適用 → ユーザーが再登録できるか確認

### A4. 入力したデータが消える

**症状**: 顧客 / 来店 / クーポン / 連絡 が登録した直後は見えるが、リロードで消える

#### Most likely causes
- **(1) RLS が有効化された**ため insert は通るが select で弾かれている
   ```sql
   select tablename, rowsecurity from pg_tables
    where schemaname = 'public' and rowsecurity = true;
   ```
   `true` の行があれば、それが原因。`alter table <name> disable row level security;` で off に
   （または `supabase/migrations/006_signup_rls_fix.sql` / `007_b4_rls_extra_tables.sql` を再適用）

- **(2) クライアント側の楽観更新と DB 不整合**
   `withFallback` が DB エラーで mock に落ちている可能性
   → Vercel Function Logs で `[supabase] <queryName> failed, falling back to mock` を検索

- **(3) 環境変数の typo**
   `NEXT_PUBLIC_SUPABASE_URL` の URL が古い / 別プロジェクト
   → Vercel env と Supabase Dashboard の値を見比べ

### A5. さくらママが「デモ応答です」スタブを返す

1. Vercel env → `ANTHROPIC_API_KEY` が設定されていることを確認
2. 設定後 **Redeploy が必要**（env 変更はビルド時に焼き込まれる）
3. それでもダメなら Anthropic console → API Keys でキーが有効か / 月次上限に達していないか
4. 一時的に Anthropic 障害の可能性 → status.anthropic.com を確認

### A6. 突然遅い

1. Vercel **Analytics** → Function Duration / Web Vitals
2. 異常値ページを特定 → どのクエリが遅いか:
   - `getCustomerStoreOverviews` → bottles + visits + coupons の並列。row 数が増えている可能性
   - `getCastHomeData` → mock fallback 発生で重複計算の疑い
3. Supabase Dashboard → **Database → Query Performance** で遅い query を特定
4. 緊急の場合: Vercel → Settings → **Functions** → Region を東京 (`hnd1`) 固定で再デプロイ

`PERF_NOTES.md` も併読。

### A7. クーポン / 店舗⇄キャストメッセージ / 同伴 が消える

これらは B4 で実 DB 化されたので、消えるなら：

1. migration **007** が当たっていない（`cast_messages` `cast_requests` `coupons` `douhans` の RLS が on のまま）
2. テーブル自体が無い → migration **003** が未実行
3. Vercel Function Logs で `[supabase] sendCastMessage failed, falling back to mock` 等を grep
4. 原因 migration を再実行 → 再現テスト

### A8. AI コストが急増

1. Anthropic console → **Usage** で日別 / モデル別の利用量
2. 通常: `claude-haiku-4-5` で約 $0.005/回。1 日 1,000 回なら約 $5
3. 急増の原因候補:
   - bot / クローラに API ルートが叩かれている → Vercel Logs で `/api/sakura-mama` `/api/morning-briefing` 等の頻度確認
   - 無限ループ / リトライの実装ミス → 該当 commit を refresh
4. 緊急停止: Anthropic console → API Keys → 該当キーを **Disable** → 一時的にスタブモードに戻る

---

## B. データの復旧

### B1. 誤ってデータを削除した

1. Supabase Dashboard → **Database → Backups**
2. **Pro Tier**: Point-in-Time Recovery で時刻指定リストア可能
3. **Free Tier**: 日次バックアップ（24h 単位）から復元
4. リストア中はサイト停止になるので、メンテナンス画面表示の検討

### B2. テーブル全体を空にしてしまった

```sql
-- Supabase SQL Editor で確認
select count(*) from customers;
select count(*) from visits;
```
0 行になっていたら B1 の手順でリストア。

### B3. ユーザーが「退会したのに復活しない」

`/settings` → 削除 はカスケード削除：
- `nightos_casts` 行を消す → `visits` `bottles` `cast_memos` も FK CASCADE で消える
- Supabase Auth ユーザーも `admin.deleteUser()` で消す

完了している場合、同じメールで `/auth/signup` から再登録できる。
できない場合:
- Supabase → Authentication → Users で残存していないか確認
- Supabase → SQL Editor で `select * from nightos_casts where auth_user_id = '<uuid>';`

---

## C. セキュリティ

### C1. SUPABASE_SERVICE_ROLE_KEY が漏洩した疑い

1. **即座に**: Supabase Dashboard → Project Settings → API → **Reset service_role key**
2. Vercel env を新しい値で上書き → Redeploy
3. 古いキーで作られた不正データの調査:
   ```sql
   select * from auth.users where created_at > '<漏洩疑いの時刻>';
   ```
4. 影響範囲を `OPS_RUNBOOK` の C2 に追記

### C2. ANON_KEY が漏洩した
これは公開可能なキーなので**漏洩 ≠ インシデント**。ただし Supabase の RLS が
適切に効いている前提なので、`pg_tables` で `rowsecurity = false` のテーブルが
**機密データを含んでいないか**を再確認する。

### C3. デモエンドポイントが本番に有効化されていた
1. Vercel env → `NIGHTOS_SETUP_SECRET` が誤って設定されていないか確認
2. 設定されていたら **削除 → Redeploy**
3. ログを遡って `/api/setup` `/api/setup-auth` への POST を grep
4. 不正な seed が混入していないか SQL で確認

---

## D. 監視とアラート

### D1. 推奨アラート

| シグナル | 取得元 | 閾値例 |
|---------|--------|--------|
| 5xx エラー率 | Vercel Analytics | > 1% / 5min |
| Function Duration p95 | Vercel Analytics | > 3s / 5min |
| AI 応答失敗率 | `[nightos:error]` の `scope: sakura-mama.*` 件数 | > 10/h |
| Anthropic 月次コスト | Anthropic Usage | 月額予算の 80% |
| Supabase DB Connections | Supabase Reports | > 60% |
| Sign-up / day | Supabase Auth Users | 急減 → 認証障害の疑い |

### D2. ログ集約

- **Vercel Function Logs**: 最近 7 日。長期保存したい場合は外部 (Datadog / Logtail) に転送
- **エラーは `[nightos:error]` プレフィックスで grep 可**
- Sentry SDK を入れるときは `lib/nightos/error-reporter.ts` の `reportError()` 内で
  `import("@sentry/nextjs").captureException(...)` をするだけで全 callsite に伝播する

### D3. Uptime Monitor

- Vercel **Cron Jobs** で `GET /api/health` を 5 分おきに叩く
- 失敗時は Slack / Discord webhook に通知
- 設定は `vercel.json` の `crons` で行う

---

## E. デプロイ・ロールバック

### E1. 通常のデプロイ
- `main` ブランチに push → Vercel が自動デプロイ
- Preview デプロイは PR ごと
- Production への自動 promote は Settings → Git → Ignored Build Step / Production Branch で制御

### E2. 緊急ロールバック
- Vercel → Deployments → 一つ前の Ready ビルドを選択 → **Promote to Production**
- ロールバック後に原因 PR を revert する commit を作成

### E3. Migration ロールバック
- Supabase migration には rollback が無いので **手動で `drop` SQL を書く**
- 影響範囲が大きい場合は B1 のバックアップリストアの方が安全

### E4. 環境変数の変更
- 変更しただけでは反映されない → **Redeploy 必須**
- Production と Preview を両方更新するのを忘れない

---

## F. 連絡先（テンプレート — 実情報を埋めること）

- **本番障害発生時の一次窓口**: 〔氏名〕 / 〔Slack ID〕 / 〔電話〕
- **二次（深夜・休日）**: 〔氏名〕 / 〔連絡先〕
- **法務 / 個人情報インシデント**: 〔法務担当 / メール〕
- **セキュリティ脆弱性受付**: 〔security@〕
- **Supabase サポート**: https://supabase.com/dashboard/support/new
- **Vercel サポート**: https://vercel.com/help
- **Anthropic サポート**: https://support.anthropic.com/

---

## G. 月次オペレーション

毎月 1 回チェックする項目：

- [ ] Anthropic Usage と請求額の確認
- [ ] Supabase DB サイズ / 接続数の推移
- [ ] Vercel Bandwidth 使用量
- [ ] エラーログのトレンド（`[nightos:error]` 件数の月次比較）
- [ ] バックアップの試験リストア（年 1 回でも良い）
- [ ] 法務ページの最終更新日が古くなっていないか
- [ ] dependencies の脆弱性（`npm audit` / Dependabot）
