// Mobile Support („Hybrides Spiel“, project/MOBILE.md Abschnitt 13).
// - Welt-Einstellung hybridPlay (nur SL, Standard aus) ist der Hauptschalter: aus = keine Mobil-Logik.
// - Die Oberfläche wird beim Start automatisch gewählt (13.2), überschreibbar per Client-Einstellung uiMode
//   oder Notausgang ?dsa5h-ui=auto|phone|tablet|foundry. Keine Abfrage, kein Umhüllen von setupGame:
//   init läuft vor initializeUI, Body-Klasse und CONFIG.ui-Einträge reichen.
// - „Spielfeld aus“ ist einfach Foundrys Client-Einstellung core.noCanvas (gilt nur für dieses Gerät).
import { initShell } from './shell.js';
import { initCanvasTouch } from './canvas-touch.js';
import { initTouchContext } from './touch-context.js';

export const MODULE_ID = 'dsa5-helpers';
const MODES = ['auto', 'phone', 'tablet', 'foundry'];

/** Aktive Oberfläche dieses Clients: 'phone', 'tablet' oder null (normale Foundry-Oberfläche). */
export let mobileMode = null;

/** Automatische Erkennung (einmal beim Start, Bildschirm statt Fenster, damit Drehen nicht umschaltet). */
export function detectMode() {
  const touch = matchMedia('(any-pointer: coarse)').matches;
  if (!touch) return 'foundry';
  const short = Math.min(screen.width, screen.height), long = Math.max(screen.width, screen.height);
  if (short < 600) return 'phone';
  // Touch-Laptop o. Ä. mit Maus als Hauptzeiger: normale Oberfläche
  if (matchMedia('(pointer: fine)').matches && long >= 1200) return 'foundry';
  return 'tablet';
}

function chosenMode() {
  const q = new URLSearchParams(location.search).get('dsa5h-ui');
  if (MODES.includes(q)) return q;
  return game.settings.get(MODULE_ID, 'uiMode');
}

/** Im init-Hook aufrufen. */
export function initMobile() {
  game.settings.register(MODULE_ID, 'hybridPlay', {
    name: 'DSA5HELPERS.Mobile.Settings.Hybrid.Name', hint: 'DSA5HELPERS.Mobile.Settings.Hybrid.Hint',
    scope: 'world', config: true, restricted: true, type: Boolean, default: false, requiresReload: true,
  });
  const hybrid = game.settings.get(MODULE_ID, 'hybridPlay');
  game.settings.register(MODULE_ID, 'uiMode', {
    name: 'DSA5HELPERS.Mobile.Settings.Mode.Name', hint: 'DSA5HELPERS.Mobile.Settings.Mode.Hint',
    scope: 'client', config: hybrid, type: String, default: 'auto', requiresReload: true,
    choices: Object.fromEntries(MODES.map(m => [m, `DSA5HELPERS.Mobile.Mode.${m}`])),
  });
  if (!hybrid) return;

  const chosen = chosenMode();
  const mode = chosen === 'auto' ? detectMode() : chosen;
  if (mode !== 'phone' && mode !== 'tablet') return;
  mobileMode = mode;

  document.body.classList.add('dsa5h-mobile', `dsa5h-${mode}`);
  // Notch/Home-Indikator: Foundry setzt die Viewport-Meta schon, nur viewport-fit fehlt.
  const meta = document.querySelector('meta[name="viewport"]');
  if (meta && !meta.content.includes('viewport-fit')) meta.content += ', viewport-fit=cover';

  // Foundry meldet unter 1366×768 dauerhaft „Auflösung zu niedrig“ (ClientIssues), mobil immer zutreffend.
  const Base = CONFIG.ui.notifications;
  CONFIG.ui.notifications = class Dsa5hMobileNotifications extends Base {
    notify(message, type, options) {
      if (typeof message === 'string' && message.startsWith('ERROR.RESOLUTION.')) return { id: -1, active: false };
      return super.notify(message, type, options);
    }
  };

  initCanvasTouch();
  initTouchContext();
  Hooks.once('ready', () => initShell(mode, { chosen, detected: detectMode() }));

  // Fenster (Bögen, Probendialoge, Journal …) bildschirmfüllend; die Kennzeichnung übernimmt das CSS.
  const markWindow = (app, element) => {
    const el = element instanceof HTMLElement ? element : element?.[0];
    if (!el || !(el.classList.contains('window-app') || app.hasFrame)) return;
    el.classList.add('dsa5h-m-window');
    // Unser Bogen ist fest 770 px breit; auf dem Smartphone verkleinern, bis das Mobil-Layout kommt (Phase 4).
    const content = el.querySelector('.window-content');
    if (mode === 'phone' && content && el.classList.contains('dsa5-helpers-sheet')) content.style.zoom = String(Math.min(1, innerWidth / 770));
  };
  Hooks.on('renderApplicationV2', markWindow);
  Hooks.on('renderApplication', markWindow);
}
