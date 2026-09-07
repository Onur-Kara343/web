# VibeCraft

VibeCraft ist ein browserbasierter Music Maker und Step-Sequencer. Beats, Instrumente und eigene Aufnahmen lassen sich direkt im Browser kombinieren.

## Funktionen

- 16-Step-Spuren fuer Kick, Snare, Hi-Hat und Clap
- Instrumentenspuren fuer Piano, Gitarre, Bass und Streicher
- MIDI-Noten pro Step bearbeiten
- Tempo zwischen 60 und 180 BPM einstellen
- Wiedergabe, Pause, Stopp und Zuruecksetzen
- Gesang ueber das Mikrofon aufnehmen und abspielen
- Songs im Browser speichern und laden

## Technik

- Statisches HTML, CSS und JavaScript
- Tone.js 14.7.77 ueber CDN
- Web Audio API und MediaDevices
- Speicherung im Browser
- Kein Backend und keine Package-Konfiguration

## Start

Keine Installation erforderlich. Oeffne [index.html](index.html) direkt im Browser:

```text
vibecraft/index.html
```

Fuer den Mikrofonzugriff kann ein sicherer Kontext erforderlich sein. Starte bei Bedarf einen lokalen statischen HTTP-Server und rufe die Anwendung ueber `localhost` auf.

```bash
python -m http.server 8000
```

Danach: <http://localhost:8000>

Mikrofonaufnahmen bleiben im Browser und benoetigen eine explizite Berechtigung.
