(() => {
  "use strict";

  const game = document.querySelector("#game");
  const hud = document.querySelector(".hud");
  const player = document.querySelector("#player");
  const level = document.createElement("span");
  const loadNumber = (key, fallback) => {
    try {
      const value = Number(window.localStorage.getItem(key));
      return Number.isFinite(value) && value > 0 ? value : fallback;
    } catch (_) {
      return fallback;
    }
  };
  const saveNumber = (key, value) => {
    try {
      window.localStorage.setItem(key, String(value));
    } catch (_) {
      // Levels still work for the current run when storage is blocked.
    }
  };
  let current = Math.max(1, loadNumber("letsGoMagicLevel", 1));
  let fireballs = [];
  let animationFrame = 0;

  level.id = "level";
  level.innerHTML = `Level: <b>${current}</b>`;
  hud.prepend(level);

  function updateLevel() {
    const apples = Number(document.querySelector("#score").textContent);
    const shots = Number(document.querySelector("#hits").textContent);
    const gained = Math.min(10, Math.floor(Math.min(apples / 15, shots / 20)) + 1);
    if (gained <= current) return;
    current = gained;
    saveNumber("letsGoMagicLevel", current);
    level.querySelector("b").textContent = String(current);
  }

  function fire() {
    if (current < 10 || !window.MagicGame.running) return;
    const element = document.createElement("div");
    element.className = "bolt fireball";
    element.textContent = "🔥";
    element.style.left = "100%";
    element.style.top = `${8 + Math.random() * 82}%`;
    game.append(element);
    fireballs.push({ element, x: 100, y: parseFloat(element.style.top) });
  }

  const spawnTimer = window.setInterval(() => {
    if (!window.MagicGame.running) return;
    updateLevel();
    if (current >= 10 && Math.random() < 0.55) fire();
  }, 900);

  function loop() {
    if (!window.MagicGame.running) return;
    const playerY = parseFloat(player.style.top || 46);
    for (let index = fireballs.length - 1; index >= 0; index -= 1) {
      const fireball = fireballs[index];
      fireball.x -= 0.7;
      fireball.element.style.left = `${fireball.x}%`;
      if (fireball.x < 24 && fireball.x > 8 && Math.abs(fireball.y - playerY) < 12) {
        fireball.element.remove();
        fireballs.splice(index, 1);
        window.MagicGame.end("Ein Feuerball hat dich getroffen!");
        return;
      }
      if (fireball.x < -5) {
        fireball.element.remove();
        fireballs.splice(index, 1);
      }
    }
    animationFrame = window.requestAnimationFrame(loop);
  }

  game.addEventListener("magicgameover", () => {
    window.clearInterval(spawnTimer);
    window.cancelAnimationFrame(animationFrame);
    fireballs.forEach(({ element }) => element.remove());
    fireballs = [];
  });
  animationFrame = window.requestAnimationFrame(loop);
})();
