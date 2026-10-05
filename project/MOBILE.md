# MOBILE.md — Planung „Mobile Support“ (Tablet & Smartphone)

Stand: 2026-10-01 · Status: **Planung, nichts umgesetzt.** Eigene Planungsdatei, weil das Feature groß ist und viele Entscheidungen braucht. Offene Punkte werden in Abschnitt 9 entschieden. Danach kommen die gültigen Ergebnisse kurz in [PROJEKTDOKU.md](PROJEKTDOKU.md), die Arbeitspakete in [AUFGABEN.md](AUFGABEN.md) bzw. als GitHub-Issues. Ist alles umgesetzt, wandert diese Datei nach `archive/`.

---

## 1. Ziel

Spieler können mit Tablet oder Smartphone an einer Foundry-Runde teilnehmen, **ohne Spielfeld (Canvas)**. Statt der Desktop-Oberfläche sehen sie eine auf Touch und kleine Bildschirme zugeschnittene Ansicht. Im Mittelpunkt stehen der eigene Held (unser Bogen), Proben, der Chat und die Initiative.

**Typische Nutzung, für die wir bauen:** Die Gruppe sitzt am Tisch (oder ist im Call), die SL hat Foundry am Laptop/Beamer, die Spieler haben ihr Gerät in der Hand und würfeln, schauen in ihren Bogen und verfolgen den Chat.

**Ausdrücklich kein Ziel (Vorschlag, siehe E1/E2):**
- SL-Bedienung auf dem Handy (Szenen, Token, Kampf steuern, Kompendien pflegen).
- Spielfeld/Karte, Token bewegen, Messen, Schablonen, Licht/Sicht.
- Volle Gleichwertigkeit mit dem Desktop. Mobil ist eine schlanke **Spieler-Ansicht**.

## 2. Ausgangslage (technische Fakten, Foundry v14 / DSA5 8.1.x)

| Thema | Stand | Folge für uns |
|---|---|---|
| Canvas abschalten | Core-Client-Einstellung `core.noCanvas` („Spielfeld deaktivieren“), `scope: client`, `requiresReload: true` (`client/game.mjs`) | Wir müssen kein eigenes Canvas-Abschalten bauen. Wir setzen nur diese Einstellung vor dem Canvas-Aufbau (siehe 2a, kein Neuladen nötig). Foundry und Systeme berücksichtigen sie bereits (`if (game.settings.get("core","noCanvas"))`). |
| Mindestauflösung | `ClientIssues` prüft `1024×768` und zeigt sonst eine **dauerhafte** Fehlermeldung, erneut bei jedem Resize (`client/helpers/client-issues.mjs`) | In Tablet-/Smartphone-Oberfläche unterdrücken: eigene `Notifications`-Klasse über `CONFIG.ui` (siehe 2a). |
| Foundry-Oberfläche | Feste Desktop-Elemente: `#ui-left` (Szenen-Steuerung, Navigation), `#ui-right` (Sidebar mit Chat, Kampf, Akteuren, …), `#hotbar`, `#players`, schwebende ApplicationV2-Fenster | Komplett eigenes Layout per CSS (Body-Klasse) + wenige JS-Eingriffe. Foundry-Elemente nicht ersetzen, sondern umordnen/ausblenden. |
| Unser Bogen | Fest 770×740 px, Rail links, Kopf + Inhalt, viele Hover-Tooltips, Rechtsklick-Aktionen (Griffwahl, Zustand senken, ⋮-Kontextmenü), Drag & Drop aus dem System | Braucht ein eigenes Mobil-Layout (Abschnitt 6). Rechtsklick und Hover gibt es auf Touch nicht. |
| DSA5-System | Keine eigene Mobil-Logik gefunden. Probendialoge, Chat-Karten und Item-Sheets sind fest für Desktop gebaut | Dialoge in der Tablet-/Smartphone-Oberfläche bildschirmfüllend darstellen (Abschnitt 7). Systemlogik bleibt unverändert (Grundsatz „Erben statt neu bauen“). |
| Detached Windows | `foundry.applications.detached` (Fenster auslagern) | Auf Mobil sinnlos. Ausblenden. |

## 2a. Recherche: Was es braucht, um Foundry anzupassen (Quellcode v14 geprüft)

### Startablauf eines Clients (`client/client.mjs`, `client/game.mjs`)

