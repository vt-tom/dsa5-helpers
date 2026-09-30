# AUFGABEN.md — Was noch zu tun ist

Eine Liste für alles Offene: neue Notizen, Fehler, Feature-Ideen, offene Entscheidungen.
Neues einfach oben unter **Neu** eintragen. Erledigtes löschen (Details stehen im Commit).

---

## Neu (noch nicht bearbeitet)

## Live in Foundry prüfen

- **Installation per Manifest-URL (v0.1.0):** in einer *anderen* Foundry-Installation bzw. einem anderen Data-Ordner testen — hier liegt unter `modules/dsa5-helpers` das Git-Arbeitsverzeichnis, eine Installation/ein Update über Foundry würde es überschreiben.

- **Kampf › Körper, beidhändige Waffe:** die eine Hand (Titel, Name, Kachel, TP, Auswahl) sitzt jetzt rechtsbündig an der Außenkante statt mittig. Passt das?
- **Eigenschaften, Bearbeiten-Modus:** brechen die Labels „LeP regenerieren“ / „AsP regenerieren“ / „KaP regenerieren“ in der Grundwerte-Tabelle um?

## Offene Entscheidungen

- **Ersetzt „Körper“ später die Übersicht?** Erst nach dem Feedback der Tester entscheiden (Rückmeldung 2026-09-30: vorerst beide Bögen).
- **Eigenschaften-Tab:** LeP/AsP/KaP stehen doppelt (Karten im Kopf + Grundwerte-Tabelle). In der Tabelle weglassen (dann fehlen dort Mod/Zukauf im Bearbeiten-Modus) oder so lassen?
- **Eigenschaften-Tab:** linke Spalte (Vor-/Nachteile, SF, Sprachen) und rechte Spalte (Grundwerte, AP) sind je nach Held sehr unterschiedlich lang. Umbauen (z. B. AP nach links) oder so lassen?

## Features / Backlog

- **CSS-Datei aufräumen:** nach Tabs/Komponenten sortieren, einheitlich formatieren. Zurückgestellt, weil die Reihenfolge an manchen Stellen das Verhalten bestimmt – braucht danach einen gründlichen Live-Test.
- **Zielen bei Fernkampfwaffen** anzeigen (System: `aimTime.progress`, 0/2) — fehlt im Modul bisher ganz.
- **OnUseEffect-Würfel-Buttons** bei Items/Sonderfertigkeiten mit Effekt (Kampf, Magie, Religion, Ausrüstung).
- **Heldenerschaffung starten** (Chargen-Wizard) in der Kopfzeile – wie im Systembogen.

---

<!-- GITHUB-ISSUES:START -->
## GitHub-Issues

_Automatisch aus `vt-tom/dsa5-helpers` übernommen (2026-09-30 05:54 UTC) — nicht von Hand bearbeiten, wird bei jedem Session-Start überschrieben. Änderungen direkt im Issue auf GitHub vornehmen._

**Nur zur Information — Agents bearbeiten diese Issues nie von sich aus, sondern nur, wenn der Nutzer ein bestimmtes Issue ausdrücklich beauftragt.**

**Offen (5)**

- **[#1](https://github.com/vt-tom/dsa5-helpers/issues/1) feat: Animation zwischen Titelblatt und den anderen seiten**
  - offen · Bearbeiter: niemand · von @Lyynix · 0 Kommentare · zuletzt geändert 2026-09-17
- **[#3](https://github.com/vt-tom/dsa5-helpers/issues/3) feat: hover Effekt bei Proben**
  - offen · Bearbeiter: niemand · von @Lyynix · 0 Kommentare · zuletzt geändert 2026-09-17
- **[#4](https://github.com/vt-tom/dsa5-helpers/issues/4) bug: Umrandung bei Zaubern (und vmtl auch Liturgien) entfernen**
  - offen · Bearbeiter: niemand · von @Lyynix · 0 Kommentare · zuletzt geändert 2026-09-17
- **[#5](https://github.com/vt-tom/dsa5-helpers/issues/5) Favoriten - Layout verbessern**
  - offen · Bearbeiter: niemand · von @vt-tom · 0 Kommentare · zuletzt geändert 2026-09-20
- **[#6](https://github.com/vt-tom/dsa5-helpers/issues/6) Kampf Tab: Alternatives Layout**
  - offen · Bearbeiter: niemand · von @vt-tom · 0 Kommentare · zuletzt geändert 2026-09-20

**Kürzlich geschlossen (letzte 14 Tage)**

- **[#2](https://github.com/vt-tom/dsa5-helpers/issues/2) bug: Größenveränderung bei Hover führt zu Neuanordnung der Elemente**
  - erledigt · Bearbeiter: niemand · von @Lyynix · 1 Kommentar · geschlossen 2026-09-19
<!-- GITHUB-ISSUES:END -->
