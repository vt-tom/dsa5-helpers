// Würfelstatistik (Issue #28): Erfassung. Jeder einzelne Würfel eines Wurfs läuft durch DiceTerm#_evaluateAsync
// (Proben, Schaden, Schips-Neuwürfe, Initiative, /roll — DSA5 legt für alles ein neues Roll-Objekt an und ruft
// evaluate()). Dort und nicht in DiceTerm#roll wird gezählt, weil der RollResolver echte Würfel (manuelle Eingabe)
// direkt in term.results schreibt, ohne roll() aufzurufen — und zwar schon vor _evaluateAsync. Darum merkt sich
// die Erfassung beim Öffnen des RollResolvers, wie viele Ergebnisse ein Würfel bis dahin hatte. Füllt Foundry dort
// eine leere Eingabe selbst aus (randomFace, auch beim Schließen über X), ist das ein digitaler Wurf.
// Gezählt wird beim würfelnden Client in den eigenen User-Flag (je Tag ein Topf, siehe stats.js); nur Zähler,
// keine einzelnen Würfe. Schreibzugriffe werden gebündelt.
import { mergeCounts, dayKey } from './stats.js';

export const MODULE_ID = 'dsa5-helpers';
export const STATS_FLAG = 'diceStats';
const FLUSH_DELAY = 10_000;

/** Noch nicht gespeicherte Würfe je Tag: { "2026-10-02": { d: { "20": [..] }, m: {} } } */
let pending = null;
/** Würfel im RollResolver → Anzahl Ergebnisse vor der Eingabe. */
const resolverStart = new WeakMap();
/** Würfel → von randomFace gelieferte Werte (digitaler Ersatz für fehlende Eingaben). */
const randomFaces = new WeakMap();
let timer = null;
let flushing = null;

/**
 * Zählt die neuen Ergebnisse eines Würfels. Reine Funktion für den Test-Harness.
 * @param {{faces:number, results:{result:number}[]}} term
 * @param {number} from     Index des ersten neuen Ergebnisses
 * @param {'d'|'m'} method  digital oder echte Würfel
 * @param {object|null} into vorhandenes Delta
 * @param {number[]} digital Werte, die bei echten Würfeln trotzdem digital gewürfelt wurden (je Wert einmal)
 */
export function countResults(term, from, method, into = null, digital = []) {
  const faces = Number(term.faces);
  if (!Number.isInteger(faces) || faces < 2 || faces > 100) return into;
  const fresh = term.results.slice(from).map(r => r.result).filter(v => Number.isInteger(v) && v >= 1 && v <= faces);
  if (!fresh.length) return into;
  const delta = into ?? { d: {}, m: {} };
  const spare = method === 'm' ? [...digital] : [];
  for (const v of fresh) {
    const i = spare.indexOf(v);
    if (i >= 0) spare.splice(i, 1);
    const counts = delta[i >= 0 ? 'd' : method][faces] ??= Array(faces).fill(0);
    counts[v - 1]++;
  }
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
  const patch = (target, fn) => {
    if (globalThis.libWrapper) return libWrapper.register(MODULE_ID, target, fn, 'WRAPPER');
    const path = target.split('.');
    const name = path.pop();
    const owner = path.reduce((o, key) => o?.[key], globalThis);
    const original = owner?.[name];
    if (typeof original !== 'function') return;
    owner[name] = function (...args) { return fn.call(this, original.bind(this), ...args); };
  };
  const Die = foundry.dice.terms.Die;
  const wrapper = async function (wrapped, options = {}) {
    const before = resolverStart.get(this) ?? this.results.length;
    resolverStart.delete(this);
    const result = await wrapped(options);
    try {
      // Mindest-/Höchstwerte sind Berechnungen, keine Würfe. Nur echte Würfel (Die), keine Münzen/Fate-Würfel.
      if (!options.minimize && !options.maximize && this instanceof Die && isActive()) {
        const day = dayKey();
        const delta = countResults(this, before, methodOf(this), pending?.[day] ?? null, randomFaces.get(this));
        if (delta) { pending = { ...pending, [day]: delta }; schedule(); }
      }
    } catch (err) {
      console.error('DSA5 Helpers | Würfelstatistik: Erfassung fehlgeschlagen.', err);
    }
    randomFaces.delete(this);
    return result;
  };
  patch('foundry.dice.terms.DiceTerm.prototype._evaluateAsync', wrapper);

  // RollResolver: Stand der Würfel vor der Eingabe (der ganze Wurf beim Öffnen, nachgereichte Würfel einzeln).
  const remember = term => { if (term?.results && !resolverStart.has(term)) resolverStart.set(term, term.results.length); };
  if (foundry.applications?.dice?.RollResolver) {
    patch('foundry.applications.dice.RollResolver.prototype.awaitFulfillment', function (wrapped, ...args) {
      try { for (const term of this.roll?.dice ?? []) remember(term); } catch { /* nur Statistik */ }
      return wrapped(...args);
    });
    patch('foundry.applications.dice.RollResolver.prototype.addTerm', function (wrapped, term, ...args) {
      remember(term);
      return wrapped(term, ...args);
    });
  }
  patch('foundry.dice.terms.DiceTerm.prototype.randomFace', function (wrapped, ...args) {
    const value = wrapped(...args);
    if (resolverStart.has(this) || this.method) {
      const list = randomFaces.get(this) ?? [];
      list.push(value);
      randomFaces.set(this, list);
    }
    return value;
  });
  // Beim Schließen/Neuladen noch speichern (das Update wird abgeschickt, auf die Antwort kann nicht gewartet werden).
  window.addEventListener('pagehide', () => flush());
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
}
