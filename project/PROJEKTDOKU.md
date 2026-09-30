# PROJEKTDOKU.md — Das Wichtigste zum Projekt

Stand: 2026-09-30. Offene Arbeit steht in [AUFGABEN.md](AUFGABEN.md), die ausführliche Historie in [archive/](archive/).

## Ziel

Foundry-VTT-Modul (v14) für DSA5. Erstes Feature: ein neuer, übersichtlicherer Heldenbogen, den Spieler zusätzlich zum Systembogen auswählen können. Nur für Spielercharaktere; Datenzugriffe aber so allgemein halten, dass eine Erweiterung später möglich bleibt.

## Aktueller Stand

- Echtes Modul läuft: alle 10 Reiter (Titelblatt, Eigenschaften, Talente, Kampf, Magie, Religion, Ausrüstung, Status, Notizen, Gefährten) mit echten Systemdaten.
- Favoriten (Stern), Spiel-/Bearbeiten-Modus, Magie/Religion nur bei passender Fähigkeit sichtbar.
- 33 Tests grün (`node tests/sheet.test.cjs`).
- UI/UX-Review vom 2026-09-25 ([Feedback](UI-UX-FEEDBACK-2026-09-25.md)): Pakete A–D (Trefferflächen/Tastatur, Lesbarkeit, Waffentabellen, Orientierung/Rückmeldung) in Clickdummy **und** Foundry umgesetzt und live bestätigt. Pakete E (Favoritenraster) und G (Detailpunkte je Reiter) sowie die Munitionszeile abgenommen und in Foundry übertragen (live zu prüfen). Aus Paket F sind Porträtformat und schwebende Titelleiste in Foundry; Geld-Panel „Zeile“ seit 2026-09-30 auch in Foundry; Kampf-Unterreiter „Körper“ seit 2026-09-30 in Foundry (live zu prüfen, vorerst neben der Übersicht) — siehe AUFGABEN.md.
- Hier gibt es kein laufendes Foundry. Alles ist nur im Code geprüft – bestätigt wird erst live beim Nutzer.

## Grundsätze

- **Erben statt neu bauen:** Die Sheet-Klasse erbt von `globalThis.dsa5.sheets.ActorSheetdsa5Character`. Aktionen, Berechnungen und Datenzugriffe kommen aus dem System. Eigene Methoden nur nach Absprache.
- **Technik:** Handlebars + Vanilla JS, kein React, kein Build-Schritt (direkte ES-Module).
- **Mindestversion:** DSA5 8.1.5 / Foundry ≥ 14.364.
- **Keine eigenen Bilder:** nur vorhandene Assets aus `systems/dsa5/icons/...`.
- **System-Sprachdateien nicht ändern:** eigene Texte unter `DSA5HELPERS.*` in `lang/de.json`/`en.json`.
- **Release/Installation:** Manifest-URL `https://github.com/vt-tom/dsa5-helpers/releases/latest/download/module.json`. Ablauf: `version` in `module.json` hochzählen → GitHub-Release mit Tag `v<version>` → Action `.github/workflows/release.yml` setzt Version/URLs und hängt `module.json` + `module.zip` (nur `scripts/ styles/ templates/ lang/` + Manifest, LICENSE, README) an. Setzt ein öffentliches Repo voraus (Foundry lädt ohne Anmeldung). Schritt für Schritt: [RELEASE.md](RELEASE.md). Arbeit an der nächsten Version läuft auf einem eigenen Branch `release/<version>` (derzeit `release/0.1.1`), nicht auf `main`; Merge nach `main` erst, wenn der Nutzer die Version freigibt.
- **Lizenz:** MIT. Repo auf GitHub (derzeit privat), später Release über Foundry Package Registry. Keine DSA5-Regeltexte im Modul (Rechte bei Ulisses Spiele).

## Click-Dummy

