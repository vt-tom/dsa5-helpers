# MOBILE.md — Planung „Mobile Support“ (Tablet & Smartphone)

Stand: 2026-10-15 · Status: **Stufe 1 + 2 gebaut, in einer Testinstanz live geprüft** (Foundry 14.369, DSA5 8.1.10, headless Chrome mit Touch-Emulation; Smartphone 390×844, Tablet 820×1180, Desktop unverändert). Code: `scripts/mobile/`, `styles/dsa5-helpers-mobile.css`. Noch offen: Test auf echten Geräten (iOS Safari, Android Chrome) und die Punkte in 13.10.

---

## 1. Ziel

Spieler können mit Tablet oder Smartphone an einer Foundry-Runde teilnehmen, **mit Szene** (verschieben, zoomen, pingen, eigenen Token ziehen; pro Gerät abschaltbar, seit der Rückmeldung von Lyynix vom 2026-10-14, siehe Abschnitt 13). Statt der Desktop-Oberfläche sehen sie eine auf Touch und kleine Bildschirme zugeschnittene Ansicht. Im Mittelpunkt stehen der eigene Held (unser Bogen), Proben, der Chat und die Initiative.

**Typische Nutzung, für die wir bauen:** Die Gruppe sitzt am Tisch (oder ist im Call), die SL hat Foundry am Laptop/Beamer, die Spieler haben ihr Gerät in der Hand und würfeln, schauen in ihren Bogen und verfolgen den Chat.

**Ausdrücklich kein Ziel (Vorschlag, siehe E1/E2):**
- Volle SL-Bedienung auf dem Handy (Szenen wechseln, Kampf steuern, Kompendien pflegen). Eine schlanke SL-Ansicht gibt es (Helden, Journal freigeben, Proben anfordern, Token ziehen), siehe E2.
- Spielfeld-Werkzeuge: Messen, Schablonen, Licht/Sicht, Wände, Zeichnungen.
- Volle Gleichwertigkeit mit dem Desktop. Mobil ist eine schlanke Ansicht für den Spieltisch.

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

> **Überholt durch die Rückmeldung von Lyynix (2026-10-14):** Es gibt keine Kachel-Abfrage mehr. Die Oberfläche wird automatisch nach Bildschirmbreite gewählt und lässt sich im Konto-Menü überschreiben. Neuer Ablauf: Abschnitt 13.2. Die Recherche in 4.2 bleibt gültig.

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

> **Überholt:** Die Startseite ist jetzt „Szene oben, Held darunter, Journal und Chat als schwebende Knöpfe“ (Rückmeldung Lyynix, Click-Dummy Runde 4). Neuer Aufbau: Abschnitt 13.1 und 13.3.

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
| **E2** | SL auf Mobilgerät? | **Geändert (Rückmeldung Lyynix, im Click-Dummy umgesetzt):** schlanke SL-Ansicht mit Helden der Gruppe, Journal freigeben/zeigen, Token ziehen und **„Probe anfordern“** über den `RollRequestService` des Systems. Szenen wechseln, Kampf steuern usw. bleiben am Desktop |
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
| **E16** | Auswahl jedes Mal oder gemerkt? | **Geändert (Rückmeldung Lyynix):** keine Abfrage. Automatisch nach Bildschirmbreite und Zeigegerät, im Konto-Menü überschreibbar (Automatisch/Smartphone/Tablet/Foundry), gemerkt pro Gerät. Notausgang per URL bleibt (Abschnitt 13.2) |
| **E17** | `setupGame` selbst umhüllen oder über libWrapper (dann Pflicht-Abhängigkeit bei „Hybrides Spiel“)? | **Voraussichtlich hinfällig:** Ohne Abfrage fällt die Entscheidung sofort im `init`-Hook. `core.noCanvas` wird nur noch bei „Spielfeld aus“ gebraucht und lässt sich im `setup`-Hook setzen, der vor `initializeCanvas` läuft. Im Spike prüfen, sonst gilt der Vorschlag wie bisher |
| **E18** | Soll die Tablet-Oberfläche das Spielfeld optional behalten dürfen (große Tablets, Karte anschauen)? | **Geändert (Rückmeldung Lyynix):** Szene an, auf Tablet **und** Smartphone (im Click-Dummy beides). Bedienung: wischen, zwei Finger zoomen, lange drücken pingt, eigenen Token lange drücken und ziehen. Pro Gerät abschaltbar („Spielfeld aus“ = `core.noCanvas`). Standard auf dem Smartphone: E21 |
| **E19** | Darf die SL „Hybrides Spiel“ pro Spieler steuern (z. B. Oberfläche vorgeben)? | v1 nein, jeder wählt selbst |
| **E20** | Schips im Chat: eigener Dialog oder das Kontextmenü des Systems? | Kontextmenü des Systems per Langdruck oder Aktionen-Knopf an der Karte als Blatt von unten öffnen. Es enthält „Schip verwenden“ (`UnifiedFateDSA5`), „Schaden anwenden“ usw. Der Schip-Dialog des Systems erscheint dann bildschirmfüllend (Abschnitt 13.4). Kein eigener Nachbau |
| **E21** | Szene auf dem Smartphone standardmäßig an? | Ja (wie im Click-Dummy), mit Foundrys Leistungsmodus „niedrig“ als Vorgabe. Nach dem Spike mit echten Geräten neu bewerten |
| **E22** | Fremden Token antippen: nur Namen zeigen oder auch „als Ziel markieren“ (für Angriffe)? | **Umgesetzt (Vorschlag):** Antippen eines fremden Tokens zeigt Namen + Knopf „Ziel“ (`Token#setTarget`, ersetzt Taste T). Die SL kann jeden Token markieren |
| **E23** | Wohin kommt die Kampfreihenfolge (5.1), wenn es keine untere Navigation mehr gibt? | **Umgesetzt (Vorschlag):** Leiste unter dem Kopf, nur solange ein Kampf Teilnehmer hat: Reihenfolge mit INI, „Du bist dran!“, „Initiative würfeln“; Antippen öffnet Foundrys Kampf-Tracker als Panel. Der DSA5-Initiativ-Tracker und das Kalender-Widget sind mobil ausgeblendet |

## 10. Vorgehen in Phasen (Vorschlag)

