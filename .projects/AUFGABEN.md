# Aufgaben — 8.1.0 (v14) · Bugfixes 8.0.x

<!-- PROJECT-COORDINATION:START -->

Redaktioneller Kurzstand für die Projektübersicht. Bestehende Aufgaben, Entscheidungen und Bestätigungen gelten weiter.

## Nächster Einstieg

8.0.0 (v14) und 7.0.0 (v13) am 12.11.2026 veröffentlicht, `main` nachgezogen, #68/#73/#74/#75 geschlossen. Planung 8.1.0 (nur v14) auf `release/8.1.0`: NSC-, Kreatur- und Gruppenbogen (#53, #54, #55). Bugfixes 8.0.x auf `release/8.0.1`.

## Bei dir offen

Du: Fragen zum Gruppenbogen (#55) beantworten; Nachtest „Bogen unabhängig vom DSA-Design“.

## Wartet auf

Rückmeldungen zum Bannerbild auf Tablet, Handy und The Forge.

Quellengrundlage: AUFGABEN.md: 1. Ausdefinieren, 3. Umgesetzt – testen, Später. PROJEKTDOKU.md: Ziel, Aktueller Stand.

## Bestehende Aufgaben im Detail

<!-- PROJECT-COORDINATION:END -->

Zwei Branches aus dem Tag `v8.0.0` (Nutzerentscheidung 12.11.2026): `release/8.1.0` für die neuen Bögen (nur Foundry v14), `release/8.0.1` für Fehlerkorrekturen; jeder Bugfix wird nach `release/8.1.0` übernommen, `v13` bekommt nur Bugfixes (7.0.x). Ablauf in [RELEASE.md](../docs/RELEASE.md). Zuletzt veröffentlicht: [8.0.0](https://github.com/vt-tom/dsa5-helpers/releases/tag/v8.0.0) und [7.0.0](https://github.com/vt-tom/dsa5-helpers/releases/tag/v7.0.0) am 12.11.2026. Stand: 12.11.2026

**Vorgehen je Bogentyp** (Desktop, Tablet, Smartphone; Nutzerentscheidung 12.11.2026): Click-Dummy bauen → deine Rückmeldung einarbeiten → erst wenn der Dummy passt, in Foundry umsetzen.

**So funktioniert die Liste** (gepflegt mit `/vttom-aufgaben-pflegen`, umgesetzt mit `/vttom-todo-abarbeiten`):

- Die aktuelle Version läuft durch vier Phasen: **1. Ausdefinieren → 2. Bereit zur Umsetzung → 3. Umgesetzt – testen → 4. Fertig für Release.** Alles andere steht unter **Später**. Neues einfach unter **Eingang** ganz oben eintragen.
- Gemeldete Fehler der veröffentlichten Version stehen unter **Bugfixes 8.0.x** und laufen dort durch dieselben Schritte.
- Jeder offene Eintrag beginnt mit **Du:** (du bist dran) oder **KI:** (KI ist dran). Höchstens zwei Zeilen; wie etwas umgesetzt wurde, steht im CHANGELOG oder Issue, nicht hier.
- Rückmeldung als eingerückter Unterpunkt unter dem Eintrag: `- passt` (Test bestanden → Phase 4) oder ein Kommentar. Nur du erklärst etwas für bestanden.
- Der Überblick ganz unten (Zähler je Phase, Issues, Unstimmigkeiten) wird beim Sitzungsstart erzeugt.

## 1. Ausdefinieren

- Du: **NSC-Bogen** · #53 — Werte links passen (12.11.); NSC-Reiter links jetzt kurz „Werte · Status · Person“. Rückmeldung
  der Runde zum NSC einholen; passt alles → Umsetzung in Foundry.
- Du: **Gruppenbogen** · #55 — SL stellt im Bearbeiten-Modus ein, was Spieler von anderen sehen (Kultur/Profession/Schips, LeP, AsP/KaP,
  Zustände; mobil im Reiter Spielleitung); Anfragen an die SL mit Anlass; Proben der SL je Talent und Eigenschaft. Rückmeldung der Runde einholen, erst dann Foundry.
- Du: **Reiter „Lager“ im Gruppenbogen** · #55 — enthält jetzt die vorhandenen Helfer der Inhaltsmodule (Widrige Umstände, Nahrungssuche,
  Jagd, Schicksal und Verdammnis) plus Vorschläge; Spieler fragen SL-Funktionen mit Anlass an. Auswahl prüfen.

## 2. Bereit zur Umsetzung

## 3. Umgesetzt – testen

