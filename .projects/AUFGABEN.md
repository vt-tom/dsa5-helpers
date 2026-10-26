# AUFGABEN.md — Was noch zu tun ist

Eine Liste für alles Offene: neue Notizen, Fehler, Feature-Ideen, offene Entscheidungen.
Neues einfach oben unter **Neu** eintragen. Nur der Nutzer erklärt manuelle Aufgaben für erledigt. Bis zur Bestätigung bleiben sie erhalten, gegebenenfalls als „umgesetzt – Nutzerbestätigung offen“.

---


Übertragung/Arbeitsordner 21.10.2026: erste Übertragung und SHA-256-Prüfung bestanden; abschließender Vergleich ohne Abweichungen. Sicherungspfad siehe Projektdokumentation. Git vollständig erhalten. Keine Commits oder GitHub-Schreibaktionen.

## Neu (noch nicht bearbeitet)

- **Arbeitsordner/Kopierworkflow (21.10.2026):** Entwicklung nach `D:\Development\dsa5-helpers` verlagert. Git und lokale Dateien erhalten; Kopierskript mit Sicherung und SHA-256-Prüfung. 74 Tests aus Development bestanden; Klickdummy lokal per HTTP geprüft. Keine Bogenänderung, keine Live-Abnahme.

## Laufende Beta 0.6.2 / stabile Zielversionen 7.0.0 und 8.0.0

**Beta-Korrektur (26.10.2026):** Die laufende Entwicklung bleibt vorerst im 0.6.x-Betaschema (nächste Beta 0.6.2). Erst die stabilen Ausgaben beginnen mit **7.0.0 für v13** und **8.0.0 für v14**. Die zuvor vorgeschlagenen 7.6.2/8.6.2 entfallen. Ein späteres generationseigenes Beta-Nummernschema ist noch nicht festgelegt; keine Beta-Suffixe oder neuen Beta-Nummern ohne gesonderte Entscheidung einführen.

**Aktuelle Nutzerentscheidung (ersetzt den bisherigen Plan eines gemeinsamen Installationspakets):** getrennte Versionslinien und Installations-/Update-Links. `7.X.X` für Foundry v13, `8.X.X` für v14, `9.X.X` für v15 usw. Stabiler Start mit **7.0.0** (v13, Desktop, vorhandene DSA7-Funktionen) und **8.0.0** (v14 einschließlich Mobil). Gemeinsame Codepflege bleibt möglich, Modul-ID `dsa5-helpers` erhalten. Der Nutzer bietet generationseigene Links auf seiner Webseite an.

**Neue Release-Aufgabe:** generationseigene Manifeste/ZIPs und stabile/Beta-Kanäle bauen; Updatepfade strikt trennen und bestehende 0.x-Installationen auf die v14-Linie überführen. Foundry-Kompatibilität je Ausgabe begrenzen, Installation und Folgeupdates getrennt prüfen. Branch, Manifest, README, CHANGELOG und Workflow bei der technischen Umstellung nachziehen. Aktueller Branch/Manifest/CHANGELOG heißen noch release/0.6.2 / 0.6.1 / 0.6.2; diese Planänderung veröffentlicht oder nummeriert noch nichts um. Der nachstehende bisherige Umsetzungsplan ist hinsichtlich „gemeinsames Paket“ überholt; technische Anpassungen siehe RELEASE.md.

Arbeitsstand: #50 und #47 sind für die kommende v14-Ausgabe im Modul und Click-Dummy umgesetzt; #51 (separate v13-Desktop-Ausgabe) bleibt offen. Arbeit noch auf `release/0.6.2`, CHANGELOG-Abschnitt „0.6.2 — unveröffentlicht“ vorhanden. Manifestversion/Mindestversionen bisher unverändert. GitHub: #47/#50/#51 auf Nutzerauftrag dem Meilenstein 0.6.2 zugeordnet und @vt-tom zugewiesen; keine Veröffentlichung erfolgt.

