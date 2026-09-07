# Gluecksrad

Ein persoenliches Gluecksrad fuer Entscheidungen, Auslosungen und zufaellige Auswahl. Die Anwendung laeuft vollstaendig im Browser.

## Funktionen

- Bis zu 12 eigene Werte verwalten
- Werte hinzufuegen, loeschen, zuruecksetzen und Beispielwerte laden
- Eigenen Titel vergeben
- Gluecksrad drehen und Ergebnis anzeigen
- Soundeffekte ein- und ausschalten
- Titel und Werte dauerhaft im Browser speichern

## Technik

- HTML, CSS und Vanilla JavaScript
- HTML-Canvas fuer die Darstellung
- Web Audio API fuer Soundeffekte
- `localStorage` fuer die lokale Speicherung

## Start

Keine Installation erforderlich. Oeffne [index.html](index.html) direkt im Browser. Alternativ kann ein beliebiger statischer HTTP-Server verwendet werden.

```text
glücksrad/index.html
```

Es gibt kein Backend, keine Datenbank und keine Umgebungsvariablen.

## Datenschutz

Die eingegebenen Werte bleiben im `localStorage` des verwendeten Browsers und werden nicht an einen Server gesendet.
