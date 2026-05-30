# UI改善バッチ 進捗メモ (resume用)

ブランチ: `claude/cool-carson-fcxKV` (origin push済)。作業はこのブランチで継続。
main へは前回 `7f3f2f1`(顧客リスト繋がり数削除) のみ反映済み。

## コミット履歴
- `9283c0a` 第1バッチ (text-pearl-light-light一括修正ほか)
- `7274a48` 第2バッチ (douhan-quick-add.tsx作成 + home page.tsxでcabaretにcustomers渡し ※未完=型エラー残)

## ⚠️ 重要な前提
- コンテキスト圧縮でファイル状態の記憶がズレた。**編集前に必ず対象ファイルをRead**して実状態を確認すること。
- `npm run build` が `next: not found` で失敗していた → `npm install` 実行中(/tmp/npm-install.log)。**コミット前に build / check:design / test を必ず通す**。
- 既知の型エラー: `app/cast/(app)/home/page.tsx:29` が `CastHomeCabaret` に `customers={customers}` を渡しているが、`features/cast-home/cast-home-cabaret.tsx` のPropsが未対応 → 要修正。

## ユーザー回答(AskUserQuestion)
- 連絡ボタン整理 = **1つに統合(さくらママ)**: LINE文面+相談を1ボタン「文面を作る」に統合し `/cast/ruri-mama?customerId=` へ
- 店舗お知らせ位置 = **さくらママに相談するカードの下に移動**
- ママ画面ナビ = **入力欄の上にタブバー**
- スケジュール = **まず設計提案を作る**(実装は次段階)

## 要望と状態(14項目)
1. ✅ ワイン背景の黒文字: `text-pearl-light-light`→`text-pearl-light` 一括修正済(committed)
2. ⬜ さくらママ: 顧客選択→相談種別の順次表示。`features/ruri-mama/components/chat-window.tsx` の IntentPicker(L588-590)を「顧客選択済み」状態でのみ表示。CustomerSelectInline は L552-561, onSelect=setSelectedCustomerId。`customerChosen` state追加(初期値 initialCustomerId!=null)、onSelectラップでtrueに、IntentPickerをゲート。未選択時はヒント表示。「指定なしで相談する」= onSelect(undefined) なので別途chosenフラグ要。
3. ⬜ ホーム間隔: `features/cast-home/components/cast-home-hero.tsx:126` `pb-10`→`pb-16`(スケジュール編集ボタンとKPIの間隔確保。KPIは各home L44/40で`-mt-9`)
4. ⬜ お知らせ移動: `cast-home-club.tsx`(StoreMessageBanner L74→RuriMamaEntryCard L81の下へ) と `cast-home-cabaret.tsx`(L64→L71の下へ)
5. ⬜ 連絡カード: (a)リスト3件まで+「残りN名を表示」展開 → `follow-target-list.tsx`(現状original, mapはsorted L73)。(b)ボタンは**1つに統合**: `follow-target-card.tsx` L199-229のLINE文面+相談を、1ボタン「文面を作る」(href=`/cast/ruri-mama?customerId=${customer.id}`, Sparklesアイコン)に。連絡したボタンは残す。
6. ⬜ 同伴登録ボタン: `douhan-quick-add.tsx`は作成済(DouhanQuickAdd, props customers)。club/cabaret両方の `<main>` 最下部に `<DouhanQuickAdd customers={customers}/>` を追加。cabaretはPropsに`customers: Customer[]`追加し受け取る(home page.tsxは既に渡している)。importも追加。
7. ⬜ 連絡した確認ポップアップ: `follow-target-card.tsx` に `confirming` state追加。連絡した→confirming=true→「{name}さまに連絡しましたか？ [はい][やめる]」インライン。はい=onToggleContacted+false。戻すは確認不要。
8. ⬜/△ マイページ成績導線削除: 成績Linkブロック(元 L167-175 `/cast/stats`)削除は適用された可能性あるが**要確認**。`BarChart3` import(L5)が残存→削除要(未使用)。
9. ⬜ スケジュール設計提案doc作成: `docs/design/schedule-timetree-proposal.md` 新規。現状=月表示/出勤・休み/時間/メモのみ(`lib/nightos/schedule-store.ts` ShiftEntry: date,status,startTime,endTime,note; `features/schedule/components/schedule-calendar.tsx`)。提案: 週表示・繰り返し(毎週○曜)・リマインド通知・Supabase同期・同伴予定の編集統合 等。
10. ⬜ さくらママ相談ボタン配色: `features/ruri-mama/components/intent-picker.tsx` の toneClasses(L56-76)が現状 rose-gold-metallic/gold-deep/champagne-deep/wine-deep でバラバラ。wine-deep と gold-deep の2色に統一(全カード bg-pearl-light, border-gold/30, iconBg は wine-deep/gold-deep 交互, text-pearl-light)して上品に。
11. △ さくらママ ヘッダーのアバターボタン削除: 適用報告ありだが**要確認**(`app/cast/(app)/ruri-mama/page.tsx` に `/cast/avatars` Link と `ImageIcon` import が無いこと)。
12. ⬜ チャット開始バグ: 相手選択しても開始しない。`features/team-chat/components/new-dm-sheet.tsx`(handleDmSelect L44-50: createDmRoomAction→roomIdあればrouter.push)、`features/team-chat/actions.ts`(createDmRoomAction L39-75: mock時 synthetic id `dm_<id>_<id>` を返す)、`app/cast/(app)/chat/[id]/page.tsx`(resolveRoom→room null時 notFound)。原因: mockのresolveRoomがsynthetic idを解決できず404。修正案: resolveRoom側でsynthetic `dm_a_b` idから相手を割り出しroomを合成して返す。要該当ファイル精読。
13. △ ママ画面のタブバー(入力欄の上): `components/nightos/cast-tab-bar.tsx` HIDE_PATTERNS L63 `/^\/cast\/ruri-mama/` を外すと固定ボトムバーが出るが入力欄と重なる。`ruri-mama/page.tsx`(flex flex-col h-dvh, ChatWindow内に入力)で「入力欄の上」に出すには ChatWindow末尾(入力の直前)にタブバーを差し込む等の工夫が要る。レイアウト注意・要実機確認。
14. △ フィードバックボタン控えめ化: 適用報告ありだが**要確認**(`components/nightos/feedback-link.tsx` L54-63閉ボタンが `w-9 h-9 bg-pearl-light/60 backdrop-blur border border-gold/25 text-gold-deep/70 ...` になっているか)。

## 検証コマンド
```
npm run check:design   # legacy class検知(これは通っていた)
npm run build          # 型/Tailwind (要 next。npm install後)
npm test               # vitest
```

## 次アクション順序(推奨)
1. npm install完了確認→build可能に
2. 各対象ファイルをRead(実状態確認)
3. 未適用の #3,#10,#8(import),#2,#4,#5,#6,#7 を適用 / #11,#14,#8(link)を確認
4. #6のcabaret型対応(customers prop)で型エラー解消
5. #12 チャットバグ修正(要精読)
6. #13 タブバー(慎重に)
7. #9 設計提案doc
8. build/check:design/test 緑 → コミット&push
9. 完了後ユーザーへ要約。main反映は別途指示を仰ぐ(前回はmain pushを明示指示された)
