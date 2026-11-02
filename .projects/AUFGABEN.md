# Aufgaben — 0.6.3

<!-- PROJECT-COORDINATION:START -->

Redaktioneller Kurzstand für die Projektübersicht. Bestehende Aufgaben, Entscheidungen und Bestätigungen gelten weiter.

## Nächster Einstieg

Vorschlag: Die offene Almanach-Rückfrage zu den fehlenden Personen-/Auftragsreitern anhand der tatsächlich sichtbaren Einstellungen klären; danach den betreffenden Spielerablauf erneut prüfen.

## Bei dir offen

Du: Versionslinien und Zeitpunkt der Umstellung entscheiden. Offene Smartphone-/Tablet-Prüfungen in Phase 3 durchführen; vorhandene Antworten zu Desktop-Dialog und altem Dummy gelten weiter.

## Wartet auf

Rückmeldungen zum Bannerbild auf Tablet, Handy und The Forge; siehe „Wartet auf Dritte“.

Quellengrundlage: AUFGABEN.md: 1. Ausdefinieren, 3. Umgesetzt – testen, Später. PROJEKTDOKU.md: Ziel, Aktueller Stand.

## Bestehende Aufgaben im Detail

<!-- PROJECT-COORDINATION:END -->

Branch `release/0.6.3`, Meilenstein 0.6.3, Kern #59 Mobil P1 ([MOBILE.md](../docs/MOBILE.md#15-fenster-ohne-mobil-design-bestandsaufnahme-2026-10-28) Abschnitt 15). Veröffentlicht: Beta 0.6.2 ([v14](https://github.com/vt-tom/dsa5-helpers/releases/tag/v0.6.2), [v13](https://github.com/vt-tom/dsa5-helpers/releases/tag/v13-0.6.2)). 0.6.3 hat keine Eile. Stand: 02.11.2026

**So funktioniert die Liste** (gepflegt mit `/vttom-aufgaben-pflegen`, umgesetzt mit `/vttom-todo-abarbeiten`):

- Die aktuelle Version läuft durch vier Phasen: **1. Ausdefinieren → 2. Bereit zur Umsetzung → 3. Umgesetzt – testen → 4. Fertig für Release.** Alles andere steht unter **Später**. Neues einfach unter **Eingang** ganz oben eintragen.
- Jeder offene Eintrag beginnt mit **Du:** (du bist dran) oder **KI:** (KI ist dran). Höchstens zwei Zeilen; wie etwas umgesetzt wurde, steht im CHANGELOG oder Issue, nicht hier.
- Rückmeldung als eingerückter Unterpunkt unter dem Eintrag: `- passt` (Test bestanden → Phase 4) oder ein Kommentar. Nur du erklärst etwas für bestanden.
- Der Überblick ganz unten (Zähler je Phase, Issues, Unstimmigkeiten) wird beim Sitzungsstart erzeugt.

## 1. Ausdefinieren

## 2. Bereit zur Umsetzung

## 3. Umgesetzt – testen

## 4. Fertig für Release

Von dir bestätigt (Testliste 0.6.3, Checklisten 29./30.10. und 02.11.2026), geht mit 0.6.3 raus:

