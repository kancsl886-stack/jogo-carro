const CARS = [
  {
    id: "fusca",
    name: "Fusca Flash",
    type: "Hatch",
    rarity: "comum",
    price: 0,
    stats: { speed: 0.72, handling: 0.86, magnet: 1.05 },
    colors: { body: "#6ec4f0", stripe: "#ffffff", glass: "#111111", trim: "#2b2b2b" },
    shape: "beetle",
  },
  {
    id: "uno",
    name: "Uno Turbo",
    type: "Hatch",
    rarity: "comum",
    price: 280,
    stats: { speed: 0.84, handling: 1.08, magnet: 1.0 },
    colors: { body: "#ff8c1a", stripe: "#ffffff", glass: "#111111", trim: "#1f1f1f" },
    shape: "hatch",
  },
  {
    id: "civic",
    name: "Civic Night",
    type: "Sedan",
    rarity: "comum",
    price: 620,
    stats: { speed: 0.96, handling: 0.94, magnet: 1.1 },
    colors: { body: "#2d4ecf", stripe: "#ffffff", glass: "#111111", trim: "#111" },
    shape: "sedan",
  },
  {
    id: "taxi",
    name: "Táxi RJ",
    type: "Sedan",
    rarity: "raro",
    price: 980,
    stats: { speed: 0.88, handling: 1.02, magnet: 1.42 },
    colors: { body: "#f0c420", stripe: "#ffffff", glass: "#111111", trim: "#222" },
    shape: "taxi",
  },
  {
    id: "saveiro",
    name: "Saveiro Sertão",
    type: "Pickup",
    rarity: "raro",
    price: 1450,
    stats: { speed: 0.9, handling: 0.78, magnet: 1.5 },
    colors: { body: "#c42a1a", stripe: "#ffffff", glass: "#111111", trim: "#1a1a1a" },
    shape: "pickup",
  },
  {
    id: "tracker",
    name: "Tracker Selva",
    type: "SUV",
    rarity: "raro",
    price: 1900,
    stats: { speed: 0.86, handling: 0.74, magnet: 1.6 },
    colors: { body: "#1fbf6a", stripe: "#ffffff", glass: "#111111", trim: "#0d1f14" },
    shape: "suv",
  },
  {
    id: "mustang",
    name: "Mustang Trovão",
    type: "Muscle",
    rarity: "epico",
    price: 3200,
    stats: { speed: 1.18, handling: 0.88, magnet: 0.9 },
    colors: { body: "#2d4ecf", stripe: "#ffffff", glass: "#111111", trim: "#0a0a0a" },
    shape: "muscle",
  },
  {
    id: "policia",
    name: "Ronda 190",
    type: "Polícia",
    rarity: "epico",
    price: 4100,
    stats: { speed: 1.12, handling: 1.24, magnet: 1.1 },
    colors: { body: "#2d4ecf", stripe: "#ffffff", glass: "#1a1a1a", trim: "#111" },
    shape: "police",
  },
  {
    id: "cayman",
    name: "Cayman Neon",
    type: "Esportivo",
    rarity: "epico",
    price: 5600,
    stats: { speed: 1.28, handling: 1.38, magnet: 1.05 },
    colors: { body: "#ff8c1a", stripe: "#ffffff", glass: "#111111", trim: "#062022" },
    shape: "sports",
  },
  {
    id: "sunset",
    name: "Sunset Cabrio",
    type: "Conversível",
    rarity: "epico",
    price: 7200,
    stats: { speed: 1.2, handling: 1.46, magnet: 1.2 },
    colors: { body: "#ff8c1a", stripe: "#ffffff", glass: "#111111", trim: "#2a1020" },
    shape: "convertible",
  },
  {
    id: "aventador",
    name: "Aventador Violeta",
    type: "Supercarro",
    rarity: "lendario",
    price: 9800,
    stats: { speed: 1.42, handling: 1.4, magnet: 1.15 },
    colors: { body: "#c42a1a", stripe: "#ffffff", glass: "#111111", trim: "#16081e" },
    shape: "super",
  },
  {
    id: "formula",
    name: "Fórmula Nitro",
    type: "Fórmula",
    rarity: "lendario",
    price: 13500,
    stats: { speed: 1.58, handling: 1.55, magnet: 0.8 },
    colors: { body: "#1fbf6a", stripe: "#ffffff", glass: "#111111", trim: "#c0392b" },
    shape: "formula",
  },
  {
    id: "hyperion",
    name: "Hyperion X",
    type: "Hypercar",
    rarity: "lendario",
    price: 18000,
    stats: { speed: 1.64, handling: 1.48, magnet: 1.3 },
    colors: { body: "#6ec4f0", stripe: "#ffffff", glass: "#111111", trim: "#3cf0ff" },
    shape: "hyper",
  },
];

