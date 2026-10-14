# Clickdummy mobil — Heldenbogen & Foundry-Oberfläche (Smartphone/Tablet)

Ziel im Repo: `clickdummy/mobile/` auf Branch `feature/mobile`.
Gehört zu [project/MOBILE.md](../../project/MOBILE.md), Phase 2 („Click-Dummy mobil“).

## Was das ist

Eine **Design-Referenz**, kein Modulcode. Die HTML-Dateien zeigen Aussehen und Verhalten der geplanten Mobilansicht. Bei der Umsetzung wird nichts davon übernommen: Der Bogen wird im bestehenden Modul nachgebaut (Handlebars-Templates, `ActorSheetdsa5Character`, eigene CSS-Datei), so wie es `AGENTS.md` und `MOBILE.md` vorgeben (ein Bogen, Mobil-Layout per Body-Klasse, kein Build-Schritt, Systemlogik erben).

Fidelity: **High-Fidelity** für Layout, Abstände, Farben, Schrift und Bedienung. Die Daten sind Platzhalter, die Würfellogik ist vereinfacht.

## Inhalt

| Datei / Ordner | Zweck |
|---|---|
| `index.html` | Übersicht: alle Varianten nebeneinander in Geräterahmen (3a Foundry-Oberfläche, 2a Dunkel / große Schrift / Leerzustände, 1a Bogen hell auf Smartphone und Tablet). Voll klickbar. |
| `app.html` | Nur die Foundry-Oberfläche, bildschirmfüllend. Zum Testen **auf einem echten Gerät**. Wählt Smartphone/Tablet anhand der Bildschirmgröße, erzwingen mit `app.html?device=phone` bzw. `?device=tablet`. |
| `dsa5-helpers-mobile.tokens.css` | Design-Tokens der Mobilansicht, auf die Token-Namen der Desktop-CSS abgebildet. Startpunkt für `styles/dsa5-helpers-mobile.css`. |
| `screenshots/smartphone/` | 25 Ansichten, 390 × 844 px. |
| `screenshots/tablet/` | 5 Ansichten, 1180 × 820 px (Querformat). |

Öffnen: `index.html` läuft per Doppelklick (alles eingebettet). `app.html` lädt die Talent-, Würfel- und Zaubersymbole direkt aus `systems/dsa5/icons/` (keine Kopien im Repo) und muss deshalb wie der übrige Click-Dummy über `clickdummy/start-server.bat` geöffnet werden: <http://localhost:8877/modules/dsa5-helpers/clickdummy/design_handoff_mobile/app.html>.

## Ablage im Repo

```
git checkout feature/mobile
# Inhalt dieses Ordners nach clickdummy/mobile/ kopieren
git add clickdummy/mobile
git commit -m "Clickdummy mobil: Heldenbogen und Foundry-Oberfläche (Design-Referenz)"
```

Danach laut AGENTS.md: Entscheidungen kurz in `project/MOBILE.md` (Abschnitt 9) bzw. `PROJEKTDOKU.md` nachtragen, offene Punkte in `project/AUFGABEN.md`.

## Entscheidungen aus der Design-Runde

