# Aufgaben — 8.1.0 (v14) · Bugfixes 8.0.x

<!-- PROJECT-COORDINATION:START -->

Redaktioneller Kurzstand für die Projektübersicht. Bestehende Aufgaben, Entscheidungen und Bestätigungen gelten weiter.

## Nächster Einstieg

8.0.1 (v14) und 7.0.1 (v13) am 16.11.2026 veröffentlicht, `main` nachgezogen, Meilenstein 8.0.1 geschlossen. Planung 8.1.0 (nur v14) auf `release/8.1.0`: NSC-, Kreatur- und Gruppenbogen (#53, #54, #55). Bugfixes 8.0.x auf `release/8.0.2`.

## Bei dir offen

Du: Austausch zum Probendialog (#96); Hausregeln #69/#70 entscheiden; Video zu 8.1.0 planen. KI: Umsetzung der Einträge unter „Bereit zur Umsetzung“.

## Wartet auf

Rückmeldungen zum Bannerbild auf Tablet, Handy und The Forge.

Quellengrundlage: AUFGABEN.md: 1. Ausdefinieren, 3. Umgesetzt – testen, Später. PROJEKTDOKU.md: Ziel, Aktueller Stand.

## Bestehende Aufgaben im Detail

<!-- PROJECT-COORDINATION:END -->

Zwei Branches aus dem Tag `v8.0.0` (Nutzerentscheidung 12.11.2026): `release/8.1.0` für die neuen Bögen (nur Foundry v14), `release/8.0.1` für Fehlerkorrekturen; jeder Bugfix wird nach `release/8.1.0` übernommen, `v13` bekommt nur Bugfixes (7.0.x). Ablauf in [RELEASE.md](../docs/RELEASE.md). Zuletzt veröffentlicht: [8.0.0](https://github.com/vt-tom/dsa5-helpers/releases/tag/v8.0.0) und [7.0.0](https://github.com/vt-tom/dsa5-helpers/releases/tag/v7.0.0) am 12.11.2026. Stand: 18.11.2026

**Vorgehen je Bogentyp** (Desktop, Tablet, Smartphone; Nutzerentscheidung 12.11.2026): Click-Dummy bauen → deine Rückmeldung einarbeiten → erst wenn der Dummy passt, in Foundry umsetzen.

**So funktioniert die Liste** (gepflegt mit `/vttom-aufgaben-pflegen`, umgesetzt mit `/vttom-todo-abarbeiten`):

- Die aktuelle Version läuft durch vier Phasen: **1. Ausdefinieren → 2. Bereit zur Umsetzung → 3. Umgesetzt – testen → 4. Fertig für Release.** Alles andere steht unter **Später**. Neues einfach unter **Eingang** ganz oben eintragen.
- Gemeldete Fehler der veröffentlichten Version stehen unter **Bugfixes 8.0.x** und laufen dort durch dieselben Schritte.
- Jeder offene Eintrag beginnt mit **Du:** (du bist dran) oder **KI:** (KI ist dran). Höchstens zwei Zeilen; wie etwas umgesetzt wurde, steht im CHANGELOG oder Issue, nicht hier.
- Rückmeldung als eingerückter Unterpunkt unter dem Eintrag: `- passt` (Test bestanden → Phase 4) oder ein Kommentar. Nur du erklärst etwas für bestanden.
- Der Überblick ganz unten (Zähler je Phase, Issues, Unstimmigkeiten) wird beim Sitzungsstart erzeugt.

## 1. Ausdefinieren

- KI: **Geldbörse nachbessern** · #94 #57 — Basiswährungen optisch absetzen, Gewichtsanzeige in der zweiten Zeile korrigieren, prüfen ob das System
  zusätzliche Währungen entfernen kann (sonst eigene Lösung). Dann Vorschlag „Geldbörse“ als eigenes Fenster (Click-Dummy zuerst).

## 2. Bereit zur Umsetzung


## 3. Umgesetzt – testen

- [ ] Du: **Händler- und Schatzbogen** · #77 #78 · Desktop, Tablet, Handy — NSC/Kreatur/Held mit Helfer-Bogen auf Händler bzw. Schatz stellen → Bogen wechselt selbst auf „Händler/Schatz“ des Moduls, Reiter „Laden“/„Schatz“ mit Bestand/Einstellungen/Zugang; als Spieler (eingeschränkter Zugriff, SL online) → Ware links, Beutel rechts, Kaufen/Verkaufen/Nehmen/Hineinlegen, Kassenbuch; zurückstellen → alter Bogen.
  Live geprüft (Testinstanz, Spieler + SL online): Kaufen, Verkaufen, Nehmen, Hineinlegen, Tablet und Smartphone, langer Beutel scrollt jetzt im Fenster (war ein Fehler, behoben). Nicht geprüft: Präsentationsmodus; Held-Händler mit Spieler als Besitzer zeigt dem Besitzer die Kundenansicht (Systemverhalten, bitte beurteilen).
- [ ] Du: **Fahrzeugbogen** · #93 · Desktop, Tablet, Smartphone — Fahrzeug › Bogen wechseln › „DSA5 Helfer-Fahrzeugbogen“ → Titelblatt (Strukturpunkte/Besatzung ändern, Aktionen, An Bord), Seekampf: Bordwaffe würfeln, Aktionen wie „Reparieren“ im Seekampf (Kampf-Tracker, Heldenaktionen-Phase), Besatzung per Ziehen, Ladung; Spieler ohne Besitz sieht Bild und Name.
  Live geprüft (Testschiff mit 2 Bordwaffen, 2 Besatzungsmitgliedern; Desktop, Tablet, Smartphone, helles und dunkles Design); Aktionen antworten mit dem Hinweis des Systems „nur in der Heldenaktionen-Phase“, der Wurf selbst ist nicht geprüft. Beta-Feedback folgt.
- [ ] Du: **Dunkles Thema mobil** · #61 · Smartphone, Tablet — Konto-Knopf oben › Darstellung › „Dunkel“ → Panels (Chat, Journal, Akteure, Kampf), Dialoge, Item-Bögen, Journal-Seiten, Foundry-Einstellungen und Bogen sind dunkel und lesbar; „Hell“ → wieder wie bisher.
  Live geprüft (Smartphone, dunkel und hell): Chat, Journal, Akteure, Konto, Dialog, Item-Bogen, Einstellungen, Heldenbogen, Probendialog. Nicht geprüft: Kampf-Panel, Journal-Browser, Bildanzeige, Tablet quer, Fenster von Fremdmodulen.
- [ ] Du: **Audio mobil** · #98 · Smartphone, Tablet — Konto-Knopf oben → Abschnitt „Audio“: Regler Musik/Umgebung/Oberfläche ändern, „Stumm“ → „stumm“ statt Wert, „Laut“ → voriger Wert.
  Live auf Smartphone-Viewport geprüft (Werte in Foundry-Einstellungen); Ton selbst nicht gehört.
- [ ] Du: **Tooltips nachbessern** · #52 · Desktop — „Heldenbogen einrichten“ → „Tooltips beim Überfahren“ einschalten, Maus auf Talent, Kampftechnik, SF, Vor-/Nachteil → Beschreibung steht in der dunklen Karte (Talente und Kampftechniken: Text des Systems).
  Live geprüft: Talent, Kampftechnik (Hiebwaffen), SF (Finte), Vorteil. Nicht geprüft: Fremdmodule.
- [ ] Du: **Sprachen: MS und Titelblatt** · #95 #99 · Desktop — Held mit Sprache auf Stufe 4 → „MS“ statt „IV“ im Panel „Sprache und Schrift“; Titelblatt › Persönliche Daten → Zeilen „Sprachen“ (z. B. „Garethi MS, Tulamidya III“) und „Schriften“.
  Das System kennt keine eigene Muttersprachen-Kennzeichnung, MS gilt ab Stufe 4. Live mit Testheld auf Stufe 4 geprüft; echte Daten bitte bestätigen.
- [ ] Du: **Gruppenbogen mit dunklen Designs** · #101 · Desktop mit dunklem Foundry-Design — Gruppenbogen › Reise und Inventar, ebenso Fahrzeugbogen › Besatzung → Tabelle, Felder, Beschriftungen und Namen gut lesbar.
  Live geprüft: dunkles Foundry-Design und dunkles Modul-Design (Gruppenbogen Reise/Inventar/Talente, Fahrzeugbogen alle Reiter); NSC- und Kreaturbogen bleiben hell (Modul-Design hell). Nicht geprüft: dunkles Design bei NSC/Kreatur mit dunklem Modul-Thema.
- [ ] Du: **Hinweis Probendialog entfernt** · #96 · Desktop — als neuer Benutzer die erste Probe öffnen → kein Hinweis mehr.
  Ersatz kommt mit dem Einrichtungsassistenten (#97).
- [ ] Du: **Schicksal und Verdammnis im Gruppenbogen** · #55 · Desktop — Gruppenbogen mit „Götter Aventuriens 2“: links unter den Gruppen-Schips eine Zeile je Mitglied → Götter-Schips mit „+n“; Knopf öffnet als SL den Helfer, als Spieler die Anfrage.
  Nur statisch geprüft; Kacheln zeigen nur noch eigene Schips (Götter wandern aus den Kacheln in die Spalte).

## 4. Fertig für Release

Erst als **Beta** (Pre-release `v8.1.0`, Kanal `foundry-v14-beta`), nach Rückmeldung dasselbe Release zum normalen erklären; Korrekturen als
neue Pre-release `v8.1.1`. Nur v14 (kein 7.1.0), nur nach Auftrag; Ablauf in [RELEASE.md](../docs/RELEASE.md).

- **NSC-Bogen in Foundry** · #53
- **Gruppenbogen in Foundry** · #55
- **Hinweis Händler/Schatz im Helfer-Bogen** · #54
- **Rückweg aus Schatz** · #54
- **Tablet: Fensterknöpfe größer** · #76
- **Kreaturbogen** · #54
- **Kreaturbogen: Spielen/Bearbeiten** · #54
- **Standard-Bogen für Kreaturen** · #54
- **Journal-Browser mobil, Runde 2**
- **Click-Dummy: ein Menü, aufgeräumt**
- **Währungsanzeige unter Beute** · #94 — von dir für gut befunden, Nachbesserung siehe „Ausdefinieren“
- **DSA5 8.2.2: Tradition, Leiteigenschaft, Energiefaktor, Glückliche Talente** · #100 — von dir getestet (19.11.); muss auch nach `release/8.0.2`
- Du: **Video zu 8.1.0** — Inhalte aus CHANGELOG `[8.1.0]` plus alle 8.0.x-Abschnitte (ab 8.0.1); planen mit `/vttom-video-workflow`,
  sobald 8.1.0 steht. Szenen, Testdaten und Beispielhelden dabei festlegen.

## Bugfixes 8.0.x

[8.0.1](https://github.com/vt-tom/dsa5-helpers/releases/tag/v8.0.1) und [7.0.1](https://github.com/vt-tom/dsa5-helpers/releases/tag/v7.0.1)
am 16.11.2026 veröffentlicht, Issues und Meilenstein geschlossen, `main` nachgezogen. Hauptordner seit 16.11. auf `release/8.1.0`.
Nächste Fehlerkorrekturen auf `release/8.0.2` (eigener Branch, bei Bedarf eigener Arbeitsordner): Fix dort committen,
dann in `release/8.1.0` per `git merge --no-ff release/8.0.2` übernehmen.


## Später

### Nächste Version

- Du: **Hausregel „Gebundene AP“** · #69 — Antworten der Runde da (Spielzeit, Antrag + SL-Freigabe, alle Gegenstände). Entscheiden: an Gegenstände
  gebundene SF (z. B. Stabzauber) beim Freigeben automatisch entfernen oder von Hand? Danach KI: umsetzen.
- Du: **Hausregel „Sitzungs-Schips“** · #70 — Antworten da (Obergrenze gilt, Automatik erwünscht, alle vorausgewählt). Entscheiden: Sitzungsbeginn
  automatisch erkennen (≥ 8 h seit letztem Start) oder nur Frage beim SL-Login? Danach KI: umsetzen.
- Du: **Probendialog überarbeiten** · #96 — Konzeptbild im Issue (Symbolknöpfe statt Ausklappbereichen, Würfeln fest unten). Zuerst kritischer
  Austausch mit der KI (Sinn, Alternativen, Umfang); bis dahin kein Click-Dummy.

### Wartet auf Dritte

- **Bannerbild** · #87 — Rückmeldungen der Nutzer zu Tablet/Handy und The Forge (`forgevtt`); ein Fehler wird ein neues Issue.
- **Fahrzeugbogen, Feedback** · #93 — Rückmeldung aus der Beta und der Community: wofür Fahrzeuge am Tisch genutzt werden (Seekampf, Reise, Lager); danach Titelblatt anpassen.

### Ideen

- **Grundmanöver statt gleichwertiger SF** · #92 — Hinweis kommt mit 8.0.1, das Issue sammelt weitere Rückmeldungen und Ideen.
- **Kampf-Aktionen** · #60 — Schnellzugriff im Kampf ohne Bogen (Angriffe, waffenlos, Zauber, Liturgien, Gegenstände, Zug verschieben). Offen: Umfang, nur mobil oder auch Desktop.
- **Geldbörse erweitern** · #57 — weitere Währungen mit Umrechnen. Offen: Herkunft der Währungen (Rechte), Datenmodell.
- **Einrichtungsassistent** · #97 — beim ersten Aktivieren Funktionen wählen, auch den Hinweis zum Probendialog (#96, 8.1.0-Hinweis entfällt). Offen: nur SL oder auch Spieler, pro Welt oder Nutzer, Bezug zu `lastSeenVersion`.
- **Lager-Reiter, Vorschläge** · #55 — Rasten, Wetter, Wache, Kräutersuche; bewusst nicht gebaut, nur bei Bedarf der Runde.
- **Mobil, später** — „Neu“-Markierung im Journal, eigene Tablet-Bogenansicht, Steigern/Bearbeiten auf dem Handy.

---

<!-- GITHUB-ISSUES:START -->
## Überblick (erzeugt)

_Automatisch erzeugt aus GitHub (`vt-tom/dsa5-helpers`, Abruf 2026-11-19T05:40:55.662Z) und den Abschnitten oben. Nur zur Information, keine Beauftragung. Nicht von Hand bearbeiten._

| Abschnitt | Du | KI | Einträge |
|---|---|---|---|
| Bestehende Aufgaben im Detail | – | – | 5 |
| Ausdefinieren | – | – | 0 |
| Bereit zur Umsetzung | – | – | 0 |
| Umgesetzt – testen | 9 | – | 9 |
| Fertig für Release | 1 | – | 12 |
| Bugfixes 8.0.x | 1 | – | 1 |
| Später – Nächste Version | 3 | – | 3 |
| Später – Wartet auf Dritte | – | – | 2 |
| Später – Ideen | – | – | 6 |

**Offene Issues (25)**

| # | Titel | Meilenstein | Labels | In der Liste |
|---|---|---|---|---|
| [#52](https://github.com/vt-tom/dsa5-helpers/issues/52) | feat: Tooltips | 8.1.0 | – | Umgesetzt – testen |
| [#53](https://github.com/vt-tom/dsa5-helpers/issues/53) | feat: NSC Sheet im DSA Helpers Design | 8.1.0 | – | Nächster Einstieg, Fertig für Release |
| [#54](https://github.com/vt-tom/dsa5-helpers/issues/54) | feat: Kreatur Sheet im DSA Helpers Design | 8.1.0 | – | Nächster Einstieg, Fertig für Release |
| [#55](https://github.com/vt-tom/dsa5-helpers/issues/55) | feat: Gruppen Sheet im DSA Helpers Design | 8.1.0 | – | Nächster Einstieg, Umgesetzt – testen, Fertig für Release, Später – Ideen |
| [#57](https://github.com/vt-tom/dsa5-helpers/issues/57) | feat: Geldbörse erweitern | – | – | Später – Ideen |
| [#60](https://github.com/vt-tom/dsa5-helpers/issues/60) | feat: Kampf-Aktionen – Schnellzugriff im Kampf ohne Heldenbogen | – | enhancement | Später – Ideen |
| [#61](https://github.com/vt-tom/dsa5-helpers/issues/61) | feat: Dunkles Thema für Mobil-Fenster | 8.1.0 | enhancement | Umgesetzt – testen |
| [#69](https://github.com/vt-tom/dsa5-helpers/issues/69) | feat: Hausregel „Gebundene AP“ – AP verlorener Begleiter und Gegenstände bleiben zweckgebunden | – | enhancement | Bei dir offen, Später – Nächste Version |
| [#70](https://github.com/vt-tom/dsa5-helpers/issues/70) | feat: Hausregel „Sitzungs-Schips“ – mindestens ein Schip zu Sitzungsbeginn | – | enhancement | Später – Nächste Version |
| [#76](https://github.com/vt-tom/dsa5-helpers/issues/76) | feat: Tablet – Fensterknöpfe der Bögen größer | 8.1.0 | enhancement | Fertig für Release |
| [#77](https://github.com/vt-tom/dsa5-helpers/issues/77) | feat: Händlerbogen im DSA Helpers Design | 8.1.0 | enhancement | Umgesetzt – testen |
| [#78](https://github.com/vt-tom/dsa5-helpers/issues/78) | feat: Schatzbogen im DSA Helpers Design | 8.1.0 | enhancement | Umgesetzt – testen |
| [#87](https://github.com/vt-tom/dsa5-helpers/issues/87) | Bannerbild (Frage) | – | – | Später – Wartet auf Dritte |
| [#92](https://github.com/vt-tom/dsa5-helpers/issues/92) | Grundmanöver statt gleichwertiger Sonderfertigkeiten (Optimierungswunsch) | – | – | Später – Ideen |
| [#93](https://github.com/vt-tom/dsa5-helpers/issues/93) | feat: Fahrzeugbogen im DSA Helpers Design | 8.1.0 | enhancement | Umgesetzt – testen, Später – Wartet auf Dritte |
| [#94](https://github.com/vt-tom/dsa5-helpers/issues/94) | Währungsanzeuge unter Beute (Optimierungswunsch) | 8.0.2 | – | Fertig für Release · Achtung: Meilenstein 8.1.0 fehlt |
| [#95](https://github.com/vt-tom/dsa5-helpers/issues/95) | Sprachen: Beherrschungsgrad neben dem Favoriten-Stern anzeigen | 8.1.0 | – | Umgesetzt – testen |
| [#96](https://github.com/vt-tom/dsa5-helpers/issues/96) | Probendialog (Kampf): Modifikatoren auf einen Blick, Würfeln-Knopf ohne Scrollen | 8.2.0 | – | Bei dir offen, Umgesetzt – testen, Später – Nächste Version, Später – Ideen · Achtung: Meilenstein 8.1.0 fehlt |
| [#97](https://github.com/vt-tom/dsa5-helpers/issues/97) | Einrichtungsassistent beim ersten Aktivieren: Funktionen wählen | – | – | Umgesetzt – testen, Später – Ideen · Achtung: Meilenstein 8.1.0 fehlt |
| [#98](https://github.com/vt-tom/dsa5-helpers/issues/98) | feat: Smartphone/Tablet – Audio-Einstellungen verfügbar machen | 8.1.0 | – | Umgesetzt – testen |
| [#99](https://github.com/vt-tom/dsa5-helpers/issues/99) | Titelblatt: Sprachen und Schriften unter Persönliche Daten abbilden | 8.1.0 | enhancement | Umgesetzt – testen |
| [#100](https://github.com/vt-tom/dsa5-helpers/issues/100) | DSA5 8.2.2: Tradition, Leiteigenschaft, Energiefaktor und Glückliche Talente fehlen im Datenmodell | 8.0.2 | bug | Bugfixes 8.0.x |
| [#101](https://github.com/vt-tom/dsa5-helpers/issues/101) | Gruppenbogen: Darstellung mit dunklen Designs fehlerhaft (Reise-Tabelle) | 8.1.0 | bug | Umgesetzt – testen |
| [#102](https://github.com/vt-tom/dsa5-helpers/issues/102) | Charakterbogen: Ansicht mit Beschränkt-Rechten am Smartphone nicht sinnvoll | – | – | Achtung: fehlt in der Liste |
| [#103](https://github.com/vt-tom/dsa5-helpers/issues/103) | Journal Browser: Pfeiltasten zum Blättern auch bei eingeklappter Seitenleiste (Wunsch) | – | – | Achtung: fehlt in der Liste |

**Kürzlich geschlossen (14 Tage: 16)**

[#91](https://github.com/vt-tom/dsa5-helpers/issues/91) Dramatis Personae Tab - Verbesserungen (erledigt, 16.11.) · [#90](https://github.com/vt-tom/dsa5-helpers/issues/90) Automatische Parade - Verbesserung (erledigt, 16.11.) · [#89](https://github.com/vt-tom/dsa5-helpers/issues/89) feat: Götterschips unterstützung (erledigt, 16.11.) · [#86](https://github.com/vt-tom/dsa5-helpers/issues/86) Kraftspeicher (Optimierungswunsch) (erledigt, 16.11.) · [#85](https://github.com/vt-tom/dsa5-helpers/issues/85) Optik (Optimierungswunsch) (erledigt, 16.11.) · [#84](https://github.com/vt-tom/dsa5-helpers/issues/84) Magie (Optimierungswunsch) (erledigt, 16.11.) · [#82](https://github.com/vt-tom/dsa5-helpers/issues/82) Sprachen (Optimierungswunsch) (erledigt, 16.11.) · [#81](https://github.com/vt-tom/dsa5-helpers/issues/81) Vor- & Nachteile (Optimierungswunsch) (erledigt, 16.11.) · … und 8 weitere
<!-- GITHUB-ISSUES:END -->
