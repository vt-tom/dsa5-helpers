// Mobile Support („Hybrides Spiel“, project/MOBILE.md Abschnitt 13).
// - Welt-Einstellung hybridPlay (nur SL, Standard aus) ist der Hauptschalter: aus = keine Mobil-Logik.
// - Die Oberfläche wird beim Start automatisch gewählt (13.2), überschreibbar per Client-Einstellung uiMode
//   oder Notausgang ?dsa5h-ui=auto|phone|tablet|foundry. Keine Abfrage, kein Umhüllen von setupGame:
//   init läuft vor initializeUI, Body-Klasse und CONFIG.ui-Einträge reichen.
// - „Spielfeld aus“ ist einfach Foundrys Client-Einstellung core.noCanvas (gilt nur für dieses Gerät).
import { initShell } from './shell.js';
import { initCanvasTouch } from './canvas-touch.js';
import { initTouchContext } from './touch-context.js';

export const MODULE_ID = 'dsa5-helpers';
const MODES = ['auto', 'phone', 'tablet', 'foundry'];

/** Aktive Oberfläche dieses Clients: 'phone', 'tablet' oder null (normale Foundry-Oberfläche). */
export let mobileMode = null;

/** Automatische Erkennung (einmal beim Start, Bildschirm statt Fenster, damit Drehen nicht umschaltet). */
export function detectMode() {
  const touch = matchMedia('(any-pointer: coarse)').matches;
  if (!touch) return 'foundry';
  const short = Math.min(screen.width, screen.height), long = Math.max(screen.width, screen.height);
  if (short < 600) return 'phone';
  // Touch-Laptop o. Ä. mit Maus als Hauptzeiger: normale Oberfläche
  if (matchMedia('(pointer: fine)').matches && long >= 1200) return 'foundry';
  return 'tablet';
}

function chosenMode() {
  const q = new URLSearchParams(location.search).get('dsa5h-ui');
  if (MODES.includes(q)) return q;
  return game.settings.get(MODULE_ID, 'uiMode');
}

/**
 * Fenster-Menü „⋮“ oben rechts im Kopf (MOBILE.md 14, Ü3; seit 2026-10-19 ohne Reiter-Kacheln, die Reiterleiste ist
 * wischbar): die Knöpfe der auf dem Smartphone ausgeblendeten Fensterleiste als Blatt von unten — Bogen-Thema,
 * Spieleransicht und die Einträge des Menüs „⋮“ (Bogen konfigurieren, Token, Gefährten-Reiter …). Die Sperre fehlt
 * bewusst, mobil gibt es nur den Spielmodus (#34); „Bogen wechseln“ fehlt, weil das System keinen Handy-Bogen hat.
 * Menü-Einträge sind Knöpfe mit data-action im Bogen-Element, Foundry führt sie wie in der Fensterleiste aus.
 */
function openMenuSheet(el, app) {
  const wrap = document.createElement('div');
  wrap.className = 'dsa5h-m-more-backdrop';
  const theme = el.querySelector('.header-control[data-action="dsa5hTheme"]');
  const playerView = el.querySelector('.header-control[data-action="playerview"]');
  const visible = c => (typeof c.visible === 'function' ? c.visible.call(app) : c.visible ?? true);
  const controls = (app?._getHeaderControls?.() ?? []).filter(c => c.action !== 'detach' && visible(c));
  const esc = foundry.utils.escapeHTML;
  wrap.innerHTML = `<div class="dsa5h-m-more-sheet" role="dialog" aria-label="${game.i18n.localize('DSA5HELPERS.Mobile.Menu')}">
    <div class="dsa5h-m-grip"></div>
    <div class="dsa5h-m-more-actions">
      ${theme ? `<button type="button" data-do="theme"><i class="${theme.querySelector('i')?.className ?? theme.className.replace(/header-control|icon/g, '')}" inert></i> ${game.i18n.localize('DSA5HELPERS.Theme')}</button>` : ''}
      ${playerView ? `<button type="button" data-do="playerview"><i class="${playerView.className.match(/fa-toggle-\w+/) ? `fas ${playerView.className.match(/fa-toggle-\w+/)[0]}` : 'fas fa-toggle-off'}" inert></i> ${game.i18n.localize('SHEET.switchLimited')}</button>` : ''}
    </div>
    ${controls.length ? `<div class="dsa5h-m-more-list">${controls.map(c => `<button type="button" data-action="${esc(c.action)}"><i class="${esc(c.icon ?? '')} fa-fw" inert></i> ${esc(game.i18n.localize(c.label))}</button>`).join('')}</div>` : ''}
    </div>`;
  wrap.addEventListener('click', ev => {
    const b = ev.target.closest('button');
    // Erst nach Foundrys Klick-Verarbeitung entfernen (data-action-Einträge laufen über den Bogen-Handler).
    if (ev.target === wrap || b) setTimeout(() => wrap.remove(), 0);
    if (!b) return;
    if (b.dataset.do === 'theme') theme?.click();
    else if (b.dataset.do === 'playerview') playerView?.click();
  });
  el.append(wrap);
}

