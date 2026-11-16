// Hausregel „Passive Verteidigung“ (Issue #56, 2026-10-28): Der Verteidiger muss nicht selbst reagieren. Gelingt die
// Attacke auf ein markiertes Ziel, würfelt das Modul offen einen W20 gegen dessen Verteidigung V: W20 ≤ V = abgewehrt.
// Damit wird jede gelungene Attacke mit derselben Wahrscheinlichkeit pariert wie im normalen System (Nutzer
// 2026-10-28, Variante B; der erste Entwurf mit einem W100 aus W20 + W5 koppelte die Parade an die Höhe des AT-Wurfs).
//
// Je Akteur wählbar (Actor-Flag autoDefense, Kampf-Reiter bzw. Menü ⋮ des Systembogens): selbst würfeln (normale
// Regel), automatisch mit der besten Verteidigung oder mit einer bestimmten Option. Ohne Wahl würfeln Spielercharaktere
// selbst, NSC und Kreaturen verteidigen automatisch mit der besten Option.
//
// Ablauf (nur auf dem Client der aktiven SL): Das System legt je Ziel eine Startnachricht an und merkt am Ziel, dass es
// auf eine Verteidigung wartet (DSA8 flags.opposes, DSA7 flags.oppose; greift ein Spieler ein nicht verknüpftes Token an, kommt das Flag bei der
// SL nicht immer an — dann nach kurzer Wartezeit trotzdem auswerten und ein spätes Flag wieder löschen). Dann:
// Treffer → OpposeDSA.resolveUndefended (Schaden wie bisher), abgewehrt → Wartezustand lösen, Reaktionsknopf weg.
// Schip auf den Angriff: Das System zeichnet die Angriffskarte neu und ruft handleOpposedTarget; wir werten dann neu aus.
//
// Weitere Nutzer-Entscheidungen 2026-10-28: Nah- und Fernkampf (Fernkampf nur Ausweichen und Schild); eine Verteidigung
// zählt als verbraucht, wenn die AT gelungen ist; eine 1 im Angriff (Krit, auch unbestätigt) halbiert V, normal gerundet
// — das setzt das System als postData.halfDefense.
import { systemApi, isOpposePending, clearOpposedFor } from '../compat/runtime.js';

const MODULE_ID = 'dsa5-helpers';
const SOCKET = `module.${MODULE_ID}`;
const FLAG = 'passiveDefense';
export const ACTOR_FLAG = 'autoDefense';
const P = 'DSA5HELPERS.HouseRules.passiveDefense.';
// Rechnung für die SL nur im Speicher ihres Clients (Kartennachricht-ID → HTML). Flüsternachrichten und Flags erreichen
// in Foundry alle Clients; Gegnerwerte dürfen dort nicht stehen (#56). Nach dem Neuladen fehlt die Rechnung.
const gmDetails = new Map();

/**
 * Ergebnis der Attacke gegen die automatische Verteidigung: misslungene AT = miss, sonst W20 ≤ V abgewehrt.
 * Eine 1 wehrt immer ab, eine 20 nie (Nutzer 2026-10-29), unabhängig von V.
 * @returns {{outcome: 'hit'|'defended'|'miss', roll?: number}}
 */
export function resolveDefense({ successLevel, roll, defense }) {
  if (!(successLevel > 0)) return { outcome: 'miss' };
  const d20 = Number(roll);
  const defended = d20 === 1 || (d20 !== 20 && d20 <= Number(defense));
  return { outcome: defended ? 'defended' : 'hit', roll };
}

/** Höchste Verteidigung (keine Summe, kein Durchschnitt); ohne Option null. */
export function bestDefense(options) {
  return options.reduce((best, option) => (!best || option.value > best.value ? option : best), null);
}

/** Kampftechnik Raufen, wie das System prüft (LocalizedCTs.<Kampftechnik> === 'Brawling'). */
export function isBrawlWeapon(item, localize = key => game.i18n.localize(key)) {
  return item?.type === 'meleeweapon' && localize(`LocalizedCTs.${item.system?.combatskill?.value}`) === 'Brawling';
}

/**
 * Raufen gegen Waffen (#90, Nutzer 2026-11-16, Kodex des Schwertes, wie OpposeDSA.#s/#t des Systems): Eine gelungene
 * Raufen-Parade gegen eine Waffe schützt nicht vor dem Schaden ('parryHurts', voller Schaden für den Verteidiger), eine
 * mit einer Waffe abgewehrte Raufen-Attacke verletzt den Angreifer ('attackHurts', halber Waffenschaden). Ausnahme
 * jeweils: Raufwaffen mit preventsBrawlParryDamage bzw. preventsBrawlAttackDamage.
 */
