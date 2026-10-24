# NIGHTOS 個人LINE / Mac接続版

この実装は仕様書v0.21の「LINEを開かずに返信まで」の最初の実動範囲です。既存のMac用個人LINE MCP **0.1.6**を変更せず、保存済みログインを再利用します。NIGHTOSは本人の実アカウントで利用し、デモCookieでは接続しません。

## できること

- LINEタブにトークと友だちを読み込み、ページを追加取得する。
- 直近50件の本文を表示する。添付・復号失敗はその状態を表示し、既読を付けない。
- 音声または文字で返信の希望を入力し、直近の会話と本人の口調から返信案を作る。AIは既存のAnthropicを利用する。
- 初回だけLINEの相手と既存顧客を確認して紐づけ、以後は本人の接客メモを文案に使う。名前だけで自動統合しない。紐づけなしでも返信できる。
- 文案を編集し、宛先・個人/グループ・ID・本文・期限を確認して送る。
- 送信確認のキャンセル、期限切れ、Macの停止、結果不明を扱う。再読み込み時は前の送信ジョブを照会し、自動で再送しない。

個人LINEの接続には非公式方式を使用します。公式アカウント向けMessaging APIとは異なります。複数キャストでの運用、LINE全履歴の取り込み、添付取得、相手の既読取得、常時バックグラウンド同期、全画面からの音声人物特定、呼び名での新規顧客登録は今回の実装範囲に含みません。表示する未読件数は接続先が返した取得時点の値です。

## 通信と保存

MacはNIGHTOSにHTTPSで外向きの接続を行い、2秒間隔で仕事を取得します。Macのポート公開、LINEパスワードのNIGHTOSへの入力、LINEログインの複製は不要です。Macの電源・ネット接続と、このプログラムの起動が必要です。

ブラウザが32バイトの接続鍵を生成します。接続コードに入れてMacへ手渡し、ブラウザでは当該タブのsessionStorage、Macでは下記の600権限ファイルに保存します。鍵は中継サーバーへ送りません。タブを閉じたり別ブラウザに移る場合は再接続が必要です。初期版は1つのタブと1台のMacで利用してください。

中継の依頼・本文・結果・確認画面・了承はAES-256-GCMで暗号化します。認証対象の追加データにdevice ID / job ID / 方向を含め、別の依頼や確認への流用を防ぎます。MacのLINEセッションは既存プログラムのKeychainとsession.encに残します。新しいMac接続情報の保存先は `~/Library/Application Support/nightos-line-bridge/connection.json` です。接続中のLINEアカウントが変わると停止します。

データベースの3テーブルはRLSを有効にし、anon/authenticatedには直接アクセスを許可しません。APIで実際のSupabase Authユーザーとcastロールを確認し、必ずowner_idで絞ります。店舗スタッフ・店舗オーナー・他のキャストは読めません。管理画面や共有カルテへの本文・要約・下書きの書き込みは行いません。接触情報共有もOFFのままです。

返信案を依頼した場合だけ、表示中の会話・本人の接客メモ・指示を既存のNIGHTOS AIサーバーからAnthropicへ渡します。中継DBの暗号化は、返信生成時のAI処理や利用中のブラウザ・Mac内の平文まで隠すものではありません。既存のLINEプログラムはMacのcache.dbに本文を保存します。

中継データは会話履歴ではなく短期のジョブです。有効期限は2分、確認待ちは最大60秒。期限後24時間を過ぎたジョブを、そのMacの次の接続・操作時に削除します。停止したMacでは削除は次回接続まで行われません。厳密な保存期間が必要な運用では、期限切れジョブ削除の定期処理を追加してください。

## サーバー反映手順

1. 変更ブランチをVercel previewでビルドする。本番mainへのマージは実機確認後に行う。
2. Previewが使用するSupabaseプロジェクトを特定し、本番との共用有無を確認してから `supabase/migrations/021_personal_line_bridge.sql` を適用する。本番DBを使う場合は適用前に最終確認を取る。既存データの更新・削除は行わず、3テーブルとclaim関数を追加する。
3. Next.jsサーバーの環境変数に既存のSupabase URL / anonキー / Anthropicキーと、`SUPABASE_SERVICE_ROLE_KEY`、`NIGHTOS_LINE_BRIDGE_ENABLED=true` を設定する。検証時はPreviewの対象ブランチだけに設定する。service roleキーはブラウザ・Mac・チャットへ渡さない。
4. Supabaseの実アカウント（user_role=cast）でログインし、LINEタブの設定から接続コードを作る。
5. Mac用配布物の `Start.command` をダブルクリックする。初回はyを入力し、接続コードを貼る。LINEへの再ログインは不要。Node.js 20以上、またはこのMacにあるCodex同梱Nodeが必要。
6. 接続状態が変わり、自動読み込みが終わることを確認する。追加の読み込みは「読み込む」から行う。

