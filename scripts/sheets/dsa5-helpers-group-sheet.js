/** Gruppenbogen im Modul-Design (Issue #55, Click-Dummy `index.html?actor=gruppe`, Umsetzung in Foundry auf Nutzerwunsch
 *  2026-11-13, Feinschliff nach Rückmeldung). Erbt vom Gruppenbogen des Systems (GroupActorSheet, DSA5 8.x): Daten
 *  (_prepareContext: Mitglieder mit Rechteprüfung, Kasse, Talente, Depots, Reise, Gruppen-Schips, Helfer) und alle
 *  Aktionen (Gruppenprobe, Probe anfordern, Schips, AP, Bezahlung, Depots …) bleiben die des Systems; hier steht nur die
 *  Darstellung im Rahmen des Heldenbogens. Inventar und Reise zeigen vorerst die Vorlagen des Systems in unserem Rahmen.
 *  Eigenes: Kachelgröße je Benutzer, was Spieler bei fremden Mitgliedern sehen (Flag am Gruppenakteur), Anfragen der
 *  Spieler an die SL (group-requests.js). */
import { openDiceStats } from '../apps/dice-stats.js';
import { openHouseRules } from '../apps/house-rules.js';
import { bindItemTooltips } from './item-tooltips.js';
import { openRequests, pendingRequest, sendRequestDialog, executeRequest, declineRequest } from './group-requests.js';

const MODULE_ID = 'dsa5-helpers';
const ICONS = 'systems/dsa5/icons/categories/';
// Reiter (System: members, skills, inventory, travel, gmTools, notes). Das Titelblatt zeigt die Mitglieder, die
// Funktionen der SL stehen in „Spielleitung“, die Helfer der Inhaltsmodule in „Lager“ (im System beides gmTools).
export const GROUP_TABS = [
  { id: 'cover', icon: ICONS + 'Spellextension.webp', system: 'members' },
  { id: 'skills', icon: ICONS + 'Skill.webp', system: 'skills' },
  { id: 'inventory', icon: ICONS + 'Equipment.webp', system: 'inventory' },
  { id: 'travel', icon: ICONS + 'arrow.webp', system: 'travel' },
  { id: 'gm', icon: ICONS + 'secret.webp', system: 'gmTools', gmOnly: true },
  { id: 'camp', icon: ICONS + 'consumable.webp', system: 'gmTools' },
  { id: 'notes', icon: ICONS + 'Ability_Language.webp', system: 'notes' },
];
export const SIZE_FLAG = 'groupTileSize';
export const VIS_FLAG = 'groupVisibility';
export const TILE_SIZES = ['s', 'm', 'l'];
const HELPER_SECTIONS = ['gm-tools', 'travel-camp'];
// Unter dieser Inhaltsbreite (px) ohne linke Spalte, wie der Heldenbogen (dsa5-helpers-character-sheet.js).
const NARROW_WIDTH = 560;

// Kachelgröße je Benutzer und Gruppe (User-Flag wie die Anzahl der Vorschläge im Heldenbogen), Standard mittel.
export function tileSize(actor) {
  const value = game.user?.getFlag?.(MODULE_ID, SIZE_FLAG)?.[actor.id];
  return TILE_SIZES.includes(value) ? value : 'm';
}

// Was Spieler bei fremden Mitgliedern sehen: Kultur/Profession/Schips = Systemeinstellung privacy.hideForeignIdentity
// (umgekehrt), LeP, AsP/KaP und Zustände = Flag am Gruppenakteur (Standard wie im System: nicht sichtbar).
export function groupVisibility(actor) {
  const flag = actor.getFlag?.(MODULE_ID, VIS_FLAG) ?? {};
  return { identity: !actor.system?.privacy?.hideForeignIdentity, lep: !!flag.lep, pools: !!flag.pools, cond: !!flag.cond };
}

const percent = (value, max) => (Number(max) > 0 ? Math.max(0, Math.min(100, Math.round(Number(value) / Number(max) * 100))) : 0);

// Zustände eines Mitglieds (Statuseffekte mit Stufe), wie sie der Systembogen im Kopf zeigt.
function memberConditions(actor) {
  const effects = actor?.effects?.filter?.(effect => effect.statuses?.size && !effect.disabled) ?? [];
  return effects.map(effect => {
    const level = Number(effect.getFlag?.('dsa5', 'value'));
    return { id: effect.id, actorId: actor.id, name: game.i18n.localize(effect.name), level: Number.isFinite(level) && level > 0 ? level : null, img: effect.img };
  });
}

