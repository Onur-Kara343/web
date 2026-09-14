# 🔐 KeyVault

Ein minimalistischer, lokaler Passwort-geschützter Tresor für deine API Keys.
Alles läuft **komplett im Browser** – kein Server, kein Netzwerk, kein Tracking.

## ✨ Features

- 🔐 Master-Passwort-Schutz (lokal gespeichert)
- 🔑 API Keys hinzufügen, anzeigen/verbergen, kopieren, löschen
- 📋 Ein-Klick-Kopieren
- 💾 Speicherung in `localStorage` (Base64-verschleiert)
- 🌙 Moderner Developer-Dark-Mode mit Terminal-Flair
- 🚫 Kein Framework, kein Build-Tool – reines HTML/CSS/JS


## 🚀 Nutzung

1. `index.html` im Browser öffnen (Doppelklick reicht).
2. Beim ersten Start **Master-Passwort festlegen**.
3. Keys hinzufügen – fertig.

## ⚠️ Wichtige Hinweise

- **Kein echter Schutz:** Das Passwort und die Keys liegen im `localStorage`
  und sind mit Browser-DevTools auslesbar. Base64 ist **keine Verschlüsselung**,
  nur Verschleierung.
- **Passwort nicht änderbar:** Wer sein Passwort ändern will, muss
  „Account neu erstellen" nutzen – dabei werden **alle Keys gelöscht**.
- **Nur lokal:** Bei gelöschtem Browser-Speicher sind die Keys weg.
  Nutze ggf. den Browser-Sync oder ein echtes Passwort-Management für kritische Keys.

## 🛠 Tech

- HTML5
- CSS3 (Custom Properties, Grid, Flexbox)
- Vanilla JavaScript (ES6+)
- Web Clipboard API