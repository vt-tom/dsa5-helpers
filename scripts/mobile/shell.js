// Shell der Tablet-/Smartphone-Oberfläche (project/MOBILE.md 13.1, Vorbild clickdummy/mobile, Runde 4):
// Kopfleiste, darunter Foundrys Szene (Canvas bleibt Vollbild), unten die Heldenkarte, schwebende Knöpfe für
// Journal und Chat. Chat und Journal sind Foundrys eigene Seitenleisten-Reiter, die wir als Panel einblenden
// (Smartphone bildschirmfüllend, Tablet als rechte Spalte). Neue Nachrichten zeigt Foundry selbst als
// Chat-Benachrichtigung, solange die Seitenleiste eingeklappt ist — das CSS setzt sie als Sprechblase über den Knopf.
import { centerOn } from './canvas-touch.js';

const MODULE_ID = 'dsa5-helpers';
const L = key => game.i18n.localize(`DSA5HELPERS.Mobile.${key}`);
const esc = s => foundry.utils.escapeHTML(String(s ?? ''));
const HEAD_H = 52;

const state = { mode: null, info: null, panel: null, unread: 0, full: false };
const els = {};

// ----- Helden
function heroActors() {
  const chars = game.actors.filter(a => a.type === 'character');
  return game.user.isGM ? chars.filter(a => a.hasPlayerOwner) : chars.filter(a => a.isOwner);
}

function owners(actor) {
  return game.users.filter(u => !u.isGM && actor.testUserPermission(u, 'OWNER'));
}

function bar(label, res, cls) {
  const max = Number(res?.max) || 0;
  if (!max) return '';
  const val = Number(res.value) || 0;
  const pct = Math.max(0, Math.min(100, Math.round(val / max * 100)));
  return `<span class="dsa5h-m-bar ${cls}"><span class="dsa5h-m-bar-label"><span>${label}</span><span>${val}/${max}</span></span><span class="dsa5h-m-bar-track"><span style="width:${pct}%"></span></span></span>`;
}

function renderHeroes() {
  if (!els.heroList) return;
  const actors = heroActors();
  els.heroList.innerHTML = actors.map(a => {
    const st = a.system.status ?? {};
    const d = a.system.details ?? {};
    let sub = [d.species?.value, d.career?.value].filter(Boolean).map(esc).join(' · ');
    if (game.user.isGM) {
      const os = owners(a);
      const online = os.some(u => u.active);
      sub = `${sub ? `${sub} · ` : ''}<span class="dsa5h-m-dot${online ? ' online' : ''}"></span>${os.map(u => esc(u.name)).join(', ')}`;
    }
    return `<button type="button" class="dsa5h-m-hero" data-actor-id="${a.id}">
      <img src="${esc(a.img)}" alt="">
      <span class="dsa5h-m-hero-info"><span class="dsa5h-m-hero-name">${esc(a.name)}</span><span class="dsa5h-m-hero-sub">${sub}</span>
        <span class="dsa5h-m-bars">${bar('LeP', st.wounds, 'lep')}${bar('AsP', st.astralenergy, 'asp')}${bar('KaP', st.karmaenergy, 'kap')}</span></span>
      <i class="fa-solid fa-chevron-right" inert></i></button>`;
  }).join('') || `<p class="dsa5h-m-empty">${L('NoHeroes')}</p>`;
}

function renderHead() {
  if (!els.title) return;
  els.title.textContent = game.world.title;
  const players = game.users.filter(u => !u.isGM);
  const online = players.filter(u => u.active).length;
  const scene = canvas?.scene?.navName || canvas?.scene?.name;
  els.sub.textContent = [scene, game.i18n.format('DSA5HELPERS.Mobile.Connected', { n: online, total: players.length })].filter(Boolean).join(' · ');
  els.account.textContent = game.user.isGM ? 'SL' : (game.user.name?.[0] ?? '?').toUpperCase();
}

