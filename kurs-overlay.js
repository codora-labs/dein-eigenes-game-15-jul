(() => {
  "use strict";

  const banner = document.createElement("aside");
  banner.className = "kurs-banner";
  banner.setAttribute("aria-label", "Hinweis zum Codora Game-Design-Kurs");
  banner.innerHTML = `
    <img class="kurs-banner__logo" src="../codora-logo.png" alt="Codora – Skills für deine Zukunft">
    <p class="kurs-banner__text">Möchtest du auch dein eigenes Spiel erstellen?</p>
    <a class="kurs-banner__link" href="https://codora.ch/kurse/in-3h-dein-eigenes-game-veroeffentlichen-mit-ki-game-design-teil-2-halbtag/?utm_source=dein-eigenes-game&amp;utm_medium=referral&amp;utm_campaign=game-design-teil-2" target="_blank" rel="noopener">
      <span>Zum Game-Design-Kurs</span><span aria-hidden="true">↗</span>
    </a>
    <button class="kurs-banner__schliessen" type="button" aria-label="Kurs-Hinweis schließen">×</button>
  `;

  document.body.append(banner);
  const root = document.documentElement;
  const hud = document.querySelector(".hud");
  const updateHudPosition = () => {
    if (!hud) return;
    hud.classList.remove("kurs-hud-unten");
    const style = window.getComputedStyle(hud);
    if (style.position === "fixed" && style.top === "auto" && style.bottom !== "auto") {
      hud.classList.add("kurs-hud-unten");
    }
  };
  const updateOffset = () => {
    updateHudPosition();
    const height = Math.ceil(banner.getBoundingClientRect().height);
    root.style.setProperty("--kurs-banner-offset", `${height + 24}px`);
  };
  const resizeObserver = window.ResizeObserver ? new ResizeObserver(updateOffset) : null;
  root.classList.add("kurs-banner-sichtbar");
  resizeObserver?.observe(banner);
  window.addEventListener("resize", updateOffset);
  window.requestAnimationFrame(updateOffset);

  banner.querySelector(".kurs-banner__schliessen").addEventListener("click", () => {
    banner.classList.add("wird-geschlossen");
    root.classList.remove("kurs-banner-sichtbar");
    root.style.removeProperty("--kurs-banner-offset");
    hud?.classList.remove("kurs-hud-unten");
    resizeObserver?.disconnect();
    window.removeEventListener("resize", updateOffset);
    window.setTimeout(() => banner.remove(), 170);
  });
})();
