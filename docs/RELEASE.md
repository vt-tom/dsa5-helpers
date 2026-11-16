# RELEASE.md — Neue Version veröffentlichen

So kommt eine neue Version des Moduls zu den Spielern. Einmal eingerichtet (2026-09-30, erste Version `v0.1.0`),
danach bei jedem Release genau diese Schritte.

---

## Wie das Ganze funktioniert (einmal verstehen)

### Stabile Linien 7.x (Foundry v13) und 8.x (Foundry v14) — ab 7.0.0/8.0.0

Nutzerentscheidung 26.10.2026: **7.X.X für Foundry v13**, **8.X.X für v14**, künftig 9.X.X für v15. V13 nur Desktop mit
vorhandenen Systemfunktionen, v14 einschließlich Mobil. Zweite Zahl: Weiterentwicklung, dritte: Fehlerkorrektur innerhalb
der Linie. Gleiche Modul-ID `dsa5-helpers`, gemeinsamer Quellstand, getrennte Pakete und Updatekanäle. 8.0.0 und 7.0.0
am 12.11.2026 veröffentlicht.

| Linie | Tag | Quelle | ZIPs am Release | Kanäle (feste Pre-releases) |
|---|---|---|---|---|
| v14 | `v8.x.y` | `release/8.x.y` | `module-v14.zip`, `module-v14-beta.zip` | `foundry-v14`, `foundry-v14-beta`; Übergang: `latest`, `beta` |
| v13 | `v7.x.y` | `v13` | `module-v13.zip`, `module-v13-beta.zip` | `foundry-v13`, `foundry-v13-beta` |

Manifest-URL je Kanal: `https://github.com/vt-tom/dsa5-helpers/releases/download/<Kanal>/module.json`.

- Job `line` in [`release.yml`](../.github/workflows/release.yml) baut beide ZIPs mit `tools/package-module.py --channel stable|beta`.
  Das Beta-ZIP zeigt auf den Beta-Kanal der Linie, das stabile auf den stabilen; Foundry übernimmt die URL aus dem ZIP.
- Jedes Release einer Linie aktualisiert `foundry-v<gen>-beta`; ein normales Release zusätzlich `foundry-v<gen>`. Ein
  Pre-release mit `v8.…`/`v7.…`-Tag erreicht also nur die Tester; „Beta zum normalen Release machen“ (unten) gilt weiter.
- Fehlende Kanal-Releases legt der Job beim ersten Lauf selbst an (`--prerelease --latest=false`).
- Das Paket enthält eine gefilterte `CHANGELOG.md` ohne die Abschnitte der anderen Linie (`changelog_for`), damit das
  Changelog-Fenster einem v14-Nutzer keine 7.x-Abschnitte zeigt und umgekehrt. Im Repo bleibt ein gemeinsames CHANGELOG.