/** Aktiven Reiter in der wischbaren Reiterleiste mittig zeigen (nur waagerecht scrollen, nicht die Seite). */
function centerActiveRail(rail, smooth) {
  const active = rail?.querySelector('.dsa5h-rail-btn.active');
  if (!active) return;
  const left = active.offsetLeft - (rail.clientWidth - active.offsetWidth) / 2;
  rail.scrollTo({ left: Math.max(0, left), behavior: smooth ? 'smooth' : 'instant' });
}

/**
 * Große −/+-Regler für LeP, AsP, KaP und Schicksalspunkte (MOBILE.md 14.3, Dummy 09 und 13): in den Zeilen der Grundwerte
 * (main.hbs, data-dsa5h-res) und als Balken unter der Traditionskarte in Magie/Religion. Nur im Spielmodus; der Regler
 * ändert den aktuellen Wert wie das Feld im Kopf (Actor-Update), unter 0 geht es nicht, über das Maximum nur mit
 * dem Feld im Kopf. Wird bei jedem Rendern neu gebaut.
 */
const RESOURCES = { wounds: 'LeP', astralenergy: 'AsP', karmaenergy: 'KaP', fatePoints: 'fatePoints' };
function addResourceSteppers(el, app) {
  const actor = app?.actor;
  if (el.dataset.mode === 'edit' || !actor?.isOwner) return;
  const targets = [...el.querySelectorAll('[data-dsa5h-res]')].map(node => [node, node.dataset.dsa5hRes]);
  const magic = el.querySelector('[data-tab-panel="magic"] .dsa5h-tradition-header');
  const religion = el.querySelector('[data-tab-panel="religion"] .dsa5h-tradition-header');
  if (magic) targets.push([magic, 'astralenergy']);
  if (religion) targets.push([religion, 'karmaenergy']);
  for (const [node, res] of targets) {
    const status = actor.system.status?.[res];
    if (!status || node.querySelector(':scope > .dsa5h-m-stepper')) continue;
    const value = Number(status.value) || 0, max = Number(status.max) || 0;
    const name = game.i18n.localize(res);
    const stepper = document.createElement('span');
    stepper.className = `dsa5h-m-stepper dsa5h-m-res-${res}`;
    stepper.dataset.res = res;
    stepper.innerHTML = `<button type="button" data-step="-1" aria-label="${game.i18n.format('DSA5HELPERS.Mobile.Decrease', { name })}"${value <= 0 ? ' disabled' : ''}>−</button>
      <span class="dsa5h-m-step-bar"><span style="width:${max ? Math.min(100, Math.max(0, value / max * 100)) : 0}%"></span><b>${game.i18n.localize(`CHARAbbrev.${RESOURCES[res]}`)} ${value} / ${max}</b></span>
      <button type="button" data-step="1" aria-label="${game.i18n.format('DSA5HELPERS.Mobile.Increase', { name })}"${value >= max ? ' disabled' : ''}>+</button>`;
    node.append(stepper);
  }
}

/**
 * Ausrüstung auf dem Smartphone (MOBILE.md 14.3, Dummy 15): Kategorie-Chips über den Abschnitten (Taschen und die
 * Abschnitte des Systems mit Inhalt) statt alle Abschnitte untereinander. Die Wahl merkt sich der Bogen (app), eine
 * Suche zeigt wieder alle Abschnitte.
 */