> **Neu geordnet nach der Rückmeldung von Lyynix:** siehe Abschnitt 13.8. Phase 0 und 2 sind weitgehend erledigt (Click-Dummy Runde 3 + 4).

0. **Entscheidungen** E1–E19 klären. Community-Module recherchieren. Issue #7 (CSS) ist umgesetzt (2026-10-05, `release/0.5.0`): Hover steckt bereits in `@media (hover: hover)`, das Mobil-CSS stellt die Tokens `--hit-sm/md/lg` (24/26/28 px, Ziel ≥ 44 px), `--fs-data`, `--fs-base`, `--fs-panel-title`, `--fs-tab-title` um und folgt der Abschnittsgliederung (PROJEKTDOKU „CSS-Gliederung“).
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

### 11.1 Testversion installieren und testen (Mobil-Kanal, seit 2026-10-15)

Testversionen von `feature/mobile` erscheinen in einem eigenen Kanal (veröffentlichen: [RELEASE.md](RELEASE.md) „Mobil-Kanal“). Erste Testversion: **0.6.0** (Tag `mobile-v0.6.0`).

**Installieren**

1. **Nicht in diesem Data-Ordner** (`v14/Data/modules/dsa5-helpers` ist das Git-Arbeitsverzeichnis und würde überschrieben). Eine andere Foundry-Installation nehmen, z. B. den eigentlichen Spielserver.
2. Foundry-Startseite → **Add-on-Module → Modul installieren** → unten bei **Manifest-URL** einfügen:
   `https://github.com/vt-tom/dsa5-helpers/releases/download/mobile/module.json` → **Installieren**.
   Ist DSA5 Helpers dort schon aus dem Stabil- oder Beta-Kanal installiert, das Modul vorher deinstallieren (Welt-Einstellungen und Bogen-Wahl bleiben erhalten, sie hängen an der Modul-ID). Sonst bleibt die alte Manifest-URL aktiv und es kommt kein Mobil-Update.
3. DSA5-Welt starten, als SL **Module verwalten** → DSA5 Helpers aktivieren.
4. **Einstellungen → Moduleinstellungen → DSA5 Helpers → „Hybrides Spiel (Tablet/Smartphone)“** einschalten, speichern, neu laden. Ohne diese Einstellung läuft keine Mobil-Logik.
5. **Updates:** Spätere Testversionen bietet Foundry unter Add-on-Module → **Updates prüfen** an. Wer so installiert hat, bleibt im Mobil-Kanal.
6. **Zurück zur normalen Version:** Modul deinstallieren und mit `…/releases/latest/download/module.json` (Stabil) bzw. `…/releases/download/beta/module.json` (Beta) neu installieren.

**Mit Handy/Tablet verbinden**

- Foundry muss vom Gerät aus erreichbar sein: im gleichen WLAN über die LAN-Adresse des Servers (z. B. `http://192.168.x.y:30000`), sonst über die Internet-Adresse/Weiterleitung. Die Adressen zeigt Foundry in der Welt unter **Einstellungen → Einladungslinks**. Unter Windows ggf. die Firewall für den Foundry-Port freigeben.
- Im Browser des Geräts die Adresse öffnen und sich mit einem Benutzer anmelden. Die Oberfläche wird automatisch gewählt (13.2): Smartphone bei kurzer Bildschirmseite unter 600 px, sonst Tablet. Ein PC mit Maus bleibt bei der normalen Oberfläche, eine Abfrage gibt es bewusst nicht.
- Überschreiben pro Gerät: Konto-Menü der Mobil-Oberfläche bzw. Moduleinstellung **„Oberfläche auf diesem Gerät“** (Automatisch/Smartphone/Tablet/Foundry), oder `?dsa5h-ui=phone|tablet|foundry` an die Adresse hängen (z. B. `…/game?dsa5h-ui=foundry`, falls eine Ansicht kaputt ist).
- Die Szene ist auch auf dem Smartphone an (E18/E21). Abschalten pro Gerät im Konto-Menü („Spielfeld aus“ = `core.noCanvas`).
- Gleichen Benutzer an PC und Handy gleichzeitig: sollte gehen, ist aber noch nicht live geprüft (Fragen dazu in 13.7).

**Am PC ausprobieren (ohne Gerät)**

- Chrome/Edge: F12 → Gerätesymbol (Strg+Umschalt+M) → z. B. „iPhone 12 Pro“ oder „iPad Air“ → Seite neu laden. Die Emulation meldet einen Touch-Zeiger, die Automatik greift.
- Oder ohne Emulation `?dsa5h-ui=phone` bzw. `?dsa5h-ui=tablet` an die Adresse hängen. Gesten lassen sich mit der Maus aber nur eingeschränkt prüfen.

**Was prüfen**

Die Checkliste steht in [AUFGABEN.md](AUFGABEN.md) („Mobil Stufe 1 + 2“). Mindestens ein iPhone/iPad (Safari) **und** ein Android-Gerät (Chrome). Fehler mit Gerät, Browser und Schritt in AUFGABEN.md bzw. als GitHub-Issue festhalten. Fehlersuche am Gerät: Android über `chrome://inspect` am PC (USB-Debugging), iPhone über Safari → Entwickler am Mac.

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

## 13. Umsetzungskonzept Foundry (nach Rückmeldung Lyynix, 2026-10-15)

Grundlage: [MOBILE-FEEDBACK-2026-10-14.md](MOBILE-FEEDBACK-2026-10-14.md) und der Click-Dummy `clickdummy/mobile/` (Runde 4, Einstieg `index.html` bzw. `app.html`). Der Grundsatz bleibt: Foundry-DOM und Systemlogik nutzen, nichts parallel nachbauen. Quellen: Foundry v14 (`foundry-nodejs-v14/client`), DSA5 8.1.x (`systems/dsa5/modules`).

