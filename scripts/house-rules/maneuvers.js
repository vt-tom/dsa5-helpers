// Hausregel „Grundmanöver“ von Paladose („Möglichkeiten des Kampfes“, Issue #45, Stufe 1 + 2; Stufe 3 in #48).
// Jeder Held darf einige Grundmanöver einsetzen; wie stark sie wirken, hängt von einer Leiteigenschaft ab (Stufen bis
// 12 / 13 / 15 / 17). Die Manöver erscheinen als auswählbare situative Modifikatoren im Probendialog des Systems
// (Hook dsa5.prepareRollSituationalModifiers) und wirken damit in jedem Bogen. Eigene Rechenlogik für Kampfproben
// gibt es nicht: AT/PA/AW über `value`, Schaden über `damageBonus`, Paradeabzug des Gegners über `dmmalus` (so rechnet
// das System auch die Finte). Zustände über die Probe hinaus (Vorstoß-Malus bis Rundenende, Verteidigungshaltung,
// Zielen, Schwachpunkte je Gegner) liegen als Actor-Flags vor und werden vom Hook wieder eingesetzt.
// Stufe 3 (#48): Schwachpunkte erkennen (Probe → QS auf PA/TP gegen einen Gegner, „Mitteilen“), gleichwertige SF im
// Probendialog ausblenden. Die Folgen gezielter Treffer stehen in hit-consequences.js.
const MODULE_ID = 'dsa5-helpers';
export const RULE_ID = 'maneuvers';
export const SETTING = 'maneuvers';
const PREFIX = 'DSA5HELPERS.HouseRules.maneuvers.';
const REF = 'dsa5h:';

/** Stufe 0–3 zur Leiteigenschaft: bis 12 / 13 / 15 / 17 (14 zählt wie 13, 16 wie 15). */
export function paladoseTier(value) {
  const v = Number(value) || 0;
  return v >= 17 ? 3 : v >= 15 ? 2 : v >= 13 ? 1 : 0;
}

// Kampftechniken als englischer Schlüssel (LocalizedCTs übersetzt den deutschen Namen, der englische bleibt gleich).
const MELEE_RANGED = new Set(['Bows', 'Crossbows', 'Blowpipes', 'Discuses', 'Slingshots', 'Throwing Weapons']);

/** Die Manöver dieser Stufe (Tabellen aus Paladoses Text). */
export const MANEUVERS = {
  feint: { attr: 'ge', icon: 'fas fa-masks-theater', max: [2, 4, 6, 8], techniques: ['Daggers', 'Fencing Weapons', 'Impact Weapons', 'Swords', 'Polearms', 'Brawling'] },
  targeted: { attr: 'in', icon: 'fas fa-crosshairs', reduce: [0, 1, 2, 3] },
  mighty: { attr: 'kk', icon: 'fas fa-hammer', max: [2, 4, 6, 8], excluded: ['Fans', 'Fencing Weapons', 'Lances', 'Whips'] },
  advance: { attr: 'mu', icon: 'fas fa-person-running', table: [[2, -4], [2, -2], [4, -2], [4, 0]], techniques: ['Daggers', 'Fans', 'Fencing Weapons', 'Impact Weapons', 'Chain Weapons', 'Swords', 'Pikes', 'Polearms', 'Two-Handed Impact Weapons', 'Two-Handed Swords', 'Brawling'] },
  stance: { attr: 'in', icon: 'fas fa-shield-halved', bonus: [2, 4, 6, 8], excluded: ['Chain Weapons', 'Lances', 'Whips'] },
  aim: { attr: 'ff', icon: 'fas fa-bullseye', table: [[1, 1, 2], [2, 1, 2], [2, 2, 3], [3, 2, 3]] },
  // Keine Leiteigenschaft: die QS einer Probe entscheiden (#48).
  weakness: { attr: null, icon: 'fas fa-magnifying-glass' },
};
export const MANEUVER_IDS = Object.keys(MANEUVERS);

/** Malus je Trefferzone (Gezielter Angriff/Schuss). */
export const ZONES = { head: -10, torso: -4, arm: -8, leg: -8, eye: -16, foot: -12, neck: -14, hand: -12 };

/** Malus einer Zone: erst halbiert die SF „Gezielter Angriff“, dann zieht die IN-Verbesserung ab, mindestens −1. */
export function targetedMalus(zoneMalus, tier, hasSF) {
  const halved = hasSF ? Math.trunc(zoneMalus / 2) : zoneMalus;
  return Math.min(-1, halved + MANEUVERS.targeted.reduce[tier]);
}

const loc = (key, data) => data ? game.i18n.format(PREFIX + key, data) : game.i18n.localize(PREFIX + key);
const attrAbbr = attr => game.i18n.localize(`CHARAbbrev.${attr.toUpperCase()}`);
const attrValue = (actor, attr) => Number(actor?.system?.characteristics?.[attr]?.value) || 0;
const signed = n => (n > 0 ? `+${n}` : `${n}`);
// TP heißen in englischen Welten DP (Abkürzung des Systems).
const dmgAbbr = () => game.i18n.localize('CHARAbbrev.damage');

