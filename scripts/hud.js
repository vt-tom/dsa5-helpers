// Eigenes HUD des Moduls (Nutzer 2026-10-21): ein eigener Reiter in der DSA-Leiste des Systems (unten Mitte, ersetzt
// dort die Makroleiste, Einstellung `dsa5.hotbarv3`). Die Leiste bietet dafür keine Schnittstelle; ihr Reiterwechsel
// (Aktion `categoryFilter`) arbeitet aber generisch über data-filter/data-category. Wir hängen nach jedem Rendern einen
// Reiterknopf und einen Abschnitt an. Zwei Zeilen als Chips mit Namen (Nutzer 2026-10-21, Symbole allein gingen unter):
// oben das Modul (Einstellungen, Hausregelbuch, Würfelstatistik), darunter die aktiven Hausregeln mit ihrem Zustand.
import { isRuleActive, runWoundCheck, findTreatWounds, helpAction, toggleStance, aimRound, recognizeWeakPoints, enabledManeuvers, maneuverSheetData } from './house-rules/rules.js';
import { openHouseRules } from './apps/house-rules.js';
import { openDiceStats } from './apps/dice-stats.js';
import { isEnabled as diceStatsEnabled } from './dice-stats/settings.js';

const KEY = 'dsa5h';
const MODULE_ID = 'dsa5-helpers';

/**
 * Einträge des Reiters, je mit Gruppe ('module' | 'rules'). `actor` ist der gewählte Token-Akteur (fehlt im SL-Modus
 * ohne Token). Abhängigkeiten als Parameter für den Test-Harness. Einstellungen und Hausregelbuch gibt es immer.
 */
export function hudEntries(actor, { active = isRuleActive, maneuvers = enabledManeuvers, diceStats = diceStatsEnabled, treatWounds = findTreatWounds, maneuverState = maneuverSheetData } = {}) {
  const out = [
    { id: 'settings', group: 'module', icon: 'fas fa-gears', label: 'DSA5HELPERS.Hud.Settings' },
    { id: 'houseRules', group: 'module', icon: 'fas fa-book', label: 'DSA5HELPERS.HouseRules.Title' },
  ];
  if (diceStats()) out.push({ id: 'diceStats', group: 'module', icon: 'fas fa-dice-d20', label: 'DSA5HELPERS.DiceStats.Title' });
  const hero = ['character', 'npc'].includes(actor?.type) && actor.isOwner !== false;
  if (hero && active('helpAction')) out.push({ id: 'help', group: 'rules', icon: 'fas fa-handshake-angle', label: 'DSA5HELPERS.HouseRules.helpAction.Button' });
  if (hero && active('woundCheck') && treatWounds(actor)) out.push({ id: 'woundCheck', group: 'rules', icon: 'fas fa-heart-pulse', label: 'DSA5HELPERS.HouseRules.woundCheck.Title' });
  if (hero && active('maneuvers')) {
    const st = maneuverState(actor);
    if (maneuvers().includes('stance')) out.push({ id: 'stance', group: 'rules', icon: 'fas fa-shield-halved', label: 'DSA5HELPERS.HouseRules.maneuvers.stance.Name', tooltip: 'DSA5HELPERS.HouseRules.maneuvers.stance.Toggle', on: !!st?.stance?.active });
    if (maneuvers().includes('aim')) out.push({ id: 'aim', group: 'rules', icon: 'fas fa-bullseye', label: 'DSA5HELPERS.HouseRules.maneuvers.aim.Name', tooltip: 'DSA5HELPERS.HouseRules.maneuvers.aim.Button', on: !!st?.aim?.count, badge: st?.aim ? `${st.aim.count}/${st.aim.max}` : '' });
    if (maneuvers().includes('weakness')) out.push({ id: 'weakness', group: 'rules', icon: 'fas fa-magnifying-glass', label: 'DSA5HELPERS.HouseRules.maneuvers.weakness.Name', tooltip: 'DSA5HELPERS.HouseRules.maneuvers.weakness.HudHint', on: !!st?.weakness?.entries?.length, badge: st?.weakness?.entries?.length ? String(st.weakness.entries.length) : '' });
  }
  return out;
}

/**
 * Moduleinstellungen öffnen, gleich auf der Seite des Moduls. initialCategory wirkt nur beim allerersten Öffnen
 * (Foundry baut die Reiter des Fensters einmal), darum danach changeTab.
 */
async function openModuleSettings() {
  const app = foundry.applications.instances.get('settings-config') ?? new foundry.applications.settings.SettingsConfig({ initialCategory: MODULE_ID });
  await app.render({ force: true });
  try { app.changeTab(MODULE_ID, 'categories'); } catch { /* Kategorie fehlt (keine sichtbaren Einstellungen) */ }
}

