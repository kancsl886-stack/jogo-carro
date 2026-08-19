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
    ground: "#4a9a3c",
    road: "#3e3e42",
    rumbleA: "#e6c200",
    rumbleB: "#151515",
    dash: "#ececec",
    sidewalk: "#6aaa4e",
    skyTop: "#5a9ad4",
    skyBot: "#c8e0f4",
    decor: "trees",
  },
  {
    id: "cidade",
    ground: "#6a7348",
    road: "#3a3a3e",
    rumbleA: "#e6c200",
    rumbleB: "#151515",
    dash: "#ececec",
    sidewalk: "#c4bfb4",
    skyTop: "#6a8eae",
    skyBot: "#c5d4e0",
    decor: "city",
  },
  {
    id: "praia",
    ground: "#e2c86a",
    road: "#4a4844",
    rumbleA: "#ffffff",
    rumbleB: "#3aa0d8",
    dash: "#fff6d0",
    sidewalk: "#d8b45a",
    skyTop: "#4aa0d8",
    skyBot: "#d8ecf8",
    decor: "beach",
  },
  {
    id: "serra",
    ground: "#2f7a38",
    road: "#3a3a3a",
    rumbleA: "#e6c200",
    rumbleB: "#6a6a70",
    dash: "#e0e0e0",
    sidewalk: "#3d8a42",
    skyTop: "#4a7aaa",
    skyBot: "#b8cce0",
    decor: "forest",
  },
  {
    id: "porto",
    ground: "#7a7468",
    road: "#3a3632",
    rumbleA: "#f0a000",
    rumbleB: "#6a6460",
    dash: "#c8c0a8",
    sidewalk: "#8a8478",
    skyTop: "#5a6e82",
    skyBot: "#b8c0c8",
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
    this.speed = 8;
    this.baseSpeed = 8;
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
    this.oil = 0;
    this._wallHit = false;
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
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.floor(this.w * this.dpr);
    this.canvas.height = Math.floor(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = true;
    if (this.ctx.imageSmoothingQuality) this.ctx.imageSmoothingQuality = "medium";
    this.gw = this.w;
    this.gh = this.h;
    this.pixel = 1;
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
    if (this.acc > STEP) this.acc = 0;
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

  toScreen(worldX, z, y) {
    return this.project(worldX, y || 0, z);
  },

  project(wx, wy, wz) {
    const W = this.w;
    const H = this.h;
    const camZ = this.playerZ();
    const camBend = this.roadBend(camZ);
    const dx = wx - this.viewLaneX() * 0.18 + (this.roadBend(wz) - camBend);
    const dy = 2.55 - wy;
    const dz = wz - camZ + 2.1;
    if (dz < 0.18) {
      return { x: W / 2, y: H + 80, s: 268 / 0.18, scale: 268 / 0.18, z: dz, visible: false, xScale: (268 / 0.18) * (Math.min(W, H * 1.08) / 860), zScale: 1 };
    }
    const s = 268 / dz;
    const k = Math.min(W, H * 1.08);
    const xScale = s * (k / 860);
    return {
      x: W * 0.5 + dx * xScale,
      y: H * 0.155 + dy * s * (H / 560),
      s,
      scale: s,
      z: dz,
      visible: true,
      xScale,
      zScale: s * (H / 520),
    };
  },

  spriteSize(p, world) {
    const u = p && p.xScale ? p.xScale : p && p.s ? p.s * 0.45 : 8;
    return Math.max(4, u * world);
  },

  fillQuad(ctx, a, b, c, d, color) {
    if (!a || !b || !c || !d) return;
    if (![a, b, c, d].every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))) return;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.lineTo(d.x, d.y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  },

  fillTri(ctx, a, b, c, color) {
    if (!a || !b || !c) return;
    if (![a, b, c].every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))) return;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  },

  drawBox3D(ctx, x, y, z, w, h, d, colors) {
    const p = (ox, oy, oz) => this.project(x + ox, y + oy, z + oz);
    const fl = p(-w / 2, 0, -d / 2);
    const fr = p(w / 2, 0, -d / 2);
    const bl = p(-w / 2, 0, d / 2);
    const br = p(w / 2, 0, d / 2);
    const flh = p(-w / 2, h, -d / 2);
    const frh = p(w / 2, h, -d / 2);
    const blh = p(-w / 2, h, d / 2);
    const brh = p(w / 2, h, d / 2);
    if (!fl.visible && !fr.visible && !bl.visible && !br.visible) return;
    this.fillQuad(ctx, fr, br, brh, frh, colors.right || colors.front);
    this.fillQuad(ctx, fl, bl, blh, flh, colors.left || colors.front);
    this.fillQuad(ctx, fl, fr, frh, flh, colors.front);
    this.fillQuad(ctx, flh, frh, brh, blh, colors.top);
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
          const roll = Math.random();
          if (roll < 0.26) {
            this.entities.push({ kind: "cone", lane: other, z, w: 0.8, h: 0.55, low: true });
          } else if (roll < 0.46) {
            this.entities.push({ kind: "tires", lane: other, z, w: 1.15, h: 0.85, low: true });
          } else if (roll < 0.6) {
            this.entities.push({ kind: "oil", lane: other, z, w: 1.5, h: 0.2, low: true });
          } else if (roll < 0.76) {
            this.entities.push({ kind: "container", lane: other, z, w: 1.7, h: 1.55, low: false });
          } else {
            this.entities.push({ kind: "barrier", lane: other, z, w: 1.4, h: 0.7, low: true });
          }
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

  entityHitbox(e) {
    switch (e.kind) {
      case "coin":
        return { x: 0.18, z: 0.16 };
      case "power":
        return { x: 0.22, z: 0.2 };
      case "oil":
        return { x: 0.32, z: 0.22 };
      case "cone":
        return { x: 0.18, z: 0.16 };
      case "tires":
      case "barrier":
        return { x: 0.32, z: 0.26 };
      case "traffic":
        return { x: 0.38, z: 0.42 };
      case "truck":
      case "container":
        return { x: 0.48, z: 0.62 };
      default:
        return { x: 0.3, z: 0.26 };
    }
  },

  playerTouches(e, playerZ, dt, extraX, extraZ) {
    const box = this.entityHitbox(e);
    const dx = Math.abs(this.laneWorldX(e.lane) - this.laneX);
    if (dx >= 0.28 + box.x + (extraX || 0)) return false;
    const travel = Math.max(0, (this.speed || 0) * dt);
    const dz = e.z - playerZ;
    const nose = 0.22 + box.z + (extraZ || 0) + travel;
    const tail = 0.14 + box.z;
    return dz > -tail && dz < nose;
  },

  update(dt) {
    this.time += dt;
    this.flash += dt;
    this.spawnAhead();

    const nitro = this.powers.nitro > 0 ? 1.35 : 1;
    const ramp = Math.min(1, this.distance / 6000);
    this.baseSpeed = 7.5 + 18 * ramp;
    const targetSpeed = this.baseSpeed * this.car.stats.speed * nitro;
    this.speed = expDamp(this.speed, targetSpeed, 2.6, dt);
    this.cameraZ += this.speed * dt;
    this.distance = this.cameraZ;

    const grip = Math.max(0.2, this.car.stats.handling) * (this.oil > 0 ? 0.42 : 1);
    this.oil = Math.max(0, (this.oil || 0) - dt);
    const input = this.readSteer();
    if (Math.abs(input) > 0.35 && Math.abs(this.steer) <= 0.35) Sfx.lane();
    this.steer = expDamp(this.steer, input, 9, dt);
    const maxYaw = 0.18 + 0.07 * grip;
    const wantYaw = this.steer * maxYaw;
    this.yaw = expDamp(this.yaw, wantYaw, 4.2 + 2.2 * grip, dt);
    const slide = 2.6 + 3.0 * grip + this.speed * 0.014;
    const desiredVx = Math.sin(this.yaw) * slide;
    const kappa = this.roadBend(this.cameraZ + 18) - this.roadBend(this.cameraZ + 6);
    let curve = -kappa * 1.15;
    if (curve > 1.6) curve = 1.6;
    if (curve < -1.6) curve = -1.6;
    this.vx = expDamp(this.vx, desiredVx + curve, 5.5 + 2.8 * grip, dt);
    if (this.oil > 0) this.yaw += Math.sin(this.time * 16) * 0.014;
    this.laneX += this.vx * dt;
    this.lane = Math.max(0, Math.min(LANES - 1, Math.round(this.laneX / LANE_GAP + 1)));
    const limit = 2.62;
    const atRight = this.laneX >= limit;
    const atLeft = this.laneX <= -limit;
    if (atRight) {
      this.laneX = limit;
      if (this.vx > 0) this.vx = 0;
      if (this.yaw > 0) this.yaw *= 0.35;
      if (input < -0.12) this.vx = -slide * 0.7;
      if (!this._wallHit) {
        this._wallHit = true;
        this.shake = 4;
      }
    } else if (atLeft) {
      this.laneX = -limit;
      if (this.vx < 0) this.vx = 0;
      if (this.yaw < 0) this.yaw *= 0.35;
      if (input > 0.12) this.vx = slide * 0.7;
      if (!this._wallHit) {
        this._wallHit = true;
        this.shake = 4;
      }
    } else {
      this._wallHit = false;
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

    const magnetOn = this.powers.magnet > 0;
    const magX = magnetOn ? 1.05 * this.car.stats.magnet + 1.6 : 0;
    const magZ = magnetOn ? 6.5 : 0;
    for (const e of this.entities) {
      if (e.taken) continue;
      if (e.kind === "coin") {
        if (this.playerTouches(e, playerZ, dt, magX, magZ)) {
          e.taken = true;
          this.collectCoin(e);
        }
      } else if (e.kind === "power") {
        if (this.playerTouches(e, playerZ, dt)) {
          e.taken = true;
          this.powers[e.power] = e.power === "nitro" ? 4 : 7;
          if (e.power === "nitro" && this.cop) this.cop.gap = Math.min(22, this.cop.gap + 6);
          Sfx.power();
          this.burst(this.laneX, 0.6, playerZ, "#3cf0ff", 10);
        }
      } else if (e.kind === "oil") {
        if (this.jump < 0.35 && this.playerTouches(e, playerZ, dt)) {
          if (!e.slicked) {
            e.slicked = true;
            this.oil = 1.5;
            this.shake = Math.max(this.shake, 5);
          }
        }
      } else if (this.invuln <= 0 && this.playerTouches(e, playerZ, dt)) {
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
      skyTop: mixHex(a.skyTop || "#6a8eae", b.skyTop || "#6a8eae", t),
      skyBot: mixHex(a.skyBot || "#c5d4e0", b.skyBot || "#c5d4e0", t),
      decor: t > 0.42 ? b.decor : a.decor,
    };
    if (this._biomeMemo.size > 48) this._biomeMemo.clear();
    this._biomeMemo.set(key, val);
    return val;
  },

  drawSky3D(ctx) {
    const scene = this.biomeAt(this.viewCameraZ() + 24) || BIOMES[0];
    const H = this.h;
    const W = this.w;
    const horizon = H * 0.155;
    const sky = ctx.createLinearGradient(0, 0, 0, horizon + 36);
    sky.addColorStop(0, scene.skyTop || "#6a8eae");
    sky.addColorStop(1, scene.skyBot || "#c5d4e0");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    const sunX = W * 0.12;
    const sunY = H * 0.1;
    const sun = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, W * 0.7);
    sun.addColorStop(0, "rgba(255, 244, 210, 0.8)");
    sun.addColorStop(0.28, "rgba(255, 220, 160, 0.22)");
    sun.addColorStop(1, "rgba(255, 200, 120, 0)");
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, W, horizon + 90);
    ctx.beginPath();
    ctx.arc(sunX, sunY, Math.max(10, H * 0.028), 0, Math.PI * 2);
    ctx.fillStyle = "#fff4cc";
    ctx.fill();
    ctx.fillStyle = scene.ground;
    ctx.fillRect(0, horizon, W, H - horizon);
  },

  drawRoad3D(ctx) {
    const playerZ = this.playerZ();
    const segs = 16;
    const zFar = 58;
    const zNear = -0.35;
    const half = 3.38;
    const walk = 0.78;
    const W = this.w;
    const p = (x, y, zOff) => this.project(x, y, playerZ + zOff);

    for (let i = 0; i < segs; i++) {
      const u0 = i / segs;
      const u1 = (i + 1) / segs;
      const f0 = 1 - (1 - u0) * (1 - u0);
      const f1 = 1 - (1 - u1) * (1 - u1);
      const za = zFar * (1 - f0) + zNear * f0;
      const zb = zFar * (1 - f1) + zNear * f1;
      const zMid = playerZ + (za + zb) * 0.5;
      const scene = this.biomeAt(zMid);
      const L0 = p(-half, 0, za);
      const R0 = p(half, 0, za);
      const L1 = p(-half, 0, zb);
      const R1 = p(half, 0, zb);
      const SL0 = p(-half - walk, 0, za);
      const SR0 = p(half + walk, 0, za);
      const SL1 = p(-half - walk, 0, zb);
      const SR1 = p(half + walk, 0, zb);
      this.fillQuad(ctx, { x: 0, y: L0.y }, SL0, SL1, { x: 0, y: L1.y }, scene.ground);
      this.fillQuad(ctx, SR0, { x: W, y: R0.y }, { x: W, y: R1.y }, SR1, scene.ground);
      if (scene.sidewalk) {
        this.fillQuad(ctx, SL0, L0, L1, SL1, scene.sidewalk);
        this.fillQuad(ctx, R0, SR0, SR1, R1, scene.sidewalk);
      }
      this.fillQuad(ctx, L0, R0, R1, L1, scene.road);

      const mark = (x0, x1) => {
        this.fillQuad(ctx, p(x0, 0, za), p(x1, 0, za), p(x1, 0, zb), p(x0, 0, zb), "rgba(18, 18, 20, 0.22)");
      };
      mark(-0.78, -0.52);
      mark(0.52, 0.78);
      mark(-2.85, -2.58);
      mark(2.58, 2.85);

      if (((zMid | 0) % 31) === 7) {
        const mx = ((zMid | 0) % 3) - 1;
        const mp = p(mx * LANE_GAP, 0.02, (za + zb) * 0.5);
        drawManholeAsset(ctx, mp.x, mp.y, this.spriteSize(mp, 0.7));
      }

      if (Math.floor(zMid / 5.4) % 2 === 0) {
        for (const lx of [-LANE_GAP / 2, LANE_GAP / 2]) {
          this.fillQuad(
            ctx,
            p(lx - 0.055, 0.01, za),
            p(lx + 0.055, 0.01, za),
            p(lx + 0.055, 0.01, zb),
            p(lx - 0.055, 0.01, zb),
            scene.dash
          );
        }
      }

      const wall = "#a8a8ae";
      const wallDark = "#6c6c72";
      const topCol = Math.floor(zMid / 1.15) % 2 === 0 ? "#e6c200" : "#151515";
      const wallH = 0.86;
      const leftInner = -half - 0.02;
      const leftOuter = -half - 0.42;
      const rightInner = half + 0.02;
      const rightOuter = half + 0.42;
      this.fillQuad(ctx, p(leftInner, 0, za), p(leftInner, 0, zb), p(leftInner, wallH, zb), p(leftInner, wallH, za), wall);
      this.fillQuad(ctx, p(leftInner, wallH, za), p(leftInner, wallH, zb), p(leftOuter, wallH, zb), p(leftOuter, wallH, za), topCol);
      this.fillQuad(ctx, p(leftOuter, 0, za), p(leftOuter, wallH, za), p(leftOuter, wallH, zb), p(leftOuter, 0, zb), wallDark);
      this.fillQuad(ctx, p(rightInner, 0, za), p(rightInner, wallH, za), p(rightInner, wallH, zb), p(rightInner, 0, zb), wall);
      this.fillQuad(ctx, p(rightInner, wallH, za), p(rightInner, wallH, zb), p(rightOuter, wallH, zb), p(rightOuter, wallH, za), topCol);
      this.fillQuad(ctx, p(rightOuter, 0, za), p(rightOuter, 0, zb), p(rightOuter, wallH, zb), p(rightOuter, wallH, za), wallDark);
    }
  },

  collectScenery() {
    const playerZ = this.playerZ();
    const items = [];
    const start = Math.floor((playerZ - 2) / 7);
    const end = Math.floor((playerZ + 48) / 7);
    for (let i = start; i <= end; i++) {
      const z = i * 7;
      const scene = this.biomeAt(z);
      const seed = Math.abs((i * 1103515245 + 12345) | 0);
      items.push({ z, side: -1, seed, decor: scene.decor });
      items.push({ z: z + 3.4, side: 1, seed: seed + 17, decor: scene.decor });
    }
    return items;
  },

  drawSceneryItem(ctx, it) {
    const city = it.decor === "city" || it.decor === "docks";
    const x = it.side * (city ? 4.38 + (it.seed % 3) * 0.1 : 5.15 + (it.seed % 3) * 0.28);
    const p = this.project(x, 0, it.z);
    if (!p.visible || p.s < 5 || p.y > this.h + 50) return;
    const decor = it.decor;
    if (decor === "city") {
      if (it.seed % 5 === 0) this.drawLamp3D(ctx, x, it.z, it.side);
      else this.drawBuilding3D(ctx, x, it.z, it.seed);
    } else if (decor === "beach") {
      this.drawPalm3D(ctx, x, it.z);
    } else if (decor === "forest") {
      if (it.seed % 4 === 0) this.drawRock3D(ctx, x, it.z);
      else this.drawPine3D(ctx, x, it.z, 1 + (it.seed % 2));
    } else if (decor === "docks") {
      if (it.seed % 3 === 0) this.drawBuilding3D(ctx, x, it.z, it.seed);
      else {
        const p = this.project(x, 0, it.z);
        if (p.visible) drawContainerAsset(ctx, p.x, p.y, this.spriteSize(p, 1.2));
      }
    } else if (it.seed % 4 === 0) {
      this.drawBush3D(ctx, x, it.z);
    } else {
      this.drawTree3D(ctx, x, it.z, 1 + (it.seed % 2));
    }
  },

  drawBuilding3D(ctx, x, z, seed) {
    const floors = 3 + (seed % 6);
    const w = 1.7 + (seed % 4) * 0.18;
    const d = 1.35 + (seed % 3) * 0.18;
    const h = 2.3 + floors * 0.82;
    const walls = ["#8a4a3a", "#a05640", "#7a4538", "#9a5a48"];
    const wall = walls[seed % walls.length];
    this.drawBox3D(ctx, x, 0, z, w, h, d, {
      left: shadeHex(wall, 0.18),
      right: shadeHex(wall, -0.34),
      front: wall,
      top: shadeHex(wall, -0.16),
    });
    const probe = this.project(x, 0, z);
    if (!probe.visible || probe.s < 14) return;
    const cols = 3 + (seed % 2);
    const rows = Math.max(2, floors - 1);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const wx = x - w * 0.3 + c * (w * 0.3);
        const wy = 0.65 + r * (h / (rows + 0.55));
        const faceZ = z - d / 2 - 0.02;
        this.fillQuad(
          ctx,
          this.project(wx - 0.12, wy, faceZ),
          this.project(wx + 0.12, wy, faceZ),
          this.project(wx + 0.12, wy + 0.3, faceZ),
          this.project(wx - 0.12, wy + 0.3, faceZ),
          (seed + r + c) % 3 === 0 ? "#ffe08a" : "#c8e4ff"
        );
      }
    }
    const faceZ = z - d / 2 - 0.04;
    for (let r = 0; r < rows; r++) {
      const wy = 0.55 + r * (h / (rows + 0.4));
      const x0 = x - w * 0.46;
      this.fillQuad(
        ctx,
        this.project(x0, wy, faceZ),
        this.project(x0 + 0.08, wy, faceZ),
        this.project(x0 + 0.08, wy + 0.08, faceZ),
        this.project(x0, wy + 0.08, faceZ),
        "#1a1a1a"
      );
      this.fillQuad(
        ctx,
        this.project(x0, wy + 0.08, faceZ),
        this.project(x0 + w * 0.42, wy + 0.08, faceZ),
        this.project(x0 + w * 0.42, wy + 0.14, faceZ),
        this.project(x0, wy + 0.14, faceZ),
        "#111111"
      );
    }
  },

  worldBlob(ctx, wx, wy, wz, rx, ry, col) {
    const c = this.project(wx, wy, wz);
    if (!c.visible) return;
    const ex = this.project(wx + rx, wy, wz);
    const ey = this.project(wx, wy + ry, wz);
    const rr = Math.max(3, Math.abs(ex.x - c.x));
    const rh = Math.max(3, Math.abs(c.y - ey.y));
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, rr, rh, 0, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
  },

  drawLamp3D(ctx, x, z, side) {
    const base = this.project(x, 0, z);
    const top = this.project(x, 4.2, z);
    const arm = this.project(x - side * 1.05, 4.05, z);
    if (!base.visible) return;
    ctx.strokeStyle = "#2a2a32";
    ctx.lineWidth = Math.max(2, base.s * 0.028);
    ctx.beginPath();
    ctx.moveTo(base.x, base.y);
    ctx.lineTo(top.x, top.y);
    ctx.lineTo(arm.x, arm.y);
    ctx.stroke();
    const glow = ctx.createRadialGradient(arm.x, arm.y, 2, arm.x, arm.y, base.s * 0.24);
    glow.addColorStop(0, "rgba(255, 220, 120, 0.9)");
    glow.addColorStop(1, "rgba(255, 200, 80, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(arm.x, arm.y, base.s * 0.24, 0, Math.PI * 2);
    ctx.fill();
  },

  drawTree3D(ctx, x, z, size) {
    const h = 3.4 + size * 1.35;
    const base = this.project(x, 0, z);
    if (!base.visible) return;
    if (base.s < 11) {
      this.worldBlob(ctx, x, h * 0.7, z, 0.9, 0.8, "#167a28");
      this.fillQuad(
        ctx,
        this.project(x - 0.12, 0, z),
        this.project(x + 0.12, 0, z),
        this.project(x + 0.08, h * 0.45, z),
        this.project(x - 0.08, h * 0.45, z),
        "#6a3a18"
      );
      return;
    }
    this.worldBlob(ctx, x + 0.45, 0.04, z, 0.95, 0.18, "rgba(0,0,0,0.28)");
    this.fillQuad(
      ctx,
      this.project(x - 0.16, 0, z),
      this.project(x + 0.16, 0, z),
      this.project(x + 0.11, h * 0.52, z),
      this.project(x - 0.11, h * 0.52, z),
      "#6a3a18"
    );
    this.fillQuad(
      ctx,
      this.project(x - 0.11, h * 0.52, z),
      this.project(x + 0.11, h * 0.52, z),
      this.project(x + 0.07, h * 0.7, z),
      this.project(x - 0.07, h * 0.7, z),
      "#8a5220"
    );
    this.worldBlob(ctx, x + 0.12, h * 0.62, z, 1.15, 0.95, "#0c4e18");
    this.worldBlob(ctx, x - 0.42, h * 0.58, z, 0.95, 0.82, "#146628");
    this.worldBlob(ctx, x + 0.38, h * 0.7, z, 0.82, 0.7, "#1a7a30");
    this.worldBlob(ctx, x - 0.08, h * 0.88, z, 0.78, 0.72, "#228a38");
    this.worldBlob(ctx, x + 0.1, h * 1.02, z, 0.55, 0.48, "#2aaa44");
  },

  drawBush3D(ctx, x, z) {
    const p = this.project(x, 0, z);
    if (!p.visible) return;
    this.worldBlob(ctx, x + 0.28, 0.04, z, 0.7, 0.16, "rgba(0,0,0,0.25)");
    this.worldBlob(ctx, x, 0.45, z, 0.62, 0.42, "#166a24");
    this.worldBlob(ctx, x + 0.32, 0.38, z, 0.48, 0.32, "#0f6b1c");
    this.worldBlob(ctx, x - 0.22, 0.4, z, 0.42, 0.3, "#1a8a28");
  },

  drawPalm3D(ctx, x, z) {
    const p = this.project(x, 0, z);
    if (!p.visible) return;
    this.worldBlob(ctx, x + 0.4, 0.04, z, 0.7, 0.14, "rgba(0,0,0,0.25)");
    this.fillQuad(
      ctx,
      this.project(x - 0.12, 0, z),
      this.project(x + 0.12, 0, z),
      this.project(x + 0.08, 3.2, z),
      this.project(x - 0.08, 3.2, z),
      "#8a5a28"
    );
    const tips = [
      [0.9, 2.85],
      [0.55, 3.35],
      [-0.15, 3.55],
      [-0.7, 3.2],
      [-0.95, 2.7],
    ];
    for (const [ox, oy] of tips) {
      this.worldBlob(ctx, x + ox * 0.55, oy, z, 0.85, 0.22, "#1f8a3a");
    }
    this.worldBlob(ctx, x, 3.25, z, 0.35, 0.28, "#2aaa3a");
  },

  drawPine3D(ctx, x, z, size) {
    const p = this.project(x, 0, z);
    if (!p.visible) return;
    const h = 3.6 + size * 1.2;
    this.worldBlob(ctx, x + 0.35, 0.04, z, 0.7, 0.14, "rgba(0,0,0,0.28)");
    this.fillQuad(
      ctx,
      this.project(x - 0.12, 0, z),
      this.project(x + 0.12, 0, z),
      this.project(x + 0.09, h * 0.28, z),
      this.project(x - 0.09, h * 0.28, z),
      "#4a3014"
    );
    const layers = [
      [0.28, 1.35, "#0a3a1c"],
      [0.48, 1.05, "#0c4a22"],
      [0.68, 0.78, "#166a32"],
    ];
    for (const [yy, half, col] of layers) {
      this.fillTri(
        ctx,
        this.project(x, yy + half * 1.15, z),
        this.project(x - half, yy, z),
        this.project(x + half, yy, z),
        col
      );
    }
  },

  drawRock3D(ctx, x, z) {
    this.drawBox3D(ctx, x, 0, z, 1.1, 0.7, 0.9, {
      left: "#8a9098",
      right: "#4a4e54",
      front: "#6a6e74",
      top: "#9aa0a8",
    });
  },

  drawPlayerCar(ctx, menu) {
    const hop = this.viewJump() * 0.09;
    const z = this.playerZ() + (menu ? 16 : 0);
    const p = this.project(this.viewLaneX(), hop * 1.5, z);
    if (!p.visible) return;
    if (this.powers.shield > 0) {
      ctx.save();
      ctx.fillStyle = "rgba(125, 255, 184, 0.28)";
      ctx.beginPath();
      ctx.ellipse(p.x, p.y - p.s * 0.08, p.s * 0.42, p.s * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    drawIsoCar(ctx, p.x, p.y, this.spriteSize(p, 0.82), this.car, {
      yaw: this.viewYaw(),
      nitro: this.powers.nitro,
      flash: this.flash % 0.4 < 0.2,
      jump: this.viewJump(),
      skid: !menu,
    });
  },

  drawCopCar(ctx) {
    if (!this.cop || this.cop.z == null) return;
    const p = this.project(this.cop.laneX, 0, this.cop.z);
    if (!p.visible || p.y > this.h + 90) return;
    drawIsoCar(ctx, p.x, p.y, this.spriteSize(p, 0.8), getCar("policia"), {
      flash: this.flash % 0.4 < 0.2,
      yaw: this.viewYaw() * 0.65,
      skid: true,
    });
  },

  drawEntity(ctx, e) {
    const x = this.laneWorldX(e.lane);
    if (e.kind === "coin") {
      const p = this.project(x, 0.9, e.z);
      if (!p.visible) return;
      drawAssetCoin(ctx, p.x, p.y, this.spriteSize(p, 0.42));
    } else if (e.kind === "power") {
      const p = this.project(x, 0.95, e.z);
      if (!p.visible) return;
      drawPowerIcon(ctx, p.x, p.y, this.spriteSize(p, 0.48), e.power);
    } else if (e.kind === "barrier") {
      const p = this.project(x, 0, e.z);
      if (!p.visible) return;
      drawCrateAsset(ctx, p.x, p.y, this.spriteSize(p, 1.55), 4 + ((e.z | 0) % 2));
    } else if (e.kind === "cone") {
      const p = this.project(x, 0, e.z);
      if (!p.visible) return;
      drawConeAsset(ctx, p.x, p.y, this.spriteSize(p, 1.35));
    } else if (e.kind === "tires") {
      const p = this.project(x, 0, e.z);
      if (!p.visible) return;
      drawTireStackAsset(ctx, p.x, p.y, this.spriteSize(p, 1.4));
    } else if (e.kind === "oil") {
      const p = this.project(x, 0.02, e.z);
      if (!p.visible) return;
      drawOilAsset(ctx, p.x, p.y, this.spriteSize(p, 1.5));
    } else if (e.kind === "container") {
      const p = this.project(x, 0, e.z);
      if (!p.visible) return;
      drawContainerAsset(ctx, p.x, p.y, this.spriteSize(p, 1.9));
    } else if (e.kind === "truck") {
      const p = this.project(x, 0, e.z);
      if (!p.visible) return;
      drawDumpTruckAsset(ctx, p.x, p.y, this.spriteSize(p, 1.15), { brake: true });
    } else {
      const p = this.project(x, 0, e.z);
      if (!p.visible) return;
      drawIsoCar(ctx, p.x, p.y, this.spriteSize(p, 0.78), e.car || randomTrafficCar(), { brake: true, skid: true });
    }
  },

  drawEntities3D(ctx, menu) {
    const playerZ = this.playerZ();
    const list = [];
    if (!menu) {
      for (const e of this.entities) {
        if (!e.taken) list.push({ z: e.z, e });
      }
      if (this.cop) list.push({ z: this.cop.z, cop: true });
    }
    list.push({ z: playerZ, player: true });
    for (const s of this.collectScenery()) list.push({ z: s.z, scenery: s });
    list.sort((a, b) => b.z - a.z);
    for (const item of list) {
      if (item.scenery) this.drawSceneryItem(ctx, item.scenery);
      else if (item.player) this.drawPlayerCar(ctx, menu);
      else if (item.cop) this.drawCopCar(ctx);
      else this.drawEntity(ctx, item.e);
    }
    if (menu) return;
    for (const part of this.particles) {
      const p = this.project(part.x, part.y || 0.4, part.z);
      if (!p.visible) continue;
      ctx.fillStyle = part.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1.4, p.s * 0.028), 0, Math.PI * 2);
      ctx.fill();
    }
  },

  drawWorld3D(ctx, menu) {
    let ox = 0;
    let oy = 0;
    if (!menu && this.shake > 0.4) {
      ox = (Math.random() - 0.5) * this.shake;
      oy = (Math.random() - 0.5) * this.shake;
    }
    ctx.save();
    ctx.translate(ox, oy);
    this.drawSky3D(ctx);
    this.drawRoad3D(ctx);
    this.drawEntities3D(ctx, menu);
    ctx.restore();
  },

  draw(alpha) {
    const a = Math.max(0, Math.min(1, alpha == null ? 1 : alpha));
    this._drawCam = lerp(this.prevCameraZ ?? this.cameraZ, this.cameraZ, a);
    this._drawLaneX = lerp(this.prevLaneX ?? this.laneX, this.laneX, a);
    this._drawYaw = lerp(this.prevYaw ?? this.yaw, this.yaw, a);
    this._drawJump = lerp(this.prevJump ?? this.jump, this.jump, a);
    this.drawWorld3D(this.ctx, false);
    this._drawCam = null;
    this._drawLaneX = null;
    this._drawYaw = null;
    this._drawJump = null;
  },

  drawMenuScene() {
    this._drawCam = BIOME_INTRO + 40;
    this._drawLaneX = -LANE_GAP;
    this._drawYaw = -0.05;
    this._drawJump = 0;
    this.cameraZ = BIOME_INTRO + 40;
    this.drawWorld3D(this.ctx, true);
    this._drawCam = null;
    this._drawLaneX = null;
    this._drawYaw = null;
    this._drawJump = null;
  },

  idle() {
    this.car = getCar(Save.data.selected);
    this.running = false;
    this._idle = true;
    this.cameraZ = 0;
    this.drawMenuScene();
  },
};