// Deutsche Namen der Kampftechniken (wie LocalizedCTs im deutschen System): Waffen aus deutschen Kompendien tragen den
// deutschen Namen auch in einer englischen Welt, die englische Übersetzung kennt dann nur die englischen Schlüssel.
const TECHNIQUES_DE = {
  Armbrüste: 'Crossbows', Blasrohre: 'Blowpipes', Bögen: 'Bows', Diskusse: 'Discuses', Dolche: 'Daggers', Fechtwaffen: 'Fencing Weapons',
  Fächer: 'Fans', Hiebwaffen: 'Impact Weapons', Kettenwaffen: 'Chain Weapons', Lanzen: 'Lances', Peitschen: 'Whips', Raufen: 'Brawling',
  Schilde: 'Shields', Schleudern: 'Slingshots', Schwerter: 'Swords', Spießwaffen: 'Pikes', Stangenwaffen: 'Polearms', Wurfwaffen: 'Throwing Weapons',
  Zweihandhiebwaffen: 'Two-Handed Impact Weapons', Zweihandschwerter: 'Two-Handed Swords',
};

/** Englischer Schlüssel der Kampftechnik einer Waffe ('' ohne Technik). */
export function techniqueKey(source, localize = key => game.i18n.localize(key)) {
  const name = String(source?.system?.combatskill?.value ?? '').trim();
  if (!name) return '';
  if (TECHNIQUES_DE[name]) return TECHNIQUES_DE[name];
  const translated = localize(`LocalizedCTs.${name}`);
  return translated.startsWith('LocalizedCTs.') ? name : translated;
}

/** Art der Probe: 'melee' | 'ranged' | 'dodge' | null, dazu Angriff oder Verteidigung. */
export function rollKind(context) {
  const source = context?.source;
  const type = source?.type;
  if (type === 'dodge') return { kind: 'dodge', defense: true };
  const trait = source?.system?.traitType?.value;
  if (type === 'rangeweapon' || (type === 'trait' && trait === 'rangeAttack')) return { kind: 'ranged', defense: false };
  if (type === 'meleeweapon' || (type === 'trait' && trait === 'meleeAttack')) return { kind: 'melee', defense: context.mode === 'parry', trait: type === 'trait' };
  return { kind: null, defense: false };
}

/** Darf das Manöver mit dieser Waffe/Probe gewählt werden? */
export function allowed(id, context, localize) {
  const { kind, defense, trait } = rollKind(context);
  const tech = techniqueKey(context?.source, localize);
  const m = MANEUVERS[id];
  switch (id) {
    case 'feint':
    case 'advance':
      return kind === 'melee' && !defense && !trait && m.techniques.includes(tech);
    case 'mighty':
      return kind === 'melee' && !defense && !trait && !MELEE_RANGED.has(tech) && !m.excluded.includes(tech);
    case 'targeted':
      return (kind === 'melee' && !defense) || kind === 'ranged';
    case 'stance':
      return kind === 'dodge' || (kind === 'melee' && defense && !trait && !m.excluded.includes(tech));
    case 'aim':
      return kind === 'ranged';
    case 'weakness':
      // TP-Bonus bei jedem Angriff, PA-Bonus nur bei der Parade (der Regeltext nennt kein Ausweichen).
      return kind === 'melee' || kind === 'ranged';
    default:
      return false;
  }
}

/** Welche Manöver hat die SL eingeschaltet? (Ohne Eintrag gilt ein Manöver als an.) */
export function enabledManeuvers(get = () => game.settings.get(MODULE_ID, SETTING)) {
  let stored = {};
  try { stored = get() ?? {}; } catch { /* Einstellung noch nicht registriert */ }
  return MANEUVER_IDS.filter(id => stored[id] !== false);
}

const combatKey = () => (game.combat?.started ? { combat: game.combat.id, round: game.combat.round } : null);
const state = actor => actor?.getFlag?.(MODULE_ID, 'maneuvers') ?? {};

/**
 * Gilt eine Erkenntnis aus „Schwachpunkte erkennen“ noch? Bis Kampfende; nach dem Mitteilen für alle (auch den
 * Erkennenden) nur noch bis zum Ende der nächsten Kampfrunde (Nutzer 2026-10-21: „für alle nur noch 1 Runde“).
 */
export function weakPointValid(entry, current) {
  if (!entry || !current || entry.combat !== current.combat) return false;
  return entry.sharedRound == null || current.round <= entry.sharedRound + 1;
}

