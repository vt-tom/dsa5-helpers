// Würfelstatistik-Fenster (Issue #28, Darstellung B „Karten“, Nutzer-Entscheidung 2026-10-02; Clickdummy
// clickdummy/dice-stats.js). Je Spieler mit Zustimmung eine Karte: Einstufung, Balkendiagramm der Augenzahlen mit
// Erwartungslinie, Kennzahlen, aufklappbare Tabelle. Oben Würfeltyp und Würfelart (digital / echte Würfel).
// Geöffnet über die Moduleinstellungen (registerMenu) oder game.modules.get('dsa5-helpers').api.openDiceStats().
import { evaluateDie, dieTypes, P_SLIGHT, P_STRONG } from '../dice-stats/stats.js';
import { MODULE_ID, STATS_FLAG } from '../dice-stats/recorder.js';
import { CONSENT_FLAG, isEnabled } from '../dice-stats/settings.js';

const HIST = { width: 300, height: 70, total: 84, labelY: 82 };
const VERDICT_ICON = { normal: '✓', slight: '!', strong: '!!', few: '…', empty: '–' };
const VERDICT_CLASS = { normal: 'good', slight: 'warn', strong: 'serious', few: 'few', empty: 'few' };

/**
 * Bereitet die Karten für einen Würfeltyp/eine Würfelart auf. Reine Funktion (Test-Harness).
 * @param {{id:string,name:string,color:string,stats:object}[]} players  Spieler mit Zustimmung
 */
export function buildCards(players, faces, method, { open = new Set(), fmt = (x, d) => x.toFixed(d) } = {}) {
  return players.map(player => {
    const counts = player.stats?.[method]?.[faces] ?? Array(faces).fill(0);
    const ev = evaluateDie(counts);
    if (!ev.n) return null;
    const max = Math.max(...counts, ev.expectedPerFace) * 1.08;
    const gap = faces > 12 ? 2 : 4;
    const bw = (HIST.width - gap * (faces - 1)) / faces;
    const bars = counts.map((c, i) => {
      const h = (c / max) * HIST.height;
      const x = i * (bw + gap);
      const label = i === 0 || i === faces - 1 || (faces === 20 && (i + 1) % 5 === 0);
      return {
        face: i + 1, count: c, x: +x.toFixed(2), y: +(HIST.height - h).toFixed(2), w: +bw.toFixed(2), h: +Math.max(h, c ? 1 : 0).toFixed(2),
        cx: +(x + bw / 2).toFixed(2), key: faces === 20 && (i === 0 || i === 19), label,
        deviation: `${ev.deviations[i] >= 0 ? '+' : '−'}${fmt(Math.abs(ev.deviations[i]) * 100, 0)} %`, big: Math.abs(ev.deviations[i]) >= 0.25,
      };
    });
    const figures = [
      { label: 'n', value: String(ev.n) },
      { label: 'mean', value: fmt(ev.mean, 2), expected: fmt(ev.expectedMean, 1) },
    ];
    if (faces === 20) {
      figures.push({ label: 'ones', value: `${fmt(counts[0] / ev.n * 100, 1)} %`, expected: '5 %' });
      figures.push({ label: 'twenties', value: `${fmt(counts[19] / ev.n * 100, 1)} %`, expected: '5 %' });
    }
    return {
      id: player.id, name: player.name, color: player.color, open: open.has(player.id),
      verdict: ev.verdict, verdictIcon: VERDICT_ICON[ev.verdict], verdictClass: VERDICT_CLASS[ev.verdict],
      n: ev.n, minRolls: ev.minRolls, expectedPerFace: fmt(ev.expectedPerFace, 1),
      p: ev.p === null ? null : ev.p < 0.001 ? '< 0.001' : fmt(ev.p, 3), chi2: ev.chi2 === null ? null : fmt(ev.chi2, 2), df: ev.df,
      bars, expectedY: +(HIST.height - (ev.expectedPerFace / max) * HIST.height).toFixed(2), figures,
    };
  }).filter(Boolean);
}

let DiceStatsApp;

