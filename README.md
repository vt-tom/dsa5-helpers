# DSA5 Helpers

Ein alternativer, überarbeiteter Heldenbogen für das Foundry-VTT-System `dsa5` — zusätzlich zum Systembogen wählbar,
nicht dessen Ersatz. Alle Würfe, Berechnungen und Datenzugriffe kommen aus dem DSA5-System; der Bogen ordnet sie nur
übersichtlicher an.

## Installation

In Foundry unter **Add-on-Module → Modul installieren** diese Manifest-URL eintragen:

```text
https://github.com/vt-tom/dsa5-helpers/releases/latest/download/module.json
```

**Beta-Kanal (für Tester):** Wer neue Versionen vorab testen möchte, trägt stattdessen diese Manifest-URL ein. Darüber
kommen Beta-Versionen und auch alle stabilen Versionen:

```text
https://github.com/vt-tom/dsa5-helpers/releases/download/beta/module.json
```

Zurück zum stabilen Kanal: Modul deinstallieren und mit der ersten URL neu installieren (Einstellungen bleiben in der
Welt erhalten).

Danach das Modul in der Welt aktivieren und beim Helden über **Bogen → Bogenkonfiguration** den Bogen „DSA5 Helfer-Heldenbogen“
wählen.

**Voraussetzungen:** Foundry VTT v14 (≥ 14.364), System DSA5 ≥ 8.1.5.

### Beta für Foundry v13 (seit 0.6.2)

Für Foundry **13.351 mit DSA5 7.5.1** gibt es eine getrennte Desktop-Beta mit eigenem Kanal. In der v13-Installation
diese Manifest-URL eintragen:

```text
https://github.com/vt-tom/dsa5-helpers/releases/download/foundry-v13-beta/module.json
```

Updates kommen dann nur aus diesem Kanal, die v14-Ausgabe wird nie angeboten. Weltdaten müssen weder kopiert noch
migriert werden. Gebaut wird die Ausgabe vom Branch `v13` (Ablauf in [docs/RELEASE.md](docs/RELEASE.md)).

Lokal bauen und einspielen (Entwicklung), mit Sicherung des alten Modulordners unter
`D:\FoundryBackups\<Zeit>\dsa5-helpers-v13\previous-module` und SHA-256-Prüfung:

```powershell
python tools/package-module.py --foundry 13 --install D:/FoundryVTT/user-data-paths/v13/Data
```

Danach im Browser F5; Foundry selbst muss nicht neu starten.

V13 bietet vorhandene DSA7-Funktionen einschließlich Reittier im Kampf-Reiter und magischer Traditionsartefakte.
Gefährten-/Auftragsverwaltung, neue Zeremonialgegenstände, Kraftspeicher, Lebensenergiezonen und Modul-Mobiloberfläche
entfallen. Die Erweiterungen „Helfen“ und „Grundmanöver“ benötigen den DSA8-Modifikatoren-Hook und sind ebenfalls ausgeblendet;
Wundeinschätzung und Würfelstatistik bleiben verfügbar. Optionale Fremdmodule müssen selbst zu v13 passen.

Die Ausgabe ist statisch gegen die v13-Quellen geprüft; die interaktive Foundry-Abnahme erfolgt durch die Tester.
`python tools/package-module.py --foundry 14` erzeugt separat die v14-Beta. Stabile Linien starten später bei
7.0.0 (v13) und 8.0.0 (v14); Modul-ID und gespeicherte Bogenzuordnung bleiben erhalten.

## Funktionen

- Zehn Reiter: Titelblatt, Eigenschaften, Talente, Kampf (Körper, Kampftechniken), Magie, Religion,
  Ausrüstung, Status, Notizen, Gefährten.
- Würfelstatistik (von der Spielleitung einschaltbar, jeder Spieler stimmt selbst zu).
- Hausregelbuch: optionale Hausregeln, als Liste oder Buch zu lesen, von der Spielleitung je Welt einschaltbar. Regeln: Wundeinschätzung (Idee: Knigge), Helfen.
- Spiel- und Bearbeiten-Modus, Favoriten (Stern) auf dem Titelblatt.
- Kraftspeicher als zusätzliche Kugel am AsP-Vorrat, mit radialer Übersicht und dem Ladedialog des Systems (nur bei vorhandener Systemunterstützung).
- Zonen-LeP im Kampf-Reiter, wenn die Lebensenergiezonen in Rüstkammer II aktiv sind; Bearbeiten über deren Zonen-Dialog.
- Magie/Religion nur bei passender Fähigkeit sichtbar.
- Deutsch und Englisch.
- Arbeitet mit [„Lyynix: DSA5 - Steigerungsplaner“](https://github.com/Lyynix/dsa5-steigerungsplaner) zusammen:
  Shift-Klick auf „+“/„−“ plant im Bearbeiten-Modus, eigener Reiter „Steigerungsplaner“ (nur wenn der Planer aktiv ist).

## Neue Version veröffentlichen

Verbindlicher Ablauf: [`docs/RELEASE.md`](docs/RELEASE.md).
Interne Projektinformationen: [Projektdokumentation](.projects/PROJEKTDOKU.md), [Aufgaben](.projects/AUFGABEN.md); KI-Arbeitsregeln: [AGENTS.md](AGENTS.md).

## Projektstruktur

```text
module.json                 Manifest
scripts/                    Einstieg, Sheet-Registrierung, Sheet-Klasse (erbt von der DSA5-Charakterbogen-Klasse)
templates/actors/           Handlebars-Templates (ein Hauptbogen + Teil-Templates je Reiter)
styles/                     Stylesheet
lang/                       Übersetzungen (de, en)
clickdummy/                 Design-Referenz (HTML/CSS/JS ohne Foundry) – nicht Teil des Releases
.projects/                  Zentrale Aufgaben und Projektdokumentation – nicht Teil des Releases
docs/                    Spezialdokumentation und Historie – nicht Teil des Releases
tests/                      Test-Harness (`node tests/sheet.test.cjs`, braucht lokales Foundry + DSA5)
```

## Lizenz

MIT (siehe [`LICENSE`](LICENSE)) für den eigenen Modulcode. Enthält keine DSA5-Regeltexte/-Inhalte, nur Verweise
auf bereits vorhandene Assets des DSA5-Systempakets. „Das Schwarze Auge“, „Aventurien“ und verwandte Marken gehören
Ulisses Spiele GmbH.
