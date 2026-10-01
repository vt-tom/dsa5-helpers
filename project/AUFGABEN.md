# AUFGABEN.md — Was noch zu tun ist

Eine Liste für alles Offene: neue Notizen, Fehler, Feature-Ideen, offene Entscheidungen.
Neues einfach oben unter **Neu** eintragen. Erledigtes löschen (Details stehen im Commit).

---

## Neu (noch nicht bearbeitet)

## Live zu prüfen (0.3.2, Branch `release/0.3.2`)

- **#14 Kopf:** Held mit sehr langem Professionsnamen → Feld endet mit „…“ innerhalb des Kopfs, Tooltip zeigt den vollen Namen (Spiel- **und** Bearbeiten-Modus); Bearbeiten/Tippen im Feld geht weiter; Kopf lässt sich auf dem gesperrten Feld weiter ziehen.
- **#15 Gefährten:** Kreatur auf „Favoriten zum Schnellauswählen hierher ziehen“ → landet als Favorit; Drop daneben → Auswahldialog wie bisher (mit Beschwörungsfavorit als Vorauswahl, wenn der Held beschwören kann). Nebenwirkung wie im Systembogen: Rüstung im Reiter „Kampf“ auf den Bogen ziehen → wird gleich angelegt.
- **#17 Steigerungsplaner** (Modul `dsa5-steigerungsplaner` + libWrapper aktiv): Bearbeiten-Modus, Shift-Klick auf „+“ bei Talent/Zauber/Eigenschaft/LeP → **keine AP weg**, „+N“-Zähler am Knopf (Position bei Eigenschaften und LeP/AsP/KaP prüfen), Tooltip „Shift-Klick: im Planer vormerken“; Reiter „Steigerungsplaner“ zeigt den Plan, Anwenden (Pfeil, Kachel) und Verwerfen (×, Papierkorb) funktionieren; normaler Klick auf „+“ steigert und verbraucht den passenden Plan-Schritt. Ohne Planer: kein Reiter, Steigern unverändert. Spieler ohne Besitzrecht sehen den Reiter nicht. Bei Systemeinstellung „Bewegung reduzieren“ Anwenden/Verwerfen erneut prüfen.
- **#19 Porträtrahmen:** dunkles Thema → Rahmen im Kopf und auf dem Titelblatt wie im hellen Thema (dunkle Linie + Goldsaum).
- **#20 Symbol Titelblatt:** aufgeschlagenes Buch (`Spellextension.webp`) in der Reiterleiste, aktiv (helle Kachel) und inaktiv gut erkennbar.
- **#23 Traditions-Badge:** Tradition nur als Sonderfertigkeit (Textfeld leer) → Badge in Religion bzw. Magie zeigt Namen + Symbol (z. B. Hesindekirche/Hesinde), Klick öffnet die Sonderfertigkeit; Bearbeiten-Modus: Textfeld zeigt den Namen als Platzhalter.
- **#22 Fensterrahmen:** neuer Rahmen (Knotenband, oben 24 px) ohne Verzerrung bei verschiedenen Fenstergrößen (auch nach Größe-Ändern); Plakette mit allen Knöpfen oben rechts, ragt über den Rahmen und wird **nicht abgeschnitten**; Ziehen an Plakette, oberem Rahmenband und freien Kopfstellen; Doppelklick minimiert → 40 px Rahmenleiste mit Name + ✕, Doppelklick/✕ wie gewohnt; ⋮-Menü öffnet unter der Plakette; dunkles Thema; Größen-Griff unten rechts.
- **#21 Gefährten ausblenden:** Menü „⋮“ am Bogen › „Reiter Gefährten ausblenden“ → Reiter weg (war er offen: Titelblatt), Eintrag heißt danach „… einblenden“ und holt ihn zurück; gilt nur für diesen Helden und bleibt nach Neuladen; Spieler ohne Besitzrecht sehen den Eintrag nicht.
- **#16 Tabellenköpfe:** Magie/Religion „Aktionsdauer“ einzeilig; Talente „Belastung“; Eigenschaften › Grundwerte im Bearbeiten-Modus „Aktuell“ — auch auf Englisch.

## Offene Entscheidungen

- **Ersetzt „Körper“ später die Übersicht?** Erst nach dem Feedback der Tester entscheiden (Rückmeldung 2026-09-30: vorerst beide Bögen).

## Features / Backlog

