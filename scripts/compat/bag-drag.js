// Behälterfenster des Systems (Issue #72): Die Inhaltsfelder (.slot) im Reiter „Behälter“ lassen sich im System nicht
// ziehen — dort kommt ein Gegenstand nur per Rechtsklick heraus. Der Systembogen zeigt den Inhalt zusätzlich als
// ziehbare Zeilen im Inventar; unser Bogen zeigt Behälter als Kacheln, der Inhalt steht nur im Behälterfenster.
// Darum machen wir die Felder dort ziehbar, mit denselben Ziehdaten wie der Systembogen (item.toDragData()). Das
// Ablegen erledigen die vorhandenen Handler des Systems: im Bogen _onDropItem (auf eine Behälterkachel → parent_id
// des Behälters, sonst 0 = ins Inventar), in einem anderen Behälterfenster _handleDrop.
//
// Das System öffnet den Gegenstand schon beim Drücken der linken Maustaste (mousedown) — das finge jedes Ziehen ab.
// Linke Taste öffnet deshalb erst beim Klick; Rechtsklick (herausnehmen) bleibt beim System.
const SHEET_CLASS = 'dsa5-helpers-sheet';

function usesOurSheet(actor) {
  const cls = actor?._getSheetClass?.() ?? actor?.sheet?.constructor;
  return !!cls?.DEFAULT_OPTIONS?.classes?.includes(SHEET_CLASS);
}

export function initBagDrag() {
  Hooks.on('renderItemSheetV2', (app, element) => {
    const actor = app.item?.actor;
    if (!app.item?.system?.isBagWithContents || !actor?.isOwner || !usesOurSheet(actor)) return;
    const root = element instanceof HTMLElement ? element : element?.[0];
    if (!root) return;
    if (!root.dataset.dsa5hBagDrag) {
      root.dataset.dsa5hBagDrag = '1';
      // Erfasst vor dem mousedown-Handler des Systems am Feld selbst.
      root.addEventListener('mousedown', event => {
        if (event.button === 0 && event.target.closest?.('.slot[data-item-id]')) event.stopPropagation();
      }, true);
      root.addEventListener('click', event => {
        const slot = event.target.closest?.('.slot[data-item-id]');
        if (slot) actor.items.get(slot.dataset.itemId)?.sheet?.render(true);
      });
    }
    for (const slot of root.querySelectorAll('.slot[data-item-id]')) {
      if (slot.draggable) continue;
      slot.draggable = true;
      slot.addEventListener('dragstart', event => {
        const item = actor.items.get(slot.dataset.itemId);
        if (!item) return event.preventDefault();
        document.querySelectorAll('.itemInfo').forEach(info => info.remove()); // Hover-Info des Systems
        event.dataTransfer.setData('text/plain', JSON.stringify(item.toDragData()));
      });
    }
  });
}
