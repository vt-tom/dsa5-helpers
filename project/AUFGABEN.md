# AUFGABEN.md — Was noch zu tun ist

Eine Liste für alles Offene: neue Notizen, Fehler, Feature-Ideen, offene Entscheidungen.
Neues einfach oben unter **Neu** eintragen. Erledigtes löschen (Details stehen im Commit).

---

## Neu (noch nicht bearbeitet)

## Version 0.4.0 (Plan, Änderungen vorbehalten)

Branch `release/0.4.0` (von `main`, 0.3.3 ist veröffentlicht) — zugleich der Beta-Branch. **Stand 2026-10-02:** Version 0.4.0 als Beta veröffentlicht (Pre-release `v0.4.0`, nur über die Beta-Manifest-URL `https://github.com/vt-tom/dsa5-helpers/releases/download/beta/module.json`, siehe RELEASE.md „Beta-Kanal“); stabiler Kanal zeigt weiter 0.3.3. Nach dem Beta-Test: dasselbe Release zum normalen erklären, dann nach `main` mergen.

1. **#28 Würfelstatistik** — umgesetzt (Darstellung B „Karten“), live zu prüfen (siehe unten). Rückmeldungen vom 2026-10-02 eingearbeitet: Spieler sehen nur die eigene Statistik, die SL alle; Löschen mit Mülleimer statt Kreispfeil; Zeitraum-Filter (Gesamt / Tag / eigener Zeitraum) mit einem Zähler-Topf je Tag (Tag reicht bis 6 Uhr, altes Format wird übernommen); Tage älter als 12 Monate werden beim Speichern zusammengefasst (Gesamt bleibt richtig, höchstens rund 365 Töpfe ≈ 40 KB je Spieler, bei wöchentlichem Spiel eher 5–8 KB). Einstieg bleibt vorerst nur über die Moduleinstellungen (Nutzer-Entscheidung 2026-10-02), später kommt die Statistik in eine eigene Modul-Oberfläche (siehe Backlog „HUD“).
2. **#29 Kampf › Körper** — umgesetzt (Modul + Click-Dummy, 2026-10-02): oben Schnellaktionen und Initiative; Rüstungsschild (RS groß, BE, Zauber-/Liturgie-Bonus klein; Tooltip mit allen Rüstungsteilen) rechtsbündig in der Rüstungszeile. Die Übersicht ist entfallen; statt ihrer Waffentabellen eine Kurzübersicht „Weitere Waffen“ (getragene Waffen außerhalb der Hände und Angriffe aus Eigenschaften, mit Würfeln, TP, Stern, Kontextmenü). Munitionswahl jetzt in der Fernkampfhand. Nicht mehr im Körper-Reiter: „+“-Menü zum Ausrüsten (geht über die Hand-Auswahl) und Griff-Knöpfe (geht über die Hand-Auswahl bzw. Rechtsklick im Ausrüstungs-Reiter).
3. **#32 Unterreiter wie bei den Talenten (Sprungmarken) in allen Reitern** — umgesetzt (Modul + Click-Dummy, 2026-10-02): Kampf, Magie, Religion und Notizen zeigen alle Abschnitte untereinander, Unterreiter springen hin, die Markierung wandert beim Scrollen mit. Notizfelder dafür mindestens 200 statt 360 px hoch. Live zu prüfen (siehe unten); das Notizen-Konzept (#31) bleibt davon unberührt offen.

**#7 CSS aufräumen** auf 0.5.0 verschoben (Nutzer-Entscheidung 2026-10-02, Meilenstein gesetzt) — vorher mit `feature/mobile` abstimmen, dort wird dieselbe CSS-Datei stark umgebaut.

Kandidaten, noch ohne Meilenstein:
- **#1 Animation zwischen Titelblatt und den anderen Seiten** (von @Lyynix, ohne Beschreibung) — klären, was gemeint ist.
- **#27 Persönliche Daten auf dem Titelblatt** — nur, wenn bis dahin eine passende Lösung gefunden ist.
- **HUD des Moduls** (siehe Backlog) — würde zum Einstieg der Würfelstatistik passen, ist aber eigenständig zu planen.

## Live in Foundry prüfen (0.4.0)

