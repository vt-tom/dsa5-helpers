# Changelog

Alle nennenswerten Änderungen an DSA5 Helpers. Neueste Version oben.

## [0.3.0] — 2026-09-30

### Neu

- Nach einem Update (und nach der Erstinstallation) zeigt Foundry einmal je Nutzer, was sich geändert hat – auch Spielern ([#11](https://github.com/vt-tom/dsa5-helpers/issues/11)).
- Der Changelog ist jederzeit unter *Einstellungen › Moduleinstellungen › DSA5 Helpers* aufrufbar; jede Version ist einzeln aufklappbar und über eine Versionsleiste oben direkt erreichbar ([#12](https://github.com/vt-tom/dsa5-helpers/issues/12)).
- Neue Einstellung für die Spielleitung: „Standard-Bogen für Helden“ macht den Bogen zum Standard für alle Helden; ein am Helden ausdrücklich gewählter Bogen bleibt ([#13](https://github.com/vt-tom/dsa5-helpers/issues/13)).
- Hat ein Held noch keine Spezies und ist der Charakterbauer installiert, steht im Kopf wie im Systembogen der Knopf „Heldenerschaffung“ ([#10](https://github.com/vt-tom/dsa5-helpers/issues/10)); nach dem Abschließen öffnet sich wieder der zuvor gewählte Bogen statt des Systembogens.

### Behoben

- Patrone werden im Reiter „Magie“ wieder angezeigt – DSA5 8.1.8 führt sie nicht mehr unter den magischen Sonderfertigkeiten.

### Kompatibilität

- Geprüft mit DSA5 8.1.8.

## [0.2.0] — 2026-09-30

### Neu

- Fernkampfwaffen zeigen den Zielen-Fortschritt („Zielen 1/2“ bzw. „Gezielt“), sobald über den Knopf „Zielen“ im Probendialog gezielt wurde ([#8](https://github.com/vt-tom/dsa5-helpers/issues/8)).
- Grüner Würfelknopf für Anwendungseffekte bei Waffen, Rüstung (auch im Reiter „Körper“), Vor-/Nachteilen, Sonderfertigkeiten, Traditionsgegenständen und in der Ausrüstung ([#9](https://github.com/vt-tom/dsa5-helpers/issues/9)).
- Talente › Sammelproben: jedes Talent mit seinen drei Probenwürfeln und dem Fertigkeitswert, wie in der Talentliste.
- Kampf: unter jeder Waffe steht ihre Kampftechnik mit Kampftechnikwert; ein Klick springt zur Kampftechnik im Unterreiter „Kampftechniken“ (Übersicht und Körper).
- Kampf › Körper: Fernkampfwaffen in der Hand zeigen Nachladen und Zielen nebeneinander sowie das Magazin direkt unter dem Schadensknopf.
- Eigenschaften › Grundwerte: Ausweichen und Initiative, im Bearbeiten-Modus zusätzlich Initiativewürfel und Initiative-Mod.; bei allen Grundwerten zeigt der Name beim Überfahren die Berechnungsformel des Systems.

### Geändert

- Getestet mit Foundry VTT 14.368.
- Talente: die Liste zeigt immer alle Gruppen untereinander, die Sammelproben als letzten Abschnitt; die Gruppen-Reiter springen an die Stelle, die Markierung wandert beim Scrollen mit. Suche und „Nur gesteigerte“ bleiben beim Scrollen oben stehen.
- Kampf › Körper: Rüstung und Waffen stehen auf gleicher Höhe (Titel und Kacheln oben bündig).
- Kampf › Körper: eine freie Nebenhand steht nur noch als kleine „+“-Kachel unter der Haupthand (beide rechtsbündig, wie bei beidhändiger Führung); ein Klick darauf wählt die Waffe.
- Kampf › Kampftechniken: die Leiteigenschaft steht klein unter dem Namen statt in einer eigenen Spalte.
- Ausrüstung: Name und Füllstand der Behältnisse in größerer Schrift.

### Behoben

- Kampf › Körper: eine Zauber- oder Liturgieprobe aus dem Dialog öffnet das Probenfenster nicht mehr dahinter – der Dialog schließt sich beim Würfeln.
- Eigenschaften, Bearbeiten-Modus: die −/+-Knöpfe hinter „Karmaenergie“ rutschen nicht mehr in die nächste Zeile.
- Kampf › Kampftechniken: lange Namen laufen nicht mehr in die Nachbarspalte.
- Kampf › Kampftechniken: der Fertigkeitswert ist im Bearbeiten-Modus wieder sichtbar.

## [0.1.0] — 2026-09-30

Erste Version, installierbar über die Manifest-URL.

- Alternativer Heldenbogen „DSA5 Helfer-Heldenbogen“ für Spielercharaktere, zusätzlich zum Systembogen wählbar.
- Zehn Reiter: Titelblatt, Eigenschaften, Talente, Kampf (Übersicht, Körper, Kampftechniken), Magie, Religion,
  Ausrüstung, Status, Notizen, Gefährten.
- Spiel- und Bearbeiten-Modus, Favoriten (Stern) auf dem Titelblatt.
- Magie/Religion nur bei passender Fähigkeit sichtbar.
- Deutsch und Englisch.

[0.3.0]: https://github.com/vt-tom/dsa5-helpers/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/vt-tom/dsa5-helpers/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/vt-tom/dsa5-helpers/releases/tag/v0.1.0
