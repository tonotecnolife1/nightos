# Claude Code → OpenAI Codex 移行手順

NIGHTOS の **開発ツール** を Claude Code から OpenAI Codex に移すための手順書。
アプリ内の「さくらママ」AI (Anthropic API / `ANTHROPIC_API_KEY`) は製品機能なので、この移行では**変更しない**。

## 0. リポジトリ側で済んでいること

| 変更 | 内容 |
|---|---|
| `AGENTS.md` | 旧 `CLAUDE.md` の内容をそのまま移した**指示書の正本**。Codex はリポジトリ直下の `AGENTS.md` を自動で読む |
| `CLAUDE.md` | `@AGENTS.md` の 1 行だけ。Claude Code も同じ指示を読める (併用・切り戻し用) |
| ブランチ規約 | `claude/<feature>` → `codex/<feature>` |

Claude Code 固有の設定 (`.claude/` 設定・hooks・GitHub Actions) はもともと無いため、移すものは指示書だけ。

## 1. 移行前の棚卸し (Claude 側で最後にやる)

1. Claude Code で進行中の作業をすべて commit & push する (クラウドセッションのコンテナは消える)
2. 未マージの `claude/*` ブランチを整理する (手順と判定結果は下の「付録: 未マージブランチの取捨選択」)
3. このブランチ (`AGENTS.md` 追加) を main にマージする

## 2. Codex を使えるようにする

### クラウド (ChatGPT の Codex / Claude Code on the web に相当)
1. ChatGPT (Plus / Pro / Business 等) にログインし、Codex を開く (chatgpt.com/codex)
2. GitHub を連携し、`tonotecnolife1/nightos` へのアクセスを許可する
3. Environment を作成:
   - リポジトリ: `tonotecnolife1/nightos`
   - Setup script: `npm ci`
   - Node.js: 20 以上 (このリポは 22 で動作確認)
   - 環境変数: 不要 (未設定でもモック / スタブで build・test が通る)。Supabase 実接続で検証したい場合のみ `NEXT_PUBLIC_SUPABASE_URL` 等を **Secrets** に入れる (`.env.example` 参照)
   - Agent のインターネットアクセス: 基本オフで可 (依存は setup script で入る)
4. 試運転タスク: 「AGENTS.md を読んで、`npm run check:design && npm run build && npm test` を実行して結果を報告して」

### ローカル (Claude Code CLI に相当)
```bash
npm i -g @openai/codex
cd nightos
codex            # 初回は ChatGPT アカウントでサインイン
```
- 起動後 `/init` は**実行しない** (既に AGENTS.md があるため上書きの恐れ)
- 承認モードは `/approvals` で調整 (Claude Code の permission mode に相当)
- VS Code 等を使う場合は Codex の IDE 拡張を入れる

## 3. Claude Code 機能との対応

| Claude Code | Codex |
|---|---|
| `CLAUDE.md` | `AGENTS.md` (サブディレクトリに置けばその配下だけに効く) |
| `~/.claude/CLAUDE.md` (個人用) | `~/.codex/AGENTS.md` |
| `.claude/settings.json` | `~/.codex/config.toml` |
| MCP サーバー | `config.toml` の `[mcp_servers.*]` |
| PR 作成 (セッションから) | クラウドタスク完了後「Create PR」 |
| PR レビュー | PR に `@codex review` とコメント (GitHub 連携でコードレビューを有効化) |
| `claude/*` ブランチ | `codex/*` ブランチ |

## 4. 移行後の確認チェックリスト

- [ ] Codex のタスクで `AGENTS.md` のルール (V5 トークン、禁止クラス) が守られている
- [ ] `npm run check:design` / `npm run build` / `npm test` が Codex 環境で緑
- [ ] Codex が作った PR で Vercel Preview が発行される (Vercel は GitHub 連携なのでそのまま動く)
- [ ] UI 変更時に `design.md` も同じ PR で更新されている
- [ ] 本番 `ANTHROPIC_API_KEY` (Vercel 環境変数) は**消さない** — さくらママが使う

## 5. 注意

- 指示を変えるときは `AGENTS.md` だけ編集する。`CLAUDE.md` に書き足すと二重管理になる
- Claude 系サービスを解約しても、さくらママ用の Anthropic API キー (console.anthropic.com の従量課金) は別契約なので維持すること
- Claude Code に戻す・併用する場合も追加作業は不要 (`CLAUDE.md` が `AGENTS.md` を読む)

## 付録: 未マージブランチの取捨選択

