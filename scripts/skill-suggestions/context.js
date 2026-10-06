// Talent-Vorschläge: Eingaben für rankSuggestions() aus Akteur, Chat und Kampf zusammentragen (Nutzerwunsch
// 2026-10-06). Gespeichert wird je Held (Actor-Flags, siehe tracking.js), ausgewertet wird nur hier — keine
// Einstellung/Zustimmung nötig (Nutzer-Entscheidung 2026-10-06).
import { rankSuggestions } from './score.js';

const MODULE_ID = 'dsa5-helpers';
export const MENTION_WINDOW_MS = 10 * 60 * 1000;
const RECENT_MESSAGES = 50;

// Anzahl der Vorschläge je Benutzer (Nutzerwunsch 2026-10-06): 0 = aus, sonst 2–12 in Zweierschritten, Standard 6.
export const COUNT_SETTING = 'skillSuggestions';
export const COUNT_CHOICES = [0, 2, 4, 6, 8, 10, 12];

/** Anzahl laut Einstellung; ohne gültigen Wert (z. B. im Test-Harness) der Standard 6. */
export function suggestionCount() {
  const value = Number(game.settings.get(MODULE_ID, COUNT_SETTING));
  return COUNT_CHOICES.includes(value) ? value : 6;
}
// Groß-/Kleinschreibung egal: „@RQ[…]“ macht das System zwar nicht zum Knopf, gemeint ist trotzdem eine Anfrage.
const RQ_PATTERN = /@Rq\[([^\]]+)\]/gi;
const ENRICHED_PATTERN = /<a\b[^>]*class="[^"]*roll-button[^"]*request-roll[^"]*"[^>]*>/gi;
// Offene Anfragen: alles außer den Endzuständen des Systems (QueryOrchestrator.TERMINAL_STATES). Ist kein Spieler des
// Helden online, steht der Eintrag auf 'unowned' statt 'pending' — würfeln lässt er sich trotzdem.
const TERMINAL_STATES = new Set(['accepted', 'rejected', 'failed', 'skipped', 'success', 'critical', 'failure', 'botch', 'cancelled', 'error']);

// Talente über die sprachunabhängigen LocalizedIDs des Systems (wie actor-dsa5.js / trap_state.js).
const COMBAT_IDS = ['bodyControl', 'selfControl', 'featOfStrength', 'perception', 'intimidation'];
const CLASSIC_IDS = ['perception', 'empathy', 'selfControl', 'stealth', 'willpower'];
const localizedNames = ids => new Set(ids.map(id => game.i18n.localize('LocalizedIDs.' + id)));

/** Chat-Inhalt als Text: der Editor speichert HTML (Tags, &amp; in „Bekehren & Überzeugen“, &nbsp;). */
export function plainText(html) {
  return String(html ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;| /g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&amp;/g, '&');
}

/**
 * Inhalt eines @Rq-Links wie das System zerlegen (texteditor.js parseEnricherInner/parseSkillModSegment): Optionen
 * `options={…}` weg, die erste Zahl — mit oder ohne Vorzeichen — ist der Modifikator, der Rest der Talentname.
 * `Klettern -1` → { name: 'Klettern', modifier: -1 }, `Fliegen 2` → +2.
 */
export function parseRequestLink(inner) {
  const text = String(inner).replace(/options=\{[^}]*\}/, '').trim();
  const mod = text.match(/[-+]?\d+/);
  return { name: text.replace(/[-+]?\d+/, '').replace(/\s+/g, ' ').trim(), modifier: mod ? Number(mod[0]) : 0 };
}

/** Offene Probenanfragen der SL an diesen Helden (Chatkarten des RollRequestService) und @Rq-Links im Chat. */
export function chatRequests(actor, messages, now = Date.now()) {
  const requests = {};
  const mentions = {};
  for (const message of messages) {
    const state = message.flags?.dsa5?.rollRequest;
    if (state) {
      const recipient = state.recipients?.find(r => r.actorId === actor.id);
      if (state.category === 'skill' && !state.finalized && recipient && !TERMINAL_STATES.has(recipient.status)) {
        requests[state.name] = { messageId: message.id, modifier: Number(state.modifier) || 0 };
      }
      continue;
    }
    if (now - (message.timestamp ?? 0) > MENTION_WINDOW_MS) continue;
    for (const [, inner] of plainText(message.content).matchAll(RQ_PATTERN)) {
      const { name, modifier } = parseRequestLink(inner);
      mentions[name] = { modifier };
    }
    // Schon angereicherter Link (wie ihn texteditor.js aus @Rq baut), falls die Nachricht so gespeichert wurde.
    for (const [tag] of String(message.content ?? '').matchAll(ENRICHED_PATTERN)) {
      const name = tag.match(/data-name="([^"]*)"/)?.[1];
      if (name) mentions[plainText(name).trim()] = { modifier: Number(tag.match(/data-modifier="([^"]*)"/)?.[1]) || 0 };
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
 * @param {number} count       Anzahl laut Benutzer-Einstellung skillSuggestions
 */
export function buildSuggestions(actor, skills, favorites, previous, count) {
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
    count,
  });
  const byId = new Map(skills.map(item => [item._id ?? item.id, item]));
  return ranked.map(entry => ({ ...entry, item: byId.get(entry.id) })).filter(entry => entry.item);
}
