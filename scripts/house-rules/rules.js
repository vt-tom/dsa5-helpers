// Hausregelbuch (2026-10-05): optionale Hausregeln, die die SL für die ganze Welt einschaltet. Jede Regel hat einen
// Eintrag hier (Symbol, Urheber — optional, Seite im Buch) und Texte unter DSA5HELPERS.HouseRules.<id>.* in lang/*.json.
// Fenster: scripts/apps/house-rules.js (Ansichten Liste und Buch).
//
// entries (Issue #44): wo die Regel in welchem Bogen startet. sheet = Modul-Bogen (Beschreibung, die Knöpfe stehen in
// den Templates), system = Standardbogen des Systems für Helden und NSC ('skill' = Knopf am Talent findSkill(actor),
// 'header' = Kopfmenü ⋮, 'dialog' = nur über den Probendialog, also in jedem Bogen). Jede neue Regel legt das fest
// (der Test prüft es).
import { initWoundCheck, woundCheck, findTreatWounds } from './wound-check.js';
import { helpAction } from './help-action.js';
import { initSystemSheetEntries, rerenderSystemSheets } from './system-sheet.js';

export { woundCheck, findTreatWounds, helpAction };

const MODULE_ID = 'dsa5-helpers';
export const SETTING = 'houseRules';

export const HOUSE_RULES = [
  {
    id: 'woundCheck', icon: 'fas fa-heart-pulse', credit: 'Knigge', page: `modules/${MODULE_ID}/templates/house-rules/wound-check.hbs`,
    entries: [
      { sheet: 'skills, favorite' },
      { system: 'skill', findSkill: actor => findTreatWounds(actor), tooltip: 'DSA5HELPERS.HouseRules.woundCheck.HintTooltip', run: (app, button) => runWoundCheck(app.actor, button) },
    ],
  },
  {
    id: 'helpAction', icon: 'fas fa-handshake-angle', credit: 'VTTom', page: `modules/${MODULE_ID}/templates/house-rules/help-action.hbs`,
    entries: [
      { sheet: 'quick-actions' },
      { system: 'header', label: 'DSA5HELPERS.HouseRules.helpAction.Button', run: app => helpAction(app.actor, app.getTokenId?.()) },
    ],
  },
];

/** Wundeinschätzung starten; ohne markiertes Ziel nur ein Hinweis am Knopf (beide Bögen). */
export async function runWoundCheck(actor, button) {
  if (!game.user.targets.first()?.actor) {
    if (button) {
      game.tooltip.activate(button, { text: game.i18n.localize('DSA5HELPERS.HouseRules.woundCheck.PickTarget'), direction: 'UP' });
      button.addEventListener('pointerleave', () => game.tooltip.deactivate(), { once: true });
    } else ui.notifications.warn('DSA5HELPERS.HouseRules.woundCheck.PickTarget', { localize: true });
    return;
  }
  await woundCheck(actor);
}

/** Aktive Regeln der Welt als { id: true }. */
export function activeRules() {
  return game.settings.get(MODULE_ID, SETTING) ?? {};
}

export function isRuleActive(id) {
  return !!activeRules()[id];
}

/** Nur die SL: Regel ein- oder ausschalten. */
export async function setRuleActive(id, active) {
  if (!game.user.isGM || !HOUSE_RULES.some(rule => rule.id === id)) return;
  await game.settings.set(MODULE_ID, SETTING, { ...activeRules(), [id]: !!active });
}

/** Einstellung + Hooks aller Regeln (init). Das Fenster zeichnet sich bei jeder Änderung neu, auch bei Spielern. */
export function registerHouseRules() {
  game.settings.register(MODULE_ID, SETTING, {
    scope: 'world', config: false, type: Object, default: {},
    // Buch neu zeichnen und offene Heldenbögen auch — unsere und die des Systems (#44) —, damit z. B. der Hinweis an
    // Heilkunde Wunden sofort erscheint bzw. verschwindet.
    onChange: () => {
      for (const app of foundry.applications.instances.values()) {
        if (app.id === 'dsa5-helpers-house-rules' || (app.rendered && app.options?.classes?.includes('dsa5-helpers-sheet'))) app.render();
      }
      rerenderSystemSheets();
    },
  });
  initWoundCheck(() => isRuleActive('woundCheck'));
  initSystemSheetEntries(HOUSE_RULES, isRuleActive);
}
