# Changelog

Alle nennenswerten Änderungen an DSA5 Helpers. Neueste Version oben.

## [0.4.0] — unveröffentlicht

### Neu

- Würfelstatistik (in Arbeit): Die Spielleitung kann in den Moduleinstellungen eine Würfelstatistik einschalten (standardmäßig aus). Jeder Spieler wird dann beim Verbinden gefragt, ob seine Würfe ausgewertet werden dürfen; die Antwort lässt sich jederzeit in den Moduleinstellungen ändern. Gezählt wird nur, wie oft welche Augenzahl je Würfeltyp fällt, getrennt nach digitalen und echten Würfeln – keine einzelnen Würfe ([#28](https://github.com/vt-tom/dsa5-helpers/issues/28)).

## [0.3.3] — 2026-10-01

### Neu

- Im Reiter „Notizen“ haben die persönlichen Daten (Geschlecht, Alter, Größe, Heimat …) einen eigenen Unterreiter „Persönliche Daten“. Er steht an erster Stelle und ist beim Öffnen ausgewählt. Die Textreiter nutzen dadurch die volle Breite ([#26](https://github.com/vt-tom/dsa5-helpers/issues/26)).

### Behoben

- Lange Heldennamen im Kopf des Bogens werden kleiner dargestellt, bis sie ganz in die Zeile passen, auch wenn das Fenster schmaler gezogen wird. Erst bei sehr langen Namen wird mit „…“ gekürzt, und der volle Name erscheint beim Darüberfahren ([#25](https://github.com/vt-tom/dsa5-helpers/issues/25)).

## [0.3.2] — 2026-10-01

### Neu

- Zusammenarbeit mit dem Modul „Lyynix: DSA5 - Steigerungsplaner“: Shift-Klick auf „+“/„−“ (Bearbeiten-Modus) plant eine Steigerung, statt sie auszuführen; neben dem „+“ zeigt ein Zähler die geplanten Schritte, und ein eigener Reiter „Steigerungsplaner“ listet sie zum Anwenden oder Verwerfen. Der Reiter erscheint nur, wenn der Planer aktiv ist, und nur für Besitzer des Helden ([#17](https://github.com/vt-tom/dsa5-helpers/issues/17)).
- Neuer Fensterrahmen im Stil des bisherigen (Holz mit Knotenband), aber nicht mehr verzerrt: die Ecken bleiben fest, das Band wiederholt sich statt gestreckt zu werden; oben ist es etwas breiter. Die Knöpfe der Titelleiste sitzen rechts in einer Plakette auf dem oberen Rahmen, und am ganzen oberen Rahmen lässt sich der Bogen wieder verschieben bzw. per Doppelklick minimieren ([#22](https://github.com/vt-tom/dsa5-helpers/issues/22)).
- Der Reiter „Titelblatt“ hat ein eigenes Symbol (aufgeschlagenes Buch) statt des Auges, das dem der Eigenschaften glich ([#20](https://github.com/vt-tom/dsa5-helpers/issues/20)).
- Der Reiter „Gefährten“ lässt sich je Held ausblenden: Menü „⋮“ oben rechts am Bogen › „Reiter Gefährten ausblenden“ (dort auch wieder einblenden). Nur für Besitzer des Helden ([#21](https://github.com/vt-tom/dsa5-helpers/issues/21)).

### Behoben

- Lange Professions-, Kultur- und Speziesnamen ragen nicht mehr aus dem Kopf des Bogens heraus, sondern werden mit „…“ gekürzt; der volle Name erscheint beim Darüberfahren ([#14](https://github.com/vt-tom/dsa5-helpers/issues/14)).
- Eine Kreatur, die im Reiter „Gefährten“ auf die Fläche „Favoriten zum Schnellauswählen hierher ziehen“ gezogen wird, wird jetzt als Beschwörungs-Favorit angelegt statt als Begleiter, Reittier oder Gestaltwandlung ([#15](https://github.com/vt-tom/dsa5-helpers/issues/15)). Wie im Systembogen wird außerdem Rüstung, die im Reiter „Kampf“ auf den Bogen gezogen wird, gleich angelegt.
- Spaltenköpfe brechen nicht mehr mitten im Wort um: „Aktionsdauer“ bei Zaubern/Liturgien, „Encumbrance“ (englisch) bei den Talenten sowie „Aktuell“ (englisch auch „Advance“) der Grundwerte im Bearbeiten-Modus ([#16](https://github.com/vt-tom/dsa5-helpers/issues/16)).
- Das Traditions-Badge in den Reitern Magie und Religion zeigt jetzt Name und Symbol auch dann, wenn die Tradition nur als Sonderfertigkeit hinzugefügt wurde (z. B. „Tradition (Hesindekirche)“ → „Hesindekirche“) – wie im Systembogen hat die Sonderfertigkeit Vorrang vor dem Textfeld ([#23](https://github.com/vt-tom/dsa5-helpers/issues/23)).
- Der Rahmen um das Porträt sieht im dunklen Thema wieder aus wie im hellen (dunkle Linie mit feinem Goldsaum) statt einer dicken hellen Linie ([#19](https://github.com/vt-tom/dsa5-helpers/issues/19)).

## [0.3.1] — 2026-09-30

### Neu

- Doppelklick auf eine freie Stelle im dunklen Kopf minimiert den Bogen wie im Systembogen; minimiert zeigt er eine Leiste mit dem Heldennamen, per Doppelklick darauf klappt er wieder auf.

### Behoben

- Ein Bogen, der geschlossen und wieder geöffnet wurde, ließ sich bis zum Neuladen (F5) nicht mehr am Kopf verschieben; ebenso fielen dann Hand-Auswahl im Reiter „Körper“, das Schließen des Zauberdialogs und das Merken der Scrollposition aus.

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

[0.3.3]: https://github.com/vt-tom/dsa5-helpers/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/vt-tom/dsa5-helpers/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/vt-tom/dsa5-helpers/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/vt-tom/dsa5-helpers/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/vt-tom/dsa5-helpers/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/vt-tom/dsa5-helpers/releases/tag/v0.1.0
