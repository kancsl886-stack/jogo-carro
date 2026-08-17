const LANES = 3;
const LANE_GAP = 2.2;
const GRASS = "#48d048";
const STEP = 1 / 60;
const BIOME_INTRO = 150;
const BIOME_LEN = 420;
const BIOME_BLEND = 52;
const BIOMES = [
  {
    id: "campo",
    ground: "#48d048",
    road: "#7a7a7a",
    rumbleA: "#e53935",
    rumbleB: "#ffffff",
    dash: "#ffffff",
    sidewalk: null,
    decor: "trees",
  },
  {
    id: "cidade",
    ground: "#6e6e76",
    road: "#4e4e54",
    rumbleA: "#f0d000",
    rumbleB: "#1a1a1a",
    dash: "#d8d8d8",
    sidewalk: "#b8b4ac",
    decor: "city",
  },
  {
    id: "praia",
    ground: "#e2c86a",
    road: "#8a8680",
    rumbleA: "#ffffff",
    rumbleB: "#3aa0d8",
    dash: "#fff6d0",
    sidewalk: "#d8b45a",
    decor: "beach",
  },
  {
    id: "serra",
    ground: "#2f7a38",
    road: "#5a5a5a",
    rumbleA: "#ffffff",
    rumbleB: "#2a2a2a",
    dash: "#e0e0e0",
    sidewalk: null,
    decor: "forest",
  },
  {
    id: "porto",
    ground: "#7a7468",
    road: "#4a453e",
    rumbleA: "#f0a000",
    rumbleB: "#2a2a2a",
    dash: "#c8c0a8",
    sidewalk: "#8a8478",
    decor: "docks",
  },
];

