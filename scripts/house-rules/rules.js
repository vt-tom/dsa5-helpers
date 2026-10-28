// Hausregelbuch (2026-10-05): optionale Hausregeln, die die SL für die ganze Welt einschaltet. Jede Regel hat einen
// Eintrag hier (Symbol, Urheber — optional, Seite im Buch) und Texte unter DSA5HELPERS.HouseRules.<id>.* in lang/*.json.
// Fenster: scripts/apps/house-rules.js (Ansichten Liste und Buch).
//
// entries (Issue #44): wo die Regel in welchem Bogen startet. sheet = Modul-Bogen (Beschreibung, die Knöpfe stehen in
// den Templates), system = Standardbogen des Systems für Helden und NSC ('skill' = Knopf am Talent findSkill(actor),
// 'header' = Kopfmenü ⋮, 'dialog' = nur über den Probendialog, also in jedem Bogen). Jede neue Regel legt das fest
// (der Test prüft es).
import { initWoundCheck, woundCheck, findTreatWounds } from './wound-check.js';
import { helpAction, initHelpAction } from './help-action.js';
import { initSystemSheetEntries, rerenderSystemSheets } from './system-sheet.js';
import { initManeuvers, toggleStance, aimRound, recognizeWeakPoints, MANEUVER_IDS, SETTING as MANEUVER_SETTING, enabledManeuvers, sheetData as maneuverSheetData } from './maneuvers.js';
import { initHitConsequences } from './hit-consequences.js';
import { initPassiveDefense, defenseChoices, setDefenseMode, openDefenseDialog, defenseMode } from './passive-defense.js';
import { isFoundry13 } from '../compat/runtime.js';

export { woundCheck, findTreatWounds, helpAction, toggleStance, aimRound, recognizeWeakPoints, MANEUVER_IDS, enabledManeuvers, maneuverSheetData, defenseChoices, setDefenseMode, openDefenseDialog, defenseMode };

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
      // Im Systembogen über den Schalter im Talent-Probendialog (#44, Nutzer 2026-10-21: im Kopfmenü ⋮ zu unscheinbar).
      { sheet: 'quick-actions' },
      { system: 'dialog' },
    ],
  },
  {
    // Grundmanöver (Paladose, #45): Modifikatoren über den Probendialog (jeder Bogen); Verteidigungshaltung und Zielen
    // (#48: und Schwachpunkte erkennen) im Kampf-Reiter bzw. im Kopfmenü des Systembogens. Je Manöver ein Schalter auf
    // der Buchseite.
    id: 'maneuvers', icon: 'fas fa-khanda', credit: 'Paladose', page: `modules/${MODULE_ID}/templates/house-rules/maneuvers.hbs`,
    entries: [
      { sheet: 'combat (block)' },
      { system: 'dialog' },
      { system: 'header', label: 'DSA5HELPERS.HouseRules.maneuvers.stance.Toggle', when: () => enabledManeuvers().includes('stance'), run: app => toggleStance(app.actor) },
      { system: 'header', label: 'DSA5HELPERS.HouseRules.maneuvers.aim.Button', when: () => enabledManeuvers().includes('aim'), run: app => aimRound(app.actor) },
      { system: 'header', label: 'DSA5HELPERS.HouseRules.maneuvers.weakness.Button', when: () => enabledManeuvers().includes('weakness'), run: app => recognizeWeakPoints(app.actor, app.token?.id) },
    ],
  },
  {
    // Passive Verteidigung (#56): wirkt bei jedem Angriff auf ein markiertes Ziel, unabhängig vom Bogen. Je Akteur
    // wählbar (Nutzer 2026-10-28): im Kampf-Reiter unseres Bogens, im Menü ⋮ der Systembögen — auch für Kreaturen.
    id: 'passiveDefense', icon: 'fas fa-shield-halved', credit: 'VTTom', page: `modules/${MODULE_ID}/templates/house-rules/passive-defense.hbs`,
    entries: [
      { sheet: 'combat (block)' },
      { system: 'header', label: 'DSA5HELPERS.HouseRules.passiveDefense.Mode.Menu', actorTypes: ['character', 'npc', 'creature'], run: app => openDefenseDialog(app.actor) },
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
  return isRuleSupported(id) && !!activeRules()[id];
}

// Diese beiden Erweiterungen benötigen den erst in DSA8 vorhandenen
// dsa5.prepareRollSituationalModifiers-Hook samt System-Widget.
// Passive Verteidigung: unter DSA7 nicht geprüft (Auflösung über OpposeDSA des Systems).
export const isRuleSupported = (id, legacy = isFoundry13()) => !legacy || !['helpAction', 'maneuvers', 'passiveDefense'].includes(id);
export const availableHouseRules = () => HOUSE_RULES.filter(rule => isRuleSupported(rule.id));

/** Nur SL: ein einzelnes Grundmanöver ein- oder ausschalten (Buchseite, #45). */
export async function setManeuverEnabled(id, enabled) {
  if (!game.user.isGM || !MANEUVER_IDS.includes(id)) return;
  await game.settings.set(MODULE_ID, MANEUVER_SETTING, { ...(game.settings.get(MODULE_ID, MANEUVER_SETTING) ?? {}), [id]: !!enabled });
}

/** Nur die SL: Regel ein- oder ausschalten. */
export async function setRuleActive(id, active) {
  if (!game.user.isGM || !isRuleSupported(id) || !HOUSE_RULES.some(rule => rule.id === id)) return;
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
  initHelpAction(() => isRuleActive('helpAction'));
  initSystemSheetEntries(HOUSE_RULES, isRuleActive);
  initManeuvers(() => isRuleActive('maneuvers'));
  initHitConsequences(() => isRuleActive('maneuvers') && enabledManeuvers().includes('targeted'));
  initPassiveDefense(() => isRuleActive('passiveDefense'));
  // Einzelschalter der Grundmanöver: Buch und Bögen neu zeichnen wie bei der Haupteinstellung.
  Hooks.on('updateSetting', setting => {
    if (setting.key !== `${MODULE_ID}.${MANEUVER_SETTING}`) return;
    for (const app of foundry.applications.instances.values()) {
      if (app.id === 'dsa5-helpers-house-rules' || (app.rendered && app.options?.classes?.includes('dsa5-helpers-sheet'))) app.render();
    }
    rerenderSystemSheets();
  });
}
