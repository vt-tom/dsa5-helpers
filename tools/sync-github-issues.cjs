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
const date = iso => iso.slice(8, 10) + '.' + iso.slice(5, 7) + '.';
const link = i => `[#${i.number}](${i.html_url})`;
const CLOSED_SHOWN = 8;

/**
 * Reads the manual part: the version from the title, and for each section where issues are
 * mentioned and how many entries start with Du/KI. Numbered "## N. …" sections are phases of
 * the current version; the last phase ("Fertig …") may still hold closed issues.
 */
function scan(manual) {
  const version = /^#\s.*?(\d+\.\d+\.\d+)/m.exec(manual)?.[1] || null;
  const where = new Map();
  const sections = [];
  let h2;
  let current;
  for (const line of manual.split(/\r?\n/)) {
    const h = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (h) {
      const phase = h[1] === '##' ? /^\d+\.\s/.test(h[2]) : h2?.phase;
      const title = h[2].replace(/^\d+\.\s*/, '');
      current = { name: h[1] === '##' ? title : `${h2?.name} – ${title}`, phase,
        done: phase && /fertig/i.test(title), user: 0, agent: 0, total: 0 };
      if (h[1] === '##') h2 = current;
      sections.push(current);
      continue;
    }
    if (!current) continue;
    const item = /^- (?:\[[ xX]\] )?(\S*)/.exec(line);
    if (item) {
      current.total++;
      if (item[1].startsWith('Du:')) current.user++;
      if (item[1].startsWith('KI:')) current.agent++;
    }
    for (const m of line.matchAll(/(?:(?<![\w/.])#|\/issues\/)(\d+)\b(?!-)/g)) {
      const n = Number(m[1]);
      if (!where.has(n)) where.set(n, []);
      if (!where.get(n).includes(current)) where.get(n).push(current);
    }
  }
  return { version, where, sections: sections.filter(x => x.total || x.phase) };
}
/** Where the issue stands in the list, with a Achtung: note for each mismatch against GitHub. */
function inList(i, { version, where }) {
  const places = where.get(i.number) || [];
  const notes = [];
  if (i.state === 'open' && !places.length) notes.push('fehlt in der Liste');
  const notDone = places.filter(p => !p.done);
  if (i.state === 'closed' && notDone.length) notes.push('geschlossen, steht noch hier');
  if (version && i.state === 'open') {
    const inPhase = places.some(p => p.phase);
    if (inPhase && i.milestone?.title !== version) notes.push(`Meilenstein ${version} fehlt`);
    if (!inPhase && places.length && i.milestone?.title === version) notes.push(`Meilenstein ${version}, aber nicht in Phase 1–4`);
  }
  return [cell(places.map(p => p.name).join(', ')), ...notes.map(n => 'Achtung: ' + n)].filter(Boolean).join(' · ');
}
function row(i, list) {
  const labels = i.labels.map(l => typeof l === 'string' ? l : l.name).join(', ');
  return `| ${link(i)} | ${cell(i.title)} | ${cell(i.milestone?.title || '–')} | ${cell(labels || '–')} | ${inList(i, list)} |`;
}
function render(issues, now = new Date(), manual = '') {
  const cutoff = now.getTime() - CLOSED_DAYS * 864e5;
  const list = scan(manual);
  const open = issues.filter(i => i.state === 'open').sort((a, b) => a.number - b.number);
  const closed = issues.filter(i => i.state === 'closed' && Date.parse(i.closed_at) >= cutoff)
    .sort((a, b) => b.closed_at.localeCompare(a.closed_at) || a.number - b.number);
  // Closed issues still listed outside "Fertig …" are shown regardless of age.
  const stale = issues.filter(i => i.state === 'closed' && inList(i, list).includes('Achtung:'))
    .sort((a, b) => a.number - b.number);
  const head = '| # | Titel | Meilenstein | Labels | In der Liste |\n|---|---|---|---|---|';
  const shown = closed.slice(0, CLOSED_SHOWN).map(i => `${link(i)} ${cell(i.title)} (${statusOf(i)}, ${date(i.closed_at)})`);
  if (closed.length > CLOSED_SHOWN) shown.push(`… und ${closed.length - CLOSED_SHOWN} weitere`);
  return [START, '## Überblick (erzeugt)', '',
    `_Automatisch erzeugt aus GitHub (\`${REPO}\`, Abruf ${now.toISOString()}) und den Abschnitten oben. Nur zur Information, keine Beauftragung. Nicht von Hand bearbeiten._`, '',
    ...(list.sections.length ? ['| Abschnitt | Du | KI | Einträge |', '|---|---|---|---|',
      ...list.sections.map(x => `| ${cell(x.name)} | ${x.user || '–'} | ${x.agent || '–'} | ${x.total} |`), ''] : []),
    `**Offene Issues (${open.length})**`, '',
    ...(open.length ? [head, ...open.map(i => row(i, list))] : ['_Keine offenen Issues._']), '',
    ...(stale.length ? ['**Geschlossen, aber noch in der Liste**', '', head, ...stale.map(i => row(i, list)), ''] : []),
    `**Kürzlich geschlossen (${CLOSED_DAYS} Tage: ${closed.length})**`, '',
    shown.length ? shown.join(' · ') : '_Keine kürzlich geschlossenen Issues._', END].join('\n');
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
    const next = md.slice(0, s) + render(issues, now(), md.slice(0, s)).replace(/\n/g, eol) + md.slice(e + END.length);
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
module.exports = { sync, fetchIssues, render, scan, markers, statusOf, REPO, START, END };
if (require.main === module) main();