function mixHex(a, b, t) {
  if (!a) return b;
  if (!b || t <= 0) return a;
  if (t >= 1) return b;
  const parse = (hex) => {
    const raw = String(hex || "#888888").replace("#", "");
    const n = raw.length === 3 ? raw.split("").map((ch) => ch + ch).join("") : raw.padEnd(6, "0");
    return [parseInt(n.slice(0, 2), 16) || 0, parseInt(n.slice(2, 4), 16) || 0, parseInt(n.slice(4, 6), 16) || 0];
  };
  const A = parse(a);
  const B = parse(b);
  const h = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${h(A[0] + (B[0] - A[0]) * t)}${h(A[1] + (B[1] - A[1]) * t)}${h(A[2] + (B[2] - A[2]) * t)}`;
}

function crisp(ctx) {
  ctx.imageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;
}

function expDamp(current, target, rate, dt) {
  return current + (target - current) * (1 - Math.exp(-rate * dt));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
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
    this.vx = 0;
    this.yaw = 0;
    this.steer = 0;
    this.acc = 0;
    this.keys = this.keys || { left: false, right: false };
    this.pointerSteer = null;
    this.prevCameraZ = 0;
    this.prevLaneX = 0;
    this.prevYaw = 0;
    this.prevJump = 0;
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
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.floor(this.w * this.dpr);
    this.canvas.height = Math.floor(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    crisp(this.ctx);
    this.pixel = Math.max(4, Math.floor(Math.min(this.w, this.h) / 128));
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
    this.keys = this.keys || { left: false, right: false };
    const isLeft = (key) => ["ArrowLeft", "a", "A"].includes(key);
    const isRight = (key) => ["ArrowRight", "d", "D"].includes(key);
    const isJump = (key) => ["ArrowUp", "w", "W", " "].includes(key);

    window.addEventListener("keydown", (e) => {
      if (isLeft(e.key) || isRight(e.key) || isJump(e.key)) e.preventDefault();
      if (!this.running || this.paused || this.dead) return;
      if (isLeft(e.key)) this.keys.left = true;
      if (isRight(e.key)) this.keys.right = true;
      if (isJump(e.key) && !e.repeat) this.doJump();
    });
    window.addEventListener("keyup", (e) => {
      if (isLeft(e.key)) this.keys.left = false;
      if (isRight(e.key)) this.keys.right = false;
    });

    let sx = 0;
    let sy = 0;
    let tracking = false;
    const steerFromX = (x) => {
      const n = (x / Math.max(1, this.w) - 0.5) * 2.2;
      if (Math.abs(n) < 0.12) return 0;
      return Math.max(-1, Math.min(1, n));
    };
    this.canvas.addEventListener("pointerdown", (e) => {
      tracking = true;
      sx = e.clientX;
      sy = e.clientY;
      if (this.running && !this.paused && !this.dead) this.pointerSteer = steerFromX(e.clientX);
    });
    window.addEventListener("pointermove", (e) => {
      if (!tracking) return;
      if (this.running && !this.paused && !this.dead) this.pointerSteer = steerFromX(e.clientX);
    });
    window.addEventListener("pointerup", (e) => {
      if (!tracking) return;
      tracking = false;
      this.pointerSteer = null;
      if (!this.running || this.paused || this.dead) return;
      const dy = e.clientY - sy;
      const dx = e.clientX - sx;
      if (dy < -40 && Math.abs(dy) > Math.abs(dx)) this.doJump();
    });
    window.addEventListener("pointercancel", () => {
      tracking = false;
      this.pointerSteer = null;
    });
  },

  readSteer() {
    if (this.keys.left && !this.keys.right) return -1;
    if (this.keys.right && !this.keys.left) return 1;
    if (this.pointerSteer != null) return this.pointerSteer;
    return 0;
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
    this.acc = 0;
    this.last = performance.now();
    this.loop(this.last);
  },

  pause() {
    this.paused = true;
  },

  resume() {
    if (!this.running) return;
    this.paused = false;
    this.acc = 0;
    this.last = performance.now();
    this.loop(this.last);
  },

  stop() {
    this.running = false;
    this.paused = false;
    this.keys = { left: false, right: false };
    this.pointerSteer = null;
  },

  loop(now) {
    if (!this.running || this.paused) return;
    let frame = (now - this.last) / 1000;
    this.last = now;
    if (frame > 0.08) frame = 0.08;
    if (frame < 0) frame = 0;
    this.acc += frame;
    let steps = 0;
    while (this.acc >= STEP && steps < 3) {
      this.prevCameraZ = this.cameraZ;
      this.prevLaneX = this.laneX;
      this.prevYaw = this.yaw;
      this.prevJump = this.jump;
      this.update(STEP);
      this.acc -= STEP;
      steps += 1;
    }
    try {
      this.draw(this.acc / STEP);
    } catch (err) {
      console.error(err);
    }
    requestAnimationFrame((t) => this.loop(t));
  },

  laneWorldX(lane) {
    return (lane - 1) * LANE_GAP;
  },

  playerZ() {
    return this.viewCameraZ() + 8;
  },

  viewCameraZ() {
    return this._drawCam != null ? this._drawCam : this.cameraZ;
  },

  viewLaneX() {
    return this._drawLaneX != null ? this._drawLaneX : this.laneX;
  },

  viewYaw() {
    return this._drawYaw != null ? this._drawYaw : this.yaw;
  },

  viewJump() {
    return this._drawJump != null ? this._drawJump : this.jump;
  },

  roadBend(z) {
    const start = 48;
    if (z < start) return 0;
    const t = z - start;
    const fade = Math.min(1, t / 36);
    const a = Math.sin(t / 64) * 2.9;
    const b = Math.sin(t / 118 + 1.15) * 2.0;
    const c = Math.sin(t / 196 + 0.4) * 0.9;
    const pulse = 0.6 + 0.4 * Math.sin(t / 250);
    return (a + b + c) * pulse * fade;
  },

  toScreen(worldX, z) {
    const W = this.gw || this.w;
    const H = this.gh || this.h;
    const xScale = W * 0.09;
    const zScale = H / 52;
    const lanePx = xScale * LANE_GAP;
    const u = Math.max(1, Math.floor(lanePx / 11));
    const cam = this.roadBend(this.playerZ());
    const bend = (this.roadBend(z) - cam) * xScale;
    return {
      x: W / 2 + worldX * xScale + bend,
      y: H * 0.78 - (z - this.playerZ()) * zScale,
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
        kind: i % 4 === 0 ? "bush" : "tree",
        z,
        side: -1,
        row: i % 3,
        size: 1 + (i % 2),
      });
      this.roadside.push({
        kind: i % 4 === 0 ? "bush" : "tree",
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
          car: randomTrafficCar(),
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
      car: randomTrafficCar(),
    };
  },

  update(dt) {
    this.time += dt;
    this.flash += dt;
    this.spawnAhead();

    const nitro = this.powers.nitro > 0 ? 1.35 : 1;
    const ramp = Math.min(1, this.distance / 4200);
    this.baseSpeed = 13 + 40 * ramp;
    const targetSpeed = this.baseSpeed * this.car.stats.speed * nitro;
    this.speed = expDamp(this.speed, targetSpeed, 2.6, dt);
    this.cameraZ += this.speed * dt;
    this.distance = this.cameraZ;

    const grip = Math.max(0.2, this.car.stats.handling);
    const input = this.readSteer();
    if (Math.abs(input) > 0.35 && Math.abs(this.steer) <= 0.35) Sfx.lane();
    this.steer = expDamp(this.steer, input, 9, dt);
    const maxYaw = 0.18 + 0.07 * grip;
    const wantYaw = this.steer * maxYaw;
    this.yaw = expDamp(this.yaw, wantYaw, 4.2 + 2.2 * grip, dt);
    const slide = 2.6 + 3.0 * grip + this.speed * 0.014;
    const desiredVx = Math.sin(this.yaw) * slide;
    const kappa = this.roadBend(this.cameraZ + 18) - this.roadBend(this.cameraZ + 6);
    const curve = -kappa * (1.5 / grip);
    this.vx = expDamp(this.vx, desiredVx + curve, 5.5 + 2.8 * grip, dt);
    this.laneX += this.vx * dt;
    this.lane = Math.max(0, Math.min(LANES - 1, Math.round(this.laneX / LANE_GAP + 1)));
    const limit = LANE_GAP * 1.55;
    if (Math.abs(this.laneX) > limit) {
      this.laneX = Math.sign(this.laneX) * limit;
      this.vx *= -0.2;
      this.yaw *= 0.72;
      this.shake = Math.max(this.shake, 5);
    }

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
    this.shake *= 0.88;

    this._hudWait = (this._hudWait || 0) + dt;
    if (this.onHud && (this._hudWait > 0.08 || this._hudCoins !== this.runCoins)) {
      this._hudWait = 0;
      this._hudCoins = this.runCoins;
      this.onHud({
        distance: this.distance,
        coins: this.runCoins,
        speed: this.speed,
        powers: this.powers,
        copGap: this.cop.gap,
        biome: this.biomeAt(this.cameraZ).id,
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
    const targetX = this.laneX;
    this.cop.laneX = expDamp(this.cop.laneX, targetX, 3.2, dt);
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

  biomeInfo(z) {
    const pos = Math.max(0, z || 0);
    if (pos < BIOME_INTRO) {
      const start = Math.max(0, BIOME_INTRO - BIOME_BLEND);
      const blend = pos <= start ? 0 : (pos - start) / (BIOME_INTRO - start);
      return { index: 0, next: 1, blend };
    }
    const u = pos - BIOME_INTRO;
    const index = (1 + Math.floor(u / BIOME_LEN)) % BIOMES.length;
    const local = u % BIOME_LEN;
    const blend = local > BIOME_LEN - BIOME_BLEND ? (local - (BIOME_LEN - BIOME_BLEND)) / BIOME_BLEND : 0;
    const next = (index + 1) % BIOMES.length;
    return { index, next, blend };
  },

  biomeAt(z) {
    const info = this.biomeInfo(z);
    const q = info.blend <= 0 ? 0 : (info.blend * 8) | 0;
    const key = info.index * 16 + q;
    if (!this._biomeMemo) this._biomeMemo = new Map();
    const hit = this._biomeMemo.get(key);
    if (hit) return hit;
    const a = BIOMES[info.index];
    const b = BIOMES[info.next];
    const t = q / 8;
    const val = t <= 0 ? a : {
      id: t > 0.5 ? b.id : a.id,
      ground: mixHex(a.ground, b.ground, t),
      road: mixHex(a.road, b.road, t),
      rumbleA: mixHex(a.rumbleA, b.rumbleA, t),
      rumbleB: mixHex(a.rumbleB, b.rumbleB, t),
      dash: mixHex(a.dash, b.dash, t),
      sidewalk: a.sidewalk || b.sidewalk ? mixHex(a.sidewalk || a.ground, b.sidewalk || b.ground, t) : null,
      decor: t > 0.42 ? b.decor : a.decor,
    };
    if (this._biomeMemo.size > 48) this._biomeMemo.clear();
    this._biomeMemo.set(key, val);
    return val;
  },

  blit(ctx) {
    const out = this.ctx;
    out.imageSmoothingEnabled = false;
    out.fillStyle = (this.biomeAt(this.viewCameraZ()) || BIOMES[0]).ground;
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
    const near = this.biomeAt(this.viewCameraZ()) || BIOMES[0];
    const far = this.biomeAt(this.viewCameraZ() + 40) || near;
    ctx.fillStyle = near.ground;
    ctx.fillRect(0, 0, this.gw, this.gh);
    if (far.ground !== near.ground) {
      ctx.fillStyle = far.ground;
      ctx.fillRect(0, 0, this.gw, Math.round(this.gh * 0.4));
      ctx.fillStyle = mixHex(far.ground, near.ground, 0.5);
      ctx.fillRect(0, Math.round(this.gh * 0.4), this.gw, Math.round(this.gh * 0.12));
    }
  },

  paintRoad(ctx, cameraZ) {
    const mid = this.toScreen(0, this.playerZ());
    const laneW = Math.round(mid.xScale * LANE_GAP);
    const roadW = laneW * LANES;
    const rumble = Math.max(5, Math.round(laneW * 0.22));
    const zScale = mid.zScale;
    const xScale = mid.xScale;
    const scroll = cameraZ == null ? this.cameraZ : cameraZ;
    const playerZ = scroll + 8;
    const camBend = this.roadBend(playerZ);
    const H = this.gh;
    const leftAt = new Array(H);
    const block = rumble;
    const offset = Math.round(((scroll * zScale) % (block * 2) + block * 2) % (block * 2));
    const dashW = Math.max(2, Math.round(laneW * 0.08));
    const dashH = Math.max(8, Math.round(laneW * 0.42));
    const gap = Math.max(6, Math.round(laneW * 0.3));
    const period = dashH + gap;
    const dashOff = Math.round(((scroll * zScale) % period + period) % period);

    for (let y = 0; y < H; y++) {
      const z = playerZ + (H * 0.78 - y) / zScale;
      const scene = this.biomeAt(z);
      const left = Math.round(this.gw / 2 - roadW / 2 + (this.roadBend(z) - camBend) * xScale);
      leftAt[y] = left;
      if (scene.sidewalk) {
        ctx.fillStyle = scene.sidewalk;
        ctx.fillRect(left - rumble - 4, y, 4, 1);
        ctx.fillRect(left + roadW + rumble, y, 4, 1);
      }
      ctx.fillStyle = scene.road;
      ctx.fillRect(left, y, roadW, 1);
      const stripe = Math.floor((y - offset) / block) % 2 === 0;
      ctx.fillStyle = stripe ? scene.rumbleA : scene.rumbleB;
      ctx.fillRect(left - rumble, y, rumble, 1);
      ctx.fillRect(left + roadW, y, rumble, 1);
      const dashPhase = ((y - dashOff) % period + period) % period;
      if (dashPhase < dashH) {
        ctx.fillStyle = scene.dash;
        for (let lane = 1; lane < LANES; lane++) {
          ctx.fillRect(left + lane * laneW - Math.floor(dashW / 2), y, dashW, 1);
        }
      }
    }

    const midY = Math.min(H - 1, Math.max(0, Math.round(H * 0.78)));
    const left = leftAt[midY];
    this._leftAt = leftAt;
    return { left, roadW, laneW, rumble, leftAt };
  },

  drawRoad(ctx) {
    this._road = this.paintRoad(ctx, this.viewCameraZ());
  },

  drawGrassDecor(ctx, left, roadW, rumble, scroll) {
    const period = 18;
    const off = ((scroll % period) + period) % period;
    const count = Math.ceil(this.gh / period) + 4;
    const inGrass = (x) => x > 3 && x < this.gw - 3;
    const leftAt = this._leftAt;
    const leftAtY = (y) => {
      if (leftAt && y >= 0 && y < leftAt.length) return leftAt[y];
      return left;
    };
    const cam = this.viewCameraZ();
    const playerZ = cam + 8;
    const zScale = this.toScreen(0, playerZ).zScale;
    const zAt = (y) => playerZ + (this.gh * 0.78 - y) / zScale;
    const seedOf = (n) => Math.abs((n * 1103515245 + 12345) | 0);

    for (let i = -2; i < count; i++) {
      const col = ((i % 3) + 3) % 3;
      const yL = Math.round(i * period + off);
      const yR = Math.round(i * period + off + 4);
      if ((yL < -18 && yR < -18) || (yL > this.gh + 18 && yR > this.gh + 18)) continue;
      const size = 1 + (Math.abs(i) % 2);
      const leftL = leftAtY(yL);
      const leftR = leftAtY(yR);
      const xl = leftL - rumble - 10 - col * 10;
      const xr = leftR + roadW + rumble + 10 + col * 10;
      const xl2 = leftL - rumble - 32;
      const xr2 = leftR + roadW + rumble + 32;
      const decor = this.biomeAt(zAt(yL)).decor;
      const seed = seedOf(i + col * 17);

      const placeLeft = (fn) => {
        if (inGrass(xl)) fn(xl, yL, seed);
        if (i % 2 === 1 && inGrass(xl2)) fn(xl2 + (i % 5), yL + 6, seed + 3);
      };
      const placeRight = (fn) => {
        if (inGrass(xr)) fn(xr, yR, seed + 1);
        if (i % 2 === 0 && inGrass(xr2)) fn(xr2 - (i % 5), yR + 5, seed + 5);
      };

      if (decor === "city") {
        placeLeft((x, y, s) => {
          if (s % 5 === 0) drawPixelLamp(ctx, x, y);
          else drawPixelBuilding(ctx, x, y, s);
        });
        placeRight((x, y, s) => {
          if (s % 4 === 0) drawPixelLamp(ctx, x, y);
          else drawPixelBuilding(ctx, x, y, s);
        });
      } else if (decor === "beach") {
        placeLeft((x, y, s) => {
          if (s % 3 === 0) drawPixelBush(ctx, x, y);
          else drawPixelPalm(ctx, x, y);
        });
        placeRight((x, y) => drawPixelPalm(ctx, x, y));
      } else if (decor === "forest") {
        placeLeft((x, y, s) => {
          if (s % 4 === 0) drawPixelRock(ctx, x, y);
          else drawPixelPine(ctx, x, y, size);
        });
        placeRight((x, y, s) => drawPixelPine(ctx, x, y, 1 + (s % 2)));
      } else if (decor === "docks") {
        placeLeft((x, y, s) => {
          if (s % 3 === 0) drawPixelBuilding(ctx, x, y, s);
          else drawPixelCrate(ctx, x, y, s);
        });
        placeRight((x, y, s) => drawPixelCrate(ctx, x, y, s));
      } else {
        if (inGrass(xl)) {
          if (i % 4 === 0) drawPixelBush(ctx, xl, yL);
          else drawPixelTree(ctx, xl, yL, size);
        }
        if (inGrass(xr)) {
          if (i % 3 === 0) drawPixelBush(ctx, xr, yR);
          else drawPixelTree(ctx, xr, yR, 1 + ((Math.abs(i) + 1) % 2));
        }
        if (i % 2 === 1 && inGrass(xl2)) drawPixelTree(ctx, xl2 + (i % 5), yL + 6, 1);
        if (i % 2 === 0 && inGrass(xr2)) drawPixelTree(ctx, xr2 - (i % 5), yR + 5, 1);
      }
    }
  },

  drawRoadside(ctx) {
    const road = this._road || this.paintRoad(ctx, this.viewCameraZ());
    const mid = this.toScreen(0, this.playerZ());
    this.drawGrassDecor(ctx, road.left, road.roadW, road.rumble, this.viewCameraZ() * mid.zScale);
  },

  drawEntities(ctx) {
    const playerZ = this.playerZ();
    const list = this.entities.filter((e) => !e.taken).sort((a, b) => b.z - a.z);
    this._carsToDraw = [];
    this._coinsToDraw = [];
    let playerDrawn = false;
    const drawPlayer = () => {
      const p = this.toScreen(this.viewLaneX(), playerZ);
      const hop = this.viewJump() * 1.4;
      this._carsToDraw.push({
        p,
        hop,
        car: this.car,
        extras: {
          nitro: this.powers.nitro,
          flash: this.flash % 0.4 < 0.2,
          yaw: this.viewYaw(),
        },
        shield: this.powers.shield > 0,
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
        this._coinsToDraw.push(p);
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
      } else {
        this._carsToDraw.push({
          p,
          hop: 0,
          car: e.car || randomTrafficCar(),
          extras: { brake: true },
        });
      }
    }
    if (!playerDrawn) drawPlayer();
    this.queueCop();

    for (const part of this.particles) {
      const p = this.toScreen(part.x, part.z);
      ctx.fillStyle = part.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
    }
  },

  queueCop() {
    if (!this.cop || this.cop.z == null) return;
    const p = this.toScreen(this.cop.laneX, this.cop.z);
    if (p.y < -20 || p.y > this.gh + 28) return;
    this._carsToDraw.push({
      p,
      hop: 0,
      car: getCar("policia"),
      extras: { flash: this.flash % 0.4 < 0.2, yaw: this.viewYaw() * 0.65 },
    });
  },

  drawCoinsHiRes() {
    const coins = this._coinsToDraw;
    if (!coins || !coins.length) return;
    const out = this.ctx;
    const kx = this.w / this.gw;
    const ky = this.h / this.gh;
    out.save();
    for (const p of coins) {
      const x = p.x * kx;
      const y = p.y * ky;
      if (y < -20 || y > this.h + 20) continue;
      const r = Math.max(5, p.xScale * kx * 0.2);
      drawRoundCoin(out, x, y, r);
    }
    out.restore();
  },

  drawCarsHiRes() {
    const out = this.ctx;
    const kx = this.w / this.gw;
    const ky = this.h / this.gh;
    const cars = (this._carsToDraw || []).slice().sort((a, b) => a.p.y - b.p.y);
    for (const item of cars) {
      if (!item || !item.p || !item.car) continue;
      const x = item.p.x * kx;
      const y = (item.p.y - (item.hop || 0)) * ky;
      if (y < -90 || y > this.h + 90) continue;
      const lanePx = item.p.xScale * LANE_GAP * kx;
      const u = Math.max(3, Math.round(lanePx / 26));
      if (item.shield) {
        out.save();
        out.fillStyle = "rgba(125, 255, 184, 0.28)";
        out.beginPath();
        if (out.ellipse) out.ellipse(x, y, u * 8, u * 11, 0, 0, Math.PI * 2);
        else out.rect(x - u * 8, y - u * 11, u * 16, u * 22);
        out.fill();
        out.restore();
      }
      drawCarTop(out, x, y, u, item.car, Object.assign({ u }, item.extras || {}));
    }
  },

  draw(alpha) {
    if (!this.pctx) this.resize();
    const a = Math.max(0, Math.min(1, alpha == null ? 1 : alpha));
    this._drawCam = lerp(this.prevCameraZ ?? this.cameraZ, this.cameraZ, a);
    this._drawLaneX = lerp(this.prevLaneX ?? this.laneX, this.laneX, a);
    this._drawYaw = lerp(this.prevYaw ?? this.yaw, this.yaw, a);
    this._drawJump = lerp(this.prevJump ?? this.jump, this.jump, a);
    const ctx = this.pctx;
    this.drawSky(ctx);
    this.drawRoad(ctx);
    this.drawRoadside(ctx);
    this.drawEntities(ctx);
    this.blit();
    this.drawCoinsHiRes();
    this.drawCarsHiRes();
    this._drawCam = null;
    this._drawLaneX = null;
    this._drawYaw = null;
    this._drawJump = null;
  },

  drawMenuScene() {
    if (!this.pctx) this.resize();
    const ctx = this.pctx;
    const W = this.gw;
    const H = this.gh;
    ctx.fillStyle = BIOMES[0].ground;
    ctx.fillRect(0, 0, W, H);

    const road = this.paintRoad(ctx, 0);
    this.drawGrassDecor(ctx, road.left, road.roadW, road.rumble, 0);

    const car = getCar(Save.data.selected);
    const cx = Math.round(W / 2);
    const cy = Math.round(H * 0.66);
    const lane = road.laneW;
    const stripe = "#ffffff";
    const demo = [
      { x: cx - lane, y: H * 0.22, car: { shape: "hatch", colors: { body: "#ff8c1a", stripe } } },
      { x: cx, y: H * 0.18, car: { shape: "sedan", colors: { body: "#2d4ecf", stripe } } },
      { x: cx + lane, y: H * 0.30, car: { shape: "pickup", colors: { body: "#c42a1a", stripe } } },
      { x: cx - lane, y: H * 0.44, car: { shape: "sports", colors: { body: "#1fbf6a", stripe } } },
    ];
    drawPixelDude(ctx, cx - 18, cy + 2, 2);
    this.blit();
    const kx = this.w / this.gw;
    const ky = this.h / this.gh;
    const u = Math.max(4, Math.round(road.laneW * kx / 26));
    for (const d of demo) drawCarTop(this.ctx, d.x * kx, d.y * ky, u, d.car, { u });
    drawCarTop(this.ctx, cx * kx, cy * ky, u, car, { u });
  },

  idle() {
    this.car = getCar(Save.data.selected);
    this.running = false;
    this._idle = true;
    this.cameraZ = 0;
    this.drawMenuScene();
  },
};