| Punkt der Rückmeldung | Click-Dummy (Runde 4) | Foundry-Umsetzung | Abschnitt |
|---|---|---|---|
| 1 Szene | Karte oben, wischen/zoomen/pingen, eigenen Token lange drücken und ziehen, Zentrieren, Vergrößern | Foundry-Canvas im Vollbild hinter der Shell, eigene Touch-Gestenebene | 13.3 |
| 1 Startseite | Szene, darunter „Meine Helden“, Journal und Chat als schwebende Knöpfe, Sprechblase mit Zähler | Eigene Shell + Foundrys Chat-Benachrichtigungen | 13.1, 13.4 |
| 2 Schips im Chat | eigene Probe antippen → Blatt „Schip verwenden“ (eigene/Gruppe, Wurf wiederholen, QS erhöhen) | Kontextmenü des Systems per Langdruck/Aktionen-Knopf, Systemdialog `UnifiedFateDSA5` bildschirmfüllend | 13.4 |
| 3 Journal-Ordner | Ordnerbaum mit Farben, auf-/zuklappen, Unterordner | Foundrys Journal-Verzeichnis bildschirmfüllend | 13.5 |
| 4 Proben anfordern | SL: Talent/Eigenschaft, Modifikator, Sichtbarkeit, Helden → Anfrage-Karte; Spieler: Blatt „Würfeln/Später“ | `RollRequestService` des Systems, Dialoge bildschirmfüllend | 13.6 |
| 5 Oberfläche automatisch | Konto-Menü: Automatisch/Smartphone/Tablet + Hinweis, was erkannt wurde | Automatik im `init`-Hook, Client-Einstellung zum Überschreiben | 13.2 |
| Falls ohne Szene | Konto-Menü: „Spielfeld An/Aus“ | `core.noCanvas` pro Gerät; gleicher Benutzer an PC und Handy prüfen | 13.3, 13.7 |

### 13.1 Zielbild

```
┌───────────────────────────┐
│ Kopf: Welt · Sitzung  (A) │  eigene Leiste, (A) = Konto-Menü
├───────────────────────────┤
│ Szenenname          [⌖]   │  Foundry-Canvas (#board) liegt im Vollbild dahinter
│                     [⤢]   │  ⌖ = auf eigenen Helden zentrieren, ⤢ = Spielfeld vergrößern
│        (Szene)            │
├───────────────────────────┤
│ Meine Helden              │  eigene Shell-Vorlage, Antippen → unser Bogen (Vollbild)
│ Layariel  LeP/AsP/KaP   › │
├───────────────────────────┤
│ (Journal)  [Blase] (Chat1)│  schwebende Knöpfe, Sprechblase + Zähler über dem Chat
└───────────────────────────┘
```

- **Smartphone:** Chat und Journal öffnen bildschirmfüllend (Zurück-Pfeil im Kopf).
- **Tablet:** Der Chat ist eine rechte Spalte (400 px), die der Chat-Knopf ein- und ausblendet. Das Journal ersetzt den Szenenbereich.
- **Bogen:** wie Runde 3 (unverändert), Vollbild, Zurück-Pfeil führt zur Startseite.
- **SL:** gleiche Shell mit „Helden der Gruppe“ (Spielername, Online-Punkt) und dem Knopf „Probe anfordern“. Die SL kann alle Token ziehen.

### 13.2 Oberfläche automatisch wählen (Punkt 5, ersetzt die Kachel-Abfrage aus Abschnitt 4)

Die Entscheidung fällt synchron im `init`-Hook, ohne Overlay:

1. URL-Parameter `?dsa5h-ui=auto|phone|tablet|foundry` (Notausgang, überschreibt alles).
2. Client-Einstellung `dsa5-helpers.uiMode` (`auto` als Standard, sonst `phone`, `tablet` oder `foundry`). Änderbar im Konto-Menü und in den Moduleinstellungen, danach neu laden.
3. Automatik, einmal beim Start gemessen (Bildschirmgröße `screen`, nicht das Fenster, damit Drehen nicht umschaltet):
   - keine Touch-Eingabe (`(any-pointer: coarse)` trifft nicht zu) → Foundry-Oberfläche;
   - kurze Bildschirmseite < 600 px → Smartphone, sonst Tablet;
   - ab 1200 px Breite und mit Maus als Hauptzeiger (`(pointer: fine)`, z. B. Touch-Laptop) → Foundry-Oberfläche.
   
   Innerhalb einer Klasse reagiert das Layout per CSS auf hoch/quer.
4. Danach, weiter im `init`-Hook: Body-Klasse `dsa5h-ui-phone` / `dsa5h-ui-tablet` und eigene `CONFIG.ui`-Klassen (z. B. `Notifications` ohne Auflösungswarnung). Das reicht, weil `initializeUI` erst später in `setupGame` läuft (2a).
5. Nur bei „Spielfeld aus“: `core.noCanvas` muss vor `initializeCanvas` stehen. Core-Einstellungen werden erst nach `init` registriert, deshalb im `setup`-Hook setzen (läuft in `setupGame` vor `initializeCanvas`). Den vorherigen Wert merken und beim Zurückschalten wiederherstellen. Damit entfällt das Umhüllen von `setupGame` (E17), im Spike bestätigen.

Die Welt-Einstellung „Hybrides Spiel“ bleibt der Hauptschalter: Steht sie auf „nein“, läuft keine Mobil-Logik.

### 13.3 Szene (Punkt 1)

**Grundsatz: Foundrys Canvas bleibt im Vollbild**, die Shell liegt darüber. Der Canvas rechnet an vielen Stellen mit `window.innerWidth/innerHeight` (`canvas/board.mjs`: `_onResize`, `pan`, Zoom-Grenzen). Ihn auf einen Teilbereich zu zwingen, wäre ein Eingriff in Interna. Folge: Heldenkarte und Knöpfe verdecken den unteren Teil der Karte. „Zentrieren“ setzt das Ziel deshalb in die Mitte des **sichtbaren** Bereichs (Versatz = Höhe der Heldenkarte). „Vergrößern“ blendet die Heldenkarte aus.

Was Foundry v14 schon mitbringt und was fehlt:

