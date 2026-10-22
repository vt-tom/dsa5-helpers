# UI/UX-Feedback zum Heldenbogen-Clickdummy

Stand: 25.09.2026 · Gegenstand: aktueller Stand in `clickdummy/`

## Gesamteindruck

Der Bogen besitzt eine überzeugende eigene Identität. Pergament, dunkler Kopf, Goldakzente, Systemgrafiken und Würfelsiegel passen zusammen und vermitteln unmittelbar DSA. Die grundlegende Gliederung funktioniert. Besonders gelungen sind die wiederkehrenden Tabellenstrukturen, die sichtbaren Ressourcen und die Trennung zwischen Spiel und Bearbeitung.

Die größte Verbesserung liegt in der Alltagstauglichkeit: Werte schneller erfassen, Aktionen sicher treffen und weniger scrollen. Momentan bekommen Rahmen, Kopf und Abschnittsüberschriften viel Raum, während einige besonders häufig benötigte Aktionen sehr klein ausfallen. Ich würde die bestehende Gestaltung weiterentwickeln und ihre Informationshierarchie schärfen.

## Grundlage und Grenzen der Prüfung

- Start über `clickdummy/start-server.bat`, Betrachtung über HTTP mit geladenen Systemgrafiken.
- Alle zehn Hauptreiter im Browser angesehen. Eigenschaften in Spiel-/Bearbeitungsmodus verglichen; dunkles Thema auf Eigenschaften und Titelblatt geprüft.
- Talent-Suche mit „Fährten“ getestet; Rucksackdialog geöffnet und mit Escape geschlossen. Der Fokus kehrte korrekt zum Rucksack zurück.
- Standardansicht: vom Browser gemeldeter Viewport 1869 × 1270 CSS-Pixel, Bogeninnenfläche etwa 738 × 708 Pixel. Zusätzlich Eigenschaften/Bearbeiten bei 1024 × 768 geprüft; anschließend Ausgangsgröße wiederhergestellt.
- Ergänzende Prüfung ausgewählter CSS-Regeln und der Browser-Zugänglichkeitsstruktur.
- Dies ist ein Expertenreview des Prototyps, kein Nutzertest und keine vollständige Prüfung der Barrierefreiheit. Keine vollständige Kontrastmessung, kein Screenreader-Test, keine Prüfung aller Unterreiter und kein Live-Test im echten Foundry. Beobachtungen daher vor einer Übertragung gegen den aktuellen Modulstand prüfen.
- Empfehlungen sind Vorschläge, keine bereits beschlossenen Designänderungen. Bestehende Entscheidungen zu Würfelsiegeln, Ressourcen-Karten, Favoriten und Unterreitern bleiben Ausgangspunkt.

## Was bereits gut funktioniert

1. **Stimmige visuelle Sprache.** Rahmen und Schriften geben Charakter; wiederkehrende Goldleisten verbinden die Bereiche. Diese Identität sollte erhalten bleiben.
2. **Gute fachliche Gliederung.** Talente, Kampf, Magie und Religion lassen sich klar zuordnen. Magie und Religion nutzen vergleichbare Tabellen, wodurch einmal gelernte Orientierung weiterhilft.
3. **Ressourcen bleiben präsent.** LeP, AsP und KaP kombinieren Namen, Zahlen und Füllstand. Dadurch ist die Information nicht ausschließlich farbcodiert.
4. **Nützliche Schnellzugriffe.** Favoriten, Kampfschaltflächen, Talent-Suche und die Zusammenfassung aktiver Effekte unterstützen typische Spielsituationen.
5. **Sinnvolle Detailreduktion.** Wohlgefällige Talente sind einklappbar. Der Spielmodus blendet die Eigenschafts-Berechnungsmatrix aus. Das ist bereits ein deutlicher Unterschied zum Bearbeitungsmodus.
6. **Notiztext hat Luft.** Die Hintergrundgeschichte liest sich durch Absätze und großzügigere Zeilenhöhe angenehmer als die besonders kompakten Datenbereiche.
7. **Dialogbedienung hat eine gute Basis.** Beim geprüften Rucksackdialog funktionieren Escape und Fokusrückgabe. Im CSS ist auch eine allgemeine Fokusmarkierung vorhanden.

## Priorität 1 – Lesbarkeit und sichere Bedienung

### 1. Häufige Aktionen brauchen größere und deutlichere Trefferflächen

**Beobachtung:** Zustandsänderungen erscheinen als winzige Plus-/Minuszeichen. Favoritensterne, Griffwahl und Hilfesymbole sind ebenfalls klein. Gemessene Beispiele im Bearbeitungsmodus: Löschen-Schaltflächen 16 × 16 Pixel, Hilfesymbol 13 × 13 Pixel. Die Griffwahl ist im CSS mit 20 × 20 Pixel angelegt.

