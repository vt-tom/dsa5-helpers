// Grundmanöver (Paladose), Stufe 3 (#48): Folgen gezielter Treffer. Trifft ein Angriff mit „Gezielter Angriff/Schuss“
// (Modifikator dsa5h:targeted:<zone>), ergänzt der Hook finishOpposedTest die Ergebniskarte des Systems um die Folge
// aus Paladoses Tabelle — berechnet aus den SP nach Rüstung — samt Widerstandsprobe. Gesetzt wird nichts automatisch
// (Nutzer 2026-10-21): Knöpfe setzen den Zustand am Ziel, nachdem die Widerstandsprobe misslungen ist.
// Bei genau 5 SP (Auge, Hand) bzw. 8 SP (Hals) treten die fatalen Folgen schon ein (Paladose 2026-10-20).
const MODULE_ID = 'dsa5-helpers';
const PREFIX = 'DSA5HELPERS.HouseRules.maneuvers.hits.';
const ZONE_REF = /^dsa5h:targeted:([a-z]+)$/;

const loc = (key, data) => data ? game.i18n.format(PREFIX + key, data) : game.i18n.localize(PREFIX + key);

/** Widerstandsprobe je Zone. */
const RESIST = { head: 'composure', torso: 'composure', arm: 'disturb', leg: 'disturb', eye: 'death', foot: 'composure', neck: 'firstAid', hand: 'composure' };

/**
 * Folge eines gezielten Treffers: { effect: [Textschlüssel, Daten], conditions: [{ id, value }], roll?, resist }.
 * null ohne Schaden.
 */
export function hitConsequence(zone, sp) {
  sp = Number(sp) || 0;
  if (sp <= 0 || !RESIST[zone]) return null;
  const n = Math.floor(sp / 5);
  const out = { zone, sp, resist: RESIST[zone], conditions: [] };
  switch (zone) {
    case 'head':
      out.effect = n ? ['Effect.head', { n }] : ['Effect.headNone'];
      if (n) out.conditions.push({ id: 'stunned', value: n });
      break;
    case 'torso':
      out.effect = ['Effect.torso'];
      out.roll = '1d3+1';
      break;
    case 'arm':
      out.effect = ['Effect.arm'];
      break;
    case 'leg':
      out.effect = ['Effect.leg'];
      out.conditions.push({ id: 'prone', value: 1 });
      break;
    case 'eye':
      out.fatal = sp >= 5;
      out.effect = out.fatal ? ['Effect.eyeFatal'] : ['Effect.eye'];
      out.conditions.push(out.fatal ? { id: 'dead', value: 1 } : { id: 'blind', value: 1 });
      break;
    case 'foot':
      out.effect = n ? ['Effect.foot', { n }] : ['Effect.footNone'];
      if (n) out.conditions.push({ id: 'inpain', value: n });
      break;
    case 'neck':
      out.fatal = sp >= 8;
      out.effect = out.fatal ? ['Effect.neckFatal'] : ['Effect.neck'];
      out.conditions.push(out.fatal ? { id: 'dead', value: 1 } : { id: 'bleeding', value: 1 });
      if (!out.fatal) out.roll = '1d3+1';
      break;
    case 'hand':
      out.effect = sp >= 5 ? ['Effect.hand'] : ['Effect.handNone'];
      if (sp >= 5) out.conditions.push({ id: 'inpain', value: 1 });
      break;
  }
  return out;
}

/** Zone des gezielten Angriffs aus den Modifikatoren der Angriffsprobe (null ohne). */
export function targetedZone(modifiers) {
  for (const m of modifiers ?? []) {
    if (m?.selected === false) continue;
    const match = String(m?.ref?.id ?? '').match(ZONE_REF);
    if (match) return match[1];
  }
  return null;
}

const conditionName = id => {
  const effect = CONFIG.statusEffects?.find?.(e => e.id === id);
  return effect ? game.i18n.localize(effect.name) : id;
};

/** HTML-Block für die Ergebniskarte. `defender` ist der Sprecher des Ziels ({ scene, token, actor }). */
export function consequenceHtml(c, defender) {
  const esc = foundry.utils.escapeHTML;
  const zoneName = game.i18n.localize(`DSA5HELPERS.HouseRules.maneuvers.targeted.Zone.${c.zone}`);
  const target = `data-scene="${esc(defender?.scene ?? '')}" data-token="${esc(defender?.token ?? '')}" data-actor="${esc(defender?.actor ?? '')}"`;
  const buttons = c.conditions.map(({ id, value }) => `<button type="button" class="dsa5h-hit-apply" data-condition="${id}" data-value="${value}" ${target}><i class="fas fa-plus" inert></i> ${esc(conditionName(id))}${value > 1 ? ` ${value}` : ''}</button>`);
  if (c.roll) buttons.push(`<button type="button" class="dsa5h-hit-roll" data-formula="${c.roll}" data-zone="${c.zone}"><i class="fas fa-dice-d20" inert></i> ${loc('Roll')}</button>`);
  return `<div class="dsa5h-hit-consequence${c.fatal ? ' fatal' : ''}">
    <strong><i class="fas fa-crosshairs" inert></i> ${loc('Title', { zone: esc(zoneName), sp: c.sp })}</strong>
    <div>${loc(...c.effect)}</div>
    <small>${loc('Resist', { text: loc(`Resists.${c.resist}`) })}</small>
    ${buttons.length ? `<div class="dsa5h-hit-buttons">${buttons.join('')}</div>` : ''}
  </div>`;
}

async function applyCondition(button) {
  const { scene, token, actor: actorId, condition, value } = button.dataset;
  const actor = (scene && token ? game.scenes.get(scene)?.tokens.get(token)?.actor : null) ?? game.actors.get(actorId);
  if (!actor) return;
  if (!actor.isOwner) return ui.notifications.warn(loc('NotOwner'));
  await actor.addCondition(condition, Number(value) || 1);
}

async function rollExtra(button, message) {
  const zone = game.i18n.localize(`DSA5HELPERS.HouseRules.maneuvers.targeted.Zone.${button.dataset.zone}`);
  const roll = await new Roll(button.dataset.formula).evaluate();
  await roll.toMessage({ speaker: message.speaker, flavor: loc('RollFlavor', { zone }) });
}

/** Hooks: Folge in die Ergebniskarte schreiben, Knöpfe der Karte bedienen. `isActive()` = Regel und Manöver an. */
export function initHitConsequences(isActive) {
  Hooks.on('finishOpposedTest', (attacker, defender, opposedResult) => {
    if (!isActive() || opposedResult?.winner !== 'attacker' || !opposedResult.damage) return;
    try {
      const zone = targetedZone(game.messages.get(attacker?.messageId)?.flags?.data?.preData?.situationalModifiers);
      const c = zone && hitConsequence(zone, opposedResult.damage.value);
      if (!c) return;
      opposedResult.other ??= [];
      opposedResult.other.push(consequenceHtml(c, defender?.speaker));
    } catch (error) { console.error(`${MODULE_ID} | Trefferfolgen`, error); }
  });

  Hooks.on('renderChatMessageHTML', (message, html) => {
    for (const button of html.querySelectorAll('.dsa5h-hit-apply')) {
      button.addEventListener('click', event => { event.preventDefault(); applyCondition(button).catch(error => console.error(`${MODULE_ID} | Trefferfolgen`, error)); });
    }
    for (const button of html.querySelectorAll('.dsa5h-hit-roll')) {
      button.addEventListener('click', event => { event.preventDefault(); rollExtra(button, message).catch(error => console.error(`${MODULE_ID} | Trefferfolgen`, error)); });
    }
  });
}
