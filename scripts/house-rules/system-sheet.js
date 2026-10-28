// Hausregeln im Standardbogen des Systems (Issue #44): Einstiege für Helden- und NSC-Bögen von DSA5, ohne die Bögen
// zu überschreiben — nur über Foundrys Hooks. Wo eine Regel erscheint, legt ihr Eintrag in HOUSE_RULES fest
// (entry.system: 'skill' = Knopf an einem Talent, 'header' = Eintrag im Kopfmenü ⋮). Unser eigener Bogen hat eigene
// Knöpfe und bleibt außen vor.
// Regeln und Aktiv-Prüfung kommen aus rules.js (initSystemSheetEntries), ohne Rück-Import.
let RULES = [];
let isActive = () => false;
const ACTOR_TYPES = ['character', 'npc'];

/** Gehört der Bogen zum System (Held/NSC; ein Eintrag kann mit actorTypes weitere Typen zulassen) und nicht zu diesem Modul? */
export function isSystemSheet(app, types = ACTOR_TYPES) {
  if (!types.includes(app?.actor?.type)) return false;
  if (app.options?.classes?.includes('dsa5-helpers-sheet')) return false;
  return !!app.options?.classes?.includes('dsa5');
}

/** Einstiege der aktiven Regeln für eine Stelle ('skill' | 'header'). */
export function activeEntries(where, rules = RULES, active = isActive) {
  return rules.filter(rule => active(rule.id)).flatMap(rule => (rule.entries ?? []).filter(e => e.system === where && (e.when?.() ?? true)).map(e => ({ rule, entry: e })));
}

export function initSystemSheetEntries(rules, active) {
  RULES = rules;
  isActive = active;
  // Knopf an einem Talent (z. B. Herz an „Heilkunde Wunden“): hinter dem Namen in der Talentzeile des Systems.
  Hooks.on('renderActorSheetV2', (app, element) => {
    if (!isSystemSheet(app) || !app.isEditable) return;
    const root = element instanceof HTMLElement ? element : element?.[0];
    if (!root) return;
    for (const { rule, entry } of activeEntries('skill')) {
      const skill = entry.findSkill?.(app.actor);
      if (!skill) continue;
      // Namenszelle über den Talent-Link finden — die Zellklassen unterscheiden sich zwischen den Templates des Systems.
      const row = root.querySelector(`.item[data-item-id="${skill.id}"]`);
      const nameCell = row?.querySelector('.talentName')?.parentElement ?? row?.querySelector('.withContext');
      if (!nameCell || nameCell.querySelector(`[data-dsa5h-rule="${rule.id}"]`)) continue;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'dsa5h-house-hint dsa5h-system-house-hint';
      button.dataset.dsa5hRule = rule.id;
      button.dataset.tooltip = entry.tooltip;
      button.setAttribute('aria-label', game.i18n.localize(entry.tooltip));
      button.innerHTML = `<i class="${rule.icon}" inert></i>`;
      button.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); entry.run(app, button); });
      nameCell.append(button);
    }
  });

  // Eintrag im Kopfmenü ⋮ (z. B. „Helfen“).
  Hooks.on('getHeaderControlsActorSheetV2', (app, controls) => {
    for (const { rule, entry } of activeEntries('header')) {
      if (!isSystemSheet(app, entry.actorTypes)) continue;
      const action = `dsa5hRule-${rule.id}-${entry.label}`;
      if (controls.some(c => c.action === action)) continue;
      controls.push({
        action,
        icon: rule.icon,
        label: entry.label,
        visible: () => app.isEditable,
        onClick: () => entry.run(app),
      });
    }
  });
}

/** Offene Systembögen neu zeichnen (Regel umgeschaltet). */
export function rerenderSystemSheets() {
  for (const app of foundry.applications.instances.values()) {
    if (app.rendered && isSystemSheet(app)) app.render();
  }
}
