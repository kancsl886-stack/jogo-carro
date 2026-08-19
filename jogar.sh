#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
chmod +x "$ROOT/scripts/build-standalone.py"
python3 "$ROOT/scripts/build-standalone.py" >/dev/null

DESKTOP="${XDG_DESKTOP_DIR:-}"
if [[ -z "$DESKTOP" ]] && [[ -f "$HOME/.config/user-dirs.dirs" ]]; then
  # shellcheck disable=SC1090
  source "$HOME/.config/user-dirs.dirs"
  DESKTOP="${XDG_DESKTOP_DIR:-}"
fi
DESKTOP="${DESKTOP:-$HOME/Desktop}"
mkdir -p "$DESKTOP"

GAME="$DESKTOP/Nitro Surf 4 faixas.html"
cp -f "$ROOT/Nitro-Surf.html" "$GAME"
cp -f "$ROOT/Nitro-Surf.html" "$DESKTOP/Nitro Surf.html"
chmod +x "$GAME"

URI="$(python3 -c "from pathlib import Path; print(Path(r'''$GAME''').resolve().as_uri())")"

CHROME="$(command -v google-chrome || command -v google-chrome-stable || command -v chromium-browser || true)"
if [[ -n "$CHROME" ]]; then
  exec "$CHROME" \
    --no-sandbox \
    --disable-dev-shm-usage \
    --disable-application-cache \
    --disk-cache-size=1 \
    --user-data-dir=/tmp/nitro-surf-chrome \
    --app="${URI}" \
    --start-maximized
fi
xdg-open "$GAME" >/dev/null 2>&1 || open "$GAME"