```
Login (/join, Foundry-Seite – Module laufen hier NICHT)
 └─ /game lädt → game.initialize()
     ├─ Hooks "init"                      ← unser Einstieg: Einstellungen registrieren, setupGame umhüllen
     ├─ registerSettings()                   (core.noCanvas u. a.)
     ├─ i18n.initialize()                 ← Übersetzungen verfügbar
     ├─ _initializeView() → setupGame()   ← HIER warten wir auf die UI-Auswahl
     │   ├─ initializeConfig/Packs/Documents
     │   ├─ Hooks "setup"
     │   ├─ playlists.initialize(), initializeRTC()
     │   ├─ initializeMouse/Gamepads/Keyboard()
     │   ├─ initializeCanvas()            ← liest core.noCanvas (Canvas#initialize: return, wenn true)
     │   ├─ initializeUI()                ← instanziert alle Klassen aus CONFIG.ui, rendert nav/sidebar/players/hotbar/webrtc/pause/controls
     │   ├─ Spieler ohne Charakter → Benutzer-Konfiguration öffnet sich (Charakterwahl)
     │   └─ Hooks "ready"
     └─ issues._detectUsabilityIssues()   ← Auflösungsprüfung (siehe unten)
```

### Eingriffspunkte

| Was | Wie | Bewertung |
|---|---|---|
| **Auswahl vor dem Aufbau** | `game.setupGame` im `init`-Hook umhüllen (`await` Overlay → Original) | Kern der Idee. Kein Neuladen. Abhängig von Foundry-Interna (Methodenname, Reihenfolge) → bei jedem Foundry-Update prüfen |
| **Canvas aus** | Client-Einstellung `core.noCanvas` vor `initializeCanvas` setzen | Offizieller Schalter. Szenen-/Token-Verzeichnisse blenden sich dann selbst aus (`placeable-directory.mjs`, `scene-directory.mjs`), Szenen werden nicht gezeichnet |
| **Foundry-Oberfläche** | `CONFIG.ui` ist eine offizielle Austauschstelle: `menu, sidebar, pause, nav, notifications, actors, cards, chat, combat, compendium, controls, hotbar, items, journal, macros, placeables, players, playlists, scenes, settings, tables, webrtc`. Eigene Unterklassen vor `initializeUI()` eintragen | Sauberster Weg für echte Umbauten (z. B. vereinfachter Combat-Tracker, Chat ohne Sidebar-Rahmen). Für reines Aus-/Umblenden genügt CSS über die Body-Klasse |
| **Hilfsklassen** | `CONFIG.ux` (`ContextMenu`, `TooltipManager`, `DragDrop`, `Draggable`, `FilePicker`, `TextEditor`, …) | Hier ließen sich Touch-Varianten einhängen: Kontextmenü per Langdruck, Tooltip per Antippen. Weder `ContextMenu` noch `TooltipManager` kennt in v14 Touch/Langdruck |
| **Auflösungs-Warnung** | `ClientIssues#validateResolution` (privat) prüft 1024×768 Viewport und zeigt `ERROR.RESOLUTION.Screen/Scale/Window` als **dauerhafte** Fehlermeldung. Beim Start greift sie noch nicht (`ui.notifications` gibt es da noch nicht), aber **bei jedem Resize** (Drehen, Bildschirmtastatur!) | Eigene `Notifications`-Unterklasse über `CONFIG.ui.notifications`, die Meldungen mit Schlüssel `ERROR.RESOLUTION.*` im Tablet-/Smartphone-Modus verwirft |
| **Viewport-Meta** | Foundry setzt bereits `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no` (`templates/views/layouts/main.hbs`) | Passt. Nur `viewport-fit=cover` für Notch/Home-Indikator ergänzen (per JS am `<meta>`) |
| **Fenster** | Alle ApplicationV2-Fenster lassen sich per Hook `renderApplicationV2` markieren und per CSS vollflächig legen. Unser Bogen wählt `position` je Modus | Probendialoge des Systems werden so zu Vollbild-Blättern |
| **Charakterwahl** | Spieler ohne zugewiesenen Charakter bekommen beim Start automatisch die Benutzer-Konfiguration | Mobil gleich nutzen („Welchen Helden spielst du?“) oder durch eigene Auswahl ersetzen |
| **Vorbild in Foundry selbst** | Foundry hat eine eigene **„stream“-Ansicht** (`game.view === "stream"`, `/stream`), die nur den Chat zeigt | Zeigt, dass Foundry ohne Canvas/UI sauber läuft. Code von `#initializeStreamView` als Referenz lesen |
| **Login-Seite** | `/join` ist eine Foundry-Seite, Module werden dort nicht geladen | Nicht anpassbar. Login bleibt wie er ist (ist auf dem Handy aber bedienbar) |

