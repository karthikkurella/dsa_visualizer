#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/frontend"
[[ -d node_modules ]] || npm install
echo "Starting at http://localhost:5173"
npm run dev
