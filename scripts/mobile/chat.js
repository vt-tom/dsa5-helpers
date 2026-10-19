// Chat im Modul-Design auf Smartphone und Tablet (Entwurf clickdummy/mobile „Foundry Mobil“, Variante A „Karten“,
// Nutzer-Entscheidungen 2026-10-19, project/MOBILE.md 13.4). Grundlage bleibt Foundrys Chat-Log:
// - Nachrichten: nur Kennzeichnungen per renderChatMessageHTML (eigene Nachricht, Initiale ohne Bild, Ergebnisband und
//   QS-Rauten an DSA5-Probenkarten), die Optik macht das CSS. Inhalt und Knöpfe der Karten bleiben die des Systems.
// - Eingabe: eigene Leiste um Foundrys Eingabefeld (#chat-message) herum. Sichtbarkeit = Foundrys Einstellung
//   core.messageMode als Chips, Empfänger antippen = „/w [Namen] …“ beim Senden, Würfel-Schnellknöpfe = „/r …“,
//   Formatleiste von Foundry hinter „Aa“. Gesendet wird über Foundrys eigenen Weg (Enter im Eingabefeld).
const L = key => game.i18n.localize(`DSA5HELPERS.Mobile.Chat.${key}`);
const esc = s => foundry.utils.escapeHTML(String(s ?? ''));

const MODES = ['public', 'ic', 'gm', 'blind', 'self'];
const DICE = [20, 6, 4, 8, 10, 12];
const QUICK = [[1, 20], [3, 20], [1, 6], [2, 6]];
// Würfelklassen der Kampfproben (die-attack …) → Kürzel aus CHARAbbrev des Systems
const COMBAT_DICE = { attack: 'AT', parry: 'PA', dodge: 'AW' };

const state = { to: new Set(), dice: false, fmt: false, free: { n: 1, d: 20, mod: 0 } };
let bar = null;

// ----- Nachrichten
function initial(name) {
  return (String(name ?? '').trim()[0] ?? '?').toUpperCase();
}

function decorateMessage(message, html) {
  const li = html instanceof HTMLElement ? html : html?.[0];
  if (!li) return;
  li.classList.toggle('dsa5h-m-mine', !!message.isAuthor);
  const header = li.querySelector('.message-header');
  // Porträt: Bild des sprechenden Helden, sonst Initiale in der Spielerfarbe
  const img = header && !header.querySelector('.sender-image') ? ChatMessage.implementation.getSpeakerActor(message.speaker)?.img : null;
  if (img && !img.includes('mystery-man')) {
    const pic = document.createElement('img');
    pic.className = 'sender-image';
    pic.src = img;
    pic.alt = '';
    header.prepend(pic);
  }
  if (header && !header.querySelector('.sender-image, .dsa5h-m-ini')) {
    const ini = document.createElement('span');
    ini.className = 'dsa5h-m-ini';
    ini.textContent = initial(message.alias ?? message.author?.name);
    ini.style.setProperty('--dsa5h-m-ini', message.author?.color?.css ?? message.author?.color ?? '#4a3f33');
    header.prepend(ini);
  }
  decorateTest(message, li);
}

// DSA5-Probenkarte (templates/chat/roll/test-card.hbs): Würfel beschriften, Ergebniszeile als Band mit QS-Rauten.
function decorateTest(message, li) {
  const card = li.querySelector('.dsa5.chat-card');
  const post = message.flags?.data?.postData;
  if (!card || !post) return;
  card.classList.add('dsa5h-m-test');
  for (const die of card.querySelectorAll('.roll-result > span.display-toggle')) {
    const char = [...die.classList].find(c => c.startsWith('die-'))?.slice(4);
    const abbr = (COMBAT_DICE[char] ?? char ?? '').toUpperCase();
    const target = die.dataset.tooltip?.match(/(\d+)\s*$/)?.[1];
    const label = abbr && game.i18n.has(`CHARAbbrev.${abbr}`) ? game.i18n.localize(`CHARAbbrev.${abbr}`) : '';
    die.dataset.dsa5hCap = [label, target].filter(Boolean).join(' ');
  }
  const rows = [...card.querySelectorAll(':scope > .card-content')];
  const rowOf = key => rows.find(r => r.querySelector(':scope > b')?.textContent.trim() === game.i18n.localize(key));
  const res = rowOf('Description');
  const level = Number(post.successLevel);
  if (!res || !Number.isFinite(level) || level === 0) return;
  res.classList.add('dsa5h-m-res');
  // „Beschreibung:“ weglassen, das Band spricht für sich
  const label = res.querySelector(':scope > b');
  const rest = label?.nextSibling;
  label?.remove();
  if (rest?.nodeType === Node.TEXT_NODE) rest.textContent = rest.textContent.replace(/^\s*:\s*/, '');
  res.dataset.ok = String(level > 0);
  if (Math.abs(level) > 1) res.dataset.crit = 'true';
  const qs = Number(post.qualityStep) || 0;
  if (level > 0 && qs > 0) {
    rowOf('qualityStep')?.classList.add('dsa5h-m-folded');
    const pips = document.createElement('span');
    pips.className = 'dsa5h-m-pips';
    pips.setAttribute('aria-label', `${game.i18n.localize('qualityStep')} ${qs}`);
    pips.innerHTML = Array.from({ length: 6 }, (_, i) => `<i${i < qs ? ' class="on"' : ''}></i>`).join('');
    res.append(pips);
  }
}

