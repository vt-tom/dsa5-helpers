/** Alternative presentation; all rule actions and actor updates are inherited from DSA5. */
const BaseCharacterSheet = globalThis.dsa5?.sheets?.ActorSheetdsa5Character;
const MODULE_ID = 'dsa5-helpers';
import { getPlannerTab, PLANNER_TAB_ID } from '../compat/steigerungsplaner.js';

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
      dsa5hToggleCompanionTab: this._toggleCompanionTab,
      dsa5hFavorite: this._toggleFavorite,
      dsa5hToggleHappyTalents: this._toggleHappyTalents,
      dsa5hOnlyLearned: this._toggleOnlyLearned,
      dsa5hClearTalentSearch: this._clearTalentSearch,
      postItem: this._postItem,
      dsa5hOpenCast: this._openCastDialog,
      dsa5hCloseCast: this._closeCastDialog,
      dsa5hJumpCombatSkill: this._jumpToCombatSkill,
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
      startCharacterBuilder: this._startCharacterBuilder,
      deleteItem: this._deleteItemAction,
      // advanceWrapper bewusst NICHT hier: ActorSheetDsa5 deklariert ihn selbst und ApplicationV2 führt die
      // DEFAULT_OPTIONS der Klassenkette zusammen. Ein eigener Eintrag hielte die Funktion beim Laden fest, also vor
      // dem Umhüllen durch den Steigerungsplaner (ready) — Shift-Klick hätte dann sofort gesteigert und AP
      // abgezogen statt zu planen (Issue #17).
      statusAdd: { handler: this._statusAdd, buttons: [0, 2] },
      disableRegeneration: this._disableRegeneration,
      conditionValue: { handler: this._conditionValue, buttons: [0, 2] },
      dsa5hConditionDown: this._dsa5hConditionDown,
      itemToggle: this._itemToggle,
      dsa5hEquip: { handler: this._dsa5hEquip, buttons: [0, 2] },
      quantityClick: { handler: this._quantityClick, buttons: [0, 2] },
      onUseItem: { handler: this._onMacroUseItem, buttons: [0, 2] },
      chargeSpell: { handler: this._chargeSpell, buttons: [0, 2] },
      loadWeapon: { handler: this._loadWeapon, buttons: [0, 2] },
      dsa5hReloadReset: this._dsa5hReloadReset,
      selectAmmo: this._selectAmmo,
      itemSwapMag: this._itemSwapMag,
      swapWeaponHand: this._swapWeaponHand,
      swapWeaponHandSlot: this._swapWeaponHandSlot,
      unequippedWeaponMenu: { handler: this._unequippedWeaponMenu, buttons: [0] },
      traditionPayCost: { handler: this._payAeSpecialAbilityCost, buttons: [0, 2] },
      traditionItemDelete: this._deleteTraditionItem,
      selectTraditionItem: this._selectTraditionItem,
      dsa5hBodyFigure: this._setBodyFigure,
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
      // Aufgeschlagenes Buch statt des Auges, das dem der Eigenschaften zum Verwechseln ähnelte (Issue #20, Variante C).
      { id: "cover", label: "Titelblatt", icon: "systems/dsa5/icons/categories/Spellextension.webp", hint: "Übersicht · Favoriten" },
      { id: "main", label: "Eigenschaften", icon: "systems/dsa5/icons/categories/DSA-Auge.webp", hint: "Grundwerte · Erfahrung" },
      { id: "skills", label: "Talente", icon: "systems/dsa5/icons/categories/Skill.webp", hint: "" },
      { id: "combat", label: "Kampf", icon: "systems/dsa5/icons/categories/ability_combat.webp", hint: "" },
      { id: "magic", label: "Magie", icon: "systems/dsa5/icons/categories/Spell.webp", hint: "" },
      { id: "religion", label: "Religion", icon: "systems/dsa5/icons/categories/Liturgy.webp", hint: "" },
      { id: "inventory", label: "Ausrüstung", icon: "systems/dsa5/icons/categories/Equipment.webp", hint: "" },
      { id: "status", label: "Status", icon: "systems/dsa5/icons/categories/ability_ceremonial.webp", hint: "Zustände · Effekte · Krankheiten" },
      { id: "notes", label: "Notizen", icon: "systems/dsa5/icons/categories/Ability_Language.webp", hint: "Aussehen · Hintergrund · Verbindungen" },
      { id: "companion", label: "Gefährten", icon: "systems/dsa5/icons/categories/ability_animal.webp", hint: "Reittier · Vertraute · Begleiter" },
      // Nur mit aktivem „Lyynix: DSA5 - Steigerungsplaner“ und nur für Owner, wie dessen eigener Reiter (Issue #17).
      { id: PLANNER_TAB_ID, label: "Steigerungsplaner", icon: "systems/dsa5/icons/categories/Career.webp", hint: "" },
    ];
  _currentTab = 'cover';
  _subtabs = { skills: 'body', combat: 'combat', magic: 'spells', religion: 'spells', notes: 'biography' };
  _search = { talent: '', gear: '', combatskill: '' };
  _favoritePending = false;
  // Wohlgefällige Talente (Religion-Tab) starten eingeklappt im Spielmodus, Klick blendet den vollen Text ein —
  // Nutzerentscheidung 2026-09-19 nach Click-Dummy-Vergleich dreier Varianten ("B · Einklappbar" gewählt, nahm
  // vorher als volle Textzeile "recht viel Platz weg"). Reine Anzeige, kein Dokument-Feld — wie _currentTab/
  // _subtabs auf der Instanz gehalten und über _applyCurrentTab() ins DOM übertragen, statt für einen simplen
  // Auf/Zu-Klick das ganze Sheet neu zu rendern.
  _happyTalentsExpanded = false;
  // "Nur gesteigerte" (Talente): blendet FW-0-Talente aus wie der Filter im System (actor-talents.hbs .notLearned),
  // aber über row.hidden statt der System-Klasse — .notLearned ist im System-CSS global display:none.
  _onlyLearned = false;

  _toggleDisabled(disabled) {
    super._toggleDisabled(disabled);
    // Observers may still navigate tabs even when Foundry disables document edits.
    this.element?.querySelectorAll('[data-action^="dsa5hSet"], [data-action="dsa5hTheme"], [data-action="dsa5hOnlyLearned"], [data-action="dsa5hClearTalentSearch"], [data-action="dsa5hJumpCombatSkill"]')
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
    this._pendingFocus = this._focusKey();
    return await super.render(options, _options);
  }

  // Jede Wertänderung rendert den ganzen Bogen neu — ohne das hier landet der Tastaturfokus danach am
  // Fensteranfang, mehrfaches +/− per Tastatur wäre unmöglich (UI/UX-Review 2026-09-25, Punkt 4). Gemerkt wird
  // die Aktion plus die Daten, die das Element eindeutig machen (Item, Zustand, Eigenschaft, Wert …), nach dem
  // Rendern wird das passende neue Element wieder fokussiert.
  static RIGHT_CLICK_ACTIONS = ['loadWeapon', 'quantityClick', 'chargeSpell', 'conditionValue', 'statusAdd', 'rollAggregatedProbe', 'traditionPayCost', 'onUseItem', 'dsa5hEquip']
    .map(action => `[data-action="${action}"]`).join(', ');
  // Alles, was im Kopf selbst bedienbar ist, startet kein Fenster-Ziehen (siehe pointerdown in _onRender).
  static DRAG_EXCLUDE = 'button, a, input:not([disabled]), select, textarea, label, details, [data-action], [contenteditable], [draggable="true"]';
  static FOCUS_KEYS = ['action', 'val', 'char', 'mode', 'hand', 'fct', 'attr', 'tab', 'subtab', 'parentTab', 'which'];

  _focusKey() {
    const active = document.activeElement;
    if (!active?.dataset?.action || !this.element?.contains(active)) return null;
    const data = Object.fromEntries(this.constructor.FOCUS_KEYS.map(key => [key, active.dataset[key]]));
    data.itemId = active.closest('[data-item-id]')?.dataset.itemId;
    data.descriptor = active.closest('[data-descriptor]')?.dataset.descriptor;
    data.inSidebar = !!active.closest('[data-cover-sidebar]');
    return data;
  }

  _restoreFocus(key) {
    if (!key) return;
    const match = [...this.element.querySelectorAll(`[data-action="${CSS.escape(key.action)}"]`)].find(el =>
      this.constructor.FOCUS_KEYS.every(k => el.dataset[k] === key[k])
      && el.closest('[data-item-id]')?.dataset.itemId === key.itemId
      && el.closest('[data-descriptor]')?.dataset.descriptor === key.descriptor
      && !!el.closest('[data-cover-sidebar]') === key.inSidebar);
    match?.focus({ preventScroll: true });
    this._flash(match);
  }

  // Kurzes Aufleuchten der geänderten Zeile nach einem Re-Render (UI/UX-Review 2026-09-25, Punkt 9): für Knöpfe
  // über _restoreFocus(), für Eingabefelder (z. B. LeP im Kopf) über den gemerkten Feldnamen aus dem change-Event.
  _flash(node) {
    const target = node?.closest('.row, .dsa5h-bar, .dsa5h-fate-points, .dsa5h-cover-condition');
    if (!target) return;
    target.classList.remove('dsa5h-just-changed');
    void target.offsetWidth;
    target.classList.add('dsa5h-just-changed');
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
    const planner = !limited && this.actor.isOwner ? getPlannerTab() : null;
    const tabs = this.constructor.HELPER_TABS
      .filter(tab => (tab.id !== 'magic' || magic.hasSpells) && (tab.id !== 'religion' || magic.hasPrayers) && (tab.id !== PLANNER_TAB_ID || planner)
        && (tab.id !== 'companion' || !this.actor.getFlag?.(MODULE_ID, 'hideCompanionTab')))
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
    // Kampftechnik je Waffe (parts/combatskill-link.hbs): wie im System per Name gesucht (actor-dsa5.js
    // combatskills.find(s => s.name === item.system.combatskill.value)), mit Kampftechnikwert für die Anzeige.
    const combatSkillIndex = Object.fromEntries((prepare.combatskills ?? []).map(item => [item.name, { id: item._id, name: item.name, value: item.system.talentValue?.value }]));
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
      // Persönliche Daten als eigener Unterreiter statt dauerhafter Spalte links (Issue #26).
      { id: 'details', label: localize('personalDetails') },
      { id: 'notes', label: localize('Notes') },
    ];
    if (context.owner) noteSubtabs.push({ id: 'ownernotes', label: localize('ownerNotes') });
    if (context.isGM) noteSubtabs.push({ id: 'gmnotes', label: localize('DSA5HELPERS.GMNotes') });
    const subnav = [
      // Own SKILL.* strings ("Körpertalente" etc.) end in "-talente" — dropped here to keep the sub-tabs compact,
      // matching the click-dummy's buildSkillSubTabs() (the full name still shows in the panel title below).
      { tab: 'skills', items: [...skillGroups.map(group => ({ id: group.id, label: localize('SKILL.' + group.id).replace(/s?talente$/i, '') })), { id: 'aggregated', label: localize('aggregatedTests') }] },
      // Erster Kampf-Unterreiter heißt „Übersicht“ statt nochmals „Kampf“ neben dem Reitertitel (Paket F).
      // „Körper“ steht vorerst neben der Übersicht, damit Testende beide vergleichen können (Rückmeldung 2026-09-30).
      { tab: 'combat', items: [{ id: 'combat', label: localize('DSA5HELPERS.Overview') }, { id: 'body', label: localize('DSA5HELPERS.Body') }, { id: 'skills', label: localize('TYPES.Item.combatskill') }] },
      ...['magic', 'religion'].map(tab => ({ tab, items: [{ id: 'spells', label: localize(tab === 'magic' ? 'spells' : 'liturgies') }, { id: 'equipment', label: localize('DSA5HELPERS.Tabs.inventory') }] })),
      { tab: 'notes', items: noteSubtabs },
    ];
    const status = this.actor.system.status;
    context.dsa5h = {
      limited, tabs, subnav, skillGroups, favorites, favoriteGroups, weaponGroups, combatSkillGroups, combatSkillIndex, specs,
      currentTab: this._currentTab,
      currentTabLabel: tabs.find(tab => tab.id === this._currentTab)?.label,
      editMode: this.isEditable && !prepare.sheetLocked,
      specGeneral: { groups: specs.general, showSubheads: specs.general.length > 1 },
      // Füllstand wie im Inhalt-Reiter des DSA5-Item-Sheets (item-sheet.js _prepareContext: weightSum = Summe
      // Gewicht × Anzahl der direkten Inhalte). system.bagweight taugt dafür nicht: kein Schema-Feld, geht in der
      // toObject(false)-Kopie des Systembogens verloren (Nutzer-Feedback 2026-09-25: Werte passten nicht zum Inhalt).
      // item.children setzt der Systembogen selbst (actor-dsa5.js _setBagContent).
      bags: (prepare.inventory?.bags?.items ?? []).map(item => {
        const sum = (item.children ?? []).reduce((total, child) => total + (Number(child.system?.weight?.value) || 0) * (Number(child.system?.quantity?.value) || 0), 0);
        const weight = parseFloat(sum.toFixed(3));
        const capacity = Number(item.system.capacity) || 0;
        return Object.assign(item, { dsa5hFill: { weight, capacity, over: capacity > 0 && weight > capacity } });
      }),
      traditionItems: this._traditionItems(),
      tradition: this._traditionNames(),
      // Sammelproben (Nutzer-Notiz 2026-09-30): je Talent Probe + FW wie in der Talentliste. Das Talent wird wie im
      // System gesucht (item-dsa5.js rollAggregatedProbe: Name + Typ skill); gewürfelt wird weiter über rollAggregatedProbe.
      aggregated: (prepare.aggregatedtests ?? []).map(item => ({
        item,
        talents: ['', '2', '3'].map(which => ({ which, name: item.system?.talent?.['value' + which] })).filter(t => t.name)
          .map(t => ({ ...t, skill: this.actor.items.find(entry => entry.type === 'skill' && entry.name === t.name) })),
      })),
      inventory: Object.entries(prepare.inventory ?? {}).filter(([id, section]) => id !== 'bags' && section.show).map(([id, section]) => ({ id, ...section })),
      // initiative.value has no .max and carries a fractional tie-breaker for the combat tracker's sort order
      // (baseactor.js calcInitiative(): Math.round(value) + 0.01*value) — floored here exactly like every real
      // system template does ({{floor document.system.status.initiative.value}} in actor-main.hbs etc.).
      combatValues: ['dodge', 'initiative'].map(id => {
        const raw = status[id]?.max ?? status[id]?.value;
        return { label: id, value: raw === undefined ? '–' : Math.floor(raw) };
      }),
      // Grundwerte (Eigenschaften-Reiter): Initiative abgerundet wie oben und im Systembogen.
      initiative: Math.floor(status.initiative?.value ?? 0),
      regenerations: ['wounds', 'astralenergy', 'karmaenergy'].filter(id => this.actor.system.repeatingEffects?.startOfRound?.[id]?.length).map(id => ({ id, active: !this.actor.system.repeatingEffects.disabled?.[id] })),
      // Cover tab's compact conditions panel (click-dummy buildConditionsPanel(4)): caps the list so the sidebar
      // never needs to scroll, with a jump button to the full Status tab for the rest.
      coverConditions: (context.conditions ?? []).slice(0, 4),
      coverConditionsMore: Math.max(0, (context.conditions ?? []).length - 4),
      happyTalentsExpanded: this._happyTalentsExpanded,
      body: limited ? null : this._bodyContext(prepare),
      happyTalentsCount: String(this.actor.system.happyTalents?.value ?? '').split(',').map(s => s.trim()).filter(Boolean).length,
    };
    // The original sheet prepares this only for its separate companion part.
    if (!limited) await this.prepareCompanionTab(context);
    // Daten des Planer-Reiters (plannerSections/-TotalCost/-AvailableXP) direkt vom Planer; `tabs` braucht sein
    // Template für die Klasse `active` (parts/planner.hbs).
    if (planner) {
      await planner.prepareContext(this, context);
      context.dsa5h.planner = { tabs: { [PLANNER_TAB_ID]: { cssClass: 'active', group: 'sheet' } } };
    }
    return context;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    this.element.dataset.mode = context.dsa5h.editMode ? 'edit' : 'play';
    this.element.dataset.theme = game.settings.get(MODULE_ID, 'theme');
    this._applyCurrentTab();
    // Listener des Planer-Reiters (Anwenden/Verwerfen) — jedes Rendern baut den Reiter neu, also jedes Mal.
    const plannerElement = context.dsa5h.planner && this.element.querySelector('.steigerungsplaner-tab');
    if (plannerElement) getPlannerTab()?.attachListeners(this, plannerElement);
    if (this._pendingScrollTop) this.element.querySelector('.dsa5h-content')?.scrollTo({ top: this._pendingScrollTop });
    this._restoreFocus(this._pendingFocus);
    this._pendingFocus = null;
    // Einmal je Fenster-Element, nicht je Instanz: Foundry baut nach close() beim nächsten Öffnen ein neues Element
    // (isFirstRender → _renderFrame), die Bogen-Instanz bleibt aber dieselbe. Mit einem reinen Instanz-Flag fehlten
    // danach alle Listener hier bis F5 — u. a. war der Bogen nicht mehr am Kopf verschiebbar (Fehler 2026-09-30).
    if (this._listenerElement !== this.element) {
      this._listenerElement = this.element;
      this.element.addEventListener('change', event => { if (event.target?.name) this._flashName = event.target.name; });
      // Heldenname einpassen (Issue #25): beim Tippen, bei geänderter Fensterbreite und sobald die Schrift geladen ist.
      this.element.addEventListener('input', event => { if (event.target?.closest?.('.dsa5h-name')) this._fitName(); });
      let observedWidth = 0;
      new ResizeObserver(([entry]) => {
        if (entry.contentRect.width === observedWidth) return;
        observedWidth = entry.contentRect.width;
        this._fitName();
      }).observe(this.element);
      document.fonts?.ready.then(() => this._fitName());
      // Knöpfe mit eigener Rechtsklick-Bedeutung (Nachladen zurücksetzen, Zustand senken, Menge verringern …):
      // das contextmenu-Ereignis würde sonst bis zur Zeile hochlaufen und dort zusätzlich das Kontextmenü des
      // Systems öffnen (Nutzer-Feedback 2026-09-28). Die Aktion selbst kommt über auxclick und bleibt unberührt.
      // Capture-Phase, weil Foundrys ContextMenu am selben Element (this.element) in der Bubble-Phase lauscht.
      this.element.addEventListener('contextmenu', event => {
        if (!event.target?.closest?.(this.constructor.RIGHT_CLICK_ACTIONS)) return;
        event.preventDefault();
        event.stopPropagation();
      }, { capture: true });
      // Seit die Titelleiste nur noch eine kleine Knopfgruppe ist, war das Fenster nur dort verschiebbar (Nutzer-
      // Feedback 2026-09-30). Ein Druck auf eine freie Stelle im dunklen Kopf wird deshalb an Foundrys eigene
      // Zieh-Logik der .window-header weitergereicht (ApplicationV2 lauscht dort auf pointerdown und verfolgt
      // pointermove danach am ganzen Fenster). Nur der Kopf, nicht Seitenleiste/Reiterleiste (Rückmeldung
      // 2026-09-30); Hinweis für Spielende ist der Greif-Cursor (CSS .dsa5h-head).
      // Seit Issue #22 außerdem das obere Rahmenband (24px, border des Fensters — dort ist this.element selbst das Ziel).
      this.element.addEventListener('pointerdown', event => {
        if (event.button !== 0 || !this.window?.header || !this._isDragHandle(event)) return;
        this.window.header.dispatchEvent(new PointerEvent('pointerdown', {
          bubbles: true, button: 0, buttons: event.buttons, clientX: event.clientX, clientY: event.clientY,
          pointerId: event.pointerId, pointerType: event.pointerType, isPrimary: event.isPrimary
        }));
      });
      // Doppelklick auf dieselben freien Kopfstellen minimiert wie im Systembogen — Foundrys eigener Handler an der
      // .window-header (minimize/maximize, beachtet options.window.minimizable). Aufklappen dann über die Titelleiste.
      this.element.addEventListener('dblclick', event => {
        if (!this.window?.header || !this._isDragHandle(event)) return;
        this.window.header.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true, clientX: event.clientX, clientY: event.clientY }));
      });
      // Hand-Auswahl im Reiter „Körper“: nur die Hand-Logik des Systems (actor-dsa5.js equipWeaponToHand) —
      // 1H-Waffe in die gewählte Hand (die dortige Waffe wird abgelegt), beidhändige Waffe belegt beide Hände.
      this.element.addEventListener('change', event => {
        const select = event.target?.closest?.('select[data-dsa5h-hand]');
        if (!select) return;
        event.stopPropagation();
        const hand = select.dataset.dsa5hHand;
        if (select.value) this.actor.equipWeaponToHand(select.value, { hand, equip: true });
        else if (select.dataset.current) this.actor.equipWeaponToHand(select.dataset.current, { equip: false });
      }, { capture: true });
      // Zauber-/Liturgie-Dialog im Reiter „Körper“: showModal() legt ihn in den Top-Layer über alles, auch über Foundrys
      // Probenfenster (Rückmeldung 2026-09-30: Probe öffnete sich dahinter). Jede Aktion darin (Probe, Item öffnen …)
      // schließt ihn deshalb zuerst; die Aktion selbst läuft danach normal über Foundrys Handler in der Bubble-Phase.
      // Offen halten ginge ohnehin nicht: AsP/KaP-Verbrauch rendert den ganzen Bogen neu.
      this.element.addEventListener('click', event => {
        const action = event.target?.closest?.('[data-action]');
        const dialog = action?.closest('dialog.dsa5h-cast-dialog[open]');
        if (dialog && action.dataset.action !== 'dsa5hCloseCast') dialog.close();
      }, { capture: true });
      // scroll bubbelt nicht — Capture-Phase am Fenster, weil .dsa5h-content bei jedem Render neu entsteht.
      this.element.addEventListener('scroll', event => {
        if (event.target?.classList?.contains('dsa5h-content')) this._onContentScroll();
      }, { capture: true, passive: true });
      this.element.addEventListener('scrollend', event => {
        if (event.target?.classList?.contains('dsa5h-content')) this._skillJumping = false;
      }, { capture: true, passive: true });
      // Munitionswahl (<details class="dsa5h-ammo-pick">) schließt sich bei einem Klick daneben wie ein Dropdown.
      this.element.addEventListener('click', event => {
        this.element.querySelectorAll('details.dsa5h-ammo-pick[open]').forEach(details => { if (!details.contains(event.target)) details.open = false; });
      });
    }
    if (this._flashName) {
      this._flash(this.element.querySelector(`[name="${CSS.escape(this._flashName)}"]`));
      this._flashName = null;
    }
    if (context.dsa5h.limited) return;
    const companion = this.element.querySelector('[data-tab-panel="companion"]');
    if (companion) {
      this.attachCompanionTabListeners(companion);
      this._labelCompanionButtons(companion);
    }
    const searchHandlers = { talent: () => this._applyCurrentTab(), gear: () => this._applyGearSearch(), combatskill: () => this._applyCombatSkillSearch() };
    for (const [kind, selector] of Object.entries({ talent: '.talentSearch', gear: '.gearSearch', combatskill: '.combatSkillSearch' })) {
      const input = this.element.querySelector(selector);
      if (!input) continue;
      input.value = this._search[kind];
      input.addEventListener('input', () => { this._search[kind] = input.value; searchHandlers[kind](); });
    }
    this._applyGearSearch();
    this._applyCombatSkillSearch();
  }

  // Gefährten-Reiter nutzt die Systemvorlage (actor-companion.hbs) unverändert; deren reine Symbolknöpfe bekommen
  // hier eine Kurzbeschriftung daneben (Paket G, 2026-09-28) — statt die ganze Vorlage zu kopieren.
  static COMPANION_BUTTON_LABELS = {
    openSkillSelection: 'DSA5HELPERS.CompanionShort.skills',
    toggleHotbarControl: 'DSA5HELPERS.CompanionShort.hotbar',
    trainCompanion: 'DSA5HELPERS.CompanionShort.train',
    toggleMount: 'DSA5HELPERS.CompanionShort.mount',
  };

  _labelCompanionButtons(root) {
    for (const [action, key] of Object.entries(this.constructor.COMPANION_BUTTON_LABELS)) {
      root.querySelectorAll(`button[data-action="${action}"]`).forEach(button => {
        if (button.querySelector('.dsa5h-btn-short')) return;
        const label = document.createElement('span');
        label.className = 'dsa5h-btn-short';
        label.textContent = game.i18n.localize(key);
        button.append(label);
        button.classList.add('dsa5h-labeled');
      });
    }
    // Knopfspalte aus der Loyalitätszeile in den Kartenkopf (vor das ⋮) — wie im Clickdummy (Knöpfe in der
    // Titelzeile). Neben Loyalität + 7er-Hotbar lief sie rechts aus der Karte (Nutzer-Feedback 2026-09-30). Die
    // System-Handler suchen nur .companion-header-ui (die ganze Karte), das Verschieben innerhalb bleibt also folgenlos.
    root.querySelectorAll('.companion-header-ui').forEach(card => {
      // Lange Namen werden per CSS gekürzt — der volle Name steht dann im Tooltip.
      const name = card.querySelector('.member-card h3 > a');
      if (name && !name.dataset.tooltip) name.dataset.tooltip = name.textContent.trim();
      const actions = card.querySelector('.companion-loyalty-row > .flexcol');
      const slot = card.querySelector('.member-card > .flex0');
      if (!actions || !slot) return;
      actions.classList.add('dsa5h-companion-actions');
      slot.prepend(actions);
    });
  }

  // Reiter „Körper“ (Kampf-Unterreiter, Issue #6): Rüstung links, Hände rechts, Figur dahinter. Haupt-/Nebenhand
  // kommen aus den vom System vorbereiteten getragenen Waffen (system.worn.offHand); beidhändig wie im System
  // (weapon_hands.js isTwoHandedWeapon: Nahkampf über RuleChaos, Fernkampf über worn.requiresBothHands). Führt die
  // Haupthand eine beidhändige Waffe, entfällt die Nebenhand (Rückmeldung 2026-09-30).
  _bodyContext(prepare) {
    const RuleChaos = globalThis.dsa5?.apps?.RuleChaos;
    const twoHanded = item => item.type === 'meleeweapon'
      ? (RuleChaos ? RuleChaos.isWieldedTwohanded(item) : !!item.wieldedTwoHand)
      : item.system?.worn?.requiresBothHands !== false;
    const worn = [...(prepare.wornMeleeWeapons ?? []), ...(prepare.wornRangedWeapons ?? [])];
    const main = worn.find(w => !w.system?.worn?.offHand) ?? null;
    const mainTwoHanded = !!main && twoHanded(this.actor.items.get(main._id) ?? main);
    const off = mainTwoHanded ? null : worn.find(w => w !== main && w.system?.worn?.offHand) ?? null;
    const weapons = [...(this.actor.items?.values?.() ?? [])].filter(item => ['meleeweapon', 'rangeweapon'].includes(item.type))
      .sort((a, b) => a.name.localeCompare(b.name, game.i18n.lang));
    const slot = (hand, item) => ({
      hand,
      label: hand === 'main' ? 'mainHand' : 'offHand',
      item,
      ranged: item?.type === 'rangeweapon',
      options: weapons.filter(w => hand === 'main' || !twoHanded(w)).map(w => ({ id: w.id, name: w.name, twoHanded: twoHanded(w), selected: w.id === item?._id })),
    });
    const armor = prepare.wornArmor ?? [];
    const species = String(this.actor.system?.details?.species?.value ?? '');
    const placeholder = /elf/i.test(species) ? 'Elf' : /zwerg|dwarf/i.test(species) ? 'Zwerg' : 'Mensch';
    const portrait = this.actor.getFlag?.(MODULE_ID, 'bodyFigure') === 'portrait';
    return {
      armor,
      // Ab drei Rüstungsteilen Tabelle statt Kacheln (Rückmeldung 2026-09-30).
      armorTable: armor.length >= 3,
      encumbrance: armor.reduce((sum, item) => sum + (Number(item.system?.calculatedEncumbrance) || 0), 0),
      hands: mainTwoHanded ? [slot('main', main)] : [slot('main', main), slot('offhand', off)],
      single: mainTwoHanded,
      // Freie Nebenhand kompakt unter der Haupthand statt als volle Spalte (Rückmeldung 2026-09-30).
      offFree: !mainTwoHanded && !off,
      portrait,
      figure: portrait ? this.actor.img : `systems/dsa5/icons/species/${placeholder}.webp`,
      initiative: Math.floor(this.actor.system?.status?.initiative?.value ?? 0),
    };
  }

  // Freie Stelle im dunklen Kopf oder oberes Rahmenband: beide verschieben das Fenster / minimieren per Doppelklick.
  _isDragHandle(event) {
    const target = event.target;
    if (target === this.element) {
      const top = this.element.getBoundingClientRect().top;
      return event.clientY < top + parseFloat(getComputedStyle(this.element).borderTopWidth);
    }
    return !!target?.closest?.('.dsa5h-head') && !target.closest(this.constructor.DRAG_EXCLUDE);
  }

  // Menü „⋮“ der Titelleiste: Reiter Gefährten je Held aus-/einblenden (Issue #21, Variante A — immer erreichbar,
  // auch wenn der Reiter weg ist). Foundry baut das Menü bei jedem Öffnen neu, die Beschriftung folgt dem Flag.
  _getHeaderControls() {
    const controls = super._getHeaderControls();
    const hidden = !!this.actor.getFlag?.(MODULE_ID, 'hideCompanionTab');
    controls.push({
      action: 'dsa5hToggleCompanionTab',
      icon: hidden ? 'fas fa-paw' : 'fas fa-eye-slash',
      label: hidden ? 'DSA5HELPERS.CompanionTab.Show' : 'DSA5HELPERS.CompanionTab.Hide',
      visible: function () { return this.actor.isOwner; },
    });
    return controls;
  }

  // Actor-Flag hideCompanionTab; das Update rendert neu, ein aktiver Gefährten-Reiter fällt dann aufs Titelblatt zurück.
  static async _toggleCompanionTab() {
    if (!this.actor.isOwner) return;
    await this.actor.setFlag(MODULE_ID, 'hideCompanionTab', !this.actor.getFlag(MODULE_ID, 'hideCompanionTab'));
  }

  // Figur im Reiter „Körper“: Platzhalter (Artenbild) oder Akteur-Porträt — Actor-Flag, nur im Bearbeiten-Modus.
  static async _setBodyFigure(_event, target) {
    if (!this.isEditable) return;
    await this.actor.setFlag(MODULE_ID, 'bodyFigure', target.dataset.figure === 'portrait' ? 'portrait' : 'placeholder');
  }

  // Charakterbauer (#10): wie im System, merkt sich aber die bisherige Bogenwahl ('' = Standard), die der
  // preUpdateActor-Hook in scripts/dsa5-helpers.js beim Abschließen statt des fest gesetzten Systembogens einsetzt.
  static async _startCharacterBuilder() {
    await this.actor.update({ 'flags.core.sheetClass': 'dsa5.DSACharBuilder', [`flags.${MODULE_ID}.preChargenSheet`]: this.actor.getFlag('core', 'sheetClass') ?? '' });
  }

  // Zauber-/Liturgieliste als Dialog im Reiter „Körper“ (im Kampf würfeln, ohne den Reiter zu wechseln). Natives
  // <dialog> im Bogen, damit die Würfelknöpfe über die normalen Sheet-Aktionen laufen (skillSelect usw.).
  static _openCastDialog(_event, target) {
    this.element.querySelector(`dialog[data-cast-dialog="${CSS.escape(target.dataset.kind)}"]`)?.showModal();
  }

  static _closeCastDialog(_event, target) {
    target.closest('dialog')?.close();
  }

  // Die Tradition steht im System nur als Textfeld (system.tradition.magical/clerical); das zugehörige Item ist die
  // Sonderfertigkeit „Tradition (…)“ — gleiche Erkennung wie das System selbst (item-dsa5.js, LocalizedIDs.assumeTradition).
  _findTradition(kind) {
    const prefix = game.i18n.localize('LocalizedIDs.assumeTradition');
    return this.actor.items.find(item => item.type === 'specialability' && item.name.startsWith(prefix) && item.system.category?.value === kind);
  }

  _traditionItems() {
    return { magical: this._findTradition('magical')?.id, clerical: this._findTradition('clerical')?.id };
  }

  // Name fürs Traditions-Badge (Issue #23): wie im System (item-dsa5.js: traditionItem?.name || system.tradition.*)
  // zuerst die Sonderfertigkeit — „Tradition (Hesindekirche)“ → „Hesindekirche“ —, sonst das Freitextfeld. Das System
  // füllt das Feld beim Hinzufügen der Sonderfertigkeit nicht, das Badge blieb dann leer.
  _traditionNames() {
    const names = {};
    for (const kind of ['magical', 'clerical']) {
      const item = this._findTradition(kind);
      const fromItem = item ? (item.name.match(/\(([^)]*)\)\s*$/)?.[1] ?? item.name).trim() : '';
      names[kind] = { name: fromItem || this.actor.system.tradition?.[kind] || '', fromItem };
    }
    return names;
  }

  // Ausrüsten-Schild in der Ausrüstungsliste: Linksklick = System-Umschalter (_itemToggle), Rechtsklick bei Waffen =
  // Griffwahl Haupthand / Nebenhand / Beidhändig (Nutzer-Feedback 2026-09-24). Die Menüeinträge rufen nur die
  // Hand-Logik des Systems auf (actor-dsa5.js equipWeaponToHand/swapWeaponHandSlot, meleeweapon.js
  // swapNumberWeaponHands); Menü-Aufbau wie im System (creature-sheet.js _traitCompanionContextMenu).
  static async _dsa5hEquip(event, target) {
    if (event.button !== 2) return this.constructor._itemToggle.call(this, event, target);
    const item = this.actor.items.get(this._getItemId(target));
    if (!['meleeweapon', 'rangeweapon'].includes(item?.type)) return;
    event.preventDefault();
    const actor = this.actor;
    const worn = !!item.system.worn.value;
    const melee = item.type === 'meleeweapon';
    const twoHanded = melee ? globalThis.dsa5.apps.RuleChaos.isWieldedTwohanded(item) : item.system.worn.requiresBothHands !== false;
    const gripSwitchable = melee && !item.system.constructor.NOT_TWO_HANDED_WEAPON_TYPES?.has(game.i18n.localize('LocalizedCTs.' + item.system.combatskill.value));
    const oneHandPossible = !twoHanded || gripSwitchable;
    const toHand = async hand => {
      if (twoHanded && gripSwitchable) await item.system.swapNumberWeaponHands();
      if (worn) await actor.swapWeaponHandSlot(item.id, hand);
      else await actor.equipWeaponToHand(item.id, { hand, equip: true });
    };
    const icon = (active, fallback) => `<i class="fas fa-${active ? 'check' : fallback} fa-fw"></i>`;
    const menu = new foundry.applications.ux.ContextMenu(this.element, '', [
      { label: 'mainHand', icon: icon(worn && !twoHanded && !item.system.worn.offHand, 'hand'), visible: oneHandPossible, onClick: () => toHand('main') },
      { label: 'offHand', icon: icon(worn && !twoHanded && !!item.system.worn.offHand, 'shield-halved'), visible: oneHandPossible, onClick: () => toHand('offhand') },
      {
        label: 'DSA5HELPERS.GripTwoHanded', icon: icon(worn && twoHanded, 'hands'), visible: gripSwitchable || (melee && twoHanded),
        onClick: async () => {
          if (!twoHanded) await item.system.swapNumberWeaponHands();
          if (!worn) await actor.equipWeaponToHand(item.id, { hand: 'auto', equip: true });
        },
      },
      { label: 'SHEET.UnEquipItem', icon: '<i class="fas fa-xmark fa-fw"></i>', visible: worn, onClick: () => actor.equipWeaponToHand(item.id, { equip: false }) },
    ], { jQuery: false, fixed: true, eventName: 'none' });
    ui.context?.close();
    await menu.render(target, { animate: true });
    ui.context = menu;
  }

  // Getrennter Minus-Knopf für Zustände (UI/UX-Review 2026-09-25, Punkt 1 + 4): das System senkt nur per
  // Rechtsklick auf seinen einen Wert-Knopf — per Tastatur unerreichbar. Ruft unverändert denselben
  // System-Handler auf, nur mit Rechtsklick-Semantik (actor-sheet.js _conditionValue → removeCondition).
  static _dsa5hConditionDown(_event, target) {
    return this.constructor._conditionValue.call(this, { button: 2 }, target);
  }

  // Sichtbarer Zurücksetzen-Knopf fürs Nachladen (Nutzer-Feedback 2026-09-28): das System setzt Lade- und
  // Zielfortschritt nur per Rechtsklick auf seinen Ladeknopf zurück. Ruft denselben System-Handler mit
  // Rechtsklick-Semantik auf (actor-sheet.js _loadWeapon), wie _dsa5hConditionDown.
  static _dsa5hReloadReset(_event, target) {
    return this.constructor._loadWeapon.call(this, { button: 2 }, target);
  }

  static _setTab(_event, target) {
    if (!this.constructor.HELPER_TABS.some(tab => tab.id === target.dataset.tab)) return;
    this._currentTab = target.dataset.tab;
    this._applyCurrentTab();
    this.element.querySelector('.dsa5h-content')?.scrollTo({ top: 0 });
    // Switching to Talente should let the user start typing a search immediately, no extra click needed.
    if (this._currentTab === 'skills') {
      // Die Liste steht wieder oben — also ist die erste Gruppe markiert.
      const first = this.element.querySelector('.allTalents [data-skill-panel]')?.dataset.skillPanel;
      if (first) this._subtabs.skills = first;
      this._applySubTabButtons();
      this.element.querySelector('.talentSearch')?.focus();
    }
  }

  static _setSubTab(_event, target) {
    const tab = target.dataset.parentTab;
    const id = target.dataset.subtab;
    if (!Object.hasOwn(this._subtabs, tab)) return;
    this._subtabs[tab] = id;
    // Gruppenwahl beendet eine laufende Talentsuche (wie im Click-Dummy jumpToSkillGroup()).
    if (tab === 'skills') this._resetTalentSearch();
    this._applyCurrentTab();
    if (tab === 'skills') this._jumpToSkillGroup(id);
  }

  // Talente „Sprungmarken“ (Tester-Rückmeldung 2026-09-30): die Liste zeigt immer alle Gruppen untereinander, die
  // Gruppen-Reiter scrollen nur an die passende Stelle. Seit der Live-Rückmeldung 2026-09-30 gehören auch die
  // Sammelproben als letzter Abschnitt dazu; Suche + „Nur gesteigerte“ kleben oben (CSS), deshalb wird ihre Höhe
  // abgezogen. Solange der Sprung läuft, führt _onContentScroll() die Markierung nicht mit (sonst flackert sie über
  // die Gruppen dazwischen) — Ende über das scrollend-Ereignis (Listener in _onRender).
  _skillPanels() {
    return [...(this.element?.querySelectorAll('[data-tab-panel="skills"] [data-skill-panel]') ?? [])].filter(panel => !panel.hidden);
  }

  _skillStickyOffset(content) {
    return content.querySelector('[data-tab-panel="skills"] > .dsa5h-search-bar')?.offsetHeight ?? 0;
  }

  _jumpToSkillGroup(id) {
    const content = this.element?.querySelector('.dsa5h-content');
    const panel = this._skillPanels().find(entry => entry.dataset.skillPanel === id);
    if (!content || !panel) return;
    const wanted = panel.getBoundingClientRect().top - content.getBoundingClientRect().top + content.scrollTop - this._skillStickyOffset(content) - 4;
    const top = Math.max(0, Math.min(wanted, content.scrollHeight - content.clientHeight));
    this._skillJumping = Math.abs(top - content.scrollTop) > 1;
    content.scrollTo({ top, behavior: 'smooth' });
  }

  // Scroll-Mitführung: markiert die Gruppe, deren Panel gerade oben im Inhaltsbereich steht; ganz unten die letzte
  // (die Sammelproben sind meist zu kurz, um bis nach oben zu kommen).
  _onContentScroll() {
    if (this._currentTab !== 'skills' || this._search.talent.trim() || this._skillJumping) return;
    const content = this.element?.querySelector('.dsa5h-content');
    const panels = this._skillPanels();
    if (!content || !panels.length) return;
    const top = content.getBoundingClientRect().top + this._skillStickyOffset(content) + 40;
    let current = panels[0].dataset.skillPanel;
    if (content.scrollTop + content.clientHeight >= content.scrollHeight - 2) current = panels.at(-1).dataset.skillPanel;
    else panels.forEach(panel => { if (panel.getBoundingClientRect().top <= top) current = panel.dataset.skillPanel; });
    if (current === this._subtabs.skills) return;
    this._subtabs.skills = current;
    this._applySubTabButtons();
  }

  // Sprung von der Kampftechnik einer Waffe (parts/combatskill-link.hbs) zur Zeile im Unterreiter „Kampftechniken“:
  // Unterreiter wechseln, Suche leeren, Zeile in die Mitte scrollen und kurz aufleuchten lassen (Tester 2026-09-30).
  static _jumpToCombatSkill(_event, target) {
    this._subtabs.combat = 'skills';
    this._search.combatskill = '';
    const input = this.element.querySelector('.combatSkillSearch');
    if (input) input.value = '';
    this._applyCurrentTab();
    this._applyCombatSkillSearch();
    const content = this.element.querySelector('.dsa5h-content');
    const row = content?.querySelector(`[data-sub-panel="combat:skills"] [data-item-id="${CSS.escape(target.dataset.skillId ?? '')}"]`);
    if (!row) return;
    const offset = row.getBoundingClientRect().top - content.getBoundingClientRect().top;
    content.scrollTo({ top: content.scrollTop + offset - (content.clientHeight - row.offsetHeight) / 2, behavior: 'smooth' });
    row.querySelector('[data-action="itemEdit"]')?.focus({ preventScroll: true });
    this._flash(row);
  }

  static _toggleOnlyLearned() {
    this._onlyLearned = !this._onlyLearned;
    this._applyTalentSearch();
  }

  static _clearTalentSearch() {
    this._resetTalentSearch();
    this._applyCurrentTab();
    this.element.querySelector('.talentSearch')?.focus();
  }

  _resetTalentSearch() {
    this._search.talent = '';
    const input = this.element?.querySelector('.talentSearch');
    if (input) input.value = '';
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
    // Das System fragt den aktiven Reiter über tabGroups.sheet ab (gleiche IDs wie unsere Reiter) — u. a. erkennt
    // _onDropActor daran den Gefährten-Reiter und legt eine Kreatur auf der Favoriten-Fläche als Beschwörungs-
    // Favorit an statt als Begleiter (Issue #15); ebenso CreatureDropDialog und das Anlegen von Rüstung im Kampf.
    this.tabGroups.sheet = this._currentTab;
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
    this._applySubTabButtons();
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
    this._fitName();
  }

  // Heldenname (Issue #25): Schrift so weit verkleinern (bis 22 px), dass der ganze Name in die Zeile passt — die
  // Höchstgröße kommt aus dem CSS (39 px, Titelblatt 44 px). Was dann noch nicht passt, kürzt text-overflow mit „…“
  // (voller Name im Tooltip). Gemessen per Canvas, weil ein <input> keine Textbreite liefert. Aufrufe: jeder
  // Reiterwechsel (_applyCurrentTab), Fenstergröße und Eingabe im Namensfeld (Listener in _onRender).
  _fitName() {
    const heading = this.element?.querySelector('.dsa5h-name');
    const input = heading?.querySelector('input');
    if (!input) return;
    heading.style.removeProperty('font-size');
    const style = getComputedStyle(input);
    const max = parseFloat(style.fontSize);
    const context = (this._nameCanvas ??= document.createElement('canvas')).getContext('2d');
    context.font = `${style.fontWeight} ${max}px ${style.fontFamily}`;
    const width = context.measureText(input.value || input.placeholder).width;
    const available = input.clientWidth;
    if (available > 0 && width > available) heading.style.fontSize = Math.max(22, Math.floor(max * available / width)) + 'px';
  }

  // Während einer Talentsuche stehen Treffer aus ALLEN Gruppen da — dann ist keine Gruppe markiert
  // (UI/UX-Review 2026-09-25 Punkt 8).
  _applySubTabButtons() {
    const talentSearching = !!this._search.talent.trim();
    this.element?.querySelectorAll('[data-subtab]').forEach(el => {
      const active = this._subtabs[el.dataset.parentTab] === el.dataset.subtab && !(el.dataset.parentTab === 'skills' && talentSearching);
      el.classList.toggle('active', active);
      el.setAttribute('aria-pressed', String(active));
    });
  }

  // The category panels live under data-skill-panel; while a search is active every category with a hit stays
  // visible (matching the real system's own SearchFilter#_filterTalents, which forces .allTalents into "showAll")
  // and individual rows are filtered by name. "Nur gesteigerte" (_onlyLearned) additionally hides FW-0 rows.
  // Without a search all groups are shown one below the other ("Sprungmarken", 2026-09-30), followed by the
  // Sammelproben panel (outside .allTalents), which is hidden during a search.
  _applyTalentSearch() {
    const root = this.element;
    if (!root) return;
    const query = this._search.talent.trim().toLowerCase();
    root.querySelectorAll('[data-skill-panel]').forEach(panel => {
      const grouped = panel.closest('.allTalents');
      if (!grouped) {
        panel.hidden = !!query;
        return;
      }
      let visible = 0;
      panel.querySelectorAll('.dsa5h-skill-row.item').forEach(row => {
        const name = row.querySelector('.talentName')?.textContent?.toLowerCase() ?? '';
        row.hidden = (!!query && !name.includes(query)) || (this._onlyLearned && Number(row.dataset.fw) === 0);
        if (!row.hidden) visible++;
      });
      panel.hidden = !!query && !visible;
      const empty = panel.querySelector('[data-only-learned-empty]');
      if (empty) empty.hidden = !(this._onlyLearned && !visible && panel.querySelector('.dsa5h-skill-row.item'));
    });
    const info = root.querySelector('[data-talent-search-info]');
    if (info) {
      info.hidden = !query;
      const text = info.querySelector('[data-talent-search-text]');
      if (text) text.textContent = game.i18n.format('DSA5HELPERS.SearchAllGroups', { query: this._search.talent.trim() });
    }
    const filter = root.querySelector('[data-action="dsa5hOnlyLearned"]');
    if (filter) {
      filter.setAttribute('aria-checked', String(this._onlyLearned));
      filter.classList.toggle('on', this._onlyLearned);
    }
  }

  // Kampftechniken filtern wie die Talente (Nutzer-Feedback 2026-09-28): Namens-Teilstring, beide Spalten (Nah-/
  // Fernkampf) bleiben stehen, leere Treffer zeigen einen Hinweis.
  _applyCombatSkillSearch() {
    const root = this.element;
    if (!root) return;
    const query = this._search.combatskill.trim().toLowerCase();
    root.querySelectorAll('[data-sub-panel="combat:skills"] .panel').forEach(panel => {
      let visible = 0;
      panel.querySelectorAll('.dsa5h-combatskill-row.item').forEach(row => {
        const name = row.querySelector('[data-action="itemEdit"]')?.textContent?.toLowerCase() ?? '';
        row.hidden = !!query && !name.includes(query);
        if (!row.hidden) visible++;
      });
      const empty = panel.querySelector('[data-search-empty]');
      if (empty) empty.hidden = !query || visible > 0;
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
} : null;
