# Voxify

Voxify wandelt Texte in Podcast- beziehungsweise Audio-Dateien um. Skripte koennen eingegeben oder als `.txt`- beziehungsweise `.md`-Datei geladen werden.

## Funktionen

- Text direkt eingeben oder Datei hochladen
- Deutsch, Englisch und Franzoesisch auswaehlen
- Sprechgeschwindigkeit und Pausen steuern
- MP3 erzeugen, abspielen und herunterladen
- Transkript anzeigen
- Lange Texte serverseitig in Abschnitte teilen

## Technik

- Node.js und Express
- `google-tts-api` fuer die Sprachsynthese
- `node-fetch` fuer HTTP-Aufrufe
- FFmpeg zum Zusammenfuegen der Audioabschnitte
- Frontend mit HTML, CSS und Vanilla JavaScript
- Temporere MP3-Dateien im Ordner `temp/`

## Voraussetzungen

- Node.js
- `ffmpeg` im PATH
- Internetzugang fuer die TTS-Aufrufe

## Installation und Start

```bash
npm install
npm start
```

Die Anwendung ist standardmaessig unter <http://localhost:3000> erreichbar.

FFmpeg muss als `ffmpeg` aufrufbar sein. Der aktuelle Server verwendet keine Google-Cloud-Anmeldedaten; `GOOGLE_APPLICATION_CREDENTIALS` wird vom laufenden TTS-Code nicht benoetigt.

## Aktueller Hinweis

Die aktuelle Implementierung verwendet an mehreren Stellen `dialogs.length`, obwohl `dialogs` nicht definiert ist. Die Podcast-Erzeugung kann deshalb nach der TTS-Verarbeitung mit einem Laufzeitfehler abbrechen. Vor einem produktiven Einsatz sollte dieser Fehler in `public/script.js` und `server.js` behoben werden.