- Betas einer Linie (Nutzerentscheidung 03.11.2026): Pre-release mit normaler Nummer der Linie (z. B. `v8.1.0`), später
  dasselbe Release zum normalen erklären. Tags mit Suffix (`v8.0.0-beta`, so noch in #68 notiert) lehnt der Job ab:
  `foundry.utils.isNewerVersion` hält `8.1.0` nicht für neuer als `8.1.0-beta` (geprüft 03.11.2026 am v14-Quelltext).

**Überführung der 0.x-Installationen** (alle v14, das alte Manifest verlangte Foundry ≥ 14.364):

- Stabil (`…/releases/latest/download/module.json`, zuletzt 0.5.1): 8.0.0 wird „Latest“, sein `module.json` zeigt auf
  `module-v14.zip`, darin das Manifest `foundry-v14`. Nach dem Update hängt die Installation am neuen Kanal.
- Beta (`…/releases/download/beta/module.json`): Der Job ersetzt das `module.json` des alten Pre-release `beta` bei jedem
  8.x-Release durch das v14-Beta-Manifest → Tester landen in `foundry-v14-beta`.
- v13-Beta (`foundry-v13-beta`): Kanal bleibt, 7.0.0 kommt dort als Update an (Beta-ZIP, Kanal bleibt `foundry-v13-beta`).
- **7.x nie als „Latest“:** sonst bekämen v14-Installationen mit der alten URL ein v13-Paket angeboten. Immer
  `gh release create v7.… --latest=false`. Der Job bricht ab, wenn ein 7.x-Release „Latest“ ist; dann
  `gh release edit v8.<letzte> --latest` und den Lauf wiederholen.
- Einstellungen, Flags und Bogenwahl hängen an der Modul-ID und bleiben erhalten; keine Weltmigration.

#### Branches ab 8.0.0 (Nutzerentscheidung 12.11.2026)

| Branch | Inhalt | Tag | v13 |
|---|---|---|---|
| `release/8.0.<n>` | nur Fehlerkorrekturen der laufenden Version | `v8.0.<n>` (v14), bei Bedarf `v7.0.<n>` (v13) | `v13` übernimmt ihn |
| `release/8.1.0` | neue Funktionen (nur v14) | `v8.1.0` | **nie** nach `v13` |

- Beide Branches entstehen aus dem Tag der zuletzt veröffentlichten Version. Jeder Bugfix wird auch nach `release/8.1.0`
  übernommen (`git checkout release/8.1.0 && git merge --no-ff release/8.0.<n>`), sonst fehlt er in 8.1.0.
- **8.0.x veröffentlichen:** Ablauf wie unten („8.0.0 und 7.0.0 veröffentlichen“) mit `release/8.0.<n>`, Version und Tag
  `8.0.<n>`; betrifft der Fehler auch v13, Schritt 3 mit `git merge --no-ff release/8.0.<n>` in `v13` und Tag `v7.0.<n>`
  (Version im v13-Paket rechnet `package-module.py` aus dem Tag). Danach `main` nachziehen, Bugfix nach `release/8.1.0`
  übernehmen und den nächsten Bugfix-Branch `release/8.0.<n+1>` aus dem neuen Tag anlegen.
- **8.1.0 veröffentlichen:** wie Schritt 1, 2 und 4 unten mit `release/8.1.0`; Schritt 3 (v13) entfällt. Danach den
  Bugfix-Branch `release/8.1.1` aus `v8.1.0` anlegen; `release/8.0.<n>` wird nicht weitergeführt.

#### 8.0.0 und 7.0.0 veröffentlichen (am 12.11.2026 so durchgeführt)

Reihenfolge: zuerst 8.0.0 (damit `latest` sofort auf die v14-Linie zeigt), dann 7.0.0.

```sh
# 1. Stand prüfen (Korrekturen aus der Beta-Rückmeldung sind auf release/8.0.0)
git checkout release/8.0.0 && git status && node tests/sheet.test.cjs && python tests/package_module_test.py
# module.json: "version": "8.0.0"; CHANGELOG.md: Datum bei [8.0.0] und [7.0.0], Vergleichslinks
#   [8.0.0]: …/compare/v0.6.3...v8.0.0   [7.0.0]: …/compare/v13-0.6.3...v7.0.0
git push origin release/8.0.0

# 2. v14 – 8.0.0 als normales Release (wird Latest)
git tag -a v8.0.0 -m "v8.0.0" && git push origin v8.0.0
gh release create v8.0.0 --verify-tag --latest --title "v8.0.0 für Foundry v14" --notes-file notes-8.md
gh run list --workflow release.yml --limit 1
curl -sL https://github.com/vt-tom/dsa5-helpers/releases/download/foundry-v14/module.json        # 8.0.0, download → v8.0.0/module-v14.zip
curl -sL https://github.com/vt-tom/dsa5-helpers/releases/download/foundry-v14-beta/module.json   # 8.0.0, download → module-v14-beta.zip
curl -sL https://github.com/vt-tom/dsa5-helpers/releases/latest/download/module.json            # wie foundry-v14
curl -sL https://github.com/vt-tom/dsa5-helpers/releases/download/beta/module.json              # wie foundry-v14-beta

# 3. v13 – Branch nachziehen, 7.0.0 nie als Latest
git checkout v13 && git merge --no-ff release/8.0.0
FOUNDRY_DATA_PATH=D:/FoundryVTT/user-data-paths/v13/Data FOUNDRY_APP_PATH=D:/FoundryVTT/foundry-nodejs-v13 node tests/sheet.test.cjs
git push origin v13
git tag -a v7.0.0 -m "v7.0.0" && git push origin v7.0.0
gh release create v7.0.0 --verify-tag --latest=false --title "v7.0.0 für Foundry v13" --notes-file notes-7.md
gh run list --workflow release.yml --limit 1
curl -sL https://github.com/vt-tom/dsa5-helpers/releases/download/foundry-v13/module.json        # 7.0.0, download → v7.0.0/module-v13.zip
curl -sL https://github.com/vt-tom/dsa5-helpers/releases/download/foundry-v13-beta/module.json   # 7.0.0, download → module-v13-beta.zip
curl -sL https://github.com/vt-tom/dsa5-helpers/releases/latest/download/module.json            # weiterhin 8.0.0!

# 4. main nachziehen (README mit den neuen URLs wird erst damit auf GitHub sichtbar)
git checkout main && git merge --no-ff release/8.0.0 && git push origin main
```

Danach: Installationslinks auf der Webseite umstellen, Meilensteine/Issues schließen (#68), Update aus jeder alten URL in
einer Testinstanz nachprüfen (0.5.1 stabil → 8.0.0, 0.6.3 Beta → 8.0.0, v13-0.6.3 → 7.0.0).

Die folgenden Abschnitte beschreiben den bisherigen 0.x-Betrieb (Jobs `build` für `v0.…`-Tags und `v13` für
`v13-0.…`-Tags). Sie bleiben für Korrektur-Betas im alten Schema nutzbar, solange 8.0.0 nicht veröffentlicht ist.

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
  3. packt `module.zip` nur aus `module.json`, `LICENSE`, `README.md`, `CHANGELOG.md`, `scripts/`, `styles/`, `templates/`, `lang/`
     (**nicht** enthalten: `clickdummy/`, `docs/`, `tests/`, `tools/`, `.claude/`, `.github/`),
  4. hängt `module.json`, `module.zip` und `module-beta.zip` an das Release und ersetzt das `module.json` des
     Beta-Kanals (siehe „Beta-Kanal“).
- Das Repo muss **öffentlich** sein — Foundry lädt ohne Anmeldung.

---

## Beta-Kanal (seit 0.4.0)

Zwei Manifest-URLs, zwei Kanäle:

| Kanal | Manifest-URL | Bekommt |
|---|---|---|
| Stabil | `https://github.com/vt-tom/dsa5-helpers/releases/latest/download/module.json` | nur normale Releases |
| Beta | `https://github.com/vt-tom/dsa5-helpers/releases/download/beta/module.json` | Pre-releases **und** normale Releases |

- Eine Beta ist ein ganz normales Release mit normaler Versionsnummer (z. B. `0.4.0`), nur auf GitHub als
  **Pre-release** veröffentlicht. `latest` ignoriert Pre-releases, stabile Nutzer merken also nichts.
- Ist die Beta gut, wird **dasselbe Release** zum normalen Release erklärt (Häkchen „Set as a pre-release“ entfernen,
  bzw. `gh release edit v0.4.0 --prerelease=false --latest`). Die Action baut es dann für den stabilen Kanal neu; die
  Versionsnummer bleibt gleich, Beta-Tester haben die Version schon.
- Braucht die Beta eine Korrektur, gibt es eine **neue** Versionsnummer (z. B. `0.4.1`) als weiteren Pre-release; die
  fehlerhafte Beta wird nie zum normalen Release erklärt.
- **Keine** Suffixe wie `0.4.0-beta.1`: Foundry vergleicht Versionen teilweise als Text und hält `0.4.0` dann *nicht*
  für neuer als `0.4.0-beta.1` — Tester bekämen das fertige Release nicht angeboten (geprüft 2026-10-02 gegen
  `foundry.utils.isNewerVersion`).
- Foundry übernimmt nach der Installation die Manifest-URL aus dem `module.json` **im ZIP**. Deshalb hängt die Action
  an jedes Release zwei ZIPs mit gleichem Inhalt: `module.zip` (stabiles Manifest) und `module-beta.zip`
  (Beta-Manifest). Der feste Pre-release `beta` enthält nur das `module.json` des Beta-Kanals und wird bei jedem
  Release (Pre-release und normal) ersetzt; die Action legt ihn beim ersten Mal selbst an.
- Arbeit an einer Beta läuft auf dem Branch `release/<version>` (der „Beta-Branch“). Der Tag kommt von dort, nicht
  von `main`; nach `main` wird erst gemergt, wenn die Version zum normalen Release erklärt wird.

### Beta veröffentlichen (Kurzfassung)

```sh
git checkout release/0.4.0 && git status && node tests/sheet.test.cjs
# module.json: "version": "0.4.0"; CHANGELOG.md: Datum + Vergleichslink
git push origin release/0.4.0
git tag -a v0.4.0 -m "v0.4.0" && git push origin v0.4.0
gh release create v0.4.0 --verify-tag --prerelease --title "v0.4.0 (Beta)" --notes-file notes.md
gh run list --workflow release.yml --limit 1
curl -sL https://github.com/vt-tom/dsa5-helpers/releases/download/beta/module.json   # neue Version, download → module-beta.zip
curl -sL https://github.com/vt-tom/dsa5-helpers/releases/latest/download/module.json # unverändert die alte stabile Version
```

### Beta zum normalen Release machen

```sh
gh release edit v0.4.0 --prerelease=false --latest --title "v0.4.0"
gh run list --workflow release.yml --limit 1      # Action baut neu („released“)
curl -sL https://github.com/vt-tom/dsa5-helpers/releases/latest/download/module.json  # jetzt 0.4.0, download → module.zip
git checkout main && git merge --no-ff release/0.4.0 && git push origin main
```

---

## v13-Beta-Kanal (seit 0.6.2)

Eigene Manifest-URL für Foundry v13 / DSA5 7.5.1 (nur Desktop):

```text
https://github.com/vt-tom/dsa5-helpers/releases/download/foundry-v13-beta/module.json
```

- Quelle ist der Branch **`v13`** (angelegt 2026-10-28 aus `release/0.6.2`). Neue Arbeit entsteht weiter auf
  `release/<version>` und wird vor einer v13-Beta nach `v13` gemergt; v13-eigene Korrekturen dürfen direkt auf `v13`.
- Tag **`v13-<Version>`** (z. B. `v13-0.6.2`) auf einem Commit von `v13`, Release **immer als Pre-release** (sonst bricht
  der Job ab). Die Versionsnummer ist dieselbe wie die der v14-Beta; der Präfix hält Tags und Releases getrennt.
- Der Job `v13` in `release.yml` baut mit `tools/package-module.py --foundry 13` (v13-Manifest, ohne Mobil-CSS, kein
  seit 03.11.2026 `verified` 13.351 / DSA5 7.5.1), hängt `module.json` und `module-v13-beta.zip` an und ersetzt das `module.json` des festen Pre-release
  `foundry-v13-beta`. Stabil- und Beta-Kanal der v14-Ausgabe bleiben unberührt.
- Gilt bis zur Umstellung auf die stabilen Linien 7.x/8.x (oben); dann kommen die Kanäle `foundry-v13`/`foundry-v14` dazu.

```sh
git checkout v13 && git merge --no-ff release/0.6.2 && node tests/sheet.test.cjs   # v13-Testlauf, siehe PROJEKTDOKU
git push origin v13
git tag -a v13-0.6.2 -m "v13-0.6.2" && git push origin v13-0.6.2
gh release create v13-0.6.2 --verify-tag --prerelease --title "v0.6.2 für Foundry v13 (Beta)" --notes-file notes.md
gh run list --workflow release.yml --limit 1
curl -sL https://github.com/vt-tom/dsa5-helpers/releases/download/foundry-v13-beta/module.json   # download → v13-0.6.2/module-v13-beta.zip
```

---

## Mobil-Kanal (eingestellt 2026-10-29)

Von 2026-10-15 bis 2026-10-20 gab es Testversionen von `feature/mobile` über einen eigenen Kanal (Tag `mobile-v…`,
fester Pre-release `mobile`). Seit 0.6.0 ist Mobile Support Teil der Beta. Am 2026-10-29 wurden der Job `mobile` in
`release.yml` und die Pre-releases „Mobil-Kanal (Test)“ und „v0.6.0 (Mobil-Test)“ entfernt (Nutzerentscheidung); die
Tags bleiben als Historie. Wer noch über `…/releases/download/mobile/module.json` installiert hat, deinstalliert das
Modul einmal und installiert es über die Beta-URL neu.

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

In [`CHANGELOG.md`](../CHANGELOG.md) den Abschnitt der Version von „unveröffentlicht“ auf das Datum setzen und den
Vergleichslink unten von `...main` auf `...v0.2.0` ändern. Den Text daraus als Release-Notizen (Schritt 5) nehmen.
Während der Arbeit an einer Version gehört jede sichtbare Änderung gleich in deren Abschnitt.

```sh
git add module.json CHANGELOG.md
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
ein Update über Foundry würde es mit dem ZIP überschreiben (und `.git`, `clickdummy/`, `docs/` … wären weg).

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
| Foundry bietet kein Update an | Version im Release-`module.json` (Schritt 7) nicht höher als die installierte, oder das neue Release ist als „Pre-release“ markiert — `latest` zeigt nur auf normale Releases (gewollt für Betas, siehe „Beta-Kanal“). |
| Foundry: Installation schlägt fehl / 404 | Repo nicht mehr öffentlich (`gh repo view --json visibility`) oder Assets fehlen am Release (Schritt 7). |
| Datei fehlt im installierten Modul | Neuer Ordner auf oberster Ebene? Dann in `release.yml` beim `zip`-Befehl ergänzen. |

---

## Kurzfassung (wenn man's einmal gemacht hat)

```sh
git checkout main && git pull && node tests/sheet.test.cjs
# module.json: "version": "0.2.0"; CHANGELOG.md: Datum + Vergleichslink setzen
git commit -am "Release 0.2.0" && git push origin main
git tag -a v0.2.0 -m "v0.2.0" && git push origin v0.2.0
gh release create v0.2.0 --verify-tag --title "v0.2.0" --notes "…"
gh run list --workflow release.yml --limit 1
curl -sL https://github.com/vt-tom/dsa5-helpers/releases/latest/download/module.json
```