function run(id, actor, button) {
  const tokenId = canvas?.tokens?.controlled?.[0]?.id;
  switch (id) {
    case 'settings': return openModuleSettings();
    case 'houseRules': return openHouseRules();
    case 'diceStats': return openDiceStats();
    case 'help': return helpAction(actor, tokenId);
    case 'woundCheck': return runWoundCheck(actor, button);
    case 'stance': return toggleStance(actor);
    case 'aim': return aimRound(actor);
    case 'weakness': return recognizeWeakPoints(actor, tokenId);
  }
}

/** Unseren Reiter zeigen, wie es die Aktion `categoryFilter` der Leiste täte. */
function showSection(root) {
  root.querySelector('.sections')?.classList.add('filterOn');
  root.querySelectorAll('.skillItems').forEach(el => el.classList.toggle('collapsed', el.dataset.category !== KEY));
  root.querySelectorAll('.categoryFilter').forEach(el => el.classList.toggle('active', el.dataset.filter === KEY));
}

function chip(entry, onClick) {
  const li = document.createElement('li');
  li.className = `dsa5h-hud-chip ${entry.group}${entry.on ? ' active' : ''}`;
  li.dataset.tooltip = entry.tooltip ?? entry.label;
  li.dataset.skipfilter = 'true';
  li.innerHTML = `<i class="${entry.icon}" inert></i><span class="dsa5h-hud-name"></span>`;
  li.querySelector('.dsa5h-hud-name').textContent = game.i18n.localize(entry.label);
  if (entry.badge) {
    const badge = document.createElement('span');
    badge.className = 'dsa5h-hud-badge';
    badge.textContent = entry.badge;
    li.append(badge);
  }
  li.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); onClick(li); });
  return li;
}

export function initHud() {
  Hooks.on('renderDSA5Hotbar', (app, element) => {
    const root = element instanceof HTMLElement ? element : element?.[0];
    const filters = root?.querySelector('.categoryFilters > .flexrow');
    const sections = root?.querySelector('.sections');
    if (!filters || !sections || root.querySelector(`[data-filter="${KEY}"]`)) return;
    const entries = hudEntries(app.actor);

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'categoryFilter flexAlignCenter dsa5h-hud-tab';
    tab.dataset.action = 'categoryFilter';
    tab.dataset.filter = KEY;
    tab.dataset.tooltip = 'DSA5HELPERS.Hud.Tab';
    tab.innerHTML = '<i class="fas fa-feather-pointed" inert></i>';
    // Vor dem Makro-Reiter, der bei der Leiste immer der letzte ist.
    filters.insertBefore(tab, filters.querySelector('[data-filter="macro"]'));

    const list = document.createElement('ul');
    list.className = 'skillItems hSection thinscroll collapsed dsa5h-hud';
    list.dataset.category = KEY;
    for (const entry of entries) {
      // Neue Zeile für die Hausregeln, mit kleiner Überschrift davor.
      if (entry.group === 'rules' && !list.querySelector('.dsa5h-hud-group')) {
        const head = document.createElement('li');
        head.className = 'dsa5h-hud-group';
        head.textContent = game.i18n.localize('DSA5HELPERS.Hud.Rules');
        list.append(head);
      }
      list.append(chip(entry, li => run(entry.id, app.actor, li)));
    }
    sections.append(list);

    // Die Leiste kennt unseren Reiter nicht und springt beim Neuzeichnen (Token-Wechsel, Wertänderung) auf ihren
    // ersten zurück. Darum merken wir uns die Wahl selbst und stellen sie nach jedem Rendern wieder her.
    filters.addEventListener('click', event => {
      const filter = event.target.closest('.categoryFilter')?.dataset.filter;
      if (filter) app.dsa5hHudOpen = filter === KEY;
    });
    if (app.dsa5hHudOpen) showSection(root);
  });

  // Einträge hängen an Welt-Einstellungen: Leiste neu zeichnen, wenn eine davon umgeschaltet wird.
  const keys = ['houseRules', 'maneuvers', 'diceStatsEnabled'].map(k => `${MODULE_ID}.${k}`);
  Hooks.on('updateSetting', setting => { if (keys.includes(setting.key)) rerenderHud(); });
  // Verteidigungshaltung/Zielen (Actor-Flag) umgeschaltet: Zustand der Chips nachziehen.
  Hooks.on('updateActor', (actor, changes) => {
    if (changes.flags?.[MODULE_ID] !== undefined && ui.hotbar?.actor === actor) rerenderHud();
  });
}

function rerenderHud() {
  if (ui.hotbar?.rendered) ui.hotbar.render();
}