function getCar(id) {
  return CARS.find((car) => car.id === id) || CARS[0];
}

function statPercent(value, max) {
  return Math.max(8, Math.min(100, Math.round((value / max) * 100)));
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawWheel(ctx, x, y, r) {
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.ellipse(x, y, r * 1.15, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#666";
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.45, r * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawVehicle(ctx, x, y, scale, car, extras) {
  extras = extras || {};
  const c = car.colors;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (extras.nitro) {
    ctx.fillStyle = "rgba(60,240,255,0.28)";
    ctx.beginPath();
    ctx.moveTo(-10, 18);
    ctx.lineTo(-28 - extras.nitro * 18, 26);
    ctx.lineTo(10, 18);
    ctx.fill();
  }

  const shape = car.shape;
  drawWheel(ctx, -22, 18, 8);
  drawWheel(ctx, 22, 18, 8);

  ctx.fillStyle = c.body;
  if (shape === "formula") {
    ctx.fillStyle = c.trim;
    roundRect(ctx, -28, 4, 56, 8, 2);
    ctx.fill();
    ctx.fillStyle = c.body;
    roundRect(ctx, -10, -10, 20, 26, 6);
    ctx.fill();
    ctx.fillStyle = c.stripe;
    roundRect(ctx, -3, -10, 6, 26, 2);
    ctx.fill();
    ctx.fillStyle = c.glass;
    roundRect(ctx, -7, -6, 14, 8, 3);
    ctx.fill();
  } else if (shape === "pickup") {
    roundRect(ctx, -30, -2, 60, 18, 5);
    ctx.fill();
    ctx.fillStyle = c.trim;
    roundRect(ctx, -26, -6, 28, 12, 3);
    ctx.fill();
    ctx.fillStyle = c.glass;
    roundRect(ctx, -22, -4, 18, 8, 2);
    ctx.fill();
  } else if (shape === "suv") {
    roundRect(ctx, -32, -10, 64, 26, 7);
    ctx.fill();
    ctx.fillStyle = c.glass;
    roundRect(ctx, -22, -6, 44, 12, 4);
    ctx.fill();
  } else if (shape === "super" || shape === "hyper" || shape === "sports") {
    ctx.beginPath();
    ctx.moveTo(-34, 14);
    ctx.lineTo(-24, 0);
    ctx.lineTo(24, 0);
    ctx.lineTo(34, 14);
    ctx.lineTo(22, 18);
    ctx.lineTo(-22, 18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = c.glass;
    ctx.beginPath();
    ctx.moveTo(-16, 2);
    ctx.lineTo(16, 2);
    ctx.lineTo(12, 10);
    ctx.lineTo(-12, 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = c.stripe;
    ctx.fillRect(-2, 0, 4, 16);
    if (shape !== "sports") {
      ctx.fillStyle = c.trim;
      ctx.fillRect(-26, -2, 52, 3);
    }
  } else if (shape === "convertible") {
    roundRect(ctx, -30, 2, 60, 16, 6);
    ctx.fill();
    ctx.fillStyle = "#2a1020";
    roundRect(ctx, -16, 0, 32, 8, 3);
    ctx.fill();
    ctx.fillStyle = c.stripe;
    ctx.fillRect(-30, 10, 60, 3);
  } else {
    const tall = shape === "hatch" ? -4 : -8;
    roundRect(ctx, -30, tall + 6, 60, 20, 6);
    ctx.fill();
    ctx.fillStyle = c.glass;
    roundRect(ctx, -18, tall + 8, 36, 10, 4);
    ctx.fill();
    if (shape === "taxi") {
      ctx.fillStyle = "#111";
      roundRect(ctx, -8, tall + 1, 16, 7, 2);
      ctx.fill();
      ctx.fillStyle = "#f1c40f";
      ctx.font = "bold 6px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("TAXI", 0, tall + 6);
    }
    if (shape === "police") {
      ctx.fillStyle = "#1a4b8c";
      ctx.fillRect(-30, 8, 60, 5);
      ctx.fillStyle = extras.flash ? "#ff4d4d" : "#4da3ff";
      roundRect(ctx, -10, tall + 1, 20, 6, 2);
      ctx.fill();
    }
    if (shape === "muscle") {
      ctx.fillStyle = c.stripe;
      ctx.fillRect(-4, tall + 6, 8, 18);
    }
  }

  ctx.fillStyle = extras.brake ? "#ff4d4d" : "#ff9aa8";
  ctx.beginPath();
  ctx.arc(-16, 16, 2.2, 0, Math.PI * 2);
  ctx.arc(16, 16, 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function blitSprite(ctx, ox, oy, u, rows, palette, outline) {
  const h = rows.length;
  const w = rows[0].length;
  const x0 = Math.round(ox);
  const y0 = Math.round(oy);
  const filled = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return false;
    const ch = rows[y][x];
    return Boolean(ch && ch !== "." && ch !== " " && palette[ch]);
  };
  if (outline) {
    ctx.fillStyle = outline;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!filled(x, y)) continue;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (Math.abs(dx) + Math.abs(dy) !== 1) continue;
            if (!filled(x + dx, y + dy)) ctx.fillRect(x0 + (x + dx) * u, y0 + (y + dy) * u, u, u);
          }
        }
      }
    }
  }
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < w; x++) {
      const ch = row[x];
      if (!ch || ch === "." || ch === " ") continue;
      const color = palette[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x0 + x * u, y0 + y * u, u, u);
    }
  }
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = w - 1; x >= 0; x--) {
      const ch = row[x];
      if (!ch || ch === "." || ch === " ") continue;
      if (ch === "N") {
        ctx.fillStyle = palette.B || palette.H;
        ctx.fillRect(x0 + x * u, y0 + y * u, u, u);
      }
      break;
    }
  }
}

