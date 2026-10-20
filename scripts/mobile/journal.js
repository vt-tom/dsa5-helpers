// Journal-Einträge im Modul-Design auf Smartphone und Tablet (Entwurf clickdummy/mobile „Foundry Mobil“,
// project/MOBILE.md 13.5). Grundlage bleibt Foundrys Journal-Blatt (bzw. DSAJournalSheet des Systems) im
// Einzelseiten-Modus. Seitenwahl je Gerät (Rückmeldung 2026-10-20):
// - Tablet: Foundrys Inhaltsverzeichnis klassisch links, nur im Modul-Design; unten ‹ › mit den Seitentiteln.
// - Smartphone: Inhaltsverzeichnis ausgeblendet, Steuerleiste unten „‹ · Seite x von y ▾ · ›“, die Mitte öffnet
//   die Seitenliste als Blatt von unten.
// Blättern und Seitenwahl rufen nur die Methoden des Blatts auf.
const L = key => game.i18n.localize(`DSA5HELPERS.Mobile.Journal.${key}`);
const esc = s => foundry.utils.escapeHTML(String(s ?? ''));

function isJournal(app) {
  const Sheet = foundry.applications.sheets.journal?.JournalEntrySheet;
  return !!Sheet && app instanceof Sheet;
}

function visiblePages(app) {
  return Object.values(app._pages ?? {}).filter(p => !p.hidden);
}

function closePicker() {
  document.querySelector('.dsa5h-m-sheet-backdrop.dsa5h-m-jpages')?.remove();
}

function openPicker(app) {
  closePicker();
  const pages = visiblePages(app);
  const wrap = document.createElement('div');
  wrap.className = 'dsa5h-m-sheet-backdrop dsa5h-m-jpages';
  wrap.innerHTML = `<div class="dsa5h-m-sheet" role="dialog" aria-label="${esc(L('Pages'))}">
    <div class="dsa5h-m-grip"></div>
    <strong class="dsa5h-m-sheet-title">${esc(app.document.name)}</strong>
    <div class="dsa5h-m-jpage-list">${pages.map((p, i) => `<button type="button" data-page="${p.id}" aria-current="${p.id === app.pageId}">
      <b>${i + 1}</b><span>${esc(p.name)}</span></button>`).join('')}</div>
  </div>`;
  wrap.addEventListener('click', ev => {
    if (ev.target === wrap) return closePicker();
    const b = ev.target.closest('[data-page]');
    if (!b) return;
    closePicker();
    app.goToPage(b.dataset.page);
  });
  document.body.append(wrap);
}

function decorate(app, el) {
  if (!isJournal(app)) return;
  el.classList.add('dsa5h-m-journal');
  // Mobil immer eine Seite auf einmal (der Mehrseiten-Modus scrollt alle Seiten untereinander)
  if (app.isMultiple) return app.render({ mode: app.constructor.VIEW_MODES.SINGLE });
  const content = el.querySelector('.journal-entry-content');
  const header = content?.querySelector(':scope > .journal-header');
  if (!content || !header) return;
  content.querySelectorAll('.dsa5h-m-jpath, .dsa5h-m-jnav').forEach(n => n.remove());

  const folder = app.document.folder?.name;
  if (folder) header.insertAdjacentHTML('afterbegin', `<span class="dsa5h-m-jpath">${esc(folder)}</span>`);

  const pages = visiblePages(app);
  const index = pages.findIndex(p => p.id === app.pageId);
  if (pages.length < 2 || index < 0) return;
  const phone = document.body.classList.contains('dsa5h-phone');
  const prev = pages[index - 1];
  const next = pages[index + 1];
  const nav = document.createElement('nav');
  nav.className = 'dsa5h-m-jnav';
  nav.innerHTML = phone
    ? `<button type="button" data-dir="prev" aria-label="${esc(prev?.name ?? L('Prev'))}"${prev ? '' : ' disabled'}>‹</button>
      <button type="button" class="dsa5h-m-jpick" aria-haspopup="dialog" aria-label="${esc(L('Pages'))}">
        <span>${esc(game.i18n.format('DSA5HELPERS.Mobile.Journal.PageOf', { n: index + 1, total: pages.length }))}</span><b aria-hidden="true">▾</b></button>
      <button type="button" data-dir="next" aria-label="${esc(next?.name ?? L('Next'))}"${next ? '' : ' disabled'}>›</button>`
    : `<button type="button" data-dir="prev"${prev ? '' : ' disabled'}>‹ ${esc(prev?.name ?? L('Prev'))}</button>
      <button type="button" data-dir="next"${next ? '' : ' disabled'}>${esc(next?.name ?? L('Next'))} ›</button>`;
  nav.addEventListener('click', ev => {
    if (ev.target.closest('.dsa5h-m-jpick')) return openPicker(app);
    const b = ev.target.closest('[data-dir]');
    if (!b || b.disabled) return;
    const target = b.dataset.dir === 'prev' ? prev : next;
    if (target) app.goToPage(target.id);
  });
  content.append(nav);
}

/** Im init-Hook aufrufen (nur in der Tablet-/Smartphone-Oberfläche). */
export function initJournal() {
  Hooks.on('renderApplicationV2', (app, element) => decorate(app, element));
  Hooks.on('closeApplicationV2', app => { if (isJournal(app)) closePicker(); });
}