### Bekannte Touch-Fallen (allgemeines Browserwissen, live prüfen)

- **iOS Safari löst bei Langdruck kein `contextmenu` aus** (Android Chrome schon). Alle Foundry-/DSA5-Kontextmenüs (⋮, Rechtsklick-Aktionen) sind auf dem iPhone ohne Ersatz unerreichbar → eigener Langdruck-Handler (`pointerdown` + Timer) oder sichtbare Knöpfe.
- `:hover` „klebt“ nach dem Antippen. Hover-Effekte nur in `@media (hover: hover)`.
- HTML5-Drag-&-Drop (`dragstart`) funktioniert auf Touch nur eingeschränkt (iOS ab 15 teilweise) → Foundrys `DragDrop` mobil nicht voraussetzen.
- Doppeltippen zoomt nicht (wegen `user-scalable=no`), Doppelklick-Aktionen sind aber trotzdem schwer auszulösen.
- Bildschirmtastatur löst `resize` aus (siehe Auflösungs-Warnung) und verkleinert `visualViewport`.

### Folgen für den Aufwand (grob)

- **Klein:** Einstellung, Auswahl-Overlay, `noCanvas`, Body-Klasse, Warnung unterdrücken → Phase 1 (Spike).
- **Mittel:** Shell (untere Navigation, Chat/Kampf vollflächig) per CSS + wenig JS; Fenster als Vollbild-Blätter.
- **Groß:** Bogen-Mobil-Layout (10 Reiter), Touch-Ersatz für Kontextmenüs/Tooltips, Systemdialoge/Chat-Karten durchtesten.

## 3. Zielgeräte & Kriterien

### 3.1 Geräteklassen (Vorschlag, siehe E3)

Die Erkennung bestimmt nur die **Vorauswahl** in der Abfrage nach dem Login (4.1). Entscheiden tut der Nutzer. „Tablet-“ und „Smartphone-Oberfläche“ sind zwei Ausprägungen derselben Shell (gleiche Funktionen, anderes Layout).

| Klasse | Erkennung (Vorschlag) | Ziel |
|---|---|---|
| **Smartphone hoch** | kurze Seite < 600 px | Hauptziel: eine Spalte, untere Navigationsleiste |
| **Smartphone quer** | Höhe < 500 px | Muss funktionieren, darf eng sein (Inhalt scrollt, Kopf eingeklappt) |
| **Tablet hoch/quer** | 600–1023 px kurze Seite bzw. Breite < 1024 | Zwei Bereiche nebeneinander möglich (z. B. Bogen + Chat) |
| **Tablet groß / Desktop mit Touch** | ≥ 1024×768 | Vorauswahl „Foundry-Oberfläche“, Nutzer kann trotzdem „Tablet“ wählen |

### 3.2 Messbare Kriterien („fertig“, wenn …)

1. **Kein horizontales Scrollen** der Seite ab 360 px Breite (kleinstes gängiges Android), Hoch- und Querformat.
2. **Trefferflächen ≥ 44×44 px** für alle Aktionen (Apple HIG / WCAG 2.5.5). Der Desktop nutzt 24–28 px, mobil wird das per Medienabfrage erhöht.
3. **Jede Funktion ohne Hover und ohne Rechtsklick erreichbar** (Tooltips per Antippen/Info-Knopf, Rechtsklick-Aktionen per Langdruck **und** sichtbarem Ersatz).
4. **Schrift ≥ 16 px** in Eingabefeldern, sonst zoomt iOS Safari beim Fokus hinein. Fließtext ≥ 15 px.
5. **Ladezeit:** Bei `noCanvas` lädt Foundry keine Szenen-Texturen. Ziel: Welt bedienbar in < 10 s auf einem Mittelklasse-Handy im WLAN (live messen).
6. **Bildschirmtastatur** verdeckt kein aktives Eingabefeld (Chat-Eingabe, Werte), `visualViewport` beachten.
7. **Sichere Bereiche** (Notch, Home-Indikator): `env(safe-area-inset-*)`, `viewport-fit=cover`.
8. **Ausrichtung wechseln** (hoch ↔ quer) ohne Neuladen und ohne Verlust von Reiter/Scrollposition.
9. **Dunkles/helles Thema** wie am Desktop (Foundry-Thema + unser Bogen).
10. **Browser:** Safari iOS/iPadOS (aktuelle + vorige Hauptversion), Chrome Android, Samsung Internet (Vorschlag, siehe E4). Firefox Android „best effort“.