/** Stand für Bogen und Hook: Vorstoß-Malus dieser Runde, Verteidigungshaltung, Zielen, Schwachpunkte je Gegner. */
export function maneuverState(actor, current = combatKey()) {
  const s = state(actor);
  const sameCombat = entry => !!entry && !!current && entry.combat === current.combat;
  return {
    advanceMalus: sameCombat(s.advance) && s.advance.round === current.round ? Number(s.advance.malus) || 0 : 0,
    stance: !!s.stance && (!s.stance.combat || sameCombat(s.stance)),
    aim: sameCombat(s.aim) ? Number(s.aim.count) || 0 : 0,
    aimRound: sameCombat(s.aim) ? s.aim.round : null,
    weakness: Object.entries(s.weakness ?? {}).filter(([, e]) => weakPointValid(e, current)).map(([token, e]) => ({ token, ...e })),
  };
}

/**
 * Bonus aus „Schwachpunkte erkennen“ gegen einen Gegner (Token-ID): die eigene Erkenntnis, sonst die beste, die ein
 * Verbündeter mitgeteilt hat. `allies` sind die Akteure der Verbündeten im Kampf.
 */
export function weakPointBonus(actor, foe, current = combatKey(), allies = []) {
  if (!foe || !current) return null;
  const own = state(actor).weakness?.[foe];
  if (weakPointValid(own, current)) return { name: own.name, pa: Number(own.pa) || 0, tp: Number(own.tp) || 0 };
  let best = null;
  for (const ally of allies) {
    const e = state(ally).weakness?.[foe];
    if (e?.sharedRound == null || !weakPointValid(e, current)) continue;
    const pa = Number(e.pa) || 0;
    const tp = Number(e.tp) || 0;
    if (!best || pa + tp > best.pa + best.tp) best = { name: e.name, pa, tp, from: ally.name };
  }
  return best;
}

/** Verbündete im laufenden Kampf: Kämpfer mit derselben Token-Gesinnung wie der Held, ohne ihn selbst. */
function allyActors(actor) {
  const combat = game.combat;
  if (!combat?.started) return [];
  const mine = actor.token?.disposition ?? actor.getActiveTokens?.()[0]?.document?.disposition ?? actor.prototypeToken?.disposition;
  return combat.combatants.filter(c => c.actor && c.actor.uuid !== actor.uuid && c.token?.disposition === mine).map(c => c.actor);
}

/** Token-ID des Gegners der Probe: beim Angriff das markierte Ziel, bei der Verteidigung der Angreifer. */
function foeTokenId(actor, context) {
  const { kind, defense } = rollKind(context);
  if (!kind) return null;
  if (defense) return game.messages.get(actor.flags?.oppose?.messageId)?.speaker?.token ?? null;
  return game.user.targets.first()?.id ?? null;
}

const hasTargetedSF = actor => (actor?.items ?? []).some?.(i => i.type === 'specialability' && /^(gezielter angriff|targeted attack)/i.test(i.name ?? ''));

/**
 * Modifikatoren für den Probendialog. Reine Funktion bis auf die Lokalisierung (Test-Harness).
 * Stufen-Einträge eines Manövers haben dieselbe ref-Gruppe (dsa5h:<id>:…), nur einer davon ist anhakbar.
 * `weak` ist der Bonus aus „Schwachpunkte erkennen“ gegen den Gegner dieser Probe (weakPointBonus) oder null.
 */