Seit 2026-09-30 als GitHub-Issues geführt (#7 CSS aufräumen; #10–#13 mit 0.3.0 erledigt) – siehe unten. Neue Feature-Ideen dort anlegen oder hier kurz notieren.

---

<!-- GITHUB-ISSUES:START -->
## GitHub-Issues

_Automatisch aus `vt-tom/dsa5-helpers` übernommen (2026-10-01 09:10 UTC) — nicht von Hand bearbeiten, wird bei jedem Session-Start überschrieben. Änderungen direkt im Issue auf GitHub vornehmen._

**Nur zur Information — Agents bearbeiten diese Issues nie von sich aus, sondern nur, wenn der Nutzer ein bestimmtes Issue ausdrücklich beauftragt.**

**Offen (13)**

- **[#1](https://github.com/vt-tom/dsa5-helpers/issues/1) feat: Animation zwischen Titelblatt und den anderen seiten**
  - offen · Bearbeiter: niemand · von @Lyynix · 0 Kommentare · zuletzt geändert 2026-09-17
- **[#3](https://github.com/vt-tom/dsa5-helpers/issues/3) feat: hover Effekt bei Proben**
  - offen · Bearbeiter: niemand · von @Lyynix · 1 Kommentar · zuletzt geändert 2026-09-30
- **[#7](https://github.com/vt-tom/dsa5-helpers/issues/7) chore: CSS-Datei aufräumen**
  - offen · Bearbeiter: niemand · von @vt-tom · Labels: enhancement · 0 Kommentare · zuletzt geändert 2026-09-30
- **[#14](https://github.com/vt-tom/dsa5-helpers/issues/14) fix: Langer Professionsname läuft aus dem Bogen raus**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: bug · Meilenstein: 0.3.2 · 0 Kommentare · zuletzt geändert 2026-10-01
- **[#15](https://github.com/vt-tom/dsa5-helpers/issues/15) fix: Kreatur auf Favoriten-Fläche wird als Begleiter/Reittier/Gestaltwandlung statt als Favorit hinzugefügt**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: bug · Meilenstein: 0.3.2 · 0 Kommentare · zuletzt geändert 2026-10-01
- **[#16](https://github.com/vt-tom/dsa5-helpers/issues/16) fix: Spaltenüberschrift „Aktionsdauer“ in der Zaubersprüche-Tabelle bricht um**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: bug · Meilenstein: 0.3.2 · 0 Kommentare · zuletzt geändert 2026-10-01
- **[#17](https://github.com/vt-tom/dsa5-helpers/issues/17) feat: Kompatibilität zu „Lyynix: DSA5 - Steigerungsplaner“**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.3.2 · 0 Kommentare · zuletzt geändert 2026-10-01
- **[#18](https://github.com/vt-tom/dsa5-helpers/issues/18) feat: Steigerungshelfer – eigenes Fenster zum Planen von Steigerungen und Neuerwerb**
  - offen · Bearbeiter: niemand · von @vt-tom · Labels: enhancement · 0 Kommentare · zuletzt geändert 2026-10-01
- **[#19](https://github.com/vt-tom/dsa5-helpers/issues/19) fix: Porträtrahmen im dunklen Thema passt nicht zum hellen Thema**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: bug · Meilenstein: 0.3.2 · 0 Kommentare · zuletzt geändert 2026-10-01
- **[#20](https://github.com/vt-tom/dsa5-helpers/issues/20) feat: Anderes Symbol für den Reiter Titelblatt**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.3.2 · 0 Kommentare · zuletzt geändert 2026-10-01
- **[#21](https://github.com/vt-tom/dsa5-helpers/issues/21) feat: Reiter Gefährten je Charakter ausblendbar**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.3.2 · 0 Kommentare · zuletzt geändert 2026-10-01
- **[#22](https://github.com/vt-tom/dsa5-helpers/issues/22) feat: Oberer Fensterrahmen mit Foundry-Knöpfen und Verschieben neu gestalten**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.3.2 · 0 Kommentare · zuletzt geändert 2026-10-01
- **[#23](https://github.com/vt-tom/dsa5-helpers/issues/23) fix: Traditions-Badge bleibt leer, wenn die Tradition als Sonderfertigkeit hinzugefügt wird**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: bug · 0 Kommentare · zuletzt geändert 2026-10-01

**Kürzlich geschlossen (letzte 14 Tage)**

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