## 4. Aktivierung: „Hybrides Spiel“ + Auswahl nach dem Login (Idee des Nutzers, 2026-10-01)

### 4.1 Ablauf

1. **Welt-Einstellung** in den DSA5-Helpers-Einstellungen: **„Hybrides Spiel“ ja/nein** (`dsa5-helpers.hybridPlay`, `scope: world`, nur SL, Standard **nein**). Bei „nein“ ändert sich nichts, Foundry startet wie bisher. Kein Code der Mobilansicht läuft.
2. Bei „ja“ erscheint **nach dem Login, bevor Oberfläche und Spielfeld aufgebaut werden**, eine Auswahl mit drei großen Kacheln:
   - **Foundry-Oberfläche** (normal, mit Spielfeld)
   - **Tablet-Oberfläche** (ohne Spielfeld)
   - **Smartphone-Oberfläche** (ohne Spielfeld)
   
   Die zur Bildschirmgröße passende Kachel ist vorausgewählt (Erkennung siehe 3.1, `matchMedia('(pointer: coarse)')` + Viewport). Darunter: **„Auf diesem Gerät merken“** (siehe E16).
3. Die Wahl gilt **pro Gerät/Browser** (Client-Speicher). Ändern ist jederzeit möglich: in der Mobilansicht über das Menü, am Desktop über die Moduleinstellungen („Oberfläche wählen“). Danach wird neu geladen.
4. **Notausgang:** URL-Parameter `?dsa5h-ui=foundry` (bzw. `tablet`/`phone`/`ask`) überschreibt die gemerkte Wahl, falls eine Ansicht kaputt ist.
5. **SL-Konto:** Vorschlag: keine Auswahl, immer Foundry-Oberfläche (siehe E2).

### 4.2 Technische Umsetzung (Recherche-Ergebnis, Abschnitt 2a)

- Im `init`-Hook wird `game.setupGame` **an der Instanz** umhüllt: Erst wird auf die Auswahl gewartet, dann läuft der Original-Aufbau. Möglich ist das, weil `Game#_initializeView` `await this.setupGame()` ruft, also die Instanzmethode, und erst **nach** dem `init`-Hook. Ohne libWrapper geht es, mit libWrapper wäre es sauberer (siehe E17).
- Zu diesem Zeitpunkt sind Einstellungen und Übersetzungen fertig (`registerSettings`, `i18n.initialize`), aber **noch keine** `ui.*`-Anwendungen und kein Canvas. Die Auswahl ist deshalb ein **schlichtes eigenes HTML-Overlay** (kein ApplicationV2/DialogV2, das hängt an `ui.*`).
- Nach der Wahl, noch vor `setupGame`:
  - Tablet/Smartphone: Client-Wert `core.noCanvas` auf `true` setzen. `Canvas#initialize()` liest ihn erst in `setupGame` → **kein Neuladen nötig**. Den ursprünglichen Wert merken und beim Wechsel zurück zu „Foundry“ wiederherstellen (eine bewusste Nutzerwahl nicht überschreiben).
  - Body-Klasse `dsa5h-ui-tablet` / `dsa5h-ui-phone` setzen.
  - Eigene UI-Klassen in `CONFIG.ui` eintragen (z. B. eigene `Notifications`, angepasste `Sidebar`/`ChatLog`), bevor `initializeUI()` sie instanziert.
- Bei „Foundry“: nichts davon, `noCanvas` ggf. zurücksetzen.

## 5. Funktionsumfang mobil

### 5.1 Verfügbar (Kern, v1)

| Bereich | Umsetzung |
|---|---|
| **Eigener Held** (unser Bogen) | Vollbild, alle Reiter, Spiel- und Bearbeiten-Modus. Mehrere eigene Akteure: Auswahl über das Menü |
| **Proben & Schaden** | Systemdialoge (Talent, Kampf, Zauber, Liturgie), bildschirmfüllend |
| **Chat** | Lesen, schreiben, würfeln (`/r`), Chat-Karten-Knöpfe (Schaden, Ausweichen, Verteidigen, Ergebnis anwenden), Flüstern |
| **Initiative/Kampf** | Kampfreihenfolge **lesen**, „Du bist dran“ hervorgehoben, eigene Initiative würfeln, eigenen Zug beenden (falls die SL das erlaubt) |
| **Zustände & Ressourcen** | LeP/AsP/KaP, Zustände, Schicksalspunkte (schon im Bogen) |
| **Journale** | Von der SL geteilte/gezeigte Journale und Bilder („Show to players“) lesen |
| **Benachrichtigungen** | Foundry-Notifications, an die Mobilansicht angepasst |

