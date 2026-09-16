# PLANNING.md — Projektplanung DSA5-Helpers

Dieses Dokument hält die **dauerhaft gültigen** Grundsatzentscheidungen und Vision fest — nicht mehr die Verlaufsgeschichte (siehe [Aufteilung](#dokument-aufteilung) unten). Wird iterativ mit dem Nutzer gefüllt und aktualisiert.

## Dokument-Aufteilung

Seit 2026-09-15 auf mehrere Dateien verteilt (vorher ein einzelnes, stark angewachsenes PLANNING.md):

- **[STATUS.md](STATUS.md)** — Kurzüberblick: was funktioniert, was gerade offen ist, nächster Schritt. Erster Anlaufpunkt.
- **[BUGS.md](BUGS.md)** — offene/gemeldete Fehler.
- **[FEATURES.md](FEATURES.md)** — Feature-Ideen und -Backlog.
- **PLANNING.md** (diese Datei) — Vision, dauerhafte Architektur-/Design-Entscheidungen und wiederverwendbare Muster. Ändert sich selten.
- **[archive/DECISIONS.md](archive/DECISIONS.md)** — vollständiger chronologischer Entscheidungs-/Debugging-Log alle bisherigen Sessions. Nicht standardmäßig lesen, nur für Detailfragen zu einer konkreten früheren Entscheidung.

## Vision

Ein Foundry-VTT-Modul für DSA5, das als erstes Feature einen neuen, überarbeiteten Charakterbogen (Heldenbogen) bereitstellt.

## Design-Muster (wiederverwendbar über alle Tabs)

- **Unter-Tabs neben der Reiter-Überschrift** (eingeführt 2026-09-11 im Talente-Tab): Wenn ein Tab in mehrere gleichwertige Kategorien zerfällt (wie die 5 Talentgruppen + Sammelproben), werden diese als Buttons direkt neben dem Reiter-Titel platziert, nicht als eigener Block im Content-Bereich. Der globale Hinweistext entfällt für solche Tabs, da die Unter-Tabs selbst die Übersicht liefern. Übertragen auf Kampf/Kampftechnik, Magie/Religion je Zauber-Ausrüstung.
  - Finale Optik (Stand 2026-09-14, nach mehreren verworfenen Varianten): reine Andalus-Textlabel mit Akzent-Unterlinie ("Unterstrichen"), keine farbigen Pillen mehr. Details/Verlauf zu den verworfenen Zwischenständen: [archive/DECISIONS.md](archive/DECISIONS.md).

## Architektur (Entwurf)

- **Technologie:** Reines Handlebars + Vanilla JS, keine Frontend-Framework-Bridge (kein React, obwohl `prototyp/` React nutzte). Begründung: Das DSA5-Systempaket selbst läuft auf Handlebars + Foundry ApplicationV2 — ohne eigene Technologie in dieselbe Laufzeit einzubauen lässt sich das Grundprinzip "Erben statt neu entwickeln" (siehe unten) direkt umsetzen.
- **Kein Build-Schritt:** Direkte ES-Module, kein bun/esbuild/webpack. Das DSA5-System selbst hat kein sichtbares Bundling und lädt seine Module direkt — Foundry unterstützt ES-Module nativ.
- **Mindest-Systemversion:** DSA5 8.1.5 (benötigt Foundry ≥ 14.364) gilt als Baseline — keine Unterstützung älterer Versionen geplant.
- **Design-Basis:** `clickdummy/` ist die freigegebene visuelle/funktionale Design-Richtung für den echten Bogen (nicht die drei ursprünglichen `prototyp/`-Prototypen).
- **Release-Umfang:** Erste Modul-Version beschränkt sich komplett auf den neuen Heldenbogen. Weitere Helfer-Features sind eigenständige, spätere Erweiterungen.
- **Lizenz & Veröffentlichung:** Eigener Modulcode unter MIT-Lizenz. Veröffentlichung über ein öffentliches GitHub-Repo (Releases als Manifest-Quelle) plus Eintrag im offiziellen Foundry Package Registry. Enthält keine DSA5-Regeltexte/-Inhalte, nur Verweise auf bereits vorhandene System-Assets — Marken-/Inhaltsrechte liegen bei Ulisses Spiele (siehe `systems/dsa5/COPYRIGHT-NOTICE`).
- **Grundprinzip: Erben statt neu entwickeln.** Der Charakterbogen soll seine Funktionalität (Datenmodell-Zugriffe, Berechnungen, Roll-/Aktionslogik, Sheet-Methoden) so weit wie möglich vom bestehenden DSA5-Systembogen erben/wiederverwenden (Extend der System-Sheet-Klasse, Aufruf ihrer Methoden), statt Funktionen parallel neu zu implementieren. Eigene Methoden nur nach Abstimmung mit dem Nutzer, wenn eine Funktion erweitert/verbessert werden soll.
- **Scope: dauerhaft primär Spielercharaktere, aber erweiterbar mitgedacht.** Der Bogen bleibt in erster Linie für PC-Akteure gedacht (nicht auf NPC/Kreatur/Händler/Gruppe/Fahrzeug ausgeweitet), aber Datenzugriffe werden generisch genug gehalten, wo es nichts kostet, um eine spätere Erweiterung nicht unnötig zu erschweren.

## Referenzen

- Click-Dummy: [../clickdummy/](../clickdummy/)
- Prototypen (`prototyp/`, drei `.dc.html`-Dateien) am 2026-09-16 entfernt — enthielten kopierte DSA5-System-Assets und wurden bereits durch den Click-Dummy als Design-Basis abgelöst.
- Vollständige Entscheidungshistorie: [archive/DECISIONS.md](archive/DECISIONS.md)
- Abgeschlossene Einzel-Prüfaufträge: [archive/UI-UX-REVIEW.md](archive/UI-UX-REVIEW.md), [archive/DARKMODE-PRUEFUNG.md](archive/DARKMODE-PRUEFUNG.md) (Click-Dummy-Ära, nicht mehr aktiv)
