# Aufgaben — 8.0.0 (v14) / 7.0.0 (v13)

<!-- PROJECT-COORDINATION:START -->

Redaktioneller Kurzstand für die Projektübersicht. Bestehende Aufgaben, Entscheidungen und Bestätigungen gelten weiter.

## Nächster Einstieg

Release 8.0.0/7.0.0 vorbereitet (11.11.2026): `module.json` 8.0.0, CHANGELOG mit Datum 13.11.2026 und Vergleichslinks, #73/#74 behoben und von dir abgehakt, alles auf `release/8.0.0` gepusht. Release-Notizen in `tmp/notes-8.md` und `tmp/notes-7.md`. Veröffentlichung geplant Freitag 13.11.2026 nach Auftrag (RELEASE.md, ab Schritt 2).

## Bei dir offen

Du: Auftrag zur Veröffentlichung von 8.0.0 und 7.0.0 (Freitag 13.11.2026); verschiebt sich der Termin, Datum im CHANGELOG anpassen.

## Wartet auf

Rückmeldungen zum Bannerbild auf Tablet, Handy und The Forge.

Quellengrundlage: AUFGABEN.md: 1. Ausdefinieren, 3. Umgesetzt – testen, Später. PROJEKTDOKU.md: Ziel, Aktueller Stand.

## Bestehende Aufgaben im Detail

<!-- PROJECT-COORDINATION:END -->

Branch `release/8.0.0` (aus `release/0.6.3`, seit 05.11.2026 auf GitHub), Kern #68 Versionslinien. Ziel: erste stabile Versionen 8.0.0 (Foundry v14) und 7.0.0 (Foundry v13) = Beta 0.6.3 plus Korrekturen aus der Beta-Rückmeldung, Veröffentlichung in etwa einer Woche. Zuletzt veröffentlicht: Beta 0.6.3 am 02.11.2026 ([v14](https://github.com/vt-tom/dsa5-helpers/releases/tag/v0.6.3), [v13](https://github.com/vt-tom/dsa5-helpers/releases/tag/v13-0.6.3)). Stand: 05.11.2026

**So funktioniert die Liste** (gepflegt mit `/vttom-aufgaben-pflegen`, umgesetzt mit `/vttom-todo-abarbeiten`):

- Die aktuelle Version läuft durch vier Phasen: **1. Ausdefinieren → 2. Bereit zur Umsetzung → 3. Umgesetzt – testen → 4. Fertig für Release.** Alles andere steht unter **Später**. Neues einfach unter **Eingang** ganz oben eintragen.
- Jeder offene Eintrag beginnt mit **Du:** (du bist dran) oder **KI:** (KI ist dran). Höchstens zwei Zeilen; wie etwas umgesetzt wurde, steht im CHANGELOG oder Issue, nicht hier.
- Rückmeldung als eingerückter Unterpunkt unter dem Eintrag: `- passt` (Test bestanden → Phase 4) oder ein Kommentar. Nur du erklärst etwas für bestanden.
- Der Überblick ganz unten (Zähler je Phase, Issues, Unstimmigkeiten) wird beim Sitzungsstart erzeugt.

## 1. Ausdefinieren


## 2. Bereit zur Umsetzung

## 3. Umgesetzt – testen

- [X] Du: **Versionslinien 8.0.0/7.0.0** · #68 — nach der Veröffentlichung: Update aus alter stabiler URL, altem Beta-Kanal
  und v13-Beta → landet auf 8.0.0 bzw. 7.0.0, Modulverwaltung zeigt den neuen Kanal, v13 als geprüft.
- [X] Du: **Foundry 14.370 geprüft** — 8.0.0 unter 14.370 installieren → Modulverwaltung zeigt das Modul nicht als ungeprüft.
- [X] Du: **Escape im Bogenmenü** — Schloss-Menü öffnen, Escape → nur das Menü geht zu, Bogen und andere Fenster bleiben offen.
- [X] Du: **Würfelstatistik, manuelle Würfel** — Würfel auf „Manuell“, Probe mit Eingabe, ein Feld leer lassen → Statistik zeigt Eingaben als echte, leere als digitale Würfe.
- [X] Du: **Kraftspeicher nur per Klick** · #73 — Desktop: Maus über die KS-Kugel an den AsP → nichts öffnet sich; Klick → Rundmenü,
  Maus weg → bleibt offen; Klick daneben oder Escape → zu, Bogen bleibt offen.
- [X] Du: **Munitionswahl** · #74 — Tablet, Handy und Desktop: Kampf › Körper, Fernkampfwaffe in der Hand, auf die Munition tippen
  → Auswahl vollständig über der Karte sichtbar, Wechsel auf „Keine Munition“ und zurück klappt.
- [X] Du: **Traditionen unter DSA5 8.2.1** — Held mit einer Traditions-SF im Bearbeiten-Modus → Leiteigenschaft/Faktor gesperrt,
  wohlgefällige Talente aus der SF (gesperrt), Merkmal frei, SF auch in der SF-Liste; Held ohne SF → alles bearbeitbar wie bisher.

## 4. Fertig für Release

