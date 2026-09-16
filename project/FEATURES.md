# FEATURES.md — Feature-Backlog

Ideen und angefragte Erweiterungen, die noch nicht umgesetzt sind. Erledigte Punkte werden gelöscht (Details landen im Commit bzw. in [archive/DECISIONS.md](archive/DECISIONS.md)). Für granulares Bearbeiten-/Spielmodus-Feintuning pro Tab siehe stattdessen [TABS.md](TABS.md) — das ist der dafür vorgesehene, feinere Tracker.

---

## CSS-Datei vollständig reorganisieren

Code-Review (2026-09-16) fand: `styles/dsa5-helpers-character-sheet.css` ist chronologisch statt nach Komponente/Tab gegliedert (Abschnitts-Kommentare inzwischen ergänzt, aber ohne Umsortierung), zwei Formatierungsstile koexistieren (mehrzeilig vs. einzeilig-kompakt, Bruch bei ca. Zeile 834). Eine echte Umsortierung nach Tabs/Komponenten plus einheitliche Formatierung wurde bewusst zurückgestellt: die Kaskaden-Reihenfolge bestimmt an mehreren dokumentierten Stellen das Verhalten (gleich spezifische Regeln, nach Quellreihenfolge entschieden — siehe [archive/DECISIONS.md](archive/DECISIONS.md) u.a. den Proben-Rahmen-Fix), ein Umbau bräuchte danach eine sorgfältige Live-Nachprüfung in Foundry, die aus dieser Umgebung nicht möglich ist.

## GitHub-Issues-Integration

Nutzerwunsch (2026-09-15): Issues aus einem GitHub-Repo sollen künftig hier mit reinfließen (Richtung noch offen — Spiegelung nach BUGS.md/FEATURES.md, direkter Verweis, oder ein Sync-Workflow). Voraussetzung: Es existiert noch kein öffentliches GitHub-Repo für dieses Modul (nur ein lokales, commit-loses Git-Repo, siehe [STATUS.md](STATUS.md)/[PLANNING.md](PLANNING.md) Lizenz&Veröffentlichung). Erster Schritt wäre also das Repo anzulegen, bevor eine Anbindung sinnvoll ist.

## OnUseEffect-Würfel-Buttons

Systemweites Automatisierungsmuster (Würfel-Button bei Items/Sonderfertigkeiten mit hinterlegtem Effekt, `OnUseEffect`) — mehrfach bewusst zurückgestellt "bis zum echten Modul existiert" (Kampf-/Magie-/Religion-/Ausrüstungs-Tab betroffen, siehe [archive/DECISIONS.md](archive/DECISIONS.md)). Das echte Modul existiert jetzt — damit ist dieser Punkt grundsätzlich angehbar, aber noch nicht eingeplant.

## Chargen-Wizard-Einstieg

"Heldenerschaffung starten" in der Kopfzeile — im echten DSA5-System vorhanden, im eigenen Bogen bislang zurückgestellt ("ergibt an einer bereits fertigen Demo-Figur wenig Sinn, erst relevant sobald der Bogen an echten (auch unfertigen) Akteuren hängt"). Jetzt, wo der Bogen an echten Akteuren hängt, wäre das der Moment, das neu zu bewerten.

## Attribute-Tab / Grundwerte-Feintuning (Click-Dummy-Ära, Gültigkeit fürs echte Modul ungeprüft)

Diese Liste stammt aus einem Review des **Click-Dummys** (2026-09-11), bevor das echte Modul existierte. Das Eigenschaften-Tab des echten Moduls wurde seitdem mehrfach komplett neu aufgebaut (siehe [archive/DECISIONS.md](archive/DECISIONS.md)) — ob die einzelnen Punkte unten dort noch zutreffen, ist nicht geprüft. Vor Bearbeitung erst gegen den aktuellen Stand von `templates/actors/parts/main.hbs` verifizieren, nicht blind übernehmen.

**Hoch:**
- [ ] Spielmodus blendete im Click-Dummy nur die +/− Steppers aus, nicht ganze Zeilen — dadurch kaum schlanker als der Bearbeiten-Modus.
- [ ] Die beiden Spalten im Attribute-Tab (Grundwerte links vs. Vor-/Nachteile + Sonderfertigkeiten rechts) liefen im Click-Dummy stark auseinander (Grundwerte deutlich länger).

**Mittel:**
- [ ] Lange Labels ("LeP-Regeneration", "pAsP (perm. Verlust)") brachen in der schmalen Spalte um, uneinheitliche Zeilenhöhen.
- [ ] +/− Steppers erschienen im Bearbeiten-Modus bei jeder Grundwerte-Zeile, auch bei rein berechneten (nicht direkt kaufbaren) Werten wie Zähigkeit/Ausweichen/Initiative.
- [ ] Zeilen mit nur einem relevanten Wert (Initiativewürfel, Größenkategorie, Kälteschutz) zeigten trotzdem 3 "–" in den übrigen Spalten.

**Niedrig / später:**
- [ ] LeP/AsP/KaP standen doppelt: kompakt im Kopf (immer sichtbar) und ausführlich nochmal in Grundwerte.
- [ ] Bei viel Inhalt auf einem Tab ggf. über Unterabschnitte/Einklappen nachdenken statt alles linear zu stapeln.
