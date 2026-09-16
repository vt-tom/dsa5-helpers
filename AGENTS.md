# AGENTS.md — Kontext für Coding Agents

Dieses Dokument liefert allen Coding Agents (Copilot, etc.) den notwendigen Kontext, um an diesem Projekt zu arbeiten.

## Projektübersicht

- **Modulname:** `dsa5-helpers`
- **Zielplattform:** [Foundry Virtual Tabletop](https://foundryvtt.com/), Version **v14**
- **Zielsystem:** Das Schwarze Auge 5 (DSA5) — Foundry-Systempaket `dsa5`
- **Modultyp:** Foundry VTT Modul (kein eigenständiges Systempaket), erweitert/ergänzt das bestehende DSA5-System
- **Erstes Ziel:** Ein neuer, alternativer Charakterbogen (Actor Sheet) für DSA5-Charaktere

## Arbeitsordner

Der Workspace-Root ist der Modul-Ordner selbst:
```
d:\FoundryVTT\user-data-paths\v14\Data\modules\dsa5-helpers\
```

- `clickdummy/` — **Design-Referenz**: funktionsfähiger Click-Dummy des neuen Heldenbogens (reines HTML/CSS/JS, kein Framework, kein Foundry-Datenmodell). Hier findet die laufende Design-Iteration statt.
  - `index.html` — Grundgerüst: Toolbar (Theme-Umschalter), Rail-Navigation, Kopf-/Attributbereich, Content-Bereich für Reiter.
  - `style.css` — Sämtliches Styling; CSS-Custom-Properties in `:root`/`[data-theme='dark']` steuern Light/Dark-Theme. Lädt Fonts und das Rahmen-Bild direkt aus `../../../systems/dsa5/`.
  - `data.js` — Statische Demo-/Platzhalterdaten (ein Beispielheld) für alle Reiter; keine echten Actor-Daten.
  - `script.js` — Reine Darstellungslogik: baut DOM-Elemente aus `data.js` für die 8 Reiter (main/skills/combat/magic/religion/inventory/status/notes), Tab-Umschaltung, Theme-Toggle.
  - `assets-map.js` — Zentrale Pfad-Zuordnung `A.*` zu bestehenden Assets in `systems/dsa5/icons/...`; bewusst **keine eigenen/neuen Bilder**, sondern Referenzen auf vorhandene Systemgrafiken.
  - `start-server.bat` — Startet `python -m http.server 8877` auf Data-Root-Ebene und öffnet den Bogen im Browser. **Wichtig:** Click-Dummy nicht per Doppelklick/`file://` öffnen — dann lösen die relativen Pfade zu `systems/dsa5` (Fonts, Icons, Rahmenbild) nicht auf. Immer über dieses Skript bzw. einen Server auf Data-Root-Ebene aufrufen.
- `project/` — Sämtliche Planungs-, Entscheidungs- und Rückmeldungs-Dokumente (kein Code). Siehe nächster Abschnitt.
- Echter Foundry-Modulcode (Stand 2026-09-15, `clickdummy/` bleibt daneben die Design-Referenz):
  - `module.json` — Manifest (Registrierung, Kompatibilität, esmodules/styles/languages).
  - `scripts/dsa5-helpers.js` — init-Hook, Sheet-Registrierung, Partial-Preload, eigene Handlebars-Helfer.
  - `scripts/sheets/dsa5-helpers-character-sheet.js` — Sheet-Klasse, erbt von `globalThis.dsa5.sheets.ActorSheetdsa5Character`.
  - `templates/actors/` — Handlebars-Templates (`dsa5-helpers-character-sheet.hbs` + `parts/*.hbs` je Tab/Baustein).
  - `styles/dsa5-helpers-character-sheet.css` — sämtliches Styling.
  - `lang/de.json`, `lang/en.json` — Lokalisierung.
  - `tests/sheet.test.cjs` — Node-Test-Harness (`node tests/sheet.test.cjs`): kompiliert die echten Templates gegen ein installiertes `foundry-nodejs-v14` + die echten `systems/dsa5`-Dateien, prüft Struktur/Aktionen/Datenpfade/Lokalisierung statisch (kein jsdom, keine Interaktions-Simulation — echte Klicks/Eingaben nur live in Foundry prüfbar).

## Projektplanung & Rückmeldungen (`project/`)

Alles, was nicht Code/Design-Datei ist, liegt gesammelt in `project/`. Seit 2026-09-15 bewusst klein und token-sparend gehalten (vorher ein einzelnes, stark angewachsenes PLANNING.md) — **immer mit [project/STATUS.md](project/STATUS.md) anfangen**, nicht mit der Historie:

- [project/STATUS.md](project/STATUS.md) — Kurzüberblick: was funktioniert, was offen ist, nächster Schritt. Erster Anlaufpunkt vor jeder Session.
- [project/BUGS.md](project/BUGS.md) — offene/gemeldete Fehler.
- [project/FEATURES.md](project/FEATURES.md) — Feature-Ideen und -Backlog.
- [project/PLANNING.md](project/PLANNING.md) — Vision sowie dauerhaft gültige Architektur-/Design-Entscheidungen und wiederverwendbare Muster. Ändert sich selten, nicht die laufende Historie.
- [project/TABS.md](project/TABS.md) — Tab-für-Tab-Checkliste, was im Bearbeiten- bzw. Spielmodus sichtbar/editierbar sein soll. Erledigte Punkte werden gelöscht, Überschriften bleiben stehen.
- [project/NOTIZEN.md](project/NOTIZEN.md) — Kurze, noch unsortierte Ideen/Rückmeldungen des Nutzers, nach Datum. Größere Entscheidungen wandern von hier in PLANNING.md bzw. FEATURES.md/BUGS.md, sobald geklärt.
- [project/KI-PROMPTING.md](project/KI-PROMPTING.md) — Meta-Vorgaben, wie der Nutzer mit Coding-Agents an diesem Projekt zusammenarbeiten möchte (Freigaben, Selbstständigkeit, Ablauf).
- [project/archive/](project/archive/) — **Nicht standardmäßig lesen.** Vollständige Entscheidungs-/Debugging-Historie (`DECISIONS.md`) sowie abgeschlossene bzw. nicht mehr aktive Einzel-Prüfaufträge aus der Click-Dummy-Ära (`UI-UX-REVIEW.md`, `DARKMODE-PRUEFUNG.md`). Nur gezielt konsultieren, wenn eine konkrete frühere Entscheidung/ein früherer Bug im Detail gebraucht wird — sonst unnötiger Token-Verbrauch.

Faustregel für neue Dokumente: kurze, sich schnell erledigende Notizen gehören nach NOTIZEN.md statt in eine neue Datei; nur ein in sich geschlossener, umfangreicher Einzelauftrag bekommt eine eigene Datei, und die gehört dann nach `project/archive/`, sobald er abgeschlossen ist.

## CLAUDE.md

Claude Code lädt automatisch `CLAUDE.md` im Projekt-Root, nicht `AGENTS.md`. Damit es nur eine Quelle für Agent-Kontext gibt, importiert `CLAUDE.md` per `@AGENTS.md` einfach dieses Dokument. Änderungen an Agent-Anweisungen also immer hier in `AGENTS.md` vornehmen, nicht in `CLAUDE.md`.

## Technischer Kontext DSA5/Foundry

- Foundry-Module bestehen aus einem `module.json` Manifest, JavaScript/TypeScript-Code, Handlebars-Templates (`.hbs`) oder ggf. anderen UI-Frameworks, sowie CSS/SCSS.
- Das DSA5-Systempaket definiert eigene Actor-/Item-Datenmodelle. Ein alternativer Charakterbogen muss sich in `Actors.registerSheet` beim System `dsa5` registrieren und mit den vorhandenen Datenmodellen des Systems kompatibel sein (nicht neu erfinden).
- Sprache: Die Zielgruppe ist deutschsprachig (Kommentare/Dokumentation in diesem Repo dürfen auf Deutsch sein), UI-Texte sollten i18n-fähig über Foundry's Lokalisierungssystem (`lang/de.json`, `lang/en.json`) eingebunden werden.

## Arbeitsweise für Agents

1. Vor Änderungen [project/STATUS.md](project/STATUS.md) lesen (aktueller Stand/nächster Schritt), bei Bedarf ergänzt um [project/BUGS.md](project/BUGS.md)/[project/FEATURES.md](project/FEATURES.md). [project/PLANNING.md](project/PLANNING.md) nur für dauerhafte Architektur-Fragen, `project/archive/` nur gezielt bei Bedarf.
2. Der `clickdummy/`-Ordner ist die Design-Referenz für den echten Modulcode (`scripts/`/`templates/`/`styles/`), aber nicht blind zu übernehmen — Ziel ist ein sauberes, wartbares Foundry-Modul, das echte Systemlogik erbt statt Optik/Funktion neu zu erfinden.
3. Generierte Dateien (siehe Kopfkommentare) nicht manuell bearbeiten.
4. Neue dauerhafte Entscheidungen in [project/PLANNING.md](project/PLANNING.md) nachpflegen; laufender Stand/nächste Schritte in [project/STATUS.md](project/STATUS.md), neue Fehler/Ideen in [project/BUGS.md](project/BUGS.md)/[project/FEATURES.md](project/FEATURES.md).
5. Foundry- und DSA5-System-Konventionen einhalten (Datenmodelle, Hooks, Sheet-Registrierung) statt eigene Parallelstrukturen zu bauen, wo es vermeidbar ist.
6. Änderungen am Click-Dummy im Browser über `clickdummy/start-server.bat` prüfen (nicht per `file://` öffnen), da sonst Fonts/Icons/Rahmenbild aus `systems/dsa5` fehlen.
