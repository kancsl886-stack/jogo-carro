const STORAGE_KEY = "nitro-surf-save-v1";

const DEFAULT_SAVE = {
  coins: 0,
  best: 0,
  owned: ["fusca"],
  selected: "fusca",
  muted: false,
};

function loadSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SAVE, owned: ["fusca"] };
    const parsed = JSON.parse(raw);
    const owned = Array.isArray(parsed.owned) && parsed.owned.length ? parsed.owned : ["fusca"];
    if (!owned.includes("fusca")) owned.unshift("fusca");
    const selected = owned.includes(parsed.selected) ? parsed.selected : "fusca";
    return {
      coins: Number(parsed.coins) || 0,
      best: Number(parsed.best) || 0,
      owned,
      selected,
      muted: Boolean(parsed.muted),
    };
  } catch (err) {
    return { ...DEFAULT_SAVE, owned: ["fusca"] };
  }
}

function writeSave(save) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
}

const Save = {
  data: loadSave(),
  persist() {
    writeSave(this.data);
  },
  addCoins(amount) {
    this.data.coins += Math.max(0, Math.floor(amount));
    this.persist();
  },
  spend(amount) {
    if (this.data.coins < amount) return false;
    this.data.coins -= amount;
    this.persist();
    return true;
  },
  own(id) {
    if (!this.data.owned.includes(id)) this.data.owned.push(id);
    this.persist();
  },
  has(id) {
    return this.data.owned.includes(id);
  },
  select(id) {
    if (!this.has(id)) return false;
    this.data.selected = id;
    this.persist();
    return true;
  },
  setBest(distance) {
    if (distance > this.data.best) {
      this.data.best = Math.floor(distance);
      this.persist();
      return true;
    }
    return false;
  },
};
