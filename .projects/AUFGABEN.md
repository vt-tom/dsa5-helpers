# AUFGABEN.md — Was noch zu tun ist

Eine Liste für alles Offene: neue Notizen, Fehler, Feature-Ideen, offene Entscheidungen.
Neues einfach oben unter **Neu** eintragen. Nur der Nutzer erklärt manuelle Aufgaben für erledigt. Bis zur Bestätigung bleiben sie erhalten, gegebenenfalls als „umgesetzt – Nutzerbestätigung offen“.

---


## Neu (noch nicht bearbeitet)

- **DSA-Leiste (HUD) Variante B (28.10.2026):** Nutzer wählte B aus Heute/A/B/C; umgesetzt in `scripts/hud.js` (Kacheln links, Modul-Spalte rechts, 2 × 40 px, live gemessen ohne Bildlauf), Click-Dummy `?hud` zeigt nur noch B. Live am Spieltisch ansehen; Nutzerbestätigung offen.
- **v13: Inhalt nur im oberen Drittel (28.10.2026, war als „Religion-Reiter leer“ gemeldet, Liturgien fehlten nicht):** behoben – DSA5 7.5.1 baut bei `tabsOutsideSheet` ein leeres `.sheet-body` ins Fenster; wir entfernen es in `_onFirstRender`. In eigener v13-Testinstanz gemessen (alle Reiter, zwei Helden), Paket in die v13-Testwelt eingespielt. Nutzerbestätigung offen.
- **Arbeitsordner/Kopierworkflow (21.10.2026):** Entwicklung nach `D:\Development\dsa5-helpers` verlagert, Kopierskript mit Sicherung und SHA-256-Prüfung; erste Übertragung geprüft. Nutzerbestätigung offen.

## Beta 0.6.2 (Branch `release/0.6.2`, Meilenstein 0.6.2)

Inhalt: #47 Lebensenergiezonen, #50 Kraftspeicher, #51 v13-Desktop, #56 Passive Verteidigung, #58 Talent-Vorschläge (Lyynix). Nutzerentscheidung 28.10.2026: Das ist der Umfang der Beta 0.6.2; Mobil-Phase P1 kommt in 0.6.3. Alles im Modul und Click-Dummy umgesetzt, statisch getestet (v14 93 / v13 91 + 2 übersprungen), **nicht live abgenommen, nicht veröffentlicht**. Technik und Entscheidungen: [PROJEKTDOKU.md](PROJEKTDOKU.md#versionslinien-und-v13-support-issue-51). Manifest auf 0.6.2 hochgezogen (28.10.2026), Mindestversionen unverändert; noch nicht veröffentlicht.

### Live prüfen – umgesetzt, Nutzerbestätigung offen

- **#51 v13-Desktop** in Foundry 13.351 / DSA5 7.5.1, Testwelt des Nutzers `D:\FoundryVTT\user-data-paths\v13` (einspielen mit `python tools/package-module.py --foundry 13 --install D:/FoundryVTT/user-data-paths/v13/Data`, Nutzerwunsch 28.10.2026): Öffnen/Speichern, alle Reiter, Proben/AP, Ausrüstung/Munition, Reittier, magische Artefakte, Wundeinschätzung (bleibt privat? mit zwei Clients), Statistik, SL/Spieler/Beobachter, optionale Fremdmodule. Sicherstellen, dass die Mobil-Oberfläche dort nicht startet. Eigene v13-Testinstanz für Agenten: siehe AGENTS.md (freigegeben 28.10.2026).
- **Ebenfalls angelegte Waffen (28.10.2026):** Abschnitt im Körper-Reiter für angelegte Waffen ohne Hand (v13-Helden), „In die Hand“ → Handwahl des Systems. Live geprüft (v13 Allacaya); Nutzerbestätigung offen.
- **#56 Passive Verteidigung (Variante B, Wahl je Akteur):** im Spielabend testen (28.10.2026). Offen geblieben: Krit mit Bestätigung, mehrere Ziele, Ziel auf anderer Szene. Kommentar mit den Regelentscheidungen am Issue noch nicht gepostet (Rechteprüfung, Nutzer fragen). Issue bleibt bis zur Auslieferung offen.
- **Regression (Abschlussprobe vor dem Release):** einmal durchklicken, ob durch 0.6.2 nichts Bestehendes kaputt ging – v14-Desktop, Smartphone und Tablet (Hybrides Spiel), jeweils hell und dunkel, mit echten Helden. Bekannt: Talent-Vorschläge auf dem Handy noch zweispaltig (kommt mit 0.6.3).

