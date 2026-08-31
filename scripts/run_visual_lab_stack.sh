#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/visual-lab-app"
BACKEND_PORT="${BACKEND_PORT:-8080}"
FRONTEND_PORT="${FRONTEND_PORT:-4173}"
STATIC_PORT="${STATIC_PORT:-8081}"
RUN_STATIC_SERVER="${RUN_STATIC_SERVER:-0}"
LOG_DIR="${TMPDIR:-/tmp}/spring-lite-visual-lab"

mkdir -p "$LOG_DIR"

BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"
STATIC_LOG="$LOG_DIR/static.log"

backend_pid=""
frontend_pid=""
static_pid=""

cleanup() {
  local exit_code=$?
  trap - EXIT INT TERM

  for pid in "$static_pid" "$frontend_pid" "$backend_pid"; do
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
      wait "$pid" 2>/dev/null || true
    fi
  done

  exit "$exit_code"
}

wait_for_http() {
  local url=$1
  local name=$2
  local attempts=${3:-60}

  for ((i=1; i<=attempts; i++)); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "[ready] $name -> $url"
      return 0
    fi
    sleep 1
  done

  echo "[warn] $name did not respond in time: $url"
  return 1
}

require_command() {
  local command_name=$1
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "[error] Required command not found: $command_name" >&2
    exit 1
  fi
}

require_command curl
require_command java
require_command npm

if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
  echo "[error] Frontend dependencies are missing." >&2
  echo "Run: cd \"$FRONTEND_DIR\" && npm install" >&2
  exit 1
fi

trap cleanup EXIT INT TERM

echo "[info] Starting example-app on port $BACKEND_PORT"
(
  cd "$ROOT_DIR"
  ./gradlew :example-app:run --console=plain >"$BACKEND_LOG" 2>&1
) &
backend_pid=$!

wait_for_http "http://127.0.0.1:${BACKEND_PORT}/orders" "example-app" || {
  echo "[hint] Inspect backend log: $BACKEND_LOG" >&2
  exit 1
}

echo "[info] Starting visual-lab-app on port $FRONTEND_PORT"
(
  cd "$FRONTEND_DIR"
  npm run dev -- --host 127.0.0.1 --port "$FRONTEND_PORT" >"$FRONTEND_LOG" 2>&1
) &
frontend_pid=$!

wait_for_http "http://127.0.0.1:${FRONTEND_PORT}" "visual-lab-app" || {
  echo "[hint] Inspect frontend log: $FRONTEND_LOG" >&2
  exit 1
}

if [[ "$RUN_STATIC_SERVER" == "1" ]]; then
  echo "[info] Starting static visual-lab server on port $STATIC_PORT"
  (
    cd "$ROOT_DIR"
    python3 -m http.server "$STATIC_PORT" >"$STATIC_LOG" 2>&1
  ) &
  static_pid=$!
  wait_for_http "http://127.0.0.1:${STATIC_PORT}/visual-lab/index.html" "static visual-lab" || {
    echo "[hint] Inspect static log: $STATIC_LOG" >&2
    exit 1
  }
fi

cat <<EOF

[ready] Spring Lite dashboard stack is running.

  Live dashboard:   http://127.0.0.1:${FRONTEND_PORT}
  Example API:      http://127.0.0.1:${BACKEND_PORT}/orders
  Static visual-lab: http://127.0.0.1:${STATIC_PORT}/visual-lab/index.html

Logs:
  backend:  $BACKEND_LOG
  frontend: $FRONTEND_LOG
  static:   $STATIC_LOG

Press Ctrl+C to stop all started processes.
EOF

wait