// ----- Eingabe
function inputEl() { return document.getElementById('chat-message'); }

function recipients() {
  const others = game.users.filter(u => u.id !== game.user.id && (game.user.isGM || !u.isGM));
  others.sort((a, b) => (b.active - a.active) || a.name.localeCompare(b.name));
  const list = others.map(u => ({ id: u.id, name: u.name, color: u.color?.css ?? u.color, char: u.character?.name }));
  if (!game.user.isGM && game.users.some(u => u.isGM)) list.unshift({ id: 'gm', name: L('GM'), color: '#4b3d66', gm: true });
  return list;
}

function targetNames() {
  return [...state.to].map(id => id === 'gm' ? 'gm' : game.users.get(id)?.name).filter(Boolean);
}

function placeholder() {
  const names = [...state.to].map(id => id === 'gm' ? L('GM') : game.users.get(id)?.name).filter(Boolean);
  const text = names.length ? game.i18n.format('DSA5HELPERS.Mobile.Chat.WhisperTo', { names: names.join(', ') }) : L('ToAll');
  inputEl()?.style.setProperty('--chat-message-placeholder', `'${text.replace(/'/g, '’')}'`);
}

function freeFormula() {
  const { n, d, mod } = state.free;
  return `${n}d${d}${mod ? (mod > 0 ? `+${mod}` : mod) : ''}`;
}

function freeLabel() {
  const { n, d, mod } = state.free;
  return game.i18n.format('DSA5HELPERS.Mobile.Chat.RollFree', { roll: `${n}${L('Die')}${d}${mod ? (mod > 0 ? `+${mod}` : mod) : ''}` });
}

function renderBar() {
  if (!bar) return;
  const mode = game.settings.get('core', 'messageMode');
  const chip = (attrs, label, on, extra = '') => `<button type="button" class="dsa5h-m-chip" ${attrs} aria-pressed="${on}">${extra}${esc(label)}</button>`;
  const modes = MODES.filter(m => CONFIG.ChatMessage.modes[m]).map(m => chip(`data-mode="${m}"`, L(`Mode.${m}`), mode === m)).join('');
  const people = recipients().map(r => chip(`data-to="${r.id}" data-tone="whisper"`, r.name, state.to.has(r.id),
    `<i style="--dsa5h-m-ini:${esc(r.color ?? '#4a3f33')}">${esc(r.gm ? 'SL' : initial(r.name))}</i>`)).join('');
  const { n, d, mod } = state.free;
  bar.querySelector('[data-row="modes"]').innerHTML = `<small>${esc(L('Visibility'))}</small>${modes}`;
  bar.querySelector('[data-row="to"]').innerHTML = `<small>${esc(L('To'))}</small>`
    + (game.user.isGM ? `<button type="button" class="dsa5h-m-chip dsa5h-m-chip-req" data-do="request">+ ${esc(game.i18n.localize('DSA5HELPERS.Mobile.RequestRoll'))}</button>` : '')
    + chip('data-to=""', L('All'), state.to.size === 0) + people;
  bar.querySelector('[data-do="fmt"]').setAttribute('aria-expanded', String(state.fmt));
  bar.querySelector('[data-do="dice"]').setAttribute('aria-expanded', String(state.dice));
  bar.classList.toggle('dsa5h-m-ci-fmt', state.fmt);
  const dice = bar.querySelector('.dsa5h-m-ci-dice');
  dice.hidden = !state.dice;
  dice.innerHTML = `<div class="dsa5h-m-ci-quick">${QUICK.map(([q, f]) => `<button type="button" data-roll="${q}d${f}">${q}${esc(L('Die'))}${f}</button>`).join('')}</div>
    <div class="dsa5h-m-ci-free">
      <button type="button" data-free="n-" aria-label="${esc(L('FewerDice'))}">−</button><span>${n}</span><button type="button" data-free="n+" aria-label="${esc(L('MoreDice'))}">+</button>
      <button type="button" data-free="d" class="dsa5h-m-ci-die">${esc(L('Die'))}${d}</button>
      <button type="button" data-free="m-" aria-label="${esc(L('ModDown'))}">−</button><span>${mod > 0 ? `+${mod}` : mod}</span><button type="button" data-free="m+" aria-label="${esc(L('ModUp'))}">+</button>
      <button type="button" data-free="roll" class="dsa5h-m-ci-go">${esc(freeLabel())}</button>
    </div>`;
  placeholder();
}

