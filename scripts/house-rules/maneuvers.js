// Hausregel „Grundmanöver“ von Paladose („Möglichkeiten des Kampfes“, Issue #45, Stufe 1 + 2; Stufe 3 in #48).
// Jeder Held darf einige Grundmanöver einsetzen; wie stark sie wirken, hängt von einer Leiteigenschaft ab (Stufen bis
// 12 / 13 / 15 / 17). Die Manöver erscheinen als auswählbare situative Modifikatoren im Probendialog des Systems
// (Hook dsa5.prepareRollSituationalModifiers) und wirken damit in jedem Bogen. Eigene Rechenlogik für Kampfproben
// gibt es nicht: AT/PA/AW über `value`, Schaden über `damageBonus`, Paradeabzug des Gegners über `dmmalus` (so rechnet
// das System auch die Finte). Zustände über die Probe hinaus (Vorstoß-Malus bis Rundenende, Verteidigungshaltung,
// Zielen) liegen als Actor-Flags vor und werden vom Hook wieder eingesetzt.
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

/** Stand für Bogen und Hook: Vorstoß-Malus dieser Runde, Verteidigungshaltung, Zielen. */
export function maneuverState(actor, current = combatKey()) {
  const s = state(actor);
  const sameCombat = entry => !!entry && !!current && entry.combat === current.combat;
  return {
    advanceMalus: sameCombat(s.advance) && s.advance.round === current.round ? Number(s.advance.malus) || 0 : 0,
    stance: !!s.stance && (!s.stance.combat || sameCombat(s.stance)),
    aim: sameCombat(s.aim) ? Number(s.aim.count) || 0 : 0,
    aimRound: sameCombat(s.aim) ? s.aim.round : null,
  };
}

const hasTargetedSF = actor => (actor?.items ?? []).some?.(i => i.type === 'specialability' && /^(gezielter angriff|targeted attack)/i.test(i.name ?? ''));

/**
 * Modifikatoren für den Probendialog. Reine Funktion bis auf die Lokalisierung (Test-Harness).
 * Stufen-Einträge eines Manövers haben dieselbe ref-Gruppe (dsa5h:<id>:…), nur einer davon ist anhakbar.
 */
export function buildModifiers(actor, context, { enabled = enabledManeuvers(), st = maneuverState(actor), t = loc, localize } = {}) {
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
    for (let x = 1; x <= max; x++) out.push({ name: label('mighty', `${at} −${x}, TP +${x}`), value: -x, damageBonus: x, selected: false, ref: { id: `${REF}mighty:${x}` } });
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
    out.push({ name: label('aim', `${t('aim.Rounds', { n })}: ${at} +${fk * n}, TP +${tp * n}`), value: fk * n, damageBonus: tp * n, selected: true, ref: { id: `${REF}aim:${n}` } });
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
  return out;
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

/** Daten für den Block im Kampf-Reiter. */
export function sheetData(actor, enabled = enabledManeuvers()) {
  const st = maneuverState(actor);
  const tierOf = id => paladoseTier(attrValue(actor, MANEUVERS[id].attr));
  const rows = enabled.map(id => {
    const m = MANEUVERS[id];
    const tier = tierOf(id);
    const value = id === 'feint' || id === 'mighty' ? `−1 … −${m.max[tier]}${id === 'mighty' ? ` / TP +${m.max[tier]}` : ''}`
      : id === 'advance' ? `+${m.table[tier][0]} / ${signed(m.table[tier][1])}`
        : id === 'stance' ? `+${m.bonus[tier]}`
          : id === 'aim' ? `+${m.table[tier][0]} / TP +${m.table[tier][1]} × ${m.table[tier][2]}`
            : `+${m.reduce[tier]}`;
    return { id, icon: m.icon, name: loc(`${id}.Name`), attr: `${attrAbbr(m.attr)} ${attrValue(actor, m.attr)}`, value };
  });
  const aimMax = MANEUVERS.aim.table[tierOf('aim')][2];
  return {
    rows,
    stance: enabled.includes('stance') ? { active: st.stance } : null,
    aim: enabled.includes('aim') ? { count: st.aim, max: aimMax, inCombat: !!combatKey() } : null,
    advanceMalus: enabled.includes('advance') ? st.advanceMalus : 0,
  };
}

/** Hooks: Modifikatoren im Probendialog, Chatnachricht nach dem Wurf, Kampfende, System-Zielen ausblenden. */
export function initManeuvers(isActive) {
  game.settings.register(MODULE_ID, SETTING, { scope: 'world', config: false, type: Object, default: {} });

  Hooks.on('dsa5.prepareRollSituationalModifiers', (actor, modifiers, context) => {
    if (!isActive() || !isActor(actor)) return;
    try { modifiers.push(...buildModifiers(actor, context)); } catch (error) { console.error(`${MODULE_ID} | Grundmanöver`, error); }
  });

  Hooks.on('createChatMessage', message => { onChatMessage(message, isActive).catch(error => console.error(`${MODULE_ID} | Grundmanöver`, error)); });

  // Kampfende: Verteidigungshaltung und Zielen der Beteiligten löschen (nur die SL schreibt).
  Hooks.on('deleteCombat', async combat => {
    if (!game.user.isGM) return;
    for (const c of combat.combatants) {
      const actor = c.actor;
      const s = state(actor);
      if (!actor || (!s.stance && !s.aim && !s.advance)) continue;
      await actor.unsetFlag(MODULE_ID, 'maneuvers');
    }
  });

  // Probendialog: nur ein Stufen-Eintrag je Manöver, Hinweis zur Kombinationsregel, System-Zielen ausblenden.
  Hooks.on('renderDSA5CombatDialog', (app, element) => {
    if (!isActive()) return;
    const root = element instanceof HTMLElement ? element : element?.[0];
    const select = root?.querySelector('select[name="situationalModifiers"]');
    const widget = select?.parentElement;
    const instance = widget?.__dsa5SituationalModifiersWidget;
    if (select && instance && !select.dataset.dsa5hManeuvers) {
      select.dataset.dsa5hManeuvers = '1';
      select.addEventListener('mousedown', event => {
        const option = event.target.closest?.('option');
        const group = maneuverGroup(option?.dataset.refId);
        if (!group || !instance.modifiers[Number(option.dataset.index)]?.selected) return;
        let changed = false;
        instance.modifiers.forEach((m, i) => {
          if (i !== Number(option.dataset.index) && maneuverGroup(m.ref?.id) === group && m.selected) { m.selected = false; changed = true; }
        });
        if (changed) { instance.refresh(); instance.dispatchChange?.(); }
      });
      if ([...select.options].some(o => maneuverGroup(o.dataset.refId))) {
        const hint = document.createElement('p');
        hint.className = 'hint dsa5h-maneuver-hint';
        hint.textContent = loc('CombineHint');
        (widget.closest('.form-group') ?? widget).after(hint);
      }
    }
    if (enabledManeuvers().includes('aim') && rollKind({ source: app.dialogData?.source, mode: app.dialogData?.mode }).kind === 'ranged') {
      const aim = root.querySelector('select[name="aim"]');
      if (aim) { aim.value = '0'; const group = aim.closest('.form-group'); if (group) group.style.display = 'none'; }
      root.querySelector('[data-action="aimButton"]')?.remove();
    }
  });
}
