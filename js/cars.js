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

function blitSprite(ctx, ox, oy, u, rows, palette) {
  const h = rows.length;
  const w = rows[0].length;
  const x0 = Math.round(ox) - Math.floor((w * u) / 2);
  const y0 = Math.round(oy) - Math.floor((h * u) / 2);
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
    "....Y.Y....",
    "...HHHHH...",
    "...HBBBN...",
    "...HBBBN...",
    "...HKKKN...",
    "...GKKKG...",
    "...HBBBN...",
    "...HBBBN...",
    "...HSS.SN..",
    "...HBBBN...",
    "...HBBBN...",
    "...HBBBN...",
    "...HBBBN...",
    "...NR.RN...",
    "...NNNNN...",
  ],
  hatch: [
    "....Y.Y....",
    "...HHHHHN..",
    "...HBTTBN..",
    "...HBTTBN..",
    "...HKKKN...",
    "...HKKKN...",
    "...HBTTBN..",
    "...H.SS.N..",
    "...HBBBN...",
    "...HBBBN...",
    "...HBBBN...",
    "...HBBBN...",
    "...HBBBN...",
    "...NR.RN...",
    "...NNNNNN..",
  ],
  sedan: [
    "....Y.Y....",
    "...MHHHHN..",
    "..HHBBBNN..",
    "..HHBBBNN..",
    "...HKKKN...",
    "...GKKKG...",
    "...HBBBN...",
    "...HBBBN...",
    "...HSS.SN..",
    "...HBBBN...",
    "...HBBBN...",
    "...HBBBN...",
    "...HBBBN...",
    "...HBBBN...",
    "...NR.RN...",
    "...NNNNNN..",
  ],
  taxi: [
    "....Y.Y....",
    "...CAAAC...",
    "...HHHHN...",
    "...HBBBN...",
    "...HKKKN...",
    "...HKKKN...",
    "...TBTBT...",
    "...HSS.SN..",
    "...TBTBT...",
    "...HBBBN...",
    "...HBBBN...",
    "...HBBBN...",
    "...HBBBN...",
    "...NR.RN...",
    "...NNNNN...",
  ],
  pickup: [
    "....Y.Y....",
    "...HHHHN...",
    "...HBBBN...",
    "...HKKKN...",
    "...HKKKN...",
    "...HBBBN...",
    "...HSS.SN..",
    "...HBBBN...",
    "...MMMMM...",
    "...DDDDD...",
    "...DDDDD...",
    "...DDDDD...",
    "...DR.RD...",
    "...DDDDD...",
  ],
  suv: [
    "....Y.Y....",
    "...C...C...",
    "..HHHHHHN..",
    "..HKKKKKN..",
    "..HKKKKKN..",
    "..HBBBBBN..",
    "..HBBBBBN..",
    "...HSS.SN..",
    "..HBBBBBN..",
    "..HBBBBBN..",
    "..HBBBBBN..",
    "..NR...RN..",
    "...NNNNN...",
  ],
  muscle: [
    "....Y.Y....",
    "...HTTHN...",
    "..HHTTBNN..",
    "..HTTKTTN..",
    "...HTKTH...",
    "..HHTTBNN..",
    "..HHTTBNN..",
    "...HTSTN...",
    "..HHTTBNN..",
    "..HHTTBNN..",
    "..HHTTBNN..",
    "...HTTHN...",
    "...NRTRN...",
    "...NNNNN...",
  ],
  police: [
    "....Y.Y....",
    "...HHHHN...",
    "..HHBBBNN..",
    "...HKKKN...",
    "...HKKKN...",
    "...PPBPP...",
    "...HBBBN...",
    "...HSS.SN..",
    "...PPBPP...",
    "...HBBBN...",
    "...HBBBN...",
    "...HBBBN...",
    "...NR.RN...",
    "...NNNNN...",
  ],
  sports: [
    "...Y...Y...",
    "...HHHHHN..",
    "..HTTBTTN..",
    "..HTTKTTN..",
    "..HTTKTTN..",
    "..HTTBTTN..",
    ".HTTSS.TTN.",
    "..HTTBTTN..",
    "..HTTBTTN..",
    "..HTTBTTN..",
    "..HTTBTTN..",
    "..NR.T.RN..",
    "...NNNNN...",
  ],
  convertible: [
    "....Y.Y....",
    "...HHHHN...",
    "..HTTBTTN..",
    "..HTTBTTN..",
    "..HTTKTTN..",
    "..HTTKTTN..",
    "..HTTBTTN..",
    ".HTTSS.TTN.",
    ".HTTSS.TTN.",
    "..HTTBTTN..",
    "..HTTBTTN..",
    "..HTTBTTN..",
    "..HTTBTTN..",
    "..NR.T.RN..",
    "...NNNNN...",
  ],
  super: [
    "...Y...Y...",
    "....HHHN...",
    "...HTBTN...",
    "..HTTKTTN..",
    "..HTTKTTN..",
    "..HTTDTTN..",
    ".HTTSS.TTN.",
    "..HTTBTTN..",
    "..HTTBTTN..",
    "..HTTBTTN..",
    "..HTTBTTN..",
    "..NR.T.RN..",
    "...NNNNN...",
  ],
  formula: [
    "....Y.Y....",
    ".....C.....",
    "....HAH....",
    "....HAKH...",
    "....HAKH...",
    "....HHHN...",
    "...HBSSBN..",
    "....HHBN...",
    "....HHBN...",
    "....HBN....",
    ".....NR....",
    ".....C.....",
  ],
  hyper: [
    "...Y...Y...",
    "...HTBTN...",
    "..HTTKTTN..",
    "..HTTKTTN..",
    "..HTTBTTN..",
    ".HTTSS.TTN.",
    "..HTTCCCN..",
    "..HTTAAAN..",
    "..HTTBTTN..",
    "..HTTBTTN..",
    "..NR.T.RN..",
    "...NNNNN...",
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

function drawCarTop(ctx, x, y, scale, car, extras) {
  extras = extras || {};
  const dest = Math.max(2, extras.u || Math.round(scale) || 3);
  const c = (car && car.colors) || {};
  const body = c.body || "#6ec4f0";
  const rows = spriteFor(car);
  if (!rows || !rows.length || !rows[0]) return;
  const w = rows[0].length;
  const h = rows.length;
  const palette = {
    B: body,
    H: shadeHex(body, 0.18),
    N: shadeHex(body, -0.22),
    K: "#1a2838",
    G: "#5b7d9a",
    I: "#8eb4d4",
    S: "#1a1a1a",
    W: "#4a4a4a",
    Y: "#ffe14a",
    R: extras.brake ? "#ff2a2a" : "#ff6a18",
    T: c.stripe || "#f4f7fb",
    C: c.trim || "#222222",
    A: car && car.shape === "taxi" ? "#f1c40f" : c.trim || "#3cf0ff",
    D: "#2a2a2a",
    M: "#c5ccd6",
    P: "#f2f2f2",
  };
  const cell = 2;
  const sctx = carScratch(w * cell, h * cell);
  blitSprite(sctx, (w * cell) / 2, (h * cell) / 2, cell, rows, palette);

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
  if (ctx.imageSmoothingQuality) ctx.imageSmoothingQuality = "high";
  ctx.drawImage(_carScratch, (-w * dest) / 2, (-h * dest) / 2, w * dest, h * dest);
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

function randomTrafficCar() {
  const shapes = ["beetle", "hatch", "sedan", "pickup", "suv", "sports", "convertible", "muscle"];
  return {
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    colors: trafficPalette(),
  };
}

function fillDisk(ctx, ox, oy, r, color) {
  ctx.fillStyle = color;
  const r2 = r * r;
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy <= r2) ctx.fillRect(ox + dx, oy + dy, 1, 1);
    }
  }
}

function drawPixelTree(ctx, x, y, size) {
  const ox = Math.round(x);
  const oy = Math.round(y);
  const r = size > 1 ? 8 : 6;
  ctx.fillStyle = "#7a3f18";
  ctx.fillRect(ox - 1, oy + r - 1, 2, Math.max(4, Math.round(r * 0.7)));
  fillDisk(ctx, ox, oy, r, "#0f6b1c");
  fillDisk(ctx, ox - 1, oy - 1, Math.max(2, r - 3), "#1a8a28");
}

function drawPixelBush(ctx, x, y) {
  fillDisk(ctx, Math.round(x), Math.round(y), 4, "#166a24");
  fillDisk(ctx, Math.round(x) + 2, Math.round(y) + 1, 3, "#0f6b1c");
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
