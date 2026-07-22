(function () {
  "use strict";
  const { mount, clamp, drawEmoji } = window.ExampleKit;
  const LEVELS = [
    { width: 2100, start: { x: 80, y: 420 }, platforms: [[0,520,520,80],[590,470,210,30],[860,405,180,30],[1100,500,300,80],[1470,430,180,30],[1710,360,170,30],[1940,500,160,80]], bales: [[280,478],[650,428],[930,363],[1220,458],[1530,388],[1765,318]] },
    { width: 2350, start: { x: 70, y: 430 }, platforms: [[0,520,360,80],[420,455,160,30],[650,385,170,30],[900,470,260,30],[1240,400,150,30],[1460,330,160,30],[1690,430,190,30],[1950,490,400,110]], bales: [[190,478],[470,413],[705,343],[1010,428],[1285,358],[1510,288],[1750,388],[2110,448]] },
    { width: 2600, start: { x: 70, y: 430 }, platforms: [[0,520,300,80],[370,455,130,30],[560,390,130,30],[750,330,130,30],[950,420,220,30],[1240,500,260,80],[1580,425,140,30],[1780,355,140,30],[1990,430,180,30],[2240,500,360,80]], bales: [[180,478],[410,413],[600,348],[790,288],[1030,378],[1350,458],[1620,383],[1820,313],[2040,388],[2380,458]] },
  ];
  function create() {
    return {
      status: "ready", level: 0, lives: 3, score: 0, camera: 0,
      player: { x: 80, y: 420, w: 42, h: 46, vx: 0, vy: 0, grounded: false, facing: 1 },
      fireballs: [], fireCooldown: 0,
      bales: LEVELS.map((level) => level.bales.map(([x, y]) => ({ x, y: y - 6, w: 56, h: 48, state: "dry", burn: 0 }))),
    };
  }
  function resetPlayer(state) {
    const start = LEVELS[state.level].start;
    Object.assign(state.player, { x: start.x, y: start.y, vx: 0, vy: 0, grounded: false });
    state.fireballs.length = 0;
  }
  function restoreBales(state) {
    for (const bale of state.bales[state.level]) {
      bale.state = "dry";
      bale.burn = 0;
    }
  }
  function overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
  function drawBale(ctx, bale, camera) {
    const left = bale.x - camera;
    const centerX = left + bale.w / 2;
    const centerY = bale.y + bale.h / 2;
    ctx.save();
    if (bale.state === "burnt") {
      ctx.fillStyle = "#211218";
      ctx.fillRect(left + 2, bale.y + 7, bale.w - 4, bale.h - 9);
      ctx.strokeStyle = "#5b3328";
    } else {
      ctx.fillStyle = "#d99024";
      ctx.fillRect(left, bale.y + 4, bale.w, bale.h - 6);
      ctx.fillStyle = "#f2bd45";
      ctx.fillRect(left + 5, bale.y, bale.w - 10, bale.h);
      ctx.strokeStyle = "#ffe08a";
      ctx.lineWidth = 2;
      for (let y = bale.y + 7; y < bale.y + bale.h - 4; y += 7) {
        ctx.beginPath();
        ctx.moveTo(left + 5, y);
        ctx.lineTo(left + bale.w - 5, y - 4);
        ctx.stroke();
      }
      ctx.strokeStyle = "#75401d";
    }
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(left + bale.w / 3, bale.y + 2); ctx.lineTo(left + bale.w / 3, bale.y + bale.h - 2);
    ctx.moveTo(left + bale.w * 2 / 3, bale.y + 2); ctx.lineTo(left + bale.w * 2 / 3, bale.y + bale.h - 2);
    ctx.stroke();
    if (bale.state !== "burnt") {
      ctx.fillStyle = "#fff0a8";
      ctx.font = 'bold 12px ui-monospace, "Cascadia Mono", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("STROH", centerX, centerY);
    }
    ctx.restore();
    if (bale.state === "burning") drawEmoji(ctx, "🔥", centerX, centerY - 21, 39);
  }
  function update(state, dt, input, world) {
    const level = LEVELS[state.level];
    const p = state.player;
    const move = input.movement();
    p.vx += move.x * 1100 * dt;
    p.vx *= Math.pow(0.001, dt);
    p.vx = clamp(p.vx, -260, 260);
    if (Math.abs(move.x) > 0.1) p.facing = Math.sign(move.x);
    const jump = input.down("ArrowUp", "KeyW", "up");
    if (jump && p.grounded) { p.vy = -560; p.grounded = false; }
    state.fireCooldown = Math.max(0, state.fireCooldown - dt);
    if (input.consumeAction() && state.fireCooldown === 0) {
      state.fireballs.push({ x: p.x + p.w / 2 + p.facing * 18, y: p.y + 18, w: 24, h: 20, vx: p.facing * 520, life: 1.35 });
      state.fireCooldown = 0.28;
    }
    p.x = clamp(p.x + p.vx * dt, 0, level.width - p.w);
    const previousBottom = p.y + p.h;
    p.vy += 1450 * dt;
    p.y += p.vy * dt;
    p.grounded = false;
    for (const [x, y, w] of level.platforms) {
      if (p.vy >= 0 && previousBottom <= y && p.y + p.h >= y && p.x + p.w > x && p.x < x + w) {
        p.y = y - p.h; p.vy = 0; p.grounded = true;
      }
    }
    const bales = state.bales[state.level];
    for (const fireball of state.fireballs) {
      fireball.x += fireball.vx * dt;
      fireball.life -= dt;
      for (const bale of bales) {
        if (bale.state === "dry" && overlaps(fireball, bale)) {
          bale.state = "burning";
          bale.burn = 1.25;
          fireball.life = 0;
          state.score += 100;
          break;
        }
      }
    }
    state.fireballs = state.fireballs.filter((fireball) => fireball.life > 0 && fireball.x > -40 && fireball.x < level.width + 40);
    for (const bale of bales) {
      if (bale.state !== "burning") continue;
      bale.burn -= dt;
      if (bale.burn <= 0) bale.state = "burnt";
    }
    if (p.y > world.height + 120) {
      state.lives -= 1;
      if (state.lives <= 0) state.status = "lost";
      else { restoreBales(state); resetPlayer(state); }
    }
    if (p.x > level.width - 90) {
      state.score += 500;
      if (state.level === LEVELS.length - 1) state.status = "won";
      else { state.level += 1; resetPlayer(state); }
    }
    state.camera = clamp(p.x - 260, 0, level.width - world.width);
  }
  function draw(ctx, state, world) {
    const level = LEVELS[state.level];
    const gradient = ctx.createLinearGradient(0, 0, 0, world.height); gradient.addColorStop(0, "#4b1832"); gradient.addColorStop(.58, "#b84d2b"); gradient.addColorStop(1, "#2a1014");
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, world.width, world.height);
    ctx.fillStyle = "rgba(255,199,91,.18)";
    for (let i = 0; i < 11; i += 1) { const x = ((i * 245 - state.camera * .18) % 1400 + 1400) % 1400 - 120; ctx.beginPath(); ctx.moveTo(x, 280); ctx.lineTo(x + 90, 110 + i % 3 * 38); ctx.lineTo(x + 180, 280); ctx.closePath(); ctx.fill(); }
    for (const [x, y, w, h] of level.platforms) { ctx.fillStyle = "#2b1820"; ctx.fillRect(x - state.camera, y, w, h); ctx.fillStyle = "#ef8d3c"; ctx.fillRect(x - state.camera, y, w, 8); ctx.fillStyle = "rgba(255,207,105,.2)"; ctx.fillRect(x - state.camera, y + 8, w, 6); }
    for (const bale of state.bales[state.level]) {
      drawBale(ctx, bale, state.camera);
    }
    for (const fireball of state.fireballs) drawEmoji(ctx, "🔥", fireball.x - state.camera + fireball.w / 2, fireball.y + fireball.h / 2, 27);
    const flagX = level.width - 60 - state.camera; drawEmoji(ctx, "🏁", flagX + 18, 380, 58);
    const p = state.player;
    const playerX = p.x - state.camera + p.w / 2;
    const playerY = p.y + p.h / 2;
    ctx.save();
    ctx.shadowColor = "#ffd36e";
    ctx.shadowBlur = 16;
    if ("filter" in ctx) ctx.filter = "saturate(1.85) brightness(1.2) contrast(1.12)";
    drawEmoji(ctx, "🦂", playerX, playerY, 70, { rotation: p.facing < 0 ? -.08 : .08 });
    ctx.restore();
  }
  mount({ title: "scorpys", instructions: "A/D oder Pfeile = laufen · W/Pfeil hoch = springen · Leertaste = Schwanzfeuer", create, update, draw,
    hud: (s) => { const bales = s.bales[s.level]; return [{label:"Level",value:`${s.level+1} / ${LEVELS.length}`},{label:"Leben",value:"●".repeat(s.lives)},{label:"Punkte",value:String(s.score)},{label:"Glut",value:`${bales.filter((bale) => bale.state !== "dry").length} / ${bales.length}`},{label:"Fortschritt",value:`${Math.floor(s.player.x/LEVELS[s.level].width*100)} %`}]; },
    overlay: (s) => s.status === "ready" ? {title:"Die Glutpfade rufen",message:"Springe durch drei Dünen-Level, entzünde Strohballen mit Schwanzfeuer und erreiche die Flaggen.",action:"Aufbrechen"} : s.status === "paused" ? {title:"Glut bewahren",message:"Der Skorpion wartet im Schutz der Dünen.",action:"Weiterziehen"} : s.status === "won" ? {title:"Alle Dünen bezwungen",message:`${s.score} Punkte und ${s.lives} Leben übrig.`,action:"Neue Spur"} : {title:"Im Sand versunken",message:"Versuche die Sprünge und Feuerstöße noch einmal.",action:"Neu starten"}
  });
})();
