/**
 * Tooltips im Bogen (Issue #52, Planung 2026-11-13): Beim Überfahren eines Namens zeigt der Bogen die Karte des Systems
 * (`GlobalToolTipHandler` aus DSA5, dieselbe Karte wie im Systembogen) – keine eigenen Texte im Modul.
 *
 * Statt jede Vorlage mit `gTooltip` zu markieren, hängt ein Listener am Bogen und erkennt die Ziele selbst:
 * - Item-Namen: Elemente mit `data-action="itemEdit"` innerhalb von `[data-item-id]` (Listen, Titelblatt-Karten, Körper),
 * - Zustände: `data-action="conditionShow"` mit `data-id` (Titelblatt links, Reiter Status),
 * - Gruppeninventar des Systems: `data-action="openLocationItem"` mit `data-uuid` (Items der Lagerorte, Besitzer ist der
 *   Lagerort-Akteur),
 * - ausdrücklich markierte Stellen `[data-dsa5h-tt]` (Name unter dem Wappenschild, Zustände der Mitglieder im
 *   Gruppenbogen mit `data-actor-id`).
 * Elemente mit eigenem Tooltip (`data-tooltip`, z. B. Rüstungsaufschlüsselung) behalten ihn; ein Tooltip, der nur den
 * Namen wiederholt, weicht der Karte.
 *
 * Zur Laufzeit geprüft (Einstellung wirkt sofort): Benutzer-Einstellung `itemTooltips`, kein Touch, nicht auf Tablet
 * oder Smartphone (Körperklassen dsa5h-phone/dsa5h-tablet). Die Höhe begrenzt die Klasse `dsa5h-tt` am Tooltip (CSS
 * Abschnitt 6); ist Text abgeschnitten, steht ein Hinweis darunter. Angeheftet (Mittelklick, Foundry) ist er scrollbar.
 */
const MODULE_ID = 'dsa5-helpers';
export const TOOLTIP_SETTING = 'itemTooltips';

/** Ziele im Bogen (siehe Kopfkommentar). */
export const TOOLTIP_TARGETS = '[data-action="itemEdit"], [data-action="conditionShow"], [data-action="openLocationItem"], [data-dsa5h-tt]';

// Item-Typ → Kategorie des System-Handlers. Unbekannte Typen laufen über „inventory“ (Bibliotheks-Karte jedes Items).
const CATEGORY = {
  skill: 'skill', combatskill: 'skill',
  spell: 'spell', ritual: 'spell', liturgy: 'spell', ceremony: 'spell', magictrick: 'spell', blessing: 'spell',
  specialability: 'specialability', trait: 'specialability',
  advantage: 'advantage', disadvantage: 'disadvantage',
};
// Ohne sinnvolle Karte: Münzen, Sammelproben.
const SKIP_TYPES = new Set(['money', 'aggregatedTest']);

export function registerItemTooltipSetting() {
  game.settings.register(MODULE_ID, TOOLTIP_SETTING, {
    name: 'DSA5HELPERS.Settings.ItemTooltips.Name',
    hint: 'DSA5HELPERS.Settings.ItemTooltips.Hint',
    scope: 'user',
    config: false,
    type: Boolean,
    // Seit 8.1.0 standardmäßig aus (Opt-in je Spieler): die Karten sind groß und verdecken sonst die Liste.
    default: false,
    // Abgelegte Namens-Tooltips (siehe onOver) kommen beim Neuzeichnen aus der Vorlage zurück.
    onChange: () => {
      for (const app of foundry.applications.instances.values()) if (app.rendered && app.element?.classList.contains('dsa5-helpers-sheet')) app.render();
    },
  });
}

function enabled() {
  const body = globalThis.document?.body;
  if (body?.classList.contains('dsa5h-phone') || body?.classList.contains('dsa5h-tablet')) return false;
  try { return game.settings.get(MODULE_ID, TOOLTIP_SETTING) === true; } catch { return false; }
}