function shadeHex(hex, amt) {
  const raw = String(hex || "#888888").replace("#", "");
  const n = raw.length === 3 ? raw.split("").map((ch) => ch + ch).join("") : raw.padEnd(6, "0");
  const r = parseInt(n.slice(0, 2), 16) || 0;
  const g = parseInt(n.slice(2, 4), 16) || 0;
  const b = parseInt(n.slice(4, 6), 16) || 0;
  const t = (v) => Math.max(0, Math.min(255, Math.round(v + 255 * amt)));
  const h = (v) => t(v).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

const SPRITES = {
  beetle: [
    "...Y...Y...",
    "..HHHHHHH..",
    "..HBBBBBN..",
    "...HKKKN...",
    "..HGKKKGN..",
    "..HBBBBBN..",
    "..HBBBBBN..",
    "...NR.RN...",
    "..NNNNNNN..",
  ],
  hatch: [
    "...Y...Y...",
    "..HHHHHHH..",
    "..HBTTTBN..",
    "..HBKKKBN..",
    "..HBTTTBN..",
    "..HBBBBBN..",
    "..HBBBBBN..",
    "..NR...RN..",
    "..NNNNNNN..",
  ],
  sedan: [
    "...Y...Y...",
    "..MHHHHHN..",
    "..HHBBBBN..",
    "..HBBBBBN..",
    "..HKKKKKN..",
    "..GKKKKKG..",
    "..HBBBBBN..",
    "..HBBBBBN..",
    "..HBBBBBN..",
    "..NR...RN..",
    "..NNNNNNN..",
  ],
  taxi: [
    "...Y...Y...",
    "...CAAAC...",
    "..HHHHHHN..",
    "..HBBBBBN..",
    "..HKKKKKN..",
    "..TBTBTBT..",
    "..HBBBBBN..",
    "..TBTBTBT..",
    "..NR...RN..",
    "..NNNNNNN..",
  ],
  pickup: [
    "...Y...Y...",
    "..HHHHHHN..",
    "..HKKKKKN..",
    "..HBBBBBN..",
    "..MMMMMMM..",
    "..DDDDDDD..",
    "..DDDDDDD..",
    "..DR...RD..",
    "..DDDDDDD..",
  ],
  suv: [
    "...Y...Y...",
    "..C.....C..",
    ".HHHHHHHHH.",
    ".HKKKKKKKN.",
    ".HBBBBBBBN.",
    ".HBBBBBBBN.",
    ".HBBBBBBBN.",
    ".NR.....RN.",
    ".NNNNNNNNN.",
  ],
  muscle: [
    "...Y...Y...",
    "..HHTTHHN..",
    "..HTTBTTH..",
    "..HTKTKTH..",
    "..HTTBTTH..",
    "..HTTBTTH..",
    "..HHTTHHN..",
    "..NR.T.RN..",
    "..NNNNNNN..",
  ],
  police: [
    "...Y...Y...",
    "..HHHHHHN..",
    "..HBBBBBN..",
    "..HKKKKKN..",
    "..PPBBBPP..",
    "..HBBBBBN..",
    "..PPBBBPP..",
    "..NR...RN..",
    "..NNNNNNN..",
  ],
  sports: [
    "..Y.....Y..",
    "..HHHHHHH..",
    "..HTTBTTH..",
    "..HTTKTTH..",
    "..HTTBTTH..",
    "..HTTBTTH..",
    "..HBBBBBN..",
    "..NR.T.RN..",
    "..NNNNNNN..",
  ],
  convertible: [
    "...Y...Y...",
    "..HHHHHHN..",
    "..HTTBTTH..",
    "..HTTKTTH..",
    "..HBSSSBH..",
    "..HBSSSBH..",
    "..HTTBTTH..",
    "..NR.T.RN..",
    "..NNNNNNN..",
  ],
  super: [
    "..Y.....Y..",
    "..HHHHHHH..",
    "..HTBBBTH..",
    "..HTTKTTH..",
    "..HTTDTTH..",
    "..HTTBTTH..",
    "..HTTBTTH..",
    "..NR.T.RN..",
    "..NNNNNNN..",
  ],
  formula: [
    "...Y...Y...",
    "....HHH....",
    "...HAAAH...",
    "...HKKKH...",
    "..HHBBBHH..",
    "..HBSSSBH..",
    "..HHBBBHH..",
    "...NR.RN...",
    "..CCCCCCC..",
  ],
  hyper: [
    "..Y.....Y..",
    "..HTBBBTH..",
    "..HTTKTTH..",
    "..HTTBTTH..",
    "..HTTCCCH..",
    "..HTTAAAH..",
    "..HTTBTTH..",
    "..NR.T.RN..",
    "..NNNNNNN..",
  ],
};

function spriteFor(car) {
  return SPRITES[car && car.shape] || SPRITES.hatch;
}

let _carScratch = null;

function carScratch(w, h) {
  if (!_carScratch) _carScratch = document.createElement("canvas");
  if (_carScratch.width !== w || _carScratch.height !== h) {
    _carScratch.width = w;
    _carScratch.height = h;
  }
  const c = _carScratch.getContext("2d");
  c.clearRect(0, 0, w, h);
  c.imageSmoothingEnabled = false;
  return c;
}

const _carBitmaps = new Map();

function carBitmap(car, extras) {
  const c = (car && car.colors) || {};
  const body = c.body || "#6ec4f0";
  const key = `${car && car.shape}|${body}|${c.stripe || ""}|${c.trim || ""}|${extras && extras.brake ? 1 : 0}`;
  let bmp = _carBitmaps.get(key);
  if (bmp) return bmp;
  const rows = spriteFor(car);
  if (!rows || !rows.length || !rows[0]) return null;
  const w = rows[0].length;
  const h = rows.length;
  const palette = {
    B: body,
    H: shadeHex(body, 0.08),
    N: shadeHex(body, -0.06),
    K: "#1a2838",
    G: "#5b7d9a",
    I: "#8eb4d4",
    S: "#1a1a1a",
    W: "#4a4a4a",
    Y: "#ffe14a",
    R: extras && extras.brake ? "#ff2a2a" : "#ff6a18",
    T: c.stripe || "#f4f7fb",
    C: c.trim || "#222222",
    A: car && car.shape === "taxi" ? "#f1c40f" : c.trim || "#3cf0ff",
    D: "#2a2a2a",
    M: "#c5ccd6",
    P: "#f2f2f2",
  };
  const cell = 2;
  const pad = 1;
  const bw = (w + pad * 2) * cell;
  const bh = (h + pad * 2) * cell;
  const sctx = carScratch(bw, bh);
  blitSprite(sctx, pad * cell, pad * cell, cell, rows, palette, "#1a1a22");
  bmp = document.createElement("canvas");
  bmp.width = bw;
  bmp.height = bh;
  bmp.getContext("2d").drawImage(_carScratch, 0, 0);
  if (_carBitmaps.size > 64) _carBitmaps.clear();
  _carBitmaps.set(key, bmp);
  return bmp;
}

function drawCarTop(ctx, x, y, scale, car, extras) {
  extras = extras || {};
  const dest = Math.max(2, extras.u || Math.round(scale) || 3);
  const rows = spriteFor(car);
  if (!rows || !rows.length || !rows[0]) return;
  const w = rows[0].length;
  const h = rows.length;
  const bmp = carBitmap(car, extras);
  if (!bmp) return;
  const pad = 1;
  ctx.save();
  ctx.translate(x, y);
  if (extras.yaw) ctx.rotate(extras.yaw);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  if (ctx.ellipse) ctx.ellipse(0, dest * 0.7, (w * dest) / 2.15, h * dest * 0.12, 0, 0, Math.PI * 2);
  else ctx.rect((-w * dest) / 2, dest * 0.5, w * dest, dest);
  ctx.fill();
  if (extras.nitro) {
    ctx.fillStyle = "#7fe7ff";
    ctx.fillRect(-1.6 * dest, (h * dest) / 2 - dest, 3.2 * dest, 2.4 * dest);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-0.8 * dest, (h * dest) / 2 + dest, 1.6 * dest, 1.4 * dest);
  }
  ctx.imageSmoothingEnabled = true;
  if (ctx.imageSmoothingQuality) ctx.imageSmoothingQuality = "low";
  const dw = (w + pad * 2) * dest;
  const dh = (h + pad * 2) * dest;
  ctx.drawImage(bmp, -dw / 2, -dh / 2, dw, dh);
  ctx.imageSmoothingEnabled = false;
  if (car && car.shape === "police") {
    const oy = -h * dest * 0.32;
    ctx.fillStyle = extras.flash ? "#ff3030" : "#3d8bff";
    ctx.fillRect(-1.6 * dest, oy, 1.6 * dest, dest * 0.7);
    ctx.fillStyle = extras.flash ? "#3d8bff" : "#ff3030";
    ctx.fillRect(0, oy, 1.6 * dest, dest * 0.7);
  }
  ctx.restore();
}