// ----- Kampfreihenfolge (E23): Leiste unter dem Kopf, nur solange ein Kampf mit Teilnehmern läuft.
function renderCombat() {
  if (!els.combat) return;
  const combat = game.combat;
  const turns = combat ? combat.turns.filter(t => t.visible) : [];
  const on = turns.length > 0;
  els.combat.hidden = !on;
  document.body.classList.toggle('dsa5h-m-in-combat', on);
  if (!on) return;
  const current = combat.started ? combat.combatant : null;
  const mine = turns.filter(t => t.isOwner && !game.user.isGM);
  const myTurn = current && mine.includes(current);
  const unrolled = turns.filter(t => t.isOwner && t.initiative === null && (!game.user.isGM || t.hasPlayerOwner === false));
  const round = combat.started ? game.i18n.format('DSA5HELPERS.Mobile.Round', { n: combat.round }) : L('CombatNotStarted');
  els.combat.innerHTML = `<span class="dsa5h-m-cbt-round${myTurn ? ' mine' : ''}">${esc(myTurn ? L('YourTurn') : round)}</span>
    <span class="dsa5h-m-cbt-list">${turns.map(t => `<span class="dsa5h-m-cbt${t === current ? ' current' : ''}${t.isOwner ? ' own' : ''}${t.defeated ? ' defeated' : ''}">
      <img src="${esc(t.img)}" alt="${esc(t.name)}"><b>${t.initiative === null ? '–' : Math.trunc(t.initiative)}</b></span>`).join('')}</span>
    ${unrolled.length && !game.user.isGM ? `<button type="button" data-do="initiative">${esc(L('RollInitiative'))}</button>` : ''}`;
  els.combat.querySelector('.dsa5h-m-cbt.current')?.scrollIntoView({ inline: 'center', block: 'nearest' });
}

// ----- Panels (Seitenleisten-Reiter von Foundry)
function openPanel(tab) {
  if (state.panel === tab) return closePanel();
  state.panel = tab;
  ui.sidebar.changeTab(tab, 'primary');
  if (!ui.sidebar.expanded) ui.sidebar.expand();
  document.body.classList.add('dsa5h-m-panel-open');
  document.body.dataset.dsa5hPanel = tab;
  els.panelTitle.textContent = game.i18n.localize(`DSA5HELPERS.Mobile.Panel.${tab}`);
  if (tab === 'chat') { state.unread = 0; renderBadge(); setTimeout(() => ui.chat.scrollBottom?.(), 50); }
  // Foundry setzt beim Aufklappen den Fokus in die Chat-Eingabe — auf dem Handy öffnet das ungewollt die Tastatur.
  setTimeout(() => document.activeElement?.blur?.(), 0);
}

function closePanel() {
  state.panel = null;
  document.body.classList.remove('dsa5h-m-panel-open');
  delete document.body.dataset.dsa5hPanel;
  if (ui.sidebar.expanded) ui.sidebar.collapse();
}

function renderBadge() {
  els.badge.textContent = state.unread > 9 ? '9+' : String(state.unread);
  els.badge.hidden = state.unread === 0;
  els.chatFab.setAttribute('aria-label', state.unread ? game.i18n.format('DSA5HELPERS.Mobile.ChatUnread', { n: state.unread }) : L('Panel.chat'));
}

// ----- Szene
function ownToken() {
  if (!canvas?.ready) return null;
  const mine = game.user.character?.getActiveTokens?.()[0];
  return mine ?? canvas.tokens.placeables.find(t => t.isOwner && t.actor?.type === 'character') ?? null;
}

function centerMine() {
  const t = ownToken();
  if (!t) return game.user.isGM ? null : ui.notifications.info('DSA5HELPERS.Mobile.NoToken', { localize: true });
  const bottom = state.full ? innerHeight : els.heroes.getBoundingClientRect().top;
  centerOn(t.center, HEAD_H, bottom);
}

function toggleFull() {
  state.full = !state.full;
  document.body.classList.toggle('dsa5h-m-full', state.full);
  els.fullBtn.setAttribute('aria-pressed', String(state.full));
  els.fullBtn.querySelector('i').className = `fa-solid ${state.full ? 'fa-compress' : 'fa-expand'}`;
}

// ----- Konto-Menü
function closeAccount() { els.sheet?.remove(); els.sheet = null; }

async function setAndReload(scope, key, value) {
  await game.settings.set(scope, key, value);
  foundry.utils.debouncedReload();
}

