(() => {
  "use strict";

  const arena = document.querySelector("#arena");
  const player = document.querySelector("#player");
  const entities = document.querySelector("#entities");
  const overlay = document.querySelector("#startOverlay");
  const timeEl = document.querySelector("#time");
  const scoreEl = document.querySelector("#score");
  const bestEl = document.querySelector("#best");
  const loadBest = () => {
    try {
      const value = Number(window.localStorage.getItem("geisterbahn-best") || 0);
      return Number.isFinite(value) ? value : 0;
    } catch (_) {
      return 0;
    }
  };
  const saveBest = (value) => {
    try {
      window.localStorage.setItem("geisterbahn-best", String(value));
    } catch (_) {
      // The game remains playable when persistent storage is blocked.
    }
  };
  let running = false;
  let score = 0;
  let best = loadBest();
  let y = 45;
  let startTime = 0;
  let last = 0;
  let objects = [];
  let shots = [];
  let spawnTimer = 0;
  let animationFrame = 0;
  let runId = 0;

  bestEl.textContent = String(best);

  function clearRound() {
    window.clearTimeout(spawnTimer);
    window.cancelAnimationFrame(animationFrame);
    objects.forEach(({ element }) => element.remove());
    shots.forEach(({ element }) => element.remove());
    objects = [];
    shots = [];
    entities.replaceChildren();
    arena.querySelectorAll(".projectile").forEach((element) => element.remove());
  }

  function start() {
    running = false;
    runId += 1;
    clearRound();
    score = 0;
    y = 45;
    scoreEl.textContent = "0";
    timeEl.textContent = "0.0 s";
    player.style.top = "45%";
    overlay.style.display = "none";
    startTime = performance.now();
    last = startTime;
    running = true;
    spawn(runId);
    arena.focus({ preventScroll: true });
    animationFrame = window.requestAnimationFrame((time) => loop(time, runId));
  }

  function spawn(activeRun) {
    if (!running || activeRun !== runId) return;
    const type = Math.random() < 0.62 ? "ghost" : "dragon";
    const element = document.createElement("div");
    element.className = `entity ${type}`;
    element.textContent = type === "ghost" ? "👻" : "🐉";
    element.style.left = "105%";
    element.style.top = `${12 + Math.random() * 72}%`;
    entities.appendChild(element);
    objects.push({ element, type, x: 105, top: parseFloat(element.style.top) });
    spawnTimer = window.setTimeout(() => spawn(activeRun), 850 + Math.random() * 700);
  }

  function move(direction) {
    if (!running) return;
    y = Math.max(5, Math.min(88, y + direction * 7));
    player.style.top = `${y}%`;
  }

  function shoot(kind) {
    if (!running) return;
    const element = document.createElement("div");
    element.className = `projectile ${kind}`;
    element.textContent = kind === "fire" ? "🔥" : "❄️";
    element.style.left = "14%";
    element.style.top = `${y + 3}%`;
    arena.appendChild(element);
    shots.push({ element, kind, x: 14, top: y + 3 });
  }

  function end() {
    if (!running) return;
    running = false;
    window.clearTimeout(spawnTimer);
    if (score > best) {
      best = score;
      saveBest(best);
      bestEl.textContent = String(best);
    }
    overlay.querySelector("h2").textContent = "Fahrt vorbei!";
    overlay.querySelector("p").textContent = `Du hast ${score} Geister besiegt.`;
    overlay.querySelector("button").textContent = "Nochmal spielen";
    overlay.style.display = "grid";
  }

  function loop(now, activeRun) {
    if (!running || activeRun !== runId) return;
    const delta = Math.min((now - last) / 16, 3);
    last = now;
    timeEl.textContent = `${((now - startTime) / 1000).toFixed(1)} s`;

    for (let index = objects.length - 1; index >= 0; index -= 1) {
      const object = objects[index];
      object.x -= 0.22 * delta;
      object.element.style.left = `${object.x}%`;
      if (object.x < -10) {
        object.element.remove();
        objects.splice(index, 1);
        continue;
      }
      if (Math.abs(object.x - 12) < 7 && Math.abs(object.top - y) < 10) {
        end();
        return;
      }
    }

    for (let shotIndex = shots.length - 1; shotIndex >= 0; shotIndex -= 1) {
      const shot = shots[shotIndex];
      shot.x += 1.7 * delta;
      shot.element.style.left = `${shot.x}%`;
      let hit = false;
      for (let objectIndex = objects.length - 1; objectIndex >= 0; objectIndex -= 1) {
        const object = objects[objectIndex];
        const correctMagic = (shot.kind === "fire" && object.type === "ghost") || (shot.kind === "ice" && object.type === "dragon");
        if (!correctMagic || Math.abs(shot.x - object.x) >= 6 || Math.abs(shot.top - object.top) >= 10) continue;
        object.element.remove();
        shot.element.remove();
        objects.splice(objectIndex, 1);
        shots.splice(shotIndex, 1);
        if (object.type === "ghost") {
          score += 1;
          scoreEl.textContent = String(score);
        }
        hit = true;
        break;
      }
      if (!hit && shot.x >= 110) {
        shot.element.remove();
        shots.splice(shotIndex, 1);
      }
    }
    animationFrame = window.requestAnimationFrame((time) => loop(time, activeRun));
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      shoot("fire");
    }
    if (event.key === "Enter") {
      event.preventDefault();
      shoot("ice");
    }
  });

  document.querySelectorAll("[data-ghost-control]").forEach((button) => {
    const control = button.dataset.ghostControl;
    let repeatTimer = 0;
    const act = () => {
      if (control === "up") move(-1);
      else if (control === "down") move(1);
      else shoot(control);
    };
    const stop = () => {
      window.clearInterval(repeatTimer);
      repeatTimer = 0;
      button.classList.remove("is-active");
    };
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.setPointerCapture?.(event.pointerId);
      button.classList.add("is-active");
      act();
      if (control === "up" || control === "down") repeatTimer = window.setInterval(act, 90);
    });
    button.addEventListener("pointerup", stop);
    button.addEventListener("pointercancel", stop);
    button.addEventListener("lostpointercapture", stop);
  });

  document.querySelector("#start").addEventListener("click", start);
  document.querySelector("#restart").addEventListener("click", start);
})();
