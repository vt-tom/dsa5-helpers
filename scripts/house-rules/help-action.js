// Hausregel „Helfen“ (Nutzerwunsch 2026-10-05): Im Kampf nutzt ein Held seine Aktion für eine passende Talentprobe;
// die übrig behaltenen QS erleichtern die nächste Probe eines anderen. Beispiel: Einschüchtern, um den Gegner eines
// Mitstreiters auf sich zu lenken. Auslöser: der Schalter „Als Hilfe würfeln“ im Probendialog jeder Talentprobe (beide
// Bögen, DSA-Leiste; #44, Nutzer 2026-10-21) und der Knopf „Helfen“ in den Schnellaktionen unseres Kampf-Reiters, der
// erst ein Talent wählen lässt und den Schalter vorbelegt. Technisch ist der Schalter ein unsichtbarer Modifikator ±0
// (ref dsa5h:help) im Widget des Systems; nach dem Wurf erkennt der Chat-Hook ihn und meldet die QS als Erleichterung.
// Die Erleichterung trägt der Unterstützte bei seiner nächsten Probe selbst ein — das Modul setzt keinen Modifikator.
import { hideModifierRows } from './maneuvers.js';

export const HELP_REF = 'dsa5h:help';
const PREFIX = 'DSA5HELPERS.HouseRules.helpAction.';
const loc = (key, data) => data ? game.i18n.format(PREFIX + key, data) : game.i18n.localize(PREFIX + key);

/** Talente des Helden nach Gruppe (Körper, Gesellschaft, …), alphabetisch — für die Auswahl. */
export function skillOptions(actor) {
  const order = ['body', 'social', 'nature', 'knowledge', 'trade'];
  const rank = group => (order.includes(group) ? order.indexOf(group) : order.length);
  const groups = new Map();
  // Collection (Foundry) und Map (Test-Harness) liefern ihre Einträge beide über values().
  for (const item of actor?.items?.values?.() ?? []) {
    if (item.type !== 'skill') continue;
    const group = item.system?.group?.value ?? '';
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(item);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([group, items]) => ({ group, items: items.sort((a, b) => a.name.localeCompare(b.name, game.i18n.lang)) }));
}

/** Text der Chatnachricht nach der Probe. `t(key, data)` liefert die Texte (Test-Harness). */
export function helpMessage({ helper, skill, target, qs }, t = loc) {
  const who = target ? t('Chat.Target', { name: target }) : t('Chat.NoTarget');
  if (qs > 0) return `<strong>${t('Title')}</strong><br>${t('Chat.Success', { helper, skill, who, qs })}<br><small>${t('Chat.Manual')}</small>`;
  return `<strong>${t('Title')}</strong><br>${t('Chat.Failure', { helper, skill })}`;
}

let lastSkill = null;

/**
 * Suche im Talent-Dialog (Rückmeldung 2026-10-05): blendet nicht passende Talente und leere Gruppen aus und wählt den
 * ersten Treffer; ↑/↓ im Suchfeld wechseln den Treffer, Enter (Formular-Absenden) oder Doppelklick würfelt.
 */
export function attachSkillSearch(root) {
  const input = root?.querySelector('input[name="search"]');
  const select = root?.querySelector('select[name="skill"]');
  if (!input || !select) return;
  const visible = () => [...select.options].filter(option => !option.hidden);
  const filter = () => {
    const query = input.value.trim().toLowerCase();
    for (const option of select.options) option.hidden = !!query && !option.textContent.toLowerCase().includes(query);
    for (const group of select.querySelectorAll('optgroup')) group.hidden = ![...group.children].some(option => !option.hidden);
    if (select.selectedOptions[0]?.hidden || !select.selectedOptions.length) select.value = visible()[0]?.value ?? '';
  };
  input.addEventListener('input', filter);
  input.addEventListener('keydown', event => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const list = visible();
    const index = list.findIndex(option => option.selected);
    const next = list[Math.min(list.length - 1, Math.max(0, index + (event.key === 'ArrowDown' ? 1 : -1)))];
    if (next) { select.value = next.value; next.scrollIntoView({ block: 'nearest' }); }
  });
  // Doppelklick auf ein Talent würfelt direkt (wie „Probe würfeln“).
  select.addEventListener('dblclick', () => root.querySelector('[data-action="ok"]')?.click());
  filter();
  select.selectedOptions[0]?.scrollIntoView({ block: 'nearest' });
}

// Nächster Probendialog kommt aus dem Knopf „Helfen“: Schalter vorbelegen (sonst merkt sich das System die Auswahl
// je Talent, der Schalter startet aber immer aus).
let pendingHelp = false;

