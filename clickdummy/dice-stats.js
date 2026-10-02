// Würfelstatistik (Issue #28) im Click-Dummy: eigenes Fenster (in Foundry eine ApplicationV2, geöffnet über die
// Moduleinstellungen) und der Zustimmungsdialog beim Verbinden — mit Demo-Daten. Die Auswertung kommt aus der echten
// Moduldatei scripts/dice-stats/stats.js, damit Click-Dummy und Modul dieselbe Rechnung zeigen.
//
// Darstellung B „Karten“ (Nutzer-Entscheidung 2026-10-02; verworfen: A „Zeilen“ mit Mini-Diagramm, C „Raster“
// Spieler × Augenzahl). Der Schalter „Ansicht“ oben im Fenster zeigt die Spieler-Sicht (nur die eigene Karte) bzw.
// die SL-Sicht (alle Karten, Löschen).
import { evaluateDie, dieTypes, mergeCounts, playDays, sumCounts, P_SLIGHT, P_STRONG } from "../scripts/dice-stats/stats.js";

// ---------- Demo-Daten ----------
// Deterministischer Zufall (mulberry32), damit die Bilder bei jedem Laden gleich aussehen.
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// n Würfe eines Würfels mit Seitengewichten (weights fehlt = fair).
function roll(faces, n, seed, weights) {
  const r = rng(seed), counts = Array(faces).fill(0);
  const w = weights ?? Array(faces).fill(1), total = w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < n; i++) {
    let x = r() * total, k = 0;
    while (x >= w[k]) x -= w[k++];
    counts[k]++;
  }
  return counts;
}
const tilt = (faces, face, factor) => Array.from({ length: faces }, (_, i) => (i + 1 === face ? factor : 1));
// Drei Tage mit Würfen; die Würfe eines Spielers werden etwa 45/35/20 % darauf verteilt (Speicherformat je Tag, stats.js).
const DAYS = ["2026-10-02", "2026-09-25", "2026-09-18"];
const NOW = new Date(2026, 9, 2, 22).getTime(); // fester Bezugspunkt, sonst fasst die 12-Monats-Grenze die Demo-Tage irgendwann zusammen
const SHARES = [0.45, 0.35];
function stats(d, m = {}) {
  const part = (counts, k) => counts.map((c) => (k < SHARES.length ? Math.floor(c * SHARES[k]) : c - SHARES.reduce((sum, f) => sum + Math.floor(c * f), 0)));
  const split = (group, k) => Object.fromEntries(Object.entries(group).map(([faces, counts]) => [faces, part(counts, k)]));
  return mergeCounts(null, Object.fromEntries(DAYS.map((day, k) => [day, { d: split(d, k), m: split(m, k) }])), NOW);
}

// Farben wie die Foundry-Benutzerfarben (Spielerliste) — Identität, nicht Wertung.
const PLAYERS = [
  { id: "u1", name: "Spielleitung", color: "#c9a227", gm: true, consent: "yes", stats: stats({ 20: roll(20, 612, 1), 6: roll(6, 240, 2), 3: roll(3, 40, 3) }) },
  { id: "u2", name: "Anna", color: "#3f7fbf", consent: "yes", stats: stats({ 20: roll(20, 486, 11), 6: roll(6, 132, 12) }, { 20: roll(20, 64, 13) }) },
  // Leicht auffällig: etwas zu viele 1en.
  { id: "u3", name: "Ben", color: "#b3473b", consent: "yes", stats: stats({ 20: roll(20, 530, 26, tilt(20, 1, 1.6)), 6: roll(6, 98, 22) }) },
  // Deutlich auffällig: viele 20en (echte Würfel).
  { id: "u4", name: "Clara", color: "#4f8f4a", consent: "yes", stats: stats({ 20: roll(20, 210, 31), 6: roll(6, 61, 32) }, { 20: roll(20, 380, 33, tilt(20, 20, 2.3)), 6: roll(6, 45, 34) }) },
  // Zu wenige Würfe für eine Aussage.
  { id: "u5", name: "David", color: "#8a5cb5", consent: "yes", stats: stats({ 20: roll(20, 57, 41), 6: roll(6, 14, 42) }) },
  // Zustimmung zurückgezogen: Daten bleiben, werden aber nicht angezeigt.
  { id: "u6", name: "Eva", color: "#3a9a9a", consent: "no", stats: stats({ 20: roll(20, 300, 51) }) },
  // Noch nicht entschieden: wird nicht erfasst, erscheint als Hinweis.
  { id: "u7", name: "Finn", color: "#c46b2a", consent: "undecided", stats: null },
];

