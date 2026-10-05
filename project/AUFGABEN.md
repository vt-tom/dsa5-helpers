# AUFGABEN.md — Was noch zu tun ist

Eine Liste für alles Offene: neue Notizen, Fehler, Feature-Ideen, offene Entscheidungen.
Neues einfach oben unter **Neu** eintragen. Erledigtes löschen (Details stehen im Commit).

---

## Neu (noch nicht bearbeitet)

## Version 0.5.0 — veröffentlicht 2026-10-05

Erst als Beta (Pre-release), nach Live-Prüfung am selben Tag zum normalen Release erklärt, `release/0.5.0` nach `main` gemergt, Issues #1, #27, #30, #31 geschlossen. Enthalten: #7 CSS aufräumen, #30 Favoriten Ausrüstung/SF, #1 Gleiten beim Reiterwechsel, #27/#31 Titelblatt-Leiste mit Reitern, Hausregelbuch mit Wundeinschätzung (Knigge) und Helfen, Fokus-Fix bei Eingaben. Release v0.5.0 am selben Tag auf Nutzerwunsch ersetzt (Tag neu gesetzt), um den Urheber „VTTom“ bei „Helfen“ aufzunehmen — wer die erste Fassung schon installiert hatte, bekommt kein Update angeboten.

## Nächste Version: 0.5.1 (Branch `release/0.5.1`)

Angelegt 2026-10-05 (Wunsch VTTom). Enthalten bisher: Bogen-Umschalter mit Vorschau. `module.json` steht noch auf 0.5.0, hochgezählt wird beim Release (RELEASE.md).

## Live in Foundry prüfen

- **Bogen-Umschalter** (0.5.1): Knopf ⇄ in der Titelleiste von Helfer- und Systembogen, Menü-Einträge (Systemstandard, Helfer-Heldenbogen, ggf. weitere), Wechsel als Spieler, neuer Bogen an derselben Stelle, Menü-Position an der Plakette. Vorschau beim Darüberfahren: Wartezeit beim Aufbau, kein Aufblitzen beim Wechsel, keine liegengebliebenen unsichtbaren Fenster (z. B. `foundry.applications.instances` nach dem Schließen des Menüs), keine ungewollten Akteur-Updates durch die Vorschau-Instanzen.
- **#7 Touch:** erst mit dem Mobil-UI (`feature/mobile`).

## Offene Entscheidungen

- Derzeit keine.

## Features / Backlog

