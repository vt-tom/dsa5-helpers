// Journal-Browser des Systems (game.dsa5.apps.journalBrowser, Taste J) auf Smartphone und Tablet
// (docs/MOBILE.md Abschnitt 16, Nutzerentscheidung 2026-11-12: 8.1.0, Freigabe für Spieler wie im System, Zugang über
// das Journal-Verzeichnis). Vorlagen und Logik bleiben beim System; wir setzen nur Zustandsklassen für das CSS und
// lösen dessen eigene Knöpfe aus.
// - Smartphone: eine Spalte. Das Inhaltsverzeichnis liegt über dem Text und öffnet über „Inhalt ▾“ in einer Leiste
//   unten („‹ · Inhalt ▾ · › · ⋮“); „⋮“ enthält Bibliothek, Verlauf und Schriftgröße.
// - Tablet: zwei Spalten wie am Desktop, nur größere Bedienelemente (CSS).
// - Beide: Antippen eines Bilds öffnet die Bildanzeige des Systems (am Desktop per Rechtsklick).
// Das System tauscht Inhaltsverzeichnis und Kapitel per jQuery aus, ohne neu zu rendern (loadPage, showJournal); ein
// MutationObserver hält die Zustandsklassen deshalb aktuell.
const L = key => game.i18n.localize(`DSA5HELPERS.Mobile.JournalBrowser.${key}`);
const esc = s => foundry.utils.escapeHTML(String(s ?? ''));
const observed = new WeakSet();

function isBrowser(app, el) {
  return app === game.dsa5?.apps?.journalBrowser || el.classList.contains('bookWizardsheet');
}

const phone = () => document.body.classList.contains('dsa5h-phone');
// Knopf des Systems (liegt in der Leiste unter dem Inhaltsverzeichnis) – wir lösen ihn nur aus.
const sysButton = (el, action, direction) =>
  el.querySelector(`.tocPageNav [data-action="${action}"]${direction ? `[data-direction="${direction}"]` : ''}`);
const usable = b => !!b && !b.hidden && !b.disabled;

// Ob „movePage“ des Systems in diese Richtung etwas tut – dieselbe Prüfung wie DSA5 8.2.1 (_movePage): nächste/vorige
// Seite im Kapitel, sonst erste Seite des Nachbarkapitels; Vorbereitung („prep“) und Foundry-Hinweise („foundryUsage“)
// blättert das System nicht. Ohne diese Sperre bleibt ein Tipp z. B. auf der Startseite eines Abenteuers wirkungslos
// (Rückmeldung 2026-11-13, Tablet). Bei unbekanntem Aufbau (System-Update) lieber freigeben.
function canMove(app, dir) {
  try {
    const pages = chapter => app.journals.filter(j => j.flags.dsa5.parent == chapter)
      .sort((a, b) => (a.flags.dsa5.sort > b.flags.dsa5.sort ? 1 : -1));
    const chapters = app.bookData.chapters.flatMap(c => c.content.map(f => f.name));
    let chapter = app.selectedChapter;
    let list = pages(chapter);
    let i = list.findIndex(j => j._id == app.selectedSubChapter) + (dir === 'next' ? 1 : -1);
    if (i < 0 || i >= list.length) {
      chapter = chapters[chapters.indexOf(chapter) + (dir === 'next' ? 1 : -1)];
      if (!chapter) return false;
      list = pages(chapter);
      i = 0;
    }
    return !['prep', 'foundryUsage'].includes(chapter) && !!list[i];
  } catch {
    return true;
  }
}

function closeMore() {
  document.querySelector('.dsa5h-m-sheet-backdrop.dsa5h-m-jbmore')?.remove();
}

// „⋮“: die übrigen Knöpfe der System-Leiste als Blatt von unten
function openMore(el) {
  closeMore();
  const items = [
    ['library', null, game.i18n.localize('Book.home')],
    ['navigateHistory', 'back', game.i18n.localize('Book.historyBack')],
    ['navigateHistory', 'forward', game.i18n.localize('Book.historyForward')],
    ['increaseFontSize', null, game.i18n.localize('SHEET.increaseFontSize')],
  ].filter(([action, dir]) => usable(sysButton(el, action, dir)));
  const wrap = document.createElement('div');
  wrap.className = 'dsa5h-m-sheet-backdrop dsa5h-m-jbmore';
  wrap.innerHTML = `<div class="dsa5h-m-sheet" role="dialog" aria-label="${esc(L('More'))}">
    <div class="dsa5h-m-grip"></div>
    <strong class="dsa5h-m-sheet-title">${esc(game.i18n.localize('Book.Wizard'))}</strong>
    ${items.map(([action, dir, label]) => `<button type="button" class="dsa5h-m-wide" data-jb="${action}" data-dir="${dir ?? ''}">${esc(label)}</button>`).join('')}
  </div>`;
  wrap.addEventListener('click', ev => {
    if (ev.target === wrap) return closeMore();
    const b = ev.target.closest('[data-jb]');
    if (!b) return;
    // Schriftgröße bleibt offen (mehrmals tippen), alles andere wechselt die Ansicht
    if (b.dataset.jb !== 'increaseFontSize') { closeMore(); setToc(el, false); }
    sysButton(el, b.dataset.jb, b.dataset.dir || null)?.click();
  });
  document.body.append(wrap);
}

