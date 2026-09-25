#!/usr/bin/env node
/**
 * Holt die GitHub-Issues von vt-tom/dsa5-helpers (per `gh`-CLI) und schreibt sie
 * in den Abschnitt „GitHub-Issues“ von project/AUFGABEN.md — zwischen den Markern
 * <!-- GITHUB-ISSUES:START --> und <!-- GITHUB-ISSUES:END -->. Der Abschnitt wird
 * bei jedem Lauf ans Dateiende verschoben.
 *
 * Läuft automatisch als SessionStart-Hook (.claude/settings.json), lässt sich aber
 * auch von Hand starten: `node tools/sync-github-issues.cjs`.
 * Schlägt `gh` fehl (offline, nicht eingeloggt), bleibt die Datei unverändert.
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'project', 'AUFGABEN.md');
const START = '<!-- GITHUB-ISSUES:START -->';
const END = '<!-- GITHUB-ISSUES:END -->';
const CLOSED_DAYS = 14; // geschlossene Issues so lange noch mit anzeigen

function fetchIssues() {
  const out = execFileSync('gh', [
    'issue', 'list', '--state', 'all', '--limit', '200',
    '--json', 'number,title,state,stateReason,assignees,labels,author,milestone,comments,createdAt,updatedAt,closedAt,url',
  ], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000 });
  return JSON.parse(out);
}

const date = (iso) => (iso ? iso.slice(0, 10) : '');
const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim();
const users = (list) => list.map((u) => '@' + u.login).join(', ');

function statusOf(i) {
  if (i.state === 'OPEN') return 'offen';
  return i.stateReason === 'NOT_PLANNED' ? 'geschlossen (nicht geplant)' : 'erledigt';
}

function entry(i) {
  const details = [
    statusOf(i),
    'Bearbeiter: ' + (users(i.assignees) || 'niemand'),
    'von @' + i.author.login,
    i.labels.length && 'Labels: ' + i.labels.map((l) => l.name).join(', '),
    i.milestone && 'Meilenstein: ' + i.milestone.title,
    i.comments.length === 1 ? '1 Kommentar' : `${i.comments.length} Kommentare`,
    (i.state === 'OPEN' ? 'zuletzt geändert ' : 'geschlossen ') + date(i.state === 'OPEN' ? i.updatedAt : i.closedAt),
  ].filter(Boolean).map(cell).join(' · ');
  return [`- **[#${i.number}](${i.url}) ${cell(i.title)}**`, `  - ${details}`];
}

function render(issues) {
  const now = new Date();
  const stamp = now.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
  const cutoff = now.getTime() - CLOSED_DAYS * 864e5;
  const open = issues.filter((i) => i.state === 'OPEN').sort((a, b) => a.number - b.number);
  const closed = issues
    .filter((i) => i.state !== 'OPEN' && new Date(i.closedAt).getTime() >= cutoff)
    .sort((a, b) => b.closedAt.localeCompare(a.closedAt));

  const lines = [
    START,
    '## GitHub-Issues',
    '',
    `_Automatisch aus \`vt-tom/dsa5-helpers\` übernommen (${stamp}) — nicht von Hand bearbeiten, `
      + 'wird bei jedem Session-Start überschrieben. Änderungen direkt im Issue auf GitHub vornehmen._',
    '',
    '**Nur zur Information — Agents bearbeiten diese Issues nie von sich aus, sondern nur, '
      + 'wenn der Nutzer ein bestimmtes Issue ausdrücklich beauftragt.**',
    '',
    `**Offen (${open.length})**`,
    '',
    ...(open.length ? open.flatMap(entry) : ['_Keine offenen Issues._']),
  ];
  if (closed.length) {
    lines.push('', `**Kürzlich geschlossen (letzte ${CLOSED_DAYS} Tage)**`, '', ...closed.flatMap(entry));
  }
  lines.push(END);
  return { text: lines.join('\n'), open: open.length, closed: closed.length };
}

function main() {
  let issues;
  try {
    issues = fetchIssues();
  } catch (err) {
    const msg = (err.stderr || err.message || '').toString().trim().split('\n')[0];
    console.log(`GitHub-Issues NICHT synchronisiert (${msg}) — Abschnitt in project/AUFGABEN.md ist evtl. veraltet.`);
    return;
  }
  const { text, open, closed } = render(issues);
  const md = fs.readFileSync(FILE, 'utf8');
  const eol = md.includes('\r\n') ? '\r\n' : '\n';
  const block = text.replace(/\n/g, eol);
  // Abschnitt steht immer ganz unten: alten Block herausnehmen, neuen anhängen.
  let rest = md;
  const s = md.indexOf(START);
  const e = md.indexOf(END);
  if (s !== -1 && e > s) rest = md.slice(0, s).trimEnd() + eol + md.slice(e + END.length).replace(/^\s+/, eol);
  const next = rest.trimEnd().replace(/\r?\n---$/, '').trimEnd() + eol + eol + '---' + eol + eol + block + eol;
  if (next !== md) fs.writeFileSync(FILE, next);
  console.log(`GitHub-Issues synchronisiert: ${open} offen, ${closed} kürzlich geschlossen → Abschnitt „GitHub-Issues“ in project/AUFGABEN.md.`);
}

main();
