#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

command -v firebase >/dev/null || { (cd "$ROOT" && npm install); export PATH="$ROOT/node_modules/.bin:$PATH"; }

grep -q "your-firebase-project-id" "$ROOT/.firebaserc" 2>/dev/null && {
  echo "Run: firebase login && firebase use --add"
  exit 1
}

npm run build --prefix "$ROOT/frontend"
firebase deploy --only hosting "$@"
