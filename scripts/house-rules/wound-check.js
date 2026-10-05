// Hausregel „Wundeinschätzung“ (Idee und erste Umsetzung als World Script + Makro: Knigge; ins Modul übernommen
// 2026-10-05). Ein Held schätzt mit einer verdeckten Probe auf Heilkunde Wunden ein, wie schwer ein markiertes Ziel
// verletzt ist; je mehr QS, desto genauer. Das Ergebnis merkt sich der Held (Actor-Flag je Ziel), bis sich die LeP des
// Ziels um mindestens ein Viertel geändert haben. Logik, Staffel und Texte wie im Original, nur lokalisiert und mit
// Modul-Flags statt „world“.
const MODULE_ID = 'dsa5-helpers';
const PREFIX = 'DSA5HELPERS.HouseRules.woundCheck.';
// Ab dieser LeP-Änderung (Anteil an max) gilt eine Einschätzung als veraltet.
export const STALE = 0.25;
// Probe nur für den Würfelnden sichtbar.
const MODE = 'self';

const loc = (key, data) => data ? game.i18n.format(PREFIX + key, data) : game.i18n.localize(PREFIX + key);

/** Text zur Einschätzung je QS (Staffel der Hausregel). `t(key, data)` liefert die Texte (Test-Harness). */
export function woundText(qs, cur, max, t = loc) {
  if (qs <= 0) return t('Text.none');
  const pct = (cur / max) * 100;
  const condition = t('Text.' + (
    cur <= 0 ? 'incapacitated'
      : pct <= 25 ? 'critical'
        : pct <= 50 ? 'severe'
          : pct <= 75 ? 'marked'
            : pct < 100 ? 'light' : 'unhurt'));
  const span = step => {
    const lo = Math.max(0, Math.floor(cur / step) * step);
    return `${lo}–${Math.min(max, lo + step)}`;
  };
  if (qs === 1) return t(cur >= max ? 'Text.unhurt' : 'Text.hurt');
  if (qs === 2) return condition;
  if (qs === 3) return `${condition}<br><small>${t('Text.range', { range: span(10) })}</small>`;
  if (qs === 4) return `${condition}<br><small>${t('Text.range', { range: span(5) })}</small>`;
  return `${condition}<br><small>${t('Text.about', { lep: cur })}</small>`;
}

/** Ist eine gemerkte Einschätzung (Flag) für den aktuellen LeP-Stand noch gültig? */
export function isFresh(check, cur, max) {
  return !!check && Math.abs(cur - check.lep) < STALE * max;
}

const targetKey = actor => actor.isToken ? actor.token.id : actor.id;

/** Talent „Heilkunde Wunden“ des Helden — wie im Original per Name (deutsch oder lokalisierte System-ID). */
export function findTreatWounds(actor) {
  const names = new Set(['heilkunde wunden', game.i18n.localize('LocalizedIDs.treatWounds').toLowerCase()]);
  return actor?.items?.find(i => i.type === 'skill' && names.has(i.name.trim().toLowerCase()));
}

/**
 * Wunden des markierten Ziels einschätzen (Ablauf wie Knigges Makro).
 * @param {Actor} [viewer]  Der einschätzende Held; ohne Angabe der zugewiesene Charakter bzw. das gewählte Token.
 */
