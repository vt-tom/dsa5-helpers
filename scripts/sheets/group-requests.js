/** Anfragen der Spieler an die SL im Gruppenbogen (Issue #55, Nutzerfreigabe 2026-11-12): Ein Spieler fragt einen Helfer
 *  an, den nur die SL ausführen darf (gmOnly, z. B. Nahrungssuche, Schicksal und Verdammnis), mit freiwilligem Anlass.
 *  Daraus wird eine Chat-Nachricht nur an die SL (und den Absender) mit „Ausführen“/„Ablehnen“; der Stand steht als Flag
 *  an der Nachricht. „Ausführen“ öffnet bei der SL den Gruppenbogen im Reiter Lager mit diesem Helfer. Offene Anfragen
 *  sieht die SL außerdem oben im Reiter Lager, der Spieler an seiner Karte („Anfrage gesendet“). */
const MODULE_ID = 'dsa5-helpers';
export const REQUEST_FLAG = 'groupRequest';

const requestOf = message => message?.getFlag?.(MODULE_ID, REQUEST_FLAG) ?? message?.flags?.[MODULE_ID]?.[REQUEST_FLAG] ?? null;

// Offene Anfragen einer Gruppe (für die SL im Reiter Lager), älteste zuerst.
export function openRequests(group) {
  return (game.messages?.contents ?? [])
    .filter(message => requestOf(message)?.group === group.uuid && requestOf(message).status === 'open')
    .map(message => {
      const request = requestOf(message);
      return { messageId: message.id, who: message.author?.name ?? '', label: request.label, note: request.note };
    });
}

// Offene Anfrage des aktuellen Benutzers für diesen Helfer (Karte zeigt „Anfrage gesendet – wartet auf die SL“).
export function pendingRequest(group, helperId) {
  return (game.messages?.contents ?? []).find(message => {
    const request = requestOf(message);
    return request?.group === group.uuid && request.helper === helperId && request.status === 'open' && message.author?.id === game.user.id;
  }) ?? null;
}

export async function sendRequestDialog(group, helperId, label) {
  const { escapeHTML } = foundry.utils;
  const localize = key => game.i18n.localize(key);
  const content = `<label class="dsa5h-ask-body"><span>${escapeHTML(localize('DSA5HELPERS.Group.Ask.NoteLabel'))}</span>
    <textarea name="note" rows="3" placeholder="${escapeHTML(localize('DSA5HELPERS.Group.Ask.NotePlaceholder'))}"></textarea></label>`;
  let note;
  try {
    note = await foundry.applications.api.DialogV2.prompt({
      window: { title: game.i18n.format('DSA5HELPERS.Group.Ask.Title', { label }) },
      content,
      ok: { label: localize('DSA5HELPERS.Group.Ask.Send'), callback: (_event, button) => button.form.elements.note.value.trim() },
      rejectClose: false,
    });
  } catch {
    return;
  }
  if (note === null || note === undefined) return;
  await sendRequest(group, helperId, label, note);
}

export async function sendRequest(group, helperId, label, note = '') {
  const { escapeHTML } = foundry.utils;
  const user = game.user;
  const content = `<div class="dsa5h-request-card"><p><b>${escapeHTML(user.name)}</b> ${escapeHTML(game.i18n.format('DSA5HELPERS.Group.Ask.Wants', { label, group: group.name }))}</p>${note ? `<p class="dsa5h-request-note">„${escapeHTML(note)}“</p>` : ''}<p class="dsa5h-request-status" data-dsa5h-request-status></p><div class="dsa5h-request-actions" data-dsa5h-request-actions><button type="button" data-dsa5h-request="execute">${escapeHTML(game.i18n.localize('DSA5HELPERS.Group.Ask.Execute'))}</button><button type="button" data-dsa5h-request="decline">${escapeHTML(game.i18n.localize('DSA5HELPERS.Group.Ask.Decline'))}</button></div></div>`;
  await ChatMessage.create({
    content,
    speaker: ChatMessage.getSpeaker({ user }),
    whisper: ChatMessage.getWhisperRecipients('GM').map(gm => gm.id),
    flags: { [MODULE_ID]: { [REQUEST_FLAG]: { group: group.uuid, helper: helperId, label, note, status: 'open' } } },
  });
  ui.notifications.info(game.i18n.format('DSA5HELPERS.Group.Ask.Sent', { label }));
}

async function setStatus(message, status) {
  if (!game.user.isGM || !message) return;
  await message.update({ [`flags.${MODULE_ID}.${REQUEST_FLAG}.status`]: status });
}

export async function executeRequest(messageId) {
  const message = game.messages.get(messageId);
  const request = requestOf(message);
  if (!game.user.isGM || !request) return;
  const group = await fromUuid(request.group);
  if (!group) return;
  await setStatus(message, 'done');
  const sheet = group.sheet;
  if (typeof sheet?.runHelper === 'function') return sheet.runHelper(request.helper);
  // Systembogen: Reiter der Funktionen öffnen und den Helfer dort anklicken.
  sheet.tabGroups.sheet = 'gmTools';
  await sheet.render({ force: true });
  sheet.element?.querySelector(`[data-action="groupHelperAction"][data-group-helper="${CSS.escape(request.helper)}"]`)?.click();
}

export async function declineRequest(messageId) {
  await setStatus(game.messages.get(messageId), 'declined');
}

// Chatkarte: Knöpfe nur für die SL und nur, solange die Anfrage offen ist; danach der Stand als Text.
function decorate(message, html) {
  const request = requestOf(message);
  const root = html instanceof HTMLElement ? html : html?.[0];
  if (!request || !root) return;
  const actions = root.querySelector('[data-dsa5h-request-actions]');
  const status = root.querySelector('[data-dsa5h-request-status]');
  const open = request.status === 'open';
  if (actions) actions.hidden = !open || !game.user.isGM;
  if (status) status.textContent = game.i18n.localize(`DSA5HELPERS.Group.Ask.Status.${request.status}`);
  root.querySelectorAll('[data-dsa5h-request]').forEach(button => button.addEventListener('click', event => {
    event.preventDefault();
    if (button.dataset.dsa5hRequest === 'execute') executeRequest(message.id);
    else declineRequest(message.id);
  }));
}

// Offene Gruppenbögen nachziehen, wenn eine Anfrage kommt oder erledigt wird.
function refreshSheets(message) {
  const request = requestOf(message);
  if (!request) return;
  for (const app of foundry.applications.instances.values()) {
    if (app.rendered && app.actor?.uuid === request.group && app.options?.classes?.includes('dsa5h-group')) app.render();
  }
}

export function initGroupRequests() {
  Hooks.on('renderChatMessageHTML', decorate);
  Hooks.on('createChatMessage', refreshSheets);
  Hooks.on('updateChatMessage', refreshSheets);
  Hooks.on('deleteChatMessage', refreshSheets);
}