function drawRoundCoin(ctx, x, y, r) {
  const rr = Math.max(4, r);
  ctx.beginPath();
  ctx.arc(x, y, rr, 0, Math.PI * 2);
  ctx.fillStyle = "#c98a00";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, rr * 0.82, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd24a";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - rr * 0.22, y - rr * 0.24, rr * 0.28, 0, Math.PI * 2);
  ctx.fillStyle = "#fff4b8";
  ctx.fill();
}

function randomTrafficCar() {
  const shapes = ["beetle", "hatch", "sedan", "pickup", "suv", "sports", "convertible", "muscle"];
  return {
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    colors: trafficPalette(),
  };
}

const _stamps = Object.create(null);

function getStamp(key, w, h, paint) {
  let stamp = _stamps[key];
  if (stamp) return stamp;
  stamp = document.createElement("canvas");
  stamp.width = w;
  stamp.height = h;
  const g = stamp.getContext("2d");
  g.imageSmoothingEnabled = false;
  paint(g, (w / 2) | 0, (h / 2) | 0);
  _stamps[key] = stamp;
  return stamp;
}

function blitStamp(ctx, key, x, y, w, h, paint) {
  const stamp = getStamp(key, w, h, paint);
  ctx.drawImage(stamp, Math.round(x) - ((w / 2) | 0), Math.round(y) - ((h / 2) | 0));
}