Seit 2026-09-30 als GitHub-Issues geführt (#7 CSS aufräumen; #10–#13 mit 0.3.0 erledigt) – siehe unten. Neue Feature-Ideen dort anlegen oder hier kurz notieren.

- **Eigenes HUD des Moduls** (Idee 2026-10-01): ein Einstieg für mehrere Modulfunktionen. Nicht in 0.5.0 (Nutzer 2026-10-05: erst, wenn es mehr Funktionen dafür gibt). Fest eingeplant: Würfelstatistik öffnen (#28), nur wenn sie aktiviert ist. Noch kein Issue.

---

<!-- GITHUB-ISSUES:START -->
## GitHub-Issues

_Automatisch aus `vt-tom/dsa5-helpers` übernommen (2026-10-05 18:36 UTC) — nicht von Hand bearbeiten, wird bei jedem Session-Start überschrieben. Änderungen direkt im Issue auf GitHub vornehmen._

**Nur zur Information — Agents bearbeiten diese Issues nie von sich aus, sondern nur, wenn der Nutzer ein bestimmtes Issue ausdrücklich beauftragt.**

**Offen (0)**

_Keine offenen Issues._

**Kürzlich geschlossen (letzte 14 Tage)**

- **[#31](https://github.com/vt-tom/dsa5-helpers/issues/31) feat: Konzept für die Aufteilung des Reiters Notizen**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.5.0 · 1 Kommentar · geschlossen 2026-10-05
- **[#30](https://github.com/vt-tom/dsa5-helpers/issues/30) feat: Ausrüstung und Sonderfertigkeiten als Favoriten markieren**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.5.0 · 1 Kommentar · geschlossen 2026-10-05
- **[#27](https://github.com/vt-tom/dsa5-helpers/issues/27) feat: Persönliche Daten auf dem Titelblatt anzeigen**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.5.0 · 1 Kommentar · geschlossen 2026-10-05
- **[#1](https://github.com/vt-tom/dsa5-helpers/issues/1) feat: Animation zwischen Titelblatt und den anderen seiten**
  - erledigt · Bearbeiter: @vt-tom · von @Lyynix · Meilenstein: 0.5.0 · 1 Kommentar · geschlossen 2026-10-05
- **[#7](https://github.com/vt-tom/dsa5-helpers/issues/7) chore: CSS-Datei aufräumen**
  - erledigt · Bearbeiter: niemand · von @vt-tom · Labels: enhancement · Meilenstein: 0.5.0 · 1 Kommentar · geschlossen 2026-10-05
- **[#28](https://github.com/vt-tom/dsa5-helpers/issues/28) feat: Würfelstatistik – Ergebnisse je Spieler und Würfeltyp auswerten**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.4.0 · 1 Kommentar · geschlossen 2026-10-02
- **[#29](https://github.com/vt-tom/dsa5-helpers/issues/29) feat: Kampf › Körper – Hände links/rechts der Figur, RS/BE-Badge entfernen, Rüstung neu platzieren**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.4.0 · 1 Kommentar · geschlossen 2026-10-02
- **[#32](https://github.com/vt-tom/dsa5-helpers/issues/32) feat: Unterreiter in allen Reitern wie bei den Talenten (Sprungmarken)**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.4.0 · 1 Kommentar · geschlossen 2026-10-02
- **[#26](https://github.com/vt-tom/dsa5-helpers/issues/26) feat: Persönliche Daten als eigene Registerkarte im Reiter Notizen**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.3.3 · 1 Kommentar · geschlossen 2026-10-01
- **[#25](https://github.com/vt-tom/dsa5-helpers/issues/25) feat: Heldenname im Kopfbereich passt Schriftgröße an die Fensterbreite an**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.3.3 · 1 Kommentar · geschlossen 2026-10-01
- **[#3](https://github.com/vt-tom/dsa5-helpers/issues/3) feat: hover Effekt bei Proben**
  - erledigt · Bearbeiter: niemand · von @Lyynix · 1 Kommentar · geschlossen 2026-10-01
- **[#18](https://github.com/vt-tom/dsa5-helpers/issues/18) feat: Steigerungshelfer – eigenes Fenster zum Planen von Steigerungen und Neuerwerb**
  - geschlossen (nicht geplant) · Bearbeiter: niemand · von @vt-tom · Labels: enhancement · 1 Kommentar · geschlossen 2026-10-01
- **[#24](https://github.com/vt-tom/dsa5-helpers/issues/24) fix: Symbol ⋮ (Toggle Controls) in der Titelleisten-Plakette unsichtbar**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: bug · Meilenstein: 0.3.2 · 1 Kommentar · geschlossen 2026-10-01
- **[#23](https://github.com/vt-tom/dsa5-helpers/issues/23) fix: Traditions-Badge bleibt leer, wenn die Tradition als Sonderfertigkeit hinzugefügt wird**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: bug · Meilenstein: 0.3.2 · 1 Kommentar · geschlossen 2026-10-01
- **[#22](https://github.com/vt-tom/dsa5-helpers/issues/22) feat: Oberer Fensterrahmen mit Foundry-Knöpfen und Verschieben neu gestalten**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.3.2 · 1 Kommentar · geschlossen 2026-10-01
- **[#21](https://github.com/vt-tom/dsa5-helpers/issues/21) feat: Reiter Gefährten je Charakter ausblendbar**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.3.2 · 1 Kommentar · geschlossen 2026-10-01
- **[#20](https://github.com/vt-tom/dsa5-helpers/issues/20) feat: Anderes Symbol für den Reiter Titelblatt**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.3.2 · 1 Kommentar · geschlossen 2026-10-01
- **[#19](https://github.com/vt-tom/dsa5-helpers/issues/19) fix: Porträtrahmen im dunklen Thema passt nicht zum hellen Thema**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: bug · Meilenstein: 0.3.2 · 1 Kommentar · geschlossen 2026-10-01
- **[#17](https://github.com/vt-tom/dsa5-helpers/issues/17) feat: Kompatibilität zu „Lyynix: DSA5 - Steigerungsplaner“**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.3.2 · 1 Kommentar · geschlossen 2026-10-01
- **[#16](https://github.com/vt-tom/dsa5-helpers/issues/16) fix: Spaltenüberschrift „Aktionsdauer“ in der Zaubersprüche-Tabelle bricht um**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: bug · Meilenstein: 0.3.2 · 1 Kommentar · geschlossen 2026-10-01
- **[#15](https://github.com/vt-tom/dsa5-helpers/issues/15) fix: Kreatur auf Favoriten-Fläche wird als Begleiter/Reittier/Gestaltwandlung statt als Favorit hinzugefügt**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: bug · Meilenstein: 0.3.2 · 1 Kommentar · geschlossen 2026-10-01
- **[#14](https://github.com/vt-tom/dsa5-helpers/issues/14) fix: Langer Professionsname läuft aus dem Bogen raus**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: bug · Meilenstein: 0.3.2 · 0 Kommentare · geschlossen 2026-10-01
- **[#13](https://github.com/vt-tom/dsa5-helpers/issues/13) feat: Einstellung – Bogen als Standard für alle Helden (nur SL)**
  - erledigt · Bearbeiter: niemand · von @vt-tom · Labels: enhancement · Meilenstein: 0.3.0 · 2 Kommentare · geschlossen 2026-09-30
- **[#12](https://github.com/vt-tom/dsa5-helpers/issues/12) feat: Changelog in den Moduleinstellungen aufrufbar**
  - erledigt · Bearbeiter: niemand · von @vt-tom · Labels: enhancement · Meilenstein: 0.3.0 · 2 Kommentare · geschlossen 2026-09-30
- **[#11](https://github.com/vt-tom/dsa5-helpers/issues/11) feat: Changelog nach einem Update in Foundry anzeigen**
  - erledigt · Bearbeiter: niemand · von @vt-tom · Labels: enhancement · Meilenstein: 0.3.0 · 2 Kommentare · geschlossen 2026-09-30
- **[#10](https://github.com/vt-tom/dsa5-helpers/issues/10) feat: Heldenerschaffung (Chargen-Wizard) aus der Kopfzeile starten**
  - erledigt · Bearbeiter: niemand · von @vt-tom · Labels: enhancement · Meilenstein: 0.3.0 · 3 Kommentare · geschlossen 2026-09-30
- **[#9](https://github.com/vt-tom/dsa5-helpers/issues/9) feat: OnUseEffect-Würfelknöpfe bei Items und Sonderfertigkeiten**
  - erledigt · Bearbeiter: niemand · von @vt-tom · Labels: enhancement · 1 Kommentar · geschlossen 2026-09-30
- **[#8](https://github.com/vt-tom/dsa5-helpers/issues/8) feat: Zielen bei Fernkampfwaffen anzeigen**
  - erledigt · Bearbeiter: niemand · von @vt-tom · Labels: enhancement · 1 Kommentar · geschlossen 2026-09-30
- **[#4](https://github.com/vt-tom/dsa5-helpers/issues/4) bug: Umrandung bei Zaubern (und vmtl auch Liturgien) entfernen**
  - erledigt · Bearbeiter: niemand · von @Lyynix · 0 Kommentare · geschlossen 2026-09-30
- **[#5](https://github.com/vt-tom/dsa5-helpers/issues/5) Favoriten - Layout verbessern**
  - erledigt · Bearbeiter: niemand · von @vt-tom · 1 Kommentar · geschlossen 2026-09-30
- **[#6](https://github.com/vt-tom/dsa5-helpers/issues/6) Kampf Tab: Alternatives Layout**
  - erledigt · Bearbeiter: niemand · von @vt-tom · 1 Kommentar · geschlossen 2026-09-30
<!-- GITHUB-ISSUES:END -->
