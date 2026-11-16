# Aufgaben — 8.1.0 (v14) · Bugfixes 8.0.x

<!-- PROJECT-COORDINATION:START -->

Redaktioneller Kurzstand für die Projektübersicht. Bestehende Aufgaben, Entscheidungen und Bestätigungen gelten weiter.

## Nächster Einstieg

8.0.1 (v14) und 7.0.1 (v13) am 16.11.2026 veröffentlicht, `main` nachgezogen, Meilenstein 8.0.1 geschlossen. Planung 8.1.0 (nur v14) auf `release/8.1.0`: NSC-, Kreatur- und Gruppenbogen (#53, #54, #55). Bugfixes 8.0.x auf `release/8.0.2`.

## Bei dir offen

Du: NSC- und Gruppenbogen in Foundry testen (erste Fassung, 13.11.); Platz für Schicksal und Verdammnis im Click-Dummy wählen; Nachtest „Bogen unabhängig vom DSA-Design“.

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

- Du: **Gruppenbogen: Platz für Schicksal und Verdammnis** · #55 — Click-Dummy `?actor=gruppe`, Menü › Diese Seite: A linke Spalte,
  B in den Kacheln (Vorschlag: im System schon angelegt), C eigenes Panel. Variante wählen; erst danach Foundry.
- Du: **Reiter „Lager“ im Gruppenbogen** · #55 — in Foundry vorerst nur Helfer der Inhaltsmodule plus Würfelstatistik/Hausregelbuch;
  Vorschläge (Rasten, Wetter, Wache, Kräutersuche) noch nicht gebaut. Auswahl prüfen, Rückmeldung der Runde einholen.

- Du: **Händler- und Schatzbogen** · #77 #78 — Click-Dummy Desktop `?actor=haendler|schatz`, Tablet/Smartphone `mobile/haendler-schatz.html` (16.11.):
  Rolle Spieler → Laden, SL → Reiter „Laden“; Menü › Diese Seite: A Kacheln, B Liste, C Ware und Beutel. Variante wählen, dann Foundry.

- Du: **Fahrzeugbogen (Konzept)** · #93 — Click-Dummy Desktop `?actor=fahrzeug`, Tablet/Smartphone `mobile/fahrzeug.html` (16.11.), Menü › Diese
  Seite: Titelblatt A Seekampf, B Reise und Ladung. Ansehen, Issue in der Community teilen; Foundry erst nach deren Rückmeldung.

## 2. Bereit zur Umsetzung


## 3. Umgesetzt – testen

- [ ] Du: **Tooltips im Bogen** · #52 · Desktop — Maus kurz auf Namen (Talente, Zauber, Inventar, Titelblatt, Zustände, Hände, Wappenschild; NSC,
  Kreatur, Gruppe) → Karte des Systems neben dem Fenster, Mittelklick heftet an; Einstellung „Tooltips beim Überfahren“ aus → keine.
- [ ] Du: **NSC-Bogen in Foundry** · #53 — NSC → Bogen-Umschalter „DSA5 Helfer-NSC-Bogen“, Desktop/Tablet/Handy → Titelblatt mit Angriffen,
  Talenten (− / +) und Favoriten, links Werte · Status · Person, Würfe gehen; als Händler/Schatz und zurück → wieder Helfer-Bogen.
- [ ] Du: **Gruppenbogen in Foundry** · #55 — Gruppe → „DSA5 Helfer-Gruppenbogen“, als SL und Spieler: Kacheln S/M/L, Freigaben (Bearbeiten
  bzw. Spielleitung), Gruppenprobe/Anfordern, Kasse, Schips; Spieler fragt Lager-Helfer an → SL „Ausführen“. Inventar/Reise = Systemansicht.

- [X] Du: **Hinweis Händler/Schatz im Helfer-Bogen** · #54 — Schatz-Kreatur per Umschalter in den Helfer-Bogen holen → Hinweisleiste über dem
  Reiter-Titel (Desktop, Tablet, Handy; Spieler mit eingeschränkter Sicht über dem Porträt); der genannte Weg führt in den Schatzbogen.
