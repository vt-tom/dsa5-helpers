# Aufgaben — 8.1.0 (v14) · Bugfixes 8.0.x

<!-- PROJECT-COORDINATION:START -->

Redaktioneller Kurzstand für die Projektübersicht. Bestehende Aufgaben, Entscheidungen und Bestätigungen gelten weiter.

## Nächster Einstieg

8.0.0 (v14) und 7.0.0 (v13) am 12.11.2026 veröffentlicht, `main` nachgezogen, #68/#73/#74/#75 geschlossen. Planung 8.1.0 (nur v14) auf `release/8.1.0`: NSC-, Kreatur- und Gruppenbogen (#53, #54, #55). Bugfixes 8.0.x auf `release/8.0.1`.

## Bei dir offen

Du: Ziel und Inhalt des Gruppenbogens (#55) beschreiben; linke Leiste bei NSC/Kreatur ja oder nein; Nachtest „Bogen unabhängig vom DSA-Design“.

## Wartet auf

Rückmeldungen zum Bannerbild auf Tablet, Handy und The Forge.

Quellengrundlage: AUFGABEN.md: 1. Ausdefinieren, 3. Umgesetzt – testen, Später. PROJEKTDOKU.md: Ziel, Aktueller Stand.

## Bestehende Aufgaben im Detail

<!-- PROJECT-COORDINATION:END -->

Zwei Branches aus dem Tag `v8.0.0` (Nutzerentscheidung 12.11.2026): `release/8.1.0` für die neuen Bögen (nur Foundry v14), `release/8.0.1` für Fehlerkorrekturen; jeder Bugfix wird nach `release/8.1.0` übernommen, `v13` bekommt nur Bugfixes (7.0.x). Ablauf in [RELEASE.md](../docs/RELEASE.md). Zuletzt veröffentlicht: [8.0.0](https://github.com/vt-tom/dsa5-helpers/releases/tag/v8.0.0) und [7.0.0](https://github.com/vt-tom/dsa5-helpers/releases/tag/v7.0.0) am 12.11.2026. Stand: 12.11.2026

**So funktioniert die Liste** (gepflegt mit `/vttom-aufgaben-pflegen`, umgesetzt mit `/vttom-todo-abarbeiten`):

- Die aktuelle Version läuft durch vier Phasen: **1. Ausdefinieren → 2. Bereit zur Umsetzung → 3. Umgesetzt – testen → 4. Fertig für Release.** Alles andere steht unter **Später**. Neues einfach unter **Eingang** ganz oben eintragen.
- Gemeldete Fehler der veröffentlichten Version stehen unter **Bugfixes 8.0.x** und laufen dort durch dieselben Schritte.
- Jeder offene Eintrag beginnt mit **Du:** (du bist dran) oder **KI:** (KI ist dran). Höchstens zwei Zeilen; wie etwas umgesetzt wurde, steht im CHANGELOG oder Issue, nicht hier.
- Rückmeldung als eingerückter Unterpunkt unter dem Eintrag: `- passt` (Test bestanden → Phase 4) oder ein Kommentar. Nur du erklärst etwas für bestanden.
- Der Überblick ganz unten (Zähler je Phase, Issues, Unstimmigkeiten) wird beim Sitzungsstart erzeugt.

## 1. Ausdefinieren

- KI: **NSC- und Kreaturbogen** · #53 #54 — zweites Kreatur-Beispiel im Click-Dummy (Ork, humanoid mit Waffen; Desktop und mobil).
  Titelseite steht, Annahmen 1–3 am 12.11. bestätigt (im Issue).
- Du: **NSC- und Kreaturbogen: linke Leiste** · #53 #54 — im Dummy (`clickdummy/index.html?actor=nsc` bzw. `=kreatur`) entscheiden: linke Leiste
  wie beim Heldenbogen behalten oder weglassen?
- Du: **Gruppenbogen** · #55 — beschreiben, wofür ihr ihn am Tisch nutzt (z. B. Überblick für die SL, Gruppenkasse, gemeinsames Gepäck, Proben
  der Gruppe). Danach KI: Gruppenbogen des Systems (DSA5 8.2) sichten und 2–3 Varianten im Click-Dummy zeigen.

## 2. Bereit zur Umsetzung

## 3. Umgesetzt – testen

## 4. Fertig für Release

Veröffentlichung nur nach Auftrag, nur v14 (kein 7.1.0); Ablauf in [RELEASE.md](../docs/RELEASE.md).

## Bugfixes 8.0.x

Branch `release/8.0.1` im selben Ordner (kein zweiter Arbeitsbaum, Nutzerwunsch 15.11.2026): Fix dort committen, dann in
`release/8.1.0` per `git merge --no-ff release/8.0.1` übernehmen. Stand 15.11.: #79, #80, #81, #82, #85, #86, #89 auf 8.0.1, nach 8.1.0 gemergt.

- [ ] Du: **Waffenwechsel bei „Handbeschränkung ignorieren“** · #79 — Grombrak (Haken in seinem Kampf-Reiter des Systembogens), Kampf › Körper:
  Haupthand auf Eisenwalder → Eisenwalder in der Hand, Lindwurmschläger unter „Ebenfalls angelegt“; ebenso per Rechtsklick aufs Schild.
- [ ] Du: **Behältnis öffnet mit Inhalt** · #80 — Ausrüstung › Behältnisse, Klick auf Lederrucksack → Fenster öffnet auf Reiter „Behältnis“.
- [ ] Du: **Behältnis: Namen sichtbar** · #80 (Variante A) — Behälterfenster auf Reiter „Behältnis“ → unter jedem Feld steht der
  Name, lange Namen auf zwei Zeilen gekürzt; Ziehen und Rechtsklick (herausnehmen) gehen weiter.
- [ ] Du: **Hinweis gestapelter Kraftspeicher** · #86 — Kraftspeicher-Gegenstand auf Anzahl 3 stellen, KS-Kugel anklicken (Desktop und
  Smartphone) → Hinweis „… (Anzahl 3) zählt als ein einziger Speicher …“; bei Anzahl 1 kein Hinweis. Erklärung steht im Issue.