- `clickdummy/` ist die Design-Referenz (HTML/CSS/JS ohne Foundry).
- Jede Änderung im Modul wird im selben Durchgang auch im Click-Dummy nachgezogen.
- Nur über `clickdummy/start-server.bat` öffnen, nicht per Doppelklick.
- Bogen fest 770×740 px wie das Standard-Foundry-Fenster (an die Fensterhöhe angepasster Bogen ausprobiert und verworfen, 2026-09-25).
- Nach CSS/JS-Änderungen die Cache-Version in `index.html` hochzählen (der Server schickt keine Cache-Header).
- Design-Varianten: 2–3 Varianten per Umschalter im Click-Dummy zeigen, nach der Entscheidung Umschalter und Verlierer löschen.

## Design-Entscheidungen

- **Unter-Tabs** stehen neben der Reiter-Überschrift als Textlabel mit Unterstrich (Talente, Kampf, Magie, Religion, Notizen).
- **Talente „Sprungmarken“** (2026-09-30, Variante B): die Liste zeigt immer alle Gruppen untereinander, die Gruppen-Reiter scrollen nur dorthin (`_jumpToSkillGroup`), die Markierung wandert beim Scrollen mit (`_onContentScroll`, Scroll-Listener in der Capture-Phase am Fenster; ganz unten gilt die letzte Gruppe, während eines Sprungs ruht die Mitführung bis `scrollend`). Sammelproben seit der Live-Rückmeldung als letzter Abschnitt derselben Liste; Suche + „Nur gesteigerte“ kleben oben (`position:sticky`, Sprungziel zieht ihre Höhe ab). Variante A (eigener Reiter „Alle“) verworfen.
- **Porträt-Rahmen:** „Ecken gekappt“ (Achteck, dünne Tintenlinie) + feiner Goldsaum wie bei den LeP-Karten. Größe „Standard“; überall Seitenverhältnis 118:142 (Kopf 118 px, Titelblatt 180 px breit), damit das Bild gleich beschnitten wird (2026-09-28).
- **LeP/AsP/KaP:** einzelne goldgerahmte Karten.
- **Eigenschaftswürfel:** „Wachssiegel“-Optik; die kleinen Würfel im Kopf lösen ebenfalls eine Probe aus.
- **Favoriten:** Raster aus gleich breiten Karten (auto-fill ≥ 300 px): Bild | Name (bricht um) | Probe | Wert | Stern; Waffen: „AT“/„FK“-Würfel als Probe, „TP“-Schadensknopf als Wert (Paket E, 2026-09-28). Kein Hover-Aufklappen, kein Kontextmenü (beides ausprobiert und verworfen).
- **Reiterleiste:** nur Symbole; Name erscheint bei Hover und Tastaturfokus, beim aktiven Reiter nicht dauerhaft (Titel steht über dem Inhalt, 2026-09-28).
- **Schadenswurf:** Knopf mit roter Kante + rotem W6-Quadrat (Farbe von `d6red.svg`, Token `--dmg`), Zoom 1,3× bei Hover/Fokus (2026-09-28).
- **Munitionszeile (Fernkampf):** Variante „Mischform“ (2026-09-28): Munitionswahl als `<details>`-Aufklappknopf (Systemaktion `selectAmmo`, inkl. „Keine Munition“), Nachladen und Magazin „10/10 ⇄“ (`itemSwapMag`) direkt sichtbar.
- **Zielen (Issue #8, 2026-09-30):** nur Anzeige wie im Systembogen, erst ab Fortschritt > 0 — „Zielen“ + Segmentbalken (2 Segmente) + `item.aimProgress`, Tooltip `item.aimTitle`; erhöht wird im System nur über den Knopf „Zielen (x/2)“ in der Fußleiste des Fernkampf-Probendialogs (erscheint nur bei geladener Waffe; die Auswahl „Zielen“ im Dialog liest den Stand nur), ↺ setzt Laden + Zielen zurück.
- **OnUse-Knopf (Issue #9, 2026-09-30):** Partial `parts/onuse.hbs`, grüner W6 (Farbe von `d6green.svg`, Token `--use`), Systemaktion `onUseItem`, nur bei `item.OnUseEffect`. Waffen: hinter dem Namen; Rüstungs-/Handkacheln: oben rechts; Rüstungstabelle: vor dem Namen; Chips/Ausrüstung: statt des früheren „▶“.
- **Sammelproben:** je Talent eine Zeile Bild | Name | 3W20-Würfel | FW; Talent wie im System per Name + Typ `skill` gesucht (`dsa5h.aggregated`), gewürfelt über `rollAggregatedProbe` (`probe.hbs` mit `action`/`which`).
- **Nachladen:** „Nachladen“/„Geladen“ + Segmentbalken (ein Segment je Aktion) + Stand aus dem System (`item.progress`), sichtbarer ↺-Knopf zum Zurücksetzen (2026-09-28).
- **Tradition (Magie/Religion):** „Wappen-Badge“ mit Icon + kleine 3-Spalten-Tabelle (Leiteigenschaft, Merkmal, Faktor). Pille in Akzentfarbe mit fester Breite 260 px, die Nebenwerte teilen sich den Rest gleichmäßig (2026-09-28); Klick öffnet die Sonderfertigkeit „Tradition (…)“ (Erkennung wie im System: Name beginnt mit `LocalizedIDs.assumeTradition`, Kategorie magical/clerical). Gelernte Erweiterungen als ✦ mit Legende.
- **Waffenzeile (Kampf):** Bild | Name + Technik mit KtW klein darunter (Knopf, springt zur Zeile unter „Kampftechniken“, `parts/combatskill-link.hbs`, Technik per Name wie im System; 2026-09-30) | AT | PA (bei Fernkampf FK über beide) | TP | RW | Griff | ⋮ | Stern; Munition/Nachladen/Zielen als zweite Zeile. Reichweite als eigene Spalte (Variante A, 2026-09-25).
- **Rüstung (Kampf):** jedes Rüstungsteil als Kachel, Bild füllt die Kachel, RS/BE als Ecken-Badges.
- **Wohlgefällige Talente:** einklappbar.
- **Lösch-× an Chips:** 19 px fett (`.dsa5h-chip-delete`), größer als das Chat-Symbol daneben (2026-09-30).
- **Eigenschaften-Reiter, Grundwerte:** LeP/AsP/KaP bleiben zusätzlich zu den Kopfkarten in der Tabelle (gehören zu den Grundwerten, dort sitzen Mod/Zukauf im Bearbeiten-Modus). Unterschiedlich lange linke/rechte Spalte wird hingenommen – hängt vom Helden ab, keine gute allgemeine Lösung (2026-09-30).
- **Chips im Eigenschaften-Reiter** (Vor-/Nachteile, allg. SF, Vorprägung, Sprachen): volle Panelbreite, max. zwei pro Zeile, lange Namen allein (`.dsa5h-chips-fill`: `flex:1 1 auto; min-width:50%`, 2026-09-30). Andere Reiter behalten die kompakten Chips.
- **Geld-Panel:** Variante A „Zeile“ (2026-09-30) — eine Geldbörse, vier Segmente mit Trennern, je Münze Bild + großer Wert (direkt editierbar) + Kürzel (Helfer `dsa5hInitial`), voller Name im Tooltip.
- **Ausrüstung:** Geld und Gewicht als zwei gleiche Panels; Behältnisse als Kacheln, Klick öffnet das DSA5-Item-Sheet; Ausrüsten-Symbol ist ein Schild; Rechtsklick darauf bei Waffen = Griffwahl (Haupthand/Nebenhand/Beidhändig/Ablegen) über die Hand-Logik des Systems. Behältnis-Kacheln zeigen den Füllstand als Wert + Balken; Name in `--fs-data`, Füllstand `--fs-small` (2026-09-30).

- **Trefferflächen (UI/UX-Review 2026-09-25):** häufige Aktionen 28 px (Zustands-±, Stern, Regeneration, Schicksalspunkte ~29 px), Löschen/Hilfe 24 px — Grafik bleibt klein, Fläche per Rand/Pseudo-Element/negativem Margin, Zeilenhöhen unverändert.
- **Schrift:** Namen/Werte 15 px (`--fs-data`), Nebenangaben −1 px, Metadaten nie unter 12 px, große Zahlen +3 px. Zahlen in Textschrift (GentiumBasic fett), Andalus nur für Überschriften.
- **Kontrast:** Würfelzahlen überall weiß mit dunkler Kontur (dunkle Schrift auf hellen Würfeln war schlecht lesbar); `--muted` ≥ 4,5:1; Ressourcenbalken leicht entsättigt.
- **Grundwerte (Eigenschaften):** auch Ausweichen und Initiative; Initiativewürfel und Initiative-Mod. (`initiative.die`/`.diemodifier`) nur im Bearbeiten-Modus (`.dsa5h-edit-only`). Jeder Name trägt `data-tooltip="FORMULA.<key>"` aus dem System, nur Hilfe-Cursor, keine gepunktete Linie (2026-09-30).
- **Spielmodus Eigenschaften/Kampfwerte:** Mod- und Zukauf-Spalten ausgeblendet, nur Aktuell/Basis und Max (2026-09-25, in Foundry seit 2026-09-28).
- **Titelleiste:** Foundrys `.window-header` „schwebend“ als kleine Knopfgruppe oben rechts über dem Kopf (absolut positioniert, Titel ausgeblendet), keine eigene Zeile (2026-09-28, Variante B) Freie Stellen im Kopf (nur dort, nicht Seitenleiste/Reiterleiste) leiten `pointerdown` an die `.window-header` weiter; Greif-Cursor als Hinweis (2026-09-30).
- **Notizen:** zweispaltig — links schmal die persönlichen Daten, rechts der Text des Unterreiters (2026-09-28).
- **Status:** jede Tabelle volle Breite, Zeilen abwechselnd links/rechts (`.dsa5h-two-col`, wie „row-section wrap“ im Systembogen, 2026-09-28).
- **Kampf-Reiter:** Unterreiter „Übersicht | Körper | Kampftechniken“ (Kampftechniken mit Suche wie bei den Talenten); Kampfwerte + Rüstung als zwei Panels (kompakte Leiste verworfen, 2026-09-28). Kampftechniken: Leiteigenschaft klein unter dem Namen statt eigener Spalte (2026-09-30, lange Namen liefen sonst über).
- **Kampf › Körper** (Issue #6, 2026-09-30): Rüstung links, Figur mittig (Platzhalter = Artenbild oder Akteur-Porträt, Actor-Flag `bodyFigure`, Umschalter nur im Bearbeiten-Modus), Hände rechts nebeneinander (Variante B) mit Kachel, AT/PA als „Wachssiegel“-Würfel, darunter TP-Knopf und Auswahl; unter dem Namen die Kampftechnik mit KtW wie in der Übersicht. Fernkampfhand: Nachladen/Zielen/Magazin unter dem TP-Knopf, je zweizeilig, Nachladen + Zielen nebeneinander (umbrechend), Magazin eigene Zeile (`parts/ranged-status.hbs`, gemeinsam mit der Waffenzeile; Munitionswahl nur in der Übersicht, 2026-09-30). Waffenwechsel nur über `actor.equipWeaponToHand`; beidhändige Waffe → keine Nebenhand, die eine Hand rechtsbündig. Freie Nebenhand kompakt unter der Haupthand, beide rechtsbündig wie bei beidhändiger Führung (40-px-Kachel „+“ = unsichtbares `<select>`, daneben „Nebenhand · frei“; `offFree`, 2026-09-30 — als eigene schmale Spalte daneben verworfen). Ab drei Rüstungsteilen Tabelle (Bild | Name | RS | BE) statt Kacheln (2026-09-30, live bestätigt). Rüstungs- und Händespalte oben bündig, die Zeile als Ganzes vertikal zentriert (`align-content:center`, 2026-09-30). Zauber/Liturgien als natives `<dialog>` im Bogen, damit die Würfelknöpfe normale Sheet-Aktionen bleiben; jede Aktion darin schließt ihn zuerst (sonst liegt das Probenfenster hinter dem Top-Layer, 2026-09-30). Ob „Körper“ die Übersicht ersetzt, entscheidet das Tester-Feedback.
- **Gefährten:** Systemvorlage `actor-companion.hbs` unverändert eingebunden; eigene Anpassungen nur per CSS (Loyalität in einer Zeile) und `_labelCompanionButtons()` (Kurzbeschriftung der Symbolknöpfe; Knopfspalte wird in den Kartenkopf verschoben; Kartenkopf als Raster: Name allein in Zeile 1 (reicht bis unter das ⋮) mit „…“ + Tooltip, darunter LeP-Leiste | 2×2-Knöpfe, ⋮ oben rechts, 2026-09-30).
- **Bedienung ohne Maus:** jede Würfelaktion ist ein Button mit Ziel im Label („Klettern würfeln“); Zustände haben getrennte −/+-Knöpfe mit Stufe „Wert/Max“.

## Technische Stolpersteine (gelernt)

- **Scroll-Position:** Foundry stellt Scroll zu früh wieder her (alle Tabs stecken in einem Part). Deshalb eigenes Merken/Zurücksetzen in `render()`/`_onRender()`.
- **Klick-Aktionen:** Jedes Element mit `data-action` reagiert, nicht nur `<button>`. `<button>` bringt oft ungewollten Rahmen/Padding mit.
- **Rechte-Aktionen:** DSA5 hat getrennte `ownerRollActions`/`ownerActions` – wir registrieren die genutzten zur Sicherheit selbst in `DEFAULT_OPTIONS`.
- **Autosizing-Felder:** Foundrys globales `box-sizing:border-box` schneidet Text ab → bei `.dsa5h-badges input` auf `content-box` setzen.
- **Ausrüsten-Schalter** nur zeigen, wenn `item.toggle` gesetzt ist (wie im Systembogen).
- **Kontextmenü (⋮):** DSA5 braucht ein `.withContext`-Element im `[data-item-id]`-Element.
- **Test-Harness:** registriert Handlebars-Helfer selbst – neue Helfer dort ebenfalls eintragen.
- **`system.bagweight`** nicht verwenden: kein Schema-Feld, geht in der `toObject(false)`-Kopie verloren, die der Systembogen von jedem Item anlegt (gilt für alle nachträglich gesetzten `system.*`-Werte). Füllstand stattdessen aus `item.children` rechnen, wie das Item-Sheet.
- **Kontext-Flag heißt `editable`**, nicht `isEditable` (das ist nur eine Eigenschaft der Sheet-Klasse). Ein fehlendes Flag sperrt still alle Felder mit `disabled=(not …)` – im Test-Harness keine Werte in den Kontext legen, die Foundry nicht liefert.
- **DSA5 versteckt Editor-Knöpfe** (`prose-mirror button.toggle`) per `opacity:0` bis zum Hover – wer sie dauerhaft zeigen will, muss auch `opacity` überschreiben, nicht nur `display`.
- **Rechtsklick-Aktionen:** `data-action` mit `buttons: [0, 2]` in `ownerActions` bekommt Links- und Rechtsklick (Foundry leitet `auxclick` weiter); eigene Menüs wie im System mit `new foundry.applications.ux.ContextMenu(this.element, '', entries, { eventName: 'none' })` + `menu.render(target)`.
- **Zustand senken:** das System senkt nur per Rechtsklick auf `conditionValue`. Unser `dsa5hConditionDown` ruft denselben Handler mit `{ button: 2 }` auf — keine eigene Regellogik. Beide Knöpfe brauchen ein `[data-descriptor]`-Elternelement.
- **Rechtsklick-Aktionen vs. Kontextmenü:** Foundrys `ContextMenu` lauscht am selben Element (`this.element`, Bubble-Phase) — ein Rechtsklick auf z. B. `loadWeapon` öffnete zusätzlich das Waffen-Kontextmenü. Abhilfe: `contextmenu`-Listener in der **Capture-Phase**, der für `RIGHT_CLICK_ACTIONS` `preventDefault()` + `stopPropagation()` ruft; die Aktion selbst läuft über `auxclick` weiter.
- **Improvisierte Waffen:** Kompendium-Items wie „Armbrust (2H, i)“ sind echte Nahkampfwaffen (Typ `meleeweapon`) und stehen deshalb korrekt in der Nahkampftabelle.
- **Fokus nach Re-Render:** jede Actor-Änderung rendert den ganzen Bogen neu; `render()` merkt sich Aktion + Daten des fokussierten Knopfs, `_onRender()` fokussiert das neue Gegenstück.
- **Handlebars-Helfer:** Foundry v14 hat `eq/ne/lt/lte/gt/gte/and/or/not`; `localize` nimmt Platzhalter als Hash (`{{localize 'KEY' name=…}}`). Im Test-Harness fehlende Helfer selbst registrieren.
- **Fenster ziehen außerhalb der Titelleiste:** ApplicationV2 hängt Ziehen privat an `pointerdown` der `.window-header` und verfolgt `pointermove` danach am ganzen Fenster — ein nachgebautes `PointerEvent('pointerdown')` mit denselben Koordinaten/`pointerId` an `this.window.header` genügt.
- **Bilder nie per `url()` in einer CSS-Variable aus dem Template:** Chrome löst die relative URL gegen das Stylesheet auf, in dem `var()` steht (`modules/dsa5-helpers/styles/…`), nicht gegen die Seite — im Click-Dummy fällt das nicht auf. Stattdessen echtes `<img>`.
- **Buttons als Würfel:** Foundry gibt `<button>` einen grauen Hintergrund; mit `border-radius:50%` wird daraus ein grauer Kreis → `background-color:transparent` (auch für `:hover`) setzen.
- **Layout:** zwei Panels nebeneinander brauchen `.panel + .panel{margin-top:0}`, sonst sitzt das zweite tiefer.
- **`position:sticky` im Scrollbereich:** `top` zählt ab der Innenkante (nach `padding-top`) — im Click-Dummy (`.content` mit 8 px Padding) deshalb `top:-8px`, sonst schauen Zeilen über der Leiste durch. Im Modul hat `.dsa5h-content` oben kein Padding.

## Zusammenarbeit mit dem Agent

- Routinefragen (Code, Umsetzung) selbst entscheiden. Bei Design- und Projektentscheidungen vorher fragen, Rückfragen gebündelt stellen.
- Geklärte Aufgaben komplett selbstständig umsetzen, danach Ergebnis zeigen.
- Dateien bearbeiten, Befehle ausführen, Pakete installieren: erlaubt. Git-Push und Änderungen an Projektziel/-struktur: nur mit Bestätigung.
- Ablauf: [AUFGABEN.md](AUFGABEN.md) abarbeiten → erledigte Punkte löschen → dauerhafte Entscheidungen hier ergänzen.

## Referenzen

- DSA5-System: `systems/dsa5` (Sheets unter `modules/actor/`, Templates unter `templates/actors/`).
- Vorbild für Foundry-API: Schwesterprojekt `modules/melliador-helpers/`.
- Historie: [archive/DECISIONS.md](archive/DECISIONS.md) (sehr lang, nur gezielt lesen) und [archive/STATUS.md](archive/STATUS.md) (Runden 1–24).