**Auswirkung:** Gerade während einer Kampfrunde erfordern einfache Aktionen unnötig präzise Mausbewegungen. Schwach gezeichnete, aber aktive Symbole können wie deaktivierte Elemente wirken.

**Empfehlung:** Die Grafik darf klein bleiben, ihre klickbare Fläche sollte größer werden. Als Gestaltungsziel für die Desktopansicht etwa 28–32 Pixel bei häufigen Aktionen vorsehen, mit Abstand zu Nachbaraktionen. Zustände zusätzlich als Zahl anzeigen, beispielsweise „Furcht 1/4“. Aktive, inaktive und nicht verfügbare Aktionen klar unterscheiden.

**Prüfkriterium:** Zustände und Favoriten lassen sich zügig ändern, ohne auf einzelne dünne Striche zielen zu müssen; Vergrößerung verursacht keine Überschneidung benachbarter Trefferflächen.

### 2. Informationsschrift und sekundäre Angaben stärken

**Beobachtung:** Tabellenwerte verwenden überwiegend 14 Pixel; viele Spaltenüberschriften und Metadaten liegen bei 11–12 Pixel. Auf hellem Grund sind inaktive Sterne und feine Begrenzungen sehr zurückhaltend. Auf dem Titelblatt sind Talentwerte, Würfel und Schaden besonders eng zusammengerückt. Weiße Zahlen auf den hellen Würfelfarben und der hellgrüne KaP-Balken verdienen besondere Aufmerksamkeit.

**Empfehlung:** Namen und spielrelevante Zahlen versuchsweise auf 15–16 Pixel anheben. Selten benötigte Metadaten dürfen kleiner bleiben, müssen aber klar lesbar sein. Fließtextschrift für Zahlen und Daten verwenden; die dekorative Überschriftenschrift beibehalten. Kontrast der Würfelzahlen je Hintergrundfarbe abstimmen und sekundäre Beschriftungen in beiden Themen gezielt nachmessen. Ressourcenfarben etwas weniger leuchtend abstimmen, ohne ihre Zuordnung zu verändern.

**Prüfkriterium:** Name, Wert und auslösbare Probe sind in normalem Betrachtungsabstand ohne Heranzoomen unterscheidbar. Schriftvergrößerung darf nicht mit abgeschnittenen Spalten erkauft werden.

### 3. Scrollfläche und Fensterhöhe verbessern

**Beobachtung:** Im Kampf erscheint bereits in der Standardansicht ein horizontaler Scrollbalken innerhalb des Inhalts. Gleichzeitig existieren vertikales Scrollen im Bogen und auf der äußeren Seite. Bei 1024 × 768 reicht der Bogen unten aus dem sichtbaren Bereich. In der großen Ansicht bleibt hingegen viel Umgebung frei, während der Inhalt auf relativ kleiner Höhe scrollt.

**Auswirkung:** Zwei Scrollkontexte machen die Navigation schwerer vorhersehbar. Horizontales Verschieben unterbricht das Vergleichen zusammengehöriger Waffenwerte.

**Empfehlung:** Die Bogenhöhe an die verfügbare Fensterhöhe anpassen. Im eigentlichen Bogen möglichst eine klare vertikale Inhalts-Scrollfläche verwenden. Waffenlisten zuerst auf Mindestbreiten, Abstände und lange Inhalte prüfen; bei Platzmangel sekundäre Angaben umbrechen oder in eine zweite Zeile legen. Hauptwerte sollen gemeinsam sichtbar bleiben. Breitere Fenster dürfen zusätzlichen Platz nutzen, sofern die Zeilen noch gut erfassbar bleiben.

**Prüfkriterium:** In der vorgesehenen Mindestfenstergröße bleiben Navigation und Hauptaktionen erreichbar; Kampfwerte benötigen kein horizontales Scrollen. Den äußeren Seiten-Scrollbalken des Dummys getrennt vom späteren Foundry-Fenster bewerten.

### 4. Tastaturbedienung über die bereits guten Dialoge hinaus vervollständigen

**Beobachtung:** In der Zugänglichkeitsstruktur erscheinen die Zustands-Plus-/Minuszeichen als Text und Schicksalspunkte als Bilder, während beispielsweise Favoritenaktionen echte Buttons sind. Damit ist die Bediensemantik uneinheitlich. Die vollständige Tastaturerreichbarkeit dieser Elemente wurde nicht durchgetestet.

