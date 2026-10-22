# AUFGABEN.md — Was noch zu tun ist

Eine Liste für alles Offene: neue Notizen, Fehler, Feature-Ideen, offene Entscheidungen.
Neues einfach oben unter **Neu** eintragen. Nur der Nutzer erklärt manuelle Aufgaben für erledigt. Bis zur Bestätigung bleiben sie erhalten, gegebenenfalls als „umgesetzt – Nutzerbestätigung offen“.

---


Übertragung/Arbeitsordner 21.10.2026: erste Übertragung und SHA-256-Prüfung bestanden; abschließender Vergleich ohne Abweichungen. Sicherungspfad siehe Projektdokumentation. Git vollständig erhalten. Keine Commits oder GitHub-Schreibaktionen.

## Neu (noch nicht bearbeitet)

- **Arbeitsordner/Kopierworkflow (21.10.2026):** Entwicklung nach `D:\Development\dsa5-helpers` verlagert. Git und lokale Dateien erhalten; Kopierskript mit Sicherung und SHA-256-Prüfung. 74 Tests aus Development bestanden; Klickdummy lokal per HTTP geprüft. Keine Bogenänderung, keine Live-Abnahme.

## Nächste Version 0.6.2

GitHub-Meilenstein `0.6.2`, bisher nur #47 (Lebensenergiezonen). Branch `release/0.6.2` und CHANGELOG-Abschnitt „0.6.2 — unveröffentlicht“ beim Start anlegen. Ob es 0.6.2 oder 0.7.0 wird, ist noch offen (Meilenstein ggf. umbenennen).

- Issues und Meilenstein werden geschlossen, sobald eine Version ausgeliefert ist, auch bei Betas (seit 2026-10-21).
- 0.6.0 und 0.6.1 sind Betas (Pre-releases). Zum stabilen Release wird später die letzte gute 0.6.x-Beta; dann nach `main` mergen.
- **Grundmanöver:** „Stören und Ablenken“ wartet auf den Regeltext von Paladose. Rückfrage an Paladose: Geister/Elementare würfeln laut Text Tierkunde (nur Dämonen Sphärenkunde) – so umgesetzt.
- **Mobil-Kanal einstellen:** Job `mobile` in `release.yml` entfernen? Die Pre-releases „Mobil-Kanal (Test)“ und „v0.6.0 (Mobil-Test)“ sind überholt.

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

_Repository: `vt-tom/dsa5-helpers` · Letzter erfolgreicher Abruf: 2026-10-22T15:22:26.269Z · vollständig nachgeladen._

_Automatisch erzeugte Übersicht; nur zur Information. Keine Beauftragung zur Bearbeitung. Nicht von Hand bearbeiten._

**Offen (1)**

- **[#47](https://github.com/vt-tom/dsa5-helpers/issues/47) feat: Lebensenergiezonen (Rüstkammer II) im Zonenkreuz des Kampf-Reiters**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.2 · 0 Kommentare · zuletzt geändert 2026-10-21T07:46:37Z

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
