// Mobile Support („Hybrides Spiel“, docs/MOBILE.md Abschnitt 13).
// - Welt-Einstellung hybridPlay (nur SL, Standard aus) ist der Hauptschalter: aus = keine Mobil-Logik.
// - Die Oberfläche wird beim Start automatisch gewählt (13.2), überschreibbar per Client-Einstellung uiMode
//   oder Notausgang ?dsa5h-ui=auto|phone|tablet|foundry. Keine Abfrage, kein Umhüllen von setupGame:
//   init läuft vor initializeUI, Body-Klasse und CONFIG.ui-Einträge reichen.
// - „Spielfeld aus“ ist einfach Foundrys Client-Einstellung core.noCanvas (gilt nur für dieses Gerät).
import { initShell, toggleChat, refreshBadges } from './shell.js';
import { initCanvasTouch } from './canvas-touch.js';
import { initTouchContext } from './touch-context.js';
import { initChat } from './chat.js';
import { initJournal } from './journal.js';
import { isFoundry13 } from '../compat/runtime.js';
import { setPowerCharge } from '../compat/powersource-dialog.js';
import { isRollDialog, setupRollDialog } from './roll-dialog.js';
import { initRollResult } from './roll-result.js';
import { openAlmanac, QUEST_PLACEHOLDER } from '../sheets/almanac.js';

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

/**
 * Kraftspeicher auf Smartphone und Tablet (F2 Variante B, Nutzerentscheidung 2026-10-28, Tablet seit 2026-10-29; Dummy mobile/kraftspeicher.html):
 * statt des Rundmenüs ein Blatt von unten mit allen Speichern, je Zeile −/+ wie die LeP-Regler; jeder Tipp speichert
 * sofort (setPowerCharge). Die Anzeige folgt dem lokalen Stand, die Schreibvorgänge laufen nacheinander.
 */
function openPowerSheet(el, app) {
  const actor = app.actor;
  const segments = actor.powersource?.segments ?? [];
  if (!segments.length || !actor.isOwner) return;
  document.querySelectorAll('.dsa5h-m-power-backdrop').forEach(n => n.remove());
  const loc = key => game.i18n.localize(`DSA5HELPERS.PowerSources.${key}`);
  const esc = foundry.utils.escapeHTML;
  const values = segments.map(s => s.value);
  let queue = Promise.resolve();
  const wrap = document.createElement('div');
  wrap.className = 'dsa5h-m-more-backdrop dsa5h-m-power-backdrop';
  const render = () => {
    const sum = `${values.reduce((a, v) => a + v, 0)} / ${segments.reduce((a, s) => a + s.max, 0)} ${game.i18n.localize('CHARAbbrev.AsP')}`;
    wrap.innerHTML = `<div class="dsa5h-m-more-sheet dsa5h-m-power-sheet" role="dialog" aria-label="${esc(loc('Title'))}">
      <div class="dsa5h-m-grip"></div>
      <div class="dsa5h-m-power-head"><span>${esc(loc('Title'))}</span><small>${esc(sum)}</small><button type="button" data-do="close" aria-label="${esc(game.i18n.localize('DSA5HELPERS.Close'))}"><i class="fa-solid fa-xmark" inert></i></button></div>
      <div class="dsa5h-m-power-list">${segments.map((s, i) => {
        const name = s.itemName ?? s.label, sub = s.name && s.name !== name ? s.name : '';
        return `<div class="dsa5h-m-power-row">
          <span class="dsa5h-m-power-name">${esc(name)}${sub ? `<small>${esc(sub)}</small>` : ''}</span>
          <span class="dsa5h-m-stepper"><button type="button" data-i="${i}" data-step="-1" aria-label="${esc(game.i18n.format('DSA5HELPERS.Mobile.Decrease', { name }))}"${values[i] <= 0 ? ' disabled' : ''}>−</button><output>${values[i]} / ${s.max}</output><button type="button" data-i="${i}" data-step="1" aria-label="${esc(game.i18n.format('DSA5HELPERS.Mobile.Increase', { name }))}"${values[i] >= s.max ? ' disabled' : ''}>+</button></span>
          <span class="dsa5h-m-power-meter" aria-hidden="true"><span style="width:${s.max ? values[i] / s.max * 100 : 0}%"></span></span>
        </div>`;
      }).join('')}</div>
      <p class="dsa5h-m-power-hint">${esc(loc('SavedAtOnce'))}</p>
    </div>`;
  };
  wrap.addEventListener('click', ev => {
    const b = ev.target.closest('button');
    if (ev.target === wrap || b?.dataset.do === 'close') return wrap.remove();
    if (!b?.dataset.step) return;
    const i = Number(b.dataset.i), source = segments[i];
    const next = Math.max(0, Math.min(source.max, values[i] + Number(b.dataset.step)));
    if (next === values[i]) return;
    values[i] = next;
    render();
    wrap.querySelector(`button[data-i="${i}"][data-step="${b.dataset.step}"]:not(:disabled)`)?.focus();
    queue = queue.then(() => setPowerCharge(actor, source, next)).catch(error => {
      console.error('dsa5-helpers | Kraftspeicher konnten nicht gespeichert werden', error);
      ui.notifications.error(loc('SaveFailed'));
    });
  });
  render();
  attachSheet(el, app, wrap);
}

