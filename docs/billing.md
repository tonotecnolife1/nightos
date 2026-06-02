# 課金設計メモ — NIGHTOS

> 最終更新: 2026-06-02 / ステータス: **基盤のみ実装済み (Stripe 未接続)**

リリースから最初の 3 ヶ月を無料（無制限プラン）で約 100 人に使ってもらい、
4 ヶ月目から有料化する。「後で課金されること」をユーザーに明示しつつ、
移行時の離脱をできるだけ抑えるのが狙い。

---

## 1. 決定事項

| 項目 | 決定 |
|---|---|
| 決済基盤 | **Stripe Billing**（サブスク管理・再試行・解約を委譲） |
| 対応決済 | Apple Pay / Google Pay / クレカ（Visa・Master・JCB・Amex）を Payment Element で一括 |
| App内課金(IAP) | **使わない**。PWA なので Apple の 30% 手数料を回避し Web 決済で完結 |
| カード登録のタイミング | **折衷案**（後述） |
| 自動課金 | Stripe サブスクの **trial（`trial_end` 固定）** で 4 ヶ月目に自動本課金 |
| 課金対象ロール | cast / store / mama（運営側）。customer=来店客は対象外 |

### 折衷案（カード登録タイミング）

- 登録時はカード**任意**で開始 → 100 人を集めやすくする。
- オンボーディングと **2.5 ヶ月目**にカード登録を強く促す（「今登録すれば継続が途切れない」）。
- 移行日（4 ヶ月目初日）にカード未登録なら**利用制限**へ。登録済みなら**操作ゼロで自動課金**。

これにより「集めやすさ」と「自動課金による低離脱」を両立する。

---

## 2. 期間設定（単一情報源）

`lib/nightos/billing.ts` の定数が唯一の情報源。リリース日が動いたらここを直すだけ。

```ts
FREE_PERIOD_END = "2026-08-31" // 無料最終日（6/7/8 月が無料）
PAID_START      = "2026-09-01" // 有料開始（4ヶ月目初日）
MONTHLY_PRICE_YEN = null       // 月額（円, 税込）。確定したら数値を入れる
```

`getPlanStatus(now)` が日付だけで `free` / `ending_soon` / `paid` を判定（テスト: `tests/billing.test.ts`）。

---

## 3. 実装済み（このブランチ）

- `lib/nightos/billing.ts` — 期間定数 + フェーズ判定 + 整形ユーティリティ（純粋関数）
- `components/nightos/plan-banner.tsx` — 透明性バナー（free=薄い1行 / ending_soon=強調カード / paid=非表示）
- cast / store / mama レイアウトにバナー設置
- `app/pitch/page.tsx` 料金表記を「無料→有料移行」と分かる文面に更新
- `tests/billing.test.ts`

---

## 4. これから（Stripe 接続のロードマップ）

1. **Stripe 設定**: Product / Price（月額・JPY）作成。`STRIPE_SECRET_KEY` /
   `STRIPE_WEBHOOK_SECRET` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` を env に追加。
2. **Supabase**: `subscriptions` テーブル（cast/store/mama 単位で
   `stripe_customer_id` / `stripe_subscription_id` / `status` / `trial_end` /
   `current_period_end` を保持）。RLS は本人のみ参照可。
3. **Setup（カード登録）**: Stripe Checkout（mode=`setup` or `subscription`）で
   カード登録。サブスク作成時に `trial_end` を `PAID_START` の UNIX 時刻で固定。
4. **Webhook**: `customer.subscription.updated` / `invoice.payment_failed` 等を
   受けて Supabase の `status` を同期。`billing.ts` のフェーズ判定と突き合わせる。
5. **事前通知**: Stripe の trial 終了前メール（7 日前）を有効化。特商法・
   カードブランド規約上も事前告知は必須レベル。
6. **バナー CTA**: `plan-banner.tsx` の ending_soon に「お支払い方法を登録」CTA を
   追加し Checkout へ。登録済みは非表示に。
7. **法務**: `app/legal/tokutei`（特商法）と `app/legal/terms` の雛形を、確定した
   金額・移行日・事業者情報で差し替え（CLAUDE.md §1.6 と同様、公開前必須）。
8. **利用制限**: 未登録ユーザーの 4 ヶ月目以降アクセスをどう絞るか
   （閲覧のみ / 機能ロック）を決めて実装。
