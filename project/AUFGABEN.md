# AUFGABEN.md — Was noch zu tun ist

Eine Liste für alles Offene: neue Notizen, Fehler, Feature-Ideen, offene Entscheidungen.
Neues einfach oben unter **Neu** eintragen. Erledigtes löschen (Details stehen im Commit).

---

## Neu (noch nicht bearbeitet)

_(leer)_

## Version 0.6.0 — Beta (Branch `release/0.6.0`)

Mobile Support erscheint mit 0.6.0 als Beta. GitHub-Meilenstein `0.6.0`.

- **Enthalten:** Mobile Support ([#43](https://github.com/vt-tom/dsa5-helpers/issues/43)), Kopf „Wappenbanner“ ([#41](https://github.com/vt-tom/dsa5-helpers/issues/41), [#42](https://github.com/vt-tom/dsa5-helpers/issues/42)), Waffenkarte „Banner“ ([#40](https://github.com/vt-tom/dsa5-helpers/issues/40)), Suche bei „Zustand hinzufügen“ ([#37](https://github.com/vt-tom/dsa5-helpers/issues/37)), Sonderfertigkeiten zweispaltig ([#38](https://github.com/vt-tom/dsa5-helpers/issues/38)), Aura um freigestellte Porträts ([#35](https://github.com/vt-tom/dsa5-helpers/issues/35)). CHANGELOG 0.6.0 ist vollständig.
- **Nicht in 0.6.0** (Nutzer 2026-10-20): #34, #36 (Rüstung zentral, für ein späteres Update; beim Umsetzen die Waffenkarte im Kampf-Reiter mitprüfen), #39, #44, #45.
- **Beta veröffentlicht 2026-10-20** als Pre-release `v0.6.0` (Beta-URL liefert 0.6.0, stabile URL weiter 0.5.1). Offen: Mobil-Kanal einstellen (Job `mobile` in `release.yml` entfernen?); zum normalen Release erklären erst nach Freigabe durch den Nutzer (RELEASE.md „Beta zum normalen Release machen“), dann Issues des Meilensteins schließen.

### Live prüfen (0.6.0)

- **Mobile Support** (#43): Prüfliste für echte Geräte steht im Issue; Test über die Beta-Manifest-URL.
- **Aura (#35)** (in der Testinstanz an Wulfgrimm geprüft, hell/dunkel/rund): dezent genug? Bei Porträts mit Hintergrund darf nichts zu sehen sein.
- **Kopf im schmalen Fenster** (in der Testinstanz geprüft mit Testitest, drei Kugeln, 500 px): Kugeln 52 px, Porträt 96 px, Spezies · Kultur · Profession als eigene Zeile unter den Kugeln.

## Features / Backlog

Seit 2026-09-30 als GitHub-Issues geführt – siehe unten. Neue Feature-Ideen dort anlegen oder hier kurz notieren.

- **Eigenes HUD des Moduls** (Idee 2026-10-01): ein Einstieg für mehrere Modulfunktionen, erst, wenn es mehr Funktionen dafür gibt (Nutzer 2026-10-05). Fest eingeplant: Würfelstatistik öffnen (#28), nur wenn sie aktiviert ist. Noch kein Issue.
- **Mobil, später:** „Neu“-Markierung im Journal, eigene Tablet-Bogenansicht, Steigern/Bearbeiten auf dem Handy (mit #34), Tablet-Fensterknöpfe vergrößern falls am Gerät zu klein (siehe #43).

---

<!-- GITHUB-ISSUES:START -->
## GitHub-Issues

_Automatisch aus `vt-tom/dsa5-helpers` übernommen (2026-10-20 08:48 UTC) — nicht von Hand bearbeiten, wird bei jedem Session-Start überschrieben. Änderungen direkt im Issue auf GitHub vornehmen._

**Nur zur Information — Agents bearbeiten diese Issues nie von sich aus, sondern nur, wenn der Nutzer ein bestimmtes Issue ausdrücklich beauftragt.**

**Offen (12)**

- **[#34](https://github.com/vt-tom/dsa5-helpers/issues/34) feat: Drei Modi im Heldenbogen – Spielen, Steigern, Bearbeiten (Desktop, Tablet, Smartphone)**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · 0 Kommentare · zuletzt geändert 2026-10-15
- **[#35](https://github.com/vt-tom/dsa5-helpers/issues/35) Portrait im Dark Mode - Aura oder Spotlight**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Meilenstein: 0.6.0 · 0 Kommentare · zuletzt geändert 2026-10-20
- **[#36](https://github.com/vt-tom/dsa5-helpers/issues/36) Kampf Tab: Übersicht - Rüstung zentral über dem Portrait**
  - offen · Bearbeiter: niemand · von @vt-tom · 1 Kommentar · zuletzt geändert 2026-10-19
- **[#37](https://github.com/vt-tom/dsa5-helpers/issues/37) Status Tab: Suche bei den Zuständen**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Meilenstein: 0.6.0 · 0 Kommentare · zuletzt geändert 2026-10-20
- **[#38](https://github.com/vt-tom/dsa5-helpers/issues/38) Magie/Glaube Tab: 2 Spalten Ansicht für Sonderfertigkeitenhinzufügen**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Meilenstein: 0.6.0 · 0 Kommentare · zuletzt geändert 2026-10-20
- **[#39](https://github.com/vt-tom/dsa5-helpers/issues/39) Vorschlag: Dramatis Personae/ Bestiarium und Auftragsbuch mit dem Charakterbogen verbinden**
  - offen · Bearbeiter: niemand · von @WiCoPala · 0 Kommentare · zuletzt geändert 2026-10-19
- **[#40](https://github.com/vt-tom/dsa5-helpers/issues/40) feat: Ausgerüstete Waffen im Kampf-Reiter neu gestalten (Foundry, Tablet, Smartphone)**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.0 · 0 Kommentare · zuletzt geändert 2026-10-20
- **[#41](https://github.com/vt-tom/dsa5-helpers/issues/41) feat: Kopf „Wappenbanner“ mit wählbarem Bannerbild (Foundry & Titelblatt)**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.0 · 1 Kommentar · zuletzt geändert 2026-10-20
- **[#42](https://github.com/vt-tom/dsa5-helpers/issues/42) feat: Kopf „Wappenbanner“ auf Smartphone und Tablet (Mobile Support)**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.0 · 1 Kommentar · zuletzt geändert 2026-10-20
- **[#43](https://github.com/vt-tom/dsa5-helpers/issues/43) feat: Mobile Support (Beta) – Tablet und Smartphone, „Hybrides Spiel“**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · Meilenstein: 0.6.0 · 0 Kommentare · zuletzt geändert 2026-10-20
- **[#44](https://github.com/vt-tom/dsa5-helpers/issues/44) feat: Hausregeln auch im Standardbogen des Systems verfügbar machen**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · 0 Kommentare · zuletzt geändert 2026-10-20
- **[#45](https://github.com/vt-tom/dsa5-helpers/issues/45) feat: Hausregel „Grundmanöver“ von Paladose (Möglichkeiten des Kampfes)**
  - offen · Bearbeiter: @vt-tom · von @vt-tom · Labels: enhancement · 0 Kommentare · zuletzt geändert 2026-10-20

**Kürzlich geschlossen (letzte 14 Tage)**

- **[#33](https://github.com/vt-tom/dsa5-helpers/issues/33) Switch für das schnelle Umschalten zwischen den Bögen**
  - erledigt · Bearbeiter: @Lyynix, @vt-tom · von @vt-tom · Meilenstein: 0.5.1 · 1 Kommentar · geschlossen 2026-10-07
<!-- GITHUB-ISSUES:END -->
