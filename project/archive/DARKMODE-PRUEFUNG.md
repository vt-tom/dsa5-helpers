# Dark Mode & Größenänderung — Prüfauftrag

Herkunft: UI-UX-REVIEW.md Priorität 3, Punkt 13 ("Dark Mode und Größenänderung gezielt prüfen"), aus dem Dokument ausgelagert zur separaten Prüfung im Browser durch eine KI.

## Kontext

Click-Dummy eines DSA5-Foundry-Heldenbogens (kein echtes Foundry-Modul, reines HTML/CSS/JS-Mockup) unter `clickdummy/index.html`, lokal erreichbar z. B. unter `http://localhost:8877/modules/dsa5-helpers/clickdummy/`. Der Bogen simuliert die feste Größe des echten Systemfensters (770 × 740 px, siehe `.sheet` in `style.css`) und hat oben rechts einen Umschalter "Dunkles Thema"/"Helles Thema" sowie "Spielmodus"/"Bearbeiten".

Alle Farben laufen über CSS-Custom-Properties in `style.css`: `:root` definiert das helle Theme, `[data-theme='dark']` überschreibt dieselben Variablen fürs dunkle. Insbesondere `--panel` und `--field` sind bewusst halbtransparente `rgba(...)`-Werte (im Dark Theme sehr niedrige Deckkraft, z. B. `rgba(255,255,255,.05)`), gedacht für den Einsatz auf der Papier-/Kopfzeilen-Textur. Das ist die wahrscheinlichste Ursache für Kontrastprobleme — nicht falsche Farbwerte, sondern zu geringe Deckkraft an Stellen, wo mehrere transparente Ebenen übereinanderliegen oder wo Text direkt auf einem dieser Tokens sitzt.

## Bereits bekannt (nicht erneut melden, nur zur Einordnung)

- Der Dialog-Hintergrund (Taschen-/Item-Vorschau, `.modal-box`) hatte im Dark Theme genau dieses Problem (transparent, Inhalt dahinter schien durch) — wurde bereits behoben (`.modal-box` hat jetzt eine eigene opake `background:var(--paper)`). Falls beim Testen dort noch Transparenz auffällt, ist das ein Regressions-Fund, keine bekannte Baustelle.
- Im dunklen Talente-Reiter wurden inaktive Favoritensterne (`.fav-star`, Farbe nur `var(--line)`) und die kleinen Wert-Stepper (`.step`) bei einer früheren Browserprüfung als "nur schwach vom Tabellenhintergrund zu unterscheiden" beschrieben — das ist der naheliegendste erste Ansatzpunkt für eine Kontrastmessung.

## Was zu prüfen ist

**Dark Mode Kontrast:**
- Alle Textgrößen unter 13px im Dark Theme (`style.css` durchsuchen nach `font-size:11px`/`12px` — betrifft u. a. Attribut-Label, Portrait-Text, Subheads, Ammo-Chips, Sub-Tab-Trennlinien-Beschriftung) gegen den jeweiligen Hintergrund nach WCAG (mind. AA, 4.5:1 für Fließtext, 3:1 für große/fette Schrift) messen.
- `--muted` (gedämpfter Text) auf `--panel`/`--field`/`--odd` in beiden Themes.
- Inaktive Zustände: `.fav-star` (nicht `.active`), `.step` (Stepper-Pfeile), `.pip` (leere Zustands-Pips), `.chip-delete`/`.row-delete` (Lösch-"×").
- Rahmen/Trennlinien (`--line`) — reicht der Kontrast, um Zeilen/Panels im Dark Theme optisch zu trennen, oder verschwimmt alles?

**Größenänderung:**
- Browser-Fenster/Foundry-Fenster kleiner als die Basisgröße 770×740px — der Umbruch bei 860px (`@media (max-width:860px)`) ordnet die Rail von einer vertikalen Spalte zu einer umbrechenden horizontalen Icon-Reihe um (siehe `.rail`/`.sheet-wrap` in `style.css`). Prüfen: Bleibt der Bogen darunter bedienbar, oder entstehen Überlappungen?
- Browser-Zoom 100%/125%/150% bei fester 770px-Fensterbreite — welche Tabellen (feste `grid-template-columns`, z. B. `.melee-row`, `.magic-row`, `.skill-row`) laufen über und erzwingen horizontales Scrollen? Ist das gewünscht oder sollte dort umgebrochen werden?
- Festlegen, welche Bereiche horizontal scrollen dürfen (z. B. einzelne Tabellen) und welche nicht (z. B. der ganze Bogen).

## Gewünschtes Ergebnis

Eine konkrete Liste von Fundstellen (Selektor/Datei/Zeile wo möglich, nicht nur "wirkt zu dunkel") mit Kontrastwert oder Breakpoint, an dem es bricht — analog zum Stil der bereits vorhandenen "Im Browser bestätigte Befunde" in UI-UX-REVIEW.md. Bitte nicht gleich Fixes umsetzen, nur den Befund festhalten; die Umsetzung erfolgt danach separat.
