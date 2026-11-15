# Aufgaben — 8.1.0 (v14) · Bugfixes 8.0.x

<!-- PROJECT-COORDINATION:START -->

Redaktioneller Kurzstand für die Projektübersicht. Bestehende Aufgaben, Entscheidungen und Bestätigungen gelten weiter.

## Nächster Einstieg

8.0.0 (v14) und 7.0.0 (v13) am 12.11.2026 veröffentlicht, `main` nachgezogen, #68/#73/#74/#75 geschlossen. Planung 8.1.0 (nur v14) auf `release/8.1.0`: NSC-, Kreatur- und Gruppenbogen (#53, #54, #55). Bugfixes 8.0.x auf `release/8.0.1`.

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

## Eingang

Rückmeldungen der Runde von illowt (13.11.2026) und eigene Issues, geplant und geschätzt am 15.11.2026 (Aufwand klein = wenige Stunden,
mittel = etwa ein Tag, groß = mehrere Tage). Je Eintrag Version wählen (8.0.1, 8.1.0 oder Später) und offene Frage beantworten.

- Du: **Götterschips im Kopf** · #89 · klein · 8.0.1 — System liefert Zusatz-Schips (`prepare.extraSchips`, Aktion `extraSchipUpdate`, z. B. aus
  „Götter Aventuriens 2“), unser Kopf zeigt sie nicht; neben die Schips setzen (Desktop, mobil, NSC). Live-Test braucht Kopie des Moduls: ok?
- Du: **Eigenschaften im Kopf einheitlich** · #85 · klein · 8.0.1 — Eigenschaften-Reiter zeigt große Kacheln, übrige Reiter die Mini-Würfel im
  Kopf. Welche Darstellung überall? Vorschlag: Mini-Würfel auch dort, Kacheln nur im Bearbeiten-/Steigern-Modus; vorher im Click-Dummy.
- Du: **Favoriten für Vor-/Nachteile** · #81 · klein · 8.0.1 — Stern an jedem Vor-/Nachteil (Eigenschaften-Reiter), auf dem Titelblatt eigene
  Gruppe „Vor- und Nachteile“; Klick öffnet das Item. Nur Freigabe nötig.
- Du: **Sprachen und Schriften auf dem Titelblatt** · #82 · klein · 8.0.1 — Vorschlag: als Favoriten markierbar (Stern wie #81, eigene Gruppe
  mit Stufe), dann entscheidet jeder selbst; feste Randleisten-Anzeige wäre zusätzlich mittel. A Favoriten, B Randleiste, C beides?
- Du: **Zauber-Erweiterungen aufklappen** · #84 · mittel · 8.1.0 — +/− an Zaubern/Liturgien mit gelernten Erweiterungen, darunter Name und
  Kurzwirkung der Erweiterungs-Items des Helden; Klick öffnet sie. Erst Click-Dummy (Desktop, Tablet, Handy), dann Foundry.
- Du: **Dramatis Personae verbessern** · #91 · mittel · 8.1.0 — Daten (Fraktion, wichtig, verborgen) liegen schon vor: Suchfeld, Gruppierung nach
  Fraktion, Filter „wichtig“/„für Spieler verborgen“ (SL), Umschalter Kacheln/Liste. Umfang wählen, dann Click-Dummy mit Varianten.
- Du: **Automatische Parade: unmögliche Paraden** · #90 · mittel bis groß · 8.1.0 — Regeln statt Rückgängig (illowt). Erst prüfen, welche
  Einschränkungen das System selbst kennt (Größe, Waffenlos gegen Waffe, nicht parierbare Angriffe); welche Fälle sollen rein? Liste von dir.
- Du: **Hausregel „Grundmanöver statt gleichwertiger SF“** · #92 · Text klein, Voraussetzung automatisch groß · 8.1.0 — Text als zuschaltbare
  Ergänzung im Hausregelbuch (ohne Werte aus dem Regelwerk); Voraussetzungsprüfung beim SF-Kauf erst klären, ob das System dafür einen Weg hat.
- Du: **Hausregeln-Feedback beantworten** · #83 · nur Antwort — passive Verteidigung ist schon je Held wählbar (Spieler würfeln ohne Wahl
  selbst), Wundeinschätzung ist abschaltbar; so im Issue antworten und schließen?
- Du: **Bannerbild-Format beantworten** · #87 · nur Antwort — Banner am Desktop etwa 710×92 px (≈ 8:1), Smartphone ≈ 6:1, mittig beschnitten;
  Empfehlung 1600×200 px, Wichtiges in die Mitte. So antworten, ggf. als Hinweis beim Hochladen?
- Du: **NSC- und Kreaturenbögen** · #88 · nur Verwaltung — Dublette zu #53/#54 (in 8.1.0); als Dublette schließen?

## 1. Ausdefinieren

