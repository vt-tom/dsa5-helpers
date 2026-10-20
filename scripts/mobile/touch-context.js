// Kontextmenüs auf Touch-Geräten (project/MOBILE.md 13.4, E20).
// Foundrys ContextMenu öffnet sich nur auf das Ereignis „contextmenu“; iOS Safari sendet das bei Langdruck nicht.
// Wir lösen es selbst aus: Langdruck auf eine Chat-Nachricht (oder den ⋮-Knopf daran) bzw. einen Eintrag in einem
// Verzeichnis (Akteure-Panel, Journal) → synthetisches contextmenu.
// So erscheinen alle Einträge des Systems (Schip verwenden, Begabung, Schaden/AsP anwenden …) unverändert;
// das CSS zeigt das Menü als Blatt von unten.
const LONG_MS = 500;
const MOVE_PX = 10;
const GUARD_MS = 400;
const TARGETS = '.message[data-message-id], .directory-item[data-entry-id]';

let press = null;
let openedAt = 0;
let suppressUntil = 0;

// Foundry schließt jedes Kontextmenü beim nächsten Klick irgendwo im Dokument. Manche Eingaben schicken direkt nach
// dem contextmenu noch einen Klick hinterher (Rechtsklick in der Touch-Emulation der Browser-Entwicklertools,
// Rückmeldung 2026-10-20: Menü „nur kurz“ sichtbar). Diesen Klick schlucken, Antippen außerhalb schließt weiterhin.
// Chrome (Android und die Touch-Emulation der Entwicklertools) schickt bei Langdruck selbst ein contextmenu, oft erst
// beim Loslassen. Foundrys ContextMenu schließt ein offenes Menü, wenn dasselbe Ziel erneut ausgelöst wird
// (Rückmeldung 2026-10-20: Menü öffnet sich, schließt beim Loslassen). Kam unseres zuerst, das echte schlucken; kam
// das echte zuerst, unseres nicht mehr auslösen.
function onContextMenu(e) {
  if (e.isTrusted && (press?.fired || performance.now() < suppressUntil)) {
    e.preventDefault();
    e.stopImmediatePropagation();
    return;
  }
  if (e.isTrusted && press) {
    clearTimeout(press.timer);
    press.fired = true;
  }
  openedAt = performance.now();
}
function onClickGuard(e) {
  if (!ui.context || performance.now() - openedAt > GUARD_MS || e.target.closest?.('#context-menu')) return;
  e.stopPropagation();
  e.preventDefault();
}

function openMenu(target, x, y) {
  target.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 2, buttons: 2, view: window }));
}

function onDown(e) {
  if (e.pointerType !== 'touch') return;
  const target = e.target.closest?.(TARGETS);
  // Knöpfe und Links behalten ihren Klick. Ausnahmen, die zur Fläche gehören: der Name eines Verzeichniseintrags (ein
  // Link) und das Auf-/Zuklappen eines Wurfs (Foundry legt expandRoll über den ganzen Würfelbereich der Nachricht).
  const control = e.target.closest('button, a, input, select, textarea, [data-action]');
  if (!target || (control && !control.matches('.directory-item .entry-name, [data-action="expandRoll"]'))) return;
  const start = { x: e.clientX, y: e.clientY };
  press = { target, start, id: e.pointerId, timer: setTimeout(() => {
    press.fired = true;
    try { navigator.vibrate?.(10); } catch (_) { /* nicht unterstützt */ }
    openMenu(target, start.x, start.y);
  }, LONG_MS) };
}

function onMove(e) {
  if (!press || e.pointerId !== press.id) return;
  if (Math.hypot(e.clientX - press.start.x, e.clientY - press.start.y) > MOVE_PX) { clearTimeout(press.timer); press = null; }
}

function onUp(e) {
  if (!press || e.pointerId !== press.id) return;
  clearTimeout(press.timer);
  // Nach geöffnetem Menü den Klick des Loslassens schlucken, sonst schließt er es sofort wieder (oder öffnet den Akteur).
  // Nur kurz: kommt keiner, darf das nächste Antippen eines Menüeintrags nicht verloren gehen.
  if (press.fired) {
    const until = suppressUntil = performance.now() + GUARD_MS;
    const swallow = ev => {
      window.removeEventListener('click', swallow, true);
      if (performance.now() > until || ev.target.closest?.('#context-menu')) return;
      ev.stopPropagation();
      ev.preventDefault();
    };
    window.addEventListener('click', swallow, true);
    setTimeout(() => window.removeEventListener('click', swallow, true), GUARD_MS);
  }
  press = null;
}

/** ⋮-Knopf an jeder Chat-Nachricht, damit man den Langdruck nicht kennen muss. */
function addMenuButton(message, html) {
  const header = html.querySelector('.message-header');
  if (!header || header.querySelector('.dsa5h-m-msgmenu')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'dsa5h-m-msgmenu';
  btn.innerHTML = '<i class="fa-solid fa-ellipsis-vertical" inert></i>';
  btn.setAttribute('aria-label', game.i18n.localize('DSA5HELPERS.Mobile.MessageActions'));
  btn.addEventListener('click', ev => {
    ev.preventDefault();
    ev.stopPropagation();
    const li = btn.closest(TARGETS);
    const r = btn.getBoundingClientRect();
    if (li) openMenu(li, r.left, r.bottom);
  });
  header.append(btn);
}

/** Im init-Hook aufrufen (nur in der Tablet-/Smartphone-Oberfläche). */
export function initTouchContext() {
  document.addEventListener('pointerdown', onDown, true);
  document.addEventListener('pointermove', onMove, true);
  document.addEventListener('pointerup', onUp, true);
  document.addEventListener('pointercancel', onUp, true);
  document.addEventListener('contextmenu', onContextMenu, true);
  document.addEventListener('click', onClickGuard, true);
  Hooks.on('renderChatMessageHTML', addMenuButton);
}
