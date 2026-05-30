# スケジュール機能 拡張設計提案（TimeTree 相当へ）

> 状態: **提案 (未実装)** ／ 作成 2026-05-30
> 対象: キャストのスケジュール (`/cast/schedule`)
> 目的: 現状の「月表示＋出勤/休み＋時間＋メモ」から、TimeTree 並みの
> 「繰り返し・リマインド・共有・週表示」を備えた実用カレンダーへ段階的に拡張する。

---

## 1. 現状整理

| 項目 | 実装 | ファイル |
|---|---|---|
| 表示 | 月表示のみ | `features/schedule/components/schedule-calendar.tsx` |
| 登録項目 | 出勤/公休、開始/終了時刻、メモ | `lib/nightos/schedule-store.ts` (`ShiftEntry`) |
| 同伴予定 | 当日分を**読み取り専用**で表示 | `lib/nightos/douhan-store.ts` |
| 永続化 | localStorage (`nightos.schedule.v1`) | 同上 |
| 通知 | なし | — |
| 共有 | なし（個人のみ） | — |

```ts
// 現行 ShiftEntry
interface ShiftEntry {
  date: string;        // YYYY-MM-DD
  status: "working" | "off" | "unknown";
  startTime?: string;  // HH:mm
  endTime?: string;    // HH:mm
  note?: string;
}
```

## 2. ギャップ分析（vs TimeTree）

| 機能 | TimeTree | 現状 | 優先度 |
|---|:---:|:---:|:---:|
| 月表示 | ✓ | ✓ | — |
| 週表示 | ✓ | ✗ | 中 |
| 日付タップ編集 | ✓ | ✓ | — |
| **繰り返し登録**（毎週◯曜 等） | ✓ | ✗ | **高** |
| **複数日まとめて登録** | ✓ | ✗ | **高** |
| **リマインド通知** | ✓ | ✗ | **高** |
| 端末間同期 | ✓ | ✗（localStorage） | 中 |
| 店舗/ママとの共有 | ✓ | ✗ | 中 |
| 同伴予定をカレンダーから編集 | (予定として) | 読み取り専用 | 中 |
| 色分けカテゴリ | ✓ | 固定2色 | 低 |

最も体験を損ねているのは **毎回1日ずつ手入力**（繰り返し・一括が無い）と **通知が無い** 点。ここを先に潰す。

---

## 3. 提案：3 フェーズ

### Phase 1 — 入力UXの抜本改善（localStorage のまま）

最小コストで「毎日ポチポチ」を解消する。Supabase 不要、既存ストアを拡張。

1. **繰り返し登録ルール**
   - 「毎週 ◯曜 を出勤（時刻 HH:mm）」を登録 → 該当月以降の曜日に自動展開
   - データモデルに `RecurringShift` を追加し、表示時に実体（`ShiftEntry`）へ展開
   ```ts
   interface RecurringShift {
     id: string;
     weekday: number;        // 0=日 .. 6=土
     status: "working" | "off";
     startTime?: string;
     endTime?: string;
     activeFrom: string;     // YYYY-MM-DD
     activeUntil?: string;   // 無期限なら未設定
   }
   // 個別の上書き（休む等）は ShiftEntry が優先（exception として機能）
   ```
   - 展開ロジック: `getEffectiveShift(date) = ShiftEntry(date) ?? expand(RecurringShift, date)`

2. **複数日まとめて登録**
   - カレンダー長押し→範囲選択、または「平日まとめて出勤」プリセット
3. **週表示トグル**
   - 月/週をヘッダで切替。週表示は当日中心の7日＋時刻バー
4. **同伴予定をカレンダーから追加/編集**
   - 現状の読み取り専用表示に「＋同伴を追加」を載せ、`upsertDouhan` を呼ぶ
   - （ホームの `DouhanQuickAdd` と同じ入力を流用可能）

工数感: フロント中心。中。リスク低（既存 localStorage 互換を保つ）。

### Phase 2 — リマインド通知

1. **PWA Push 通知**（既に install 導線あり: `install-prompt.tsx`）
   - 出勤前日 20:00 / 当日 出勤2時間前 / 同伴当日 朝
   - Service Worker + Web Push（VAPID）。**iOS Safari は PWA インストール後のみ Push 可**（16.4+）。未対応端末は後述のローカル代替。
2. **アプリ内リマインド（フォールバック）**
   - 起動時に「今日 18:00 出勤」「明日 同伴あり」をホームのバナーで提示
   - 既存 `morning-briefing` / `store-message-banner` と同じ枠で実現可

工数感: 中〜大（Push基盤・権限フロー・SW）。フォールバックだけなら小。

### Phase 3 — Supabase 同期 & 共有

1. **端末間同期**: `nightos_shifts` / `nightos_recurring_shifts` テーブル新設、localStorage は楽観キャッシュに降格
2. **店舗/ママとの共有（閲覧）**: ママ画面で配下キャストの出勤を月表示（既存 `team-management` と連携）
3. **競合解決**: `updated_at` の last-write-wins ＋ 端末ローカルの未送信キュー

工数感: 大（スキーマ・RLS・realtime・移行）。`schedule-store.ts` を queries 差し替え可能な形に抽象化してから着手。

---

## 4. データモデル移行方針

- 既存 `ShiftEntry`（個別日）は**例外/上書き**として残す
- `RecurringShift`（曜日ルール）を新設し、表示は「ルール展開 → 個別上書き」の二層で解決
- Supabase 化時も同一構造（2テーブル）でそのまま移植

```
表示する1日の確定ロジック:
  effective(date) =
    explicit ShiftEntry(date)              // 個別登録/休み上書きが最優先
    ?? expandRecurring(date)               // 曜日ルールから展開
    ?? "unknown"
```

## 5. UI 案（要点）

- ヘッダに **月/週トグル** と「繰り返し設定」ボタン
- 日タップシート: 既存（出勤/公休・時刻・メモ）＋「この曜日を毎週繰り返す」チェック＋「同伴を追加」
- 繰り返しが効いている日には微小な ↻ アイコン（既存の同伴ドットと同様の控えめ表現）
- デザインは V5 準拠（`design.md`）。新規トークンは増やさない想定。

## 6. 推奨ロードマップ

1. **Phase 1 を先行リリース**（繰り返し＋一括＋週表示＋同伴編集）— 体感改善が最大、リスク最小
2. Phase 2 はまず**アプリ内リマインド**だけ入れ、Push は後追い
3. Phase 3（Supabase）は他機能の Supabase 化と足並みを揃えて実施

## 7. 決めたいこと（実装着手前に確認）

- [ ] Phase 1 のスコープでまず進めてよいか（繰り返し/一括/週表示/同伴編集の取捨）
- [ ] 通知は Push まで要るか、当面アプリ内バナーで十分か
- [ ] 共有（ママ/店舗が出勤を見る）は必要か、個人カレンダーで足りるか
