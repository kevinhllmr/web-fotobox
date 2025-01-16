# Web-Fotobox

Eine moderne Fotobox-Anwendung basierend auf React, die für Events, Partys und Fotostationen konzipiert ist. Sie ermöglicht es Nutzern, Bilder aufzunehmen, eine Vorschau anzuzeigen und das finale Foto zu speichern oder zu teilen.

## Features

- **Live-Vorschau:** Zeigt das Kamerabild in Echtzeit an.
- **Countdown-Timer:** Gibt den Nutzern Zeit, sich auf das Foto vorzubereiten.
- **Fotoaufnahme:** Speichert das Bild nach Ablauf des Timers.
- **Responsives Design:** Optimiert für verschiedene Bildschirmgrößen.
- **Einfache Integration:** Bereit für die Verwendung mit einer Vielzahl von Kamera-Setups.
- **WebRTC-Unterstützung:** Ermöglicht die Echtzeit-Kommunikation und Übertragung von Medieninhalten.
- **WebNFC-Unterstützung:** Integration von NFC-Funktionen für eine nahtlose Interaktion mit NFC-fähigen Geräten. Wird zur Verbindung via RTC benutzt

## Voraussetzungen

- Node.js (Version 16 oder höher)
- Chrome Webbrowser
- Eine Kamera, die mit der gphoto2-Bibliothek kompatibel ist (optional für echte Kameraunterstützung)
     für die Externe Kamera benötigt man Android oder Linux 



## Nutzung
**Produktion bereitstellen:**

   Erstelle eine Produktionsversion der Anwendung:

   ```bash
   npm run build
   or
   ($env:HTTPS = "true") -and (npm start)
   ```
   Die Anwendung ist unter `https://localhost:3000` verfügbar.
## Verzeichnisstruktur

- `src/`
  - Enthält den gesamten Quellcode der React-Anwendung.
  - Wichtige Unterordner:
    - `components/`: Wiederverwendbare UI-Komponenten.
    - `pages/`: Hauptseiten der Anwendung.
    - `utils/`: Hilfsfunktionen und Bibliotheken.

- `public/`
  - Statische Dateien wie Bilder oder Favicon.

## Autoren

- Kevin Hollmeier
- Ricardo Hoppe
- Junhao Ren