export function brawlCase(attackSource, option, isBrawl = item => isBrawlWeapon(item)) {
  if (!attackSource || !option) return null;
  const parryBrawl = option.id === 'parryWeaponless' || (isBrawl(option.item) && !option.item.system?.preventsBrawlParryDamage);
  if (attackSource.type === 'meleeweapon' && !isBrawl(attackSource) && parryBrawl) return 'parryHurts';
  if (isBrawl(attackSource) && !attackSource.system?.preventsBrawlAttackDamage && option.item?.type === 'meleeweapon' && !isBrawl(option.item)) return 'attackHurts';
  return null;
}

/** Kampftechnik einer Nahkampfwaffe als englischer Schlüssel des Systems (LocalizedCTs: 'Daggers', 'Shields' …). */
export function techniqueOf(item, localize = key => game.i18n.localize(key)) {
  return item?.type === 'meleeweapon' ? localize(`LocalizedCTs.${item.system?.combatskill?.value}`) : null;
}

// Kodex des Schwertes, Kampftechniken (Besonderheiten) und Ausweichen (#90, Nutzer 2026-11-16).
const NO_PARRY_TECHNIQUES = ['Chain Weapons', 'Whips'];
const LIGHT_PARRY_TECHNIQUES = ['Daggers', 'Fencing Weapons'];
const HEAVY_ATTACK_TECHNIQUES = ['Chain Weapons', 'Polearms', 'Two-Handed Impact Weapons', 'Two-Handed Swords'];

/**
 * Warum eine Verteidigungsoption gegen diesen Angriff nicht geht (#90), sonst null. Ausweichen geht immer; gegen Fernkampf
 * bleiben ohnehin nur Ausweichen und Schilde (baseOptions). Nahkampf: großer Angreifer nur Schild oder Ausweichen,
 * riesiger nur Ausweichen; mit Kettenwaffen und Peitschen keine Parade; Dolche und Fechtwaffen parieren keine
 * Kettenwaffen, Stangenwaffen, Zweihandhiebwaffen und Zweihandschwerter. Fächer (offen/geschlossen) prüft das Modul nicht.
 */
export function blockedReason(option, { ranged = false, attackerSize = null, attackTechnique = null } = {}, technique = item => techniqueOf(item)) {
  if (!option || option.id === 'dodge' || ranged) return null;
  const tech = technique(option.item);
  if (attackerSize === 'giant') return 'giant';
  if (attackerSize === 'big' && tech !== 'Shields') return 'big';
  if (NO_PARRY_TECHNIQUES.includes(tech)) return 'noParry';
  if (LIGHT_PARRY_TECHNIQUES.includes(tech) && HEAVY_ATTACK_TECHNIQUES.includes(attackTechnique)) return 'heavy';
  return null;
}

/** Gewählte Option, wenn sie gegen diesen Angriff zulässig ist, sonst die beste. */
export function chooseDefense(options, mode) {
  return options.find(option => option.id === mode) ?? bestDefense(options);
}

/**
 * Hinweis für die Karte (#90), wenn die Verteidigung ohne die Zulässigkeitsprüfung eine andere gewesen wäre: bei fest
 * gewählter Option diese, sonst die beste aller Optionen (Rückmeldung 2026-11-16: bei „beste Verteidigung“ fehlte der
 * Grund). Ohne Abweichung null.
 */
export function blockedNote(options, chosen, mode) {
  const wanted = options.find(option => option.id === mode) ?? bestDefense(options);
  if (!wanted?.blocked || !chosen || wanted === chosen) return null;
  return { option: wanted.name, reason: wanted.blocked, chosen: chosen.name };
}

/** 'manual' | 'best' | Options-ID; ohne Wahl Spielercharaktere manuell, alle anderen 'best'. */
export function defenseMode(actor) {
  return actor?.getFlag?.(MODULE_ID, ACTOR_FLAG) || (actor?.type === 'character' ? 'manual' : 'best');
}

/** Verteidigt dieser Akteur automatisch? Fahrzeuge nie (das System löst sie selbst auf). */
export function appliesTo(actor) {
  return !!actor && actor.type !== 'vehicle' && defenseMode(actor) !== 'manual';
}

export async function setDefenseMode(actor, mode) {
  if (!actor?.isOwner) return;
  await actor.setFlag(MODULE_ID, ACTOR_FLAG, String(mode || 'manual'));
}

