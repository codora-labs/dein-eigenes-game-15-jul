(function () {
  "use strict";
  const { drawEmoji, clamp, mount } = window.ExampleKit;
  const W = 960, GROUND = 468;
  const format = (seconds) => `${seconds.toFixed(2)} s`;
  const loadBest = () => {
    try {
      const value = Number(window.localStorage.getItem("horses-best") || 0);
      return Number.isFinite(value) ? value : 0;
    } catch (_) {
      return 0;
    }
  };
  const saveBest = (value) => {
    try {
      window.localStorage.setItem("horses-best", String(value));
    } catch (_) {
      // Records remain available for this run when storage is disabled.
    }
  };
  const game = {
    title: "Horses",
    instructions: "Leertaste oder ↑: springen · P: Pause · R: Neustart",
    create() {
      return { status: "ready", time: 0, best: loadBest(), distance: 0, level: 1, speed: 260, jumps: 0, jumpCount: 0, jumpHeld: false, grooming: 0, brushIndex: 0, brushActive: 0, carrots: 0, horse: { y: GROUND - 58, vy: 0 }, obstacles: [], dogs: [], carrotsOnTrack: [], nextObstacle: 1.25, nextDog: 4.5, nextCarrot: 1.8, stripe: 0 };
    },
    update(s, dt, input) {
      const jumpDown = input.down("ArrowUp", "Space");
      const jumpPressed = input.consumeAction() || (jumpDown && !s.jumpHeld);
      s.jumpHeld = jumpDown;
      if (s.grooming < 5) {
        if (input.down("ArrowLeft")) s.brushIndex = (s.brushIndex + 2) % 3;
        if (input.down("ArrowRight")) s.brushIndex = (s.brushIndex + 1) % 3;
        if (jumpPressed) s.brushActive = 1.1;
        if (s.brushActive > 0) { s.brushActive -= dt; s.grooming = Math.min(5, s.grooming + dt * 2.2); }
        return;
      }
      if (jumpPressed && s.jumpCount < 2) { s.horse.vy = -690; s.jumpCount += 1; s.jumps += 1; }
      s.time += dt; s.distance += s.speed * dt; s.level = 1 + Math.floor(s.distance / 1200); s.speed = Math.min(760, 260 + s.time * 7 + s.level * 4); s.stripe = (s.stripe + s.speed * dt) % 80; s.nextObstacle -= dt; s.nextDog -= dt; s.nextCarrot -= dt;
      if (s.nextObstacle <= 0) { s.obstacles.push({ x: W + 30, w: 38 + Math.random() * 30, h: 42 + Math.random() * 35 }); s.nextObstacle = Math.max(.48, 1.45 - s.level * .035) + Math.random() * .5; }
      if (s.nextDog <= 0) { s.dogs.push({ x: W + 30, y: GROUND - 55, baseY: GROUND - 55, phase: Math.random() * 6.28, bark: 0 }); s.nextDog = 6 + Math.random() * 4; }
      if (s.nextCarrot <= 0) { s.carrotsOnTrack.push({ x: W + 30, y: GROUND - 78 - Math.random() * 105, bob: Math.random() * Math.PI * 2 }); s.nextCarrot = 1.05 + Math.random() * 1.15; }
      s.horse.vy += 1700 * dt; s.horse.y += s.horse.vy * dt;
      if (s.horse.y > GROUND - 59) { s.horse.y = GROUND - 59; s.horse.vy = 0; s.jumpCount = 0; }
      for (const obstacle of s.obstacles) obstacle.x -= s.speed * dt;
      for (const dog of s.dogs) { dog.x -= s.speed * dt; dog.phase += dt * (s.level >= 6 ? 4.5 : 1); if (s.level >= 6) dog.y = dog.baseY + Math.sin(dog.phase) * 38; dog.bark = Math.max(0, dog.bark - dt); }
      for (const carrot of s.carrotsOnTrack) { carrot.x -= s.speed * dt; carrot.bob += dt * 5; }
      s.obstacles = s.obstacles.filter((o) => o.x > -100);
      s.dogs = s.dogs.filter((dog) => dog.x > -80);
      s.carrotsOnTrack = s.carrotsOnTrack.filter((carrot) => carrot.x > -60);
      const hx = 170, hy = s.horse.y + 25;
      const nearbyDog = s.dogs.find((dog) => dog.x > hx - 30 && dog.x < hx + 150);
      if (nearbyDog && jumpPressed) { nearbyDog.bark = 0.55; nearbyDog.x = -200; }
      if (s.obstacles.some((o) => o.x < hx + 35 && o.x + o.w > hx - 30 && hy > GROUND - o.h - 12)) { s.status = "lost"; }
      if (s.dogs.some((dog) => dog.x < hx + 34 && dog.x > hx - 30 && hy > dog.y - 48)) { s.status = "lost"; }
      s.carrotsOnTrack = s.carrotsOnTrack.filter((carrot) => {
        if (Math.hypot(carrot.x - hx, carrot.y - hy) < 48) { s.carrots += 1; return false; }
        return true;
      });
      if (s.status === "lost" && s.time > s.best) { s.best = s.time; saveBest(s.best); }
    },
    draw(ctx, s) {
      const sky = ctx.createLinearGradient(0, 0, 0, 600); sky.addColorStop(0, "#9bc8a0"); sky.addColorStop(1, "#f2cf89"); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, 600);
      ctx.fillStyle = "#f9d36a"; ctx.beginPath(); ctx.arc(785, 92, 42, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#688951"; ctx.beginPath(); ctx.moveTo(0, GROUND); for (let x = 0; x <= W; x += 80) ctx.lineTo(x, 385 + Math.sin(x * .02) * 26); ctx.lineTo(W, GROUND); ctx.fill();
      ctx.save(); ctx.translate(470, 0); ctx.strokeStyle = "rgba(91, 82, 66, .7)"; ctx.fillStyle = "rgba(91, 82, 66, .7)"; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(-58, 410); ctx.lineTo(-25, 282); ctx.lineTo(0, 118); ctx.lineTo(25, 282); ctx.lineTo(58, 410); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-39, 350); ctx.lineTo(39, 350); ctx.moveTo(-29, 295); ctx.lineTo(29, 295); ctx.moveTo(-14, 235); ctx.lineTo(14, 235); ctx.stroke();
      ctx.fillRect(-4, 92, 8, 26); ctx.fillRect(-15, 112, 30, 7); ctx.restore();
      ctx.fillStyle = "#b94f3e"; ctx.fillRect(650, 265, 190, 150); ctx.fillStyle = "#7d332c"; ctx.beginPath(); ctx.moveTo(630, 265); ctx.lineTo(745, 190); ctx.lineTo(860, 265); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#f4d27a"; ctx.fillRect(720, 330, 52, 85); ctx.fillStyle = "#8b3b32"; ctx.fillRect(675, 298, 46, 45); ctx.fillRect(770, 298, 46, 45);
      ctx.fillStyle = "#e8e1c6"; ctx.fillRect(862, 225, 34, 190); ctx.fillStyle = "#c34f42"; ctx.beginPath(); ctx.arc(879, 225, 17, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = "#8a5a32"; ctx.lineWidth = 7; for (let x = 35; x < 610; x += 72) { ctx.beginPath(); ctx.moveTo(x, 408); ctx.lineTo(x, 470); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(0, 430); ctx.lineTo(620, 430); ctx.moveTo(0, 455); ctx.lineTo(620, 455); ctx.stroke();
      ctx.fillStyle = "#5a3d23"; ctx.fillRect(0, GROUND, W, 132); ctx.fillStyle = "#e6bd6c"; for (let x = -s.stripe; x < W; x += 80) ctx.fillRect(x, GROUND + 18, 42, 5);
      for (const o of s.obstacles) { ctx.fillStyle = "#c85c3e"; ctx.fillRect(o.x, GROUND - o.h, o.w, o.h); ctx.fillStyle = "#f2c65a"; ctx.fillRect(o.x - 8, GROUND - o.h - 9, o.w + 16, 10); }
      for (const dog of s.dogs) { drawEmoji(ctx, "🐕", dog.x, dog.y, 48); if (dog.x > 120 && dog.x < 330) { ctx.fillStyle = "#fff7db"; ctx.font = "700 17px Georgia"; ctx.fillText("WUFF!", dog.x - 22, dog.y - 38); } }
      for (const carrot of s.carrotsOnTrack) {
        const cy = carrot.y + Math.sin(carrot.bob) * 5;
        ctx.save(); ctx.translate(carrot.x, cy); ctx.rotate(-0.18);
        ctx.fillStyle = "#f28b35"; ctx.beginPath(); ctx.moveTo(-10, -15); ctx.lineTo(10, -15); ctx.lineTo(2, 18); ctx.quadraticCurveTo(0, 24, -2, 18); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#3d8b4f"; ctx.fillRect(-12, -22, 8, 10); ctx.fillRect(-3, -25, 7, 13); ctx.fillRect(5, -21, 7, 9); ctx.restore();
        drawEmoji(ctx, "\u{1F955}", carrot.x, cy, 34, { rotation: -0.18, alpha: 0.78 });
      }
      if (s.grooming < 5) {
        ctx.fillStyle = "rgba(37, 55, 23, .94)"; ctx.fillRect(245, 155, 470, 205); ctx.strokeStyle = "#f4c95d"; ctx.lineWidth = 3; ctx.strokeRect(245, 155, 470, 205);
        ctx.fillStyle = "#fff7db"; ctx.font = "700 24px Georgia"; ctx.textAlign = "center"; ctx.fillText("Putzkiste", 480, 190);
        const brushes = ["🪮", "🧽", "🪥"]; brushes.forEach((brush, index) => { const x = 360 + index * 120; ctx.fillStyle = index === s.brushIndex ? "#f4c95d" : "#536a36"; ctx.fillRect(x - 38, 210, 76, 70); drawEmoji(ctx, brush, x, 244, 38); });
        ctx.font = "16px Georgia"; ctx.fillStyle = "#fff7db"; ctx.fillText("← / → Bürste wählen · Leertaste Bürste nehmen", 480, 320); ctx.fillText(`Putzen: ${Math.round(s.grooming)}/5${s.brushActive > 0 ? " · Bürste aktiv" : ""}`, 480, 344); ctx.textAlign = "left";
      }
      drawEmoji(ctx, "🏇", 170, s.horse.y, 72, { offsetY: 8 });
      ctx.fillStyle = "rgba(255,247,219,.7)"; ctx.font = "700 20px Georgia"; ctx.fillText(`DISTANZ ${Math.floor(s.distance)} m`, 24, 110); ctx.fillText(`LEVEL ${s.level} · MÖHREN ${s.carrots}`, 24, 140);
      ctx.fillStyle = "rgba(37, 55, 23, .9)"; ctx.fillRect(790, 28, 140, 58); ctx.strokeStyle = "#f4c95d"; ctx.lineWidth = 3; ctx.strokeRect(790, 28, 140, 58); ctx.fillStyle = "#fff7db"; ctx.font = "700 18px Georgia"; ctx.textAlign = "center"; ctx.fillText("LEVEL", 860, 51); ctx.font = "700 25px Georgia"; ctx.fillText(String(s.level), 860, 77); ctx.textAlign = "left";
    },
    hud(s) { return [{ label: "ZEIT", value: format(s.time) }, { label: "BESTZEIT", value: s.best ? format(s.best) : "—" }, { label: "TEMPO", value: `${Math.round(s.speed)} km/h` }, { label: "SPRÜNGE", value: String(s.jumps) }]; },
    overlay(s) { if (s.status === "ready") return { title: "Erst putzen, dann galoppieren", message: "Starte die Pflegephase und drücke fünfmal Leertaste oder Pfeil-nach-oben. Danach beginnt der Lauf.", action: "Pferd putzen" }; if (s.status === "paused") return { title: "Pause im Sattel", message: "Der Lauf wartet auf dich.", action: "Weiterreiten" }; return { title: "Hindernis erwischt", message: `Du warst ${format(s.time)} unterwegs. Schaffst du es beim nächsten Lauf schneller?`, action: "Nochmal reiten" }; }
  };
  mount(game);
})();