/** Was soll das Element zeigen? → { actor, category, id } oder null. */
export function describeTarget(el, sheetActor) {
  const marked = el.dataset.dsa5hTt;
  const actor = el.dataset.actorId ? game.actors?.get(el.dataset.actorId) : sheetActor;
  if (!actor) return null;
  if (marked === 'effect' || el.dataset.action === 'conditionShow') {
    const id = el.dataset.id ?? el.closest('[data-id]')?.dataset.id;
    return id ? { actor, category: 'effect', id } : null;
  }
  if (el.dataset.action === 'openLocationItem') {
    const item = el.dataset.uuid ? globalThis.fromUuidSync?.(el.dataset.uuid, { strict: false }) : null;
    if (!item?.parent?.items || SKIP_TYPES.has(item.type)) return null;
    return { actor: item.parent, category: CATEGORY[item.type] ?? 'inventory', id: item.id };
  }
  const id = el.dataset.itemId ?? el.closest('[data-item-id]')?.dataset.itemId;
  const item = id ? actor.items?.get(id) : null;
  if (!item || SKIP_TYPES.has(item.type)) return null;
  return { actor, category: CATEGORY[item.type] ?? 'inventory', id };
}

// Höhenbegrenzung schon beim Aktivieren setzen, damit System und Foundry mit der endgültigen Höhe positionieren:
// TooltipManager#activate ersetzt die Klassen des Tooltips, daher ergänzt ein kurzzeitiger Wrapper die eigene Klasse.
let wrapDepth = 0;
let originalActivate = null;
function wrapActivate(tm) {
  if (wrapDepth++ > 0) return;
  originalActivate = tm.activate;
  tm.activate = function (element, options = {}) {
    const cssClass = [options.cssClass, 'dsa5h-tt'].filter(Boolean).join(' ');
    const result = originalActivate.call(this, element, { ...options, cssClass });
    markOverflow(this.tooltip);
    return result;
  };
}
function unwrapActivate(tm) {
  if (--wrapDepth > 0) return;
  delete tm.activate; // eigene Eigenschaft entfernen, die Methode der Klasse gilt wieder
  if (tm.activate !== originalActivate) tm.activate = originalActivate;
  originalActivate = null;
}

/**
 * Wie im Systembogen neben das Fenster, auf die Seite mit mehr Platz, senkrecht auf Höhe des Namens (System:
 * GlobalToolTipHandler sucht dafür `.tab.scrollable`, das unser Bogen nicht hat; ohne das läge die Karte über der
 * Liste). Passt sie auf keiner Seite neben das Fenster, bleibt Foundrys Platzierung.
 */
function placeBesideSheet(tooltip, element) {
  const sheet = element.closest('.application');
  const view = element.ownerDocument.defaultView;
  if (!sheet || !tooltip || !view) return;
  const margin = 5;
  const box = sheet.getBoundingClientRect();
  const anchor = element.getBoundingClientRect();
  const width = tooltip.offsetWidth;
  const height = tooltip.offsetHeight;
  const roomRight = view.innerWidth - box.right - margin;
  const roomLeft = box.left - margin;
  const right = roomRight >= roomLeft;
  if (Math.max(roomRight, roomLeft) < width + margin) return;
  const top = Math.min(Math.max(margin, anchor.top + anchor.height / 2 - height / 2), Math.max(margin, view.innerHeight - height - margin));
  tooltip.style.top = `${top}px`;
  tooltip.style.bottom = '';
  if (right) {
    tooltip.style.left = `${box.right + margin}px`;
    tooltip.style.right = '';
  } else {
    tooltip.style.right = `${view.innerWidth - box.left + margin}px`;
    tooltip.style.left = '';
  }
}

/** Hinweis unter abgeschnittenem Text (Inhalt = erstes Kind, begrenzt per CSS). */
function markOverflow(tooltip) {
  const content = tooltip?.firstElementChild;
  if (!content || content.scrollHeight <= content.clientHeight + 2) return;
  const hint = document.createElement('p');
  hint.className = 'dsa5h-tt-more';
  hint.textContent = game.i18n.localize('DSA5HELPERS.Tooltip.More');
  tooltip.append(hint);
}

