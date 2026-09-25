# DSA5 Helpers

Ein alternativer, überarbeiteter Charakterbogen für das Foundry-VTT-System `dsa5` — zusätzlich zum bestehenden
Systembogen wählbar, nicht dessen Ersatz. Design-Basis ist der ausführlich iterierte Click-Dummy unter
[`clickdummy/`](clickdummy/) (reines HTML/CSS/JS, keine echten Actor-Daten); siehe [`project/PROJEKTDOKU.md`](project/PROJEKTDOKU.md)
für Stand und Entscheidungen.

## Aktueller Stand (2026-09-15)

Grundgerüst des echten Moduls steht: `module.json`, Einstiegsskript, eine Sheet-Klasse, die direkt von der echten
System-Sheet-Klasse (`game.dsa5.sheets.ActorSheetdsa5Character`) erbt und sich als zusätzliche, nicht-standardmäßige
Sheet-Option für Actor-Typ `character` registriert (`DocumentSheetConfig.registerSheet`). Ein einziges eigenes
Template rendert die komplette Bogenfläche; Reiterwechsel läuft client-seitig (kein natives Foundry-Tab-Part-System).

**Eigenschaften-Tab:** echte Actor-Werte, Ressourcen, Vor-/Nachteile, Sonderfertigkeiten und Erfahrung in eigenem Markup nach dem Click-Dummy.

**Talente-Tab:** fünf Talentkategorien, Suche innerhalb der gewählten Kategorie, echte Proben, FW-Bearbeitung, AP-Steigerungen und Sammelproben. Namen öffnen die Items; per Rechtsklick stehen die geerbten Item-Aktionen bereit. Die Unterkategorie bleibt bei Aktualisierungen des Bogens erhalten.

**Acht weitere Reiter sind Platzhalter:** Titelblatt, Kampf, Magie, Religion, Ausrüstung, Status, Notizen und Gefährten. Favoriten und der durchgängige Spiel-/Bearbeiten-Modus sind noch offen.

## Prüfung der Talent-Erweiterung

JS-Syntax und vollständiges Handlebars-Template geprüft. Gezielte Mock-Prüfungen decken Kategorien, Navigation, Zustandserhalt, FW-Darstellung und Bearbeitungsrechte ab. Eine Live-Prüfung war mangels verbundenem Browser nicht möglich.

In Foundry nach Neuladen den Helfer-Heldenbogen öffnen und den Talente-Reiter prüfen: Kategorie wechseln, Talent suchen, Probe über die drei Eigenschaftswürfel öffnen, FW ändern und AP-Steigerung prüfen. Sammelproben unterstützen die bis zu drei alternativen Talente des Systems. Darstellung mit dem aktiven Foundry-Theme und Speicherung am echten Actor sind noch live zu bestätigen.

## Projektstruktur

```text
module.json                              Manifest
scripts/dsa5-helpers.js                  Einstiegspunkt, Sheet-Registrierung, Handlebars-Helper
scripts/sheets/dsa5-helpers-character-sheet.js   Sheet-Klasse (erbt von game.dsa5.sheets.ActorSheetdsa5Character)
templates/actors/dsa5-helpers-character-sheet.hbs  Das eine große Template (alle Reiter)
styles/dsa5-helpers-character-sheet.css  Stylesheet
lang/de.json, lang/en.json               Übersetzungen
clickdummy/                              Design-Referenz (HTML/CSS/JS-Demo, keine echten Actor-Daten)
project/                                 Planung, Entscheidungsprotokoll, Notizen
```

## Lizenz

MIT (siehe [`LICENSE`](LICENSE)) für den eigenen Modulcode. Enthält keine DSA5-Regeltexte/-Inhalte, nur Verweise
auf bereits vorhandene Assets des DSA5-Systempakets (Apache License 2.0). "Das Schwarze Auge", "Aventurien" und
verwandte Marken gehören Ulisses Spiele GmbH.
