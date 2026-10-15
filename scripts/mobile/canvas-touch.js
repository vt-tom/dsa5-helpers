// Touch-Gesten auf der Szene (project/MOBILE.md 13.3), Vorbild: clickdummy/mobile/Foundry Mobil.dc.html.
// Foundry v14 kann von sich aus nur Maus: Verschieben = Rechts-Ziehen, Zoom = Mausrad, Pinch wird unterdrückt,
// Links-Ziehen auf einem Token bewegt ihn sofort. Wir fangen deshalb alle Touch-Zeiger auf dem Canvas ab
// (Capture-Phase am window, vor PIXI) und setzen die Gesten selbst um:
// - ein Finger wischen → verschieben, zwei Finger → zoomen (canvas.pan),
// - lange drücken → Ping (canvas.ping, wie Foundrys eigener Langdruck),
// - lange drücken auf einen eigenen Token, dann ziehen → bewegen (TokenDocument#move, Wände geprüft),
// - kurz antippen → als Mausklick an Foundry weiterreichen (Token wählen, Türen öffnen …) + Name einblenden.
const LONG_MS = 450;
const MOVE_PX = 8;
const TAP_ID = 9999;

const ptrs = new Map();
let g = null;
let timer = null;
let overlay = null;

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const toWorld = p => canvas.canvasCoordinatesFromClient({ x: p.x, y: p.y });
const toClient = p => canvas.clientCoordinatesFromCanvas({ x: p.x, y: p.y });
const vibrate = ms => { try { navigator.vibrate?.(ms); } catch (_) { /* nicht unterstützt */ } };

function isBoardTouch(e) {
  return e.pointerType === 'touch' && canvas?.ready && e.target === canvas.app?.view;
}
function swallow(e) { e.stopImmediatePropagation(); if (e.cancelable) e.preventDefault(); }

function tokenAt(p) {
  const w = toWorld(p);
  const hits = canvas.tokens.placeables.filter(t => t.visible && t.bounds?.contains(w.x, w.y));
  return hits.sort((a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0))[0] ?? null;
}

function canDrag(token) {
  if (!token.document.isOwner) return false;
  if (game.paused && !game.user.isGM) { ui.notifications.warn('DSA5HELPERS.Mobile.Paused', { localize: true }); return false; }
  return true;
}

/** Kurzes Antippen als echten Mausklick an PIXI geben, damit Foundrys Klick-Logik unverändert gilt. */
function replayClick(p) {
  const view = canvas.app.view;
  const base = { clientX: p.x, clientY: p.y, pointerId: TAP_ID, pointerType: 'mouse', isPrimary: true, bubbles: true, cancelable: true, view: window };
  view.dispatchEvent(new PointerEvent('pointermove', { ...base, buttons: 0 }));
  view.dispatchEvent(new PointerEvent('pointerdown', { ...base, button: 0, buttons: 1 }));
  setTimeout(() => view.dispatchEvent(new PointerEvent('pointerup', { ...base, button: 0, buttons: 0 })), 30);
}

function showLabel(token) {
  const name = token.document.name;
  if (!name || !token.document.isOwner && token.document.displayName === CONST.TOKEN_DISPLAY_MODES.NONE) return;
  const c = toClient({ x: token.center.x, y: token.document.y });
  const el = document.createElement('div');
  el.className = 'dsa5h-m-token-label';
  el.textContent = name;
  el.style.left = `${c.x}px`;
  el.style.top = `${c.y}px`;
  document.body.append(el);
  setTimeout(() => el.remove(), 1600);
}

// ----- Token ziehen: eigene HTML-Vorschau (Token-Bild am Finger + Zielfeld), bewegt wird erst beim Loslassen.
function startDrag(token, p) {
  const w = toWorld(p);
  g.mode = 'drag';
  g.token = token;
  g.off = { x: w.x - token.document.x, y: w.y - token.document.y };
  clearTimeout(foundry.canvas.interaction.MouseInteractionManager.longPressTimeout);
  token.control({ releaseOthers: true });
  overlay = document.createElement('div');
  overlay.className = 'dsa5h-m-drag';
  overlay.innerHTML = `<div class="dsa5h-m-drop"></div><img class="dsa5h-m-ghost" src="${token.document.texture.src}" alt="">`;
  document.body.append(overlay);
  vibrate(15);
  moveDrag(p);
}

function dropTarget(p) {
  const w = toWorld(p);
  const doc = g.token.document;
  return doc.getSnappedPosition({ x: w.x - g.off.x, y: w.y - g.off.y });
}

function blocked(token, pos) {
  if (game.user.isGM) return false;
  const dest = token.document.getCenterPoint(pos);
  return token.checkCollision(dest, { type: 'move', mode: 'any' });
}

