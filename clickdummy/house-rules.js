// Hausregelbuch (2026-10-05) im Click-Dummy: Nachbau des Fensters aus scripts/apps/house-rules.js mit denselben
// CSS-Klassen wie templates/house-rules*.hbs (Abschnitt 22 in style.css). Texte kommen aus der echten lang/de.json,
// Regelliste aus scripts/house-rules/rules.js — so bleiben Click-Dummy und Modul gleich. Umschalten wie die SL;
// „Spieler-Sicht“ zeigt nur den Stand. Die Regel selbst (Token-HUD, Probe, Chat) gibt es nur in Foundry.
import { HOUSE_RULES } from "../scripts/house-rules/rules.js";

const lang = await fetch("../lang/de.json").then((r) => r.json());
const t = (key, data = {}) => {
  const text = key.split(".").reduce((o, k) => o?.[k], lang) ?? key;
  return String(text).replace(/\{(\w+)\}/g, (m, k) => data[k] ?? m);
};
const H = "DSA5HELPERS.HouseRules.";

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  node.append(...[].concat(children).filter((c) => c !== null && c !== undefined && c !== false));
  return node;
}
// Font Awesome gibt es nur in Foundry — hier dieselben Klassen mit einem Zeichen als Ersatz.
const FA = { "fa-heart-pulse": "♥", "fa-book": "📖", "fa-book-open": "📖", "fa-list": "☰", "fa-chevron-left": "‹", "fa-chevron-right": "›" };
const icon = (cls) => el("i", { class: cls, inert: "" }, FA[cls.split(" ").find((c) => FA[c])] ?? "");

const state = { view: "list", page: 0, gm: true, active: {} };
let win = null;

function toggle(rule) {
  const on = !!state.active[rule.id];
  const label = t(H + (on ? "Active" : "Inactive"));
  if (!state.gm) return el("span", { class: "dsa5h-hr-state" + (on ? " active" : "") }, label);
  return el("button", {
    type: "button", class: "dsa5h-hr-switch", role: "switch", "aria-checked": String(on), "aria-label": t(H + rule.id + ".Title"),
    onclick: () => { state.active[rule.id] = !on; render(); },
  }, [el("span", { class: "dsa5h-hr-switch-track", "aria-hidden": "true" }), el("span", {}, label)]);
}

function listView() {
  return [
    el("p", { class: "dsa5h-hr-intro" }, t(H + "Intro") + (state.gm ? "" : " " + t(H + "GMOnly"))),
    el("ul", { class: "dsa5h-hr-list" }, HOUSE_RULES.map((rule, index) => el("li", { class: "dsa5h-hr-entry" + (state.active[rule.id] ? " active" : "") }, [
      icon(rule.icon + " dsa5h-hr-icon"),
      el("div", { class: "dsa5h-hr-entry-text" }, [
        el("strong", {}, t(H + rule.id + ".Title")),
        el("span", {}, t(H + rule.id + ".Summary")),
        el("small", {}, t(H + "Credit", { name: rule.credit })),
      ]),
      toggle(rule),
      el("button", { type: "button", class: "dsa5h-hr-read", onclick: () => { state.view = "book"; state.page = index; render(); } }, [icon("fas fa-book-open"), " " + t(H + "Read")]),
    ]))),
  ];
}

// Seiteninhalt je Regel — Gegenstück zu templates/house-rules/<regel>.hbs.
const PAGES = {
  woundCheck: () => {
    const P = H + "woundCheck.Page.";
    return [
      el("section", { class: "dsa5h-hr-section" }, [el("p", {}, t(P + "Intro"))]),
      el("section", { class: "dsa5h-hr-section" }, [el("h3", {}, t(H + "HowTo")), el("ol", {}, [1, 2, 3, 4].map((n) => el("li", {}, t(P + "Step" + n))))]),
      el("section", { class: "dsa5h-hr-section" }, [
        el("h3", {}, t(P + "TableTitle")),
        el("table", { class: "dsa5h-hr-table" }, [
          el("thead", {}, el("tr", {}, [el("th", {}, t(P + "QS")), el("th", {}, t(P + "Result"))])),
          el("tbody", {}, [["–", 0], ["1", 1], ["2", 2], ["3", 3], ["4", 4], ["5+", 5]].map(([label, n]) => el("tr", {}, [el("td", {}, label), el("td", {}, t(P + "QS" + n))]))),
        ]),
        el("p", { class: "dsa5h-hr-note" }, t(P + "Conditions")),
      ]),
      el("section", { class: "dsa5h-hr-section" }, [el("h3", {}, t(H + "Notes")), el("ul", {}, [1, 2, 3].map((n) => el("li", {}, t(P + "Note" + n))))]),
    ];
  },
};