### 5.2 Eingeschränkt / später (Vorschlag v2+)

| Bereich | Einschränkung |
|---|---|
| Item-Sheets (Waffe, Zauber, …) des Systems | v1: nur lesen + bildschirmfüllend. Bearbeiten „best effort“, keine eigene Optimierung |
| Kompendien | v1 nicht, v2 evtl. nur lesen/durchsuchen |
| Gefährten-Reiter | Systemvorlage eingebunden → nur per CSS anpassbar, evtl. vereinfacht |
| Steigerungsplaner (Lyynix) | Fremdes Template, nur CSS. Prüfen, ob mobil sinnvoll |
| Heldenerschaffung (`dsa5-core`) | Nicht mobil, Hinweis „am Desktop“ |
| Würfel-3D (Dice So Nice) | Läuft eigenständig ohne Canvas. Prüfen: Leistung/Akku, ggf. Empfehlung „aus“ |
| Playlists/Audio | Hört der Spieler mit? Mobile Browser blockieren Autoplay → Entscheidung E7 |

### 5.3 Nicht verfügbar (bewusst)

- Spielfeld/Szenen, Token, Bewegung, Messen, Schablonen, Licht, Nebel, Zeichnungen, Notizen-Pins.
- Szenen-Navigation, Szenen-Steuerung (linke Werkzeugleiste).
- Makro-Leiste (Hotbar) — **oder** als einfache Liste, siehe E6.
- Drag & Drop von Items zwischen Akteuren/Kompendien (ersetzt nur, wo nötig, siehe 6.4).
- Akteur-/Item-/Szenen-Verzeichnisse der Sidebar (außer eigene Akteure).
- Einstellungen außer: Oberfläche wählen, Sprache, Thema, Abmelden.
- Fenster auslagern (detached windows), Fenster verschieben/skalieren/minimieren.
- SL-Werkzeuge (siehe E2).

## 6. Foundry-Oberfläche mobil (Vorschlag „App-Shell“, siehe E8)

**Prinzip:** Foundrys DOM bleibt erhalten, wir ordnen es nur um. Body-Klasse `dsa5h-mobile` + eigene Stylesheet-Datei, wenig JS. Keine Parallel-Oberfläche, die Foundry-Updates nachbauen müsste.

```
┌───────────────────────────┐
│ Kopf: Heldname · LeP · ⋮  │  ← schmal, eigene Leiste (Menü: Held wechseln, Desktop, Einstellungen, Abmelden)
├───────────────────────────┤
│                           │
│   aktiver Bereich         │  ← genau EIN Bereich im Vollbild
│   (Held | Chat | Kampf |  │
│    Journal)               │
│                           │
├───────────────────────────┤
│ 🧙 Held  💬 Chat  ⚔ Kampf  📖 │  ← untere Navigation, Badge bei neuen Chat-Nachrichten / „Du bist dran“
└───────────────────────────┘
```

- **Held** = unser Bogen als „eingebettetes“ Vollbildfenster (ApplicationV2 bleibt, Position/Größe per CSS fixiert, kein Rahmen-SVG, keine Titelleiste-Plakette).
- **Chat** = Foundrys Chat-Log aus der Sidebar, vollflächig. Eingabe unten über der Navigation, Tastatur-sicher.
- **Kampf** = Foundrys Combat-Tracker aus der Sidebar, vereinfacht (nur Liste, eigene Aktionen).
- **Journal** = zuletzt gezeigte/geteilte Einträge.
- **Tablet quer:** zwei Spalten (Held links, Chat rechts), Navigation nur für den linken Bereich (siehe E3).
- **Alle anderen ApplicationV2-Fenster** (Probendialoge, Item-Sheets, Bestätigungen): bildschirmfüllendes „Blatt“ von unten mit Schließen-Knopf oben, eins zur Zeit (Stapel). Gemeinsames CSS für `.application` in der Tablet-/Smartphone-Oberfläche.
- **Ausgeblendet:** `#ui-left` (Steuerung, Navigation), `#hotbar`, `#players` (evtl. als Liste im Menü), Sidebar-Reiter außer Chat/Kampf.
- **Würfeln „hinter“ dem Dialog:** Nach einer Probe kurz zum Chat wechseln oder Ergebnis als Toast zeigen (siehe E9).

## 7. Heldenbogen mobil