export async function woundCheck(viewer) {
  viewer ??= game.user.character ?? canvas.tokens.controlled[0]?.actor;
  const target = game.user.targets.first();
  if (!target?.actor) return ui.notifications.warn(loc('NoTarget'));
  if (!viewer) return ui.notifications.warn(loc('NoViewer'));
  const skill = findTreatWounds(viewer);
  if (!skill) return ui.notifications.warn(loc('NoSkill', { name: viewer.name }));

  const tActor = target.actor;
  const key = targetKey(tActor);
  const wounds = tActor.system.status.wounds;
  const cur = Number(wounds.value);
  const max = Number(wounds.max);

  const old = viewer.getFlag(MODULE_ID, `woundCheck.${key}`);
  if (isFresh(old, cur, max)) {
    // Ohne „Token Note Hover“ sieht der Spieler das Ergebnis sonst nirgends — deshalb hier mit ausgeben.
    const text = woundText(old.qs, cur, max).replace(/<br>/g, ' · ').replace(/<[^>]+>/g, '');
    return ui.notifications.info(loc('AlreadyChecked', { name: target.name, text }));
  }

  // Ohne aktive Effekte des Talents würfeln (wie im Original), sonst gelten z. B. Boni aus Effekten doppelt.
  const rollSkill = skill.clone({ effects: [] }, { keepId: true });
  const setup = await viewer.setupSkill(rollSkill, { subtitle: ` (${target.name})`, messageMode: MODE }, undefined);
  if (!setup) return;
  setup.testData.opposable = false;
  setup.cardOptions.messageMode = MODE; // überschreibt eine Änderung im Dialog

  const roll = await viewer.basicTest(setup);
  const result = roll?.result;
  if (!result) return;

  const qs = result.successLevel > 0 ? Number(result.qualityStep ?? 0) : 0;
  await viewer.setFlag(MODULE_ID, `woundCheck.${key}`, { qs, lep: cur, max, time: Date.now() });

  const speaker = ChatMessage.getSpeaker({ actor: viewer });
  const esc = foundry.utils.escapeHTML;
  // Info für den Spieler
  await ChatMessage.create({
    speaker,
    whisper: [game.user.id],
    flags: { [MODULE_ID]: { woundInfo: 'player' } },
    content: `<div class="dsa5-health-estimate"><strong>${loc('ChatTitle', { name: esc(target.name) })}</strong><br>${woundText(qs, cur, max)}</div>`,
  });
  // Kurzinfo für die SL
  await ChatMessage.create({
    speaker,
    whisper: game.users.filter(u => u.isGM).map(u => u.id),
    flags: { [MODULE_ID]: { woundInfo: 'gm' } },
    content: `<em>${loc('ChatGM', { viewer: esc(viewer.name), name: esc(target.name) })}</em>`,
  });
}

/**
 * Hooks der Hausregel. `isActive()` wird bei jedem Aufruf gefragt, damit das Ein-/Ausschalten im Hausregelbuch ohne
 * Neuladen wirkt.
 */
export function initWoundCheck(isActive) {
  // Knopf im Token-HUD des eigenen Helden (Spieler können das HUD nur bei eigenen Tokens öffnen); wirkt auf das
  // markierte Ziel wie das Makro. Nur, wenn der Held Heilkunde Wunden hat.
  Hooks.on('renderTokenHUD', (hud, element) => {
    const actor = hud.document?.actor;
    if (!isActive() || !actor || !findTreatWounds(actor)) return;
    const html = element instanceof HTMLElement ? element : element?.[0];
    const column = html?.querySelector('.col.left');
    if (!column || column.querySelector('.dsa5h-wound-check')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'control-icon dsa5h-wound-check';
    button.dataset.tooltip = loc('HudButton');
    button.setAttribute('aria-label', loc('HudButton'));
    button.innerHTML = '<i class="fas fa-heart-pulse" inert></i>';
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      woundCheck(actor);
    });
    column.append(button);
  });

  // Hover-Anzeige über das Modul „Token Note Hover“ (falls installiert), wie im World Script.
  Hooks.on('tokenNoteHover.createContent', (actor, _displayImages, contentMap) => {
    if (!isActive() || !actor) return;
    const viewer = game.user.character ?? canvas.tokens.controlled[0]?.actor ?? null;
    if (!viewer || viewer.id === actor.id) return;
    const box = text => { contentMap.content = `<div class="dsa5-health-estimate"><strong>${loc('HoverTitle')}</strong><br>${text}</div>`; };
    const check = viewer.getFlag(MODULE_ID, `woundCheck.${targetKey(actor)}`);
    if (!check) return box(loc('NotChecked'));
    const wounds = actor.system?.status?.wounds;
    const cur = Number(wounds?.value);
    const max = Number(wounds?.max);
    if (!Number.isFinite(cur) || !(max > 0)) return;
    if (!isFresh(check, cur, max)) return box(loc('Stale'));
    box(woundText(check.qs, cur, max));
  });

  // Chatnachrichten: „An: …“ entfernen, SL-Hinweis vor Spielern verbergen.
  Hooks.on('renderChatMessageHTML', (message, html) => {
    const kind = message.getFlag(MODULE_ID, 'woundInfo');
    if (!kind) return;
    html.querySelector('.whisper-to')?.remove();
    if (kind === 'gm' && !game.user.isGM) html.style.display = 'none';
  });
}