export function buildModifiers(actor, context, { enabled = enabledManeuvers(), st = maneuverState(actor), weak = null, t = loc, localize } = {}) {
  const out = [];
  const tierOf = id => paladoseTier(attrValue(actor, MANEUVERS[id].attr));
  const label = (id, extra) => `${t(`${id}.Name`)} (${attrAbbr(MANEUVERS[id].attr)} ${attrValue(actor, MANEUVERS[id].attr)})${extra ? `: ${extra}` : ''}`;
  const on = id => enabled.includes(id) && allowed(id, context, localize);
  const at = rollKind(context).kind === 'ranged' ? game.i18n.localize('CHARAbbrev.FK') : game.i18n.localize('CHARAbbrev.AT');

  if (on('feint')) {
    const max = MANEUVERS.feint.max[tierOf('feint')];
    for (let x = 1; x <= max; x++) out.push({ name: label('feint', `${at} −${x}, ${t('feint.Defense', { x })}`), value: -x, dmmalus: -x, selected: false, ref: { id: `${REF}feint:${x}` } });
  }
  if (on('mighty')) {
    const max = MANEUVERS.mighty.max[tierOf('mighty')];
    for (let x = 1; x <= max; x++) out.push({ name: label('mighty', `${at} −${x}, ${dmgAbbr()} +${x}`), value: -x, damageBonus: x, selected: false, ref: { id: `${REF}mighty:${x}` } });
  }
  if (on('advance')) {
    const [bonus, malus] = MANEUVERS.advance.table[tierOf('advance')];
    out.push({ name: label('advance', `${at} +${bonus}${malus ? `, ${t('advance.Later', { malus: signed(malus) })}` : ''}`), value: bonus, selected: false, ref: { id: `${REF}advance:${malus}` } });
  }
  if (on('targeted')) {
    const tier = tierOf('targeted');
    const sf = hasTargetedSF(actor);
    for (const [zone, malus] of Object.entries(ZONES)) {
      const v = targetedMalus(malus, tier, sf);
      out.push({ name: label('targeted', `${t(`targeted.Zone.${zone}`)} ${at} ${signed(v)}`), value: v, selected: false, ref: { id: `${REF}targeted:${zone}` } });
    }
  }
  if (on('aim') && st.aim > 0) {
    const [fk, tp, rounds] = MANEUVERS.aim.table[tierOf('aim')];
    const n = Math.min(st.aim, rounds);
    out.push({ name: label('aim', `${t('aim.Rounds', { n })}: ${at} +${fk * n}, ${dmgAbbr()} +${tp * n}`), value: fk * n, damageBonus: tp * n, selected: true, ref: { id: `${REF}aim:${n}` } });
  }
  // Verteidigung: Vorstoß-Malus dieser Runde und Verteidigungshaltung, beide angehakt.
  const { defense } = rollKind(context);
  if (defense && enabled.includes('advance') && st.advanceMalus) {
    out.push({ name: `${t('advance.Name')}: ${t('advance.MalusActive')}`, value: st.advanceMalus, selected: true, ref: { id: `${REF}advanceMalus` } });
  }
  if (on('stance') && st.stance) {
    const bonus = MANEUVERS.stance.bonus[tierOf('stance')];
    out.push({ name: label('stance', `+${bonus}`), value: bonus, selected: true, ref: { id: `${REF}stance` } });
  }
  // Schwachpunkte erkennen: gegen diesen Gegner angehakt (Nutzer 2026-10-21), TP beim Angriff, PA bei der Parade.
  if (on('weakness') && weak) {
    const title = `${t('weakness.Name')} (${weak.name})`;
    if (!defense && weak.tp > 0) out.push({ name: `${title}: ${dmgAbbr()} +${weak.tp}`, value: 0, damageBonus: weak.tp, selected: true, ref: { id: `${REF}weakness` } });
    if (defense && rollKind(context).kind === 'melee' && weak.pa > 0) out.push({ name: `${title}: ${game.i18n.localize('CHARAbbrev.PA')} +${weak.pa}`, value: weak.pa, selected: true, ref: { id: `${REF}weakness` } });
  }
  return out;
}

/** Sonderfertigkeiten des Systems, die ein Grundmanöver ersetzt (Nachtrag Paladose, #48), nach Namen deutsch/englisch. */
export const REPLACED_SF = {
  feint: /^(finte|feint)\b/i,
  mighty: /^(wuchtschlag|forceful blow)\b/i,
  advance: /^vorstoß(?![\p{L}])/iu,
  stance: /^(verteidigungshaltung|defensive posture)\b/i,
};

/** Welches eingeschaltete Grundmanöver ersetzt diese SF? null, wenn keins. */
export function replacedBy(name, enabled = enabledManeuvers()) {
  const text = String(name ?? '').trim();
  return Object.keys(REPLACED_SF).find(id => enabled.includes(id) && REPLACED_SF[id].test(text)) ?? null;
}

/** Gruppe eines Modifikators (feint, mighty, …) für „nur ein Stufen-Eintrag“; null bei fremden. */
export function maneuverGroup(refId) {
  const m = String(refId ?? '').match(/^dsa5h:([a-z]+)(?::|$)/i);
  return m ? m[1] : null;
}

const isActor = actor => ['character', 'npc'].includes(actor?.type);

// Nach dem Wurf (Chatnachricht des Würfelnden): Vorstoß-Malus bis Rundenende merken, Zielen-Zähler zurücksetzen.
async function onChatMessage(message, isActive) {
  if (!isActive() || message.author?.id !== game.user.id) return;
  const pre = message.flags?.data?.preData;
  const mods = pre?.situationalModifiers;
  if (!Array.isArray(mods)) return;
  const speaker = pre.extra?.speaker;
  const actor = speaker?.token ? game.scenes.get(speaker.scene)?.tokens.get(speaker.token)?.actor : game.actors.get(speaker?.actor);
  if (!actor?.isOwner) return;
  const picked = mods.filter(m => m.selected !== false && String(m.ref?.id ?? '').startsWith(REF)).map(m => m.ref.id);
  const update = {};
  const advance = picked.find(id => maneuverGroup(id) === 'advance');
  const current = combatKey();
  if (advance && current) {
    const malus = Number(advance.split(':')[2]) || 0;
    if (malus) update.advance = { ...current, malus };
  }
  if (picked.some(id => maneuverGroup(id) === 'aim')) update.aim = null;
  if (Object.keys(update).length) await actor.setFlag(MODULE_ID, 'maneuvers', { ...state(actor), ...update });
}

/** Verteidigungshaltung an/aus (gilt bis zum Ende des Kampfes bzw. bis sie abgeschaltet wird). */
export async function toggleStance(actor) {
  const s = state(actor);
  const current = combatKey();
  await actor.setFlag(MODULE_ID, 'maneuvers', { ...s, stance: maneuverState(actor).stance ? null : { combat: current?.combat ?? null } });
}

