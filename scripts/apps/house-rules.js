// Hausregelbuch-Fenster (2026-10-05; Click-Dummy clickdummy/house-rules.js). Zwei Ansichten:
// - Liste: alle Hausregeln mit Kurzbeschreibung, Urheber, Schalter (nur SL) und „Im Buch lesen“.
// - Buch: Inhaltsverzeichnis, dann je Regel eine Seite (eigenes Template je Regel) mit dem Schalter oben rechts im
//   Seitenkopf; Blättern per Pfeilknöpfen neben der Seite, Inhaltsverzeichnis oder Pfeiltasten, mit Umblätter-Animation.
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

    // page: 0 = Inhaltsverzeichnis, 1… = Regeln. turn: Blätterrichtung für die Animation beim nächsten Rendern.
    state = { view: 'list', page: 0, turn: 0 };

    async _prepareContext(options) {
      const context = await super._prepareContext(options);
      const rules = HOUSE_RULES.map((rule, index) => ({ ...rule, index, number: index + 1, pageIndex: index + 1, active: isRuleActive(rule.id), key: `DSA5HELPERS.HouseRules.${rule.id}` }));
      const page = Math.min(Math.max(this.state.page, 0), rules.length);
      return Object.assign(context, {
        isGM: game.user.isGM,
        view: this.state.view,
        list: this.state.view === 'list',
        rules,
        toc: page === 0,
        rule: rules[page - 1],
        pageNumber: page + 1,
        pageCount: rules.length + 1,
        prev: page > 0 ? page - 1 : null,
        next: page < rules.length ? page + 1 : null,
      });
    }

    _onRender(context, options) {
      super._onRender(context, options);
      this.element.dataset.theme = game.settings.get(MODULE_ID, 'theme');
      // Blättern wie im Buch: die neue Seite schwingt um die linke (vorwärts) bzw. rechte Kante (zurück) herein.
      const turn = this.state.turn;
      this.state.turn = 0;
      const page = this.element.querySelector('.dsa5h-hr-page');
      if (turn && page && !globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        page.animate([
          { transform: `perspective(1400px) rotateY(${turn > 0 ? 60 : -60}deg)`, transformOrigin: turn > 0 ? 'left center' : 'right center', opacity: 0.2 },
          { transform: 'perspective(1400px) rotateY(0deg)', transformOrigin: turn > 0 ? 'left center' : 'right center', opacity: 1 },
        ], { duration: 380, easing: 'cubic-bezier(.25,.8,.3,1)' });
      }
      // Pfeiltasten blättern (nicht in Eingabefeldern); einmal je Fenster-Element.
      if (this._keysOn !== this.element) {
        this._keysOn = this.element;
        this.element.addEventListener('keydown', event => {
          if (this.state.view !== 'book' || event.target.closest('input, textarea, select')) return;
          const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
          if (step) { event.preventDefault(); this._goTo(this.state.page + step); }
        });
      }
    }

    _goTo(page) {
      const max = HOUSE_RULES.length;
      if (page < 0 || page > max || page === this.state.page) return;
      this.state.turn = page > this.state.page ? 1 : -1;
      this.state.page = page;
      this.render();
    }

    static _setView(_event, target) { this.state.view = target.dataset.view === 'book' ? 'book' : 'list'; this.render(); }
    static _openPage(_event, target) { this.state.view = 'book'; this.state.page = Number(target.dataset.page) || 0; this.render(); }
    static _turnPage(_event, target) { this._goTo(Number(target.dataset.page)); }
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
  if (index >= 0) Object.assign(app.state, { view: 'book', page: index + 1 });
  return app.render({ force: true });
}