// ---------- Zustand ----------
// Spieleransicht: nur die eigene Karte (Nutzer-Entscheidung 2026-10-02); im Click-Dummy ist „man selbst“ Anna.
const OWN_ID = "u2";
const state = { gm: true, method: "d", faces: 20, range: "all", from: "", to: "", open: new Set() };
let win = null;

// ---------- Helfer ----------
function el(tag, attrs = {}, children = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") n.className = v;
    else if (k === "style") n.setAttribute("style", v);
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? "" : v);
  }
  for (const c of [].concat(children)) if (c !== null && c !== undefined && c !== false) n.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return n;
}
const fmt = (x, d = 1) => x.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (x, d = 1) => `${fmt(x * 100, d)} %`;
const fmtP = (p) => (p < 0.001 ? "< 0,001" : fmt(p, 3));
const dieLabel = (f) => `W${f}`;
const methodLabel = { d: "Digital", m: "Echte Würfel" };

const VERDICT = {
  normal: { icon: "✓", label: "unauffällig", cls: "good" },
  slight: { icon: "!", label: "leicht auffällig", cls: "warn" },
  strong: { icon: "!!", label: "deutlich auffällig", cls: "serious" },
  few: { icon: "…", label: "zu wenige Würfe", cls: "few" },
  empty: { icon: "–", label: "keine Würfe", cls: "few" },
};
function verdictPill(ev) {
  const v = VERDICT[ev.verdict];
  const tip = ev.verdict === "few" ? `Eine Einschätzung gibt es ab ${ev.minRolls} Würfen (5 je Seite).` : ev.p !== null ? `Chi-Quadrat-Test: p = ${fmtP(ev.p)}` : "";
  return el("span", { class: `ds-verdict ${v.cls}`, title: tip }, [el("span", { class: "ds-verdict-icon", "aria-hidden": "true" }, v.icon), v.label, ev.verdict === "few" ? el("small", {}, ` (${ev.n}/${ev.minRolls})`) : null]);
}

// Balkendiagramm der Augenzahlen, waagerechte Linie = Erwartungswert. Eine Farbe (eine Reihe), Höhe = Anzahl.
function histogram(counts, ev, { width = 260, height = 64, labels = "ends" } = {}) {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  const axis = labels === "none" ? 0 : 14;
  svg.setAttribute("viewBox", `0 0 ${width} ${height + axis}`);
  svg.setAttribute("width", width);
  svg.setAttribute("height", height + axis);
  svg.setAttribute("class", "ds-hist");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `Verteilung ${dieLabel(ev.faces)}: ${counts.map((c, i) => `${i + 1}: ${c}`).join(", ")}; erwartet je ${fmt(ev.expectedPerFace)}`);
  const max = Math.max(...counts, ev.expectedPerFace) * 1.08 || 1;
  const gap = ev.faces > 12 ? 2 : 4;
  const bw = (width - gap * (ev.faces - 1)) / ev.faces;
  const mk = (tag, attrs) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); return n; };
  svg.append(mk("line", { x1: 0, x2: width, y1: height + 0.5, y2: height + 0.5, class: "ds-hist-base" }));
  counts.forEach((c, i) => {
    const h = (c / max) * height, x = i * (bw + gap);
    const bar = mk("rect", { x, y: height - h, width: bw, height: Math.max(h, c ? 1 : 0), rx: Math.min(2, bw / 4), class: "ds-hist-bar" + (ev.faces === 20 && (i === 0 || i === 19) ? " ds-key" : "") });
    const t = mk("title", {});
    t.textContent = `${i + 1}: ${c}× (erwartet ${fmt(ev.expectedPerFace)}, ${ev.deviations[i] >= 0 ? "+" : ""}${pct(ev.deviations[i], 0)})`;
    bar.append(t);
    svg.append(bar);
    const show = labels === "all" || (labels === "ends" && (i === 0 || i === ev.faces - 1 || (ev.faces === 20 && (i + 1) % 5 === 0)));
    if (show) { const tx = mk("text", { x: x + bw / 2, y: height + 12, class: "ds-hist-label" }); tx.textContent = i + 1; svg.append(tx); }
  });
  const ey = height - (ev.expectedPerFace / max) * height;
  svg.append(mk("line", { x1: 0, x2: width, y1: ey, y2: ey, class: "ds-hist-expected" }));
  return svg;
}

