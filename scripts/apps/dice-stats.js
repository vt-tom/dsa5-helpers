// Würfelstatistik-Fenster (Issue #28, Darstellung B „Karten“, Nutzer-Entscheidung 2026-10-02; Clickdummy
// clickdummy/dice-stats.js). Je Spieler mit Zustimmung eine Karte: Einstufung, Balkendiagramm der Augenzahlen mit
// Erwartungslinie, Kennzahlen, aufklappbare Tabelle. Oben Würfeltyp, Würfelart (digital / echte Würfel) und Zeitraum
// (gesamt, ein Spielabend oder eigener Zeitraum). Spieler sehen nur die eigene Statistik, die SL alle (2026-10-02).
// Geöffnet über die Moduleinstellungen (registerMenu) oder game.modules.get('dsa5-helpers').api.openDiceStats().
import { evaluateDie, dieTypes, playDays, sumCounts, P_SLIGHT, P_STRONG } from '../dice-stats/stats.js';
import { MODULE_ID, STATS_FLAG } from '../dice-stats/recorder.js';
import { CONSENT_FLAG, consentOf, isEnabled } from '../dice-stats/settings.js';

const HIST = { width: 300, height: 70, total: 84, labelY: 82 };
const VERDICT_ICON = { normal: '✓', slight: '!', strong: '!!', few: '…', empty: '–' };
const VERDICT_CLASS = { normal: 'good', slight: 'warn', strong: 'serious', few: 'few', empty: 'few' };

/**
 * Bereitet die Karten für einen Würfeltyp/eine Würfelart auf. Reine Funktion (Test-Harness).
 * @param {{id:string,name:string,color:string,counts:{d:object,m:object}}[]} players  Spieler mit Zustimmung, Zähler im Zeitraum (sumCounts)
 */
export function buildCards(players, faces, method, { open = new Set(), fmt = (x, d) => x.toFixed(d) } = {}) {
  return players.map(player => {
    const counts = player.counts?.[method]?.[faces] ?? Array(faces).fill(0);
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
      form: { handler: this._onChangeForm, submitOnChange: true, closeOnSubmit: false },
      tag: 'form',
    };

    static PARTS = { main: { template: `modules/${MODULE_ID}/templates/dice-stats.hbs`, scrollable: ['.dsa5h-ds-body'] } };

    // range: 'all' | Spielabend-Schlüssel (YYYY-MM-DD) | 'custom' (from/to, Schlüssel einschließlich)
    state = { faces: 20, method: 'd', range: 'all', from: '', to: '', open: new Set() };

    async _prepareContext(options) {
      const context = await super._prepareContext(options);
      const isGM = game.user.isGM;
      // Spieler sehen nur sich selbst; die Daten liegen zwar in allen Clients vor, angezeigt wird aber nur das Eigene.
      const users = isGM ? [...game.users] : [game.user];
      const consenting = users.filter(u => (u === game.user ? consentOf() : u.getFlag(MODULE_ID, CONSENT_FLAG)) === 'yes' && u.getFlag(MODULE_ID, STATS_FLAG));
      const lang = game.i18n.lang;
      const fmt = (x, d) => x.toLocaleString(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
      const dayLabel = key => new Date(`${key}T12:00:00`).toLocaleDateString(lang);
      const days = playDays(consenting.map(u => u.getFlag(MODULE_ID, STATS_FLAG)));
      const { range } = this.state;
      if (range !== 'all' && range !== 'custom' && !days.includes(range)) this.state.range = 'all';
      const bounds = this.state.range === 'all' ? {} : this.state.range === 'custom' ? { from: this.state.from || null, to: this.state.to || null } : { from: this.state.range, to: this.state.range };
      const players = consenting.map(u => ({ id: u.id, name: u.name, color: u.color?.css ?? String(u.color ?? '#888'), counts: sumCounts(u.getFlag(MODULE_ID, STATS_FLAG), bounds) }));
      const types = dieTypes(players.map(p => p.counts), this.state.method);
      if (!types.includes(this.state.faces)) this.state.faces = types[0] ?? 20;
      return Object.assign(context, {
        enabled: isEnabled(),
        isGM,
        ownConsent: consentOf(),
        faces: this.state.faces,
        method: this.state.method,
        types: types.map(f => ({ faces: f, active: f === this.state.faces })),
        methods: ['d', 'm'].map(m => ({ id: m, active: m === this.state.method, label: `DSA5HELPERS.DiceStats.Method.${m}` })),
        ranges: [
          { value: 'all', label: game.i18n.localize('DSA5HELPERS.DiceStats.Range.All'), selected: this.state.range === 'all' },
          ...days.map(day => ({ value: day, label: game.i18n.format('DSA5HELPERS.DiceStats.Range.Day', { date: dayLabel(day) }), selected: this.state.range === day })),
          { value: 'custom', label: game.i18n.localize('DSA5HELPERS.DiceStats.Range.Custom'), selected: this.state.range === 'custom' },
        ],
        custom: this.state.range === 'custom',
        from: this.state.from, to: this.state.to,
        firstDay: days.length ? days.at(-1) : '', lastDay: days[0] ?? '',
        cards: buildCards(players, this.state.faces, this.state.method, { open: this.state.open, fmt }),
        // Nur für die SL: wer nicht ausgewertet wird.
        hidden: isGM ? users.filter(u => !consenting.includes(u) && u.getFlag(MODULE_ID, CONSENT_FLAG) !== 'yes').map(u => u.name).join(', ') : '',
        slight: fmt(P_SLIGHT, 2), strong: fmt(P_STRONG, 2),
        hist: HIST,
      });
    }

    _onRender(context, options) {
      super._onRender(context, options);
      this.element.dataset.theme = game.settings.get(MODULE_ID, 'theme');
    }

    /** Zeitraum-Auswahl und Datumsfelder (submitOnChange). */
    static _onChangeForm(_event, _form, formData) {
      const data = formData.object;
      if (typeof data.range === 'string') this.state.range = data.range;
      if (typeof data.from === 'string') this.state.from = data.from;
      if (typeof data.to === 'string') this.state.to = data.to;
      this.render();
    }

    static _setFaces(_event, target) { this.state.faces = Number(target.dataset.faces); this.render(); }
    static _setMethod(_event, target) { this.state.method = target.dataset.method === 'm' ? 'm' : 'd'; this.render(); }
    static _toggleTable(_event, target) {
      const id = target.dataset.userId;
      this.state.open.has(id) ? this.state.open.delete(id) : this.state.open.add(id);
      this.render();
    }

    /** Nur Spielleitung: Statistik eines Spielers (data-user-id) oder aller löschen (immer der ganze Zeitraum). */
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
