# AUFGABEN.md — Was noch zu tun ist

Eine Liste für alles Offene: neue Notizen, Fehler, Feature-Ideen, offene Entscheidungen.
Neues einfach oben unter **Neu** eintragen. Erledigtes löschen (Details stehen im Commit).

---

## Neu (noch nicht bearbeitet)

- **Status-Reiter, „Zustand hinzufügen“** (Nutzer-Feedback 2026-09-25): (1) manche Zustandsnamen passen nicht in ihre Felder; (2) die weißen Zustandssymbole sind auf dem hellen Hintergrund nicht lesbar. Betrifft `.dsa5h-condition-grid` in `templates/actors/parts/status.hbs` + Modul-CSS (Clickdummy dazu prüfen/nachziehen).
- **Live prüfen:** Kampfwürfel (AT/PA/FK) jetzt ebenfalls weiß mit dunkler Kontur (Spezifitäts-Fix `.dsa5h-content .dsa5h-combat-die`).

## Umsetzungsplan UI/UX-Review 2026-09-25

Quelle: [UI-UX-FEEDBACK-2026-09-25.md](UI-UX-FEEDBACK-2026-09-25.md). **Ablauf je Paket:** (1) im Clickdummy umsetzen, Varianten per Umschalter → (2) Abnahme durch den Nutzer, Verlierer-Varianten löschen → (3) erst danach in Foundry übertragen (`templates/`, `styles/`, `scripts/`, `lang/`), Tests anpassen (`node tests/sheet.test.cjs`), Live-Prüfpunkte hier eintragen. Pakete A–C zuerst, sie sind reine Verbesserungen ohne Gestaltungsbruch.

### Entscheidungen (Nutzer, 2026-09-25)

- **Paket E deckt GitHub-Issue #5, Paket F deckt #6 ab** — erklärt der Nutzer das Paket für erledigt, sind auch die Issues erledigt.
- **Rail (Punkt 7):** Variante (b) — Symbole bleiben, Name erscheint zuverlässig bei Hover und Tastaturfokus.
- A und B abgenommen und nach Foundry übertragen; die Entscheidungen dazu stehen in PROJEKTDOKU.md.

### Live in Foundry prüfen (Pakete A + B, 2026-09-25)

- Status-Reiter und Titelblatt-Leiste: Zustand mit −/+ ändern (auch per Tab + Enter); − ruft den System-Handler mit Rechtsklick-Semantik (`dsa5hConditionDown`); Anzeige „Wert/Max“; am Limit gedämpft.
- Fokus bleibt nach +/−, Schicksalspunkt, Stern, Steigern am selben Knopf (`_focusKey()`/`_restoreFocus()` in der Sheet-Klasse).
- Kopf-Würfel sind jetzt `<button>`: Optik unverändert? Hover-/Fokus-Zoom und Wachssiegel-Fassung ok?
- Schicksalspunkte (29 px Fläche, Bild 23 px), Stern 28 px, Griffwahl 24×28, Regeneration 28 px: nichts verrutscht, keine Überlappung.
- Schrift 15 px / Textschrift-Zahlen / dunkle Zahlen auf FF-GE-KO-KK-Würfeln: nichts abgeschnitten (v. a. Waffen-, Zauber-, Titelblatt-Zustandszeilen).
- Screenreader-/Tooltip-Texte der neuen Labels (`DSA5HELPERS.Roll*`, `Condition*`, `FatePointSet` …) in DE und EN.
- Bekannt: Stern auf dem Titelblatt entfernen → Chip verschwindet, Fokus fällt an den Seitenanfang.

### Live in Foundry prüfen (Paket C, 2026-09-25)

- Waffentabellen: FK steht bei Fernkampf mittig über AT+PA (kein „–“ mehr in der PA-Spalte), Griffknöpfe 28 px in 62px-Spalte, RW-Spalte 76 px — kein seitliches Scrollen, auch im schmalen Fenster (`@container` ≤ 700px: RW 64 / Griff 60).

### Live in Foundry prüfen (Paket D, 2026-09-25)

- Talente: Suche markiert keine Gruppe, Hinweis „Suchergebnisse aus allen Gruppen“ + „Suche löschen“; Sammelproben während der Suche ausgeblendet; Gruppenklick beendet die Suche.
- „Nur gesteigerte“-Schalter blendet FW-0-Zeilen aus (über `row.hidden`, nicht die System-Klasse `.notLearned`).
- Reiterleiste: Name erscheint bei Hover und Tab-Fokus rechts neben dem Knopf (Leiste liegt außerhalb des Fensters — nicht abgeschnitten?).
- Würfel-Zoom: 3W20-Gruppe 1,6× als Ganzes, AT/PA/FK 1,6×, Eigenschaftskacheln 1,3×; nichts verschiebt sich.
- Namen mit `itemEdit` unterstreichen sich bei Hover; LeP/AsP/KaP-Feld zeigt gepunktete Unterlinie; Zeile leuchtet nach Änderung kurz auf (Knöpfe über Fokus-Rückgabe, Eingabefelder über das `change`-Event).

