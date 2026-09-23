/** Alternative presentation; all rule actions and actor updates are inherited from DSA5. */
const BaseCharacterSheet = globalThis.dsa5?.sheets?.ActorSheetdsa5Character;
const MODULE_ID = 'dsa5-helpers';

export const Dsa5HelpersCharacterSheet = BaseCharacterSheet ? class extends BaseCharacterSheet {
  static DEFAULT_OPTIONS = {
    classes: ['dsa5-helpers-sheet'],
    // War 880×780 — spürbar größer als sowohl der echte DSA5-Bogen (784px) als auch der bewusst kompakt gehaltene
    // Click-Dummy (770×740, siehe clickdummy/style.css .sheet), Nutzer-Feedback 2026-09-19: sollte dem Click-
    // Dummy wieder angeglichen werden. Rechnerisch passen die festen Spaltenbreiten der breitesten Tabellen
    // (Waffen-/Kampftechnik-Zeilen) auch bei dieser Breite noch knapp unter die bestehende @container-Schwelle
    // von 700px (styles/dsa5-helpers-character-sheet.css) — die dortigen kompakten Varianten sollten also NICHT
    // ungewollt greifen (z. B. die gerade erst auf 4 Spalten überarbeitete Traditionsleiste würde dort auf 2
    // Spalten zurückfallen). Reine Rechnung, noch nicht live in Foundry geprüft — bei Bedarf zuerst hier
    // nachjustieren, bevor an der @container-Schwelle gedreht wird.
    position: { width: 770, height: 740 },
    actions: {
      dsa5hSetTab: this._setTab,
      dsa5hSetSubTab: this._setSubTab,
      dsa5hTheme: this._toggleTheme,
      dsa5hFavorite: this._toggleFavorite,
      dsa5hBag: this._openBag,
      dsa5hCloseBag: this._closeBag,
      dsa5hToggleHappyTalents: this._toggleHappyTalents,
      postItem: this._postItem,
    },
    // DSA5's own roll/damage actions (attribute dice, combat rolls, advances, item toggles, …) live in
    // ownerRollActions/ownerActions, not the plain `actions` table above — a separate permission-gated dispatch
    // in DSA5's AppV2Mixin#_onClickAction. Re-declaring the subset our own templates call by name here (still
    // pointing at the same inherited static handlers via `this.<method>`) guarantees they resolve even if
    // anything about the inheritance chain changes upstream; found live 2026-09-16: attribute-die clicks
    // (chValue, main.hbs) silently did nothing before this.
    ownerRollActions: {
      chValue: this._chValue,
      chStatus: this._chStatus,
      chRegenerate: this._chRegenerate,
      chWeaponless: this._chWeaponless,
      chFallingDamage: this._chFallingDamage,
      chRollCombat: this._chRollCombat,
      rollAggregatedProbe: { handler: this._handleAggregatedProbe, buttons: [0, 2] },
      rollDisease: this._rollDisease,
    },
    ownerActions: {
      schipUpdate: this._schipUdate,
      deleteItem: this._deleteItemAction,
      advanceWrapper: this._advanceWrapper,
      statusAdd: { handler: this._statusAdd, buttons: [0, 2] },
      disableRegeneration: this._disableRegeneration,
      conditionValue: { handler: this._conditionValue, buttons: [0, 2] },
      itemToggle: this._itemToggle,
      quantityClick: { handler: this._quantityClick, buttons: [0, 2] },
      onUseItem: { handler: this._onMacroUseItem, buttons: [0, 2] },
      chargeSpell: { handler: this._chargeSpell, buttons: [0, 2] },
      loadWeapon: { handler: this._loadWeapon, buttons: [0, 2] },
      selectAmmo: this._selectAmmo,
      itemSwapMag: this._itemSwapMag,
      swapWeaponHand: this._swapWeaponHand,
      swapWeaponHandSlot: this._swapWeaponHandSlot,
      unequippedWeaponMenu: { handler: this._unequippedWeaponMenu, buttons: [0] },
      traditionPayCost: { handler: this._payAeSpecialAbilityCost, buttons: [0, 2] },
      traditionItemDelete: this._deleteTraditionItem,
      selectTraditionItem: this._selectTraditionItem,
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
  _subtabs = { skills: 'body', combat: 'combat', magic: 'spells', religion: 'spells', notes: 'biography' };
  _openBagId = null;
  _search = { talent: '', gear: '' };
  _favoritePending = false;
  // Wohlgefällige Talente (Religion-Tab) starten eingeklappt im Spielmodus, Klick blendet den vollen Text ein —
  // Nutzerentscheidung 2026-09-19 nach Click-Dummy-Vergleich dreier Varianten ("B · Einklappbar" gewählt, nahm
  // vorher als volle Textzeile "recht viel Platz weg"). Reine Anzeige, kein Dokument-Feld — wie _currentTab/
  // _subtabs auf der Instanz gehalten und über _applyCurrentTab() ins DOM übertragen, statt für einen simplen
  // Auf/Zu-Klick das ganze Sheet neu zu rendern.
  _happyTalentsExpanded = false;

  _toggleDisabled(disabled) {
    super._toggleDisabled(disabled);
    // Observers may navigate and inspect bags even when Foundry disables document edits.
    this.element?.querySelectorAll('[data-action^="dsa5hSet"], [data-action="dsa5hTheme"], [data-action="dsa5hBag"], [data-action="dsa5hCloseBag"]')
      .forEach(button => { button.disabled = false; });
  }

  // Our single "sheet" PARTS entry renders every tab's markup at once, all but the active one marked `hidden` —
  // Foundry's own scrollable-part restore (see handlebars-application.mjs _syncPartState) runs right after
  // _replaceHTML, before _onRender()/_applyCurrentTab() below removes `hidden` from the active tab. With every
  // panel still hidden, .dsa5h-content has ~0 scrollHeight, so the restored scrollTop gets clamped straight back
  // to 0 (Nutzer-Feedback 2026-09-17: scrollbar jumps to top on every favorite toggle/item create). DSA5's own
  // ActorSheetdsa5Character has the same class of bug for a different reason (actor-sheet.js _replaceHTML) —
  // same fix shape: capture scroll before the render replaces the DOM, re-apply once the right tab is visible.
  async render(options = {}, _options = {}) {
    this._pendingScrollTop = this.element?.querySelector('.dsa5h-content')?.scrollTop;
    return await super.render(options, _options);
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
    // DSA5StatusEffects.prepareActiveEffects() hands us CONFIG.statusEffects in its raw config order (roughly by
    // severity/category) — the add-condition picker reads better alphabetically (Nutzer-Feedback 2026-09-19).
    if (Array.isArray(context.manualConditions)) {
      context.manualConditions = [...context.manualConditions].sort((a, b) => localize(a.name).localeCompare(localize(b.name), game.i18n.lang));
    }
    const favorites = Object.fromEntries((this.actor.getFlag(MODULE_ID, 'favorites') ?? []).filter(id => this.actor.items.has(id)).map(id => [id, true]));
    const skillGroups = Object.entries({ ...prepare.allSkillsLeft, ...prepare.allSkillsRight }).map(([id, items]) => ({ id, items }));
    const specs = {};
    for (const kind of ['general', 'combat', 'magical', 'clerical']) {
      specs[kind] = Array.from(prepare.sortedSpecs?.[kind] ?? []).filter(cat => kind !== 'general' || cat !== 'language')
        .map(cat => ({ cat, items: prepare.specAbs?.[cat] ?? [] })).filter(group => group.items.length);
    }
    // Own labels ("Nahkampfwaffen"/"Fernkampfwaffen") instead of the system's own 'closeCombatAttacks'/'rangeweapons'
    // strings ("Nahkampfangriffe") — Nutzer-Feedback 2026-09-19: the panel holds worn weapons, not "attacks", and
    // the system's own DE/EN wording can't be changed here without touching the vendored dsa5 lang files.
    const weaponGroups = [
      { label: 'DSA5HELPERS.MeleeWeapons', type: 'meleeweapon', items: [...(prepare.wornMeleeWeapons ?? []), ...(prepare.traits?.meleeAttack ?? [])] },
      { label: 'DSA5HELPERS.RangedWeapons', type: 'rangeweapon', ranged: true, items: [...(prepare.wornRangedWeapons ?? []), ...(prepare.traits?.rangeAttack ?? [])] },
    ];
    // weapontype 0 == melee (also used further down to decide whether a combat skill shows a parry value) —
    // matches the click-dummy's Nahkampftechniken/Fernkampftechniken split (COMBAT_SKILLS filtered by pa !== "—").
    const combatSkillGroups = [
      { label: 'DSA5HELPERS.MeleeSkills', items: (prepare.combatskills ?? []).filter(item => Number(item.system.weapontype.value) === 0) },
      { label: 'DSA5HELPERS.RangeSkills', ranged: true, items: (prepare.combatskills ?? []).filter(item => Number(item.system.weapontype.value) !== 0) },
    ];
    const favoriteGroups = [
      { label: 'skills', items: skillGroups.flatMap(group => group.items) },
      { label: 'DSA5HELPERS.Weapons', weapon: true, items: weaponGroups.flatMap(group => group.items) },
      { label: 'spells', items: [...(magic.spellList ?? []), ...(magic.ritualList ?? []), ...(magic.spellActions ?? []).flatMap(group => group.items), ...(magic.ritualActions ?? []).flatMap(group => group.items)] },
      { label: 'liturgies', items: [...(magic.liturgy ?? []), ...(magic.ceremony ?? [])] },
    ].map(group => ({ ...group, items: group.items.filter(item => favorites[item._id]) })).filter(group => group.items.length);
    // Hintergrundgeschichte/Notizen/Private Notizen/GM-Notizen als Unter-Tabs statt vier gestapelter Volltext-Panels
    // (Nutzer-Feedback 2026-09-19) — Sichtbarkeit der letzten beiden Reiter folgt denselben Bedingungen wie bisher
    // die Panels selbst ({{#if owner}}/{{#if isGM}} in notes.hbs).
    const noteSubtabs = [
      { id: 'biography', label: localize('biography') },
      { id: 'notes', label: localize('Notes') },
    ];
    if (context.owner) noteSubtabs.push({ id: 'ownernotes', label: localize('ownerNotes') });
    if (context.isGM) noteSubtabs.push({ id: 'gmnotes', label: localize('DSA5HELPERS.GMNotes') });
    const subnav = [
      // Own SKILL.* strings ("Körpertalente" etc.) end in "-talente" — dropped here to keep the sub-tabs compact,
      // matching the click-dummy's buildSkillSubTabs() (the full name still shows in the panel title below).
      { tab: 'skills', items: [...skillGroups.map(group => ({ id: group.id, label: localize('SKILL.' + group.id).replace(/s?talente$/i, '') })), { id: 'aggregated', label: localize('aggregatedTests') }] },
      { tab: 'combat', items: [{ id: 'combat', label: localize('Combat') }, { id: 'skills', label: localize('TYPES.Item.combatskill') }] },
      ...['magic', 'religion'].map(tab => ({ tab, items: [{ id: 'spells', label: localize(tab === 'magic' ? 'spells' : 'liturgies') }, { id: 'equipment', label: localize('DSA5HELPERS.Tabs.inventory') }] })),
      { tab: 'notes', items: noteSubtabs },
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
      // Cover tab's compact conditions panel (click-dummy buildConditionsPanel(4)): caps the list so the sidebar
      // never needs to scroll, with a jump button to the full Status tab for the rest.
      coverConditions: (context.conditions ?? []).slice(0, 4),
      coverConditionsMore: Math.max(0, (context.conditions ?? []).length - 4),
      happyTalentsExpanded: this._happyTalentsExpanded,
      happyTalentsCount: String(this.actor.system.happyTalents?.value ?? '').split(',').map(s => s.trim()).filter(Boolean).length,
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
    if (this._pendingScrollTop) this.element.querySelector('.dsa5h-content')?.scrollTo({ top: this._pendingScrollTop });
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
    // Switching to Talente should let the user start typing a search immediately, no extra click needed.
    if (this._currentTab === 'skills') this.element.querySelector('.talentSearch')?.focus();
  }

  static _setSubTab(_event, target) {
    const tab = target.dataset.parentTab;
    const id = target.dataset.subtab;
    if (!Object.hasOwn(this._subtabs, tab)) return;
    this._subtabs[tab] = id;
    this._applyCurrentTab();
  }

  static _toggleHappyTalents() {
    this._happyTalentsExpanded = !this._happyTalentsExpanded;
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
    // Wohlgefällige Talente (Religion-Tab): im Bearbeiten-Modus immer aufgeklappt (sonst kein Zugriff aufs Feld
    // ohne Extra-Klick), im Spielmodus per _happyTalentsExpanded gesteuert.
    const happyExpanded = root.dataset.mode === 'edit' || this._happyTalentsExpanded;
    const happyToggle = root.querySelector('[data-happy-talents-toggle]');
    if (happyToggle) {
      happyToggle.hidden = root.dataset.mode === 'edit';
      happyToggle.setAttribute('aria-expanded', String(happyExpanded));
      const caret = happyToggle.querySelector('[data-happy-talents-caret]');
      if (caret) caret.textContent = happyExpanded ? '▾' : '▸';
    }
    const happyField = root.querySelector('[data-happy-talents-field]');
    if (happyField) happyField.hidden = !happyExpanded;
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