| Geste | Foundry v14 (Quellcode geprüft) | Bei uns |
|---|---|---|
| Langdruck auf die Karte → Ping | Eingebaut: Langdruck-Timer im `MouseInteractionManager` → `ControlsLayer#_onLongPress` → `canvas.ping()`. Nur auf der Token-Ebene, Recht `PING_CANVAS` | Nutzen. Unsere Gestenebene muss den Druck durchlassen oder selbst `canvas.ping()` rufen |
| Eigenen Token ziehen | Eingebaut als Links-Ziehen, sofort und ohne Langdruck. Langdruck auf einen Token pingt und bricht das Ziehen ab (`PlaceableObject#_onLongPress`) | **Ändern:** Ein-Finger-Wischen verschiebt die Karte. Erst Langdruck auf den eigenen Token startet das Ziehen (sonst verrutschen Token beim Scrollen) |
| Karte verschieben | Nur Rechts-Ziehen (`_onDragRightMove`). Links-Ziehen auf leerer Fläche = Auswahlrechteck | Eigene Geste |
| Zoomen | Mausrad (`_onMouseWheel`). Pinch-Zoom unterdrückt Foundry sogar im ganzen Dokument (`Game#activateListeners`) | Eigene Zwei-Finger-Geste |

Umsetzung in `scripts/mobile/canvas-touch.js`: ein Pointer-Listener in der Capture-Phase auf `#board`, nur für `pointerType === 'touch'` (Maus und Stift bleiben unberührt). Logik wie im Click-Dummy:

- Ein Finger, mehr als 8 px Bewegung vor Ablauf von 500 ms → **verschieben**: Ereignisse nicht an PIXI weitergeben, `canvas.pan({x, y})`.
- Zwei Finger → **zoomen** um den Mittelpunkt: `canvas.pan({x, y, scale})`, Grenzen wie bei Foundry (`CONFIG.Canvas.minZoom/maxZoom` bzw. die berechneten Szenengrenzen).
- 500 ms ohne Bewegung auf leerer Fläche oder fremdem Token → **Ping** (`canvas.ping(point)`, gleiches Verhalten wie Foundry).
- 500 ms auf einem Token, den man besitzt (`token.isOwner`; die SL besitzt alle) → **ziehen**: Token anheben, Zielfeld markieren (rot bei Wand), beim Loslassen einrasten (`canvas.grid.getSnappedPoint`). Die Bewegung läuft über Foundrys Token-Bewegung, damit Wände, Bewegungsregeln, Animation und Rechte gelten. Im Spike klären: v14-API (`TokenDocument#move`) direkt rufen oder nach dem Langdruck Foundrys eigenen Zieh-Ablauf freigeben.
- Kurzes Antippen eines Tokens → Name einblenden (Ersatz für Hover). Ziel markieren: E22.
- Beim Start den eigenen Token kontrollieren (`token.control()`). DSA5-Funktionen wie „Schaden anwenden“ greifen auf `canvas.tokens.controlled` zu.
- Vor dem Spike prüfen: Community-Modul **Touch-VTT** (Touch-Gesten für Foundry, Stand für v14 unbekannt). Wird es gepflegt: Konflikte vermeiden, Ideen übernehmen oder empfehlen statt nachbauen.

Leistung: auf dem Smartphone Foundrys Leistungsmodus „niedrig“ als Vorgabe (Client-Einstellung, nur wenn der Spieler sie nie selbst geändert hat). Im Konto-Menü gibt es „Spielfeld An/Aus“ (= `core.noCanvas`, mit Neuladen). Die Auflösungswarnung bleibt unterdrückt (2a), da sie mit Canvas genauso auftritt.

### 13.4 Chat: Sprechblase, Zähler, Schips (Punkte 1 und 2)

- **Sprechblase:** Gibt es in Foundry schon. `ChatLog#notify` zeigt neue Nachrichten in `#chat-notifications`, solange die Seitenleiste eingeklappt ist (`applications/sidebar/tabs/chat.mjs`). Wir setzen diesen Bereich per CSS als Blase über den Chat-Knopf (eine Nachricht, ca. 5 s) statt eine eigene zu bauen. DSA5 hängt sein Kontextmenü auch an diese Benachrichtigungen (`chat_context.js`), Schips gehen also auch direkt aus der Blase.
- **Ungelesen-Zähler:** eigener Zähler über den Hook `createChatMessage` (nur sichtbare, nicht eigene Nachrichten, keine Systemhinweise), zurückgesetzt beim Öffnen des Chats.
- **Chat:** Foundrys Chat-Log (`ui.chat`). Auf dem Smartphone bildschirmfüllend mit Eingabe unten (tastatursicher, `visualViewport`), auf dem Tablet als Spalte.
- **Schips:** Das System bietet sie im Kontextmenü der Nachricht an: „Schip verwenden“ → `UnifiedFateDSA5.openFromLi`. Sichtbar ist der Eintrag nur, wenn `ConditionChecker.canUseSchip` zutrifft (eigener Held, Schips übrig, noch nicht verwendet). Das System schreibt danach eine Hinweisnachricht („Das Schicksal ändert sich“) und aktualisiert die Probenkarte selbst (`actor/concerns/faterolls.js`). Mobil:
  - **Langdruck** (500 ms) auf eine Nachricht löst ein synthetisches `contextmenu`-Ereignis aus. Dann öffnet Foundrys `ContextMenu` mit allen Systemeinträgen (Schip, Begabung, Schaden/AsP anwenden …). Nötig, weil iOS bei Langdruck kein `contextmenu` sendet (2a).
  - Zusätzlich ein sichtbarer **Aktionen-Knopf** (⋮, 44 px) an jeder Karte, damit man den Langdruck nicht kennen muss. Der Click-Dummy zeigt dafür „Antippen: Schip verwenden“ an eigenen Proben.
  - Das Kontextmenü erscheint als Blatt von unten (CSS, ggf. eigene `CONFIG.ux.ContextMenu`-Unterklasse). Der Schip-Dialog des Systems (ApplicationV2) erscheint bildschirmfüllend wie alle Dialoge. Reiter (Wurf wiederholen, Schaden wiederholen, Ergebnis verbessern, QS erhöhen), Würfelauswahl, eigene/Gruppen-Schips und Ergebnis kommen vollständig vom System. Der Dummy zeigt nur, wie dieser Dialog mobil aussehen soll.
  - Einen einzelnen Würfel per Antippen vorzuwählen (Vorschlag aus der Rückmeldung) geht mit dem Systemdialog nicht direkt. Die Auswahl passiert im Dialog. Kein eigener Nachbau (E20).

### 13.5 Journal mit Ordnern (Punkt 3)

