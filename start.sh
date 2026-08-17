#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]]; then kill "$BACKEND_PID" 2>/dev/null || true; fi
  if [[ -n "${FRONTEND_PID:-}" ]]; then kill "$FRONTEND_PID" 2>/dev/null || true; fi
}
trap cleanup EXIT

echo "Starting backend on :8000..."
cd "$ROOT/backend"
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "Starting frontend on :5173..."
cd "$ROOT/frontend"
npm run dev -- --host 0.0.0.0 &
FRONTEND_PID=$!

echo ""
echo "DSA Code Visualizer is running:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo ""
wait
