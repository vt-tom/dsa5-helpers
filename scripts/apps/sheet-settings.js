/**
 * Untermenüs der Moduleinstellungen (Nutzer 2026-10-20: Einstellungen gruppieren, damit die Liste nicht
 * unübersichtlich wird; 2026-11-02: alle Einstellungen in Untermenüs, die Liste zeigt nur noch Knöpfe).
 * „Heldenbogen“ bündelt die Welt-Einstellungen des Bogens: Standard-Bogen (#13), Bearbeiten-Modus für Spieler (#34),
 * Reiter Aufträge/Personen (#39) und Ordner für Bannerbilder (#46). „Darstellung und Geräte“ bündelt Probendialoge am
 * Desktop (#63), Talent-Vorschläge und das hybride Spiel auf Tablet/Smartphone; Welt-Einstellungen darin sieht nur,
 * wer sie ändern darf, Geräte-Einstellungen jeder. Die Einstellungen selbst sind mit config: false registriert; neue
 * gehören in die passende Liste unten. Die Würfelstatistik hat ihre Einstellungen im eigenen Fenster.
 */
import { isFoundry13 } from '../compat/runtime.js';
const MODULE_ID = 'dsa5-helpers';
const hybrid = () => game.settings.get(MODULE_ID, 'hybridPlay');

/**
 * key → Art des Feldes (checkbox, select, folder), `when` blendet aus, `group` setzt eine Zwischenüberschrift über den
 * ersten sichtbaren Eintrag der Gruppe; Name/Hinweis/Auswahl kommen aus der Registrierung.
 */
export const SHEET_SETTINGS = [
  { key: 'defaultSheet', kind: 'checkbox' },
  { key: 'playersMayEdit', kind: 'checkbox' },
  { key: 'questsTab', kind: 'checkbox', when: () => !isFoundry13() },
  { key: 'personaeTab', kind: 'checkbox' },
  { key: 'bannerPath', kind: 'folder' },
];

export const DISPLAY_SETTINGS = [
  { key: 'rollDialogDesktopStyle', kind: 'select', group: 'DSA5HELPERS.Settings.DisplayMenu.GroupSheet' },
  { key: 'skillSuggestions', kind: 'select', group: 'DSA5HELPERS.Settings.DisplayMenu.GroupSheet' },
  { key: 'hybridPlay', kind: 'checkbox', group: 'DSA5HELPERS.Settings.DisplayMenu.GroupMobile' },
  { key: 'uiMode', kind: 'select', when: hybrid, group: 'DSA5HELPERS.Settings.DisplayMenu.GroupMobile' },
  { key: 'rollResultTablet', kind: 'checkbox', when: hybrid, group: 'DSA5HELPERS.Settings.DisplayMenu.GroupMobile' },
];

const MENUS = {
  sheet: { id: 'dsa5-helpers-sheet-settings', title: 'DSA5HELPERS.Settings.SheetMenu.Title', icon: 'fas fa-id-card', settings: SHEET_SETTINGS },
  display: { id: 'dsa5-helpers-display-settings', title: 'DSA5HELPERS.Settings.DisplayMenu.Title', icon: 'fas fa-display', settings: DISPLAY_SETTINGS },
};
const apps = {};

/** Sichtbare Einträge: registriert (unter v13 fehlt das hybride Spiel), `when` erfüllt, Welt-Einstellungen nur für die SL. */
function visible(list) {
  return list.filter(({ key, when }) => {
    const config = game.settings.settings.get(`${MODULE_ID}.${key}`);
    if (!config || (when && !when())) return false;
    return config.scope !== 'world' || game.user.can('SETTINGS_MODIFY');
  });
}

/** Klasse erst bei Bedarf bauen — beim Import (Tests, früher init) ist foundry.applications evtl. nicht da. */
function getSettingsApp(menu) {
  if (apps[menu]) return apps[menu];
  const { id, title, icon, settings } = MENUS[menu];
  const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
  apps[menu] = class Dsa5HelpersSettingsMenu extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
      id,
      tag: 'form',
      // standard-form nur am Inhalt (contentClasses): am Fenster selbst setzt sie Abstände zwischen Titelleiste und Inhalt,
      // im DSA5-Design entstand dort eine durchsichtige Lücke (Rückmeldung 2026-10-20).
      classes: ['dsa5-helpers-sheet-settings'],
      window: { title, icon, contentClasses: ['standard-form'] },
      position: { width: 560 },
      form: { handler: this._onSubmit, closeOnSubmit: true },
    };

    static PARTS = { main: { template: `modules/${MODULE_ID}/templates/sheet-settings.hbs` } };

    async _prepareContext(options) {
      const context = await super._prepareContext(options);
      context.settings = visible(settings).map(({ key, kind, group }, i, shown) => {
        const config = game.settings.settings.get(`${MODULE_ID}.${key}`);
        const value = game.settings.get(MODULE_ID, key);
        return {
          key, kind, name: config.name ?? key, hint: config.hint ?? '', value,
          groupTitle: group && group !== shown[i - 1]?.group ? group : '',
          checkbox: kind === 'checkbox', folder: kind === 'folder', select: kind === 'select',
          options: kind === 'select' ? Object.entries(config.choices ?? {}).map(([v, label]) => ({ value: v, label, selected: String(value) === v })) : null,
        };
      });
      return context;
    }

    // Speichern; Einstellungen mit requiresReload fragen wie in den normalen Einstellungen nach dem Neuladen.
    static async _onSubmit(_event, _form, formData) {
      const data = formData.object;
      let reload = false, world = false;
      for (const { key, kind } of visible(settings)) {
        const config = game.settings.settings.get(`${MODULE_ID}.${key}`);
        let value = kind === 'checkbox' ? !!data[key] : String(data[key] ?? '').trim();
        if (config.type === Number) value = Number(value);
        if (value === game.settings.get(MODULE_ID, key)) continue;
        await game.settings.set(MODULE_ID, key, value);
        if (config.requiresReload) { reload = true; world ||= config.scope === 'world'; }
      }
      if (reload) await foundry.applications.settings.SettingsConfig.reloadConfirm({ world });
    }
  };
  return apps[menu];
}

export const getSheetSettingsApp = () => getSettingsApp('sheet');
export const getDisplaySettingsApp = () => getSettingsApp('display');