### Release vorbereiten (vor 0.6.2-Beta bzw. 7.0.0 / 8.0.0)

- **Getrennte Versionslinien** (Nutzerentscheidung 26.10.2026): `7.X.X` v13, `8.X.X` v14, `9.X.X` v15; stabil ab 7.0.0 und 8.0.0, Betas vorerst 0.6.x (Beta-Schema je Linie noch nicht entschieden – nichts ohne Entscheidung einführen). Aufgabe: generationseigene Manifeste/ZIPs, stabile und Beta-Kanäle, Update-Pfade strikt trennen, bestehende 0.x-Installationen auf die v14-Linie überführen; Foundry-Kompatibilität je Ausgabe begrenzen, Installation und Folgeupdates je Linie getrennt prüfen; Workflow, Manifest, README, CHANGELOG, [RELEASE.md](../docs/RELEASE.md) nachziehen. Lokale Pakete gibt es schon, öffentliche Kanäle noch nicht.
- **Mobil-Kanal einstellen:** Job `mobile` in `release.yml` entfernen? Die Pre-releases „Mobil-Kanal (Test)“ und „v0.6.0 (Mobil-Test)“ sind überholt.
- **Grundmanöver:** „Stören und Ablenken“ wartet auf den Regeltext von Paladose. Rückfrage: Geister/Elementare würfeln laut Text Tierkunde (nur Dämonen Sphärenkunde) – so umgesetzt.

0.6.0 und 0.6.1 sind Betas. Zum stabilen Release wird später die letzte freigegebene Beta; Merge nach `main` erst nach Nutzerfreigabe. Issues und Meilenstein werden bei Auslieferung geschlossen, auch bei Betas.

## Mobil: Fenster ohne Mobil-Design (Plan 2026-10-28)

Bestandsaufnahme und Umsetzungsplan in [MOBILE.md](../docs/MOBILE.md#15-fenster-ohne-mobil-design-bestandsaufnahme-2026-10-28) Abschnitt 15 (F1–F11, Phasen P1–P3). Entschieden 28.10.2026: P1 in 0.6.3, Systemfenster nur „gut bedienbar“, Changelog auf Mobilgeräten nur als Hinweis. Offen: E-F2 Almanach (Nutzer hat Rückfrage gestellt, Erklärung gegeben). Nächster Schritt nach #56: Live-Bestandsaufnahme, dann P1.

## Live prüfen (Betas 0.6.0 / 0.6.1)

- **Mobile Support** (#43): Prüfliste für echte Geräte steht im Issue; Test über die Beta-Manifest-URL. Kopf auf dem Smartphone (#42): Tippflächen, Einklappen beim Scrollen, Bannerbild-Zuschnitt; Tablet hoch/quer.
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

_Repository: `vt-tom/dsa5-helpers` · Letzter erfolgreicher Abruf: 2026-10-28T05:33:27.830Z · vollständig nachgeladen._

_Automatisch erzeugte Übersicht; nur zur Information. Keine Beauftragung zur Bearbeitung. Nicht von Hand bearbeiten._

**Offen (9)**

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
- **[#57](https://github.com/vt-tom/dsa5-helpers/issues/57) feat: Geldbörse erweitern**
  - offen · Bearbeiter: niemand · von @vt-tom · 0 Kommentare · zuletzt geändert 2026-10-27T09:31:10Z

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
