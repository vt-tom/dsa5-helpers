// Probendialoge auf Smartphone und Tablet (Issue #59, Nutzerentscheidung 2026-10-28: Variante B „Wichtiges zuerst“,
// Click-Dummy clickdummy/mobile/probe.html), seit 0.6.3 auch am Desktop (Issue #63, styles/dsa5-helpers-roll-dialog.css). Die Eingaben des Systems werden nur umgehängt, nicht nachgebaut: Werte,
// Merken der Auswahl, Neuberechnung und Würfeln bleiben beim System (Grundsatz „Erben statt neu bauen“). Alles bleibt
// im Formular und unter `.skill-test` (der Zauberdialog sucht dort die Kosten).
//
// Aufbau: Zielwert + Ziel, Modifikator mit −/+, Manöver/Sonderfertigkeiten, häufige Auswahlfelder (Sicht,
// Schwierigkeit, Entfernung, Verteidigungen), Kosten bei Zaubern; eingeklappt: Umstände, Feinheiten, Würfelmodus.
// Am Desktop (Issue #63, Nutzerentscheidung 2026-11-02 nach Versuchen mit zwei Spalten und einem Seitenfeld) ebenso
// einspaltig; das Fenster ist höchstens 70 % so hoch wie der Bildschirm und scrollt, Manöver und Modifikatoren als Chips.

const ROLL_CLASSES = new Set(['DSA5CombatDialog', 'DSA5SkillDialog', 'DSA5SpellDialog']);
const MODULE_ID = 'dsa5-helpers';
// Desktop (Issue #63): Foundry-Fenster in dieser Breite (auch als min-/max-width im CSS, Abschnitt 3)
const DESKTOP_WIDTH = 480;
const MAIN_FIELDS = ['vision', 'testDifficulty', 'distance', 'defenseCount'];
// Dieselben Namen wie die Sicht-Chips im Chat (Foundrys CHAT.MODES.* ist im Deutschen nicht übersetzt)
const MODE_LABELS = {
  public: 'DSA5HELPERS.Mobile.Chat.Mode.public',
  ic: 'DSA5HELPERS.Mobile.Chat.Mode.ic',
  gm: 'DSA5HELPERS.Mobile.Chat.Mode.gm',
  blind: 'DSA5HELPERS.Mobile.Chat.Mode.blind',
  self: 'DSA5HELPERS.Mobile.Chat.Mode.self',
};

/**
 * Im init-Hook nach initMobile aufrufen. Mobil baut mobile.js die Dialoge immer um; am Desktop (auch v13) hier, wenn
 * die SL in der Welt-Einstellung das Modul gewählt hat (Nutzerentscheidung 2026-11-02, vorher je Gerät). „System“ =
 * Dialoge des Systems wie bisher, etwa wenn ein anderes Modul sie erweitert.
 */
export function initRollDialogs(mobileMode) {
  game.settings.register(MODULE_ID, 'rollDialogDesktopStyle', {
    name: 'DSA5HELPERS.Settings.RollDialogDesktop.Name', hint: 'DSA5HELPERS.Settings.RollDialogDesktop.Hint',
    scope: 'world', config: false, restricted: true, type: String, default: 'module', requiresReload: true,
    choices: { module: 'DSA5HELPERS.Settings.RollDialogDesktop.Module', system: 'DSA5HELPERS.Settings.RollDialogDesktop.System' },
  });
  if (mobileMode) {
    document.body.classList.add('dsa5h-rd-on');
    return;
  }
  if (game.settings.get(MODULE_ID, 'rollDialogDesktopStyle') !== 'module') return;
  document.body.classList.add('dsa5h-rd-on', 'dsa5h-rd-desktop');
  const onRender = (app, element) => {
    const el = element instanceof HTMLElement ? element : element?.[0];
    if (!el || !isRollDialog(app, el)) return;
    setupRollDialog(el, app);
    // Einmal schmaler und dabei mittig bleiben; danach behält das Fenster, was der Nutzer einstellt
    if (el.dataset.dsa5hRdSized) return;
    el.dataset.dsa5hRdSized = '1';
    // Schutz beim Ziehen: Foundry rechnet top + Verschiebung, mit top null bewegt sich das Fenster nur seitlich
    el.querySelector('.window-header')?.addEventListener('pointerdown', () => repairPosition(app, el), true);
    const { left, width } = app.position ?? {};
    if (!(width > DESKTOP_WIDTH)) return;
    const centered = Number.isFinite(left) ? left + (width - DESKTOP_WIDTH) / 2 : (innerWidth - DESKTOP_WIDTH) / 2;
    app.setPosition({ width: DESKTOP_WIDTH, height: 'auto', left: Math.max(0, centered) });
  };
  Hooks.on('renderApplicationV2', onRender);
  Hooks.on('renderApplication', onRender);
}

