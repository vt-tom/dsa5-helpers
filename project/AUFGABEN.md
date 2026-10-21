# AUFGABEN.md — Was noch zu tun ist

Eine Liste für alles Offene: neue Notizen, Fehler, Feature-Ideen, offene Entscheidungen.
Neues einfach oben unter **Neu** eintragen. Erledigtes löschen (Details stehen im Commit).

---

## Neu (noch nicht bearbeitet)

_(leer)_

## Version 0.6.1 — nächste Beta (Branch `release/0.6.1`)

Seit 2026-10-20 in Arbeit, abgezweigt von `release/0.6.0`. Weitere Funktionen für die Beta, GitHub-Meilenstein `0.6.1`. CHANGELOG-Abschnitt „0.6.1 — unveröffentlicht“ steht bereit.

- Der Nutzer arbeitet die Rückmeldungen von Lyynix ein und entscheidet, welche Issues dazukommen.
- **Enthalten:** #36 Rüstung mittig über der Figur (Wappenschild, Trefferzonen), Waffenkarte in drei Bändern, Lesbarkeit im Körper-Reiter.
- **#48 Grundmanöver Stufe 3** (2026-10-21) umgesetzt und in der Testinstanz geprüft (Wulfgrimm gegen Skelett, Eshila als Verbündete): Schwachpunkte erkennen (Probe, QS-Dialog, Chatkarte, Mitteilen), TP-Bonus im Angriff und PA-Bonus in der Parade angehakt, Trefferfolgen in der Ergebniskarte (Kopf → Betäubung, Bein → Liegend, Knopf setzt den Zustand), Finte/Wuchtschlag/Vorstoß im Probendialog ausgeblendet. Entscheidungen des Nutzers: Boni angehakt; nach „Mitteilen“ für alle nur noch bis Ende der nächsten KR; Trefferfolgen nur Hinweis + Knöpfe; gleichwertige SF nur im Probendialog ausblenden (kein Ausgrauen im Bogen, kein AP-Hinweis). „Stören und Ablenken“ wartet weiter auf den Regeltext. Offen an Paladose: Geister/Elementare würfeln laut Text Tierkunde (nur Dämonen Sphärenkunde) – so umgesetzt. Nebenbei behoben: die Dialog-Stile der Manöverzeilen griffen auch im Block des Bogens (grau, gerahmt).
- **#44 und #45** vom Nutzer abgenommen (2026-10-21). **#39** Kacheln auf gleiche Größe umgestellt, **HUD** mit Einstellungen/Hausregelbuch als Chips (Rückmeldung 2026-10-21). Ursprünglich: **#44, #45, #39 und eigenes HUD** nach der Rückmeldung vom 2026-10-21 umgesetzt und in der Testinstanz geprüft (Wulfgrimm, SL): Grundmanöver als eigener Abschnitt im Kampf-Probendialog (Klick/Rechtsklick, Wert verrechnet), Helfen als Schalter im Talent-Probendialog (Wurf → Chatnachricht mit QS, „Vergleichend“ ausgeblendet; ⋮-Eintrag entfällt), Reiter Aufträge/Personen mit echten Almanach-Journalen (Klick öffnet den Almanach am Eintrag), HUD-Reiter in der DSA-Leiste mit allen fünf Einträgen (bleibt beim Neuzeichnen offen). Offen siehe „Live prüfen (0.6.1)“.
- Die Beta 0.6.0 wird damit nicht mehr zum normalen Release erklärt; zum stabilen Release wird später die letzte gute 0.6.x-Beta. Dann die Issues der Meilensteine `0.6.0` und `0.6.1` schließen und nach `main` mergen.

- **#34 Drei Modi** in Foundry umgesetzt und live geprüft (Spieler ohne Bearbeiten vom Nutzer bestätigt). Nachtrag 2026-10-20: Eigenschaften-+/− auch im Steigern-Modus, Lösch-Tooltip „(AP zurückerstatten)“.

- **#46 Bannerbild:** Windows-Datei-Dialog vom Nutzer bestätigt; Tablet/Handy und The Forge (`forgevtt`) warten auf Rückmeldungen der Nutzer.

### Live prüfen (0.6.1)

- **#48** als Spieler: Mitteilen-Knopf nur für den eigenen Helden, Zustands-Knöpfe nur mit Besitz am Ziel; Verbündete über die Token-Gesinnung (gleich wie der Erkennende). Englischer Name von Vorstoß (SF) unbekannt, ausgeblendet wird nur „Vorstoß“.

