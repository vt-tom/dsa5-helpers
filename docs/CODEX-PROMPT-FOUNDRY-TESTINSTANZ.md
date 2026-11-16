# Prompt für GPT Codex: Skill `vttom-foundry-testinstanz` prüfen und übernehmen

Bitte arbeite auf Deutsch. Arbeitsordner: `D:\Development\dsa5-helpers`.

## Hintergrund

Für alle meine Foundry-VTT-Projekte gibt es einen gemeinsamen Skill für Live-Tests in einer eigenen, temporären
Foundry-Instanz. Claude Code nutzt ihn bereits. Du sollst ihn genauso nutzen können. Prüfe das jetzt einmal vollständig.

- Anleitung: `~/.codex/skills/vttom-foundry-testinstanz/SKILL.md` (gleichlautend mit
  `~/.claude/skills/vttom-foundry-testinstanz/SKILL.md`)
- Skripte (nur dort, für beide Werkzeuge): `C:/Users/tomsa/.claude/skills/vttom-foundry-testinstanz/scripts/foundry-test.mjs`
  und `foundry-pw.cjs`
- Globale Vorgabe: `~/.codex/AGENTS.md`
- Projektregeln: `AGENTS.md` im Projekt, Projektdatei `.foundry-test.json` (Port 30077, Profile `v14` und `v13`)

## Feste Regeln

- Die Nutzerinstanzen nie anfassen: die Ports aus `D:/FoundryVTT/ecosystem.config.js` (30000, 30001, 30002) und die
  Ordner unter `D:/FoundryVTT/user-data-paths`. Nicht starten, nicht stoppen, nicht beschreiben, nicht im Browser bedienen.
- Nur über die beiden Skripte arbeiten, keine eigene Instanz von Hand aufsetzen.
- Keine Fremdmodule in `copy` eintragen, keine Projektdateien ändern, nichts committen, nichts pushen.
- Wenn die Sandbox etwas blockiert (Netzwerk, Hintergrundprozess, Schreiben in `%TEMP%`): nicht umgehen, sondern
  mich um Freigabe bitten bzw. den Befehl mit erweiterten Rechten ausführen, wenn ich zustimme.

## Aufgabe

1. Sag mir, ob du den Skill `vttom-foundry-testinstanz` in deiner Skill-Liste siehst und ob du die Regel aus
   `~/.codex/AGENTS.md` kennst. Lies `SKILL.md` vollständig.
2. Führe aus und zeige mir die Ausgaben:
   - `node C:/Users/tomsa/.claude/skills/vttom-foundry-testinstanz/scripts/foundry-test.mjs list`
   - `node C:/Users/tomsa/.claude/skills/vttom-foundry-testinstanz/scripts/foundry-test.mjs status --project D:/Development/dsa5-helpers`
3. Starte die Testinstanz: `… foundry-test.mjs start --project D:/Development/dsa5-helpers`. Erwartet wird
   „Bereit: http://localhost:30077 (Welt dsa5, Profil v14)“.
4. Lege im Temp-Ordner eine Schritte-Datei an (CommonJS, siehe Kopf von `foundry-pw.cjs`), die als SL Welt, System und
   den Aktivstatus des Moduls `dsa5-helpers` ausliest und einen NSC im Bogen `dsa5-helpers.Dsa5HelpersNpcSheet` öffnet
   und fotografiert. Führe sie aus:
   `node C:/Users/tomsa/.claude/skills/vttom-foundry-testinstanz/scripts/foundry-pw.cjs --port 30077 --steps <datei> --out <ordner> --user Gamemaster`
   Werte `log.json` aus und sieh dir das Foto an. Der Seitenfehler zu `tradition-persistence.js` ist bekannt und kommt
   vom System selbst.
5. Beende die Instanz mit `… foundry-test.mjs stop --project D:/Development/dsa5-helpers`. Prüfe mit `status`, dass
   sie nicht mehr läuft.

## Bericht an mich

- Je Schritt: geklappt oder nicht, mit der tatsächlichen Ausgabe bzw. dem Fehler.
- Ob du den Skill von selbst gefunden hättest oder ob ich ihn ausdrücklich nennen muss.
- Was die Sandbox blockiert hat und welche Freigaben du dafür gebraucht hast.
- Konkrete Vorschläge, falls Anleitung oder Skripte für Codex angepasst werden müssen. Ändere sie aber nicht selbst.
