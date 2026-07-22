(function () {
  "use strict";
  const { mount, clamp, circlesHit, drawEmoji } = window.ExampleKit;
  const MAX_LEVELS = 100;
  const walls = [
    { x: 0, y: 0, w: 960, h: 24 }, { x: 0, y: 576, w: 960, h: 24 },
    { x: 0, y: 0, w: 24, h: 600 }, { x: 936, y: 0, w: 24, h: 600 },
    { x: 210, y: 24, w: 28, h: 350 }, { x: 210, y: 350, w: 330, h: 28 },
    { x: 470, y: 155, w: 28, h: 195 }, { x: 620, y: 155, w: 28, h: 421 },
    { x: 720, y: 290, w: 216, h: 28 },
  ];
  function makeTrolls(level) {
    const trolls = [];
    for (let i = 0; i < Math.min(MAX_LEVELS, level + 1); i += 1) trolls.push({ x: 330 + (i * 97) % 540, y: 100 + (i * 137) % 390, radius: 19, health: 1 + Math.floor(level / 10), vx: i % 2 ? -1 : 1, vy: i % 3 ? 1 : -1, turnTime: 0.8 + i * 0.25 });
    return trolls;
  }
  function makeDogs(level) {
    if (level < 5) return [];
    return Array.from({ length: Math.min(6, level - 4) }, (_, i) => ({ x: 380 + (i * 151) % 430, y: 180 + (i * 113) % 300, radius: 17, vx: i % 2 ? -1 : 1, vy: i % 3 ? -1 : 1, turnTime: 1.1 + i * 0.3 }));
  }
  function create() {
    return { status: "ready", level: 1, levelMessage: false, player: { x: 78, y: 80, radius: 17, health: 3, attackCooldown: 0 }, key: { x: 850, y: 500, radius: 14, collected: false }, exit: { x: 840, y: 55, w: 62, h: 72 }, time: 55, score: 0, trolls: makeTrolls(1), dogs: makeDogs(1), slowTime: 0 };
  }
  function resetLevel(state) { state.player.x = 78; state.player.y = 80; state.player.health = 3; state.player.attackCooldown = 0; state.key.collected = false; state.time = Math.max(35, 60 - state.level * 3); state.trolls = makeTrolls(state.level); state.dogs = makeDogs(state.level); state.slowTime = 0; state.status = "paused"; }
  function circleTouchesRect(circle, rect) { const x = clamp(circle.x, rect.x, rect.x + rect.w); const y = clamp(circle.y, rect.y, rect.y + rect.h); return Math.hypot(circle.x - x, circle.y - y) < circle.radius; }
  function movePlayer(player, dx, dy) { player.x += dx; if (walls.some((w) => circleTouchesRect(player, w))) player.x -= dx; player.y += dy; if (walls.some((w) => circleTouchesRect(player, w))) player.y -= dy; }
  function update(state, dt, input) {
    if (state.status === "running") state.levelMessage = false;
    state.time = Math.max(0, state.time - dt); state.player.attackCooldown = Math.max(0, state.player.attackCooldown - dt);
    state.slowTime = Math.max(0, state.slowTime - dt);
    const movement = input.movement(state.player); movePlayer(state.player, movement.x * (state.slowTime > 0 ? 75 : 145) * dt, movement.y * (state.slowTime > 0 ? 75 : 145) * dt);
    for (const troll of state.trolls) { troll.turnTime -= dt; if (troll.turnTime <= 0) { const angle = Math.random() * Math.PI * 2; troll.vx = Math.cos(angle); troll.vy = Math.sin(angle); troll.turnTime = 0.7 + Math.random() * 1.4; } troll.x += troll.vx * (30 + state.level * 2) * dt; troll.y += troll.vy * (30 + state.level * 2) * dt; if (troll.x < 55 || troll.x > 900) troll.vx *= -1; if (troll.y < 55 || troll.y > 545) troll.vy *= -1; if (circlesHit(state.player, troll)) state.player.health -= dt * 0.35; }
    for (const dog of state.dogs) { dog.turnTime -= dt; if (dog.turnTime <= 0) { const angle = Math.random() * Math.PI * 2; dog.vx = Math.cos(angle); dog.vy = Math.sin(angle); dog.turnTime = 0.6 + Math.random() * 1.1; } dog.x += dog.vx * (40 + state.level * 2) * dt; dog.y += dog.vy * (40 + state.level * 2) * dt; if (dog.x < 55 || dog.x > 900) dog.vx *= -1; if (dog.y < 55 || dog.y > 545) dog.vy *= -1; if (circlesHit(state.player, dog)) { state.player.health -= dt * 0.55; state.slowTime = 2.2; } }
    if (input.consumeAction() && state.player.attackCooldown <= 0) { state.player.attackCooldown = 0.45; for (const troll of state.trolls) if (circlesHit({ ...state.player, radius: 54 }, troll)) troll.health -= 1; state.trolls = state.trolls.filter((t) => t.health > 0); state.score += 75; }
    if (state.player.health <= 0 || state.time <= 0) state.status = "lost";
    if (!state.key.collected && circlesHit(state.player, state.key)) { state.key.collected = true; state.score += 300; }
    const exitCenter = { x: state.exit.x + state.exit.w / 2, y: state.exit.y + state.exit.h / 2, radius: 31 };
    if (state.key.collected && circlesHit(state.player, exitCenter)) { state.score += Math.ceil(state.time) * 10; if (state.level >= MAX_LEVELS) state.status = "won"; else { state.level += 1; resetLevel(state); state.levelMessage = true; } }
  }
  function draw(ctx, state, world) {
    const gradient = ctx.createLinearGradient(0, 0, world.width, world.height); gradient.addColorStop(0, "#321c4d"); gradient.addColorStop(1, "#130d20"); ctx.fillStyle = gradient; ctx.fillRect(0, 0, world.width, world.height);
    ctx.fillStyle = state.key.collected ? "#56c7b2" : "#432c68"; ctx.fillRect(state.exit.x, state.exit.y, state.exit.w, state.exit.h); ctx.strokeStyle = "#ffd166"; ctx.lineWidth = 5; ctx.strokeRect(state.exit.x + 7, state.exit.y + 7, state.exit.w - 14, state.exit.h - 14); drawEmoji(ctx, state.key.collected ? "🚪✨" : "🚪🔒", state.exit.x + 31, state.exit.y + 36, 43);
    ctx.fillStyle = "#603a7f"; ctx.shadowColor = "rgba(255, 95, 162, .35)"; ctx.shadowBlur = 12; walls.forEach((w) => ctx.fillRect(w.x, w.y, w.w, w.h)); ctx.shadowBlur = 0;
    if (!state.key.collected) drawEmoji(ctx, "🗝️", state.key.x, state.key.y, 38); state.trolls.forEach((t) => drawEmoji(ctx, "👾", t.x, t.y, 42)); state.dogs.forEach((d) => drawEmoji(ctx, "🐕", d.x, d.y, 38)); drawEmoji(ctx, "👹", state.player.x, state.player.y, 42);
    if (state.player.attackCooldown > 0.25) { ctx.strokeStyle = "#ffd166"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(state.player.x, state.player.y, 43, -0.8, 0.8); ctx.stroke(); }
  }
  mount({ title: "Superfight", instructions: "WASD/Pfeile · Axtschlag mit Leertaste/Aktion · Schlüssel finden · Ausgang erreichen · P Pause · R Neustart", create, update, draw,
    hud: (s) => [{ label: "Level", value: `${s.level} / ${MAX_LEVELS}` }, { label: "Schlüssel", value: s.key.collected ? "gefunden" : "fehlt" }, { label: "Zeit", value: String(Math.ceil(s.time)) }, { label: "Punkte", value: String(s.score) }, { label: "Ork-Herzen", value: String(Math.max(0, Math.ceil(s.player.health))) }, { label: "Trolle", value: String(s.trolls.length) }, { label: "Hunde", value: String(s.dogs.length) }, { label: "Status", value: s.status === "running" ? "unterwegs" : s.status }],
    overlay: (s) => { if (s.status === "ready") return { title: "Superfight startet", message: "100 Level warten: Schlüssel finden, Gegner abwehren und den Ausgang erreichen.", action: "Los geht's" }; if (s.status === "paused") return s.levelMessage ? { title: `Level ${s.level - 1} geschafft`, message: `Bereit für Level ${s.level}?`, action: "Weiter" } : { title: "Pause", message: `Level ${s.level} wartet.`, action: "Weiter" }; if (s.status === "won") return { title: "Alle 100 Level geschafft", message: `${s.score} Punkte – Superfight hat die Höhlen bezwungen.`, action: "Noch einmal" }; return { title: "Der Ork braucht eine Pause", message: `Level ${s.level} war zu stark. Starte neu und halte die Axt bereit.`, action: "Neu starten" }; }
  });
})();
