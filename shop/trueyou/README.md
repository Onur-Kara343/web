# 🔍 TrueYou – Persönlichkeitstests

TrueYou ist eine Web-App mit 15 wissenschaftlich fundierten Persönlichkeitstests aus den Bereichen Persönlichkeit, Beziehungen, Entwicklung und Motivation.

## ✨ Features

- 📋 **15 Tests** mit je 30 Fragen
- 🆓 **3 kostenlose Tests** – Big Five, Bindungsstil, Resilienz
- 💎 **Premium** (9,99€ einmalig) – schaltet alle 15 Tests frei
- 📊 **Detaillierte Ergebnisauswertung** mit Balkendiagrammen
- 👤 **Profil-Seite** – Alle Testergebnisse speichern und verwalten
- 🔐 **Sichere Authentifizierung** (JWT)

## 🧠 Die 15 Tests

### Persönlichkeit (5 Tests)
| Test | Free | Premium |
|------|------|---------|
| Big Five | ✅ | - |
| Jung-Archetypen | - | ✅ |
| Schattenseiten | - | ✅ |
| Kommunikationsstil | - | ✅ |
| Entscheidungstyp | - | ✅ |

### Beziehungen & Emotionen (5 Tests)
| Test | Free | Premium |
|------|------|---------|
| Bindungsstil | ✅ | - |
| Konfliktstil | - | ✅ |
| Emotionale Intelligenz | - | ✅ |
| Selbstwert | - | ✅ |
| Lebensrollen | - | ✅ |

### Entwicklung & Motivation (5 Tests)
| Test | Free | Premium |
|------|------|---------|
| Resilienz | ✅ | - |
| Lebenswerte | - | ✅ |
| Motivationsprofil | - | ✅ |
| Innere Antreiber | - | ✅ |
| Stressprofil | - | ✅ |

## 🛠️ Technologie-Stack

- **Backend:** Node.js, Express, PostgreSQL
- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Auth:** JWT, bcrypt
- **Premium:** Lemon Squeezy

## 🚀 Installation

### Voraussetzungen
- Node.js (v18+)
- PostgreSQL (v14+)

### Backend Setup

```bash
cd trueyou/backend
npm install
cp .env.example .env
# .env Datei mit deinen Daten bearbeiten
npm run dev

### Frontend Setup

```bash
cd kopfarena/frontend
npx serve .

### Datenbank 

CREATE DATABASE trueyou_db;
-- Führe db/init.sql aus

### Premium Upgrade

Premium kostet 9,99€ einmalig über Lemon Squeezy.

Free User: 14 Spiele
Premium User: Alle 40 Spiele

### Lizenz

Private Nutzung – Alle Rechte vorbehalten.

### Entwickler

Entwickelt im Rahmen des Psychologie-Apps-Projekts.