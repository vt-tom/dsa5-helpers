# Changelog

Alle nennenswerten Änderungen an DSA5 Helpers. Neueste Version oben.

Entwicklungsworkflow (21.10.2026): Arbeitskopie unter Development; gesicherte Übertragung per `tools/deploy-foundry.ps1`. Tests und Klickdummy verwenden die separate Foundry-Installation. Keine Änderung des Spielverhaltens.

## [0.6.2] — unveröffentlicht

### Neu

- Separate v13-Desktop-Testausgabe (#51) für Foundry 13.351 / DSA5 7.5.1: später Klassenstart, ältere Kontextmenüs und Systemaktionen, native Munitionswahl, Reittier im Kampf-Reiter und magische Traditionsartefakte. Wundeinschätzung verwendet den privaten v13-Würfelmodus. Fehlende DSA8-Funktionen und Mobiloberfläche bleiben aus; „Helfen“/Grundmanöver sind ohne DSA8-Modifikatoren-Hook nicht verfügbar. Lokale generationseigene ZIPs über `tools/package-module.py`, noch keine Veröffentlichung oder interaktive Foundry-Abnahme.

- Kraftspeicher (#50) am AsP-Vorrat: kleine Summenkugel, beim Öffnen radial angeordnete Einzelspeicher ohne Hintergrundfläche. Gewählte Variante „Schwebend“ mit dunkler Fassung und Schatten; fünf Speicher pro Seite, bei mehr Speichern blättern. Werte kommen aus dem DSA5-System; Bearbeiten öffnet dessen gemeinsamen Kraftspeicherdialog. Eigene AsP bleiben getrennt. Anzeige nur mit vorhandener Systemunterstützung und Speichern.
- Lebensenergiezonen (#47): Zonen-LeP-Balken, Ausfallmarkierung und Widerstands-Malus im Zonenkreuz, auf dem Smartphone als Zonenliste. Getrennte Schaltflächen für Rüstung und Zonenenergie; Bearbeiten über den Dialog von Rüstkammer II. Nur bei aktiver Regel und vorhandenem Modul; Beobachter sehen Werte ohne Bearbeitungszugriff. Schaden, Heilung und Ausfallfolgen verarbeitet weiterhin Rüstkammer II.

### Behoben

- Kraftspeicher (#50): Ladefehler beim Öffnen beseitigt. Der Dialog wird über die bereits initialisierte Systemaktion geöffnet, statt interne Quelldateien neben dem DSA5-Bundle erneut zu importieren.

- Kraftspeicherdialog (#50): Ladungen werden auch bei kopierten Gegenständen mit gleicher Effekt-ID dem richtigen Gegenstand zugeordnet; die Summenanzeige wird nach dem Speichern aktualisiert. Systemvorlage und Effekt-Datenmodell bleiben erhalten.

- Zonen-LeP (#47): Anzeige verwendet denselben Aufbereitungshelfer von Rüstkammer II wie der Systemdialog. Dadurch erscheinen auch vor der ersten Initialisierung die richtigen Werte statt `0 / 0`.

### Click-Dummy

- Designs für #50/#47 abgenommen; zugehörige Test- und Vergleichsschalter sowie verworfene Varianten entfernt. Gewählte Darstellung bleibt mit Demo-Werten bedienbar.

## [0.6.1] — 2026-10-21

### Neu

- Drei Modi im Heldenbogen: Spielen, Steigern, Bearbeiten ([#34](https://github.com/vt-tom/dsa5-helpers/issues/34)). Das Schloss in der Titelleiste öffnet eine Auswahl und zeigt den aktuellen Modus (Schloss, Pfeil nach oben, Stift).
  - **Spielen:** würfeln, LeP, Zustände und Statuseffekte, Anzahl von Gegenständen – sonst ändert sich nichts.
  - **Steigern:** alle +/−-Knöpfe, die AP kosten oder erstatten (Eigenschaften, LeP/AsP/KaP-Zukauf, Talente, Kampftechniken, Zauber, Liturgien), dazu Neues lernen (Ziehen aus dem Kompendium) und Entfernen mit AP-Erstattung. Werte direkt eintippen geht hier nicht.
  - **Bearbeiten:** zusätzlich alle Werte direkt ändern, ohne die AP zu berühren, und Gegenstände anlegen oder löschen.
  - Neue Welt-Einstellung „Spieler: Werte ohne AP ändern (Bearbeiten-Modus)“ (Standard an): ausgeschaltet können Spieler nur spielen und steigern, die Spielleitung darf immer bearbeiten.
  - Löschen-Knöpfe an Vor-/Nachteilen, Zaubern und Liturgien heißen jetzt „Löschen (AP zurückerstatten)“.
  - Im Spielmodus lässt sich nichts Neues lernen; wer eine Sonderfertigkeit, einen Zauber o. Ä. hineinzieht, bekommt einen Hinweis.
- Hausregeln auch im Standardbogen des Systems ([#44](https://github.com/vt-tom/dsa5-helpers/issues/44)): Ist eine Hausregel aktiv, gibt es sie jetzt auch in den Helden- und NSC-Bögen des DSA5-Systems – die Wundeinschätzung als Herz hinter „Heilkunde Wunden“, „Helfen“ als Schalter „Als Hilfe würfeln“ im Probendialog jeder Talentprobe (auch im Bogen von DSA5 Helpers und in der DSA-Leiste). Hilfe ist nie vergleichend; nach dem Wurf nennt der Chat die QS als Erleichterung. Schaltet die Spielleitung eine Regel um, aktualisieren sich offene Bögen sofort.
- Neue Hausregel „Grundmanöver“ von Paladose ([#45](https://github.com/vt-tom/dsa5-helpers/issues/45)): Jeder Held darf Angriff antäuschen, Gezielter Angriff/Schuss, Mächtiger Angriff, Vorstoß, Verteidigungshaltung und Zielen einsetzen; wie stark, hängt von einer Leiteigenschaft ab. Das Hausregelbuch enthält den vollständigen Regeltext (deutsch und englisch), die Spielleitung schaltet jedes Manöver einzeln zu.
  - Die Manöver stehen im Probendialog für Angriff, Parade und Ausweichen in einem eigenen Abschnitt „Grundmanöver“ rechts unter den Sonderfertigkeiten, nur mit erlaubten Waffen. Bedienung wie bei den Sonderfertigkeiten: Klick schaltet zur nächsten Stufe (danach wieder aus), Rechtsklick eine zurück; die Zeile zeigt die Wirkung, ein Hinweis nennt die Kombinationsregel. Die Liste der Situationsmodifikatoren bleibt dadurch übersichtlich. Das funktioniert in jedem Bogen.
  - Vorstoß merkt sich den Malus auf Parade und Ausweichen bis zum Ende der Kampfrunde. Verteidigungshaltung und Zielen schaltet man im Kampf-Reiter (neuer Block „Grundmanöver“), im Menü ⋮ des Systembogens oder im Reiter des Moduls in der DSA-Leiste; beides endet mit dem Kampf. Ist das Grundmanöver Zielen an, entfällt das Zielen des Systems.
  - Grundmanöver Stufe 3 ([#48](https://github.com/vt-tom/dsa5-helpers/issues/48)): **Schwachpunkte erkennen** – Gegner markieren, Knopf im Kampf-Reiter, im Menü ⋮ des Systembogens oder in der DSA-Leiste. Das Talent (Menschenkenntnis, Tierkunde oder Sphärenkunde) richtet sich nach der Art des Gegners; nach der Probe verteilt man die QS auf PA und TP. Die Boni sind danach im Probendialog angehakt: TP beim Angriff auf diesen Gegner, PA bei der Parade gegen ihn, bis Kampfende. „Mitteilen“ in der Chatkarte gibt sie allen Verbündeten; ab dann gelten sie für alle nur noch bis zum Ende der nächsten Kampfrunde. Gegen Dämonen, Geister und Elementare gibt es nur PA.
  - **Folgen gezielter Treffer:** Trifft ein gezielter Angriff, nennt die Ergebniskarte die Folge passend zu den SP (z. B. „Kopf, 11 SP: 2 Stufen Betäubung“, Hals ab 8 SP tödlich) samt Widerstandsprobe. Knöpfe setzen den Zustand am Ziel, beim Torso würfelt ein Knopf die zusätzlichen 1W3+1 SP.
  - Ist ein Grundmanöver an, blendet der Probendialog die gleichwertige Sonderfertigkeit des Systems aus (Finte, Wuchtschlag, Vorstoß, Verteidigungshaltung), damit nichts doppelt zählt.
  - In englischen Welten heißen TP in den Grundmanövern jetzt DP wie im System.
  - Die lange Buchseite der Grundmanöver hat oben eine Sprungleiste (Im Modul, Aktionen im Kampf, jedes Manöver); sie bleibt beim Scrollen sichtbar, ein Klick springt zum Abschnitt.
- Neue Reiter „Aufträge“ und „Personen“ ([#39](https://github.com/vt-tom/dsa5-helpers/issues/39)): Der Heldenbogen zeigt die freigegebenen Aufträge aus dem Almanach (nach Haupt-, Neben- und persönlichen Aufträgen, Abgeschlossene zugeklappt) sowie Dramatis Personae und Bestiarium als gleich große Kacheln mit Bild und nur dem Nötigsten: beim Auftrag Titel und Stand der Ziele, bei Personen Name und Untertitel. Ein Klick öffnet den Eintrag im Almanach des Systems, dort stehen Details und Notizen. Die Reiter erscheinen nur, wenn im Almanach Journale aktiviert sind und der Bereich für Spieler freigegeben ist; die Spielleitung kann jeden Reiter im Untermenü „Heldenbogen einrichten“ abschalten.
- Eigener Reiter in der DSA-Leiste (unten Mitte): Das Feder-Symbol öffnet die Schnellzugriffe des Moduls als beschriftete Chips. Oben die Moduleinstellungen (öffnen direkt auf der Seite von DSA5 Helpers), das Hausregelbuch und – wenn aktiviert – die Würfelstatistik; darunter die aktiven Hausregeln für den gewählten Token: Helfen, Wundeinschätzung, Verteidigungshaltung (rot umrandet, solange aktiv) und Zielen (mit Stand, z. B. 1/3).
- Bannerbild ohne Foundry-Dateibrowser ([#46](https://github.com/vt-tom/dsa5-helpers/issues/46)): Die Spielleitung legt in den Moduleinstellungen einen Standardordner für Bannerbilder fest. Spieler wählen dann ein Bild von ihrem eigenen Rechner; es wird verkleinert, über die angemeldete Spielleitung in diesen Ordner hochgeladen und als Bannerbild gesetzt – ganz ohne Rechte auf den Dateibrowser. Fehlt der Ordner oder ist keine Spielleitung angemeldet, gibt es einen Hinweis. Wer den Dateibrowser öffnen darf (Spielleitung, Spieler mit diesem Recht), wählt zwischen „Vom Computer hochladen“ und „Foundry-Dateibrowser“.

### Geändert

- Moduleinstellungen aufgeräumt: Das Changelog steht ganz oben. Standard-Bogen, Bearbeiten-Modus für Spieler, die Reiter Aufträge/Personen und Ordner für Bannerbilder liegen gesammelt im neuen Untermenü „Heldenbogen einrichten“ (nur Spielleitung).
- Gefährten: Im Bearbeiten-Modus hat jede Begleiter-Karte einen Knopf „Entfernen“ (mit Rückfrage); bisher ging das nur über das Menü ⋮.
- Kampf › Körper: Die Rüstung steht jetzt mittig zwischen den Händen über der Figur statt in einer eigenen Zeile darunter, der Bogen wird dadurch kürzer ([#36](https://github.com/vt-tom/dsa5-helpers/issues/36)). Ein Wappenschild zeigt das Bild der Hauptrüstung mit Rüstungsschutz (samt Zauber-/Liturgieschutz) und Belastung, darunter ihren Namen. Trägt der Held mehrere Teile, stehen die übrigen klein darunter. Hauptrüstung ist das Teil mit dem höchsten RS; im Bearbeiten-Modus macht ein Klick auf ein anderes Teil es zur Hauptrüstung. In schmalen Fenstern (z. B. Tablet mit Chat daneben) zieht die Rüstung in eine freie oder von einer beidhändigen Waffe belegte Hand; sind beide Hände belegt, bleibt ein kleineres Schild in der Mitte, die weiteren Teile dann als Bildchen mit RS (Name beim Überfahren).
- Mit der Trefferzonen-Regel (Kompendium 1 und Rüstkammer 2, beide Einstellungen aktiv) zeigt der Körper-Reiter stattdessen ein Zonenkreuz: Kopf, Torso, beide Arme und Beine mit dem Rüstungsschutz je Zone, wie Rüstkammer 2 ihn berechnet. Die Waffenkarten werden dann etwas kompakter, im sehr schmalen Fenster stehen die Zonen als Kacheln mit Rüstungsteil unter den Händen.
- Waffenkarte aufgeräumt: Name, Favoriten-Stern und Anwendungswürfel stehen in einer Zeile, darunter Kampftechnik · KtW · Reichweite. Daneben das Bild, AT und PA gleich breit nebeneinander, darunter der Schadenswurf über die volle Breite; Nachladen, Zielen, Magazin, Munition und „Beidhändig führen“ unten als gleich hohe Knöpfe. Der Schadenswurf vergrößert sich beim Überfahren nicht mehr stärker als AT/PA.
- Bessere Lesbarkeit im Körper-Reiter: keine Beschriftung mehr kleiner als 13 px, kräftigere Farben für Nebentexte, Figur und Wasserzeichen im Hintergrund dezenter.

## [0.6.0] — 2026-10-20

### Neu

- Hybrides Spiel (Beta, [#43](https://github.com/vt-tom/dsa5-helpers/issues/43)): Mit der Welt-Einstellung „Hybrides Spiel (Tablet/Smartphone)“ (nur Spielleitung, Standard aus) bekommen Tablets und Smartphones eine eigene Oberfläche. Welche, wählt jedes Gerät automatisch: Smartphone, Tablet oder – an Rechnern mit Maus – die normale Foundry-Oberfläche. Ändern lässt sich das im Konto-Menü (Kreis oben rechts) oder in den Moduleinstellungen; hilft gar nichts mehr, `?dsa5h-ui=foundry` an die Adresse hängen.
- Konto-Menü der Mobil-Oberfläche: Oberfläche wählen, Spielfeld auf diesem Gerät an/aus (spart Akku), Hell/Dunkel, Foundry-Einstellungen, zur vollständigen Foundry-Oberfläche, Abmelden.
- In dieser Oberfläche ist oben die Szene: mit einem Finger verschieben, mit zwei Fingern zoomen, lange drücken pingt, den eigenen Token lange drücken und dann ziehen bewegt ihn (rastet ein, Wände gelten). Kurz antippen wählt wie ein Mausklick (Token, Türen) und zeigt den Namen. Knöpfe: auf den eigenen Helden zentrieren, Spielfeld vergrößern.
- Darunter die eigenen Helden mit LeP/AsP/KaP (Spielleitung: alle Helden der Gruppe mit Spielern und Online-Punkt); Antippen öffnet den Bogen bildschirmfüllend. Unten links Journal, unten rechts Chat mit Zähler für ungelesene Nachrichten; neue Nachrichten erscheinen kurz als Sprechblase darüber.
- Chat-Nachrichten: lange drücken oder ⋮ öffnet das Kontextmenü des Systems als Blatt von unten, z. B. „Schip verwenden“ oder „Schaden anwenden“. Ebenso öffnet langes Drücken auf einen Akteur im Akteure-Panel dessen Kontextmenü. Fenster und Dialoge erscheinen bildschirmfüllend.
- Spielleitung: „Probe anfordern“ an der Heldenkarte öffnet die Probenanfrage des Systems. Unter den Szenen-Knöpfen pausiert ▶ das Spiel für alle, ein eigener schwebender Knopf „Akteure“ öffnet das Akteur-Verzeichnis.
- Kampf: Unter der Kopfleiste stehen die Kampfreihenfolge, „Du bist dran!“ und „Initiative würfeln“; Antippen öffnet den Kampf-Tracker. Fremde Token antippen zeigt den Namen und „Ziel“ zum Markieren.
- Heldenbogen auf dem Smartphone: Reiterleiste unten (wischbar), Bogen-Menü über „⋮“ oben rechts, der Kopf klappt beim Scrollen zusammen, das Titelblatt ist einspaltig. Probendialoge erscheinen als Blatt von unten, eine Talent- oder Zauberzeile antippen würfelt. Kampf zeigt Waffen als Karten statt der Figur, Zauber und Liturgien haben Kosten, Dauer und Reichweite in einer Unterzeile, Status beginnt mit Schmerz, Belastung und Traglast, LeP/AsP/KaP/Schips lassen sich mit großen −/+-Knöpfen ändern, die Ausrüstung lässt sich über Kategorie-Chips filtern. Auf dem Tablet steht die Reiterleiste rechts im Fenster; im Querformat lassen sich Bogen und Chat nebeneinander anzeigen (Chat-Knopf in der Reiterleiste).
- Chat und Journal im Modul-Design: Nachrichten als Karten mit Porträt, Probenkarten mit großen Würfeln, Ergebnisband und QS-Rauten. Unter dem Chat Chips für die Sichtbarkeit (Öffentlich, Als Held, Privat · SL, Verdeckt, Nur ich) und für Empfänger zum Flüstern, Würfel-Schnellknöpfe (1W20, 3W20, 1W6, 2W6 und ein freier Wurf), ➤ zum Senden und „Aa“ für die Formatleiste. Journal-Einträge zeigen eine Seite auf einmal; auf dem Tablet stehen die Seiten links, auf dem Smartphone blättert eine Leiste unten (‹ › und „Seite x von y ▾“ für die Seitenliste).

- Status › Zustände: „Zustand hinzufügen“ hat jetzt ein Suchfeld. Es filtert die Zustände beim Tippen, Enter fügt den einzigen Treffer hinzu, Escape leert die Suche bzw. schließt die Auswahl ([#37](https://github.com/vt-tom/dsa5-helpers/issues/37)).

### Geändert

- Neuer Kopf im Heldenbogen ([#41](https://github.com/vt-tom/dsa5-helpers/issues/41)): Oben ein Bannerstreifen mit Name und Schicksalspunkten. Im Bearbeiten-Modus lässt sich je Held ein eigenes Bannerbild wählen oder wieder entfernen, ohne Bild bleibt der Kopf dunkel. Das Porträt hat eine kräftige Goldfassung und lässt sich im Bearbeiten-Modus zwischen eckig und rund umschalten; darunter zeigt ein rotes Band den AP-Wert und die freien AP. Spezies, Kultur und Profession stehen als schlichte Zeile in Großbuchstaben unter dem Namen. LeP, AsP und KaP sind jetzt Kugeln, deren Füllstand den Verlust zeigt – der aktuelle Wert lässt sich weiterhin direkt in der Kugel ändern. Auf dem Titelblatt stehen Porträt, AP-Band und Kugeln in der linken Leiste.
- Der neue Kopf auch auf dem Smartphone ([#42](https://github.com/vt-tom/dsa5-helpers/issues/42)): ein schmaleres Banner mit „‹“ und „⋮“, das Porträt-Medaillon links neben Name, Schicksalspunkten und Identität, darunter die Kugeln über die volle Breite. Beim Scrollen klappt der Kopf zu einer Zeile mit kleinem Porträt, Name und kleinen Kugeln zusammen. Die Knöpfe fürs Bannerbild liegen im Bearbeiten-Modus neben „⋮“. Das Tablet nutzt den Kopf der Desktop-Ansicht.
- Neue Waffenkarte im Kampf-Reiter › Körper ([#40](https://github.com/vt-tom/dsa5-helpers/issues/40)): Jede Waffe in der Hand steht auf einer eigenen Karte mit einem Wimpel für die Hand, dem Namen groß obenauf, dem Waffenbild frei auf einem Lichtschein und der Waffe als blassem Wasserzeichen dahinter. Daneben stehen Kampftechnik und Reichweite, darunter AT/PA bzw. FK als Knöpfe und der Schadenswurf. Die Waffe wechselt man über ⇄ oben rechts, ausgerüstete Waffen lassen sich jetzt auch hier als Favorit markieren. Beide Hände sind gleich groß, auch eine freie oder von einer beidhändigen Waffe belegte Hand.
- Porträts ohne Hintergrund (freigestellte Figuren) haben im Kopf und auf dem Titelblatt einen dezenten goldenen Schein entlang der Umrisse und heben sich so besser vom Rahmen ab, im hellen wie im dunklen Thema ([#35](https://github.com/vt-tom/dsa5-helpers/issues/35)).
- Magie und Religion: Sonderfertigkeiten, Patron, Zaubertricks und Segnungen stehen jetzt zweispaltig nebeneinander statt jeweils über die volle Breite; ein allein stehendes letztes Feld nimmt die ganze Zeile, in schmalen Fenstern und auf dem Smartphone bleibt es einspaltig ([#38](https://github.com/vt-tom/dsa5-helpers/issues/38)).

### Behoben

- Kampf-Reiter: Eine Waffe, die in einem Behälter liegt (z. B. im Rucksack), ließ sich in die Hand wählen, die Hand blieb aber leer. Jetzt wird sie dabei aus dem Behälter genommen. Solange sie in einem Behälter liegt, zeigt unter „Weitere Waffen“ ein kleines Bild des Behälters das an (Name im Tooltip), in der Handauswahl steht „(in …)“ dahinter.
- Titelblatt in schmalen Fenstern (unter etwa 560 px): Der Kopf steht oben wie auf den anderen Reitern, der Kasten „Statuseffekte | Persönliche Daten“ unter den Favoriten, statt dass die linke Leiste den Inhalt zusammendrückt.
- Titelblatt › Persönliche Daten: Die Bezeichnungen (z. B. „Sozialstatus“) hatten einen dunklen Textschatten aus Foundry und waren schlecht lesbar.

## [0.5.1] — 2026-10-07

### Neu

- Bogen wechseln mit einem Klick: In der Titelleiste jedes Heldenbogens (auch des Systembogens) sitzt ein Knopf ⇄. Er zeigt die verfügbaren Heldenbögen – den Systembogen als „Systemstandard“ –, ein Klick wechselt sofort, der neue Bogen öffnet sich an derselben Stelle. Fährt man mit der Maus über einen Eintrag, erscheint der Held an derselben Stelle schon im anderen Bogen (nur als Vorschau, nicht bedienbar); verlässt man das Menü, ist wieder der bisherige Bogen zu sehen. Bisher ging das nur über ⋮ → „Bogen konfigurieren“. Den Knopf sehen alle, denen der Held gehört; die Wahl gilt wie dort für alle Nutzer dieses Helden.

### Geändert

- Kompatibel mit DSA5 8.1.9: Sammelproben zeigen die im System einstellbare Ziel-QS (statt fest „/ 10“) und „unbegrenzt“, wenn keine Höchstzahl an Proben gesetzt ist – wie im Systembogen.

### Behoben

- Titelblatt › Persönliche Daten: Der Sozialstatus erscheint wieder als Unfrei, Frei, Niederadel, Adel oder Hochadel statt als Zahl; ist keiner gewählt, fehlt die Zeile.

## [0.5.0] — 2026-10-05

### Neu

- Hausregelbuch: In den Moduleinstellungen gibt es jetzt „Hausregelbuch öffnen“. Die Liste zeigt alle Hausregeln mit Kurzbeschreibung; jede lässt sich im Buch lesen. Das Buch beginnt mit einem Inhaltsverzeichnis, jede Regel hat eine eigene Seite, geblättert wird über die Pfeile neben der Seite oder mit den Pfeiltasten. Ob eine Regel gilt, steht oben rechts auf ihrer Seite. Die Spielleitung schaltet Hausregeln für die Welt ein und aus (in der Liste und auf der Buchseite), Spieler sehen, was gilt. Für Makros: `game.modules.get('dsa5-helpers').api.openHouseRules()`.
- Erste Hausregel „Wundeinschätzung“ (Idee und erste Umsetzung: Knigge – danke!): Ein Held mit Heilkunde Wunden schätzt per verdeckter Probe ein, wie schwer das markierte Ziel verletzt ist – je mehr QS, desto genauer, von „verletzt“ bis zu den ungefähren LeP. Bei aktiver Regel steht im Reiter Talente neben Heilkunde Wunden der Hinweis „Wundeinschätzung“ (und ein Herz-Knopf auf dem Titelblatt, wenn Heilkunde Wunden ein Favorit ist): Ohne markiertes Ziel erinnert er daran, eines zu wählen, sonst öffnet er den gewohnten Probendialog. Das Ergebnis kommt als Flüsternachricht, die Spielleitung erhält nur einen Hinweis. Neu einschätzen lässt sich erst, wenn sich die LeP des Ziels um ein Viertel geändert haben. Mit dem Modul „Token Note Hover“ erscheint die Einschätzung auch beim Darüberfahren.
- Zweite Hausregel „Helfen“ (Idee: VTTom): Im Kampf nutzt ein Held seine Aktion für eine passende Talentprobe, die übrig behaltenen QS erleichtern die nächste Probe eines Mitstreiters (z. B. Einschüchtern, um einen Gegner auf sich zu lenken). Bei aktiver Regel gibt es im Reiter Kampf bei den Schnellaktionen den Knopf „Helfen“: Talent wählen (mit Suche), im gewohnten Probendialog würfeln, die Erleichterung erscheint im Chat – ist ein Mitstreiter markiert, wird er genannt. Eintragen muss der Unterstützte die Erleichterung bei seiner nächsten Probe selbst.
- Favoriten für Ausrüstung und Sonderfertigkeiten: Gegenstände im Reiter Ausrüstung und Sonderfertigkeiten (Eigenschaften, Kampf, Magie, Religion) haben jetzt einen Stern. Auf dem Titelblatt erscheinen sie in eigenen Gruppen: Ausrüstung mit Anzahl und „Verbrauchen“ bei Verbrauchsgegenständen wie Tränken (mit Rückfrage, wie im Kontextmenü des Systems), sonst mit dem Anwendungs-Würfel, falls vorhanden; Sonderfertigkeiten mit dem Anwendungs-Würfel ([#30](https://github.com/vt-tom/dsa5-helpers/issues/30)).
- Titelblatt: Ein Klick auf den Namen eines Favoriten öffnet sein Fenster (z. B. den Regeltext einer Sonderfertigkeit) ([#30](https://github.com/vt-tom/dsa5-helpers/issues/30)).
- Beim Reiterwechsel gleiten Porträt, Name, Schicksalspunkte, LeP/AsP/KaP und Eigenschaftswürfel an ihren neuen Platz, der übrige Inhalt blendet sanft ein. Mit der Systemeinstellung „Bewegung reduzieren“ entfällt die Animation ([#1](https://github.com/vt-tom/dsa5-helpers/issues/1)).

### Geändert

- Titelblatt: Die Leiste links ist neu aufgeteilt. LeP, AsP und KaP sind flacher, Schicksalspunkte und Regeneration stehen in einer Zeile. Darunter liegt ein Kasten mit zwei Reitern: „Statuseffekte“ zeigt jetzt alle Zustände (statt höchstens vier), „Persönliche Daten“ die ausgefüllten Angaben aus den Notizen, mit einem Sprung zum Bearbeiten ([#27](https://github.com/vt-tom/dsa5-helpers/issues/27), [#31](https://github.com/vt-tom/dsa5-helpers/issues/31)).
- Waffen-Favoriten erscheinen auf dem Titelblatt jetzt auch, wenn die Waffe gerade nicht in der Hand ist.
- Auf Touch-Geräten (Tablet, Touch-Laptop im Tabletmodus) bleiben Hover-Effekte wie der Würfel-Zoom nach dem Antippen nicht mehr hängen. Am Desktop sieht der Bogen unverändert aus; die Stildatei wurde dafür neu gegliedert ([#7](https://github.com/vt-tom/dsa5-helpers/issues/7)).
- Kampf › Körper: „Weitere Waffen“ zeigt jetzt alle Waffen des Helden, die gerade nicht in einer Hand sind – bisher fehlten dort die nicht ausgerüsteten, sodass die Liste meist leer blieb. Jede Waffe ist würfelbar und lässt sich über das Schild in die Hand nehmen (Rechtsklick: Hand wählen), wie im Reiter Ausrüstung.
- Kampf › Körper: Eine Nahkampfwaffe in der Hand lässt sich jetzt direkt dort zwischen einhändiger und beidhändiger Führung umschalten („Beidhändig führen“ / „Einhändig führen“). Bei beidhändiger Führung wird die Waffe der Nebenhand abgelegt. Dolche und Fechtwaffen lassen sich wie im System nicht umschalten.

### Behoben

- Nach einer Eingabe in einem Feld (z. B. unter Notizen › Persönliche Daten) bleibt der Fokus jetzt im nächsten Feld, sodass man mit der Tab-Taste durch die Felder wechseln kann – bisher sprang er auf die Reiterleiste.

## [0.4.0] — 2026-10-02

### Neu

- Würfelstatistik: Die Spielleitung kann sie in den Moduleinstellungen einschalten (standardmäßig aus). Jeder Spieler wird dann beim Verbinden gefragt, ob seine Würfe ausgewertet werden dürfen; die Antwort lässt sich jederzeit in den Moduleinstellungen ändern. Gezählt wird nur, wie oft welche Augenzahl je Würfeltyp fällt, getrennt nach digitalen und echten Würfeln – keine einzelnen Würfe. Das Fenster „Würfelstatistik öffnen“ (Moduleinstellungen) zeigt eine Karte mit Balkendiagramm, Durchschnitt, Anteil der 1en und 20en und einer Einschätzung, ob die Verteilung statistisch auffällig ist; die Tabelle mit allen Augenzahlen lässt sich aufklappen. Spieler sehen ihre eigene Statistik, die Spielleitung die aller Spieler. Ausgewertet werden kann alles, ein einzelner Tag oder ein eigener Zeitraum; Tage, die älter als 12 Monate sind, werden zusammengefasst und zählen nur noch zur Gesamtstatistik. Die Spielleitung kann die Statistik einzelner oder aller Spieler löschen. Für Makros: `game.modules.get('dsa5-helpers').api.openDiceStats()` ([#28](https://github.com/vt-tom/dsa5-helpers/issues/28)).

### Geändert

- Die Unterreiter in Kampf, Magie, Religion und Notizen funktionieren jetzt wie bei den Talenten: alle Abschnitte stehen untereinander, ein Klick auf einen Unterreiter springt dorthin, und beim Scrollen wandert die Markierung mit ([#32](https://github.com/vt-tom/dsa5-helpers/issues/32)).

- Kampf › Körper: Die Hände stehen links und rechts neben der Figur (Haupthand links, Nebenhand rechts). Eine beidhändige Waffe steht auf einer Seite und lässt sich im Bearbeiten-Modus per „⇄“ auf die andere Seite verschieben. Ganz oben stehen die Schnellaktionen (Ausweichen, Waffenlos, Sturzschaden) und die Initiative. Die Rüstung steht als Kachelreihe unter der Figur, rechts daneben ein Schild mit Rüstungsschutz und Belastung; beim Darüberfahren schlüsselt es die Werte je Rüstungsteil auf, inklusive Schutz aus Zaubern und Liturgien ([#29](https://github.com/vt-tom/dsa5-helpers/issues/29)).
- Kampf: Der Unterreiter „Übersicht“ entfällt, „Körper“ ersetzt ihn. Statt der Waffentabellen zeigt „Weitere Waffen“ kurz die getragenen Waffen, die gerade nicht in einer Hand sind, sowie Angriffe aus Eigenschaften (z. B. Biss) – jeweils würfelbar. Die Munition wird jetzt direkt an der Fernkampfhand gewählt ([#29](https://github.com/vt-tom/dsa5-helpers/issues/29)).

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

[0.6.1]: https://github.com/vt-tom/dsa5-helpers/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/vt-tom/dsa5-helpers/compare/v0.5.1...v0.6.0
[0.5.1]: https://github.com/vt-tom/dsa5-helpers/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/vt-tom/dsa5-helpers/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/vt-tom/dsa5-helpers/compare/v0.3.3...v0.4.0
[0.3.3]: https://github.com/vt-tom/dsa5-helpers/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/vt-tom/dsa5-helpers/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/vt-tom/dsa5-helpers/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/vt-tom/dsa5-helpers/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/vt-tom/dsa5-helpers/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/vt-tom/dsa5-helpers/releases/tag/v0.1.0
