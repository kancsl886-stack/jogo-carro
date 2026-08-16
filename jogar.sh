#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

PORT="${PORT:-8080}"
if ! curl -sf -o /dev/null "http://127.0.0.1:${PORT}/" 2>/dev/null; then
  python3 -m http.server "$PORT" --bind 127.0.0.1 >/tmp/nitro-surf-http.log 2>&1 &
  sleep 0.4
fi

CHROME="$(command -v google-chrome || command -v google-chrome-stable || command -v chromium-browser || true)"
if [[ -n "$CHROME" ]]; then
  exec "$CHROME" --no-sandbox --disable-dev-shm-usage --app="http://127.0.0.1:${PORT}/" --start-maximized
fi
xdg-open "http://127.0.0.1:${PORT}/" >/dev/null 2>&1 || open "http://127.0.0.1:${PORT}/"