/** Klasse erst bei Bedarf bauen — beim Import (Tests, früher init) ist foundry.applications evtl. nicht da. */
export function getDiceStatsApp() {
  if (DiceStatsApp) return DiceStatsApp;
  const { ApplicationV2, HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api;
  DiceStatsApp = class Dsa5HelpersDiceStats extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
      id: 'dsa5-helpers-dice-stats',
      classes: ['dsa5-helpers-dice-stats'],
      window: { title: 'DSA5HELPERS.DiceStats.Title', icon: 'fas fa-dice-d20', resizable: true },
      position: { width: 720, height: 680 },
      actions: { setFaces: this._setFaces, setMethod: this._setMethod, toggleTable: this._toggleTable, reset: this._reset },
    };

    static PARTS = { main: { template: `modules/${MODULE_ID}/templates/dice-stats.hbs`, scrollable: ['.dsa5h-ds-body'] } };

    state = { faces: 20, method: 'd', open: new Set() };

    async _prepareContext(options) {
      const context = await super._prepareContext(options);
      const users = [...game.users];
      const consenting = users.filter(u => u.getFlag(MODULE_ID, CONSENT_FLAG) === 'yes' && u.getFlag(MODULE_ID, STATS_FLAG));
      const players = consenting.map(u => ({ id: u.id, name: u.name, color: u.color?.css ?? String(u.color ?? '#888'), stats: u.getFlag(MODULE_ID, STATS_FLAG) }));
      const types = dieTypes(players.map(p => p.stats), this.state.method);
      if (!types.includes(this.state.faces)) this.state.faces = types[0] ?? 20;
      const lang = game.i18n.lang;
      const fmt = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
      const since = Math.min(...players.map(p => p.stats.since).filter(Number.isFinite));
      return Object.assign(context, {
        enabled: isEnabled(),
        isGM: game.user.isGM,
        faces: this.state.faces,
        method: this.state.method,
        types: types.map(f => ({ faces: f, active: f === this.state.faces })),
        methods: ['d', 'm'].map(m => ({ id: m, active: m === this.state.method, label: `DSA5HELPERS.DiceStats.Method.${m}` })),
        since: Number.isFinite(since) ? new Date(since).toLocaleDateString(lang) : null,
        cards: buildCards(players, this.state.faces, this.state.method, { open: this.state.open, fmt }),
        hidden: users.filter(u => !consenting.includes(u) && u.getFlag(MODULE_ID, CONSENT_FLAG) !== 'yes').map(u => u.name).join(', '),
        slight: fmt(P_SLIGHT, 2), strong: fmt(P_STRONG, 2),
        hist: HIST,
      });
    }

    _onRender(context, options) {
      super._onRender(context, options);
      this.element.dataset.theme = game.settings.get(MODULE_ID, 'theme');
    }

    static _setFaces(_event, target) { this.state.faces = Number(target.dataset.faces); this.render(); }
    static _setMethod(_event, target) { this.state.method = target.dataset.method === 'm' ? 'm' : 'd'; this.render(); }
    static _toggleTable(_event, target) {
      const id = target.dataset.userId;
      this.state.open.has(id) ? this.state.open.delete(id) : this.state.open.add(id);
      this.render();
    }

    /** Nur Spielleitung: Statistik eines Spielers (data-user-id) oder aller zurücksetzen. */
    static async _reset(_event, target) {
      if (!game.user.isGM) return;
      const user = target.dataset.userId ? game.users.get(target.dataset.userId) : null;
      const ok = await DialogV2.confirm({
        window: { title: 'DSA5HELPERS.DiceStats.Reset.Title' },
        content: `<p>${user ? game.i18n.format('DSA5HELPERS.DiceStats.Reset.One', { name: foundry.utils.escapeHTML(user.name) }) : game.i18n.localize('DSA5HELPERS.DiceStats.Reset.All')}</p>`,
        rejectClose: false,
      });
      if (!ok) return;
      const targets = user ? [user] : game.users.filter(u => u.getFlag(MODULE_ID, STATS_FLAG));
      for (const u of targets) await u.unsetFlag(MODULE_ID, STATS_FLAG);
    }
  };
  return DiceStatsApp;
}

/** Öffnet (oder holt nach vorn) das Statistikfenster. */
export function openDiceStats() {
  const App = getDiceStatsApp();
  const existing = foundry.applications.instances.get('dsa5-helpers-dice-stats');
  return existing ? existing.render({ force: true }) : new App().render({ force: true });
}

/** Offenes Fenster neu zeichnen, wenn sich Statistik oder Zustimmung eines Benutzers ändert. */
export function initDiceStatsLiveUpdate() {
  const rerender = () => foundry.applications.instances.get('dsa5-helpers-dice-stats')?.render();
  Hooks.on('updateUser', (_user, changes) => { if (foundry.utils.hasProperty(changes, `flags.${MODULE_ID}`)) rerender(); });
  Hooks.on('dsa5hDiceStatsChanged', rerender);
}
