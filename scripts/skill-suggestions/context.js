// Talent-Vorschläge: Eingaben für rankSuggestions() aus Akteur, Chat und Kampf zusammentragen (Nutzerwunsch
// 2026-10-06). Gespeichert wird je Held (Actor-Flags, siehe tracking.js), ausgewertet wird nur hier — keine
// Einstellung/Zustimmung nötig (Nutzer-Entscheidung 2026-10-06).
import { rankSuggestions } from './score.js';

const MODULE_ID = 'dsa5-helpers';
export const MENTION_WINDOW_MS = 10 * 60 * 1000;
const RECENT_MESSAGES = 50;
const RQ_PATTERN = /@Rq\[([^\]]+)\]/g;

// Talente über die sprachunabhängigen LocalizedIDs des Systems (wie actor-dsa5.js / trap_state.js).
const COMBAT_IDS = ['bodyControl', 'selfControl', 'featOfStrength', 'perception', 'intimidation'];
const CLASSIC_IDS = ['perception', 'empathy', 'selfControl', 'stealth', 'willpower'];
const localizedNames = ids => new Set(ids.map(id => game.i18n.localize('LocalizedIDs.' + id)));

/** `Klettern -1` → { name: 'Klettern', modifier: -1 } (Inhalt eines @Rq-Links, Erleichterung/Erschwernis am Ende). */
export function parseRequestLink(inner) {
  const match = String(inner).trim().match(/^(.*?)(?:\s+([+-]\d+))?$/);
  return { name: match[1].trim(), modifier: Number(match[2] ?? 0) };
}

/** Offene Probenanfragen der SL an diesen Helden (Chatkarten des RollRequestService) und @Rq-Links im Chat. */
export function chatRequests(actor, messages, now = Date.now()) {
  const requests = {};
  const mentions = {};
  for (const message of messages) {
    const state = message.flags?.dsa5?.rollRequest;
    if (state) {
      const recipient = state.recipients?.find(r => r.actorId === actor.id);
      if (state.category === 'skill' && !state.finalized && recipient?.status === 'pending') {
        requests[state.name] = { messageId: message.id, modifier: Number(state.modifier) || 0 };
      }
      continue;
    }
    if (now - (message.timestamp ?? 0) > MENTION_WINDOW_MS) continue;
    for (const [, inner] of String(message.content ?? '').matchAll(RQ_PATTERN)) {
      const { name, modifier } = parseRequestLink(inner);
      mentions[name] = { modifier };
    }
  }
  return { requests, mentions };
}

/** Höchster FW je Talent unter den übrigen Spielerhelden (für „Spezialist der Gruppe“). */
function othersBest(actor) {
  const best = {};
  for (const other of game.actors ?? []) {
    if (other.id === actor.id || other.type !== 'character' || !other.hasPlayerOwner) continue;
    for (const item of other.items) {
      if (item.type !== 'skill') continue;
      const fw = Number(item.system.talentValue?.value) || 0;
      best[item.name] = Math.max(best[item.name] ?? -Infinity, fw);
    }
  }
  return best;
}

function inCombat(actor) {
  return !!game.combats?.some(combat => combat.started && combat.combatants.some(c => c.actorId === actor.id || c.actor?.id === actor.id));
}

/**
 * @param {Actor} actor
 * @param {object[]} skills   Talent-Items, wie der Bogen sie anzeigt (prepare.allSkillsLeft/Right)
 * @param {Object<string,boolean>} favorites  Item-IDs der Favoriten
 * @param {string[]} previous  Item-IDs der letzten Liste
 */
export function buildSuggestions(actor, skills, favorites, previous) {
  const characteristics = actor.system.characteristics ?? {};
  const messages = (game.messages?.contents ?? []).slice(-RECENT_MESSAGES);
  const { requests, mentions } = chatRequests(actor, messages);
  const ranked = rankSuggestions({
    skills: skills.map(item => ({
      id: item._id ?? item.id,
      name: item.name,
      fw: Number(item.system.talentValue?.value) || 0,
      attributes: [1, 2, 3].map(n => characteristics[item.system['characteristic' + n]?.value]?.value ?? 0),
    })),
    requests,
    mentions,
    usage: actor.getFlag?.(MODULE_ID, 'skillUsage') ?? {},
    advanced: actor.getFlag?.(MODULE_ID, 'skillAdvanced') ?? {},
    othersBest: othersBest(actor),
    inCombat: inCombat(actor),
    combatSkills: localizedNames(COMBAT_IDS),
    classicSkills: localizedNames(CLASSIC_IDS),
    favorites: new Set(Object.keys(favorites ?? {})),
    previous,
  });
  const byId = new Map(skills.map(item => [item._id ?? item.id, item]));
  return ranked.map(entry => ({ ...entry, item: byId.get(entry.id) })).filter(entry => entry.item);
}
