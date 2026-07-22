(function () {
  "use strict";

  const { mount, clamp, drawEmoji } = window.ExampleKit;
  const TRAM_STOPS = [
    "Albisgütli", "Albisrieden", "Albisriederplatz", "Altes Krematorium", "Altried", "Auzelg", "Bachmattstrasse", "Bad Allenmoos", "Bahnhof Enge", "Bahnhof Enge/Bederstr.",
    "Bahnhof Hardbrücke", "Bahnhof Oerlikon", "Bahnhof Oerlikon Ost", "Bahnhof Selnau", "Bahnhof Stadelhofen", "Bahnhof Stettbach", "Bahnhof Tiefenbrunnen", "Bahnhof Wiedikon", "Bahnhofplatz/HB", "Bahnhofstrasse/HB",
    "Balgrist", "Beckenhof", "Bellevue", "Berninaplatz", "Bernoulli-Häuser", "Bezirksgebäude", "Billoweg", "Brunaustrasse", "Brunnenhof", "Bucheggplatz", "Burgwies", "Butzenstrasse", "Bäckeranlage", "Bändliweg", "Bürkliplatz",
    "Central", "Dübendorf, Am Ring", "Dübendorf, Ringwiesen", "ETH/Universitätsspital", "Englischviertelstrasse", "Escher-Wyss-Platz", "Farbhof", "Feldeggstrasse", "Fellenbergstrasse", "Fernsehstudio", "Fischerweg", "Freihofstrasse", "Friedhof Enzenbühl", "Friedrichstrasse", "Frohburg", "Fröhlichstrasse", "Förrlibuckstrasse",
    "Glattbrugg, Bahnhof", "Glattbrugg, Unterriet", "Glattpark", "Glattpark, Lindberghplatz", "Glattwiesen", "Goldbrunnenplatz", "Grimselstrasse", "Grünaustrasse", "Guggachstrasse", "Güterbahnhof", "Haldenbach", "Haldenegg", "Hardhof", "Hardplatz", "Hardturm", "Hedwigsteig", "Heerenwiesen", "Hegibachplatz", "Helmhaus", "Helvetiaplatz", "Heuried", "Hirschwiesenstrasse", "Hirzenbach", "Hottingerplatz", "Hubertus", "Hölderlinstrasse", "Höschgasse",
    "Kantonalbank", "Kantonsschule", "Kappeli", "Kinkelstrasse", "Kirche Fluntern", "Kloten Balsberg, Bahnhof", "Klusplatz", "Kreuzplatz", "Kreuzstrasse", "Kronenstrasse", "Kunsthaus", "Langmauerstrasse", "Laubegg", "Laubiweg", "Letzigrund", "Letzistrasse", "Leutschenbach", "Limmatplatz", "Lindenplatz", "Lochergut", "Luchswiesen", "Luegisland", "Löwenbräu", "Löwenplatz",
    "Mattenhof", "Messe/Hallenstadion", "Micafil", "Milchbuck", "Morgental", "Museum Rietberg", "Museum für Gestaltung", "Neumarkt", "Oerlikerhus", "Opernhaus", "Ottikerstrasse", "Paradeplatz", "Platte", "Probstei", "Quellenstrasse", "Rathaus", "Regensbergbrücke", "Rehalp", "Renggerstrasse", "Rennweg", "Rentenanstalt", "Roswiesen", "Rudolf-Brun-Brücke", "Römerhof", "Röslistrasse", "Rümlang, Bäuler",
    "Saalsporthalle", "Salersteig", "Schaffhauserplatz", "Schaufelbergerstrasse", "Schiffbau", "Schlieren, Gasometerbrücke", "Schlieren, Geissweid", "Schlieren, Mülligen", "Schlieren, Wagonsfabrik", "Schlieren, Zentrum/Bahnhof", "Schmiede Wiedikon", "Schwamendingerplatz", "Seilbahn Rigiblick", "Siemens", "Signaustrasse", "Sihlcity Nord", "Sihlpost / HB", "Sihlquai/HB", "Sihlstrasse", "Sonneggstrasse", "Stampfenbachplatz", "Stauffacher", "Sternen Oerlikon", "Stockerstrasse", "Strassenverkehrsamt", "Susenbergstrasse",
    "Talwiesenstrasse", "Tierspital", "Toblerplatz", "Triemli", "Tunnelstrasse", "Tüffenwies", "Ueberlandpark", "Uetlihof", "Universität Irchel", "Voltastrasse", "Waffenplatzstrasse", "Waldgarten", "Wallisellen, Bahnhof", "Wallisellen, Belair", "Wallisellen, Glatt (Tram)", "Wallisellen, Herti", "Wallisellen, Neugut", "Werd", "Werdhölzli", "Wetlistrasse", "Wildbachstrasse", "Winkelriedstrasse", "Wollishoferplatz", "Zch, Bhf.Wollishofen/Staubstr.", "Zoo", "Zypressenstrasse", "Zürich Flughafen, Bahnhof", "Zürich Flughafen, Fracht", "Zürich,Kalkbreite/Bhf.Wiedikon", "Zürichbergstrasse"
  ];
  const TRACK_STYLES = [
    { name: "Stadtlinie", railMin: 330, railRange: 220, gapBase: 55, gapRange: 25, step: 20, minY: 470, maxY: 520, barrierChance: 0.58, pattern: "random" },
    { name: "Hügellinie", railMin: 270, railRange: 170, gapBase: 62, gapRange: 42, step: 30, minY: 400, maxY: 520, barrierChance: 0.48, pattern: "random" },
    { name: "Expresslinie", railMin: 470, railRange: 260, gapBase: 48, gapRange: 20, step: 20, minY: 480, maxY: 520, barrierChance: 0.78, pattern: "flat" },
    { name: "Brückenlinie", railMin: 225, railRange: 145, gapBase: 75, gapRange: 48, step: 25, minY: 425, maxY: 505, barrierChance: 0.35, pattern: "random" },
    { name: "Treppenlinie", railMin: 285, railRange: 125, gapBase: 58, gapRange: 30, step: 30, minY: 400, maxY: 520, barrierChance: 0.52, pattern: "stairs" },
    { name: "Wellenlinie", railMin: 300, railRange: 180, gapBase: 65, gapRange: 34, step: 35, minY: 380, maxY: 520, barrierChance: 0.44, pattern: "wave" }
  ];

  function createLevel(index) {
    let seed = (index + 1) * 92821;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const width = 2100 + (index % 10) * 70 + Math.floor(index / 10) * 25;
    const speed = 210 + Math.min(100, index * 1.15);
    const trackStyle = TRACK_STYLES[index % TRACK_STYLES.length];
    const rails = [];
    const barriers = [];
    let x = 0;
    let y = 520;
    const stations = [TRAM_STOPS[index]];

    while (x < width) {
      let railWidth = Math.min(width - x, trackStyle.railMin + Math.floor(random() * trackStyle.railRange));
      if (width - (x + railWidth) < 190) railWidth = width - x;
      rails.push([x, y, railWidth, 600 - y]);
      if (x > 250 && railWidth > 330 && random() < trackStyle.barrierChance) {
        barriers.push([x + 145 + Math.floor(random() * (railWidth - 250)), y - 42]);
      }
      const gap = rails.length === 2
        ? Math.round(speed * 0.95 + 64)
        : trackStyle.gapBase + Math.floor(random() * trackStyle.gapRange);
      x += railWidth + gap;
      let heightChange = (Math.floor(random() * 5) - 2) * trackStyle.step;
      if (trackStyle.pattern === "flat") heightChange = random() > 0.78 ? (random() > 0.5 ? trackStyle.step : -trackStyle.step) : 0;
      if (trackStyle.pattern === "stairs") heightChange = rails.length % 6 < 3 ? -trackStyle.step : trackStyle.step;
      if (trackStyle.pattern === "wave") heightChange = rails.length % 4 < 2 ? -trackStyle.step : trackStyle.step;
      y = clamp(y + heightChange, trackStyle.minY, trackStyle.maxY);
    }

    const checkpointRail = rails.reduce((best, rail) => {
      const distance = Math.abs(rail[0] + rail[2] / 2 - width / 2);
      const bestDistance = Math.abs(best[0] + best[2] / 2 - width / 2);
      return distance < bestDistance ? rail : best;
    });
    const checkpoint = { x: checkpointRail[0] + checkpointRail[2] / 2, y: checkpointRail[1] };

    return {
      name: stations.join(" · "),
      stations,
      trackName: trackStyle.name,
      width,
      speed,
      start: { x: 70, y: 440 },
      rails,
      barriers: barriers.filter(([barrierX]) => Math.abs(barrierX - checkpoint.x) > 120),
      checkpoint
    };
  }

  const LEVELS = Array.from({ length: TRAM_STOPS.length }, (_, index) => createLevel(index));

  function create() {
    return {
      status: "ready", level: 0, lives: 3, score: 0, distanceBank: 0, camera: 0, bestX: 70, jumpHeld: false, checkpointReached: false,
      player: { x: 70, y: 440, w: 64, h: 48, vx: LEVELS[0].speed, vy: 0, grounded: false, jumpsUsed: 0 }
    };
  }

  function resetPlayer(state) {
    const level = LEVELS[state.level];
    const start = state.checkpointReached
      ? { x: level.checkpoint.x - state.player.w, y: level.checkpoint.y - state.player.h - 8 }
      : level.start;
    Object.assign(state.player, { x: start.x, y: start.y, vx: level.speed, vy: 0, grounded: false, jumpsUsed: 0 });
    state.jumpHeld = false;
    state.bestX = start.x;
    state.camera = clamp(start.x - 245, 0, level.width - 960);
  }

  function loseLife(state) {
    state.lives -= 1;
    if (state.lives <= 0) state.status = "lost";
    else resetPlayer(state);
  }

  function update(state, dt, input, world) {
    const level = LEVELS[state.level];
    const tram = state.player;
    const braking = input.down("ArrowLeft", "KeyA", "left");
    const turbo = input.down("ArrowRight", "KeyD", "right");
    const targetSpeed = level.speed * (braking ? 0.68 : turbo ? 1.22 : 1);
    tram.vx += (targetSpeed - tram.vx) * Math.min(1, dt * 4.5);

    const jumpDown = input.down("ArrowUp", "KeyW", "up");
    const jump = input.consumeAction() || (jumpDown && !state.jumpHeld);
    state.jumpHeld = jumpDown;
    if (jump && (tram.grounded || tram.jumpsUsed === 1)) {
      tram.vy = -590;
      tram.grounded = false;
      tram.jumpsUsed += 1;
    }

    tram.x = clamp(tram.x + tram.vx * dt, 0, level.width - tram.w);
    const previousBottom = tram.y + tram.h;
    tram.vy += 1550 * dt;
    tram.y += tram.vy * dt;
    tram.grounded = false;

    for (const [x, y, width] of level.rails) {
      if (tram.vy >= 0 && previousBottom <= y && tram.y + tram.h >= y && tram.x + tram.w > x && tram.x < x + width) {
        tram.y = y - tram.h;
        tram.vy = 0;
        tram.grounded = true;
        tram.jumpsUsed = 0;
      }
    }

    for (const [x, y] of level.barriers) {
      if (tram.x + tram.w - 10 > x && tram.x + 8 < x + 42 && tram.y + tram.h - 6 > y && tram.y + 8 < y + 42) {
        loseLife(state);
        return;
      }
    }

    if (tram.x > state.bestX) {
      state.distanceBank += tram.x - state.bestX;
      const earned = Math.floor(state.distanceBank / 10);
      state.score += earned;
      state.distanceBank -= earned * 10;
      state.bestX = tram.x;
    }

    if (!state.checkpointReached && tram.x + tram.w >= level.checkpoint.x) {
      state.checkpointReached = true;
      state.score += 100;
    }

    if (tram.y > world.height + 110) {
      loseLife(state);
      return;
    }

    if (tram.x > level.width - 100) {
      state.score += 500;
      if (state.level === LEVELS.length - 1) state.status = "won";
      else {
        state.level += 1;
        state.lives = 3;
        state.checkpointReached = false;
        resetPlayer(state);
      }
    }

    state.camera = clamp(tram.x - 245, 0, level.width - world.width);
  }

  function drawBackground(ctx, state, world, level) {
    const sky = ctx.createLinearGradient(0, 0, 0, world.height);
    sky.addColorStop(0, "#8fd7f1");
    sky.addColorStop(0.62, "#d9f1f4");
    sky.addColorStop(0.63, "#7c9a72");
    sky.addColorStop(1, "#3d5545");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, world.width, world.height);

    ctx.fillStyle = "rgba(255,255,255,.72)";
    for (let i = 0; i < 6; i += 1) {
      const x = ((i * 310 - state.camera * 0.14) % 1850 + 1850) % 1850 - 120;
      ctx.fillRect(x, 80 + (i % 3) * 35, 135, 18);
    }

    const towerColors = ["#58788a", "#668491", "#4f6e7f", "#718c96", "#526b79"];
    for (let i = 0; i < 44; i += 1) {
      const x = ((i * 58 - state.camera * 0.1) % 2552 + 2552) % 2552 - 60;
      const width = 55 + (i % 4) * 5;
      const height = 190 + (i % 7) * 28;
      const roofY = 430 - height;
      ctx.fillStyle = towerColors[(i + state.level) % towerColors.length];
      ctx.fillRect(x, roofY, width, height);
      ctx.fillStyle = "rgba(238, 226, 174, .52)";
      for (let floor = roofY + 17; floor < 405; floor += 27) {
        for (let windowX = x + 9; windowX < x + width - 7; windowX += 20) ctx.fillRect(windowX, floor, 9, 13);
      }
      ctx.fillStyle = "#405764";
      ctx.fillRect(x + width / 2 - 3, roofY - 17, 6, 17);
    }

    const houseColors = ["#d8a06d", "#e5c785", "#b97965", "#a8bac0", "#d6b1a0", "#c6c982"];
    for (let i = 0; i < 28; i += 1) {
      const x = ((i * 76 - state.camera * 0.18) % 2128 + 2128) % 2128 - 80;
      const width = 66 + (i % 3) * 8;
      const height = 150 + (i % 5) * 25;
      ctx.fillStyle = i % 2 ? "#75909d" : "#8ca3aa";
      ctx.fillRect(x, 405 - height, width, height);
      ctx.fillStyle = "rgba(238, 224, 163, .62)";
      for (let floor = 405 - height + 18; floor < 375; floor += 29) {
        for (let windowX = x + 10; windowX < x + width - 8; windowX += 23) ctx.fillRect(windowX, floor, 10, 14);
      }
    }

    for (let i = 0; i < 34; i += 1) {
      const x = ((i * 78 - state.camera * 0.32) % 2652 + 2652) % 2652 - 75;
      const width = 68 + (i % 3) * 10;
      const height = 112 + (i % 4) * 24;
      const groundY = 435;
      ctx.fillStyle = houseColors[i % houseColors.length];
      ctx.fillRect(x, groundY - height, width, height);
      ctx.fillStyle = i % 2 ? "#773d35" : "#4a5560";
      ctx.beginPath();
      ctx.moveTo(x - 7, groundY - height);
      ctx.lineTo(x + width / 2, groundY - height - 34);
      ctx.lineTo(x + width + 7, groundY - height);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#f5e8b7";
      for (let floor = groundY - height + 22; floor < groundY - 25; floor += 34) {
        for (let windowX = x + 14; windowX < x + width - 10; windowX += 30) ctx.fillRect(windowX, floor, 13, 18);
      }
      ctx.fillStyle = "#46525a";
      ctx.fillRect(x + width / 2 - 9, groundY - 32, 18, 32);
    }

    ctx.strokeStyle = "#343d43";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 72);
    ctx.lineTo(world.width, 25);
    ctx.moveTo(0, 132);
    ctx.lineTo(world.width, 84);
    ctx.stroke();
  }

  function drawRails(ctx, state, level) {
    for (const [x, y, width, height] of level.rails) {
      const screenX = x - state.camera;
      ctx.fillStyle = "#5c6060";
      ctx.fillRect(screenX, y + 13, width, height - 13);
      ctx.fillStyle = "#d8d0ba";
      ctx.fillRect(screenX, y, width, 13);
      ctx.fillStyle = "#3d4245";
      ctx.fillRect(screenX, y + 2, width, 4);
      ctx.fillRect(screenX, y + 9, width, 4);
      for (let sleeper = 12; sleeper < width; sleeper += 34) ctx.fillRect(screenX + sleeper, y - 3, 5, 19);
    }
  }

  function nextStop(state) {
    const level = LEVELS[state.level];
    const progress = clamp(state.player.x / level.width, 0, 0.999);
    return level.stations[Math.min(level.stations.length - 1, Math.floor(progress * level.stations.length))];
  }

  function drawEndStop(ctx, state, level) {
    const lastRail = level.rails[level.rails.length - 1];
    const railY = lastRail[1];
    const poleX = level.width - 155 - state.camera;
    const boardY = railY - 112;
    ctx.fillStyle = "#d7dde0";
    ctx.fillRect(poleX, boardY + 42, 7, railY - boardY - 42);
    ctx.fillStyle = "#70777a";
    ctx.fillRect(poleX - 8, railY - 5, 23, 5);
    ctx.fillStyle = "#0b4f9c";
    ctx.fillRect(poleX - 169, boardY, 176, 48);
    ctx.fillStyle = "#ffd522";
    ctx.fillRect(poleX - 169, boardY, 176, 5);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 12px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(level.stations[0], poleX - 158, boardY + 31, 154);
  }

  let blueTramSprite = null;
  function drawBlueTram(ctx, x, y, rotation) {
    if (!blueTramSprite) {
      blueTramSprite = document.createElement("canvas");
      blueTramSprite.width = 96;
      blueTramSprite.height = 96;
      const sprite = blueTramSprite.getContext("2d");
      sprite.textAlign = "center";
      sprite.textBaseline = "middle";
      sprite.font = '68px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      sprite.fillText("🚋", 48, 48);
      sprite.globalCompositeOperation = "source-atop";
      sprite.fillStyle = "rgba(0, 105, 220, .72)";
      sprite.fillRect(0, 0, 96, 96);
      sprite.fillStyle = "rgba(255, 255, 255, .96)";
      sprite.fillRect(9, 53, 78, 6);
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.drawImage(blueTramSprite, -38, -38, 76, 76);
    ctx.restore();
  }

  function draw(ctx, state, world) {
    const level = LEVELS[state.level];
    drawBackground(ctx, state, world, level);
    drawRails(ctx, state, level);

    for (const [x, y] of level.barriers) drawEmoji(ctx, "🚧", x - state.camera + 21, y + 21, 43);

    drawEmoji(ctx, state.checkpointReached ? "✅" : "🏁", level.checkpoint.x - state.camera, level.checkpoint.y - 48, 48, { alpha: state.checkpointReached ? 0.72 : 1 });
    drawEndStop(ctx, state, level);

    const tram = state.player;
    const tilt = clamp(tram.vy / 1600, -0.16, 0.18);
    drawBlueTram(ctx, tram.x - state.camera + tram.w / 2, tram.y + tram.h / 2, tilt);
  }

  mount({
    title: "Zürich Tram Jump and Run",
    instructions: "185 Levels – eine Tramhaltestelle pro Level · 2× Leertaste/Pfeil hoch = Doppelsprung · A/links = bremsen · D/rechts = Turbo",
    create, update, draw,
    hud: (state) => [
      { label: "Strecke", value: `${state.level + 1} / ${LEVELS.length}` },
      { label: "Parcours", value: LEVELS[state.level].trackName },
      { label: "Nächster Halt", value: nextStop(state) },
      { label: "Tickets", value: "●".repeat(state.lives) },
      { label: "Checkpoint", value: state.checkpointReached ? "Aktiv" : "Voraus" },
      { label: "Punkte", value: String(state.score) },
      { label: "Fahrt", value: `${Math.floor(state.player.x / LEVELS[state.level].width * 100)} %` }
    ],
    overlay: (state) => state.status === "ready"
      ? { title: "Einsteigen, bitte!", message: "Fahre durch 185 Levels. Die Fahne in der Levelmitte ist dein Checkpoint und speichert den Wiedereinstieg.", action: "Linie starten" }
      : state.status === "paused"
        ? { title: "Kurzer Halt", message: "Die Fahrt wartet an dieser Stelle auf dich.", action: "Weiterfahren" }
        : state.status === "won"
          ? { title: "Endstation erreicht", message: `Alle 185 Haltestellen-Levels geschafft – ${state.score} Punkte!`, action: "Neue Rundfahrt" }
          : { title: "Betriebsunterbruch", message: "Alle Tickets sind verbraucht. Versuche die Strecke noch einmal.", action: "Neu einsteigen" }
  });
})();