/**
 * Position nach fremden Eingriffen wieder herstellen (Rückmeldung #63, 2026-11-02): Das Ulisses-Modul „Kompendium“
 * (Trefferzonen, dsa5-compendium/modules/hitzone/hitzone.js) ruft im Angriffsdialog noch vor der ersten
 * Positionierung `setPosition(elem.position)` mit `top: null` und fester Höhe auf. Ohne top lässt Foundrys Ziehen das
 * Fenster nur seitlich wandern, die feste Höhe wächst beim Aufklappen nicht mit. Nur am Desktop.
 */
function repairPosition(app, el) {
  if (!document.body.classList.contains('dsa5h-rd-desktop') || !app?.setPosition) return;
  const { top, left, height } = app.position ?? {};
  if (Number.isFinite(top) && Number.isFinite(left) && height === 'auto') return;
  const rect = el.getBoundingClientRect();
  app.setPosition({ top: Number.isFinite(top) ? top : rect.top, left: Number.isFinite(left) ? left : rect.left, height: 'auto' });
}

/** Nur echte Probendialoge (Talent, Eigenschaft, Kampf, Zauber, Liturgie), nicht Regeneration, Fallschaden usw. */
export function isRollDialog(app, el) {
  for (let cls = app?.constructor; cls?.name; cls = Object.getPrototypeOf(cls)) if (ROLL_CLASSES.has(cls.name)) return true;
  // Eigenschaftsprobe: eigene Klasse gibt es nicht (DSA5Dialog), die Quelle hat den Typ „char“
  return app?.dialogData?.source?.type === 'char' && !!el.querySelector('.dialog-content [name="testModifier"]');
}

const make = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  return node;
};

