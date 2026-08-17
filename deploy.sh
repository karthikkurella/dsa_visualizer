#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

if ! command -v firebase >/dev/null 2>&1; then
  echo "==> Installing Firebase CLI..."
  (cd "$ROOT" && npm install)
  export PATH="$ROOT/node_modules/.bin:$PATH"
fi

if [[ ! -f "$ROOT/.firebaserc" ]] || grep -q "your-firebase-project-id" "$ROOT/.firebaserc"; then
  echo "Error: Set your Firebase project ID in .firebaserc before deploying."
  echo "  firebase login"
  echo "  firebase use --add"
  exit 1
fi

echo "==> Building frontend..."
npm run build --prefix "$ROOT/frontend"

echo "==> Deploying to Firebase Hosting (Spark/free plan)..."
firebase deploy --only hosting "$@"
