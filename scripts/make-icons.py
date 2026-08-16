#!/usr/bin/env python3
"""Gera o ícone PNG/ICO do Nitro Surf."""
from pathlib import Path
import struct
import zlib

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "icons"
OUT.mkdir(exist_ok=True)


def chunk(tag: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)


def write_png(path: Path, size: int, pixels):
    raw = bytearray()
    for y in range(size):
        raw.append(0)
        raw.extend(pixels[y * size * 4 : (y + 1) * size * 4])
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + chunk(b"IEND", b"")
    path.write_bytes(png)


def circle(px, py, cx, cy, r, color, img, size):
    r2 = r * r
    for y in range(max(0, cy - r), min(size, cy + r + 1)):
        for x in range(max(0, cx - r), min(size, cx + r + 1)):
            if (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r2:
                i = (y * size + x) * 4
                img[i : i + 4] = color


def rect(px, py, w, h, color, img, size):
    for y in range(max(0, py), min(size, py + h)):
        for x in range(max(0, px), min(size, px + w)):
            i = (y * size + x) * 4
            img[i : i + 4] = color


def make(size: int) -> bytes:
    img = bytearray([0x5E, 0xB0, 0xFF, 0xFF] * (size * size))
    s = size / 256
    def n(v):
        return int(v * s)
    # sun
    circle(0, 0, n(200), n(52), n(28), bytes([255, 244, 180, 255]), img, size)
    # road
    rect(0, n(170), size, n(86), bytes([70, 74, 86, 255]), img, size)
    # building left
    rect(n(12), n(70), n(46), n(100), bytes([230, 236, 244, 255]), img, size)
    rect(n(18), n(80), n(10), n(10), bytes([90, 126, 170, 255]), img, size)
    rect(n(34), n(80), n(10), n(10), bytes([90, 126, 170, 255]), img, size)
    rect(n(18), n(100), n(10), n(10), bytes([90, 126, 170, 255]), img, size)
    rect(n(34), n(100), n(10), n(10), bytes([90, 126, 170, 255]), img, size)
    # building right
    rect(n(198), n(50), n(46), n(120), bytes([210, 220, 232, 255]), img, size)
    rect(n(206), n(62), n(10), n(10), bytes([90, 126, 170, 255]), img, size)
    rect(n(222), n(62), n(10), n(10), bytes([90, 126, 170, 255]), img, size)
    # car body
    rect(n(70), n(148), n(116), n(38), bytes([255, 61, 154, 255]), img, size)
    rect(n(92), n(128), n(72), n(26), bytes([60, 240, 255, 255]), img, size)
    circle(0, 0, n(96), n(188), n(16), bytes([30, 30, 30, 255]), img, size)
    circle(0, 0, n(164), n(188), n(16), bytes([30, 30, 30, 255]), img, size)
    return bytes(img)


def write_ico(path: Path, png_bytes: bytes, size: int):
    header = struct.pack("<HHH", 0, 1, 1)
    entry = struct.pack("<BBBBHHII", size if size < 256 else 0, size if size < 256 else 0, 0, 0, 1, 32, len(png_bytes), 22)
    path.write_bytes(header + entry + png_bytes)


def main():
    for size, name in ((192, "nitro-surf-192.png"), (256, "nitro-surf.png"), (512, "nitro-surf-512.png")):
        pixels = make(size)
        write_png(OUT / name, size, pixels)
    png256 = (OUT / "nitro-surf.png").read_bytes()
    write_ico(OUT / "nitro-surf.ico", png256, 256)
    print("icons ok")


if __name__ == "__main__":
    main()
