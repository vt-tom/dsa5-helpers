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
// auf eine Verteidigung wartet (flags.opposes; greift ein Spieler ein nicht verknüpftes Token an, kommt das Flag bei der
// SL nicht immer an — dann nach kurzer Wartezeit trotzdem auswerten und ein spätes Flag wieder löschen). Dann:
// Treffer → OpposeDSA.resolveUndefended (Schaden wie bisher), abgewehrt → Wartezustand lösen, Reaktionsknopf weg.
// Schip auf den Angriff: Das System zeichnet die Angriffskarte neu und ruft handleOpposedTarget; wir werten dann neu aus.
//
// Weitere Nutzer-Entscheidungen 2026-10-28: Nah- und Fernkampf (Fernkampf nur Ausweichen und Schild); eine Verteidigung
// zählt als verbraucht, wenn die AT gelungen ist; eine 1 im Angriff (Krit, auch unbestätigt) halbiert V, normal gerundet
// — das setzt das System als postData.halfDefense.
import { systemApi } from '../compat/runtime.js';

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
 * @returns {{outcome: 'hit'|'defended'|'miss', roll?: number}}
 */
export function resolveDefense({ successLevel, roll, defense }) {
  if (!(successLevel > 0)) return { outcome: 'miss' };
  return { outcome: Number(roll) <= Number(defense) ? 'defended' : 'hit', roll };
}

/** Höchste Verteidigung (keine Summe, kein Durchschnitt); ohne Option null. */
export function bestDefense(options) {
  return options.reduce((best, option) => (!best || option.value > best.value ? option : best), null);
}

/** Gewählte Option, wenn sie gegen diesen Angriff zulässig ist, sonst die beste. */
export function chooseDefense(options, mode) {
  return options.find(option => option.id === mode) ?? bestDefense(options);
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
    return { id: option.id, name: option.name, base: option.value, conditions, multiple, malus, half: !!postData.halfDefense, value: Math.round(total) };
  });
}

function targetOf(startMessage) {
  const speaker = startMessage.flags.unopposeData?.targetSpeaker;
  const token = game.scenes.get(speaker?.scene)?.tokens.get(speaker?.token) ?? canvas?.tokens?.get(speaker?.token)?.document;
  return { speaker: { token: speaker?.token, scene: speaker?.scene, actor: token?.actor?.id }, token, actor: token?.actor };
}

const escape = text => foundry.utils.escapeHTML(String(text ?? ''));

function publicContent(outcome, attacker, defender, result) {
  const text = game.i18n.format(P + 'Chat.' + outcome, { attacker: escape(attacker), defender: escape(defender) });
  const roll = result.roll ? `<span class="dsa5h-pd-roll">${game.i18n.format(P + 'Chat.Roll', { roll: result.roll })}</span>` : '';
  return `<div class="dsa5h-pd-card dsa5h-pd-${outcome}"><b>${game.i18n.localize(P + 'Title')}</b><p>${text}</p>${roll}</div>`;
}

function gmContent(result, options, chosen, at, d20) {
  const rows = options.map(option => `<tr${option === chosen ? ' class="dsa5h-pd-chosen"' : ''}><td>${escape(option.name)}</td><td>${option.base}</td><td>${option.conditions + option.multiple + option.malus}${option.half ? ' ×½' : ''}</td><td><b>${option.value}</b></td></tr>`).join('');
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
  if (postData.successLevel > 0) {
    options = await defenseOptions(actor, speaker, attackMessage);
    chosen = chooseDefense(options, defenseMode(actor));
    const roll = (await new Roll('1d20').evaluate()).total;
    result = resolveDefense({ successLevel: postData.successLevel, roll, defense: chosen?.value ?? 0 });
    // Verbraucht, wenn die AT gelungen ist (Nutzer 2026-10-28) — wie im System, wo man nur gelungene Angriffe abwehrt.
    if (!reroll && game.combat) await game.combat.updateDefenseCount(speaker);
  }
  // Schip vorher Treffer, jetzt nicht mehr: die Ergebniskarte des Systems entfernen.
  if (previous?.outcome === 'hit' && result.outcome !== 'hit') {
    await OpposeDSA.findOpposedResultMessage({ attackerMessageId: attackMessage.id, startMessageId: startMessage.id })?.delete();
  }
  const attacker = attackMessage.speaker?.alias ?? attackMessage.alias;
  const defender = startMessage.flags.unopposeData.targetSpeaker?.alias ?? actor.name;
  if (result.outcome === 'hit') {
    await OpposeDSA.resolveUndefended(startMessage, game.i18n.format(P + 'Chat.Roll', { roll: result.roll }));
  } else {
    await OpposeDSA.clearOpposed(actor, { startMessageId: startMessage.id });
    await OpposeDSA.hideReactionButton(startMessage.id);
  }
  // Karten-ID vorab, damit die Rechnung der SL schon beim ersten Zeichnen bereitliegt.
  const card = previous?.cardId && game.messages.get(previous.cardId);
  const cardId = card?.id ?? foundry.utils.randomID();
  if (result.roll) gmDetails.set(cardId, gmContent(result, options, chosen, die.tar, die.res));
  else gmDetails.delete(cardId);
  const content = publicContent(result.outcome, attacker, defender, result);
  if (card) await card.update({ content });
  else await ChatMessage.create({ _id: cardId, content, speaker: attackMessage.speaker }, { keepId: true });
  await startMessage.setFlag(MODULE_ID, FLAG, { outcome: result.outcome, cardId });
  // Spät eintreffender Wartezustand (Spielerangriff über den Socket des Systems): wieder lösen.
  if (result.outcome !== 'hit') setTimeout(() => {
    if (targetOf(startMessage).actor?.flags?.opposes?.[startMessage.id]) OpposeDSA.clearOpposed(actor, { startMessageId: startMessage.id });
  }, 3000);
}

/** Rechnung an der Karte, nur im Client der SL. */
function decorateCard(message, html) {
  const detail = game.user.isGM && gmDetails.get(message.id);
  if (!detail) return;
  const card = html.querySelector('.dsa5h-pd-card');
  if (!card || card.querySelector('.dsa5h-pd-gm')) return;
  const box = document.createElement('details');
  box.className = 'dsa5h-pd-gm';
  box.innerHTML = `<summary>${game.i18n.localize(P + 'Chat.GMTitle')}</summary>${detail}`;
  card.append(box);
}

/** Startnachrichten eines Angriffs, die schon passiv ausgewertet wurden. */
function passiveStarts(attackMessage) {
  return (attackMessage?.flags?.data?.startMessagesList ?? []).map(id => game.messages.get(id)).filter(message => message?.getFlag(MODULE_ID, FLAG));
}

async function reevaluate(attackMessageId) {
  for (const start of passiveStarts(game.messages.get(attackMessageId))) await evaluate(start, { reroll: true });
}

// Wartet kurz, bis das System am Ziel den Wartezustand gesetzt hat; false nur, wenn schon ausgewertet.
async function waitForOppose(startMessage) {
  for (let i = 0; i < 15; i++) {
    if (startMessage.getFlag(MODULE_ID, FLAG)) return false;
    if (targetOf(startMessage).actor?.flags?.opposes?.[startMessage.id]) return true;
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
