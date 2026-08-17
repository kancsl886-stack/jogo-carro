const $ = (id) => document.getElementById(id);

const screens = {
  menu: $("screen-menu"),
  settings: $("screen-settings"),
  shop: $("screen-shop"),
  howto: $("screen-howto"),
  pause: $("screen-pause"),
  over: $("screen-over"),
};

let shopFrom = "settings";

function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    el.classList.toggle("hidden", Boolean(name) && key !== name);
  });
  if (!name) {
    Object.values(screens).forEach((el) => el.classList.add("hidden"));
  }
  $("hud").classList.toggle("hidden", Boolean(name) && name !== "pause");
}

function formatMeters(n) {
  return `${Math.floor(n)} m`;
}

function syncVolume() {
  const v = Save.data.volume;
  $("volume-slider").value = String(v);
  $("volume-value").textContent = `${v}%`;
  Sfx.setVolume(v);
}

function syncLang() {
  [...$("lang-row").children].forEach((btn) => {
    btn.classList.toggle("on", btn.dataset.lang === Save.data.lang);
  });
  applyI18n();
  refreshMenu();
}

function setVolume(value) {
  Save.setVolume(value);
  syncVolume();
}

function refreshMenu() {
  $("menu-coins").textContent = String(Save.data.coins);
  $("menu-best").textContent = `${t("best")} ${formatMeters(Save.data.best)}`;
  $("menu-car").textContent = getCar(Save.data.selected).name;
  $("shop-coins").textContent = `${Save.data.coins} ⬤`;
  $("hud-best").textContent = formatMeters(Save.data.best);
  if (!Game.running && Game.ctx) Game.drawMenuScene();
}

