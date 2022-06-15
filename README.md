# ICG Projekt von Gruppe < The Walt Disney Company >
<!-- Ein Bild der Anwendung muss im Ordner ./img relativ zu dieser Datei liegen -->

<img src="img/screenshot.jpg" width="75%">

Dieses Repository beinhaltet das Projekt des Kurses  "Interaktive Computergraphik" von < Daisy Duck, Gustav Gans und Kater Karlo >. 

# Projekt Struktur
<!-- Ihr könnt die Projektstruktur beliebig beschreiben. Hier einfach mit dem Unix Programm `tree`  -->

```
.
├── README.md
├── dist
│   ├── index.html
│   ├── src
│   └── textures <-- Texturen
├── ...
├── img <-- Dokumentation
│   └── screenshot.png
├── obj <-- OBJ Dateien
├── src
│   ├── abgabe.ts <-- Boilerplate 
│   ├── ...
│   ├── loader  <-- shader loader
│   ├── math <-- Mathe Bibliothek
│   ├── parser <-- OBJ Parser
│   ├── renderers 
│   ├── saveload.ts <-- Laden / Speichern
│   └── scene  <-- Szenengraph
│       ├── ...
│       ├── camera.ts
│       ├── ...
│       ├── interaction.ts
│       ├── sceneUtils.ts
│       └── visitors <--  Visitors
└── ...

```

Das Projekt ist in mehreren Ordner thematisch aufgeteilt. 
`dist` beinhaltet Ressourcen die im Browser direkt verwendet werden. In `obj` liegen Beispieldateien, welche durch unseren OBJ Loader in die Szene geladen werden können. 
Unter `src` sind alle Quelldateien zusammengefasst, welche durch `webgl` transpiliert werden.
Hierbei haben wir die Pakete entsprechend ihren Funktionen strukturiert:
- `scene`  umfasst die Datenstrukturen für Szene und deren Interaktion
- ...
- ...

# Installation

Wechseln Sie mit einer Konsole in das Verzeichnis dieser Datei und füren Sie 

```
npm install
```
aus.
### Ausführung
Geben Sie anschließend 
```bash
npm start
```
eingeben und rufen die Website des Servers über to `0.0.0.0:<port>` bzw. `localhost:<port>` im Browser aufrufen. Der Port ist hierbei aus der Ausgabe der Konsole zu ersetzen.



# How-To

Im folgenden wird erklärt wie die Anwendung zu bedienen ist:

## Free Flight Modus

Um zwischen Fester Kamera und Free Flight Modus zu wechseln ...

## Beleuchtungsparameter

Die Slider auf der rechten Seite des Bildes von oben  ... 

### Funktionen 

|Nummer|Punkte|Beschreibung |bearbeitet| Verantwortliche/r |
|------|------|---------------------------------------|---------------|-|
|M1 |6 |Szenengraph | <ul><li>- [ ] </li></ul> | |
|M2 |14 |Rasteriser & Ray Tracer | <ul><li>- [ ] </li></ul> | |
|M3 |5 |min. drei eingebundene Objekte | <ul><li>- [ ] </li></ul> | |
|M4 |7 |min. drei verschiedene Animationsknoten| <ul><li>- [ ] </li></ul> | |
|M5 |4 |mehrfarbige Objekte | <ul><li>- [ ] </li></ul> | |
|M6 |7 |mathematische Bibliothek |<ul><li>- [ ] </li></ul> | |
|M7 |7 |Phong Shader | <ul><li>- [ ] </li></ul> | |
|O1 |6 |mehrere Texturen | <ul><li>- [ ] </li></ul> | |
|O2 |10 |Auswahl und Manipulation von Objekten | <ul><li>- [ ] </li></ul> | |
|O3 |6 |Laden und Speichern | <ul><li>- [ ] </li></ul> | |
|O4 |6 |Model Loader | <ul><li>- [ ] </li></ul> | |
|O5 |8 |Kamera Knoten | <ul><li>- [ ] </li></ul> | |
|O6 |8 |mehrere Lichtquellen |<ul><li>- [ ] </li></ul> | |
|O7 |6 |Free Flight Modus | <ul><li>- [ ] </li></ul> | |




### Kompatibilität
Das Projekt wurde mit folgenden Konfigurationen getestet:
<!-- Nur die Konfigurationen angeben die ihr wirklich getestet habt. Eine gängige Kombination ist hier schon ausreichend-->
- Windows 10 Build Version <> mit
  - Firefox Version <>
  - Chrome Version <> 
  - Edge Version - nein
  - Internet Explorer - nein 
  - node js Version <>
<!--
- Manjaro Build Version <> mit
  - Firefox Version <>
  - Chrome Version <> 
  - Opera Version <>
  - Chromium Version <>
  - node js Version <> 
- macOs Build Version <> mit
  - Firefox Version <>
  - Chrome Version <> 
  - Safari Version <>
  - Chromium Version <>
  - node js Version <>
-->