/** Blatt anhängen. Smartphone: im Vollbild-Bogen; Tablet: über allem (der Bogen ist dort ein verschiebbares Fenster), Schließen mit dem Bogen. */
function attachSheet(el, app, wrap) {
  if (document.body.classList.contains('dsa5h-tablet')) {
    document.body.append(wrap);
    const hook = Hooks.on('closeApplicationV2', closed => {
      if (closed !== app && wrap.isConnected) return;
      wrap.remove();
      Hooks.off('closeApplicationV2', hook);
    });
  } else el.append(wrap);
}

/**
 * Personen und Aufträge auf Smartphone und Tablet (F6, E-F2 = A, Nutzerentscheidung 2026-10-29, Issue #67): ein Tipp auf
 * die Karte zeigt den Eintrag als Blatt von unten statt den Almanach zu öffnen. Inhalt wie in der Detailansicht des
 * Almanachs, aufbereitet von dessen Datenmodellen (preparePersonaEntry/prepareQuestEntry: Sichtbarkeit, Geheimnisse nur
 * für die SL, verknüpfte Akteure). Bearbeiten bleibt im Almanach („Im Almanach öffnen“, nur SL).
 */
function almanacSheetOnTap(el, app) {
  el.addEventListener('click', ev => {
    const card = ev.target.closest('[data-action="dsa5hOpenAlmanac"][data-page-uuid][data-entry-key]');
    if (!card) return;
    ev.preventDefault();
    ev.stopPropagation();
    openAlmanacSheet(el, app, card.dataset).catch(error => {
      console.error('dsa5-helpers | Almanach-Eintrag konnte nicht angezeigt werden', error);
      openAlmanac(card.dataset.almanacTab, card.dataset.pageUuid, card.dataset.entryKey);
    });
  }, true);
}