function fillDisk(ctx, ox, oy, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(ox, oy, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawPixelTree(ctx, x, y, size) {
  const big = size > 1;
  blitStamp(ctx, big ? "tree2" : "tree1", x, y, 22, 26, (g, cx, cy) => {
    const r = big ? 8 : 6;
    g.fillStyle = "#7a3f18";
    g.fillRect(cx - 1, cy + r - 1, 2, Math.max(4, Math.round(r * 0.7)));
    fillDisk(g, cx, cy, r, "#0f6b1c");
    fillDisk(g, cx - 1, cy - 1, Math.max(2, r - 3), "#1a8a28");
  });
}

function drawPixelBush(ctx, x, y) {
  blitStamp(ctx, "bush", x, y, 14, 12, (g, cx, cy) => {
    fillDisk(g, cx, cy, 4, "#166a24");
    fillDisk(g, cx + 2, cy + 1, 3, "#0f6b1c");
  });
}

function drawPixelPalm(ctx, x, y) {
  blitStamp(ctx, "palm", x, y, 20, 22, (g, cx, cy) => {
    g.fillStyle = "#8a5a28";
    g.fillRect(cx, cy, 2, 7);
    fillDisk(g, cx + 1, cy - 3, 5, "#1f8a3a");
    fillDisk(g, cx + 4, cy - 1, 3, "#2aa84a");
    fillDisk(g, cx - 3, cy - 1, 3, "#176b2c");
  });
}

function drawPixelPine(ctx, x, y, size) {
  const big = size > 1;
  blitStamp(ctx, big ? "pine2" : "pine1", x, y, 18, 22, (g, cx, cy) => {
    const hh = big ? 11 : 8;
    g.fillStyle = "#4a3014";
    g.fillRect(cx, cy + 1, 2, 4);
    g.fillStyle = "#0c4a22";
    for (let i = 0; i < 3; i++) {
      const ww = Math.max(3, hh - i * 3);
      g.fillRect(cx - Math.floor(ww / 2) + 1, cy - 1 - i * 3, ww, 4);
    }
    g.fillStyle = "#166a32";
    g.fillRect(cx - 1, cy - 7, 4, 3);
  });
}

function drawPixelRock(ctx, x, y) {
  blitStamp(ctx, "rock", x, y, 12, 10, (g, cx, cy) => {
    g.fillStyle = "#6a6e74";
    g.fillRect(cx - 3, cy, 7, 4);
    g.fillStyle = "#8a9098";
    g.fillRect(cx - 2, cy - 2, 5, 3);
  });
}

function drawPixelBuilding(ctx, x, y, seed) {
  const s = Math.abs(seed) % 12;
  blitStamp(ctx, `bldg${s}`, x, y, 18, 18, (g, cx, cy) => {
    const w = 7 + (s % 5);
    const h = 7 + (s % 6);
    const walls = ["#6d7380", "#8a909c", "#5a6270", "#9aa3b0", "#7a6e68"];
    const roofs = ["#3a3040", "#6a3a3a", "#2f4a6a", "#4a4a4a", "#5a4030"];
    g.fillStyle = walls[s % walls.length];
    g.fillRect(cx - Math.floor(w / 2), cy - Math.floor(h / 2), w, h);
    g.fillStyle = roofs[s % roofs.length];
    g.fillRect(cx - Math.floor(w / 2), cy - Math.floor(h / 2), w, 2);
    g.fillStyle = s % 2 === 0 ? "#ffe08a" : "#c8e4ff";
    for (let wy = 2; wy < h - 1; wy += 3) {
      for (let wx = 1; wx < w - 1; wx += 2) {
        if ((s + wx + wy) % 3 !== 0) {
          g.fillRect(cx - Math.floor(w / 2) + wx, cy - Math.floor(h / 2) + wy, 1, 1);
        }
      }
    }
  });
}

function drawPixelLamp(ctx, x, y) {
  blitStamp(ctx, "lamp", x, y, 8, 16, (g, cx, cy) => {
    g.fillStyle = "#2a2a30";
    g.fillRect(cx, cy - 5, 1, 8);
    g.fillStyle = "#ffd966";
    g.fillRect(cx - 1, cy - 7, 3, 2);
  });
}

function drawPixelCrate(ctx, x, y, seed) {
  const s = Math.abs(seed) % 8;
  blitStamp(ctx, `crate${s}`, x, y, 14, 12, (g, cx, cy) => {
    const colors = ["#c0392b", "#2471a3", "#f1c40f", "#1e8449"];
    const w = 6 + (s % 4);
    const h = 5 + (s % 3);
    g.fillStyle = colors[s % colors.length];
    g.fillRect(cx - Math.floor(w / 2), cy - Math.floor(h / 2), w, h);
    g.fillStyle = "#2a2018";
    g.fillRect(cx - Math.floor(w / 2), cy, w, 1);
    g.fillStyle = "#f4f0e0";
    g.fillRect(cx - 1, cy - Math.floor(h / 2) + 1, 2, 1);
  });
}

function drawPixelDude(ctx, x, y, u) {
  const ox = Math.round(x);
  const oy = Math.round(y);
  ctx.fillStyle = "#e6b089";
  ctx.fillRect(ox - 2 * u, oy - 10 * u, 4 * u, 4 * u);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(ox - 2 * u, oy - 11 * u, 5 * u, 2 * u);
  ctx.fillStyle = "#2b3a67";
  ctx.fillRect(ox - 2 * u, oy - 6 * u, 4 * u, 7 * u);
  ctx.fillStyle = "#1b2438";
  ctx.fillRect(ox - 2 * u, oy + 1 * u, 2 * u, 6 * u);
  ctx.fillRect(ox + 1 * u, oy + 1 * u, 2 * u, 6 * u);
  ctx.fillStyle = "#e6b089";
  ctx.fillRect(ox + 2 * u, oy - 5 * u, 5 * u, 2 * u);
}

function trafficPalette() {
  const bodies = ["#6ec4f0", "#ff8c1a", "#2d4ecf", "#c42a1a", "#1fbf6a"];
  const body = bodies[Math.floor(Math.random() * bodies.length)];
  return {
    body,
    stripe: "#ffffff",
    glass: "#111111",
    trim: "#111111",
  };
}

function drawCarSide(ctx, x, y, scale, car) {
  const c = car.colors;
  const shape = car.shape;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 16, 46, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  const wheel = (wx) => {
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(wx, 10, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6b6b6b";
    ctx.beginPath();
    ctx.arc(wx, 10, 4, 0, Math.PI * 2);
    ctx.fill();
  };
  wheel(-24);
  wheel(24);

  ctx.fillStyle = c.body;
  if (shape === "formula") {
    ctx.fillStyle = c.trim;
    roundRect(ctx, -40, 2, 80, 8, 2);
    ctx.fill();
    ctx.fillStyle = c.body;
    roundRect(ctx, -18, -8, 48, 16, 5);
    ctx.fill();
    ctx.fillStyle = c.stripe;
    ctx.fillRect(-6, -8, 6, 16);
  } else if (shape === "pickup") {
    roundRect(ctx, -38, -8, 44, 20, 5);
    ctx.fill();
    ctx.fillStyle = c.trim;
    roundRect(ctx, 4, -2, 34, 14, 3);
    ctx.fill();
    ctx.fillStyle = c.glass;
    roundRect(ctx, -28, -16, 22, 10, 3);
    ctx.fill();
  } else if (shape === "suv") {
    roundRect(ctx, -40, -18, 80, 30, 6);
    ctx.fill();
    ctx.fillStyle = c.glass;
    roundRect(ctx, -18, -14, 36, 12, 3);
    ctx.fill();
  } else if (shape === "super" || shape === "hyper" || shape === "sports") {
    ctx.beginPath();
    ctx.moveTo(-42, 8);
    ctx.lineTo(-28, -4);
    ctx.lineTo(8, -8);
    ctx.lineTo(40, 2);
    ctx.lineTo(42, 10);
    ctx.lineTo(-40, 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = c.glass;
    ctx.beginPath();
    ctx.moveTo(-8, -6);
    ctx.lineTo(18, -4);
    ctx.lineTo(14, 4);
    ctx.lineTo(-12, 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = c.stripe;
    ctx.fillRect(-2, -6, 5, 14);
  } else {
    const roof = shape === "hatch" ? 18 : 28;
    roundRect(ctx, -40, -6, 80, 20, 6);
    ctx.fill();
    ctx.fillStyle = c.body;
    roundRect(ctx, -12, -22, roof + 8, 18, 5);
    ctx.fill();
    ctx.fillStyle = c.glass;
    roundRect(ctx, -8, -18, roof, 12, 3);
    ctx.fill();
    if (shape === "taxi") {
      ctx.fillStyle = "#111";
      roundRect(ctx, 0, -28, 16, 8, 2);
      ctx.fill();
      ctx.fillStyle = "#f1c40f";
      ctx.font = "bold 6px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("TAXI", 8, -22);
    }
    if (shape === "police") {
      ctx.fillStyle = "#1a4b8c";
      ctx.fillRect(-40, 4, 80, 5);
      ctx.fillStyle = "#ff4d4d";
      roundRect(ctx, -4, -28, 8, 8, 2);
      ctx.fill();
      ctx.fillStyle = "#4da3ff";
      roundRect(ctx, 6, -28, 8, 8, 2);
      ctx.fill();
    }
    if (shape === "convertible") {
      ctx.fillStyle = "#2a1020";
      roundRect(ctx, -6, -10, 24, 6, 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = "#fff6c2";
  ctx.fillRect(34, 0, 6, 3);
  ctx.fillStyle = "#ff6b6b";
  ctx.fillRect(-40, 0, 5, 3);
  ctx.restore();
}

function drawCharacterLean(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.rotate(-0.16);

  ctx.strokeStyle = "#1b2438";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.lineTo(-3, 34);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.lineTo(11, 32);
  ctx.stroke();

  ctx.fillStyle = "#2b3a67";
  roundRect(ctx, -9, -22, 18, 32, 7);
  ctx.fill();
  ctx.fillStyle = "#ff3d9a";
  ctx.fillRect(-9, 4, 18, 5);

  ctx.strokeStyle = "#e6b089";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(7, -14);
  ctx.lineTo(26, -2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-6, -12);
  ctx.lineTo(-8, 6);
  ctx.stroke();

  ctx.fillStyle = "#e6b089";
  ctx.beginPath();
  ctx.arc(1, -30, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(1, -32, 9, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-9, -32, 20, 4);
  ctx.fillStyle = "#3cf0ff";
  ctx.fillRect(-8, -30, 18, 3);
  ctx.restore();
}
