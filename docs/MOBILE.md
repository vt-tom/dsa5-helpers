# MOBILE.md — Planung „Mobile Support“ (Tablet & Smartphone)

Stand: 2026-10-20 · Status: **erscheint mit 0.6.0 als Beta** (Branch `release/0.6.0`, Stand in [Issue #43](https://github.com/vt-tom/dsa5-helpers/issues/43)); Stufe 1 + 2 gebaut, in einer Testinstanz live geprüft (Foundry 14.369, DSA5 8.1.10, headless Chrome mit Touch-Emulation; Smartphone 390×844, Tablet 820×1180, Desktop unverändert). Code: `scripts/mobile/`, `styles/dsa5-helpers-mobile.css`. Noch offen: Test auf echten Geräten (iOS Safari, Android Chrome) und die Punkte in 13.10.

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

0. **Entscheidungen** E1–E19 klären. Community-Module recherchieren. Issue #7 (CSS) ist umgesetzt (2026-10-05, `release/0.5.0`): Hover steckt bereits in `@media (hover: hover)`, das Mobil-CSS stellt die Tokens `--hit-sm/md/lg` (24/26/28 px, Ziel ≥ 44 px), `--fs-data`, `--fs-base`, `--fs-panel-title`, `--fs-tab-title` um und folgt der Abschnittsgliederung ([AGENTS.md](../AGENTS.md) „CSS-Gliederung“).
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

**Seit 2026-10-20:** Mobile Support erscheint mit **0.6.0 als Beta** (Branch `release/0.6.0`, Stand in [Issue #43](https://github.com/vt-tom/dsa5-helpers/issues/43)). Installiert wird dann über den Beta-Kanal `https://github.com/vt-tom/dsa5-helpers/releases/download/beta/module.json`; Schritte 2–6 gelten sinngemäß mit dieser URL. Bis dahin gab es Testversionen in einem eigenen Mobil-Kanal (Tag `mobile-v0.6.0`, [RELEASE.md](RELEASE.md) „Mobil-Kanal“, ruht).

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

Die Checkliste steht in [AUFGABEN.md](../.projects/AUFGABEN.md) („Mobil Stufe 1 + 2“). Mindestens ein iPhone/iPad (Safari) **und** ein Android-Gerät (Chrome). Fehler mit Gerät, Browser und Schritt in AUFGABEN.md bzw. als GitHub-Issue festhalten. Fehlersuche am Gerät: Android über `chrome://inspect` am PC (USB-Debugging), iPhone über Safari → Entwickler am Mac.

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

Grundlage: [MOBILE-FEEDBACK-2026-10-14.md](archive/MOBILE-FEEDBACK-2026-10-14.md) und der Click-Dummy `clickdummy/mobile/` (Runde 4, Einstieg `index.html` bzw. `app.html`). Der Grundsatz bleibt: Foundry-DOM und Systemlogik nutzen, nichts parallel nachbauen. Quellen: Foundry v14 (`foundry-nodejs-v14/client`), DSA5 8.1.x (`systems/dsa5/modules`).

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

Version festgelegt (2026-10-20): 0.6.0, als Beta. Der Text steht in CHANGELOG.md unter 0.6.0 › „Neu“ und wird dort weitergepflegt; hier nur noch als Entwurf:

- Hybrides Spiel (experimentell): Mit der Welt-Einstellung „Hybrides Spiel (Tablet/Smartphone)“ (nur Spielleitung, Standard aus) bekommen Tablets und Smartphones eine eigene Oberfläche. Welche, wählt jedes Gerät automatisch: Smartphone, Tablet oder – an Rechnern mit Maus – die normale Foundry-Oberfläche. Ändern lässt sich das im Konto-Menü (Kreis oben rechts) oder in den Moduleinstellungen; hilft gar nichts mehr, `?dsa5h-ui=foundry` an die Adresse hängen.
- In dieser Oberfläche ist oben die Szene: mit einem Finger verschieben, mit zwei Fingern zoomen, lange drücken pingt, den eigenen Token lange drücken und dann ziehen bewegt ihn (rastet ein, Wände gelten). Kurz antippen wählt wie ein Mausklick (Token, Türen) und zeigt den Namen. Knöpfe: auf den eigenen Helden zentrieren, Spielfeld vergrößern.
- Darunter die eigenen Helden mit LeP/AsP/KaP (Spielleitung: alle Helden der Gruppe mit Spielern und Online-Punkt); Antippen öffnet den Bogen bildschirmfüllend. Unten links Journal, unten rechts Chat mit Zähler für ungelesene Nachrichten; neue Nachrichten erscheinen kurz als Sprechblase darüber.
- Chat-Nachrichten: lange drücken oder ⋮ öffnet das Kontextmenü des Systems als Blatt von unten, z. B. „Schip verwenden“ oder „Schaden anwenden“. Fenster und Dialoge erscheinen bildschirmfüllend.
- Spielleitung: „Probe anfordern“ an der Heldenkarte öffnet die Probenanfrage des Systems.
- Kampf: Unter der Kopfleiste stehen die Kampfreihenfolge, „Du bist dran!“ und „Initiative würfeln“; Antippen öffnet den Kampf-Tracker. Fremde Token antippen zeigt den Namen und „Ziel“ zum Markieren.
- Heldenbogen auf dem Smartphone: Reiterleiste unten (wischbar), Bogen-Menü über „⋮“ oben rechts, der Kopf klappt beim Scrollen zusammen, das Titelblatt ist einspaltig. Probendialoge erscheinen als Blatt von unten, eine Talent- oder Zauberzeile antippen würfelt. Kampf zeigt Waffen als Karten statt der Figur, Zauber und Liturgien haben Kosten, Dauer und Reichweite in einer Unterzeile, Status beginnt mit Schmerz, Belastung und Traglast, LeP/AsP/KaP/Schips lassen sich mit großen −/+-Knöpfen ändern, die Ausrüstung lässt sich über Kategorie-Chips filtern. Auf dem Tablet steht die Reiterleiste rechts im Fenster; im Querformat lassen sich Bogen und Chat nebeneinander anzeigen (Chat-Knopf in der Reiterleiste).
- Chat und Journal im Modul-Design: Nachrichten als Karten mit Porträt, Probenkarten mit großen Würfeln, Ergebnisband und QS-Rauten. Unter dem Chat Chips für die Sichtbarkeit (Öffentlich, Als Held, Privat · SL, Verdeckt, Nur ich) und für Empfänger zum Flüstern, Würfel-Schnellknöpfe (1W20, 3W20, 1W6, 2W6 und ein freier Wurf), ➤ zum Senden und „Aa“ für die Formatleiste. Journal-Einträge zeigen eine Seite auf einmal; auf dem Tablet stehen die Seiten links, auf dem Smartphone blättert eine Leiste unten (‹ › und „Seite x von y ▾“ für die Seitenliste).
- Konto-Menü zusätzlich: Hell/Dunkel.
- Konto-Menü: Oberfläche wählen, Spielfeld auf diesem Gerät an/aus (spart Akku), Foundry-Einstellungen, zur vollständigen Foundry-Oberfläche, Abmelden.

### 13.10 Stand der Umsetzung und Rest

Umgesetzt und live geprüft: 13.2 (Automatik), 13.3 (Gesten, Ping, Token ziehen über `TokenDocument#move`, Ziel), 13.4 (Sprechblase = Foundrys Chat-Benachrichtigung, Zähler, ⋮/Langdruck → System-Kontextmenü → „Schip verwenden“ → Systemdialog), 13.5 (Journal-Verzeichnis, Journal-Blatt mit Seitenwahl als Blatt), Chat und Journal im Modul-Design (2026-10-19, siehe unten), 13.6 („Probe anfordern“ → Dialog des Systems), E22, E23, Bogen auf dem Smartphone (7.1, vereinfacht).

**Chat und Journal im Modul-Design** (Nutzer-Entscheidungen 2026-10-19, Entwurf Variante A im Mobil-Click-Dummy), Smartphone und Tablet:
- `scripts/mobile/chat.js`: Nachrichten bekommen per `renderChatMessageHTML` nur Kennzeichnungen (eigene Nachricht, Porträt des sprechenden Helden bzw. Initiale in Spielerfarbe, an DSA5-Probenkarten Kürzel + Zielwert unter den Würfeln, Ergebnisband aus `flags.data.postData.successLevel`, QS-Rauten aus `qualityStep`); Inhalt und Knöpfe der Karten bleiben die des Systems. Eingabe: Chips für Foundrys Nachrichtenmodus (`core.messageMode`), Empfänger-Chips → beim Senden `/w [Namen] …` über den Hook `chatMessage`, Würfel-Schnellknöpfe und freier Wurf → `/r …`, ➤ löst ein Enter im Eingabefeld aus (Foundrys `ChatInputPlugin#sendMessage`), „Aa“ blendet Foundrys Formatleiste ein.
- **Stolperstein:** Foundrys Eingabefeld (`prose-mirror#chat-message`) darf nicht umgehängt werden. Jedes Umhängen baut den Editor neu auf, ein Umhängen während des Starts sogar doppelt, dann sendet Enter nicht mehr. Die Leiste steht deshalb als `display: contents` neben dem Feld im Chat-Formular, ein CSS-Raster ordnet alles an.
- `scripts/mobile/journal.js`: Journal-Blatt immer im Einzelseiten-Modus, Ordnerpfad über dem Titel. Seitenwahl (Rückmeldung 2026-10-20): Tablet = Foundrys Inhaltsverzeichnis links im Modul-Design (ohne Ansichtswechsel/Einklappen) + ‹ › mit Seitentiteln unten; Smartphone = Inhaltsverzeichnis aus, Steuerleiste unten „‹ · Seite x von y ▾ · ›“, die Mitte öffnet die Seitenliste als Blatt (`goToPage`).
- `scripts/mobile/shell.js` (Rückmeldung 2026-10-20): nur SL — Pause-Knopf bei den Szenen-Knöpfen (`game.togglePause(…, {broadcast: true})`, Hook `pauseGame`) und schwebender Knopf „Akteure“ = Foundrys Akteur-Verzeichnis als Panel (`openPanel('actors')`), getrennt von der Heldenkarte.
- `scripts/mobile/touch-context.js`: Klick bis 400 ms nach einem contextmenu wird außerhalb des Menüs geschluckt (Rechtsklick in der Touch-Emulation der Entwicklertools schickte einen Klick hinterher, Foundry schloss das Menü sofort).
- Chat und Journal bleiben auch im dunklen Foundry-Thema hell (eigene Werte für `--color-text-*`).

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
- **Fensterknöpfe (Ü3)** wie vorgeschlagen: Plakette auf dem Handy ausgeblendet, „‹“ links im Kopf schließt, alles andere im „Mehr“-Blatt (ohne Sperre, siehe #34).

### 14.6 Stand

- **P1 umgesetzt (2026-10-15):** Ü1 Probendialog als Blatt von unten (Felder über die volle Breite, „Würfeln“ unten fest), Ü2 Kopf (~200 px statt 260–650 px, Porträt/Ressourcen/Schips bleiben auf dem Titelblatt im Kopf), Ü4 „Mehr“-Blatt mit Kacheln + Bogen-Thema + Bogen wechseln, Ü5 Unterreiter (Segment bis 3, wischbare Chips ab 4), Ü6 größere Trefferflächen, doppelter Spaltenkopf bei den Modifikatoren, Zeile antippen würfelt. Gemessen: 5 Helden, alle Reiter/Unterreiter bei 360 px im Spielmodus ohne waagerechten Überlauf (außer Steigerungsplaner).
- **Ü3 umgesetzt (2026-10-15):** Fensterleiste und Zierrahmen auf dem Handy ausgeblendet, „‹“ im Kopf, im „Mehr“-Blatt zusätzlich Spieleransicht und alle Einträge des Menüs „⋮“ (ohne „Fenster ablösen“). Bogen wechseln öffnet das Menü mit „Mehr“ als Anker (Foundrys ContextMenu öffnet nicht an unsichtbaren Knöpfen).
- **P2 umgesetzt (2026-10-19):** Kampf mit Unterreitern **Waffen · Rüstung · Kampftechniken** (Sprungmarke „Rüstung“ nur auf dem Handy): ohne Silhouette, Schnellaktionen mit Initiative in zwei Spalten, je Hand eine Karte (Bild, Name, Kampftechnik, TP, AT/PA-Siegel 44 px, Munition/Nachladen, Handwahl), leere Hand als eine Zeile mit Auswahl; Rüstung zuletzt mit Kacheln RS/BE und Liste. Magie/Religion: Traditionskarte mit AsP-/KaP-Regler, Unterzeile je Zauber/Liturgie „8 AsP · Dauer 4 · 8 Schritt“ (Einheit und Bezeichnung als data-Attribute in `spell-list.hbs`), leere Abschnitte im Spielmodus aus (Ü8 für Magie, Religion, Kampf vorgezogen). Status: Kacheln **Schmerz · Belastung · Traglast**, Zustände einspaltig mit −/+ in 44 px, „Zustand hinzufügen“ als Blatt von unten, übertragene Effekte zweizeilig. Eigenschaften › Grundwerte: LeP/AsP/KaP/Schips im Spielmodus als −/+-Regler (`addResourceSteppers()` in `mobile.js`, ändert den aktuellen Wert per Actor-Update, nicht über das Maximum). Gemessen: 5 Helden, alle Reiter bei 360 px in Spiel- und Bearbeitungsmodus ohne waagerechten Überlauf; Desktop unverändert.
  - Abweichungen vom Dummy: statt „Wunden/Wundschwelle“ (keine Regel des Systems) die Traglast; Zustandsstufen als −/+ statt vier Kästchen (eine Stufe direkt setzen bräuchte eine eigene Aktion). Den Click-Dummy dafür nicht nachgezogen.
- **Rückmeldung zu P2 umgesetzt (2026-10-19):** Titelblatt: Kasten „Statuseffekte | Persönliche Daten“ steht hell unter den Favoriten (`setupPhoneSheet()` verschiebt ihn in den Titelblatt-Reiter, die Seitenleiste entfällt auf dem Handy). Waffe in der Hand neu: Name groß, Handwahl als ⇄-Knopf oben rechts (unsichtbares `<select>` darüber), AT/PA bzw. FK als beschriftete Pillen, TP rechts daneben, Griffwechsel als kleiner gestrichelter Knopf. Zaubernamen und FW 16 px. „Mehr“ bleibt immer „••• Mehr“ und ist nur hervorgehoben, wenn ein Reiter daraus aktiv ist (vorher zeigte der Knopf dessen Symbol, der Weg zurück ins Blatt war nicht erkennbar).
- **Zweite Rückmeldung (2026-10-19):** Reiterleiste unten als **ganze Leiste wischbar** statt „Mehr“ (Entscheidung des Nutzers aus drei Varianten; gut fünf Reiter im Bild, der aktive wird mittig gescrollt). Die Fensteraktionen (Bogen-Thema, Spieleransicht, Einträge des Menüs „⋮“) liegen jetzt hinter einem **„⋮“ oben rechts im Kopf** (`openMenuSheet()`); „Bogen wechseln“ entfällt mobil (das System hat keinen Handy-Bogen). „Sozialstatus“ u. a. im Kasten Persönliche Daten lesbar (Bezeichnung normal, 14 px).
- **P3 umgesetzt (2026-10-19):** Favoriten-Karten mit größerem Namen, die ganze Karte würfelt. Ausrüstung: Kategorie-Chips aus den Abschnitten des Systems (`addInventoryChips()`, Wahl merkt sich der Bogen, Suche zeigt wieder alle), Zeilen mit Gewicht als Unterzeile und Anzahl „× n“, Taschen als Liste, leere Abschnitte im Spielmodus aus. Notizen: Persönliche Daten einspaltig „Bezeichnung über Wert“, leere Angaben im Spielmodus weggelassen, Textfelder kleiner. Gefährten: Name 22 px zweizeilig, Knöpfe 44 px. Steigerungsplaner bricht um. Ü9: Gegenstandsblätter des Systems sind bildschirmfüllend und bedienbar (Reiter wischbar), nichts geändert. Ü10: dunkles Bogen-Thema geprüft, nur aktive Unterreiter/Chips angepasst. Ü8: leere Abschnitte im Spielmodus in Magie, Religion, Kampf und Ausrüstung aus (das Kampf-Panel mit den Händen ausgenommen). Ü7 ruht (#34). Tablet in der Testinstanz ohne Überlauf.
- **Offen:** Gerätetest; Tablet-Fensterknöpfe (siehe AUFGABEN.md).

## 15. Fenster ohne Mobil-Design (Bestandsaufnahme 2026-10-28)

Auftrag: Welche Fenster lassen sich mit dem aktuellen Funktionsumfang (0.6.2, nur v14) in der Mobil-Oberfläche öffnen, sind aber noch nicht im Mobil-Design? Grundlage ist eine **Code-Analyse** (Modul, DSA5 8.1.11, Foundry 14), noch keine Bildschirmprüfung – Schritt 1 des Plans holt das in der Testinstanz nach.

### 15.1 Was es heute gibt

- **Im Mobil-Design:** Heldenbogen (Smartphone komplett, Tablet Desktop-Aufbau), Chat, Journal-Verzeichnis und -Blatt, Kontextmenü als Blatt, „Zustand hinzufügen“ als Blatt, „⋮“-Menü des Bogens.
- **Probendialoge:** Alle Dialoge auf Basis von Foundrys `DialogV2` haben `.dialog-form` und erscheinen auf dem Smartphone als Blatt von unten (14.6, Ü1); auf dem Tablet nur als 640 px breites Blatt ohne eigene Gestaltung. Dazu gehören neben Talent/Zauber/Liturgie/Angriff/Parade auch Regeneration, Schip-Dialoge, Fallschaden und Waffenlos-Start (DSA5 `DSA5Dialog` → `DialogV2`).
- **Alle übrigen Fenster** bekommen nur `dsa5h-m-window` (`markWindow` in `mobile.js`): bildschirmfüllend, 44-px-Kopfleiste, sonst Desktop-Aussehen. Das betrifft vor allem die Systemfenster auf Basis `DefaultAppv2` (kein `.dialog-form`).

### 15.2 Fenster, die angepasst werden müssen

| # | Fenster | Erreichbar über | Heute | Vorschlag | Aufwand |
|---|---|---|---|---|---|
| F1 | **Talent-Vorschläge** (neu in 0.6.2, Teil des Titelblatts) | Titelblatt | keine Mobil-Regeln, zwei Spalten auf 360 px | einspaltige Karten wie die Favoriten auf dem Handy, ganze Karte würfelt, Anzahl −/+ 44 px; Mobil-Dummy zeigt „Vorschläge“ bereits | S |
| F2 | **Kraftspeicher** (neu in 0.6.2): Radialmenü + Ladedialog des Systems (`PowersourceChargeDialog`, `DefaultAppv2`) | Kugel an den AsP | Radialmenü ist auf Maus/Hover ausgelegt, Dialog nur Vollbild | Handy: Antippen öffnet ein Blatt mit Liste „Speicher · Wert/Max“, darunter „Laden“ → Systemdialog als Blatt mit 44-px-Eingaben; Tablet: Radialmenü behalten, Dialog als Blatt | M |
| F3 | **Lebensenergiezonen-Dialog** von Rüstkammer II (neu in 0.6.2, Fremdmodul) | Zonenliste im Kampf-Reiter | Vollbild, Desktop-Aussehen | nur CSS: Blatt von unten, Zonen untereinander, Eingaben 44 px | S |
| F4 | **Kampfdialog mit Modul-Zusätzen** (Grundmanöver-Abschnitt, „Als Hilfe würfeln“, Schwachpunkte-QS-Verteilung, Wundeinschätzung) | Waffen, Talente, Chat | Grundgerüst als Blatt, eigene Abschnitte nicht geprüft | Grundmanöver-Zeilen 44 px, Abschnitt einklappbar; QS-Verteilung als −/+-Regler; auf dem Tablet dieselbe Gestaltung wie auf dem Handy, nur breiter | M |
| F5 | **Gegenstandsblätter** des Systems (Waffe, Rüstung, Zauber, Talent …) | Name antippen bzw. Langdruck → Bearbeiten | bedienbar, aber Desktop-Aussehen (14.6, Ü9) | im Spielmodus Lese-Ansicht: Kopf mit Bild/Name, Reiter als wischbare Chips (wie Ü5), Beschreibung in Lesegröße, Eingaben 16 px; nur CSS auf die Item-Sheet-Klassen | M |
| F6 | **Almanach** (CalendarPicker) für Personen/Aufträge | Reiter Personen/Aufträge | großes Desktop-Fenster mit Kalender | Variante A: Eintrag direkt als Blatt (Bild, Name, Text) ohne Almanach; Variante B: Almanach per CSS einspaltig. Entscheidung nötig | M–L |
| F7 | **Modul-Fenster**: Changelog (öffnet sich nach Updates von selbst!), Hausregelbuch, Würfelstatistik, „Heldenbogen einrichten“ | automatisch bzw. Einstellungen | Vollbild, Desktop-Aussehen | eigene Fenster → Templates/CSS frei: Kopf mit „‹“, Lesespalte, Inhaltsverzeichnis als Chips; Changelog auf Mobilgeräten nur als Hinweis „Neu in x.y – anzeigen“ | M |
| F8 | **Foundry-Einstellungen** (`SettingsConfig`) und Moduleinstellungen | Konto-Menü → Foundry-Einstellungen | Vollbild, Desktop-Formular | CSS: Kategorien als Chips, Einstellung = Zeile mit Schalter rechts, Hinweis darunter | S–M |
| F9 | **Kleine Systemfenster** (`DefaultAppv2`): Statuseffekt-Wert (`ActorActiveEffectValueDialog`), Ausrüstungsschaden, Bildanzeige („Den Spielern zeigen“, `ImagePopout`) | Status-Reiter, Chat, SL | Vollbild statt kleinem Dialog | allgemeine Regel: kleine Fenster als Blatt von unten (Höhe nach Inhalt), Bildanzeige schwarz mit Zoom-Gesten | S |
| F10 | **SL-Fenster**: „Probe anfordern“ (Systemdialog), Akteur-Verzeichnis → NSC-/Kreaturbögen des Systems | SL-Knöpfe der Shell | Probe anfordern als Blatt; NSC-/Kreaturbögen in Desktop-Ansicht | „Probe anfordern“ prüfen und polieren; NSC/Kreatur erst mit #53/#54 (eigene Bögen im Modul-Design), bis dahin nichts | S (+ #53/#54) |
| F11 | **Kampftracker-Panel** | schwebender Knopf Kampf | Foundry-Tracker im Panel | prüfen: Zeilen 44 px, eigener Zug hervorgehoben (5.1), Initiative würfeln | S |

**Bewusst nicht** (Hinweis „am Desktop“ statt Umbau): Charakterbauer/Assistent (`WizardDSA5`), Spielermenü/Beschwörung (`PlayerMenu`), Token-Konfiguration, Dateibrowser, Händler/Handel, System-Changelog (`PatchViewer`), Fallen-/Regionswerkzeuge, alle Fenster des Bearbeiten-/Steigern-Modus (auf dem Handy nur Spielmodus, 14.5). Tooltips (Formeln) gehören zu #52.

### 15.3 Vorgehen

1. **Bestandsaufnahme live (S):** Testinstanz auf Port 30077 (Regeln siehe AGENTS.md), 390 × 844 und 820 × 1180, hell/dunkel; jedes Fenster aus 15.2 öffnen, Screenshot + Mess-Skript (waagerechter Überlauf, Tippziele < 44 px, Schrift < 14 px). Ergebnis ergänzt die Tabelle; Fenster ohne Befund fallen heraus.
2. **Gemeinsame Bausteine (S–M):** eine Regel für „Fenster als Blatt“ (kleine `DefaultAppv2`/`DialogV2` nach Inhaltshöhe, große Fenster Vollbild) und einen einheitlichen Mobil-Fensterkopf („‹“ + Titel, wie im Bogen) für alle `dsa5h-m-window`. Danach sehen alle Fenster aus F9 schon passend aus.
3. **P1 – am Tisch und neu in 0.6.2:** F1 Vorschläge, F2 Kraftspeicher, F3 Zonen, F4 Kampfdialog-Zusätze, F11 Kampftracker. Kommt am besten noch in die 0.6.2-Beta, damit die neuen Funktionen nicht ohne Mobil-Fassung erscheinen.
4. **P2 – Lesen:** F5 Gegenstandsblätter, F6 Almanach (nach Entscheidung), F7 Modul-Fenster.
5. **P3 – Rest:** F8 Einstellungen, F10 SL-Fenster, Desktop-Hinweis für die bewusst ausgelassenen Fenster.

Je Schritt: Entwurf im Mobil-Click-Dummy (`clickdummy/mobile/`, 2–3 Varianten bei neuen Mustern wie F2/F5/F6), Nutzerentscheidung, dann CSS in `styles/dsa5-helpers-mobile.css` (nur Systemklassen ansprechen, keine Systemvorlagen ersetzen), bei eigenen Fenstern Templates; Prüfung in der Testinstanz mit Mess-Skript, Desktop-Regression mit `node tests/sheet.test.cjs`, CHANGELOG. Grober Rahmen: P1 2–3 Tage, P2 2–4 Tage (je nach F6), P3 1–2 Tage.

### 15.4 Entscheidungen

Nutzer 2026-10-28: E-F1 P1 kommt in 0.6.3 (zunächst „noch in 0.6.2“, am selben Tag geändert: 0.6.2 wird die Beta mit dem bisherigen Stand); E-F3 Systemfenster nur gut bedienbar (kein Pergament-Design); E-F4 Changelog auf Mobilgeräten nur als Hinweis. E-F2 noch offen.

- **E-F1 Reihenfolge:** P1 noch in 0.6.2 oder alles in 0.6.3?
- **E-F2 Almanach (F6):** Eintrag direkt als Blatt (A) oder Almanach mobil anpassen (B)?
- **E-F3 Systemfenster im Modul-Design?** Gegenstandsblätter und Einstellungen nur „gut bedienbar“ (größere Ziele, eine Spalte, Foundry-Look) oder auch optisch wie der Bogen (Pergament, Goldlinien)? Letzteres ist mehr CSS und bricht eher bei System-Updates.
- **E-F4 Changelog nach Updates:** auf dem Handy automatisch öffnen oder nur Hinweis?
