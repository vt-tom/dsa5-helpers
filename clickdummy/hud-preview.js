// DSA-Leiste (Design-Referenz für scripts/hud.js): Modul-Reiter der Systemleiste in Variante B (Nutzer-Entscheidung
// 2026-10-28 aus Heute/A/B/C). Links die Hausregel-Aktionen des Tokens als Kacheln mit Kurznamen, Zustand als
// Leuchten/Abzeichen; rechts eine schmale Spalte mit den Modul-Knöpfen. Nur Demo-Zustände, keine Regeln.
(() => {
  const SYS = '../../../systems/dsa5/icons/categories/';
  const state = { creature: false, stance: false, aim: 0, weakness: 0, defense: 'best' };
  const DEFENSE = ['manual', 'best', 'dodge'];
  const DEFENSE_LABEL = { manual: 'selbst', best: 'beste', dodge: 'Ausweichen' };

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    }
    node.append(...[].concat(children).filter(c => c !== null && c !== undefined && c !== false));
    return node;
  }

  // Einträge wie hudEntries() im Modul (Font Awesome gibt es nur in Foundry, hier Zeichen als Ersatz).
  function entries() {
    const list = [
      { id: 'settings', group: 'module', glyph: '⚙', name: 'Einstellungen' },
      { id: 'houseRules', group: 'module', glyph: '📖', name: 'Hausregelbuch' },
      { id: 'diceStats', group: 'module', glyph: '🎲', name: 'Würfelstatistik' },
    ];
    if (!state.creature) list.push(
      { id: 'help', group: 'rules', glyph: '🤝', name: 'Helfen', short: 'Helfen' },
      { id: 'woundCheck', group: 'rules', glyph: '♥', name: 'Wundeinschätzung', short: 'Wunden' },
      { id: 'stance', group: 'rules', glyph: '🛡', name: 'Verteidigungshaltung', short: 'Haltung', on: state.stance },
      { id: 'aim', group: 'rules', glyph: '◎', name: 'Zielen', short: 'Zielen', on: state.aim > 0, badge: `${state.aim}/2` },
      { id: 'weakness', group: 'rules', glyph: '🔍', name: 'Schwachpunkte erkennen', short: 'Schwachp.', on: state.weakness > 0, badge: state.weakness ? String(state.weakness) : '' },
    );
    list.push({ id: 'defense', group: 'rules', glyph: '⛨', name: 'Passive Verteidigung', short: 'Abwehr', on: state.defense !== 'manual', badge: DEFENSE_LABEL[state.defense] });
    return list;
  }

  function act(id) {
    if (id === 'stance') state.stance = !state.stance;
    else if (id === 'aim') state.aim = (state.aim + 1) % 3;
    else if (id === 'weakness') state.weakness = (state.weakness + 1) % 3;
    else if (id === 'defense') state.defense = DEFENSE[(DEFENSE.indexOf(state.defense) + 1) % DEFENSE.length];
    else return flash(entries().find(e => e.id === id)?.name);
    render();
  }

  // Modul-Knöpfe und Aktionen ohne Zustand öffnen in Foundry ein Fenster; hier nur ein kurzer Hinweis.
  function flash(text) {
    const note = document.querySelector('.hudp-note');
    if (!note) return;
    note.textContent = `„${text}“ öffnet in Foundry das jeweilige Fenster.`;
    clearTimeout(flash.timer);
    flash.timer = setTimeout(() => { note.textContent = ''; }, 2200);
  }

  function tile(e) {
    return el('button', { type: 'button', class: `hudp-tile named${e.on ? ' active' : ''}`, title: e.name, 'aria-label': e.name, 'aria-pressed': e.on === undefined ? null : String(!!e.on), onclick: () => act(e.id) },
      [el('span', { class: 'hudp-glyph' }, e.glyph), el('span', { class: 'hudp-short' }, e.short), e.badge ? el('span', { class: 'hudp-badge' }, e.badge) : null]);
  }

  // Nachbau der Systemleiste: Reiter (System-Symbole), unser Feder-Reiter aktiv, darunter der Abschnitt.
  function bar() {
    const all = entries();
    const tabs = ['Meleeweapon', 'Rangeweapon', 'Spell', 'Liturgy', 'Equipment'].map(name => el('span', { class: 'hudp-tab' }, el('img', { src: `${SYS}${name}.webp`, alt: '' })));
    tabs.push(el('span', { class: 'hudp-tab active', title: 'DSA5 Helpers' }, '🪶'), el('span', { class: 'hudp-tab' }, '</>'));
    return el('div', { class: 'hudp-bar' }, [
      el('div', { class: 'hudp-tabs' }, tabs),
      el('div', { class: 'hudp-section hudp-b' }, [
        el('div', { class: 'hudp-actions' }, all.filter(e => e.group === 'rules').map(tile)),
        el('div', { class: 'hudp-side' }, all.filter(e => e.group === 'module').map(e => el('button', { type: 'button', class: 'hudp-mini', title: e.name, 'aria-label': e.name, onclick: () => flash(e.name) }, e.glyph))),
      ]),
    ]);
  }

  function controls() {
    return el('div', { class: 'hudp-controls' }, [
      el('span', { class: 'hudp-title' }, 'DSA-Leiste · Reiter DSA5 Helpers'),
      el('button', { type: 'button', 'aria-pressed': String(state.creature), onclick: () => { state.creature = !state.creature; render(); } }, state.creature ? 'Token: Kreatur' : 'Token: Held'),
      el('button', { type: 'button', class: 'hudp-close', 'aria-label': 'Schließen', onclick: close }, '✕'),
    ]);
  }

  let root = null;
  function render() {
    if (!root) return;
    root.replaceChildren(controls(), bar(), el('p', { class: 'hudp-note', 'aria-live': 'polite' }));
  }
  function open() {
    root ??= document.body.appendChild(el('div', { class: 'hudp', role: 'region', 'aria-label': 'DSA-Leiste' }));
    render();
  }
  function close() { root?.remove(); root = null; }

  document.getElementById('hudPreviewBtn')?.addEventListener('click', () => (root ? close() : open()));
  if (new URLSearchParams(location.search).has('hud')) open();
})();