function roll(formula) {
  return ui.chat.processMessage(`/r ${formula}`).catch(err => ui.notifications.error(err.message));
}

// Senden über Foundrys Weg: ein Enter im Eingabefeld löst ChatInputPlugin#sendMessage aus (Verlauf, Leeren,
// Fehlermeldungen inklusive). keyCode bleibt 0, sonst überlässt ProseMirror Enter auf Android/iOS dem Browser.
function send() {
  const dom = inputEl()?.querySelector('.ProseMirror');
  dom?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
}

function onBarClick(ev) {
  const b = ev.target.closest('button');
  if (!b || !bar.contains(b)) return;
  ev.preventDefault();
  if (b.dataset.mode) return game.settings.set('core', 'messageMode', b.dataset.mode);
  if (b.dataset.to !== undefined) {
    const id = b.dataset.to;
    if (!id) state.to.clear();
    else if (state.to.has(id)) state.to.delete(id);
    else state.to.add(id);
    return renderBar();
  }
  if (b.dataset.roll) return roll(b.dataset.roll);
  const f = state.free;
  switch (b.dataset.free) {
    case 'n-': f.n = Math.max(1, f.n - 1); return renderBar();
    case 'n+': f.n = Math.min(20, f.n + 1); return renderBar();
    case 'm-': f.mod = Math.max(-20, f.mod - 1); return renderBar();
    case 'm+': f.mod = Math.min(20, f.mod + 1); return renderBar();
    case 'd': f.d = DICE[(DICE.indexOf(f.d) + 1) % DICE.length]; return renderBar();
    case 'roll': return roll(freeFormula());
  }
  switch (b.dataset.do) {
    case 'fmt': state.fmt = !state.fmt; return renderBar();
    case 'dice': state.dice = !state.dice; return renderBar();
    case 'send': return send();
    case 'request': {
      const svc = game.dsa5?.queries?.RollRequestService;
      return svc?.openRequestDialog ? svc.openRequestDialog() : ui.notifications.warn('DSA5HELPERS.Mobile.NoRequest', { localize: true });
    }
  }
}

function buildBar() {
  bar = document.createElement('div');
  bar.className = 'dsa5h-m-ci';
  bar.innerHTML = `
    <div class="dsa5h-m-ci-row" data-row="modes"></div>
    <div class="dsa5h-m-ci-row" data-row="to"></div>
    <button type="button" class="dsa5h-m-ci-round dsa5h-m-ci-aa" data-do="fmt" aria-label="${esc(L('Format'))}">Aa</button>
    <button type="button" class="dsa5h-m-ci-round dsa5h-m-ci-dicebtn" data-do="dice" aria-label="${esc(L('Dice'))}"><img src="systems/dsa5/icons/d20.svg" alt=""></button>
    <button type="button" class="dsa5h-m-ci-send" data-do="send" aria-label="${esc(L('Send'))}"><i class="fa-solid fa-paper-plane" inert></i></button>
    <div class="dsa5h-m-ci-dice" hidden></div>`;
  bar.addEventListener('click', onBarClick);
  renderBar();
}

// Foundry hängt Eingabefeld und Steuerleiste je nach Zustand in die Benachrichtigungen oder ins Chat-Formular
// (ChatLog#_toggleNotifications → Hook renderChatInput). Das Eingabefeld selbst fassen wir nicht an: Ein Umhängen
// baut den Editor neu auf (während er noch startet doppelt, dann sendet Enter nicht mehr). Unsere Leiste steht
// daneben im Formular, das CSS-Raster setzt die Teile um das Feld herum.
function placeInput() {
  const form = document.querySelector('#chat .chat-form');
  if (!form) return;
  if (!bar) buildBar();
  if (bar.parentElement !== form) form.append(bar);
  placeholder();
}

// Empfänger gewählt: Text als Flüstern über Foundrys Befehl „/w [Namen]“ senden. Befehle (/r …) bleiben unberührt.
function onChatMessage(chatLog, message) {
  if (!state.to.size || chatLog !== ui.chat) return;
  const tmp = document.createElement('template');
  tmp.innerHTML = message;
  if (tmp.content.textContent.trim().startsWith('/')) return;
  const names = targetNames();
  if (!names.length) return;
  chatLog.processMessage(`/w [${names.join(', ')}] ${message.replace(/^<p>|<\/p>$/gi, '')}`).catch(err => ui.notifications.error(err.message));
  return false;
}

/** Im init-Hook aufrufen (nur in der Tablet-/Smartphone-Oberfläche). */
export function initChat() {
  Hooks.on('renderChatMessageHTML', decorateMessage);
  Hooks.on('renderChatInput', () => placeInput());
  Hooks.on('renderChatLog', () => placeInput());
  Hooks.on('chatMessage', onChatMessage);
  Hooks.on('clientSettingChanged', key => { if (key === 'core.messageMode') renderBar(); });
  for (const hook of ['userConnected', 'updateUser']) Hooks.on(hook, foundry.utils.debounce(renderBar, 200));
}