- [ ] Du: **Götterschips im Kopf** · #89 · Desktop, Handy — Held mit Götterschips (Götter Aventuriens 2) → hinter den Schips im Kopf, Klick
  gibt aus bzw. stellt wieder her. Live geprüft (Testinstanz, Praios, Desktop und Handy); viele Götter auf dem Handy nicht geprüft.
- [ ] Du: **Eigenschaften im Kopf einheitlich** · #85 — Spielmodus, Reiter Eigenschaften → Würfelleiste im Kopf wie überall, keine Kacheln;
  Bearbeiten/Steigern → Kacheln mit +/−, keine Leiste. Ebenso Kreaturbogen (8.1.0). Live geprüft am Desktop (Held).
- [ ] Du: **Vor-/Nachteile und Sprachen als Favoriten** · #81 #82 — Stern an Vorteil, Nachteil, Sprache/Schrift → Titelblatt-Gruppen
  „Vor- & Nachteile“ und „Sprache“ mit Stufe (z. B. III), kein Würfel. Live geprüft am Desktop.

- [ ] Du: **Bogen unabhängig vom DSA-Design** (in 8.0.0 enthalten, Nachtest) — Desktop, Tablet, Handy: je Design (auch mit dunklem Foundry)
  Bogen im Bearbeiten-Modus, Eigenschaften und Notizen → Felder, Rahmen, Plakette, Griff unten rechts überall gleich, auch bei dunklem Bogen.

## Später

### Nächste Version

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
- **Geldbörse erweitern** · #57 — weitere Währungen mit Umrechnen. Offen: Herkunft der Währungen (Rechte), Datenmodell.
- **v13: Helfen und Grundmanöver** · #66 — machbar über nachgebildeten Modifikator-Hook (Hülle um `DiceDSA5.setupDialog`, braucht deine Freigabe); Grundmanöver aufwendig,
  weil DSA7 je Modifikator nur einen Wert kennt. v13 bekommt seit 12.11.2026 nur noch Bugfixes; nur bei ausdrücklichem Bedarf.
- **Mobil, später** — „Neu“-Markierung im Journal, eigene Tablet-Bogenansicht, Steigern/Bearbeiten auf dem Handy, Tablet-Fensterknöpfe größer, falls am Gerät zu klein.