- Foundrys Journal-Verzeichnis (`ui.journal`) zeigt Ordner, Farben und Sortierung wie am Desktop und blendet für Spieler aus, was sie nicht sehen dürfen. Mobil nutzen wir genau dieses Verzeichnis bildschirmfüllend (Journal-Knopf), mit Touch-CSS: Zeilen ≥ 48 px, Ordner per Antippen auf-/zuklappen (Foundry merkt sich den Zustand), Suche bleibt.
- Einträge öffnen im Journal-Blatt bildschirmfüllend.
- „Neu“-Markierung (Dummy): kleiner eigener Zusatz. Ein Client-Speicher merkt sich geteilte Einträge, die noch nicht geöffnet wurden (Hooks auf Rechteänderung und „Allen zeigen“). Optional, nicht v1-kritisch.
- SL: „Für Spieler sichtbar“ und „Allen Spielern zeigen“ sind Foundry-Funktionen (Rechte, Zeigen an Spieler), mobil als große Knöpfe statt Kopfzeilen-Symbole.

### 13.6 SL: Proben anfordern (Punkt 4)

- Der Knopf „Probe anfordern“ (Kopf der Heldenkarte der SL und Chip über der Chat-Eingabe) ruft `game.dsa5.queries.RollRequestService.openRequestDialog()` auf (`modules/system/queries/roll-request.js`). Der Dialog (Talent/Eigenschaft/Regeneration, Modifikator, Sichtbarkeit, Heldenauswahl, technisch ein `DialogV2`) erscheint bildschirmfüllend. Der Dummy zeigt das Zielbild: Talent-Chips mit Suche statt der Select2-Liste. Lässt sich die Liste per CSS nicht touch-tauglich machen, ist das der einzige Punkt mit eigenem Template-Bedarf.
- Anfrage-Karte im Chat und Ablauf kommen vollständig vom System: Spieler bekommen den Probendialog automatisch, die SL würfelt für abwesende Spieler oder überspringt sie und schließt die Anfrage ab. Mobil nur CSS: Zeilen ≥ 44 px, Text-Knöpfe statt Symbole.
- Spieler: Der Probendialog öffnet sich automatisch (Query des Systems), mobil als Blatt von unten. „Später“ schließt ihn, die Karte im Chat behält den Würfeln-Knopf (so verhält sich das System schon).

### 13.7 Falls ohne Szene: PC und Handy gleichzeitig

Die Rückmeldung fragt, ob derselbe Benutzer gleichzeitig am PC (Szene) und am Handy (Bogen) angemeldet sein kann. Im v14-Client haben wir keine Sperre dafür gefunden, und nach unserem Kenntnisstand lässt Foundry mehrere Verbindungen desselben Benutzers zu (z. B. für Zweitbildschirme). Mit der automatischen Wahl ergibt sich der Rest von selbst: PC = Foundry-Oberfläche, Handy = Mobilansicht. **Live prüfen:** Bleiben beide Verbindungen aktiv? Wohin gehen Abfragen an den Benutzer (eine Probenanfrage öffnet sich womöglich auf beiden Geräten)? Erscheinen Cursor und Pings doppelt? Wenn das brauchbar ist, ist es ein guter Rückfall für schwache Handys („Spielfeld aus“).

### 13.8 Dateien und Phasen (ersetzt Abschnitt 10)

Dateien (Ergänzung zu Abschnitt 8):

- `scripts/mobile/ui-mode.js` — Automatik, Einstellung `uiMode`, Body-Klasse, Notausgang, `noCanvas` bei „Spielfeld aus“.
- `scripts/mobile/shell.js` + `templates/mobile/shell.hbs` — Kopf, Heldenkarte, schwebende Knöpfe, Zähler, Chat- und Journal-Ansicht, Konto-Menü.
- `scripts/mobile/canvas-touch.js` — Gesten auf der Szene (13.3).
- `scripts/mobile/touch-context.js` — Langdruck → `contextmenu`, Aktionen-Knopf an Chat-Karten.
- `styles/dsa5-helpers-mobile.css` — Shell, Dialoge bildschirmfüllend, Kontextmenü als Blatt, Chat-Benachrichtigung als Sprechblase, Journal-Verzeichnis.

Phasen (je Phase ein GitHub-Issue, sobald freigegeben):

1. **Spike (Foundry live, echte Geräte):** Automatik + Body-Klasse + Auflösungswarnung weg. Canvas auf iPad und Android-Handy (Ladezeit, Bildrate, Akku). Gesten-Prototyp (wischen, zoomen, pingen, Token ziehen) inkl. `TokenDocument#move` vs. Foundry-Ziehen. Langdruck → Kontextmenü auf iOS. Gleicher Benutzer an zwei Geräten (13.7). Ergebnis: Liste der Stolpersteine, Entscheidung E21.
2. **Shell:** Kopf, Szene + Heldenkarte, schwebende Knöpfe, Sprechblase und Zähler, Chat (Smartphone bildschirmfüllend, Tablet als Spalte), Journal-Verzeichnis, Konto-Menü (Oberfläche, Spielfeld, Thema, Desktop, Abmelden).
3. **Touch-Ersatz und Dialoge:** Kontextmenü als Blatt, Aktionen-Knopf an Chat-Karten, alle Dialoge bildschirmfüllend (Proben, Schip, Probenanfrage, Journal, Item-Blätter).
4. **Bogen mobil:** wie Phase 4 in Abschnitt 10 (Design aus Runde 3).
5. **SL-Ansicht:** Probe anfordern, Journal freigeben/zeigen, alle Token ziehen.
6. **Kampf:** Kampfreihenfolge (E23), Ziel markieren (E22).
7. **Test in einer echten Runde**, danach Release.

### 13.9 CHANGELOG-Entwurf

Der Branch hat noch keine Version (AGENTS.md, Punkt 7). Sobald der Nutzer sie festlegt, kommt dieser Text unter „Neu“ in CHANGELOG.md:

