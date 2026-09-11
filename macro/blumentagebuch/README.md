# Blumentagebuch

Das Blumentagebuch ist ein durchsuchbares Blumenlexikon mit Tagesblume und Detailansichten. Die Blumeninformationen werden ueber die Trefle-API geladen und serverseitig fuer 24 Stunden zwischengespeichert.

## Funktionen

- Blumen laden und durchsuchen
- Kartenansicht und Detail-Modal
- Wissenschaftlicher Name, Familie, Gattung und Beschreibung
- Eigenschaften wie essbar oder medizinisch
- Blume des Tages
- Cache-Status anzeigen und Cache manuell neu laden

## Technik

- Backend: Node.js, Express, Axios, CORS und dotenv
- Frontend: HTML, CSS und Vanilla JavaScript
- Frontend-Auslieferung ueber Nginx
- Externe API: Trefle
- Docker Compose

## Start mit Docker

```bash
docker compose up --build
```

Frontend: <http://localhost>  
Backend: <http://localhost:3000>

Container beenden:

```bash
docker compose down
```

## Lokaler Backend-Start

```bash
cd backend
npm install
npm start
```

Im Entwicklungsmodus:

```bash
npm run dev
```

Der Backend-Port kann ueber `PORT` gesetzt werden und ist standardmaessig `3000`.

## Hinweise

Die lokale Nginx-Konfiguration leitet `/api/` im Docker-Setup an den Compose-Service `backend` weiter. Der Trefle-Key ist derzeit noch direkt in `backend/server.js` hinterlegt und sollte vor einem produktiven Einsatz in eine Umgebungsvariable verschoben werden.