function moveDrag(p) {
  if (!overlay) return;
  const s = canvas.stage.scale.x, t = g.token;
  const size = { w: t.w * s, h: t.h * s };
  const ghost = overlay.querySelector('.dsa5h-m-ghost');
  Object.assign(ghost.style, { left: `${p.x - g.off.x * s}px`, top: `${p.y - g.off.y * s}px`, width: `${size.w}px`, height: `${size.h}px` });
  const pos = dropTarget(p), c = toClient(pos);
  const drop = overlay.querySelector('.dsa5h-m-drop');
  Object.assign(drop.style, { left: `${c.x}px`, top: `${c.y}px`, width: `${size.w}px`, height: `${size.h}px` });
  drop.classList.toggle('blocked', !!blocked(t, pos));
}

async function endDrag(commit, p) {
  overlay?.remove();
  overlay = null;
  if (!commit || !g?.token) return;
  const token = g.token, pos = dropTarget(p);
  if (pos.x === token.document.x && pos.y === token.document.y) return;
  if (blocked(token, pos)) return ui.notifications.warn('DSA5HELPERS.Mobile.Blocked', { localize: true });
  try { await token.document.move({ x: pos.x, y: pos.y }); }
  catch (err) { console.error('DSA5 Helpers | Token-Bewegung fehlgeschlagen', err); ui.notifications.error(err.message); }
}

function longPress() {
  if (!g || g.mode !== 'pending') return;
  const token = tokenAt(g.start);
  if (token && canDrag(token)) return startDrag(token, g.start);
  g.mode = 'done';
  if (!game.user.hasPermission('PING_CANVAS')) return;
  vibrate(10);
  canvas.ping(toWorld(g.start));
}

// ----- Zeiger-Ereignisse
function onDown(e) {
  if (!isBoardTouch(e)) return;
  swallow(e);
  const p = { x: e.clientX, y: e.clientY };
  ptrs.set(e.pointerId, p);
  clearTimeout(timer);
  if (ptrs.size === 1) {
    g = { mode: 'pending', start: p, last: p };
    timer = setTimeout(longPress, LONG_MS);
  } else if (ptrs.size === 2) {
    if (g?.mode === 'drag') endDrag(false);
    const [a, b] = [...ptrs.values()];
    g = { mode: 'pinch', d0: dist(a, b) || 1, s0: canvas.stage.scale.x, w0: toWorld(mid(a, b)) };
  }
}

function onMove(e) {
  if (e.pointerType !== 'touch' || !ptrs.has(e.pointerId)) return;
  swallow(e);
  const p = { x: e.clientX, y: e.clientY };
  ptrs.set(e.pointerId, p);
  if (!g) return;
  if (g.mode === 'pending' && dist(p, g.start) > MOVE_PX) { clearTimeout(timer); g.mode = 'pan'; }
  if (g.mode === 'pan') {
    const s = canvas.stage.scale.x, piv = canvas.stage.pivot;
    canvas.pan({ x: piv.x - (p.x - g.last.x) / s, y: piv.y - (p.y - g.last.y) / s });
    g.last = p;
  } else if (g.mode === 'drag') moveDrag(p);
  else if (g.mode === 'pinch' && ptrs.size >= 2) {
    const [a, b] = [...ptrs.values()], m = mid(a, b);
    canvas.pan({ scale: g.s0 * dist(a, b) / g.d0 });
    // Den Weltpunkt unter den Fingern festhalten (pan begrenzt den Zoom selbst, daher mit dem echten Wert rechnen)
    const s = canvas.stage.scale.x;
    canvas.pan({ x: g.w0.x - (m.x - innerWidth / 2) / s, y: g.w0.y - (m.y - innerHeight / 2) / s });
  }
}

function onUp(e) {
  if (e.pointerType !== 'touch' || !ptrs.has(e.pointerId)) return;
  swallow(e);
  const p = { x: e.clientX, y: e.clientY };
  ptrs.delete(e.pointerId);
  clearTimeout(timer);
  const cancel = e.type === 'pointercancel';
  if (g?.mode === 'pending' && ptrs.size === 0 && !cancel) {
    const token = tokenAt(p);
    replayClick(p);
    if (token) showLabel(token);
  } else if (g?.mode === 'drag' && ptrs.size === 0) endDrag(!cancel, p);
  else if (g?.mode === 'pinch' && ptrs.size === 1) { const q = [...ptrs.values()][0]; g = { mode: 'pan', start: q, last: q }; return; }
  if (ptrs.size === 0) g = null;
}

/** Im init-Hook aufrufen (nur in der Tablet-/Smartphone-Oberfläche). */
export function initCanvasTouch() {
  const opts = { capture: true, passive: false };
  window.addEventListener('pointerdown', onDown, opts);
  window.addEventListener('pointermove', onMove, opts);
  window.addEventListener('pointerup', onUp, opts);
  window.addEventListener('pointercancel', onUp, opts);
}

/** Szene so verschieben, dass ein Punkt in der Mitte des sichtbaren Bereichs (zwischen Kopf und Heldenkarte) liegt. */
export function centerOn(point, visibleTop, visibleBottom) {
  if (!canvas?.ready) return;
  const s = canvas.stage.scale.x;
  const cy = (visibleTop + visibleBottom) / 2;
  canvas.animatePan({ x: point.x, y: point.y + (innerHeight / 2 - cy) / s, duration: 250 });
}
