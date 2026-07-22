(() => {
  "use strict";

  const game = document.querySelector("#game");
  const player = document.querySelector("#player");
  const entities = document.querySelector("#entities");
  const scoreEl = document.querySelector("#score");
  const hitsEl = document.querySelector("#hits");
  const message = document.querySelector("#message");
  const messageText = document.querySelector("#messageText");
  let y = 46;
  let score = 0;
  let hits = 0;
  let running = true;
  let items = [];
  let bolts = [];
  let last = 0;
  let appleTimer = 0;
  let dragonTimer = 0;

  const clamp = (number, min, max) => Math.max(min, Math.min(max, number));
  const move = (direction) => {
    if (!running) return;
    y = clamp(y + direction * 5, 4, 88);
    player.style.top = `${y}%`;
  };

  function spawn(type) {
    if (!running) return;
    const element = document.createElement("div");
    element.className = `entity ${type}`;
    element.textContent = type === "apple" ? "🍎" : "🐉";
    element.style.left = "100%";
    element.style.top = `${10 + Math.random() * 76}%`;
    entities.append(element);
    items.push({ element, type, x: 100, y: parseFloat(element.style.top) });
  }

  function fire() {
    if (!running) return;
    const element = document.createElement("div");
    element.className = "bolt";
    element.textContent = "✨";
    element.style.left = "19%";
    element.style.top = `${y + 2}%`;
    game.append(element);
    bolts.push({ element, x: 19, y });
  }

  function end(reason) {
    if (!running) return;
    running = false;
    message.classList.remove("hidden");
    messageText.textContent = reason || `Du hast ${score} Äpfel gegessen und ${hits} Drachen getroffen.`;
    game.dispatchEvent(new CustomEvent("magicgameover", { detail: { score, hits } }));
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
      fire();
    }
  });

  document.querySelector("#restart").addEventListener("click", () => window.location.reload());

  document.querySelectorAll("[data-magic-control]").forEach((button) => {
    const control = button.dataset.magicControl;
    let repeatTimer = 0;
    const act = () => {
      if (control === "up") move(-1);
      else if (control === "down") move(1);
      else fire();
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
      if (control !== "fire") repeatTimer = window.setInterval(act, 85);
    });
    button.addEventListener("pointerup", stop);
    button.addEventListener("pointercancel", stop);
    button.addEventListener("lostpointercapture", stop);
  });

  function loop(time) {
    if (!running) return;
    const delta = Math.min(32, time - last || 16);
    last = time;
    appleTimer += delta;
    dragonTimer += delta;
    if (appleTimer > 1300) {
      spawn("apple");
      appleTimer = 0;
    }
    if (dragonTimer > 2100) {
      spawn("dragon");
      dragonTimer = 0;
    }

    for (let index = items.length - 1; index >= 0; index -= 1) {
      const item = items[index];
      item.x -= delta * (item.type === "dragon" ? 0.018 : 0.012);
      item.element.style.left = `${item.x}%`;
      if (item.x < -10) {
        item.element.remove();
        items.splice(index, 1);
        continue;
      }
      const close = item.x < 24 && item.x > 8 && Math.abs(item.y - y) < 12;
      if (!close) continue;
      if (item.type === "apple") {
        score += 1;
        scoreEl.textContent = String(score);
        item.element.remove();
        items.splice(index, 1);
      } else {
        end();
        return;
      }
    }

    for (let boltIndex = bolts.length - 1; boltIndex >= 0; boltIndex -= 1) {
      const bolt = bolts[boltIndex];
      bolt.x += delta * 0.05;
      bolt.element.style.left = `${bolt.x}%`;
      let hit = false;
      for (let itemIndex = items.length - 1; itemIndex >= 0; itemIndex -= 1) {
        const item = items[itemIndex];
        if (item.type === "dragon" && bolt.x > item.x - 3 && bolt.x < item.x + 8 && Math.abs(bolt.y - item.y) < 13) {
          hits += 1;
          hitsEl.textContent = String(hits);
          item.element.remove();
          bolt.element.remove();
          items.splice(itemIndex, 1);
          bolts.splice(boltIndex, 1);
          hit = true;
          break;
        }
      }
      if (!hit && bolt.x > 100) {
        bolt.element.remove();
        bolts.splice(boltIndex, 1);
      }
    }
    window.requestAnimationFrame(loop);
  }

  window.MagicGame = {
    get running() { return running; },
    end,
    fire,
    move
  };
  window.requestAnimationFrame(loop);
})();
