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
2. 未マージの `claude/*` ブランチを確認する。2026-10-01 時点で、main に入っていない差分を持つブランチが **44 本**ある:
   ```bash
   git fetch origin
   for b in $(git branch -r | grep 'origin/claude/'); do
     n=$(git cherry origin/main $b | grep -c '^+'); [ "$n" != 0 ] && echo "$b $n"
   done
   ```
   必要なものは main にマージ、不要なものは削除しておく (Codex に引き継ぐと文脈が失われるため)
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
