// Wurfergebnis einblenden (Issue #64, Variante A, Nutzerwahl 2026-10-30; Click-Dummy clickdummy/mobile/wurfergebnis.html).
// Auf dem Smartphone liegt der Chat hinter dem Bogen: Die Chatkarte des eigenen Wurfs erscheint als Blatt von unten
// und bleibt, bis man sie wegtippt. Folgewürfe aus der Karte (Schaden, Schip, Parade) sind ebenfalls eigene Würfe und
// erscheinen genauso. Der neueste Wurf steht vorn, mit ‹ › blättert man zu älteren. Tablet: abschaltbar
// (Client-Einstellung rollResultTablet). Ist das Chat-Panel offen, sieht man die Karte dort und es bleibt aus.
//
// Gezeigt wird die echte Karte des Systems (ChatMessage#renderHTML samt renderChatMessageHTML-Hooks). Schip, Neuwurf,
// Schaden anwenden usw. stehen in DSA5 v14 im Kontextmenü der Nachricht (⋮ im Kartenkopf bzw. Langdruck,
// touch-context.js): Das Blatt bekommt Foundrys Menü des Chat-Logs mit denselben Einträgen (getChatMessageContextOptions).
// Knöpfe in Karten (andere Module, Anfragen) führt das System über Listener am Chat-Log aus (renderChatLog, delegiert);
// ein Tipp darauf wird an dieselbe Stelle der Karte im Chat-Log weitergereicht, statt Handler nachzubauen. Öffnet
// eine Aktion einen Dialog, tritt das Blatt zur Seite und kommt mit der Folgenachricht bzw. der geänderten Karte wieder.

const MODULE_ID = 'dsa5-helpers';
const MAX = 10;
// Elemente, deren Tipp das System bzw. Foundry auswertet (Knöpfe der Karte, Aktionslinks); ⋮ bleibt im Blatt.
const CONTROLS = 'button:not(.dsa5h-m-msgmenu), a, [data-action], .chat-button, input, select, label';

const shown = [];
let idx = 0;
let wrap = null;
let token = 0;
let mobile = null;
// Nachricht, deren Knopf zuletzt weitergereicht wurde: ihre nächste Änderung zeigt das Blatt wieder.
let pending = null;

const esc = s => foundry.utils.escapeHTML(String(s ?? ''));

/** Eigener Wurf mit Ergebnis (Probenkarte des Systems oder Foundry-Wurf), sichtbar für diesen Client. */
function isOwnRoll(message) {
  return message.isAuthor && message.visible && (message.isRoll || !!message.flags?.data?.postData);
}

function enabled() {
  if (document.body.dataset.dsa5hPanel === 'chat') return false;
  return mobile === 'phone' || game.settings.get(MODULE_ID, 'rollResultTablet');
}

/** Karte im Chat-Log (Seitenleiste, sonst Foundrys Benachrichtigungen), an der die Listener hängen. */
function logCard(id) {
  const sel = `li.chat-message[data-message-id="${id}"]`;
  return ui.chat?.element?.querySelector(sel) ?? document.querySelector(`#chat ${sel}, #chat-notifications ${sel}`);
}

function close() {
  token++;
  wrap?.remove();
  wrap = null;
}

function dismiss() {
  shown.length = 0;
  idx = 0;
  close();
}

