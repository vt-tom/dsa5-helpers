/** Fahrzeugbogen im Modul-Design (Issue #93, Click-Dummy `index.html?actor=fahrzeug`, `mobile/fahrzeug.html`; Umsetzung auf
 *  Nutzerwunsch 2026-11-18, noch vor der Rückmeldung der Community – deren Beta-Feedback wird eingearbeitet).
 *  Erbt vom Fahrzeugbogen des Systems (ActorSheetdsa5Vehicle, DSA5 8.x): Daten (`_prepareContext`: Bordwaffen, Rammen,
 *  Geschützkunde, Fortbewegung, Besatzung, Besatzung per Ziehen) und alle Aktionen (`navalHeroAction`, `navalBoarding`,
 *  `navalBroadside`, Würfe) bleiben die des Systems. Hier steht nur die Darstellung im Rahmen des Heldenbogens: Reiter
 *  Titelblatt, Seekampf, Reise, Besatzung, Ladung, Status und Beschreibung; Seekampf, Besatzung, Ladung, Status und
 *  Beschreibung zeigen die Vorlagen des Systems in unserem Rahmen (wie Inventar und Reise im Gruppenbogen), Titelblatt
 *  und Reise sind eigene Zusammenfassungen aus denselben Daten. Kein Bearbeiten-Modus: die Felder des Systems sind für
 *  Besitzer immer bearbeitbar. */
import { bindItemTooltips } from './item-tooltips.js';

const MODULE_ID = 'dsa5-helpers';
const ICONS = 'systems/dsa5/icons/categories/';
// Reiter: `system` ist die Reiterkennung des Systems (Teile combat, crew, inventory, status, notes).
export const VEHICLE_TABS = [
  { id: 'cover', icon: 'systems/dsa5/icons/talents/BootSchifffe.webp', system: 'combat' },
  { id: 'combat', icon: ICONS + 'ability_combat.webp', system: 'combat' },
  { id: 'travel', icon: ICONS + 'arrow.webp', system: 'combat' },
  { id: 'crew', icon: ICONS + 'ability_command.webp', system: 'crew' },
  { id: 'inventory', icon: ICONS + 'Equipment.webp', system: 'inventory' },
  { id: 'status', icon: ICONS + 'ability_ceremonial.webp', system: 'status' },
  { id: 'notes', icon: ICONS + 'Ability_Language.webp', system: 'notes' },
];
// Unter dieser Inhaltsbreite (px) ohne linke Spalte, wie Helden- und Gruppenbogen.
const NARROW_WIDTH = 560;

const percent = (value, max) => (Number(max) > 0 ? Math.max(0, Math.min(100, Math.round(Number(value) / Number(max) * 100))) : 0);
const num = value => Number(value) || 0;
const format = (value, digits = 1) => Number(value).toLocaleString(game.i18n.lang, { maximumFractionDigits: digits });

// Auswahlfelder (Größe, Antrieb …) als Klartext aus den Choices des Schemas, wie im Heldenbogen (personalDetails).
function choiceLabel(actor, path, raw) {
  if (raw === undefined || raw === null || raw === '') return '';
  let choices = actor.system.schema?.getField?.(path)?.choices;
  if (typeof choices === 'function') choices = choices();
  const label = choices?.[raw];
  const text = typeof label === 'object' ? label?.label : label;
  return game.i18n.localize(text ?? String(raw));
}

