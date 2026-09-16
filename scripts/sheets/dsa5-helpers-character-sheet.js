/** Alternative presentation; all rule actions and actor updates are inherited from DSA5. */
const BaseCharacterSheet = globalThis.dsa5?.sheets?.ActorSheetdsa5Character;
const MODULE_ID = 'dsa5-helpers';

export const Dsa5HelpersCharacterSheet = BaseCharacterSheet ? class extends BaseCharacterSheet {
  static DEFAULT_OPTIONS = {
    classes: ['dsa5-helpers-sheet'],
    position: { width: 880, height: 780 },
    actions: {
      dsa5hSetTab: this._setTab,
      dsa5hSetSubTab: this._setSubTab,
      dsa5hTheme: this._toggleTheme,
      dsa5hFavorite: this._toggleFavorite,
      dsa5hBag: this._openBag,
      dsa5hCloseBag: this._closeBag,
      postItem: this._postItem,
    },
    // Foundry concatenates majorButtons across the inheritance chain (ApplicationV2#_initializeApplicationOptions),
    // so this adds a third header-control icon next to DSA5's own eye/lock buttons instead of replacing them.
    majorButtons: [
      {
        action: 'dsa5hTheme',
        label: 'DSA5HELPERS.Theme',
        icon: function () { return `fas fa-${game.settings.get(MODULE_ID, 'theme') === 'dark' ? 'sun' : 'moon'}`; },
      },
    ],
  };
  static PARTS = {
    sheet: { template: 'modules/dsa5-helpers/templates/actors/dsa5-helpers-character-sheet.hbs', root: true, scrollable: ['.dsa5h-content'] },
  };
  // DSA5 uses LIMITEDPARTS (without underscore). The template renders public content only in this mode.
  static LIMITEDPARTS = this.PARTS;
  static HELPER_TABS = [
      { id: "cover", label: "Titelblatt", icon: "systems/dsa5/icons/categories/DSA-Auge-Spieler.webp", hint: "Übersicht · Favoriten" },
      { id: "main", label: "Eigenschaften", icon: "systems/dsa5/icons/categories/DSA-Auge.webp", hint: "Grundwerte · Erfahrung" },
      { id: "skills", label: "Talente", icon: "systems/dsa5/icons/categories/Skill.webp", hint: "" },
      { id: "combat", label: "Kampf", icon: "systems/dsa5/icons/categories/ability_combat.webp", hint: "" },
      { id: "magic", label: "Magie", icon: "systems/dsa5/icons/categories/Spell.webp", hint: "" },
      { id: "religion", label: "Religion", icon: "systems/dsa5/icons/categories/Liturgy.webp", hint: "" },
      { id: "inventory", label: "Ausrüstung", icon: "systems/dsa5/icons/categories/Equipment.webp", hint: "" },
      { id: "status", label: "Status", icon: "systems/dsa5/icons/categories/ability_ceremonial.webp", hint: "Zustände · Effekte · Krankheiten" },
      { id: "notes", label: "Notizen", icon: "systems/dsa5/icons/categories/Ability_Language.webp", hint: "Aussehen · Hintergrund · Verbindungen" },
      { id: "companion", label: "Gefährten", icon: "systems/dsa5/icons/categories/ability_animal.webp", hint: "Reittier · Vertraute · Begleiter" },
    ];
  _currentTab = 'cover';
  _subtabs = { skills: 'body', combat: 'combat', magic: 'spells', religion: 'spells' };
  _openBagId = null;
  _search = { talent: '', gear: '' };
  _favoritePending = false;

  _toggleDisabled(disabled) {
    super._toggleDisabled(disabled);
    // Observers may navigate and inspect bags even when Foundry disables document edits.
    this.element?.querySelectorAll('[data-action^="dsa5hSet"], [data-action="dsa5hTheme"], [data-action="dsa5hBag"], [data-action="dsa5hCloseBag"]')
      .forEach(button => { button.disabled = false; });
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const limited = this.showLimited();
    const prepare = context.prepare ?? {};
    const localize = key => game.i18n.localize(key);
    const magic = prepare.magic ?? {};
    // Same flags the inherited header partial already uses to hide the AsP/KaP resource cards (SHEET.hasSpells/hasPrayers ==
    // actor.system.isMage/isPriest) — reused here so Magie/Religion only appear in the rail for characters that can use them,
    // exactly like the real system's own ActorSheetDsa5#_prepareTabs.
    const tabs = this.constructor.HELPER_TABS
      .filter(tab => (tab.id !== 'magic' || magic.hasSpells) && (tab.id !== 'religion' || magic.hasPrayers))
      .map(tab => ({ ...tab, label: localize('DSA5HELPERS.Tabs.' + tab.id), hint: localize('DSA5HELPERS.Hints.' + tab.id) }));
    if (!tabs.some(tab => tab.id === this._currentTab)) this._currentTab = 'cover';
    const favorites = Object.fromEntries((this.actor.getFlag(MODULE_ID, 'favorites') ?? []).filter(id => this.actor.items.has(id)).map(id => [id, true]));
    const skillGroups = Object.entries({ ...prepare.allSkillsLeft, ...prepare.allSkillsRight }).map(([id, items]) => ({ id, items }));
    const specs = {};
    for (const kind of ['general', 'combat', 'magical', 'clerical']) {
      specs[kind] = Array.from(prepare.sortedSpecs?.[kind] ?? []).filter(cat => kind !== 'general' || cat !== 'language')
        .map(cat => ({ cat, items: prepare.specAbs?.[cat] ?? [] })).filter(group => group.items.length);
    }
    const weaponGroups = [
      { label: 'closeCombatAttacks', type: 'meleeweapon', items: [...(prepare.wornMeleeWeapons ?? []), ...(prepare.traits?.meleeAttack ?? [])] },
      { label: 'rangeweapons', type: 'rangeweapon', ranged: true, items: [...(prepare.wornRangedWeapons ?? []), ...(prepare.traits?.rangeAttack ?? [])] },
    ];
    // weapontype 0 == melee (also used further down to decide whether a combat skill shows a parry value) —
    // matches the click-dummy's Nahkampftechniken/Fernkampftechniken split (COMBAT_SKILLS filtered by pa !== "—").
    const combatSkillGroups = [
      { label: 'DSA5HELPERS.MeleeSkills', items: (prepare.combatskills ?? []).filter(item => Number(item.system.weapontype.value) === 0) },
      { label: 'DSA5HELPERS.RangeSkills', items: (prepare.combatskills ?? []).filter(item => Number(item.system.weapontype.value) !== 0) },
    ];
    const favoriteGroups = [
      { label: 'skills', items: skillGroups.flatMap(group => group.items) },
      { label: 'DSA5HELPERS.Weapons', weapon: true, items: weaponGroups.flatMap(group => group.items) },
      { label: 'spells', items: [...(magic.spellList ?? []), ...(magic.ritualList ?? []), ...(magic.spellActions ?? []).flatMap(group => group.items), ...(magic.ritualActions ?? []).flatMap(group => group.items)] },
      { label: 'liturgies', items: [...(magic.liturgy ?? []), ...(magic.ceremony ?? [])] },
    ].map(group => ({ ...group, items: group.items.filter(item => favorites[item._id]) })).filter(group => group.items.length);
    const subnav = [
      { tab: 'skills', items: [...skillGroups.map(group => ({ id: group.id, label: localize('SKILL.' + group.id) })), { id: 'aggregated', label: localize('aggregatedTests') }] },
      { tab: 'combat', items: [{ id: 'combat', label: localize('Combat') }, { id: 'skills', label: localize('TYPES.Item.combatskill') }] },
      ...['magic', 'religion'].map(tab => ({ tab, items: [{ id: 'spells', label: localize(tab === 'magic' ? 'spells' : 'liturgies') }, { id: 'equipment', label: localize('DSA5HELPERS.Tabs.inventory') }] })),
    ];
    const status = this.actor.system.status;
    context.dsa5h = {
      limited, tabs, subnav, skillGroups, favorites, favoriteGroups, weaponGroups, combatSkillGroups, specs,
      currentTab: this._currentTab,
      currentTabLabel: tabs.find(tab => tab.id === this._currentTab)?.label,
      editMode: this.isEditable && !prepare.sheetLocked,
      specGeneral: { groups: specs.general, showSubheads: specs.general.length > 1 },
      bags: prepare.inventory?.bags?.items ?? [],
      inventory: Object.entries(prepare.inventory ?? {}).filter(([id, section]) => id !== 'bags' && section.show).map(([id, section]) => ({ id, ...section })),
      // initiative.value has no .max and carries a fractional tie-breaker for the combat tracker's sort order
      // (baseactor.js calcInitiative(): Math.round(value) + 0.01*value) — floored here exactly like every real
      // system template does ({{floor document.system.status.initiative.value}} in actor-main.hbs etc.).
      combatValues: ['dodge', 'initiative'].map(id => {
        const raw = status[id]?.max ?? status[id]?.value;
        return { label: id, value: raw === undefined ? '–' : Math.floor(raw) };
      }),
      regenerations: ['wounds', 'astralenergy', 'karmaenergy'].filter(id => this.actor.system.repeatingEffects?.startOfRound?.[id]?.length).map(id => ({ id, active: !this.actor.system.repeatingEffects.disabled?.[id] })),
    };
    // The original sheet prepares this only for its separate companion part.
    if (!limited) await this.prepareCompanionTab(context);
    return context;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    this.element.dataset.mode = context.dsa5h.editMode ? 'edit' : 'play';
    this.element.dataset.theme = game.settings.get(MODULE_ID, 'theme');
    this._applyCurrentTab();
    if (context.dsa5h.limited) return;
    const companion = this.element.querySelector('[data-tab-panel="companion"]');
    if (companion) this.attachCompanionTabListeners(companion);
    const searchHandlers = { talent: () => this._applyTalentSearch(), gear: () => this._applyGearSearch() };
    for (const [kind, selector] of Object.entries({ talent: '.talentSearch', gear: '.gearSearch' })) {
      const input = this.element.querySelector(selector);
      if (!input) continue;
      input.value = this._search[kind];
      input.addEventListener('input', () => { this._search[kind] = input.value; searchHandlers[kind](); });
    }
    this._applyGearSearch();
    if (this._openBagId) {
      const dialog = this._findBagDialog(this._openBagId);
      if (dialog) dialog.showModal();
      else this._openBagId = null;
    }
    this.element.querySelectorAll('.dsa5h-bag-dialog').forEach(dialog => {
      dialog.addEventListener('close', () => { if (this._openBagId === dialog.dataset.bagDialog) this._openBagId = null; });
    });
  }

  static _setTab(_event, target) {
    if (!this.constructor.HELPER_TABS.some(tab => tab.id === target.dataset.tab)) return;
    this._currentTab = target.dataset.tab;
    this._applyCurrentTab();
    this.element.querySelector('.dsa5h-content')?.scrollTo({ top: 0 });
  }

  static _setSubTab(_event, target) {
    const tab = target.dataset.parentTab;
    const id = target.dataset.subtab;
    if (!Object.hasOwn(this._subtabs, tab)) return;
    this._subtabs[tab] = id;
    this._applyCurrentTab();
  }

  _applyCurrentTab() {
    const root = this.element;
    if (!root) return;
    // Drives the cover tab's full-height sidebar grid (CSS: .dsa5-helpers-sheet[data-tab="cover"] .dsa5h-main).
    root.dataset.tab = this._currentTab;
    const localize = key => game.i18n.localize(key);
    const title = root.querySelector('[data-tab-title-label]');
    if (title) title.textContent = localize('DSA5HELPERS.Tabs.' + this._currentTab);
    const hint = root.querySelector('[data-tab-hint]');
    if (hint) hint.textContent = localize('DSA5HELPERS.Hints.' + this._currentTab);
    root.querySelectorAll('[data-tab-panel]').forEach(el => { el.hidden = el.dataset.tabPanel !== this._currentTab; });
    root.querySelectorAll('[data-tab-rail-target]').forEach(el => {
      const active = el.dataset.tabRailTarget === this._currentTab;
      el.classList.toggle('active', active);
      el.setAttribute('aria-current', active ? 'page' : 'false');
    });
    root.querySelectorAll('[data-subnav]').forEach(el => { el.hidden = el.dataset.subnav !== this._currentTab; });
    root.querySelectorAll('[data-subtab]').forEach(el => {
      const active = this._subtabs[el.dataset.parentTab] === el.dataset.subtab;
      el.classList.toggle('active', active);
      el.setAttribute('aria-pressed', String(active));
    });
    root.querySelectorAll('[data-sub-panel]').forEach(el => {
      const [tab, id] = el.dataset.subPanel.split(':');
      el.hidden = this._subtabs[tab] !== id;
    });
    this._applyTalentSearch();
    root.querySelector('[data-attr-overlay]')?.toggleAttribute('hidden', this._currentTab === 'main');
    // Move the same controls, so the overview never duplicates named form fields.
    root.querySelectorAll('[data-cover-move]').forEach(el => {
      const slot = el.dataset.coverMove;
      if (this._currentTab === 'cover') root.querySelector('[data-cover-slot="' + slot + '"]')?.append(el);
      else root.querySelector('[data-header-slot="' + slot + '"]')?.after(el);
    });
  }

  // The category panels live under data-skill-panel; while a search is active every category stays visible
  // (matching the real system's own SearchFilter#_filterTalents, which forces .allTalents into "showAll") and
  // individual rows are filtered by name instead. The Sammelproben panel sits outside .allTalents and is
  // intentionally left to plain subtab switching, exactly like the real system scopes its own gearSearch.
  _applyTalentSearch() {
    const root = this.element;
    if (!root) return;
    const query = this._search.talent.trim().toLowerCase();
    root.querySelectorAll('[data-skill-panel]').forEach(panel => {
      const grouped = panel.closest('.allTalents');
      if (grouped && query) {
        panel.hidden = false;
        panel.querySelectorAll('.dsa5h-skill-row.item').forEach(row => {
          const name = row.querySelector('.talentName')?.textContent?.toLowerCase() ?? '';
          row.hidden = !name.includes(query);
        });
        return;
      }
      panel.hidden = panel.dataset.skillPanel !== this._subtabs.skills;
      if (grouped) panel.querySelectorAll('.dsa5h-skill-row.item').forEach(row => { row.hidden = false; });
    });
  }

  _applyGearSearch() {
    const root = this.element;
    if (!root) return;
    const query = this._search.gear.trim().toLowerCase();
    root.querySelectorAll('[data-tab-panel="inventory"] .item').forEach(entry => {
      const title = entry.querySelector('.equipment-item-name [data-action="itemEdit"]')?.textContent?.toLowerCase() ?? '';
      entry.hidden = query && title ? !title.includes(query) : false;
    });
  }

  static async _toggleTheme() {
    const theme = game.settings.get(MODULE_ID, 'theme') === 'dark' ? 'light' : 'dark';
    await game.settings.set(MODULE_ID, 'theme', theme);
    this.element.dataset.theme = theme;
    const headerButton = this.element.querySelector('.header-control[data-action="dsa5hTheme"]');
    headerButton?.classList.toggle('fa-sun', theme === 'dark');
    headerButton?.classList.toggle('fa-moon', theme !== 'dark');
  }

  static async _toggleFavorite(_event, target) {
    if (!this.isEditable || this._favoritePending) return;
    const id = target.dataset.itemId ?? target.closest('[data-item-id]')?.dataset.itemId;
    if (!this.actor.items.has(id)) return;
    this._favoritePending = true;
    try {
      const ids = new Set(this.actor.getFlag(MODULE_ID, 'favorites') ?? []);
      if (ids.has(id)) ids.delete(id); else ids.add(id);
      await this.actor.setFlag(MODULE_ID, 'favorites', [...ids].filter(key => this.actor.items.has(key)));
    } finally { this._favoritePending = false; }
  }

  _findBagDialog(id) {
    return Array.from(this.element.querySelectorAll('[data-bag-dialog]')).find(el => el.dataset.bagDialog === id);
  }
  static _openBag(_event, target) {
    const dialog = this._findBagDialog(target.dataset.bagId);
    if (!dialog) return;
    this._openBagId = target.dataset.bagId;
    if (!dialog.open) dialog.showModal();
  }
  static _closeBag(_event, target) {
    this._openBagId = null;
    target.closest('dialog')?.close();
  }
} : null;
