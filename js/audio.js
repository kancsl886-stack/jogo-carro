const Sfx = {
  ctx: null,
  muted: false,
  volume: 0.7,

  unlock() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  },

  setVolume(percent) {
    this.volume = Math.max(0, Math.min(1, percent / 100));
    this.muted = this.volume <= 0.001;
  },

  beep(freq, dur, type, gain) {
    if (this.muted || !this.ctx || this.volume <= 0) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type || "square";
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime((gain || 0.05) * this.volume, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  },

  coin() {
    this.beep(880, 0.08, "square", 0.04);
    setTimeout(() => this.beep(1320, 0.1, "square", 0.03), 40);
  },
  jump() {
    this.beep(240, 0.12, "sawtooth", 0.04);
  },
  lane() {
    this.beep(180, 0.06, "triangle", 0.03);
  },
  power() {
    this.beep(520, 0.16, "sine", 0.05);
  },
  crash() {
    this.beep(90, 0.35, "sawtooth", 0.08);
  },
  buy() {
    this.beep(660, 0.12, "triangle", 0.05);
    setTimeout(() => this.beep(990, 0.16, "triangle", 0.05), 80);
  },
  deny() {
    this.beep(140, 0.18, "square", 0.04);
  },
  siren() {
    this.beep(780, 0.16, "square", 0.035);
    setTimeout(() => this.beep(520, 0.16, "square", 0.035), 170);
  },
};
