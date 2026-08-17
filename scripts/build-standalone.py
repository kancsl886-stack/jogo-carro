#!/usr/bin/env python3
"""Junta o jogo num único HTML para jogar na área de trabalho."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
html = (ROOT / "index.html").read_text(encoding="utf-8")
css = (ROOT / "css" / "style.css").read_text(encoding="utf-8")
scripts = "\n".join(
    (ROOT / "js" / name).read_text(encoding="utf-8")
    for name in ("cars.js", "storage.js", "i18n.js", "audio.js", "game.js", "ui.js")
)

html = html.replace(
    '    <link rel="manifest" href="manifest.webmanifest" />\n',
    "",
)
html = html.replace(
    '    <link rel="icon" href="icons/nitro-surf.png" />\n',
    '    <link rel="icon" href="data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><text y=\'.9em\' font-size=\'90\'>🏎️</text></svg>" />\n',
)
html = html.replace(
    '    <link rel="apple-touch-icon" href="icons/nitro-surf-192.png" />\n',
    "",
)
html = html.replace(
    '    <link rel="stylesheet" href="css/style.css?v=ref19" />\n',
    "    <style>\n" + css + "\n    </style>\n",
)
html = html.replace(
    """    <script src="js/cars.js?v=ref19"></script>
    <script src="js/storage.js?v=ref19"></script>
    <script src="js/i18n.js?v=ref19"></script>
    <script src="js/audio.js?v=ref19"></script>
    <script src="js/game.js?v=ref19"></script>
    <script src="js/ui.js?v=ref19"></script>
""",
    "    <script>\n" + scripts + "\n    </script>\n",
)

out = ROOT / "Nitro-Surf.html"
out.write_text(html, encoding="utf-8")
print(f"wrote {out} ({out.stat().st_size} bytes)")
