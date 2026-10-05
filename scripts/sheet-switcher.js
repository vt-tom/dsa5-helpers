// Bogen-Umschalter (Nutzerwunsch 2026-10-05): Knopf in der Titelleiste jedes Heldenbogens (Typ `character`), der die
// Bogenwahl in einem Klick erreichbar macht — statt ⋮ → „Bogen konfigurieren“ → Auswahlliste. Gewechselt wird nur
// über Foundrys eigenen Weg, das Flag `core.sheetClass` am Akteur (ClientDocument#_onUpdate → _onSheetChange schließt
// den alten Bogen und öffnet den neuen). Die Wahl gilt wie im Foundry-Dialog für alle Nutzer dieses Akteurs.

// Nicht im Umschalter: Händlerbogen und Charakterbauer (dsa5-core, auch die Vollbild-Variante) — kein Bogen zum
// Spielen, der Bauer hat seinen eigenen Rückweg (preChargenSheet). „Default Sheet“ ('') taucht ohnehin nicht auf.
const EXCLUDED = ['dsa5.CharacterMerchantSheetDSA5'];
const EXCLUDED_PREFIX = 'dsa5.DSACharBuilder';
// Der Systembogen heißt im Umschalter „Systemstandard“ statt „DSA5 - Held“.
const RENAMED = { 'dsa5.ActorSheetdsa5Character': 'DSA5HELPERS.SheetSwitcher.SystemSheet' };

// Linke obere Ecke des alten Fensters je Akteur — der neue Bogen öffnet sich an derselben Stelle statt in der Mitte.
const pendingPosition = new Map();

function switchableSheets(actor) {
  const sheets = CONFIG.Actor.sheetClasses?.[actor.type] ?? {};
  return Object.values(sheets).filter(s => s.canConfigure !== false && !EXCLUDED.includes(s.id) && !s.id.startsWith(EXCLUDED_PREFIX));
}

function sheetLabel(sheet) {
  return RENAMED[sheet.id] ? game.i18n.localize(RENAMED[sheet.id]) : sheet.label;
}

async function switchSheet(app, id) {
  const actor = app.document;
  const { left, top } = app.position ?? {};
  if (Number.isFinite(left) && Number.isFinite(top)) pendingPosition.set(actor.uuid, { left, top });
  await actor.setFlag('core', 'sheetClass', id);
}

function openMenu(app, button) {
  const current = app.constructor;
  const entries = switchableSheets(app.document).map(sheet => {
    const active = sheet.cls === current;
    return {
      label: sheetLabel(sheet),
      icon: `<i class="fas fa-${active ? 'check' : 'book-open'} fa-fw"></i>`,
      onClick: () => { if (!active) switchSheet(app, sheet.id); },
    };
  });
  const menu = new foundry.applications.ux.ContextMenu(app.element, '', entries, { jQuery: false, fixed: true, eventName: 'none' });
  ui.context?.close();
  menu.render(button, { animate: true });
  ui.context = menu;
}

function onRenderSheet(app, element, _context, options) {
  const actor = app.document;
  if (!options.isFirstRender || actor?.documentName !== 'Actor' || actor.type !== 'character') return;

  const position = pendingPosition.get(actor.uuid);
  if (position) {
    pendingPosition.delete(actor.uuid);
    app.setPosition(position);
  }

  const id = Object.values(CONFIG.Actor.sheetClasses?.[actor.type] ?? {}).find(s => s.cls === app.constructor)?.id ?? '';
  if (!actor.isOwner || id.startsWith(EXCLUDED_PREFIX) || switchableSheets(actor).length < 2) return;
  const anchor = app.window?.controls ?? app.window?.close;
  if (!anchor || element.querySelector('.dsa5h-sheet-switcher')) return;
  const label = game.i18n.localize('DSA5HELPERS.SheetSwitcher.Label');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'header-control icon fa-solid fa-arrow-right-arrow-left dsa5h-sheet-switcher';
  button.dataset.tooltip = label;
  button.setAttribute('aria-label', label);
  button.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    openMenu(app, button);
  });
  anchor.before(button);
}

export function initSheetSwitcher() {
  // render<Klasse> feuert für jede Klasse der Vererbungskette — ActorSheetV2 trifft System-, Helfer- und fremde Bögen.
  Hooks.on('renderActorSheetV2', onRenderSheet);
}
