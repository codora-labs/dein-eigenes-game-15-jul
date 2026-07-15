(() => {
  "use strict";

  const body = document.body;
  const spielname = body.dataset.spielname || "deinem Spiel";
  const spielScript = body.dataset.spielScript;

  if (!spielScript) return;

  const overlay = document.createElement("section");
  overlay.className = "kurs-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "kurs-overlay-titel");
  overlay.innerHTML = `
    <div class="kurs-overlay__karte">
      <div class="kurs-overlay__bild">
        <img src="../kurs-game-design.png" alt="Laptop mit selbst gestaltetem Jump-and-Run-Spiel und Game-Design-Arbeitsplatz">
      </div>
      <div class="kurs-overlay__inhalt">
        <p class="kurs-overlay__label">Codora Game-Design · Teil 2</p>
        <h1 id="kurs-overlay-titel">Möchtest du auch dein eigenes Spiel erstellen?</h1>
        <p class="kurs-overlay__text">Entwickle und veröffentliche in nur drei Stunden dein eigenes Game – mit KI und persönlicher Unterstützung.</p>
        <div class="kurs-overlay__aktionen">
          <a href="https://codora.ch/kurse/in-3h-dein-eigenes-game-veroeffentlichen-mit-ki-game-design-teil-2-halbtag/" target="_blank" rel="noopener">
            <span>Mehr zum Kurs erfahren</span><span aria-hidden="true">↗</span>
          </a>
          <button type="button" data-spiel-starten>
            <span>Spiel starten</span><span aria-hidden="true">→</span>
          </button>
        </div>
        <p class="kurs-overlay__hinweis">Danach geht es direkt weiter zu <strong data-spielname></strong>.</p>
      </div>
    </div>
  `;

  overlay.querySelector("[data-spielname]").textContent = spielname;
  body.prepend(overlay);

  const startButton = overlay.querySelector("[data-spiel-starten]");
  startButton.focus();

  startButton.addEventListener("click", () => {
    startButton.disabled = true;
    overlay.classList.add("wird-geschlossen");

    const spielLaden = () => {
      overlay.remove();
      body.classList.remove("kurs-vorschau");

      const script = document.createElement("script");
      script.src = spielScript;
      script.async = true;
      body.append(script);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      spielLaden();
    } else {
      window.setTimeout(spielLaden, 180);
    }
  });
})();