### Paket E – Favoritenraster (Issue #5) — im Clickdummy, wartet auf Abnahme

Favoriten als gleich breite Zeilen im Raster (`favCard()`, `.fav-grid` auto-fill ≥ 300 px, füllt die ganze Breite): Bild | Name (bricht um) | Wert | Probe | Stern; Waffen mit sichtbaren Kürzeln „AT/FK“ und „TP“. Foundry: `favorite-values.hbs`, `cover.hbs` + CSS.

### Paket F – Kopf, Kampf, Reiter „Körper“ (Issue #6)

- Entschieden 2026-09-25: Kopf bleibt **Standard** (Kompakt verworfen). Offen: Porträt auf den Fachreitern ist zu klein → Vergleichsschalter **Porträt: Standard / Größer (150×178, Kopf etwas höher) / Überlappend (150×172, ragt ins Würfelband)**.
- Offen: **Kampf: Panels / Leiste** (Bereich über den Waffen).
- Silhouette als **eigener Reiter „Körper“** (Nutzerwunsch, `renderBody()`): Figur aus dem Artenbild (per CSS zugeschnitten + abgedunkelt), Rüstung links, rechts Haupt-/Nebenhand mit Auswahl aus den ausgerüsteten Waffen (beidhändige Waffe sperrt die Nebenhand), AT/PA würfelbar, darunter Ausweichen/Initiative/Schutz/BE und „ausgerüstet, aber nicht in der Hand“. Weiterentwickeln; im Modul später über die Hand-Logik des Systems (`equipWeaponToHand`/`swapWeaponHandSlot`). Zuschnitt der Figur ist auf die Artenbilder abgestimmt (Elf geprüft) — Mensch/Zwerg noch prüfen.
- Fest: Kampf-Unterreiter „Kampf“ → „Übersicht“.

### Paket G – Detailpunkte pro Reiter — im Clickdummy, wartet auf Abnahme

- Eigenschaften/Kampf: „Wert“ → „Aktuell“ (Ressourcen) bzw. „Basis“; **Mod/Zukauf im Spielmodus ausgeblendet** (Nutzerentscheidung 2026-09-25).
- Magie/Religion: ✦ mit Label + Legende; **Tradition: Farbe der Pille, aber nicht mehr über die ganze Breite** (Nutzerentscheidung, ersetzt „Pille füllt die Breite“). Wohlgefällige Talente sind da (Religion, eingeklappt) — Nutzer fragte, ob sie fehlen: im Clickdummy vorhanden, in Magie regelbedingt nicht.
- Ausrüstung: Münznamen sichtbar, „Stein“ beim Gewicht, Kopf „Angelegt“, Behältnisse kompakt.
- Status: Spieler-/GM-Testschalter unter „Krankheiten & Gifte“.
- Notizen: Felder ≥ 150 px, Sichtbarkeitshinweis je Unterreiter.
- Gefährten: Loyalität neben den Würfeln; Knöpfe mit Kurzbeschriftung.

### Abnahme-Aufgaben (nach jedem Paket im Clickdummy, am Ende live in Foundry)

„Fährtensuchen finden und würfeln“, „Furcht um eine Stufe erhöhen“, „Waffenwert und Schaden ablesen“, „LeP ändern“, „Gegenstand im Rucksack finden“ — dazu lange Namen, viele Favoriten, nur LeP (`ONLY_LEP`) und vergrößerte Schrift.

## Features / Backlog

- **CSS-Datei aufräumen:** nach Tabs/Komponenten sortieren, einheitlich formatieren. Zurückgestellt, weil die Reihenfolge an manchen Stellen das Verhalten bestimmt – braucht danach einen gründlichen Live-Test.
- **OnUseEffect-Würfel-Buttons** bei Items/Sonderfertigkeiten mit Effekt (Kampf, Magie, Religion, Ausrüstung).
- **Heldenerschaffung starten** (Chargen-Wizard) in der Kopfzeile – wie im Systembogen.
- **Eigenschaften-Tab, alte Punkte aus dem Click-Dummy-Review (2026-09-11)** – erst gegen `templates/actors/parts/main.hbs` prüfen, ob noch aktuell:
  - Spielmodus kaum schlanker als Bearbeiten-Modus.
  - Linke/rechte Spalte sehr unterschiedlich lang.
  - Lange Labels („LeP-Regeneration“) brechen um.
  - +/− auch bei berechneten Werten (Zähigkeit, Ausweichen, INI).
  - Zeilen mit nur einem Wert zeigen trotzdem „–“ in den anderen Spalten.
  - LeP/AsP/KaP doppelt (Kopf + Grundwerte).

---

<!-- GITHUB-ISSUES:START -->
## GitHub-Issues

_Automatisch aus `vt-tom/dsa5-helpers` übernommen (2026-09-25 04:50 UTC) — nicht von Hand bearbeiten, wird bei jedem Session-Start überschrieben. Änderungen direkt im Issue auf GitHub vornehmen._

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
