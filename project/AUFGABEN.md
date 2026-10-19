# AUFGABEN.md — Was noch zu tun ist

Eine Liste für alles Offene: neue Notizen, Fehler, Feature-Ideen, offene Entscheidungen.
Neues einfach oben unter **Neu** eintragen. Erledigtes löschen (Details stehen im Commit).

---

## Neu (noch nicht bearbeitet)

- **Kopf „Wappenbanner“ live prüfen (2026-10-19, Modul + Click-Dummy umgesetzt, auf `feature/mobile` noch nicht committet; Stand und offene Punkte in GitHub-Issues #41 Banner/Desktop und #42 Smartphone/Tablet).** Headless in der Testinstanz geprüft (Desktop, Titelblatt, Bearbeiten-Modus, rund, Bannerbild, LeP-Eingabe in der Kugel, Smartphone aus-/eingeklappt). Noch selbst ansehen: Bannerbild mit eigenem Bild (Ausschnitt `cover`/`center` — reicht das, oder braucht es eine Ausschnittwahl?), Tablet, Gleiten beim Reiterwechsel, Tooltips, sehr lange Namen/Professionen.
- **Waffenkarte „Banner“ live prüfen ([Issue #40](https://github.com/vt-tom/dsa5-helpers/issues/40), 2026-10-19 im Modul und Click-Dummy umgesetzt).** In der Testinstanz geprüft: Desktop (Wulfgrimm Streitaxt + Schild, Allacaya Elfenbogen beidhändig, Testitest ohne Waffe, Newbie Kurzbogen), Smartphone hell/dunkel, 360 px ohne Überlauf. Noch selbst ansehen: Handwahl über ⇄ (natives Auswahlmenü), Griffwechsel und Seitenwechsel einer beidhändigen Waffe (Bearbeiten-Modus), Fernkampf mit Nachladen/Magazin, sehr lange Waffennamen, Tablet. Issue erst mit dem Release schließen.
- **Mobil: erster Gerätetest Smartphone (Nutzer, 2026-10-15, Android/Chrome, Testversion 0.6.0).** Erledigt auf `feature/mobile`: Bogen scrollt auf allen Reitern nur noch senkrecht (bei 360 und 390 px gemessen, Spiel- und Bearbeitungsmodus, 5 Helden); bei aktiver „Desktop-Website“ erscheint ein Hinweis (die Automatik selbst hat funktioniert, nur die Seite war 980 px breit). Noch offen:
  - **Chat und Journal mobil — Entwurf im Mobil-Click-Dummy, Rückmeldung abwarten** (`clickdummy/mobile/Foundry Mobil.dc.html`, `app.html?device=phone`). Entscheidungen des Nutzers 2026-10-19: komplett im Modul-Design, Foundrys Chat-Log/Journal bleiben die Grundlage; Chat-Karten „Rahmen neu, Inhalt angepasst“; Eingabe mit Würfel-Schnellknöpfen, Sichtbarkeit der Würfe als Chips und Flüstern durch Antippen der Empfänger (Editor-Leiste hinter „Aa“); mehrseitige Journal-Einträge mit Seitenwahl als Blatt. Entwurf: Nachrichten als Variante A „Karten“ (Panel-Kopf mit Porträt) oder B „Chronik“ (Zeitleiste, Porträt-Medaillon, Folgenachrichten ohne Kopf), Umschalter oben in der Liste; Probenkarten mit Eigenschaftswürfeln + Zielwert, QS-Rauten, Ergebnisband; Angriffskarte mit Schaden/Parade; Würfelmodus- und Empfänger-Chips, freier Wurf (Anzahl, W4–W20, Modifikator); Journal mit Suche, Eintrag auf Pergament mit Initiale, „Seite x von y ▾“ als Blatt, ‹ › unten. Danach: Variante wählen, Tablet prüfen (Chat als Spalte), dann Umsetzung über Foundrys Chat-Log und Journal-Blätter (MOBILE.md 13).
  - **Steigerungsplaner-Reiter** (Modul von Lyynix): seit 2026-10-19 bricht er auf dem Handy per CSS um (Zeilen und Kacheln, `styles/dsa5-helpers-mobile.css`). In der Testwelt gab es keine geplanten Schritte, die Kacheln sind deshalb nur live prüfbar. Lyynix trotzdem Bescheid geben?
  - **Nebenspalten** auf dem Handy ausgeblendet (Behinderung bei Talenten; Gewicht in der Ausrüstung). Sie stehen im Gegenstandsblatt. Prüfen, ob etwas davon am Tisch fehlt. Kosten, Dauer und Reichweite der Zauber/Liturgien stehen seit P2 wieder in einer Unterzeile.
  - **Tablet:** in der Testinstanz (820 × 1180) ohne waagerechten Überlauf; der Bogen nutzt dort das Desktop-Layout mit der Reiterleiste rechts im Fenster. Auf dem echten Gerät prüfen, ob die Fensterknöpfe oben rechts (Plakette, ~16 px) mit dem Finger treffbar sind; sonst wie auf dem Handy vergrößern oder ersetzen.
  - **Feinschliff Bogen auf dem Smartphone** ([MOBILE.md](MOBILE.md) Abschnitt 14): P1 und Ü3 umgesetzt (Probendialog, Kopf, „Mehr“-Blatt, Unterreiter, Tippziele, Zeile antippen würfelt, „‹“ im Kopf). P2 umgesetzt 2026-10-19 (Kampf als Waffen · Rüstung · Kampftechniken ohne Silhouette, Traditionskarte mit AsP/KaP-Regler und Unterzeile je Zauber, Status-Kacheln und Zustands-Blatt, Grundwerte mit −/+). P3 umgesetzt 2026-10-19 (Favoriten-Karten, Ausrüstung mit Kategorie-Chips, Notizen einspaltig, leere Abschnitte, Gefährten, dunkles Thema, Gegenstandsblätter geprüft), dazu wischbare Reiterleiste und Bogen-Menü „⋮“ im Kopf. Ü7 (Bearbeitungsmodus) ruht bis Issue #34.
  - **Entscheidung nötig – Waffe aus einem Behälter in die Hand (betrifft auch den Desktop, gefunden 2026-10-19):** Wulfgrimms Langschwert liegt im Beutel „Habseligkeiten von Wulfgrimm“. Das System zählt Gegenstände in Behältern nie als geführte Waffe (`prepare.wornMeleeWeapons`), unsere Handauswahl im Kampf-Reiter bietet sie aber an: Auswählen setzt „angelegt“, die Hand bleibt trotzdem leer. Vorschlag A: beim Ziehen in die Hand aus dem Behälter nehmen (`system.parent_id` leeren). Vorschlag B: Waffen in Behältern in der Handauswahl nicht anbieten.
  - Neue Testversion im Mobil-Kanal (z. B. `mobile-v0.6.1`), sobald der Nutzer sie freigibt.

- **Entscheidung nötig – schmales Titelblatt am Desktop (Fehler gefunden 2026-10-15):** In `styles/dsa5-helpers-character-sheet.css` Abschnitt 18 fragen zwei Container-Regeln `.dsa5h-main` ab und stellen `.dsa5h-main` selbst um (Titelblatt-Raster bei < 700 px und < 520 px); sie greifen deshalb nie. Test 2026-10-19 mit dem Fensterinneren als Container: Greifen sie, wird es schlechter. Bei 650 px ist die 150-px-Seitenleiste zu schmal (Reiter „Statuseffekte | Persönliche Daten“ überlappen, Porträt abgeschnitten). Bei 480 px steht die Leiste mit großem Porträt oben und der Inhalt rutscht unten aus dem Fenster. Änderung zurückgenommen, schmale Fenster behalten das zweispaltige Titelblatt (240 px Leiste). Zu klären: Wie soll das Titelblatt in schmalen Fenstern aussehen? Vorschlag: unter ~560 px wie auf dem Handy (Kopf oben, Kasten unter den Favoriten, keine Seitenleiste), dazwischen das jetzige zweispaltige Raster. Sonst die beiden toten Regeln löschen.

- **Mobil-Click-Dummy Runde 4 ansehen** (2026-10-15): Die Rückmeldung von Lyynix ([MOBILE-FEEDBACK-2026-10-14.md](MOBILE-FEEDBACK-2026-10-14.md)) ist in `clickdummy/mobile/` eingebaut (Szene mit Gesten, schwebende Knöpfe mit Sprechblase, Schips im Chat, Journal-Ordner, „Probe anfordern“, automatische Oberfläche). Das Umsetzungskonzept steht in [MOBILE.md](MOBILE.md) Abschnitt 13. Öffnen über `clickdummy/start-server.bat`, dann `…/clickdummy/mobile/index.html` (Übersicht) bzw. `app.html` (echtes Gerät). Rückmeldung an Lyynix?

## Version 0.5.1 — veröffentlicht 2026-10-07

Direkt als normales Release (ohne Beta, Wunsch des Nutzers), `release/0.5.1` nach `main` gemergt, Issue #33 geschlossen. Enthalten: Bogen-Umschalter mit Vorschau (#33), Sozialstatus als Name statt Zahl, Anpassung an DSA5 8.1.9 (Sammelproben), `verified` 8.1.9. Für die nächste Version gibt es noch keinen Branch.

## Live in Foundry prüfen

- **Bogen-Umschalter** (in 0.5.1 veröffentlicht): Knopf ⇄ in der Titelleiste von Helfer- und Systembogen, Menü-Einträge (Systemstandard, Helfer-Heldenbogen, ggf. weitere), Wechsel als Spieler, neuer Bogen an derselben Stelle, Menü-Position an der Plakette. Vorschau beim Darüberfahren: Wartezeit beim Aufbau, kein Aufblitzen beim Wechsel, keine liegengebliebenen unsichtbaren Fenster (z. B. `foundry.applications.instances` nach dem Schließen des Menüs), keine ungewollten Akteur-Updates durch die Vorschau-Instanzen.
- **DSA5 8.1.9, Sammelproben** (in 0.5.1 veröffentlicht): Talente › Sammelproben — eine Sammelprobe mit geänderter Ziel-QS (z. B. 5) zeigt „x / 5“, eine mit 0 erlaubten Proben „unbegrenzt“; normale Sammelproben weiter „x / 10“ und „x / 7“. Sonst einmal quer durch den Bogen (Gefährten-Reiter mit der neuen Loyalität je Besitzer, Zustände jetzt alphabetisch).
- **Sozialstatus** (in 0.5.1 veröffentlicht): Titelblatt › Persönliche Daten zeigt Unfrei/Frei/Niederadel/Adel/Hochadel statt Zahl; ohne gewählten Status fehlt die Zeile.
- **#7 Touch:** erst mit dem Mobil-UI (`feature/mobile`).
- **Mobil Stufe 1 + 2** (`feature/mobile`, 2026-10-15, MOBILE.md 13; in einer Testinstanz per headless Chrome schon geprüft, echte Geräte fehlen): Testversion 0.6.0 über den Mobil-Kanal installieren und verbinden: Anleitung in [MOBILE.md](MOBILE.md) 11.1. Prüfen: (1) Automatik wählt Smartphone/Tablet, Desktop bleibt normal; `?dsa5h-ui=foundry` als Notausgang. (2) Keine Meldung „Auflösung zu niedrig“. (3) Szene: wischen, zwei Finger zoomen, lange drücken pingt (sehen andere den Ping?), eigenen Token lange drücken + ziehen (Zielfeld, Wand rot, Bewegung kommt bei allen an), kurzes Antippen wählt Token/öffnet Türen. (4) Heldenkarte: Werte aktuell, Antippen öffnet den Bogen bildschirmfüllend (Handy: verkleinert). (5) Chat-Knopf: Zähler, Sprechblase, Chat als Panel, Eingabe ohne ungewollte Tastatur beim Öffnen. (6) Langdruck/⋮ an eigener Probe → Kontextmenü als Blatt → „Schip verwenden“ → Systemdialog benutzbar. (7) Journal-Knopf: Ordner wie am Desktop. (8) SL: „Probe anfordern“, Spieler bekommt den Probendialog. (9) Konto-Menü: Oberfläche wechseln, Spielfeld aus/an, Hell/Dunkel, Abmelden. (11) Kampf: Leiste mit Reihenfolge, „Du bist dran!“, Initiative würfeln, Antippen öffnet den Tracker. (12) Fremden Token antippen → „Ziel“. (13) Bogen auf dem Handy: Reiterleiste unten + „Mehr“, Kopf klappt beim Scrollen ein. (10) iPhone/iPad (Safari) **und** Android (Chrome). Stolpersteine hier notieren (Phase-1-Ergebnis).

## Offene Entscheidungen

- **Mobile Support (Tablet/Smartphone, „Hybrides Spiel“):** Planung in [MOBILE.md](MOBILE.md), Umsetzungskonzept in Abschnitt 13. Stufe 1 + 2 sind gebaut und folgen den Vorschlägen zu allen Entscheidungen E1–E23 (Kurzfassung in MOBILE.md 13.10). Offen: Test auf echten Geräten, danach Version festlegen (CHANGELOG-Entwurf in MOBILE.md 13.9).

## Features / Backlog

Seit 2026-09-30 als GitHub-Issues geführt (#7 CSS aufräumen; #10–#13 mit 0.3.0 erledigt) – siehe unten. Neue Feature-Ideen dort anlegen oder hier kurz notieren.

- **Eigenes HUD des Moduls** (Idee 2026-10-01): ein Einstieg für mehrere Modulfunktionen. Nicht in 0.5.0 (Nutzer 2026-10-05: erst, wenn es mehr Funktionen dafür gibt). Fest eingeplant: Würfelstatistik öffnen (#28), nur wenn sie aktiviert ist. Noch kein Issue.

---

<!-- GITHUB-ISSUES:START -->
## GitHub-Issues

_Automatisch aus `vt-tom/dsa5-helpers` übernommen (2026-10-19 12:08 UTC) — nicht von Hand bearbeiten, wird bei jedem Session-Start überschrieben. Änderungen direkt im Issue auf GitHub vornehmen._

**Nur zur Information — Agents bearbeiten diese Issues nie von sich aus, sondern nur, wenn der Nutzer ein bestimmtes Issue ausdrücklich beauftragt.**

**Offen (9)**

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
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · 0 Kommentare · zuletzt geändert 2026-10-19
- **[#41](https://github.com/vt-tom/dsa5-helpers/issues/41) feat: Kopf „Wappenbanner“ mit wählbarem Bannerbild (Foundry & Titelblatt)**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · 1 Kommentar · zuletzt geändert 2026-10-19
- **[#42](https://github.com/vt-tom/dsa5-helpers/issues/42) feat: Kopf „Wappenbanner“ auf Smartphone und Tablet (Mobile Support)**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · 1 Kommentar · zuletzt geändert 2026-10-19

**Kürzlich geschlossen (letzte 14 Tage)**

- **[#33](https://github.com/vt-tom/dsa5-helpers/issues/33) Switch für das schnelle Umschalten zwischen den Bögen**
  - erledigt · Bearbeiter: @Lyynix, @vt-tom · von @vt-tom · Meilenstein: 0.5.1 · 1 Kommentar · geschlossen 2026-10-07
<!-- GITHUB-ISSUES:END -->
