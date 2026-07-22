(() => {
  "use strict";

  const game = document.querySelector("#game");
  const hud = document.querySelector(".hud");
  const time = document.createElement("span");
  const record = document.createElement("span");
  const loadNumber = (key) => {
    try {
      const value = Number(window.localStorage.getItem(key) || 0);
      return Number.isFinite(value) ? value : 0;
    } catch (_) {
      return 0;
    }
  };
  const saveNumber = (key, value) => {
    try {
      window.localStorage.setItem(key, String(value));
    } catch (_) {
      // The current run still works when persistent storage is blocked.
    }
  };
  let best = loadNumber("letsGoMagicRecord");
  const startedAt = performance.now();
  let running = true;

  time.innerHTML = "Zeit: <b>0,0 s</b>";
  record.innerHTML = `Rekord: <b>${best.toFixed(1).replace(".", ",")} s</b>`;
  hud.append(time, record);

  function tick() {
    if (!running) return;
    time.querySelector("b").textContent = `${((performance.now() - startedAt) / 1000).toFixed(1).replace(".", ",")} s`;
    window.requestAnimationFrame(tick);
  }

  game.addEventListener("magicgameover", () => {
    if (!running) return;
    running = false;
    const seconds = (performance.now() - startedAt) / 1000;
    time.querySelector("b").textContent = `${seconds.toFixed(1).replace(".", ",")} s`;
    if (seconds > best) {
      best = seconds;
      saveNumber("letsGoMagicRecord", best.toFixed(1));
      record.querySelector("b").textContent = `${best.toFixed(1).replace(".", ",")} s`;
    }
  });
  window.requestAnimationFrame(tick);
})();