function fire(input) {
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

/** Zahlenfeld des Systems zwischen −/+ (44 px). Das Feld selbst bleibt zum Tippen. */
function stepper(input) {
  const wrap = make('span', 'dsa5h-rd-stepper');
  const button = (step, label) => {
    const b = make('button', null, step < 0 ? '−' : '+');
    b.type = 'button';
    b.setAttribute('aria-label', game.i18n.localize(label));
    b.addEventListener('click', () => {
      input.value = (Number(input.value) || 0) + step;
      fire(input);
    });
    return b;
  };
  input.before(wrap);
  wrap.append(button(-1, 'DSA5HELPERS.Mobile.Roll.Less'), input, button(1, 'DSA5HELPERS.Mobile.Roll.More'));
  return wrap;
}

/** Wie viele Eingaben weichen von der Vorgabe des Systems ab (auch gemerkte Werte zählen). */
function changedCount(root) {
  let n = 0;
  for (const input of root.querySelectorAll('input, select')) {
    if (input.type === 'radio' || input.type === 'hidden' || input.closest('[hidden], .dsahidden')) continue;
    if (input.type === 'checkbox') n += input.checked !== input.defaultChecked;
    else if (input.tagName === 'SELECT') n += !(input.selectedOptions[0]?.defaultSelected || (input.selectedIndex === 0 && ![...input.options].some(o => o.defaultSelected)));
    else n += String(input.value) !== String(input.defaultValue);
  }
  root.querySelectorAll('.specAbs.active').forEach(() => n++);
  return n;
}

function fold(title, cls) {
  const details = make('details', `dsa5h-rd-fold ${cls}`);
  const summary = make('summary');
  summary.append(make('span', 'dsa5h-rd-fold-title', title), make('span', 'dsa5h-rd-badge'));
  details.append(summary, make('div', 'dsa5h-rd-fold-body'));
  return details;
}

function rollValue(app) {
  const data = app.dialogData ?? {};
  const type = data.source?.type;
  if (['skill', 'spell', 'ritual', 'liturgy', 'ceremony'].includes(type)) {
    const fw = Number(data.source.system?.talentValue?.value);
    return Number.isFinite(fw) ? { abbr: game.i18n.localize('CHARAbbrev.FW'), value: fw } : null;
  }
  if (type === 'char') {
    const attr = String(data.source.system?.attr ?? '').toUpperCase();
    const value = Number(data.source.system?.value);
    return attr && Number.isFinite(value) ? { abbr: game.i18n.localize(`CHARAbbrev.${attr}`), value } : null;
  }
  if (!Number.isFinite(Number(data.rollValue)) || data.rollValue === null) return null;
  const abbr = type === 'dodge' ? 'CHARAbbrev.AW' : data.mode === 'parry' ? 'CHARAbbrev.parry'
    : type === 'rangeweapon' ? 'CHARAbbrev.FK' : 'CHARAbbrev.attack';
  return { abbr: game.i18n.localize(abbr), value: data.rollValue };
}

export function setupRollDialog(el, app) {
  const content = el.querySelector('.dialog-content');
  if (!content || content.querySelector('.dsa5h-rd')) return;
  const host = content.querySelector('.skill-test') ?? content.querySelector(':scope > .flexcol');
  if (!host) return;
  el.classList.add('dsa5h-m-roll');
  const isSpell = !!host.querySelector('.aspcost');
  const isCombat = !!host.querySelector('[name="damageModifier"], [name="defenseCount"], .specAbs[data-category], .waterblock');

  const rd = make('div', 'dsa5h-rd');
  // Eine Spalte; sie hält am Desktop den Abstand der Abschnitte, mobil löst sie sich im CSS auf (display: contents)
  const col = make('div', 'dsa5h-rd-col');
  const desktop = document.body.classList.contains('dsa5h-rd-desktop');
  // Gruppen der linken Spalte (bzw. des einspaltigen Eigenschaftsdialogs) einsammeln, bevor umgehängt wird
  const cols = host.matches('.flexcol') ? [host] : [...host.children].filter(c => c.matches('.col'));
  const groups = cols.flatMap(c => [...c.children]).filter(n => !n.matches('.targets, .specAbsContainer, .dsa5h-maneuver-panel, .talent-test-targets'));

  // Kopf: Zielwert und Ziele des Systems (das System ersetzt nur den Inhalt von .targets)
  const head = make('div', 'dsa5h-rd-head');
  const value = rollValue(app);
  if (value) {
    const tile = make('span', 'dsa5h-rd-value');
    tile.append(make('small', null, value.abbr), make('b', null, String(value.value)));
    head.append(tile);
  }
  const dice = characteristicDice(host, app);
  if (dice) head.append(dice.node);
  const targets = host.querySelector('.targets');
  if (targets) head.append(targets);
  rd.append(col);
  col.append(head);

  // Modifikator: testModifier mit −/+, beim Angriff TP daneben
  const modSec = make('section', 'dsa5h-rd-sec dsa5h-rd-mods');
  modSec.append(make('h4', null, game.i18n.localize('Modifier')));
  const modGrid = make('div', 'dsa5h-rd-modgrid');
  const testMod = host.querySelector('input[name="testModifier"]');
  const damageMod = host.querySelector('input[name="damageModifier"]');
  const addMod = (input, label, withSteps) => {
    if (!input) return;
    const cell = make('label', 'dsa5h-rd-mod');
    if (label) cell.append(make('span', 'dsa5h-rd-lbl', label));
    const oldGroup = input.closest('.form-group');
    if (withSteps) cell.append(stepper(input)); else cell.append(input);
    if (oldGroup && !oldGroup.querySelector('input, select')) oldGroup.hidden = true;
    modGrid.append(cell);
  };
  addMod(testMod, damageMod ? oldSpanText(testMod) : '', true);
  addMod(damageMod, damageMod && oldSpanText(damageMod), false);
  modSec.append(modGrid);
  col.append(modSec);

  // Zauber: Zauberdauer, Kosten, Reichweite sichtbar
  const costs = isSpell ? host.querySelector('.aspcost')?.closest('.row-section.wrap') : null;
  if (costs) {
    const sec = make('section', 'dsa5h-rd-sec dsa5h-rd-costs');
    sec.append(costs);
    col.append(sec);
  }

  // Manöver und Sonderfertigkeiten bzw. Zaubererweiterungen
  const specs = host.querySelector('.specAbsContainer');
  const maneuvers = host.querySelector('.dsa5h-maneuver-panel');
  const extras = host.querySelectorAll('.talent-test-targets > :not(.targets)');
  if (specs || maneuvers || extras.length) {
    const sec = make('section', 'dsa5h-rd-sec dsa5h-rd-specs');
    if (maneuvers) sec.append(maneuvers);
    if (specs) sec.append(specs);
    extras.forEach(x => sec.append(x));
    col.append(sec);
  }

  // Häufige Auswahlfelder
  const main = make('section', 'dsa5h-rd-sec dsa5h-rd-main');
  for (const name of MAIN_FIELDS) {
    const field = host.querySelector(`[name="${name}"]`);
    const group = field?.closest('.form-group');
    if (!group || group.closest('.dsa5h-rd')) continue;
    if (field.type === 'number') group.querySelector('.form-fields') ? stepper(field) : group.append(stepper(field));
    main.append(group);
  }
  if (main.children.length) col.append(main);

  // Eingeklappt: Umstände (alles Übrige), Feinheiten (Eigenschaften/FW/QS), Würfelmodus
  const more = fold(game.i18n.localize(isSpell ? 'DSA5HELPERS.Mobile.Roll.SpellOptions'
    : isCombat ? 'DSA5HELPERS.Mobile.Roll.Circumstances' : 'DSA5HELPERS.Mobile.Roll.Situation'), 'dsa5h-rd-more');
  const moreBody = more.querySelector('.dsa5h-rd-fold-body');
  const chips = make('div', 'dsa5h-rd-chips');
  const list = make('div', 'dsa5h-rd-list');
  moreBody.append(chips, list);
  const fine = fold(game.i18n.localize('DSA5HELPERS.Mobile.Roll.Fine'), 'dsa5h-rd-fine');
  const fineBody = fine.querySelector('.dsa5h-rd-fold-body');
  const mode = fold('', 'dsa5h-rd-mode');
  const modeBody = mode.querySelector('.dsa5h-rd-fold-body');

  const place = node => {
    if (node.closest('.dsa5h-rd') || node.hidden) return;
    if (node.matches('hr')) { node.hidden = true; return; }
    if (node.querySelector('.dsaMessageMode')) { modeBody.append(node); return; }
    if (node.querySelector('select[name^="characteristics"], input[name="ch0"]')) { fineBody.append(node); return; }
    // Höchstzahl der Modifikationen (FW/4, das System nimmt zu viele Häkchen zurück) direkt über den Chips
    if (node.querySelector('.maxMods')) { node.classList.add('dsa5h-rd-maxmods'); chips.before(node); return; }
    // Kästchen werden Chips. „Zauberdauer erhöhen/senken“ füllt das System bei Bedarf neu, der Block bleibt deshalb
    // ganz und wird nur im CSS aufgelöst.
    const inputs = node.querySelectorAll('input:not([type="hidden"]), select');
    if (node.matches('.canChangeCastingTime') || (node.matches('.form-group') && inputs.length === 1 && inputs[0].type === 'checkbox')) {
      chips.append(node);
      return;
    }
    list.append(node);
  };
  groups.forEach(place);
  // Chip antippen schaltet das Kästchen des Systems
  chips.addEventListener('click', event => {
    const chip = event.target.closest('.form-group');
    const box = chip?.querySelector('input[type="checkbox"]');
    if (!box || box.disabled || event.target === box) return;
    event.preventDefault();
    box.checked = !box.checked;
    fire(box);
  });
  col.append(more);
  if (fineBody.children.length) col.append(fine);
  if (modeBody.children.length) col.append(mode);
  const situational = desktop ? situationalChips(list) : null;

  host.prepend(rd);
  // Felder, die andere Module erst danach in die Spalten des Systems hängen (z. B. „Gezielter Angriff“ der
  // Trefferzonen aus dem Kompendium), wie die übrigen einsortieren; die Spalten selbst sind ausgeblendet.
  const late = new MutationObserver(records => {
    const added = records.flatMap(r => [...r.addedNodes]).filter(n => n instanceof HTMLElement);
    if (!added.length) return;
    added.forEach(place);
    el.dsa5hRollRefresh?.();
    repairPosition(app, el);
  });
  host.querySelectorAll(':scope > .col').forEach(c => {
    c.classList.add('dsa5h-rd-emptied');
    late.observe(c, { childList: true });
  });

  // Zahlen an den eingeklappten Gruppen und der gewählte Würfelmodus. Das Fenster bleibt beim Neuzeichnen erhalten,
  // seine Listener deshalb nur einmal anlegen; sie rufen die Aktualisierung des jeweils aktuellen Inhalts.
  // Die Gruppe „Bedingte Modifikatoren“ blendet das System je nach Auswahl ein und aus; ohne Sichtbares keine Gruppe.
  const shown = n => !n.hidden && !n.matches('.dsahidden') && (n.matches('.canChangeCastingTime') ? n.children.length > 0 : true);
  el.dsa5hRollRefresh = () => {
    dice?.update();
    more.hidden = ![...chips.children, ...list.children].some(shown);
    situational?.update();
    more.querySelector('.dsa5h-rd-badge').textContent = changedCount(moreBody) || '';
    fine.querySelector('.dsa5h-rd-badge').textContent = changedCount(fineBody) || '';
    const checked = MODE_LABELS[modeBody.querySelector('input[name="messageMode"]:checked')?.value];
    mode.querySelector('.dsa5h-rd-fold-title').textContent = `${game.i18n.localize('DIALOG.MessageMode')}: ${checked ? game.i18n.localize(checked) : ''}`;
  };
  el.dsa5hRollRefresh();
  if (el.dataset.dsa5hRoll) return;
  el.dataset.dsa5hRoll = '1';
  el.addEventListener('change', () => setTimeout(() => el.dsa5hRollRefresh?.(), 0));
  el.addEventListener('mousedown', event => {
    // Antippen eines Zahlenfelds zählt beim System hoch (RuleChaos.quantityClick per mousedown); mobil soll es nur
    // zum Tippen fokussieren, dafür gibt es −/+.
    if (event.target.matches?.('.dsa5h-rd .quantity-click')) event.stopPropagation();
    setTimeout(() => el.dsa5hRollRefresh?.(), 50);
  }, true);
}

/**
 * „Bedingte Modifikatoren“ am Desktop als Chips statt Mehrfachauswahl. Gewählt wird über das Widget des Systems
 * (`dsa-situationalmodifiers`, wie die Grundmanöver in house-rules/maneuvers.js), es rechnet und merkt sich die Wahl;
 * die Chips entstehen aus den sichtbaren Optionen, mit dem Tooltip der Liste. Neu gebaut wird nur, wenn sich die
 * Optionen ändern: Die Aktualisierung läuft schon kurz nach dem Mausdruck, ein ersetzter Chip bekäme den Klick nicht.
 */
function situationalChips(list) {
  const select = list.querySelector('.modifiers select[name="situationalModifiers"]');
  const widget = select?.closest('[is="dsa-situationalmodifiers"]');
  if (!select || !widget?.modifiers) return null;
  const wrap = make('div', 'dsa5h-rd-modchips');
  select.after(wrap);
  select.classList.add('dsa5h-rd-replaced');
  let built = '';
  const update = () => {
    const options = [...select.options].filter(o => !o.hidden && o.style.display !== 'none');
    const key = options.map(o => `${o.dataset.index}:${o.textContent}`).join('|');
    if (key === built) {
      options.forEach((o, n) => wrap.children[n]?.setAttribute('aria-pressed', String(o.selected)));
      return;
    }
    built = key;
    wrap.replaceChildren(...options.map(option => {
      const chip = make('button', 'dsa5h-rd-modchip', option.textContent.trim());
      chip.type = 'button';
      chip.dataset.index = option.dataset.index;
      chip.setAttribute('aria-pressed', String(option.selected));
      if (option.dataset.tooltipHtml) {
        chip.dataset.tooltipHtml = option.dataset.tooltipHtml;
        chip.dataset.tooltipClass = option.dataset.tooltipClass ?? '';
      }
      return chip;
    }));
  };
  wrap.addEventListener('click', event => {
    const chip = event.target.closest('button[data-index]');
    const modifier = chip && widget.modifiers[Number(chip.dataset.index)];
    if (!modifier) return;
    modifier.selected = !modifier.selected;
    widget.refresh();
    widget.dispatchChange();
    update();
  });
  update();
  return { update };
}

/**
 * Eigenschaftswürfel der Probe im Kopf (Nutzerwunsch 2026-10-30), wie die Talentproben im Bogen: je Eigenschaft der
 * Würfel des Systems mit dem Wert samt Modifikator aus „Feinheiten“. Folgt der Eigenschaftswahl des Systems
 * (`characteristics0–2`), daher Neuberechnung bei jeder Änderung.
 */
function characteristicDice(host, app) {
  const selects = [0, 1, 2].map(i => host.querySelector(`select[name="characteristics${i}"]`));
  const actor = ChatMessage.getSpeakerActor(app.dialogData?.speaker ?? {});
  if (selects.some(s => !s) || !actor) return null;
  const node = make('span', 'dsa5h-rd-dice');
  const update = () => {
    node.replaceChildren(...selects.map((select, i) => {
      const key = select.value;
      const mod = Number(host.querySelector(`input[name="ch${i}"]`)?.value) || 0;
      const value = Number(actor.system.characteristics?.[key]?.value ?? 0) + mod;
      const abbr = game.i18n.localize(`CHARAbbrev.${key.toUpperCase()}`);
      const die = make('span', 'dsa5h-rd-die');
      die.dataset.tooltip = game.i18n.localize(`CHAR.${key.toUpperCase()}`);
      const face = make('b', null, String(value));
      face.style.backgroundImage = `url('systems/dsa5/icons/dice/d20${key}.svg')`;
      die.append(face, make('small', null, abbr));
      return die;
    }));
  };
  update();
  return { node, update };
}

/** Kürzel vor einem Eingabefeld des Systems („AT“, „TP“) als Beschriftung übernehmen und die Vorlage ausblenden. */
function oldSpanText(input) {
  const span = input?.previousElementSibling;
  if (!span?.matches('span')) return '';
  span.hidden = true;
  return span.textContent.trim();
}