function ensureNav(el) {
  let nav = el.querySelector(':scope .window-content > .dsa5h-m-jbnav');
  if (nav) return nav;
  nav = document.createElement('nav');
  nav.className = 'dsa5h-m-jbnav';
  nav.innerHTML = `<button type="button" data-jbdir="previous" aria-label="${esc(L('Prev'))}">‹</button>
    <button type="button" class="dsa5h-m-jbtoc" aria-expanded="false"><span></span><b aria-hidden="true">▾</b></button>
    <button type="button" data-jbdir="next" aria-label="${esc(L('Next'))}">›</button>
    <button type="button" class="dsa5h-m-jbmorebtn" aria-haspopup="dialog" aria-label="${esc(L('More'))}">⋮</button>`;
  nav.addEventListener('click', ev => {
    const b = ev.target.closest('button');
    if (!b || b.disabled) return;
    if (b.classList.contains('dsa5h-m-jbtoc')) return setToc(el, !el.classList.contains('dsa5h-m-jb-tocopen'));
    if (b.classList.contains('dsa5h-m-jbmorebtn')) return openMore(el);
    setToc(el, false);
    sysButton(el, 'movePage', b.dataset.jbdir)?.click();
  });
  el.querySelector('.window-content')?.append(nav);
  return nav;
}

function setToc(el, open) {
  el.classList.toggle('dsa5h-m-jb-tocopen', open);
  el.querySelector('.dsa5h-m-jbtoc')?.setAttribute('aria-expanded', String(open));
}

// Zustand aus dem DOM lesen: Bibliothek (Seitenleiste mit Suche), Buch-Startseite (Cover), Kapitel/Seite
function update(el, app) {
  const library = !!el.querySelector('.tocList .library-sidebar');
  const start = !library && !!el.querySelector('.chapter .cover');
  const before = el.dataset.dsa5hJb;
  const state = library ? 'library' : start ? 'start' : 'page';
  el.dataset.dsa5hJb = state;
  el.classList.toggle('dsa5h-m-jb-library', library);
  // Blätter-Knöpfe des Systems sperren, wo sie nichts bewirken (Tablet nutzt sie direkt, Smartphone über die Leiste)
  const movable = {};
  for (const dir of ['previous', 'next']) {
    const b = sysButton(el, 'movePage', dir);
    movable[dir] = !library && !!b && !b.hidden && canMove(app, dir);
    if (b && b.disabled === movable[dir]) b.disabled = !movable[dir];
  }
  if (!phone()) return;
  // Inhaltsverzeichnis: auf der Buch-Startseite offen, sonst nach jedem Seitenwechsel zu
  if (state !== before) setToc(el, state === 'start');
  const nav = ensureNav(el);
  nav.hidden = library;
  const heading = el.querySelector('.chapter h1');
  const title = heading ? [...heading.childNodes].filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.textContent).join('').trim() : '';
  const label = state === 'page' && title ? title : L('Contents');
  const span = nav.querySelector('.dsa5h-m-jbtoc > span');
  if (span.textContent !== label) span.textContent = label;
  for (const dir of ['previous', 'next']) {
    const b = nav.querySelector(`[data-jbdir="${dir}"]`);
    const disabled = !movable[dir];
    if (b.disabled !== disabled) b.disabled = disabled;
  }
}

function decorate(app, element) {
  const el = element instanceof HTMLElement ? element : element?.[0];
  if (!el || !isBrowser(app, el)) return;
  el.classList.add('dsa5h-m-jbrowser');
  // Knopf „Hauptverzeichnis“ des Systems (majorButtons, nur Symbol vor dem Titel) bekommt eine Beschriftung fürs CSS,
  // sonst wirkt er wie das Fenstersymbol (Rückmeldung 2026-11-13)
  const home = el.querySelector(':scope > .window-header [data-action="library"]');
  if (home && !home.dataset.dsa5hLabel) {
    home.dataset.dsa5hLabel = L('Library');
    home.setAttribute('aria-label', game.i18n.localize('Book.home'));
  }
  update(el, app);
  if (observed.has(el)) return;
  observed.add(el);
  let queued = false;
  new MutationObserver(records => {
    if (queued || records.every(r => r.target.closest?.('.dsa5h-m-jbnav'))) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(el, app); });
  }).observe(el, { childList: true, subtree: true });
  el.addEventListener('click', ev => {
    // Bild im Text antippen → Bildanzeige des Systems (wie Rechtsklick am Desktop)
    const img = ev.target.closest('.chapter img');
    if (img && !img.closest('a, button, [data-action]')) {
      ev.preventDefault();
      game.dsa5.apps.DSA5_Utility.showArtwork({ name: app.book?.id ?? img.alt ?? '', uuid: '', img: img.getAttribute('src') });
      return;
    }
    // Smartphone: Auswahl im Inhaltsverzeichnis zeigt den Text
    if (phone() && el.classList.contains('dsa5h-m-jb-tocopen') && ev.target.closest('.tocList :is(button, a)')
      && !ev.target.closest('[data-action="fulltextsearch"], [data-action="loadBook"]')) setToc(el, false);
  });
}

/** Im init-Hook aufrufen (nur in der Tablet-/Smartphone-Oberfläche). */
export function initJournalBrowser() {
  Hooks.on('renderApplicationV2', (app, element) => decorate(app, element));
  Hooks.on('closeApplicationV2', app => { if (app === game.dsa5?.apps?.journalBrowser) closeMore(); });
}
