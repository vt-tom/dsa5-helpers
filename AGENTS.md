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
  - `style.css` — Sämtliches Styling; CSS-Custom-Properties in `:root`/`[data-theme='dark']` steuern Light/Dark-Theme. Lädt Fonts direkt aus `../../../systems/dsa5/`, den Fensterrahmen aus `../styles/dsa5-helpers-frame.svg` (wie das Modul).
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
  - `styles/dsa5-helpers-frame.svg` — Fensterrahmen, **generiert** von `tools/gen-frame.cjs` (nach Änderungen am Skript `node tools/gen-frame.cjs`).
  - `lang/de.json`, `lang/en.json` — Lokalisierung.
  - `tests/sheet.test.cjs` — Node-Test-Harness (`node tests/sheet.test.cjs`): kompiliert die echten Templates gegen ein installiertes `foundry-nodejs-v14` + die echten `systems/dsa5`-Dateien, prüft Struktur/Aktionen/Datenpfade/Lokalisierung statisch (kein jsdom, keine Interaktions-Simulation — echte Klicks/Eingaben nur live in Foundry prüfbar).

## Projektplanung & Rückmeldungen (`project/`)

Alles, was nicht Code/Design-Datei ist, liegt in `project/`. Seit 2026-09-24 nur noch zwei aktive Arbeitsdateien — **immer mit diesen beiden anfangen** — plus die Release-Anleitung (seit 2026-09-30):

- [project/AUFGABEN.md](project/AUFGABEN.md) — die eine Arbeitsliste: neue Notizen des Nutzers, Fehler, live zu prüfende Punkte, offene Entscheidungen, Feature-Backlog. Neues oben unter „Neu“, Erledigtes löschen. Der Abschnitt „GitHub-Issues“ (zwischen den `GITHUB-ISSUES`-Markern) wird von `tools/sync-github-issues.cjs` erzeugt — bei Claude Code automatisch per SessionStart-Hook (`.claude/settings.json`), andere Agents rufen `node tools/sync-github-issues.cjs` zu Sessionbeginn selbst auf. Nicht von Hand bearbeiten; Issue-Status wird auf GitHub gepflegt. Er steht immer ganz unten und ist **nur zur Information**: GitHub-Issues werden **nie selbstständig abgearbeitet** — der Nutzer entscheidet, wann welches Issue bearbeitet wird, und beauftragt es ausdrücklich.
- [project/PROJEKTDOKU.md](project/PROJEKTDOKU.md) — Ziel, aktueller Stand, Grundsätze, getroffene Design-Entscheidungen, technische Stolpersteine, Vorgaben zur Zusammenarbeit mit Agents.
- [project/RELEASE.md](project/RELEASE.md) — Anleitung für neue Versionen (Manifest-URL, Tag, GitHub-Release, Action). Nur lesen, wenn ein Release ansteht; bei Änderungen an `release.yml` oder am Ablauf mitpflegen.
- [project/archive/](project/archive/) — **Nicht standardmäßig lesen.** Frühere Dateien (STATUS mit den Feedback-Runden 1–24, PLANNING, BUGS, FEATURES, NOTIZEN, TABS, KI-PROMPTING) und die vollständige Entscheidungs-Historie `DECISIONS.md`. Nur gezielt konsultieren, wenn eine frühere Entscheidung im Detail gebraucht wird.

Außerdem im Root: [CHANGELOG.md](CHANGELOG.md) — jede für Nutzer sichtbare Änderung im selben Zug im Abschnitt der kommenden Version (oben, „unveröffentlicht“) eintragen.

Faustregel: keine neuen Dateien anlegen — Offenes gehört in AUFGABEN.md, dauerhaft Gültiges kurz in PROJEKTDOKU.md.

## CLAUDE.md

Claude Code lädt automatisch `CLAUDE.md` im Projekt-Root, nicht `AGENTS.md`. Damit es nur eine Quelle für Agent-Kontext gibt, importiert `CLAUDE.md` per `@AGENTS.md` einfach dieses Dokument. Änderungen an Agent-Anweisungen also immer hier in `AGENTS.md` vornehmen, nicht in `CLAUDE.md`.

## Technischer Kontext DSA5/Foundry

- Foundry-Module bestehen aus einem `module.json` Manifest, JavaScript/TypeScript-Code, Handlebars-Templates (`.hbs`) oder ggf. anderen UI-Frameworks, sowie CSS/SCSS.
- Das DSA5-Systempaket definiert eigene Actor-/Item-Datenmodelle. Ein alternativer Charakterbogen muss sich in `Actors.registerSheet` beim System `dsa5` registrieren und mit den vorhandenen Datenmodellen des Systems kompatibel sein (nicht neu erfinden).
- Sprache: Die Zielgruppe ist deutschsprachig (Kommentare/Dokumentation in diesem Repo dürfen auf Deutsch sein), UI-Texte sollten i18n-fähig über Foundry's Lokalisierungssystem (`lang/de.json`, `lang/en.json`) eingebunden werden.

## Arbeitsweise für Agents

1. Vor Änderungen [project/AUFGABEN.md](project/AUFGABEN.md) und [project/PROJEKTDOKU.md](project/PROJEKTDOKU.md) lesen, `project/archive/` nur gezielt bei Bedarf.
2. Der `clickdummy/`-Ordner ist die Design-Referenz für den echten Modulcode (`scripts/`/`templates/`/`styles/`), aber nicht blind zu übernehmen — Ziel ist ein sauberes, wartbares Foundry-Modul, das echte Systemlogik erbt statt Optik/Funktion neu zu erfinden.
3. Generierte Dateien (siehe Kopfkommentare) nicht manuell bearbeiten.
4. Erledigte Punkte aus [project/AUFGABEN.md](project/AUFGABEN.md) löschen, neue Fehler/Ideen/Live-Prüfpunkte dort eintragen; dauerhafte Entscheidungen und den Stand kurz in [project/PROJEKTDOKU.md](project/PROJEKTDOKU.md) nachpflegen.
5. Foundry- und DSA5-System-Konventionen einhalten (Datenmodelle, Hooks, Sheet-Registrierung) statt eigene Parallelstrukturen zu bauen, wo es vermeidbar ist.
6. Änderungen am Click-Dummy im Browser über `clickdummy/start-server.bat` prüfen (nicht per `file://` öffnen), da sonst Fonts/Icons/Rahmenbild aus `systems/dsa5` fehlen.
7. **Branch `feature/mobile` (Mobile Support) immer mitziehen:** Nach jedem Commit auf `main` oder einem `release/*`-Branch diesen Stand per `git merge` in `feature/mobile` übernehmen (Konflikte dort lösen). Der Branch hat keine Versionsnummer, der Nutzer legt sie später fest. Details: [project/PROJEKTDOKU.md](project/PROJEKTDOKU.md).
