# FootRank

FootRank ist eine kleine Web-App zur Bewertung der eigenen Fussballleistung. Trotz des Ordnernamens `foodtrack` handelt es sich um ein Fussball-Performance-Tool.

## Funktionen

- Positionsabhaengige Statistik-Eingaben
- Bewertung fuer Fluegel, Sturm und Mittelfeld
- Beruecksichtigung von Spielzeit und eigener Einsatzzeit
- Gewichtete Gesamtauswertung
- Ergebnis-Overlay und Zuruecksetzen der Eingaben

## Technik

- Node.js und Express
- HTML, CSS und Vanilla JavaScript
- Keine Datenbank und keine externe API

## Start

Im Projektordner:

```bash
npm install express
node server.js
```

Die Anwendung ist anschliessend unter <http://localhost:3000> erreichbar.

## Projektstruktur

```text
server.js       Express-Server
public/         HTML, CSS und Browser-JavaScript
```

Es gibt aktuell keine `package.json`. Fuer eine reproduzierbare Installation sollte die Express-Abhaengigkeit in einer Package-Konfiguration festgehalten werden.