const isRangedAttack = preData => !(preData?.source?.type === 'meleeweapon' || preData?.source?.system?.traitType?.value === 'meleeAttack');

/** Abzüge des Angreifers auf die Verteidigung (Finte u. a.), wie CombatSystem.getDefenseMalus des Systems. */
function attackerDefenseMalus(preData) {
  return (preData?.situationalModifiers ?? []).reduce((sum, mod) => {
    if (mod.dmmalus !== undefined && mod.dmmalus !== 0) return sum + Number(mod.dmmalus);
    if (mod.type === 'defenseMalus' && mod.value !== 0) return sum + Number(mod.value);
    return sum;
  }, 0);
}

/**
 * Verteidigungsmöglichkeiten wie im Reaktionsdialog des Systems (ReactToAttackDialog): Ausweichen, waffenlose Parade,
 * getragene Nahkampfwaffen/Schilde, Merkmale mit PA — mit den vom System vorbereiteten Grundwerten. Gegen Fernkampf nur
 * Ausweichen und Schilde.
 */
export function baseOptions(actor, ranged = false) {
  const api = systemApi();
  const RuleChaos = api?.apps?.RuleChaos;
  const Actordsa5 = api?.entities?.Actordsa5;
  const SkillModel = CONFIG.Item.dataModels?.combatskill;
  const combatskills = actor.items.filter(item => item.type === 'combatskill')
    .map(item => SkillModel?._calculateCombatSkillValues ? SkillModel._calculateCombatSkillValues(item.toObject(), actor.system) : item.toObject());
  const base = [{ id: 'dodge', name: game.i18n.localize('dodge'), value: Number(actor.system.status?.dodge?.max) || 0, item: { type: 'dodge', name: 'dodge' } }];
  const brawl = combatskills.find(skill => skill.name === game.i18n.localize('LocalizedIDs.wrestle'));
  if (!ranged && brawl) base.push({ id: 'parryWeaponless', name: game.i18n.localize('parryWeaponless'), value: Number(brawl.system.parry?.value) || 0, item: brawl });
  for (const item of actor.items) {
    if (item.type === 'meleeweapon' && item.system.worn?.value === true) {
      if (ranged && !RuleChaos?.isShield(item)) continue;
      const prepared = Actordsa5?._prepareMeleeWeapon(item.system.itemWithOverrides(), combatskills, actor);
      base.push({ id: item.id, name: item.name, value: Number(prepared?.parry) || 0, item });
    } else if (!ranged && item.type === 'trait' && Number(item.system.pa) > 0) {
      base.push({ id: item.id, name: item.name, value: Number(item.system.pa), item });
    }
  }
  return base;
}

/** Optionen gegen einen konkreten Angriff, samt Zuständen, Mehrfachverteidigung, Abzügen des Angreifers und Krit-Halbierung. */
export async function defenseOptions(actor, speaker, attackMessage) {
  const { RuleChaos, DSA5StatusEffects } = systemApi()?.apps ?? {};
  const preData = attackMessage.flags.data.preData;
  const postData = attackMessage.flags.data.postData;
  const base = baseOptions(actor, isRangedAttack(preData));
  const count = game.combat ? Number(await game.combat.getDefenseCount(speaker)) || 0 : 0;
  const malus = attackerDefenseMalus(preData);
  return base.map(option => {
    let conditions = 0;
    try {
      conditions = (DSA5StatusEffects?.getRollModifiers(actor, option.item, { mode: 'parry' }) ?? [])
        .filter(mod => mod.selected !== false && !mod.type).reduce((sum, mod) => sum + (Number(mod.value) || 0), 0);
    } catch (error) { console.warn(`${MODULE_ID} | Passive Verteidigung: Zustände`, error); }
    const multiple = count * (Number(RuleChaos?.multipleDefenseValue(actor, option.item)) || -3);
    const total = (option.value + conditions + multiple + malus) * (postData.halfDefense ? 0.5 : 1);
    return { id: option.id, name: option.name, item: option.item, base: option.value, conditions, multiple, malus, half: !!postData.halfDefense, value: Math.round(total) };
  });
}

function targetOf(startMessage) {
  const speaker = startMessage.flags.unopposeData?.targetSpeaker;
  const token = game.scenes.get(speaker?.scene)?.tokens.get(speaker?.token) ?? canvas?.tokens?.get(speaker?.token)?.document;
  return { speaker: { token: speaker?.token, scene: speaker?.scene, actor: token?.actor?.id }, token, actor: token?.actor };
}

