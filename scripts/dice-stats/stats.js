// Würfelstatistik (Issue #28): reine Auswertungsfunktionen ohne Foundry-Abhängigkeit, damit sie im Test-Harness und im
// Click-Dummy (clickdummy/dice-stats.js importiert diese Datei) dieselbe Rechnung liefern.
//
// Gespeichert werden nur Zähler je Augenzahl (counts[i] = wie oft die Augenzahl i+1 fiel). Geprüft wird per
// Chi-Quadrat-Anpassungstest auf Gleichverteilung; der p-Wert ist die obere regularisierte Gammafunktion
// Q(df/2, chi²/2) (Numerical Recipes, Kap. 6.2: Reihe für x < a+1, sonst Kettenbruch).

/** Ab so vielen Würfen je Seite gibt es eine Einschätzung (Faustregel: erwartete Häufigkeit ≥ 5 je Augenzahl). */
export const MIN_ROLLS_PER_FACE = 5;
/** Grenzen der Einstufung. */
export const P_SLIGHT = 0.05;
export const P_STRONG = 0.01;

const LANCZOS = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];

/** ln Γ(x) für x > 0 (Lanczos-Näherung, Genauigkeit ~1e-10). */
export function lnGamma(x) {
  let y = x;
  const tmp = x + 5.5 - (x + 0.5) * Math.log(x + 5.5);
  let ser = 1.000000000190015;
  for (const c of LANCZOS) ser += c / ++y;
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

/** Obere regularisierte unvollständige Gammafunktion Q(a, x) = 1 − P(a, x). */
export function gammaQ(a, x) {
  if (x <= 0) return 1;
  if (x < a + 1) {
    // Reihe für P(a, x)
    let ap = a, sum = 1 / a, del = sum;
    for (let n = 0; n < 500; n++) {
      del *= x / ++ap;
      sum += del;
      if (Math.abs(del) < Math.abs(sum) * 1e-14) break;
    }
    return 1 - sum * Math.exp(-x + a * Math.log(x) - lnGamma(a));
  }
  // Kettenbruch für Q(a, x) (modifizierter Lentz)
  const FPMIN = 1e-300;
  let b = x + 1 - a, c = 1 / FPMIN, d = 1 / b, h = d;
  for (let i = 1; i < 500; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = b + an / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-14) break;
  }
  return Math.exp(-x + a * Math.log(x) - lnGamma(a)) * h;
}

/** p-Wert der Chi-Quadrat-Verteilung: P(X² ≥ chi2) bei df Freiheitsgraden. */
export function chiSquarePValue(chi2, df) {
  return Math.min(1, Math.max(0, gammaQ(df / 2, chi2 / 2)));
}

/**
 * Wertet die Zähler eines Würfeltyps aus.
 * @param {number[]} counts  Länge = Seitenzahl; counts[i] = Anzahl der Augenzahl i+1
 * @returns {{faces:number, n:number, mean:number|null, expectedMean:number, expectedPerFace:number,
 *   chi2:number|null, df:number, p:number|null, verdict:'empty'|'few'|'normal'|'slight'|'strong',
 *   minRolls:number, shares:number[], deviations:number[]}}
 */
export function evaluateDie(counts) {
  const faces = counts.length;
  const n = counts.reduce((s, c) => s + c, 0);
  const expectedMean = (faces + 1) / 2;
  const expectedPerFace = n / faces;
  const minRolls = MIN_ROLLS_PER_FACE * faces;
  const df = faces - 1;
  const base = { faces, n, expectedMean, expectedPerFace, df, minRolls };
  if (!n) return { ...base, mean: null, chi2: null, p: null, verdict: 'empty', shares: counts.map(() => 0), deviations: counts.map(() => 0) };
  const mean = counts.reduce((s, c, i) => s + c * (i + 1), 0) / n;
  const chi2 = counts.reduce((s, c) => s + (c - expectedPerFace) ** 2 / expectedPerFace, 0);
  const p = chiSquarePValue(chi2, df);
  const verdict = n < minRolls ? 'few' : p < P_STRONG ? 'strong' : p < P_SLIGHT ? 'slight' : 'normal';
  return {
    ...base, mean, chi2, p, verdict,
    shares: counts.map((c) => c / n),
    // Relative Abweichung je Augenzahl gegenüber der Erwartung (+0.25 = 25 % häufiger als erwartet).
    deviations: counts.map((c) => (c - expectedPerFace) / expectedPerFace),
  };
}

