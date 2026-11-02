/* Seitenmenü aller Click-Dummy-Seiten (Nutzerwunsch 2026-10-30): eine Liste der Hauptseiten, auf jeder Seite derselbe
   schwebende Knopf unten links (Rückmeldung 2026-10-31: nur Hauptseiten, überall an derselben Stelle; Varianten und
   Ansichten wählt man auf der Seite selbst). Pfade relativ zu clickdummy/, aufgelöst über den Ort dieser Datei.

   Pflicht (AGENTS.md, Test in tests/sheet.test.cjs): Jede Dummy-Seite bindet diese Datei ein und steht hier.

   URL-Parameter setzen die Umschalter der Seite. Auf den Einzelseiten unter mobile/ und in
   passive-verteidigung.html steuert ?<gruppe>=<wert> den Knopf data-v=<wert> in fieldset[data-group=<gruppe>]
   (in der Reihenfolge der Parameter); umgekehrt schreibt ein Klick auf einen solchen Knopf den Parameter in die
   Adresse. index.html liest seine Parameter selbst (actor, foundry, mode, tab, planner, chargen …). */
(() => {
  // In eingebetteten Rahmen (iframe) kein zweites Menü.
  if (window.top !== window) return;

  // Je Datei genau ein Eintrag (Rückmeldung 2026-11-02): Bogenart (Held/NSC/Kreatur) und Foundry v13 schaltet
  // index.html oben in der Werkzeugleiste um.
  const PAGES = [
    { group: "Desktop", items: [
      ["index.html", "Heldenbogen (auch NSC, Kreatur, Foundry v13)"],
      ["passive-verteidigung.html", "Passive Verteidigung im Chat"],
    ] },
    { group: "Mobil", items: [
      ["mobile/index.html", "Design-Runden (Übersicht in Geräterahmen)"],
      ["mobile/app.html", "Foundry-Oberfläche (Vollbild, für Geräte)"],
      ["mobile/heldenbogen.html", "Heldenbogen"],
      ["mobile/nsc-kreatur.html", "NSC- und Kreaturbogen (#53/#54)"],
      ["mobile/probe.html", "Probendialog (auch Desktop, #63)"],
      ["mobile/kraftspeicher.html", "Kraftspeicher"],
      ["mobile/ressourcen.html", "LeP/AsP/KaP eingeben"],
      ["mobile/kampftracker.html", "Kampftracker"],
      ["mobile/ausruestung.html", "Ausrüstung: Anzahl und Menü (#65)"],
      ["mobile/wurfergebnis.html", "Wurfergebnis einblenden (#64)"],
    ] },
  ];

  const base = new URL(".", document.currentScript.src);
  // Vergleich ohne Reihenfolge der Parameter und ohne „index.html“ am Ende.
  const norm = (url) => {
    const params = [...url.searchParams].map(([k, v]) => `${k}=${v}`).sort().join("&");
    return url.pathname.replace(/index\.html$/, "") + "?" + params + url.hash;
  };

  const style = document.createElement("style");
  style.textContent = `
.dummy-pages { position: relative; font: 14px/1.3 'GentiumBasic', Georgia, serif; letter-spacing: normal; text-transform: none; }
.dummy-pages > summary { list-style: none; cursor: pointer; }
.dummy-pages > summary::-webkit-details-marker { display: none; }
.dummy-pages { position: fixed; left: 10px; bottom: 10px; z-index: 10000; }
.dummy-pages > summary { padding: 6px 12px; border: 1px solid #5a4d3e; border-radius: 16px; background: #2b2520; color: #f4e8d6; box-shadow: 0 2px 8px rgba(0,0,0,.4); }
.dummy-pages-list { position: absolute; left: 0; bottom: calc(100% + 6px); z-index: 10000; min-width: 320px; max-height: 80vh; overflow-y: auto; padding: 6px 0; border: 1px solid #5a4d3e; border-radius: 8px; background: #2b2520; box-shadow: 0 6px 20px rgba(0,0,0,.5); }
.dummy-pages-list h6 { margin: 6px 12px 2px; color: #d6bd8a; font-size: 12px; font-weight: 400; letter-spacing: .08em; text-transform: uppercase; }
.dummy-pages-list a { display: block; padding: 5px 12px; color: #f4e8d6; text-decoration: none; }
.dummy-pages-list a[aria-current="page"] { background: #c2a267; color: #1b1714; }
.dummy-pages-list a:focus-visible { outline: 2px solid #c2a267; outline-offset: -2px; }
@media (hover: hover) {
  .dummy-pages-list a:hover { background: #3a322b; }
  .dummy-pages-list a[aria-current="page"]:hover { background: #c2a267; }
}`;
  document.head.append(style);

  function link(path, label) {
    const url = new URL(path, base);
    const a = document.createElement("a");
    a.href = url.href;
    a.textContent = label;
    a.dataset.key = norm(url);
    return a;
  }

  // Markiert den Eintrag der aktuellen Adresse: genau passend, sonst die Seite derselben Datei, deren Parameter am
  // besten passen (alle in der Adresse enthalten, die meisten zuerst), z. B. ?actor=nsc&tab=skills → NSC.
  function markCurrent(list) {
    const current = new URL(location.href);
    const here = norm(current);
    const links = [...list.querySelectorAll("a")];
    links.forEach((a) => a.removeAttribute("aria-current"));
    let hit = links.find((a) => a.dataset.key === here);
    if (!hit) {
      const path = here.split("?")[0];
      const has = (url) => [...url.searchParams].every(([k, v]) => current.searchParams.get(k) === v);
      hit = links
        .map((a) => ({ a, url: new URL(a.href) }))
        .filter(({ url }) => norm(url).split("?")[0] === path && has(url))
        .sort((x, y) => [...y.url.searchParams].length - [...x.url.searchParams].length)[0]?.a;
    }
    hit?.setAttribute("aria-current", "page");
  }

  function build() {
    const menu = document.createElement("details");
    menu.className = "dummy-pages";
    const summary = document.createElement("summary");
    summary.textContent = "☰ Click-Dummy";
    const list = document.createElement("nav");
    list.className = "dummy-pages-list";
    list.setAttribute("aria-label", "Click-Dummy-Seiten");
    for (const { group, items } of PAGES) {
      const h = document.createElement("h6");
      h.textContent = group;
      list.append(h);
      for (const [path, label] of items) list.append(link(path, label));
    }
    menu.append(summary, list);
    menu.addEventListener("toggle", () => { if (menu.open) markCurrent(list); });
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target)) menu.open = false;
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") menu.open = false;
    });
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

  const place = () => {
    document.body.append(build());
    applyParams();
    scrollToHash();
  };

  // Sprungmarke (#1a …): Seiten wie mobile/index.html bauen ihren Inhalt erst nach dem Laden auf, der Browser findet
  // das Ziel dann nicht selbst — bis zu 4 s warten und einmal hinscrollen.
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
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", place);
  else place();
})();
