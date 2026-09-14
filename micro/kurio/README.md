# Kurio

Live-Währungskurse, Umrechner und Kursverlauf – schlicht, schnell, ohne Schnickschnack.

## Features

- **50+ Währungen** aus vielen Ländern (mit Flaggen-Emoji)
- **Umrechner** – Betrag, Von, Nach, Tauschen-Button
- **Live-Diagramm** mit 7 / 30 / 90 Tage-Auswahl (Chart.js)
- **Beliebte Paare** zum Schnellklick
- Speichert gewählte Währungen in `localStorage`
- Auto-Refresh alle 5 Minuten
- Deutsche UI

## Nutzung

1. `index.html` im Browser öffnen (Internet nötig für Live-Kurse).
2. Oben siehst du das aktuelle Kurs-Paar.
3. Betrag eingeben → sofortige Umrechnung.
4. Zeitraum im Diagramm wählen (7 / 30 / 90 Tage).
5. Auf ein „Beliebtes Paar" klicken zum Schnellwechseln.

## APIs

- **Primär:** [Frankfurter](https://frankfurter.app) – EZB-Daten, kostenlos, kein Key
- **Fallback:** [open.er-api.com](https://open.er-api.com) – 160+ Währungen, kein Key

## Hinweise

- Live-Kurse brauchen **Internet**.
- Frankfurter liefert ca. 30 Hauptwährungen. Der Fallback deckt mehr ab.
- Daten kommen von der EZB (Update ~1× pro Werktag).
- Kein Server, kein Tracking, alles im Browser.

## Tech

- HTML5
- CSS3 (Custom Properties, Grid, Animations)
- Vanilla JavaScript (ES6+, `fetch`, async/await)
- [Chart.js](https://www.chartjs.org/) via CDN