function openAccount() {
  closeAccount();
  const ui_ = game.settings.get(MODULE_ID, 'uiMode');
  const noCanvas = game.settings.get('core', 'noCanvas');
  const uiConfig = game.settings.get('core', 'uiConfig');
  const dark = (uiConfig.colorScheme?.applications || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) === 'dark';
  const opt = (group, value, label, on) => `<button type="button" data-group="${group}" data-value="${value}" aria-pressed="${on}">${esc(label)}</button>`;
  const detected = L(`Mode.${state.info.detected}`);
  const wrap = document.createElement('div');
  wrap.className = 'dsa5h-m-sheet-backdrop';
  wrap.innerHTML = `<div class="dsa5h-m-sheet" role="dialog" aria-label="${esc(L('Account'))}">
    <div class="dsa5h-m-grip"></div>
    <div class="dsa5h-m-me"><span class="dsa5h-m-avatar">${esc(els.account.textContent)}</span><span><strong>${esc(game.user.name)}</strong><small>${esc(game.user.isGM ? L('RoleGM') : L('RolePlayer'))} · ${esc(game.world.title)}</small></span></div>
    <div class="dsa5h-m-setting"><span>${esc(L('Settings.Mode.Name'))}</span><div class="dsa5h-m-seg">
      ${['auto', 'phone', 'tablet'].map(m => opt('mode', m, L(`Mode.${m}`), ui_ === m)).join('')}</div>
      <small>${esc(game.i18n.format('DSA5HELPERS.Mobile.Detected', { mode: detected, w: screen.width, h: screen.height }))}</small></div>
    <div class="dsa5h-m-setting"><span>${esc(L('Theme'))}</span><div class="dsa5h-m-seg">
      ${opt('theme', 'light', L('Light'), !dark)}${opt('theme', 'dark', L('Dark'), dark)}</div></div>
    <div class="dsa5h-m-setting"><span>${esc(L('Scene'))}</span><div class="dsa5h-m-seg">
      ${opt('canvas', 'on', L('On'), !noCanvas)}${opt('canvas', 'off', L('Off'), noCanvas)}</div>
      <small>${esc(L('SceneHint'))}</small></div>
    <button type="button" class="dsa5h-m-wide" data-do="settings"><i class="fa-solid fa-gears" inert></i> ${esc(L('FoundrySettings'))}</button>
    <button type="button" class="dsa5h-m-wide" data-do="desktop"><i class="fa-solid fa-display" inert></i> ${esc(L('ToDesktop'))}</button>
    <button type="button" class="dsa5h-m-wide danger" data-do="logout"><i class="fa-solid fa-right-from-bracket" inert></i> ${esc(L('Logout'))}</button>
  </div>`;
  wrap.addEventListener('click', ev => {
    if (ev.target === wrap) return closeAccount();
    const b = ev.target.closest('button');
    if (!b) return;
    if (b.dataset.group === 'mode') return b.dataset.value !== ui_ && setAndReload(MODULE_ID, 'uiMode', b.dataset.value);
    if (b.dataset.group === 'theme') {
      const cfg = foundry.utils.deepClone(uiConfig);
      cfg.colorScheme = { ...(cfg.colorScheme ?? {}), applications: b.dataset.value, interface: b.dataset.value };
      return game.settings.set('core', 'uiConfig', cfg).then(openAccount);
    }
    if (b.dataset.group === 'canvas') { const off = b.dataset.value === 'off'; return off !== noCanvas && setAndReload('core', 'noCanvas', off); }
    if (b.dataset.do === 'settings') { closeAccount(); return openPanel('settings'); }
    if (b.dataset.do === 'desktop') return setAndReload(MODULE_ID, 'uiMode', 'foundry');
    if (b.dataset.do === 'logout') return game.logOut();
  });
  document.body.append(wrap);
  els.sheet = wrap;
}