- [X] Du: **Rückweg aus Schatz** · #54 — Kreatur im Helfer-Bogen, Token markieren → „In Schatz umwandeln“ → Schatzbogen; nochmal → wieder
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

- Du: **Video zu 8.1.0** — Inhalte aus CHANGELOG `[8.1.0]` plus alle 8.0.x-Abschnitte (ab 8.0.1); planen mit `/vttom-video-workflow`,
  sobald 8.1.0 steht. Szenen, Testdaten und Beispielhelden dabei festlegen.

## Bugfixes 8.0.x

[8.0.1](https://github.com/vt-tom/dsa5-helpers/releases/tag/v8.0.1) und [7.0.1](https://github.com/vt-tom/dsa5-helpers/releases/tag/v7.0.1)
am 16.11.2026 veröffentlicht (#79–#91, v13 nur #79 und #87), Issues und Meilenstein 8.0.1 geschlossen, `main` nachgezogen.
Hauptordner seit 16.11. auf `release/8.1.0`. Nächste Fehlerkorrekturen auf `release/8.0.2` (bei Bedarf eigener Arbeitsordner):
Fix dort committen, dann in `release/8.1.0` per `git merge --no-ff release/8.0.2` übernehmen.

## Später

### Nächste Version

- Du: **Hausregel „Gebundene AP“** · #69 — Antworten der Runde da (Spielzeit, Antrag + SL-Freigabe, alle Gegenstände). Entscheiden: an Gegenstände
  gebundene SF (z. B. Stabzauber) beim Freigeben automatisch entfernen oder von Hand? Danach KI: umsetzen.
- Du: **Hausregel „Sitzungs-Schips“** · #70 — Antworten da (Obergrenze gilt, Automatik erwünscht, alle vorausgewählt). Entscheiden: Sitzungsbeginn
  automatisch erkennen (≥ 8 h seit letztem Start) oder nur Frage beim SL-Login? Danach KI: umsetzen.

### Wartet auf Dritte

- **Bannerbild** — Rückmeldungen der Nutzer zu Tablet/Handy und The Forge (`forgevtt`); ein Fehler wird ein neues Issue.
- **Fahrzeugbogen** · #93 — Rückmeldung der Community: wofür Fahrzeuge am Tisch genutzt werden (Seekampf, Reise, Lager); danach Variante wählen.

### Ideen

- **Grundmanöver statt gleichwertiger SF** · #92 — Hinweis kommt mit 8.0.1, das Issue sammelt weitere Rückmeldungen und Ideen.
- **Kampf-Aktionen** · #60 — Schnellzugriff im Kampf ohne Bogen (Angriffe, waffenlos, Zauber, Liturgien, Gegenstände, Zug verschieben). Offen: Umfang, nur mobil oder auch Desktop.
- **Dunkles Thema mobil** · #61 — echtes dunkles Thema für Systemfenster, Dialoge und Panels (seit 0.6.3 mobil immer hell). Ausgangspunkt: MOBILE.md 15.5.
- **Geldbörse erweitern** · #57 — weitere Währungen mit Umrechnen. Offen: Herkunft der Währungen (Rechte), Datenmodell.
- **v13: Helfen und Grundmanöver** · #66 — machbar über nachgebildeten Modifikator-Hook (Hülle um `DiceDSA5.setupDialog`, braucht deine Freigabe); Grundmanöver aufwendig,
  weil DSA7 je Modifikator nur einen Wert kennt. v13 bekommt seit 12.11.2026 nur noch Bugfixes; nur bei ausdrücklichem Bedarf.
- **Mobil, später** — „Neu“-Markierung im Journal, eigene Tablet-Bogenansicht, Steigern/Bearbeiten auf dem Handy.

---

<!-- GITHUB-ISSUES:START -->

## Überblick (erzeugt)

_Automatisch erzeugt aus GitHub (`vt-tom/dsa5-helpers`, Abruf 2026-11-16T10:00:41.540Z) und den Abschnitten oben. Nur zur Information, keine Beauftragung. Nicht von Hand bearbeiten._

| Abschnitt | Du | KI | Einträge |
|---|---|---|---|
| Bestehende Aufgaben im Detail | – | – | 5 |
| Ausdefinieren | 5 | – | 5 |
| Bereit zur Umsetzung | – | – | 0 |
| Umgesetzt – testen | 11 | – | 11 |
| Fertig für Release | – | – | 0 |
| Bugfixes 8.0.x | 18 | – | 18 |
| Später – Nächste Version | 2 | – | 2 |
| Später – Wartet auf Dritte | – | – | 2 |
| Später – Ideen | – | – | 6 |

**Offene Issues (24)**

| # | Titel | Meilenstein | Labels | In der Liste |
|---|---|---|---|---|
| [#52](https://github.com/vt-tom/dsa5-helpers/issues/52) | feat: Tooltips | 8.1.0 | – | Umgesetzt – testen |
| [#53](https://github.com/vt-tom/dsa5-helpers/issues/53) | feat: NSC Sheet im DSA Helpers Design | 8.1.0 | – | Nächster Einstieg, Umgesetzt – testen |
| [#54](https://github.com/vt-tom/dsa5-helpers/issues/54) | feat: Kreatur Sheet im DSA Helpers Design | 8.1.0 | – | Nächster Einstieg, Umgesetzt – testen |
| [#55](https://github.com/vt-tom/dsa5-helpers/issues/55) | feat: Gruppen Sheet im DSA Helpers Design | 8.1.0 | – | Nächster Einstieg, Ausdefinieren, Umgesetzt – testen |
| [#57](https://github.com/vt-tom/dsa5-helpers/issues/57) | feat: Geldbörse erweitern | – | – | Später – Ideen |
| [#60](https://github.com/vt-tom/dsa5-helpers/issues/60) | feat: Kampf-Aktionen – Schnellzugriff im Kampf ohne Heldenbogen | – | enhancement | Später – Ideen |
| [#61](https://github.com/vt-tom/dsa5-helpers/issues/61) | feat: Dunkles Thema für Mobil-Fenster | – | enhancement | Später – Ideen |
| [#69](https://github.com/vt-tom/dsa5-helpers/issues/69) | feat: Hausregel „Gebundene AP“ – AP verlorener Begleiter und Gegenstände bleiben zweckgebunden | – | enhancement | Später – Nächste Version |
| [#70](https://github.com/vt-tom/dsa5-helpers/issues/70) | feat: Hausregel „Sitzungs-Schips“ – mindestens ein Schip zu Sitzungsbeginn | – | enhancement | Später – Nächste Version |
| [#76](https://github.com/vt-tom/dsa5-helpers/issues/76) | feat: Tablet – Fensterknöpfe der Bögen größer | 8.1.0 | enhancement | Umgesetzt – testen |
| [#77](https://github.com/vt-tom/dsa5-helpers/issues/77) | feat: Händlerbogen im DSA Helpers Design | 8.1.0 | enhancement | Ausdefinieren |
| [#78](https://github.com/vt-tom/dsa5-helpers/issues/78) | feat: Schatzbogen im DSA Helpers Design | 8.1.0 | enhancement | Ausdefinieren |
| [#79](https://github.com/vt-tom/dsa5-helpers/issues/79) | Kampfkarte (Fehlermeldung) | 8.0.1 | – | Bugfixes 8.0.x |
| [#80](https://github.com/vt-tom/dsa5-helpers/issues/80) | Behältnisse (Optimierungwunsch) | 8.0.1 | – | Bugfixes 8.0.x |
| [#81](https://github.com/vt-tom/dsa5-helpers/issues/81) | Vor- & Nachteile (Optimierungswunsch) | 8.0.1 | – | Bugfixes 8.0.x |
| [#82](https://github.com/vt-tom/dsa5-helpers/issues/82) | Sprachen (Optimierungswunsch) | 8.0.1 | – | Bugfixes 8.0.x |
| [#84](https://github.com/vt-tom/dsa5-helpers/issues/84) | Magie (Optimierungswunsch) | 8.0.1 | – | Bugfixes 8.0.x |
| [#85](https://github.com/vt-tom/dsa5-helpers/issues/85) | Optik (Optimierungswunsch) | 8.0.1 | – | Bugfixes 8.0.x |
| [#86](https://github.com/vt-tom/dsa5-helpers/issues/86) | Kraftspeicher (Optimierungswunsch) | 8.0.1 | – | Bugfixes 8.0.x |
| [#89](https://github.com/vt-tom/dsa5-helpers/issues/89) | feat: Götterschips unterstützung | 8.0.1 | – | Ausdefinieren, Bugfixes 8.0.x · Achtung: Meilenstein 8.1.0 fehlt |
| [#90](https://github.com/vt-tom/dsa5-helpers/issues/90) | Automatische Parade - Verbesserung | 8.0.1 | – | Bugfixes 8.0.x |
| [#91](https://github.com/vt-tom/dsa5-helpers/issues/91) | Dramatis Personae Tab - Verbesserungen | 8.0.1 | – | Bugfixes 8.0.x |
| [#92](https://github.com/vt-tom/dsa5-helpers/issues/92) | Grundmanöver statt gleichwertiger Sonderfertigkeiten (Optimierungswunsch) | – | – | Bugfixes 8.0.x, Später – Ideen |
| [#93](https://github.com/vt-tom/dsa5-helpers/issues/93) | feat: Fahrzeugbogen im DSA Helpers Design | – | enhancement | Ausdefinieren, Später – Wartet auf Dritte · Achtung: Meilenstein 8.1.0 fehlt |

**Geschlossen, aber noch in der Liste**

| #                                                      | Titel                                                                            | Meilenstein | Labels      | In der Liste                                                |
| ------------------------------------------------------ | -------------------------------------------------------------------------------- | ----------- | ----------- | ----------------------------------------------------------- |
| [#66](https://github.com/vt-tom/dsa5-helpers/issues/66) | feat: Grundmanöver „Stören und Ablenken“ (Paladose)                          | 0.6.3       | enhancement | Später – Ideen · Achtung: geschlossen, steht noch hier   |
| [#68](https://github.com/vt-tom/dsa5-helpers/issues/68) | feat: Getrennte Versionslinien je Foundry-Generation (7.x v13, 8.x v14, 9.x v15) | –          | enhancement | Nächster Einstieg · Achtung: geschlossen, steht noch hier |
| [#87](https://github.com/vt-tom/dsa5-helpers/issues/87) | Bannerbild (Frage)                                                               | 8.0.1       | –          | Bugfixes 8.0.x · Achtung: geschlossen, steht noch hier     |

**Kürzlich geschlossen (14 Tage: 16)**

[#87](https://github.com/vt-tom/dsa5-helpers/issues/87) Bannerbild (Frage) (erledigt, 16.11.) · [#83](https://github.com/vt-tom/dsa5-helpers/issues/83) Hausregeln (Feedback) (erledigt, 16.11.) · [#88](https://github.com/vt-tom/dsa5-helpers/issues/88) NSC- und Kreaturenbögen (Optimierungswunsch) (geschlossen (nicht geplant), 16.11.) · [#75](https://github.com/vt-tom/dsa5-helpers/issues/75) Einstellung „Talent-Vorschläge auf dem Titelblatt“ gehört unter „Heldenbogen einrichten“ (erledigt, 12.11.) · [#74](https://github.com/vt-tom/dsa5-helpers/issues/74) bug: Tablet und Smartphone - Munitionsauswahl kann nicht verwendet werden, Auswahl nicht sichtbar. (erledigt, 12.11.) · [#73](https://github.com/vt-tom/dsa5-helpers/issues/73) bug: Kraftspeicher öffnet sich immer beim Mouseover (erledigt, 12.11.) · [#68](https://github.com/vt-tom/dsa5-helpers/issues/68) feat: Getrennte Versionslinien je Foundry-Generation (7.x v13, 8.x v14, 9.x v15) (erledigt, 12.11.) · [#72](https://github.com/vt-tom/dsa5-helpers/issues/72) fix: Gegenstände lassen sich nicht aus einem Behälter verschieben (erledigt, 02.11.) · … und 8 weitere

<!-- GITHUB-ISSUES:END -->