// Kennzahlen; beim W20 zusätzlich der Anteil der 1en (Glückswurf) und 20en (Patzer).
function keyFigures(ev, counts) {
  const items = [
    ["Würfe", ev.n.toLocaleString("de-DE")],
    ["Ø", ev.mean === null ? "–" : `${fmt(ev.mean, 2)}`, `erwartet ${fmt(ev.expectedMean, 1)}`],
  ];
  if (ev.faces === 20 && ev.n) {
    items.push(["1en", pct(counts[0] / ev.n), "erwartet 5 %"]);
    items.push(["20en", pct(counts[19] / ev.n), "erwartet 5 %"]);
  }
  return items;
}

function detailsTable(ev, counts) {
  return el("div", { class: "ds-details" }, [
    el("table", { class: "ds-table" }, [
      el("thead", {}, [el("tr", {}, [el("th", {}, "Augenzahl"), el("th", {}, "Anzahl"), el("th", {}, "Erwartet"), el("th", {}, "Abweichung")])]),
      el("tbody", {}, counts.map((c, i) => el("tr", { class: ev.faces === 20 && (i === 0 || i === 19) ? "ds-key-row" : "" }, [
        el("td", {}, String(i + 1)), el("td", {}, String(c)), el("td", {}, fmt(ev.expectedPerFace)),
        el("td", { class: Math.abs(ev.deviations[i]) >= 0.25 ? "ds-dev-big" : "" }, `${ev.deviations[i] >= 0 ? "+" : "−"}${pct(Math.abs(ev.deviations[i]), 0)}`),
      ]))),
    ]),
    ev.p !== null ? el("p", { class: "ds-test" }, `Chi-Quadrat-Test auf Gleichverteilung: χ² = ${fmt(ev.chi2, 2)} bei ${ev.df} Freiheitsgraden, p = ${fmtP(ev.p)}. ` +
      `„leicht auffällig“ ab p < ${fmt(P_SLIGHT, 2)}, „deutlich auffällig“ ab p < ${fmt(P_STRONG, 2)}.`) : null,
  ]);
}

function gmReset(player) {
  if (!state.gm) return null;
  // Mülleimer statt Kreispfeil: der sah aus wie „neu laden“ (Rückmeldung 2026-10-02).
  return el("button", { type: "button", class: "ds-reset", title: `Statistik von ${player.name} löschen`, "aria-label": `Statistik von ${player.name} löschen`, onclick: (e) => { e.stopPropagation(); confirmReset(player); } }, "🗑");
}

function confirmReset(player) {
  const who = player ? `von ${player.name}` : "aller Spieler";
  dialog({
    title: "Würfelstatistik löschen",
    body: [el("p", {}, `Die gesamte Statistik ${who} wird gelöscht. Das lässt sich nicht rückgängig machen.`)],
    buttons: [["Löschen", () => { (player ? [player] : PLAYERS).forEach((p) => { if (p.stats) p.stats = mergeCounts(null, {}); }); render(); }, "danger"], ["Abbrechen", null]],
  });
}

