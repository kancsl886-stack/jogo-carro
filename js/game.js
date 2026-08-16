const LANES = 4;
const LANE_GAP = 1.9;
const GRASS = "#58dc48";

function crisp(ctx) {
  ctx.imageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;
}

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
    this.speed = 16;
    this.baseSpeed = 16;
    this.lane = 1;
    this.laneX = 0;
    this.jump = 0;
    this.jumpVel = 0;
    this.cameraZ = 0;
    this.time = 0;
    this.shake = 0;
    this.spawnZ = 16;
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
    crisp(this.ctx);
    this.pixel = Math.max(6, Math.floor(Math.min(this.w, this.h) / 92));
    this.gw = Math.max(80, Math.ceil(this.w / this.pixel));
    this.gh = Math.max(140, Math.ceil(this.h / this.pixel));
    if (!this.pix) this.pix = document.createElement("canvas");
    this.pix.width = this.gw;
    this.pix.height = this.gh;
    this.pctx = this.pix.getContext("2d");
    crisp(this.pctx);
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
    const next = Math.max(0, Math.min(LANES - 1, this.lane + dir));
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
    return (lane - (LANES - 1) / 2) * LANE_GAP;
  },

  playerZ() {
    return this.cameraZ + 8;
  },

  toScreen(worldX, z) {
    const W = this.gw || this.w;
    const H = this.gh || this.h;
    const xScale = W * 0.08;
    const zScale = H / 52;
    const lanePx = xScale * LANE_GAP;
    const u = Math.max(1, Math.floor(lanePx / 16));
    return {
      x: W / 2 + worldX * xScale,
      y: H * 0.74 - (z - this.playerZ()) * zScale,
      s: u,
      u,
      xScale,
      zScale,
    };
  },

  seedRoadside() {
    this.roadside = [];
    for (let i = 0; i < 160; i++) {
      const z = i * 6;
      this.roadside.push({
        kind: "tree",
        z,
        side: -1,
        row: i % 3,
        size: 1 + (i % 2),
      });
      this.roadside.push({
        kind: "tree",
        z: z + 3,
        side: 1,
        row: (i + 1) % 3,
        size: 1 + ((i * 3) % 2),
      });
    }
  },

  spawnAhead() {
    while (this.spawnZ < this.cameraZ + 220) {
      const pattern = Math.random();
      const z = this.spawnZ;
      const twoLaneChance = Math.min(0.28, this.distance / 2800);
      if (pattern < 0.62 - twoLaneChance) {
        const blocked = Math.floor(Math.random() * LANES);
        this.entities.push(this.makeTraffic(blocked, z));
        if (Math.random() < 0.22 + Math.min(0.2, this.distance / 4000)) {
          const other = (blocked + 1 + Math.floor(Math.random() * (LANES - 1))) % LANES;
          this.entities.push({ kind: "barrier", lane: other, z, w: 1.4, h: 0.7, low: true });
        }
      } else if (pattern < 0.62 + twoLaneChance) {
        const a = Math.floor(Math.random() * LANES);
        let b = Math.floor(Math.random() * (LANES - 1));
        if (b >= a) b += 1;
        this.entities.push(this.makeTraffic(a, z));
        this.entities.push(this.makeTraffic(b, z + 5));
      } else {
        this.entities.push({
          kind: "truck",
          lane: Math.floor(Math.random() * LANES),
          z,
          w: 1.6,
          h: 1.6,
          low: false,
          speed: Math.max(3, this.speed * 0.22),
        });
      }
      const gap = 42 + Math.random() * 16 - Math.min(24, this.distance / 260);
      this.spawnZ += Math.max(20, gap);
    }

    while (this.coinZ < this.cameraZ + 200) {
      const lane = Math.floor(Math.random() * LANES);
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
        lane: Math.floor(Math.random() * LANES),
        z: this.powerZ,
        taken: false,
      });
      this.powerZ += 110 + Math.random() * 70;
    }
  },

  makeTraffic(lane, z) {
    return {
      kind: "traffic",
      lane,
      z,
      w: 1.35,
      h: 1.15,
      low: false,
      speed: Math.max(3, this.speed * (0.28 + Math.random() * 0.18)),
      car: {
        shape: "convertible",
        colors: trafficPalette(),
      },
    };
  },

  update(dt) {
    this.time += dt;
    this.flash += dt;
    this.spawnAhead();

    const nitro = this.powers.nitro > 0 ? 1.35 : 1;
    const ramp = Math.min(1, this.distance / 4200);
    this.baseSpeed = 16 + 48 * ramp;
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

  blit(ctx) {
    const out = this.ctx;
    out.imageSmoothingEnabled = false;
    out.fillStyle = GRASS;
    out.fillRect(0, 0, this.w, this.h);
    let ox = 0;
    let oy = 0;
    if (this.shake > 0.4) {
      ox = (Math.random() - 0.5) * this.shake;
      oy = (Math.random() - 0.5) * this.shake;
    }
    crisp(out);
    out.drawImage(this.pix, ox, oy, this.w, this.h);
  },

  drawSky(ctx) {
    ctx.fillStyle = GRASS;
    ctx.fillRect(0, 0, this.gw, this.gh);
  },

  paintRoad(ctx, cameraZ) {
    const mid = this.toScreen(0, this.playerZ());
    const laneW = Math.round(mid.xScale * LANE_GAP);
    const roadW = laneW * LANES;
    const left = Math.round(this.gw / 2 - roadW / 2);
    const rumble = Math.max(5, Math.round(laneW * 0.22));
    const zScale = mid.zScale;
    const scroll = cameraZ == null ? this.cameraZ : cameraZ;

    ctx.fillStyle = "#9a9a9a";
    ctx.fillRect(left, 0, roadW, this.gh);

    const block = rumble;
    const offset = Math.round(((scroll * zScale) % (block * 2) + block * 2) % (block * 2));
    for (let y = -offset; y < this.gh + block; y += block) {
      const red = Math.floor((y + offset) / block) % 2 === 0;
      ctx.fillStyle = red ? "#e53935" : "#ffffff";
      ctx.fillRect(left - rumble, y, rumble, block);
      ctx.fillRect(left + roadW, y, rumble, block);
    }

    const dashW = Math.max(2, Math.round(laneW * 0.07));
    const dashH = Math.max(8, Math.round(laneW * 0.38));
    const gap = Math.max(6, Math.round(laneW * 0.28));
    const period = dashH + gap;
    const dashOff = Math.round(((scroll * zScale) % period + period) % period);
    ctx.fillStyle = "#ffffff";
    for (let lane = 1; lane < LANES; lane++) {
      const x = left + lane * laneW - Math.floor(dashW / 2);
      for (let y = -dashOff; y < this.gh + period; y += period) {
        ctx.fillRect(x, y, dashW, dashH);
      }
    }
    return { left, roadW, laneW, rumble };
  },

  drawRoad(ctx) {
    this.paintRoad(ctx, this.cameraZ);
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
      const dist = 3.95 + (item.row || 0) * 1.25;
      const x = item.side * dist;
      const p = this.toScreen(x, item.z);
      if (p.y < -12 || p.y > this.gh + 12) continue;
      drawPixelTree(ctx, p.x, p.y, Math.max(1, item.size || 1));
    }
  },

  drawEntities(ctx) {
    const playerZ = this.playerZ();
    const list = this.entities.filter((e) => !e.taken).sort((a, b) => b.z - a.z);
    let playerDrawn = false;
    const drawPlayer = () => {
      const p = this.toScreen(this.laneX, playerZ);
      const hop = Math.round(this.jump * 1.4);
      if (this.powers.shield > 0) {
        ctx.fillStyle = "#7dffb8";
        ctx.fillRect(Math.round(p.x) - p.u * 8, Math.round(p.y) - hop - p.u * 13, p.u * 16, p.u * 26);
        ctx.fillStyle = GRASS;
        ctx.fillRect(Math.round(p.x) - p.u * 7, Math.round(p.y) - hop - p.u * 12, p.u * 14, p.u * 24);
      }
      drawCarTop(ctx, p.x, p.y - hop, p.u, this.car, {
        u: p.u,
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
      if (p.y < -20 || p.y > this.gh + 24) continue;
      if (e.kind === "coin") {
        ctx.fillStyle = "#ffd000";
        ctx.fillRect(Math.round(p.x) - 3, Math.round(p.y) - 3, 6, 6);
        ctx.fillStyle = "#fff59a";
        ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, 2, 2);
      } else if (e.kind === "power") {
        const color = e.power === "shield" ? "#5dffb0" : e.power === "nitro" ? "#3cf0ff" : "#ff9a3c";
        ctx.fillStyle = color;
        ctx.fillRect(Math.round(p.x) - 5, Math.round(p.y) - 5, 10, 10);
        ctx.fillStyle = "#111111";
        ctx.font = "bold 8px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(e.power === "shield" ? "S" : e.power === "nitro" ? "N" : "M", Math.round(p.x), Math.round(p.y) + 1);
        ctx.textBaseline = "alphabetic";
      } else if (e.kind === "barrier") {
        const w = Math.round(p.xScale * 1.6);
        ctx.fillStyle = "#ff9f1c";
        ctx.fillRect(Math.round(p.x) - w / 2, Math.round(p.y) - 4, w, 8);
        ctx.fillStyle = "#111111";
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(Math.round(p.x) - w / 2 + i * (w / 4), Math.round(p.y) - 4, w / 8, 8);
        }
      } else if (e.kind === "truck") {
        drawCarTop(
          ctx,
          p.x,
          p.y,
          p.u,
          { shape: "suv", colors: { body: "#6b7380", stripe: "#1b1b1b", glass: "#111", trim: "#111" } },
          { u: p.u, van: true, brake: true }
        );
      } else {
        drawCarTop(ctx, p.x, p.y, p.u, e.car, { u: p.u, brake: true });
      }
    }
    if (!playerDrawn) drawPlayer();
    this.drawCop(ctx);

    for (const part of this.particles) {
      const p = this.toScreen(part.x, part.z);
      ctx.fillStyle = part.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
    }
  },

  drawCop(ctx) {
    if (!this.cop || this.cop.z == null) return;
    const p = this.toScreen(this.cop.laneX, this.cop.z);
    if (p.y < -20 || p.y > this.gh + 28) return;
    const flash = this.flash % 0.4 < 0.2;
    drawCarTop(ctx, p.x, p.y, p.u, getCar("policia"), { u: p.u, flash });
  },

  draw() {
    if (!this.pctx) this.resize();
    const ctx = this.pctx;
    this.drawSky(ctx);
    this.drawRoad(ctx);
    this.drawRoadside(ctx);
    this.drawEntities(ctx);
    this.blit();
  },

  drawMenuScene() {
    if (!this.pctx) this.resize();
    const ctx = this.pctx;
    const W = this.gw;
    const H = this.gh;
    ctx.fillStyle = GRASS;
    ctx.fillRect(0, 0, W, H);

    const road = this.paintRoad(ctx, 0);

    for (let i = 0; i < 22; i++) {
      drawPixelTree(ctx, road.left - 16 - (i % 3) * 10, 10 + i * 15, 1 + (i % 2));
      drawPixelTree(ctx, road.left + road.roadW + 16 + (i % 3) * 10, 6 + i * 15, 1 + ((i + 1) % 2));
    }

    const car = getCar(Save.data.selected);
    const u = Math.max(1, Math.floor(road.laneW / 16));
    const cx = Math.round(W / 2);
    const cy = Math.round(H * 0.64);
    const lane = road.laneW;
    const demo = [
      { x: cx - lane * 1.5, y: H * 0.26, car: { shape: "convertible", colors: { body: "#ff8a2b", stripe: "#1b1b1b" } } },
      { x: cx - lane * 0.5, y: H * 0.22, car: { shape: "muscle", colors: { body: "#1e3a6e", stripe: "#ffffff" } } },
      { x: cx + lane * 0.5, y: H * 0.30, car: { shape: "convertible", colors: { body: "#c4451c", stripe: "#1b1b1b" } } },
      { x: cx + lane * 1.5, y: H * 0.38, car: { shape: "convertible", colors: { body: "#8fd14a", stripe: "#1b1b1b" } } },
    ];
    for (const d of demo) drawCarTop(ctx, d.x, d.y, u, d.car, { u });
    drawCarTop(ctx, cx - lane * 0.5, cy, u, car, { u });
    drawPixelDude(ctx, cx - lane * 0.5 - 11 * u, cy + 2, Math.max(1, Math.round(u * 0.45)));
    this.blit();
  },

  idle() {
    this.car = getCar(Save.data.selected);
    this.running = false;
    this._idle = true;
    this.drawMenuScene();
  },
};