const escape = text => foundry.utils.escapeHTML(String(text ?? ''));

// Ergebnis auf einen Blick (Issue #62, Variante B „Symbol und Wort“, Nutzerwahl 2026-10-30; Dummy passive-verteidigung.html):
// rundes Symbol, darüber klein der Titel, das Ergebnis als großes Wort, darunter Satz und Verteidigungswurf.
const OUTCOME_ICONS = { hit: 'fa-sword', defended: 'fa-shield', miss: 'fa-xmark', manual: 'fa-dice-d20' };
function publicContent(outcome, attacker, defender, result, note = null) {
  const text = game.i18n.format(P + 'Chat.' + outcome, { attacker: escape(attacker), defender: escape(defender) });
  const roll = result.roll ? ` <span class="dsa5h-pd-roll">${game.i18n.format(P + 'Chat.Roll', { roll: result.roll })}</span>` : '';
  // Gewählte Verteidigung hier nicht zulässig (#90): Grund und Ersatz nennen.
  const blocked = note ? `<p class="dsa5h-pd-note">${game.i18n.format(P + 'Chat.Blocked', { option: escape(note.option), reason: game.i18n.localize(P + 'Blocked.' + note.reason), chosen: escape(note.chosen) })}</p>` : '';
  return `<div class="dsa5h-pd-card dsa5h-pd-${outcome}"><span class="dsa5h-pd-icon"><i class="fa-solid ${OUTCOME_ICONS[outcome]}" inert></i></span>
    <small class="dsa5h-pd-title">${game.i18n.localize(P + 'Title')}</small><span class="dsa5h-pd-word">${game.i18n.localize(P + 'Chat.Word.' + outcome)}</span>
    <p>${text}${roll}</p>${blocked}</div>`;
}

/** Angreifer-Größe und Kampftechnik der Angriffswaffe für blockedReason (#90). */
function attackContext(attackMessage) {
  const preData = attackMessage.flags.data.preData;
  const sp = attackMessage.speaker ?? {};
  const attacker = game.scenes.get(sp.scene)?.tokens.get(sp.token)?.actor ?? game.actors.get(sp.actor);
  return { ranged: isRangedAttack(preData), attackerSize: attacker?.system?.status?.size?.value ?? null, attackTechnique: techniqueOf(preData?.source) };
}

function gmContent(result, options, chosen, at, d20) {
  const rows = options.map(option => `<tr${option === chosen ? ' class="dsa5h-pd-chosen"' : option.blocked ? ' class="dsa5h-pd-blocked"' : ''}><td>${escape(option.name)}${option.blocked ? ` <small>(${game.i18n.localize(P + 'Blocked.' + option.blocked)})</small>` : ''}</td><td>${option.base}</td><td>${option.conditions + option.multiple + option.malus}${option.half ? ' ×½' : ''}</td><td><b>${option.value}</b></td></tr>`).join('');
  return `<p>${game.i18n.format(P + 'Chat.GMLine', { at, d20, defense: chosen?.value ?? 0, option: escape(chosen?.name), roll: result.roll })}</p>
    <table class="dsa5h-pd-table"><thead><tr><th>${game.i18n.localize(P + 'Chat.Option')}</th><th>${game.i18n.localize(P + 'Chat.Base')}</th><th>${game.i18n.localize(P + 'Chat.Mods')}</th><th>V</th></tr></thead><tbody>${rows}</tbody></table>`;
}

