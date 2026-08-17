#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "==> Installing dependencies..."
[[ -d node_modules ]] || npm install
[[ -d frontend/node_modules ]] || npm install --prefix frontend
export PATH="$ROOT/node_modules/.bin:$PATH"

if ! firebase projects:list >/dev/null 2>&1; then
  echo ""
  echo "Firebase login required. Run:"
  echo "  npx firebase login"
  echo "Then run deploy again."
  exit 1
fi

if [[ ! -f .firebaserc ]] || grep -q "your-firebase-project-id" .firebaserc 2>/dev/null; then
  echo ""
  echo "Link your Firebase project:"
  firebase use --add
fi

PROJECT=$(firebase use 2>/dev/null | sed -n 's/.*(\(.*\)).*/\1/p' | head -1 || true)
echo ""
echo "==> Deploying to Firebase Hosting${PROJECT:+ ($PROJECT)}..."
firebase deploy --only hosting "$@"

echo ""
echo "Done! Your app is live at:"
firebase hosting:sites:list 2>/dev/null | head -5 || echo "  https://<project-id>.web.app"