/** Zielen: eine Runde mehr (höchstens einmal je Kampfrunde, höchstens so viele Runden wie die Stufe erlaubt). */
export async function aimRound(actor) {
  const current = combatKey();
  if (!current) return ui.notifications.info(loc('aim.NoCombat'));
  const st = maneuverState(actor, current);
  const max = MANEUVERS.aim.table[paladoseTier(attrValue(actor, 'ff'))][2];
  if (st.aimRound === current.round) return ui.notifications.info(loc('aim.OncePerRound'));
  if (st.aim >= max) return ui.notifications.info(loc('aim.Max', { max }));
  await actor.setFlag(MODULE_ID, 'maneuvers', { ...state(actor), aim: { ...current, count: st.aim + 1 } });
}

/**
 * Art des Gegners für „Schwachpunkte erkennen“ aus den Kreaturtypen des Systems (CreatureType.detectCreatureType):
 * Dämonen → Sphärenkunde, Kulturschaffende (Helden, NSC, intelligente Kreaturen) → Menschenkenntnis, sonst Tiere und
 * Ungeheuer → Tierkunde. `noArmor`: Rüstungsreduktion (bei uns TP-Bonus) wirkt nicht bei Dämonen, Geistern, Elementaren.
 */
export function foeKind(types, actorType) {
  const kind = types.includes('DemonType') ? 'demon'
    : types.includes('IntelligentCreatureType') || actorType !== 'creature' ? 'culture' : 'animal';
  return { kind, noArmor: types.some(t => ['DemonType', 'GhostType', 'ElementalType'].includes(t)) };
}

// Talent je Gegnerart: System-ID (LocalizedIDs) und deutscher Name wie bei findTreatWounds.
const WEAKNESS_SKILLS = { culture: ['empathy', 'Menschenkenntnis'], animal: ['Zoology', 'Tierkunde'], demon: ['sphereLore', 'Sphärenkunde'] };

export function weaknessSkill(actor, kind) {
  const [id, de] = WEAKNESS_SKILLS[kind];
  const names = new Set([de.toLowerCase(), game.i18n.localize(`LocalizedIDs.${id}`).toLowerCase()]);
  return actor?.items?.find(i => i.type === 'skill' && names.has(i.name.trim().toLowerCase()));
}

function creatureTypes(actor) {
  try { return (game.dsa5?.apps?.CreatureType?.detectCreatureType(actor) ?? []).map(t => t.constructor.name); } catch { return []; }
}

/** QS verteilen: Schieberegler für die TP, der Rest geht auf die PA. Ergebnis { pa, tp } oder null (abgebrochen). */
async function distributeWeakPoints(qs, foe, noArmor) {
  const esc = foundry.utils.escapeHTML;
  if (noArmor) {
    const ok = await foundry.applications.api.DialogV2.confirm({
      window: { title: loc('weakness.Dialog.Title'), icon: MANEUVERS.weakness.icon },
      content: `<p>${loc('weakness.Dialog.Intro', { qs, foe: esc(foe) })}</p><p>${loc('weakness.Dialog.NoArmor', { foe: esc(foe), qs })}</p>`,
      rejectClose: false,
    });
    return ok ? { pa: qs, tp: 0 } : null;
  }
  const tp0 = Math.ceil(qs / 2);
  const pa = game.i18n.localize('CHARAbbrev.PA');
  const content = `<p>${loc('weakness.Dialog.Intro', { qs, foe: esc(foe) })}</p>
    <div class="form-group dsa5h-weakness-split"><label>${pa} <strong data-out="pa">+${qs - tp0}</strong></label>
      <input type="range" name="tp" min="0" max="${qs}" step="1" value="${tp0}" aria-label="${dmgAbbr()}">
      <label>${dmgAbbr()} <strong data-out="tp">+${tp0}</strong></label></div>
    <p class="hint">${loc('weakness.Dialog.MagicArmor')}</p>`;
  const tp = await foundry.applications.api.DialogV2.prompt({
    window: { title: loc('weakness.Dialog.Title'), icon: MANEUVERS.weakness.icon },
    content,
    ok: { label: loc('weakness.Dialog.Confirm'), icon: 'fas fa-check', callback: (_event, button) => Number(button.form.elements.tp.value) },
    rejectClose: false,
    render: (_event, dialog) => {
      const root = dialog.element;
      const input = root.querySelector('input[name="tp"]');
      input?.addEventListener('input', () => {
        root.querySelector('[data-out="tp"]').textContent = `+${input.value}`;
        root.querySelector('[data-out="pa"]').textContent = `+${qs - Number(input.value)}`;
      });
    },
  });
  return tp == null ? null : { pa: qs - tp, tp };
}

/**
 * Schwachpunkte erkennen (#48): markierten Gegner analysieren — Probe über den Probendialog des Systems, QS auf PA/TP
 * verteilen, Ergebnis je Gegner-Token bis Kampfende merken, Chatkarte mit Knopf „Mitteilen“.
 */