**Empfehlung:** Alle auslösbaren Aktionen systematisch per Tab, Enter und Leertaste prüfen. Für Zustandsänderungen benannte Buttons wie „Furcht erhöhen“ einsetzen; Schicksalspunkte mit Zustand und Handlung beschriften. Würfelaktionen sollten das Ziel nennen, beispielsweise „Sinnesschärfe würfeln“, statt nur die Eigenschaftskürzel vorzulesen. Bereits vorhandene Fokusgestaltung und Dialoglogik erhalten.

**Prüfkriterium:** Ein vollständiger Ablauf aus Reiterwechsel, Probe und Ressourcenänderung funktioniert ohne Maus und mit jederzeit sichtbarem Fokus.

## Priorität 2 – schneller orientieren und erfassen

### 5. Favoriten in ein gemeinsames Raster bringen

Die Favoritenidee ist stark, die Darstellung wirkt jedoch wie unterschiedlich lange Etiketten. Talentwerte, Würfelgruppen und Sterne stehen abhängig von der Namenslänge an anderen Positionen. Bei Waffen fehlt neben den Zahlen eine sofort sichtbare AT-/FK-/TP-Zuordnung; die Funktion wird erst über Form, Kontext oder Tooltip klar.

**Vorschlag:** Innerhalb jeder Kategorie gleich breite Zeilen mit festen Bereichen für Bild/Name, Wert, Probe und Stern verwenden. Lange Namen dürfen umbrechen; Wert und Probe behalten ihren Platz. Bei Waffen Werte knapp beschriften. Die bestehende Entscheidung „Bild + Name + Stern + Wert + klickbare Würfel“ lässt sich damit vollständig erhalten. Kein erneutes Hover-Aufklappen erforderlich.

### 6. Kopf und Titelblatt stärker auf Spielsituationen gewichten

Das Titelblatt wirkt repräsentativ, aber das große Porträt und der zweizeilige Name nehmen erheblichen Raum ein. Ressourcen und Schicksalspunkte wechseln beim Übergang zu anderen Reitern zudem die Position. In der Favoritenliste liegt bereits die Liturgie am unteren sichtbaren Rand.

**Vorschlag:** Eine kompaktere Titelblatt-Variante zur Auswahl stellen: etwas weniger Porträthöhe, etwas kleinere Namensschrift und mehr nutzbare Favoritenfläche. Der Kopf auf den Fachreitern könnte ebenfalls kompakter ausfallen. Die Ressourcen möglichst in einer leicht wiedererkennbaren Reihenfolge und Gruppierung halten. Das Porträt bleibt ein wichtiges Identitätselement; die Entscheidung sollte anhand eines Vergleichs mit identischen Favoriten erfolgen.

### 7. Navigationssymbole durch verständliche Beschriftung ergänzen

Die Rail spart Platz und kennzeichnet den aktiven Reiter samt Textlabel. Die übrigen Symbole verlangen allerdings Vorwissen. Titelblatt und Eigenschaften verwenden ähnliche Augenmotive; Talente und Notizen sind ebenfalls nicht allein anhand ihrer Symbole eindeutig.

**Vorschlag:** Auf breiten Fenstern eine optional beschriftete Navigation anbieten; bei kompakter Darstellung Labels auch bei Tastaturfokus zuverlässig zeigen. Den aktiven Reiter weiterhin über mehr als eine Farbänderung markieren. Die Unterreiter mit Unterstrich funktionieren grundsätzlich gut und sollten bleiben.

### 8. Suchbereich und aktive Kategorie aufeinander abstimmen

**Reproduzierbare Beobachtung:** Unter Talente → Körper nach „Fährten“ suchen. Das Ergebnis „Fährtensuchen“ erscheint korrekt unter Naturtalente, während „Körper“ weiterhin als aktiv unterstrichen bleibt.

**Vorschlag:** Bei einer gruppenübergreifenden Suche klar „Suchergebnisse aus allen Gruppen“ anzeigen und die Kategorienmarkierung entsprechend neutralisieren. Beim Löschen der Suche zur bisherigen Kategorie zurückkehren. „Nur gesteigerte anzeigen“ sollte als erkennbarer Schalter mit sichtbarem Zustand gestaltet werden; aktuell wirkt es wie ein beiläufiger Text rechts vom Suchfeld.

### 9. Klickverhalten und Änderung von Werten deutlicher machen

Ressourcenwerte lassen sich laut Oberfläche per Klick bearbeiten; optisch sehen sie zunächst wie reine Anzeigen aus. Umgekehrt wirken Bilder, Würfel, Namen und Karten teilweise ähnlich interaktiv, obwohl sie unterschiedliche Aufgaben haben.