### Umgesetzt: #50 Kraftspeicher / #47 Lebensenergiezonen

| Issue | Aktueller Stand |
|---|---|
| **#50 Kraftspeicher** | Design A „Schwebend“ gewählt: kleine Summenkugel an AsP, radiale Einzelkugeln ohne Hintergrundfläche, Mitte bleibt am Ursprung, fünf Speicher pro Seite. Hover/Klick/Pfeil-ab sowie Escape/Fokusrückkehr; Darstellung auf Titelblatt und anderen Reitern. Systemdaten/-dialog mit Korrektur für gleiche Effekt-IDs auf verschiedenen Items. |
| **#47 Lebensenergiezonen** | Design mit LeP-Balken gewählt: gleich hohe Zonenkacheln, fester Platz für Malus/Ausfall, getrennte Rüstungs-/Energieaktion; Smartphone mit Zonenliste. Anzeige und Bearbeiten über Rüstkammer II, einschließlich dessen Anzeigefallback bei noch nicht initialisierten Actor-Zonenwerten. |

Designvergleiche und zugehörige neue Test-/Variantenschalter sind entfernt. Umsetzung und technische Korrekturen stehen in [PROJEKTDOKU.md](PROJEKTDOKU.md#implementierung-5047-auf-release062-26102026), nutzersichtbare Änderungen im CHANGELOG. Zuletzt dokumentierter statischer Prüfstand: **78 Tests bestanden**; keine neue Testausführung bei dieser Dokumentbereinigung. Die Umsetzung ist keine vollständige Foundry-Live-Abnahme.

### Noch offen in der Beta und vor 7.0.0 / 8.0.0

- **#51 – Nutzerprüfung offen:** v13-Desktop-Anpassung und lokale getrennte Testausgabe umgesetzt. Jetzt in Foundry 13.351 / DSA5 7.5.1 testen: Öffnen/Speichern, alle Reiter, Proben/AP, Ausrüstung/Munition, Reittier, magische Artefakte, Wundeinschätzung, Statistik, Besitzer/Beobachter und optionale Fremdmodule. Kein v13-Mobil-Backport.
- **#50 live rückprüfen:** Öffnen und Speichern des Systemdialogs nach der letzten Importkorrektur; getrennte Werte bei mehreren/duplizierten Speichern; Summen nach Speichern, Verbrauch sowie Ein-/Ausrüsten; ohne Speicher keine Anzeige; Besitzer-/Beobachterrechte. Lange Namen und Seitenwahl mit mehr als fünf Speichern prüfen.
- **#47 live rückprüfen:** Zonenwerte gleich Systemdialog (auch noch nicht initialisierte Werte), Änderung über Zonendialog, Schaden/Heilung/Ausfall aktualisieren den Bogen; ohne aktive Regel/Modul keine Anzeige; Rüstungsaktion bleibt getrennt. Keine eigene Regelberechnung oder zusätzliche Formularspeicherung.
- **Regression:** v14-Desktop sowie Smartphone/Tablet mit echten Systemdaten und beiden Themen; v13 nach #51 separat als SL/Spieler/Beobachter abnehmen. Bekannte fehlende Waffen-/Rüstungsbilder im lokalen Click-Dummy-Server bleiben offen.
- **Release vorbereiten:** unterstützte Kombinationen prüfen, Manifest/Dokumentation nachziehen; GitHub-Meilenstein-Zuordnung bei entsprechendem Auftrag. Veröffentlichung/Commits/Push/Merge erst nach Auftrag bzw. Freigabe. Issues #50/#47 bleiben bis zur Auslieferung offen.
- **Grundmanöver:** „Stören und Ablenken“ wartet auf den Regeltext von Paladose. Rückfrage: Geister/Elementare würfeln laut Text Tierkunde (nur Dämonen Sphärenkunde) – so umgesetzt.
- **Mobil-Kanal einstellen:** Job `mobile` in `release.yml` entfernen? Die Pre-releases „Mobil-Kanal (Test)“ und „v0.6.0 (Mobil-Test)“ sind überholt.

0.6.0 und 0.6.1 sind Betas. Zum stabilen Release wird später die letzte freigegebene 0.6.x-Beta; Merge nach `main` erst nach Nutzerfreigabe. Issues und Meilenstein werden erst bei Auslieferung geschlossen, auch bei Betas.

### #51: bereit zur Foundry-Prüfung (26.10.2026)

Desktop-Portierung und generationseigene lokale Testpakete sind umgesetzt. Nutzer übernimmt die echte Foundry-Abnahme. V13 verwendet DSA7-Systemaktionen/Schema/Teilvorlagen; fehlende DSA8-Funktionen sind ausgeblendet. Zusätzlich sind Helfen/Grundmanöver unter v13 nicht verfügbar: DSA7 besitzt weder den benötigten Modifikatoren-Hook noch das zugehörige Widget. Bestehende aktivierte Weltflags bleiben gespeichert, wirken dort aber nicht. Wundeinschätzung und Statistik bleiben verfügbar. Optionaler Planer wird nur mit passender API eingebunden.

**Prüfstand:** dieselbe statische Suite mit den installierten v13- und v14-Quellen ausgeführt: **v13 81 bestanden / 2 übersprungen** (fehlendes Gefährtensystem und fehlender Premium-Energiezonenhelfer), **v14 83 bestanden**, keine Fehler. Dazu zwei Paket-Rückprüfungen bestanden. Fixtures ersetzen weiterhin keine echte Actor-/Dialoginteraktion. Dummy `?foundry=13`: reduzierte Reiter, Reittier im Kampf, keine neuen Speicher-/Energiezonen, Hausregelbuch nur mit Wundeinschätzung; 770×740. Bekannte fehlende Vorschaubilder unverändert.

`python tools/package-module.py --foundry 13` erzeugt ein geprüftes **Beta-0.6.2-ZIP und einen fertigen Modulordner** unter `.deploy/packages/`; `--foundry 14` erzeugt die andere Ausgabe. V13-Manifest begrenzt Foundry auf 13.351…13 und DSA5 auf 7.5.1, enthält keine Mobil-CSS und erklärt noch keinen Build als live verifiziert. Quellmanifest/Version/Mindestversion der bestehenden v14-Laufzeitkopie unverändert. Installation manuell aus dem erzeugten Ordner, keine Änderung einer Nutzerinstanz durch den Agenten. Öffentliche Installations-/Update-Links und GitHub-Release-Automation bleiben Release-Arbeit; nichts veröffentlicht. Commit/Push auf release/0.6.2 am Ende vom Nutzer ausdrücklich beauftragt, kein Merge nach main.

## Umsetzungsplan v13-Support (#51, 26.10.2026)

Status: Quellcodeprüfung am 26.10.2026 durchgeführt, Ergebnis und Kompatibilitätsmatrix in [PROJEKTDOKU.md](PROJEKTDOKU.md#prüfung-v13v14-kompatibilität-issue-51-26102026). Nutzerentscheidung: **0.6.2, gemeinsame Codebasis mit getrennten Installationspaketen für v13/v14; v13 nur Desktop und nur vorhandene DSA7-Systemfunktionen, kein Mobil-Backport.** Zielkombinationen: Foundry 13.351 + DSA5 7.5.1 sowie Foundry v14 + DSA5 ab 8.1.5; weitere v13-Builds sind nicht geprüft. Desktop-Umsetzung/Testpaket siehe oben; Nutzer-Live-Abnahme offen. Bestehende manuelle Aufgaben bleiben erhalten.

1. **Analyse und Umfang geklärt.** Quellstände 7.5.1, 8.1.5 und 8.1.11 sowie Foundry 13.351/14.369 verglichen. V13 ohne neues Gefährtensystem, Questlog, Zeremonialgegenstandsverwaltung und Modul-Mobiloberfläche. Vorhandene DSA7-Funktionen (u. a. Reittiere, magische Artefakte, Personen) erhalten. Die Analyse ist eine statische Prüfung, keine Live-Abnahme und keine Erledigtbestätigung dieser manuellen Aufgabe.
2. **Gemeinsamen Einstieg ermöglichen (ca. 0,5–1 Tag).** Kleine zentrale Kompatibilitätsschicht für Systemzugriff, passende API-Aufrufe und Vorlagenauswahl vorsehen; Versionsunterschiede dort bündeln. Export/Ladezeitpunkt der Basisklasse prüfen, gegebenenfalls Klassenerzeugung erst nach Verfügbarkeit der Systemklasse. Weiter von der echten Charakterbogenklasse erben, keine kopierte Regellogik. Fehlende optionale APIs dürfen den Modulstart nicht verhindern. Abnahme: init/ready und erstes Öffnen des Bogens funktionieren auf beiden Kombinationen ohne Fehler.
3. **Heldenbogen und Aktionen portieren (ca. 1–2 Tage).** Würfelaktionen an die ältere `ownerActions`-Verarbeitung anbinden und deren Rechteverhalten erhalten. Alle Reiter, Spielen/Steigern/Bearbeiten, AP-Steigerung, Zustände, Inventar, Drag-and-drop, Waffenhand, Nachladen, Munitionswahl, Zauber/Liturgien und Traditionsgegenstände mit den jeweiligen Systemwegen abgleichen. Neuen Gefährten-Reiter unter v13 ausblenden, vorhandene Reittierfunktionen erhalten. Bereits freigegebene Einschränkungen umsetzen; neue eigene Methoden oder weitergehende Projektentscheidungen weiterhin vorher abstimmen. UI-Änderungen im Click-Dummy nachziehen, Cache-Version bei CSS/JS-Änderungen erhöhen.
4. **Zusatzfunktionen prüfen und anpassen (ca. 1–2 Tage).** Hausregeln einschließlich Standardbogen-Einstiegen, Würfelstatistik, HUD, Bannerupload/Socket, Charakterbauer-Rückweg, Almanach und optionalen Steigerungsplaner prüfen. Fehlende Systemfunktionen anhand tatsächlicher Fähigkeiten erkennen. V13-Einschränkungen anhand der freigegebenen Systemgrenzen verständlich dokumentieren. Mobil unter v13 vollständig deaktivieren; keine eigene v13-Chateingabe bauen. Die bestehende v14-Mobiloberfläche als Regression prüfen.
5. **Tests und Live-Abnahme für beide Generationen (ca. 1–3 Tage, teilweise begleitend).** Bestehenden statischen Test-Harness über seine Umgebungsvariablen gegen beide Installationen ausführen und sinnvoll um abweichende Schnittstellen/fehlende Templates ergänzen; keine identischen Datenmodelle oder Rechteflags durch Stubs vortäuschen. Live-Matrix: SL, besitzender Spieler, Beobachter/eingeschränkte Sicht; Öffnen, Speichern und erneutes Öffnen; Proben/Schaden, AP, Ausrüstung/Munition, Zustände, Gefährten, optionale Funktionen. v14 als Regression vollständig berücksichtigen. Tablet/Smartphone ausschließlich unter v14 als Regression abnehmen; unter v13 sicherstellen, dass unsere Mobiloberfläche nicht aktiviert wird. Nutzerinstanzen und Welten bleiben unberührt. Die bisherige Ausnahme für eigene temporäre Instanzen gilt ausdrücklich für Mobil-Tests; für einen eigenen v13-Desktop-Testbetrieb vorab eine zulässige Testumgebung mit dem Nutzer festlegen. Keine vorhandene Welt auf eine andere Generation migrieren.
6. **Manifest und Auslieferung vorbereiten (ca. 0,5 Tag).** Erst nach erfolgreicher Prüfung Foundry-Minimum und DSA5-Minimum absenken; unterstützte Kombinationen zusätzlich zur Versionsspanne prüfen, da das Manifest die Zuordnung v13/7.5.1 gegenüber v14/8.1.x nicht präzise ausdrückt. Getrennte lokale Pakete stehen bereit; öffentliche generationsspezifische Kanäle und Workflow vor Veröffentlichung umstellen. README, kommenden unveröffentlichten CHANGELOG-Abschnitt und PROJEKTDOKU aktualisieren, Release-Anleitung bei Ablaufänderungen mitpflegen. Release/Commit/Push/GitHub-Schreibaktionen erst mit entsprechendem Auftrag; Issue-Abschluss erst nach Auslieferung.

**Abschlusskriterium nach neuer Versionsstrategie:** Beide generationsspezifischen Pakete laufen in ihrer freigegebenen Kombination und bleiben bei Updates in ihrer Linie; alle zugesagten Funktionen und Rechtefälle sind live geprüft, Einschränkungen abgestimmt und dokumentiert, v14 ohne bekannte neue Regressionen. Eine Manifeständerung oder grüne statische Tests allein sind keine Abnahme.

**Aufwand nach Analyse:** Als vorläufiger Planungsrahmen ca. 4–7 Arbeitstage für den freigegebenen Desktop-Umfang einschließlich Integrationsprüfung. Der zuvor geschätzte Mobil-Backport (Gesamtrahmen 8–15 Tage) entfällt. Die früheren 5–10 Tage waren vor der detaillierten Analyse geschätzt. Kein Angebot für einen Rückbau sämtlicher DSA8-Funktionen nach DSA7; ein solcher Backport liegt außerhalb des Ansatzes „Erben statt neu bauen“. Nach den ersten Desktop-Klicktests neu schätzen. Vor Veröffentlichung müssen beide Generationen separat abgenommen werden, auch bei gemeinsam gepflegtem Code.

## Live prüfen (Betas 0.6.0 / 0.6.1)

- **Mobile Support** (#43): Prüfliste für echte Geräte steht im Issue; Test über die Beta-Manifest-URL. Kopf auf dem Smartphone (#42): Tippflächen, Einklappen beim Scrollen, Bannerbild-Zuschnitt; Tablet hoch/quer.
- **#48** als Spieler: Mitteilen-Knopf nur für den eigenen Helden, Zustands-Knöpfe nur mit Besitz am Ziel; Verbündete über die Token-Gesinnung (gleich wie der Erkennende). Englischer Name von Vorstoß (SF) unbekannt, ausgeblendet wird nur „Vorstoß“.
- **#39 Aufträge/Personen** als Spieler ansehen: in der Testwelt sind Aufträge und Personen im Almanach für Spieler ausgeschaltet (`calendarFeatureVisibility`), dann fehlen die Reiter bewusst. Persönliche Aufträge (Publikum = bestimmte Spieler) prüfen. Mobil-Ansicht der beiden Reiter (Handy/Tablet) noch nicht angesehen.
- **HUD-Reiter:** als Spieler und mit senkrechter DSA-Leiste (Einstellung Layout) ansehen; kommen weitere Einträge dazu, wird der Abschnitt scrollbar.
- **#36 / Waffenkarte:** Fernkampfhand mit Nachladen/Zielen/Magazin live ansehen; Tablet ansehen; Smartphone (Rüstungszeile, Meta-Zeile der Karte) auf dem Gerät prüfen.
- **#46 Bannerbild:** Tablet/Handy und The Forge (`forgevtt`) warten auf Rückmeldungen der Nutzer.
- **Aura (#35):** dezent genug? Bei Porträts mit Hintergrund darf nichts zu sehen sein.
- **Mobil-Click-Dummy** (`clickdummy/mobile/`) zeigt noch den alten Kopf, die alte Waffenkarte und keine Reiter Aufträge/Personen – angleichen oder bewusst so lassen.

## Features / Backlog

Seit 2026-09-30 als GitHub-Issues geführt – siehe unten. Neue Feature-Ideen dort anlegen oder hier kurz notieren.

- **Eigenes HUD:** seit 2026-10-21 als Reiter in der DSA-Leiste (`scripts/hud.js`). Neue Modulfunktionen mit Knopf dort in `hudEntries()` ergänzen. Ohne neue DSA-Leiste (`dsa5.hotbarv3` aus) gibt es kein HUD.
- **Mobil, später:** „Neu“-Markierung im Journal, eigene Tablet-Bogenansicht, Steigern/Bearbeiten auf dem Handy (mit #34), Tablet-Fensterknöpfe vergrößern falls am Gerät zu klein (siehe #43).

---

<!-- GITHUB-ISSUES:START -->
## GitHub-Issues

_Repository: `vt-tom/dsa5-helpers` · Letzter erfolgreicher Abruf: 2026-10-26T14:15:56.548Z · vollständig nachgeladen._

_Automatisch erzeugte Übersicht; nur zur Information. Keine Beauftragung zur Bearbeitung. Nicht von Hand bearbeiten._

**Offen (8)**

- **[#47](https://github.com/vt-tom/dsa5-helpers/issues/47) feat: Lebensenergiezonen (Rüstkammer II) im Zonenkreuz des Kampf-Reiters**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.2 · 0 Kommentare · zuletzt geändert 2026-10-21T07:46:37Z
- **[#50](https://github.com/vt-tom/dsa5-helpers/issues/50) Magieleiste/bubble für Kraftspeicher**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Meilenstein: 0.6.2 · 1 Kommentar · zuletzt geändert 2026-10-26T13:41:27Z
- **[#51](https://github.com/vt-tom/dsa5-helpers/issues/51) V13 Support prüfen**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Meilenstein: 0.6.2 · 0 Kommentare · zuletzt geändert 2026-10-26T13:41:27Z
- **[#52](https://github.com/vt-tom/dsa5-helpers/issues/52) feat: Tooltips**
  - offen · Bearbeiter: niemand · von @vt-tom · 0 Kommentare · zuletzt geändert 2026-10-22T19:13:40Z
- **[#53](https://github.com/vt-tom/dsa5-helpers/issues/53) feat: NSC Sheet im DSA Helpers Design**
  - offen · Bearbeiter: niemand · von @vt-tom · 0 Kommentare · zuletzt geändert 2026-10-23T18:11:01Z
- **[#54](https://github.com/vt-tom/dsa5-helpers/issues/54) feat: Kreatur Sheet im DSA Helpers Design**
  - offen · Bearbeiter: niemand · von @vt-tom · 0 Kommentare · zuletzt geändert 2026-10-23T18:11:20Z
- **[#55](https://github.com/vt-tom/dsa5-helpers/issues/55) feat: Gruppen Sheet im DSA Helpers Design**
  - offen · Bearbeiter: niemand · von @vt-tom · 0 Kommentare · zuletzt geändert 2026-10-23T18:11:48Z
- **[#56](https://github.com/vt-tom/dsa5-helpers/issues/56) feat: Hausregel Passive Verteidigung – ein Angriffswurf ohne aktive Parade**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · 0 Kommentare · zuletzt geändert 2026-10-26T09:56:36Z

**Kürzlich geschlossen (letzte 14 Tage: 15)**

- **[#49](https://github.com/vt-tom/dsa5-helpers/issues/49) Hier ist eine Test Idee die ich gerne einmal Synchronisiert hätte.**
  - geschlossen (nicht geplant) · Bearbeiter: niemand · von @vt-tom · 1 Kommentar · geschlossen 2026-10-22T15:22:18Z
- **[#48](https://github.com/vt-tom/dsa5-helpers/issues/48) feat: Grundmanöver (Paladose) Stufe 3 – Schwachpunkte erkennen, Trefferfolgen, Stören/Ablenken, gleichwertige SF ausgrauen**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.1 · 1 Kommentar · geschlossen 2026-10-21T07:47:18Z
- **[#46](https://github.com/vt-tom/dsa5-helpers/issues/46) feat: Bannerbild ohne Foundry-Dateibrowser hochladen (Standardpfad der SL)**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.1 · 1 Kommentar · geschlossen 2026-10-21T07:47:16Z
- **[#45](https://github.com/vt-tom/dsa5-helpers/issues/45) feat: Hausregel „Grundmanöver“ von Paladose (Möglichkeiten des Kampfes)**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.1 · 3 Kommentare · geschlossen 2026-10-21T07:47:14Z
- **[#44](https://github.com/vt-tom/dsa5-helpers/issues/44) feat: Hausregeln auch im Standardbogen des Systems verfügbar machen**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.1 · 1 Kommentar · geschlossen 2026-10-21T07:47:11Z
- **[#39](https://github.com/vt-tom/dsa5-helpers/issues/39) Vorschlag: Dramatis Personae/ Bestiarium und Auftragsbuch mit dem Charakterbogen verbinden**
  - erledigt · Bearbeiter: @vt-tom · von @WiCoPala · Meilenstein: 0.6.1 · 1 Kommentar · geschlossen 2026-10-21T07:47:09Z
- **[#36](https://github.com/vt-tom/dsa5-helpers/issues/36) Kampf Tab: Übersicht - Rüstung zentral über dem Portrait**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Meilenstein: 0.6.1 · 2 Kommentare · geschlossen 2026-10-21T07:47:06Z
- **[#34](https://github.com/vt-tom/dsa5-helpers/issues/34) feat: Drei Modi im Heldenbogen – Spielen, Steigern, Bearbeiten (Desktop, Tablet, Smartphone)**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.1 · 2 Kommentare · geschlossen 2026-10-21T07:47:04Z
- **[#43](https://github.com/vt-tom/dsa5-helpers/issues/43) feat: Mobile Support (Beta) – Tablet und Smartphone, „Hybrides Spiel“**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.0 · 1 Kommentar · geschlossen 2026-10-21T07:47:02Z
- **[#42](https://github.com/vt-tom/dsa5-helpers/issues/42) feat: Kopf „Wappenbanner“ auf Smartphone und Tablet (Mobile Support)**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.0 · 2 Kommentare · geschlossen 2026-10-21T07:47:00Z
- **[#41](https://github.com/vt-tom/dsa5-helpers/issues/41) feat: Kopf „Wappenbanner“ mit wählbarem Bannerbild (Foundry & Titelblatt)**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.0 · 2 Kommentare · geschlossen 2026-10-21T07:46:57Z
- **[#40](https://github.com/vt-tom/dsa5-helpers/issues/40) feat: Ausgerüstete Waffen im Kampf-Reiter neu gestalten (Foundry, Tablet, Smartphone)**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.0 · 1 Kommentar · geschlossen 2026-10-21T07:46:55Z
- **[#38](https://github.com/vt-tom/dsa5-helpers/issues/38) Magie/Glaube Tab: 2 Spalten Ansicht für Sonderfertigkeitenhinzufügen**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Meilenstein: 0.6.0 · 1 Kommentar · geschlossen 2026-10-21T07:46:53Z
- **[#37](https://github.com/vt-tom/dsa5-helpers/issues/37) Status Tab: Suche bei den Zuständen**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Meilenstein: 0.6.0 · 1 Kommentar · geschlossen 2026-10-21T07:46:50Z
- **[#35](https://github.com/vt-tom/dsa5-helpers/issues/35) Portrait im Dark Mode - Aura oder Spotlight**
  - erledigt · Bearbeiter: @vt-tom · von @vt-tom · Meilenstein: 0.6.0 · 1 Kommentar · geschlossen 2026-10-21T07:46:48Z
<!-- GITHUB-ISSUES:END -->
