import { Dsa5HelpersCharacterSheet } from './sheets/dsa5-helpers-character-sheet.js';

Hooks.once('init', async () => {
  if (!Dsa5HelpersCharacterSheet) { console.error('DSA5 Helpers | DSA5 character sheet unavailable.'); return; }
  game.settings.register('dsa5-helpers', 'theme', { scope: 'client', config: false, type: String, default: 'light', choices: { light: 'Light', dark: 'Dark' } });
  Handlebars.registerHelper('dsa5hPercent', (value, max) => Number(max) > 0 ? Math.max(0, Math.min(100, Math.round(Number(value) / Number(max) * 100))) : 0);
  Handlebars.registerHelper('dsa5hFormatNum', value => String(value ?? 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
  Handlebars.registerHelper('dsa5hCharacteristics', item => [1, 2, 3].map(n => item.system['characteristic' + n]?.value).filter(Boolean));
  await foundry.applications.handlebars.loadTemplates([
  "modules/dsa5-helpers/templates/actors/dsa5-helpers-character-sheet.hbs",
  "modules/dsa5-helpers/templates/actors/parts/chips.hbs",
  "modules/dsa5-helpers/templates/actors/parts/combat.hbs",
  "modules/dsa5-helpers/templates/actors/parts/companion.hbs",
  "modules/dsa5-helpers/templates/actors/parts/cover.hbs",
  "modules/dsa5-helpers/templates/actors/parts/cover-sidebar.hbs",
  "modules/dsa5-helpers/templates/actors/parts/favorite.hbs",
  "modules/dsa5-helpers/templates/actors/parts/header.hbs",
  "modules/dsa5-helpers/templates/actors/parts/inventory-row.hbs",
  "modules/dsa5-helpers/templates/actors/parts/inventory.hbs",
  "modules/dsa5-helpers/templates/actors/parts/magic.hbs",
  "modules/dsa5-helpers/templates/actors/parts/main.hbs",
  "modules/dsa5-helpers/templates/actors/parts/notes.hbs",
  "modules/dsa5-helpers/templates/actors/parts/probe.hbs",
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