- Hybrides Spiel (experimentell): Mit der Welt-Einstellung „Hybrides Spiel (Tablet/Smartphone)“ (nur Spielleitung, Standard aus) bekommen Tablets und Smartphones eine eigene Oberfläche. Welche, wählt jedes Gerät automatisch: Smartphone, Tablet oder – an Rechnern mit Maus – die normale Foundry-Oberfläche. Ändern lässt sich das im Konto-Menü (Kreis oben rechts) oder in den Moduleinstellungen; hilft gar nichts mehr, `?dsa5h-ui=foundry` an die Adresse hängen.
- In dieser Oberfläche ist oben die Szene: mit einem Finger verschieben, mit zwei Fingern zoomen, lange drücken pingt, den eigenen Token lange drücken und dann ziehen bewegt ihn (rastet ein, Wände gelten). Kurz antippen wählt wie ein Mausklick (Token, Türen) und zeigt den Namen. Knöpfe: auf den eigenen Helden zentrieren, Spielfeld vergrößern.
- Darunter die eigenen Helden mit LeP/AsP/KaP (Spielleitung: alle Helden der Gruppe mit Spielern und Online-Punkt); Antippen öffnet den Bogen bildschirmfüllend. Unten links Journal, unten rechts Chat mit Zähler für ungelesene Nachrichten; neue Nachrichten erscheinen kurz als Sprechblase darüber.
- Chat-Nachrichten: lange drücken oder ⋮ öffnet das Kontextmenü des Systems als Blatt von unten, z. B. „Schip verwenden“ oder „Schaden anwenden“. Fenster und Dialoge erscheinen bildschirmfüllend.
- Spielleitung: „Probe anfordern“ an der Heldenkarte öffnet die Probenanfrage des Systems.
- Kampf: Unter der Kopfleiste stehen die Kampfreihenfolge, „Du bist dran!“ und „Initiative würfeln“; Antippen öffnet den Kampf-Tracker. Fremde Token antippen zeigt den Namen und „Ziel“ zum Markieren.
- Heldenbogen auf dem Smartphone: Reiterleiste unten (vier Reiter und „Mehr“), der Kopf klappt beim Scrollen zusammen, das Titelblatt ist einspaltig. Auf dem Tablet steht die Reiterleiste rechts im Fenster.
- Konto-Menü zusätzlich: Hell/Dunkel.
- Konto-Menü: Oberfläche wählen, Spielfeld auf diesem Gerät an/aus (spart Akku), Foundry-Einstellungen, zur vollständigen Foundry-Oberfläche, Abmelden.

### 13.10 Stand der Umsetzung und Rest

Umgesetzt und live geprüft: 13.2 (Automatik), 13.3 (Gesten, Ping, Token ziehen über `TokenDocument#move`, Ziel), 13.4 (Sprechblase = Foundrys Chat-Benachrichtigung, Zähler, ⋮/Langdruck → System-Kontextmenü → „Schip verwenden“ → Systemdialog), 13.5 (Journal-Verzeichnis, Journal-Blatt auf dem Smartphone mit Seitenliste oben), 13.6 („Probe anfordern“ → Dialog des Systems), E22, E23, Bogen auf dem Smartphone (7.1, vereinfacht).

Bewusst noch nicht:
- „Neu“-Markierung im Journal (Click-Dummy) — optional, braucht eigene Merkliste.
- Tablet-Bogen mit fester linker Kopfspalte (Click-Dummy Runde 3): Der Desktop-Aufbau passt auf 820 px bereits; nur die Rail sitzt jetzt im Fenster.
- Bogen-Feinschliff auf dem Smartphone: Tooltips (Formeln) nur über Langdruck/Foundry. (Waagerechtes Scrollen ist seit 2026-10-15 behoben: Tabellenzeilen ohne Mindestbreite, Nebenspalten ausgeblendet, FW-Steigern im Bearbeitungsmodus unter der Probe, Zierrahmen nur oben.)
- Foundry-Thema: DSA5 unterstützt das dunkle Foundry-Thema mit „Immersive“ nicht vollständig (helle Schrift auf Pergament) — betrifft auch den Desktop; im Konto-Menü auf „Hell“ stellen.

## 14. Feinschliff Heldenbogen Smartphone (Bestandsaufnahme 2026-10-15)

Auftrag des Nutzers nach dem ersten Gerätetest: alles ausarbeiten, was den Bogen auf dem Smartphone gut bedienbar macht. Seiten dürfen dafür komplett umgebaut werden. Grundlage: Screenshots des echten Bogens in der Testinstanz (390 × 844, Held „Testitest“ mit Magie und Religion, „Wulfgrimm“ mit Gefährte, Spiel- und Bearbeitungsmodus) im Vergleich zu den Click-Dummy-Ansichten `clickdummy/mobile/screenshots/smartphone/07–20`.

### 14.1 Grundsätze für den Umbau

- **Ein Bogen** (E10): gleiche Templates, gleiche Aktionen und Systemmethoden. Smartphone-Layout über `body.dsa5h-phone` in `styles/dsa5-helpers-mobile.css`. Wo CSS nicht reicht, kleine Zusatz-Elemente in den Templates, die am Desktop ausgeblendet sind (z. B. eine Unterzeile), oder Umbauten in `setupPhoneSheet()` (`scripts/mobile/mobile.js`).
- **Vorbild Click-Dummy**, aber echte Daten und Systemlogik. Zeigt der Dummy etwas, das es im Modul nicht gibt (z. B. „Vorschläge“ statt Favoriten), bleibt die Funktion des Moduls.
- **Bedienung:** Tippziele mindestens 44 px, Schrift mindestens 14 px, Eingabefelder 16 px (sonst zoomt iOS), kein Hover, keine Funktion nur per Tooltip oder Ziehen.
- **Nur senkrecht scrollen** (seit 2026-10-15 umgesetzt): nach jedem Umbau mit dem Mess-Skript prüfen (alle Reiter und Unterreiter, 360 und 390 px, Spiel- und Bearbeitungsmodus).

### 14.2 Übergreifend (alle Reiter)