Grundlage bleibt derselbe Bogen (dieselbe Klasse, dieselben Templates). Mobil ist **ein zweites Layout per CSS-Medienabfrage + Body-Klasse**, kein zweiter Bogen (siehe E10). Wo CSS nicht reicht, kleine Template-Schalter (`{{#if mobile}}`).

### 7.1 Layout
- **Rail → horizontale Reiterleiste** oben unter dem Kopf (wischbar) **oder** Teil der unteren Navigation (Unter-Navigation). Unter-Reiter (Talente, Kampf, …) als zweite, schmale Wisch-Leiste.
- **Kopf einklappbar:** Porträt + Name + LeP/AsP/KaP-Karten kompakt in einer Zeile. Eigenschaftswürfel als 8er-Leiste (2×4 auf Smartphone hoch). Beim Scrollen schrumpft der Kopf.
- **Tabellen → Karten/Zeilen:** Waffen-, Talent- und Kampftechnik-Tabellen bekommen auf schmalen Bildschirmen ein Zeilenlayout mit Name oben und Werten/Würfeln darunter. Spalten-Raster (Grid) per Medienabfrage umstellen.
- **Zweispaltige Bereiche** (Notizen, Status `.dsa5h-two-col`, Grundwerte, Geld/Gewicht, Kampf › Körper) → einspaltig.
- **Kampf › Körper:** Figur ausblenden oder klein oben, Rüstung + Hände untereinander.
- **Favoriten-Raster:** auto-fill ≥ 300 px passt bereits, Mindestbreite auf ~280 px senken.
- **Titelblatt:** einspaltig, Porträt oben.

### 7.2 Bedienung ohne Maus
| Desktop | Mobil |
|---|---|
| Hover-Tooltip (`data-tooltip`, Formeln, Namen) | Antippen eines Info-Symbols bzw. Langdruck → Foundry-Tooltip am Finger. Prüfen, wie sich `TooltipManager` bei Touch verhält |
| Rechtsklick: Griffwahl, Zustand senken, Nachladen zurücksetzen | Sichtbare Knöpfe gibt es meist schon (−/+, ↺). Griffwahl: Langdruck **und** Auswahl im ⋮-Menü |
| ⋮-Kontextmenü (`.withContext`) | Foundry-`ContextMenu` als Aktionsblatt (Bottom Sheet) von unten |
| Shift-Klick (Steigerungsplaner) | Entfällt mobil oder eigener Schalter |
| Drag & Drop (Favoriten, Items in Behälter) | v1: Behälter-Zuordnung über Auswahl im Item, kein Ziehen (siehe E11) |
| Doppelklick (Titelleiste, Item öffnen) | Einfaches Antippen |

### 7.3 Was wir schon haben und weiter nutzen
- Bedienung per Tastatur/Button-Labels aus dem UI/UX-Review (jede Würfelaktion ist ein Button) → gute Basis für Touch.
- Trefferflächen über Pseudo-Elemente → mobil per Variable größer stellen statt neu bauen.
- Schrift-Tokens (`--fs-data` usw.) → mobil zentral anpassen.

## 8. Technische Architektur (Vorschlag)