/** Startnachricht auswerten (nur aktive SL). reroll = Schip auf den Angriff, Verteidigung zählt dann nicht erneut. */
export async function evaluate(startMessage, { reroll = false } = {}) {
  const OpposeDSA = systemApi()?.apps?.OpposeDSA;
  const attackMessage = game.messages.get(startMessage.flags.unopposeData?.attackMessageId);
  if (!OpposeDSA || !attackMessage?.flags?.data) return;
  const { actor, speaker } = targetOf(startMessage);
  const previous = startMessage.getFlag(MODULE_ID, FLAG);
  if (!actor || (!previous && !appliesTo(actor))) return;
  if (!canvas?.tokens?.get(speaker.token)) {
    ui.notifications.warn(P + 'OtherScene', { localize: true });
    return;
  }
  const postData = attackMessage.flags.data.postData;
  const die = postData.characteristics?.[0] ?? {};
  let result = { outcome: 'miss' };
  let options = [];
  let chosen = null;
  let note = null;
  if (previous?.manual) return;
  if (postData.successLevel > 0) {
    options = await defenseOptions(actor, speaker, attackMessage);
    // Unzulässige Optionen (#90) fallen weg; wäre sonst eine davon genommen worden (fest gewählt oder die beste), nennt
    // die Karte den Grund.
    const context = attackContext(attackMessage);
    for (const option of options) option.blocked = blockedReason(option, context);
    const allowed = options.filter(option => !option.blocked);
    chosen = chooseDefense(allowed, defenseMode(actor));
    note = blockedNote(options, chosen, defenseMode(actor));
    const roll = (await new Roll('1d20').evaluate()).total;
    result = resolveDefense({ successLevel: postData.successLevel, roll, defense: chosen?.value ?? 0 });
    // Verbraucht, wenn die AT gelungen ist (Nutzer 2026-10-28) — wie im System, wo man nur gelungene Angriffe abwehrt.
    if (!reroll && game.combat) await game.combat.updateDefenseCount(speaker);
  }
  // Ergebniskarte des Systems: DSA8 verknüpft sie mit der Startnachricht und zeichnet sie beim Schip neu; DSA7 legt bei
  // jedem resolveUndefended eine neue an, dort merken wir uns ihre ID selbst (resultId).
  const linked = typeof OpposeDSA.findOpposedResultMessage === 'function';
  // Schip vorher Treffer, jetzt nicht mehr (unter DSA7 auch bei erneutem Treffer): die alte Ergebniskarte entfernen.
  if (previous?.outcome === 'hit' && (result.outcome !== 'hit' || !linked)) {
    const old = linked
      ? OpposeDSA.findOpposedResultMessage({ attackerMessageId: attackMessage.id, startMessageId: startMessage.id })
      : game.messages.get(previous.resultId);
    await old?.delete();
  }
  const attacker = attackMessage.speaker?.alias ?? attackMessage.alias;
  const defender = startMessage.flags.unopposeData.targetSpeaker?.alias ?? actor.name;
  // Raufen gegen Waffen: Hinweis mit Schadensknopf statt stiller Abwehr; beim Schip-Neuwurf die alte Karte ersetzen.
  if (previous?.brawlId) await game.messages.get(previous.brawlId)?.delete();
  let brawlId = null;
  const brawl = result.outcome === 'defended' ? brawlCase(attackMessage.flags.data.preData?.source, chosen) : null;
  if (brawl) {
    try { brawlId = await brawlNotice(brawl, { OpposeDSA, attackMessage, speaker, chosen, attacker, defender }); }
    catch (error) { console.error(`${MODULE_ID} | Passive Verteidigung: Raufen-Hinweis`, error); }
  }
  let resultId = null;
  if (result.outcome === 'hit') {
    await OpposeDSA.resolveUndefended(startMessage, game.i18n.format(P + 'Chat.Roll', { roll: result.roll }));
    if (!linked) resultId = game.messages.contents.findLast(message => message.flags?.opposeData?.speakerDefend?.token === speaker.token)?.id ?? null;
  } else {
    await clearOpposedFor(OpposeDSA, actor, startMessage.id);
    await OpposeDSA.hideReactionButton(startMessage.id);
  }
  // Karten-ID vorab, damit die Rechnung der SL schon beim ersten Zeichnen bereitliegt.
  const card = previous?.cardId && game.messages.get(previous.cardId);
  const cardId = card?.id ?? foundry.utils.randomID();
  if (result.roll) gmDetails.set(cardId, gmContent(result, options, chosen, die.tar, die.res));
  else gmDetails.delete(cardId);
  const content = publicContent(result.outcome, attacker, defender, result, note);
  // Ergebnis vor der Karte speichern: der Knopf „Selbst verteidigen“ (addManualButton) liest es beim Zeichnen.
  await startMessage.setFlag(MODULE_ID, FLAG, { outcome: result.outcome, cardId, resultId, brawlId });
  if (card) await card.update({ content });
  else await ChatMessage.create({ _id: cardId, content, speaker: attackMessage.speaker, flags: { [MODULE_ID]: { passiveStart: startMessage.id } } }, { keepId: true });
  // Spät eintreffender Wartezustand (Spielerangriff über den Socket des Systems): wieder lösen.
  if (result.outcome !== 'hit') setTimeout(() => {
    if (isOpposePending(targetOf(startMessage).actor, startMessage.id)) clearOpposedFor(OpposeDSA, actor, startMessage.id);
  }, 3000);
}