// ----- Aufbau
function build() {
  const gm = game.user.isGM;
  const root = document.createElement('div');
  root.id = 'dsa5h-m-shell';
  root.innerHTML = `
    <header class="dsa5h-m-head">
      <img src="systems/dsa5/icons/categories/DSA-Auge.webp" alt="">
      <span class="dsa5h-m-titles"><strong></strong><small></small></span>
      <button type="button" class="dsa5h-m-account" aria-label="${esc(L('Account'))}"></button>
    </header>
    <div class="dsa5h-m-combat" data-do="combat" hidden></div>
    <div class="dsa5h-m-scenebtns">
      <button type="button" data-do="center" aria-label="${esc(L(gm ? 'CenterGM' : 'Center'))}"><i class="fa-solid fa-crosshairs" inert></i></button>
      <button type="button" data-do="full" aria-pressed="false" aria-label="${esc(L('Enlarge'))}"><i class="fa-solid fa-expand" inert></i></button>
    </div>
    <section class="dsa5h-m-heroes">
      <div class="dsa5h-m-heroes-head"><span>${esc(L(gm ? 'HeroesGM' : 'Heroes'))}</span>
        ${gm ? `<button type="button" data-do="request">${esc(L('RequestRoll'))}</button>` : ''}</div>
      <div class="dsa5h-m-hero-list"></div>
    </section>
    <button type="button" class="dsa5h-m-fab journal" data-do="journal" aria-label="${esc(L('Panel.journal'))}"><i class="fa-solid fa-book" inert></i></button>
    <button type="button" class="dsa5h-m-fab chat" data-do="chat"><i class="fa-solid fa-comment" inert></i><span class="dsa5h-m-badge" hidden></span></button>
    <div class="dsa5h-m-panelbar"><span></span><button type="button" data-do="close" aria-label="${esc(L('Close'))}"><i class="fa-solid fa-xmark" inert></i></button></div>`;
  document.body.append(root);
  Object.assign(els, {
    root, title: root.querySelector('.dsa5h-m-titles strong'), sub: root.querySelector('.dsa5h-m-titles small'),
    account: root.querySelector('.dsa5h-m-account'), heroes: root.querySelector('.dsa5h-m-heroes'), heroList: root.querySelector('.dsa5h-m-hero-list'),
    chatFab: root.querySelector('.dsa5h-m-fab.chat'), badge: root.querySelector('.dsa5h-m-badge'),
    fullBtn: root.querySelector('[data-do="full"]'), combat: root.querySelector('.dsa5h-m-combat'), panelTitle: root.querySelector('.dsa5h-m-panelbar span'),
  });
  root.addEventListener('click', ev => {
    const hero = ev.target.closest('.dsa5h-m-hero');
    if (hero) return game.actors.get(hero.dataset.actorId)?.sheet.render(true);
    if (ev.target.closest('.dsa5h-m-account')) return openAccount();
    const act = ev.target.closest('[data-do]')?.dataset.do;
    if (act === 'center') return centerMine();
    if (act === 'full') return toggleFull();
    if (act === 'journal' || act === 'chat') return openPanel(act);
    if (act === 'close') return closePanel();
    if (act === 'initiative') {
      const ids = game.combat?.combatants.filter(c => c.isOwner && c.initiative === null).map(c => c.id) ?? [];
      return ids.length && game.combat.rollInitiative(ids);
    }
    if (act === 'combat') return openPanel('combat');
    if (act === 'request') {
      const svc = game.dsa5?.queries?.RollRequestService;
      return svc?.openRequestDialog ? svc.openRequestDialog() : ui.notifications.warn('DSA5HELPERS.Mobile.NoRequest', { localize: true });
    }
  });
}

/** Im ready-Hook aufrufen. */
export function initShell(mode, info) {
  Object.assign(state, { mode, info });
  build();
  renderHead();
  renderHeroes();
  renderBadge();
  closePanel();
  renderCombat();
  const combatHook = foundry.utils.debounce(renderCombat, 100);
  for (const hook of ['createCombat', 'updateCombat', 'deleteCombat', 'createCombatant', 'updateCombatant', 'deleteCombatant', 'combatTurnChange']) Hooks.on(hook, combatHook);

  const rerender = foundry.utils.debounce(() => { renderHeroes(); renderHead(); }, 150);
  for (const hook of ['createActor', 'deleteActor', 'updateActor', 'userConnected', 'updateUser', 'canvasReady']) Hooks.on(hook, rerender);
  Hooks.on('canvasReady', () => setTimeout(centerMine, 300));
  if (canvas?.ready) setTimeout(centerMine, 300);

  Hooks.on('createChatMessage', message => {
    if (!message.visible || message.isAuthor || state.panel === 'chat') return;
    state.unread += 1;
    renderBadge();
  });
  // Antippen der Sprechblase (Foundrys Chat-Benachrichtigung) öffnet den Chat.
  document.getElementById('chat-notifications')?.addEventListener('click', ev => {
    if (ev.target.closest('button, a, [data-action], .dsa5h-m-msgmenu')) return;
    openPanel('chat');
  });
  // Wird die Seitenleiste anderweitig eingeklappt (z. B. durch Foundry), Panel-Zustand nachziehen.
  Hooks.on('collapseSidebar', (_sidebar, collapsed) => { if (collapsed && state.panel) closePanel(); });
}