export async function recognizeWeakPoints(actor, tokenId) {
  const current = combatKey();
  if (!current) return ui.notifications.info(loc('weakness.NoCombat'));
  const target = game.user.targets.first();
  if (!target?.actor) return ui.notifications.warn(loc('weakness.NoTarget'));
  if (target.actor.uuid === actor.uuid) return ui.notifications.warn(loc('weakness.Self'));
  const { kind, noArmor } = foeKind(creatureTypes(target.actor), target.actor.type);
  const skill = weaknessSkill(actor, kind);
  if (!skill) return ui.notifications.warn(loc('weakness.NoSkill', { name: actor.name, skill: game.i18n.localize(`LocalizedIDs.${WEAKNESS_SKILLS[kind][0]}`) }));

  const setup = await actor.setupSkill(skill, { subtitle: ` (${target.name})` }, tokenId);
  if (!setup) return;
  setup.testData.opposable = false;
  const result = (await actor.basicTest(setup))?.result;
  if (!result) return;

  const esc = foundry.utils.escapeHTML;
  const speaker = ChatMessage.getSpeaker({ actor });
  const qs = result.successLevel > 0 ? Number(result.qualityStep ?? 0) : 0;
  if (!qs) return ChatMessage.create({ speaker, content: `<div class="dsa5h-weakness"><strong>${loc('weakness.Name')}</strong><br>${loc('weakness.Chat.Failure', { actor: esc(actor.name), foe: esc(target.name) })}</div>` });

  const split = await distributeWeakPoints(qs, target.name, noArmor);
  if (!split) return;
  const entry = { combat: current.combat, round: current.round, name: target.name, ...split, sharedRound: null };
  const s = state(actor);
  await actor.setFlag(MODULE_ID, 'maneuvers', { ...s, weakness: { ...(s.weakness ?? {}), [target.id]: entry } });
  await ChatMessage.create({
    speaker,
    flags: { [MODULE_ID]: { weakness: { actor: actor.uuid, token: target.id } } },
    content: `<div class="dsa5h-weakness"><strong>${loc('weakness.Name')}</strong><br>${loc('weakness.Chat.Success', { actor: esc(actor.name), foe: esc(target.name), pa: split.pa, tp: split.tp })}
      <button type="button" class="dsa5h-weakness-share"><i class="fas fa-bullhorn" inert></i> ${loc('weakness.Share')}</button></div>`,
  });
}