// Regel und Beschreibung des Items unter der Karte des Systems (Talente, Sonderfertigkeiten, Vor- und Nachteile): Texte
// kommen aus den Daten des Items (Inhaltsmodul), das Modul bringt keine eigenen mit. Was die Karte schon enthält, entfällt.
const DETAIL_CATEGORIES = new Set(['skill', 'specialability', 'advantage', 'disadvantage']);
async function appendDetails(tooltip, target) {
  if (!tooltip || !DETAIL_CATEGORIES.has(target.category)) return;
  const item = target.actor?.items?.get(target.id);
  const enrich = foundry.applications?.ux?.TextEditor?.implementation?.enrichHTML;
  if (!item || !enrich) return;
  const plain = html => String(html ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const existing = plain(tooltip.textContent);
  const parts = [['rule', 'DSA5HELPERS.Tooltip.Rule'], ['description', 'DSA5HELPERS.Tooltip.Description']];
  // Talente und Kampftechniken: Der Text steht im System als Übersetzung (SKILLdescr.<Name>, Combatskilldescr.<Name>),
  // das Item selbst hat meist keine Beschreibung; die Karte im Tooltip ist die kompakte ohne Beschreibung.
  const LOCALIZED = { skill: 'SKILLdescr', combatskill: 'Combatskilldescr' };
  const localizedKey = LOCALIZED[item.type] ? `${LOCALIZED[item.type]}.${item.name}` : null;
  const box = document.createElement('div');
  box.className = 'dsa5h-tt-details';
  for (const [field, label] of parts) {
    const raw = field === 'description' && localizedKey && game.i18n.has(localizedKey) ? game.i18n.localize(localizedKey) : item.system?.[field]?.value;
    const text = plain(raw);
    if (!text || existing.includes(text.slice(0, 60))) continue;
    const section = document.createElement('section');
    const heading = document.createElement('h2');
    heading.textContent = game.i18n.localize(label);
    const body = document.createElement('div');
    body.innerHTML = await enrich(String(raw), { secrets: false, async: true });
    section.append(heading, body);
    box.append(section);
  }
  if (!box.childElementCount) return;
  // In die Karte selbst (article.dsa-item-card trägt Hintergrund und Rahmen), sonst läge der Text außerhalb auf dem Spielfeld.
  (tooltip.querySelector('.dsa-item-card') ?? tooltip.firstElementChild ?? tooltip).append(box);
  tooltip.querySelector(':scope > .dsa5h-tt-more')?.remove();
  markOverflow(tooltip);
}

async function onOver(sheet, root, event) {
  if (event.pointerType === 'touch') return;
  const el = event.target?.closest?.(TOOLTIP_TARGETS);
  if (!el || !root.contains(el) || el.classList.contains('gTooltip')) return;
  if (event.relatedTarget && el.contains(event.relatedTarget)) return; // Wechsel zwischen Kindern desselben Namens
  if (!enabled()) return;
  // Eigener Tooltip bleibt; einer, der nur den Namen wiederholt, weicht der Karte (vor Foundrys pointerenter).
  if (el.dataset.tooltip !== undefined) {
    if (el.dataset.tooltip.trim() !== el.textContent.trim()) return;
    delete el.dataset.tooltip;
  }
  const target = describeTarget(el, sheet.actor);
  const Handler = globalThis.dsa5?.apps?.GlobalToolTipHandler ?? game.dsa5?.apps?.GlobalToolTipHandler;
  const tm = game.tooltip;
  if (!target || !Handler?.handleTooltip || !tm) return;
  // Erst nach den pointerenter-Ereignissen der Vorfahren zeigen: Foundry plant sonst das Schließen ein, weil sie
  // außerhalb des gerade aktiven Elements liegen (live 2026-11-13: Zustands-Tooltips verschwanden nach 0,5 s).
  await new Promise(resolve => setTimeout(resolve, 0));
  if (!el.isConnected || !el.matches(':hover')) return;
  el.dataset.category = target.category;
  el.dataset.id = target.id;
  wrapActivate(tm);
  try {
    await Handler.handleTooltip({ currentTarget: el }, target.actor);
    if (tm.element === el && tm.tooltip?.classList.contains('dsa5h-tt')) await appendDetails(tm.tooltip, target);
    // Erst danach platzieren: das System verschiebt die Karte nach dem Aktivieren noch selbst (bei `.tab.scrollable`).
    if (tm.element && root.contains(tm.element) && tm.tooltip?.classList.contains('dsa5h-tt')) placeBesideSheet(tm.tooltip, tm.element);
  } catch (err) {
    console.warn('dsa5-helpers | Tooltip', err);
  } finally {
    unwrapActivate(tm);
    // Der Handler merkt sich einfache Tooltips als data-tooltip-html; dann zeigte Foundry sie auch bei abgeschalteter
    // Einstellung. Wir rufen ihn bei jedem Überfahren neu auf.
    delete el.dataset.tooltipHtml;
    delete el.dataset.tooltipClass;
  }
}

/** Einmal je Bogenfenster (das Element bleibt über Neuzeichnen erhalten). */
export function bindItemTooltips(sheet) {
  const root = sheet.element;
  if (!root || root.dataset.dsa5hTooltips) return;
  root.dataset.dsa5hTooltips = '1';
  root.addEventListener('pointerover', event => onOver(sheet, root, event));
}
