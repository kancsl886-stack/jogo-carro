#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
chmod +x "$ROOT/jogar.sh" "$ROOT/scripts/build-standalone.py"
python3 "$ROOT/scripts/build-standalone.py"

DESKTOP="${XDG_DESKTOP_DIR:-}"
if [[ -z "$DESKTOP" ]] && [[ -f "$HOME/.config/user-dirs.dirs" ]]; then
  # shellcheck disable=SC1090
  source "$HOME/.config/user-dirs.dirs"
  DESKTOP="${XDG_DESKTOP_DIR:-}"
fi
DESKTOP="${DESKTOP:-$HOME/Desktop}"
mkdir -p "$DESKTOP"

cp -f "$ROOT/Nitro-Surf.html" "$DESKTOP/Nitro Surf.html"
cp -f "$ROOT/Nitro-Surf.html" "$DESKTOP/Nitro Surf 4 faixas.html"
chmod +x "$DESKTOP/Nitro Surf.html" "$DESKTOP/Nitro Surf 4 faixas.html"

ICON="$ROOT/icons/nitro-surf.png"
rm -f "$DESKTOP/Nitro Surf.desktop"
LAUNCHER="$DESKTOP/Nitro Surf 4 faixas.desktop"
cat > "$LAUNCHER" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Nitro Surf
Comment=Corrida pixel art vista de cima
Exec=$ROOT/jogar.sh
Path=$ROOT
Icon=$ICON
Terminal=false
Categories=Game;
StartupNotify=true
EOF
chmod +x "$LAUNCHER"
if command -v gio >/dev/null 2>&1; then
  gio set "$LAUNCHER" metadata::trusted true 2>/dev/null || true
fi
echo "$DESKTOP/Nitro Surf 4 faixas.html"
echo "$LAUNCHER"