async function render() {
  const id = shown[idx];
  const message = id && game.messages.get(id);
  if (!message) return dismiss();
  const mine = ++token;
  const card = await message.renderHTML();
  if (mine !== token) return;
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'dsa5h-m-more-backdrop dsa5h-m-power-backdrop dsa5h-m-roll-backdrop';
    wrap.addEventListener('click', onClick, true);
    document.body.append(wrap);
    ui.chat._createContextMenu(ui.chat._getEntryContextOptions, '.message[data-message-id]', {
      container: wrap, hookName: 'getChatMessageContextOptions', parentClassHooks: false, fixed: true,
    });
  }
  const nav = shown.length > 1
    ? `<button type="button" data-do="older" aria-label="${esc(game.i18n.localize('DSA5HELPERS.Mobile.RollResult.Older'))}"${idx >= shown.length - 1 ? ' disabled' : ''}><i class="fa-solid fa-chevron-left" inert></i></button><small>${idx + 1}/${shown.length}</small><button type="button" data-do="newer" aria-label="${esc(game.i18n.localize('DSA5HELPERS.Mobile.RollResult.Newer'))}"${idx <= 0 ? ' disabled' : ''}><i class="fa-solid fa-chevron-right" inert></i></button>`
    : '';
  wrap.innerHTML = `<div class="dsa5h-m-more-sheet dsa5h-m-roll-sheet" role="dialog" aria-label="${esc(game.i18n.localize('DSA5HELPERS.Mobile.RollResult.Title'))}">
    <div class="dsa5h-m-grip"></div>
    <div class="dsa5h-m-power-head dsa5h-m-roll-head"><span>${esc(game.i18n.localize('DSA5HELPERS.Mobile.RollResult.Title'))}</span>${nav}<button type="button" data-do="close" aria-label="${esc(game.i18n.localize('DSA5HELPERS.Close'))}"><i class="fa-solid fa-xmark" inert></i></button></div>
    <ol class="chat-log dsa5h-m-roll-card"></ol>
  </div>`;
  wrap.querySelector('.dsa5h-m-roll-card').append(card);
}

function onClick(ev) {
  const t = ev.target;
  const b = t.closest?.('button[data-do]');
  if (t.closest?.('#context-menu')) return;
  if (t === wrap || b?.dataset.do === 'close') return dismiss();
  if (b?.dataset.do === 'older' || b?.dataset.do === 'newer') {
    idx = Math.max(0, Math.min(shown.length - 1, idx + (b.dataset.do === 'older' ? 1 : -1)));
    return render();
  }
  const card = wrap.querySelector('.dsa5h-m-roll-card > li');
  const control = t.closest?.(CONTROLS);
  if (!card || !control || !card.contains(control)) return;
  // Gleiche Stelle in der Karte des Chat-Logs suchen (beide aus demselben Rendern, also gleich aufgebaut).
  const path = [];
  for (let n = control; n !== card; n = n.parentElement) path.unshift([...n.parentElement.children].indexOf(n));
  let target = logCard(card.dataset.messageId);
  for (const i of path) target = target?.children[i];
  if (!target) return;
  ev.preventDefault();
  ev.stopPropagation();
  close();
  pending = { id: card.dataset.messageId, until: Date.now() + 60000 };
  target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
}

function onCreate(message) {
  if (!isOwnRoll(message) || !enabled()) return;
  pending = null;
  shown.unshift(message.id);
  shown.splice(MAX);
  idx = 0;
  render();
}

function onUpdate(message) {
  const i = shown.indexOf(message.id);
  if (i < 0 || !enabled()) return;
  // Offene Karte auffrischen; nach einem weitergereichten Tipp die geänderte Karte (Schip neu gewürfelt …) wieder
  // zeigen, spätere Änderungen anderer (z. B. Schaden durch die SL angewendet) öffnen das Blatt nicht erneut.
  if (wrap && shown[idx] === message.id) return render();
  if (pending?.id !== message.id || Date.now() > pending.until) return;
  pending = null;
  idx = i;
  render();
}

function onDelete(message) {
  const i = shown.indexOf(message.id);
  if (i < 0) return;
  shown.splice(i, 1);
  if (idx >= shown.length) idx = Math.max(0, shown.length - 1);
  if (wrap) render();
}

/**
 * Fenster öffnet sich (Schip-Fenster des Systems, Dialoge …): Blatt zur Seite, damit es nicht dahinter liegt. Bögen
 * rendern bei jeder Änderung neu und zählen nicht.
 */
function onRenderApp(app) {
  if (!wrap || !app.hasFrame || app instanceof foundry.applications.api.DocumentSheetV2) return;
  pending = { id: shown[idx], until: Date.now() + 60000 };
  close();
}

/** Im init-Hook aufrufen, nur in der Mobil-Oberfläche. */
export function initRollResult(mode) {
  mobile = mode;
  Hooks.on('createChatMessage', onCreate);
  Hooks.on('updateChatMessage', onUpdate);
  Hooks.on('deleteChatMessage', onDelete);
  Hooks.on('renderApplicationV2', onRenderApp);
}