// Ein Mitglied für die Kacheln: Rechte wie im System (canViewPrivateDetails = SL oder Besitzer, canViewForeignIdentity),
// dazu die Freigaben der SL. Was nicht sichtbar ist, steht gar nicht im HTML.
export function memberView(member, vis, actor = null) {
  const own = !!member.canViewPrivateDetails;
  const status = member.system?.status ?? {};
  const pool = (key, abbr, shown) => {
    const data = status[key];
    if (!data) return null;
    return { key, abbr, value: Number(data.value) || 0, max: Number(data.max) || 0, pct: percent(data.value, data.max), visible: shown, own };
  };
  const details = member.system?.details ?? {};
  const identity = member.type === 'creature' ? [member.system?.creatureClass] : [details.species, details.culture, details.career];
  const conditionsVisible = own || vis.cond;
  const conditions = conditionsVisible ? memberConditions(actor) : [];
  const pools = [
    pool('wounds', 'LeP', own || vis.lep),
    member.system?.isMage ? pool('astralenergy', 'AsP', own || vis.pools) : null,
    member.system?.isPriest ? pool('karmaenergy', 'KaP', own || vis.pools) : null,
  ].filter(Boolean);
  return {
    key: member.key,
    uuid: member.uuid,
    id: member.id,
    name: member.name,
    firstName: String(member.name ?? '').split(' ')[0],
    img: member.img,
    type: member.type,
    ownerName: member.ownerName,
    own,
    ident: identity.filter(Boolean).join(' · '),
    schips: member.canViewForeignIdentity ? member.schips ?? [] : [],
    showSchips: !!member.canViewForeignIdentity,
    pools,
    lep: pools.find(entry => entry.key === 'wounds') ?? null,
    extraPools: pools.filter(entry => entry.key !== 'wounds'),
    anyValues: pools.some(entry => entry.visible),
    conditionsVisible,
    conditions,
    conditionText: conditions.map(entry => entry.level ? `${entry.name} ${entry.level}` : entry.name).join(', '),
  };
}