// ---------- Darstellungen ----------
function cardsB(list) {
  return el("div", { class: "ds-cards" }, list.map(({ p, counts, ev }) => {
    const open = state.open.has(p.id);
    return el("div", { class: "ds-card" }, [
      el("div", { class: "ds-card-head" }, [el("span", { class: "ds-name" }, [el("span", { class: "ds-swatch", style: `background:${p.color}` }), p.name]), gmReset(p)]),
      verdictPill(ev),
      histogram(counts, ev, { width: 300, height: 70, labels: "ends" }),
      el("div", { class: "ds-figures" }, keyFigures(ev, counts).map(([l, v, s]) => el("span", {}, [el("small", {}, l), el("strong", {}, v), s ? el("small", {}, s) : null]))),
      el("button", { type: "button", class: "ds-more", "aria-expanded": String(open), onclick: () => { open ? state.open.delete(p.id) : state.open.add(p.id); render(); } }, open ? "Tabelle ausblenden" : "Tabelle zeigen"),
      open ? detailsTable(ev, counts) : null,
    ]);
  }));
}

// ---------- Fenster ----------
function seg(options, current, onPick, label) {
  return el("div", { class: "ds-seg", role: "group", "aria-label": label }, options.map(([v, t]) => el("button", { type: "button", class: v === current ? "active" : "", "aria-pressed": String(v === current), onclick: () => onPick(v) }, t)));
}

function render() {
  if (!win) return;
  const theme = document.querySelector(".sheet")?.getAttribute("data-theme") || "light";
  win.setAttribute("data-theme", theme);
  const shown = state.gm ? PLAYERS : PLAYERS.filter((p) => p.id === OWN_ID);
  const visible = shown.filter((p) => p.consent === "yes" && p.stats);
  // Zeitraum: gesamt, ein Tag oder eigener Zeitraum (von/bis, Tages-Schlüssel einschließlich).
  const days = playDays(visible.map((p) => p.stats));
  if (!["all", "custom", ...days].includes(state.range)) state.range = "all";
  const bounds = state.range === "all" ? {} : state.range === "custom" ? { from: state.from || null, to: state.to || null } : { from: state.range, to: state.range };
  const sums = new Map(visible.map((p) => [p, sumCounts(p.stats, bounds)]));
  const types = dieTypes([...sums.values()], state.method);
  if (!types.includes(state.faces)) state.faces = types[0] ?? 20;
  const list = visible
    .map((p) => {
      const counts = sums.get(p)[state.method][state.faces] ?? Array(state.faces).fill(0);
      return { p, counts, ev: evaluateDie(counts) };
    })
    .filter(({ ev }) => ev.n > 0);
  const hidden = state.gm ? PLAYERS.filter((p) => p.consent !== "yes") : [];
  const dayLabel = (key) => new Date(`${key}T12:00:00`).toLocaleDateString("de-DE");
  const rangeSelect = el("select", { class: "ds-range-select", "aria-label": "Zeitraum", onchange: (e) => { state.range = e.target.value; render(); } },
    [["all", "Gesamt"], ...days.map((d) => [d, dayLabel(d)]), ["custom", "Eigener Zeitraum …"]].map(([v, t]) => el("option", { value: v, selected: v === state.range }, t)));
  const dateInput = (key, label) => el("input", { type: "date", value: state[key], min: days.at(-1) ?? "", max: days[0] ?? "", "aria-label": label, onchange: (e) => { state[key] = e.target.value; render(); } });

  const body = win.querySelector(".ds-body");
  body.replaceChildren(...[ 
    el("div", { class: "ds-test-bar" }, [
      el("small", {}, "Ansicht (nur Click-Dummy):"),
      seg([[false, "Spieler (Anna)"], [true, "Spielleitung"]], state.gm, (v) => { state.gm = v; render(); }, "Ansicht"),
    ]),
    el("div", { class: "ds-filters" }, [
      seg(types.map((f) => [f, dieLabel(f)]), state.faces, (v) => { state.faces = v; render(); }, "Würfeltyp"),
      seg([["d", methodLabel.d], ["m", methodLabel.m]], state.method, (v) => { state.method = v; render(); }, "Würfelart"),
      el("label", { class: "ds-range" }, [el("span", {}, "Zeitraum"), rangeSelect]),
      state.range === "custom" ? el("span", { class: "ds-dates" }, [dateInput("from", "von"), el("span", { "aria-hidden": "true" }, "–"), dateInput("to", "bis")]) : null,
    ]),
    list.length
      ? cardsB(list)
      : el("p", { class: "ds-empty" }, `Noch keine Würfe mit ${dieLabel(state.faces)} (${methodLabel[state.method]}).`),
    el("p", { class: "ds-note" }, [
      "Digitale und echte Würfel werden getrennt ausgewertet. Bei vielen Spielern und Würfeltypen sind einzelne Ausreißer reiner Zufall – „auffällig“ heißt nur, dass sich ein genauerer Blick lohnt.",
    ]),
    hidden.length ? el("p", { class: "ds-note muted" }, `Nicht ausgewertet (keine Zustimmung): ${hidden.map((p) => p.name).join(", ")}.`) : null,
    state.gm ? el("div", { class: "ds-footer" }, [el("button", { type: "button", class: "ds-btn danger", onclick: () => confirmReset(null) }, "🗑 Alle Statistiken löschen")]) : null,
  ].filter(Boolean));
}