- **Mobil P1, bestätigter Teil** · #59 — Fensterkopf, Blätter, Vorschläge, Probendialoge, Eingabefelder ohne iPhone-Zoom.
- **Probendialog: gewählter Chip lesbar** · #59
- **Kraftspeicher am Tablet** · #59 — Blatt mit −/+, schließt mit dem Bogen; Desktop: offener Ladedialog kommt nach vorn.
- **Talent-Vorschläge am Tablet** · #59 — Karten auf dem Titelblatt (Tipp würfelt, Name öffnet, Stern).
- **Zauber-Modifikationen: Höchstzahl** · #59
- **Fernkampf-Probendialog mit „Zielen“** — Absturz behoben.
- **Modul-Reiter der DSA-Leiste** — Symbolknöpfe wieder klein.
- **Passive Verteidigung: 1 und 20** · #56
- **Mobil-Kanal eingestellt** — Job `mobile` aus `release.yml` entfernt; wirkt erst nach Commit und Push.
- **Mobiler Heldenbogen im Dummy** — alter Bogen (Runde 1–3) entfernt.
- **Eigenschaftskürzel im Würfel** · #71
- **Gegenstand aus Behälter ziehen** · #72 — Rechtsklick nimmt heraus (Systemverhalten).
- **Wurfergebnis als Blatt** · #64
- **Anzahl in der Ausrüstung** · #65
- **LeP/AsP/KaP eingeben** · #59
- **Talentzeilen tippen/drücken** · #59
- **Eigenschaftswürfel im Probendialog** · #59
- **Kampftracker: Zug beenden, Schrift** · #59
- **Almanach-Eintrag als Blatt** · #67
- **Persönlicher Auftrag** · #39
- **Stören und Ablenken** · #66
- **Passive Verteidigung: Chatkarte** · #62
- **Passive Verteidigung im Spielabend** · #56
- **HUD-Reiter als Spieler**
- **Click-Dummy: Seitenmenü** — nur Hauptseiten, Knopf überall unten links.
- **Passive Verteidigung unter v13** · #56 — kommt mit dem Merge `release/0.6.3` → `v13`.
- **v13-Beta mit den 0.6.3-Funktionen** · #63 #71 #72 — Tests nach dem Merge übernehmen die Tester.
- **Echte Geräte** · #43 #42
- **Probendialoge am Desktop** · #63 — einspaltig 480 px, Chips, Kostenzeile, dunkle Kopfleiste, Sonderfertigkeiten, Trefferzonen, Einstellung der SL.
- **Moduleinstellungen aufgeräumt** — nur Knöpfe, Untermenü „Darstellung“, Statistik-Einstellungen im Fenster.
- **Kraftspeicher im eingeklappten Kopf** · #59

## Später

### Nächste Version

- Du: **Getrennte Versionslinien** · #68 — Schema steht: 7.x v13, 8.x v14, 9.x v15, Betas `-beta`. Zu entscheiden: wann stabile Kanäle (0.6.3 geht noch im alten Schema raus).
  Danach KI: Manifeste/ZIPs je Linie, Update-Pfade trennen, 0.x-Installationen überführen, Workflow/README/RELEASE.md.
- Du: **NSC- und Kreaturbogen** · #53 #54 — Titelseite nach Rückmeldung (31.10.) im Dummy: `clickdummy/index.html?actor=nsc` bzw. `=kreatur`, `clickdummy/mobile/nsc-kreatur.html`. Ansehen und rückmelden.
  Danach KI: zweites Kreatur-Beispiel (Ork, humanoid mit Waffen); offen bleibt die linke Leiste ja/nein.
- Du: **Hausregel „Gebundene AP“** · #69 — Antworten der Runde da (Spielzeit, Antrag + SL-Freigabe, alle Gegenstände). Entscheiden: an Gegenstände
  gebundene SF (z. B. Stabzauber) beim Freigeben automatisch entfernen oder von Hand? Danach KI: umsetzen.
- Du: **Hausregel „Sitzungs-Schips“** · #70 — Antworten da (Obergrenze gilt, Automatik erwünscht, alle vorausgewählt). Entscheiden: Sitzungsbeginn
  automatisch erkennen (≥ 8 h seit letztem Start) oder nur Frage beim SL-Login? Danach KI: umsetzen.

### Wartet auf Dritte

- **Bannerbild** — Rückmeldungen der Nutzer zu Tablet/Handy und The Forge (`forgevtt`); ein Fehler wird ein neues Issue.

### Ideen