function addInventoryChips(el, app) {
  const tab = el.querySelector('[data-tab-panel="inventory"]');
  if (!tab || tab.querySelector('.dsa5h-m-chips')) return;
  const count = section => section.querySelectorAll(':scope > .dsa5h-inventory-entry, :scope > .dsa5h-bag-tiles > .dsa5h-bag').length;
  const sections = [...tab.querySelectorAll('section[data-dsa5h-section]')].filter(count);
  if (sections.length < 2) return;
  const esc = foundry.utils.escapeHTML;
  const apply = filter => {
    app._dsa5hInvFilter = filter;
    sections.forEach(section => section.classList.toggle('dsa5h-m-filtered', filter !== 'all' && section.dataset.dsa5hSection !== filter));
    bar.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
  };
  const chip = (id, label, n) => `<button type="button" data-filter="${esc(id)}" aria-pressed="false">${esc(label)}${n ? ` <small>${n}</small>` : ''}</button>`;
  const bar = document.createElement('div');
  bar.className = 'dsa5h-m-chips';
  bar.setAttribute('role', 'group');
  bar.innerHTML = chip('all', game.i18n.localize('DSA5HELPERS.Mobile.AllItems'))
    + sections.map(section => chip(section.dataset.dsa5hSection, section.querySelector('.panel-title')?.textContent.trim() ?? '', count(section))).join('');
  bar.addEventListener('click', ev => {
    const b = ev.target.closest('button[data-filter]');
    if (b) apply(b.dataset.filter);
  });
  const search = tab.querySelector('.dsa5h-inventory-summary');
  (search ?? tab.firstElementChild).after(bar);
  search?.querySelector('input')?.addEventListener('input', ev => { if (ev.target.value) apply('all'); });
  apply(sections.some(section => section.dataset.dsa5hSection === app._dsa5hInvFilter) ? app._dsa5hInvFilter : 'all');
}

/**
 * Unser Bogen auf dem Smartphone (MOBILE.md 7.1 und 14, Click-Dummy Runde 3): wischbare Reiterleiste unten, „‹“ und
 * „⋮“ im Kopf, Kopf klappt beim Scrollen zusammen, Antippen einer Probenzeile würfelt. Läuft nach jedem Rendern, die Reiter selbst bleiben die
 * Knöpfe des Bogens (data-action dsa5hSetTab).
 */
function setupPhoneSheet(el, app) {
  // Zurück-Pfeil links im Kopf (Ü3): ersetzt das × der ausgeblendeten Fensterleiste. Der Kopf wird bei jedem Rendern
  // neu gebaut, deshalb hier jedes Mal prüfen.
  const head = el.querySelector('.dsa5h-head');
  if (head && !head.querySelector('.dsa5h-m-back')) {
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'dsa5h-m-back';
    back.setAttribute('aria-label', game.i18n.localize('DSA5HELPERS.Mobile.Close'));
    back.innerHTML = '<i class="fa-solid fa-chevron-left" inert></i>';
    back.addEventListener('click', () => app?.close());
    head.prepend(back);
  }
  // Fenster-Menü „⋮“ rechts im Kopf (Rückmeldung 2026-10-19: ersetzt das „Mehr“-Blatt der Reiterleiste)
  if (head && !head.querySelector('.dsa5h-m-menu')) {
    const menu = document.createElement('button');
    menu.type = 'button';
    menu.className = 'dsa5h-m-menu';
    menu.setAttribute('aria-label', game.i18n.localize('DSA5HELPERS.Mobile.Menu'));
    menu.innerHTML = '<i class="fa-solid fa-ellipsis-vertical" inert></i>';
    menu.addEventListener('click', () => openMenuSheet(el, app));
    head.append(menu);
  }
  // Reiterleiste: alle Reiter in einer waagerecht wischbaren Leiste (Nutzer-Entscheidung 2026-10-19), der aktive steht
  // immer im Bild.
  const rail = el.querySelector('nav.dsa5h-rail');
  if (rail && !rail.dataset.dsa5hPhone) {
    rail.dataset.dsa5hPhone = '1';
    rail.addEventListener('click', ev => { if (ev.target.closest('.dsa5h-rail-btn')) setTimeout(() => centerActiveRail(rail, true), 0); });
    requestAnimationFrame(() => centerActiveRail(rail, false));
  }
  // Titelblatt: Kasten „Statuseffekte | Persönliche Daten“ unter die Favoriten (Rückmeldung 2026-10-19) statt direkt
  // unter die Eigenschaftswürfel. Der Bogen rendert immer komplett neu (ein PARTS-Eintrag), das Verschieben ist also
  // bei jedem Rendern frisch; die Aktionen laufen weiter über data-action im Bogen.
  const sidePanel = el.querySelector('.dsa5h-cover-sidebar .dsa5h-side-tabs-panel');
  const coverTab = el.querySelector('[data-tab-panel="cover"]');
  if (sidePanel && coverTab) coverTab.append(sidePanel);
  addResourceSteppers(el, app);
  addInventoryChips(el, app);
  if (el.dataset.dsa5hPhone) return;
  el.dataset.dsa5hPhone = '1';
  el.addEventListener('click', ev => {
    const button = ev.target.closest('.dsa5h-m-stepper button[data-step]');
    if (!button) return;
    const res = button.closest('.dsa5h-m-stepper').dataset.res;
    const status = app.actor.system.status[res];
    const value = Number(status.value) || 0;
    const next = Number(button.dataset.step) < 0 ? Math.max(0, value - 1) : Math.min(Number(status.max) || 0, value + 1);
    if (next !== value) app.actor.update({ [`system.status.${res}.value`]: next });
  });
  // Kopf einklappen ab 90 px Scrollweg, unter 4 px wieder aufklappen (Click-Dummy-Verhalten)
  el.addEventListener('scroll', ev => {
    if (!ev.target.classList?.contains('dsa5h-content')) return;
    const y = ev.target.scrollTop;
    if (y > 90) el.classList.add('dsa5h-m-compact');
    else if (y < 4) el.classList.remove('dsa5h-m-compact');
  }, true);
  // Zeile antippen würfelt (Frage 14.5, Vorschlag): gilt für Zeilen mit genau einer Probe (Talente, Zauber, Liturgien,
  // Sammelproben, Favoriten-Karten auf dem Titelblatt), nur im Spielmodus. Das Gegenstandsblatt öffnet der Langdruck über das Kontextmenü („Bearbeiten“).
  el.addEventListener('click', ev => {
    if (el.dataset.mode === 'edit') return;
    const row = ev.target.closest('.dsa5h-content .row.item, .dsa5h-content .row.dsa5h-aggregated-talent, .dsa5h-content .dsa5h-fav-card');
    if (!row) return;
    const interactive = ev.target.closest('button, input, select, textarea, label, a, [data-action]');
    if (interactive && !interactive.closest('.withContext')) return;
    const probes = row.querySelectorAll('.dsa5h-skill-probe');
    if (probes.length !== 1) return;
    ev.preventDefault();
    ev.stopPropagation();
    probes[0].click();
  }, true);
}

