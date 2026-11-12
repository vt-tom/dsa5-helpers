#!/usr/bin/env node
// Automatischer Deploy in die v14-Testinstanz des Nutzers (Nutzerentscheidung 2026-11-11): läuft als Claude-Code-Stop-Hook
// nach jeder Antwort. Vergleicht erst (deploy-foundry.ps1 compare) und überträgt nur bei Abweichungen, sonst entstünde bei
// jedem Lauf eine leere Sicherung. deploy-foundry.ps1 selbst bleibt unverändert (in drei Repos identisch).
// Meldet das Ergebnis als systemMessage; Fehler brechen nichts ab (Exit 0), sie werden nur gemeldet.
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const script = path.join(__dirname, 'deploy-foundry.ps1');
const run = action => spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script, action], {
  encoding: 'utf8', windowsHide: true, timeout: 240000,
});
const report = message => process.stdout.write(JSON.stringify({ systemMessage: message }) + '\n');

const compare = run('compare');
if (compare.status !== 0) {
  report(`Auto-Deploy: Vergleich fehlgeschlagen, nichts übertragen. ${(compare.stderr || compare.stdout || '').trim().slice(0, 300)}`);
  process.exit(0);
}
const changes = compare.stdout.split(/\r?\n/).filter(line => /^(Geaendert|Neu|Entfaellt): /.test(line));
if (!changes.length) process.exit(0);

const deploy = run('deploy');
if (deploy.status !== 0) {
  report(`Auto-Deploy fehlgeschlagen (${changes.length} Dateien abweichend): ${(deploy.stderr || deploy.stdout || '').trim().slice(0, 300)}`);
  process.exit(0);
}
const files = changes.map(line => line.replace(/^\w+: /, '')).slice(0, 5).join(', ');
report(`Auto-Deploy: ${changes.length} Datei(en) in Foundry v14 übertragen (${files}${changes.length > 5 ? ', …' : ''}). Foundry neu laden (F5).`);
