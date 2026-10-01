// Erzeugt styles/dsa5-helpers-frame.svg — den Fensterrahmen des Bogens (Issue #22): Nachbau des DSA5-Rahmens
// systems/dsa5/icons/backgrounds/actor.webp (Holz, helles Doppelband mit Knoten, Innenlinie) als Vektor.
// Genutzt als border-image (Slice T W W W, repeat): Ecken fest, Knoten in Originalgröße gekachelt statt gestreckt.
// Oben ist das ganze Band um k = T/W verbreitert (Platz für die aufgesetzte Knopf-Plakette), Seiten/unten W.
// Aufruf: node tools/gen-frame.cjs — danach Modul (styles/) und Click-Dummy nutzen dieselbe Datei.
const fs = require('node:fs');
const path = require('node:path');

const OUT = path.resolve(__dirname, '../styles/dsa5-helpers-frame.svg');
const W = 16, T = 24, k = T / W;
const P_SIDE = 40;                  // Knotenabstand an den Seiten
const P_TOP = Math.round(40 * k);   // oben größere Knoten → oben/unten weiterer Abstand
const WOOD = '#8a6d56', DARK = '#4a372b', LIGHT = '#d6c2b4', MID = '#a99184', LINE = '#dcc6b8';
// Lagen eines 16px-Bandes, von außen gemessen: [Mittellinie, Breite, Farbe] (Farben aus actor.webp gemessen).
const LAYERS = [[1.1, 2.2, WOOD], [6.7, 9.0, DARK], [4.0, 2.0, LIGHT], [9.4, 2.0, LIGHT], [6.7, 1.6, MID],
  [12.35, 2.3, WOOD], [14.1, 3.0, DARK], [14.1, 1.2, LINE], [15.8, 0.4, DARK]];
const w = 2 * W + P_TOP, h = T + P_SIDE + W;
const n = v => +v.toFixed(3);

const out = [`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
  `<rect width="${w}" height="${h}" fill="${WOOD}"/>`];
for (const [off, width, color] of LAYERS) {
  const ot = n(off * k), wt = n(width * k), s = `stroke="${color}" fill="none"`;
  // Linien laufen um die halbe Breite in die Ecke weiter, damit die Ecken geschlossen sind.
  out.push(`<path d="M${n(off - width / 2)} ${ot} H${n(w - off + width / 2)}" ${s} stroke-width="${wt}"/>`);
  out.push(`<path d="M${n(off - width / 2)} ${n(h - off)} H${n(w - off + width / 2)}" ${s} stroke-width="${width}"/>`);
  out.push(`<path d="M${off} ${n(ot - wt / 2)} V${n(h - off + width / 2)}" ${s} stroke-width="${width}"/>`);
  out.push(`<path d="M${n(w - off)} ${n(ot - wt / 2)} V${n(h - off + width / 2)}" ${s} stroke-width="${width}"/>`);
}

// Ein Knoten im 16px-Band (Außenkante oben), Mitte bei cx: die beiden Stränge kreuzen sich S-förmig.
const R0 = 2.2, R1 = 11.2, S1 = 4.0, S2 = 9.4;
function knot(cx) {
  const a = cx - 7, b = cx + 7;
  const parts = [`<rect x="${n(a)}" y="${R0}" width="${b - a}" height="${n(R1 - R0)}" fill="${DARK}"/>`,
    `<rect x="${n(a + 1)}" y="${n(R0 + 0.9)}" width="${b - a - 2}" height="${n(R1 - R0 - 1.8)}" fill="#8a6f5c"/>`];
  for (const d of [`M${n(a - 1)} ${S2} C${n(cx - 2)} ${S2} ${n(cx + 2)} ${S1} ${n(b + 1)} ${S1}`,
    `M${n(a - 1)} ${S1} C${n(cx - 2)} ${S1} ${n(cx + 2)} ${S2} ${n(b + 1)} ${S2}`]) {
    parts.push(`<path d="${d}" fill="none" stroke="${DARK}" stroke-width="3.8"/>`, `<path d="${d}" fill="none" stroke="${LIGHT}" stroke-width="2"/>`);
  }
  return parts.join('');
}
const g = (items, m) => `<g transform="matrix(${m})">${items}</g>`;
const cx = W + P_TOP / 2, cy = T + P_SIDE / 2;
out.push(g(knot(cx / k), `${k} 0 0 ${k} 0 0`));   // oben, vergrößert
out.push(g(knot(cx), `1 0 0 -1 0 ${h}`));          // unten
out.push(g(knot(cy), '0 1 1 0 0 0'));              // links
out.push(g(knot(cy), `0 1 -1 0 ${w} 0`));          // rechts
out.push('</svg>');

const head = `<!-- Fensterrahmen DSA5 Helpers (Issue #22): Nachbau des DSA5-Rahmens actor.webp. Oben ${T}px, sonst ${W}px;\n`
  + `     border-image-slice ${T} ${W} ${W} ${W}, repeat. Erzeugt von tools/gen-frame.cjs — nicht von Hand bearbeiten. -->\n`;
fs.writeFileSync(OUT, head + out.join('\n') + '\n');
console.log(`${path.relative(process.cwd(), OUT)} geschrieben (${w}×${h}).`);