- **#39 Aufträge/Personen** als Spieler ansehen: in der Testwelt sind Aufträge und Personen im Almanach für Spieler ausgeschaltet (`calendarFeatureVisibility`), dann fehlen die Reiter bewusst. Persönliche Aufträge (Publikum = bestimmte Spieler) prüfen. Mobil-Ansicht der beiden Reiter (Handy/Tablet) noch nicht angesehen; `clickdummy/mobile/` hat sie nicht.
- **HUD-Reiter** (Chips, Rückmeldung 2026-10-21 eingearbeitet, in der Testinstanz geprüft): als Spieler und mit senkrechter DSA-Leiste (Einstellung Layout) ansehen; kommen weitere Einträge dazu, wird der Abschnitt scrollbar.

- **#36 / Waffenkarte** (in der Testinstanz an Wulfgrimm geprüft: Schild, weitere Teile, Hauptrüstung wählen, Trefferzonen bei 800/720/560 px, hell/dunkel, Hover): Fernkampfhand mit Nachladen/Zielen/Magazin live ansehen; Tablet ansehen; Smartphone behält die Rüstungszeile, die Karte hat dort jetzt die Meta-Zeile — auf dem Gerät prüfen. Mobil-Click-Dummy (`clickdummy/mobile/`) ist noch nicht angepasst.

## Version 0.6.0 — Beta (Branch `release/0.6.0`)

Mobile Support erscheint mit 0.6.0 als Beta. GitHub-Meilenstein `0.6.0`.

