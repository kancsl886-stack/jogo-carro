const Game = {
  canvas: null,
  ctx: null,
  w: 0,
  h: 0,
  dpr: 1,
  running: false,
  paused: false,
  last: 0,
  car: CARS[0],
  onHud: null,
  onOver: null,

  resetState() {
    this.distance = 0;
    this.runCoins = 0;
    this.combo = 0;
    this.speed = 28;
    this.baseSpeed = 28;
    this.lane = 1;
    this.laneX = 0;
    this.jump = 0;
    this.jumpVel = 0;
    this.cameraZ = 0;
    this.time = 0;
    this.shake = 0;
    this.spawnZ = 40;
    this.coinZ = 20;
    this.powerZ = 80;
    this.entities = [];
    this.particles = [];
    this.roadside = [];
    this.powers = { magnet: 0, shield: 0, nitro: 0 };
    this.invuln = 0;
    this.dead = false;
    this.flash = 0;
  },

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.bindInput();
    this.resetState();
    this.seedRoadside();
  },

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.floor(this.w * this.dpr);
    this.canvas.height = Math.floor(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  },

  bindInput() {
    const onKey = (e) => {
      if (!this.running || this.paused || this.dead) return;
      if (["ArrowLeft", "a", "A"].includes(e.key)) this.changeLane(-1);
      if (["ArrowRight", "d", "D"].includes(e.key)) this.changeLane(1);
      if (["ArrowUp", "w", "W", " "].includes(e.key)) this.doJump();
    };
    window.addEventListener("keydown", onKey);

    let sx = 0;
    let sy = 0;
    let tracking = false;
    const start = (x, y) => {
      tracking = true;
      sx = x;
      sy = y;
    };
    const end = (x, y) => {
      if (!tracking) return;
      tracking = false;
      if (!this.running || this.paused || this.dead) return;
      const dx = x - sx;
      const dy = y - sy;
      if (Math.abs(dx) < 18 && Math.abs(dy) < 18) {
        this.changeLane(x < this.w / 2 ? -1 : 1);
        return;
      }
      if (Math.abs(dx) > Math.abs(dy)) this.changeLane(dx > 0 ? 1 : -1);
      else if (dy < 0) this.doJump();
    };

    this.canvas.addEventListener("pointerdown", (e) => start(e.clientX, e.clientY));
    window.addEventListener("pointerup", (e) => end(e.clientX, e.clientY));
  },

  changeLane(dir) {
    const next = Math.max(0, Math.min(2, this.lane + dir));
    if (next !== this.lane) {
      this.lane = next;
      Sfx.lane();
    }
  },

  doJump() {
    if (this.jump > 0.2) return;
    this.jumpVel = 18;
    Sfx.jump();
  },

  start() {
    const selected = Save.has(Save.data.selected) ? Save.data.selected : "fusca";
    this.car = getCar(selected);
    this.resetState();
    this.running = true;
    this.paused = false;
    this.last = performance.now();
    this.loop(this.last);
  },

  pause() {
    this.paused = true;
  },

  resume() {
    if (!this.running) return;
    this.paused = false;
    this.last = performance.now();
    this.loop(this.last);
  },

  stop() {
    this.running = false;
    this.paused = false;
  },

  loop(now) {
    if (!this.running || this.paused) return;
    const dt = Math.min(0.033, (now - this.last) / 1000);
    this.last = now;
    this.update(dt);
    this.draw();
    requestAnimationFrame((t) => this.loop(t));
  },

  laneWorldX(lane) {
    return (lane - 1) * 2.15;
  },

  curve(z) {
    return Math.sin(z * 0.011) * 2.2 + Math.sin(z * 0.0033) * 3.4;
  },

  hill(z) {
    return Math.sin(z * 0.007) * 0.55;
  },

  project(x, y, z) {
    const rel = z - this.cameraZ;
    if (rel <= 0.45) return null;
    const scale = 240 / rel;
    const cx = this.curve(z) - this.curve(this.cameraZ + 8);
    return {
      x: this.w / 2 + (x + cx) * scale,
      y: this.h * 0.4 + (1.15 - y - this.hill(z) + this.hill(this.cameraZ + 8)) * scale * 1.15,
      s: scale,
      rel,
    };
  },

  seedRoadside() {
    this.roadside = [];
    const palettes = ["#e8eef6", "#d5dee8", "#f2e6d4", "#c5d0de", "#f7f9fc", "#d8c4a8", "#b9c8d9"];
    for (let i = 0; i < 120; i++) {
      const z = i * 8;
      for (const side of [-1, 1]) {
        this.roadside.push({
          kind: "building",
          z,
          side,
          row: 0,
          h: 6.2 + ((i * 13 + side + 3) % 8) * 0.95,
          w: 2.1 + (i % 3) * 0.3,
          color: palettes[(i + (side > 0 ? 2 : 0)) % palettes.length],
        });
        this.roadside.push({
          kind: "building",
          z: z + 4,
          side,
          row: 1,
          h: 9.5 + ((i * 9 + side) % 9) * 1.15,
          w: 2.5 + (i % 2) * 0.35,
          color: palettes[(i + 3) % palettes.length],
        });
      }
      if (i % 8 === 0) {
        this.roadside.push({ kind: "palm", z: z + 2, side: i % 2 ? 1 : -1, row: 0 });
      }
    }
  },

  spawnAhead() {
    while (this.spawnZ < this.cameraZ + 220) {
      const pattern = Math.random();
      const z = this.spawnZ;
      if (pattern < 0.45) {
        const blocked = Math.floor(Math.random() * 3);
        this.entities.push(this.makeTraffic(blocked, z));
        if (Math.random() < 0.35) {
          const other = (blocked + 1 + Math.floor(Math.random() * 2)) % 3;
          this.entities.push({ kind: "barrier", lane: other, z, w: 1.4, h: 0.7, low: true });
        }
      } else if (pattern < 0.7) {
        const free = Math.floor(Math.random() * 3);
        for (let lane = 0; lane < 3; lane++) {
          if (lane === free) continue;
          this.entities.push(this.makeTraffic(lane, z + lane * 4));
        }
      } else {
        this.entities.push({ kind: "truck", lane: Math.floor(Math.random() * 3), z, w: 1.6, h: 1.6, low: false });
      }
      this.spawnZ += 28 + Math.random() * 18 - Math.min(12, this.distance / 400);
    }

    while (this.coinZ < this.cameraZ + 200) {
      const lane = Math.floor(Math.random() * 3);
      const count = 5 + Math.floor(Math.random() * 5);
      for (let i = 0; i < count; i++) {
        this.entities.push({ kind: "coin", lane, z: this.coinZ + i * 3.2, taken: false });
      }
      this.coinZ += 36 + Math.random() * 24;
    }

    while (this.powerZ < this.cameraZ + 240) {
      const kinds = ["magnet", "shield", "nitro"];
      this.entities.push({
        kind: "power",
        power: kinds[Math.floor(Math.random() * kinds.length)],
        lane: Math.floor(Math.random() * 3),
        z: this.powerZ,
        taken: false,
      });
      this.powerZ += 110 + Math.random() * 70;
    }
  },

  makeTraffic(lane, z) {
    const shapes = ["sedan", "hatch", "suv", "pickup"];
    return {
      kind: "traffic",
      lane,
      z,
      w: 1.35,
      h: 1.15,
      low: false,
      speed: 10 + Math.random() * 8,
      car: {
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        colors: trafficPalette(),
      },
    };
  },

  update(dt) {
    this.time += dt;
    this.flash += dt;
    this.spawnAhead();

    const nitro = this.powers.nitro > 0 ? 1.45 : 1;
    this.baseSpeed = 30 + Math.min(48, this.distance * 0.018);
    this.speed = this.baseSpeed * this.car.stats.speed * nitro;
    this.cameraZ += this.speed * dt;
    this.distance = this.cameraZ;

    const targetX = this.laneWorldX(this.lane);
    const handle = 10 * this.car.stats.handling;
    this.laneX += (targetX - this.laneX) * Math.min(1, handle * dt);

    this.jumpVel -= 46 * dt;
    this.jump = Math.max(0, this.jump + this.jumpVel * dt);
    if (this.jump === 0) this.jumpVel = 0;

    for (const key of Object.keys(this.powers)) {
      if (this.powers[key] > 0) this.powers[key] = Math.max(0, this.powers[key] - dt);
    }
    if (this.invuln > 0) this.invuln = Math.max(0, this.invuln - dt);

    const playerZ = this.cameraZ + 8;
    for (const e of this.entities) {
      if (e.kind === "traffic" || e.kind === "truck") e.z += (e.speed || 8) * dt;
    }

    const magnetR = 1.15 * this.car.stats.magnet + (this.powers.magnet > 0 ? 2.2 : 0);
    for (const e of this.entities) {
      if (e.taken) continue;
      const dz = e.z - playerZ;
      const dx = this.laneWorldX(e.lane) - this.laneX;
      if (e.kind === "coin") {
        const reachZ = this.powers.magnet > 0 ? 10 : 2.4;
        if (Math.abs(dz) < reachZ && Math.abs(dx) < magnetR) {
          e.taken = true;
          this.collectCoin(e);
        }
      } else if (e.kind === "power") {
        if (Math.abs(dz) < 2.2 && Math.abs(dx) < 1.2) {
          e.taken = true;
          this.powers[e.power] = e.power === "nitro" ? 4 : 7;
          Sfx.power();
          this.burst(this.laneX, 0.6, playerZ, "#3cf0ff", 10);
        }
      } else if (this.invuln <= 0 && Math.abs(dz) < (e.kind === "truck" ? 3.2 : 2.4) && Math.abs(dx) < 1.05) {
        const jumped = this.jump > 0.9 && e.low;
        if (!jumped) this.hit();
      }
    }

    this.entities = this.entities.filter((e) => e.z > this.cameraZ - 8 && !e.taken);
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    this.shake *= 0.9;

    if (this.onHud) {
      this.onHud({
        distance: this.distance,
        coins: this.runCoins,
        speed: this.speed,
        powers: this.powers,
      });
    }
  },

  collectCoin(e) {
    this.runCoins += 1;
    this.combo += 1;
    if (this.combo > 8 && this.combo % 8 === 0) this.runCoins += 2;
    Sfx.coin();
    this.burst(this.laneWorldX(e.lane), 0.8, e.z, "#ffd166", 6);
  },

  burst(x, y, z, color, n) {
    for (let i = 0; i < n; i++) {
      this.particles.push({
        x,
        y,
        z,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3,
        vz: (Math.random() - 0.5) * 6,
        life: 0.4 + Math.random() * 0.3,
        color,
      });
    }
  },

  hit() {
    if (this.dead) return;
    if (this.powers.shield > 0) {
      this.powers.shield = 0;
      this.invuln = 1.25;
      this.shake = 10;
      this.burst(this.laneX, 0.7, this.cameraZ + 8, "#5dffb0", 16);
      Sfx.power();
      return;
    }
    this.dead = true;
    this.running = false;
    this.shake = 16;
    Sfx.crash();
    const isRecord = Save.setBest(this.distance);
    Save.addCoins(this.runCoins);
    if (this.onOver) {
      this.onOver({
        distance: this.distance,
        coins: this.runCoins,
        best: Save.data.best,
        isRecord,
      });
    }
  },

  drawSky(ctx) {
    const horizon = this.h * 0.4;
    const g = ctx.createLinearGradient(0, 0, 0, this.h);
    g.addColorStop(0, "#5eb0ff");
    g.addColorStop(0.28, "#7ec8ff");
    g.addColorStop(0.55, "#b9e4ff");
    g.addColorStop(0.72, "#e7f6ff");
    g.addColorStop(1, "#cfd8e2");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.w, this.h);

    ctx.fillStyle = "#fff4b8";
    ctx.beginPath();
    ctx.arc(this.w * 0.78, this.h * 0.14, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 244, 180, 0.28)";
    ctx.beginPath();
    ctx.arc(this.w * 0.78, this.h * 0.14, 72, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.82)";
    for (let i = 0; i < 7; i++) {
      const cx = ((i * 260 - this.cameraZ * 3) % (this.w + 260) + this.w + 260) % (this.w + 260) - 80;
      const cy = 36 + (i % 4) * 26;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 58, 18, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 32, cy + 6, 42, 14, 0, 0, Math.PI * 2);
      ctx.ellipse(cx - 28, cy + 8, 34, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const shift = -((this.cameraZ * 0.4) % 42);
    for (let i = -1; i < 32; i++) {
      const x = shift + i * 42;
      const bh = 28 + ((i * 17 + 40) % 70);
      ctx.fillStyle = i % 3 === 0 ? "#8fb0d2" : i % 3 === 1 ? "#7aa0c8" : "#9bb8d6";
      ctx.fillRect(x, horizon - bh, 38, bh);
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(x + 6, horizon - bh + 8, 8, 8);
      ctx.fillRect(x + 20, horizon - bh + 18, 8, 8);
    }
    ctx.fillStyle = "#8aa6c4";
    ctx.fillRect(0, horizon - 6, this.w, 8);
  },

  drawRoad(ctx) {
    const steps = 36;
    for (let i = steps; i >= 0; i--) {
      const z0 = this.cameraZ + 2 + i * 7;
      const z1 = z0 + 7;
      const left0 = this.project(-3.6, 0, z0);
      const right0 = this.project(3.6, 0, z0);
      const left1 = this.project(-3.6, 0, z1);
      const right1 = this.project(3.6, 0, z1);
      if (!left0 || !right0 || !left1 || !right1) continue;
      ctx.beginPath();
      ctx.moveTo(left0.x, left0.y);
      ctx.lineTo(right0.x, right0.y);
      ctx.lineTo(right1.x, right1.y);
      ctx.lineTo(left1.x, left1.y);
      ctx.closePath();
      const stripe = Math.floor(z0 / 7) % 2 === 0;
      ctx.fillStyle = stripe ? "#4c5160" : "#434857";
      ctx.fill();

      const grassL0 = this.project(-18, 0, z0);
      const grassL1 = this.project(-18, 0, z1);
      const grassR0 = this.project(18, 0, z0);
      const grassR1 = this.project(18, 0, z1);
      if (grassL0 && grassL1) {
        ctx.fillStyle = stripe ? "#8f97a3" : "#818996";
        ctx.beginPath();
        ctx.moveTo(grassL0.x, grassL0.y);
        ctx.lineTo(left0.x, left0.y);
        ctx.lineTo(left1.x, left1.y);
        ctx.lineTo(grassL1.x, grassL1.y);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(right0.x, right0.y);
        ctx.lineTo(grassR0.x, grassR0.y);
        ctx.lineTo(grassR1.x, grassR1.y);
        ctx.lineTo(right1.x, right1.y);
        ctx.fill();
      }

      if (Math.floor(z0 / 7) % 2 === 0) {
        for (const lane of [-1.075, 1.075]) {
          const a = this.project(lane, 0.02, z0);
          const b = this.project(lane, 0.02, z1);
          if (!a || !b) continue;
          ctx.strokeStyle = "rgba(255,255,255,0.55)";
          ctx.lineWidth = Math.max(1.5, a.s * 0.04);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  },

  drawBuilding(ctx, p, item) {
    const w = p.s * item.w;
    const h = p.s * item.h;
    const x = p.x - w / 2;
    const y = p.y - h;
    ctx.fillStyle = item.color;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "rgba(40, 60, 90, 0.16)";
    ctx.fillRect(x + w * 0.62, y, w * 0.38, h);
    ctx.fillStyle = "#6d7f93";
    ctx.fillRect(x, y - p.s * 0.1, w, p.s * 0.12);
    ctx.fillStyle = "#5b7eab";
    const cols = 3;
    const rows = Math.max(4, Math.floor(item.h * 1.5));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillRect(
          x + w * 0.1 + c * w * 0.28,
          y + p.s * 0.22 + r * (h / (rows + 0.8)),
          w * 0.16,
          p.s * 0.14
        );
      }
    }
  },

  drawRoadside(ctx) {
    const items = this.roadside
      .map((item) => {
        const span = 960;
        const rel = ((item.z - this.cameraZ) % span + span) % span;
        return { ...item, z: this.cameraZ + rel };
      })
      .sort((a, b) => (b.row || 0) - (a.row || 0) || b.z - a.z);

    for (const item of items) {
      const dist = 5.1 + (item.row || 0) * 3.4;
      const x = item.side * dist;
      const p = this.project(x, 0, item.z);
      if (!p || p.rel > 200) continue;
      if (item.kind === "palm") {
        ctx.fillStyle = "#6b3e1f";
        ctx.fillRect(p.x - p.s * 0.06, p.y - p.s * 1.6, p.s * 0.12, p.s * 1.6);
        ctx.fillStyle = "#2e9b4f";
        ctx.beginPath();
        ctx.ellipse(p.x, p.y - p.s * 1.7, p.s * 0.7, p.s * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        this.drawBuilding(ctx, p, item);
      }
    }
  },

  drawEntities(ctx) {
    const playerZ = this.cameraZ + 8;
    const list = this.entities.filter((e) => !e.taken).sort((a, b) => b.z - a.z);
    let playerDrawn = false;
    const drawPlayer = () => {
      const p = this.project(this.laneX, this.jump * 0.22, playerZ);
      if (!p) return;
      if (this.powers.shield > 0) {
        ctx.strokeStyle = "rgba(93,255,176,0.7)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y - p.s * 0.35, p.s * 0.9, p.s * 0.55, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      drawVehicle(ctx, p.x, p.y, p.s * 0.045, this.car, {
        nitro: this.powers.nitro,
        flash: this.flash % 0.4 < 0.2,
      });
    };

    for (const e of list) {
      if (!playerDrawn && e.z < playerZ) {
        drawPlayer();
        playerDrawn = true;
      }
      const x = this.laneWorldX(e.lane);
      if (e.kind === "coin") {
        const p = this.project(x, 0.7 + Math.sin(this.time * 6 + e.z) * 0.1, e.z);
        if (!p) continue;
        ctx.fillStyle = "#ffd166";
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.s * 0.18, p.s * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff3bf";
        ctx.beginPath();
        ctx.ellipse(p.x - p.s * 0.04, p.y - p.s * 0.04, p.s * 0.05, p.s * 0.05, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.kind === "power") {
        const p = this.project(x, 0.9, e.z);
        if (!p) continue;
        const color = e.power === "shield" ? "#5dffb0" : e.power === "nitro" ? "#3cf0ff" : "#ff9a3c";
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#071018";
        ctx.font = `bold ${Math.max(9, p.s * 0.22)}px Trebuchet MS`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(e.power === "shield" ? "S" : e.power === "nitro" ? "N" : "M", p.x, p.y);
        ctx.textBaseline = "alphabetic";
      } else if (e.kind === "barrier") {
        const p = this.project(x, 0.35, e.z);
        if (!p) continue;
        ctx.fillStyle = "#f39c12";
        ctx.fillRect(p.x - p.s * 0.7, p.y - p.s * 0.35, p.s * 1.4, p.s * 0.45);
        ctx.fillStyle = "#111";
        ctx.fillRect(p.x - p.s * 0.7, p.y - p.s * 0.2, p.s * 1.4, p.s * 0.12);
      } else if (e.kind === "truck") {
        const p = this.project(x, 0, e.z);
        if (!p) continue;
        ctx.fillStyle = "#4b5563";
        ctx.fillRect(p.x - p.s * 0.85, p.y - p.s * 1.5, p.s * 1.7, p.s * 1.5);
        ctx.fillStyle = "#1f2937";
        ctx.fillRect(p.x - p.s * 0.85, p.y - p.s * 1.7, p.s * 1.7, p.s * 0.28);
        ctx.fillStyle = "#7dd3fc";
        ctx.fillRect(p.x - p.s * 0.35, p.y - p.s * 1.45, p.s * 0.7, p.s * 0.28);
      } else {
        const p = this.project(x, 0, e.z);
        if (!p) continue;
        drawVehicle(ctx, p.x, p.y, p.s * 0.04, e.car, { brake: true });
      }
    }
    if (!playerDrawn) drawPlayer();

    for (const part of this.particles) {
      const p = this.project(part.x, part.y, part.z);
      if (!p) continue;
      ctx.globalAlpha = Math.max(0, part.life * 2);
      ctx.fillStyle = part.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1.5, p.s * 0.08), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  },

  draw() {
    const ctx = this.ctx;
    ctx.save();
    if (this.shake > 0.4) {
      ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
    }
    this.drawSky(ctx);
    this.drawRoad(ctx);
    this.drawRoadside(ctx);
    this.drawEntities(ctx);
    ctx.restore();
  },

  idle() {
    this.car = getCar(Save.data.selected);
    if (this._idle) return;
    this._idle = true;
    if (!this.entities.length) this.spawnAhead();
    const tick = () => {
      if (this.running) {
        this._idle = false;
        return;
      }
      this.cameraZ += 0.55;
      this.time += 0.016;
      this.spawnAhead();
      this.entities = this.entities.filter((e) => e.z > this.cameraZ - 8);
      this.draw();
      requestAnimationFrame(tick);
    };
    tick();
  },
};