| # | Befund | Vorschlag | Aufwand |
|---|---|---|---|
| Ü1 | **Probendialog des Systems** (Talent, Zauber, Waffe) ist auf dem Handy kaum bedienbar: Eingaben zusammengequetscht, Knöpfe klein, viel Leerraum darunter. Er ist der wichtigste Ablauf am Tisch. | Dialog als Blatt von unten (wie Dummy `08-bogen-probe`): Titel und Probe/FW oben, Erschwernis als großer −/+-Regler, Schwierigkeit und Sicht über die volle Breite, „Würfeln“ als breiter Hauptknopf unten, Routineprobe/Vergleich/SL-Entscheid darunter. Nur CSS auf die Dialogklassen des Systems. Gilt auch für Angriff/Parade, Zauber, Liturgie. | M |
| Ü2 | **Kopf** braucht ~260 px (Titelblatt sogar ~650 px, weil Porträt und Ressourcen in der Seitenleiste noch einmal kommen). LeP/AsP/KaP brechen um („28 / ↵ 28“), Schicksalspunkte stehen in einer eigenen Zeile, der Name zentriert über die ganze Breite. | Kopf wie im Dummy: Porträt 64 px links, rechts Name (2 Zeilen), Identitäts-Chips in einer Zeile (abgeschnitten), „AP · frei“. Darunter LeP/AsP/KaP als drei flache Balken „LeP 28/28“ in einer Zeile, Schips als kleine Punkte neben dem Namen, Eigenschaftswürfel 8 nebeneinander. Auf dem Titelblatt Porträt und Ressourcen aus der Seitenleiste ausblenden (stehen schon im Kopf). Einklappen beim Scrollen (gibt es schon) auf eine 54-px-Zeile mit Mini-Balken. Auf „Eigenschaften“ ohne Würfelzeile. | M |
| Ü3 | **Fensterknöpfe** in der Plakette (Sperre, Thema, Bogen wechseln, ⋮, ×) sind 16 px groß und kaum zu treffen. | „‹“ zum Schließen links im Kopf, rechts der Schalter „Spiel / Bearb.“ (= Sperre). Thema, Bogen wechseln und ⋮ ins „Mehr“-Blatt (Ü4). Plakette auf dem Handy ausblenden. | M |
| Ü4 | **„Mehr“** klappt die Reiterleiste auf drei Zeilen auf und deckt den Inhalt ab; Beschriftungen sind abgeschnitten („Characterist…“, „Advancement…“). | „Mehr“ öffnet ein Blatt von unten (Dummy `12`): Kacheln für die übrigen Reiter (inkl. Steigerungsplaner), darunter Spiel/Bearbeiten, Hell/Dunkel, Bogen wechseln, weitere Fensteraktionen. Untere Leiste mit kurzen Mobil-Beschriftungen in `lang/*.json` (z. B. „Werte“ statt „Eigenschaften“). | M |
| Ü5 | **Unterreiter** stehen als umbrechende Textlinks (Talente und Notizen je zwei Zeilen). | Bis 3 Einträge als Segment-Schalter über die volle Breite (Kampf, Magie, Religion, mit Anzahl wie im Dummy), mehr als 3 als waagerecht wischbare Chips-Zeile (Talente, Notizen). Die Chips-Zeile ist die einzige erlaubte waagerechte Bewegung. | S |
| Ü6 | **Tippziele in Zeilen**: Stern, ⋮, Augen- und Schild-Knöpfe 24–28 px; Würfel in Talentzeilen 25 px. | Trefferfläche je Knopf 44 px (Padding statt größerem Symbol), Zeilenhöhe mindestens 52 px. Die Würfel bleiben klein, aber der ganze Würfelblock ist ein Ziel. | S |
| Ü7 | **Bearbeitungsmodus**: Eigenschaften-Kacheln mit „Startwert“/„Steigerung“-Feldern sind 240 px hoch, viele kleine −/+-Knöpfe. | Im Bearbeitungsmodus auf dem Handy Listenzeilen: Eigenschaft · Wert · −/+ (44 px), Start- und Steigerungswert eingeklappt. Gleiches Muster für Talente (schon umgesetzt: FW-Regler unter der Probe) und Kampftechniken. | M |
| Ü8 | Leere Abschnitte und Desktop-Hinweise („Keine Einträge“, „per Drag & Drop hinzufügen“) kosten Platz; Ziehen gibt es auf dem Handy nicht. | Auf dem Handy leere Abschnitte im Spielmodus ausblenden, Drag-&-Drop-Hinweise ausblenden. Im Bearbeitungsmodus bleiben sie (zum Hinzufügen). | S |
| Ü9 | Gegenstandsblätter des Systems (Antippen eines Namens) sind nicht geprüft. | Prüfen; bei Bedarf wie Ü1 per CSS (volle Breite, Reiter oben, größere Felder). | S–M |
| Ü10 | Dunkles Thema auf dem Handy nicht geprüft. | Nach dem Umbau alle Reiter einmal dunkel prüfen. | S |

### 14.3 Je Reiter

**Titelblatt**
- Kopf und Seitenleiste doppeln sich (Ü2). Auf dem Handy: Kopf oben, dann der Kasten „Statuseffekte / Persönliche Daten“ zugeklappt als eine Zeile mit Zähler („2 Zustände“), aufklappbar.
- Favoriten als Karten wie im Dummy (Name groß, Unterzeile z. B. „Talent · MU/GE/KO“, Wert rechts, Würfel darunter); die ganze Karte würfelt. Leerzustand kurz halten.

**Eigenschaften**
- 8 Kacheln (2 × 4) passen; im Spielmodus etwas flacher.
- Grundwerte: LeP, AsP, KaP und Schicksalspunkte im Spielmodus mit großen −/+-Reglern (Dummy `09`); die Tabelle „Aktuell/Mod./Steig./Max“ nur im Bearbeitungsmodus.
- Vor-/Nachteile und Sonderfertigkeiten einspaltig (heute teils zweispaltig mit abgeschnittenen Namen), Sprechblase und Stern 44 px.

**Talente**
- Gruppen-Chips waagerecht wischbar (Ü5); Suche und „Nur gesteigerte“ in einer Zeile (passt schon).
- Spaltenkopf „Probe FW“ ausblenden (selbsterklärend), Gruppenkopf beim Scrollen oben kleben lassen.
- FW fett und rechtsbündig; Behinderung als kleines Zeichen hinter dem Namen statt als eigene Spalte (heute ausgeblendet).