ソースから起動する場合は `node scripts/personal-line/bridge.mjs --pair`。次回は `node scripts/personal-line/bridge.mjs` で再開します。停止はControl+C。自動起動・常駐登録はしません。

## 実機の確認順

最初にトーク一覧と対象の本文が見えることを確認します。AIで返信案を作り、宛先・個人/グループ・本文が一致することを確認し、まず「送信しない」を試します。その後、本人のテスト用アカウントに宛先と本文を指定して1通だけ送り、受信側で到着を確認します。開発者の自動テストでは第三者への実送信を行いません。

送信結果が不明な場合はLINEアプリで確認します。同じジョブや別の下書きで自動再送せず、画面の「前の送信結果だけ確認」から既存ジョブを照会します。アプリを再読み込みした場合も同じ動きです。Mac起動中に接続を解除すると、以後のトーク取得・確認応答は拒否されます。既にLINEが受け付けたメッセージの取消はできません。

## 検証

`npm run check:design`、`npm run build`、`npm test` を実行します。Mac用バイナリの模擬通信を含める場合は `LINE_MCP_TEST_BINARY=/absolute/path/to/line-personal-mcp npm test`。専用の一時ディレクトリで `--demo` を必須にし、保存済みの実アカウントは使いません。

DBの検証は別の一時フォルダにPGliteをインストールし、`node scripts/personal-line/check-db.mjs /absolute/path/to/@electric-sql/pglite/dist/index.js` で実施できます。本番DBに接続しないメモリ内PostgreSQLで、権限・二重claim禁止・期限・解除・所有者一致・ロール変更と再適用を確認します。

ブラウザ試験用の `scripts/personal-line/browser-fixture.js` は、localhost上の隔離したテストページにだけ読み込みます。実サービスのルートや本番バンドルからは読み込まないでください。

### Macからの到達性とPreview保護

配布ZIPを展開したフォルダで、次を実行できます。MacのLINEプログラムは起動せず、認証情報・接続鍵を使わず、ジョブの取得・送信・DB変更も行いません。

```bash
node scripts/personal-line/check-preview.mjs https://nightos-app-git-codex-mac-line-bridge-tonotecnolife1s-projects.vercel.app
```

認証なしの中継pollがJSONの401 `device_authentication_required` を返した場合だけPASSにします。PASSはAPIへの到達性のみを意味し、DB権限・本人ログイン・Mac接続の成功は意味しません。302などの転送、ログインHTML、設定未完了503は失敗です。Mac接続プログラム自体も転送を追わず、Preview保護やJSON以外の応答を区別して停止します。送信要求を自動で再実行することはありません。

CloudのようにHTTPプロキシが必須の環境では、対応するNode.js（このCloudでは24）の `node --use-env-proxy ...` を使います。Macで通常のネット接続を使う場合は不要です。通信先の許可がない場合、プロキシを回避せずCloud設定で許可してください。

Preview保護で停止した場合、まずVercelの現在の設定と利用プランを確認します。検証用Previewの固有ドメインだけを例外にできる場合は、それを候補として提示し、本番や他のPreviewの保護には広げません。固有ドメイン例外が使えない場合は検証専用プロジェクト等の範囲を限定できる構成を検討します。プロジェクト全体の保護OFFは行いません。どの場合もNIGHTOSの実Auth・cast本人確認は維持します。この版はVercelの保護バイパストークンを接続コードへ入れたり保存したりする機能を持ちません。

### DB適用前後の確認

