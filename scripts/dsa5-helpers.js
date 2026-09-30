import { Dsa5HelpersCharacterSheet } from './sheets/dsa5-helpers-character-sheet.js';

// Freitext-Traditionsfelder (system.tradition.magical/.clerical) haben im System keine feste Werteliste (siehe
// lang/de.json "traditionMagical": "z. B. Gildenmagier, Hexen." / "traditionClerical": "z. B. Praioskirche.") —
// die Zuordnung zu einem System-Icon (icons/traditionen bzw. icons/months) ist daher nur über einen
// Teilstring-Abgleich gegen die bekannten Dateinamen möglich, kein exaktes Enum-Match (Nutzerwunsch 2026-09-18:
// Tradition-Badge im Magie-/Religions-Tab soll das passende Icon zeigen).
const MAGIC_TRADITION_ICONS = ['animisten', 'druiden', 'elfen', 'geoden', 'gildenmagier', 'hexen', 'magiedilettanten', 'scharlatane', 'zauberalchimisten', 'zauberbarden', 'zaubertaenzer', 'zibiljas'];
const GOD_ICONS = ['Achaz', 'Angrosch', 'Aves', 'Boron', 'Brazoragh', 'Chrssirssr', 'Efferd', 'Ferkina', 'Firun', 'Fjarninger', 'Gjalsker', 'Gravesh', 'Hesinde', 'Hszint', 'Ifirn', 'Ingerimm', 'Kor', 'Namenloser', 'Nandus', 'Nivesen', 'Peraine', 'Phex', 'Praios', 'Rahja', 'Rikai', 'Rondra', 'Shinxir', 'Swafnir', 'Tahaya', 'Tairach', 'Travia', 'Trollzacker', 'Tsa', 'Zsahh', 'levthan', 'marbo', 'numinoru'];

function findTraditionIcon(text, names, folder) {
  if (!text) return '';
  const lower = String(text).toLowerCase();
  const hit = names.find(n => lower.includes(n.toLowerCase()));
  return hit ? `systems/dsa5/icons/${folder}/${hit}.webp` : '';
}

Hooks.once('init', async () => {
  if (!Dsa5HelpersCharacterSheet) { console.error('DSA5 Helpers | DSA5 character sheet unavailable.'); return; }
  game.settings.register('dsa5-helpers', 'theme', { scope: 'client', config: false, type: String, default: 'light', choices: { light: 'Light', dark: 'Dark' } });
  Handlebars.registerHelper('dsa5hPercent', (value, max) => Number(max) > 0 ? Math.max(0, Math.min(100, Math.round(Number(value) / Number(max) * 100))) : 0);
  Handlebars.registerHelper('dsa5hFormatNum', value => String(value ?? 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
  // Kürzel einer Münze im Geld-Panel (Dukaten → D): Münzen sind Items, auch eigene Währungen bekommen so ein Kürzel.
  Handlebars.registerHelper('dsa5hInitial', text => String(text ?? '').trim().charAt(0).toUpperCase());
  Handlebars.registerHelper('dsa5hCharacteristics', item => [1, 2, 3].map(n => item.system['characteristic' + n]?.value).filter(Boolean));
  Handlebars.registerHelper('dsa5hTraditionIcon', (text, kind) => findTraditionIcon(text, kind === 'religion' ? GOD_ICONS : MAGIC_TRADITION_ICONS, kind === 'religion' ? 'months' : 'traditionen'));
  await foundry.applications.handlebars.loadTemplates([
  "modules/dsa5-helpers/templates/actors/dsa5-helpers-character-sheet.hbs",
  "modules/dsa5-helpers/templates/actors/parts/body.hbs",
  "modules/dsa5-helpers/templates/actors/parts/cast-list.hbs",
  "modules/dsa5-helpers/templates/actors/parts/chips.hbs",
  "modules/dsa5-helpers/templates/actors/parts/combat.hbs",
  "modules/dsa5-helpers/templates/actors/parts/combatskill-link.hbs",
  "modules/dsa5-helpers/templates/actors/parts/companion.hbs",
  "modules/dsa5-helpers/templates/actors/parts/cover.hbs",
  "modules/dsa5-helpers/templates/actors/parts/cover-sidebar.hbs",
  "modules/dsa5-helpers/templates/actors/parts/favorite.hbs",
  "modules/dsa5-helpers/templates/actors/parts/favorite-values.hbs",
  "modules/dsa5-helpers/templates/actors/parts/header.hbs",
  "modules/dsa5-helpers/templates/actors/parts/icon-chat.hbs",
  "modules/dsa5-helpers/templates/actors/parts/icon-equip.hbs",
  "modules/dsa5-helpers/templates/actors/parts/inventory-row.hbs",
  "modules/dsa5-helpers/templates/actors/parts/inventory.hbs",
  "modules/dsa5-helpers/templates/actors/parts/magic.hbs",
  "modules/dsa5-helpers/templates/actors/parts/main.hbs",
  "modules/dsa5-helpers/templates/actors/parts/notes.hbs",
  "modules/dsa5-helpers/templates/actors/parts/onuse.hbs",
  "modules/dsa5-helpers/templates/actors/parts/probe.hbs",
  "modules/dsa5-helpers/templates/actors/parts/quick-actions.hbs",
  "modules/dsa5-helpers/templates/actors/parts/ranged-status.hbs",
  "modules/dsa5-helpers/templates/actors/parts/religion.hbs",
  "modules/dsa5-helpers/templates/actors/parts/skill-value.hbs",
  "modules/dsa5-helpers/templates/actors/parts/skills.hbs",
  "modules/dsa5-helpers/templates/actors/parts/specs.hbs",
  "modules/dsa5-helpers/templates/actors/parts/spell-list.hbs",
  "modules/dsa5-helpers/templates/actors/parts/status.hbs",
  "modules/dsa5-helpers/templates/actors/parts/tradition-items.hbs",
  "modules/dsa5-helpers/templates/actors/parts/weapon.hbs",
  "systems/dsa5/templates/actors/companions/actor-companion.hbs",
  "systems/dsa5/templates/actors/companions/companion-card.hbs",
  "systems/dsa5/templates/actors/parts/member-card-header.hbs",
  "systems/dsa5/templates/actors/parts/horse.hbs"
]);
  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, 'dsa5-helpers', Dsa5HelpersCharacterSheet, { types: ['character'], makeDefault: false, label: 'DSA5HELPERS.SheetLabel' });
});
