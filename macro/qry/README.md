# QRY - QR Code Generator

> Professionelle QR-Codes in Sekunden. Kostenlos, schnell und mit Premium-Features.

## 🚀 Features

### Free
- ✅ QR-Code Generierung
- ✅ 5 QR-Codes pro Tag
- ✅ Einfache Bedienung
- ✅ Verlauf

### Premium (€9,99 einmalig)
- ✅ Unbegrenzte QR-Codes
- ✅ Individuelle Farben
- ✅ Logo einbetten
- ✅ Bulk Generator
- ✅ HD-Qualität
- ✅ Premium Support

## 🛠️ Tech Stack

- **Frontend**: Vanilla JS, HTML5, CSS3
- **Backend**: Node.js, Express
- **Datenbank**: PostgreSQL
- **Auth**: JWT
- **Payment**: Lemon Squeezy
- **Container**: Docker

## 📦 Installation

### Mit Docker (empfohlen)

```bash
# Repository klonen
git clone https://github.com/deinusername/qry.git
cd qry

# .env Datei anpassen
cp backend/.env.example backend/.env
# Öffne backend/.env und füge deine Lemon Squeezy Keys ein

# Docker starten
docker-compose up -d

# App läuft unter:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### Deployment-Ready Hinweise

- Der Backend-Server stellt das Frontend jetzt auch direkt für Production-Deployments bereit.
- Für Plattformen wie Render, Railway oder Fly.io kann die Umgebungsvariable `DATABASE_URL` verwendet werden.
- Eine Beispiel-Konfiguration ist in [backend/.env.example](backend/.env.example) hinterlegt.
- Für Render ist außerdem die Datei [render.yaml](render.yaml) vorbereitet.