# RELEASE.md — Neue Version veröffentlichen

So kommt eine neue Version des Moduls zu den Spielern. Einmal eingerichtet (2026-09-30, erste Version `v0.1.0`),
danach bei jedem Release genau diese Schritte.

---

## Wie das Ganze funktioniert (einmal verstehen)

- Spieler installieren das Modul in Foundry über die **Manifest-URL**:

  ```text
  https://github.com/vt-tom/dsa5-helpers/releases/latest/download/module.json
  ```

  Diese URL zeigt immer auf das `module.json` des **neuesten** GitHub-Releases.
- Foundry liest daraus `version` und `download` (Link auf das `module.zip` genau dieses Releases). Ist die Version
  höher als die installierte, bietet Foundry unter **Add-on-Module** ein Update an.
- Das `module.json` und das `module.zip` am Release baut **nicht** der Mensch, sondern die GitHub-Action
  [`.github/workflows/release.yml`](../.github/workflows/release.yml). Sie startet automatisch, sobald ein Release
  auf GitHub **veröffentlicht** wird, und:
  1. setzt `version` aus dem Tag (`v0.2.0` → `0.2.0`),
  2. setzt `url`, `manifest` und `download` (Download zeigt fest auf das ZIP dieses Tags),
  3. packt `module.zip` nur aus `module.json`, `LICENSE`, `README.md`, `scripts/`, `styles/`, `templates/`, `lang/`
     (**nicht** enthalten: `clickdummy/`, `project/`, `tests/`, `tools/`, `.claude/`, `.github/`),
  4. hängt `module.json` und `module.zip` an das Release.
- Das Repo muss **öffentlich** sein — Foundry lädt ohne Anmeldung.

---

## Ablauf Schritt für Schritt

Alle Befehle im Modulordner (`D:\FoundryVTT\user-data-paths\v14\Data\modules\dsa5-helpers`), funktionieren in
PowerShell und Git Bash.

### 1. Stand prüfen

```sh
git checkout main
git pull
git status            # muss "nothing to commit, working tree clean" zeigen
node tests/sheet.test.cjs   # alle Tests grün ("fail 0")
```

Nur was auf `main` liegt, kommt ins Release. Arbeit auf einem anderen Branch vorher nach `main` mergen.

### 2. Versionsnummer festlegen

Schema `MAJOR.MINOR.PATCH`:

| Änderung | Beispiel | Neue Version |
|---|---|---|
| nur Fehlerbehebungen | 0.1.0 → | **0.1.1** |
| neue Funktionen / sichtbare Änderungen | 0.1.0 → | **0.2.0** |
| stabile, „fertige“ Fassung (nach Tester-Feedback) | 0.x → | **1.0.0** |

Die Version muss **höher** sein als die letzte — sonst bietet Foundry kein Update an. Letzte Version nachsehen:

```sh
gh release list --limit 3
```

### 3. `module.json` anpassen, committen, pushen

In [`module.json`](../module.json):

- `"version"` auf die neue Nummer setzen (ohne `v`, z. B. `"0.2.0"`).
- Falls mit neuerer Foundry- oder DSA5-Version getestet: `compatibility.verified` bzw.
  `relationships.systems[0].compatibility.verified` hochsetzen. `minimum` nur ändern, wenn ältere Versionen
  wirklich nicht mehr gehen.
- `manifest`/`download` **nicht anfassen** — die setzt die Action.

```sh
git add module.json
git commit -m "Release 0.2.0"
git push origin main
```

> Die Action übernimmt die Version ohnehin aus dem Tag. Das Hochzählen in `module.json` hält das Repo trotzdem
> ehrlich (wer den Code ansieht, sieht die richtige Version).

### 4. Tag anlegen und pushen

```sh
git tag -a v0.2.0 -m "v0.2.0"
git push origin v0.2.0
```

Tag = `v` + Version aus Schritt 3, exakt gleich.

### 5. Release veröffentlichen

**Variante A — GitHub im Browser:**

1. <https://github.com/vt-tom/dsa5-helpers/releases/new> öffnen.
2. Bei „Choose a tag“ den eben gepushten Tag `v0.2.0` wählen.
3. Titel `v0.2.0`, darunter kurz, was sich geändert hat (Stichpunkte reichen).
4. **Publish release** klicken (nicht „Save draft“ — ein Entwurf startet die Action nicht).

