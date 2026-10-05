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

Für 0.5.0 ausgewählt (Nutzer, 2026-10-05; Meilenstein 0.5.0, Bearbeiter vt-tom): #30, #31, #1, #27. Reihenfolge: #30 → #1 → #31 + #27 zusammen (beide betreffen „Persönliche Daten“).

- **#30** und **#1** umgesetzt und live bestätigt (2026-10-05). Issues erst schließen, wenn der Nutzer den Release freigibt (Nutzer 2026-10-05).
- **Hausregelbuch** (Nutzerwunsch 2026-10-05, kein Issue): in Modul und Click-Dummy umgesetzt, nach Rückmeldung überarbeitet (Buch mit Inhaltsverzeichnis, Blätterpfeile neben der Seite, Pfeiltasten, Umblätter-Animation, Aktiv/Nicht aktiv oben rechts im Seitenkopf; Wundeinschätzung jetzt über den Hinweis am Talent Heilkunde Wunden statt Token-Menü). Live zu prüfen (siehe unten).
- **#31 Konzept Aufteilung Notizen** + **#27 Persönliche Daten auf dem Titelblatt** — zweite Runde im Click-Dummy (2026-10-05), **Entscheidung offen**. Erste Runde verworfen (A Steckbrief-Kasten: zu viel Platz; B Porträt-Rückseite; C Zeile im Kopf). Umschalter „Notizen: D | E | F | G“:
  - **D Unterreiter:** Titelblatt bekommt Unterreiter wie die anderen Reiter („Favoriten | Steckbrief“), der Steckbrief steht als Abschnitt unter den Favoriten (Sprungmarke, im Bearbeiten-Modus editierbar). Notizen: Hintergrundgeschichte | Notizen | Private Notizen | GM-Notizen.
  - **E Hover-Karte:** Darüberfahren oder Tastaturfokus auf das Porträt im Titelblatt zeigt die Daten als Karte daneben. Notizen unverändert.
  - **F Reiter Held:** eigener Reiter „Held“ vor Notizen (Persönliche Daten + Hintergrundgeschichte), Notizen nur noch Notizen | Private Notizen | GM-Notizen. Titelblatt unverändert (#27 dann nicht umgesetzt).
  - **G Leiste mit Reitern** (Nutzerwunsch 2026-10-05, Reiter-Idee aus der ersten Umsetzung vom 2026-10-01 neu aufgegriffen): Titelblatt-Leiste mit flacheren LeP/AsP/KaP-Leisten (24 statt 34 px), Schips und Regeneration in einer Zeile, darunter ein Kasten mit zwei Reitern „Zustände | Persönliche Daten“, der den Rest der Leiste füllt (aktive Effekte als Zeile unter den Zuständen; Daten nur lesend, „Bearbeiten → Notizen“). Leiste scrollt bei Standardgröße nicht. Notizen unverändert.
  - Kombinierbar, z. B. E + F oder G + F.

## Live in Foundry prüfen (0.5.0, release/0.5.0)

- **Hausregelbuch:** Moduleinstellungen → „Hausregelbuch öffnen“ (auch als Spieler). Liste ↔ Buch, „Im Buch lesen“ springt auf die Regelseite; Buch beginnt mit dem Inhaltsverzeichnis, Blättern über die Pfeile neben der Seite, das Inhaltsverzeichnis und ← → (Fokus im Fenster), Umblätter-Animation (aus bei „Bewegung reduzieren“). Schalter nur als SL (Liste und oben rechts im Seitenkopf), Spieler sehen „Aktiv/Nicht aktiv“; offenes Fenster bei Spielern aktualisiert sich beim Umschalten. Hell/Dunkel, Font-Awesome-Symbole.
- **Wundeinschätzung** (Regel aktiv): Reiter Talente → bei Heilkunde Wunden der Hinweis „♥ Wundeinschätzung“ (nur bei aktiver Regel; offene Bögen zeichnen sich beim Umschalten im Buch neu). Ohne markiertes Ziel → Tooltip am Knopf. Mit Ziel → normaler Probendialog, Probe verdeckt (nur Würfelnder), Ergebnis-Flüstern beim Spieler ohne „An: …“, SL bekommt nur den Hinweis (bei Spielern unsichtbar). Zweiter Versuch ohne LeP-Änderung → Meldung mit bisheriger Einschätzung; nach ≥ ¼ max LeP Änderung wieder möglich. Optional mit „Token Note Hover“ die Hover-Anzeige. Hinweis an Knigge: World Script + Makro abschalten (Flags jetzt unter `dsa5-helpers`).
- **Wundeinschätzung bei den Favoriten:** Ist Heilkunde Wunden ein Favorit und die Regel aktiv, steht auf dem Titelblatt neben dem Namen ein Herz-Knopf mit demselben Ablauf (Tooltip ohne Ziel, sonst Probendialog).
- **#7 Touch:** Antippen auf einem Touch-Gerät lässt keinen Hover-Zoom stehen — derzeit kein Gerät zum Testen (passt zu `feature/mobile`).

## Offene Entscheidungen

- **#27/#31:** siehe oben unter 0.5.0 (D/E/F/G im Click-Dummy).

## Features / Backlog

Seit 2026-09-30 als GitHub-Issues geführt (#7 CSS aufräumen; #10–#13 mit 0.3.0 erledigt) – siehe unten. Neue Feature-Ideen dort anlegen oder hier kurz notieren.

- **Eigenes HUD des Moduls** (Idee 2026-10-01): ein Einstieg für mehrere Modulfunktionen. Nicht in 0.5.0 (Nutzer 2026-10-05: erst, wenn es mehr Funktionen dafür gibt). Fest eingeplant: Würfelstatistik öffnen (#28), nur wenn sie aktiviert ist. Noch kein Issue.

---

<!-- GITHUB-ISSUES:START -->
## GitHub-Issues

_Automatisch aus `vt-tom/dsa5-helpers` übernommen (2026-10-05 08:22 UTC) — nicht von Hand bearbeiten, wird bei jedem Session-Start überschrieben. Änderungen direkt im Issue auf GitHub vornehmen._

**Nur zur Information — Agents bearbeiten diese Issues nie von sich aus, sondern nur, wenn der Nutzer ein bestimmtes Issue ausdrücklich beauftragt.**

**Offen (4)**

- **[#1](https://github.com/vt-tom/dsa5-helpers/issues/1) feat: Animation zwischen Titelblatt und den anderen seiten**
  - offen · Bearbeiter: @vt-tom · von @Lyynix · Meilenstein: 0.5.0 · 0 Kommentare · zuletzt geändert 2026-10-05
- **[#27](https://github.com/vt-tom/dsa5-helpers/issues/27) feat: Persönliche Daten auf dem Titelblatt anzeigen**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.5.0 · 0 Kommentare · zuletzt geändert 2026-10-05
- **[#30](https://github.com/vt-tom/dsa5-helpers/issues/30) feat: Ausrüstung und Sonderfertigkeiten als Favoriten markieren**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.5.0 · 0 Kommentare · zuletzt geändert 2026-10-05
- **[#31](https://github.com/vt-tom/dsa5-helpers/issues/31) feat: Konzept für die Aufteilung des Reiters Notizen**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.5.0 · 0 Kommentare · zuletzt geändert 2026-10-05

**Kürzlich geschlossen (letzte 14 Tage)**

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