- PreviewとProductionそれぞれの `NEXT_PUBLIC_SUPABASE_URL` のプロジェクト参照を比較する。Cloudの接続先だけでは共用か判断できない。同じ参照なら「Previewは本番DBを共用」と明示し、SQL適用前に確認を取る。
- 管理接続で適用済みmigration履歴を確認する。SQL Editorで手動適用した場合はCLI履歴に残らないことがあるため、実スキーマも比較する。
- 021は `auth.users` / `public.nightos_casts` / `public.customers` を参照する3テーブル、キュー・期限・ownerの3インデックス、claim関数、RLSとアクセス権を追加する。既存テーブルの行の更新・削除はない。既に同名オブジェクトがある場合は、`IF NOT EXISTS` だけに頼らず定義の一致を確認する。
- 承認済みの対象DBに021をトランザクション内で適用し、`scripts/personal-line/verify-deployed-db.sql` を管理接続で実行する。このチェックは読み取り専用で、テーブル・RLS・ロールの権限・関数定義・制約・インデックスとAuth紐づけ件数を確認し、個人情報は表示しない。claim関数は呼び出さない。
- 実キャスト本人のログインで `nightos_casts.auth_user_id = auth.getUser().id` かつ `user_role = cast` を確認する。デモCookieや店舗ロールでの接続は不可。本人確認のために既存Authユーザーやロールを書き換えない。
- 二重claim等の破壊的な確認は本番DBへテストジョブを入れず、既存の隔離PGlite試験を使用する。

### Preview DB分離の進行記録（2026-10-25、JST）

今回の対象は `nightos-app` / `tonotecnolife1s-projects` の `codex/mac-line-bridge`。ユーザーの方針は**Preview専用Supabaseプロジェクトを新規作成**すること。今回の作業ではmigration、本番設定変更、mainマージ、実LINE送信を行わない。下の2026-10-21の記録は当時の状態で、今回確認できた項目は本節を優先する。

確認済みの状態:

- 着手時のPR #43はdraft/open。headは `7e5c4665d1e32a5a884cb5b5b8493e13b6029899`。同じコミットのVercel PreviewはREADY。
- Cloud `nightos` の `VERCEL_TOKEN` はready、通信ポリシーはenforced。Vercel APIの認証付きGETは200で、チームとプロジェクトIDの一致を確認した。
- Supabase URL / anonキー / service roleの3設定はProduction・Preview共通で、ブランチ専用上書きはない。個別env APIで復号したURLはCloudと同じ `tswzmjkswegjdsjyogjx.supabase.co`。env一覧のencrypted値は暗号文なので、URLの比較には使用しない。秘密値はチャット・リポジトリ・ローカルファイルに出力していない。
- 対象ブランチだけに `NIGHTOS_LINE_BRIDGE_ENABLED=false` と `NIGHTOS_DISABLE_MOCK_AUTH=true` をencryptedで追加した。targetはpreviewのみ、gitBranchは `codex/mac-line-bridge`。それ以外のenvエントリは変更前後で一致した。反映先は追加後のPreviewデプロイで、設定の追加だけでは既存デプロイへ反映されない。
- Previewへの認証なしpollはHTTP 401 / JSONだが、期待する `device_authentication_required` ではない。到達性PASSやMac接続成功とは扱わない。Vercelの保護設定は変更していない。
- Supabase管理認証の登録・公開はユーザーが進める方針。確認時点のCloudには `SUPABASE_ACCESS_TOKEN` のbindingも実行時変数もなく、新DBは未作成。反映・ready確認と管理API疎通が済むまで、新DBの作成完了とは扱わない。
- 設定診断の実行結果はDBの4項目がFAIL、LINE連携OFF・mock認証OFFの2項目がPASS。想定どおり分離未完了を検出した。`npm ci` 後のNext.js 14.2.35でbuild成功、Vitestは258件成功・2件未実施（Mac実バイナリがないため）。追加9件は本番DB共用、別チーム、重複設定、秘密非表示、GET限定などの境界を確認する。

分離の残りの手順（実DBへのSQL適用なし）:

