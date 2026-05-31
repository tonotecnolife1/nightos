# マスター顧客 vs ヘルプ実績 — 設計整理

## 背景

姉さん同士でもヘルプに入ることがあるが、ある姉さんの「自分のお客様」には
**マスター管理している顧客** のみを含める。他の姉さん管理下の顧客に
ヘルプで接客した場合は **ヘルプ実績** として別枠で管理する。

> **改訂 2026-05-31**: 「1人のお客様に複数のヘルプが（時系列で）つく」現実を
> 反映してモデルを見直した。要点は本ドキュメント末尾の
> [改訂 2026-05-31](#改訂-2026-05-31--歴代ヘルプ1顧客に複数のヘルプ) を参照。

---

## 概念整理

### 3つの「関係性」
| 概念 | 使うフィールド | 多重度 | 意味 |
|------|-------------|--------|------|
| **マスター（管理責任者）** | `Customer.manager_cast_id` | 顧客 : マスター = **N : 1** | 「この顧客は誰の顧客か」 |
| **主要担当** | `Customer.cast_id` | 顧客 : 担当 = **N : 1** | 日常的にこの顧客を接客する人（通常 manager と同じか、その配下） |
| **当日の接客者** | `Visit.cast_id` | 顧客 : 接客者 = **N : N** | 特定の来店でテーブルに付いた人。**ヘルプ含む** |

> **重要**: 「ヘルプ」は **顧客レベルの単一属性ではない**。
> ヘルプは `Visit.cast_id`（=当日の接客者）に由来する **来店単位の事実** であり、
> 1人の顧客には時系列で **複数の異なるヘルプ** が紐づきうる。
> （例: 初回はキャストA、2回目はキャストBがヘルプ）。
> `Customer.cast_id` を「その顧客のヘルプ」と解釈してはならない。

### ある姉さん（例: あかり）視点
- **自分のマスター顧客**: `customer.manager_cast_id === あかり.id`
- **自分のヘルプ実績**: `visit.cast_id === あかり.id` かつ `customer.manager_cast_id !== あかり.id`
  - = 他の姉さん管理下の顧客に、自分が一時的に接客した実績

### ある顧客（例: 田中さま）視点
- **マスター**: `田中.manager_cast_id`（1人）
- **歴代ヘルプ**: `visits.filter(v => v.customer_id === 田中.id && v.cast_id !== 田中.manager_cast_id)`
  を接客者ごとに集約した **集合**（0〜N人）。
  来店のたびに別の人が入れば、その全員が田中さまの「歴代ヘルプ」に並ぶ。

### ヘルプ実績の記録粒度
Visit テーブルに記録されたまま。**顧客とは（永続フィールドでは）紐づかない**
（マスター関係は変えない）。
「あかりがゆき姉さんの管理下の田中さまの来店を1回ヘルプした」がそのまま履歴として残る。
複数キャストが同じ来店に同席した場合は、その人数ぶん Visit 行が立つ
（`customer_id` / `visited_at` が同じで `cast_id` が異なる行）。

---

## UI での分離表示

### `/cast/customers`（顧客一覧 — 接客するキャスト本人視点）

```
[📋 リスト] [🗺️ マップ]
─────────────
▼ 自分のお客様（マスター管理）6人
  (既存のリスト表示)

▼ 最近ヘルプで入ったお客様 3件
  ・田中さま（ゆき管理）— 3/15 に接客
  ・木村さま（みか管理）— 3/12 に接客
  ・...
```

### 顧客カルテ `/cast/customers/[id]` / `/mama/...`（顧客視点）

```
【田中さま】 マスター: ゆき
  歴代ヘルプ
   ・あかり  4回（最終 3/15）
   ・みお    1回（最終 2/20）
```

→ 顧客視点で「この人に入ったことのあるヘルプ全員」を一覧する。**新規**。

### `/cast/stats`（成績）

```
【今月の実績】
  マスター顧客指名: 18本
  ヘルプ実績: 5回（別姉さん配下の顧客）
```

### `/mama/team/[castId]`（姉さんの詳細）

```
【あかり姉さん】
  マスター顧客: 6人
   - 田中さま（VIP）
   - ...

  ヘルプ実績（他姉さん管理下）: 3件
   - 渡辺さま（ゆき管理・3/15）
   - ...
```

### マップ表示
- **キャストベース**: 管理者 → 担当 → 顧客 の3階層で **マスター関係のみ** 表示
  - ヘルプ実績は含めない（別ビュー）
- **顧客ベース**: 紹介チェーンはマスター関係とも独立（既存通り）

---

## ヘルパー関数（実装）

```ts
// lib/nightos/master-help-split.ts

// ── キャスト視点（既存）──────────────────────────
export interface MasterHelpSplit {
  masterCustomers: Customer[];          // 自分の管理顧客
  helpVisits: Array<{                   // 他姉さん管理下へのヘルプ実績
    visit: Visit;
    customer: Customer;
    masterName: string | null;          // そのお客様のマスター
  }>;
}

export function splitMasterAndHelp(args: {
  castId: string;
  customers: Customer[];
  visits: Visit[];
  allCasts: Cast[];
}): MasterHelpSplit;

// ── 顧客視点（改訂で追加）────────────────────────
/** 1顧客に入った1人のヘルプの集計 */
export interface HelpCastTally {
  cast: Cast;          // ヘルプに入ったキャスト
  visitCount: number;  // この顧客へのヘルプ回数
  firstHelpedAt: string;
  lastHelpedAt: string;
}

/** 顧客の「歴代ヘルプ」名簿 */
export interface CustomerHelpRoster {
  customer: Customer;
  masterCastId: string | null;
  masterName: string | null;
  helps: HelpCastTally[];  // 複数。lastHelpedAt 降順
}

/**
 * ある顧客に入った歴代ヘルプを接客者ごとに集約する。
 * help = visit.cast_id が「マスターでも主要担当でもない」来店。
 */
export function aggregateHelpCastsByCustomer(args: {
  customer: Customer;
  visits: Visit[];   // 全 Visit（内部で customer_id 一致を絞る）
  allCasts: Cast[];
}): CustomerHelpRoster;
```

---

## 改訂 2026-05-31 — 歴代ヘルプ（1顧客に複数のヘルプ）

### 何が問題だったか

ヘルプは現実には **来店のたびに入れ替わる**（初回キャストA、2回目キャストB…）。
ところが既存コードには「1顧客 = 単一のヘルプ」を暗黙に仮定する箇所が残っており、
`Customer.cast_id`（主要担当・単一）を「その顧客のヘルプ」と取り違えていた。

このため「同じお客様に複数のヘルプが時系列でつく」状況を表現できない。

#### 「1顧客 = 単一ヘルプ」を仮定している箇所（要改修）

| 箇所 | 現状の前提 | 問題 |
|------|-----------|------|
| `features/ruri-mama/components/customer-select-inline.tsx:142` | `helpCastNames[c.cast_id]` で **単一 `cast_id` をヘルプ名とみなす** | 2人目以降のヘルプが表示されない |
| `lib/nightos/supabase-queries.ts:161` `getCustomersForOneesan` | 顧客を `c.cast_id ∈ 配下ヘルプ` で **1人のヘルプにのみ** 紐付け | ある顧客が1人のヘルプの下にしか現れない |
| `features/mama-home/components/view-grouping-toggle.tsx` 「ヘルプ」モード | 「管理者→担当キャスト→顧客」の **単一親ツリー** | 顧客を複数ヘルプの下に並べられない |

> なお `lib/nightos/master-help-split.ts` の `splitMasterAndHelp` /
> `aggregateHelpVisitsByCustomer` は **Visit 由来の多対多を正しく扱えている**。
> 壊れているのは「顧客レベルで単一 `cast_id` をヘルプ扱いする」UI/クエリ側。

### 改訂方針

1. **ヘルプ = 来店単位の多対多に統一**。
   顧客レベルの単一フィールド（`cast_id`）をヘルプの根拠に使うのをやめ、
   ヘルプはすべて `Visit.cast_id`（マスター以外の接客者）から導出する。
2. **`Customer.cast_id` は「主要担当」の意味に限定**。
   「ヘルプ」とは別概念であることをコメント・命名で明確化する
   （フィールド追加・スキーマ変更はしない）。
3. **顧客視点の集約 `aggregateHelpCastsByCustomer` を追加**（上記シグネチャ）。
   顧客カルテに「歴代ヘルプ」セクションを置き、入ったヘルプ全員を回数つきで一覧。
4. **クエリ/UI の多対多対応**:
   - `getCustomersForOneesan`: 顧客を「`cast_id` 一致」ではなく
     「配下ヘルプが **過去に1度でも入った**（Visit 由来）」で集める。
     1顧客が複数ヘルプの下に重複出現してよい。
   - `customer-select-inline`: `helpCastNames[c.cast_id]` をやめ、
     歴代ヘルプを `aggregateHelpCastsByCustomer` から取得してバッジ表示（複数可）。
   - `ViewGroupingToggle`「ヘルプ」: 各ヘルプ配下に「そのヘルプが入った顧客」を並べる
     多対多リストに変更（顧客は複数ヘルプの下に現れうる）。

### 同時同席（同じ来店に複数キャスト）について

今回確認した主シナリオは **時系列での入れ替わり**（来店ごとに別ヘルプ）。
同じ夜の同じテーブルにマスター＋複数ヘルプが **同時** に付くケースは、
現状モデルでも「同一 `customer_id`/`visited_at`・別 `cast_id`」の Visit 複数行で表現可能。
専用の出席者ジョインテーブル（`visit_attendees` 等）は **今回は導入しない**。
集計上の二重計上が問題になったら将来検討（[Q4](#q4-同時同席の会計按分) 参照）。

---

## 実装範囲

### Phase A（完了・データ基盤）
- `lib/nightos/master-help-split.ts` 追加（`splitMasterAndHelp` 系）
- 設計書（本ドキュメント）

### Phase B（完了）
- `/cast/customers` に「ヘルプで入ったお客様」セクション追加
  （`features/cast-customers/components/help-visits-section.tsx`）
- `/cast/stats` にヘルプ実績カウント追加

### Phase C（改訂で再定義 — 本ドキュメントは設計のみ）
- `aggregateHelpCastsByCustomer` 追加（顧客視点の歴代ヘルプ集約）
- 顧客カルテに「歴代ヘルプ」セクション追加
- `getCustomersForOneesan` / `customer-select-inline` / `ViewGroupingToggle`
  を **多対多前提** に改修（上記「改訂方針」4）
- `/mama/team/[castId]` に同様の分離セクション追加
- 店舗ダッシュボードで姉さん別ヘルプ件数集計

---

## オープンクエスチョン

### Q1: ヘルプ実績の集計期間
- デフォルト「今月」で良いか？ 全期間？ 直近30日？
- **提案**: 今月 + 前月比を表示。成績ページのみ年間集計も出す。
  顧客カルテの「歴代ヘルプ」は全期間（最終来店日順）。

### Q2: マスターの切り替え頻度
- マスターが変わると履歴に残るが、過去のヘルプ実績の「誰のお客様だったか」は
  **当時のマスターを反映する？** それとも現在のマスターで集計する？
- **提案**: 現在のマスターで集計。履歴は別途 /store/approvals に残るので参照可能。

### Q3: ヘルプ実績の成績カウント
- ヘルプ実績は姉さんの「指名本数」に含める？ 含めない？
- 現実の慣習: ヘルプはマスターに指名がつき、ヘルプ者には「ヘルプ料」が別途。
- **提案**: 指名本数には含めない。「ヘルプ実績」として別カウント。

### Q4: 同時同席の会計按分
- 同じ来店にマスター＋複数ヘルプが同時に付いた場合、その来店の `sales_amount` を
  ヘルプ実績としてどう数える？（回数だけ？ 金額按分？）
- **提案**: まずは **回数のみ** カウントし金額按分はしない。需要が出たら再検討。

### Q5: 「主要担当」概念はクラブで生き残るか
- ヘルプが毎回入れ替わる運用だと `Customer.cast_id`（固定の主要担当）が実態に合わない店もある。
- **提案**: フィールドは残すが「任意」。未設定なら歴代ヘルプの最頻 or 直近で代替表示。