Veröffentlichung nur nach Auftrag: erst 8.0.0, dann 7.0.0 (`--latest=false`), Ablauf in [RELEASE.md](../docs/RELEASE.md#stabile-linien-7x-foundry-v13-und-8x-foundry-v14--ab-700800).

## Später

### Nächste Version

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

_Automatisch erzeugt aus GitHub (`vt-tom/dsa5-helpers`, Abruf 2026-11-12T06:32:27.373Z) und den Abschnitten oben. Nur zur Information, keine Beauftragung. Nicht von Hand bearbeiten._

| Abschnitt | Du | KI | Einträge |
|---|---|---|---|
| Bestehende Aufgaben im Detail | – | – | 4 |
| Ausdefinieren | – | – | 0 |
| Bereit zur Umsetzung | – | – | 0 |
| Umgesetzt – testen | 6 | – | 6 |
| Fertig für Release | – | – | 0 |
| Später – Nächste Version | 3 | – | 3 |
| Später – Wartet auf Dritte | – | – | 1 |
| Später – Ideen | – | – | 7 |

**Offene Issues (12)**

| # | Titel | Meilenstein | Labels | In der Liste |
|---|---|---|---|---|
| [#52](https://github.com/vt-tom/dsa5-helpers/issues/52) | feat: Tooltips | – | – | Später – Ideen |
| [#53](https://github.com/vt-tom/dsa5-helpers/issues/53) | feat: NSC Sheet im DSA Helpers Design | – | – | Später – Nächste Version |
| [#54](https://github.com/vt-tom/dsa5-helpers/issues/54) | feat: Kreatur Sheet im DSA Helpers Design | – | – | Später – Nächste Version |
| [#55](https://github.com/vt-tom/dsa5-helpers/issues/55) | feat: Gruppen Sheet im DSA Helpers Design | – | – | Später – Ideen |
| [#57](https://github.com/vt-tom/dsa5-helpers/issues/57) | feat: Geldbörse erweitern | – | – | Später – Ideen |
| [#60](https://github.com/vt-tom/dsa5-helpers/issues/60) | feat: Kampf-Aktionen – Schnellzugriff im Kampf ohne Heldenbogen | – | enhancement | Später – Ideen |
| [#61](https://github.com/vt-tom/dsa5-helpers/issues/61) | feat: Dunkles Thema für Mobil-Fenster | – | enhancement | Später – Ideen |
| [#68](https://github.com/vt-tom/dsa5-helpers/issues/68) | feat: Getrennte Versionslinien je Foundry-Generation (7.x v13, 8.x v14, 9.x v15) | – | enhancement | Bestehende Aufgaben im Detail, Umgesetzt – testen · Achtung: Meilenstein 8.0.0 fehlt |
| [#69](https://github.com/vt-tom/dsa5-helpers/issues/69) | feat: Hausregel „Gebundene AP“ – AP verlorener Begleiter und Gegenstände bleiben zweckgebunden | – | enhancement | Später – Nächste Version |
| [#70](https://github.com/vt-tom/dsa5-helpers/issues/70) | feat: Hausregel „Sitzungs-Schips“ – mindestens ein Schip zu Sitzungsbeginn | – | enhancement | Später – Nächste Version |
| [#73](https://github.com/vt-tom/dsa5-helpers/issues/73) | bug: Kraftspeicher öffnet sich immer beim Mouseover | – | – | Nächster Einstieg, Umgesetzt – testen · Achtung: Meilenstein 8.0.0 fehlt |
| [#74](https://github.com/vt-tom/dsa5-helpers/issues/74) | bug: Tablet und Smartphone - Munitionsauswahl kann nicht verwendet werden, Auswahl nicht sichtbar. | – | – | Umgesetzt – testen · Achtung: Meilenstein 8.0.0 fehlt |

**Geschlossen, aber noch in der Liste**

| # | Titel | Meilenstein | Labels | In der Liste |
|---|---|---|---|---|
| [#66](https://github.com/vt-tom/dsa5-helpers/issues/66) | feat: Grundmanöver „Stören und Ablenken“ (Paladose) | 0.6.3 | enhancement | Später – Ideen · Achtung: geschlossen, steht noch hier |

**Kürzlich geschlossen (14 Tage: 9)**

[#72](https://github.com/vt-tom/dsa5-helpers/issues/72) fix: Gegenstände lassen sich nicht aus einem Behälter verschieben (erledigt, 02.11.) · [#71](https://github.com/vt-tom/dsa5-helpers/issues/71) feat: Eigenschaftsleiste – Kürzel MU, KL, IN … an den Würfeln anzeigen (erledigt, 02.11.) · [#63](https://github.com/vt-tom/dsa5-helpers/issues/63) feat: Neue Probendialoge auch am Desktop (erledigt, 02.11.) · [#67](https://github.com/vt-tom/dsa5-helpers/issues/67) feat: Mobil – Almanach-Eintrag (Person/Auftrag) als Blatt öffnen (erledigt, 02.11.) · [#66](https://github.com/vt-tom/dsa5-helpers/issues/66) feat: Grundmanöver „Stören und Ablenken“ (Paladose) (erledigt, 02.11.) · [#65](https://github.com/vt-tom/dsa5-helpers/issues/65) feat: Mobil – Ausrüstung: Anzahl verringern, −/+ und größeres 3-Punkte-Menü (erledigt, 02.11.) · [#64](https://github.com/vt-tom/dsa5-helpers/issues/64) feat: Mobil – Wurfergebnis nach dem Würfeln im Bogen einblenden (erledigt, 02.11.) · [#62](https://github.com/vt-tom/dsa5-helpers/issues/62) feat: Passive Verteidigung – Treffer in der Chatnachricht auf einen Blick (erledigt, 02.11.) · … und 1 weitere
<!-- GITHUB-ISSUES:END -->
