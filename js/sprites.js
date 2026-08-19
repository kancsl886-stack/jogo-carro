/* Sprites no estilo da folha: isométrico, luz à esquerda, sombra à direita. */

function drawSkidMarks(ctx, x, y, scale, yaw) {
  const u = Math.max(6, scale);
  ctx.save();
  ctx.translate(x, y);
  if (yaw) ctx.rotate(yaw * 0.55);
  ctx.strokeStyle = "rgba(12, 12, 14, 0.45)";
  ctx.lineWidth = Math.max(2, u * 0.08);
  ctx.lineCap = "round";
  for (const ox of [-u * 0.22, u * 0.22]) {
    ctx.beginPath();
    ctx.moveTo(ox, u * 0.12);
    ctx.quadraticCurveTo(ox + u * 0.08, u * 0.55, ox + u * 0.18, u * 1.05);
    ctx.stroke();
  }
  ctx.restore();
}

function drawIsoCar(ctx, x, y, scale, car, extras) {
  extras = extras || {};
  if (extras.skid !== false && !extras.jump && scale > 18) drawSkidMarks(ctx, x, y, scale, extras.yaw);
  drawCar3D(ctx, x, y, scale, car, extras);
}

function drawAssetCoin(ctx, x, y, r) {
  const rr = Math.max(5, r);
  if (rr > 9) {
    const glow = ctx.createRadialGradient(x, y, rr * 0.2, x, y, rr * 2.0);
    glow.addColorStop(0, "rgba(255, 214, 64, 0.85)");
    glow.addColorStop(1, "rgba(255, 160, 0, 0)");
    ctx.beginPath();
    ctx.arc(x, y, rr * 2.0, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(x, y, rr, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd24a";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, rr * 0.72, 0, Math.PI * 2);
  ctx.strokeStyle = "#d9a020";
  ctx.lineWidth = Math.max(1, rr * 0.08);
  ctx.stroke();
  if (rr > 7) {
    ctx.beginPath();
    ctx.moveTo(x, y - rr * 0.42);
    ctx.lineTo(x + rr * 0.34, y - rr * 0.12);
    ctx.lineTo(x + rr * 0.22, y + rr * 0.36);
    ctx.lineTo(x - rr * 0.22, y + rr * 0.36);
    ctx.lineTo(x - rr * 0.34, y - rr * 0.12);
    ctx.closePath();
    ctx.fillStyle = "#8a4e00";
    ctx.fill();
  }
}

function drawCrateAsset(ctx, x, y, scale, count) {
  drawWoodCrate(ctx, x, y, scale, count == null ? 3 : count);
}

function drawConeAsset(ctx, x, y, scale) {
  const s = Math.max(8, scale);
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(s * 0.12, s * 0.08, s * 0.42, s * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-s * 0.28, s * 0.06);
  ctx.lineTo(s * 0.28, s * 0.06);
  ctx.lineTo(s * 0.18, -s * 0.02);
  ctx.lineTo(-s * 0.18, -s * 0.02);
  ctx.closePath();
  ctx.fillStyle = "#1a1a1a";
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-s * 0.2, 0);
  ctx.lineTo(s * 0.2, 0);
  ctx.lineTo(0, -s * 0.85);
  ctx.closePath();
  const g = ctx.createLinearGradient(-s * 0.2, 0, s * 0.2, 0);
  g.addColorStop(0, "#ff9a3c");
  g.addColorStop(0.45, "#ff6a00");
  g.addColorStop(1, "#b84400");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.fillStyle = "#f4f4f4";
  ctx.fillRect(-s * 0.12, -s * 0.38, s * 0.24, s * 0.1);
  ctx.restore();
}

function drawTireStackAsset(ctx, x, y, scale) {
  const s = Math.max(8, scale);
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(s * 0.16, s * 0.1, s * 0.5, s * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 3; i++) {
    const cy = -i * s * 0.22;
    ctx.beginPath();
    ctx.ellipse(0, cy, s * 0.38, s * 0.16, 0, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 ? "#2a2a2e" : "#121214";
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-s * 0.08, cy - s * 0.04, s * 0.16, s * 0.07, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#4a4a50";
    ctx.fill();
  }
  ctx.restore();
}

function drawOilAsset(ctx, x, y, scale) {
  const s = Math.max(10, scale);
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.7, s * 0.28, -0.2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(18, 22, 16, 0.82)";
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-s * 0.12, -s * 0.04, s * 0.22, s * 0.08, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(80, 180, 70, 0.35)";
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(s * 0.18, s * 0.02, s * 0.16, s * 0.05, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
  ctx.fill();
  ctx.restore();
}

function drawContainerAsset(ctx, x, y, scale) {
  const s = Math.max(12, scale);
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath();
  ctx.ellipse(s * 0.2, s * 0.18, s * 0.7, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-s * 0.7, -s * 0.08);
  ctx.lineTo(s * 0.15, -s * 0.28);
  ctx.lineTo(s * 0.7, -s * 0.05);
  ctx.lineTo(-s * 0.12, s * 0.14);
  ctx.closePath();
  ctx.fillStyle = "#8a5a32";
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-s * 0.7, -s * 0.08);
  ctx.lineTo(-s * 0.12, s * 0.14);
  ctx.lineTo(-s * 0.12, s * 0.7);
  ctx.lineTo(-s * 0.7, s * 0.48);
  ctx.closePath();
  ctx.fillStyle = "#c48a48";
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(s * 0.7, -s * 0.05);
  ctx.lineTo(-s * 0.12, s * 0.14);
  ctx.lineTo(-s * 0.12, s * 0.7);
  ctx.lineTo(s * 0.7, s * 0.5);
  ctx.closePath();
  ctx.fillStyle = "#6a3e1c";
  ctx.fill();
  ctx.strokeStyle = "#3a2010";
  ctx.lineWidth = Math.max(1, s * 0.03);
  for (let i = 1; i < 4; i++) {
    const t = i / 4;
    ctx.beginPath();
    ctx.moveTo(-s * 0.7 + t * 0.58, -s * 0.08 + t * 0.22);
    ctx.lineTo(-s * 0.7 + t * 0.58, s * 0.48 + t * 0.22);
    ctx.stroke();
  }
  ctx.restore();
}

function drawToolboxAsset(ctx, x, y, scale) {
  const s = Math.max(8, scale);
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(s * 0.1, s * 0.08, s * 0.36, s * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#c0392b";
  ctx.fillRect(-s * 0.32, -s * 0.18, s * 0.64, s * 0.32);
  ctx.fillStyle = "#7a1f16";
  ctx.fillRect(-s * 0.32, -s * 0.18, s * 0.64, s * 0.08);
  ctx.strokeStyle = "#f1c40f";
  ctx.lineWidth = Math.max(1, s * 0.05);
  ctx.strokeRect(-s * 0.32, -s * 0.18, s * 0.64, s * 0.32);
  ctx.restore();
}

function drawManholeAsset(ctx, x, y, scale) {
  const s = Math.max(8, scale);
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.42, s * 0.16, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#4a4e54";
  ctx.fill();
  ctx.strokeStyle = "#2a2e32";
  ctx.lineWidth = Math.max(1, s * 0.05);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.22, s * 0.08, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawDumpTruckAsset(ctx, x, y, scale, extras) {
  extras = extras || {};
  const u = Math.max(10, scale);
  ctx.save();
  ctx.translate(x, y - (extras.jump || 0) * u * 0.4);
  if (extras.yaw) ctx.rotate(extras.yaw * 0.5);
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(u * 0.2, u * 0.18, u * 0.7, u * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.ellipse(-u * 0.28, u * 0.12, u * 0.14, u * 0.1, 0, 0, Math.PI * 2);
  ctx.ellipse(u * 0.28, u * 0.12, u * 0.14, u * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f1c40f";
  ctx.beginPath();
  ctx.moveTo(-u * 0.42, u * 0.02);
  ctx.lineTo(u * 0.08, -u * 0.08);
  ctx.lineTo(u * 0.5, u * 0.04);
  ctx.lineTo(0, u * 0.14);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#d4ac0d";
  ctx.fillRect(-u * 0.08, -u * 0.42, u * 0.55, u * 0.38);
  ctx.fillStyle = "#1a2838";
  ctx.fillRect(-u * 0.38, -u * 0.28, u * 0.28, u * 0.18);
  ctx.restore();
}

function drawPowerIcon(ctx, x, y, r, kind) {
  const rr = Math.max(8, r);
  ctx.beginPath();
  ctx.arc(x, y, rr * 1.7, 0, Math.PI * 2);
  ctx.fillStyle = kind === "shield" ? "rgba(93,255,176,0.25)" : kind === "nitro" ? "rgba(60,240,255,0.25)" : "rgba(255,154,60,0.25)";
  ctx.fill();
  ctx.fillStyle = "#152033";
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x - rr, y - rr, rr * 2, rr * 2, rr * 0.28) : ctx.rect(x - rr, y - rr, rr * 2, rr * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#e8eef8";
  if (kind === "shield") {
    ctx.beginPath();
    ctx.moveTo(0, -rr * 0.55);
    ctx.lineTo(rr * 0.42, -rr * 0.22);
    ctx.lineTo(rr * 0.32, rr * 0.38);
    ctx.lineTo(0, rr * 0.58);
    ctx.lineTo(-rr * 0.32, rr * 0.38);
    ctx.lineTo(-rr * 0.42, -rr * 0.22);
    ctx.closePath();
    ctx.fill();
  } else if (kind === "nitro") {
    ctx.beginPath();
    ctx.ellipse(0, 0, rr * 0.42, rr * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#152033";
    ctx.beginPath();
    ctx.ellipse(0, 0, rr * 0.16, rr * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(-rr * 0.4, -rr * 0.32, rr * 0.8, rr * 0.64);
    ctx.fillStyle = "#3cf0ff";
    ctx.fillRect(-rr * 0.22, -rr * 0.12, rr * 0.44, rr * 0.08);
    ctx.fillRect(-rr * 0.08, -rr * 0.22, rr * 0.08, rr * 0.44);
  }
  ctx.restore();
}

function randomTrafficCar() {
  const pack = [
    { shape: "sports", colors: { body: "#ff7a18", stripe: "#111", glass: "#111", trim: "#111" } },
    { shape: "sports", colors: { body: "#2ecc71", stripe: "#fff", glass: "#111", trim: "#111" } },
    { shape: "muscle", colors: { body: "#c0392b", stripe: "#fff", glass: "#111", trim: "#111" } },
    { shape: "suv", colors: { body: "#7f8c8d", stripe: "#111", glass: "#111", trim: "#111" } },
    { shape: "sedan", colors: { body: "#6ec4f0", stripe: "#fff", glass: "#111", trim: "#111" } },
    { shape: "hatch", colors: { body: "#f0c420", stripe: "#111", glass: "#111", trim: "#111" } },
  ];
  return pack[Math.floor(Math.random() * pack.length)];
}
