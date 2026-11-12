const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { sync, fetchIssues, render, scan, markers, statusOf, REPO, START, END } = require('../tools/sync-github-issues.cjs');
const now = () => new Date('2026-10-22T09:00:00Z');
function issue(number, extra = {}) {
  return { number, title: `Issue ${number}`, state: 'open', state_reason: null,
    html_url: `https://github.com/${REPO}/issues/${number}`, assignees: [{login:'dev'}],
    labels: [{name:'bug'}], user: {login:'author'}, milestone: {title:'0.6.2'},
    comments: 2, updated_at: '2026-10-21T08:00:00Z', closed_at: null, ...extra };
}
function fixture(t, text) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dsa5h-issue-test-'));
  t.after(() => fs.rmSync(dir, {recursive:true, force:true}));
  const file = path.join(dir, 'AUFGABEN.md');
  fs.writeFileSync(file, text);
  return file;
}
for (const eol of ['\n','\r\n']) test(`Only block changes, repeat without duplicates (${JSON.stringify(eol)})`, t => {
  const prefix = '\ufeff# Manuell'+eol+eol+'- Offen #47  '+eol+eol;
  const suffix = eol+eol;
  const file = fixture(t, prefix+START+eol+'alt'+eol+END+suffix);
  const options = {file, fetch:()=>[issue(47)], now};
  sync(options);
  const first = fs.readFileSync(file, 'utf8');
  assert.ok(first.startsWith(prefix)); assert.ok(first.endsWith(END+suffix));
  assert.equal(first.split(START).length,2);
  assert.equal(first.split('[#47]').length,2);
  if(eol==='\r\n') assert.equal(first.replace(/\r\n/g,'' ).includes('\n'), false);
  sync(options); assert.equal(fs.readFileSync(file,'utf8'),first);
  assert.deepEqual(fs.readdirSync(path.dirname(file)), ['AUFGABEN.md']);
});
for (const text of [START, END+START, START+END+START+END,
  START+END+'\nmanual after block', START+'\n<!-- GITHUB-ISSUES:END -- >',
  START+END+'\n<!-- GITHUB-ISSUES:START', 'no markers']) {
  test(`Reject malformed markers: ${JSON.stringify(text)}`, t => {
    const file=fixture(t,text); let fetched=false;
    assert.throws(()=>sync({file,fetch:()=>{fetched=true;return [];},now}));
    assert.equal(fetched,false); assert.equal(fs.readFileSync(file,'utf8'),text);
  });
}
for(const message of ['offline','authentication required','timeout','invalid JSON']) test(`Fetch failure preserves bytes: ${message}`, t=>{
  const original='manual\r\n'+START+'\r\nlast success\r\n'+END+'\r\n';
  const file=fixture(t,original);
  assert.throws(()=>sync({file,fetch:()=>{throw new Error(message);},now}));
  assert.equal(fs.readFileSync(file,'utf8'),original);
});
test('Concurrent edit is retained; lock and temporary output cleaned', t=>{
  const original=START+'\nold\n'+END+'\n'; const file=fixture(t,original);
  const edited='user edit\n'+original;
  assert.throws(()=>sync({file,fetch:()=>{fs.writeFileSync(file,edited); return [issue(1)];},now}),/geändert/);
  assert.equal(fs.readFileSync(file,'utf8'),edited);
  assert.deepEqual(fs.readdirSync(path.dirname(file)),['AUFGABEN.md']);
});
test('Existing lock prevents competing sync',t=>{
  const original=START+'\n'+END; const file=fixture(t,original);
  fs.writeFileSync(file+'.sync.lock','other process');
  assert.throws(()=>sync({file,fetch:()=>[],now}),{code:'EEXIST'});
  assert.equal(fs.readFileSync(file,'utf8'),original);
  assert.equal(fs.readFileSync(file+'.sync.lock','utf8'),'other process');
});
test('Pagination uses explicit repository and GET, excludes PRs',()=>{
  const calls=[];
  const data=fetchIssues((cmd,args)=>{
    calls.push(args); assert.equal(cmd,'gh'); assert.deepEqual(args.slice(0,3),['api','--method','GET']);
    assert.ok(args[3].startsWith(`repos/${REPO}/issues?`));
    return JSON.stringify(calls.length===1 ? Array.from({length:100},(_,i)=>issue(i+1)) :
      [issue(101),issue(102,{pull_request:{url:'pr'}})]);
  });
  assert.equal(data.length,101); assert.equal(calls.length,2); assert.ok(calls[1][3].endsWith('page=2'));
});
test('Later page error preserves last valid file',t=>{
  const original=START+'\nvalid\n'+END; const file=fixture(t,original); let calls=0;
  assert.throws(()=>sync({file,now,fetch:()=>fetchIssues(()=>{
    if(++calls===1)return JSON.stringify(Array.from({length:100},(_,i)=>issue(i+1)));
    throw new Error('offline page 2');
  })}));
  assert.equal(fs.readFileSync(file,'utf8'),original);
});
test('Invalid/duplicate responses abort',()=>{
  for(const response of [{message:'API error'},[issue(1),issue(1)],[issue(1,{state:'unknown'})]])
    assert.throws(()=>fetchIssues(()=>JSON.stringify(response)));
});
test('Status reasons, cutoff, metadata and escaping',()=>{
  const text=render([issue(1,{title:'*test* <!-- hi -->'}),
    issue(2,{state:'closed',state_reason:'not_planned',closed_at:'2026-10-21T09:00:00Z'}),
    issue(3,{state:'closed',state_reason:'completed',closed_at:'2026-10-08T09:00:00Z'}),
    issue(4,{state:'closed',closed_at:'2026-10-08T08:59:59Z'})],now());
  assert.ok(text.includes('geschlossen (nicht geplant)')); assert.ok(text.includes('erledigt'));
  assert.ok(text.includes('[#3]')); assert.ok(!text.includes('[#4]'));
  for(const value of [REPO,now().toISOString(),'bug','0.6.2']) assert.ok(text.includes(value));
  assert.ok(!text.includes('<!-- hi -->')); markers(text);
  assert.equal(statusOf(issue(5,{state:'closed'})),'geschlossen (Grund nicht angegeben)');
});
test('Phases, owner counts and mismatch notes from the manual part',()=>{
  const manual=['# Aufgaben — 0.6.3','','## 1. Ausdefinieren','- KI: **A** · #1 — x','  dann entscheidest du (zählt nicht)',
    '## 3. Umgesetzt – testen','- [ ] Du: **B** · #2 · [#3](https://github.com/x/y/issues/3) — siehe MOBILE.md#15-abschnitt',
    '## 4. Fertig für Release','- **C** · #4','## Später','### Ideen','- **D** · #5 · #6'].join('\n');
  const {version,sections}=scan(manual);
  assert.equal(version,'0.6.3');
  assert.deepEqual(sections.map(x=>[x.name,x.user,x.agent,x.total]),
    [['Ausdefinieren',0,1,1],['Umgesetzt – testen',1,0,1],['Fertig für Release',0,0,1],['Später – Ideen',0,0,1]]);
  const m={title:'0.6.3'};
  const text=render([issue(1,{milestone:null}),issue(2,{milestone:m}),issue(3,{state:'closed',closed_at:'2026-01-01T00:00:00Z'}),
    issue(4,{state:'closed',closed_at:'2026-10-21T09:00:00Z'}),issue(5,{milestone:m}),issue(6),issue(7),issue(15)],now(),manual);
  const line=n=>text.split('\n').find(l=>l.startsWith(`| [#${n}]`))||'';
  assert.ok(line(1).includes('Ausdefinieren · Achtung: Meilenstein 0.6.3 fehlt'));
  assert.ok(!line(2).includes('Achtung:'));
  assert.ok(line(3).includes('Achtung: geschlossen, steht noch hier'));   // old, but still listed outside "Fertig"
  assert.equal(line(4),'');                                          // closed and in "Fertig": no warning row
  assert.ok(line(5).includes('Achtung: Meilenstein 0.6.3, aber nicht in Phase 1–4'));
  assert.ok(!line(6).includes('Achtung:'));                                 // other milestone outside phases is fine
  assert.ok(line(7).includes('Achtung: fehlt in der Liste'));
  assert.ok(line(15).includes('Achtung: fehlt in der Liste'));              // anchors like MOBILE.md#15-… are no issue refs
  assert.ok(text.includes('| Ausdefinieren | – | 1 | 1 |')); markers(text);
});
test('Closed list is capped',()=>{
  const text=render(Array.from({length:10},(_,k)=>issue(k+1,{state:'closed',state_reason:'completed',closed_at:'2026-10-20T09:00:00Z'})),now());
  assert.ok(text.includes('… und 2 weitere'));
});
