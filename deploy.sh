#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "==> Installing dependencies..."
[[ -d node_modules ]] || npm install
npm install --prefix frontend --include=dev
export PATH="$ROOT/node_modules/.bin:$PATH"

if ! firebase projects:list >/dev/null 2>&1; then
  echo ""
  echo "Firebase login required. Run:"
  echo "  npx firebase login"
  exit 1
fi

if [[ ! -f .firebaserc ]] || grep -q "your-firebase-project-id" .firebaserc 2>/dev/null; then
  echo ""
  echo "Link your Firebase project:"
  firebase use --add
fi

echo ""
echo "==> Building frontend..."
npm run build --prefix frontend

echo ""
echo "==> Deploying to Firebase Hosting..."
firebase deploy --only hosting "$@"

echo ""
PROJECT=$(firebase use 2>/dev/null | sed -n 's/.*(\(.*\)).*/\1/p' | head -1 || true)
echo "Done! Your app is live at: https://${PROJECT}.web.app"