| Thema | Entscheidung | Bezug MOBILE.md |
|---|---|---|
| Navigation im Bogen (Smartphone) | Feste untere Leiste: Titelblatt, Eigenschaften, Talente, Kampf + „Mehr“-Blatt für die übrigen 6 Reiter. Ist ein „Mehr“-Reiter aktiv, ersetzt er das „Mehr“-Symbol (Tippen öffnet trotzdem das Blatt). Kein Wischen zwischen Reitern. | 7.1, E8 |
| Navigation im Bogen (Tablet quer) | Reiter-Rail rechts wie am Desktop, Kopf als feste linke Spalte (292 px). | 7.1, E3 |
| Kopf (Smartphone) | Ausgeklappt: Porträt, Name, Modus-Schalter, Identität, AP, LeP/AsP/KaP, 8 Eigenschaftswürfel. Ab 90 px Scrollweg eingeklappt auf eine 54-px-Zeile (Porträt, Name, Mini-Balken, Schicksalspunkte), bei Scroll < 4 px wieder ausgeklappt. Auf dem Reiter Eigenschaften entfällt die Würfelzeile (auch am Tablet), weil die Werte dort als Kacheln stehen. | 7.1 |
| Bogen verlassen | Zurück-Pfeil links im Kopf (aus- und eingeklappt), am Tablet „‹ Übersicht“ oben in der linken Spalte. | 6 |
| Shell nach dem Verlassen | **Kachel-Übersicht** statt unterer Navigation: Helden, Chat (Vorschau + Ungelesen-Zähler), Journal. Am Tablet ist der Chat als rechte Spalte (400 px) dauerhaft offen. | **weicht von 6 ab** (dort: untere Navigation Held/Chat/Kampf/Journal) |
| Rollen | Spieler **und** SL. Die SL sieht alle Helden mit Spielername und Online-Punkt, alle Journale, kann Einträge freigeben und „Allen Spielern zeigen“. | **weicht von E1/E2 ab** (Vorschlag dort: nur Spieler) |
| Spielfeld | Keine Karte. | E18 |
| Würfelergebnis | Ergebnis im Probe-Blatt, zusätzlich als Würfelkarte im Chat. Kein Toast, kein automatischer Wechsel zum Chat. | E9 (Toast-Vorschlag nicht umgesetzt) |
| Trefferzonen (Status) | Liste der Zonen mit RS und Wunden, keine Körper-Silhouette. | 7.1 „Kampf › Körper“ |
| Gefährten | Liste; Tippen öffnet einen Mini-Bogen als Blatt von unten. | 5.2 |
| Thema / Schrift | Hell/Dunkel und Schrift Normal/Groß, umschaltbar im „Mehr“-Blatt (Smartphone), in der linken Spalte (Tablet) und im Konto-Menü der Shell. | 3.2 Kriterium 9 |

**Nicht im Clickdummy, aber in MOBILE.md 5.1 für v1 vorgesehen:** Initiative/Kampfreihenfolge („Du bist dran“), Chat-Karten-Knöpfe des Systems (Schaden anwenden, Verteidigen), Held wechseln bei mehreren eigenen Akteuren, Langdruck-Ersatz für Kontextmenüs. Diese Punkte als offene Aufgaben übernehmen.

## Ansichten

### Foundry-Oberfläche (Shell)

| Screenshot | Ansicht | Verhalten |
|---|---|---|
| `01-uebersicht` | Übersicht | Kopfleiste 60 px: DSA-Auge, Weltname, Sitzung + verbundene Spieler, Avatar (öffnet Konto-Menü). Darunter Kacheln in `grid auto-fill minmax(300px,1fr)`, Abstand 14 px. Held antippen → Bogen. Chat-Kachel: letzte 3 sichtbare Nachrichten, roter Zähler bei ungelesenen. Journal-Kachel: 3 Einträge, „Neu“-Marke. |
| `02-chat`, `03-chat-wuerfel` | Chat | Nachrichtenkarten (Name, Uhrzeit, Text bzw. Würfelkarte mit Einzelwürfen und Ergebnisfeld grün/rot/neutral). Systemmeldungen als zentrierte Pille. Unten: Ziel-Chips („An alle“, „Flüstern: SL“ bzw. bei der SL je Held), Eingabe (16 px, rund), Würfelknopf, Senden. Würfelknopf klappt Schnellwürfe auf: 1W20, 3W20, 1W6, 2W6. Neue Nachricht → ans Ende scrollen. |
| `21-chat-mit-probe-aus-bogen` | Chat nach Probe | Jede Probe im Bogen erzeugt eine Würfelkarte (Titel, Probe/FW/Modifikator, Würfe, Ergebnis). Schaden erzeugt eine eigene Karte „… · Schaden / TP x“. |
| `04-journal`, `05-journal-eintrag` | Journal | Spieler: nur geteilte Einträge („Geteilt mit dir“). Eintrag: Art, Titel (Andalus 26 px), Bild-Platzhalter 4:3, Text 17 px / 1.5. Öffnen entfernt „Neu“. |
| `22-sl-uebersicht`, `23-sl-journal-eintrag` | SL | Helden der Gruppe mit Spieler und Online-Punkt. Journal in „Für Spieler sichtbar“ / „Nur Spielleitung“. Im Eintrag: Schalter „Für Spieler sichtbar“ und Knopf „Allen Spielern zeigen“ (setzt sichtbar, Systemmeldung im Chat). Geflüstertes an andere sieht nur die SL. |
| `06-konto-menue` | Konto-Menü (Blatt) | Name + Rolle, Darstellung Hell/Dunkel, Rolle (nur im Dummy), „Zur vollständigen Foundry-Oberfläche“ (→ Oberfläche wechseln, MOBILE.md 4.1 Punkt 3), „Abmelden“. |
| `24-dunkel-uebersicht` | Dunkles Thema | |
| `tablet/01`, `tablet/02` | Tablet | Links Helden + Journal (bzw. geöffneter Eintrag), rechts Chat 400 px mit eigener Titelzeile. |