1. Cloudの秘密設定で `SUPABASE_ACCESS_TOKEN` を `api.supabase.com` 限定で登録・公開し、readyとAPI権限を確認する。チャットやリポジトリへトークンを貼らない。
2. 既存NIGHTOSプロジェクトの所属組織・リージョンと作成枠を確認し、専用の空プロジェクト（候補名 `nightos-preview`）を作る。本番からのデータ・Authユーザーの複製、DBブランチの自動migration、リポジトリの自動migration連携は行わない。追加課金やプラン変更が必要なら、作成前に条件を提示する。
3. 新プロジェクトのURL・anonキー・service roleを、Vercelの次の3つの**新規ブランチ専用エントリ**に登録する。既存のProduction/Preview共通エントリは編集・削除しない。URL / anonキーは比較できるencrypted、service roleはsensitiveで登録する。Cloudのプロキシ用秘密プレースホルダーをアプリ用キーとして転用しない。

   | キー | Vercel target | gitBranch | 値の出所 |
   |---|---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | previewのみ | `codex/mac-line-bridge` | 新プロジェクトのURL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | previewのみ | `codex/mac-line-bridge` | 同じ新プロジェクトのanonキー |
   | `SUPABASE_SERVICE_ROLE_KEY` | previewのみ | `codex/mac-line-bridge` | 同じ新プロジェクトのservice role |

4. 新プロジェクトだけのAuth Site URL / Redirect URLを対象Previewに合わせる。本番Auth設定は変更しない。Cloudから新しいSupabaseホストへ接続するには、そのホストの通信許可も別途必要。
5. 下の診断で設定の分離を確認する。空DBにはアプリの既存スキーマも本人Auth紐づけもないため、設定が分離できてもアプリやLINEが利用可能とは扱わない。migration禁止の今回の段階では、連携無効のまま止める。

```bash
node --use-env-proxy scripts/personal-line/check-preview-config.mjs
```

診断は固定した対象チーム・プロジェクト・ブランチについてVercel管理APIのGETだけを行う。必要な認証は `VERCEL_TOKEN`。秘密値・API本文・URLは出力せず、3設定のブランチ限定上書き、Productionと異なるSupabase URL / anonキー、service roleの別エントリ、LINE連携OFF・mock認証OFFを判定する。未設定、重複、読み取れないURL/anonキー、認証失敗は成功扱いにしない。service roleはsensitiveのため値の正しさを証明しない。PASSでも実DBの認証・スキーマ・Authユーザー・既存デプロイへの反映は未検証である。

DB接続設定をロールバックする場合は、追加したDBの3つのブランチ専用エントリだけを対象にする。削除すると共通設定の本番DBを再び継承するため、`NIGHTOS_LINE_BRIDGE_ENABLED=false` と `NIGHTOS_DISABLE_MOCK_AUTH=true` のブランチ設定は維持する。新プロジェクトの削除やデータの移動は、この手順に含めない。

### Cloud引き継ぎ確認記録（2026-10-21）

着手時のPR #43はdraft/open、headは `f03cf339a3e4df8b718f099afcf878b5f62f6df3`。既存実装を引き継いだ。GitHubのVercel botコメントは次をReadyとしている（現在のAPI疎通やDB反映を保証するものではない）。