- **Enthalten:** Mobile Support ([#43](https://github.com/vt-tom/dsa5-helpers/issues/43)), Kopf „Wappenbanner“ ([#41](https://github.com/vt-tom/dsa5-helpers/issues/41), [#42](https://github.com/vt-tom/dsa5-helpers/issues/42)), Waffenkarte „Banner“ ([#40](https://github.com/vt-tom/dsa5-helpers/issues/40)), Suche bei „Zustand hinzufügen“ ([#37](https://github.com/vt-tom/dsa5-helpers/issues/37)), Sonderfertigkeiten zweispaltig ([#38](https://github.com/vt-tom/dsa5-helpers/issues/38)), Aura um freigestellte Porträts ([#35](https://github.com/vt-tom/dsa5-helpers/issues/35)). CHANGELOG 0.6.0 ist vollständig.
- **Nicht in 0.6.0** (Nutzer 2026-10-20): #34, #36 (Rüstung zentral, für ein späteres Update; beim Umsetzen die Waffenkarte im Kampf-Reiter mitprüfen), #39, #44, #45.
- **Beta veröffentlicht 2026-10-20** als Pre-release `v0.6.0` (Beta-URL liefert 0.6.0, stabile URL weiter 0.5.1). Offen: Mobil-Kanal einstellen (Job `mobile` in `release.yml` entfernen?).

### Live prüfen (0.6.0)

- **Mobile Support** (#43): Prüfliste für echte Geräte steht im Issue; Test über die Beta-Manifest-URL.
- **Aura (#35)** (in der Testinstanz an Wulfgrimm geprüft, hell/dunkel/rund): dezent genug? Bei Porträts mit Hintergrund darf nichts zu sehen sein.
- **Kopf im schmalen Fenster** (in der Testinstanz geprüft mit Testitest, drei Kugeln, 500 px): Kugeln 52 px, Porträt 96 px, Spezies · Kultur · Profession als eigene Zeile unter den Kugeln.

## Features / Backlog

Seit 2026-09-30 als GitHub-Issues geführt – siehe unten. Neue Feature-Ideen dort anlegen oder hier kurz notieren.

- **Eigenes HUD:** seit 2026-10-21 als Reiter in der DSA-Leiste (`scripts/hud.js`). Neue Modulfunktionen mit Knopf dort in `hudEntries()` ergänzen. Ohne neue DSA-Leiste (`dsa5.hotbarv3` aus) gibt es kein HUD.
- **Mobil, später:** „Neu“-Markierung im Journal, eigene Tablet-Bogenansicht, Steigern/Bearbeiten auf dem Handy (mit #34), Tablet-Fensterknöpfe vergrößern falls am Gerät zu klein (siehe #43).

---

<!-- GITHUB-ISSUES:START -->
## GitHub-Issues

_Automatisch aus `vt-tom/dsa5-helpers` übernommen (2026-10-21 06:07 UTC) — nicht von Hand bearbeiten, wird bei jedem Session-Start überschrieben. Änderungen direkt im Issue auf GitHub vornehmen._

**Nur zur Information — Agents bearbeiten diese Issues nie von sich aus, sondern nur, wenn der Nutzer ein bestimmtes Issue ausdrücklich beauftragt.**

**Offen (15)**

- **[#34](https://github.com/vt-tom/dsa5-helpers/issues/34) feat: Drei Modi im Heldenbogen – Spielen, Steigern, Bearbeiten (Desktop, Tablet, Smartphone)**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.1 · 1 Kommentar · zuletzt geändert 2026-10-20
- **[#35](https://github.com/vt-tom/dsa5-helpers/issues/35) Portrait im Dark Mode - Aura oder Spotlight**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Meilenstein: 0.6.0 · 0 Kommentare · zuletzt geändert 2026-10-20
- **[#36](https://github.com/vt-tom/dsa5-helpers/issues/36) Kampf Tab: Übersicht - Rüstung zentral über dem Portrait**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Meilenstein: 0.6.1 · 1 Kommentar · zuletzt geändert 2026-10-20
- **[#37](https://github.com/vt-tom/dsa5-helpers/issues/37) Status Tab: Suche bei den Zuständen**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Meilenstein: 0.6.0 · 0 Kommentare · zuletzt geändert 2026-10-20
- **[#38](https://github.com/vt-tom/dsa5-helpers/issues/38) Magie/Glaube Tab: 2 Spalten Ansicht für Sonderfertigkeitenhinzufügen**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Meilenstein: 0.6.0 · 0 Kommentare · zuletzt geändert 2026-10-20
- **[#39](https://github.com/vt-tom/dsa5-helpers/issues/39) Vorschlag: Dramatis Personae/ Bestiarium und Auftragsbuch mit dem Charakterbogen verbinden**
  - offen · Bearbeiter: @vt-tom · von @WiCoPala · Meilenstein: 0.6.1 · 0 Kommentare · zuletzt geändert 2026-10-20
- **[#40](https://github.com/vt-tom/dsa5-helpers/issues/40) feat: Ausgerüstete Waffen im Kampf-Reiter neu gestalten (Foundry, Tablet, Smartphone)**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.0 · 0 Kommentare · zuletzt geändert 2026-10-20
- **[#41](https://github.com/vt-tom/dsa5-helpers/issues/41) feat: Kopf „Wappenbanner“ mit wählbarem Bannerbild (Foundry & Titelblatt)**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.0 · 1 Kommentar · zuletzt geändert 2026-10-20
- **[#42](https://github.com/vt-tom/dsa5-helpers/issues/42) feat: Kopf „Wappenbanner“ auf Smartphone und Tablet (Mobile Support)**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.0 · 1 Kommentar · zuletzt geändert 2026-10-20
- **[#43](https://github.com/vt-tom/dsa5-helpers/issues/43) feat: Mobile Support (Beta) – Tablet und Smartphone, „Hybrides Spiel“**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.0 · 0 Kommentare · zuletzt geändert 2026-10-20
- **[#44](https://github.com/vt-tom/dsa5-helpers/issues/44) feat: Hausregeln auch im Standardbogen des Systems verfügbar machen**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.1 · 0 Kommentare · zuletzt geändert 2026-10-20
- **[#45](https://github.com/vt-tom/dsa5-helpers/issues/45) feat: Hausregel „Grundmanöver“ von Paladose (Möglichkeiten des Kampfes)**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.1 · 2 Kommentare · zuletzt geändert 2026-10-20
- **[#46](https://github.com/vt-tom/dsa5-helpers/issues/46) feat: Bannerbild ohne Foundry-Dateibrowser hochladen (Standardpfad der SL)**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.1 · 0 Kommentare · zuletzt geändert 2026-10-20
- **[#47](https://github.com/vt-tom/dsa5-helpers/issues/47) feat: Lebensenergiezonen (Rüstkammer II) im Zonenkreuz des Kampf-Reiters**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.1 · 0 Kommentare · zuletzt geändert 2026-10-20
- **[#48](https://github.com/vt-tom/dsa5-helpers/issues/48) feat: Grundmanöver (Paladose) Stufe 3 – Schwachpunkte erkennen, Trefferfolgen, Stören/Ablenken, gleichwertige SF ausgrauen**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · 0 Kommentare · zuletzt geändert 2026-10-20
<!-- GITHUB-ISSUES:END -->
