# QRY - QR-Code-Generator

QRY ist als QR-Code-Anwendung mit kostenlosem Tageslimit und geplanten Premium-Funktionen angelegt.

## Vorgesehene Funktionen

- QR-Codes erzeugen und herunterladen
- Kostenlos bis zu fuenf QR-Codes pro Tag
- Verlauf der erzeugten Codes
- Premium: Farben, Logo, HD-Aufloesung und Bulk-Modus
- Registrierung, Login und Premium-Pruefung
- Vorgesehene Lemon-Squeezy-Zahlungsintegration

## Geplante Architektur

- Frontend: Vanilla JavaScript, HTML5 und CSS3
- Backend: Node.js und Express
- Datenbank: PostgreSQL
- Authentifizierung: JWT
- Zahlung: Lemon Squeezy
- Ausfuehrung: Docker

## Aktueller Projektstand

Das Projekt ist derzeit nicht vollstaendig startbereit. Im `backend`-Ordner fehlen unter anderem `package.json`, `server.js` sowie mehrere von den Routen importierte Controller und Middleware-Dateien. Die Docker-Datei erwartet diese Dateien jedoch.

Auch `backend/.env.example` ist im aktuellen Stand nicht vorhanden. Die folgenden Variablen sind im Compose-Setup vorgesehen:

```env
PORT=5000
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=qry_db
JWT_SECRET=EIN_LANGER_ZUFAELLIGER_SCHLUESSEL
LEMON_SQUEEZY_API_KEY=DEIN_API_KEY
LEMON_SQUEEZY_STORE_ID=DEINE_STORE_ID
LEMON_SQUEEZY_PRODUCT_ID=DEINE_PRODUCT_ID
FRONTEND_URL=http://localhost:3000
```

## Startversuch mit Docker

Sobald Backend und Konfiguration vervollstaendigt sind:

```bash
docker compose up --build
```

Vorgesehene URLs:

- Frontend: <http://localhost:3000>
- Backend: <http://localhost:5000>
- PostgreSQL: Port `5432`

Der aktuelle Ordner kann mit dieser Konfiguration voraussichtlich noch nicht erfolgreich gebaut werden.