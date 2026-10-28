// Talent-Vorschläge: Nutzung und Steigerungen je Held mitzählen, offene Bögen bei neuen Probenanfragen neu zeichnen
// (Nutzerwunsch 2026-10-06). Gespeichert als Actor-Flags:
//   skillUsage    {Talentname: {s: Zähler mit Abklingen, t: Zeitpunkt}} — keine einzelnen Würfe
//   skillAdvanced {Talentname: Zeitpunkt der letzten Steigerung}
// Schreibt nur der Client, der gewürfelt bzw. gesteigert hat, und nur mit Besitzrecht am Helden.
import { bumpUsage } from './score.js';
import { COUNT_SETTING, COUNT_CHOICES, COLLAPSED_SETTING } from './context.js';

const MODULE_ID = 'dsa5-helpers';

function isHelperSheet(app) {
  return app.options?.classes?.includes('dsa5-helpers-sheet') && !app.options.classes.includes('dsa5h-sheet-preview')
    && app.document?.type === 'character' && app.rendered;
}

// Neue/geänderte Anfragen kommen per Chat — betroffene Heldenbögen neu zeichnen, damit sie oben erscheinen bzw.
// nach dem Würfeln verschwinden. Gebündelt, weil eine Anfrage mehrere Nachrichten-Updates nacheinander auslöst.
const pending = new Set();
const flush = foundry.utils.debounce(() => {
  for (const app of foundry.applications.instances.values()) {
    if (isHelperSheet(app) && (pending.has('*') || pending.has(app.document.id))) app.render();
  }
  pending.clear();
}, 250);

function onRequestMessage(message) {
  const state = message.flags?.dsa5?.rollRequest;
  if (state?.category === 'skill') (state.recipients ?? []).forEach(r => pending.add(r.actorId));
  else if (/@Rq\[|request-roll/i.test(message.content ?? '')) pending.add('*');
  else return;
  flush();
}

async function onRollMessage(message) {
  if (message.author?.id !== game.user.id) return;
  const source = message.flags?.data?.preData?.source;
  if (source?.type !== 'skill' || !source.name) return;
  const actor = ChatMessage.getSpeakerActor(message.speaker);
  if (actor?.type !== 'character' || !actor.isOwner) return;
  // Schicksalspunkt-Neuwürfe aktualisieren die bestehende Nachricht (dice-dsa5.js renderRollCard) — zählen nicht doppelt.
  const usage = actor.getFlag(MODULE_ID, 'skillUsage') ?? {};
  await actor.setFlag(MODULE_ID, 'skillUsage', { ...usage, [source.name]: bumpUsage(usage[source.name], Date.now()) });
}

function onPreUpdateSkill(item, changes, _options, userId) {
  if (userId !== game.user.id || item.type !== 'skill' || item.parent?.type !== 'character') return;
  const next = foundry.utils.getProperty(changes, 'system.talentValue.value');
  if (next === undefined || Number(next) <= (Number(item.system.talentValue?.value) || 0)) return;
  const actor = item.parent;
  if (!actor.isOwner) return;
  const advanced = actor.getFlag(MODULE_ID, 'skillAdvanced') ?? {};
  actor.setFlag(MODULE_ID, 'skillAdvanced', { ...advanced, [item.name]: Date.now() });
}

export function initSkillSuggestions() {
  game.settings.register(MODULE_ID, COUNT_SETTING, {
    name: 'DSA5HELPERS.Settings.SkillSuggestions.Name',
    hint: 'DSA5HELPERS.Settings.SkillSuggestions.Hint',
    scope: 'client',
    config: true,
    type: Number,
    default: 6,
    choices: Object.fromEntries(COUNT_CHOICES.map(n => [n, n ? String(n) : 'DSA5HELPERS.Settings.SkillSuggestions.Off'])),
    onChange: () => { pending.add('*'); flush(); },
  });
  game.settings.register(MODULE_ID, COLLAPSED_SETTING, { scope: 'client', config: false, type: Boolean, default: false });
  Hooks.on('createChatMessage', message => {
    onRequestMessage(message);
    onRollMessage(message);
  });
  Hooks.on('updateChatMessage', onRequestMessage);
  Hooks.on('deleteChatMessage', onRequestMessage);
  Hooks.on('preUpdateItem', onPreUpdateSkill);
}
