(function () {
  "use strict";
  const { mount, clamp, drawEmoji } = window.ExampleKit;
  const players = [{ x: 150, y: 510, emoji: "🧍‍♂️", color: "#3d9ec2" }, { x: 810, y: 510, emoji: "🧍‍♀️", color: "#e05a7b" }];
  function create() { return { status: "ready", turn: 0, angle: 42, power: 560, lastAngle: null, lastPower: null, lives: [3, 3], snow: Array.from({ length: 90 }, (_, i) => ({ x: (i * 83) % 960, y: (i * 47) % 600, speed: 35 + (i % 5) * 14, size: 2 + (i % 3) })), ball: { x: 0, y: 0, vx: 0, vy: 0, active: false, owner: 0 }, round: 1 }; }
  function nextTurn(s) { s.turn = 1 - s.turn; s.angle = 42; s.power = 560; }
  function update(s, dt, input, w) {
    const p = players[s.turn];
    s.snow.forEach((flake) => { flake.y += flake.speed * dt; flake.x += Math.sin(flake.y * 0.015) * 8 * dt; if (flake.y > 600) { flake.y = -8; flake.x = (flake.x + 127) % 960; } });
    if (s.ball.active) { const b = s.ball, target = players[1 - b.owner]; b.vy += 610 * dt; b.x += b.vx * dt; b.y += b.vy * dt; if (Math.hypot(b.x - target.x, b.y - target.y) < 42) { s.lives[1 - b.owner] = Math.max(0, s.lives[1 - b.owner] - 1); b.active = false; if (s.lives[1 - b.owner] === 0) s.status = "won"; else nextTurn(s); } else if (b.y > 540 || b.x < -80 || b.x > w.width + 80) { b.active = false; nextTurn(s); } return; }
    const left = s.turn === 0 ? input.down("ArrowLeft", "KeyA", "left", "p1left") : input.down("ArrowLeft", "KeyJ", "left", "p2left");
    const right = s.turn === 0 ? input.down("ArrowRight", "KeyD", "right", "p1right") : input.down("ArrowRight", "KeyL", "right", "p2right");
    const up = s.turn === 0 ? input.down("ArrowUp", "KeyW", "up", "p1up") : input.down("ArrowUp", "KeyI", "up", "p2up");
    const down = s.turn === 0 ? input.down("ArrowDown", "KeyS", "down", "p1down") : input.down("ArrowDown", "KeyK", "down", "p2down");
    if (left) s.angle = clamp(s.angle - 65 * dt, 20, 75);
    if (right) s.angle = clamp(s.angle + 65 * dt, 20, 75);
    if (up) s.power = clamp(s.power + 320 * dt, 260, 820);
    if (down) s.power = clamp(s.power - 320 * dt, 260, 820);
    if (input.consumeAction()) { const rad = s.angle * Math.PI / 180, direction = s.turn === 0 ? 1 : -1; s.lastAngle = s.angle; s.lastPower = s.power; s.ball = { x: p.x, y: p.y - 24, vx: Math.cos(rad) * s.power * direction, vy: -Math.sin(rad) * s.power, active: true, owner: s.turn }; }
  }
  function draw(ctx, s, w) {
    ctx.fillStyle = "#dff6ff"; ctx.fillRect(0, 0, w.width, w.height); ctx.fillStyle = "#fff"; ctx.fillRect(0, 520, w.width, 80); ctx.fillStyle = "#b7e9f8";
    s.snow.forEach((flake) => { ctx.beginPath(); ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2); ctx.fill(); });
    [[70, 330, 170, 120, "#f4b6a6"], [300, 355, 190, 95, "#f6d58a"], [610, 325, 190, 125, "#b9d9f2"], [820, 365, 110, 85, "#d8b8e8"]].forEach(([x, y, width, height, color]) => { ctx.fillStyle = color; ctx.fillRect(x, y, width, height); ctx.fillStyle = "#8a5873"; ctx.beginPath(); ctx.moveTo(x - 18, y); ctx.lineTo(x + width / 2, y - 62); ctx.lineTo(x + width + 18, y); ctx.closePath(); ctx.fill(); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(x - 24, y - 3); ctx.lineTo(x + width / 2, y - 68); ctx.lineTo(x + width + 24, y - 3); ctx.lineTo(x + width + 12, y + 7); ctx.lineTo(x + width / 2, y - 54); ctx.lineTo(x - 12, y + 7); ctx.closePath(); ctx.fill(); ctx.fillStyle = "#6d91aa"; ctx.fillRect(x + width * .42, y + height * .52, 25, height * .48); ctx.fillStyle = "#fff5b8"; ctx.fillRect(x + width * .18, y + height * .34, 24, 24); ctx.fillRect(x + width * .72, y + height * .34, 24, 24); });
    ctx.fillStyle = "#c8f0fb"; ctx.beginPath(); ctx.moveTo(0, 440); ctx.quadraticCurveTo(180, 390, 360, 445); ctx.quadraticCurveTo(570, 370, 960, 435); ctx.lineTo(960, 600); ctx.lineTo(0, 600); ctx.fill(); ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.ellipse(150, 510, 125, 42, 0, 0, Math.PI * 2); ctx.ellipse(810, 510, 125, 42, 0, 0, Math.PI * 2); ctx.fill();
    players.forEach((p, i) => { ctx.strokeStyle = p.color; ctx.fillStyle = "#ffffff"; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.beginPath(); ctx.arc(p.x, p.y - 30, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(p.x, p.y - 17); ctx.lineTo(p.x, p.y + 20); ctx.moveTo(p.x, p.y - 5); ctx.lineTo(p.x + (i ? -24 : 24), p.y + 8); ctx.moveTo(p.x, p.y + 20); ctx.lineTo(p.x + (i ? -18 : 18), p.y + 45); ctx.moveTo(p.x, p.y + 20); ctx.lineTo(p.x + (i ? 18 : -18), p.y + 45); ctx.stroke(); ctx.fillStyle = p.color; ctx.font = "900 18px Trebuchet MS"; ctx.textAlign = "center"; ctx.fillText(`P${i + 1}`, p.x, p.y + 68); });
    if (!s.ball.active) { const p = players[s.turn], rad = s.angle * Math.PI / 180, direction = s.turn === 0 ? 1 : -1; ctx.strokeStyle = "#e96d8b99"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(p.x, p.y - 24); ctx.lineTo(p.x + Math.cos(rad) * 110 * direction, p.y - 24 - Math.sin(rad) * 110); ctx.stroke(); ctx.fillStyle = "#17334d"; ctx.font = "800 16px Trebuchet MS"; ctx.fillText(`Winkel ${Math.round(s.angle)}° · Kraft ${Math.round(s.power)}`, p.x, p.y - 78); }
    if (s.ball.active) drawEmoji(ctx, "❄️", s.ball.x, s.ball.y, 30);
  }
  mount({ title: "snow ball deuel", instructions: "Aktiver Spieler: ←/→ oder A/D bzw. J/L = Winkel · ↑/↓ oder W/S bzw. I/K = Kraft · Enter = werfen", create, update, draw, hud: s => [{ label: "P1 Leben", value: "♥ ".repeat(s.lives[0]) }, { label: "P2 Leben", value: "♥ ".repeat(s.lives[1]) }, { label: "Am Zug", value: `P${s.turn + 1}` }, { label: "Winkel", value: `${Math.round(s.angle)}°` }, { label: "Kraft", value: String(Math.round(s.power)) }], overlay: s => s.status === "ready" ? { title: "snow ball deuel", message: "Drei Leben pro Spieler. Jeder Treffer nimmt ein Leben.", action: "Schneeballrunde starten" } : s.status === "paused" ? { title: "Schneepause", message: "Die Runde wartet auf den nächsten Wurf.", action: "Weiter" } : s.status === "won" ? { title: `P${s.lives[0] === 0 ? 2 : 1} gewinnt!`, message: "Der Gegner hat keine Leben mehr.", action: "Neue Runde" } : { title: "Runde beendet", message: "Versucht es mit einem besseren Winkel.", action: "Neu starten" } });
})();
