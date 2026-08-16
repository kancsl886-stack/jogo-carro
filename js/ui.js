const $ = (id) => document.getElementById(id);

const screens = {
  menu: $("screen-menu"),
  shop: $("screen-shop"),
  howto: $("screen-howto"),
  pause: $("screen-pause"),
  over: $("screen-over"),
};

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

function refreshMenu() {
  $("menu-coins").textContent = `${Save.data.coins} moedas`;
  $("menu-best").textContent = `Recorde ${formatMeters(Save.data.best)}`;
  $("menu-car").textContent = getCar(Save.data.selected).name;
  $("shop-coins").textContent = `${Save.data.coins} ⬤`;
  $("hud-best").textContent = formatMeters(Save.data.best);
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
  const maxSpeed = 1.5;
  const maxHand = 1.4;
  const maxMag = 1.55;

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
        <span class="badge ${car.rarity}">${car.rarity}</span>
      </div>
      <div class="bars">
        <div class="bar-row"><span>Velocidade</span><div class="bar"><i style="width:${statPercent(car.stats.speed, maxSpeed)}%"></i></div></div>
        <div class="bar-row"><span>Manobra</span><div class="bar"><i style="width:${statPercent(car.stats.handling, maxHand)}%"></i></div></div>
        <div class="bar-row"><span>Ímã</span><div class="bar"><i style="width:${statPercent(car.stats.magnet, maxMag)}%"></i></div></div>
      </div>
      <button class="btn ${equipped ? "ghost" : "primary"}" type="button"></button>
    `;
    const canvas = card.querySelector("canvas");
    drawVehicle(canvas.getContext("2d"), 140, 88, 2.4, car, { flash: true });
    const btn = card.querySelector("button");
    if (equipped) {
      btn.textContent = "Equipado";
      btn.disabled = true;
    } else if (owned) {
      btn.textContent = "Equipar";
      btn.onclick = () => {
        Save.select(car.id);
        Sfx.buy();
        refreshMenu();
        renderShop();
        toast(`${car.name} na pista`);
      };
    } else {
      btn.textContent = `Comprar · ${car.price}`;
      btn.onclick = () => {
        if (!Save.spend(car.price)) {
          Sfx.deny();
          toast("Moedas insuficientes");
          return;
        }
        Save.own(car.id);
        Save.select(car.id);
        Sfx.buy();
        refreshMenu();
        renderShop();
        toast(`${car.name} desbloqueado!`);
      };
    }
    grid.appendChild(card);
  });
}

function setPowerHud(powers) {
  const labels = [];
  if (powers.magnet > 0) labels.push(`Ímã ${powers.magnet.toFixed(0)}s`);
  if (powers.shield > 0) labels.push(`Escudo ${powers.shield.toFixed(0)}s`);
  if (powers.nitro > 0) labels.push(`Nitro ${powers.nitro.toFixed(0)}s`);
  $("powerups").innerHTML = labels.map((t) => `<div class="power">${t}</div>`).join("");
}

function play() {
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
  Sfx.muted = Save.data.muted;
  Game.init($("game"));
  Game.onHud = (info) => {
    $("hud-distance").textContent = formatMeters(info.distance);
    $("hud-run-coins").textContent = info.coins;
    $("hud-speed").textContent = `${Math.floor(info.speed * 4.2)} km/h`;
    $("speed-fill").style.width = `${Math.min(100, (info.speed / 90) * 100)}%`;
    setPowerHud(info.powers);
  };
  Game.onOver = (info) => {
    $("over-distance").textContent = formatMeters(info.distance);
    $("over-coins").textContent = `+${info.coins}`;
    $("over-best").textContent = formatMeters(info.best);
    $("over-record").classList.toggle("hidden", !info.isRecord);
    showScreen("over");
    refreshMenu();
  };

  $("btn-play").onclick = play;
  $("btn-retry").onclick = play;
  $("btn-shop").onclick = () => {
    renderShop();
    showScreen("shop");
  };
  $("btn-over-shop").onclick = () => {
    Game.stop();
    renderShop();
    showScreen("shop");
  };
  $("btn-howto").onclick = () => showScreen("howto");
  $("btn-shop-back").onclick = backToMenu;
  $("btn-howto-back").onclick = () => showScreen("menu");
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