- **#28 Würfelstatistik** (mindestens zwei Benutzer, Spieler + SL): Zustimmungsdialog beim Verbinden und beim Einschalten durch die SL; Zustimmung ja/nein/zurückgezogen (Daten ausgeblendet, bei erneuter Zustimmung wieder da und weitergezählt); gezählt werden Proben, Schaden, Schips-Neuwurf, Initiative, `/roll`, blinde/SL-Würfe; echte Würfel (Würfeleinstellung „manuell“) getrennt; Neuladen kurz nach einem Wurf (wird noch gespeichert?); Fenster aktualisiert sich live; Zurücksetzen durch die SL (einzeln/alle); Spieler sehen keinen Zurücksetzen-Knopf; Hell/Dunkel.
- **#28 Würfelstatistik, Nachtrag:** Spieler sehen nur die eigene Karte (kein Löschen, keine Liste ohne Zustimmung), ohne Zustimmung Hinweis statt Karte; Zeitraum-Auswahl (Spielabende, eigener Zeitraum mit Datumsfeldern); Würfe nach Mitternacht landen beim Vorabend; bestehende Statistik aus dem ersten Format bleibt erhalten.
- **#28 Würfelstatistik, 12 Monate:** Auswahl „Zeitraum“ listet Tage (Datum, nicht „Spielabend“); Würfe außerhalb der Runde landen beim jeweiligen Tag.
- **#32 Sprungmarken:** in Kampf, Magie, Religion, Notizen: Klick auf Unterreiter scrollt weich zum Abschnitt; beim Scrollen wandert die Markierung mit, ganz unten der letzte Abschnitt; Reiterwechsel beginnt oben mit dem ersten Abschnitt; Kampftechniken-Suche klebt nur im eigenen Abschnitt; Sprung aus der Waffe zur Kampftechnik; Notiz-Editoren (Bearbeiten-Modus) untereinander; Private/SL-Notizen nur für Berechtigte.
- **#29 Kampf › Körper:** Haupthand links, Nebenhand rechts; beidhändige Waffe per „⇄“ verschieben (nur Bearbeiten-Modus, bleibt nach Neuladen auf der Seite); freie Nebenhand rechts; Fernkampfhand rechts (Nachladen/Zielen rechtsbündig); Schnellaktionen und Initiative ganz oben, Rüstungsschild rechts in der Rüstungszeile (Tooltip: alle Teile, Zauber-/Liturgie-Schutz, Belastung); viele Rüstungsteile (Umbruch); schmale Fensterbreite; Hell/Dunkel. Ohne Übersicht: Kampf-Reiter öffnet mit „Körper“; Munitionswahl in der Fernkampfhand; Kurzübersicht „Weitere Waffen“ (würfeln, TP, Stern, Rechtsklick-Kontextmenü, Angriffe aus Eigenschaften wie Biss); nicht getragene Waffen über die Hand-Auswahl ausrüsten.

## Offene Entscheidungen

- **#27 Persönliche Daten auf dem Titelblatt:** wieder ausgebaut (2026-10-01), erst klären, ob und wie es aufs Titelblatt passt. Bisherige Versuche siehe PROJEKTDOKU.md (Design-Entscheidungen, „Titelblatt, persönliche Daten“).

## Features / Backlog

Seit 2026-09-30 als GitHub-Issues geführt (#7 CSS aufräumen; #10–#13 mit 0.3.0 erledigt) – siehe unten. Neue Feature-Ideen dort anlegen oder hier kurz notieren.

- **Eigenes HUD des Moduls** (Idee 2026-10-01): ein Einstieg für mehrere Modulfunktionen, z. B. die Würfelstatistik (#28, vorerst nur über die Moduleinstellungen). Noch kein Issue.

---

<!-- GITHUB-ISSUES:START -->
## GitHub-Issues

_Automatisch aus `vt-tom/dsa5-helpers` übernommen (2026-10-02 09:43 UTC) — nicht von Hand bearbeiten, wird bei jedem Session-Start überschrieben. Änderungen direkt im Issue auf GitHub vornehmen._

**Nur zur Information — Agents bearbeiten diese Issues nie von sich aus, sondern nur, wenn der Nutzer ein bestimmtes Issue ausdrücklich beauftragt.**

**Offen (8)**

- **[#1](https://github.com/vt-tom/dsa5-helpers/issues/1) feat: Animation zwischen Titelblatt und den anderen seiten**
  - offen · Bearbeiter: niemand · von @Lyynix · 0 Kommentare · zuletzt geändert 2026-09-17
- **[#7](https://github.com/vt-tom/dsa5-helpers/issues/7) chore: CSS-Datei aufräumen**
  - offen · Bearbeiter: niemand · von @vt-tom · Labels: enhancement · Meilenstein: 0.5.0 · 0 Kommentare · zuletzt geändert 2026-10-02
- **[#27](https://github.com/vt-tom/dsa5-helpers/issues/27) feat: Persönliche Daten auf dem Titelblatt anzeigen**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · 0 Kommentare · zuletzt geändert 2026-10-01
- **[#28](https://github.com/vt-tom/dsa5-helpers/issues/28) feat: Würfelstatistik – Ergebnisse je Spieler und Würfeltyp auswerten**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.4.0 · 0 Kommentare · zuletzt geändert 2026-10-01
- **[#29](https://github.com/vt-tom/dsa5-helpers/issues/29) feat: Kampf › Körper – Hände links/rechts der Figur, RS/BE-Badge entfernen, Rüstung neu platzieren**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.4.0 · 0 Kommentare · zuletzt geändert 2026-10-01
- **[#30](https://github.com/vt-tom/dsa5-helpers/issues/30) feat: Ausrüstung und Sonderfertigkeiten als Favoriten markieren**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · 0 Kommentare · zuletzt geändert 2026-10-02
- **[#31](https://github.com/vt-tom/dsa5-helpers/issues/31) feat: Konzept für die Aufteilung des Reiters Notizen**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · 0 Kommentare · zuletzt geändert 2026-10-02
- **[#32](https://github.com/vt-tom/dsa5-helpers/issues/32) feat: Unterreiter in allen Reitern wie bei den Talenten (Sprungmarken)**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.4.0 · 0 Kommentare · zuletzt geändert 2026-10-02

**Kürzlich geschlossen (letzte 14 Tage)**

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
- **[#2](https://github.com/vt-tom/dsa5-helpers/issues/2) bug: Größenveränderung bei Hover führt zu Neuanordnung der Elemente**
  - erledigt · Bearbeiter: niemand · von @Lyynix · 1 Kommentar · geschlossen 2026-09-19
<!-- GITHUB-ISSUES:END -->
