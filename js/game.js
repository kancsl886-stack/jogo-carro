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
    this.speed = 12;
    this.baseSpeed = 12;
    this.lane = 1;
    this.laneX = 0;
    this.jump = 0;
    this.jumpVel = 0;
    this.cameraZ = 0;
    this.time = 0;
    this.shake = 0;
    this.spawnZ = 90;
    this.coinZ = 30;
    this.powerZ = 140;
    this.entities = [];
    this.particles = [];
    this.roadside = [];
    this.powers = { magnet: 0, shield: 0, nitro: 0 };
    this.invuln = 0;
    this.dead = false;
    this.flash = 0;
    this.caughtBy = null;
    this.cop = { lane: 1, laneX: 0, gap: 18, siren: 0 };
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
    if (this._idle && !this.running) this.drawMenuScene();
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
    this._idle = false;
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

  playerZ() {
    return this.cameraZ + 8;
  },

  toScreen(worldX, z) {
    const xScale = Math.min(this.w * 0.108, 92);
    const zScale = this.h / 56;
    return {
      x: this.w / 2 + worldX * xScale,
      y: this.h * 0.78 - (z - this.playerZ()) * zScale,
      s: xScale * 0.03,
      xScale,
      zScale,
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
      const twoLaneChance = Math.min(0.28, this.distance / 2800);
      if (pattern < 0.62 - twoLaneChance) {
        const blocked = Math.floor(Math.random() * 3);
        this.entities.push(this.makeTraffic(blocked, z));
        if (Math.random() < 0.22 + Math.min(0.2, this.distance / 4000)) {
          const other = (blocked + 1 + Math.floor(Math.random() * 2)) % 3;
          this.entities.push({ kind: "barrier", lane: other, z, w: 1.4, h: 0.7, low: true });
        }
      } else if (pattern < 0.62 + twoLaneChance) {
        const free = Math.floor(Math.random() * 3);
        for (let lane = 0; lane < 3; lane++) {
          if (lane === free) continue;
          this.entities.push(this.makeTraffic(lane, z + lane * 4));
        }
      } else {
        this.entities.push({
          kind: "truck",
          lane: Math.floor(Math.random() * 3),
          z,
          w: 1.6,
          h: 1.6,
          low: false,
          speed: Math.max(3, this.speed * 0.22),
        });
      }
      const gap = 50 + Math.random() * 18 - Math.min(26, this.distance / 260);
      this.spawnZ += Math.max(20, gap);
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
      speed: Math.max(3, this.speed * (0.28 + Math.random() * 0.18)),
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

    const nitro = this.powers.nitro > 0 ? 1.35 : 1;
    const ramp = Math.min(1, this.distance / 4800);
    this.baseSpeed = 11 + 50 * ramp;
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
    this.updateCop(dt, playerZ);
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
          if (e.power === "nitro" && this.cop) this.cop.gap = Math.min(22, this.cop.gap + 6);
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
        copGap: this.cop.gap,
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

  updateCop(dt, playerZ) {
    if (!this.cop) return;
    const targetX = this.laneWorldX(this.lane);
    this.cop.laneX += (targetX - this.cop.laneX) * Math.min(1, 2.4 * dt);
    this.cop.lane = this.lane;
    if (this.powers.nitro > 0) this.cop.gap += 3.2 * dt;
    else this.cop.gap -= 0.08 * dt;
    this.cop.gap = Math.max(8.5, Math.min(22, this.cop.gap));
    this.cop.z = playerZ - this.cop.gap;
    this.cop.siren -= dt;
    if (this.cop.siren <= 0) {
      Sfx.siren();
      this.cop.siren = 1.15;
    }
  },

  hit(reason) {
    if (this.dead) return;
    if (this.powers.shield > 0) {
      this.powers.shield = 0;
      this.invuln = 1.25;
      this.shake = 10;
      if (this.cop) {
        this.cop.gap = Math.min(22, this.cop.gap + 2);
      }
      this.burst(this.laneX, 0.7, this.cameraZ + 8, "#5dffb0", 16);
      Sfx.power();
      return;
    }
    this.dead = true;
    this.running = false;
    this.caughtBy = reason || "crash";
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
        caughtBy: this.caughtBy,
      });
    }
  },

  drawSky(ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, this.h);
    g.addColorStop(0, "#7ec8ff");
    g.addColorStop(0.18, "#9fd4a8");
    g.addColorStop(1, "#7aa36a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.w, this.h);
  },

  drawRoad(ctx) {
    const mid = this.toScreen(0, this.playerZ());
    const laneW = mid.xScale * 2.15;
    const roadW = laneW * 3;
    const left = this.w / 2 - roadW / 2;

    ctx.fillStyle = "#8d949e";
    ctx.fillRect(left - 36, 0, 36, this.h);
    ctx.fillRect(left + roadW, 0, 36, this.h);

    ctx.fillStyle = "#3f4450";
    ctx.fillRect(left, 0, roadW, this.h);

    ctx.strokeStyle = "#f4d03f";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(left + 3, 0);
    ctx.lineTo(left + 3, this.h);
    ctx.moveTo(left + roadW - 3, 0);
    ctx.lineTo(left + roadW - 3, this.h);
    ctx.stroke();

    const dashH = 28;
    const gap = 22;
    const period = dashH + gap;
    const offset = ((this.cameraZ * mid.zScale) % period + period) % period;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    for (const lane of [1, 2]) {
      const x = left + lane * laneW - 2;
      for (let y = -offset; y < this.h + period; y += period) {
        ctx.fillRect(x, y, 4, dashH);
      }
    }

    ctx.fillStyle = "rgba(60, 240, 255, 0.12)";
    const playerLaneX = this.w / 2 + this.laneX * mid.xScale - laneW / 2;
    ctx.fillRect(playerLaneX, 0, laneW, this.h);
  },

  drawRoadside(ctx) {
    const items = this.roadside
      .map((item) => {
        const span = 960;
        const rel = ((item.z - this.cameraZ) % span + span) % span;
        return { ...item, z: this.cameraZ + rel };
      })
      .sort((a, b) => b.z - a.z);

    for (const item of items) {
      const dist = 5.05 + (item.row || 0) * 2.7;
      const x = item.side * dist;
      const p = this.toScreen(x, item.z);
      if (p.y < -80 || p.y > this.h + 80) continue;
      if (item.kind === "palm") {
        ctx.fillStyle = "#2e9b4f";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s * 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1e6b34";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s * 6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const bw = p.xScale * item.w * 0.72;
        const bh = p.zScale * 3.4;
        ctx.fillStyle = item.color;
        ctx.fillRect(p.x - bw / 2, p.y - bh / 2, bw, bh);
        ctx.strokeStyle = "rgba(40, 60, 90, 0.18)";
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x - bw / 2, p.y - bh / 2, bw, bh);
        ctx.fillStyle = "#5b7eab";
        const cols = 3;
        const rows = 2;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            ctx.fillRect(
              p.x - bw / 2 + bw * 0.12 + c * bw * 0.28,
              p.y - bh / 2 + bh * 0.18 + r * bh * 0.38,
              bw * 0.16,
              bh * 0.16
            );
          }
        }
      }
    }
  },

  drawShadow(ctx, x, y, scale, jump) {
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(x, y + 18 * scale + jump * 6, 16 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  },

  drawEntities(ctx) {
    const playerZ = this.playerZ();
    const list = this.entities.filter((e) => !e.taken).sort((a, b) => b.z - a.z);
    let playerDrawn = false;
    const drawPlayer = () => {
      const p = this.toScreen(this.laneX, playerZ);
      const hop = this.jump * 10;
      this.drawShadow(ctx, p.x, p.y, p.s, hop);
      if (this.powers.shield > 0) {
        ctx.strokeStyle = "rgba(93,255,176,0.85)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y - hop, p.s * 22, p.s * 28, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      drawCarTop(ctx, p.x, p.y - hop, p.s * (1 + this.jump * 0.06), this.car, {
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
      const p = this.toScreen(x, e.z);
      if (p.y < -60 || p.y > this.h + 80) continue;
      if (e.kind === "coin") {
        ctx.fillStyle = "#ffd166";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 11 + Math.sin(this.time * 6 + e.z) * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff3bf";
        ctx.beginPath();
        ctx.arc(p.x - 3, p.y - 3, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.kind === "power") {
        const color = e.power === "shield" ? "#5dffb0" : e.power === "nitro" ? "#3cf0ff" : "#ff9a3c";
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#071018";
        ctx.font = "bold 13px Trebuchet MS";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(e.power === "shield" ? "S" : e.power === "nitro" ? "N" : "M", p.x, p.y);
        ctx.textBaseline = "alphabetic";
      } else if (e.kind === "barrier") {
        ctx.fillStyle = "#f39c12";
        ctx.fillRect(p.x - p.xScale * 0.85, p.y - 10, p.xScale * 1.7, 20);
        ctx.fillStyle = "#111";
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(p.x - p.xScale * 0.85 + i * p.xScale * 0.42, p.y - 10, p.xScale * 0.2, 20);
        }
      } else if (e.kind === "truck") {
        this.drawShadow(ctx, p.x, p.y, p.s * 1.1, 0);
        ctx.fillStyle = "#4b5563";
        ctx.fillRect(p.x - p.s * 18, p.y - p.s * 34, p.s * 36, p.s * 68);
        ctx.fillStyle = "#1f2937";
        ctx.fillRect(p.x - p.s * 18, p.y - p.s * 34, p.s * 36, p.s * 16);
        ctx.fillStyle = "#7dd3fc";
        ctx.fillRect(p.x - p.s * 12, p.y - p.s * 28, p.s * 24, p.s * 8);
      } else {
        this.drawShadow(ctx, p.x, p.y, p.s, 0);
        drawCarTop(ctx, p.x, p.y, p.s, e.car, { brake: true });
      }
    }
    if (!playerDrawn) drawPlayer();
    this.drawCop(ctx);

    for (const part of this.particles) {
      const p = this.toScreen(part.x, part.z);
      ctx.globalAlpha = Math.max(0, part.life * 2);
      ctx.fillStyle = part.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  },

  drawCop(ctx) {
    if (!this.cop || this.cop.z == null) return;
    const p = this.toScreen(this.cop.laneX, this.cop.z);
    if (p.y < -60 || p.y > this.h + 90) return;
    const flash = this.flash % 0.4 < 0.2;
    ctx.fillStyle = flash ? "rgba(255, 70, 70, 0.22)" : "rgba(70, 140, 255, 0.22)";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.s * 28, p.s * 34, 0, 0, Math.PI * 2);
    ctx.fill();
    this.drawShadow(ctx, p.x, p.y, p.s, 0);
    drawCarTop(ctx, p.x, p.y, p.s, getCar("policia"), { flash });
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

  drawMenuScene() {
    const ctx = this.ctx;
    const g = ctx.createLinearGradient(0, 0, 0, this.h);
    g.addColorStop(0, "#5eb0ff");
    g.addColorStop(0.42, "#9fd6ff");
    g.addColorStop(0.62, "#d7c7a6");
    g.addColorStop(1, "#4d5360");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.w, this.h);

    ctx.fillStyle = "#fff4b8";
    ctx.beginPath();
    ctx.arc(this.w * 0.8, this.h * 0.16, 34, 0, Math.PI * 2);
    ctx.fill();

    const ground = this.h * 0.62;
    ctx.fillStyle = "#8aa6c4";
    for (let i = 0; i < 18; i++) {
      const x = (i * this.w) / 16 - 20;
      const bh = 70 + ((i * 37) % 110);
      ctx.fillStyle = i % 2 ? "#8fb0d2" : "#7aa0c8";
      ctx.fillRect(x, ground - bh, this.w / 14, bh);
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.fillRect(x + 10, ground - bh + 16, 10, 10);
      ctx.fillRect(x + 28, ground - bh + 36, 10, 10);
    }

    ctx.fillStyle = "#8d949e";
    ctx.fillRect(0, ground, this.w, 28);
    ctx.fillStyle = "#3f4450";
    ctx.fillRect(0, ground + 28, this.w, this.h);
    ctx.fillStyle = "#f4d03f";
    ctx.fillRect(0, ground + 24, this.w, 5);
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    for (let x = 20; x < this.w; x += 70) {
      ctx.fillRect(x, ground + 70, 36, 7);
    }

    const car = getCar(Save.data.selected);
    const s = Math.min(this.w, this.h) * 0.0078;
    const cx = this.w / 2 + 28;
    const cy = ground - 6;
    drawCarSide(ctx, cx, cy, s, car);
    drawCharacterLean(ctx, cx - 22 * s, cy - 2 * s, s * 0.92);
  },

  idle() {
    this.car = getCar(Save.data.selected);
    this.running = false;
    this._idle = true;
    this.drawMenuScene();
  },
};
