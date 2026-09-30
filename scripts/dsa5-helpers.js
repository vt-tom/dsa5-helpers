import { Dsa5HelpersCharacterSheet } from './sheets/dsa5-helpers-character-sheet.js';
import { getChangelogApp, showChangelogIfUpdated } from './apps/changelog.js';

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
  game.settings.register('dsa5-helpers', 'theme', { scope: 'client', config: false, type: String, default: 'light', choices: { light: 'Light', dark: 'Dark' } });
  // Standard-Bogen für Helden (Issue #13): nur der Foundry-Weg über makeDefault — eine ausdrückliche Wahl am Akteur
  // oder unter „Standard-Bögen konfigurieren“ hat weiter Vorrang (Nutzerentscheidung 2026-09-30).
  game.settings.register('dsa5-helpers', 'defaultSheet', { name: 'DSA5HELPERS.Settings.DefaultSheet.Name', hint: 'DSA5HELPERS.Settings.DefaultSheet.Hint', scope: 'world', config: true, restricted: true, type: Boolean, default: false, requiresReload: true });
  // Zuletzt gesehene Version je Nutzer (Issue #11) — auch Spieler und Erstinstallation bekommen den Changelog.
  game.settings.register('dsa5-helpers', 'lastSeenVersion', { scope: 'client', config: false, type: String, default: '' });
  game.settings.registerMenu('dsa5-helpers', 'changelog', { name: 'DSA5HELPERS.Changelog.Title', label: 'DSA5HELPERS.Changelog.Open', hint: 'DSA5HELPERS.Changelog.Hint', icon: 'fas fa-scroll', type: getChangelogApp(), restricted: false });
  if (!Dsa5HelpersCharacterSheet) { console.error('DSA5 Helpers | DSA5 character sheet unavailable.'); return; }
  Handlebars.registerHelper('dsa5hPercent', (value, max) => Number(max) > 0 ? Math.max(0, Math.min(100, Math.round(Number(value) / Number(max) * 100))) : 0);
  Handlebars.registerHelper('dsa5hFormatNum', value => String(value ?? 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
  // Kürzel einer Münze im Geld-Panel (Dukaten → D): Münzen sind Items, auch eigene Währungen bekommen so ein Kürzel.
  Handlebars.registerHelper('dsa5hInitial', text => String(text ?? '').trim().charAt(0).toUpperCase());
  Handlebars.registerHelper('dsa5hCharacteristics', item => [1, 2, 3].map(n => item.system['characteristic' + n]?.value).filter(Boolean));
  Handlebars.registerHelper('dsa5hTraditionIcon', (text, kind) => findTraditionIcon(text, kind === 'religion' ? GOD_ICONS : MAGIC_TRADITION_ICONS, kind === 'religion' ? 'months' : 'traditionen'));
  await foundry.applications.handlebars.loadTemplates([
  "modules/dsa5-helpers/templates/changelog.hbs",
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
  foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, 'dsa5-helpers', Dsa5HelpersCharacterSheet, { types: ['character'], makeDefault: game.settings.get('dsa5-helpers', 'defaultSheet'), label: 'DSA5HELPERS.SheetLabel' });
});

Hooks.once('ready', () => showChangelogIfUpdated());

// Rückweg aus dem Charakterbauer (#10, Nutzerfreigabe 2026-09-30): dsa5-core setzt beim Abschließen fest
// flags.core.sheetClass = "dsa5.ActorSheetdsa5Character". Wurde der Bauer aus unserem Bogen gestartet
// (Flag preChargenSheet, siehe _startCharacterBuilder), stattdessen die vorherige Wahl wiederherstellen —
// '' heißt Standard-Bogen, damit auch die Einstellung „Standard für alle Helden“ (#13) wieder greift.
Hooks.on('preUpdateActor', (actor, changes) => {
  const { getProperty, hasProperty, setProperty } = foundry.utils;
  const previous = actor.getFlag('dsa5-helpers', 'preChargenSheet');
  if (previous === undefined || !hasProperty(changes, 'flags.core.sheetClass')) return;
  const next = getProperty(changes, 'flags.core.sheetClass');
  if (next === 'dsa5.DSACharBuilder') return;
  if (next === 'dsa5.ActorSheetdsa5Character' && actor.getFlag('core', 'sheetClass') === 'dsa5.DSACharBuilder') setProperty(changes, 'flags.core.sheetClass', previous);
  setProperty(changes, 'flags.dsa5-helpers.preChargenSheet', new foundry.data.operators.ForcedDeletion());
});