- Du: **Gruppenbogen: Platz für Schicksal und Verdammnis** · #55 — Click-Dummy `?actor=gruppe`, Menü › Diese Seite: A linke Spalte,
  B in den Kacheln (Vorschlag: im System schon angelegt), C eigenes Panel. Variante wählen; erst danach Foundry.
- Du: **Reiter „Lager“ im Gruppenbogen** · #55 — in Foundry vorerst nur Helfer der Inhaltsmodule plus Würfelstatistik/Hausregelbuch;
  Vorschläge (Rasten, Wetter, Wache, Kräutersuche) noch nicht gebaut. Auswahl prüfen, Rückmeldung der Runde einholen.

- Du: **Händler- und Schatzbogen** · #77 #78 — Click-Dummy `?actor=haendler` bzw. `?actor=schatz`, Desktop: SL-Reiter „Laden“, Rolle Spieler →
  Kundensicht; Menü › Diese Seite: A Kacheln, B Liste, C Ware und Beutel. Variante wählen, Rückmeldung; danach Tablet/Smartphone, dann Foundry.

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

## Bugfixes 8.0.x

Branch `release/8.0.1` im selben Ordner (kein zweiter Arbeitsbaum, Nutzerwunsch 15.11.2026): Fix dort committen, dann in
`release/8.1.0` per `git merge --no-ff release/8.0.1` übernehmen. Stand 15.11.: #79, #80, #86 auf 8.0.1, nach 8.1.0 gemergt.

- [ ] Du: **Waffenwechsel bei „Handbeschränkung ignorieren“** · #79 — Grombrak (Haken in seinem Kampf-Reiter des Systembogens), Kampf › Körper:
  Haupthand auf Eisenwalder → Eisenwalder in der Hand, Lindwurmschläger unter „Ebenfalls angelegt“; ebenso per Rechtsklick aufs Schild.
- [ ] Du: **Behältnis öffnet mit Inhalt** · #80 — Ausrüstung › Behältnisse, Klick auf Lederrucksack → Fenster öffnet auf Reiter „Behältnis“.
- [ ] Du: **Behältnis: Namen sichtbar** · #80 (Variante A) — Behälterfenster auf Reiter „Behältnis“ → unter jedem Feld steht der
  Name, lange Namen auf zwei Zeilen gekürzt; Ziehen und Rechtsklick (herausnehmen) gehen weiter.
- [ ] Du: **Hinweis gestapelter Kraftspeicher** · #86 — Kraftspeicher-Gegenstand auf Anzahl 3 stellen, KS-Kugel anklicken (Desktop und
  Smartphone) → Hinweis „… (Anzahl 3) zählt als ein einziger Speicher …“; bei Anzahl 1 kein Hinweis. Erklärung steht im Issue.

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
- **Geldbörse erweitern** · #57 — weitere Währungen mit Umrechnen. Offen: Herkunft der Währungen (Rechte), Datenmodell.
- **v13: Helfen und Grundmanöver** · #66 — machbar über nachgebildeten Modifikator-Hook (Hülle um `DiceDSA5.setupDialog`, braucht deine Freigabe); Grundmanöver aufwendig,
  weil DSA7 je Modifikator nur einen Wert kennt. v13 bekommt seit 12.11.2026 nur noch Bugfixes; nur bei ausdrücklichem Bedarf.
- **Mobil, später** — „Neu“-Markierung im Journal, eigene Tablet-Bogenansicht, Steigern/Bearbeiten auf dem Handy.

---

<!-- GITHUB-ISSUES:START -->
## Überblick (erzeugt)

_Automatisch erzeugt aus GitHub (`vt-tom/dsa5-helpers`, Abruf 2026-11-15T10:07:16.997Z) und den Abschnitten oben. Nur zur Information, keine Beauftragung. Nicht von Hand bearbeiten._

| Abschnitt | Du | KI | Einträge |
|---|---|---|---|
| Bestehende Aufgaben im Detail | – | – | 5 |
| Eingang | 11 | – | 11 |
| Ausdefinieren | 3 | – | 3 |
| Bereit zur Umsetzung | – | – | 0 |
| Umgesetzt – testen | 11 | – | 11 |
| Fertig für Release | – | – | 0 |
| Bugfixes 8.0.x | 5 | – | 5 |
| Später – Nächste Version | 2 | – | 2 |
| Später – Wartet auf Dritte | – | – | 1 |
| Später – Ideen | – | – | 5 |

**Offene Issues (26)**

