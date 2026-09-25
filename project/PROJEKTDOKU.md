# PROJEKTDOKU.md — Das Wichtigste zum Projekt

Stand: 2026-09-25. Offene Arbeit steht in [AUFGABEN.md](AUFGABEN.md), die ausführliche Historie in [archive/](archive/).

## Ziel

Foundry-VTT-Modul (v14) für DSA5. Erstes Feature: ein neuer, übersichtlicherer Heldenbogen, den Spieler zusätzlich zum Systembogen auswählen können. Nur für Spielercharaktere; Datenzugriffe aber so allgemein halten, dass eine Erweiterung später möglich bleibt.

## Aktueller Stand

- Echtes Modul läuft: alle 10 Reiter (Titelblatt, Eigenschaften, Talente, Kampf, Magie, Religion, Ausrüstung, Status, Notizen, Gefährten) mit echten Systemdaten.
- Favoriten (Stern), Spiel-/Bearbeiten-Modus, Magie/Religion nur bei passender Fähigkeit sichtbar.
- 21 Tests grün (`node tests/sheet.test.cjs`).
- UI/UX-Review vom 2026-09-25 ([Feedback](UI-UX-FEEDBACK-2026-09-25.md)): Pakete A–D (Trefferflächen/Tastatur, Lesbarkeit, Waffentabellen, Orientierung/Rückmeldung) in Clickdummy **und** Foundry umgesetzt, A–C live bestätigt, D noch live zu prüfen. Pakete E–G (Favoritenraster, Kopf/Kampf/Silhouette, Detailpunkte) nur im Clickdummy mit Vergleichsschaltern — Entscheidung des Nutzers offen, siehe AUFGABEN.md.
- Hier gibt es kein laufendes Foundry. Alles ist nur im Code geprüft – bestätigt wird erst live beim Nutzer.

## Grundsätze

- **Erben statt neu bauen:** Die Sheet-Klasse erbt von `globalThis.dsa5.sheets.ActorSheetdsa5Character`. Aktionen, Berechnungen und Datenzugriffe kommen aus dem System. Eigene Methoden nur nach Absprache.
- **Technik:** Handlebars + Vanilla JS, kein React, kein Build-Schritt (direkte ES-Module).
- **Mindestversion:** DSA5 8.1.5 / Foundry ≥ 14.364.
- **Keine eigenen Bilder:** nur vorhandene Assets aus `systems/dsa5/icons/...`.
- **System-Sprachdateien nicht ändern:** eigene Texte unter `DSA5HELPERS.*` in `lang/de.json`/`en.json`.
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
- **Porträt-Rahmen:** „Ecken gekappt“ (Achteck, dünne Tintenlinie) + feiner Goldsaum wie bei den LeP-Karten.
- **LeP/AsP/KaP:** einzelne goldgerahmte Karten.
- **Eigenschaftswürfel:** „Wachssiegel“-Optik; die kleinen Würfel im Kopf lösen ebenfalls eine Probe aus.
- **Favoriten:** Bild + Name + Stern, dahinter Talentwert und klickbare Würfel. Kein Hover-Aufklappen, kein Kontextmenü (beides ausprobiert und verworfen).
- **Tradition (Magie/Religion):** „Wappen-Badge“ mit Icon + kleine 3-Spalten-Tabelle (Leiteigenschaft, Merkmal, Faktor). Die Pille füllt die Breite; Klick öffnet die Sonderfertigkeit „Tradition (…)“ (Erkennung wie im System: Name beginnt mit `LocalizedIDs.assumeTradition`, Kategorie magical/clerical).
- **Waffenzeile (Kampf):** Bild | Name + Technik klein darunter | AT | PA (bei Fernkampf FK über beide) | TP | RW | Griff | ⋮ | Stern; Munition/Nachladen/Zielen als zweite Zeile. Reichweite als eigene Spalte (Variante A, 2026-09-25).
- **Rüstung (Kampf):** jedes Rüstungsteil als Kachel, Bild füllt die Kachel, RS/BE als Ecken-Badges.
- **Wohlgefällige Talente:** einklappbar.
- **Ausrüstung:** Geld und Gewicht als zwei gleiche Panels; Behältnisse als Kacheln, Klick öffnet das DSA5-Item-Sheet; Ausrüsten-Symbol ist ein Schild; Rechtsklick darauf bei Waffen = Griffwahl (Haupthand/Nebenhand/Beidhändig/Ablegen) über die Hand-Logik des Systems. Behältnis-Kacheln zeigen den Füllstand als Wert + Balken.

- **Trefferflächen (UI/UX-Review 2026-09-25):** häufige Aktionen 28 px (Zustands-±, Stern, Regeneration, Schicksalspunkte ~29 px), Löschen/Hilfe 24 px — Grafik bleibt klein, Fläche per Rand/Pseudo-Element/negativem Margin, Zeilenhöhen unverändert.
- **Schrift:** Namen/Werte 15 px (`--fs-data`), Nebenangaben −1 px, Metadaten nie unter 12 px, große Zahlen +3 px. Zahlen in Textschrift (GentiumBasic fett), Andalus nur für Überschriften.
- **Kontrast:** Würfelzahlen überall weiß mit dunkler Kontur (dunkle Schrift auf hellen Würfeln war schlecht lesbar); `--muted` ≥ 4,5:1; Ressourcenbalken leicht entsättigt.
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
- **Fokus nach Re-Render:** jede Actor-Änderung rendert den ganzen Bogen neu; `render()` merkt sich Aktion + Daten des fokussierten Knopfs, `_onRender()` fokussiert das neue Gegenstück.
- **Handlebars-Helfer:** Foundry v14 hat `eq/ne/lt/lte/gt/gte/and/or/not`; `localize` nimmt Platzhalter als Hash (`{{localize 'KEY' name=…}}`). Im Test-Harness fehlende Helfer selbst registrieren.
- **Layout:** zwei Panels nebeneinander brauchen `.panel + .panel{margin-top:0}`, sonst sitzt das zweite tiefer.

## Zusammenarbeit mit dem Agent

- Routinefragen (Code, Umsetzung) selbst entscheiden. Bei Design- und Projektentscheidungen vorher fragen, Rückfragen gebündelt stellen.
- Geklärte Aufgaben komplett selbstständig umsetzen, danach Ergebnis zeigen.
- Dateien bearbeiten, Befehle ausführen, Pakete installieren: erlaubt. Git-Push und Änderungen an Projektziel/-struktur: nur mit Bestätigung.
- Ablauf: [AUFGABEN.md](AUFGABEN.md) abarbeiten → erledigte Punkte löschen → dauerhafte Entscheidungen hier ergänzen.

## Referenzen

- DSA5-System: `systems/dsa5` (Sheets unter `modules/actor/`, Templates unter `templates/actors/`).
- Vorbild für Foundry-API: Schwesterprojekt `modules/melliador-helpers/`.
- Historie: [archive/DECISIONS.md](archive/DECISIONS.md) (sehr lang, nur gezielt lesen) und [archive/STATUS.md](archive/STATUS.md) (Runden 1–24).
