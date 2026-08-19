const CARS = [
  {
    id: "fusca",
    name: "Fusca Flash",
    type: "Hatch",
    rarity: "comum",
    price: 0,
    stats: { speed: 0.72, handling: 0.86, magnet: 1.05 },
    colors: { body: "#2980B9", stripe: "#ffffff", glass: "#111111", trim: "#2b2b2b" },
    shape: "beetle",
  },
  {
    id: "uno",
    name: "Uno Turbo",
    type: "Hatch",
    rarity: "comum",
    price: 280,
    stats: { speed: 0.84, handling: 1.08, magnet: 1.0 },
    colors: { body: "#E67E22", stripe: "#ffffff", glass: "#111111", trim: "#1f1f1f" },
    shape: "hatch",
  },
  {
    id: "civic",
    name: "Civic Night",
    type: "Sedan",
    rarity: "comum",
    price: 620,
    stats: { speed: 0.96, handling: 0.94, magnet: 1.1 },
    colors: { body: "#2980B9", stripe: "#ffffff", glass: "#111111", trim: "#111" },
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
    colors: { body: "#2980B9", stripe: "#ffffff", glass: "#111111", trim: "#0a0a0a" },
    shape: "muscle",
  },
  {
    id: "policia",
    name: "Ronda 190",
    type: "Polícia",
    rarity: "epico",
    price: 4100,
    stats: { speed: 1.12, handling: 1.24, magnet: 1.1 },
    colors: { body: "#2980B9", stripe: "#ffffff", glass: "#1a1a1a", trim: "#111" },
    shape: "police",
  },
  {
    id: "cayman",
    name: "Cayman Neon",
    type: "Esportivo",
    rarity: "epico",
    price: 5600,
    stats: { speed: 1.28, handling: 1.38, magnet: 1.05 },
    colors: { body: "#E67E22", stripe: "#ffffff", glass: "#111111", trim: "#062022" },
    shape: "sports",
  },
  {
    id: "sunset",
    name: "Sunset Cabrio",
    type: "Conversível",
    rarity: "epico",
    price: 7200,
    stats: { speed: 1.2, handling: 1.46, magnet: 1.2 },
    colors: { body: "#E67E22", stripe: "#ffffff", glass: "#111111", trim: "#2a1020" },
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

function drawRoundCoin(ctx, x, y, r, opts) {
  const rr = Math.max(4, r);
  const dollar = opts && opts.dollar;
  const glow = ctx.createRadialGradient(x, y, rr * 0.15, x, y, rr * 2.4);
  glow.addColorStop(0, "rgba(255, 214, 64, 0.95)");
  glow.addColorStop(0.35, "rgba(255, 186, 40, 0.42)");
  glow.addColorStop(1, "rgba(255, 160, 0, 0)");
  ctx.beginPath();
  ctx.arc(x, y, rr * 2.4, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + rr * 0.18, y + rr * 0.42, rr * 0.7, rr * 0.22, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.fill();
  const disc = ctx.createLinearGradient(x - rr, y, x + rr, y);
  disc.addColorStop(0, "#ffe07a");
  disc.addColorStop(0.45, "#ffd24a");
  disc.addColorStop(1, "#c98412");
  ctx.beginPath();
  ctx.arc(x, y, rr, 0, Math.PI * 2);
  ctx.fillStyle = disc;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, rr * 0.72, 0, Math.PI * 2);
  ctx.strokeStyle = "#e8b028";
  ctx.lineWidth = Math.max(1, rr * 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x - rr * 0.28, y - rr * 0.3, rr * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 250, 220, 0.75)";
  ctx.fill();
  if (dollar) {
    ctx.fillStyle = "#8a4e00";
    ctx.font = `bold ${Math.max(8, Math.round(rr * 1.15))}px Trebuchet MS, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("$", x, y + rr * 0.06);
  }
}

function carProfile(shape) {
  switch (shape) {
    case "beetle":
      return { w: 1.02, l: 0.9, h: 0.54, round: 0.42 };
    case "hatch":
      return { w: 1.04, l: 0.96, h: 0.5, round: 0.3 };
    case "sedan":
      return { w: 1.1, l: 1.1, h: 0.44, round: 0.22 };
    case "taxi":
      return { w: 1.12, l: 1.12, h: 0.48, round: 0.2 };
    case "pickup":
      return { w: 1.14, l: 1.18, h: 0.52, round: 0.16 };
    case "suv":
      return { w: 1.2, l: 1.08, h: 0.64, round: 0.2 };
    case "muscle":
      return { w: 1.18, l: 1.12, h: 0.4, round: 0.18 };
    case "police":
      return { w: 1.12, l: 1.12, h: 0.48, round: 0.2 };
    case "sports":
      return { w: 1.16, l: 1.04, h: 0.36, round: 0.34 };
    case "convertible":
      return { w: 1.14, l: 1.02, h: 0.34, round: 0.3 };
    case "super":
      return { w: 1.22, l: 1.08, h: 0.32, round: 0.36 };
    case "formula":
      return { w: 1.06, l: 1.22, h: 0.26, round: 0.12 };
    case "hyper":
      return { w: 1.24, l: 1.1, h: 0.3, round: 0.38 };
    default:
      return { w: 1.1, l: 1.02, h: 0.46, round: 0.24 };
  }
}

function roundPoly(ctx, pts, r) {
  if (!pts || pts.length < 3) return;
  ctx.beginPath();
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p = pts[(i + n - 1) % n];
    const c = pts[i];
    const q = pts[(i + 1) % n];
    const dx1 = c[0] - p[0];
    const dy1 = c[1] - p[1];
    const dx2 = q[0] - c[0];
    const dy2 = q[1] - c[1];
    const len1 = Math.hypot(dx1, dy1) || 1;
    const len2 = Math.hypot(dx2, dy2) || 1;
    const rr = Math.min(r, len1 * 0.42, len2 * 0.42);
    const x1 = c[0] - (dx1 / len1) * rr;
    const y1 = c[1] - (dy1 / len1) * rr;
    const x2 = c[0] + (dx2 / len2) * rr;
    const y2 = c[1] + (dy2 / len2) * rr;
    if (i === 0) ctx.moveTo(x1, y1);
    else ctx.lineTo(x1, y1);
    ctx.quadraticCurveTo(c[0], c[1], x2, y2);
  }
  ctx.closePath();
}

function drawCar3D(ctx, x, y, scale, car, extras) {
  extras = extras || {};
  const u = Math.max(8, scale);
  const pal = (car && car.colors) || { body: "#4aa3e8", stripe: "#fff", glass: "#111", trim: "#222" };
  const body = pal.body || "#4aa3e8";
  const hi = shadeHex(body, 0.22);
  const mid = shadeHex(body, 0.04);
  const shade = shadeHex(body, -0.28);
  const deep = shadeHex(body, -0.42);
  const prof = carProfile(car && car.shape);
  const w = prof.w * u * 1.12;
  const len = prof.l * u * 1.48;
  const hop = extras.jump || 0;
  ctx.save();
  ctx.translate(x, y - hop * u * 0.55);
  if (extras.yaw) ctx.rotate(extras.yaw * 0.62);

  ctx.fillStyle = "rgba(0,0,0,0.42)";
  ctx.beginPath();
  ctx.ellipse(u * 0.42, len * 0.22, w * 0.8, len * 0.2, 0.14, 0, Math.PI * 2);
  ctx.fill();

  const rearY = len * 0.36;
  const frontY = -len * 0.46;
  const rearW = w * 0.5;
  const frontW = w * 0.42;
  const wheel = (wx, wy, wr, hr) => {
    ctx.beginPath();
    ctx.ellipse(wx, wy, wr, hr, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#121214";
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(wx - wr * 0.18, wy - hr * 0.15, wr * 0.45, hr * 0.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#3a3a40";
    ctx.fill();
  };
  wheel(-rearW * 0.92, rearY * 0.55, u * 0.16, u * 0.11);
  wheel(rearW * 0.92, rearY * 0.55, u * 0.16, u * 0.11);
  wheel(-frontW * 0.95, frontY * 0.42, u * 0.13, u * 0.09);
  wheel(frontW * 0.95, frontY * 0.42, u * 0.13, u * 0.09);

  const bodyGrad = ctx.createLinearGradient(-rearW, 0, rearW * 1.2, 0);
  bodyGrad.addColorStop(0, hi);
  bodyGrad.addColorStop(0.38, mid);
  bodyGrad.addColorStop(1, shade);
  roundPoly(
    ctx,
    [
      [-rearW, rearY],
      [rearW, rearY],
      [frontW, frontY],
      [-frontW, frontY],
    ],
    u * prof.round
  );
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  ctx.strokeStyle = deep;
  ctx.lineWidth = Math.max(1, u * 0.04);
  ctx.stroke();

  const cabinR = rearW * 0.72;
  const cabinF = frontW * 0.7;
  const cabinY0 = rearY * 0.12;
  const cabinY1 = frontY * 0.55;
  const roof = ctx.createLinearGradient(-cabinR, 0, cabinR, 0);
  roof.addColorStop(0, shadeHex(body, 0.12));
  roof.addColorStop(0.45, shadeHex(body, -0.08));
  roof.addColorStop(1, deep);
  roundPoly(
    ctx,
    [
      [-cabinR, cabinY0],
      [cabinR, cabinY0],
      [cabinF, cabinY1],
      [-cabinF, cabinY1],
    ],
    u * 0.16
  );
  ctx.fillStyle = roof;
  ctx.fill();

  const glass = ctx.createLinearGradient(-cabinF, cabinY1, cabinR, cabinY0);
  glass.addColorStop(0, "#9ec8e8");
  glass.addColorStop(0.45, pal.glass || "#1a2838");
  glass.addColorStop(1, "#0b1520");
  roundPoly(
    ctx,
    [
      [-cabinR * 0.78, cabinY0 * 0.15],
      [cabinR * 0.78, cabinY0 * 0.15],
      [cabinF * 0.86, cabinY1 * 0.82],
      [-cabinF * 0.86, cabinY1 * 0.82],
    ],
    u * 0.1
  );
  ctx.fillStyle = glass;
  ctx.fill();

  if (pal.stripe) {
    ctx.fillStyle = pal.stripe;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(-u * 0.07, frontY * 0.7, u * 0.14, len * 0.72);
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = extras.brake ? "#ff2a2a" : "#ff6a22";
  ctx.beginPath();
  ctx.roundRect
    ? ctx.roundRect(-rearW * 0.72, rearY - u * 0.08, u * 0.22, u * 0.1, u * 0.04)
    : ctx.rect(-rearW * 0.72, rearY - u * 0.08, u * 0.22, u * 0.1);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect
    ? ctx.roundRect(rearW * 0.5, rearY - u * 0.08, u * 0.22, u * 0.1, u * 0.04)
    : ctx.rect(rearW * 0.5, rearY - u * 0.08, u * 0.22, u * 0.1);
  ctx.fill();

  ctx.fillStyle = "#fff6c8";
  ctx.beginPath();
  ctx.ellipse(-frontW * 0.62, frontY + u * 0.06, u * 0.08, u * 0.05, 0, 0, Math.PI * 2);
  ctx.ellipse(frontW * 0.62, frontY + u * 0.06, u * 0.08, u * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();

  if (car && car.shape === "police") {
    const on = extras.flash;
    ctx.fillStyle = on ? "#ff3030" : "#2d6cff";
    ctx.fillRect(-u * 0.22, cabinY0 - u * 0.18, u * 0.22, u * 0.14);
    ctx.fillStyle = on ? "#2d6cff" : "#ff3030";
    ctx.fillRect(0, cabinY0 - u * 0.18, u * 0.22, u * 0.14);
  }

  if (extras.nitro) {
    const flame = ctx.createLinearGradient(0, rearY, 0, rearY + u * 0.7);
    flame.addColorStop(0, "#ffffff");
    flame.addColorStop(0.35, "#7fe7ff");
    flame.addColorStop(1, "rgba(60, 180, 255, 0)");
    ctx.fillStyle = flame;
    ctx.beginPath();
    ctx.moveTo(-u * 0.14, rearY);
    ctx.lineTo(u * 0.14, rearY);
    ctx.lineTo(0, rearY + u * 0.7);
    ctx.fill();
  }

  ctx.restore();
}

function drawWoodCrate(ctx, x, y, scale, count) {
  const n = Math.max(1, Math.min(5, count || 3));
  const s = Math.max(10, scale);
  const crate = (cx, cy, size) => {
    const w = size;
    const h = size * 0.72;
    const d = size * 0.28;
    ctx.fillStyle = "rgba(0,0,0,0.36)";
    ctx.beginPath();
    ctx.ellipse(cx + d * 1.15, cy + h * 0.52, w * 0.58, h * 0.2, 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.5, cy);
    ctx.lineTo(cx, cy - d);
    ctx.lineTo(cx + w * 0.5, cy);
    ctx.lineTo(cx, cy + d);
    ctx.closePath();
    ctx.fillStyle = "#e8c078";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.5, cy);
    ctx.lineTo(cx, cy + d);
    ctx.lineTo(cx, cy + d + h);
    ctx.lineTo(cx - w * 0.5, cy + h);
    ctx.closePath();
    ctx.fillStyle = "#c48a3a";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + w * 0.5, cy);
    ctx.lineTo(cx, cy + d);
    ctx.lineTo(cx, cy + d + h);
    ctx.lineTo(cx + w * 0.5, cy + h);
    ctx.closePath();
    ctx.fillStyle = "#8a5a22";
    ctx.fill();
    ctx.strokeStyle = "#5a3510";
    ctx.lineWidth = Math.max(1, size * 0.04);
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.5, cy + h * 0.35);
    ctx.lineTo(cx, cy + d + h * 0.35);
    ctx.lineTo(cx + w * 0.5, cy + h * 0.35);
    ctx.stroke();
  };
  let drawn = 0;
  for (let row = 0; row < 3 && drawn < n; row++) {
    const inRow = row === 0 && n >= 3 ? Math.min(2, n - drawn) : 1;
    for (let c = 0; c < inRow && drawn < n; c++) {
      const ox = (c - (inRow - 1) / 2) * s * 0.7;
      crate(x + ox, y - row * s * 0.52, s * (0.92 - row * 0.04));
      drawn += 1;
    }
  }
}

function drawPowerOrb(ctx, x, y, r, color, letter) {
  const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 1.8);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.font = `bold ${Math.max(10, Math.round(r))}px Trebuchet MS, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, x, y + 1);
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
  const bodies = ["#2980B9", "#E67E22", "#c42a1a", "#1fbf6a", "#F1C40F"];
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