### 判定の手順
クラウド環境の clone は浅い (shallow) ことがあるので、必ず全履歴を取ってから調べる。浅いままだと、マージ済みのブランチも「未マージ」と誤判定される。

```bash
git fetch --unshallow origin; git fetch origin --prune
MT=$(git rev-parse origin/main^{tree})
for b in $(git branch -r | grep 'origin/claude/'); do
  git merge-base --is-ancestor $b origin/main && continue          # マージ済み
  [ "$(git cherry origin/main $b | grep -c '^+')" = 0 ] && continue # 同じパッチが main にある
  t=$(git merge-tree --write-tree origin/main $b 2>/dev/null | head -1)
  if [ "$t" = "$MT" ]; then r=NOOP                                  # マージしても何も変わらない
  elif git merge-tree --write-tree origin/main $b >/dev/null 2>&1; then r=CLEAN
  else r=CONFLICT; fi
  echo "$r $b $(git log -1 --format='%cs %s' $b)"
done
```

各ブランチは次の順に判定する:
1. **同等の変更が main にあるか**: `git log origin/main --grep='<コミット件名の一部>'` で探す。別名ブランチ (`-v2` / `-v5`) で取り込み済みのことが多い → **削除**
2. **前提が古くないか**: V5 Bordeaux Salon (2026-05-30) より前の UI 変更は、デザインが別物になっているので → **削除** (必要ならアイデアだけ issue に残す)
3. **まだ main に無い価値ある変更か**: CLEAN ならローカルでマージして `npm run check:design && npm run build && npm test` → 緑なら main へ。CONFLICT なら Codex に「このブランチの意図を今の main に作り直して」と頼む
4. **コードではない成果物 (docs / SQL)**: 必要か自分で判断。パスワード等が含まれていないかを確認してから入れる

### 判定結果 (2026-10-04 時点)
取り込み候補のうち `fix-champagne-data` / `new-chat-user-search-zpTEW` / `trusting-bell-SBfsx` の 3 本を同時に main へマージした状態で、`check:design` / `build` / `test` (215 件) がすべて緑になることを確認済み。

全履歴で再集計すると、main に入っていない差分を持つのは **14 本**だった (当初の「44 本」は浅い clone による誤集計)。

**取り込み候補 (CLEAN = 競合なし)**

| ブランチ | 内容 | 推奨 |
|---|---|---|
| `claude/fix-champagne-data` | ボトルキープ枠からシャンパンを除外 + テスト (main 未反映のバグ修正) | ✅ PR #42 で取り込み |
| `claude/trusting-bell-SBfsx` | ヘルプ報告の自動作成 → さくらママ編集 → チャット送信 (新機能、テスト付き) | ✅ PR #42 で取り込み (API はスタブモードで動作確認済み。画面は Preview で要確認) |
| `claude/new-chat-user-search-zpTEW` | 新規チャット作成シートに相手検索 | ✅ PR #42 で取り込み |
| `claude/nightos-business-model-EGDEX` | ビジネスモデル分析ドキュメント | 必要なら |
| `claude/focused-goldberg-LVkqV` | オーナーアカウント作成 SQL。初期パスワードが平文で書かれている | **リポジトリに入れない** (実行済みならパスワードを変更) |

**削除してよい (取り込み済み、または前提が古い)**

| ブランチ | 理由 |
|---|---|
| `claude/fix-mama-pattern-font-size` | 同名コミットが main にある |
| `claude/fix-mama-new-session-transition` | `claude/fix-mama-session-transition` で取り込み済み |
| `claude/fix-mama-pattern-cards` | `-v5` 版で取り込み済み |
| `claude/schedule-multi-plan` | `-v2` 版で取り込み済み |
| `claude/fix-ruri-mama-ui` | 返し方カードは上記 `-v5` 版で作り直し済み |
| `claude/magical-sagan-hJv5R` | テンプレ導線は別の実装 (`25de776`) で main にある。方針を変えたいときだけ見直す |
| `claude/redesign-ui-modern-d1JXz` | V5 以前の v3 デザイン。`ruri-mama` の改名は方針 (route 名は維持) と逆 |
| `claude/nightos-ui-brushup-MxS8i` | V5 以前。スケジュール機能は別の実装で main にある |
| `claude/continue-session-project-Gq98S` | 5/10 の古い実装 (464 コミット遅れ)。招待コード UI が必要なら作り直す |
| `claude/remove-paid-notice-hvLaq` | マージしても差分なし |

残りの `claude/*` ブランチ (約 130 本) はすべて main に取り込み済みなので、まとめて削除してよい。
