#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$ROOT/.venv"
BACKEND_DIR="$ROOT/backend"
FRONTEND_DIR="$ROOT/frontend"

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]]; then kill "$BACKEND_PID" 2>/dev/null || true; fi
  if [[ -n "${FRONTEND_PID:-}" ]]; then kill "$FRONTEND_PID" 2>/dev/null || true; fi
}
trap cleanup EXIT

echo "==> Setting up Python virtual environment..."
if [[ ! -d "$VENV_DIR" ]]; then
  if ! python3 -m venv "$VENV_DIR" 2>/dev/null; then
    echo "    python3-venv not available, installing virtualenv fallback..."
    python3 -m pip install --user virtualenv -q
    python3 -m virtualenv "$VENV_DIR"
  fi
  echo "    Created $VENV_DIR"
fi

# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"

echo "==> Installing Python dependencies..."
python -m pip install --upgrade pip -q
python -m pip install -r "$BACKEND_DIR/requirements.txt" -q

echo "==> Installing frontend dependencies..."
if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
  (cd "$FRONTEND_DIR" && npm install)
else
  echo "    node_modules already present, skipping npm install"
fi

echo "==> Starting backend on http://localhost:8000 ..."
cd "$BACKEND_DIR"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "==> Starting frontend on http://localhost:5173 ..."
cd "$FRONTEND_DIR"
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

echo ""
echo "DSA Code Visualizer is running:"
echo "  Open:     http://localhost:5173"
echo "  API:      http://localhost:8000"
echo "  Press Ctrl+C to stop both servers"
echo ""
wait