/** Rechnung an der Karte, nur im Client der SL. */
/**
 * Hinweiskarte zu Raufen gegen Waffen mit dem Knopf „Schaden“ des Systems (.applyDamage, wendet nach Besitzrecht an):
 * nichts wird automatisch abgezogen (Nutzer 2026-11-16). Schaden wie im System: bei 'parryHurts' der Treffer mit
 * Rüstung (OpposeDSA._calculateOpposedDamage), bei 'attackHurts' die Hälfte eines Wurfs mit dem Schaden der Waffe.
 */
async function brawlNotice(kind, { OpposeDSA, attackMessage, speaker, chosen, attacker, defender }) {
  const postData = attackMessage.flags.data.postData;
  const B = P + 'Chat.Brawl.';
  let damage;
  let line;
  let hurt;
  if (kind === 'parryHurts') {
    hurt = speaker;
    const tp = Number(postData.damage) || 0;
    damage = { value: tp, sp: tp };
    line = game.i18n.format(B + 'DamageRaw', { tp });
    try {
      const attackerTest = { ...foundry.utils.deepClone(postData), source: attackMessage.flags.data.preData.source, speaker: attackMessage.speaker };
      const calc = OpposeDSA._calculateOpposedDamage?.(attackerTest, { speaker, source: chosen.item }, {});
      if (calc && Number.isFinite(calc.sum)) {
        damage = { value: Math.max(0, calc.sum), sp: calc.damage };
        line = game.i18n.format(B + 'DamageArmor', { tp: calc.damage, armor: calc.armor, sp: damage.value });
      }
    } catch (error) { console.warn(`${MODULE_ID} | Passive Verteidigung: Schaden der Raufen-Parade`, error); }
  } else {
    hurt = attackMessage.speaker;
    const formula = String(chosen.item.system?.damage?.value ?? '').replace(/(\d*)[wW](\d+)/g, '$1d$2');
    if (!formula) return null;
    const roll = await new Roll(formula).evaluate();
    const value = Math.round(roll.total * 0.5);
    damage = { value, sp: value };
    line = game.i18n.format(B + 'DamageHalf', { roll: roll.total, value });
  }
  const text = game.i18n.format(B + kind, { attacker: escape(attacker), defender: escape(defender), weapon: escape(chosen.name) });
  const content = `<div class="dsa5 chat-card"><div class="opposed-card dsa5h-pd-brawl"><p><b>${game.i18n.localize(B + 'Title')}</b></p><p>${text}</p>
    <p>${line}</p><div class="row-section center"><button type="button" class="applyDamage selfButton smallChatButton" data-mode="value"><i class="fas fa-shield-alt" inert></i> ${game.i18n.localize(B + 'Apply')}</button></div></div></div>`;
  const message = await ChatMessage.create({
    content,
    speaker: attackMessage.speaker,
    flags: { opposeData: { speakerDefend: hurt, damage }, dsa5: { opposedMeta: kind === 'parryHurts' ? { attackerMessageId: attackMessage.id } : {} } },
  });
  return message?.id ?? null;
}

function decorateCard(message, html) {
  addManualButton(message, html);
  const detail = game.user.isGM && gmDetails.get(message.id);
  if (!detail) return;
  const card = html.querySelector('.dsa5h-pd-card');
  if (!card || card.querySelector('.dsa5h-pd-gm')) return;
  const box = document.createElement('details');
  box.className = 'dsa5h-pd-gm';
  box.innerHTML = `<summary>${game.i18n.localize(P + 'Chat.GMTitle')}</summary>${detail}`;
  card.append(box);
}

/**
 * Knopf „Selbst verteidigen“ (#90 B) auf der Karte der automatischen Verteidigung: für die SL und den Besitzer des
 * Verteidigers, solange abgewehrt oder getroffen wurde und die Verteidigung nicht schon zurückgenommen ist.
 */
function addManualButton(message, html) {
  const startId = message.flags?.[MODULE_ID]?.passiveStart;
  const start = startId && game.messages.get(startId);
  const state = start?.getFlag(MODULE_ID, FLAG);
  if (!state || !['hit', 'defended'].includes(state.outcome)) return;
  const actor = targetOf(start).actor;
  if (!game.user.isGM && !actor?.isOwner) return;
  const card = html.querySelector('.dsa5h-pd-card');
  if (!card || card.querySelector('.dsa5h-pd-self')) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'dsa5h-pd-self';
  button.innerHTML = `<i class="fa-solid fa-rotate-left" inert></i> ${game.i18n.localize(P + 'Manual.Button')}`;
  button.dataset.tooltip = game.i18n.localize(P + 'Manual.Hint');
  button.addEventListener('click', event => {
    event.preventDefault();
    button.disabled = true;
    if (game.user === game.users.activeGM) manualDefense(start).catch(error => console.error(`${MODULE_ID} | Passive Verteidigung: Rücknahme`, error));
    else game.socket.emit(SOCKET, { type: 'passiveManual', startMessageId: start.id, userId: game.user.id });
  });
  card.append(button);
}

