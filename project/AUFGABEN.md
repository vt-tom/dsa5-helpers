# AUFGABEN.md — Was noch zu tun ist

Eine Liste für alles Offene: neue Notizen, Fehler, Feature-Ideen, offene Entscheidungen.
Neues einfach oben unter **Neu** eintragen. Erledigtes löschen (Details stehen im Commit).

---

## Neu (noch nicht bearbeitet)

- **Mobil: erster Gerätetest Smartphone (Nutzer, 2026-10-15, Android/Chrome, Testversion 0.6.0).** Erledigt auf `feature/mobile`: Bogen scrollt auf allen Reitern nur noch senkrecht (bei 360 und 390 px gemessen, Spiel- und Bearbeitungsmodus, 5 Helden); bei aktiver „Desktop-Website“ erscheint ein Hinweis (die Automatik selbst hat funktioniert, nur die Seite war 980 px breit). Noch offen:
  - **Journal mobil:** eigenes Journal-Blatt für das Handy oder Foundrys Blatt weiter per CSS anpassen? Vorschlag: Foundrys Blatt behalten (Seitenlinks, Bilder, Module wie Monk's Enhanced Journal funktionieren weiter) und gezielt umbauen. Dafür braucht es konkrete Stellen vom Nutzer (Screenshots).
  - **Chat mobil:** Vorschlag wie beim Journal: kein eigener Chat (die Karten von System und Modulen, Dice So Nice, Schips und das Kontextmenü hängen am Foundry-Chat), sondern Foundrys Chat-Log fürs Handy umbauen (Eingabe unten fest, größere Knöpfe, Karten auf volle Breite). Konkrete Stellen vom Nutzer sammeln.
  - **Steigerungsplaner-Reiter** (Modul von Lyynix) läuft auf dem Handy rechts heraus (`ol.planner-steps`, Kacheln nebeneinander). Fremdes Modul: an Lyynix melden oder bei uns per CSS umbrechen.
  - **Nebenspalten** auf dem Handy ausgeblendet (Behinderung bei Talenten; Gewicht in der Ausrüstung). Sie stehen im Gegenstandsblatt. Prüfen, ob etwas davon am Tisch fehlt. Kosten, Dauer und Reichweite der Zauber/Liturgien stehen seit P2 wieder in einer Unterzeile.
  - **Tablet** noch nicht getestet.
  - **Feinschliff Bogen auf dem Smartphone** ([MOBILE.md](MOBILE.md) Abschnitt 14): P1 und Ü3 umgesetzt (Probendialog, Kopf, „Mehr“-Blatt, Unterreiter, Tippziele, Zeile antippen würfelt, „‹“ im Kopf). P2 umgesetzt 2026-10-19 (Kampf als Waffen · Rüstung · Kampftechniken ohne Silhouette, Traditionskarte mit AsP/KaP-Regler und Unterzeile je Zauber, Status-Kacheln und Zustands-Blatt, Grundwerte mit −/+). Offen: P3. Nur Spielmodus, Modi siehe Issue #34.
  - **Beim P2-Test aufgefallen (Testwelt, betrifft auch den Desktop):** Wulfgrimm trägt Langschwert (Haupthand) und Thorwalerschild (Nebenhand), die Haupthand bleibt trotzdem leer und das Langschwert fehlt auch unter „Weitere Waffen“ — `prepare.wornMeleeWeapons` des Systems enthält nur den Schild. Prüfen, ob das System das so will (Langschwert + Schild) oder `_bodyContext()` getragene Waffen außerhalb dieser Liste zeigen muss.
  - Neue Testversion im Mobil-Kanal (z. B. `mobile-v0.6.1`), sobald der Nutzer sie freigibt.

- **Fehler (gefunden 2026-10-15, betrifft auch den Desktop):** In `styles/dsa5-helpers-character-sheet.css` Abschnitt 18 zielen zwei Container-Regeln auf `.dsa5h-main` selbst (Titelblatt-Raster bei < 700 px und < 520 px). `.dsa5h-main` ist aber der Container — ein Element kann sich nicht selbst abfragen, die Regeln greifen nie. Schmale Bogenfenster behalten deshalb das zweispaltige Titelblatt. Mobil ist das über `styles/dsa5-helpers-mobile.css` gelöst; für den Desktop die Regeln auf ein Kind-Element bzw. eine Media-Query umstellen.

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

_Automatisch aus `vt-tom/dsa5-helpers` übernommen (2026-10-19 08:26 UTC) — nicht von Hand bearbeiten, wird bei jedem Session-Start überschrieben. Änderungen direkt im Issue auf GitHub vornehmen._

**Nur zur Information — Agents bearbeiten diese Issues nie von sich aus, sondern nur, wenn der Nutzer ein bestimmtes Issue ausdrücklich beauftragt.**

**Offen (5)**

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

**Kürzlich geschlossen (letzte 14 Tage)**

- **[#33](https://github.com/vt-tom/dsa5-helpers/issues/33) Switch für das schnelle Umschalten zwischen den Bögen**
  - erledigt · Bearbeiter: @Lyynix, @vt-tom · von @vt-tom · Meilenstein: 0.5.1 · 1 Kommentar · geschlossen 2026-10-07
- **[#31](https://github.com/vt-tom/dsa5-helpers/issues/31) feat: Konzept für die Aufteilung des Reiters Notizen**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.5.0 · 1 Kommentar · geschlossen 2026-10-05
- **[#30](https://github.com/vt-tom/dsa5-helpers/issues/30) feat: Ausrüstung und Sonderfertigkeiten als Favoriten markieren**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.5.0 · 1 Kommentar · geschlossen 2026-10-05
- **[#27](https://github.com/vt-tom/dsa5-helpers/issues/27) feat: Persönliche Daten auf dem Titelblatt anzeigen**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.5.0 · 1 Kommentar · geschlossen 2026-10-05
- **[#1](https://github.com/vt-tom/dsa5-helpers/issues/1) feat: Animation zwischen Titelblatt und den anderen seiten**
  - erledigt · Bearbeiter: @vt-tom · von @Lyynix · Meilenstein: 0.5.0 · 1 Kommentar · geschlossen 2026-10-05
<!-- GITHUB-ISSUES:END -->
