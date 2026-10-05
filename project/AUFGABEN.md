# AUFGABEN.md — Was noch zu tun ist

Eine Liste für alles Offene: neue Notizen, Fehler, Feature-Ideen, offene Entscheidungen.
Neues einfach oben unter **Neu** eintragen. Erledigtes löschen (Details stehen im Commit).

---

## Neu (noch nicht bearbeitet)

## Version 0.4.0 — veröffentlicht 2026-10-02

Zuerst als Beta (Pre-release, Beta-Kanal), am selben Tag zum normalen Release erklärt (Nutzer-Entscheidung) und `release/0.4.0` nach `main` gemergt. Enthalten: #28 Würfelstatistik, #29 Kampf › Körper (ersetzt die Übersicht), #32 Sprungmarken in allen Reitern, Beta-Kanal. Live-Prüfung am 2026-10-05 abgeschlossen (bis auf „Weitere Waffen“, in 0.5.0 nachgebessert).

## Nächste Version (0.5.0)

Branch `release/0.5.0` (angelegt 2026-10-05). Reihenfolge (Nutzer, 2026-10-05): erst #7, danach die übrigen Issues für 0.5.0 auswählen.

**#7 CSS aufräumen** erledigt und live bestätigt (2026-10-05, Issue geschlossen; Konventionen in PROJEKTDOKU.md „CSS-Gliederung“).

Kandidaten, noch ohne Meilenstein (jetzt auswählen):
- **#1 Animation zwischen Titelblatt und den anderen Seiten** (von @Lyynix, ohne Beschreibung) — klären, was gemeint ist.
- **#27 Persönliche Daten auf dem Titelblatt** — nur, wenn bis dahin eine passende Lösung gefunden ist.
- **HUD des Moduls** (siehe Backlog) — würde zum Einstieg der Würfelstatistik passen, ist aber eigenständig zu planen.
- **#30 Favoriten für Ausrüstung und Sonderfertigkeiten**, **#31 Konzept Aufteilung Notizen** (beide offen, ohne Meilenstein).

## Live in Foundry prüfen (0.5.0, release/0.5.0)

- **Kampf › Körper, „Weitere Waffen“** (Rückmeldung 2026-10-05: fehlte in Foundry, weil das System nur Waffen in den Händen als getragen führt): listet jetzt alle Waffen außerhalb der Hände plus Angriffe aus Eigenschaften. Prüfen: nicht ausgerüstete Nah-/Fernkampfwaffen erscheinen mit plausiblen AT/PA/FK- und TP-Werten (wie im Probendialog), Würfeln funktioniert, Schild-Klick nimmt die Waffe in die Hand (verschwindet dann aus der Liste, die bisherige Waffe der Hand erscheint), Rechtsklick aufs Schild öffnet die Handwahl, lange Namen und Kampftechniken werden mit „…“ gekürzt (Tooltip), Technik + KTW in einer Zeile, einspaltig bei normaler Breite und zweispaltig erst ab ca. 1000 px (Formatierung nach Rückmeldung 2026-10-05 korrigiert), Hell/Dunkel, schmales Fenster.
- **Kampf › Körper, Griffwechsel** (Rückmeldung 2026-10-05: von der Haupthand ließ sich nicht auf beidhändig wechseln): Knopf „Beidhändig führen“ / „Einhändig führen“ unter der Hand-Auswahl (Spiel- und Bearbeiten-Modus). Prüfen: Wechsel auf beidhändig mit und ohne Waffe in der Nebenhand (Nebenwaffe wird abgelegt, erscheint unter „Weitere Waffen“), zurück auf einhändig (Nebenhand frei), Waffe in der Nebenhand auf beidhändig (wandert in die Haupthand), AT/PA/TP passen sich an, kein Knopf bei Dolchen/Fechtwaffen und Fernkampfwaffen, Bastardschwert o. ä. mit „(2H“ im Namen.
- **#7 Touch:** Antippen auf einem Touch-Gerät lässt keinen Hover-Zoom stehen — derzeit kein Gerät zum Testen (passt zu `feature/mobile`).

## Offene Entscheidungen

- **#27 Persönliche Daten auf dem Titelblatt:** wieder ausgebaut (2026-10-01), erst klären, ob und wie es aufs Titelblatt passt. Bisherige Versuche siehe PROJEKTDOKU.md (Design-Entscheidungen, „Titelblatt, persönliche Daten“).

## Features / Backlog

Seit 2026-09-30 als GitHub-Issues geführt (#7 CSS aufräumen; #10–#13 mit 0.3.0 erledigt) – siehe unten. Neue Feature-Ideen dort anlegen oder hier kurz notieren.

- **Eigenes HUD des Moduls** (Idee 2026-10-01): ein Einstieg für mehrere Modulfunktionen, z. B. die Würfelstatistik (#28, vorerst nur über die Moduleinstellungen). Noch kein Issue.

---

<!-- GITHUB-ISSUES:START -->
## GitHub-Issues

_Automatisch aus `vt-tom/dsa5-helpers` übernommen (2026-10-05 07:18 UTC) — nicht von Hand bearbeiten, wird bei jedem Session-Start überschrieben. Änderungen direkt im Issue auf GitHub vornehmen._

**Nur zur Information — Agents bearbeiten diese Issues nie von sich aus, sondern nur, wenn der Nutzer ein bestimmtes Issue ausdrücklich beauftragt.**

**Offen (5)**

- **[#1](https://github.com/vt-tom/dsa5-helpers/issues/1) feat: Animation zwischen Titelblatt und den anderen seiten**
  - offen · Bearbeiter: niemand · von @Lyynix · 0 Kommentare · zuletzt geändert 2026-09-17
- **[#7](https://github.com/vt-tom/dsa5-helpers/issues/7) chore: CSS-Datei aufräumen**
  - offen · Bearbeiter: niemand · von @vt-tom · Labels: enhancement · Meilenstein: 0.5.0 · 0 Kommentare · zuletzt geändert 2026-10-02
- **[#27](https://github.com/vt-tom/dsa5-helpers/issues/27) feat: Persönliche Daten auf dem Titelblatt anzeigen**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · 0 Kommentare · zuletzt geändert 2026-10-01
- **[#30](https://github.com/vt-tom/dsa5-helpers/issues/30) feat: Ausrüstung und Sonderfertigkeiten als Favoriten markieren**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · 0 Kommentare · zuletzt geändert 2026-10-02
- **[#31](https://github.com/vt-tom/dsa5-helpers/issues/31) feat: Konzept für die Aufteilung des Reiters Notizen**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · 0 Kommentare · zuletzt geändert 2026-10-02

**Kürzlich geschlossen (letzte 14 Tage)**

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
