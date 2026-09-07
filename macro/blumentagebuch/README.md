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

## Bekannte Einschraenkung

Die aktuelle Frontend- und Nginx-Konfiguration verweist fest auf ein Render-Backend (`blumentagebuch-backend-latest.onrender.com`). Dadurch verwendet der lokale Docker-Start moeglicherweise nicht das gleichzeitig gestartete lokale Backend. Der Trefle-Key ist derzeit ausserdem direkt in `backend/server.js` hinterlegt und sollte in eine Umgebungsvariable verschoben werden.