- [ ] Du: **Hinweis Händler/Schatz im Helfer-Bogen** · #54 — Schatz-Kreatur per Umschalter in den Helfer-Bogen holen → Hinweisleiste über dem
  Reiter-Titel (Desktop, Tablet, Handy; Spieler mit eingeschränkter Sicht über dem Porträt); der genannte Weg führt in den Schatzbogen.
- [ ] Du: **Rückweg aus Schatz** · #54 — Kreatur im Helfer-Bogen, Token markieren → „In Schatz umwandeln“ → Schatzbogen; nochmal → wieder
  Helfer-Bogen (auch mit „Standard-Bogen für Kreaturen“ und ohne eigene Wahl); Umschalter zeigt keinen Händlerbogen mehr.
- [X] Du: **Tablet: Fensterknöpfe größer** · #76 — Tablet, Helden- und Kreaturbogen (Spielen und Bearbeiten, auch minimiert) → Knöpfe oben rechts
  fingergroß und gut zu treffen, Plakette verdeckt nichts im Kopf (Schips, Banner-Knöpfe); Desktop unverändert.
- [X] Du: **Kreaturbogen: Spielen/Bearbeiten** · #54 — gewöhnliche Kreatur (Wolf, Ork) im Helfer-Bogen → Schloss in der Titelleiste da,
  Auswahl Spielen · Bearbeiten wirkt (vorher fehlte das Schloss, Bogen blieb im Bearbeiten-Modus).
- [X] Du: **Kreaturbogen** · #54 — Kreatur (z. B. Wolf, Ork, Shruuf) → Bogen-Umschalter „DSA5 Helfer-Kreaturbogen“, alle Reiter am Desktop,
  Tablet, Handy → Werte wie im Systembogen, Würfe gehen; Rückmeldungen hier eintragen. Offen: Beute schlicht oder volle Ausrüstung? Reiter „Besitzer“ bei Vertrauten?
- [X] Du: **Standard-Bogen für Kreaturen** · #54 — Einstellungen → „Heldenbogen einrichten“ → Haken setzen, speichern, neu laden →
  Kreaturen ohne eigene Bogenwahl öffnen im Helfer-Kreaturbogen; Haken weg → wieder Systembogen.
- [X] Du: **Journal-Browser mobil, Runde 2** (MOBILE.md 16.6) — Tablet/Handy als SL mit Abenteuer: Bücher als Knöpfe, „Bibliothek“ oben links im Kopf
  (in der Übersicht weg), „‹ Titel“ → Startseite, SL-Knöpfe und Einklapp-Pfeil fingergroß, ‹ › blättern (auf Start-/Vorbereitungsseite gesperrt, war dort wirkungslos).
- [X] Du: **Click-Dummy: ein Menü, aufgeräumt** — `clickdummy/start-server.bat`: ab 1280 px Breite steht das Menü links offen (einklappbar,
  gemerkt), schmaler per Knopf; Bogen × Gerät, Ansicht, Testdaten wirken; Handy-Heldenbogen: Kugel, KS und Anzahl öffnen ihre Felder.

## 4. Fertig für Release

Erst als **Beta** (Pre-release `v8.1.0`, Kanal `foundry-v14-beta`), nach Rückmeldung dasselbe Release zum normalen erklären; Korrekturen als
neue Pre-release `v8.1.1`. Nur v14 (kein 7.1.0), nur nach Auftrag; Ablauf in [RELEASE.md](../docs/RELEASE.md).

## Bugfixes 8.0.x

Branch `release/8.0.1`. Noch keine Fehler gemeldet.

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
- **Mobil, später** — „Neu“-Markierung im Journal, eigene Tablet-Bogenansicht, Steigern/Bearbeiten auf dem Handy.

---

<!-- GITHUB-ISSUES:START -->
## Überblick (erzeugt)

_Automatisch erzeugt aus GitHub (`vt-tom/dsa5-helpers`, Abruf 2026-11-13T07:15:51.941Z) und den Abschnitten oben. Nur zur Information, keine Beauftragung. Nicht von Hand bearbeiten._

| Abschnitt | Du | KI | Einträge |
|---|---|---|---|
| Bestehende Aufgaben im Detail | – | – | 5 |
| Ausdefinieren | 3 | – | 3 |
| Bereit zur Umsetzung | – | – | 0 |
| Umgesetzt – testen | 8 | – | 8 |
| Fertig für Release | – | – | 0 |
| Bugfixes 8.0.x | 1 | – | 1 |
| Später – Nächste Version | 2 | – | 2 |
| Später – Wartet auf Dritte | – | – | 1 |
| Später – Ideen | – | – | 6 |

**Offene Issues (12)**

