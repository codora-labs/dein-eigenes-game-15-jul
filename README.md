# Dein eigenes Game · 15. Juli

Statische GitHub-Pages-Ausgabe für acht Browsergames aus dem Codora Game Lab.

## Veröffentlichen

Der Git-Remote ist bereits auf `git@github.com:codora-labs/dein-eigenes-game-15-jul.git` gesetzt.

```sh
git add .
git commit -m "Publish game gallery"
git push -u origin main
```

Danach im GitHub-Repository unter **Settings → Pages → Build and deployment** als Source **GitHub Actions** auswählen. Der Workflow veröffentlicht die Seite bei jedem Push auf `main`.

Die Seite ist anschließend unter <https://codora-labs.github.io/dein-eigenes-game-15-jul/> erreichbar.

## Struktur

- `index.html` und `styles.css`: Übersicht mit allen Games
- Ein Unterordner pro Game: fertiger Web-Build mit passendem GitHub-Pages-Basispfad
- `.github/workflows/pages.yml`: automatisches Deployment

Die Flutter-Ausgaben wurden für `/dein-eigenes-game-15-jul/<game-ordner>/` gebaut.
