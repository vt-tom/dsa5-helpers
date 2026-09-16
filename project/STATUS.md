# STATUS.md — Kurzüberblick

Erster Anlaufpunkt für "wo stehen wir aktuell". Wird bei jedem größeren Meilenstein aktualisiert (nicht bei jeder Kleinigkeit — dafür sind [BUGS.md](BUGS.md)/[FEATURES.md](FEATURES.md) da). Für die Begründung *warum* etwas so gebaut wurde: [archive/DECISIONS.md](archive/DECISIONS.md).

**Stand: 2026-09-16.**

## Was funktioniert

- Echtes Foundry-Modul (`module.json`, Sheet-Registrierung, `scripts/`, `templates/`, `styles/`, `lang/`) — kein Click-Dummy mehr für den produktiven Stand.
- Alle zehn Reiter (Titelblatt, Eigenschaften, Talente, Kampf, Magie, Religion, Ausrüstung, Status, Notizen, Gefährten) sind mit echten Systemdaten gebaut, nicht Platzhalter.
- Sheet erbt konsequent vom echten DSA5-Systembogen (`globalThis.dsa5.sheets.ActorSheetdsa5Character`) — Aktionen, Rechenlogik, Datenmodell-Zugriffe sind die echten, keine Neuerfindung.
- Favoriten (Stern-Umschalter auf Talenten/Waffen/Zaubern/Liturgien, Sammelpanel auf dem Titelblatt), Spiel-/Bearbeiten-Modus-Umschaltung, Magie-/Religion-Tab nur bei entsprechender Charakter-Fähigkeit sichtbar.
- 16 automatisierte Tests (`node tests/sheet.test.cjs`, jsdom-frei: Handlebars-Kompilierung + statisches HTML-Parsing gegen echte Systemdateien) — decken Templates/CSS-Syntax, Aktions-Registrierung, Datenpfade gegen die installierten DSA5-Templates, Lokalisierungs-Schlüssel ab.

## Bekannte Grenzen

- **Keine laufende Foundry-Instanz in dieser Umgebung.** Interaktive Live-Prüfung (Klicks, Formulareingaben, echtes Rendering im Browser) ist hier nicht möglich — Bestätigung kommt immer erst aus der Foundry-Installation des Nutzers. Der Testharness deckt nur statische Struktur ab, keine Laufzeit-Interaktion (kein jsdom im Projekt).
- Vier Runden Nutzer-Feedback seit dem ersten Live-Öffnen sind eingearbeitet (Absturz-Fix; 6 UI-Punkte + Initiative-Anzeige; Titelblatt-Leiste/Edit-Felder/Eigenschaftswürfel/Sperren-Bug/Wohlgefällige Talente/Segnungen-Reihenfolge/Proben-Rahmen; Eigenschaftswürfel-Feinschliff + kompletter Kampf-Tab) — noch nicht erneut vom Nutzer live bestätigt.

## Nächster Schritt

CSS-Code-Review ist durchgeführt und die risikoarme Teilmenge umgesetzt (Abschnitts-Kommentare, 2 zusammengeführte Duplikate) — eine volle Reorganisation nach Komponenten/Formatierung bleibt bewusst offen, siehe [FEATURES.md](FEATURES.md). Live-Bestätigung aller bisherigen Feedback-Runden durch den Nutzer steht weiterhin aus.

## Siehe auch

- [BUGS.md](BUGS.md) — offene Fehler
- [FEATURES.md](FEATURES.md) — Feature-Backlog
- [TABS.md](TABS.md) — Tab-für-Tab-Checkliste (Bearbeiten-/Spielmodus-Feintuning)
- [PLANNING.md](PLANNING.md) — Vision, dauerhafte Architektur-Entscheidungen
