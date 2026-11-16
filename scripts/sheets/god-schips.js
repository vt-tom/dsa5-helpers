// Götterschips im Kopf (Issue #89, Variante C, Nutzerentscheidung 2026-11-16): Zusatz-Schips anderer Module (Hook
// dsa5.prepareActorSchips des Systems, z. B. „Götter Aventuriens 2“) kommen je Schip einzeln; wir fassen sie je Pfad
// zusammen und zeigen je Gott ein Symbol mit „verfügbar/gesamt“. Klick gibt einen aus, Rechtsklick stellt einen wieder
// her. Reicht der Platz nicht (Plakette im Kopf, Titelblatt-Leiste, Smartphone), verschwinden hintere Götter hinter
// „+n“; Überfahren zeigt die Übersicht aller Götter, Klick bzw. Tippen heftet sie an mit − / + je Gott.
// Click-Dummy: clickdummy/script.js fatePointsRow()/fitGodSchips(), mobil clickdummy/mobile/heldenbogen.html.

// Name des Gottes: das Modul liefert als Tooltip „…GodSchip.<Gott>.Description“; gibt es daneben „….Name“, nehmen wir
// den, sonst den Schlüssel aus dem Pfad (flags.dsa5.specialPoints.<Gott>.current).
function schipName(entry) {
  const nameKey = typeof entry.tooltip === 'string' ? entry.tooltip.replace(/\.Description$/, '.Name') : '';
  if (nameKey && nameKey !== entry.tooltip && game.i18n.has(nameKey)) return game.i18n.localize(nameKey);
  const parts = String(entry.path ?? '').split('.');
  return parts.at(-1) === 'current' ? parts.at(-2) : parts.at(-1) || '?';
}

const getPath = (object, path) => String(path).split('.').reduce((value, key) => value?.[key], object);

export function groupGodSchips(extraSchips = [], actor) {
  const groups = new Map();
  for (const entry of extraSchips) {
    if (!entry?.path) continue;
    let group = groups.get(entry.path);
    if (!group) {
      group = { path: entry.path, name: schipName(entry), max: 0, fullStyle: '', emptyStyle: '', tooltip: entry.tooltip, tooltipClass: entry.tooltipClass ?? '' };
      groups.set(entry.path, group);
    }
    group.max += 1;
    const full = String(entry.cssClass ?? '').split(/\s+/).includes('fullSchip');
    if (full && !group.fullStyle) group.fullStyle = entry.style ?? '';
    if (!full && !group.emptyStyle) group.emptyStyle = entry.style ?? '';
  }
  return [...groups.values()].map(group => {
    const stored = Number(getPath(actor, group.path));
    const current = Number.isFinite(stored) ? Math.max(0, Math.min(group.max, stored)) : 0;
    const style = current > 0 ? group.fullStyle || group.emptyStyle : group.emptyStyle || group.fullStyle;
    return { ...group, current, style, empty: current <= 0 };
  });
}

// Spenden bzw. Wiederherstellen eines Schips (Pfad und Grenzen kommen aus den Daten des Hooks).
export function changeGodSchip(actor, path, delta) {
  const group = groupGodSchips(actor.extraSchipshtml?.() ?? [], actor).find(g => g.path === path);
  if (!group) return null;
  const next = Math.max(0, Math.min(group.max, group.current + delta));
  return next === group.current ? null : actor.update({ [path]: next });
}

// Messung nach dem Rendern: hintere Götter ausblenden, bis die Zeile passt; „+n“ zeigt, wie viele fehlen.
export function fitGodSchips(row) {
  if (!row?.isConnected) return;
  const gods = [...row.querySelectorAll('.dsa5h-god-schip')];
  const more = row.querySelector('.dsa5h-god-more');
  if (!more) return;
  gods.forEach(button => { button.hidden = false; });
  more.hidden = true;
  let hidden = 0;
  while (row.scrollWidth > row.clientWidth + 1 && hidden < gods.length) {
    gods[gods.length - 1 - hidden].hidden = true;
    hidden += 1;
    more.hidden = false;
    more.textContent = `+${hidden}`;
  }
  more.setAttribute('aria-label', game.i18n.format('DSA5HELPERS.GodSchipsMore', { count: hidden }));
}

let overview = null;

export function closeGodOverview() {
  overview?.abort.abort();
  overview?.panel.remove();
  overview?.anchor?.setAttribute('aria-expanded', 'false');
  overview = null;
}

