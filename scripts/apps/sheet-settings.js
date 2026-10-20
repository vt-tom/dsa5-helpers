/**
 * Untermenü „Heldenbogen“ der Moduleinstellungen (Nutzer 2026-10-20: Einstellungen gruppieren, damit die Liste nicht
 * unübersichtlich wird). Bündelt die Welt-Einstellungen des Bogens: Standard-Bogen (#13), Bearbeiten-Modus für Spieler
 * (#34) und Ordner für Bannerbilder (#46). Die Einstellungen selbst sind mit config: false registriert. Neue
 * Bogen-Einstellungen gehören hierher (SETTINGS ergänzen).
 */
const MODULE_ID = 'dsa5-helpers';

/** key → Art des Feldes; Name/Hinweis kommen aus der Registrierung der Einstellung. */
export const SHEET_SETTINGS = [
  { key: 'defaultSheet', kind: 'checkbox' },
  { key: 'playersMayEdit', kind: 'checkbox' },
  { key: 'bannerPath', kind: 'folder' },
];

let SheetSettingsApp;

/** Klasse erst bei Bedarf bauen — beim Import (Tests, früher init) ist foundry.applications evtl. nicht da. */
export function getSheetSettingsApp() {
  if (SheetSettingsApp) return SheetSettingsApp;
  const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
  SheetSettingsApp = class Dsa5HelpersSheetSettings extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
      id: 'dsa5-helpers-sheet-settings',
      tag: 'form',
      // standard-form nur am Inhalt (contentClasses): am Fenster selbst setzt sie Abstände zwischen Titelleiste und Inhalt,
      // im DSA5-Design entstand dort eine durchsichtige Lücke (Rückmeldung 2026-10-20).
      classes: ['dsa5-helpers-sheet-settings'],
      window: { title: 'DSA5HELPERS.Settings.SheetMenu.Title', icon: 'fas fa-id-card', contentClasses: ['standard-form'] },
      position: { width: 560 },
      form: { handler: this._onSubmit, closeOnSubmit: true },
    };

    static PARTS = { main: { template: `modules/${MODULE_ID}/templates/sheet-settings.hbs` } };

    async _prepareContext(options) {
      const context = await super._prepareContext(options);
      context.settings = SHEET_SETTINGS.map(({ key, kind }) => {
        const config = game.settings.settings.get(`${MODULE_ID}.${key}`);
        return { key, kind, name: config?.name ?? key, hint: config?.hint ?? '', value: game.settings.get(MODULE_ID, key), checkbox: kind === 'checkbox', folder: kind === 'folder' };
      });
      return context;
    }

    // Speichern; wer den Standard-Bogen ändert, braucht ein Neuladen (wie requiresReload in den normalen Einstellungen).
    static async _onSubmit(_event, _form, formData) {
      const data = formData.object;
      let reload = false;
      for (const { key, kind } of SHEET_SETTINGS) {
        const value = kind === 'checkbox' ? !!data[key] : String(data[key] ?? '').trim();
        if (value === game.settings.get(MODULE_ID, key)) continue;
        await game.settings.set(MODULE_ID, key, value);
        if (game.settings.settings.get(`${MODULE_ID}.${key}`)?.requiresReload) reload = true;
      }
      if (reload) await foundry.applications.settings.SettingsConfig.reloadConfirm({ world: true });
    }
  };
  return SheetSettingsApp;
}
