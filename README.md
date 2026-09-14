# Webprojekte

In diesem Ordner entwickle ich eigene Webseiten und Webanwendungen. Die Projekte reichen von kleinen Browser-Experimenten bis zu umfangreicheren Anwendungen mit Backend, Datenbank und Docker.


## Struktur

### `macro/`
Größere Webprojekte mit eigener Funktionalität, teilweise mit Node.js-Backend, Datenbank und Docker-Setup.

Die meisten größeren Projekte bestehen aus einem `backend/`- und einem `frontend/`-Ordner. Die Docker-Dateien liegen jeweils im Projektordner und kapseln die Anwendung für einen reproduzierbaren Start.

### `micro/`
Kleinere Webideen und kompakte Anwendungen. Diese Projekte sind meist schneller aufgebaut und konzentrieren sich auf eine einzelne Funktion oder ein klar abgegrenztes Nutzererlebnis.

### `portfolio/`
Meine Portfolio-Webseite mit Node.js-Server, öffentlichen Seiten und Routen.

### `shop/`
Webprojekte mit Shop- oder Produktfokus.


## Typischer Technologie-Stack
- HTML, CSS und JavaScript für die Benutzeroberfläche
- Node.js und Express für Server und APIs
- PostgreSQL für Projekte mit persistenten Daten
- Docker und Docker Compose für reproduzierbare Entwicklungs- und Produktionsumgebungen
- Externe APIs, wenn ein Projekt Daten oder Dienste von außen benötigt

## Arbeiten mit einem Projekt

Zuerst die README im jeweiligen Projektordner lesen. Bei Node.js-Projekten anschließend die Abhängigkeiten installieren und den dort dokumentierten Startbefehl verwenden:

```bash
npm install
npm start
```

Wenn ein Docker-Setup vorhanden ist:

```bash
docker compose up --build
```

Die einzelnen Projekte können eigene Ports, Umgebungsvariablen und Voraussetzungen haben. Zugangsdaten gehören in lokale `.env`-Dateien und nicht ins Repository.
