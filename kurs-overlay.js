(() => {
  "use strict";

  const banner = document.createElement("aside");
  banner.className = "kurs-banner";
  banner.setAttribute("aria-label", "Hinweis zum Codora Game-Design-Kurs");
  banner.innerHTML = `
    <img class="kurs-banner__logo" src="../codora-logo.png" alt="Codora – Skills für deine Zukunft">
    <p class="kurs-banner__text">Möchtest du auch dein eigenes Spiel erstellen?</p>
    <a class="kurs-banner__link" href="https://codora.ch/kurse/in-3h-dein-eigenes-game-veroeffentlichen-mit-ki-game-design-teil-2-halbtag/" target="_blank" rel="noopener">
      <span>Zum Game-Design-Kurs</span><span aria-hidden="true">↗</span>
    </a>
    <button class="kurs-banner__schliessen" type="button" aria-label="Kurs-Hinweis schließen">×</button>
  `;

  document.body.append(banner);

  banner.querySelector(".kurs-banner__schliessen").addEventListener("click", () => {
    banner.classList.add("wird-geschlossen");
    window.setTimeout(() => banner.remove(), 170);
  });
})();