- **Dateien:**
  - `scripts/mobile/mobile.js` — Einstellungen (`hybridPlay`, gemerkte Oberfläche), Umhüllen von `game.setupGame`, Auswahl-Overlay, `noCanvas`-Umschaltung, Body-Klasse, `CONFIG.ui`-Einträge, App-Shell (Kopf, untere Navigation), Umhängen von Chat/Kampf.
  - `scripts/mobile/ui/*.js` — Unterklassen für `CONFIG.ui`/`CONFIG.ux` (Notifications ohne Auflösungs-Warnung, ggf. Combat-Tracker, Touch-ContextMenu).
  - `styles/dsa5-helpers-mobile.css` — Foundry-Shell + Fenster als Vollbild + Bogen-Mobil-Layout. Eigene Datei, damit die Desktop-CSS (Issue #7 „CSS aufräumen“) nicht noch größer wird. **#7 kommt vorher** (entschieden, siehe E12).
  - `templates/mobile/*.hbs` — nur für Kopf/Navigation der Shell.
- **Kein Build-Schritt, kein Framework** (Grundsatz bleibt).
- **Hooks:** `init` (Einstellungen registrieren, `setupGame` umhüllen), `ready` (Shell aufbauen, eigenen Akteur öffnen), `renderApplicationV2` (Fenster als Vollbild markieren), `renderChatMessage` / `updateCombat` (Badges).
- **Viewport-Meta:** Foundry setzt schon `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`. Nur `viewport-fit=cover` ergänzen.
- **Unser Bogen:** `position` in der Tablet-/Smartphone-Oberfläche nicht 770×740, sondern Vollbild. Die Option `DEFAULT_OPTIONS.position` per Modus wählen, Verschieben/Skalieren abschalten.
- **Kompatibilität:** Eigenes Modul vs. Teil von dsa5-helpers → E13. Bestehende Foundry-Mobil-Module (Community) **vor Start recherchieren**: Konflikte, Ideen, ggf. Zusammenarbeit statt Doppelarbeit.

## 9. Offene Entscheidungen (gebündelt für den Nutzer)

| Nr. | Frage | Vorschlag |
|---|---|---|
| **E1** | Wer ist Zielgruppe mobil? | Nur Spieler |
| **E2** | SL auf Mobilgerät? | Keine SL-Mobilansicht. SL bekommt Hinweis + Desktop-Oberfläche |
| **E3** | Smartphone, Tablet oder beides — und was zuerst? | Smartphone hoch zuerst (schwierigster Fall), Tablet profitiert mit. Tablet-Zweispalter in Phase 3 |
| **E4** | Welche Browser offiziell? | Safari iOS/iPadOS + Chrome Android, je aktuelle + vorige Hauptversion |
| **E5** | Aktivierung | **Entschieden (Nutzer, 2026-10-01):** Welt-Einstellung „Hybrides Spiel“ + Auswahl Foundry/Tablet/Smartphone nach dem Login (Abschnitt 4). Offen nur noch Details: Standard der Einstellung (Vorschlag „nein“), Vorauswahl per Erkennung (Vorschlag ja) |
| **E6** | Makros mobil? | v1 nein. v2: einfache Liste der eigenen Hotbar-Makros im Menü |
| **E7** | Audio/Playlists mobil? | Standard aus, Schalter „Musik hören“ (Autoplay-Sperre braucht ohnehin eine Berührung) |
| **E8** | Oberfläche: App-Shell mit unterer Navigation (Abschnitt 6) oder nur „Bogen im Vollbild, Rest wie Foundry“? | App-Shell. Als Varianten im Click-Dummy vergleichen |
| **E9** | Wo sieht man das Würfelergebnis? | Toast mit Ergebnis + „Im Chat ansehen“, kein automatischer Reiterwechsel |
| **E10** | Ein Bogen mit Mobil-Layout oder eigener Mobilbogen? | Ein Bogen, Mobil-Layout per CSS/Body-Klasse (eine Wahrheit, keine doppelte Pflege) |
| **E11** | Drag & Drop mobil ersetzen? | v1 nur, wo es zwingend ist (Behälter), über Auswahl. Rest nicht |
| **E12** | Erst CSS aufräumen (Issue #7)? | **Entschieden (Nutzer, 2026-10-05):** Ja, vorher, in 0.5.0 (`release/0.5.0`). #7 liefert schon: eine fest gegliederte Desktop-CSS-Datei, zentrale Variablen für Trefferflächen und Schriftgrößen (mobil nur umstellen) und alle `:hover`-Regeln in `@media (hover: hover)`. Das Mobil-CSS kommt danach als eigene Datei (Abschnitt 8) |
| **E13** | Teil von `dsa5-helpers` oder eigenes Modul (z. B. `dsa5-mobile`)? | Teil von dsa5-helpers (braucht ohnehin unseren Bogen). Shell-Code aber in `scripts/mobile/` getrennt halten, damit eine spätere Auslagerung möglich bleibt |
| **E14** | Click-Dummy mobil? | Ja: Click-Dummy um eine Mobil-Ansicht erweitern (Shell + Bogen, Gerätegrößen per Umschalter), Design dort iterieren wie bisher |
| **E15** | Versionsplanung | Eigener Meilenstein `0.5.0` (o. ä.) mit Issues je Phase |
| **E16** | Auswahl jedes Mal oder gemerkt? | Gemerkt pro Gerät, wenn „Auf diesem Gerät merken“ angehakt ist (Standard an). Sonst bei jedem Start fragen. Ändern über Menü/Einstellungen, Notausgang per URL |
| **E17** | `setupGame` selbst umhüllen oder über libWrapper (dann Pflicht-Abhängigkeit bei „Hybrides Spiel“)? | Selbst, an der Instanz, mit Prüfung, ob die Methode noch existiert (sonst Warnung + normale Foundry-Oberfläche). libWrapper nicht zur Pflicht machen |
| **E18** | Soll die Tablet-Oberfläche das Spielfeld optional behalten dürfen (große Tablets, Karte anschauen)? | v1 nein (wie vom Nutzer vorgegeben: Canvas aus). Später evtl. „Tablet mit Karte (nur ansehen)“ |
| **E19** | Darf die SL „Hybrides Spiel“ pro Spieler steuern (z. B. Oberfläche vorgeben)? | v1 nein, jeder wählt selbst |

## 10. Vorgehen in Phasen (Vorschlag)

0. **Entscheidungen** E1–E19 klären. Community-Module recherchieren. Issue #7 (CSS) erledigen.
1. **Machbarkeit (Spike, Foundry live):** Einstellung „Hybrides Spiel“ + Auswahl-Overlay vor `setupGame` + `noCanvas` + Body-Klasse + Auflösungs-Warnung weg. Ein Smartphone verbindet sich, wählt „Smartphone“, sieht Chat und kann würfeln. Ergebnis: Liste der Stolpersteine (iOS-Tastatur, Tooltips, ContextMenu, Systemdialoge).
2. **Click-Dummy mobil:** App-Shell + Bogen-Layout Smartphone hoch, 2–3 Varianten für Navigation/Kopf (E8), Entscheidung, Umschalter löschen.
3. **Shell in Foundry:** Kopf, untere Navigation, Chat/Kampf-Bereiche, Fenster als Vollbild-Blätter, Menü (Held wechseln, Desktop, Abmelden).
4. **Bogen mobil:** Reiter für Reiter (Titelblatt, Eigenschaften, Talente, Kampf, Magie, Religion, Ausrüstung, Status, Notizen, Gefährten), Touch-Ersatz für Hover/Rechtsklick.
5. **Systemdialoge & Chat-Karten:** Proben-, Schadens- und Verteidigungsdialoge, Chat-Karten-Knöpfe, Item-Sheets lesbar.
6. **Tablet:** Zweispalten-Layout quer, Feinschliff.
7. **Test mit echten Geräten in einer Runde** (Tester-Feedback), danach Release.

## 11. Testen

- **Click-Dummy:** Chrome DevTools Geräteemulation + headless-Chrome-Screenshots (CDP) in festen Größen: 360×780, 390×844, 430×932, 844×390 (quer), 768×1024, 1024×768.
- **Test-Harness** (`tests/sheet.test.cjs`): Templates mit `mobile=true` kompilieren, statisch prüfen (keine fehlenden Aktionen im Mobil-Layout).
- **Live:** Echte Geräte, mindestens ein iPhone (Safari) und ein Android-Handy (Chrome). Remote-Debugging (Safari Web Inspector / `chrome://inspect`). Foundry ist von außen erreichbar (LAN-IP bzw. Weiterleitung) — Einrichtung beim Nutzer, hier läuft kein Foundry.
- **Checkliste je Phase:** die Kriterien aus 3.2.

## 12. Risiken

| Risiko | Gegenmaßnahme |
|---|---|
| Foundry-Updates ändern den Startablauf (`setupGame`, Reihenfolge Canvas/UI) → Auswahl greift zu spät | Beim Umhüllen prüfen. Fällt auf normale Oberfläche zurück. In den Test-Harness: Prüfung gegen `foundry-nodejs-v14`, dass `setupGame` existiert und `initializeCanvas`/`initializeUI` darin aufruft |
| Foundry-Updates ändern Sidebar/DOM → Shell bricht | Nur umordnen, nicht ersetzen. Selektoren zentral in `mobile.js`. Bei jedem Foundry-Update prüfen (wie bei DSA5-Updates) |
| DSA5-Systemdialoge/Chat-Karten sind für Desktop gebaut | Nur CSS-Anpassung. Wo etwas unbedienbar bleibt: als bekannte Einschränkung dokumentieren bzw. beim System melden |
| iOS Safari: Tastatur, `100vh`, Autoplay, Zoom bei Fokus | `dvh`/`visualViewport`, 16-px-Eingaben, Audio nur nach Geste |
| Leistung/Akku (Foundry ohne Canvas lädt trotzdem viele Daten, Dice So Nice) | Live messen. Empfehlung für schwere Module dokumentieren |
| Großer Aufwand, bremst den Bogen | Eigener Meilenstein, Phasen einzeln freigeben. Desktop bleibt unberührt (alles hinter `dsa5h-mobile`) |
| Andere Module (z. B. Steigerungsplaner) brechen mobil | Nur geprüfte Module offiziell, Rest „best effort“ |