- **Kampf-Aktionen** · #60 — Schnellzugriff im Kampf ohne Bogen (Angriffe, waffenlos, Zauber, Liturgien, Gegenstände, Zug verschieben). Offen: Umfang, nur mobil oder auch Desktop.
- **Dunkles Thema mobil** · #61 — echtes dunkles Thema für Systemfenster, Dialoge und Panels (seit 0.6.3 mobil immer hell). Ausgangspunkt: MOBILE.md 15.5.
- **Tooltips für Gegenstände** · #52 — offen: lange Beschreibungen, Verhalten im Systembogen, losgelöster Bogen.
- **Gruppenbogen im DSA5-Helpers-Design** · #55
- **Geldbörse erweitern** · #57 — weitere Währungen mit Umrechnen. Offen: Herkunft der Währungen (Rechte), Datenmodell.
- **v13: Helfen und Grundmanöver** · #66 — machbar über nachgebildeten Modifikator-Hook (Hülle um `DiceDSA5.setupDialog`, braucht deine Freigabe); Grundmanöver aufwendig,
  weil DSA7 je Modifikator nur einen Wert kennt (Wuchtschlag, Finte, Zielen teilen). Erst bei Bedarf aus v13-Runden; Einzelheiten in PROJEKTDOKU „Versionslinien“.
- **Mobil, später** — „Neu“-Markierung im Journal, eigene Tablet-Bogenansicht, Steigern/Bearbeiten auf dem Handy, Tablet-Fensterknöpfe größer, falls am Gerät zu klein.

---

<!-- GITHUB-ISSUES:START -->
## Überblick (erzeugt)

_Automatisch erzeugt aus GitHub (`vt-tom/dsa5-helpers`, Abruf 2026-11-02T16:06:43.331Z) und den Abschnitten oben. Nur zur Information, keine Beauftragung. Nicht von Hand bearbeiten._

| Abschnitt | Du | KI | Einträge |
|---|---|---|---|
| Bestehende Aufgaben im Detail | – | – | 4 |
| Ausdefinieren | – | – | 0 |
| Bereit zur Umsetzung | – | – | 0 |
| Umgesetzt – testen | – | – | 0 |
| Fertig für Release | – | – | 31 |
| Später – Nächste Version | 4 | – | 4 |
| Später – Wartet auf Dritte | – | – | 1 |
| Später – Ideen | – | – | 7 |

**Offene Issues (19)**

