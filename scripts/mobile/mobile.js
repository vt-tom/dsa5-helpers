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

/** „Mehr“-Blatt (MOBILE.md 14, Ü4): die Reiter ab dem fünften als Kacheln, dazu Bogen-Thema und Bogen wechseln. */
function openMoreSheet(el) {
  const rail = el.querySelector('nav.dsa5h-rail');
  const tabs = [...rail.querySelectorAll('.dsa5h-rail-btn')].slice(4);
  const wrap = document.createElement('div');
  wrap.className = 'dsa5h-m-more-backdrop';
  const tile = b => `<button type="button" data-tab="${b.dataset.tab}"${b.classList.contains('active') ? ' class="active"' : ''}>
    <img src="${b.querySelector('img')?.getAttribute('src') ?? ''}" alt=""><span>${foundry.utils.escapeHTML(b.querySelector('.dsa5h-rail-label')?.textContent ?? '')}</span></button>`;
  const theme = el.querySelector('.header-control[data-action="dsa5hTheme"]');
  const switcher = el.querySelector('.dsa5h-sheet-switcher');
  wrap.innerHTML = `<div class="dsa5h-m-more-sheet" role="dialog" aria-label="${game.i18n.localize('DSA5HELPERS.Mobile.More')}">
    <div class="dsa5h-m-grip"></div>
    <div class="dsa5h-m-more-tiles">${tabs.map(tile).join('')}</div>
    <div class="dsa5h-m-more-actions">
      ${theme ? `<button type="button" data-do="theme"><i class="${theme.querySelector('i')?.className ?? theme.className.replace(/header-control|icon/g, '')}" inert></i> ${game.i18n.localize('DSA5HELPERS.Theme')}</button>` : ''}
      ${switcher ? `<button type="button" data-do="switch"><i class="fa-solid fa-arrow-right-arrow-left" inert></i> ${game.i18n.localize('DSA5HELPERS.Mobile.SwitchSheet')}</button>` : ''}
    </div></div>`;
  wrap.addEventListener('click', ev => {
    const b = ev.target.closest('button');
    if (ev.target === wrap || b) wrap.remove();
    if (!b) return;
    if (b.dataset.tab) rail.querySelector(`.dsa5h-rail-btn[data-tab="${b.dataset.tab}"]`)?.click();
    else if (b.dataset.do === 'theme') theme?.click();
    else if (b.dataset.do === 'switch') switcher?.click();
  });
  el.append(wrap);
}

/**
 * Unser Bogen auf dem Smartphone (MOBILE.md 7.1 und 14, Click-Dummy Runde 3): Reiterleiste unten mit 4 Reitern +
 * „Mehr“ (öffnet ein Blatt mit den übrigen Reitern; ist einer davon aktiv, zeigt „Mehr“ dessen Symbol), Kopf klappt
 * beim Scrollen zusammen, Antippen einer Probenzeile würfelt. Läuft nach jedem Rendern, die Reiter selbst bleiben die
 * Knöpfe des Bogens (data-action dsa5hSetTab).
 */
function setupPhoneSheet(el) {
  const rail = el.querySelector('nav.dsa5h-rail');
  if (rail && !rail.querySelector('.dsa5h-m-more')) {
    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'dsa5h-m-more';
    more.innerHTML = `<i class="fa-solid fa-ellipsis" inert></i><img alt="" inert><span class="dsa5h-rail-label">${game.i18n.localize('DSA5HELPERS.Mobile.More')}</span>`;
    rail.append(more);
    const sync = () => {
      const tabs = [...rail.querySelectorAll('.dsa5h-rail-btn')];
      const active = tabs.findIndex(b => b.classList.contains('active'));
      const extra = active >= 4 ? tabs[active] : null;
      more.classList.toggle('current', !!extra);
      more.querySelector('img').src = extra?.querySelector('img')?.src ?? '';
      more.querySelector('.dsa5h-rail-label').textContent = extra ? extra.querySelector('.dsa5h-rail-label')?.textContent : game.i18n.localize('DSA5HELPERS.Mobile.More');
      more.hidden = tabs.length <= 5 && !extra;
    };
    more.addEventListener('click', () => openMoreSheet(el));
    rail.addEventListener('click', ev => { if (ev.target.closest('.dsa5h-rail-btn')) setTimeout(sync, 0); });
    sync();
  }
  if (el.dataset.dsa5hPhone) return;
  el.dataset.dsa5hPhone = '1';
  // Kopf einklappen ab 90 px Scrollweg, unter 4 px wieder aufklappen (Click-Dummy-Verhalten)
  el.addEventListener('scroll', ev => {
    if (!ev.target.classList?.contains('dsa5h-content')) return;
    const y = ev.target.scrollTop;
    if (y > 90) el.classList.add('dsa5h-m-compact');
    else if (y < 4) el.classList.remove('dsa5h-m-compact');
  }, true);
  // Zeile antippen würfelt (Frage 14.5, Vorschlag): gilt für Zeilen mit genau einer Probe (Talente, Zauber, Liturgien,
  // Sammelproben), nur im Spielmodus. Das Gegenstandsblatt öffnet der Langdruck über das Kontextmenü („Bearbeiten“).
  el.addEventListener('click', ev => {
    if (el.dataset.mode === 'edit') return;
    const row = ev.target.closest('.dsa5h-content .row.item, .dsa5h-content .row.dsa5h-aggregated-talent');
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
    if (mode === 'phone' && el.classList.contains('dsa5-helpers-sheet')) setupPhoneSheet(el);
  };
  Hooks.on('renderApplicationV2', markWindow);
  Hooks.on('renderApplication', markWindow);
}
