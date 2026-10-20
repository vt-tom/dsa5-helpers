// Bannerbild ohne Foundry-Dateibrowser (Issue #46): Spieler haben oft kein Recht auf den Dateibrowser oder zum Hochladen.
// Die Spielleitung legt einen Standardordner fest; Spieler wählen ein Bild vom eigenen Rechner, der Bogen verkleinert es
// und schickt es über den Modul-Socket an den aktiven SL-Client, der es in den Ordner lädt und als Bannerbild setzt.
// Wer selbst hochladen darf (SL, Spieler mit Recht „Dateien hochladen“), lädt direkt hoch.

const MODULE_ID = 'dsa5-helpers';
const SOCKET = `module.${MODULE_ID}`;
const MAX_EDGE = 1600;
const pending = new Map();

export function registerBannerSettings() {
  game.settings.register(MODULE_ID, 'bannerPath', {
    name: 'DSA5HELPERS.Settings.BannerPath.Name',
    hint: 'DSA5HELPERS.Settings.BannerPath.Hint',
    scope: 'world',
    // Steht im Untermenü „Heldenbogen“ (scripts/apps/sheet-settings.js), nicht in der Liste.
    config: false,
    type: String,
    default: '',
  });
}

const FilePickerClass = () => foundry.applications.apps?.FilePicker?.implementation ?? globalThis.FilePicker;

// Speicherort wie Foundrys Dateiauswahl: Forge-Installationen laden in ihren eigenen Speicher.
const storage = () => (typeof ForgeVTT !== 'undefined' && ForgeVTT.usingTheForge ? 'forgevtt' : 'data');

export function bannerPath() {
  try { return String(game.settings.get(MODULE_ID, 'bannerPath') ?? '').trim().replace(/\/+$/, ''); } catch { return ''; }
}

/** Darf der Nutzer den Foundry-Dateibrowser öffnen? (SL immer, Spieler nur mit Recht „Dateien durchsuchen“.) */
export function canBrowseFiles(user = game.user) {
  return !!user?.isGM || !!user?.can?.('FILES_BROWSE');
}

/** SL-Client: Anfragen der Spieler annehmen. Spieler-Client: Antworten zuordnen. */
export function initBannerSocket() {
  game.socket.on(SOCKET, async message => {
    if (message?.type === 'bannerResult') {
      if (message.userId !== game.user.id) return;
      pending.get(message.requestId)?.(message);
      pending.delete(message.requestId);
      return;
    }
    if (message?.type !== 'bannerUpload' || game.user !== game.users.activeGM) return;
    const reply = data => game.socket.emit(SOCKET, { type: 'bannerResult', requestId: message.requestId, userId: message.userId, ...data });
    try {
      const user = game.users.get(message.userId);
      const actor = game.actors.get(message.actorId);
      if (!user || !actor?.testUserPermission(user, 'OWNER')) return reply({ ok: false, error: 'DSA5HELPERS.Banner.NoPermission' });
      const blob = await (await fetch(message.dataUrl)).blob();
      if (!blob.type.startsWith('image/')) return reply({ ok: false, error: 'DSA5HELPERS.Banner.Failed' });
      const path = await uploadFile(new File([blob], message.fileName, { type: blob.type }));
      if (!path) return reply({ ok: false, error: 'DSA5HELPERS.Banner.Failed' });
      await actor.setFlag(MODULE_ID, 'bannerImg', path);
      reply({ ok: true, path });
    } catch (error) {
      console.error(`${MODULE_ID} | Bannerbild hochladen`, error);
      reply({ ok: false, error: 'DSA5HELPERS.Banner.Failed' });
    }
  });
}

async function uploadFile(file) {
  const dir = bannerPath();
  const Picker = FilePickerClass();
  try { await Picker.createDirectory(storage(), dir); } catch { /* Ordner gibt es schon */ }
  const result = await Picker.upload(storage(), dir, file, {}, { notify: false });
  return result?.path ?? null;
}

// Bild vom eigenen Rechner wählen (Datei-Dialog des Betriebssystems).
function chooseLocalImage() {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', () => resolve(input.files?.[0] ?? null), { once: true });
    input.addEventListener('cancel', () => resolve(null), { once: true });
    input.click();
  });
}

// Auf höchstens MAX_EDGE Pixel verkleinern und als WebP speichern — klein genug für den Socket und den Bogen.
async function shrink(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.85));
  return blob ?? file;
}

const blobToDataUrl = blob => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(blob);
});

const safeName = actor => `${String(actor.name ?? 'held').normalize('NFKD').replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'held'}-${actor.id}-${Date.now()}.webp`;

/**
 * Bannerbild vom eigenen Rechner hochladen. Ohne Standardordner ein Hinweis (SL: selbst setzen, Spieler: SL fragen);
 * wer nicht selbst hochladen darf, braucht eine angemeldete Spielleitung.
 */
export async function uploadBannerFromComputer(actor) {
  const n = ui.notifications;
  if (!bannerPath()) return n.warn(game.user.isGM ? 'DSA5HELPERS.Banner.NoPathGM' : 'DSA5HELPERS.Banner.NoPath', { localize: true });
  const direct = game.user.isGM || game.user.can('FILES_UPLOAD');
  if (!direct && !game.users.activeGM) return n.warn('DSA5HELPERS.Banner.NoGM', { localize: true });
  const file = await chooseLocalImage();
  if (!file) return;
  if (!file.type.startsWith('image/')) return n.warn('DSA5HELPERS.Banner.NotImage', { localize: true });
  let blob;
  try { blob = await shrink(file); } catch { return n.warn('DSA5HELPERS.Banner.NotImage', { localize: true }); }
  const fileName = safeName(actor);
  if (direct) {
    const path = await uploadFile(new File([blob], fileName, { type: blob.type }));
    if (!path) return n.error('DSA5HELPERS.Banner.Failed', { localize: true });
    return actor.setFlag(MODULE_ID, 'bannerImg', path);
  }
  const requestId = foundry.utils.randomID();
  const result = await new Promise(resolve => {
    const timer = setTimeout(() => { pending.delete(requestId); resolve({ ok: false, error: 'DSA5HELPERS.Banner.Timeout' }); }, 30000);
    pending.set(requestId, data => { clearTimeout(timer); resolve(data); });
    blobToDataUrl(blob).then(dataUrl => game.socket.emit(SOCKET, { type: 'bannerUpload', requestId, userId: game.user.id, actorId: actor.id, fileName, dataUrl }));
  });
  if (!result.ok) n.error(result.error ?? 'DSA5HELPERS.Banner.Failed', { localize: true });
}