**Variante B — Kommandozeile:**

```sh
gh release create v0.2.0 --verify-tag --title "v0.2.0" --notes "- Neu: …
- Behoben: …"
```

> Immer `--verify-tag` (Tag aus Schritt 4) verwenden, **nicht** `--target main`: Dem gh-Login fehlt der
> `workflow`-Scope, deshalb darf `gh` selbst keinen Tag anlegen und bricht mit
> `"workflow" scope may be required` ab. (Dauerhaft beheben ginge mit `gh auth refresh -h github.com -s workflow`.)

### 6. Warten, bis die Action fertig ist (~15 Sekunden)

```sh
gh run list --workflow release.yml --limit 1
```

Status muss `completed` / `success` sein. Im Browser: Reiter **Actions** im Repo.

### 7. Ergebnis prüfen

Am Release (<https://github.com/vt-tom/dsa5-helpers/releases>) müssen unter **Assets** stehen: `module.json`,
`module.zip` (plus die zwei automatischen „Source code“-Archive, die ignoriert man).

Manifest so abrufen, wie Foundry es tut:

```sh
curl -sL https://github.com/vt-tom/dsa5-helpers/releases/latest/download/module.json
```

Dort muss die neue `version` stehen und `download` auf `…/releases/download/v0.2.0/module.zip` zeigen.

### 8. In Foundry testen

**Nicht in diesem Data-Ordner!** `modules/dsa5-helpers` ist hier das Git-Arbeitsverzeichnis — eine Installation oder
ein Update über Foundry würde es mit dem ZIP überschreiben (und `.git`, `clickdummy/`, `project/` … wären weg).

Stattdessen in einer zweiten Foundry-Installation / einem zweiten Data-Ordner:
**Add-on-Module → Modul installieren → Manifest-URL** einfügen → installieren (bzw. bei bestehender Installation
**Updates prüfen**). Dann Welt mit DSA5 starten, Modul aktivieren, Bogen an einem Helden öffnen.

---

## Wenn etwas schiefgeht

| Problem | Lösung |
|---|---|
| Action rot (fehlgeschlagen) | `gh run list --workflow release.yml` → Run-ID, dann `gh run view <run-id> --log-failed` zeigt den Fehler. Nach Behebung: `gh run rerun <run-id>` (ID aus `gh run list`). |
| Release versehentlich als Entwurf gespeichert | Im Browser Release bearbeiten → **Publish release**. Die Action startet dann. |
| Falsche Version / kaputtes Release | Release + Tag löschen: `gh release delete v0.2.0 --cleanup-tag --yes`, lokal `git tag -d v0.2.0`, korrigieren, ab Schritt 3 neu. Hat es schon jemand installiert, lieber eine **neue** höhere Version (z. B. 0.2.1) veröffentlichen statt dieselbe Nummer wiederzuverwenden — Foundry bietet sonst kein Update an. |
| Foundry bietet kein Update an | Version im Release-`module.json` (Schritt 7) nicht höher als die installierte, oder das neue Release ist als „Pre-release“ markiert — `latest` zeigt nur auf normale Releases. |
| Foundry: Installation schlägt fehl / 404 | Repo nicht mehr öffentlich (`gh repo view --json visibility`) oder Assets fehlen am Release (Schritt 7). |
| Datei fehlt im installierten Modul | Neuer Ordner auf oberster Ebene? Dann in `release.yml` beim `zip`-Befehl ergänzen. |

---

## Kurzfassung (wenn man's einmal gemacht hat)

```sh
git checkout main && git pull && node tests/sheet.test.cjs
# module.json: "version": "0.2.0"
git commit -am "Release 0.2.0" && git push origin main
git tag -a v0.2.0 -m "v0.2.0" && git push origin v0.2.0
gh release create v0.2.0 --verify-tag --title "v0.2.0" --notes "…"
gh run list --workflow release.yml --limit 1
curl -sL https://github.com/vt-tom/dsa5-helpers/releases/latest/download/module.json
```
