(function () {
  "use strict";
  const { drawEmoji, clamp } = window.ExampleKit;
  const W = 960, H = 600, groundY = 445;
  function buildPlatforms(level) {
    const platforms = [{ x: 0, w: 360 }]; let x = 360;
    for (let i = 0; i < 7; i += 1) { const gap = 85 + level * 7 + ((level * 37 + i * 29) % 75); const width = Math.max(125, 260 - level * 6 + ((level * 23 + i * 41) % 105)); x += gap; platforms.push({ x, w: width }); x += width; }
    platforms.push({ x, w: 300 }); return platforms;
  }
  function buildCoins(level, platforms) { return platforms.slice(0, -1).map((p, i) => ({ x: p.x + Math.min(p.w - 35, 75 + ((level * 17 + i * 31) % 80)), y: groundY - 58, collected: false })); }
  function buildOpponents(level, platforms) { return platforms.slice(1, -1).map((p, i) => ({ x: p.x + Math.min(p.w - 42, 60 + ((level + i) * 29) % 90), y: groundY - 38, speed: 28 + level * 2, phase: i * 1.4, tagged: false })); }
  const reset = () => { const platforms = buildPlatforms(1); return { status: "ready", level: 1, rider: { x: 150, y: groundY - 38, vy: 0, radius: 28, grounded: true, jumpsLeft: 2, rotation: 0 }, camera: 0, distance: 0, jumps: 0, flips: 0, falls: 0, time: 0, coins: 0, shots: [], tagged: 0, platforms, pickups: buildCoins(1, platforms), opponents: buildOpponents(1, platforms) }; };
  function platformAt(state, x) { return state.platforms.find((p) => x >= p.x && x <= p.x + p.w); }
  function update(state, dt, input) {
    const r = state.rider; state.time += dt;
    const move = input.movement({ x: r.x, y: r.y });
    const speed = 175 + state.level * 6 + Math.max(0, move.x) * 55;
    r.x += speed * dt; state.distance = Math.max(state.distance, Math.floor(r.x / 10));
    if (input.consumeAction() && r.jumpsLeft > 0) { r.vy = -470; r.grounded = false; r.jumpsLeft -= 1; state.jumps += 1; }
    if (input.down("KeyA", "shoot") && !state.lastShot) { state.shots.push({ x: r.x + 35, y: r.y, vx: 480, life: 2 }); state.lastShot = true; }
    if (!input.down("KeyA", "shoot")) state.lastShot = false;
    r.vy += 1050 * dt; r.y += r.vy * dt;
    const platform = platformAt(state, r.x);
    if (!r.grounded) { if (input.down("ArrowUp", "KeyW")) r.rotation -= 5 * dt; if (input.down("ArrowDown", "KeyS")) r.rotation += 5 * dt; }
    if (platform && r.y >= groundY - 38 && r.vy >= 0) { r.y = groundY - 38; r.vy = 0; r.grounded = true; r.jumpsLeft = 2; } else if (r.y > H + 70) { state.falls += 1; r.x = Math.max(150, r.x - 180); r.y = groundY - 38; r.vy = 0; r.grounded = true; r.jumpsLeft = 2; }
    if (r.grounded && Math.abs(r.rotation) >= Math.PI * 2) { state.flips += Math.floor(Math.abs(r.rotation) / (Math.PI * 2)); r.rotation = 0; }
    if (r.grounded) r.rotation = 0;
    for (const coin of state.pickups) if (!coin.collected && Math.hypot(r.x - coin.x, r.y - coin.y) < 48) { coin.collected = true; state.coins += 1; }
    for (const opponent of state.opponents) { if (opponent.tagged) continue; opponent.x += opponent.speed * dt; opponent.y = groundY - 38 + Math.sin(state.time * 3 + opponent.phase) * 2; }
    for (const shot of state.shots) { shot.x += shot.vx * dt; shot.life -= dt; for (const opponent of state.opponents) if (!opponent.tagged && Math.hypot(shot.x - opponent.x, shot.y - opponent.y) < 42) { opponent.tagged = true; state.tagged += 1; shot.life = 0; } }
    state.shots = state.shots.filter((shot) => shot.life > 0 && shot.x < state.rider.x + 1000);
    const lastPlatform = state.platforms[state.platforms.length - 1];
    state.camera = clamp(r.x - 180, 0, Math.max(0, lastPlatform.x + lastPlatform.w - W));
    const finish = state.platforms[state.platforms.length - 1].x + state.platforms[state.platforms.length - 1].w - 45;
    if (r.x >= finish) {
      if (state.level >= 18) state.status = "won";
      else { state.level += 1; state.platforms = buildPlatforms(state.level); state.pickups = buildCoins(state.level, state.platforms); state.opponents = buildOpponents(state.level, state.platforms); state.tagged = 0; state.shots = []; r.x = 150; r.y = groundY - 38; r.vy = 0; r.grounded = true; r.jumpsLeft = 2; r.rotation = 0; state.camera = 0; }
    }
    if (state.falls >= 3) state.status = "lost";
  }
  const motorcycleSprites = new Map();
  function getOpaqueMotorcycle(size) {
    if (motorcycleSprites.has(size)) return motorcycleSprites.get(size);
    const padding = Math.ceil(size * 0.25);
    const extent = size + padding * 2;
    const canvas = document.createElement("canvas");
    canvas.width = extent;
    canvas.height = extent;
    const spriteContext = canvas.getContext("2d");
    spriteContext.globalAlpha = 1;
    spriteContext.textAlign = "center";
    spriteContext.textBaseline = "middle";
    spriteContext.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    spriteContext.fillText("🏍️", extent / 2, extent / 2);
    try {
      const pixels = spriteContext.getImageData(0, 0, extent, extent);
      for (let index = 3; index < pixels.data.length; index += 4) {
        if (pixels.data[index] > 0) pixels.data[index] = 255;
      }
      spriteContext.putImageData(pixels, 0, 0);
    } catch (_) {
      // Drawing the original emoji still works if pixel access is unavailable.
    }
    const sprite = { canvas, extent };
    motorcycleSprites.set(size, sprite);
    return sprite;
  }
  function drawMotorcycle(ctx, x, y, size, rotation = 0) {
    const sprite = getOpaqueMotorcycle(size);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(-1, 1);
    ctx.globalAlpha = 1;
    ctx.drawImage(sprite.canvas, -sprite.extent / 2, -sprite.extent / 2);
    ctx.restore();
  }
  function draw(ctx, state) {
    const cam = state.camera; const palettes = [["#80c9e6", "#4d9c61", "#b8e36c"], ["#f39a72", "#9b5b4f", "#e4a15b"], ["#7569bd", "#40526f", "#8e9fd2"], ["#55b5a2", "#39765d", "#92d36e"]]; const palette = palettes[(state.level - 1) % palettes.length]; ctx.fillStyle = "#ffcf7a"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = palette[0]; ctx.fillRect(0, 0, W, 330);
    ctx.fillStyle = "#fff3c4"; ctx.beginPath(); ctx.arc(790, 90, 45, 0, Math.PI * 2); ctx.fill();
    for (const p of state.platforms) { const x = p.x - cam; if (x + p.w < 0 || x > W) continue; ctx.fillStyle = palette[1]; ctx.fillRect(x, groundY, p.w, H - groundY); ctx.fillStyle = palette[2]; ctx.fillRect(x, groundY, p.w, 18); }
    for (let x = 0; x < W; x += 120) { ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(x - (cam % 120), 165 + ((x / 120) % 3) * 35, 52, 8); }
    for (const coin of state.pickups) if (!coin.collected && coin.x - cam > -30 && coin.x - cam < W + 30) drawEmoji(ctx, "🪙", coin.x - cam, coin.y, 30);
    for (const shot of state.shots) { ctx.fillStyle = "#ffda5c"; ctx.beginPath(); ctx.arc(shot.x - cam, shot.y, 9, 0, Math.PI * 2); ctx.fill(); }
    for (const opponent of state.opponents) if (opponent.x - cam > -40 && opponent.x - cam < W + 40) {
      if (opponent.tagged) drawEmoji(ctx, "✨", opponent.x - cam, opponent.y, 52);
      else drawMotorcycle(ctx, opponent.x - cam, opponent.y, 52);
    }
    const rx = state.rider.x - cam; drawMotorcycle(ctx, rx, state.rider.y, 58, state.rider.rotation);
    ctx.fillStyle = "#15364a"; ctx.font = 'bold 20px "Trebuchet MS", sans-serif'; ctx.textAlign = "center"; ctx.fillText("MOTORRAD-SPRUNG", 480, 32);
    const finish = state.platforms[state.platforms.length - 1].x + state.platforms[state.platforms.length - 1].w - 45;
    ctx.fillStyle = "#15364a"; ctx.font = "bold 18px sans-serif"; ctx.fillText("ZIEL", finish - cam, 405);
  }
  window.ExampleKit.mount({
    title: "Motorrad-Sprung", instructions: "Pfeiltasten bewegen · Leertaste oder Enter springen · A schießt Markierkugeln · W/S drehen für Saltos. Auf Mobilgeräten stehen Touch-Tasten bereit.", create: reset, update, draw,
    hud: (s) => [{ label: "Level", value: `${s.level} / 18` }, { label: "Münzen", value: s.coins }, { label: "Gegner markiert", value: s.tagged }, { label: "Stürze", value: `${s.falls} / 3` }],
    overlay: (s) => s.status === "ready" ? { title: "Auf die Strecke!", message: "Fahre los und springe über die Abhänge.", action: "Starten" } : s.status === "won" ? { title: "Alle 18 Levels geschafft!", message: "Du hast die komplette Sprungstrecke gemeistert.", action: "Nochmal fahren" } : s.status === "lost" ? { title: "Strecke vorbei", message: "Drei Stürze — versuche es erneut.", action: "Nochmal fahren" } : { title: "Pause", message: "Die Fahrt ist pausiert.", action: "Weiterfahren" }
  });
})();
