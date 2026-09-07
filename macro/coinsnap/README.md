# CoinSnap

CoinSnap ist ein Finanz-Tracker fuer Einnahmen, Ausgaben und Sparziele. Die aktuelle Package-Konfiguration beschreibt die Anwendung als `finance-tracker`.

## Funktionen

- Registrierung und Login mit JWT
- Einnahmen und Ausgaben anlegen und loeschen
- Kategorien verwalten
- Einnahmen, Ausgaben und Saldo zusammenfassen
- Transaktionen nach Zeitraum filtern
- Sparbuecher mit Zielbetrag verwalten
- Geld einzahlen oder aus Sparbuechern entnehmen
- KI-Tipps ueber `/api/ai-tips`
- CSV-Export im Frontend

## Technik

- Node.js und Express
- PostgreSQL mit `pg`
- bcrypt und JSON Web Tokens
- Statisches HTML, CSS und JavaScript
- dotenv fuer die Konfiguration

## Voraussetzungen

- Node.js
- Eine laufende PostgreSQL-Instanz
- Eine Datenbank namens `finance_tracker`

## Installation und Start

```bash
npm install
npm start
```

Entwicklungsmodus:

```bash
npm run dev
```

Die Anwendung laeuft standardmaessig unter <http://localhost:3000>.

## Umgebungsvariablen

Lege eine `.env` mit mindestens diesen Werten an:

```env
DB_USER=postgres
DB_PASSWORD=DEIN_PASSWORT
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=finance_tracker
PORT=3000
JWT_SECRET=EIN_LANGER_ZUFAELLIGER_SCHLUESSEL
```

Keine echten Passwoerter oder JWT-Schluessel committen.

## Aktueller Stand

Es gibt kein Docker-Setup. Ohne laufende PostgreSQL-Datenbank kann der Server nicht vollstaendig starten. Die vorhandene `.env` enthaelt Zugangsdaten und sollte nicht veroeffentlicht werden.
