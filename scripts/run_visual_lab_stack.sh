#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/visual-lab-app"
BACKEND_PORT="${BACKEND_PORT:-8080}"
COMPARE_LITE_PORT="${COMPARE_LITE_PORT:-18081}"
COMPARE_BOOT_PORT="${COMPARE_BOOT_PORT:-18082}"
FRONTEND_PORT="${FRONTEND_PORT:-4173}"
STATIC_PORT="${STATIC_PORT:-8081}"
RUN_STATIC_SERVER="${RUN_STATIC_SERVER:-0}"
LOG_DIR="${TMPDIR:-/tmp}/spring-lite-visual-lab"

mkdir -p "$LOG_DIR"

BACKEND_LOG="$LOG_DIR/backend.log"
COMPARE_LITE_LOG="$LOG_DIR/compare-lite.log"
COMPARE_BOOT_LOG="$LOG_DIR/compare-boot.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"
STATIC_LOG="$LOG_DIR/static.log"

backend_pid=""
compare_lite_pid=""
compare_boot_pid=""
frontend_pid=""
static_pid=""

cleanup() {
  local exit_code=$?
  trap - EXIT INT TERM

  for pid in "$static_pid" "$frontend_pid" "$compare_boot_pid" "$compare_lite_pid" "$backend_pid"; do
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

is_port_available() {
  local port=$1
  ! lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
}

find_available_port() {
  local preferred_port=$1
  local label=$2
  local port=$preferred_port

  while ! is_port_available "$port"; do
    port=$((port + 1))
  done

  if [[ "$port" != "$preferred_port" ]]; then
    echo "[info] $label port $preferred_port is busy, using $port instead" >&2
  fi

  printf '%s\n' "$port"
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
require_command lsof

if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
  echo "[error] Frontend dependencies are missing." >&2
  echo "Run: cd \"$FRONTEND_DIR\" && npm install" >&2
  exit 1
fi

trap cleanup EXIT INT TERM

BACKEND_PORT="$(find_available_port "$BACKEND_PORT" "Backend")"
COMPARE_LITE_PORT="$(find_available_port "$COMPARE_LITE_PORT" "Spring Lite comparison")"
COMPARE_BOOT_PORT="$(find_available_port "$COMPARE_BOOT_PORT" "Spring Boot comparison")"
FRONTEND_PORT="$(find_available_port "$FRONTEND_PORT" "Frontend")"

echo "[info] Starting example-app on port $BACKEND_PORT"
(
  cd "$ROOT_DIR"
  ./gradlew :example-app:run --console=plain --args="--server.port=${BACKEND_PORT}" >"$BACKEND_LOG" 2>&1
) &
backend_pid=$!

wait_for_http "http://127.0.0.1:${BACKEND_PORT}/orders" "example-app" || {
  echo "[hint] Inspect backend log: $BACKEND_LOG" >&2
  exit 1
}

echo "[info] Starting comparison apps on ports $COMPARE_LITE_PORT and $COMPARE_BOOT_PORT"
(
  cd "$ROOT_DIR"
  ./gradlew :comparison-spring-lite-app:run --console=plain --args="--server.port=${COMPARE_LITE_PORT}" >"$COMPARE_LITE_LOG" 2>&1
) &
compare_lite_pid=$!
(
  cd "$ROOT_DIR"
  ./gradlew :comparison-spring-boot-app:run --console=plain --args="--server.port=${COMPARE_BOOT_PORT}" >"$COMPARE_BOOT_LOG" 2>&1
) &
compare_boot_pid=$!
wait_for_http "http://127.0.0.1:${COMPARE_LITE_PORT}/lab/compare/di" "Spring Lite comparison" || exit 1
wait_for_http "http://127.0.0.1:${COMPARE_BOOT_PORT}/lab/compare/di" "Spring Boot comparison" || exit 1

echo "[info] Starting visual-lab-app on port $FRONTEND_PORT"
(
  cd "$FRONTEND_DIR"
  VITE_PROXY_TARGET="http://127.0.0.1:${BACKEND_PORT}" VITE_COMPARE_LITE_PROXY_TARGET="http://127.0.0.1:${COMPARE_LITE_PORT}" VITE_COMPARE_BOOT_PROXY_TARGET="http://127.0.0.1:${COMPARE_BOOT_PORT}" npm run dev -- --host 127.0.0.1 --port "$FRONTEND_PORT" >"$FRONTEND_LOG" 2>&1
) &
frontend_pid=$!

wait_for_http "http://127.0.0.1:${FRONTEND_PORT}" "visual-lab-app" || {
  echo "[hint] Inspect frontend log: $FRONTEND_LOG" >&2
  exit 1
}

if [[ "$RUN_STATIC_SERVER" == "1" ]]; then
  STATIC_PORT="$(find_available_port "$STATIC_PORT" "Static")"
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
  Spring Lite API:  http://127.0.0.1:${COMPARE_LITE_PORT}/lab/compare/di
  Spring Boot API:  http://127.0.0.1:${COMPARE_BOOT_PORT}/lab/compare/di
  Static visual-lab: $( [[ "$RUN_STATIC_SERVER" == "1" ]] && printf 'http://127.0.0.1:%s/visual-lab/index.html' "$STATIC_PORT" || printf 'not started (set RUN_STATIC_SERVER=1)' )

Logs:
  backend:  $BACKEND_LOG
  compare lite: $COMPARE_LITE_LOG
  compare boot: $COMPARE_BOOT_LOG
  frontend: $FRONTEND_LOG
  static:   $STATIC_LOG

Press Ctrl+C to stop all started processes.
EOF

wait