| # | Titel | Meilenstein | Labels | In der Liste |
|---|---|---|---|---|
| [#52](https://github.com/vt-tom/dsa5-helpers/issues/52) | feat: Tooltips | – | – | Umgesetzt – testen · Achtung: Meilenstein 8.1.0 fehlt |
| [#53](https://github.com/vt-tom/dsa5-helpers/issues/53) | feat: NSC Sheet im DSA Helpers Design | 8.1.0 | – | Nächster Einstieg, Eingang, Umgesetzt – testen |
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
| [#79](https://github.com/vt-tom/dsa5-helpers/issues/79) | Kampfkarte (Fehlermeldung) | – | – | Bugfixes 8.0.x |
| [#80](https://github.com/vt-tom/dsa5-helpers/issues/80) | Behältnisse (Optimierungwunsch) | – | – | Bugfixes 8.0.x |
| [#81](https://github.com/vt-tom/dsa5-helpers/issues/81) | Vor- & Nachteile (Optimierungswunsch) | – | – | Eingang |
| [#82](https://github.com/vt-tom/dsa5-helpers/issues/82) | Sprachen (Optimierungswunsch) | – | – | Eingang |
| [#83](https://github.com/vt-tom/dsa5-helpers/issues/83) | Hausregeln (Feedback) | – | – | Eingang |
| [#84](https://github.com/vt-tom/dsa5-helpers/issues/84) | Magie (Optimierungswunsch) | – | – | Eingang |
| [#85](https://github.com/vt-tom/dsa5-helpers/issues/85) | Optik (Optimierungswunsch) | – | – | Eingang |
| [#86](https://github.com/vt-tom/dsa5-helpers/issues/86) | Kraftspeicher (Optimierungswunsch) | – | – | Bugfixes 8.0.x |
| [#87](https://github.com/vt-tom/dsa5-helpers/issues/87) | Bannerbild (Frage) | – | – | Eingang |
| [#88](https://github.com/vt-tom/dsa5-helpers/issues/88) | NSC- und Kreaturenbögen (Optimierungswunsch) | – | – | Eingang |
| [#89](https://github.com/vt-tom/dsa5-helpers/issues/89) | feat: Götterschips unterstützung | – | – | Eingang |
| [#90](https://github.com/vt-tom/dsa5-helpers/issues/90) | Automatische Parade - Verbesserung | – | – | Eingang |
| [#91](https://github.com/vt-tom/dsa5-helpers/issues/91) | Dramatis Personae Tab - Verbesserungen | – | – | Eingang |
| [#92](https://github.com/vt-tom/dsa5-helpers/issues/92) | Grundmanöver statt gleichwertiger Sonderfertigkeiten (Optimierungswunsch) | – | – | Eingang |

**Geschlossen, aber noch in der Liste**

| # | Titel | Meilenstein | Labels | In der Liste |
|---|---|---|---|---|
| [#66](https://github.com/vt-tom/dsa5-helpers/issues/66) | feat: Grundmanöver „Stören und Ablenken“ (Paladose) | 0.6.3 | enhancement | Später – Ideen · Achtung: geschlossen, steht noch hier |
| [#68](https://github.com/vt-tom/dsa5-helpers/issues/68) | feat: Getrennte Versionslinien je Foundry-Generation (7.x v13, 8.x v14, 9.x v15) | – | enhancement | Nächster Einstieg · Achtung: geschlossen, steht noch hier |

**Kürzlich geschlossen (14 Tage: 13)**

[#75](https://github.com/vt-tom/dsa5-helpers/issues/75) Einstellung „Talent-Vorschläge auf dem Titelblatt“ gehört unter „Heldenbogen einrichten“ (erledigt, 12.11.) · [#74](https://github.com/vt-tom/dsa5-helpers/issues/74) bug: Tablet und Smartphone - Munitionsauswahl kann nicht verwendet werden, Auswahl nicht sichtbar. (erledigt, 12.11.) · [#73](https://github.com/vt-tom/dsa5-helpers/issues/73) bug: Kraftspeicher öffnet sich immer beim Mouseover (erledigt, 12.11.) · [#68](https://github.com/vt-tom/dsa5-helpers/issues/68) feat: Getrennte Versionslinien je Foundry-Generation (7.x v13, 8.x v14, 9.x v15) (erledigt, 12.11.) · [#72](https://github.com/vt-tom/dsa5-helpers/issues/72) fix: Gegenstände lassen sich nicht aus einem Behälter verschieben (erledigt, 02.11.) · [#71](https://github.com/vt-tom/dsa5-helpers/issues/71) feat: Eigenschaftsleiste – Kürzel MU, KL, IN … an den Würfeln anzeigen (erledigt, 02.11.) · [#63](https://github.com/vt-tom/dsa5-helpers/issues/63) feat: Neue Probendialoge auch am Desktop (erledigt, 02.11.) · [#67](https://github.com/vt-tom/dsa5-helpers/issues/67) feat: Mobil – Almanach-Eintrag (Person/Auftrag) als Blatt öffnen (erledigt, 02.11.) · … und 5 weitere
<!-- GITHUB-ISSUES:END -->
