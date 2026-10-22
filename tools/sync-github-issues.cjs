#!/usr/bin/env node
/** Read-only GitHub overview. Only the marked block in .projects/AUFGABEN.md is replaced. */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, '.projects', 'AUFGABEN.md');
const REPO = 'vt-tom/dsa5-helpers';
const START = '<!-- GITHUB-ISSUES:START -->';
const END = '<!-- GITHUB-ISSUES:END -->';
const CLOSED_DAYS = 14;

function markers(md) {
  const tokens = [...md.matchAll(/<!--[^\r\n]*GITHUB-ISSUES[^\r\n]*-->/g)];
  if (tokens.length !== 2 || tokens[0][0] !== START || tokens[1][0] !== END ||
      [...md.matchAll(/<!--\s*GITHUB-ISSUES/g)].length !== 2) {
    throw new Error('Beschädigte, fehlende oder mehrdeutige Issue-Marker');
  }
  const s = tokens[0].index;
  const e = tokens[1].index;
  if ((s && !'\r\n'.includes(md[s - 1])) || /\S/.test(md.slice(e + END.length))) {
    throw new Error('Issue-Bereich muss als eigener Abschnitt am Dateiende stehen');
  }
  return { s, e };
}

function fetchIssues(run = execFileSync) {
  const result = [];
  for (let page = 1; ; page++) {
    const data = JSON.parse(run('gh', ['api', '--method', 'GET',
      `repos/${REPO}/issues?state=all&per_page=100&page=${page}`],
    { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000, maxBuffer: 32 * 1024 * 1024 }));
    if (!Array.isArray(data)) throw new Error('Ungültige GitHub-Antwort');
    result.push(...data.filter(i => !i.pull_request));
    if (data.length < 100) break;
  }
  const seen = new Set();
  for (const i of result) {
    if (!Number.isInteger(i.number) || typeof i.title !== 'string' ||
        !['open', 'closed'].includes(i.state) ||
        i.html_url !== `https://github.com/${REPO}/issues/${i.number}` ||
        !Array.isArray(i.labels) || !Array.isArray(i.assignees) ||
        !Number.isFinite(Date.parse(i.updated_at)) ||
        (i.state === 'closed' && !Number.isFinite(Date.parse(i.closed_at))) || seen.has(i.number)) {
      throw new Error('Unvollständige/mehrdeutige Issue-Daten; erneut abrufen');
    }
    seen.add(i.number);
  }
  return result;
}
const cell = s => String(s ?? '').replace(/[\r\n]+/g, ' ').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([\\`*_[\]|])/g, '\\$1').trim();
function statusOf(i) {
  if (i.state === 'open') return 'offen';
  if (i.state_reason === 'not_planned') return 'geschlossen (nicht geplant)';
  if (i.state_reason === 'completed') return 'erledigt';
  return 'geschlossen (Grund nicht angegeben)';
}
function entry(i) {
  const details = [statusOf(i),
    'Bearbeiter: ' + (i.assignees.map(u => '@' + u.login).join(', ') || 'niemand'),
    i.user?.login && 'von @' + i.user.login,
    i.labels.length && 'Labels: ' + i.labels.map(l => typeof l === 'string' ? l : l.name).join(', '),
    i.milestone && 'Meilenstein: ' + i.milestone.title,
    Number.isInteger(i.comments) && `${i.comments} ${i.comments === 1 ? 'Kommentar' : 'Kommentare'}`,
    (i.state === 'open' ? 'zuletzt geändert ' + i.updated_at : 'geschlossen ' + i.closed_at),
  ].filter(Boolean).map(cell).join(' · ');
  return [`- **[#${i.number}](${i.html_url}) ${cell(i.title)}**`, `  - ${details}`];
}
function render(issues, now = new Date()) {
  const cutoff = now.getTime() - CLOSED_DAYS * 864e5;
  const open = issues.filter(i => i.state === 'open').sort((a, b) => a.number - b.number);
  const closed = issues.filter(i => i.state === 'closed' && Date.parse(i.closed_at) >= cutoff)
    .sort((a, b) => b.closed_at.localeCompare(a.closed_at) || a.number - b.number);
  return [START, '## GitHub-Issues', '',
    `_Repository: \`${REPO}\` · Letzter erfolgreicher Abruf: ${now.toISOString()} · vollständig nachgeladen._`, '',
    '_Automatisch erzeugte Übersicht; nur zur Information. Keine Beauftragung zur Bearbeitung. Nicht von Hand bearbeiten._', '',
    `**Offen (${open.length})**`, '', ...(open.length ? open.flatMap(entry) : ['_Keine offenen Issues._']), '',
    `**Kürzlich geschlossen (letzte ${CLOSED_DAYS} Tage: ${closed.length})**`, '',
    ...(closed.length ? closed.flatMap(entry) : ['_Keine kürzlich geschlossenen Issues._']), END].join('\n');
}
function sync({ file = FILE, fetch = fetchIssues, now = () => new Date() } = {}) {
  const lock = file + '.sync.lock';
  let fd;
  let temp;
  try {
    fd = fs.openSync(lock, 'wx');
    const original = fs.readFileSync(file);
    const md = original.toString('utf8');
    const { s, e } = markers(md);
    const issues = fetch(); // all network operations must succeed before any write
    const eol = md.includes('\r\n') ? '\r\n' : '\n';
    const next = md.slice(0, s) + render(issues, now()).replace(/\n/g, eol) + md.slice(e + END.length);
    temp = path.join(path.dirname(file), `.${path.basename(file)}.${crypto.randomUUID()}.tmp`);
    fs.writeFileSync(temp, next, { flag: 'wx', mode: fs.statSync(file).mode });
    const current = fs.readFileSync(file);
    markers(current.toString('utf8'));
    if (!current.equals(original)) throw new Error('Zieldatei während des Abrufs geändert; bitte erneut starten');
    fs.renameSync(temp, file);
    temp = undefined;
    return `GitHub-Issues synchronisiert: ${REPO} → ${file}`;
  } finally {
    if (temp) fs.unlinkSync(temp);
    if (fd !== undefined) {
      fs.closeSync(fd);
      fs.unlinkSync(lock);
    }
  }
}
function main() {
  try {
    console.log(sync());
  } catch (err) {
    // Avoid echoing potentially sensitive CLI stderr into the session log.
    const reason = err.status != null ? `GitHub-CLI fehlgeschlagen (Exit ${err.status}; Anmeldung/Netz prüfen)`
      : err.code === 'EEXIST' ? 'Ein Abgleich läuft bereits (Lock vorhanden)'
      : err.code === 'ENOENT' ? 'Datei oder GitHub-CLI fehlt'
      : err.code === 'ETIMEDOUT' ? 'Zeitüberschreitung beim GitHub-Abruf'
      : err.message;
    console.error(`GitHub-Issues NICHT synchronisiert: ${reason}. Letzter gültiger Inhalt bleibt erhalten und ist möglicherweise veraltet.`);
    process.exitCode = 1;
  }
}
module.exports = { sync, fetchIssues, render, markers, statusOf, REPO, START, END };
if (require.main === module) main();
