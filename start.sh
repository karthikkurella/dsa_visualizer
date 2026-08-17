#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$ROOT/frontend"

echo "==> Installing frontend dependencies..."
if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
  (cd "$FRONTEND_DIR" && npm install)
else
  echo "    node_modules already present, skipping npm install"
fi

echo "==> Starting frontend on http://localhost:5173 ..."
echo "    Python runs in your browser via Pyodide (first load may take a few seconds)"
cd "$FRONTEND_DIR"
npm run dev -- --host 0.0.0.0 --port 5173
