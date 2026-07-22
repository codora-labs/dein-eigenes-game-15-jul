(function () {
  "use strict";

  const WORLD = Object.freeze({ width: 960, height: 600 });
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const circlesHit = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) <= a.radius + b.radius;

  function drawEmoji(ctx, emoji, x, y, size, options = {}) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(options.rotation || 0);
    ctx.globalAlpha = options.alpha ?? 1;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    ctx.fillText(emoji, 0, options.offsetY || 0);
    ctx.restore();
  }

  class Input {
    constructor(canvas) {
      this.canvas = canvas;
      this.keys = new Set();
      this.virtual = new Set();
      this.pointer = { x: 0, y: 0, down: false, pressed: false };
      this.actionPressed = false;
      this.mapper = null;
      this.onPause = null;
      this.onRestart = null;
      this.bind();
    }

    bind() {
      const blocked = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"]);
      window.addEventListener("keydown", (event) => {
        if (blocked.has(event.code)) event.preventDefault();
        this.keys.add(event.code);
        if (!event.repeat && ["Space", "Enter"].includes(event.code)) this.actionPressed = true;
        if (!event.repeat && ["KeyP", "Escape"].includes(event.code)) this.onPause?.();
        if (!event.repeat && event.code === "KeyR") this.onRestart?.();
      });
      window.addEventListener("keyup", (event) => this.keys.delete(event.code));
      window.addEventListener("blur", () => this.clear());

      const mapPointer = (event) => {
        if (!this.mapper) return;
        const point = this.mapper(event.clientX, event.clientY);
        this.pointer.x = point.x;
        this.pointer.y = point.y;
      };
      this.canvas.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        this.canvas.focus({ preventScroll: true });
        this.canvas.setPointerCapture?.(event.pointerId);
        mapPointer(event);
        this.pointer.down = true;
        this.pointer.pressed = true;
      });
      this.canvas.addEventListener("pointermove", (event) => {
        if (this.pointer.down) mapPointer(event);
      });
      const release = () => { this.pointer.down = false; };
      this.canvas.addEventListener("pointerup", release);
      this.canvas.addEventListener("pointercancel", release);

      document.querySelectorAll("[data-control]").forEach((button) => {
        const control = button.dataset.control;
        const activate = (event) => {
          event.preventDefault();
          button.setPointerCapture?.(event.pointerId);
          this.virtual.add(control);
          button.classList.add("is-active");
          if (control === "action") this.actionPressed = true;
        };
        const deactivate = () => {
          this.virtual.delete(control);
          button.classList.remove("is-active");
        };
        button.addEventListener("pointerdown", activate);
        button.addEventListener("pointerup", deactivate);
        button.addEventListener("pointercancel", deactivate);
        button.addEventListener("lostpointercapture", deactivate);
      });
    }

    movement(origin) {
      let x = 0;
      let y = 0;
      if (this.down("ArrowLeft", "KeyA", "left")) x -= 1;
      if (this.down("ArrowRight", "KeyD", "right")) x += 1;
      if (this.down("ArrowUp", "KeyW", "up")) y -= 1;
      if (this.down("ArrowDown", "KeyS", "down")) y += 1;
      if (x === 0 && y === 0 && origin && this.pointer.down) {
        x = this.pointer.x - origin.x;
        y = this.pointer.y - origin.y;
        if (Math.hypot(x, y) < 10) return { x: 0, y: 0 };
      }
      const length = Math.hypot(x, y);
      return length ? { x: x / length, y: y / length } : { x: 0, y: 0 };
    }

    down(...codes) {
      return codes.some((code) => this.keys.has(code) || this.virtual.has(code));
    }

    consumeAction() {
      const pressed = this.actionPressed;
      this.actionPressed = false;
      return pressed;
    }

    consumePointer() {
      if (!this.pointer.pressed) return null;
      this.pointer.pressed = false;
      return { x: this.pointer.x, y: this.pointer.y };
    }

    clear() {
      this.keys.clear();
      this.virtual.clear();
      this.pointer.down = false;
      this.pointer.pressed = false;
      this.actionPressed = false;
      document.querySelectorAll(".is-active").forEach((element) => element.classList.remove("is-active"));
    }
  }

  function mount(game) {
    const canvas = document.querySelector("#game-canvas");
    const ctx = canvas.getContext("2d", { alpha: false });
    const input = new Input(canvas);
    const hud = document.querySelector("#hud");
    const overlay = document.querySelector("#overlay");
    const overlayTitle = document.querySelector("#overlay-title");
    const overlayMessage = document.querySelector("#overlay-message");
    const overlayAction = document.querySelector("#overlay-action");
    const pauseButton = document.querySelector("#pause-button");
    const restartButton = document.querySelector("#restart-button");
    const title = document.querySelector("#title");
    const instructions = document.querySelector("#instructions");
    let state = game.create(WORLD);
    let lastTime = performance.now();
    let accumulator = 0;
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    let cssWidth = 1;
    let cssHeight = 1;
    let dpr = 1;
    let hudSignature = "";

    title.textContent = game.title;
    document.title = `${game.title} – Genre-Beispiel`;
    instructions.textContent = game.instructions;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      cssWidth = Math.max(1, rect.width);
      cssHeight = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      scale = Math.min(cssWidth / WORLD.width, cssHeight / WORLD.height);
      offsetX = (cssWidth - WORLD.width * scale) / 2;
      offsetY = (cssHeight - WORLD.height * scale) / 2;
    };
    input.mapper = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      return { x: (clientX - rect.left - offsetX) / scale, y: (clientY - rect.top - offsetY) / scale };
    };

    const startOrContinue = () => {
      if (["ready", "paused"].includes(state.status)) state.status = "running";
      else if (["won", "lost"].includes(state.status)) restart();
      canvas.focus({ preventScroll: true });
    };
    const togglePause = () => {
      if (state.status === "running") state.status = "paused";
      else if (state.status === "paused") state.status = "running";
      input.clear();
    };
    const restart = () => {
      state = game.create(WORLD);
      state.status = "running";
      accumulator = 0;
      input.clear();
      canvas.focus({ preventScroll: true });
    };

    input.onPause = togglePause;
    input.onRestart = restart;
    overlayAction.addEventListener("click", startOrContinue);
    pauseButton.addEventListener("click", togglePause);
    restartButton.addEventListener("click", restart);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && state.status === "running") togglePause();
    });
    if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
    window.addEventListener("resize", resize);
    resize();

    const frame = (now) => {
      const delta = Math.min(Math.max((now - lastTime) / 1000, 0), 0.05);
      lastTime = now;
      if (state.status === "running") {
        accumulator += delta;
        while (accumulator >= 1 / 60) {
          game.update(state, 1 / 60, input, WORLD);
          accumulator -= 1 / 60;
        }
      } else {
        accumulator = 0;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#050817";
      ctx.fillRect(0, 0, cssWidth, cssHeight);
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);
      game.draw(ctx, state, WORLD);
      ctx.restore();
      updateUi();
      requestAnimationFrame(frame);
    };

    const updateUi = () => {
      const hudEntries = game.hud(state);
      const nextHudSignature = JSON.stringify(hudEntries);
      if (nextHudSignature !== hudSignature) {
        hud.replaceChildren(...hudEntries.map(({ label, value }) => {
          const item = document.createElement("div");
          item.className = "hud-item";
          const caption = document.createElement("span");
          const strong = document.createElement("strong");
          caption.textContent = label;
          strong.textContent = value;
          item.append(caption, strong);
          return item;
        }));
        hudSignature = nextHudSignature;
      }
      pauseButton.textContent = state.status === "paused" ? "Weiter" : "Pause";
      pauseButton.disabled = !["running", "paused"].includes(state.status);
      if (state.status === "running") {
        overlay.hidden = true;
        return;
      }
      overlay.hidden = false;
      const copy = game.overlay(state);
      overlayTitle.textContent = copy.title;
      overlayMessage.textContent = copy.message;
      overlayAction.textContent = copy.action;
    };

    updateUi();
    requestAnimationFrame(frame);
  }

  window.ExampleKit = { WORLD, clamp, circlesHit, drawEmoji, mount };
})();
