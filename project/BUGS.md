# BUGS.md — offene Fehler

Gemeldete, noch nicht behobene oder noch nicht vom Nutzer live bestätigte Fehler. Erledigte Punkte werden gelöscht (Begründung/Fix-Details landen im Commit bzw. in [archive/DECISIONS.md](archive/DECISIONS.md)), nicht hier abgehakt stehen gelassen.

Format pro Eintrag: kurzer Titel, Tab/Datei falls bekannt, was beobachtet wurde. Reihenfolge = Meldereihenfolge, keine Priorisierung.

Wenn GitHub-Issues angebunden sind (siehe [FEATURES.md](FEATURES.md)), spiegeln sich Bug-Issues von dort ggf. hierher oder ersetzen diese Datei teilweise — noch nicht entschieden.

---

Die letzte Fehlerrunde (Absturz beim Öffnen, Talente-Suche ohne Wirkung, Ausrüstungssuche ohne Wirkung, Initiative-Anzeige mit Nachkommastelle) ist behoben, aber noch nicht erneut vom Nutzer live bestätigt — siehe [STATUS.md](STATUS.md).

- **Sheet-Größe 880×780 → 770×740 (2026-09-19):** rein rechnerisch geprüft (feste Spaltenbudgets der Waffen-/Kampftechnik-Tabellen passen laut Pixel-Summe knapp), nicht live in Foundry getestet. Bei der ersten Live-Prüfung gezielt auf horizontales Scrollen/Umbruch in Kampf (Nah-/Fernkampfwaffen, Kampftechniken nebeneinander) und Magie/Religion (Zauber-/Liturgien-Tabellen) achten.