function makeWindow(title, cls) {
  const w = el("section", { class: `ds-window ${cls}`, role: "dialog", "aria-label": title }, [
    el("header", { class: "ds-window-header" }, [el("h2", {}, title), el("button", { type: "button", class: "ds-close", "aria-label": "Schließen", onclick: () => w.remove() }, "✕")]),
    el("div", { class: "ds-body" }),
  ]);
  w.setAttribute("data-theme", document.querySelector(".sheet")?.getAttribute("data-theme") || "light");
  document.body.append(w);
  return w;
}

export function openDiceStats() {
  win?.remove();
  win = makeWindow("Würfelstatistik", "ds-stats");
  render();
}

// Foundry-DialogV2-Nachbau: Titel, Text, Knöpfe.
function dialog({ title, body, buttons }) {
  const d = makeWindow(title, "ds-dialog");
  const close = () => d.remove();
  d.querySelector(".ds-body").append(...body, el("div", { class: "ds-dialog-buttons" }, buttons.map(([label, fn, cls]) => el("button", { type: "button", class: "ds-btn" + (cls ? " " + cls : ""), onclick: () => { close(); fn?.(); } }, label))));
  d.querySelector("button.ds-btn")?.focus();
  return d;
}

// Zustimmungsdialog beim Verbinden (aktive Statistik, Spieler hat noch nicht entschieden).
export function openConsent() {
  dialog({
    title: "Würfelstatistik",
    body: [
      el("p", {}, [el("strong", {}, "Dürfen deine Würfe für die Würfelstatistik ausgewertet werden?")]),
      el("p", {}, "Gezählt wird nur, wie oft welche Augenzahl je Tag fällt – keine einzelnen Würfe. Du siehst deine eigene Statistik, die Spielleitung die aller Spieler."),
      el("p", { class: "muted" }, "Du kannst das jederzeit in den Moduleinstellungen ändern. Ziehst du die Zustimmung zurück, wird nichts mehr gezählt und deine Statistik ausgeblendet."),
    ],
    buttons: [["Ja, auswerten", null, "primary"], ["Nein", null]],
  });
}

// Einstieg im Click-Dummy: Knöpfe in der Toolbar (index.html); ?dicestats öffnet das Fenster direkt.
document.getElementById("diceStatsBtn")?.addEventListener("click", openDiceStats);
document.getElementById("diceConsentBtn")?.addEventListener("click", openConsent);
document.getElementById("themeToggle")?.addEventListener("click", () => setTimeout(() => document.querySelectorAll(".ds-window").forEach((w) => w.setAttribute("data-theme", document.querySelector(".sheet").getAttribute("data-theme")))));
if (new URLSearchParams(location.search).has("dicestats")) openDiceStats();
window.dsa5hDiceStats = { openDiceStats, openConsent, state, render };