---

<!-- GITHUB-ISSUES:START -->
## Überblick (erzeugt)

_Automatisch erzeugt aus GitHub (`vt-tom/dsa5-helpers`, Abruf 2026-11-16T05:34:54.662Z) und den Abschnitten oben. Nur zur Information, keine Beauftragung. Nicht von Hand bearbeiten._

| Abschnitt | Du | KI | Einträge |
|---|---|---|---|
| Bestehende Aufgaben im Detail | – | – | 5 |
| Ausdefinieren | 2 | 1 | 3 |
| Bereit zur Umsetzung | – | – | 0 |
| Umgesetzt – testen | – | – | 0 |
| Fertig für Release | – | – | 0 |
| Bugfixes 8.0.x | 8 | – | 8 |
| Später – Nächste Version | 2 | – | 2 |
| Später – Wartet auf Dritte | – | – | 1 |
| Später – Ideen | – | – | 6 |

**Offene Issues (26)**

| # | Titel | Meilenstein | Labels | In der Liste |
|---|---|---|---|---|
| [#52](https://github.com/vt-tom/dsa5-helpers/issues/52) | feat: Tooltips | – | – | Später – Ideen |
| [#53](https://github.com/vt-tom/dsa5-helpers/issues/53) | feat: NSC Sheet im DSA Helpers Design | 8.1.0 | – | Nächster Einstieg, Ausdefinieren |
| [#54](https://github.com/vt-tom/dsa5-helpers/issues/54) | feat: Kreatur Sheet im DSA Helpers Design | 8.1.0 | – | Nächster Einstieg, Ausdefinieren |
| [#55](https://github.com/vt-tom/dsa5-helpers/issues/55) | feat: Gruppen Sheet im DSA Helpers Design | 8.1.0 | – | Nächster Einstieg, Bei dir offen, Ausdefinieren |
| [#57](https://github.com/vt-tom/dsa5-helpers/issues/57) | feat: Geldbörse erweitern | – | – | Später – Ideen |
| [#60](https://github.com/vt-tom/dsa5-helpers/issues/60) | feat: Kampf-Aktionen – Schnellzugriff im Kampf ohne Heldenbogen | – | enhancement | Später – Ideen |
| [#61](https://github.com/vt-tom/dsa5-helpers/issues/61) | feat: Dunkles Thema für Mobil-Fenster | – | enhancement | Später – Ideen |
| [#69](https://github.com/vt-tom/dsa5-helpers/issues/69) | feat: Hausregel „Gebundene AP“ – AP verlorener Begleiter und Gegenstände bleiben zweckgebunden | – | enhancement | Später – Nächste Version |
| [#70](https://github.com/vt-tom/dsa5-helpers/issues/70) | feat: Hausregel „Sitzungs-Schips“ – mindestens ein Schip zu Sitzungsbeginn | – | enhancement | Später – Nächste Version |
| [#76](https://github.com/vt-tom/dsa5-helpers/issues/76) | feat: Tablet – Fensterknöpfe der Bögen größer | 8.1.0 | enhancement | Achtung: fehlt in der Liste |
| [#77](https://github.com/vt-tom/dsa5-helpers/issues/77) | feat: Händlerbogen im DSA Helpers Design | 8.1.0 | enhancement | Achtung: fehlt in der Liste |
| [#78](https://github.com/vt-tom/dsa5-helpers/issues/78) | feat: Schatzbogen im DSA Helpers Design | 8.1.0 | enhancement | Achtung: fehlt in der Liste |
| [#79](https://github.com/vt-tom/dsa5-helpers/issues/79) | Kampfkarte (Fehlermeldung) | – | – | Bugfixes 8.0.x |
| [#80](https://github.com/vt-tom/dsa5-helpers/issues/80) | Behältnisse (Optimierungwunsch) | – | – | Bugfixes 8.0.x |
| [#81](https://github.com/vt-tom/dsa5-helpers/issues/81) | Vor- & Nachteile (Optimierungswunsch) | – | – | Bugfixes 8.0.x |
| [#82](https://github.com/vt-tom/dsa5-helpers/issues/82) | Sprachen (Optimierungswunsch) | – | – | Bugfixes 8.0.x |
| [#83](https://github.com/vt-tom/dsa5-helpers/issues/83) | Hausregeln (Feedback) | – | – | Achtung: fehlt in der Liste |
| [#84](https://github.com/vt-tom/dsa5-helpers/issues/84) | Magie (Optimierungswunsch) | – | – | Achtung: fehlt in der Liste |
| [#85](https://github.com/vt-tom/dsa5-helpers/issues/85) | Optik (Optimierungswunsch) | – | – | Bugfixes 8.0.x |
| [#86](https://github.com/vt-tom/dsa5-helpers/issues/86) | Kraftspeicher (Optimierungswunsch) | – | – | Bugfixes 8.0.x |
| [#87](https://github.com/vt-tom/dsa5-helpers/issues/87) | Bannerbild (Frage) | – | – | Achtung: fehlt in der Liste |
| [#88](https://github.com/vt-tom/dsa5-helpers/issues/88) | NSC- und Kreaturenbögen (Optimierungswunsch) | – | – | Achtung: fehlt in der Liste |
| [#89](https://github.com/vt-tom/dsa5-helpers/issues/89) | feat: Götterschips unterstützung | – | – | Bugfixes 8.0.x |
| [#90](https://github.com/vt-tom/dsa5-helpers/issues/90) | Automatische Parade - Verbesserung | – | – | Achtung: fehlt in der Liste |
| [#91](https://github.com/vt-tom/dsa5-helpers/issues/91) | Dramatis Personae Tab - Verbesserungen | – | – | Achtung: fehlt in der Liste |
| [#92](https://github.com/vt-tom/dsa5-helpers/issues/92) | Grundmanöver statt gleichwertiger Sonderfertigkeiten (Optimierungswunsch) | – | – | Achtung: fehlt in der Liste |

**Geschlossen, aber noch in der Liste**

| # | Titel | Meilenstein | Labels | In der Liste |
|---|---|---|---|---|
| [#66](https://github.com/vt-tom/dsa5-helpers/issues/66) | feat: Grundmanöver „Stören und Ablenken“ (Paladose) | 0.6.3 | enhancement | Später – Ideen · Achtung: geschlossen, steht noch hier |
| [#68](https://github.com/vt-tom/dsa5-helpers/issues/68) | feat: Getrennte Versionslinien je Foundry-Generation (7.x v13, 8.x v14, 9.x v15) | – | enhancement | Nächster Einstieg · Achtung: geschlossen, steht noch hier |

**Kürzlich geschlossen (14 Tage: 13)**

[#75](https://github.com/vt-tom/dsa5-helpers/issues/75) Einstellung „Talent-Vorschläge auf dem Titelblatt“ gehört unter „Heldenbogen einrichten“ (erledigt, 12.11.) · [#74](https://github.com/vt-tom/dsa5-helpers/issues/74) bug: Tablet und Smartphone - Munitionsauswahl kann nicht verwendet werden, Auswahl nicht sichtbar. (erledigt, 12.11.) · [#73](https://github.com/vt-tom/dsa5-helpers/issues/73) bug: Kraftspeicher öffnet sich immer beim Mouseover (erledigt, 12.11.) · [#68](https://github.com/vt-tom/dsa5-helpers/issues/68) feat: Getrennte Versionslinien je Foundry-Generation (7.x v13, 8.x v14, 9.x v15) (erledigt, 12.11.) · [#72](https://github.com/vt-tom/dsa5-helpers/issues/72) fix: Gegenstände lassen sich nicht aus einem Behälter verschieben (erledigt, 02.11.) · [#71](https://github.com/vt-tom/dsa5-helpers/issues/71) feat: Eigenschaftsleiste – Kürzel MU, KL, IN … an den Würfeln anzeigen (erledigt, 02.11.) · [#63](https://github.com/vt-tom/dsa5-helpers/issues/63) feat: Neue Probendialoge auch am Desktop (erledigt, 02.11.) · [#67](https://github.com/vt-tom/dsa5-helpers/issues/67) feat: Mobil – Almanach-Eintrag (Person/Auftrag) als Blatt öffnen (erledigt, 02.11.) · … und 5 weitere
<!-- GITHUB-ISSUES:END -->
