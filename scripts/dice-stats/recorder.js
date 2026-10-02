// Würfelstatistik (Issue #28): Erfassung. Jeder einzelne Würfel eines Wurfs läuft durch DiceTerm#_evaluateAsync
// (Proben, Schaden, Schips-Neuwürfe, Initiative, /roll — DSA5 legt für alles ein neues Roll-Objekt an und ruft
// evaluate()). Dort und nicht in DiceTerm#roll wird gezählt, weil der RollResolver echte Würfel (manuelle Eingabe)
// direkt in term.results schreibt, ohne roll() aufzurufen. Gezählt wird beim würfelnden Client in den eigenen
// User-Flag; nur Zähler, keine einzelnen Würfe. Schreibzugriffe werden gebündelt.
import { mergeCounts } from './stats.js';

export const MODULE_ID = 'dsa5-helpers';
export const STATS_FLAG = 'diceStats';
const FLUSH_DELAY = 10_000;

/** Noch nicht gespeicherte Würfe: { d: { "20": [..] }, m: {} } */
let pending = null;
let timer = null;
let flushing = null;

/**
 * Zählt die neuen Ergebnisse eines Würfels. Reine Funktion für den Test-Harness.
 * @param {{faces:number, results:{result:number}[]}} term
 * @param {number} from     Index des ersten neuen Ergebnisses
 * @param {'d'|'m'} method  digital oder echte Würfel
 * @param {object|null} into vorhandenes Delta
 */
export function countResults(term, from, method, into = null) {
  const faces = Number(term.faces);
  if (!Number.isInteger(faces) || faces < 2 || faces > 100) return into;
  const fresh = term.results.slice(from).map(r => r.result).filter(v => Number.isInteger(v) && v >= 1 && v <= faces);
  if (!fresh.length) return into;
  const delta = into ?? { d: {}, m: {} };
  const counts = delta[method][faces] ??= Array(faces).fill(0);
  for (const v of fresh) counts[v - 1]++;
  return delta;
}

/** Echte Würfel: der RollResolver hat dem Würfel eine interaktive Erfüllungsart zugewiesen (z. B. „manual“). */
export function methodOf(term) {
  const method = term.method;
  return method && CONFIG.Dice.fulfillment.methods[method]?.interactive ? 'm' : 'd';
}

function schedule() {
  if (!timer) timer = setTimeout(() => { timer = null; flush(); }, FLUSH_DELAY);
}

/** Schreibt die gesammelten Würfe in den eigenen User-Flag (ein Update für alle seit dem letzten Mal). */
export async function flush() {
  if (!pending || flushing) return flushing;
  const delta = pending;
  pending = null;
  const next = mergeCounts(game.user.getFlag(MODULE_ID, STATS_FLAG), delta);
  flushing = game.user.setFlag(MODULE_ID, STATS_FLAG, next)
    .catch(err => console.error('DSA5 Helpers | Würfelstatistik konnte nicht gespeichert werden.', err))
    .finally(() => { flushing = null; if (pending) schedule(); });
  return flushing;
}

/**
 * Hängt die Erfassung an DiceTerm#_evaluateAsync (per libWrapper, falls aktiv).
 * @param {() => boolean} isActive  Statistik eingeschaltet UND Zustimmung des Spielers
 */
export function initRecorder(isActive) {
  const Die = foundry.dice.terms.Die;
  const wrapper = async function (wrapped, options = {}) {
    const before = this.results.length;
    const result = await wrapped(options);
    try {
      // Mindest-/Höchstwerte sind Berechnungen, keine Würfe. Nur echte Würfel (Die), keine Münzen/Fate-Würfel.
      if (!options.minimize && !options.maximize && this instanceof Die && isActive()) {
        const delta = countResults(this, before, methodOf(this), pending);
        if (delta) { pending = delta; schedule(); }
      }
    } catch (err) {
      console.error('DSA5 Helpers | Würfelstatistik: Erfassung fehlgeschlagen.', err);
    }
    return result;
  };
  const target = 'foundry.dice.terms.DiceTerm.prototype._evaluateAsync';
  if (globalThis.libWrapper) {
    libWrapper.register(MODULE_ID, target, wrapper, 'WRAPPER');
  } else {
    const proto = foundry.dice.terms.DiceTerm.prototype;
    const original = proto._evaluateAsync;
    proto._evaluateAsync = function (options) { return wrapper.call(this, original.bind(this), options); };
  }
  // Beim Schließen/Neuladen noch speichern (das Update wird abgeschickt, auf die Antwort kann nicht gewartet werden).
  window.addEventListener('pagehide', () => flush());
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
}