function bookView() {
  const page = Math.min(state.page, HOUSE_RULES.length - 1);
  const rule = HOUSE_RULES[page];
  return [el("article", { class: "dsa5h-hr-page" + (state.active[rule.id] ? " active" : "") }, [
    el("header", { class: "dsa5h-hr-page-head" }, [
      el("small", {}, t(H + "Number", { number: page + 1 })),
      el("h2", {}, [icon(rule.icon), " " + t(H + rule.id + ".Title")]),
      el("p", { class: "dsa5h-hr-credit" }, t(H + "CreditLong", { name: rule.credit })),
    ]),
    ...PAGES[rule.id](),
    el("footer", { class: "dsa5h-hr-page-foot" }, toggle(rule)),
  ])];
}

function pager() {
  const page = Math.min(state.page, HOUSE_RULES.length - 1);
  const turn = (to, label, cls) => el("button", { type: "button", "aria-label": t(H + label), disabled: to < 0 || to >= HOUSE_RULES.length ? "" : null, onclick: () => { state.page = to; render(); } }, icon(cls));
  return el("div", { class: "dsa5h-hr-pager" }, [
    turn(page - 1, "Prev", "fas fa-chevron-left"),
    el("span", {}, t(H + "Page", { page: page + 1, count: HOUSE_RULES.length })),
    turn(page + 1, "Next", "fas fa-chevron-right"),
  ]);
}

function render() {
  if (!win) return;
  const list = state.view === "list";
  const viewBtn = (view, label, cls) => el("button", { type: "button", class: state.view === view ? "active" : "", "aria-pressed": String(state.view === view), onclick: () => { state.view = view; render(); } }, [icon(cls), " " + t(H + label)]);
  const role = el("button", { type: "button", class: "hr-demo-role", onclick: () => { state.gm = !state.gm; render(); } }, state.gm ? "Ansicht: SL" : "Ansicht: Spieler");
  const content = win.querySelector(".window-content");
  content.replaceChildren(el("div", { class: "dsa5h-hr" }, [
    el("div", { class: "hr-demo-bar" }, [el("nav", { class: "dsa5h-hr-views", role: "group", "aria-label": t(H + "Views") }, [viewBtn("list", "List", "fas fa-list"), viewBtn("book", "Book", "fas fa-book-open")]), role]),
    el("div", { class: "dsa5h-hr-body" }, list ? listView() : bookView()),
    list ? null : pager(),
  ]));
}

export function openHouseRules() {
  win?.remove();
  win = el("section", { class: "ds-window dsa5-helpers-house-rules", role: "dialog", "aria-label": t(H + "Title") }, [
    el("header", { class: "ds-window-header" }, [el("h2", {}, [icon("fas fa-book"), " " + t(H + "Title")]), el("button", { type: "button", class: "ds-close", "aria-label": "Schließen", onclick: () => { win.remove(); win = null; } }, "✕")]),
    el("div", { class: "window-content" }),
  ]);
  win.setAttribute("data-theme", document.querySelector(".sheet")?.getAttribute("data-theme") || "light");
  document.body.append(win);
  render();
}

document.getElementById("houseRulesBtn")?.addEventListener("click", openHouseRules);
document.getElementById("themeToggle")?.addEventListener("click", () => setTimeout(() => win?.setAttribute("data-theme", document.querySelector(".sheet").getAttribute("data-theme"))));
if (new URLSearchParams(location.search).has("houserules")) openHouseRules();
window.dsa5hHouseRules = { openHouseRules, state, render };
