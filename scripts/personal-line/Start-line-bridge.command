#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/../.."
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
if command -v node >/dev/null 2>&1; then
  LINE_NODE="$(command -v node)"
elif [ -x "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" ]; then
  LINE_NODE="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
else
  echo "Node.js 20以上が必要です。"
  read -r -p "Enterで閉じます。"
  exit 1
fi
echo "初回はNIGHTOSのLINE接続画面で接続コードを作成してください。"
read -r -p "新しい接続コードを登録しますか？（初回 y / 接続を再開するだけなら Enter）: " LINE_PAIR
if [ "$LINE_PAIR" = y ]; then
  "$LINE_NODE" scripts/personal-line/bridge.mjs --pair
else
  "$LINE_NODE" scripts/personal-line/bridge.mjs
fi
