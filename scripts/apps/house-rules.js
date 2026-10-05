// Hausregelbuch-Fenster (2026-10-05; Click-Dummy clickdummy/house-rules.js). Zwei Ansichten:
// - Liste: alle Hausregeln mit Kurzbeschreibung, Urheber, Schalter (nur SL) und „Im Buch lesen“.
// - Buch: je Regel eine Seite (eigenes Template je Regel), unten der Schalter, Blättern per Pfeilen.
// Geöffnet über die Moduleinstellungen (registerMenu, für alle lesbar) oder api.openHouseRules().
import { HOUSE_RULES, isRuleActive, setRuleActive } from '../house-rules/rules.js';

const MODULE_ID = 'dsa5-helpers';
const APP_ID = 'dsa5-helpers-house-rules';
let HouseRulesApp;

/** Klasse erst bei Bedarf bauen — beim Import (Tests, früher init) ist foundry.applications evtl. nicht da. */
export function getHouseRulesApp() {
  if (HouseRulesApp) return HouseRulesApp;
  const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
  HouseRulesApp = class Dsa5HelpersHouseRules extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
      id: APP_ID,
      classes: ['dsa5-helpers-house-rules'],
      window: { title: 'DSA5HELPERS.HouseRules.Title', icon: 'fas fa-book', resizable: true },
      position: { width: 640, height: 640 },
      actions: { setView: this._setView, openPage: this._openPage, turnPage: this._turnPage, toggleRule: this._toggleRule },
    };

    static PARTS = { main: { template: `modules/${MODULE_ID}/templates/house-rules.hbs`, scrollable: ['.dsa5h-hr-body'] } };

    state = { view: 'list', page: 0 };

    async _prepareContext(options) {
      const context = await super._prepareContext(options);
      const rules = HOUSE_RULES.map((rule, index) => ({ ...rule, index, number: index + 1, active: isRuleActive(rule.id), key: `DSA5HELPERS.HouseRules.${rule.id}` }));
      const page = Math.min(Math.max(this.state.page, 0), rules.length - 1);
      return Object.assign(context, {
        isGM: game.user.isGM,
        view: this.state.view,
        list: this.state.view === 'list',
        rules,
        rule: rules[page],
        pageCount: rules.length,
        prev: page > 0 ? page - 1 : null,
        next: page < rules.length - 1 ? page + 1 : null,
      });
    }

    _onRender(context, options) {
      super._onRender(context, options);
      this.element.dataset.theme = game.settings.get(MODULE_ID, 'theme');
    }

    static _setView(_event, target) { this.state.view = target.dataset.view === 'book' ? 'book' : 'list'; this.render(); }
    static _openPage(_event, target) { this.state.view = 'book'; this.state.page = Number(target.dataset.index) || 0; this.render(); }
    static _turnPage(_event, target) { this.state.page = Number(target.dataset.index) || 0; this.render(); }
    /** Nur SL; das Fenster zeichnet sich über onChange der Einstellung neu (auch bei allen Spielern). */
    static async _toggleRule(_event, target) {
      if (!game.user.isGM) return;
      await setRuleActive(target.dataset.ruleId, !isRuleActive(target.dataset.ruleId));
    }
  };
  return HouseRulesApp;
}

/** Öffnet (oder holt nach vorn) das Hausregelbuch, optional direkt auf der Seite einer Regel. */
export function openHouseRules(ruleId) {
  const App = getHouseRulesApp();
  const app = foundry.applications.instances.get(APP_ID) ?? new App();
  const index = HOUSE_RULES.findIndex(rule => rule.id === ruleId);
  if (index >= 0) Object.assign(app.state, { view: 'book', page: index });
  return app.render({ force: true });
}