**Kampf** (größter Umbau)
- Unterreiter wie im Dummy: **Waffen · Rüstung · Kampftechniken** statt „Körper / Kampftechniken“.
- „Waffen“: oben 2 × 2 Schnellaktionen (Initiative, Ausweichen, waffenloser Angriff und Verteidigung, dazu Fallschaden und Helfen). Danach je Waffe in der Hand eine Karte: Name, Technik · Hand, Knöpfe AT/PA bzw. FK mit Würfel, TP und RW rechts, Munition als Chips, Nachladen. Zuletzt „Weitere Waffen“ als Liste.
- Die **Körper-Silhouette** mit Hand-Feldern (~500 px) entfällt auf dem Handy; die Hand wird über das Schild-Menü an der Waffe gewählt (gibt es schon).
- „Rüstung“: drei Kacheln RS / BE / Wundschwelle, darunter die Rüstungen als Liste mit RS/BE und „Angelegt“.
- „Kampftechniken“: Liste wie heute (passt), Suche oben.

**Magie / Religion**
- Traditionskarte wie Dummy `13`: Symbol, Name, Leiteigenschaft · Merkmal in einer Zeile, darunter AsP/KaP-Balken mit −/+ (ersetzt die drei Spalten „Leiteigenschaft / Merkmal / Faktor“).
- Unterreiter als Segment mit Anzahl (Zauber 6 · Rituale 1 · Tricks 1 …).
- **Unterzeile je Zauber/Liturgie: „4 AsP · 1 Aktion · 8 Schritt“** (Template: zusätzliches, am Desktop verstecktes Element). Damit kommen Kosten, Dauer und Reichweite zurück, die heute auf dem Handy fehlen.
- Leere Abschnitte (Traditionsartefakt, Zeichen …) im Spielmodus ausblenden (Ü8).

**Ausrüstung**
- Kategorie-Chips „Alle · Waffen · Rüstung · Verbrauch · Sonstiges“ statt vieler Abschnitte untereinander (Dummy `15`).
- Zeile: Name, Unterzeile „1,8 Stein · 180 D“, rechts „Angelegt“ als klarer Knopf statt Schild-Symbol. Anzahl als −/+ nur im Bearbeitungsmodus, sonst „×3“ hinter dem Namen.
- Geldbeutel und Traglast passen; Taschen als Liste statt als Kacheln.

**Status**
- Oben drei Kacheln **Schmerz · Belastung · Wunden** (Dummy `17`).
- Zustände mit großen Stufen-Feldern (44 px) statt kleiner −/+. „Zustand hinzufügen“ als Knopf, der ein Blatt mit der Zustandsliste öffnet.
- Übertragene Effekte zweizeilig (Name, darunter Quelle) statt Name und Quelle nebeneinander.
- **Fehler:** „Modifikatoren“ zeigt den Spaltenkopf doppelt (`.dsa5h-head-dup` bleibt sichtbar).

**Notizen**
- Persönliche Daten als einspaltige Liste „Bezeichnung über Wert“ (heute zweispaltig, Werte versetzt eingerückt).
- Leere Editoren (Biografie, Notizen …) nehmen je ~200 px ein: im Spielmodus zugeklappt mit „Tippen zum Schreiben“; die Editor-Werkzeugleiste fürs Handy prüfen.
- Unterreiter als Chips (Ü5).

**Gefährten**
- Passt seit der Korrektur in die Breite. Der Name ist sehr groß und abgeschnitten („Esel mit Zü…“): kleinere Schrift, 2 Zeilen. Knöpfe Fertigkeiten/Leiste/Trick auf 44 px.
- Dummy `19/20` (Liste, Antippen öffnet einen Mini-Bogen als Blatt) nur, wenn die Karte nach dem Feinschliff noch zu voll ist.

**Steigerungsplaner** (Modul von Lyynix)
- Die Kacheln laufen rechts heraus. Mit Lyynix klären; bis dahin per CSS umbrechen.

### 14.4 Vorschlag Reihenfolge

1. **P1 Bedienbarkeit am Tisch:** Ü1 Probendialog, Ü2 Kopf, Ü3 Fensterknöpfe, Ü4 „Mehr“-Blatt, Ü5 Unterreiter, Ü6 Tippziele, Status-Fehler (doppelter Spaltenkopf).
2. **P2 Seiten umbauen:** Kampf, Magie/Religion (inkl. Unterzeile), Status, Eigenschaften-Grundwerte.
3. **P3 Rest:** Titelblatt-Karten, Ausrüstung mit Chips, Notizen, Bearbeitungsmodus (Ü7), leere Abschnitte (Ü8), Gegenstandsblätter (Ü9), dunkles Thema (Ü10), danach Tablet.

Jeder Schritt: Testinstanz, Mess-Skript, Screenshots. Den Click-Dummy nur dort nachziehen, wo das Ergebnis vom Dummy abweicht.

### 14.5 Entscheidungen des Nutzers (2026-10-15)

- **Zeile antippen würfelt** (wie vorgeschlagen): gilt für Zeilen mit genau einer Probe (Talente, Zauber, Liturgien, Sammelproben), nur im Spielmodus. Das Gegenstandsblatt öffnet der Langdruck über das Kontextmenü des Systems („Bearbeiten“). Umgesetzt in `setupPhoneSheet()`.
- **Körper-Silhouette** fällt auf dem Smartphone weg (Teil des Kampf-Umbaus, P2).
- **Nur der Spielmodus** wird fürs Handy optimiert. Der Nutzer plant drei Modi (Spielen, Steigern, Bearbeiten) für Desktop, Tablet und Smartphone: [Issue #34](https://github.com/vt-tom/dsa5-helpers/issues/34). Ü7 ruht bis dahin.
- **Fensterknöpfe (Ü3):** Rückfrage des Nutzers, welche gemeint sind – offen.

### 14.6 Stand

- **P1 umgesetzt (2026-10-15):** Ü1 Probendialog als Blatt von unten (Felder über die volle Breite, „Würfeln“ unten fest), Ü2 Kopf (~200 px statt 260–650 px, Porträt/Ressourcen/Schips bleiben auf dem Titelblatt im Kopf), Ü4 „Mehr“-Blatt mit Kacheln + Bogen-Thema + Bogen wechseln, Ü5 Unterreiter (Segment bis 3, wischbare Chips ab 4), Ü6 größere Trefferflächen, doppelter Spaltenkopf bei den Modifikatoren, Zeile antippen würfelt. Gemessen: 5 Helden, alle Reiter/Unterreiter bei 360 px im Spielmodus ohne waagerechten Überlauf (außer Steigerungsplaner).
- **Offen:** Ü3 (Antwort des Nutzers), P2, P3.