/** Mitteilen (freie Aktion): ab jetzt gilt die Erkenntnis für alle Verbündeten, für alle aber nur noch eine Runde. */
export async function shareWeakPoints(actor, token) {
  if (!actor?.isOwner) return ui.notifications.warn(loc('weakness.NotOwner'));
  const current = combatKey();
  const s = state(actor);
  const entry = s.weakness?.[token];
  if (!weakPointValid(entry, current)) return ui.notifications.info(loc('weakness.Expired'));
  if (entry.sharedRound != null) return;
  await actor.setFlag(MODULE_ID, 'maneuvers', { ...s, weakness: { ...s.weakness, [token]: { ...entry, sharedRound: current.round } } });
  const esc = foundry.utils.escapeHTML;
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<div class="dsa5h-weakness"><strong>${loc('weakness.Name')}</strong><br>${loc('weakness.Chat.Shared', { actor: esc(actor.name), foe: esc(entry.name), pa: entry.pa, tp: entry.tp, round: current.round + 1 })}</div>`,
  });
}

/** Daten für den Block im Kampf-Reiter. */
export function sheetData(actor, enabled = enabledManeuvers()) {
  const st = maneuverState(actor);
  const tierOf = id => paladoseTier(attrValue(actor, MANEUVERS[id].attr));
  const rows = enabled.map(id => {
    const m = MANEUVERS[id];
    if (!m.attr) return { id, icon: m.icon, name: loc(`${id}.Name`), attr: loc(`${id}.Attr`), value: loc(`${id}.Value`) };
    const tier = tierOf(id);
    const value = id === 'feint' || id === 'mighty' ? `−1 … −${m.max[tier]}${id === 'mighty' ? ` / ${dmgAbbr()} +${m.max[tier]}` : ''}`
      : id === 'advance' ? `+${m.table[tier][0]} / ${signed(m.table[tier][1])}`
        : id === 'stance' ? `+${m.bonus[tier]}`
          : id === 'aim' ? `+${m.table[tier][0]} / ${dmgAbbr()} +${m.table[tier][1]} × ${m.table[tier][2]}`
            : `+${m.reduce[tier]}`;
    return { id, icon: m.icon, name: loc(`${id}.Name`), attr: `${attrAbbr(m.attr)} ${attrValue(actor, m.attr)}`, value };
  });
  const aimMax = MANEUVERS.aim.table[tierOf('aim')][2];
  const inCombat = !!combatKey();
  return {
    rows,
    stance: enabled.includes('stance') ? { active: st.stance } : null,
    aim: enabled.includes('aim') ? { count: st.aim, max: aimMax, inCombat } : null,
    advanceMalus: enabled.includes('advance') ? st.advanceMalus : 0,
    weakness: enabled.includes('weakness') ? {
      inCombat,
      entries: st.weakness.map(e => ({ text: loc(e.sharedRound == null ? 'weakness.Status' : 'weakness.StatusShared', { foe: e.name, pa: e.pa, tp: e.tp, round: e.sharedRound + 1 }) })),
    } : null,
  };
}

/** Trefferzonen-Regel von Kompendium 1 aktiv? */
function hitzonesActive() {
  try { return !!game.modules.get('dsa5-compendium')?.active && !!game.settings.get('dsa5-compendium', 'enableHitzones'); } catch { return false; }
}

/** Hooks: Modifikatoren im Probendialog, Chatnachricht nach dem Wurf, Kampfende, System-Zielen ausblenden. */
export function initManeuvers(isActive) {
  game.settings.register(MODULE_ID, SETTING, { scope: 'world', config: false, type: Object, default: {} });

  Hooks.on('dsa5.prepareRollSituationalModifiers', (actor, modifiers, context) => {
    if (!isActive() || !isActor(actor)) return;
    try {
      const weak = enabledManeuvers().includes('weakness') ? weakPointBonus(actor, foeTokenId(actor, context), combatKey(), allyActors(actor)) : null;
      modifiers.push(...buildModifiers(actor, context, { weak }));
    } catch (error) { console.error(`${MODULE_ID} | Grundmanöver`, error); }
  });

  // Chatkarte „Schwachpunkte erkannt“: Knopf „Mitteilen“ (nur der Held selbst; danach ausgegraut).
  Hooks.on('renderChatMessageHTML', (message, html) => {
    const data = message.getFlag?.(MODULE_ID, 'weakness');
    const button = data && html.querySelector('.dsa5h-weakness-share');
    if (!button) return;
    const actor = fromUuidSync(data.actor);
    const entry = state(actor).weakness?.[data.token];
    if (!actor?.isOwner || !weakPointValid(entry, combatKey()) || entry.sharedRound != null) {
      button.disabled = true;
      if (entry?.sharedRound != null) button.lastChild.textContent = ` ${loc('weakness.Shared')}`;
      return;
    }
    button.addEventListener('click', async event => {
      event.preventDefault();
      button.disabled = true;
      await shareWeakPoints(actor, data.token);
      ui.chat?.updateMessage?.(message);
    });
  });

  Hooks.on('createChatMessage', message => { onChatMessage(message, isActive).catch(error => console.error(`${MODULE_ID} | Grundmanöver`, error)); });

  // Kampfende: Verteidigungshaltung, Zielen und Schwachpunkte der Beteiligten löschen (nur die SL schreibt).
  Hooks.on('deleteCombat', async combat => {
    if (!game.user.isGM) return;
    for (const c of combat.combatants) {
      const actor = c.actor;
      const s = state(actor);
      if (!actor || (!s.stance && !s.aim && !s.advance && !s.weakness)) continue;
      await actor.unsetFlag(MODULE_ID, 'maneuvers');
    }
  });

  // Probendialog: Grundmanöver als eigener Abschnitt rechts unter den Sonderfertigkeiten (Nutzer 2026-10-21),
  // System-Zielen ausblenden.
  Hooks.on('renderDSA5CombatDialog', (app, element) => {
    if (!isActive()) return;
    const root = element instanceof HTMLElement ? element : element?.[0];
    const widget = root?.querySelector('select[name="situationalModifiers"]')?.parentElement;
    const instance = widget?.__dsa5SituationalModifiersWidget;
    if (instance) mountDialogPanel(root, instance);
    // Gleichwertige SF des Systems ausblenden (Finte, Wuchtschlag, Vorstoß, Verteidigungshaltung; #48), sonst zählen
    // Grundmanöver und SF doppelt.
    const enabled = enabledManeuvers();
    for (const row of root?.querySelectorAll('.specAbs[data-id]') ?? []) {
      if (replacedBy(row.querySelector('a')?.textContent, enabled)) row.style.display = 'none';
    }
    if (enabled.includes('aim') && rollKind({ source: app.dialogData?.source, mode: app.dialogData?.mode }).kind === 'ranged') {
      const aim = root.querySelector('select[name="aim"]');
      if (aim) { aim.value = '0'; const group = aim.closest('.form-group'); if (group) group.style.display = 'none'; }
      root.querySelector('[data-action="aimButton"]')?.remove();
    }
  });
}

/** Teilt den Namen eines Manöver-Modifikators in Zeilentitel und Stufentext („Angriff antäuschen (GE 14)“ / „AT −2, …“). */
export function splitModifierName(modifier) {
  const name = String(modifier?.name ?? '');
  const cut = name.indexOf(': ');
  const title = cut < 0 ? name : name.slice(0, cut);
  let step = cut < 0 ? '' : name.slice(cut + 2);
  if (!/\d/.test(step)) step = `${step ? `${step} ` : ''}${signed(Number(modifier?.value) || 0)}`;
  return { title, step };
}

/** Nächster Eintrag einer Gruppe: −1 (aus) → 0 → … → letzter → −1; rückwärts bis −1. */
export function nextStep(current, count, back = false) {
  if (back) return Math.max(-1, current - 1);
  return current + 1 >= count ? -1 : current + 1;
}

/**
 * Abschnitt „Grundmanöver“ im Probendialog. Die Einträge bleiben Modifikatoren des System-Widgets (das rechnet weiter
 * und merkt sich die Auswahl), ihre Zeilen in der Modifikatorenliste werden nur ausgeblendet. Bedienung wie die
 * Sonderfertigkeiten des Systems: Klick = nächste Stufe, Rechtsklick = zurück. Eigene Klasse statt `.specAbs`, weil das
 * System auf `.specAbs` eigene Klick-Handler legt.
 */
function mountDialogPanel(root, instance) {
  const ours = m => { const g = maneuverGroup(m.ref?.id); return !!MANEUVERS[g] || g === 'advanceMalus'; };
  const panel = document.createElement('section');
  panel.className = 'dsa5h-maneuver-panel';
  (root.querySelector('.specAbsContainer') ?? instance.closest('.form-group'))?.after(panel);

  const draw = () => {
    const groups = new Map();
    instance.modifiers.forEach((m, i) => { const g = maneuverGroup(m.ref?.id); if (ours(m)) groups.set(g, [...(groups.get(g) ?? []), i]); });
    panel.hidden = !groups.size;
    panel.replaceChildren();
    if (!groups.size) return;
    const head = document.createElement('h4');
    head.textContent = loc('Title');
    head.dataset.tooltip = 'DSA5HELPERS.HouseRules.maneuvers.PanelHint';
    panel.append(head);
    for (const [group, indices] of groups) {
      const current = indices.findIndex(i => instance.modifiers[i].selected);
      const shown = instance.modifiers[indices[Math.max(0, current)]];
      const { title, step } = splitModifierName(shown);
      const row = document.createElement('div');
      row.className = `dsa5h-maneuver-row${current >= 0 ? ' active' : ''}`;
      row.dataset.group = group;
      row.dataset.tooltip = indices.length > 1 ? 'DSA5HELPERS.HouseRules.maneuvers.RowHint' : 'DSA5HELPERS.HouseRules.maneuvers.RowHintSingle';
      const icon = MANEUVERS[group]?.icon ?? MANEUVERS.advance.icon;
      row.innerHTML = `<i class="${icon}" inert></i><span class="dsa5h-maneuver-name"></span><span class="dsa5h-maneuver-step"></span>`;
      row.querySelector('.dsa5h-maneuver-name').textContent = title;
      row.querySelector('.dsa5h-maneuver-step').textContent = current >= 0 ? step : '';
      row.addEventListener('contextmenu', event => event.preventDefault());
      row.addEventListener('mousedown', event => {
        if (event.button !== 0 && event.button !== 2) return;
        event.preventDefault();
        const target = nextStep(current, indices.length, event.button === 2);
        indices.forEach((i, n) => { instance.modifiers[i].selected = n === target; });
        instance.refresh();
        instance.dispatchChange();
      });
      panel.append(row);
    }
    const hint = document.createElement('p');
    hint.className = 'hint dsa5h-maneuver-hint';
    hint.textContent = loc('CombineHint');
    // Trefferzonen-Regel aus Kompendium 1: das System bietet dann eine eigene Auswahl „Gezielter Angriff“ (bestimmt
    // auch die Rüstungszone). Beide bleiben (Nutzer 2026-10-20), der Hinweis verhindert doppelte Mali.
    if (hitzonesActive() && groups.has('targeted')) hint.textContent += ` ${loc('targeted.HitzoneHint')}`;
    panel.append(hint);
  };

  hideModifierRows(instance, ours, draw);
}

/**
 * Zeilen eigener Modifikatoren in der Liste des System-Widgets ausblenden (die Auswahl bleibt im Widget und wird
 * normal verrechnet); die ganze Gruppe verschwindet, wenn nur eigene übrig bleiben. `after` läuft nach jedem Neuzeichnen.
 */
export function hideModifierRows(instance, ours, after = () => {}) {
  const refresh = instance.refresh.bind(instance);
  const updateVisibility = instance.updateVisibility.bind(instance);
  instance.updateVisibility = () => {
    updateVisibility();
    if (instance.modifiers.length && instance.modifiers.every(ours)) instance.closest('[data-situational-modifiers-group]')?.classList.add('dsahidden');
  };
  instance.refresh = () => {
    refresh();
    for (const option of instance.select?.options ?? []) option.hidden = ours(instance.modifiers[Number(option.dataset.index)] ?? {});
    instance.updateVisibility();
    after();
  };
  instance.refresh();
}
