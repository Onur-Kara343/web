# QR-Code Generator

Ein einfacher, rein clientseitiger QR-Code-Generator.
Unterstützt **Text/URLs**, **WLAN-Zugangsdaten** und **Passwörter**.

## Features

- Text, URL, WLAN oder Passwort als QR-Code
- Einstellbare Größe (128–1024 px)
- Fehlerkorrektur-Level L / M / Q / H
- Download als PNG
- **Kein Server nötig** – läuft komplett im Browser

## Nutzung

Einfach `index.html` im Browser öffnen. Fertig.

Alternativ über einen lokalen Server (z. B. wegen CORS bei manchen Browsern):

```bash
python3 -m http.server 8000
# oder
npx serve