### Heldenbogen

| Screenshot | Reiter | Mobil-Besonderheiten |
|---|---|---|
| `07-bogen-titelblatt` | Titelblatt | Vorschläge als Kacheln (Name, FW, Grund, Probe-Würfel; „angefragt“ mit Akzentkante), Favoriten-Liste, aktive Zustände (Tippen → Status). |
| `08-bogen-probe` | Probe-Blatt | Blatt von unten, max. 460 px breit. Drei Zielwürfel mit Ergebnis-Pille, Modifikator-Stepper (44 px), Ergebnisfeld (QS / FP / Patzer / kritisch), „Neu würfeln“ mit Schicksalspunkt bei Misserfolg, Schaden-Knopf nach gelungenem Angriff, bei Zaubern/Liturgien „x AsP/KaP abziehen“ (halbe Kosten bei Misslingen). Schließen per ✕ oder Tippen auf die Abdunklung. |
| `09-bogen-eigenschaften` | Eigenschaften | 4 × 2 Würfelkacheln (Tippen = Probe; im Bearbeiten-Modus −/+ mit AP-Abzug), Grundwerte mit Steppern, Vor-/Nachteile, SF, Sprachen als Chips. |
| `10-bogen-talente` | Talente | Gruppen als waagerecht scrollbare Chips (+ „Sammelproben“), Suche, Filter „Nur gesteigerte“, Zeilen 52 px mit Symbol, Würfeln, FW und Stern. Bearbeiten: Stern/Würfel weg, StF + Stepper. Leerzustand mit „Filter zurücksetzen“. |
| `11-bogen-kampf` | Kampf | Segmente Waffen / Rüstung / Kampftalente. Schnellaktionen (Initiative, Ausweichen, waffenlos), Waffenkarten mit AT/PA/FK-Knöpfen, TP, RW, Munitionswahl, Nachladen-Zähler. |
| `12-bogen-mehr-menue` | „Mehr“-Blatt | 3 × 2 Reiter-Kacheln, Modus Spiel/Bearbeiten, Darstellung, Schrift. |
| `13-bogen-magie`, `14-bogen-religion` | Magie / Religion | Traditionsbox mit AsP/KaP-Stepper; Segmente Zauber/Rituale/Tricks bzw. Liturgien/Zeremonien/Segnungen mit Anzahl. Tricks/Segnungen: Knopf „Wirken“/„Spenden“, zieht 1 Punkt ab, keine Probe. |
| `15-bogen-ausruestung`, `16-bogen-geld-rechner` | Ausrüstung | Geldbeutel (Tippen → Geld-Rechner: Münze wählen, ±1/±10, Bezahlen mit automatischem Wechseln, Erhalten), Traglast-Balken (KK × 2, Belastungsstufe), Suche + Kategorie-Chips, Behälter zum Auf-/Zuklappen (Am Körper, Gürteltasche, Rucksack, Satteltaschen – zählen nicht), Anlegen/Ablegen, Verbrauchen, Anzahl-Stepper im Bearbeiten-Modus. Ersetzt Drag & Drop (E11). |
| `17-bogen-status` | Status | Kacheln Schmerz / Belastung / Wunden; Zustände mit 4 Stufen (44-px-Felder). Schmerz aus LeP-Verlust und Belastung aus Traglast schraffiert (automatisch, nicht abwählbar). Blutung als Stepper, Status-Chips, Trefferzonen-Liste, aktive Effekte mit ✕, Modifikatoren. |
| `18-bogen-notizen` | Notizen | Abenteuertagebuch mit Schnelleingabe (Enter speichert), Biografie/Notizen (Bearbeiten: Textfelder), persönliche Daten als Raster (Bearbeiten: Eingabefelder). |
| `19-bogen-gefaehrten`, `20-bogen-gefaehrte-detail` | Gefährten | Karten mit LeP-Balken und Loyalität/Diensten. Mini-Bogen: LeP-Stepper, INI/GS/AW/RS, 8 Eigenschaftswürfel, Angriffe + Ausweichen + Loyalitätsprobe; Reittier mit Gangart, gebundener Geist mit „Dienst einfordern“. |
| `25-dunkel-bogen` | Dunkles Thema | |
| `tablet/03–05` | Tablet | Linke Spalte: Zurück, Porträt, Name, LeP/AsP/KaP mit −/+, Schicksalspunkte, Eigenschaftswürfel 4 × 2, unten Darstellung/Schrift/Modus. Inhalt max. 1000 px, Rail 84 px rechts. |

