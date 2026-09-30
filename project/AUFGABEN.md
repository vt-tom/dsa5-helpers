# AUFGABEN.md — Was noch zu tun ist

Eine Liste für alles Offene: neue Notizen, Fehler, Feature-Ideen, offene Entscheidungen.
Neues einfach oben unter **Neu** eintragen. Erledigtes löschen (Details stehen im Commit).

---

## Neu (noch nicht bearbeitet)

- **DSA5-System 8.1.5 → 8.1.8 prüfen:** Lokal entwickeln wir gegen DSA5 8.1.5 (`module.json` → `relationships.systems[0].compatibility.verified`), aktuell ist 8.1.8. Änderungen der Zwischenversionen auf Auswirkungen fürs Modul prüfen — v. a. geerbte Sheet-Klasse `ActorSheetdsa5Character` (Aktionen/`ownerActions`, `_prepareContext`/`prepare.*`), eingebundene System-Templates (`actor-companion.hbs`, `companion-card.hbs`, `member-card-header.hbs`, `horse.hbs`), Sprachschlüssel und Datenpfade. Danach lokal aktualisieren, `node tests/sheet.test.cjs` laufen lassen (prüft gegen die installierten Systemdateien), live testen und `verified` hochsetzen.

## Version 0.3.0 (Branch `release/0.3.0`)

Alles live bestätigt, Release vorbereitet (`version` 0.3.0, CHANGELOG datiert). Offen nach Freigabe: nach `main` mergen, Tag `v0.3.0`, GitHub-Release, Issues #10–#13 schließen, Meilenstein schließen — siehe [RELEASE.md](RELEASE.md).

## Offene Entscheidungen

- **Ersetzt „Körper“ später die Übersicht?** Erst nach dem Feedback der Tester entscheiden (Rückmeldung 2026-09-30: vorerst beide Bögen).

## Features / Backlog

Seit 2026-09-30 als GitHub-Issues geführt (#7 CSS aufräumen; #10–#13 für 0.3.0, siehe oben) – siehe unten. Neue Feature-Ideen dort anlegen oder hier kurz notieren.

---

<!-- GITHUB-ISSUES:START -->
## GitHub-Issues

_Automatisch aus `vt-tom/dsa5-helpers` übernommen (2026-09-30 11:46 UTC) — nicht von Hand bearbeiten, wird bei jedem Session-Start überschrieben. Änderungen direkt im Issue auf GitHub vornehmen._

**Nur zur Information — Agents bearbeiten diese Issues nie von sich aus, sondern nur, wenn der Nutzer ein bestimmtes Issue ausdrücklich beauftragt.**

**Offen (7)**

- **[#1](https://github.com/vt-tom/dsa5-helpers/issues/1) feat: Animation zwischen Titelblatt und den anderen seiten**
  - offen · Bearbeiter: niemand · von @Lyynix · 0 Kommentare · zuletzt geändert 2026-09-17
- **[#3](https://github.com/vt-tom/dsa5-helpers/issues/3) feat: hover Effekt bei Proben**
  - offen · Bearbeiter: niemand · von @Lyynix · 1 Kommentar · zuletzt geändert 2026-09-30
- **[#7](https://github.com/vt-tom/dsa5-helpers/issues/7) chore: CSS-Datei aufräumen**
  - offen · Bearbeiter: niemand · von @vt-tom · Labels: enhancement · 0 Kommentare · zuletzt geändert 2026-09-30
- **[#10](https://github.com/vt-tom/dsa5-helpers/issues/10) feat: Heldenerschaffung (Chargen-Wizard) aus der Kopfzeile starten**
  - offen · Bearbeiter: niemand · von @vt-tom · Labels: enhancement · Meilenstein: 0.3.0 · 2 Kommentare · zuletzt geändert 2026-09-30
- **[#11](https://github.com/vt-tom/dsa5-helpers/issues/11) feat: Changelog nach einem Update in Foundry anzeigen**
  - offen · Bearbeiter: niemand · von @vt-tom · Labels: enhancement · Meilenstein: 0.3.0 · 1 Kommentar · zuletzt geändert 2026-09-30
- **[#12](https://github.com/vt-tom/dsa5-helpers/issues/12) feat: Changelog in den Moduleinstellungen aufrufbar**
  - offen · Bearbeiter: niemand · von @vt-tom · Labels: enhancement · Meilenstein: 0.3.0 · 1 Kommentar · zuletzt geändert 2026-09-30
- **[#13](https://github.com/vt-tom/dsa5-helpers/issues/13) feat: Einstellung – Bogen als Standard für alle Helden (nur SL)**
  - offen · Bearbeiter: niemand · von @vt-tom · Labels: enhancement · Meilenstein: 0.3.0 · 1 Kommentar · zuletzt geändert 2026-09-30

**Kürzlich geschlossen (letzte 14 Tage)**

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
- **[#2](https://github.com/vt-tom/dsa5-helpers/issues/2) bug: Größenveränderung bei Hover führt zu Neuanordnung der Elemente**
  - erledigt · Bearbeiter: niemand · von @Lyynix · 1 Kommentar · geschlossen 2026-09-19
<!-- GITHUB-ISSUES:END -->