function toast(msg) {
  const el = $("toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add("hidden"), 1600);
}

let shopFilter = "all";

function renderShop() {
  const grid = $("shop-grid");
  grid.innerHTML = "";
  const maxSpeed = 1.64;
  const maxHand = 1.55;
  const maxMag = 1.6;

  CARS.filter((car) => {
    if (shopFilter === "all") return true;
    if (shopFilter === "owned") return Save.has(car.id);
    return car.rarity === shopFilter;
  }).forEach((car) => {
    const owned = Save.has(car.id);
    const equipped = Save.data.selected === car.id;
    const card = document.createElement("article");
    card.className = `car-card ${car.rarity}${equipped ? " equipped" : ""}`;
    card.innerHTML = `
      <div class="preview"><canvas width="280" height="140"></canvas></div>
      <div class="car-top">
        <div>
          <h3>${car.name}</h3>
          <small>${car.type}</small>
        </div>
        <span class="badge ${car.rarity}">${t(car.rarity)}</span>
      </div>
      <div class="bars">
        <div class="bar-row"><span>${t("speed")}</span><div class="bar"><i style="width:${statPercent(car.stats.speed, maxSpeed)}%"></i></div></div>
        <div class="bar-row"><span>${t("handling")}</span><div class="bar"><i style="width:${statPercent(car.stats.handling, maxHand)}%"></i></div></div>
        <div class="bar-row"><span>${t("magnet")}</span><div class="bar"><i style="width:${statPercent(car.stats.magnet, maxMag)}%"></i></div></div>
      </div>
      <button class="btn ${equipped ? "ghost" : "primary"}" type="button"></button>
    `;
    const canvas = card.querySelector("canvas");
    const c2d = canvas.getContext("2d");
    c2d.imageSmoothingEnabled = false;
    c2d.fillStyle = "#48d048";
    c2d.fillRect(0, 0, 280, 140);
    c2d.fillStyle = "#7a7a7a";
    c2d.fillRect(90, 0, 100, 140);
    c2d.fillStyle = "#ffffff";
    for (let y = 6; y < 140; y += 18) {
      c2d.fillRect(122, y, 3, 10);
      c2d.fillRect(155, y, 3, 10);
    }
    drawCarTop(c2d, 140, 72, 4, car, { u: 4, flash: true });
    const btn = card.querySelector("button");
    if (equipped) {
      btn.textContent = t("equipped");
      btn.disabled = true;
    } else if (owned) {
      btn.textContent = t("equip");
      btn.onclick = () => {
        Save.select(car.id);
        Sfx.buy();
        refreshMenu();
        renderShop();
        toast(`${car.name} ${t("onTrack")}`);
      };
    } else {
      btn.textContent = `${t("buy")} · ${car.price}`;
      btn.onclick = () => {
        if (!Save.spend(car.price)) {
          Sfx.deny();
          toast(t("noCoins"));
          return;
        }
        Save.own(car.id);
        Save.select(car.id);
        Sfx.buy();
        refreshMenu();
        renderShop();
        toast(`${car.name} ${t("unlocked")}`);
      };
    }
    grid.appendChild(card);
  });
}

function setPowerHud(powers) {
  const labels = [];
  if (powers.magnet > 0) labels.push(`${t("magnetHud")} ${powers.magnet.toFixed(0)}s`);
  if (powers.shield > 0) labels.push(`${t("shieldHud")} ${powers.shield.toFixed(0)}s`);
  if (powers.nitro > 0) labels.push(`${t("nitroHud")} ${powers.nitro.toFixed(0)}s`);
  $("powerups").innerHTML = labels.map((text) => `<div class="power">${text}</div>`).join("");
}

function openShop(from) {
  shopFrom = from;
  renderShop();
  showScreen("shop");
}

function biomeLabel(id) {
  const keys = {
    campo: "biomeCampo",
    cidade: "biomeCidade",
    praia: "biomePraia",
    serra: "biomeSerra",
    porto: "biomePorto",
  };
  return t(keys[id] || "biomeCampo");
}

let lastHudBiome = "";

function play() {
  lastHudBiome = "";
  Sfx.unlock();
  showScreen(null);
  Game.start();
}

function backToMenu() {
  Game.stop();
  refreshMenu();
  showScreen("menu");
  Game.idle();
}

window.addEventListener("DOMContentLoaded", () => {
  Sfx.setVolume(Save.data.volume);
  Sfx.muted = Save.data.muted;
  syncVolume();
  syncLang();
  Game.init($("game"));
  Game.onHud = (info) => {
    $("hud-distance").textContent = formatMeters(info.distance);
    $("hud-run-coins").textContent = info.coins;
    $("hud-speed").textContent = `${Math.floor(info.speed * 4.2)} km/h`;
    $("speed-fill").style.width = `${Math.min(100, (info.speed / 90) * 100)}%`;
    const danger = 1 - (info.copGap - 8.5) / 13.5;
    $("cop-fill").style.width = `${Math.max(8, Math.min(100, danger * 100))}%`;
    if (info.biome) {
      const name = biomeLabel(info.biome);
      $("hud-place").textContent = name;
      if (info.biome !== lastHudBiome) {
        if (lastHudBiome) toast(`${t("entering")} ${name}`);
        lastHudBiome = info.biome;
      }
    }
    setPowerHud(info.powers);
  };
  Game.onOver = (info) => {
    const cop = info.caughtBy === "police";
    $("over-title").textContent = cop ? t("caught") : t("crashed");
    $("over-kicker").textContent = cop ? t("overKickerCop") : t("overKicker");
    $("over-distance").textContent = formatMeters(info.distance);
    $("over-coins").textContent = `+${info.coins}`;
    $("over-best").textContent = formatMeters(info.best);
    $("over-record").classList.toggle("hidden", !info.isRecord);
    showScreen("over");
    refreshMenu();
  };

  $("btn-play").onclick = play;
  $("btn-retry").onclick = play;
  $("btn-menu").onclick = () => showScreen("settings");
  $("btn-settings-back").onclick = () => showScreen("menu");
  $("btn-shop").onclick = () => openShop("settings");
  $("btn-over-shop").onclick = () => {
    Game.stop();
    openShop("over");
  };
  $("btn-howto").onclick = () => showScreen("howto");
  $("btn-shop-back").onclick = () => {
    if (shopFrom === "over") backToMenu();
    else showScreen("settings");
  };
  $("btn-howto-back").onclick = () => showScreen("settings");
  $("btn-over-menu").onclick = backToMenu;
  $("btn-pause").onclick = () => {
    Game.pause();
    showScreen("pause");
  };
  $("btn-resume").onclick = () => {
    showScreen(null);
    Game.resume();
  };
  $("btn-quit").onclick = backToMenu;

  $("volume-slider").addEventListener("input", (e) => {
    Sfx.unlock();
    setVolume(Number(e.target.value));
  });
  $("btn-vol-down").onclick = () => {
    Sfx.unlock();
    setVolume(Save.data.volume - 10);
    Sfx.coin();
  };
  $("btn-vol-up").onclick = () => {
    Sfx.unlock();
    setVolume(Save.data.volume + 10);
    Sfx.coin();
  };

  $("lang-row").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-lang]");
    if (!btn) return;
    Save.setLang(btn.dataset.lang);
    syncLang();
    Sfx.lane();
  });

  $("shop-filters").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    shopFilter = btn.dataset.filter;
    [...$("shop-filters").children].forEach((el) => el.classList.toggle("on", el === btn));
    renderShop();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && Game.running && !Game.paused) {
      Game.pause();
      showScreen("pause");
    }
  });

  document.body.addEventListener("pointerdown", () => Sfx.unlock(), { once: true });
  refreshMenu();
  Game.idle();
});
