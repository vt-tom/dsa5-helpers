/** Changelog-Fenster: zeigt die mitgelieferte CHANGELOG.md (Einstellungs-Menü und automatisch nach Updates). */
const MODULE_ID = 'dsa5-helpers';

/** Zerlegt die CHANGELOG.md in Abschnitte je Version („## [0.3.0] — 2026-10-01“). Reine Funktion (Tests). */
export function parseChangelog(markdown) {
  const sections = [];
  let current = null;
  for (const line of String(markdown ?? '').split(/\r?\n/)) {
    const heading = line.match(/^##\s+\[?([^\]\s]+)\]?\s*(?:[—–-]\s*(.*))?$/);
    if (heading) {
      current = { version: heading[1], date: (heading[2] ?? '').trim(), body: [] };
      sections.push(current);
    } else if (current && !/^\[[^\]]+\]:\s*\S+/.test(line)) current.body.push(line);
  }
  return sections.map(s => ({ ...s, body: s.body.join('\n').trim() }));
}

/**
 * Abschnitte, die ein Nutzer noch nicht gesehen hat: neuer als `since`, aber nicht neuer als die installierte
 * Version (ein „unveröffentlichter“ Abschnitt im Entwicklungsstand bleibt so außen vor). Ohne `since`
 * (Erstinstallation) alle bis zur installierten Version.
 */
export function sectionsSince(sections, since, installed, isNewer) {
  return sections.filter(s => (!since || isNewer(s.version, since)) && !isNewer(s.version, installed));
}

let ChangelogApp;

/** Klasse erst bei Bedarf bauen — beim Import (Tests, früher init) ist foundry.applications evtl. nicht da. */
export function getChangelogApp() {
  if (ChangelogApp) return ChangelogApp;
  const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
  ChangelogApp = class Dsa5HelpersChangelog extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(options = {}) {
      super(options);
      this.since = options.since ?? null;
    }

    static DEFAULT_OPTIONS = {
      id: 'dsa5-helpers-changelog',
      classes: ['dsa5-helpers-changelog'],
      window: { title: 'DSA5HELPERS.Changelog.Title', icon: 'fas fa-scroll', resizable: true },
      position: { width: 560, height: 620 },
      actions: { showAll: this._showAll, jumpTo: this._jumpTo },
    };

    static PARTS = { main: { template: `modules/${MODULE_ID}/templates/changelog.hbs`, scrollable: ['.dsa5h-changelog-body'] } };

    async _prepareContext(options) {
      const context = await super._prepareContext(options);
      const installed = game.modules.get(MODULE_ID)?.version ?? '0.0.0';
      let sections = [];
      try {
        const response = await fetch(`modules/${MODULE_ID}/CHANGELOG.md?v=${installed}`);
        if (response.ok) sections = parseChangelog(await response.text());
      } catch (err) {
        console.error('DSA5 Helpers | Changelog konnte nicht geladen werden.', err);
      }
      const shown = this.since !== null ? sectionsSince(sections, this.since, installed, foundry.utils.isNewerVersion) : sections;
      const converter = new showdown.Converter();
      return Object.assign(context, {
        installed,
        filtered: this.since !== null && shown.length < sections.length,
        sections: shown.map(s => ({ ...s, html: converter.makeHtml(s.body) })),
        url: game.modules.get(MODULE_ID)?.changelog,
      });
    }

    static _showAll() {
      this.since = null;
      this.render();
    }

    /** Versionsknopf: Abschnitt aufklappen und an den Anfang des Scrollbereichs holen. */
    static _jumpTo(event, target) {
      const section = this.element.querySelector(`.dsa5h-changelog-version[data-version="${CSS.escape(target.dataset.version)}"]`);
      if (!section) return;
      section.open = true;
      section.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  };
  return ChangelogApp;
}

/** Nach einem Update (und bei Erstinstallation) einmal je Nutzer die neuen Abschnitte zeigen. */
export async function showChangelogIfUpdated() {
  const installed = game.modules.get(MODULE_ID)?.version;
  if (!installed) return;
  const seen = game.settings.get(MODULE_ID, 'lastSeenVersion');
  if (seen && !foundry.utils.isNewerVersion(installed, seen)) return;
  await game.settings.set(MODULE_ID, 'lastSeenVersion', installed);
  const App = getChangelogApp();
  new App({ since: seen || '' }).render({ force: true });
}