/** Talent wählen (Dialog), dann der Probendialog des Systems mit vorbelegtem Schalter „Als Hilfe würfeln“. */
export async function helpAction(actor, tokenId) {
  const groups = skillOptions(actor);
  if (!groups.length) return ui.notifications.warn(loc('NoSkills'));
  const esc = foundry.utils.escapeHTML;
  const target = game.user.targets.first();
  const options = groups.map(({ group, items }) => `<optgroup label="${esc(game.i18n.localize('SKILL.' + group))}">${items
    .map(item => `<option value="${item.id}"${item.id === lastSkill ? ' selected' : ''}>${esc(item.name)} (${item.system.talentValue?.value ?? 0})</option>`).join('')}</optgroup>`).join('');
  const content = `<p>${loc('Dialog.Intro')}</p>
    <div class="form-group"><label>${loc('Dialog.Search')}</label><input type="search" name="search" placeholder="${loc('Dialog.SearchPlaceholder')}" autocomplete="off" autofocus></div>
    <div class="form-group"><label>${loc('Dialog.Skill')}</label><select name="skill" size="10" class="dsa5h-help-skills">${options}</select></div>
    <p class="hint">${target ? loc('Dialog.Target', { name: esc(target.name) }) : loc('Dialog.NoTarget')}</p>`;
  const skillId = await foundry.applications.api.DialogV2.prompt({
    window: { title: loc('Title'), icon: 'fas fa-handshake-angle' },
    content,
    ok: { label: loc('Dialog.Roll'), icon: 'fas fa-dice-d20', callback: (_event, button) => button.form.elements.skill.value },
    rejectClose: false,
    render: (_event, dialog) => attachSkillSearch(dialog.element),
  });
  const skill = skillId && actor.items.get(skillId);
  if (!skill) return;
  lastSkill = skill.id;

  pendingHelp = true;
  const setup = await actor.setupSkill(skill, {}, tokenId);
  pendingHelp = false;
  if (!setup) return;
  setup.testData.opposable = false;
  await actor.basicTest(setup);
}

/** QS einer Probe aus den Daten der Chatnachricht (0 bei Misslingen). */
export function helpQS(postData) {
  return Number(postData?.successLevel) > 0 ? Number(postData.qualityStep ?? 0) : 0;
}

/** Schalter im Talent-Probendialog, Modifikator ±0 als Merker, Chatnachricht nach dem Wurf. */
export function initHelpAction(isActive) {
  Hooks.on('dsa5.prepareRollSituationalModifiers', (actor, modifiers, context) => {
    if (!isActive() || context?.source?.type !== 'skill' || !['character', 'npc'].includes(actor?.type)) return;
    modifiers.push({ name: loc('Title'), value: 0, selected: false, ref: { id: HELP_REF } });
  });

  Hooks.on('renderDSA5SkillDialog', (app, element, _context, options) => {
    if (!isActive()) return;
    const root = element instanceof HTMLElement ? element : element?.[0];
    const instance = root?.querySelector('select[name="situationalModifiers"]')?.parentElement?.__dsa5SituationalModifiersWidget;
    const help = () => instance?.modifiers.find(m => m.ref?.id === HELP_REF);
    if (!help() || root.querySelector('.dsa5h-help-toggle')) return;
    if (options?.isFirstRender !== false) help().selected = pendingHelp;
    pendingHelp = false;

    const group = document.createElement('div');
    group.className = 'form-group dsa5h-help-toggle';
    group.dataset.tooltip = 'DSA5HELPERS.HouseRules.helpAction.ToggleHint';
    group.innerHTML = '<label><i class="fas fa-handshake-angle" inert></i> <span></span></label><input type="checkbox">';
    group.querySelector('span').textContent = loc('Toggle');
    const box = group.querySelector('input');
    // Hilfe ist nie eine vergleichende Probe: „Vergleichend“ ausblenden, solange der Schalter an ist.
    const sync = () => {
      box.checked = !!help()?.selected;
      const opposed = root.querySelector('[data-action="rollButton"]');
      if (opposed) opposed.hidden = box.checked;
    };
    box.addEventListener('change', () => {
      const m = help();
      if (!m) return;
      m.selected = box.checked;
      instance.refresh();
      instance.dispatchChange();
    });
    (instance.closest('[data-situational-modifiers-group]') ?? root.querySelector('.form-group'))?.after(group);
    hideModifierRows(instance, m => m.ref?.id === HELP_REF, sync);
  });

  // Nach dem Wurf (nur beim Würfelnden): Hinweis mit den QS als Erleichterung, das markierte Token als Unterstützter.
  Hooks.on('createChatMessage', message => {
    if (!isActive() || message.author?.id !== game.user.id) return;
    const data = message.flags?.data;
    if (!data?.postData || !data.preData?.situationalModifiers?.some?.(m => m.ref?.id === HELP_REF && m.selected !== false)) return;
    const esc = foundry.utils.escapeHTML;
    const target = game.user.targets.first();
    const skill = data.preData.source?.name ?? '';
    ChatMessage.create({
      speaker: message.speaker,
      content: `<div class="dsa5h-help-action">${helpMessage({ helper: esc(message.speaker?.alias ?? ''), skill: esc(skill), target: target ? esc(target.name) : null, qs: helpQS(data.postData) })}</div>`,
    }).catch(error => console.error('dsa5-helpers | Helfen', error));
  });
}
