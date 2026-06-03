# 課金設計メモ — NIGHTOS

> 最終更新: 2026-06-02 / ステータス: **基盤のみ実装済み (Stripe 未接続)**

課金モデルは **フリーミアム (pay-as-you-go)**。カード登録はお願いするが、
基本機能はずっと無料で使える（期間制限なし）。一部の機能を必要に応じて使った
ときだけ従量課金が発生する。「基本無料・必要に応じて課金」を透明に伝え、
不安を煽らずに使い始めてもらうのが狙い。

> 旧モデル（最初の 3 ヶ月だけ無料で 4 ヶ月目から月額有料に移行するサブスク）は
> 廃止した。期間限定無料→有料の強調表示・日付ベースのフェーズ判定はすべて撤去。

---

## 1. 決定事項

| 項目 | 決定 |
|---|---|
| 課金モデル | **フリーミアム**。基本機能は無期限で無料、必要に応じてだけ従量課金 |
| 決済基盤 | **Stripe**（カード登録・従量課金・再試行を委譲） |
| 対応決済 | Apple Pay / Google Pay / クレカ（Visa・Master・JCB・Amex）を Payment Element で一括 |
| App内課金(IAP) | **使わない**。PWA なので Apple の 30% 手数料を回避し Web 決済で完結 |
| カード登録 | お願いする（将来の従量課金に備える）。基本利用は登録有無に関わらず無料 |
| 課金タイミング | **従量課金** — 対象機能を使ったぶんだけ請求（サブスクの定額自動課金ではない） |
| 課金対象ロール | cast / store / mama（運営側）。customer=来店客は対象外 |

---

## 2. 情報源（単一情報源）

`lib/nightos/billing.ts` が唯一の情報源。

```ts
BASE_PLAN_NAME        = "無料プラン"           // UI 表示のプラン名
PLAN_TAGLINE          = "基本無料・必要に応じて課金" // バナー / 料金欄の一言
METERED_BILLING_READY = false                  // 従量課金の対象機能・単価が確定したら true
```

`getPlanStatus()` は日付に依存せず `{ freeBaseline, meteredBillingReady }` を返す
（テスト: `tests/billing.test.ts`）。実際の課金状態（カード登録済みか・今月の
従量利用額）は将来 Stripe + Supabase 側に持つ。

---

## 3. 実装済み（このブランチ）

- `lib/nightos/billing.ts` — プラン名 / タグライン / 従量課金フラグ + `getPlanStatus()`
- `components/nightos/plan-banner.tsx` — 透明性バナー（「無制限プラン（無料）· 2026年8月31日まで」の 1 行）
- cast / store / mama レイアウトにバナー設置
- `app/pitch/page.tsx` 料金欄に「無制限プラン（無料）· 2026年8月31日まで全機能を無制限で」を表示
- `tests/billing.test.ts`

---

## 4. これから（Stripe 接続のロードマップ）

1. **従量課金の設計**: どの機能を課金対象にし、いくらで課金するかを確定。
   確定したら `METERED_BILLING_READY` を `true` にし、UI に単価を出す。
2. **Stripe 設定**: 従量課金用の Product / Price（metered / usage-based, JPY）作成。
   `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` /
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` を env に追加。
3. **Supabase**: `billing_accounts` テーブル（cast/store/mama 単位で
   `stripe_customer_id` / カード登録済みフラグ / 今月の従量利用額を保持）。
   RLS は本人のみ参照可。
4. **カード登録**: Stripe Checkout（mode=`setup`）でカード登録 → `stripe_customer_id`
   を保存。基本利用は登録有無に関わらず無料。
5. **従量計上**: 課金対象機能の利用時に Stripe の usage record を加算。
   `invoice.*` / `payment_failed` Webhook を受けて Supabase の状態を同期。
6. **法務**: `app/legal/tokutei`（特商法）と `app/legal/terms` の雛形を、確定した
   従量単価・課金条件・事業者情報で差し替え（CLAUDE.md §1.6 と同様、公開前必須）。