export function createGroupSheet(BaseGroupSheet) {
  if (!BaseGroupSheet) return null;
  return class Dsa5HelpersGroupSheet extends BaseGroupSheet {
    static DEFAULT_OPTIONS = {
      classes: ['dsa5-helpers-sheet', 'dsa5h-group'],
      position: { width: 770, height: 740 },
      actions: {
        dsa5hSetTab: this._setTab,
        dsa5hTileSize: this._setTileSize,
        dsa5hGroupEdit: this._toggleEdit,
        dsa5hGroupVis: this._toggleVisibility,
        dsa5hTheme: this._toggleTheme,
        dsa5hAskGm: this._askGm,
        dsa5hRequestExecute: this._executeRequest,
        dsa5hRequestDecline: this._declineRequest,
        dsa5hDiceStats: () => openDiceStats(),
        dsa5hHouseRules: () => openHouseRules(),
      },
      majorButtons: [
        {
          action: 'dsa5hTheme',
          label: 'DSA5HELPERS.Theme',
          icon: function () { return `fas fa-${game.settings.get(MODULE_ID, 'theme') === 'dark' ? 'sun' : 'moon'}`; },
        },
      ],
    };
    static PARTS = {
      sheet: { template: 'modules/dsa5-helpers/templates/actors/dsa5-helpers-group-sheet.hbs', root: true, scrollable: ['.dsa5h-content'] },
    };

    _currentTab = 'cover';
    _editMode = false;

    // Wie der Heldenbogen: in jedem DSA5-Design gleich, Hell/Dunkel nur über die Modul-Einstellung „theme“.
    _initializeApplicationOptions(options) {
      options = super._initializeApplicationOptions(options);
      const drop = ['dsa-immersive-sheet', 'themed', 'theme-dark', 'theme-light'];
      options.classes = [...(options.classes ?? []).filter(cls => !drop.includes(cls)), 'themed', 'theme-light'];
      return options;
    }

    // Das System rendert nach dem Öffnen eines Helfers nur seinen Teil „gmTools“; unser Bogen hat nur einen Teil.
    _configureRenderOptions(options) {
      super._configureRenderOptions(options);
      options.parts = Object.keys(this.constructor.PARTS);
    }

    async render(options = {}, _options = {}) {
      if (options && typeof options === 'object') {
        this._pendingScrollTop = this.element?.querySelector('.dsa5h-content')?.scrollTop;
      }
      return await super.render(options, _options);
    }

    get _tabs() {
      return GROUP_TABS.filter(tab => !tab.gmOnly || game.user.isGM);
    }

    _tabLabel(id) {
      if (id === 'camp' && !game.user.isGM) return game.i18n.localize('GROUP.camp');
      return game.i18n.localize(`DSA5HELPERS.Group.Tabs.${id}`);
    }

    async _prepareContext(options) {
      const context = await super._prepareContext(options);
      const isGM = game.user.isGM;
      const actor = this.actor;
      const vis = groupVisibility(actor);
      if (!this._tabs.some(tab => tab.id === this._currentTab)) this._currentTab = 'cover';
      const members = (context.members ?? []).map(member => memberView(member, vis, fromUuidSync(member.uuid)));
      const size = tileSize(actor);
      const tabs = this._tabs.map(tab => ({ ...tab, label: this._tabLabel(tab.id) }));
      // Summen links nur für die SL (Spieler sehen fremde Werte nicht, Summen verrieten sie).
      const sum = key => {
        const list = (context.members ?? []).map(member => member.system?.status?.[key]).filter(entry => entry && Number(entry.max) > 0);
        return list.length ? `${list.reduce((total, entry) => total + (Number(entry.value) || 0), 0)} / ${list.reduce((total, entry) => total + (Number(entry.max) || 0), 0)}` : '–';
      };
      const foot = context.travelSpeeds?.foot;
      const helpers = game.dsa5?.apps?.GroupAPI?.helpers;
      const cards = (context.gmTools?.cards ?? []).map(card => ({ ...card, gmOnly: !!helpers?.get?.(card.id)?.gmOnly }));
      // Spieler: Helfer nur für die SL (gmOnly) als Karte „Bei der SL anfragen“ (Rückmeldung 2026-11-12).
      const askable = isGM || !helpers ? [] : [...helpers.entries()]
        .filter(([, helper]) => helper.gmOnly && HELPER_SECTIONS.includes(helper.section) && helper.visible?.(actor) !== false)
        .sort(([, a], [, b]) => (a.sort ?? 100) - (b.sort ?? 100))
        .map(([id, helper]) => {
          const icon = helper.icon ?? '';
          return { id, label: helper.label, hint: helper.hint, icon, iconIsImg: icon.includes('/') || /\.(webp|png|jpg|jpeg|svg|gif)$/i.test(icon), pending: !!pendingRequest(actor, id) };
        });
      context.dsa5h = {
        group: true,
        isGM,
        tabs,
        currentTab: this._currentTab,
        currentTabLabel: this._tabLabel(this._currentTab),
        editMode: isGM && this._editMode,
        size,
        sizes: TILE_SIZES.map(id => ({ id, label: game.i18n.localize(`DSA5HELPERS.Group.Size.${id}`), active: id === size })),
        vis,
        visOptions: ['identity', 'lep', 'pools', 'cond'].map(id => ({ id, label: game.i18n.localize(`DSA5HELPERS.Group.Vis.${id}`), active: vis[id] })),
        members,
        travelFoot: foot ? { meilen: Number(foot.meilen ?? 0).toLocaleString(game.i18n.lang, { maximumFractionDigits: 1 }) } : null,
        sums: isGM ? [
          { label: game.i18n.localize('DSA5HELPERS.Group.SumLeP'), value: sum('wounds') },
          { label: game.i18n.localize('DSA5HELPERS.Group.SumAsP'), value: sum('astralenergy') },
          { label: game.i18n.localize('DSA5HELPERS.Group.SumKaP'), value: sum('karmaenergy') },
        ] : [],
        skillCategories: this._skillCategories(),
        camp: {
          cards,
          askable,
          expanded: context.gmTools?.expanded ?? null,
          requests: isGM ? openRequests(actor) : [],
        },
      };
      return context;
    }

    // Talente der Gruppe (Reiter Talente): je Talent der beste Wert mit Mitglied und die übrigen – Werte nur, wo der
    // Benutzer den Helden sehen darf (wie der Tooltip des Systems, canViewActorSkillValues), sonst „?“.
    _skillCategories() {
      const skills = Object.values(this.actor.system.groupSkills ?? {});
      const canView = actor => game.user.isGM || !!actor?.testUserPermission?.(game.user, 'OBSERVER');
      const label = entry => ({ name: String(entry.actor?.name ?? '').split(' ')[0], value: canView(entry.actor) ? entry.value : '?' });
      const order = ['body', 'social', 'nature', 'knowledge', 'trade'];
      const categories = new Map();
      for (const skill of skills.sort((a, b) => a.name.localeCompare(b.name, game.i18n.lang))) {
        const entries = [skill.best, ...(skill.others ?? [])].filter(Boolean).sort((a, b) => b.value - a.value);
        const visible = entries.filter(entry => canView(entry.actor));
        const best = visible[0] ? label(visible[0]) : { name: '', value: '?' };
        const others = entries.filter(entry => entry !== visible[0]).map(label);
        const id = skill.category || 'other';
        if (!categories.has(id)) categories.set(id, []);
        categories.get(id).push({ name: skill.name, best, others });
      }
      return [...categories.entries()]
        .sort(([a], [b]) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99))
        .map(([id, rows]) => ({ id, label: game.i18n.localize(`SKILL.${id}`), rows }));
    }

    async _onRender(context, options) {
      await super._onRender(context, options);
      this.element.dataset.theme = game.settings.get(MODULE_ID, 'theme');
      this.element.classList.remove('vertical-tabs');
      this._applyCurrentTab();
      // Zustände der Mitglieder: Karte des Systems beim Überfahren (#52).
      bindItemTooltips(this);
      if (this._pendingScrollTop) this.element.querySelector('.dsa5h-content')?.scrollTo({ top: this._pendingScrollTop });
      // LeP/AsP/KaP eigener Mitglieder direkt ändern (Kacheln): am Mitglied speichern, nicht am Gruppenakteur.
      for (const input of this.element.querySelectorAll('input[data-dsa5h-member-pool]')) {
        input.addEventListener('change', async event => {
          event.stopPropagation();
          const member = await fromUuid(input.dataset.uuid);
          if (!member?.isOwner) return;
          const value = Math.max(0, Math.round(Number(input.value) || 0));
          await member.update({ [`system.status.${input.dataset.dsa5hMemberPool}.value`]: value });
        });
      }
      // Fenster am dunklen Kopf ziehen wie beim Heldenbogen.
      if (this._listenerElement !== this.element) {
        this._listenerElement = this.element;
        let observedWidth = 0;
        new ResizeObserver(([entry]) => {
          if (entry.contentRect.width === observedWidth) return;
          observedWidth = entry.contentRect.width;
          this._applyCurrentTab();
        }).observe(this.element);
        this.element.addEventListener('pointerdown', event => {
          if (event.button !== 0 || !this.window?.header) return;
          const target = event.target;
          if (!target?.closest?.('.dsa5h-head') || target.closest('button, a, input, select, textarea, label, [data-action]')) return;
          this.window.header.dispatchEvent(new PointerEvent('pointerdown', {
            bubbles: true, button: 0, buttons: event.buttons, clientX: event.clientX, clientY: event.clientY,
            pointerId: event.pointerId, pointerType: event.pointerType, isPrimary: event.isPrimary,
          }));
        });
      }
    }

    // Reiter ohne Neuzeichnen umschalten (wie der Heldenbogen); Porträt wandert auf dem Titelblatt in die linke Spalte.
    _applyCurrentTab() {
      const root = this.element;
      if (!root) return;
      root.dataset.tab = this._currentTab;
      const system = GROUP_TABS.find(tab => tab.id === this._currentTab)?.system;
      if (system) this.tabGroups.sheet = system;
      const title = root.querySelector('[data-tab-title-label]');
      if (title) title.textContent = this._tabLabel(this._currentTab);
      root.querySelectorAll('[data-tab-panel]').forEach(el => { el.hidden = el.dataset.tabPanel !== this._currentTab; });
      root.querySelectorAll('[data-tab-only]').forEach(el => { el.hidden = el.dataset.tabOnly !== this._currentTab; });
      root.querySelectorAll('[data-tab-rail-target]').forEach(el => {
        const active = el.dataset.tabRailTarget === this._currentTab;
        el.classList.toggle('active', active);
        el.setAttribute('aria-current', active ? 'page' : 'false');
      });
      const keepInHead = this._applyCompact();
      root.querySelectorAll('[data-cover-move]').forEach(el => {
        const slot = el.dataset.coverMove;
        if (this._currentTab === 'cover' && !keepInHead) root.querySelector(`[data-cover-slot="${slot}"]`)?.append(el);
        else root.querySelector(`[data-header-slot="${slot}"]`)?.after(el);
      });
    }

    // Smartphone und schmales Fenster (Inhalt < 560 px wie beim Heldenbogen): keine linke Spalte, die Übersicht steht oben
    // im Titelblatt; am Desktop dazu die Klasse dsa5h-narrow für Kopf und Raster des Heldenbogens. Liefert „kompakt“.
    _applyCompact() {
      const root = this.element;
      const phone = !!document.body?.classList.contains('dsa5h-phone');
      const width = root.querySelector('.window-content')?.clientWidth ?? 0;
      const narrow = !phone && width > 0 && width < NARROW_WIDTH;
      root.classList.toggle('dsa5h-narrow', narrow);
      root.classList.toggle('dsa5h-group-compact', phone || narrow);
      const overview = root.querySelector('.dsa5h-group-overview');
      const target = phone || narrow ? root.querySelector('[data-group-overview-slot]') : root.querySelector('[data-cover-sidebar]');
      if (overview && target && overview.parentElement !== target) target.append(overview);
      return phone || narrow;
    }

    static _setTab(_event, target) {
      const id = target.dataset.tab;
      if (!this._tabs.some(tab => tab.id === id)) return;
      this._currentTab = id;
      this._applyCurrentTab();
      this.element.querySelector('.dsa5h-content')?.scrollTo({ top: 0 });
    }

    static async _setTileSize(_event, target) {
      const size = target.dataset.size;
      if (!TILE_SIZES.includes(size)) return;
      await game.user.setFlag(MODULE_ID, SIZE_FLAG, { [this.actor.id]: size });
      this.render();
    }

    static _toggleEdit() {
      if (!game.user.isGM) return;
      this._editMode = !this._editMode;
      this.render();
    }

    // Freigaben der SL: Identität über die Aktion des Systems, die übrigen als Flag am Gruppenakteur.
    static async _toggleVisibility(event, target) {
      if (!game.user.isGM) return;
      const key = target.dataset.vis;
      if (key === 'identity') return this.actor.update({ 'system.privacy.hideForeignIdentity': !this.actor.system.privacy?.hideForeignIdentity });
      if (!['lep', 'pools', 'cond'].includes(key)) return;
      const current = groupVisibility(this.actor);
      await this.actor.setFlag(MODULE_ID, VIS_FLAG, { lep: current.lep, pools: current.pools, cond: current.cond, [key]: !current[key] });
    }

    static async _toggleTheme() {
      const next = game.settings.get(MODULE_ID, 'theme') === 'dark' ? 'light' : 'dark';
      await game.settings.set(MODULE_ID, 'theme', next);
      for (const app of foundry.applications.instances.values()) {
        if (app.rendered && app.options?.classes?.includes('dsa5-helpers-sheet')) app.render();
      }
    }

    static _askGm(_event, target) {
      const id = target.dataset.groupHelper;
      const helper = game.dsa5?.apps?.GroupAPI?.helpers?.get?.(id);
      if (!helper) return;
      if (pendingRequest(this.actor, id)) return ui.notifications.info('DSA5HELPERS.Group.Ask.Pending', { localize: true });
      sendRequestDialog(this.actor, id, game.i18n.localize(helper.label));
    }

    static _executeRequest(_event, target) {
      return executeRequest(target.dataset.messageId);
    }

    static _declineRequest(_event, target) {
      return declineRequest(target.dataset.messageId);
    }

    // Für Anfragen der Spieler (group-requests.js): Lager-Reiter zeigen und den Helfer wie per Klick auf die Karte öffnen.
    async runHelper(id) {
      this._currentTab = 'camp';
      await this.render({ force: true });
      this._applyCurrentTab();
      this.element?.querySelector(`[data-action="groupHelperAction"][data-group-helper="${CSS.escape(id)}"]`)?.click();
    }
  };
}
