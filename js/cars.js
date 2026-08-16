const CARS = [
  {
    id: "fusca",
    name: "Fusca Flash",
    type: "Hatch",
    rarity: "comum",
    price: 0,
    stats: { speed: 0.92, handling: 1.15, magnet: 1.05 },
    colors: { body: "#f4d03f", stripe: "#1b1b1b", glass: "#7ec8ff", trim: "#2b2b2b" },
    shape: "hatch",
  },
  {
    id: "uno",
    name: "Uno Turbo",
    type: "Hatch",
    rarity: "comum",
    price: 280,
    stats: { speed: 1.0, handling: 1.2, magnet: 1.0 },
    colors: { body: "#e74c3c", stripe: "#ffffff", glass: "#9ad7ff", trim: "#1f1f1f" },
    shape: "hatch",
  },
  {
    id: "civic",
    name: "Civic Night",
    type: "Sedan",
    rarity: "comum",
    price: 620,
    stats: { speed: 1.08, handling: 1.05, magnet: 1.1 },
    colors: { body: "#5d6d7e", stripe: "#3cf0ff", glass: "#b9e7ff", trim: "#111" },
    shape: "sedan",
  },
  {
    id: "taxi",
    name: "Táxi RJ",
    type: "Sedan",
    rarity: "raro",
    price: 980,
    stats: { speed: 1.02, handling: 1.08, magnet: 1.35 },
    colors: { body: "#f1c40f", stripe: "#111", glass: "#8fd4ff", trim: "#222" },
    shape: "taxi",
  },
  {
    id: "saveiro",
    name: "Saveiro Sertão",
    type: "Pickup",
    rarity: "raro",
    price: 1450,
    stats: { speed: 1.06, handling: 0.98, magnet: 1.45 },
    colors: { body: "#e67e22", stripe: "#2c3e50", glass: "#9ad0ea", trim: "#1a1a1a" },
    shape: "pickup",
  },
  {
    id: "tracker",
    name: "Tracker Selva",
    type: "SUV",
    rarity: "raro",
    price: 1900,
    stats: { speed: 1.04, handling: 0.95, magnet: 1.55 },
    colors: { body: "#1e8449", stripe: "#f4d03f", glass: "#a8e0c2", trim: "#0d1f14" },
    shape: "suv",
  },
  {
    id: "mustang",
    name: "Mustang Trovão",
    type: "Muscle",
    rarity: "epico",
    price: 3200,
    stats: { speed: 1.22, handling: 1.0, magnet: 0.95 },
    colors: { body: "#7b1113", stripe: "#111", glass: "#86c5ff", trim: "#0a0a0a" },
    shape: "muscle",
  },
  {
    id: "policia",
    name: "Ronda 190",
    type: "Polícia",
    rarity: "epico",
    price: 4100,
    stats: { speed: 1.18, handling: 1.18, magnet: 1.1 },
    colors: { body: "#f7f7f7", stripe: "#1a4b8c", glass: "#7fbfff", trim: "#111" },
    shape: "police",
  },
  {
    id: "cayman",
    name: "Cayman Neon",
    type: "Esportivo",
    rarity: "epico",
    price: 5600,
    stats: { speed: 1.28, handling: 1.25, magnet: 1.05 },
    colors: { body: "#12c2c2", stripe: "#ff3d9a", glass: "#d6fbff", trim: "#062022" },
    shape: "sports",
  },
  {
    id: "sunset",
    name: "Sunset Cabrio",
    type: "Conversível",
    rarity: "epico",
    price: 7200,
    stats: { speed: 1.24, handling: 1.22, magnet: 1.2 },
    colors: { body: "#ff4d8d", stripe: "#ffd166", glass: "#ffd6ea", trim: "#2a1020" },
    shape: "convertible",
  },
  {
    id: "aventador",
    name: "Aventador Violeta",
    type: "Supercarro",
    rarity: "lendario",
    price: 9800,
    stats: { speed: 1.36, handling: 1.3, magnet: 1.15 },
    colors: { body: "#7d3c98", stripe: "#3cf0ff", glass: "#e5d4ff", trim: "#16081e" },
    shape: "super",
  },
  {
    id: "formula",
    name: "Fórmula Nitro",
    type: "Fórmula",
    rarity: "lendario",
    price: 13500,
    stats: { speed: 1.45, handling: 1.4, magnet: 0.85 },
    colors: { body: "#ffffff", stripe: "#e74c3c", glass: "#111", trim: "#c0392b" },
    shape: "formula",
  },
  {
    id: "hyperion",
    name: "Hyperion X",
    type: "Hypercar",
    rarity: "lendario",
    price: 18000,
    stats: { speed: 1.5, handling: 1.35, magnet: 1.3 },
    colors: { body: "#111111", stripe: "#ffd166", glass: "#ffe9a8", trim: "#3cf0ff" },
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

function drawCarTop(ctx, x, y, scale, car, extras) {
  extras = extras || {};
  const c = car.colors;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (extras.nitro) {
    ctx.fillStyle = "rgba(60,240,255,0.5)";
    ctx.beginPath();
    ctx.moveTo(-7, 22);
    ctx.lineTo(0, 40 + extras.nitro * 8);
    ctx.lineTo(7, 22);
    ctx.fill();
  }
  ctx.fillStyle = "#1a1a1a";
  roundRect(ctx, -18, -18, 6, 14, 2);
  ctx.fill();
  roundRect(ctx, 12, -18, 6, 14, 2);
  ctx.fill();
  roundRect(ctx, -18, 6, 6, 14, 2);
  ctx.fill();
  roundRect(ctx, 12, 6, 6, 14, 2);
  ctx.fill();

  ctx.fillStyle = c.body;
  if (car.shape === "formula") {
    ctx.fillStyle = c.trim;
    roundRect(ctx, -16, -6, 32, 10, 2);
    ctx.fill();
    ctx.fillStyle = c.body;
    roundRect(ctx, -8, -24, 16, 48, 6);
    ctx.fill();
    ctx.fillStyle = c.stripe;
    ctx.fillRect(-2.5, -22, 5, 44);
  } else if (car.shape === "pickup") {
    roundRect(ctx, -15, -24, 30, 28, 6);
    ctx.fill();
    ctx.fillStyle = c.trim;
    roundRect(ctx, -14, 4, 28, 20, 3);
    ctx.fill();
  } else {
    roundRect(ctx, -15, -26, 30, 52, 8);
    ctx.fill();
    ctx.fillStyle = c.stripe;
    ctx.fillRect(-2.5, -18, 5, 36);
  }

  ctx.fillStyle = c.glass;
  roundRect(ctx, -11, -18, 22, 12, 3);
  ctx.fill();
  if (car.shape !== "convertible" && car.shape !== "pickup") {
    roundRect(ctx, -10, 6, 20, 10, 3);
    ctx.fill();
  }
  ctx.fillStyle = "#fff6c2";
  ctx.fillRect(-11, -26, 7, 3);
  ctx.fillRect(4, -26, 7, 3);
  ctx.fillStyle = extras.brake ? "#ff4d4d" : "#c0392b";
  ctx.fillRect(-11, 24, 7, 3);
  ctx.fillRect(4, 24, 7, 3);
  if (car.shape === "police") {
    ctx.fillStyle = extras.flash ? "#ff4d4d" : "#4da3ff";
    roundRect(ctx, -7, -3, 14, 6, 2);
    ctx.fill();
  }
  if (car.shape === "taxi") {
    ctx.fillStyle = "#111";
    roundRect(ctx, -8, -4, 16, 8, 2);
    ctx.fill();
    ctx.fillStyle = "#f1c40f";
    ctx.font = "bold 6px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("TAXI", 0, 0);
  }
  ctx.restore();
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

function trafficPalette() {
  const bodies = ["#2ecc71", "#3498db", "#9b59b6", "#e67e22", "#95a5a6", "#1abc9c", "#34495e"];
  const body = bodies[Math.floor(Math.random() * bodies.length)];
  return {
    body,
    stripe: "#111",
    glass: "#b9e7ff",
    trim: "#111",
  };
}