/**
 * Automatische Verteidigung zurücknehmen (#90 B, nur aktive SL): Ergebnis- und Raufen-Karte weg (nicht, wenn Schaden
 * schon angewendet ist), Verteidigungszähler zurück, Wartezustand des Systems und Reaktionsknopf wiederherstellen, damit
 * der Verteidiger wie gewohnt selbst reagiert.
 */
async function manualDefense(start, user = game.user) {
  const OpposeDSA = systemApi()?.apps?.OpposeDSA;
  const state = start?.getFlag(MODULE_ID, FLAG);
  const attackMessage = game.messages.get(start?.flags?.unopposeData?.attackMessageId);
  const { actor, speaker } = targetOf(start ?? {});
  if (!OpposeDSA || !state || !attackMessage || !actor || !['hit', 'defended'].includes(state.outcome)) return;
  if (!user?.isGM && !actor.testUserPermission(user, 'OWNER')) return;
  const linked = state.outcome === 'hit' && typeof OpposeDSA.findOpposedResultMessage === 'function'
    ? OpposeDSA.findOpposedResultMessage({ attackerMessageId: attackMessage.id, startMessageId: start.id }) : null;
  const related = [linked, game.messages.get(state.resultId), game.messages.get(state.brawlId)].filter(Boolean);
  if (related.some(message => JSON.stringify(message.flags ?? {}).includes('damageApplied'))) {
    ui.notifications.warn(P + 'Manual.Applied', { localize: true });
    return;
  }
  for (const message of related) await message.delete();
  const combatant = game.combat?.getCombatantFromActor?.(speaker);
  if (combatant && !combatant.actor?.system?.config?.defense && combatant.system.defenseCount > 0) {
    await combatant.update({ 'system.defenseCount': combatant.system.defenseCount - 1 });
  }
  const opposeFlag = { speaker: attackMessage.speaker, messageId: attackMessage.id, startMessageId: start.id };
  await actor.update(typeof OpposeDSA.opposeUpdateData === 'function' ? OpposeDSA.opposeUpdateData(opposeFlag) : { 'flags.oppose': opposeFlag });
  if (attackMessage.flags.data.unopposedStartMessage === start.id) await attackMessage.update({ 'flags.data.unopposedStartMessage': null });
  if (!start.content.includes('unopposed-button')) {
    await start.update({ content: `${start.content}<div class="flexrow"><button class="unopposed-button small-button chat-button-target" data-target="true">${game.i18n.localize('Unopposed')}</button></div>` });
  }
  await start.setFlag(MODULE_ID, FLAG, { ...state, outcome: 'manual', manual: true, resultId: null, brawlId: null });
  const card = game.messages.get(state.cardId);
  gmDetails.delete(state.cardId);
  const attacker = attackMessage.speaker?.alias ?? attackMessage.alias;
  const defender = start.flags.unopposeData.targetSpeaker?.alias ?? actor.name;
  await card?.update({ content: publicContent('manual', attacker, defender, {}) });
}

/** Startnachrichten eines Angriffs, die schon passiv ausgewertet wurden. */
function passiveStarts(attackMessage) {
  if (!attackMessage) return [];
  const ids = new Set(attackMessage.flags?.data?.startMessagesList ?? []);
  // DSA7 schreibt den Schip-Neuwurf in dieselbe Nachricht und baut flags.data dabei ohne die Liste neu auf: zusätzlich
  // über die Verknüpfung der Startnachrichten suchen (nur die jüngsten Nachrichten, sie entstehen direkt nach dem Angriff).
  for (const message of game.messages.contents.slice(-200)) {
    if (message.flags?.unopposeData?.attackMessageId === attackMessage.id) ids.add(message.id);
  }
  // Zurückgenommene (#90 B) verteidigt der Held selbst; deren Schip-Neuwurf läuft wieder über das System.
  return [...ids].map(id => game.messages.get(id)).filter(message => { const state = message?.getFlag(MODULE_ID, FLAG); return state && !state.manual; });
}

async function reevaluate(attackMessageId) {
  for (const start of passiveStarts(game.messages.get(attackMessageId))) await evaluate(start, { reroll: true });
}

