// Hausregel „Helfen“ (Nutzerwunsch 2026-10-05): Im Kampf nutzt ein Held seine Aktion für eine passende Talentprobe;
// die übrig behaltenen QS erleichtern die nächste Probe eines anderen. Beispiel: Einschüchtern, um den Gegner eines
// Mitstreiters auf sich zu lenken. Auslöser ist der Knopf „Helfen“ in den Schnellaktionen des Kampf-Reiters (nur bei
// aktiver Regel). Die Probe läuft über den normalen Probendialog des Systems; die Erleichterung trägt der Unterstützte
// bei seiner nächsten Probe selbst ein — das Modul setzt keinen Modifikator.
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

/** Talent wählen (Dialog), Probe über den Probendialog des Systems, danach Hinweis im Chat. */
export async function helpAction(actor, tokenId) {
  const groups = skillOptions(actor);
  if (!groups.length) return ui.notifications.warn(loc('NoSkills'));
  const esc = foundry.utils.escapeHTML;
  const target = game.user.targets.first();
  const options = groups.map(({ group, items }) => `<optgroup label="${esc(game.i18n.localize('SKILL.' + group))}">${items
    .map(item => `<option value="${item.id}"${item.id === lastSkill ? ' selected' : ''}>${esc(item.name)} (${item.system.talentValue?.value ?? 0})</option>`).join('')}</optgroup>`).join('');
  const content = `<p>${loc('Dialog.Intro')}</p>
    <div class="form-group"><label>${loc('Dialog.Skill')}</label><select name="skill" autofocus>${options}</select></div>
    <p class="hint">${target ? loc('Dialog.Target', { name: esc(target.name) }) : loc('Dialog.NoTarget')}</p>`;
  const skillId = await foundry.applications.api.DialogV2.prompt({
    window: { title: loc('Title'), icon: 'fas fa-handshake-angle' },
    content,
    ok: { label: loc('Dialog.Roll'), icon: 'fas fa-dice-d20', callback: (_event, button) => button.form.elements.skill.value },
    rejectClose: false,
  });
  const skill = skillId && actor.items.get(skillId);
  if (!skill) return;
  lastSkill = skill.id;

  const setup = await actor.setupSkill(skill, { subtitle: ` (${loc('Title')})` }, tokenId);
  if (!setup) return;
  setup.testData.opposable = false;
  const roll = await actor.basicTest(setup);
  const result = roll?.result;
  if (!result) return;
  const qs = result.successLevel > 0 ? Number(result.qualityStep ?? 0) : 0;
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<div class="dsa5h-help-action">${helpMessage({ helper: esc(actor.name), skill: esc(skill.name), target: target ? esc(target.name) : null, qs })}</div>`,
  });
}
