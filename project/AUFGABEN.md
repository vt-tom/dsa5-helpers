# AUFGABEN.md — Was noch zu tun ist

Eine Liste für alles Offene: neue Notizen, Fehler, Feature-Ideen, offene Entscheidungen.
Neues einfach oben unter **Neu** eintragen. Erledigtes löschen (Details stehen im Commit).

---

## Neu (noch nicht bearbeitet)

_(leer)_

## Version 0.6.0 — in Arbeit (Branch `release/0.6.0`, als Beta geplant)

Seit 2026-10-20: `feature/mobile` wurde zu `release/0.6.0` umbenannt, Mobile Support erscheint mit 0.6.0 als Beta. GitHub-Meilenstein `0.6.0`.

- **Enthalten:** Mobile Support ([#43](https://github.com/vt-tom/dsa5-helpers/issues/43), Stand und Prüfliste dort), Kopf „Wappenbanner“ ([#41](https://github.com/vt-tom/dsa5-helpers/issues/41) Desktop, [#42](https://github.com/vt-tom/dsa5-helpers/issues/42) Smartphone/Tablet), Waffenkarte „Banner“ im Kampf-Reiter ([#40](https://github.com/vt-tom/dsa5-helpers/issues/40)). CHANGELOG 0.6.0 ist auf diesem Stand.
- **Nutzer entscheidet:** welche weiteren offenen Issues (#34–#39, siehe unten) noch in 0.6.0 kommen.
- **Vor dem Release:** `version` in `module.json` auf `0.6.0`, ggf. `verified` hochsetzen (Testinstanz lief mit Foundry 14.369 und DSA5 8.1.10), Release-Notes mit Hinweis für Tester aus dem Mobil-Kanal: `mobile-v0.6.0` hat dieselbe Versionsnummer, Foundry bietet kein Update an → Modul einmal deinstallieren und über die Beta-URL neu installieren. Danach den Mobil-Kanal einstellen (Job `mobile` in `release.yml` entfernen?).

### Live prüfen (0.6.0)

- **Kopf „Wappenbanner“** (#41, #42; in der Testinstanz headless geprüft): Bannerbild mit eigenem Bild (reicht der Ausschnitt `cover`/`center`, oder braucht es eine Ausschnittwahl?), Tablet, Gleiten beim Reiterwechsel, Tooltips, sehr lange Namen/Professionen.
- **Waffenkarte** (#40; in der Testinstanz geprüft): Handwahl über ⇄ (natives Auswahlmenü), Griff- und Seitenwechsel einer beidhändigen Waffe (Bearbeiten-Modus), Fernkampf mit Nachladen/Magazin, sehr lange Waffennamen, Tablet.
- **Mobile Support** (#43): Prüfliste für echte Geräte steht im Issue. Dazu offen aus der Rückmeldung vom 2026-10-20:
  - **Rückfrage an den Nutzer:** Das Rechtsklick-Menü an Chatkarten schloss sich am PC im Tablet-Modus sofort (in der Testinstanz nachgestellt und behoben). Bitte noch einmal versuchen und sagen, wie der Tablet-Modus eingestellt war (Einstellung „Oberfläche“ oder Geräteemulation im Browser).
  - Journal-Seitenliste am echten Tablet (Foundry nummeriert ab 0, die Handy-Liste ab 1).
  - Langdruck an Akteuren im Akteure-Panel greift noch nicht (nur an Chat-Nachrichten).

## Offene Entscheidungen

- **Waffe aus einem Behälter in die Hand** (gefunden 2026-10-19, betrifft auch den Desktop): Wulfgrimms Langschwert liegt im Beutel „Habseligkeiten von Wulfgrimm“. Das System zählt Gegenstände in Behältern nie als geführte Waffe (`prepare.wornMeleeWeapons`), unsere Handauswahl im Kampf-Reiter bietet sie aber an: Auswählen setzt „angelegt“, die Hand bleibt trotzdem leer. Vorschlag A: beim Ziehen in die Hand aus dem Behälter nehmen (`system.parent_id` leeren). Vorschlag B: Waffen in Behältern in der Handauswahl nicht anbieten.
- **Schmales Titelblatt am Desktop** (Fehler gefunden 2026-10-15): In `styles/dsa5-helpers-character-sheet.css` Abschnitt 18 fragen zwei Container-Regeln `.dsa5h-main` ab und stellen `.dsa5h-main` selbst um (Titelblatt-Raster bei < 700 px und < 520 px); sie greifen deshalb nie. Test 2026-10-19: Greifen sie, wird es schlechter (650 px: Seitenleiste zu schmal, Reiter überlappen; 480 px: Inhalt rutscht aus dem Fenster). Vorschlag: unter ~560 px wie auf dem Handy (Kopf oben, Kasten unter den Favoriten, keine Seitenleiste), dazwischen das jetzige zweispaltige Raster. Sonst die beiden toten Regeln löschen.
- **Eigene Journal-Ansicht mobil?** (Frage des Nutzers 2026-10-20) Vorschlag: nein, Foundrys Blatt mit unseren Anpassungen behalten (Bearbeiten, Bild-/PDF-/Video-Seiten, Verknüpfungen, Proben-Links und andere Module funktionieren dann weiter). Die Blätter-Leiste erscheint erst ab 2 Seiten.
- **Lyynix Bescheid geben?** Seine Rückmeldung zum Mobil-Click-Dummy ([MOBILE-FEEDBACK-2026-10-14.md](MOBILE-FEEDBACK-2026-10-14.md)) ist im Modul umgesetzt (MOBILE.md 13). Sein Steigerungsplaner-Reiter bricht auf dem Handy per CSS um (`styles/dsa5-helpers-mobile.css`), mit geplanten Schritten aber noch nicht geprüft.

## Live in Foundry prüfen (0.5.1, veröffentlicht 2026-10-07)

- **Bogen-Umschalter:** Knopf ⇄ in der Titelleiste von Helfer- und Systembogen, Menü-Einträge, Wechsel als Spieler, neuer Bogen an derselben Stelle. Vorschau beim Darüberfahren: kein Aufblitzen, keine liegengebliebenen unsichtbaren Fenster (`foundry.applications.instances`), keine ungewollten Akteur-Updates durch die Vorschau-Instanzen.
- **DSA5 8.1.9, Sammelproben:** geänderte Ziel-QS zeigt „x / 5“, 0 erlaubte Proben „unbegrenzt“, normale weiter „x / 10“ bzw. „x / 7“.
- **Sozialstatus:** Titelblatt › Persönliche Daten zeigt Unfrei/Frei/Niederadel/Adel/Hochadel; ohne Status fehlt die Zeile.

## Features / Backlog

Seit 2026-09-30 als GitHub-Issues geführt – siehe unten. Neue Feature-Ideen dort anlegen oder hier kurz notieren.

- **Eigenes HUD des Moduls** (Idee 2026-10-01): ein Einstieg für mehrere Modulfunktionen, erst, wenn es mehr Funktionen dafür gibt (Nutzer 2026-10-05). Fest eingeplant: Würfelstatistik öffnen (#28), nur wenn sie aktiviert ist. Noch kein Issue.
- **Mobil, später:** „Neu“-Markierung im Journal, eigene Tablet-Bogenansicht, Steigern/Bearbeiten auf dem Handy (mit #34), Tablet-Fensterknöpfe vergrößern falls am Gerät zu klein (siehe #43).

---

<!-- GITHUB-ISSUES:START -->
## GitHub-Issues

_Automatisch aus `vt-tom/dsa5-helpers` übernommen (2026-10-20 05:24 UTC) — nicht von Hand bearbeiten, wird bei jedem Session-Start überschrieben. Änderungen direkt im Issue auf GitHub vornehmen._

**Nur zur Information — Agents bearbeiten diese Issues nie von sich aus, sondern nur, wenn der Nutzer ein bestimmtes Issue ausdrücklich beauftragt.**

**Offen (10)**

- **[#34](https://github.com/vt-tom/dsa5-helpers/issues/34) feat: Drei Modi im Heldenbogen – Spielen, Steigern, Bearbeiten (Desktop, Tablet, Smartphone)**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · 0 Kommentare · zuletzt geändert 2026-10-15
- **[#35](https://github.com/vt-tom/dsa5-helpers/issues/35) Portrait im Dark Mode - Aura oder Spotlight**
  - offen · Bearbeiter: niemand · von @vt-tom · 0 Kommentare · zuletzt geändert 2026-10-19
- **[#36](https://github.com/vt-tom/dsa5-helpers/issues/36) Kampf Tab: Übersicht - Rüstung zentral über dem Portrait**
  - offen · Bearbeiter: niemand · von @vt-tom · 1 Kommentar · zuletzt geändert 2026-10-19
- **[#37](https://github.com/vt-tom/dsa5-helpers/issues/37) Status Tab: Suche bei den Zuständen**
  - offen · Bearbeiter: niemand · von @vt-tom · 0 Kommentare · zuletzt geändert 2026-10-19
- **[#38](https://github.com/vt-tom/dsa5-helpers/issues/38) Magie/Glaube Tab: 2 Spalten Ansicht für Sonderfertigkeitenhinzufügen**
  - offen · Bearbeiter: niemand · von @vt-tom · 0 Kommentare · zuletzt geändert 2026-10-19
- **[#39](https://github.com/vt-tom/dsa5-helpers/issues/39) Vorschlag: Dramatis Personae/ Bestiarium und Auftragsbuch mit dem Charakterbogen verbinden**
  - offen · Bearbeiter: niemand · von @WiCoPala · 0 Kommentare · zuletzt geändert 2026-10-19
- **[#40](https://github.com/vt-tom/dsa5-helpers/issues/40) feat: Ausgerüstete Waffen im Kampf-Reiter neu gestalten (Foundry, Tablet, Smartphone)**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.0 · 0 Kommentare · zuletzt geändert 2026-10-20
- **[#41](https://github.com/vt-tom/dsa5-helpers/issues/41) feat: Kopf „Wappenbanner“ mit wählbarem Bannerbild (Foundry & Titelblatt)**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.0 · 1 Kommentar · zuletzt geändert 2026-10-20
- **[#42](https://github.com/vt-tom/dsa5-helpers/issues/42) feat: Kopf „Wappenbanner“ auf Smartphone und Tablet (Mobile Support)**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.0 · 1 Kommentar · zuletzt geändert 2026-10-20
- **[#43](https://github.com/vt-tom/dsa5-helpers/issues/43) feat: Mobile Support (Beta) – Tablet und Smartphone, „Hybrides Spiel“**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.0 · 0 Kommentare · zuletzt geändert 2026-10-20

**Kürzlich geschlossen (letzte 14 Tage)**

- **[#33](https://github.com/vt-tom/dsa5-helpers/issues/33) Switch für das schnelle Umschalten zwischen den Bögen**
  - erledigt · Bearbeiter: @Lyynix, @vt-tom · von @vt-tom · Meilenstein: 0.5.1 · 1 Kommentar · geschlossen 2026-10-07
<!-- GITHUB-ISSUES:END -->