async function openAlmanacSheet(el, app, { almanacTab: tab, pageUuid, entryKey }) {
  const page = await fromUuid(pageUuid);
  const quest = tab === 'questlog';
  const raw = page?.system?.[quest ? 'quests' : 'personae']?.[entryKey];
  const model = CONFIG.JournalEntryPage.dataModels[quest ? 'dsaquestlog' : 'dsapersonaedramatis'];
  if (!raw || !model) throw new Error(`Eintrag ${pageUuid} ${entryKey} fehlt`);
  const entry = foundry.utils.deepClone(raw);
  if (quest) await model.prepareQuestEntry(entry, { page, key: entryKey });
  else await model.preparePersonaEntry(entry, page, entryKey, await model.getHeros?.());
  const esc = foundry.utils.escapeHTML;
  const loc = key => game.i18n.localize(key);
  const section = (title, body) => (body ? `<section class="dsa5h-m-alm-section"><h3>${esc(title)}</h3>${body}</section>` : '');
  let head, body;
  if (quest) {
    const sub = [entry.statusName, entry.chapter, entry.location].map(t => t?.trim?.()).filter(Boolean).join(' · ');
    head = { img: entry.preparedImage || entry.image || QUEST_PLACEHOLDER, name: entry.title, sub, tags: entry.preparedTags };
    const objectives = (entry.preparedObjectives ?? []).map(o => `<li class="${o.done ? 'done' : ''}${o.failed ? ' failed' : ''}"><i class="fas ${esc(o.stateIcon ?? 'fa-circle')}" inert></i><span>${esc(o.text)}</span></li>`).join('');
    body = section(loc('DSAQUESTLOG.summary'), entry.preparedSummary ? `<p>${esc(entry.preparedSummary)}</p>` : '')
      + section(`${loc('DSAQUESTLOG.objectives')} ${entry.totalObjectives ? `(${entry.progressText})` : ''}`, objectives ? `<ul class="dsa5h-m-alm-goals">${objectives}</ul>` : '')
      + section(loc('Description'), entry.preparedDetails ? `<div class="dsa5h-m-alm-text">${entry.preparedDetails}</div>` : '');
  } else {
    head = { img: entry.img || entry.actor?.img, name: entry.name || entry.actor?.name, sub: entry.preparedFactionDisplay || [entry.subtitle, entry.faction].filter(Boolean).join(' · '), tags: entry.preparedTags };
    body = section(loc('Description'), entry.preparedDescription ? `<div class="dsa5h-m-alm-text">${entry.preparedDescription}</div>` : '')
      + section(loc('Notes'), entry.preparedNotes ? `<div class="dsa5h-m-alm-text">${entry.preparedNotes}</div>` : '');
  }
  document.querySelectorAll('.dsa5h-m-alm-backdrop').forEach(n => n.remove());
  const wrap = document.createElement('div');
  wrap.className = 'dsa5h-m-more-backdrop dsa5h-m-power-backdrop dsa5h-m-alm-backdrop';
  wrap.innerHTML = `<div class="dsa5h-m-more-sheet dsa5h-m-alm-sheet" role="dialog" aria-label="${esc(head.name)}">
    <div class="dsa5h-m-grip"></div>
    <div class="dsa5h-m-alm-head">${head.img ? `<img src="${esc(head.img)}" alt="">` : ''}<span><b>${esc(head.name)}</b>${head.sub ? `<small>${esc(head.sub)}</small>` : ''}</span>
      <button type="button" data-do="close" aria-label="${esc(loc('DSA5HELPERS.Close'))}"><i class="fa-solid fa-xmark" inert></i></button></div>
    ${head.tags?.length ? `<div class="dsa5h-m-alm-tags">${head.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
    ${body || `<p class="dsa5h-m-power-hint">${esc(loc('DSA5HELPERS.Almanac.NoText'))}</p>`}
    ${game.user.isGM ? `<button type="button" class="dsa5h-m-alm-open" data-do="almanac"><i class="fa-solid fa-book-open" inert></i> ${esc(loc('DSA5HELPERS.Almanac.OpenEntry'))}</button>` : ''}
  </div>`;
  wrap.addEventListener('click', ev => {
    const b = ev.target.closest('button[data-do]');
    if (ev.target === wrap || b?.dataset.do === 'close') return wrap.remove();
    if (b?.dataset.do === 'almanac') {
      wrap.remove();
      openAlmanac(tab, pageUuid, entryKey);
    }
  });
  attachSheet(el, app, wrap);
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
  // Fenster-Menü „⋮“ und „✕“ rechts im Kopf: ersetzen die ausgeblendete Fensterleiste (Ü3; „⋮“ seit 2026-10-19 statt
  // des „Mehr“-Blatts). Schließen überall mit „✕“ oben rechts (Nutzerentscheidung 2026-10-28, vorher „‹“ links).
  // Der Kopf wird bei jedem Rendern neu gebaut, deshalb hier jedes Mal prüfen.
  const head = el.querySelector('.dsa5h-head');
  if (head && !head.querySelector('.dsa5h-m-menu')) {
    const menu = document.createElement('button');
    menu.type = 'button';
    menu.className = 'dsa5h-m-menu';
    menu.setAttribute('aria-label', game.i18n.localize('DSA5HELPERS.Mobile.Menu'));
    menu.innerHTML = '<i class="fa-solid fa-ellipsis-vertical" inert></i>';
    menu.addEventListener('click', () => openMenuSheet(el, app));
    head.append(menu);
  }
  if (head && !head.querySelector('.dsa5h-m-close')) {
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'dsa5h-m-close';
    close.setAttribute('aria-label', game.i18n.localize('DSA5HELPERS.Mobile.Close'));
    close.innerHTML = '<i class="fa-solid fa-xmark" inert></i>';
    close.addEventListener('click', () => app?.close());
    head.append(close);
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
  powerSheetOnTap(el, app);
  resourcePopOnTap(el, app);
  quantityPopOnTap(el, app);
  almanacSheetOnTap(el, app);
  el.addEventListener('click', ev => {
    const button = ev.target.closest('.dsa5h-m-stepper[data-res] button[data-step]');
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
  // Sammelproben, Favoriten-Karten auf dem Titelblatt), nur im Spielmodus, auch auf den Namen. Langes Drücken öffnet
  // das Blatt des Eintrags (Nutzerentscheidung 2026-10-30).
  longPressOpen(el, app);
  tapToRoll(el, ROLL_ROWS, { nameOpens: false });
}

/** Kugel „KS“ an den AsP: Blatt statt Rundmenü (vor dem Aktions-Handler des Bogens). */
function powerSheetOnTap(el, app) {
  el.addEventListener('click', ev => {
    if (!ev.target.closest('.dsa5h-power-satellite')) return;
    ev.preventDefault();
    ev.stopPropagation();
    openPowerSheet(el, app);
  }, true);
}

/**
 * LeP/AsP/KaP im Kopf auf Smartphone und Tablet (Variante B, Nutzerwahl 2026-10-30; Dummy mobile/ressourcen.html):
 * Antippen einer Kugel öffnet ein kleines Feld darunter mit −/+, Eingabe und −5/0/voll/+5. Jede Änderung speichert
 * sofort (Actor-Update wie das Feld in der Kugel, das mobil nicht mehr antippbar ist). Die Knöpfe bleiben zwischen 0
 * und dem Maximum, eingetippt geht wie bisher auch mehr. Tipp daneben, Scrollen oder Schließen des Bogens schließt es.
 */
const ORB_RES = { 'dsa5h-res-lep': 'wounds', 'dsa5h-res-asp': 'astralenergy', 'dsa5h-res-kap': 'karmaenergy' };
const ORB = '.dsa5h-resource-frame .dsa5h-orb';
function resourcePopOnTap(el, app) {
  el.addEventListener('click', ev => {
    const orb = ev.target.closest(ORB);
    if (!orb || !app.actor?.isOwner) return;
    const res = Object.entries(ORB_RES).find(([cls]) => orb.classList.contains(cls))?.[1];
    if (!res) return;
    ev.preventDefault();
    ev.stopPropagation();
    const actor = app.actor;
    const status = () => actor.system.status[res];
    toggleNumberPop(el, app, orb, {
      key: res,
      name: game.i18n.localize(res),
      anchors: ORB,
      get: () => Number(status().value) || 0,
      max: () => Number(status().max) || 0,
      quick: [{ step: -5 }, { set: 0 }, { set: 'max' }, { step: 5 }],
      write: next => actor.update({ [`system.status.${res}.value`]: next }),
      doc: actor,
    });
  }, true);
  // Die Kugel ist keine Ziehfläche mehr: sonst reicht der Bogen den Tipp an die Fensterleiste weiter, und zwei
  // schnelle Tipps minimieren ihn (Doppelklick). Vorher fing das Eingabefeld der Kugel den Tipp ab.
  for (const type of ['pointerdown', 'dblclick']) {
    el.addEventListener(type, ev => { if (ev.target.closest(ORB)) ev.stopPropagation(); }, true);
  }
}

/**
 * Anzahl in der Ausrüstung (#65, Variante B, Nutzerwahl 2026-10-30; Dummy mobile/ausruestung.html): Das System zählt
 * mit Linksklick hoch und mit Rechtsklick herunter, auf Touch-Geräten fehlt also das Verringern. Antippen der Anzahl
 * öffnet stattdessen dasselbe Feld wie an den LeP-Kugeln mit −/+, Eingabe und −10/+10. Untergrenze 0 wie im System
 * (RuleChaos.increment), keine Obergrenze; Löschen bleibt im Menü „⋮“.
 */
const QUANTITY = '.dsa5h-content [data-action="quantityClick"]';
function quantityPopOnTap(el, app) {
  el.addEventListener('click', ev => {
    const button = ev.target.closest(QUANTITY);
    if (!button) return;
    ev.preventDefault();
    ev.stopPropagation();
    const item = app.actor?.items.get(button.closest('[data-item-id]')?.dataset.itemId);
    if (!item || !app.isEditable) return;
    toggleNumberPop(el, app, button, {
      key: `quantity:${item.id}`,
      name: item.name,
      sub: game.i18n.localize('quantity'),
      anchors: QUANTITY,
      get: () => Number(item.system.quantity?.value) || 0,
      max: () => Infinity,
      quick: [{ step: -10 }, { step: 10 }],
      write: next => item.update({ 'system.quantity.value': next }),
      doc: item,
    });
  }, true);
}

/** Öffnet das Zahlenfeld am Anker oder schließt es, wenn es für denselben Wert schon offen ist. */
function toggleNumberPop(el, app, anchor, opts) {
  const same = document.querySelector('.dsa5h-m-res-pop')?.dataset.key === opts.key;
  closeNumberPop();
  if (!same) openNumberPop(el, app, anchor, opts);
}

let closeNumberPop = () => {};
function openNumberPop(el, app, anchor, { key, name, sub, anchors, get, max, quick, write, doc }) {
  const esc = foundry.utils.escapeHTML;
  let value = get();
  let queue = Promise.resolve();
  const pop = document.createElement('div');
  pop.className = 'dsa5h-m-res-pop';
  pop.dataset.key = key;
  pop.setAttribute('role', 'dialog');
  pop.setAttribute('aria-label', name);
  const quickButton = q => q.set === undefined
    ? `<button type="button" data-step="${q.step}">${q.step > 0 ? '+' : '−'}${Math.abs(q.step)}</button>`
    : `<button type="button" data-set="${q.set}">${q.set === 'max' ? esc(game.i18n.localize('DSA5HELPERS.Mobile.Full')) : q.set}</button>`;
  pop.innerHTML = `<div class="dsa5h-m-res-pop-head"><span>${esc(name)}</span><small></small></div>
    <span class="dsa5h-m-stepper"><button type="button" data-step="-1" aria-label="${esc(game.i18n.format('DSA5HELPERS.Mobile.Decrease', { name }))}">−</button><input type="number" inputmode="numeric" min="0" aria-label="${esc(sub ? `${sub} ${name}` : name)}"><button type="button" data-step="1" aria-label="${esc(game.i18n.format('DSA5HELPERS.Mobile.Increase', { name }))}">+</button></span>
    <div class="dsa5h-m-res-quick">${quick.map(quickButton).join('')}</div>`;
  const input = pop.querySelector('input');
  const sync = () => {
    pop.querySelector('small').textContent = sub ?? game.i18n.format('DSA5HELPERS.Mobile.MaxValue', { max: max() });
    if (document.activeElement !== input) input.value = value;
    pop.querySelectorAll('[data-step]').forEach(b => { b.disabled = Number(b.dataset.step) < 0 ? value <= 0 : value >= max(); });
  };
  const save = next => {
    if (next === value) return sync();
    value = next;
    sync();
    queue = queue.then(() => write(next)).catch(error => {
      console.error('dsa5-helpers | Wert konnte nicht gespeichert werden', error);
      ui.notifications.error(game.i18n.localize('DSA5HELPERS.Mobile.SaveFailed'));
    });
  };
  pop.addEventListener('click', ev => {
    const b = ev.target.closest('button');
    if (!b) return;
    if (b.dataset.set) return save(b.dataset.set === 'max' ? max() : Number(b.dataset.set));
    save(Math.max(0, Math.min(max(), value + Number(b.dataset.step))));
  });
  input.addEventListener('change', () => save(Math.max(0, Math.round(Number(input.value) || 0))));
  input.addEventListener('keydown', ev => { if (ev.key === 'Enter') input.blur(); });
  // Unter dem Anker, waagerecht im Bildschirm gehalten; die Spitze zeigt auf ihn. Reicht der Platz darunter nicht
  // (Ausrüstung weiter unten), steht es darüber.
  document.body.append(pop);
  const rect = anchor.getBoundingClientRect(), width = pop.offsetWidth, height = pop.offsetHeight;
  const center = rect.left + rect.width / 2;
  const left = Math.max(8, Math.min(innerWidth - width - 8, center - width / 2));
  const above = rect.bottom + 10 + height > innerHeight - 8 && rect.top - 10 - height >= 8;
  pop.classList.toggle('dsa5h-m-res-pop-above', above);
  pop.style.left = `${left}px`;
  pop.style.top = `${above ? rect.top - 10 - height : rect.bottom + 10}px`;
  pop.style.setProperty('--tip', `${center - left}px`);
  sync();
  // Nur echte Tipps: der Bogen reicht Tipps in den Kopf als künstliches pointerdown an die Fensterleiste weiter (Ziehen).
  const outside = ev => { if (ev.isTrusted && !pop.contains(ev.target) && !ev.target.closest?.(anchors)) closeNumberPop(); };
  // Nur echtes Scrollen schließt: Nach dem Speichern rendert der Bogen neu und stellt die Scrollposition wieder her,
  // das meldet ebenfalls ein Scroll-Ereignis.
  const top = el.querySelector('.dsa5h-content')?.scrollTop ?? 0;
  const scrolled = ev => { if (ev.target.classList?.contains('dsa5h-content') && Math.abs(ev.target.scrollTop - top) > 24) closeNumberPop(); };
  const hook = doc.documentName === 'Item' ? 'updateItem' : 'updateActor';
  const hooks = [
    [hook, Hooks.on(hook, changed => { if (changed === doc) { value = get(); sync(); } })],
    ['closeApplicationV2', Hooks.on('closeApplicationV2', closed => { if (closed === app) closeNumberPop(); })],
  ];
  document.addEventListener('pointerdown', outside, true);
  el.addEventListener('scroll', scrolled, true);
  closeNumberPop = () => {
    pop.remove();
    document.removeEventListener('pointerdown', outside, true);
    el.removeEventListener('scroll', scrolled, true);
    hooks.forEach(([name, id]) => Hooks.off(name, id));
    closeNumberPop = () => {};
  };
}

const ROLL_ROWS = '.dsa5h-content .row.item, .dsa5h-content .row.dsa5h-aggregated-talent, .dsa5h-content .dsa5h-fav-card';

/**
 * Antippen eines Eintrags mit genau einer Probe würfelt. Knöpfe darin (Stern, Hausregel-Hinweis …) behalten ihre
 * Aktion; der Name (itemEdit) öffnet das Blatt nur mit nameOpens, sonst würfelt auch er.
 */
function tapToRoll(el, selector, { nameOpens }) {
  el.addEventListener('click', ev => {
    if (el.dataset.mode === 'edit') return;
    const row = ev.target.closest(selector);
    if (!row) return;
    const interactive = ev.target.closest('button, input, select, textarea, label, a, [data-action]');
    if (interactive && (nameOpens || !interactive.matches('[data-action="itemEdit"]'))) return;
    const probes = row.querySelectorAll('.dsa5h-skill-probe');
    if (probes.length !== 1) return;
    ev.preventDefault();
    ev.stopPropagation();
    probes[0].click();
  }, true);
}

/**
 * Langes Drücken (500 ms) auf eine Zeile oder Karte mit Eintrag öffnet dessen Blatt; der Klick beim Loslassen würfelt
 * dann nicht. Gilt in allen Modi, nur bei Touch. Ein natives contextmenu (Chrome/Android) während des Drückens wird
 * geschluckt, damit kein zweites Menü aufgeht.
 */
const LONG_PRESS_MS = 500;
function longPressOpen(el, app) {
  let press = null;
  const cancel = () => { clearTimeout(press?.timer); press = null; };
  el.addEventListener('pointerdown', ev => {
    if (ev.pointerType !== 'touch') return;
    const row = ev.target.closest(ROLL_ROWS);
    const item = row?.dataset.itemId && app.actor?.items.get(row.dataset.itemId);
    if (!item || ev.target.closest('input, select, textarea')) return;
    cancel();
    press = { x: ev.clientX, y: ev.clientY, id: ev.pointerId, fired: false };
    press.timer = setTimeout(() => {
      press.fired = true;
      try { navigator.vibrate?.(10); } catch (_) { /* nicht unterstützt */ }
      item.sheet.render(true);
    }, LONG_PRESS_MS);
  }, true);
  el.addEventListener('pointermove', ev => {
    if (press && ev.pointerId === press.id && !press.fired && Math.hypot(ev.clientX - press.x, ev.clientY - press.y) > 10) cancel();
  }, true);
  el.addEventListener('pointercancel', cancel, true);
  // Nach dem Öffnen nur den Klick des Loslassens schlucken (kommt er nicht, geht der nächste Tipp nicht verloren).
  el.addEventListener('pointerup', () => {
    if (!press) return;
    if (!press.fired) return cancel();
    const done = press;
    setTimeout(() => { if (press === done) press = null; }, 400);
  }, true);
  el.addEventListener('contextmenu', ev => {
    if (!press) return;
    ev.preventDefault();
    ev.stopPropagation();
  }, true);
  // Vor tapToRoll registriert, deshalb stopImmediatePropagation (beide hängen am Fenster).
  el.addEventListener('click', ev => {
    if (!press?.fired) return;
    press = null;
    ev.preventDefault();
    ev.stopImmediatePropagation();
  }, true);
}

/**
 * Unser Bogen auf dem Tablet: Chat-Knopf unten in der Reiterleiste (Rückmeldung 2026-10-19: Bogen und Chat gleichzeitig).
 * Ist der Chat offen, rückt das Fenster um die Panel-Breite nach links (Mobil-CSS Abschnitt 8), der Chat steht daneben.
 */
function setupTabletSheet(el, app) {
  // Handler am Fenster nur einmal anhängen; die Reiterleiste dagegen wird bei jedem Rendern neu gebaut.
  if (!el.dataset.dsa5hTablet) {
    el.dataset.dsa5hTablet = '1';
    // Zeilen und Karten wie auf dem Smartphone: antippen würfelt, langes Drücken öffnet das Blatt; zusätzlich öffnet
    // der Name das Blatt wie am Desktop (Rückmeldung 2026-10-29, Nutzerentscheidung 2026-10-30).
    longPressOpen(el, app);
    tapToRoll(el, ROLL_ROWS, { nameOpens: true });
    // Kraftspeicher: Blatt mit −/+ wie auf dem Smartphone statt Rundmenü (Nutzerentscheidung 2026-10-29)
    powerSheetOnTap(el, app);
    resourcePopOnTap(el, app);
    quantityPopOnTap(el, app);
    almanacSheetOnTap(el, app);
  }
  const rail = el.querySelector('nav.dsa5h-rail');
  if (!rail || rail.querySelector('.dsa5h-m-rail-chat')) return;
  const chat = document.createElement('button');
  chat.type = 'button';
  chat.className = 'dsa5h-m-rail-chat';
  chat.setAttribute('aria-label', game.i18n.localize('DSA5HELPERS.Mobile.Panel.chat'));
  chat.innerHTML = `<i class="fa-solid fa-comment" inert></i><span class="dsa5h-rail-label">${game.i18n.localize('DSA5HELPERS.Mobile.Panel.chat')}</span><span class="dsa5h-m-badge" hidden></span>`;
  chat.addEventListener('click', () => toggleChat());
  rail.append(chat);
  refreshBadges();
}

/**
 * Klein = Probendialog des Systems, sonst ohne eigenes Dokument und am Desktop schmaler als 600 px und nicht fest
 * 500 px oder höher (Ladedialog, Statuswert …). Lesefenster wie das Changelog bleiben so Vollbild.
 */
function isSmallWindow(app, el) {
  if (el.querySelector('.dialog-form') || el.matches('.dialog, .dialog-dsa5')) return true;
  if (app.document || app.object instanceof foundry.abstract.Document) return false;
  const ImagePopout = foundry.applications.apps?.ImagePopout;
  if (ImagePopout && app instanceof ImagePopout) return false;
  const { width, height } = app.options?.position ?? app.options ?? {};
  return !(typeof width === 'number' && width >= 600) && !(typeof height === 'number' && height >= 500);
}

function hasMenuControls(app) {
  if (typeof app._getHeaderControls !== 'function') return true;
  const visible = c => (typeof c.visible === 'function' ? c.visible.call(app) : c.visible ?? true);
  return app.document ? true : app._getHeaderControls().some(c => c.action !== 'detach' && visible(c));
}

/** Im init-Hook aufrufen. */
export function initMobile() {
  // Die v13-Ausgabe unterstützt ausschließlich den Desktop-Bogen.
  if (isFoundry13()) return;
  game.settings.register(MODULE_ID, 'hybridPlay', {
    name: 'DSA5HELPERS.Mobile.Settings.Hybrid.Name', hint: 'DSA5HELPERS.Mobile.Settings.Hybrid.Hint',
    scope: 'world', config: false, restricted: true, type: Boolean, default: false, requiresReload: true,
  });
  const hybrid = game.settings.get(MODULE_ID, 'hybridPlay');
  game.settings.register(MODULE_ID, 'uiMode', {
    name: 'DSA5HELPERS.Mobile.Settings.Mode.Name', hint: 'DSA5HELPERS.Mobile.Settings.Mode.Hint',
    scope: 'client', config: false, type: String, default: 'auto', requiresReload: true,
    choices: Object.fromEntries(MODES.map(m => [m, `DSA5HELPERS.Mobile.Mode.${m}`])),
  });
  // Wurfergebnis über dem Bogen (#64): Smartphone immer, Tablet abschaltbar (Nutzerentscheidung 2026-10-30).
  game.settings.register(MODULE_ID, 'rollResultTablet', {
    name: 'DSA5HELPERS.Mobile.Settings.RollResult.Name', hint: 'DSA5HELPERS.Mobile.Settings.RollResult.Hint',
    scope: 'client', config: false, type: Boolean, default: true,
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
  initChat();
  initJournal();
  initRollResult(mode);
  // Anwendungen immer hell (Nutzerentscheidung 2026-10-28): DSA5 hängt seine dunklen Farben an body.theme-dark, auf
  // dem Pergament ist der Text dann kaum lesbar (auch am Desktop). Foundry setzt die Klasse bei jeder Änderung von
  // core.uiConfig neu, daher danach erneut. Die Oberfläche (Seitenleiste, Panels) hat ein eigenes Thema.
  const lightApps = () => document.body.classList.replace('theme-dark', 'theme-light');
  Hooks.once('ready', lightApps);
  Hooks.on('clientSettingChanged', key => { if (key === 'core.uiConfig') setTimeout(lightApps, 0); });
  Hooks.once('ready', () => {
    initShell(mode, { chosen, detected: detectMode() });
    // „Desktop-Website“ (Chrome/Android u. a.): Der Browser ignoriert die Viewport-Angabe und baut die Seite ~980 px
    // breit auf, alles wird winzig. Abschalten kann das nur der Nutzer (Rückmeldung 2026-10-15).
    if (innerWidth > screen.width * 1.3) ui.notifications.warn('DSA5HELPERS.Mobile.DesktopSite', { localize: true, permanent: true });
  });

  // Fenster (Bögen, Probendialoge, Journal …) bildschirmfüllend; die Kennzeichnung übernimmt das CSS.
  // Kleine Fenster ohne Dokument werden Blätter von unten (MOBILE.md 15.3, Schritt 2); „⋮“ entfällt, wenn sein Menü
  // nur „Fenster lösen“ enthielte (mobil ohne Sinn).
  const markWindow = (app, element) => {
    const el = element instanceof HTMLElement ? element : element?.[0];
    if (!el || !(el.classList.contains('window-app') || app.hasFrame)) return;
    el.classList.add('dsa5h-m-window');
    el.classList.toggle('dsa5h-m-sheetwin', isSmallWindow(app, el));
    el.classList.toggle('dsa5h-m-noctrl', !hasMenuControls(app));
    // Systemfenster immer hell, auch bei dunklem Blatt-Thema je Dokument (siehe lightApps unten). Unser Bogen hat ein
    // eigenes Thema. Dunkles Thema mobil später überarbeiten (AUFGABEN.md).
    if (!el.classList.contains('dsa5-helpers-sheet')) {
      el.classList.remove('theme-dark');
      el.classList.add('themed', 'theme-light');
    }
    if (isRollDialog(app, el)) setupRollDialog(el, app);
    if (mode === 'phone' && el.classList.contains('dsa5-helpers-sheet')) setupPhoneSheet(el, app);
    if (mode === 'tablet' && el.classList.contains('dsa5-helpers-sheet')) setupTabletSheet(el, app);
  };
  Hooks.on('renderApplicationV2', markWindow);
  Hooks.on('renderApplication', markWindow);
}