Leerzustände (in `index.html`, Abschnitt 2a rechts): Talente ohne Treffer, leere Behälter, keine Effekte, kein Tagebuch, keine Gefährten (Hinweis auf Hinzufügen am Desktop), Journal ohne geteilte Einträge.

## Bedienregeln (gelten überall)

- Trefferflächen ≥ 44 px, in dichten Zeilen ≥ 40 px. Eingabefelder 16 px Schrift.
- Kein Hover, kein Rechtsklick, kein Doppelklick. Alles, was am Desktop per Rechtsklick geht, hat einen sichtbaren Knopf (−/+, ✕, Nachladen-Zähler).
- Blätter von unten für alles Temporäre: Probe, Mehr, Geld-Rechner, Gefährte, Konto. Griff oben (40 × 4 px), Schließen per ✕ (44 px) oder Tippen daneben. Immer nur ein Blatt.
- Rückmeldungen als kurze Meldung oben (1,8 s), z. B. „Heiltrank verbraucht · noch 1“, „−8 AsP“.
- Reiterwechsel setzt die Scrollposition auf 0 und klappt den Kopf aus.
- Unten Abstand für den Home-Indikator (`env(safe-area-inset-bottom)`, im Dummy fest 22 px).

## Tokens

Siehe `dsa5-helpers-mobile.tokens.css`. Kurzfassung:

- Schrift: Überschriften **Andalus**, Text **GentiumBasic** (wie Desktop). Reiter-Titel 24 px, Panel-Titel 19 px, Daten 16 px, Nebenangaben 13–14 px, Metadaten 12 px (Versalien, Sperrung .08–.1em).
- Radien: 4 px (Karten, Felder, Knöpfe), Pillen voll rund, Blätter oben 14 px.
- Panel-Aufbau wie Desktop: Karte mit 1 px Rahmen `--m-line-strong`, Titelzeile mit Verlauf `--m-title`, Zeilen getrennt durch `--m-line`.
- Dunkles Thema: eigener Satz, über `body.theme-dark`.

## Hinweise für die Umsetzung

- Shell und Bogen sind im Dummy zwei Komponenten. Im Modul entspricht das der Shell aus `scripts/mobile/` und dem bestehenden Bogen mit Mobil-Layout (E10). Der Bogen meldet Proben an die Shell; in Foundry übernimmt das der echte Chat (`ChatMessage`), die Shell zeigt nur `ui.chat`.
- Der Ungelesen-Zähler zählt Nachrichten, die seit dem letzten Öffnen des Chats eingegangen und nicht von einem selbst sind (Hook `renderChatMessage` / `createChatMessage`).
- „Neu“ im Journal = von der SL gezeigt/freigegeben und vom Spieler noch nicht geöffnet.
- Platzhalter: Porträt- und Handout-Bilder, Rüstungswerte je Trefferzone, alle Gefährten-Daten, die SL-Helden außer Layariel (öffnen im Dummy denselben Bogen).
