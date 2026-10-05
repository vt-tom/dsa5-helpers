// Hausregelbuch (2026-10-05): optionale Hausregeln, die die SL für die ganze Welt einschaltet. Jede Regel hat einen
// Eintrag hier (Symbol, Urheber, Seite im Buch) und Texte unter DSA5HELPERS.HouseRules.<id>.* in lang/*.json.
// Fenster: scripts/apps/house-rules.js (Ansichten Liste und Buch).
import { initWoundCheck } from './wound-check.js';

const MODULE_ID = 'dsa5-helpers';
export const SETTING = 'houseRules';

export const HOUSE_RULES = [
  { id: 'woundCheck', icon: 'fas fa-heart-pulse', credit: 'Knigge', page: `modules/${MODULE_ID}/templates/house-rules/wound-check.hbs` },
];

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
    onChange: () => foundry.applications.instances.get('dsa5-helpers-house-rules')?.render(),
  });
  initWoundCheck(() => isRuleActive('woundCheck'));
}
