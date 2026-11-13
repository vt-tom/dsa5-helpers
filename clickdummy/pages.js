/* Ein Menü für den ganzen Click-Dummy (Nutzerentscheidung 2026-11-12, ersetzt Seitenmenü und Werkzeugleiste): ein Knopf
   unten links öffnet ein Panel mit
     - Bogen × Gerät: jeder Bogentyp (Held, NSC, Kreatur, Gruppe) für Desktop, Tablet und Smartphone,
     - Ansicht und Testdaten (Schalter des Desktop-Bogens),
     - Diese Seite (übrige Umschalter einer Einzelseite),
     - Fenster & Dialoge und die Foundry-Oberfläche mobil.
   Die Bedienelemente der Seiten bleiben, wo sie sind (ausgeblendet); das Menü zeigt Stellvertreter, die sie auslösen und
   ihren Zustand spiegeln. So brauchen die Seiten keine eigene Menülogik.

   Pflicht (AGENTS.md, Test in tests/sheet.test.cjs): Jede Dummy-Seite bindet diese Datei ein und steht hier.

   URL-Parameter setzen die Umschalter der Seite. Auf den Einzelseiten unter mobile/ und in passive-verteidigung.html
   steuert ?<gruppe>=<wert> den Knopf data-v=<wert> in fieldset[data-group=<gruppe>] (in der Reihenfolge der Parameter);
   umgekehrt schreibt ein Klick auf einen solchen Knopf den Parameter in die Adresse. index.html liest seine Parameter
   selbst (actor, foundry, mode, tab, planner, chargen …). */