| # | Titel | Meilenstein | Labels | In der Liste |
|---|---|---|---|---|
| [#52](https://github.com/vt-tom/dsa5-helpers/issues/52) | feat: Tooltips | – | – | Später – Ideen |
| [#53](https://github.com/vt-tom/dsa5-helpers/issues/53) | feat: NSC Sheet im DSA Helpers Design | 8.1.0 | – | Nächster Einstieg, Ausdefinieren |
| [#54](https://github.com/vt-tom/dsa5-helpers/issues/54) | feat: Kreatur Sheet im DSA Helpers Design | 8.1.0 | – | Nächster Einstieg, Umgesetzt – testen |
| [#55](https://github.com/vt-tom/dsa5-helpers/issues/55) | feat: Gruppen Sheet im DSA Helpers Design | 8.1.0 | – | Nächster Einstieg, Bei dir offen, Ausdefinieren |
| [#57](https://github.com/vt-tom/dsa5-helpers/issues/57) | feat: Geldbörse erweitern | – | – | Später – Ideen |
| [#60](https://github.com/vt-tom/dsa5-helpers/issues/60) | feat: Kampf-Aktionen – Schnellzugriff im Kampf ohne Heldenbogen | – | enhancement | Später – Ideen |
| [#61](https://github.com/vt-tom/dsa5-helpers/issues/61) | feat: Dunkles Thema für Mobil-Fenster | – | enhancement | Später – Ideen |
| [#69](https://github.com/vt-tom/dsa5-helpers/issues/69) | feat: Hausregel „Gebundene AP“ – AP verlorener Begleiter und Gegenstände bleiben zweckgebunden | – | enhancement | Später – Nächste Version |
| [#70](https://github.com/vt-tom/dsa5-helpers/issues/70) | feat: Hausregel „Sitzungs-Schips“ – mindestens ein Schip zu Sitzungsbeginn | – | enhancement | Später – Nächste Version |
| [#76](https://github.com/vt-tom/dsa5-helpers/issues/76) | feat: Tablet – Fensterknöpfe der Bögen größer | 8.1.0 | enhancement | Umgesetzt – testen |
| [#77](https://github.com/vt-tom/dsa5-helpers/issues/77) | feat: Händlerbogen im DSA Helpers Design | – | enhancement | Achtung: fehlt in der Liste |
| [#78](https://github.com/vt-tom/dsa5-helpers/issues/78) | feat: Schatzbogen im DSA Helpers Design | – | enhancement | Achtung: fehlt in der Liste |

**Geschlossen, aber noch in der Liste**

| # | Titel | Meilenstein | Labels | In der Liste |
|---|---|---|---|---|
| [#66](https://github.com/vt-tom/dsa5-helpers/issues/66) | feat: Grundmanöver „Stören und Ablenken“ (Paladose) | 0.6.3 | enhancement | Später – Ideen · Achtung: geschlossen, steht noch hier |
| [#68](https://github.com/vt-tom/dsa5-helpers/issues/68) | feat: Getrennte Versionslinien je Foundry-Generation (7.x v13, 8.x v14, 9.x v15) | – | enhancement | Nächster Einstieg · Achtung: geschlossen, steht noch hier |

**Kürzlich geschlossen (14 Tage: 13)**

[#75](https://github.com/vt-tom/dsa5-helpers/issues/75) Einstellung „Talent-Vorschläge auf dem Titelblatt“ gehört unter „Heldenbogen einrichten“ (erledigt, 12.11.) · [#74](https://github.com/vt-tom/dsa5-helpers/issues/74) bug: Tablet und Smartphone - Munitionsauswahl kann nicht verwendet werden, Auswahl nicht sichtbar. (erledigt, 12.11.) · [#73](https://github.com/vt-tom/dsa5-helpers/issues/73) bug: Kraftspeicher öffnet sich immer beim Mouseover (erledigt, 12.11.) · [#68](https://github.com/vt-tom/dsa5-helpers/issues/68) feat: Getrennte Versionslinien je Foundry-Generation (7.x v13, 8.x v14, 9.x v15) (erledigt, 12.11.) · [#72](https://github.com/vt-tom/dsa5-helpers/issues/72) fix: Gegenstände lassen sich nicht aus einem Behälter verschieben (erledigt, 02.11.) · [#71](https://github.com/vt-tom/dsa5-helpers/issues/71) feat: Eigenschaftsleiste – Kürzel MU, KL, IN … an den Würfeln anzeigen (erledigt, 02.11.) · [#63](https://github.com/vt-tom/dsa5-helpers/issues/63) feat: Neue Probendialoge auch am Desktop (erledigt, 02.11.) · [#67](https://github.com/vt-tom/dsa5-helpers/issues/67) feat: Mobil – Almanach-Eintrag (Person/Auftrag) als Blatt öffnen (erledigt, 02.11.) · … und 5 weitere
<!-- GITHUB-ISSUES:END -->
