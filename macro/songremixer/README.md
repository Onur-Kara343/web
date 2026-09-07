# SongRemixer

SongRemixer kombiniert Instrumental- und Acapella-Spuren zu einem Remix. Audiodateien koennen hochgeladen oder per Drag-and-drop in die Anwendung gezogen werden.

## Funktionen

- Instrumental und Acapella kombinieren
- BPM automatisch erkennen oder manuell setzen
- Lautstaerke von Vocal und Instrumental regeln
- Zieltempo und Tempoanpassung konfigurieren
- Remix im Browser abspielen
- Remix als WAV herunterladen
- Audio ueber `yt-dlp` laden
- Instrumental oder Acapella als Zielspur waehlen

## Technik

- Node.js und Express
- HTML, CSS und Vanilla JavaScript
- Web Audio API im Browser
- `yt-dlp` und FFmpeg fuer serverseitige Audioverarbeitung
- Keine Datenbank

## Voraussetzungen

- Node.js
- `yt-dlp` im PATH
- `ffmpeg` im PATH

## Installation und Start

```bash
npm install
npm start
```

Die Anwendung ist unter <http://localhost:3000> erreichbar. Ein Entwicklungsstart ist vorgesehen:

```bash
npm run dev
```

Die aktuelle Package-Konfiguration listet `nodemon` nicht als `devDependency`; der Entwicklungsstart ist daher moeglicherweise nicht reproduzierbar.