// Übersicht aller Götter: beim Überfahren als Tooltip (pinned = false), per Klick/Tippen angeheftet mit − / +.
export function openGodOverview(sheet, anchor, pinned) {
  if (overview?.pinned && pinned && overview.sheet === sheet) return closeGodOverview();
  closeGodOverview();
  const abort = new AbortController();
  const panel = document.createElement('div');
  panel.className = 'dsa5h-god-pop';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', game.i18n.localize('DSA5HELPERS.GodSchips'));
  // Wie das Kraftspeicher-Menü: im Bogen (Tokens, Thema), per Popover in der obersten Ebene, Lage in Fensterkoordinaten.
  panel.popover = 'manual';
  sheet.element.append(panel);
  panel.showPopover?.();
  overview = { sheet, anchor, pinned, panel, abort };
  anchor.setAttribute('aria-expanded', String(pinned));
  renderGodOverview();
  panel.addEventListener('click', async event => {
    event.stopPropagation();
    const step = event.target.closest('[data-god-step]');
    if (!step) return;
    await changeGodSchip(sheet.actor, step.dataset.path, Number(step.dataset.godStep));
  }, { signal: abort.signal });
  panel.addEventListener('mouseleave', () => { if (!overview?.pinned) closeGodOverview(); }, { signal: abort.signal });
  // Klick daneben oder Escape schließt die angeheftete Übersicht.
  setTimeout(() => {
    document.addEventListener('pointerdown', event => {
      if (!panel.contains(event.target) && !event.target.closest?.('.dsa5h-god-more')) closeGodOverview();
    }, { signal: abort.signal, capture: true });
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeGodOverview(); }, { signal: abort.signal });
}

// Neu zeichnen, nach jedem Rendern des Bogens (Werte geändert, Anker neu).
export function renderGodOverview(sheet) {
  if (!overview || (sheet && overview.sheet !== sheet)) return;
  const { panel, pinned } = overview;
  const owner = overview.sheet;
  const anchor = overview.anchor?.isConnected ? overview.anchor : [...(owner.element?.querySelectorAll('.dsa5h-god-more') ?? [])].find(b => !b.hidden);
  if (!anchor) return closeGodOverview();
  overview.anchor = anchor;
  anchor.setAttribute('aria-expanded', String(pinned));
  const esc = foundry.utils?.escapeHTML ?? (s => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`));
  const groups = groupGodSchips(owner.actor.extraSchipshtml?.() ?? [], owner.actor);
  const step = (g, delta) => {
    const disabled = delta < 0 ? g.current <= 0 : g.current >= g.max;
    const key = delta < 0 ? 'DSA5HELPERS.GodSchipSpend' : 'DSA5HELPERS.GodSchipRestore';
    return `<button type="button" class="dsa5h-god-step" data-god-step="${delta}" data-path="${esc(g.path)}" aria-label="${esc(game.i18n.format(key, { name: g.name }))}"${disabled ? ' disabled' : ''}>${delta < 0 ? '−' : '+'}</button>`;
  };
  panel.innerHTML = `<div class="dsa5h-god-pop-title">${esc(game.i18n.localize('DSA5HELPERS.GodSchips'))}</div>`
    + groups.map(g => `<div class="dsa5h-god-pop-row"><span class="dsa5h-god-ico${g.empty ? ' empty' : ''}" style="${esc(g.style)}"></span><span class="dsa5h-god-pop-name">${esc(g.name)}</span>`
      + `${pinned ? step(g, -1) : ''}<b>${g.current}/${g.max}</b>${pinned ? step(g, 1) : ''}</div>`).join('')
    + (pinned ? '' : `<small class="dsa5h-god-pop-hint">${esc(game.i18n.localize('DSA5HELPERS.GodSchipsPin'))}</small>`);
  const r = anchor.getBoundingClientRect();
  const width = panel.offsetWidth;
  const below = r.bottom + 6 + panel.offsetHeight <= innerHeight - 8;
  panel.style.top = `${below ? r.bottom + 6 : Math.max(8, r.top - 6 - panel.offsetHeight)}px`;
  panel.style.left = `${Math.max(8, Math.min(innerWidth - width - 8, r.right - width))}px`;
}

export function godOverviewOpenFor(sheet, { pinned } = {}) {
  return overview?.sheet === sheet && (pinned === undefined || overview.pinned === pinned);
}