- チーム: `tonotecnolife1s-projects` / `team_8jTCfUd9XXq1EtR410PR4L7v`
- プロジェクト: `nightos-app` / `prj_DMqHn7SrPOCBEmqcDzi2Q5e5KMCl`
- [Preview](https://nightos-app-git-codex-mac-line-bridge-tonotecnolife1s-projects.vercel.app)
- [Vercelの既存デプロイ記録](https://vercel.com/tonotecnolife1s-projects/nightos-app/5ZXyqrBrtcPFAAB6PACYGFdbcMp2)

| 項目 | このCloudで確認した状態 |
|---|---|
| CloudのSupabase接続先 | `tswzmjkswegjdsjyogjx.supabase.co`。Preview/Productionとの対応は未確認 |
| URL / anonキー | 注入済み。Auth health/settingsは200。anonでnightos_castsを読むと権限拒否（401/42501） |
| 中継テーブル | anonによるdevices照会で404/PGRST205（schema cacheに未検出）。管理接続でのmigration履歴・実スキーマ確認は未実施 |
| Anthropic | 認証付きmodels API 200。アプリの `claude-haiku-4-5-20251001` で合成文の生成200。LINE本文は使用せず |
| Vercel管理認証 | このCloudにトークン・CLIログインなし。チーム権限は未確認 |
| 管理用Supabase認証 / DB接続 | service role、管理アクセストークン、DB接続情報の注入なし |
| 通信許可 | Supabase接続先とAnthropicは到達。Vercel APIとPreviewは許可対象外のため到達未確認。302を成功扱いしていない |
| Vercelアプリ環境変数 | 未取得・未変更。Cloudへの設定とは別。Previewの5変数の設定・再デプロイが必要 |
| 本番操作 | mainマージ、本番設定変更、実DB migration、実LINE送信はいずれも未実施 |

Cloudの秘密はドメイン限定のプロキシ注入である場合がある。Cloudで認証成功しても、その環境変数をコピーしてVercelで使えるとは限らない。Vercel管理トークンはVercel API/CLIの認証専用で、アプリの5変数へ設定しない。アプリ用の実値はVercelの秘密設定へ直接登録するか、安全に移送できる正規のsecret bindingを使用する。

ローカルのデザインチェック・ビルド成功、Vitestは29ファイル中28成功/1未実施、249件成功/2件未実施。追加9件は転送・HTML・異常JSON・未設定応答・未認証の到達性診断を検証する。Mac実バイナリがないため、隔離demoモードの2件は未実施。PGliteで021の再適用・private権限・owner一致・二重claim禁止・期限・解除・ロール変更と読み取り専用SQLの実行を確認した。フォント最適化のダウンロード警告はあるがビルドは完了した。

### 依存監査と公開前の残作業（2026-10-21）

`npm audit --omit=dev` は着手時 critical 1 / high 7 / moderate 3。Next.jsを14.2.21→14.2.35へ更新し、互換範囲のform-data 4.0.6 / ws 8.22.0 / nanoid 3.3.20 / source-map-js 1.2.2へlockfileを更新した。新しい実行時依存は追加していない。再監査は **critical 1 / high 1**。指摘数は依存パッケージ単位であり脆弱性の件数ではない。

- **Next.js（critical、未解決）**: 14系の最新パッチでも、現時点の監査にはApp Router/RSC/Server ActionsのDoSやキャッシュ関連等が残る。このアプリはそれらの機能を使用するため、到達性がないと一括で判断できない。Vercel側の緩和策の適用も未確認。監査が示す修正版15.5.24以上のサポート系列への更新と、非同期cookies/headers・ルートparams・Supabase SSRの互換確認を公開前に完了する必要がある。
- **critical指摘の条件**: Windowsサーバー向けRCEは通常のVercel Linux実行とは条件が異なる。AVIF画像最適化向けRCEは現在 `images.unoptimized: true` のため通常のアプリ画像では使わないが、設定だけで全Next.js指摘が解消したとは扱わない。
- **Next内包PostCSS（high、未解決）**: 8.4.31が固定されており、攻撃者由来CSSのsourceMappingURL等に関する読み取り/XSSの指摘が残る。このLINE機能はCSSを受け付けないが、アプリ全体のビルド経路も含めて修正版へ更新する。メジャー更新やoverrideを無検証で適用しない。
- form-data/ws等の指摘は今回の互換更新で監査から消えた。AI返信はJSONリクエストを使うが、それだけを理由に依存の指摘を放置しない。

本番反映前には、上の依存対応、PreviewとDBの対応確認、対象DBでの021と権限検証、Previewだけへの5変数設定、実castログイン、Macからの到達性、読込→AI返信案→編集→送信しない→本人承認のテスト1通→受信確認を完了する。完了結果を提示してから本番DB/設定変更とmainマージの最終確認を取る。

### Macで次に行う操作

1. 担当者からPreviewのサーバー/DB準備完了の連絡を受け、新しい配布ZIPを展開する。旧版と同時に起動しない。
2. 必要なら上の `check-preview.mjs` を実行する。PASS以外は担当者へ結果の分類だけを伝え、接続コードや鍵を共有しない。
3. Previewに実castアカウントでログインし、LINE設定で接続コードを作る。展開先の `Start.command` を開き、y→接続コードを入力する。既存LINEログイン/Keychainは変更しない。
4. 読込・AI返信案・編集・宛先/個人かグループ/本文を確認し、まず「送信しない」を試す。実送信はMacの本人がテスト宛先と本文を確認し、NIGHTOSの確認画面で承認した1通のみ。結果不明ならLINEアプリで確認し、自動再送しない。
5. 接続中はMacのプログラムとブラウザのタブを開いておく。タブを閉じた場合は古い接続を解除して再接続する。停止はControl+C。

## 取り消し

UIから該当Macの接続を解除し、Macのプログラムを停止します。サーバー側は `NIGHTOS_LINE_BRIDGE_ENABLED` を無効にすると全APIが停止します。既存のCodexのLINE接続設定と保存済みLINEログインは変更しません。
