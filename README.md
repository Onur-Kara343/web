# Tools

Dieses Verzeichnis enthält kleine Hilfsprogramme und Werkzeuge für lokale Nutzung, Entwicklung und Tests.

## Struktur

- `cli-tools/` – Sammlung von kleinen Konsolen-Tools mit Node.js.
- `developer-tools/` – Platz für Entwicklerwerkzeuge.
- `sonstiges/` – Sonstige nützliche Anwendungen und Client-/Server-Tools.

## cli-tools

Enthält eigenständige CLI-Projekte. Jedes hat ein eigenes `package.json` und ist als Node.js-Tool unterwegs.

- `api-tester-cli/` – API-Tester-Tool mit `axios`, `chalk` und `commander`.
- `datei-groesse-cli/` – CLI zur Anzeige oder Berechnung von Dateigrößen.
- `jpg-wandler-cli/` – Bildkonverter, der Bilder gezielt in JPG umwandeln kann.
- `json-formatter-cli/` – JSON-Formatierer/Validator als Kommandozeilen-Tool.
- `morseCode-cli/` – Morse-Code-Tool für Kodierung oder Decodierung.
- `notensystem-cli/` – Notensystem-Tool zur Arbeit mit Punktesystemen und Schulnoten.
- `ordnerstruktur-cli/` – CLI zum Auflisten oder Visualisieren von Ordnerstrukturen.
- `password-cli/` – Werkzeug zur Generierung sicherer Passwörter.

## sonstiges

- `qr-code-tool/` – QR-Code Generator & Scanner mit einem Node.js-Server und Weboberfläche.

## Installation

Viele der Tools können einzeln installiert werden. Zum Beispiel:

```powershell
cd cli-tools\jpg-wandler-cli
npm install
```

oder für das QR-Code-Tool:

```powershell
cd sonstiges\qr-code-tool
npm install
npm start
```

## Nutzung

Jedes Projekt hat in der Regel eigene Startskripte oder ausführbare Dateien. Schaue in die jeweiligen Unterordner und `package.json`, um die genauen Befehle zu finden.

## Hinweis

Der Ordner `developer-tools/` ist zurzeit leer und kann für zukünftige Entwicklerwerkzeuge genutzt werden.