(() => {
  // In eingebetteten Rahmen (iframe) kein zweites Menü.
  if (window.top !== window) return;

  const DEVICES = ["Desktop", "Tablet", "Smartphone"];
  // Bogen × Gerät; null = noch kein Dummy.
  const SHEETS = [
    ["Held", ["index.html", "mobile/heldenbogen.html?device=tablet", "mobile/heldenbogen.html?device=phone"]],
    ["NSC", ["index.html?actor=nsc", "mobile/nsc-kreatur.html?kind=nsc&device=tablet", "mobile/nsc-kreatur.html?kind=nsc&device=phone"]],
    ["Kreatur (Tier)", ["index.html?actor=kreatur", "mobile/nsc-kreatur.html?kind=kreatur&beispiel=tier&device=tablet", "mobile/nsc-kreatur.html?kind=kreatur&beispiel=tier&device=phone"]],
    ["Kreatur, humanoid (Ork)", ["index.html?actor=kreatur&beispiel=ork", "mobile/nsc-kreatur.html?kind=kreatur&beispiel=ork&device=tablet", "mobile/nsc-kreatur.html?kind=kreatur&beispiel=ork&device=phone"]],
    ["Gruppe (#55)", ["index.html?actor=gruppe", "mobile/gruppe.html?device=tablet", "mobile/gruppe.html?device=phone"]],
  ];
  // Diese Umschalter einer Seite stecken schon in der Matrix und werden nicht doppelt gezeigt.
  const COVERED = { "mobile/heldenbogen.html": ["device"], "mobile/nsc-kreatur.html": ["device", "kind", "beispiel"], "mobile/gruppe.html": ["device"] };
  // Schalter des Desktop-Bogens (index.html, Elemente der früheren Werkzeugleiste)
  const VIEW = [["Modus", "modeSwitch"], ["Thema", "themeToggle"], ["Foundry", "foundrySwitch"], ["Rolle", "asPlayerToggle"], ["Welt", "playersEditToggle"]];
  const TESTDATA = [["Ressourcen", "onlyLepToggle"], ["Rüstung", "armorOneToggle"], ["Händler/Schatz", "merchantModeToggle"]];
  const WINDOWS = [
    ["mobile/probe.html", "Probendialog (auch Desktop, #63)"],
    ["mobile/kampftracker.html", "Kampftracker"],
    ["mobile/wurfergebnis.html", "Wurfergebnis einblenden (#64)"],
    ["passive-verteidigung.html", "Passive Verteidigung im Chat"],
    ["index.html?dicestats", "Würfelstatistik"],
    ["index.html?houserules", "Hausregelbuch"],
    ["index.html?hud", "DSA-Leiste"],
  ];
  const WINDOW_BUTTONS = [["Zustimmung Würfelstatistik", "diceConsentBtn"]];
  const FOUNDRY = [["mobile/app.html", "Foundry-Oberfläche (Vollbild, für echte Geräte)"]];

  const base = new URL(".", document.currentScript.src);
  let proxying = false;
  const here = new URL(location.href);
  const pagePath = decodeURIComponent(here.pathname).slice(decodeURIComponent(base.pathname).length) || "index.html";

  const style = document.createElement("style");
  style.textContent = `
.dummy-pages { position: fixed; left: 10px; bottom: 10px; z-index: 10000; font: 14px/1.3 'GentiumBasic', Georgia, serif; letter-spacing: normal; text-transform: none; color: #f4e8d6; }
.dummy-pages > summary { position: relative; z-index: 1; list-style: none; cursor: pointer; padding: 10px 18px; border: 2px solid #c2a267; border-radius: 22px; background: #2b2520; color: #f4e8d6; font-size: 17px; font-weight: 700; box-shadow: 0 2px 10px rgba(0,0,0,.5); }
.dummy-pages > summary:focus-visible { outline: 2px solid #f4e8d6; outline-offset: 2px; }
@media (hover: hover) { .dummy-pages > summary:hover { background: #3a322b; } }
.dummy-pages > summary::-webkit-details-marker { display: none; }
.dummy-pages-panel { position: absolute; left: 0; bottom: calc(100% + 6px); width: 400px; max-width: calc(100vw - 20px); max-height: 85vh; overflow-y: auto; padding: 4px 0 8px; border: 1px solid #5a4d3e; border-radius: 8px; background: #2b2520; box-shadow: 0 6px 20px rgba(0,0,0,.5); }
.dp-docked .dummy-pages-panel { position: fixed; left: 0; top: 0; bottom: 0; width: 360px; max-width: none; max-height: none; padding-bottom: 70px; border-width: 0 1px 0 0; border-radius: 0; box-shadow: 2px 0 12px rgba(0,0,0,.4); }
html.dp-docked body { margin-left: 360px; }
.dummy-pages-panel h6 { margin: 10px 12px 4px; color: #d6bd8a; font-size: 12px; font-weight: 400; letter-spacing: .08em; text-transform: uppercase; }
.dummy-pages-panel a { color: #f4e8d6; text-decoration: none; }
.dummy-pages-panel .dp-link { display: block; padding: 5px 12px; }
.dummy-pages-panel .dp-link[aria-current="page"] { background: #c2a267; color: #1b1714; }
.dummy-pages-panel table { width: calc(100% - 24px); margin: 0 12px; border-collapse: collapse; }
.dummy-pages-panel th { padding: 3px 4px; color: #b9ad9b; font-size: 12px; font-weight: 400; text-align: center; }
.dummy-pages-panel th[scope="row"] { text-align: left; color: #f4e8d6; font-size: 14px; }
.dummy-pages-panel td { padding: 2px; text-align: center; }
.dummy-pages-panel td a, .dummy-pages-panel td span { display: block; padding: 4px 0; border: 1px solid #5a4d3e; border-radius: 4px; }
.dummy-pages-panel td span { border-style: dashed; color: #7d7263; font-size: 12px; }
.dummy-pages-panel td a[aria-current="page"] { background: #c2a267; border-color: #c2a267; color: #1b1714; }
.dummy-pages-panel .dp-row { display: flex; align-items: center; gap: 8px; padding: 3px 12px; }
.dummy-pages-panel .dp-row > span { flex: 0 0 86px; color: #b9ad9b; font-size: 13px; }
.dummy-pages-panel .dp-ctrl { display: flex; flex-wrap: wrap; gap: 4px; }
.dummy-pages-panel button { padding: 3px 10px; border: 1px solid #5a4d3e; border-radius: 4px; background: #3a322b; color: #f4e8d6; font: inherit; font-size: 13px; cursor: pointer; }
.dummy-pages-panel button[aria-pressed="true"] { background: #c2a267; border-color: #c2a267; color: #1b1714; }
.dummy-pages-panel :is(a, button):focus-visible { outline: 2px solid #c2a267; outline-offset: -2px; }
@media (hover: hover) {
  .dummy-pages-panel .dp-link:hover, .dummy-pages-panel td a:hover, .dummy-pages-panel button:hover { background: #4a4037; }
  .dummy-pages-panel :is(.dp-link, td a)[aria-current="page"]:hover, .dummy-pages-panel button[aria-pressed="true"]:hover { background: #c2a267; }
}`;
  document.head.append(style);

  const el = (tag, attrs = {}, kids = []) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    n.append(...[kids].flat());
    return n;
  };
  const href = (path) => {
    const url = new URL(path, base);
    // Foundry v13 bleibt beim Wechsel zwischen den Desktop-Bögen erhalten.
    if (/\/clickdummy\/(index\.html)?$/.test(url.pathname) && here.searchParams.get("foundry") === "13") url.searchParams.set("foundry", "13");
    return url.href;
  };
  const section = (title, nodes) => (nodes.length ? [el("h6", {}, title), ...nodes] : []);

  // Aktuelle Zelle der Matrix: Seite + Bogenart (actor bzw. kind) + Gerät (gedrückter Knopf der Seite).
  const pressed = (group) => document.querySelector(`fieldset[data-group="${group}"] button[aria-pressed="true"]`)?.dataset.v;
  function currentCell() {
    if (pagePath === "index.html") {
      const actor = here.searchParams.get("actor");
      return [actor === "nsc" ? 1 : actor === "kreatur" ? (here.searchParams.get("beispiel") === "ork" ? 3 : 2) : actor === "gruppe" ? 4 : 0, 0];
    }
    const col = pressed("device") === "tablet" ? 1 : 2;
    if (pagePath === "mobile/heldenbogen.html") return [0, col];
    if (pagePath === "mobile/gruppe.html") return [4, col];
    if (pagePath === "mobile/nsc-kreatur.html") return [pressed("kind") === "kreatur" ? (pressed("beispiel") === "ork" ? 3 : 2) : 1, col];
    return null;
  }

  function matrix() {
    const head = el("tr", {}, [el("th"), ...DEVICES.map((d) => el("th", { scope: "col" }, d))]);
    const rows = SHEETS.map(([label, links], r) => el("tr", {}, [
      el("th", { scope: "row" }, label),
      ...links.map((path, c) => el("td", {}, path ? el("a", { href: href(path), "data-cell": `${r},${c}`, "aria-label": `${label} · ${DEVICES[c]}` }, "●") : el("span", { title: "Click-Dummy folgt" }, "folgt"))),
    ]));
    return el("table", { "aria-label": "Bogen und Gerät" }, [el("thead", {}, head), el("tbody", {}, rows)]);
  }

  // Stellvertreter für einen Knopf der Seite: löst ihn aus, übernimmt Text und Zustand (aria-pressed bzw. .active).
  function proxy(orig, text) {
    const b = el("button", { type: "button" });
    const sync = () => {
      b.textContent = text ?? orig.textContent.trim();
      const on = orig.getAttribute("aria-pressed") === "true" || orig.classList.contains("active");
      if (orig.hasAttribute("aria-pressed") || orig.closest(".mode-switch, fieldset")) b.setAttribute("aria-pressed", String(on));
    };
    sync();
    new MutationObserver(sync).observe(orig, { attributes: true, childList: true, characterData: true, subtree: true });
    // Der ausgelöste Klick liegt außerhalb des Menüs; proxying hält es dabei offen.
    b.addEventListener("click", () => { proxying = true; try { orig.click(); } finally { proxying = false; } });
    return b;
  }
  // Ein Element der Seite (Knopf oder Knopfgruppe) als Zeile mit Beschriftung.
  function controlRow(label, node) {
    const buttons = node.matches("button") ? [node] : [...node.querySelectorAll("button")];
    return el("div", { class: "dp-row" }, [el("span", {}, label), el("div", { class: "dp-ctrl" }, buttons.map((b) => proxy(b)))]);
  }
  const byIds = (list) => list.map(([label, id]) => [label, document.getElementById(id)]).filter(([, n]) => n && !n.hidden).map(([label, n]) => controlRow(label, n));

  // Übrige Umschalter einer Einzelseite (fieldset[data-group]); die Originale werden ausgeblendet.
  function pageSwitches() {
    const covered = COVERED[pagePath] ?? [];
    const rows = [];
    for (const fs of document.querySelectorAll("fieldset[data-group]")) {
      fs.hidden = true;
      fs.style.display = "none";
      if (covered.includes(fs.dataset.group)) continue;
      rows.push(controlRow(fs.querySelector("legend")?.textContent.trim() ?? fs.dataset.group, fs));
    }
    document.querySelectorAll(".switch").forEach((box) => {
      if (![...box.children].some((c) => c.style.display !== "none")) box.style.display = "none";
    });
    return rows;
  }

  function links(list) {
    return list.map(([path, label]) => el("a", { class: "dp-link", href: href(path), "data-key": norm(new URL(path, base)) }, label));
  }
  const norm = (url) => url.pathname.replace(/index\.html$/, "") + "?" + [...url.searchParams].map(([k, v]) => `${k}=${v}`).sort().join("&");

  function markCurrent(panel) {
    panel.querySelectorAll("[aria-current]").forEach((a) => a.removeAttribute("aria-current"));
    const cell = currentCell();
    if (cell) panel.querySelector(`[data-cell="${cell.join(",")}"]`)?.setAttribute("aria-current", "page");
    const key = norm(here);
    panel.querySelector(`.dp-link[data-key="${CSS.escape(key)}"]`)?.setAttribute("aria-current", "page");
  }

  function build() {
    // Werkzeugleiste des Desktop-Bogens: ihre Schalter erscheinen im Menü.
    const toolbar = document.querySelector(".toolbar");
    const view = byIds(VIEW), testdata = byIds(TESTDATA), winButtons = byIds(WINDOW_BUTTONS);
    if (toolbar) toolbar.style.display = "none";
    const page = pageSwitches();

    const menu = el("details", { class: "dummy-pages" });
    const panel = el("nav", { class: "dummy-pages-panel", "aria-label": "Click-Dummy" }, [
      ...section("Bogen × Gerät", [matrix()]),
      ...section("Ansicht", view),
      ...section("Testdaten", testdata),
      ...section("Diese Seite", page),
      ...section("Fenster & Dialoge", [...links(WINDOWS), ...winButtons]),
      ...section("Foundry mobil", links(FOUNDRY)),
    ]);
    const summary = el("summary", {}, "☰ Click-Dummy");
    menu.append(summary, panel);
    // Breite Bildschirme (Rückmeldung 2026-11-12): Menü als feste Leiste links, bleibt offen; Einklappen merkt sich der
    // Browser. Schmale Bildschirme: Panel über dem Knopf, schließt bei Klick daneben oder Escape.
    const wide = matchMedia("(min-width: 1280px)");
    const KEY = "dsa5h-dummy-menu";
    const remembered = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
    const docked = () => wide.matches && menu.open;
    const update = () => {
      document.documentElement.classList.toggle("dp-docked", docked());
      summary.textContent = wide.matches && menu.open ? "« Menü einklappen" : "☰ Click-Dummy";
      if (menu.open) markCurrent(panel);
    };
    menu.open = wide.matches && remembered() !== "closed";
    menu.addEventListener("toggle", () => {
      if (wide.matches) { try { localStorage.setItem(KEY, menu.open ? "open" : "closed"); } catch {} }
      update();
    });
    wide.addEventListener("change", () => { menu.open = wide.matches && remembered() !== "closed"; update(); });
    document.addEventListener("click", (e) => { if (!wide.matches && !proxying && !menu.contains(e.target)) menu.open = false; });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !wide.matches) menu.open = false; });
    queueMicrotask(update);
    return menu;
  }

  // Umschalter der Einzelseiten: Parameter aus der Adresse anwenden, Klicks in die Adresse schreiben.
  const switchButton = (group, value) => document.querySelector(`fieldset[data-group="${CSS.escape(group)}"] button[data-v="${CSS.escape(value)}"]`);
  function applyParams() {
    for (const [group, value] of new URLSearchParams(location.search)) {
      const b = switchButton(group, value);
      if (b && b.getAttribute("aria-pressed") !== "true") b.click();
    }
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest?.("fieldset[data-group] button[data-v]");
    if (!b) return;
    const url = new URL(location.href);
    url.searchParams.set(b.closest("fieldset").dataset.group, b.dataset.v);
    history.replaceState(null, "", url);
  });

  // Sprungmarke (#…): Seiten, die ihren Inhalt erst nach dem Laden aufbauen — bis zu 4 s warten und einmal hinscrollen.
  function scrollToHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    let tries = 0;
    const timer = setInterval(() => {
      const target = document.getElementById(id);
      if (!target && ++tries < 40) return;
      clearInterval(timer);
      target?.scrollIntoView();
    }, 100);
  }

  const place = () => {
    applyParams();
    document.body.append(build());
    scrollToHash();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", place);
  else place();
})();