// ---------- Speicherformat ----------
// User-Flag `dsa5-helpers.diceStats`, Version 2 (2026-10-02, für den Zeitraum-Filter): ein Zähler-Topf je Spielabend.
//   { v: 2, days: { "2026-10-02": { d: { "20": [..20 Zähler..], "6": [..] }, m: { … } } } }
// d = digitale Würfel, m = echte Würfel. Ein Spielabend kostet je Spieler gut 100 Byte, unabhängig von der Zahl der Würfe.
// Version 1 (ein einziger Topf { v:1, since, d, m }) wird beim Lesen als ein Abend am Tag von `since` übernommen.

/** Ein Spielabend reicht bis 6 Uhr morgens: Würfe nach Mitternacht zählen noch zum Vorabend. */
export const DAY_START_HOUR = 6;

/** Schlüssel des Spielabends (lokales Datum, YYYY-MM-DD) zu einem Zeitpunkt. */
export function dayKey(time = Date.now()) {
  const d = new Date(time - DAY_START_HOUR * 3600_000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Gespeicherte Statistik in Version 2 (ältere Formate werden umgewandelt, ungültige ergeben eine leere). */
export function normalizeStats(stats) {
  if (stats?.v === 2 && stats.days) return stats;
  if (stats?.v === 1) return { v: 2, days: { [dayKey(stats.since ?? Date.now())]: { d: { ...stats.d }, m: { ...stats.m } } } };
  return { v: 2, days: {} };
}

function addCounts(target, delta) {
  for (const method of ['d', 'm']) {
    target[method] ??= {};
    for (const [faces, add] of Object.entries(delta?.[method] ?? {})) {
      const prev = target[method][faces];
      target[method][faces] = Array.from({ length: Number(faces) }, (_, i) => (prev?.[i] ?? 0) + (add[i] ?? 0));
    }
  }
  return target;
}

/**
 * Addiert neue Würfe auf eine gespeicherte Statistik und gibt eine neue zurück (Eingabe bleibt unverändert).
 * deltaByDay: { "2026-10-02": { d: { "20": [..] }, m: {} } }
 */
export function mergeCounts(stats, deltaByDay) {
  const base = normalizeStats(stats);
  const days = { ...base.days };
  for (const [day, delta] of Object.entries(deltaByDay ?? {})) {
    const prev = days[day] ?? {};
    days[day] = addCounts({ d: { ...prev.d }, m: { ...prev.m } }, delta);
  }
  return { v: 2, days };
}

/** Spielabende mit Würfen (Schlüssel), neueste zuerst. */
export function playDays(statsList) {
  const set = new Set();
  for (const s of statsList) for (const day of Object.keys(normalizeStats(s).days)) set.add(day);
  return [...set].sort().reverse();
}

/** Summe der Zähler im Zeitraum (Schlüssel einschließlich; ohne Grenze = alles): { d: {...}, m: {...} }. */
export function sumCounts(stats, { from = null, to = null } = {}) {
  const out = { d: {}, m: {} };
  for (const [day, counts] of Object.entries(normalizeStats(stats).days)) {
    if ((from && day < from) || (to && day > to)) continue;
    addCounts(out, counts);
  }
  return out;
}

/** Würfeltypen mit Würfen in mindestens einer Summe (sumCounts), aufsteigend, W20 vorne (DSA5-Hauptwürfel). */
export function dieTypes(countsList, method) {
  const set = new Set();
  for (const s of countsList) for (const [faces, counts] of Object.entries(s?.[method] ?? {})) if (counts.some(Boolean)) set.add(Number(faces));
  return [...set].sort((a, b) => (a === 20 ? -1 : b === 20 ? 1 : a - b));
}