/** Im init-Hook aufrufen. */
export function initMobile() {
  game.settings.register(MODULE_ID, 'hybridPlay', {
    name: 'DSA5HELPERS.Mobile.Settings.Hybrid.Name', hint: 'DSA5HELPERS.Mobile.Settings.Hybrid.Hint',
    scope: 'world', config: true, restricted: true, type: Boolean, default: false, requiresReload: true,
  });
  const hybrid = game.settings.get(MODULE_ID, 'hybridPlay');
  game.settings.register(MODULE_ID, 'uiMode', {
    name: 'DSA5HELPERS.Mobile.Settings.Mode.Name', hint: 'DSA5HELPERS.Mobile.Settings.Mode.Hint',
    scope: 'client', config: hybrid, type: String, default: 'auto', requiresReload: true,
    choices: Object.fromEntries(MODES.map(m => [m, `DSA5HELPERS.Mobile.Mode.${m}`])),
  });
  if (!hybrid) return;

  const chosen = chosenMode();
  const mode = chosen === 'auto' ? detectMode() : chosen;
  if (mode !== 'phone' && mode !== 'tablet') return;
  mobileMode = mode;

  document.body.classList.add('dsa5h-mobile', `dsa5h-${mode}`);
  // Notch/Home-Indikator: Foundry setzt die Viewport-Meta schon, nur viewport-fit fehlt.
  const meta = document.querySelector('meta[name="viewport"]');
  if (meta && !meta.content.includes('viewport-fit')) meta.content += ', viewport-fit=cover';

  // Foundry meldet unter 1366×768 dauerhaft „Auflösung zu niedrig“ (ClientIssues), mobil immer zutreffend.
  const Base = CONFIG.ui.notifications;
  CONFIG.ui.notifications = class Dsa5hMobileNotifications extends Base {
    notify(message, type, options) {
      if (typeof message === 'string' && message.startsWith('ERROR.RESOLUTION.')) return { id: -1, active: false };
      return super.notify(message, type, options);
    }
  };

  initCanvasTouch();
  initTouchContext();
  Hooks.once('ready', () => {
    initShell(mode, { chosen, detected: detectMode() });
    // „Desktop-Website“ (Chrome/Android u. a.): Der Browser ignoriert die Viewport-Angabe und baut die Seite ~980 px
    // breit auf, alles wird winzig. Abschalten kann das nur der Nutzer (Rückmeldung 2026-10-15).
    if (innerWidth > screen.width * 1.3) ui.notifications.warn('DSA5HELPERS.Mobile.DesktopSite', { localize: true, permanent: true });
  });

  // Fenster (Bögen, Probendialoge, Journal …) bildschirmfüllend; die Kennzeichnung übernimmt das CSS.
  const markWindow = (app, element) => {
    const el = element instanceof HTMLElement ? element : element?.[0];
    if (!el || !(el.classList.contains('window-app') || app.hasFrame)) return;
    el.classList.add('dsa5h-m-window');
    if (mode === 'phone' && el.classList.contains('dsa5-helpers-sheet')) setupPhoneSheet(el, app);
  };
  Hooks.on('renderApplicationV2', markWindow);
  Hooks.on('renderApplication', markWindow);
}
