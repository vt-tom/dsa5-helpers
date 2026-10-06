// Talent-Vorschläge auf dem Titelblatt (Nutzerwunsch 2026-10-06): reine Bewertung ohne Foundry-Zugriff, damit sie
// sich im Test-Harness prüfen lässt. Die Eingaben sammelt context.js, das Zählen der Nutzung tracking.js.
//
// Jedes Talent bekommt eine Punktzahl aus mehreren Teilen (alle grob 0–1, dann gewichtet). Offene Probenanfragen
// der SL stehen immer vorn. Gewichte sind Startwerte — nach den ersten Spielabenden nachschärfen.

export const SUGGESTION_COUNT = 6;
export const USAGE_HALF_LIFE_DAYS = 14;
export const ADVANCED_HALF_LIFE_DAYS = 7;
const DAY = 24 * 60 * 60 * 1000;

export const WEIGHTS = {
  mention: 3,      // @Rq-Link im Chat der letzten Minuten (keine offene Anfrage an diesen Helden)
  usage: 4,        // selbst gewürfelt, mit Abklingen
  chance: 2,       // Erfolgswahrscheinlichkeit der 3W20-Probe
  value: 1,        // FW/20 — trennt Talente mit ähnlicher Chance
  specialist: 1.5, // höchster FW unter den Spielerhelden
  combat: 2,       // kampfnahes Talent, während der Held im Kampf ist
  advanced: 1.5,   // kürzlich gesteigert, mit Abklingen
  classic: 0.75,   // kommt in fast jeder Runde vor
  sticky: 0.5,     // stand schon in der Liste — verhindert ständiges Springen
};

// Reihenfolge = Vorrang beim Grund-Hinweis, wenn mehrere Teile ähnlich viel beitragen.
const REASONS = ['mention', 'usage', 'specialist', 'combat', 'advanced', 'chance', 'classic'];

/** Abklingender Zähler: Wert halbiert sich je Halbwertszeit. */
export function decay(value, since, now, halfLifeDays) {
  if (!value || !Number.isFinite(since)) return 0;
  return value * Math.pow(0.5, Math.max(0, now - since) / (halfLifeDays * DAY));
}

/** Zähler um 1 erhöhen, vorher auf jetzt abklingen lassen (Speicherformat {s, t}). */
export function bumpUsage(entry, now) {
  return { s: decay(entry?.s ?? 0, entry?.t, now, USAGE_HALF_LIFE_DAYS) + 1, t: now };
}

const chanceCache = new Map();

/**
 * Erfolgswahrscheinlichkeit einer DSA5-Fertigkeitsprobe (3W20 gegen drei Eigenschaften, Überschuss wird vom FW
 * bezahlt). Zwei oder drei Einsen gelingen immer, zwei oder drei Zwanzigen misslingen immer. Exakt über alle
 * 8000 Würfe, je Kombination zwischengespeichert.
 */
export function successChance(attributes, fw, modifier = 0) {
  const [a, b, c] = attributes.map(v => (Number(v) || 0) + modifier);
  const value = Math.max(0, Number(fw) || 0);
  const key = `${a}|${b}|${c}|${value}`;
  if (chanceCache.has(key)) return chanceCache.get(key);
  let hits = 0;
  for (let x = 1; x <= 20; x++) for (let y = 1; y <= 20; y++) for (let z = 1; z <= 20; z++) {
    const ones = (x === 1) + (y === 1) + (z === 1);
    const twenties = (x === 20) + (y === 20) + (z === 20);
    if (twenties >= 2) continue;
    if (ones >= 2 || Math.max(0, x - a) + Math.max(0, y - b) + Math.max(0, z - c) <= value) hits++;
  }
  const chance = hits / 8000;
  chanceCache.set(key, chance);
  return chance;
}

/**
 * @param {object} input
 * @param {{id, name, fw, attributes:number[]}[]} input.skills   Talente des Helden
 * @param {Object<string,{messageId, modifier}>} input.requests  offene Anfragen an diesen Helden, je Talentname
 * @param {Object<string,{modifier}>} input.mentions             @Rq-Links der letzten Minuten, je Talentname
 * @param {Object<string,{s,t}>} input.usage                     Nutzungszähler je Talentname
 * @param {Object<string,number>} input.advanced                 Zeitpunkt der letzten Steigerung je Talentname
 * @param {Object<string,number>} input.othersBest               höchster FW der übrigen Spielerhelden je Talentname
 * @param {Set<string>} input.combatSkills / input.classicSkills Talentnamen
 * @param {boolean} input.inCombat
 * @param {Set<string>} input.favorites                          Item-IDs, die schon als Favorit oben stehen
 * @param {string[]} input.previous                              Item-IDs der letzten Liste
 * @returns {{id, name, reason, modifier?, messageId?}[]}
 */
export function rankSuggestions(input) {
  const { skills, now = Date.now(), count = SUGGESTION_COUNT } = input;
  const requests = input.requests ?? {};
  const mentions = input.mentions ?? {};
  const usage = input.usage ?? {};
  const advanced = input.advanced ?? {};
  const othersBest = input.othersBest ?? {};
  const favorites = input.favorites ?? new Set();
  const previous = new Set(input.previous ?? []);

  const requested = skills.filter(skill => requests[skill.name])
    .map(skill => ({ id: skill.id, name: skill.name, reason: 'requested', ...requests[skill.name] }));

  const scored = [];
  for (const skill of skills) {
    if (requests[skill.name] || favorites.has(skill.id)) continue;
    const used = decay(usage[skill.name]?.s, usage[skill.name]?.t, now, USAGE_HALF_LIFE_DAYS);
    const mentioned = !!mentions[skill.name];
    // FW 0 nur, wenn das Talent wirklich gebraucht wurde — sonst stünden lauter ungelernte Talente mit guter Chance da.
    if (skill.fw <= 0 && !mentioned && used < 0.5) continue;
    const parts = {
      mention: mentioned ? WEIGHTS.mention : 0,
      usage: WEIGHTS.usage * (used / (used + 3)),
      chance: WEIGHTS.chance * successChance(skill.attributes, skill.fw, mentions[skill.name]?.modifier ?? 0),
      specialist: skill.fw >= 4 && othersBest[skill.name] !== undefined && skill.fw > othersBest[skill.name] ? WEIGHTS.specialist : 0,
      combat: input.inCombat && input.combatSkills?.has(skill.name) ? WEIGHTS.combat : 0,
      advanced: WEIGHTS.advanced * Math.min(1, decay(1, advanced[skill.name], now, ADVANCED_HALF_LIFE_DAYS)),
      classic: input.classicSkills?.has(skill.name) ? WEIGHTS.classic : 0,
    };
    const score = Object.values(parts).reduce((sum, v) => sum + v, 0)
      + WEIGHTS.value * Math.min(1, skill.fw / 20)
      + (previous.has(skill.id) ? WEIGHTS.sticky : 0);
    // Grund = größter Beitrag; die Chance gewinnt nur, wenn sonst nichts Nennenswertes dazukommt.
    const top = REASONS.filter(r => r !== 'chance' && parts[r] >= 0.75).sort((x, y) => parts[y] - parts[x])[0];
    scored.push({ id: skill.id, name: skill.name, score, reason: top ?? 'chance', ...(mentioned ? { modifier: mentions[skill.name].modifier } : {}) });
  }
  scored.sort((x, y) => y.score - x.score || x.name.localeCompare(y.name));
  return [...requested, ...scored].slice(0, Math.max(count, requested.length)).map(({ score, ...entry }) => entry);
}
