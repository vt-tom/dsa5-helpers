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

// Vorschau beim Darüberfahren (Nutzerwunsch 2026-10-05): Beim Öffnen des Menüs werden alle anderen Bögen einmal
// unsichtbar an derselben Stelle aufgebaut (echte Instanzen, kein Bild, nacheinander). Fährt man über einen Eintrag,
// wird dieser Bogen eingeblendet und der aktuelle ausgeblendet — als hätte man schon gewechselt; klicken lässt sich die
// Vorschau nicht. Verlassen des Menüs zeigt wieder den aktuellen Bogen, Schließen des Menüs verwirft die Vorschauen.
// Nur mit Maus/Hover; auf Touch-Geräten (Mobil-Branch) gibt es keine Vorschau.
const PREVIEW_CLASS = 'dsa5h-sheet-preview';
const SHOWN_CLASS = 'dsa5h-preview-shown';
const HIDDEN_CLASS = 'dsa5h-preview-hidden';

function createPreviews(app, sheets) {
  const { left, top } = app.position ?? {};
  const previews = new Map();
  let wanted = null;
  let closed = false;
  let switching = null;

  const show = id => {
    wanted = id;
    const preview = previews.get(id);
    for (const other of previews.values()) other.element?.classList.toggle(SHOWN_CLASS, other === preview && other.rendered);
    app.element?.classList.toggle(HIDDEN_CLASS, !!preview?.rendered && id === wanted);
  };

  // Nacheinander aufbauen, damit das Menü sofort steht und schwache Rechner nicht alle Bögen gleichzeitig rendern.
  const build = async () => {
    for (const sheet of sheets) {
      if (closed) return;
      const preview = new sheet.cls({
        document: app.document,
        id: 'dsa5h-preview-{id}',
        classes: [PREVIEW_CLASS],
        position: { left, top },
        form: { submitOnClose: false },
      });
      previews.set(sheet.id, preview);
      try {
        await preview.render({ force: true });
      } catch (err) {
        console.warn('DSA5 Helpers | Bogen-Vorschau fehlgeschlagen:', sheet.id, err);
      }
      // Menü inzwischen zu: dieser Bogen war nie sichtbar, also auch beim Wechsel auf ihn schließen — Foundrys
      // _onSheetChange hat die Fenster des Akteurs womöglich schon geschlossen, bevor er fertig war.
      if (closed) {
        preview.close({ animate: false });
        return;
      }
      if (wanted === sheet.id) show(sheet.id);
    }
  };
  build();

  return {
    show,
    hide: () => show(null),
    switchTo: id => { switching = id; },
    // Beim Wechsel bleibt die gewählte Vorschau stehen, bis Foundry den neuen Bogen öffnet (_onSheetChange schließt
    // alle Fenster des Akteurs, also auch sie) — sonst blitzt der alte Bogen kurz auf.
    dispose: () => {
      closed = true;
      for (const [id, preview] of previews) if (id !== switching && preview.rendered) preview.close({ animate: false });
      if (!switching) app.element?.classList.remove(HIDDEN_CLASS);
    },
  };
}

function openMenu(app, button) {
  const current = app.constructor;
  const sheets = switchableSheets(app.document);
  const others = sheets.filter(sheet => sheet.cls !== current);
  const previews = matchMedia('(hover: hover)').matches ? createPreviews(app, others) : null;
  const entries = sheets.map(sheet => {
    const active = sheet.cls === current;
    return {
      label: sheetLabel(sheet),
      icon: `<i class="fas fa-${active ? 'check' : 'book-open'} fa-fw"></i>`,
      classes: `dsa5h-sheet-option${active ? ' dsa5h-sheet-current' : ''}`,
      onClick: () => {
        if (active) return;
        previews?.switchTo(sheet.id);
        switchSheet(app, sheet.id).finally(() => app.element?.classList.remove(HIDDEN_CLASS));
      },
    };
  });
  const menu = new foundry.applications.ux.ContextMenu(app.element, '', entries, {
    jQuery: false, fixed: true, eventName: 'none',
    onClose: () => previews?.dispose(),
  });
  ui.context?.close();
  menu.render(button, { animate: true }).then(() => {
    if (!previews || !menu.element) return;
    menu.element.querySelectorAll('.dsa5h-sheet-option').forEach((li, i) => {
      li.addEventListener('pointerenter', () => previews.show(sheets[i].cls === current ? null : sheets[i].id));
    });
    menu.element.addEventListener('pointerleave', () => previews.hide());
  });
  ui.context = menu;
}

function onRenderSheet(app, element, _context, options) {
  const actor = app.document;
  if (app.options.classes.includes(PREVIEW_CLASS)) return;
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