// Wartet kurz, bis das System am Ziel den Wartezustand gesetzt hat; false nur, wenn schon ausgewertet.
async function waitForOppose(startMessage) {
  for (let i = 0; i < 15; i++) {
    if (startMessage.getFlag(MODULE_ID, FLAG)) return false;
    if (isOpposePending(targetOf(startMessage).actor, startMessage.id)) return true;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return !startMessage.getFlag(MODULE_ID, FLAG);
}

async function onStartMessage(message, isActive) {
  if (game.user !== game.users.activeGM || !isActive() || !message.flags?.unopposeData) return;
  const attackMessage = game.messages.get(message.flags.unopposeData.attackMessageId);
  const preData = attackMessage?.flags?.data?.preData;
  // Gelegenheitsangriffe und reine Schadenswürfe löst das System selbst unverteidigt auf.
  if (!preData || preData.attackOfOpportunity || attackMessage.flags.data.postData?.options?.mode === 'damage' || preData.mode !== 'attack') return;
  if (!appliesTo(targetOf(message).actor)) return;
  if (await waitForOppose(message)) await evaluate(message);
}

/** Auswahl für Bogen und Dialog: selbst würfeln, beste Verteidigung, dann die einzelnen Optionen mit Grundwert. */
export function defenseChoices(actor) {
  const mode = defenseMode(actor);
  const choices = [
    { value: 'manual', label: game.i18n.localize(P + 'Mode.manual') },
    { value: 'best', label: game.i18n.localize(P + 'Mode.best') },
    ...baseOptions(actor).map(option => ({ value: option.id, label: game.i18n.format(P + 'Mode.option', { name: option.name, value: option.value }) })),
  ];
  // Gewählte Waffe abgelegt: Wahl bleibt gespeichert, wirkt aber wie „beste“ (chooseDefense).
  if (!choices.some(choice => choice.value === mode)) choices.push({ value: mode, label: game.i18n.localize(P + 'Mode.missing') });
  return choices.map(choice => ({ ...choice, selected: choice.value === mode }));
}

/** Menü ⋮ des Systembogens (NSC, Kreaturen, Helden): Auswahl im Dialog. */
export async function openDefenseDialog(actor) {
  if (!actor?.isOwner) return;
  const options = defenseChoices(actor).map(choice => `<option value="${escape(choice.value)}"${choice.selected ? ' selected' : ''}>${escape(choice.label)}</option>`).join('');
  const mode = await foundry.applications.api.DialogV2.prompt({
    window: { title: game.i18n.localize(P + 'Title') },
    content: `<p>${game.i18n.format(P + 'Mode.Hint', { name: escape(actor.name) })}</p><select name="mode">${options}</select>`,
    ok: { label: game.i18n.localize(P + 'Mode.Save'), callback: (_event, button) => button.form.elements.mode.value },
    rejectClose: false,
  });
  if (mode) await setDefenseMode(actor, mode);
}

export function initPassiveDefense(isActive) {
  Hooks.on('createChatMessage', message => { onStartMessage(message, isActive).catch(error => console.error(`${MODULE_ID} | Passive Verteidigung`, error)); });
  Hooks.on('renderChatMessageHTML', decorateCard);
  game.socket.on(SOCKET, message => {
    if (message?.type === 'passiveReevaluate' && game.user === game.users.activeGM && isActive()) reevaluate(message.attackMessageId);
    if (message?.type === 'passiveManual' && game.user === game.users.activeGM) {
      manualDefense(game.messages.get(message.startMessageId), game.users.get(message.userId)).catch(error => console.error(`${MODULE_ID} | Passive Verteidigung: Rücknahme`, error));
    }
  });
  Hooks.once('ready', () => {
    const OpposeDSA = systemApi()?.apps?.OpposeDSA;
    if (typeof OpposeDSA?.handleOpposedTarget !== 'function') return;
    // Schip auf einen passiv aufgelösten Angriff: nicht den Ablauf des Systems (Verteidigung abwarten bzw. unverteidigt
    // neu auflösen), sondern bei der SL neu auswerten.
    const original = OpposeDSA.handleOpposedTarget;
    OpposeDSA.handleOpposedTarget = async function (message) {
      if (isActive() && passiveStarts(message).length) {
        if (game.user === game.users.activeGM) return reevaluate(message.id);
        return game.socket.emit(SOCKET, { type: 'passiveReevaluate', attackMessageId: message.id });
      }
      return original.call(this, message);
    };
  });
}