export function createVehicleSheet(BaseVehicleSheet) {
  if (!BaseVehicleSheet) return null;
  return class Dsa5HelpersVehicleSheet extends BaseVehicleSheet {
    static DEFAULT_OPTIONS = {
      classes: ['dsa5-helpers-sheet', 'dsa5h-vehicle'],
      position: { width: 770, height: 740 },
      actions: { dsa5hSetTab: this._setTab, dsa5hTheme: this._toggleTheme },
      majorButtons: [
        {
          action: 'dsa5hTheme',
          label: 'DSA5HELPERS.Theme',
          icon: function () { return `fas fa-${game.settings.get(MODULE_ID, 'theme') === 'dark' ? 'sun' : 'moon'}`; },
        },
      ],
    };

    static PARTS = {
      sheet: { template: 'modules/dsa5-helpers/templates/actors/dsa5-helpers-vehicle-sheet.hbs', root: true, scrollable: ['.dsa5h-content'] },
    };

    // Das System tauscht bei eingeschränktem Zugriff die Teile aus (LIMITEDPARTS); unser Bogen zeigt dann selbst nur Bild und Name.
    static LIMITEDPARTS = null;

    _currentTab = 'cover';

    // Wie Helden- und Gruppenbogen: in jedem DSA5-Design gleich, Hell/Dunkel nur über die Modul-Einstellung „theme“.
    _initializeApplicationOptions(options) {
      options = super._initializeApplicationOptions(options);
      const drop = ['dsa-immersive-sheet', 'themed', 'theme-dark', 'theme-light'];
      options.classes = [...(options.classes ?? []).filter(cls => !drop.includes(cls)), 'themed', 'theme-light'];
      return options;
    }

    // Das System rendert nach manchen Aktionen nur einzelne Teile; unser Bogen hat nur einen.
    _configureRenderOptions(options) {
      super._configureRenderOptions(options);
      options.parts = Object.keys(this.constructor.PARTS);
    }

    async render(options = {}, _options = {}) {
      if (options && typeof options === 'object') this._pendingScrollTop = this.element?.querySelector('.dsa5h-content')?.scrollTop;
      return await super.render(options, _options);
    }

    _tabLabel(id) {
      return game.i18n.localize(`DSA5HELPERS.Vehicle.Tabs.${id}`);
    }

    async _prepareContext(options) {
      const context = await super._prepareContext(options);
      const actor = this.actor;
      const system = actor.system;
      const status = system.status ?? {};
      const combatState = system.combatState ?? {};
      const tabs = VEHICLE_TABS.map(tab => ({ ...tab, label: this._tabLabel(tab.id) }));
      const sp = status.structurePoints ?? {};
      const crew = status.crew ?? {};
      const available = num(system.availableCrew ?? Math.max(0, num(crew.value) - num(combatState.woundedCrew)));
      const hull = num(status.hullArmor?.value) + num(status.hullArmor?.modifier);
      const speed = status.speed ?? {};
      const capacity = num(system.details?.cargoCapacity ?? system.carrycapacity);
      const used = num(system.totalWeight);
      const propulsion = system.details?.propulsion;
      const modes = (context.prepare?.vehicleTravelModeOptions ?? []).map(mode => ({ label: game.i18n.localize(mode.label), on: !!mode.checked }));
      const members = (context.prepare?.crewMembers ?? []).map(member => ({
        uuid: member.uuid, name: member.name, firstName: String(member.name ?? '').split(' ')[0], img: member.img,
        ownerName: member.ownerName, ident: [member.system?.details?.species ?? member.system?.creatureClass, member.system?.details?.career].filter(Boolean).join(' · '),
      }));
      if (!tabs.some(tab => tab.id === this._currentTab)) this._currentTab = 'cover';
      context.dsa5h = {
        vehicle: true,
        limited: !!this.showLimited?.(),
        isGM: game.user.isGM,
        tabs,
        currentTab: this._currentTab,
        currentTabLabel: this._tabLabel(this._currentTab),
        sp: { value: num(sp.value), max: num(sp.max), pct: percent(sp.value, sp.max) },
        crewBar: { value: num(crew.value), max: num(crew.max), pct: percent(crew.value, crew.max) },
        stats: [
          ['Available', `${available} / ${num(crew.initial || crew.max)}`],
          ['Wounded', String(num(combatState.woundedCrew))],
          ['Hull', String(hull)],
          ['Speed', num(speed.ram) ? `${num(speed.value)} (${game.i18n.format('DSA5HELPERS.Vehicle.Ram', { value: num(speed.ram) })})` : String(num(speed.value))],
          ['Initiative', String(Math.floor(num(status.initiative?.value)))],
          ['Actions', String(num(system.actionCount?.value))],
          ['Distance', `${num(combatState.distanceRE)} RE`],
          ['Cargo', capacity ? `${format(used)} / ${format(capacity)} ${game.i18n.localize('stone')}` : `${format(used)} ${game.i18n.localize('stone')}`],
        ].map(([id, value]) => ({ label: game.i18n.localize(`DSA5HELPERS.Vehicle.Stat.${id}`), value })),
        size: choiceLabel(actor, 'status.size.value', status.size?.value),
        propulsion: choiceLabel(actor, 'details.propulsion', propulsion),
        showSail: !!context.prepare?.showNavalSail,
        showDrive: !!context.prepare?.showNavalDrive,
        speeds: [
          ['Base', num(speed.value)], ['Water', num(speed.water)], ['Air', num(speed.air) || '–'], ['Ram', num(speed.ram)],
        ].map(([id, value]) => ({ label: game.i18n.localize(`DSA5HELPERS.Vehicle.Speed.${id}`), value })),
        modes,
        cargo: { used: format(used), capacity: capacity ? format(capacity) : '', pct: percent(used, capacity), has: capacity > 0 },
        available,
        crewTotal: num(crew.initial || crew.max),
        members,
      };
      return context;
    }

    async _onRender(context, options) {
      await super._onRender(context, options);
      this.element.dataset.theme = game.settings.get(MODULE_ID, 'theme');
      this.element.classList.remove('vertical-tabs');
      this._applyCurrentTab();
      bindItemTooltips(this);
      if (this._pendingScrollTop) this.element.querySelector('.dsa5h-content')?.scrollTo({ top: this._pendingScrollTop });
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

    // Reiter ohne Neuzeichnen umschalten (wie Helden- und Gruppenbogen); das Porträt wandert auf dem Titelblatt nach links.
    _applyCurrentTab() {
      const root = this.element;
      if (!root) return;
      root.dataset.tab = this._currentTab;
      const system = VEHICLE_TABS.find(tab => tab.id === this._currentTab)?.system;
      if (system) this.tabGroups.sheet = system;
      const title = root.querySelector('[data-tab-title-label]');
      if (title) title.textContent = this._tabLabel(this._currentTab);
      root.querySelectorAll('[data-tab-panel]').forEach(el => { el.hidden = el.dataset.tabPanel !== this._currentTab; });
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

    // Smartphone und schmales Fenster: keine linke Spalte, die Übersicht steht oben im Titelblatt. Liefert „kompakt“.
    _applyCompact() {
      const root = this.element;
      const phone = !!document.body?.classList.contains('dsa5h-phone');
      const width = root.querySelector('.window-content')?.clientWidth ?? 0;
      const narrow = !phone && width > 0 && width < NARROW_WIDTH;
      root.classList.toggle('dsa5h-narrow', narrow);
      root.classList.toggle('dsa5h-vehicle-compact', phone || narrow);
      const overview = root.querySelector('.dsa5h-vehicle-overview');
      const target = phone || narrow ? root.querySelector('[data-vehicle-overview-slot]') : root.querySelector('[data-cover-sidebar]');
      if (overview && target && overview.parentElement !== target) target.append(overview);
      return phone || narrow;
    }

    static _setTab(_event, target) {
      const id = target.dataset.tab;
      if (!VEHICLE_TABS.some(tab => tab.id === id)) return;
      this._currentTab = id;
      this._applyCurrentTab();
      this.element.querySelector('.dsa5h-content')?.scrollTo({ top: 0 });
    }

    static async _toggleTheme() {
      const next = game.settings.get(MODULE_ID, 'theme') === 'dark' ? 'light' : 'dark';
      await game.settings.set(MODULE_ID, 'theme', next);
      for (const app of foundry.applications.instances.values()) {
        if (app.rendered && app.options?.classes?.includes('dsa5-helpers-sheet')) app.render();
      }
    }
  };
}
