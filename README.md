# Architekturspiele

Eine kleine Sammlung von Browserspielen rund um Softwarearchitektur. Reines HTML, CSS und JavaScript, kein Build-Schritt.

## Spiele

### 1 · Qualitäts-Workshop (`games/quality-workshop/`)

Du bist der Architekt und sitzt am Tisch (Pixel-Adventure-Look der 90er). Auf dem Tisch liegt ein achteckiges Poster mit den acht Qualitätsmerkmalen nach ISO/IEC 25010. Klick die Beteiligten an, hör ihre Aussagen und vergib dann 0 bis 10 Punkte pro Merkmal auf dem Radar-Chart. Wer sich richtig verstanden fühlt, lächelt, wer nicht, wird sauer.

- Das Poster lässt sich im Vollbild bedienen (am Smartphone per Tipp aufs Poster, sonst über „Poster groß“).
- Schwierigkeit **Einfach**: 3 Personen, jede Aussage zielt klar auf ein Merkmal. Drei Fälle (Online-Shop, Klinik-Portal, Lern-App).
- Schwierigkeit **Mittel**: 4 Personen, vage und indirekte Aussagen, Merkmale werden mehrfach genannt. Nach der Auswertung steht zu jeder Aussage eine Deutung. Zwei Fälle (Heizungs-App, Bürgerportal).
- Schwierigkeit **Schwer**: 5 Personen mit widersprüchlichen Wünschen. Die Auflösung ergibt sich aus Daten, Auflagen und Praxis. Eine Person kann verärgert sein, obwohl du richtig lagst (`claim` in `data.js`). Zwei Fälle (Neobank, Landwirtschaftsplattform).

Neue Fälle: in `games/quality-workshop/data.js` einen Eintrag in `QW.SCENARIOS` ergänzen (Personen, Aussagen, gemeinte Werte in `truth`). Aussehen der Figuren steht in `look`, gezeichnet wird es prozedural in `sprites.js`.

## Lokal ansehen

`index.html` direkt im Browser öffnen oder einen beliebigen statischen Server starten, z. B. `npx http-server .`.

## Auf GitHub Pages veröffentlichen

Repository → Settings → Pages → *Deploy from a branch* → Branch `main`, Ordner `/ (root)`. Danach liegt die Sammlung unter `https://<user>.github.io/architecturegames/`.

## Schriften

Press Start 2P und VT323 (SIL Open Font License) liegen lokal in `assets/fonts`, es werden keine Daten an Google Fonts gesendet.