**Vorschlag:** Einheitliche Rückmeldungen für „Details öffnen“, „Probe auslösen“ und „Wert bearbeiten“ festlegen. Bearbeitbare Werte bei Hover und Fokus deutlich kennzeichnen, ohne Layoutsprung. Im Spielmodus laufende Ressourcen weiterhin direkt ändern können. Dauerhafte Charakteränderungen im Bearbeitungsmodus belassen. Rückmeldung nach Änderungen kurz am betroffenen Element zeigen.

## Hinweise pro Reiter

| Reiter | Einschätzung und konkrete nächste Verbesserung |
| --- | --- |
| Titelblatt | Gute persönliche Startseite. Favoriten ausrichten; kleinere Zustandsaktionen vergrößern; Verhältnis Porträt zu Nutzfläche vergleichen. |
| Eigenschaften | Würfel und Gruppierung funktionieren. Im Spielmodus Modifikator- und Berechnungsspalten auf ihren tatsächlichen Nutzen prüfen. „Wert“ ist nicht überall selbsterklärend: bei Ressourcen gegebenenfalls „Aktuell“, bei berechneten Werten eine fachlich passende Bezeichnung verwenden. |
| Talente | Gut scannbare Zeilen, nützliche Suche. Suchzustand korrigieren, Filter als Schalter erkennbar machen, kleine Probe-Würfel als zusammenhängende Aktion behandeln. |
| Kampf | Die Schnellaktionen oben sind hilfreich. Waffen sollten früher und vollständig sichtbar sein; Kampfwerte/Rüstung darüber kompakter gestalten. „Kampf“ als Überschrift und nochmals als Unterreiter ist redundant; „Übersicht“ wäre für den Unterreiter verständlicher. |
| Magie | Die Tabelle ermöglicht guten Vergleich. Tradition nimmt als große Pille viel visuelles Gewicht ein; etwas zurücknehmen und Zauberwerte priorisieren. Bedeutung des kleinen Erweiterungszeichens zugänglich erklären. |
| Religion | Die Analogie zur Magie und das Einklappen wohlgefälliger Talente funktionieren. Dieselben Verbesserungen an Schrift und Probe-Aktionen gemeinsam umsetzen. |
| Ausrüstung | Geld/Gewicht sind gut gepaart. Münznamen oder Kürzel sichtbar ergänzen; Gewichtseinheit angeben. Der einzelne Rucksack beansprucht einen großen, überwiegend leeren Abschnitt: Behältnisbereich kompakter machen. Im Tabellenkopf das Häkchen durch eine zum Schild passende Beschriftung wie „Ausrüstung“ oder „Angelegt“ ersetzen. |
| Status | Fachliche Gruppierung ist hilfreich. Plus/Minus und Stufen deutlicher anzeigen. Der Ansichtsumschalter drängt die Überschrift „Krankheiten & Gifte“ in einen ungünstigen Umbruch; Schalter unter die Überschrift setzen. Test-/GM-Umschalter des Dummys getrennt von der späteren Rechteprüfung behandeln. |
| Notizen | Angenehm lesbarer Fließtext. Persönliche Daten in fünf Spalten werden bei langen Werten eng; flexible Spaltenzahl vorsehen. Bei privaten bzw. GM-Notizen klar erläutern, wer den Inhalt sehen kann. Diese Sichtbarkeitslogik wurde hier nicht funktional geprüft. |
| Gefährten | Namen und Porträts geben Orientierung. Die Loyalitätszahl beim Reittier steht unter den Würfeln, während sie beim Vertrauten daneben steht: vereinheitlichen. Buch-/Knochen-Symbole für Aktionen mit kurzen Beschriftungen oder gut zugänglichen Erklärungen ergänzen. |

## Empfohlene Reihenfolge

1. Trefferflächen, lesbare Schrift und horizontales Überlaufen im Kampf beheben.
2. Tastaturbedienung der Kernaktionen vervollständigen; Suchzustand verständlich machen.
3. Favoritenraster sowie eine kompaktere Kopf-/Titelblattvariante mit identischen Daten vergleichen.
4. Kleinere Beschriftungs-, Einheiten- und Ausrichtungsdetails nachziehen.

Für die nächste Designrunde reichen zwei gezielte Varianten statt einer kompletten Neugestaltung. Anschließend mit typischen Aufgaben prüfen: „Fährtensuchen finden und würfeln“, „Furcht um eine Stufe erhöhen“, „Waffenwert und Schaden ablesen“, „LeP ändern“ und „Gegenstand im Rucksack finden“. Dabei Suchzeit, Fehlklicks, Scrollbedarf und Verständlichkeit beobachten. Zusätzlich lange Namen, viele Favoriten, nur LeP und größere Schrift im echten Foundry-Fenster testen.

Die wichtigste Leitlinie: Die atmosphärische Gestaltung erhalten und die häufigen Spielhandlungen innerhalb dieser Gestaltung sichtbarer und leichter bedienbar machen.