| # | Titel | Meilenstein | Labels | In der Liste |
|---|---|---|---|---|
| [#52](https://github.com/vt-tom/dsa5-helpers/issues/52) | feat: Tooltips | – | – | Später – Ideen |
| [#53](https://github.com/vt-tom/dsa5-helpers/issues/53) | feat: NSC Sheet im DSA Helpers Design | – | – | Später – Nächste Version |
| [#54](https://github.com/vt-tom/dsa5-helpers/issues/54) | feat: Kreatur Sheet im DSA Helpers Design | – | – | Später – Nächste Version |
| [#55](https://github.com/vt-tom/dsa5-helpers/issues/55) | feat: Gruppen Sheet im DSA Helpers Design | – | – | Später – Ideen |
| [#57](https://github.com/vt-tom/dsa5-helpers/issues/57) | feat: Geldbörse erweitern | – | – | Später – Ideen |
| [#59](https://github.com/vt-tom/dsa5-helpers/issues/59) | feat: Mobil P1 – Fenster am Spieltisch im Mobil-Design (Vorschläge, Kraftspeicher, Zonen, Kampfdialog, Kampftracker) | 0.6.3 | enhancement | Bestehende Aufgaben im Detail, Fertig für Release |
| [#60](https://github.com/vt-tom/dsa5-helpers/issues/60) | feat: Kampf-Aktionen – Schnellzugriff im Kampf ohne Heldenbogen | – | enhancement | Später – Ideen |
| [#61](https://github.com/vt-tom/dsa5-helpers/issues/61) | feat: Dunkles Thema für Mobil-Fenster | – | enhancement | Später – Ideen |
| [#62](https://github.com/vt-tom/dsa5-helpers/issues/62) | feat: Passive Verteidigung – Treffer in der Chatnachricht auf einen Blick | 0.6.3 | enhancement | Fertig für Release |
| [#63](https://github.com/vt-tom/dsa5-helpers/issues/63) | feat: Neue Probendialoge auch am Desktop | 0.6.3 | enhancement | Fertig für Release |
| [#64](https://github.com/vt-tom/dsa5-helpers/issues/64) | feat: Mobil – Wurfergebnis nach dem Würfeln im Bogen einblenden | 0.6.3 | enhancement | Fertig für Release |
| [#65](https://github.com/vt-tom/dsa5-helpers/issues/65) | feat: Mobil – Ausrüstung: Anzahl verringern, −/+ und größeres 3-Punkte-Menü | 0.6.3 | enhancement | Fertig für Release |
| [#66](https://github.com/vt-tom/dsa5-helpers/issues/66) | feat: Grundmanöver „Stören und Ablenken“ (Paladose) | 0.6.3 | enhancement | Fertig für Release, Später – Ideen |
| [#67](https://github.com/vt-tom/dsa5-helpers/issues/67) | feat: Mobil – Almanach-Eintrag (Person/Auftrag) als Blatt öffnen | 0.6.3 | enhancement | Fertig für Release |
| [#68](https://github.com/vt-tom/dsa5-helpers/issues/68) | feat: Getrennte Versionslinien je Foundry-Generation (7.x v13, 8.x v14, 9.x v15) | – | enhancement | Später – Nächste Version |
| [#69](https://github.com/vt-tom/dsa5-helpers/issues/69) | feat: Hausregel „Gebundene AP“ – AP verlorener Begleiter und Gegenstände bleiben zweckgebunden | – | enhancement | Später – Nächste Version |
| [#70](https://github.com/vt-tom/dsa5-helpers/issues/70) | feat: Hausregel „Sitzungs-Schips“ – mindestens ein Schip zu Sitzungsbeginn | – | enhancement | Später – Nächste Version |
| [#71](https://github.com/vt-tom/dsa5-helpers/issues/71) | feat: Eigenschaftsleiste – Kürzel MU, KL, IN … an den Würfeln anzeigen | 0.6.3 | enhancement | Fertig für Release |
| [#72](https://github.com/vt-tom/dsa5-helpers/issues/72) | fix: Gegenstände lassen sich nicht aus einem Behälter verschieben | 0.6.3 | bug | Fertig für Release |

**Kürzlich geschlossen (14 Tage: 20)**

[#51](https://github.com/vt-tom/dsa5-helpers/issues/51) V13 Support prüfen (erledigt, 28.10.) · [#56](https://github.com/vt-tom/dsa5-helpers/issues/56) feat: Hausregel Passive Verteidigung – ein Angriffswurf ohne aktive Parade (erledigt, 28.10.) · [#58](https://github.com/vt-tom/dsa5-helpers/issues/58) feat: Talent-Vorschläge auf dem Titelblatt (erledigt, 28.10.) · [#50](https://github.com/vt-tom/dsa5-helpers/issues/50) Magieleiste/bubble für Kraftspeicher (erledigt, 28.10.) · [#47](https://github.com/vt-tom/dsa5-helpers/issues/47) feat: Lebensenergiezonen (Rüstkammer II) im Zonenkreuz des Kampf-Reiters (erledigt, 28.10.) · [#49](https://github.com/vt-tom/dsa5-helpers/issues/49) Hier ist eine Test Idee die ich gerne einmal Synchronisiert hätte. (geschlossen (nicht geplant), 22.10.) · [#48](https://github.com/vt-tom/dsa5-helpers/issues/48) feat: Grundmanöver (Paladose) Stufe 3 – Schwachpunkte erkennen, Trefferfolgen, Stören/Ablenken, gleichwertige SF ausgrauen (erledigt, 21.10.) · [#46](https://github.com/vt-tom/dsa5-helpers/issues/46) feat: Bannerbild ohne Foundry-Dateibrowser hochladen (Standardpfad der SL) (erledigt, 21.10.) · … und 12 weitere
<!-- GITHUB-ISSUES:END -->
