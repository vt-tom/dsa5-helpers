// Click-Dummy Renderer — reine Darstellungslogik, kein Foundry-Datenmodell.

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "style") node.style.cssText = v;
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  // Reine Symbol-Knöpfe (☾, 📖, ×, ⓘ …) bekommen ihren title als zugänglichen Namen — sonst liest ein Screenreader
  // nur das Zeichen vor (UI/UX-Review 2026-09-25, Punkt 4). Knöpfe mit sichtbarem Text behalten ihren Text als Namen.
  if (tag === "button" && attrs.title && !attrs["aria-label"] && !/[\p{L}\p{N}]/u.test(node.textContent)) {
    node.setAttribute("aria-label", attrs.title);
  }
  return node;
}

// Kopfzeilen-Label als eigenes Grid-Item, sonst laufen die Texte im CSS-Grid zusammen.
function head(...labels) {
  return labels.map((l) => el("span", {}, l));
}

function dieBg(dieName, big) {
  return `background-image:url('${A.die(dieName)}')`;
}

// Bildet die 3W20-Probe wie im DSA5-System ab (skillselect.hbs): drei Attribut-Chips statt einer fertig gewürfelten Qualitätsstufe.
// Die Chips nutzen dieselben Würfelgrafiken/-farben wie das Attribut-Band (System: .diet-mu/.diet-kl/… via CSS-Hintergrundbild).
const DIE_BY_ATTR = { MU: "d20mu", KL: "d20kl", IN: "d20in", CH: "d20ch", FF: "d20ff", GE: "d20ge", KO: "d20ko", KK: "d20kk" };
// Mit `name` wird die Würfelgruppe zu EINER auslösbaren Aktion („Sinnesschärfe würfeln“) statt drei einzelner
// Kürzel (UI/UX-Review 2026-09-25, Punkt 4); ohne `name` bleibt sie reine Anzeige.
function probeDice(probe, name) {
  const attrs = probe.split("/");
  const node = el(
    "span",
    { class: "probe-dice" },
    attrs.map((a) => el("span", { class: "probe-die", style: dieBg(DIE_BY_ATTR[a]), "aria-hidden": "true" }, a))
  );
  return name ? makeRollable(node, `${name} würfeln (${probe})`) : node;
}

const ATTR_LABELS = { MU: "Mut", KL: "Klugheit", IN: "Intuition", CH: "Charisma", FF: "Fingerfertigkeit", GE: "Gewandtheit", KO: "Konstitution", KK: "Körperkraft" };

// Macht ein beliebiges Element zu einer per Klick, Enter und Leertaste auslösbaren Würfelaktion mit sprechendem
// aria-label (UI/UX-Review 2026-09-25, Punkt 4). Der Click-Dummy hat keine Würfelmechanik — flashNotice() steht
// stellvertretend für die echte Probe; im Modul hängt dieselbe Rolle an den geerbten System-data-actions.
function makeRollable(node, label) {
  node.classList.add("rollable");
  node.setAttribute("role", "button");
  node.setAttribute("tabindex", "0");
  node.setAttribute("aria-label", label);
  node.title = label;
  const fire = (e) => {
    e.stopPropagation();
    flashNotice(`🎲 ${label}`);
  };
  node.addEventListener("click", fire);
  node.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    fire(e);
  });
  return node;
}

// AT/PA/FK-Würfel im Kampf-Reiter (.die-qs.lg) als auslösbare Aktion.
function combatDie(value, die, label) {
  return makeRollable(el("span", { class: "die-qs lg", style: dieBg(die) }, String(value)), label);
}

// Schadenswurf als erkennbarer Würfelknopf (rote Kante + rotes W6-Quadrat, Zoom bei Hover wie die übrigen Proben)
// statt reinem Text — Nutzer-Feedback 2026-09-28. Modul: .dsa5h-damage (weapon.hbs, favorite-values.hbs).
function damageBtn(tp, name) {
  const label = `Schaden von ${name} würfeln (${tp})`;
  const btn = el("button", { type: "button", class: "damage-roll", title: label, "aria-label": label }, tp);
  btn.addEventListener("click", (e) => { e.stopPropagation(); flashNotice(`🎲 ${label}`); });
  return btn;
}

// OnUse-Würfelknopf (Issue #9, 2026-09-30): grüner W6 (Farbe von systems/dsa5/icons/dice/d6green.svg) bei Items
// mit Anwendungseffekt (ON_USE_ITEMS in data.js). Modul: parts/onuse.hbs → Systemaktion onUseItem. Liefert null,
// wenn das Item keinen Effekt hat, damit es direkt in el()-Kinderlisten passt.
function onUseBtn(name) {
  if (!ON_USE_ITEMS.has(name)) return null;
  const label = `Anwendungseffekt: ${name}`;
  const btn = el("button", { type: "button", class: "onuse-btn", title: label, "aria-label": label });
  btn.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect x="1" y="1" width="14" height="14" rx="3"/><circle cx="4.6" cy="4.6" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="11.4" cy="11.4" r="1.5"/></svg>';
  btn.addEventListener("click", (e) => { e.stopPropagation(); flashNotice(`🎲 ${label}`); });
  return btn;
}

// AP-Kosten-Engine — auf Nutzerwunsch 1:1 aus dem echten DSA5-System portiert, nichts Neu-Erfundenes:
// Tabelle DSA5.advancementCosts (systems/dsa5/modules/config/config-dsa5.js) + DSA5_Utility._calculateAdvCost()
// (systems/dsa5/modules/system/helpers/utility-dsa5.js). Index = aktueller Wert VOR der Änderung + modifier
// (modifier=1, Default: "was kostet der nächste Punkt", modifier=0: "was wird für den zuletzt gekauften Punkt
// zurückerstattet"). Steigerungsfaktor E gilt im System nur für Eigenschaften, A–D für Talente/Kampftalente/
// Zauber/Liturgien (deren StF steht direkt am jeweiligen Datenobjekt, siehe data.js-Kommentare bei SKILL_GROUPS).
// Wie im Original nicht über Index 25 hinaus definiert — an dieser Grenze wird das Steigern schlicht verweigert.
const ADVANCEMENT_COSTS = {
  A: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  B: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28],
  C: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42],
  D: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56],
  E: [15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180],
};
function calcAdvCost(currentValue, stf, modifier = 1) {
  return ADVANCEMENT_COSTS[stf][currentValue + modifier];
}

// "AP verfügbar wird immer berechnet" (BEARBEITEN.md) — nie ein eigenes gespeichertes Feld, immer total-spent,
// analog zu Actordsa5.checkEnoughXP() im echten System.
function experienceAvailable() {
  return EXPERIENCE.total - EXPERIENCE.spent;
}

// Zieht `cost` AP ab (erhöht EXPERIENCE.spent) bzw. erstattet sie zurück (cost negativ) — Gegenstück zu
// Actordsa5._updateAPs(). Verweigert eine Verteuerung, wenn nicht genug AP verfügbar sind (checkEnoughXP() im
// System), und ändert dann nichts.
function spendAP(cost) {
  if (cost > 0 && experienceAvailable() < cost) {
    flashNotice("Nicht genug AP verfügbar");
    return false;
  }
  EXPERIENCE.spent += cost;
  return true;
}

// Kurze, sich selbst ausblendende Meldung (z.B. "Nicht genug AP verfügbar", "Maximalwert erreicht") — der
// Click-Dummy hat kein eigenes Benachrichtigungssystem wie Foundrys ui.notifications, daher dieser Mini-Ersatz.
let noticeTimer = null;
function flashNotice(msg) {
  let notice = document.getElementById("dsaNotice");
  if (!notice) {
    notice = el("div", { id: "dsaNotice", class: "dsa-notice" });
    document.querySelector(".sheet").appendChild(notice);
  }
  notice.textContent = msg;
  notice.classList.add("show");
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => notice.classList.remove("show"), 1800);
}

// Ein AP-gekoppeltes +/- Stepper-Paar (Eigenschaften, Ressourcen-Zukauf, Talente, Kampftalente, Zauber/
// Liturgien — überall dort, wo BEARBEITEN.md "+ und - zum Steigern mit AP-Kosten einblenden" fordert).
// getValue/setValue lesen/schreiben den aktuellen Wert, stf den Steigerungsfaktor (A-E), min die Untergrenze
// (0 normalerweise, z.B. 6 bei Kampftalenten wegen deren advanceMin im System), onChange rendert nach einer
// erfolgreichen Änderung neu. Gibt [minus, plus] zum Einbetten in die jeweilige Zeile zurück.
// `label` (optional) benennt das Ziel im aria-label („Klettern steigern (2 AP)“).
function advanceStepper(getValue, setValue, stf, min, onChange, label) {
  const current = getValue();
  const advanceCost = calcAdvCost(current, stf);
  const prefix = label ? `${label} ` : "";
  const minusTitle = current > min ? `${prefix}senken (${calcAdvCost(current, stf, 0)} AP zurück)` : `${prefix}Minimalwert erreicht`;
  const plusTitle = advanceCost !== undefined ? `${prefix}steigern (${advanceCost} AP)` : `${prefix}Maximalwert erreicht`;
  const minus = stepButton("minus edit-only", "−", minusTitle, current <= min, `adv-minus:${label}`);
  const plus = stepButton("plus edit-only", "+", plusTitle, advanceCost === undefined, `adv-plus:${label}`);
  plus.addEventListener("click", (e) => {
    e.stopPropagation();
    const v = getValue();
    const cost = calcAdvCost(v, stf);
    if (cost === undefined) return flashNotice("Maximalwert erreicht");
    if (!spendAP(cost)) return;
    setValue(v + 1);
    onChange();
  });
  minus.addEventListener("click", (e) => {
    e.stopPropagation();
    const v = getValue();
    if (v <= min) return;
    spendAP(-calcAdvCost(v, stf, 0));
    setValue(v - 1);
    onChange();
  });
  return [minus, plus];
}

// Generisches Modal-Fenster (bisher nur für die Taschen-Kacheln auf dem Ausrüstung-Tab, siehe openBagModal()).
// #modalRoot liegt in index.html direkt unter #content. UI-UX-REVIEW.md Priorität 1 Punkt 4: Rolle/aria-modal,
// initialer Fokus auf den Dialog selbst, eine einfache Tab-Fokusfalle (trapModalTab()) und Fokus-Rücksprung zum
// auslösenden Element in closeModal() — vorher gab es keins von beidem. `opts.label` liefert den aria-label
// (üblicherweise derselbe Text wie der sichtbare panel-title im Dialog).
let modalTriggerEl = null;

function trapModalTab(e) {
  if (e.key !== "Tab") return;
  const focusable = Array.from(e.currentTarget.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

function openModal(contentEl, opts = {}) {
  const root = document.getElementById("modalRoot");
  root.innerHTML = "";
  modalTriggerEl = document.activeElement;
  const backdrop = el("div", { class: "modal-backdrop" });
  backdrop.addEventListener("click", closeModal);
  contentEl.classList.add("modal-box");
  contentEl.setAttribute("role", "dialog");
  contentEl.setAttribute("aria-modal", "true");
  if (opts.label) contentEl.setAttribute("aria-label", opts.label);
  contentEl.tabIndex = -1;
  contentEl.addEventListener("click", (e) => e.stopPropagation());
  contentEl.addEventListener("keydown", trapModalTab);
  root.appendChild(backdrop);
  root.appendChild(contentEl);
  contentEl.focus();
}
function closeModal() {
  document.getElementById("modalRoot").innerHTML = "";
  if (modalTriggerEl) {
    modalTriggerEl.focus();
    modalTriggerEl = null;
  }
}

let currentTab = "cover";

// Favoriten-Markierung (Titelblatt-Feature, siehe TITELBLATT.md): jedes Talent/jede Waffe/jeder Zauber/jede
// Liturgie kann per Stern markiert werden (item.fav auf dem jeweiligen Datenobjekt aus data.js), der Klick
// wirkt direkt auf das Objekt selbst — dieselbe Referenz taucht auf dem Titelblatt (renderCover) wieder auf,
// ein erneutes renderContent() dort reicht also, es gibt keinen separaten Favoriten-Datenspeicher.
function favStar(item) {
  const label = item.fav ? `${item.name}: Favorit entfernen` : `${item.name} als Favorit markieren`;
  const btn = el(
    "button",
    { type: "button", class: "fav-star" + (item.fav ? " active" : ""), title: label, "aria-label": label, "aria-pressed": String(!!item.fav), "data-fkey": `fav:${item.name}` },
    item.fav ? "★" : "☆"
  );
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    item.fav = !item.fav;
    renderContent();
  });
  return btn;
}

// Generischer Inline-Editor (Text oder Zahl): macht `container` per Klick/Enter bearbeitbar, ersetzt seinen
// Inhalt durch ein <input>. Enter/Blur übernimmt den Wert über onCommit(neuerWert) — der Aufrufer ist für das
// Neu-Rendern zuständig (üblicherweise per renderHeader()/renderContent(), analog zu favStar()). Escape bricht
// ab. Bleibt der Wert unverändert, wird onCommit NICHT aufgerufen (spart ein unnötiges Re-Render) — stattdessen
// stellt sich das Feld selbst auf reine Anzeige zurück. Wiederverwendet überall, wo BEARBEITEN.md einen Wert als
// editierbar fordert (Kopfzeile LeP/AsP/KaP/Name, später Mod/Zukauf, Talent-FW, AP-Felder, …).
// type "textarea" (mehrzeiliger Freitext, z.B. Notizen-Tab): Enter fügt einen Zeilenumbruch ein statt zu
// übernehmen (Escape bricht weiterhin ab, Blur übernimmt weiterhin) — sonst wie type "text"/"number". Die
// Erstanzeige (container-Inhalt vor dem ersten Klick) bleibt wie gehabt Sache des Aufrufers, NICHT von
// makeEditable() selbst — nur restore() nach einem abgebrochenen/leeren Edit muss sie kennen, daher optional
// über opts.render (z.B. Notizen-Tab: mehrere <p> statt reinem Text) überschreibbar.
function makeEditable(container, value, onCommit, opts = {}) {
  const { type = "text", min, max, render } = opts;
  const show = render || ((c, v) => { c.textContent = String(v); });
  container.classList.add("editable-value");
  container.tabIndex = 0;
  container.title = type === "textarea" ? "Klicken zum Bearbeiten (Leerzeile = neuer Absatz)" : "Klicken zum Bearbeiten";
  const activate = () => {
    if (container.querySelector("input, textarea")) return;
    const input =
      type === "textarea"
        ? el("textarea", { class: "inline-edit-input inline-edit-textarea", rows: "6" }, String(value))
        : el("input", { type, value: String(value), class: "inline-edit-input" });
    container.textContent = "";
    container.appendChild(input);
    input.focus();
    if (type !== "textarea") input.select();
    const restore = () => { container.textContent = ""; show(container, value); };
    const commit = () => {
      if (type === "number") {
        let n = parseInt(input.value, 10);
        if (isNaN(n)) return restore();
        if (min !== undefined) n = Math.max(min, n);
        if (max !== undefined) n = Math.min(max, n);
        if (n === value) return restore();
        if (container.dataset.fkey) pendingFlash = container.dataset.fkey;
        onCommit(n);
      } else {
        const v = input.value.trim();
        if (!v || v === value) return restore();
        onCommit(v);
      }
    };
    input.addEventListener("blur", commit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && type !== "textarea") input.blur();
      else if (e.key === "Escape") { input.value = String(value); input.blur(); }
    });
  };
  container.addEventListener("click", activate);
  container.addEventListener("keydown", (e) => { if (e.key === "Enter" && type !== "textarea") activate(); });
}

// UI-UX-REVIEW.md Priorität 1 Punkt 3: die Beschriftung steckte bisher ausschließlich im title-Attribut (nur per
// Hover erreichbar). Jetzt zusätzlich aria-label (jeder Button, für Screenreader/Touch) sowie aria-current="page"
// und ein sichtbares Text-Label (nur für den aktiven Tab — ".rail-label" in style.css, ausgeblendet unter 860px,
// wo die Rail ohnehin zu einer Icon-Reihe umklappt), damit die aktuelle Position auch ohne Hovern erkennbar ist.
function renderRail() {
  const rail = document.getElementById("rail");
  rail.innerHTML = "";
  TABS.filter((t) => !(companionTabHidden && t.id === "companions")).forEach((t) => {
    const active = t.id === currentTab;
    // Jeder Reiter trägt sein Label; CSS zeigt es beim aktiven Reiter dauerhaft, bei den übrigen zuverlässig bei
    // Hover UND Tastaturfokus (UI/UX-Review 2026-09-25 Punkt 7, Variante b) — kein title mehr, sonst doppelter Tooltip.
    const children = [el("img", { src: t.icon, alt: "" }), el("span", { class: "rail-label", "aria-hidden": "true" }, t.label)];
    const btn = el(
      "button",
      { type: "button", "aria-label": t.label, "aria-current": active ? "page" : "false", class: active ? "active" : "" },
      children
    );
    btn.addEventListener("click", () => setTab(t.id));
    rail.appendChild(btn);
  });
}

function setTab(id) {
  currentTab = id;
  const tab = TABS.find((t) => t.id === id);
  document.getElementById("tabTitle").textContent = tab.title;
  document.getElementById("tabHint").textContent = tab.hint;
  // Steuert die auf dem Titelblatt prominentere Kopfzeile (größeres Porträt etc., siehe [data-tab="cover"] in
  // style.css) — Nutzer-Feedback 2026-09-14: die Kopfzeile soll sich NUR auf diesem einen Blatt verändern.
  document.querySelector(".sheet").setAttribute("data-tab", id);
  // Talente starten oben — also ist die erste Gruppe markiert.
  if (id === "skills") currentSkillGroup = 0;
  renderRail();
  renderContent();
  renderSubNav();
  renderAttrOverlay();
  document.getElementById("content").scrollTop = 0;
}

// Eigenschaften werden nur noch auf dem Attribute-Tab angezeigt (nicht mehr als globales Band auf allen Tabs).
// Kacheln bleiben immer in einer Reihe (kompakt, nur Würfel+Wert) — die Aufschlüsselung Start/Fortschr./Mod
// kommt als eigene, volle Breite nutzende Tabelle darunter und ist nur im Bearbeiten-Modus sichtbar (.edit-only).
function buildAttrTiles() {
  return el(
    "div",
    { class: "attr-tiles" },
    // Wert = initial + adv + mod (siehe ATTRS-Kommentar in data.js), live berechnet statt eines eigenen
    // gespeicherten Felds — sonst würde die Kachel nach dem Steigern/Editieren in buildAttrDetailPanel() veralten.
    ATTRS.map((a) =>
      el("div", { class: "attr-tile" }, [
        makeRollable(el("span", { class: "attr-die", style: dieBg(a.die) }, String(a.initial + a.adv + a.mod)), `Probe auf ${ATTR_LABELS[a.k]} würfeln`),
        el("span", { class: "attr-key" }, a.k),
      ])
    )
  );
}

function buildAttrDetailPanel() {
  // Eigenschaften als Spaltenköpfe (mit +/- Steppern neben der Abkürzung), Start/Fortschritte/Mod als Zeilen darunter —
  // hält die Tabelle flach statt 8 Zeilen hoch. Alle Werte editierbar (gerahmte Felder), analog zur Erfahrung.
  // Die Stepper steigern/senken "Fortschritte" (adv) mit echten AP-Kosten (Steigerungsfaktor E, siehe
  // advanceStepper()); die drei Zeilen selbst sind zusätzlich direkt editierbar (Freitext-Korrektur ohne
  // AP-Abzug) — beides gleichzeitig möglich, wie im Bearbeiten-Modus üblich (val-editable-Muster).
  const headerRow = el(
    "div",
    { class: "row attr-matrix-row attr-matrix-header" },
    [
      el("span", {}, ""),
      ...ATTRS.map((a) => {
        const [minus, plus] = advanceStepper(
          () => a.initial + a.adv,
          (v) => { a.adv = v - a.initial; },
          "E",
          a.initial,
          () => { renderContent(); renderHeader(); },
          ATTR_LABELS[a.k]
        );
        return el("span", { class: "attr-matrix-head" }, [minus, el("span", {}, a.k), plus]);
      }),
    ]
  );
  const valueRow = (label, field, min = 0) =>
    el("div", { class: "row attr-matrix-row" }, [
      el("span", { class: "left muted" }, label),
      ...ATTRS.map((a) => {
        const span = el("span", { class: "center attr-matrix-val" }, String(a[field]));
        makeEditable(span, a[field], (v) => { a[field] = v; renderContent(); renderHeader(); }, { type: "number", min, max: 99 });
        return span;
      }),
    ]);

  return el("div", { class: "panel edit-only" }, [
    el("div", { class: "panel-title" }, "Start · Fortschritte · Modifikator"),
    headerRow,
    valueRow("Start", "initial"),
    valueRow("Fortschr.", "adv"),
    valueRow("Mod", "mod", -99),
  ]);
}

// Trefferzone (echtes DSA5.hitboxes aus systems/dsa5/modules/config/config-dsa5.js, Labels aus
// modules/dsa5-compendium/lang/de.json) bzw. Größenkategorie (system.details.size, Label "sizeCategory" in
// systems/dsa5/lang/de.json: "winzig, klein, mittel, groß, riesig") — beide echte Auswahllisten, nicht erfunden.
// Plain-String-Einträge dienen gleichzeitig als Wert UND Anzeige-Label (value===label).
const HITBOX_OPTIONS = [
  "Humanoid, mittel", "Humanoid, klein", "Humanoid, groß",
  "Nicht humanoid, klein", "Nicht humanoid, mittel", "Nicht humanoid, groß",
  "Nicht humanoid, sechs Gliedmaßen, groß", "Nicht humanoid, sechs Gliedmaßen, riesig",
  "Nicht humanoid, Fangarme, mittel bis riesig", "Nicht humanoid, keine Zonen",
];
const SIZE_CATEGORY_OPTIONS = ["winzig", "klein", "mittel", "groß", "riesig"];

// Initiativewürfel/Initiative-Mod. (system.status.initiative.die/.diemodifier, DSA5.initDies in config-dsa5.js)
// — hier braucht es echte {value,label}-Paare, da der leere Wert ("kein Zusatzwürfel") als "-" angezeigt wird.
const INIT_DIE_OPTIONS = [
  { value: "", label: "–" },
  { value: "1d6", label: "1W6" },
  { value: "2d6", label: "2W6" },
  { value: "3d6", label: "3W6" },
  { value: "4d6", label: "4W6" },
];

function selectOptionsFor(label) {
  if (label === "Trefferzone") return HITBOX_OPTIONS.map((o) => ({ value: o, label: o }));
  if (label === "Größenkategorie") return SIZE_CATEGORY_OPTIONS.map((o) => ({ value: o, label: o }));
  return INIT_DIE_OPTIONS; // Initiativewürfel / Initiative-Mod.
}

// selectWert-Zeile (Trefferzone/Größenkategorie/Initiativewürfel/Initiative-Mod.): im Bearbeiten-Modus ein
// echtes <select>, im Spielmodus reiner Text (Anzeige-Label statt Rohwert, z.B. "–" statt "").
function selectWertCell(d, extraStyle) {
  const mode = document.querySelector(".sheet").getAttribute("data-mode");
  const options = selectOptionsFor(d.label);
  if (mode !== "edit") {
    const label = (options.find((o) => o.value === d.wert) || { label: d.wert }).label;
    return el("span", { class: "center val-select", style: extraStyle }, String(label));
  }
  const select = document.createElement("select");
  select.className = "center val-select-input";
  if (extraStyle) select.style.cssText = extraStyle;
  options.forEach((o) => {
    const opt = document.createElement("option");
    opt.value = o.value;
    opt.textContent = o.label;
    if (o.value === d.wert) opt.selected = true;
    select.appendChild(opt);
  });
  select.addEventListener("click", (e) => e.stopPropagation());
  select.addEventListener("change", () => { d.wert = select.value; renderContent(); });
  return select;
}

// Ressourcen-Zeile: 4 Wertspalten (Wert/Mod/Zukauf/Max). hideInPlay-Zeilen (Regeneration/perm. Verlust)
// verschwinden im Spielmodus komplett, nicht nur ihre Stepper. Mod/Zukauf sind nur im Bearbeiten-Modus direkt
// editierbar (val-editable); die Stepper (nur bei Lebenskraft/Astralenergie/Karmaenergie) steigern/senken
// Zukauf zusätzlich mit echten AP-Kosten (Steigerungsfaktor D, wie system.status.lp/ae/ke.advances im echten
// System) und heben dabei den Max-Wert im Gleichschritt an (jeder gekaufte Punkt erhöht die Obergrenze um 1).
// Berechnungsformel als Tooltip am Namen jedes Grundwerts (Tester-Rückmeldung 2026-09-30). Texte wörtlich aus
// systems/dsa5/lang/de.json "FORMULA.*" — das Modul hängt nur data-tooltip="FORMULA.<key>" an, keine eigene Regellogik.
const FORMULAS = {
  "Lebenskraft": "Spezies-Grundwert + 2 × KO + Mod",
  "LeP-Regeneration": "Zusätzliche Lebensenergie-Regeneration (z. B. nach Rast).",
  "Astralenergie": "Grundwert (Vorteil Zauberer) + Leiteigenschaft + Mod",
  "AsP-Regeneration": "Zusätzliche Astralenergie-Regeneration (z. B. nach Rast).",
  "pAsP (perm. Verlust)": "Dauerhaft verbrauchte Astralenergie (z. B. Schaffung von Artefakten).",
  "Karmaenergie": "Grundwert (Vorteil Geweihter) + Leiteigenschaft + Mod",
  "KaP-Regeneration": "Zusätzliche Karmaenergie-Regeneration (z. B. nach Rast).",
  "pKaP (perm. Verlust)": "Dauerhaft verbrauchte Karmaenergie (z. B. Zeremonialgegenstände).",
  "Schicksalspunkte": "Punkte zum Beeinflussen von Proben und Kampf (z. B. Neuwurf oder Erster handeln).",
  "Seelenkraft": "Widerstand gegen geistige Einflüsse.\nSpezies-Grundwert + (MU + KL + IN) / 6 + Mod",
  "Zähigkeit": "Widerstand gegen körperliche Einflüsse wie Gift und Krankheit.\nSpezies-Grundwert + (KO + KO + KK) / 6 + Mod",
  "Kälteschutz": "Schutz gegen Kälte und Kälteschaden.",
  "Hitzeschutz": "Schutz gegen Hitze und Hitzeschaden.",
  "Geschwindigkeit": "Bewegungsweite in Schritt.\nSpezies-Grundwert + Mod",
  "Ausweichen": "GE / 2 + Mod",
  "Initiative": "Bestimmt die Handlungsreihenfolge im Kampf.\n(MU + GE) / 2 + Mod",
  "Initiativewürfel": "Würfel, der zur Initiative hinzuaddiert wird (üblicherweise 1W6).",
  "Initiative-Mod.": "Fester Bonus oder Malus auf den Initiativewurf.",
  "Größenkategorie": "Größe des Wesens für Reichweite, Trefferzonen und ähnliche Regeln.",
};
function formulaLabel(label) {
  return FORMULAS[label] ? el("span", { class: "formula-hint", title: FORMULAS[label] }, label) : label;
}

function buildResourceRow(d) {
  const mode = document.querySelector(".sheet").getAttribute("data-mode");

  const modSpan = el("span", { class: d.editMod ? "center val-editable" : "center" }, String(d.mod));
  if (d.editMod && mode === "edit") {
    makeEditable(modSpan, d.mod, (v) => { d.mod = v; renderContent(); renderHeader(); }, { type: "number", min: -99, max: 99 });
  }

  const zukaufSpan = el("span", { class: d.editZukauf ? "muted center val-editable" : "muted center" }, d.zukauf !== undefined ? String(d.zukauf) : "–");
  if (d.editZukauf && mode === "edit") {
    makeEditable(zukaufSpan, d.zukauf, (v) => { d.zukauf = Math.max(0, v); renderContent(); renderHeader(); }, { type: "number", min: 0, max: 99 });
  }

  const nameChildren = [formulaLabel(d.label)];
  if (d.stepper) {
    const [minus, plus] = advanceStepper(
      () => d.zukauf,
      (v) => {
        // Jeder gekaufte/zurückerstattete Zukauf-Punkt hebt/senkt den Max-Wert im Gleichschritt (im echten
        // System aus einer Formel berechnet, hier als direkte 1:1-Kopplung nachgebildet). Aktuellen Wert bei
        // einer Max-Senkung kappen, damit er nie über dem neuen Max liegt.
        d.max += v > d.zukauf ? 1 : -1;
        d.zukauf = v;
        if (d.wert > d.max) d.wert = d.max;
      },
      "D",
      0,
      () => { renderContent(); renderHeader(); },
      `${d.label} Zukauf`
    );
    nameChildren.push(minus, plus);
  }

  return el("div", { class: "row derived-row" + (d.hideInPlay ? " edit-only" : "") }, [
    el("span", { class: "derived-name left" }, nameChildren),
    el("span", { class: "muted center" }, String(d.wert)),
    modSpan,
    zukaufSpan,
    el("span", { class: "big center" }, String(d.max)),
  ]);
}

// Einfache Zeile: 3 Wertspalten (Wert/Mod/Max), für Resistenzen/Grundwerte/Kampfwerte.
function buildSimpleRow(d) {
  const mode = document.querySelector(".sheet").getAttribute("data-mode");
  if (d.sameModMax !== undefined) {
    return el("div", { class: "row simple-row" }, [
      el("span", { class: "left" }, formulaLabel(d.label)),
      el("span", { class: "muted center" }, "–"),
      el("span", { class: "center" }, String(d.sameModMax)),
      el("span", { class: "big center" }, String(d.sameModMax)),
    ]);
  }
  // Auswahlliste ohne Mod/Max (z.B. Trefferzone): Wertfeld über die volle Restbreite statt in die schmale Wert-Spalte gequetscht.
  if (d.selectWert && d.mod === undefined && d.max === undefined) {
    return el("div", { class: "row simple-row" + (d.hideInPlay ? " edit-only" : "") }, [
      el("span", { class: "left" }, formulaLabel(d.label)),
      selectWertCell(d, "grid-column:2 / -1"),
    ]);
  }
  const modSpan = el("span", { class: d.editMod ? "center val-editable" : "center" }, d.mod !== undefined ? String(d.mod) : "–");
  if (d.editMod && mode === "edit") {
    makeEditable(modSpan, d.mod, (v) => { d.mod = v; renderContent(); renderHeader(); }, { type: "number", min: -99, max: 99 });
  }
  return el("div", { class: "row simple-row" }, [
    el("span", { class: "left" }, formulaLabel(d.label)),
    d.selectWert ? selectWertCell(d) : el("span", { class: "muted center" }, String(d.wert)),
    modSpan,
    el("span", { class: "big center" }, d.max !== undefined ? String(d.max) : "–"),
  ]);
}

// Chip mit Lösch-"×" (nur im Bearbeiten-Modus sichtbar, via .edit-only) — für alle Freitext-Listen (Vor-/
// Nachteile, Sonderfertigkeiten, Sprachen/Schriften, …), die laut BEARBEITEN.md löschbar sein sollen. `list` ist
// die Original-Array-Referenz aus data.js, `item` der zu löschende Eintrag (Mutation direkt auf den Daten,
// analog zu favStar()).
function deletableChip(iconSrc, label, list, item) {
  const delLabel = `${typeof label === "string" ? label : "Eintrag"} löschen`;
  const delBtn = el("button", { type: "button", class: "chip-delete edit-only", title: delLabel, "aria-label": delLabel }, "×");
  delBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const idx = list.indexOf(item);
    if (idx !== -1) list.splice(idx, 1);
    renderContent();
  });
  return el("span", { class: "chip" }, [el("img", { src: iconSrc, alt: "" }), label, typeof label === "string" ? onUseBtn(label) : null, delBtn]);
}

// Info-Tooltip-Knopf (specblock.hbs:7, specialabilities.hbs:4,18,55: "data-tooltip-html={{specCategoryHelp cat}}")
// — jede Sonderfertigkeiten-/Vor-Nachteile-Kategorie hat im System einen ⓘ-Knopf mit Erklärtext. Ohne das
// kostenpflichtige dsa5-core-Modul (das echte Regelwiki-Texte je Kategorie mitbringt) liefert das Basissystem für
// JEDE Kategorie denselben generischen Fallback-Text (SpecCategoryHelp.getText() in speccategory-help.js, Text aus
// lang/de.json "SpecCategoryHelp._fallback") — deshalb hier bewusst ein einziger gemeinsamer Tooltip-Text statt
// erfundener, kategoriespezifischer Erklärungen.
const SPEC_HELP_TEXT = "Sonderfertigkeiten dieser Kategorie. Details im Regelwerk.";

function specHelpBtn() {
  return el("button", { type: "button", class: "spec-help-btn", title: SPEC_HELP_TEXT, "aria-label": "Hilfe zu dieser Kategorie" }, "ⓘ");
}

// Unterüberschrift mit angehängtem Info-Knopf (siehe specHelpBtn) — Ersatz für die einfache .subhead-Zeile überall
// dort, wo die Kategorie im System eine eigene groupbox mit Hilfe-Button ist (Vor-/Nachteile, Sonderfertigkeiten).
function subheadWithHelp(label) {
  return el("div", { class: "subhead flex" }, [el("span", {}, label), specHelpBtn()]);
}

// Gemeinsamer Baustein für alle Sonderfertigkeiten-Listen, die im System in mehrere Kategorien zerfallen
// (specblock.hbs: general/generalStyle/extGeneral/fatePoints auf Eigenschaften, combat/command auf Kampf,
// magical/magicalStyle auf Magie, clerical/clericalStyle auf Religion) — siehe SPECIALS/COMBAT_SPECIALS/
// MAGIC_SPECIALS/RELIGION_SPECIALS in data.js. Leere Kategorien werden weggelassen; Unterüberschriften erscheinen
// nur, wenn mehr als eine Kategorie tatsächlich Einträge hat (sonst wie bisher eine einzelne Chip-Reihe, der Info-
// Knopf wandert dann an den Panel-Titel, da dort die einzige Überschrift für diese eine Kategorie steht).
function specialsBlock(title, groups, fill = false) {
  const active = groups.filter((g) => g.items.length);
  const showSubheads = active.length > 1;
  return el(
    "div",
    { class: "panel" },
    [
      showSubheads || !active.length
        ? el("div", { class: "panel-title" }, title)
        : el("div", { class: "panel-title flex" }, [el("span", {}, title), specHelpBtn()]),
      ...active.flatMap((g) => [
        showSubheads ? subheadWithHelp(g.label) : null,
        el("div", { class: fill ? "chips chips-fill" : "chips" }, g.items.map((s) => deletableChip(A.abilityGeneral, s, g.items, s))),
      ]),
    ]
  );
}

// Tausendertrennzeichen (Leerzeichen, wie im System/DSA5-üblich: "1 320" statt "1320").
function formatNum(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Eine Erfahrungs-Kachel (Gesamt/Verfügbar/Ausgegeben). "Verfügbar" hat keinen setter (immer berechnet, s.
// experienceAvailable()); Gesamt/Ausgegeben sind nur im Bearbeiten-Modus direkt editierbar.
function xpItem(label, value, setter, accent) {
  const mode = document.querySelector(".sheet").getAttribute("data-mode");
  const numSpan = el("div", { class: "xp-num xp-field" + (accent ? " accent" : "") }, formatNum(value));
  if (setter && mode === "edit") {
    makeEditable(numSpan, value, (v) => { setter(v); renderContent(); renderHeader(); }, { type: "number", min: 0, max: 99999 });
  }
  return el("div", { class: "xp-item" }, [numSpan, el("div", { class: "xp-label" }, label)]);
}

function renderMain() {
  // Ressourcen/Resistenzen/Grundwerte zu einer Tabelle "Grundwerte" zusammengefasst, mit Unterüberschriften je
  // Kategorie (Nutzerwunsch 2026-09-14) — gleiches Muster wie specialsBlock()/traitsPanel: ein Panel, Subhead pro
  // Kategorie. Zeilen-Layout (derived-row vs. simple-row) bleibt je Kategorie unterschiedlich, nur der Panel-Rahmen
  // wird geteilt.
  const basicsGroupPanel = el("div", { class: "panel" }, [
    el("div", { class: "panel-title" }, "Grundwerte"),
    el("div", { class: "subhead" }, "Ressourcen"),
    // "Wert" war nicht selbsterklärend: bei Ressourcen ist es der aktuelle Stand, bei berechneten Werten der
    // Grundwert vor Modifikatoren (UI/UX-Review 2026-09-25, Paket G).
    el("div", { class: "row-head derived-row" }, head("", "Aktuell", "Mod", "Zukauf", "Max")),
    ...RESOURCES.filter((d) => d.show !== false).map(buildResourceRow),
    el("div", { class: "subhead" }, "Resistenzen"),
    el("div", { class: "row-head simple-row" }, head("", "Basis", "Mod", "Max")),
    ...RESISTANCES.filter((d) => d.show !== false).map(buildSimpleRow),
    el("div", { class: "subhead" }, "Grundwerte"),
    el("div", { class: "row-head simple-row" }, head("", "Basis", "Mod", "Max")),
    // Ausweichen + Initiative auch hier (Tester-Rückmeldung 2026-09-30) — dieselben Objekte wie im Kampf-Reiter;
    // Initiativewürfel/-Mod. nur im Bearbeiten-Modus (hideInPlay, Nutzer 2026-09-30). Modul: main.hbs.
    ...[BASICS[0], ...COMBAT_DERIVED, ...BASICS.slice(1)].map(buildSimpleRow),
  ]);

  // Unter der Grundwerte-Tabelle in der linken Spalte (Nutzerwunsch 2026-09-14: dort blieb sonst viel Leerraum,
  // da die rechte Spalte mit Vor-/Nachteile+Sonderfertigkeiten+Sprachen deutlich länger ist). Gesamt/Ausgegeben
  // sind im Bearbeiten-Modus direkt editierbar (gerahmte Felder); Verfügbar wird IMMER berechnet (total-spent),
  // nie gespeichert/editierbar.
  const xpPanel = el("div", { class: "panel", style: "margin-top:16px" }, [
    el("div", { class: "panel-title flex" }, [el("span", {}, "Erfahrung"), el("small", {}, EXPERIENCE_LEVEL)]),
    el("div", { class: "xp-grid" }, [
      xpItem("Gesamt", EXPERIENCE.total, (v) => { EXPERIENCE.total = v; }, false),
      xpItem("Verfügbar", experienceAvailable(), null, true),
      xpItem("Ausgegeben", EXPERIENCE.spent, (v) => { EXPERIENCE.spent = v; }, false),
    ]),
  ]);

  const traitsPanel = el("div", { class: "panel" }, [
    el("div", { class: "panel-title" }, "Vor- & Nachteile"),
    subheadWithHelp("Vorteile"),
    el("div", { class: "chips chips-fill" }, ADVANTAGES.map((t) => deletableChip(A.advantage, t, ADVANTAGES, t))),
    subheadWithHelp("Nachteile"),
    el("div", { class: "chips chips-fill" }, DISADVANTAGES.map((t) => deletableChip(A.disadvantage, t, DISADVANTAGES, t))),
  ]);

  const specialsPanel = specialsBlock("Allgemeine Sonderfertigkeiten", SPECIALS, true);

  // Vorprägung (siehe IMPRINT-Kommentar in data.js): kein Info-Knopf im System, nur eine reine Namensliste, daher
  // hier ohne subheadWithHelp — nur gerendert, wenn tatsächlich befüllt.
  const imprintPanel = IMPRINT.length
    ? el("div", { class: "panel" }, [el("div", { class: "panel-title" }, "Vorprägung"), el("div", { class: "chips chips-fill" }, IMPRINT.map((s) => deletableChip(A.abilityGeneral, s, IMPRINT, s)))])
    : null;

  const languagesPanel = el("div", { class: "panel" }, [
    el("div", { class: "panel-title flex" }, [
      el("span", {}, "Sprache und Schrift"),
      LANGUAGE_POINTS ? el("small", {}, `Sprachpunkte ${LANGUAGE_POINTS.used}/${LANGUAGE_POINTS.value}`) : null,
    ]),
    el("div", { class: "subhead" }, "Sprachen"),
    el("div", { class: "chips chips-fill" }, LANGUAGES.map((l) => deletableChip(A.abilityLanguage, l, LANGUAGES, l))),
    el("div", { class: "subhead" }, "Schriften"),
    el("div", { class: "chips chips-fill" }, SCRIPTS.map((s) => deletableChip(A.abilityLanguage, s, SCRIPTS, s))),
  ]);

  return el("div", {}, [
    buildAttrTiles(),
    buildAttrDetailPanel(),
    el("div", { class: "grid-2" }, [
      el("div", { class: "col-gap" }, [traitsPanel, specialsPanel, imprintPanel, languagesPanel]),
      el("div", {}, [basicsGroupPanel, xpPanel]),
    ]),
  ]);
}

// Talente als 6 Unter-Tabs (5 Kategorien + Sammelproben) statt einer langen Spalten-Ansicht.
// currentSkillGroup: Index in SKILL_GROUPS, oder "agg" für Sammelproben.
let currentSkillGroup = 0;
// Talente „Sprungmarken“ (Tester-Rückmeldung 2026-09-30, Variante B gewählt): kein eigener Reiter „Alle“ — die
// Liste zeigt immer alle Gruppen untereinander, die Gruppen-Reiter springen nur an die passende Stelle; beim
// Scrollen wandert die Markierung mit. Seit der Live-Rückmeldung 2026-09-30 stehen auch die Sammelproben als
// letzter Abschnitt in derselben Liste (einheitlich scrollbar), Suche + „Nur gesteigerte“ bleiben oben stehen.
const skillGroupKey = (v) => (v === "agg" ? "agg" : Number(v));

// Abstand eines Panels zum oberen Rand — abzüglich der oben klebenden Suchleiste, sonst läge der Titel darunter.
function skillPanelTop(content, panel) {
  const bar = content.querySelector(".skills-search");
  return content.scrollTop + panel.getBoundingClientRect().top - content.getBoundingClientRect().top - (bar ? bar.offsetHeight : 0) - 4;
}

// Gruppen-Reiter scrollen die Gesamtliste an die Gruppe (aus einer Suche heraus erst zurück zur Liste). Solange der
// Sprung läuft, führt die Scroll-Mitführung die Markierung nicht mit (sonst flackert sie über die Gruppen dazwischen).
let skillJumping = false;
function jumpToSkillGroup(g) {
  const rerender = skillSearchQuery.trim();
  skillSearchQuery = "";
  currentSkillGroup = g;
  if (rerender) renderContent();
  renderSubNav();
  const content = document.getElementById("content");
  const panel = content.querySelector(`[data-skill-group="${g}"]`);
  if (!panel) return;
  const top = Math.max(0, Math.min(skillPanelTop(content, panel), content.scrollHeight - content.clientHeight));
  skillJumping = Math.abs(top - content.scrollTop) > 1;
  content.scrollTo({ top, behavior: "smooth" });
}

// Scroll-Mitführung: markiert die Gruppe, deren Panel gerade oben im Inhaltsbereich steht; ganz unten die letzte
// (die Sammelproben sind meist zu kurz, um bis nach oben zu kommen).
function initSkillScrollSpy() {
  const content = document.getElementById("content");
  content.addEventListener("scrollend", () => { skillJumping = false; });
  content.addEventListener("scroll", () => {
    if (currentTab !== "skills" || skillSearchQuery.trim() || skillJumping) return;
    const panels = [...content.querySelectorAll("[data-skill-group]")];
    if (!panels.length) return;
    const bar = content.querySelector(".skills-search");
    const top = content.getBoundingClientRect().top + (bar ? bar.offsetHeight : 0) + 40;
    let current = skillGroupKey(panels[0].dataset.skillGroup);
    if (content.scrollTop + content.clientHeight >= content.scrollHeight - 2) current = skillGroupKey(panels.at(-1).dataset.skillGroup);
    else panels.forEach((p) => { if (p.getBoundingClientRect().top <= top) current = skillGroupKey(p.dataset.skillGroup); });
    if (current !== currentSkillGroup) {
      currentSkillGroup = current;
      renderSubNav();
    }
  });
}

// Kampf-Unterreiter: "Kampf" (Kampfwerte/Waffen/Rüstung) und "Kampftalente" (Kampftechniken), gleiches Muster
// wie die Talentgruppen oben (siehe PLANNING.md "Design-Muster (wiederverwendbar über alle Tabs)").
let currentCombatSection = "kampf";

function setCombatSection(section) {
  currentCombatSection = section;
  renderContent();
  renderSubNav();
  document.getElementById("content").scrollTop = 0;
}

// Belastung (system.burden.value im echten Skill-Datenmodell, s. Kommentar über SKILL_GROUPS in data.js): nur
// bei "yes"/"maybe" überhaupt etwas anzeigen — die Spalte soll nur dort "eingeblendet" sein, wo Belastung beim
// Talent tatsächlich berücksichtigt wird, nicht als Dauer-"Nein" in jeder Zeile.
function belastungCell(s) {
  if (s.belastung === "yes") return el("span", { class: "center belastung-yes" }, "Ja");
  if (s.belastung === "maybe") return el("span", { class: "center belastung-maybe" }, "Vielleicht");
  return el("span", {}, "");
}

// Eine Talent-Zeile — eigene Funktion statt Inline-Map, damit die Favoriten-Liste auf dem Titelblatt
// (renderCover) exakt dieselbe Zeile wiederverwenden kann statt sie zu duplizieren.
// Talentwert (FW) ist direkt editierbar (Freitext-Korrektur ohne AP-Abzug) UND per +/- Stepper mit echten
// AP-Kosten steigerbar (advanceStepper(), Steigerungsfaktor aus s.stf — 1:1 aus dem Talent-Kompendium, siehe
// SKILL_GROUPS-Kommentar in data.js), analog zum Eigenschaften-Tab.
function skillRow(s) {
  const mode = document.querySelector(".sheet").getAttribute("data-mode");
  const [minus, plus] = advanceStepper(() => s.fw, (v) => { s.fw = v; }, s.stf, 0, () => { renderContent(); renderHeader(); }, s.name);
  const fwSpan = el("span", { class: "big val-editable" }, String(s.fw));
  if (mode === "edit") makeEditable(fwSpan, s.fw, (v) => { s.fw = v; renderContent(); renderHeader(); }, { type: "number", min: 0, max: 99 });
  return el("div", { class: "row skill-row" }, [
    el("img", { src: s.img, alt: "" }),
    el("span", { class: "left" }, s.name),
    probeDice(s.probe, s.name),
    belastungCell(s),
    el("span", { class: "skill-fw" }, [minus, fwSpan, plus]),
    favStar(s),
  ]);
}

// `query` (bereits getrimmt/lowercased) filtert per Namens-Teilstring — UI-UX-REVIEW.md, im Browser bestätigter
// Befund: das Suchfeld auf dem Talente-Tab hatte bisher gar keinen input-Listener und zeigte daher nie eine
// Filterwirkung. Analog zu renderInventory()/inventorySearchQuery. Liefert bei aktiver Suche ohne Treffer `null`
// statt eines leeren Panels (renderSkills() zeigt dann bei mehreren durchsuchten Gruppen nur eine gemeinsame
// "nichts gefunden"-Meldung statt einer pro leerer Gruppe).
function renderSkillGroupPanel(g, query) {
  const items = g.items.filter((s) => (!query || s.name.toLowerCase().includes(query)) && (!skillOnlyLearned || s.fw > 0));
  if (query && !items.length) return null;
  return el("div", { class: "panel" }, [
    el("div", { class: "panel-title", style: `color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.55);background:${g.grad}` }, g.name),
    // Spaltenüberschrift "Talent" links über dem Talentnamen statt zentriert (.skill-row-Sonderfall in
    // style.css) — Nutzer-Feedback: soll wie die Namen darunter linksbündig stehen, nicht wie die übrigen
    // Kopfzeilen der Wert-Spalten zentriert sein.
    el("div", { class: "row-head skill-row" }, head("", "Talent", "Probe", "BE", "FW", "")),
    ...items.map(skillRow),
    ...(items.length ? [] : [el("div", { class: "drop-zone" }, "Keine gesteigerten Talente in dieser Gruppe.")]),
  ]);
}

// Sammelprobe = eine Kopfzeile (Name/Intervall/Versuchsbudget/angesammelte QS) + darunter bis zu 3 alternative
// Talente, auf die gewürfelt werden kann (siehe AGGREGATED-Kommentar in data.js). Die QS-Zahl (von max. 10)
// entscheidet über Erfolg, nicht die Versuchszahl allein — deshalb beide getrennt als eigene Spalten.
function renderAggregatedPanel() {
  return el("div", { class: "panel" }, [
    // "+" in beiden Modi (Nutzer-Feedback 2026-09-28: Sammelproben auch im Spielmodus anlegen); Modul: itemCreate.
    el("div", { class: "panel-title flex" }, [
      el("span", {}, "Sammelproben"),
      el("small", {}, "Gruppierte Proben über mehrere Intervalle"),
      (() => {
        const add = el("button", { type: "button", class: "title-icon-btn", title: "Sammelprobe hinzufügen", "aria-label": "Sammelprobe hinzufügen" }, "+");
        add.addEventListener("click", () => flashNotice("Neue Sammelprobe angelegt (Click-Dummy)"));
        return add;
      })(),
    ]),
    ...AGGREGATED.flatMap((a) => [
      el("div", { class: "row agg-head-row" }, [
        el("img", { src: A.aggregatedTest, alt: "" }),
        el("span", { class: "left" }, a.name),
        el("span", { class: "muted center" }, a.interval),
        el("span", { class: "center" }, `${a.usedTestCount} / ${a.allowedTestCount} Proben`),
        el("span", { class: "big center" }, `${a.cummulatedQS} / 10 QS`),
      ]),
      ...a.talents.map((t) =>
        el("div", { class: "row agg-talent-row" }, [
          el("span", { class: "left muted" }, t.name),
          probeDice(t.probe, t.name),
          el("strong", { class: "agg-fw", title: "Fertigkeitswert" }, String(t.fw)),
        ])
      ),
    ]),
  ]);
}

// Kategoriefarben stehen nur noch in den Panel-Titeln der Talenttabellen (renderSkillGroupPanel), nicht mehr
// auf den Unter-Tabs selbst — Nutzer-Feedback 2026-09-13: die farbigen Pillen passten optisch nicht zum Bogen.
// "-talente" im Tab-Label weggelassen, um Platz zu sparen (voller Name steht ohnehin im Panel-Titel darunter).
// Sitzt direkt neben der Reiter-Überschrift (#tabSubNav in index.html), nicht im Content-Bereich — siehe renderSkillSubNav().
function buildSkillSubTabs() {
  return el(
    "div",
    { class: "sub-tabs" },
    [
      // Während einer Suche zeigt die Liste Treffer aus ALLEN Gruppen — dann ist keine Gruppe markiert
      // (UI/UX-Review 2026-09-25 Punkt 8); nach dem Löschen der Suche gilt wieder currentSkillGroup.
      ...SKILL_GROUPS.map((g, i) => {
        const active = !skillSearchQuery.trim() && currentSkillGroup === i;
        const btn = el("button", { type: "button", class: "sub-tab" + (active ? " active" : ""), "aria-pressed": String(active) }, g.name.replace(/s?talente$/i, ""));
        btn.addEventListener("click", () => jumpToSkillGroup(i));
        return btn;
      }),
      (() => {
        const active = !skillSearchQuery.trim() && currentSkillGroup === "agg";
        const btn = el("button", { type: "button", class: "sub-tab" + (active ? " active" : ""), "aria-pressed": String(active) }, "Sammelproben");
        btn.addEventListener("click", () => jumpToSkillGroup("agg"));
        return btn;
      })(),
    ]
  );
}

// Kampf-Unterreiter: nur zwei gleichwertige Bereiche, schon immer ohne Kategoriefarben — sonst 1:1 dasselbe
// .sub-tabs/.sub-tab-Muster wie bei den Talenten.
function buildCombatSubTabs() {
  return el("div", { class: "sub-tabs" }, [
    ["kampf", "Übersicht"], ["koerper", "Körper"], ["kampftalente", "Kampftalente"],
  ].map(([id, label]) => {
    const active = currentCombatSection === id;
    const btn = el("button", { type: "button", class: "sub-tab" + (active ? " active" : ""), "aria-pressed": String(active) }, label);
    btn.addEventListener("click", () => setCombatSection(id));
    return btn;
  }));
}

// Magie-/Religions-Unterreiter (2026-09-13, Nutzerwunsch): Proben+Sonderfertigkeiten vs. Traditionsgegenstände,
// dasselbe zwei-gleichwertige-Bereiche-Muster wie bei Kampf/Kampftalente. Zwei getrennte Zustände statt einem
// gemeinsamen, da Magie- und Religions-Tab unabhängig voneinander umgeschaltet werden sollen.
let currentMagicSection = "spells";

function setMagicSection(section) {
  currentMagicSection = section;
  renderContent();
  renderSubNav();
  document.getElementById("content").scrollTop = 0;
}

let currentReligionSection = "liturgies";

function setReligionSection(section) {
  currentReligionSection = section;
  renderContent();
  renderSubNav();
  document.getElementById("content").scrollTop = 0;
}

function buildMagicSubTabs() {
  return el("div", { class: "sub-tabs" }, [
    ["spells", "Zauber"], ["items", "Ausrüstung"],
  ].map(([id, label]) => {
    const active = currentMagicSection === id;
    const btn = el("button", { type: "button", class: "sub-tab" + (active ? " active" : ""), "aria-pressed": String(active) }, label);
    btn.addEventListener("click", () => setMagicSection(id));
    return btn;
  }));
}

function buildReligionSubTabs() {
  return el("div", { class: "sub-tabs" }, [
    ["liturgies", "Liturgien"], ["items", "Ausrüstung"],
  ].map(([id, label]) => {
    const active = currentReligionSection === id;
    const btn = el("button", { type: "button", class: "sub-tab" + (active ? " active" : ""), "aria-pressed": String(active) }, label);
    btn.addEventListener("click", () => setReligionSection(id));
    return btn;
  }));
}

// Notizen-Unterreiter (wie im Foundry-Modul, notes-Subnav): vier Freitextfelder als gleichwertige Bereiche.
const NOTES_SECTIONS = [
  { id: "biography", label: "Hintergrundgeschichte", get: () => BIOGRAPHY_TEXT, set: (v) => { BIOGRAPHY_TEXT = v; } },
  { id: "notes", label: "Notizen", get: () => NOTES_TEXT, set: (v) => { NOTES_TEXT = v; } },
  { id: "ownernotes", label: "Private Notizen", get: () => PRIVATE_NOTES_TEXT, set: (v) => { PRIVATE_NOTES_TEXT = v; } },
  { id: "gmnotes", label: "GM-Notizen", get: () => GM_NOTES_TEXT, set: (v) => { GM_NOTES_TEXT = v; } },
];
let currentNotesSection = "biography";

function buildNotesSubTabs() {
  return el("div", { class: "sub-tabs" }, NOTES_SECTIONS.map(({ id, label }) => {
    const active = currentNotesSection === id;
    const btn = el("button", { type: "button", class: "sub-tab" + (active ? " active" : ""), "aria-pressed": String(active) }, label);
    btn.addEventListener("click", () => {
      currentNotesSection = id;
      renderContent();
      renderSubNav();
      document.getElementById("content").scrollTop = 0;
    });
    return btn;
  }));
}

// Nur auf Tabs gefüllt, die in gleichwertige Unter-Bereiche zerfallen (Talente/Kampf/Magie/Religion/Notizen), sonst geleert.
function renderSubNav() {
  const nav = document.getElementById("tabSubNav");
  nav.innerHTML = "";
  if (currentTab === "skills") nav.appendChild(buildSkillSubTabs());
  else if (currentTab === "combat") nav.appendChild(buildCombatSubTabs());
  else if (currentTab === "magic") nav.appendChild(buildMagicSubTabs());
  else if (currentTab === "religion") nav.appendChild(buildReligionSubTabs());
  else if (currentTab === "notes") nav.appendChild(buildNotesSubTabs());
}

// Nutzer-Feedback 2026-09-14: die Suche filterte bisher nur innerhalb der gerade aktiven Talentgruppe — ein Treffer
// in einer anderen Kategorie blieb unsichtbar, solange man nicht selbst dorthin wechselte. Jetzt wie bei
// renderInventory()/inventorySearchQuery: sobald ein Suchbegriff steht, werden alle 5 Talentgruppen durchsucht und
// als eigene Panels untereinander gezeigt (leere Gruppen entfallen), unabhängig vom aktiven Unter-Tab. Ohne
// Suchbegriff bleibt die gewohnte Ein-Gruppe-pro-Unter-Tab-Ansicht (inkl. Sammelproben) erhalten.
let skillSearchQuery = "";
// "Nur gesteigerte anzeigen" wie der Filter im System (actor-talents.hbs: .notLearned = FW 0, ausgeblendet solange
// .allTalents nicht .showAll trägt) — bisher nur ein Text ohne Funktion.
let skillOnlyLearned = false;

function renderSkills() {
  const searchInput = el("input", { type: "search", id: "skillSearch", placeholder: "Talent suchen …", value: skillSearchQuery });
  searchInput.addEventListener("input", () => {
    skillSearchQuery = searchInput.value;
    const pos = searchInput.selectionStart;
    renderContent();
    renderSubNav();
    const fresh = document.getElementById("skillSearch");
    fresh.focus();
    fresh.setSelectionRange(pos, pos);
  });
  const filterBtn = el("button", { type: "button", class: "filter-switch" + (skillOnlyLearned ? " on" : ""), role: "switch", "aria-checked": String(skillOnlyLearned) }, [
    el("span", { class: "filter-switch-track", "aria-hidden": "true" }, [el("span", { class: "filter-switch-thumb" })]),
    "Nur gesteigerte",
  ]);
  filterBtn.addEventListener("click", () => {
    skillOnlyLearned = !skillOnlyLearned;
    renderContent();
    document.querySelector(".filter-switch")?.focus();
  });
  // Klebt oben im Inhaltsbereich (.skills-search), damit Suche und Filter beim Scrollen erreichbar bleiben.
  const search = el("div", { class: "search-bar skills-search" }, [searchInput, filterBtn]);

  const q = skillSearchQuery.trim().toLowerCase();
  let content;
  if (q) {
    const panels = SKILL_GROUPS.map((g) => renderSkillGroupPanel(g, q)).filter(Boolean);
    const noResults = panels.length ? null : el("div", { class: "drop-zone" }, `Kein Talent gefunden für „${skillSearchQuery}“`);
    const clearBtn = el("button", { type: "button", class: "search-clear" }, "Suche löschen");
    clearBtn.addEventListener("click", () => {
      skillSearchQuery = "";
      renderContent();
      renderSubNav();
      document.getElementById("skillSearch")?.focus();
    });
    const info = el("div", { class: "search-info", role: "status" }, [`Suchergebnisse aus allen Gruppen für „${skillSearchQuery.trim()}“`, clearBtn]);
    content = el("div", {}, [info, ...panels, ...(noResults ? [noResults] : [])]);
  } else {
    const agg = renderAggregatedPanel();
    agg.dataset.skillGroup = "agg";
    content = el("div", {}, [
      ...SKILL_GROUPS.map((g, i) => {
        const panel = renderSkillGroupPanel(g, q);
        panel.dataset.skillGroup = String(i);
        return panel;
      }),
      agg,
    ]);
  }

  return el("div", {}, [search, content]);
}

// Waffen-/Rüstungsverschleiß (siehe structure-Kommentar bei MELEE in data.js): Verschleißgrad 0 (intakt) bis 4
// (zerstört) exakt wie EquipmentDamage.calculateWear() im System — value/max kommen aus dem structure-Feld,
// nicht aus einer eigenen Fortschrittsleiste wie bei der Munition.
function wearLevel(structure) {
  if (!structure || !structure.max) return 0;
  return Math.min(4, Math.max(0, Math.floor((1 - structure.value / structure.max) * 4)));
}

// Textzeile analog lang/de.json "WEAR.<type>.<grad>", für den title-Tooltip auf dem Waffen-/Rüstungsbild.
const WEAR_LABELS = {
  meleeweapon: ["In gutem Zustand", "leicht beschädigt, AT und PA um 1 erschwert", "beschädigt, AT und PA um 2 erschwert", "schwer beschädigt, kann nicht mehr benutzt werden", "zerstört"],
  rangeweapon: ["In gutem Zustand", "leicht beschädigt, AT um 1 erschwert", "beschädigt, AT um 2 erschwert", "schwer beschädigt, kann nicht mehr benutzt werden", "zerstört"],
  armor: ["In gutem Zustand", "leicht beschädigt, –1 RS", "beschädigt, +1 BE, –1 RS", "schwer beschädigt, kann nicht mehr getragen werden", "zerstört"],
};

// Waffen-/Rüstungsbild + schmaler Struktur-Balken darunter (analog .item-structure in actor-equipment.hbs/
// combat_weapon.hbs/combat_rangeweapon.hbs, hier als horizontaler Balken statt vertikalem Streifen, da die
// Spalte in unserem Grid dafür keinen Platz neben dem Bild hat) plus Verschleißfarbe am Bildrahmen, damit der
// Zustand auch ohne Tooltip auf einen Blick erkennbar ist.
function itemIcon(src, alt, structure, type) {
  if (!structure) return el("img", { src, alt: alt || "" });
  const wear = wearLevel(structure);
  const wrap = el("div", {
    class: `item-icon wear${wear}`,
    title: `Struktur ${structure.value}/${structure.max} — ${WEAR_LABELS[type][wear]}`,
  }, [
    el("img", { src, alt: alt || "" }),
    el("span", { class: "structure-bar" }, [
      el("span", { class: "fill", style: `width:${Math.max(0, (structure.value / structure.max) * 100)}%` }),
    ]),
  ]);
  return wrap;
}

// AT/PA (Nahkampf) bzw. AT (Fernkampf) inkl. Verschleißabzug, analog EquipmentDamage.weaponWearModifier(): Grad 1
// zieht 1, Grad 2 zieht 2 ab, ab Grad 3 ist die Waffe unbenutzbar (0). Im System stecken diese Abzüge schon in
// item.attack/item.parry, hier werden sie erst beim Rendern draufgerechnet, damit das rohe structure-Feld die
// Quelle der Wahrheit bleibt.
function effectiveMeleeStats(w) {
  const wear = wearLevel(w.structure);
  if (wear >= 3) return { at: 0, pa: 0 };
  return { at: Math.max(0, w.at - wear), pa: Math.max(0, w.pa - wear) };
}

function effectiveRangedStats(w) {
  const wear = wearLevel(w.structure);
  if (wear >= 3) return { at: 0 };
  return { at: Math.max(0, w.at - wear) };
}

// RS/BE inkl. Verschleißabzug, analog EquipmentDamage.armorWearModifier()/armorEncumbranceModifier(): Grad 1–2
// ziehen 1 RS ab und erschweren die Behinderung um 1, ab Grad 3 schützt die Rüstung gar nicht mehr.
function effectiveArmor(a) {
  const wear = wearLevel(a.structure);
  let rs = a.rs;
  if (wear === 1 || wear === 2) rs = Math.max(0, rs - 1);
  else if (wear >= 3) rs = 0;
  const be = a.be + (wear > 1 ? 1 : 0);
  return { rs, be };
}

// Munitionszelle einer Fernkampfwaffe (siehe RANGED-Kommentar in data.js) — Variante "Mischform" (Nutzer-
// Entscheidung 2026-09-28 nach Vergleich mit "alles im Menü" und "alles kompakt inline"): Nachladen und Magazin
// (im Kampf oft geklickt) direkt sichtbar, nur die selten geänderte Munitionswahl im Aufklapp-Menü.
let openAmmoWeapon = null;

function toggleAmmoMenu(weapon) {
  openAmmoWeapon = openAmmoWeapon === weapon ? null : weapon;
  renderContent();
}

// ammo === null = "Keine Munition" (im System selectAmmo mit data-ammo-id="clear").
function selectAmmo(weapon, ammo) {
  weapon.ammoTypes.forEach((a) => (a.selected = a === ammo));
  openAmmoWeapon = null;
  renderContent();
}

const selectedAmmo = (w) => w.ammoTypes.find((a) => a.selected) || null;
const isLoaded = (w) => !w.reloadTime || w.reloadProgress >= w.reloadTime;

// Wie actor-sheet.js _loadWeapon: Linksklick +1 bis LZ, nur mit gewählter Munition.
function advanceReload(weapon) {
  if (!selectedAmmo(weapon) || isLoaded(weapon)) return;
  weapon.reloadProgress++;
  renderContent();
}

// Wie actor-sheet.js _loadWeapon mit Rechtsklick: Lade- und Zielfortschritt auf 0.
function resetReload(weapon) {
  weapon.reloadProgress = 0;
  if (weapon.aim) weapon.aim.progress = 0;
  renderContent();
}

// Wie itemSwapMag: volles Magazin einsetzen, ein Magazin aus dem Vorrat verbrauchen.
function swapMag(weapon) {
  const ammo = selectedAmmo(weapon);
  if (!ammo?.mag || ammo.count < 1) return;
  ammo.count--;
  ammo.mag.current = ammo.mag.max;
  renderContent();
}

function stopClick(node, fn) {
  node.addEventListener("click", (e) => {
    e.stopPropagation();
    fn();
  });
  return node;
}

// Nachladen: Beschriftung + Segmentbalken (ein Segment je Aktion) + Stand, ↺ setzt zurück
// (im System sonst nur per Rechtsklick) — Modul: .dsa5h-reload in weapon.hbs.
function reloadWidget(w) {
  const loaded = isLoaded(w);
  const title = loaded ? "Geladen" : `Nachladen ${w.reloadProgress}/${w.reloadTime}`;
  const btn = el("button", { type: "button", class: "reload-btn" + (loaded ? " done" : ""), title, "aria-label": `${title}: ${w.name}` }, [
    el("span", {}, loaded ? "Geladen" : "Nachladen"),
    el("span", { class: "reload-bar", style: `--lz:${w.reloadTime}`, "aria-hidden": "true" }, [el("span", { style: `width:${Math.min(100, (w.reloadProgress / w.reloadTime) * 100)}%` })]),
    el("span", { class: "reload-count" }, `${Math.min(w.reloadProgress, w.reloadTime)}/${w.reloadTime}`),
  ]);
  if (loaded || !selectedAmmo(w)) btn.disabled = true;
  else stopClick(btn, () => advanceReload(w));
  const row = el("span", { class: "reload" }, [btn]);
  if (w.reloadProgress > 0) {
    row.appendChild(stopClick(el("button", { type: "button", class: "reload-reset", title: "Nachladen zurücksetzen", "aria-label": `Nachladen zurücksetzen: ${w.name}` }, "↺"), () => resetReload(w)));
  }
  return row;
}

// Zielen (Issue #8, 2026-09-30): reine Anzeige wie im Systembogen, nur wenn schon gezielt wurde (aim.progress > 0);
// erhöht wird im System im Probendialog, ↺ beim Nachladen setzt Laden + Zielen zurück. Modul: .dsa5h-aim in weapon.hbs.
function aimWidget(w) {
  const progress = Math.min(2, w.aim?.progress || 0);
  if (!progress) return null;
  const title = progress >= 2 ? "Gezielt" : `Zielen (${progress}/2)`;
  return el("span", { class: "aim" + (progress >= 2 ? " done" : ""), title, "aria-label": `Zielen: ${w.name} (${title})` }, [
    el("span", {}, "Zielen"),
    el("span", { class: "reload-bar", style: "--lz:2", "aria-hidden": "true" }, [el("span", { style: `width:${progress * 50}%` })]),
    el("span", { class: "reload-count" }, `${progress}/2`),
  ]);
}

// Magazinstand "Magazin 10/10" + ⇄ zum Tauschen.
function magWidget(w) {
  const ammo = selectedAmmo(w);
  if (!ammo?.mag) return null;
  const { current, max } = ammo.mag;
  const swapLabel = `Magazin tauschen (${ammo.count} im Vorrat)`;
  const swap = el("button", { type: "button", class: "mag-swap", title: swapLabel, "aria-label": `${swapLabel}: ${w.name}` }, "⇄");
  if (!ammo.count || current === max) swap.disabled = true;
  else stopClick(swap, () => swapMag(w));
  return el("span", { class: "mag" }, [
    el("span", { class: "muted" }, "Magazin"),
    el("span", { class: "mag-count", title: "Schuss im Magazin" }, `${current}/${max}`),
    swap,
  ]);
}

// Munitionsarten als Chips + "Keine Munition" (Aufklapp-Menü der Munitionswahl).
function ammoChips(w) {
  const chip = (label, active, ammo) =>
    stopClick(el("button", { type: "button", class: "ammo-chip" + (active ? " active" : ""), "aria-pressed": String(active) }, label), () => selectAmmo(w, ammo));
  return el("div", { class: "ammo-types" }, [...w.ammoTypes.map((a) => chip(`${a.name} ×${a.count}`, a.selected, a)), chip("Keine Munition", !selectedAmmo(w), null)]);
}

function ammoToggle(w, summary) {
  const isOpen = openAmmoWeapon === w;
  return stopClick(
    el("button", { type: "button", class: "ammo-toggle" + (isOpen ? " open" : ""), "aria-expanded": String(isOpen) }, [
      el("span", { class: "ammo-toggle-label" }, summary),
      el("span", { class: "ammo-toggle-caret" }, "▾"),
    ]),
    () => toggleAmmoMenu(w)
  );
}

function ammoMenu(children) {
  const menu = el("div", { class: "ammo-menu" }, children.filter(Boolean));
  menu.addEventListener("click", (e) => e.stopPropagation());
  return menu;
}

function renderAmmoCell(w) {
  // Waffen ohne eigene Munitionsgruppe (z.B. Wurfmesser) haben weiterhin nur eine einfache Anzahl.
  if (!w.ammoTypes) return el("span", { class: "muted center" }, w.ammo);
  const ammo = selectedAmmo(w);
  return el("span", { class: "ammo-cell inline" }, [
    el("span", { class: "ammo-pick" }, [ammoToggle(w, ammo ? `${ammo.name} ×${ammo.count}` : "Keine Munition"), openAmmoWeapon === w ? ammoMenu([ammoChips(w)]) : null]),
    w.reloadTime ? reloadWidget(w) : null,
    aimWidget(w),
    magWidget(w),
  ]);
}

// "Wie die Waffe geführt wird" (system.worn.requiresBothHands/.offHand, siehe combat_weapon.hbs/
// combat_rangeweapon.hbs ".combat-item-grip"): zweihändig geführte Waffen zeigen nur ein festes Symbol (nicht
// umschaltbar, wie im System — dort erscheint dann nur der eine "wrongGrip.twoHanded"-Knopf statt zweier),
// alles andere zwei umschaltbare Knöpfe (Haupthand/Nebenhand). In BEIDEN Modi bedienbar (BEARBEITEN.md
// Spielmodus-Abschnitt "Einstellung wie die Waffe geführt wird") — eine laufende Kampfentscheidung, kein Setup.
function gripCell(w) {
  // Wurfwaffen-Kontextmenü (siehe THROWABLE_GROUPS-Kommentar bei MELEE in data.js) sitzt im echten System in
  // derselben "combatGripControls"-Zelle wie die Haupt-/Nebenhand-Knöpfe (combat_weapon.hbs:32-61), daher hier
  // ebenfalls dort angehängt statt in einer eigenen Spalte — das hielte die Favoriten-Wiederverwendung der Zeile
  // auf dem Titelblatt (meleeRow-Kommentar) sonst nicht mehr grid-kompatibel.
  const throwMenu = throwMenuCell(w);
  if (!w.worn) return el("span", { class: "grip-cell" }, throwMenu ? [throwMenu] : []); // Waffenlos: kein Item, keine Griff-Einstellung
  if (w.worn.requiresBothHands) {
    return el("span", { class: "grip-cell" }, [el("span", { class: "grip-btn active", title: "Beidhändig geführt" }, "✋✋"), throwMenu]);
  }
  const mainBtn = el("button", { type: "button", class: "grip-btn" + (!w.worn.offHand ? " active" : ""), title: "Haupthand", "aria-label": `${w.name} in der Haupthand führen`, "aria-pressed": String(!w.worn.offHand) }, "H");
  const offBtn = el("button", { type: "button", class: "grip-btn" + (w.worn.offHand ? " active" : ""), title: "Nebenhand", "aria-label": `${w.name} in der Nebenhand führen`, "aria-pressed": String(!!w.worn.offHand) }, "N");
  mainBtn.addEventListener("click", (e) => { e.stopPropagation(); w.worn.offHand = false; renderContent(); });
  offBtn.addEventListener("click", (e) => { e.stopPropagation(); w.worn.offHand = true; renderContent(); });
  return el("span", { class: "grip-cell" }, [mainBtn, offBtn, throwMenu]);
}

// Wurfwaffen-Kontextaktion (siehe THROWABLE_GROUPS-Kommentar bei MELEE in data.js): kleiner "⋮"-Knopf öffnet ein
// Mini-Menü mit der einen Wurf-Option, analog zum weaponContextMenu-Ellipsis-Button in combat_weapon.hbs. Nur
// vorhanden, wenn die Kampftechnik überhaupt wurfwaffenfähig ist — sonst bräuchte der Knopf gar keinen Eintrag.
let openThrowMenu = null;

function throwMenuCell(w) {
  const reach = THROWABLE_GROUPS[w.group];
  if (!reach) return null;
  const isOpen = openThrowMenu === w;
  const btn = el("button", { type: "button", class: "grip-btn context-btn" + (isOpen ? " open" : ""), title: "Weitere Aktionen" }, "⋮");
  btn.addEventListener("click", (e) => { e.stopPropagation(); openThrowMenu = isOpen ? null : w; renderContent(); });
  if (!isOpen) return el("span", { class: "throw-cell" }, [btn]);
  const throwBtn = el("button", { type: "button", class: "reload-btn" }, `Als Wurfwaffe (AT −8, RW ${reach})`);
  throwBtn.addEventListener("click", (e) => { e.stopPropagation(); openThrowMenu = null; renderContent(); });
  const menu = el("div", { class: "ammo-menu" }, [throwBtn]);
  menu.addEventListener("click", (e) => e.stopPropagation());
  return el("span", { class: "throw-cell open" }, [btn, menu]);
}

// "+"-Knopf zum direkten Ausrüsten (unequippedWeaponMenu, siehe UNEQUIPPED_WEAPONS-Kommentar in data.js) und
// Handschuh-/Gliedmaßenlimit-Umschalter (IGNORE_WEAPON_HAND_LIMITS) — beide sitzen im echten System in der
// Tabellenkopfzeile der jeweiligen Waffentabelle, hier im Panel-Titel statt im Grid-Kopf, da unser Grid keine
// eigene Spalte dafür vorsieht.
let openEquipMenu = null;

function equipWeapon(category, item) {
  const pool = UNEQUIPPED_WEAPONS[category];
  const idx = pool.indexOf(item);
  if (idx === -1) return;
  pool.splice(idx, 1);
  (category === "melee" ? MELEE : RANGED).push(item);
  openEquipMenu = null;
  renderContent();
}

function ignoreHandLimitsBtn() {
  const btn = el(
    "button",
    { type: "button", class: "title-icon-btn" + (IGNORE_WEAPON_HAND_LIMITS ? " active" : ""), title: "Handschuh-/Gliedmaßenlimit ignorieren" },
    IGNORE_WEAPON_HAND_LIMITS ? "☑" : "☐"
  );
  btn.addEventListener("click", () => { IGNORE_WEAPON_HAND_LIMITS = !IGNORE_WEAPON_HAND_LIMITS; renderContent(); });
  return btn;
}

function equipMenuBtn(category) {
  const pool = UNEQUIPPED_WEAPONS[category];
  const isOpen = openEquipMenu === category;
  const btn = el("button", { type: "button", class: "title-icon-btn" + (isOpen ? " active" : ""), title: "Waffe ausrüsten" }, "+");
  if (pool.length) btn.addEventListener("click", () => { openEquipMenu = isOpen ? null : category; renderContent(); });
  else btn.disabled = true;
  if (!isOpen) return btn;
  const menu = el(
    "div",
    { class: "ammo-menu" },
    pool.map((item) => {
      const chip = el("button", { type: "button", class: "reload-btn" }, item.name);
      chip.addEventListener("click", (e) => { e.stopPropagation(); equipWeapon(category, item); });
      return chip;
    })
  );
  menu.addEventListener("click", (e) => e.stopPropagation());
  return el("span", { class: "title-menu-wrap open" }, [btn, menu]);
}

function combatPanelTitle(text, actions) {
  return el("div", { class: "panel-title flex" }, [el("span", {}, text), el("div", { class: "panel-title-actions" }, actions)]);
}

// Waffenzeilen (Paket C, UI/UX-Review 2026-09-25): die Fernkampftabelle lief nach rechts aus dem Bogen, weil Technik,
// Munition und Reichweite je eine eigene Spalte hatten. Jetzt wie im Foundry-Modul (weapon.hbs): Technik klein unter
// dem Namen, Munition/Nachladen/Zielen in einer zweiten Zeile — AT/PA/FK und TP bleiben immer nebeneinander.
// Reichweite als eigene Spalte zwischen TP und Griff (Nutzer-Entscheidung 2026-09-25, Variante A statt "RW klein
// unter dem Namen").
function weaponNameCell(name, group) {
  return el("span", { class: "left weapon-name" }, [el("span", {}, [name, onUseBtn(name)]), combatSkillLink(group) || el("small", { class: "weapon-sub" }, group)]);
}

// Kampftechnik der Waffe mit Kampftechnikwert (Tester-Rückmeldung 2026-09-30), Klick springt zur Zeile im Unterreiter
// „Kampftalente“. Modul später: Waffe kennt ihre Technik (system.combatskill.value), Technik-Item per Name wie im
// System. Liefert null, wenn es keine passende Technik gibt (z. B. „Angeboren“ bei Angriffen).
function combatSkillLink(group) {
  const cs = COMBAT_SKILLS.find((c) => c.name === group);
  if (!cs) return null;
  const btn = el("button", { type: "button", class: "weapon-sub ct-link", title: `Zur Kampftechnik ${cs.name}`, "aria-label": `${cs.name}, Kampftechnikwert ${cs.fw} — zur Kampftechnik springen` }, [
    cs.name, el("span", { class: "ct-link-ktw" }, `KtW ${cs.fw}`),
  ]);
  btn.addEventListener("click", (e) => { e.stopPropagation(); jumpToCombatSkill(cs.name); });
  return btn;
}

// Sprung: Unterreiter wechseln, Suche leeren, Zeile hinscrollen + kurz aufleuchten lassen (wie nach einer Änderung).
function jumpToCombatSkill(name) {
  combatSkillQuery = "";
  setCombatSection("kampftalente");
  const row = [...document.querySelectorAll("#content .combatskill-row")].find((r) => r.querySelector(".cs-name")?.textContent === name);
  if (!row) return;
  // Nur den Inhaltsbereich scrollen — scrollIntoView() verschiebt auch die Seite um den Bogen herum.
  const content = document.getElementById("content");
  const offset = row.getBoundingClientRect().top - content.getBoundingClientRect().top;
  content.scrollTo({ top: content.scrollTop + offset - (content.clientHeight - row.offsetHeight) / 2, behavior: "smooth" });
  row.classList.remove("just-changed");
  void row.offsetWidth;
  row.classList.add("just-changed");
}

function weaponReachCell(reach) {
  return el("span", { class: "muted center" }, reach || "–");
}

// Zweite Zeile unter Name bis Zeilenende (nur Fernkampf mit Munition): Auswahl/Nachladen/Zielen über renderAmmoCell().
function weaponDetails(w) {
  if (!w.ammoTypes && !w.ammo) return null;
  return el("div", { class: "weapon-details" }, [el("span", { class: "muted" }, "Munition"), renderAmmoCell(w)]);
}

// Angeborene Kampfwerte (TRAITS-Kommentar in data.js): eigene Zeilen ohne Griff-/Favoriten-Zelle (nicht
// ausrüstbar), AT/PA bzw. AT sind hier reine Anzeigewerte ohne Verschleiß (trait-Items haben kein structure-Feld).
function traitMeleeRow(t) {
  return el("div", { class: "row weapon-row" }, [
    el("img", { src: t.img || A.combatSkill, alt: "" }),
    weaponNameCell(t.name, "Angeboren"),
    el("span", { class: "center" }, [combatDie(t.at, "d20mu", `Attacke mit ${t.name} würfeln`)]),
    el("span", { class: "center" }, t.pa !== undefined ? [combatDie(t.pa, "d20in", `Parade mit ${t.name} würfeln`)] : "–"),
    el("span", { class: "center" }, [damageBtn(t.tp, t.name)]),
    weaponReachCell(t.reach || "kurz"),
    el("span", {}),
    el("span", {}),
  ]);
}

function traitRangedRow(t) {
  return el("div", { class: "row weapon-row" }, [
    el("img", { src: t.img || A.combatSkill, alt: "" }),
    weaponNameCell(t.name, "Angeboren"),
    el("span", { class: "center", style: "grid-column:span 2" }, [combatDie(t.at, "d20mu", `Fernkampf mit ${t.name} würfeln`)]),
    el("span", { class: "center" }, [damageBtn(t.tp, t.name)]),
    weaponReachCell(t.reach),
    el("span", {}),
    el("span", {}),
  ]);
}

// Je eine Nah-/Fernkampfwaffen-Zeile — eigene Funktionen statt Inline-Map (Nah-/Fernkampf-Panel, Traits daneben).
function meleeRow(w) {
  const stats = effectiveMeleeStats(w);
  return el("div", { class: "row weapon-row" }, [
    itemIcon(w.img, "", w.structure, "meleeweapon"),
    weaponNameCell(w.name, w.group),
    el("span", { class: "center" }, [combatDie(stats.at, "d20mu", `Attacke mit ${w.name} würfeln`)]),
    el("span", { class: "center" }, [combatDie(stats.pa, "d20in", `Parade mit ${w.name} würfeln`)]),
    el("span", { class: "center" }, [damageBtn(w.tp, w.name)]),
    weaponReachCell(w.reach),
    gripCell(w),
    favStar(w),
  ]);
}

function rangedRow(w) {
  const stats = effectiveRangedStats(w);
  return el("div", { class: "row weapon-row" }, [
    itemIcon(w.img, "", w.structure, "rangeweapon"),
    weaponNameCell(w.name, w.group),
    // FK spannt über AT+PA-Spaltenbreite (Fernkampf hat keine Parade), damit der Wert mittig zwischen AT und PA
    // der Nahkampftabelle sitzt statt an der AT-Position zu kleben.
    el("span", { class: "center", style: "grid-column:span 2" }, [combatDie(stats.at, "d20mu", `Fernkampf mit ${w.name} würfeln`)]),
    el("span", { class: "center" }, [damageBtn(w.tp, w.name)]),
    weaponReachCell(w.reach),
    gripCell(w),
    favStar(w),
    weaponDetails(w),
  ]);
}

// Vier Schnellwurf-Buttons (Ausweichen/Waffenloser Angriff/Waffenlose Verteidigung/Sturzschaden), siehe COMBAT_ACTIONS.
function renderCombatActions() {
  return el("div", { class: "actions-row" }, COMBAT_ACTIONS.map((a) =>
    el("button", { type: "button" }, [
      a.img ? el("img", { src: a.img, alt: "" }) : el("span", { class: "glyph" }, a.glyph),
      el("span", {}, a.value !== undefined ? `${a.label} (${a.value})` : a.label),
    ])
  ));
}

// Rüstung als Ausrüstungsreihe (Nutzerentscheidung 2026-09-19 nach Drei-Konzepte-Vergleich, siehe Git-Historie
// "UI-Vergleich 2026-09-17, Runde 3": Nutzerfeedback nach A–E war "von vorne beginnen", A–E waren letztlich alle
// Reskins derselben Grundidee — ein Bild + aufgelegte Werte für das ERSTE Rüstungsteil. Zur Wahl standen drei
// genuin unterschiedliche Vorbilder: "Verteidigung" (Rüstung + Ausweichen/Initiative in einem Panel, wie die
// Rüstungsklasse in D&D Beyond/Roll20), "Ausrüstungsreihe" (Diablo/WoW-artige Slot-Reihe, hier gewählt) und
// "Schutzsiegel" (Gesamtschutz als rundes Gold-Siegel). Diablo/WoW-artige Ausrüstungs-Slot-Reihe — Wiederverwendung
// des im Modul bereits etablierten Slot-Musters (.companion-slot, companionHotbar()) statt einer Sonderkachel für
// nur das erste Teil; jedes getragene Rüstungsteil ein gleichwertiger Icon-Slot mit RS/BE direkt sichtbar darunter
// (nicht erst per Hover), wächst/schrumpft einfach mit der Stückzahl über flex-wrap.

// Gesamtschutz (siehe MAGIC_ARMOR-Kommentar bei ARMOR in data.js): Summe aller getragenen, bereits
// verschleiß-bereinigten Rüstungsteile plus separat ausgewiesene magische Boni, exakt wie actor-combat.hbs:158
// ("protection ({{prepare.armorSum}}...)").
function computeArmorSum() {
  const sum = ARMOR.reduce((s, a) => s + effectiveArmor(a).rs, 0);
  const magicParts = [];
  if (MAGIC_ARMOR.spell) magicParts.push(`+${MAGIC_ARMOR.spell} Zauber`);
  if (MAGIC_ARMOR.liturgy) magicParts.push(`+${MAGIC_ARMOR.liturgy} Liturgie`);
  return { sum, magicParts };
}

function armorSumText({ sum, magicParts }) {
  return `Schutz gesamt ${sum}${magicParts.length ? ` (${magicParts.join(", ")})` : ""}`;
}

// Angeborene Rüstung (TRAITS.armor, z.B. Naturpanzer bei Verwandlungen) ist unabhängig von der Darstellung immer
// als einfache Zeile zu sehen.
function armorTraitRows() {
  return TRAITS.armor.map((t) =>
    el("div", { class: "row armor-row" }, [
      el("img", { src: t.img || A.armor, alt: "" }),
      el("span", { class: "left" }, t.name),
      el("span", { class: "big center" }, String(t.at)),
      el("span", { class: "muted center" }, "–"),
    ])
  );
}

// Rüstung bleibt neben den Kampfwerten stehen (siehe .combat-top in renderCombatMain()). Jedes getragene
// Rüstungsteil ein gleichwertiger Icon-Slot statt einer Sonderkachel nur fürs erste Teil, RS/BE direkt sichtbar
// darunter (nicht erst per Hover).
function renderArmorPanel() {
  const armorSum = computeArmorSum();
  // Bild füllt die ganze Kachel, Name oben zentriert (Lesbarkeits-Gradient), RS/BE als Badges unten
  // links/rechts über dem Bild statt als Textzeile darunter (Nutzer-Feedback 2026-09-18).
  const slots = ARMOR.map((a) => {
    const stats = effectiveArmor(a);
    return el("div", { class: "armor-slot" }, [
      itemIcon(A.armor, a.name, a.structure, "armor"),
      el("span", { class: "armor-slot-name" }, a.name),
      onUseBtn(a.name),
      el("span", { class: "armor-slot-rs" }, `RS ${stats.rs}`),
      el("span", { class: "armor-slot-be" }, `BE ${stats.be}`),
    ]);
  });
  return el("div", { class: "panel" }, [
    el("div", { class: "panel-title" }, "Rüstung"),
    el("div", { class: "armor-sum-line" }, armorSumText(armorSum)),
    el("div", { class: "armor-slots" }, slots.length ? slots : [el("div", { class: "armor-empty" }, "Keine Rüstung getragen")]),
    ...armorTraitRows(),
  ]);
}

// Reiter "Körper" (GitHub-Issue #6, Vorbild DSA4-Heldenbogen; Nutzerwunsch 2026-09-25: als eigener Reiter
// weiterentwickeln). Figur aus dem Artenbild des Helden, links die getragenen Rüstungsteile, rechts die beiden
// Hände. DSA5 kennt ohne Trefferzonen-Regel keine Körperzonen für Rüstungen — die Teile stehen deshalb als Liste
// neben der Figur, der Gesamtschutz liegt auf der Brust. Die Hand-Slots zeigen die Einschränkung aus dem Issue:
// pro Hand genau eine der ausgerüsteten Waffen; eine beidhändige Waffe belegt beide Hände. Nur Entwurf im
// Click-Dummy — im Modul liefe die Wahl über die Hand-Logik des Systems (equipWeaponToHand/swapWeaponHandSlot).
const HANDS = { main: null, off: null };

// Hände nebeneinander, TP-Knopf und Auswahl untereinander unter der Kachel (Variante B, Nutzer-Entscheidung
// 2026-09-30 nach Vergleich mit "untereinander" und "Knöpfe rechts"). Führt die Haupthand eine beidhändige Waffe,
// entfällt die Nebenhand ganz.

// Figur hinter Rüstung/Händen: Platzhalter (Artenbild) oder das Akteur-Porträt (Rückmeldung 2026-09-30).
// Umschalter nur im Bearbeiten-Modus; im Modul ein Actor-Flag, das Bild ist document.img. Der Click-Dummy hat kein
// echtes Ganzkörper-Porträt — dort steht stellvertretend das Menschen-Artenbild.
let BODY_FIGURE = "species";

function handWeapons() {
  return [...MELEE, ...RANGED].filter((w) => w.worn);
}

function initHands() {
  const worn = handWeapons();
  HANDS.main = worn.find((w) => !w.worn.offHand) || null;
  HANDS.off = HANDS.main && HANDS.main.worn.requiresBothHands ? null : worn.find((w) => w.worn.offHand && w !== HANDS.main) || null;
}

function handSlot(hand) {
  const isMain = hand === "main";
  const w = HANDS[hand];
  const select = el("select", { class: "val-select-input hand-select", "aria-label": isMain ? "Waffe in der Haupthand" : "Waffe in der Nebenhand" }, [
    el("option", { value: "" }, "— frei —"),
    ...handWeapons()
      .filter((x) => isMain || !x.worn.requiresBothHands)
      .map((x, i) => {
        const opt = el("option", { value: String(i) }, x.name + (x.worn.requiresBothHands ? " (beidhändig)" : ""));
        if (x === w) opt.selected = true;
        return opt;
      }),
  ]);
  const options = handWeapons().filter((x) => isMain || !x.worn.requiresBothHands);
  select.addEventListener("change", () => {
    const pick = select.value === "" ? null : options[Number(select.value)];
    HANDS[hand] = pick;
    const other = isMain ? "off" : "main";
    if (pick && HANDS[other] === pick) HANDS[other] = null;
    if (isMain && pick && pick.worn.requiresBothHands) HANDS.off = null;
    renderContent();
  });
  // Hand als Kachel im Stil der Rüstungskacheln (Nutzerwunsch 2026-09-28): Waffenbild füllt die Kachel, AT/PA bzw.
  // FK als Würfel auf der Unterkante (ragen heraus, damit der Hover-Zoom nicht abgeschnitten wird), gefasst wie die
  // Eigenschaftswürfel im Kopf (dunkle Fassung mit Goldrand, Rückmeldung 2026-09-30). Name groß ÜBER der Kachel,
  // TP-Knopf und Auswahl darunter.
  let tile;
  if (!w) tile = el("div", { class: "hand-tile empty" }, [el("span", { class: "hand-tile-note" }, "frei")]);
  let tp = null;
  if (w) {
    const ranged = RANGED.includes(w);
    const stats = ranged ? effectiveRangedStats(w) : effectiveMeleeStats(w);
    tile = el("div", { class: "hand-tile" }, [
      itemIcon(w.img, "", w.structure, ranged ? "rangeweapon" : "meleeweapon"),
      onUseBtn(w.name),
      el("span", { class: "hand-tile-at die-seal" }, [combatDie(stats.at, "d20mu", `${ranged ? "Fernkampf" : "Attacke"} mit ${w.name} würfeln`)]),
      !ranged && stats.pa !== undefined ? el("span", { class: "hand-tile-pa die-seal" }, [combatDie(stats.pa, "d20in", `Parade mit ${w.name} würfeln`)]) : null,
    ]);
    tp = damageBtn(w.tp, w.name);
    // Fernkampf: Nachladen/Zielen/Magazin wie in der Waffenzeile der Übersicht (reloadWidget() usw.) unter dem
    // TP-Knopf (Vorschlag 2026-09-30, AUFGABEN.md). Nachladen und Zielen nebeneinander, solange die Spalte reicht
    // (Live-Rückmeldung 2026-09-30: spart Höhe), Magazin in eigener Zeile. Modul: .dsa5h-hand-ranged in body.hbs.
    if (ranged) {
      const extras = [w.reloadTime ? reloadWidget(w) : null, aimWidget(w), magWidget(w)].filter(Boolean);
      if (extras.length) tp = el("div", { class: "hand-ranged" }, [tp, el("div", { class: "hand-ranged-extras" }, extras)]);
    }
  }
  // Freie Nebenhand kompakt unter der Haupthand (Vorschlag 2026-09-30, Rückmeldung: nicht daneben, das schob die
  // Haupthand nach rechts): kleine gestrichelte Kachel „+“, die selbst die Auswahlliste ist (unsichtbares <select>
  // darüber), daneben „Nebenhand · frei“. Modul: body.hbs (.dsa5h-hand-free).
  if (!isMain && !w) {
    select.classList.add("hand-free-select");
    return el("div", { class: "hand-slot hand-slot-free" }, [
      el("div", { class: "hand-tile empty compact", title: "Nebenhand frei — Waffe wählen" }, [el("span", { class: "hand-tile-note", "aria-hidden": "true" }, "+"), select]),
      el("span", { class: "hand-free-text" }, [el("small", { class: "figure-col-title" }, "Nebenhand"), el("small", { class: "hand-free-note" }, "frei")]),
    ]);
  }
  return el("div", { class: "hand-slot" }, [
    el("small", { class: "figure-col-title" }, isMain ? "Haupthand" : "Nebenhand"),
    el("span", { class: "body-item-name" }, w ? w.name : "—"),
    w ? combatSkillLink(w.group) : null,
    el("div", { class: "hand-slot-body" }, [tile, el("div", { class: "hand-slot-side" }, [tp, select])]),
  ]);
}

// Zauber-/Liturgieliste als Dialog direkt aus dem Reiter "Körper" (Nutzer-Feedback 2026-09-28): im Kampf würfeln,
// ohne auf Magie/Religion zu wechseln. Zeile = Bild | Name | Probe (würfelbar) | FW | Kosten. Gegliedert nach
// Zauber/Rituale/Zaubertricks bzw. Liturgien/Zeremonien/Segnungen (Nutzer-Feedback 2026-09-30: Rituale, Zeremonien,
// Tricks und Segnungen fehlten). Tricks/Segnungen haben keine Probe und kosten 1 AsP/KaP — Knopf „wirken“ statt Würfel.
function openCastListModal(kind) {
  const isSpell = kind === "spell";
  const energy = isSpell ? "AsP" : "KaP";
  const sections = isSpell
    ? [["Zauber", SPELLS], ["Rituale", RITUALS]]
    : [["Liturgien", LITURGIES], ["Zeremonien", CEREMONIES]];
  const [cantripLabel, cantrips, cantripImg] = isSpell ? ["Zaubertricks", TRICKS, A.spellTrick] : ["Segnungen", BLESSINGS, A.blessing];
  const title = isSpell ? "Zauber, Rituale & Zaubertricks" : "Liturgien, Zeremonien & Segnungen";
  const closeBtn = el("button", { type: "button", class: "modal-close" }, "✕");
  closeBtn.addEventListener("click", closeModal);
  const castRow = (it) =>
    el("div", { class: "row cast-row" }, [
      el("img", { src: it.img, alt: "" }),
      el("span", { class: "left" }, it.name),
      probeDice(it.probe, it.name),
      el("span", { class: "center" }, String(it.fw)),
      el("span", { class: "center muted" }, String(it.cost)),
    ]);
  const cantripRow = (name) =>
    el("div", { class: "row cast-row" }, [
      el("img", { src: cantripImg, alt: "" }),
      el("span", { class: "left" }, name),
      makeRollable(el("span", { class: "cast-auto" }, isSpell ? "wirken" : "spenden"), `${name} ${isSpell ? "wirken" : "spenden"}`),
      el("span", { class: "center muted" }, "–"),
      el("span", { class: "center muted" }, "1"),
    ]);
  // Wie in Foundry: eine Probe (oder „wirken“/„spenden“) schließt den Dialog, damit das Probenfenster frei liegt
  // (Rückmeldung 2026-09-30). Capture-Phase, weil makeRollable() die Ausbreitung stoppt.
  const modalBox = el("div", { class: "panel cast-modal" }, [
      el("div", { class: "panel-title flex" }, [el("span", {}, title), closeBtn]),
      el("div", { class: "row-head cast-row" }, head("", "Name", "Probe", "FW", energy)),
      ...sections.filter(([, list]) => list.length).flatMap(([label, list]) => [el("div", { class: "subhead" }, label), ...list.map(castRow)]),
      ...(cantrips.length ? [el("div", { class: "subhead" }, cantripLabel), ...cantrips.map(cantripRow)] : []),
    ]);
  const closeOnRoll = (e) => { if (e.target.closest(".rollable") && (e.type === "click" || e.key === "Enter" || e.key === " ")) setTimeout(closeModal); };
  modalBox.addEventListener("click", closeOnRoll, true);
  modalBox.addEventListener("keydown", closeOnRoll, true);
  openModal(modalBox, { label: title });
}

function renderBody() {
  if (!HANDS.ready) {
    initHands();
    HANDS.ready = true;
  }
  const armorSum = computeArmorSum();
  const be = ARMOR.reduce((t, a) => t + effectiveArmor(a).be, 0);
  const inHands = [HANDS.main, HANDS.off].filter(Boolean);
  const twoHanded = !!(HANDS.main && HANDS.main.worn.requiresBothHands);
  const others = handWeapons().filter((w) => !inHands.includes(w));
  const stat = (label, value) => el("span", { class: "combat-stat" }, [el("small", {}, label), el("strong", {}, String(value))]);
  const editMode = document.querySelector(".sheet").getAttribute("data-mode") === "edit";
  const figureSrc = BODY_FIGURE === "portrait" ? A.speciesFigure("Mensch") : A.speciesFigure(IDENTITY.species.name);
  const segmented = (options, current, onPick, cls, label) =>
    el("div", { class: "body-seg " + cls, role: "group", "aria-label": label }, options.map(([value, text]) => {
      const b = el("button", { type: "button", class: value === current ? "active" : "", "aria-pressed": String(value === current) }, text);
      b.addEventListener("click", () => onPick(value));
      return b;
    }));
  const figureSwitch = editMode
    ? segmented([["species", "Platzhalter"], ["portrait", "Akteur-Porträt"]], BODY_FIGURE, (v) => { BODY_FIGURE = v; renderContent(); }, "body-figure-switch", "Figur im Hintergrund")
    : null;
  // Rüstung als große Kacheln wie im Rüstungs-Panel (Bild füllt die Kachel, RS/BE unten links/rechts) — Nutzer-
  // Feedback 2026-09-28: "Rüstung sollte größer dargestellt werden".
  const armorTiles = ARMOR.map((a) => {
    const st = effectiveArmor(a);
    // Name groß über der Kachel statt klein im Bild (Nutzer-Feedback 2026-09-30).
    return el("div", { class: "body-armor-item" }, [
      el("span", { class: "body-item-name", title: a.name }, a.name),
      el("div", { class: "armor-slot" }, [
        itemIcon(A.armor, a.name, a.structure, "armor"),
        onUseBtn(a.name),
        el("span", { class: "armor-slot-rs" }, `RS ${st.rs}`),
        el("span", { class: "armor-slot-be" }, `BE ${st.be}`),
      ]),
    ]);
  });
  // Ab drei Rüstungsteilen Tabelle statt Kacheln (Bild | Name | RS | BE), Namen einzeilig mit „…“ (Rückmeldung 2026-09-30).
  const armorTable = ARMOR.length >= 3;
  const armorTableEl = el("table", { class: "body-armor-table" }, [
    el("colgroup", {}, [el("col", { class: "col-img" }), el("col"), el("col", { class: "col-val" }), el("col", { class: "col-val" })]),
    el("thead", {}, [el("tr", {}, [el("th", { colspan: "2" }, "Name"), el("th", { title: "Rüstungsschutz" }, "RS"), el("th", { title: "Belastung" }, "BE")])]),
    el("tbody", {}, ARMOR.map((a) => {
      const st = effectiveArmor(a);
      return el("tr", {}, [
        el("td", { class: "body-armor-img" }, [el("img", { src: A.armor, alt: "" })]),
        el("td", { class: "body-armor-name", title: a.name }, [
          onUseBtn(a.name),
          el("span", {}, a.name),
          a.structure ? el("meter", { min: "0", max: String(a.structure.max), value: String(a.structure.value) }) : null,
        ]),
        el("td", {}, String(st.rs)),
        el("td", {}, String(st.be)),
      ]);
    })),
  ]);
  // Zauber/Liturgien nur für Figuren mit AsP/KaP (hier: nicht im "Nur LeP"-Test) — im Modul magic.hasSpells/hasPrayers.
  const castButtons = ONLY_LEP
    ? []
    : [
        ["spell", "Zauber", "✦"],
        ["liturgy", "Liturgien", "☀"],
      ].map(([kind, label, glyph]) => {
        const btn = el("button", { type: "button", class: "cast-btn" }, [el("span", { "aria-hidden": "true" }, glyph), `${label} …`]);
        btn.addEventListener("click", () => openCastListModal(kind));
        return btn;
      });
  return el("div", {}, [
    el("div", { class: "panel body-panel" }, [
      el("div", { class: "panel-title flex" }, [el("span", {}, "Ausrüstung am Körper"), castButtons.length ? el("span", { class: "cast-btns" }, castButtons) : null]),
      // Komplettes Artenbild als Hintergrund der ganzen Fläche (statt ausgeschnittener, geschwärzter Silhouette —
      // Nutzer-Feedback 2026-09-28), abgeblendet; Rüstung links, Hände rechts, Gesamtschutz in der Mitte.
      // Figur als echtes <img> (nicht url() in einer CSS-Variable — die löst Chrome gegen den Stylesheet-Pfad auf,
      // in Foundry blieb die Figur deshalb leer, 2026-09-30).
      el("div", { class: "body-grid" + (armorTable ? " armor-table" : ""), "data-figure": BODY_FIGURE }, [
        el("img", { class: "body-figure", src: figureSrc, alt: "", "aria-hidden": "true" }),
        figureSwitch,
        el("div", { class: "figure-armor" }, [
          el("small", { class: "figure-col-title" }, "Rüstung"),
          armorTable ? armorTableEl : ARMOR.length ? el("div", { class: "armor-slots" }, armorTiles) : el("div", { class: "muted" }, "Keine Rüstung getragen"),
        ]),
        // Plakette absolut über der Mitte der ganzen Fläche (nicht der mittleren Spalte), damit sie über der Figur
        // zentriert bleibt, auch wenn Rüstungs- und Händespalte verschieden breit sind (Rückmeldung 2026-09-30).
        el("div", { class: "figure-body" }),
        el("span", { class: "figure-badge" }, [el("strong", {}, `RS ${armorSum.sum}`), el("small", {}, `BE ${be}`)]),
        twoHanded
          ? el("div", { class: "figure-hands single" }, [handSlot("main")])
          : el("div", { class: "figure-hands" + (HANDS.off ? "" : " off-free") }, [handSlot("main"), handSlot("off")]),
      ]),
      // Die vier Schnellwürfe wie in der Übersicht (Rückmeldung 2026-09-30); Ausweichen steht dort mit Wert, daher
      // nicht mehr zusätzlich in der Wertezeile.
      el("div", { class: "body-actions" }, [renderCombatActions()]),
      el("div", { class: "figure-stats" }, [
        stat("Initiative", COMBAT_DERIVED[1].max),
        stat("Schutz gesamt", armorSumText(armorSum).replace("Schutz gesamt ", "")),
        stat("Belastung", be),
      ]),
      others.length
        ? el("div", { class: "body-others" }, [el("small", { class: "muted" }, "Ausgerüstet, aber nicht in der Hand:"), ...others.map((w) => el("span", { class: "chip" }, [el("img", { src: w.img, alt: "" }), w.name]))])
        : null,
    ]),
    // Kampfsonderfertigkeiten auch hier, damit im Kampf alles auf einer Seite steht (Nutzer-Feedback 2026-09-30).
    specialsBlock("Kampfsonderfertigkeiten", COMBAT_SPECIALS),
  ]);
}

// Kampf-Unterreiter: Schnellwürfe, Kampfwerte + Rüstung, darunter die Waffentabellen (WAFFEN-TAB.md).
function renderCombatMain() {
  // Ausweichen/Initiative sind vom Eigenschaften-Tab hierher gewandert (EIGENSCHAFTEN-TAB.md: "Sollen auf den Kampf Tab wandern").
  const combatValuesPanel = () =>
    el("div", { class: "panel" }, [
      el("div", { class: "panel-title" }, "Kampfwerte"),
      el("div", { class: "row-head simple-row" }, head("", "Basis", "Mod", "Max")),
      ...COMBAT_DERIVED.map(buildSimpleRow),
    ]);

  // AT/PA (Nahkampf) und FK (Fernkampf) sowie TP stehen bewusst als letzte Spalten in beiden Tabellen, mit exakt
  // derselben Gesamtbreite (siehe .weapon-row in style.css) — so liegen die beiden "Aktionen" (Angriffs-
  // würfel + Schadenswert) beim Scannen durch Nah- und Fernkampfwaffen immer an derselben Bildschirmposition,
  // unabhängig davon, was in den Spalten davor steht (Technik/Reichweite bzw. Munition).
  const meleePanel = el("div", { class: "panel" }, [
    combatPanelTitle("Nahkampfwaffen", [ignoreHandLimitsBtn(), equipMenuBtn("melee")]),
    el("div", { class: "row-head weapon-row" }, head("", "Waffe", "AT", "PA", "TP", "RW", "Griff", "")),
    ...MELEE.map(meleeRow),
    ...TRAITS.meleeAttack.map(traitMeleeRow),
  ]);

  const rangedPanel = el("div", { class: "panel" }, [
    combatPanelTitle("Fernkampfwaffen", [ignoreHandLimitsBtn(), equipMenuBtn("ranged")]),
    el("div", { class: "row-head weapon-row" }, [
      ...head("", "Waffe"),
      el("span", { class: "center", style: "grid-column:span 2" }, "FK"),
      ...head("TP", "RW", "Griff", ""),
    ]),
    ...RANGED.map(rangedRow),
    ...TRAITS.rangeAttack.map(traitRangedRow),
  ]);

  // Kampfwerte + Rüstung als zwei Panels (Nutzer-Entscheidung 2026-09-28 gegen die kompakte "Leiste"); die
  // Silhouette (Issue #6) ist der eigene Reiter "Körper" (renderBody()).
  const topArea = el("div", { class: "combat-top" }, [combatValuesPanel(), renderArmorPanel()]);

  return el("div", {}, [
    renderCombatActions(),
    topArea,
    meleePanel,
    rangedPanel,
    specialsBlock("Kampfsonderfertigkeiten", COMBAT_SPECIALS),
  ]);
}

// Kampftalente-Unterreiter: die Kampftechniken einfach abgebildet (WAFFEN-TAB.md), aufgeteilt nach Waffentyp
// (im System "weapontype") in Nah- und Fernkampf — anhand PA "—" erkennbar, da Fernkampftechniken keine Parade haben.
// FW ist wie bei Talenten direkt editierbar UND per AP-gekoppeltem Stepper steigerbar (c.stf, echt aus dem
// Kompendium, siehe COMBAT_SKILLS-Kommentar in data.js); advanceMin 6, da Kampftechniken im System nie unter
// ihren ungeübten Basiswert 6 sinken (combatskill.js: get advanceMin() { return 6; }).
// Suche wie bei den Talenten (Nutzer-Feedback 2026-09-28) — filtert die Zeilen direkt im DOM statt neu zu
// rendern, damit der Fokus im Suchfeld bleibt; Modul: .combatSkillSearch/_applyCombatSkillSearch().
let combatSkillQuery = "";

function applyCombatSkillFilter(root) {
  const q = combatSkillQuery.trim().toLowerCase();
  root.querySelectorAll(".row.combatskill-row").forEach((row) => {
    const name = row.querySelector(".cs-name")?.textContent.toLowerCase() || "";
    row.hidden = !!q && !name.includes(q);
  });
}

function renderCombatSkills() {
  const mode = document.querySelector(".sheet").getAttribute("data-mode");
  const combatSkillsPanel = (title, list) =>
    el("div", { class: "panel" }, [
      el("div", { class: "panel-title" }, title),
      // Leiteigenschaft klein unter dem Namen statt eigener Spalte, wie die Technik unter dem Waffennamen — lange
      // Namen liefen sonst in die Leit.-Spalte (Nutzer-Entscheidung 2026-09-30). Modul: combat.hbs.
      el("div", { class: "row-head combatskill-row" }, head("", "Technik", "FW", "AT", "PA")),
      ...list.map((c) => {
        const [minus, plus] = advanceStepper(() => c.fw, (v) => { c.fw = v; }, c.stf, 6, () => { renderContent(); renderHeader(); }, c.name);
        const fwSpan = el("span", { class: "big val-editable" }, String(c.fw));
        if (mode === "edit") makeEditable(fwSpan, c.fw, (v) => { c.fw = Math.max(6, v); renderContent(); renderHeader(); }, { type: "number", min: 6, max: 99 });
        return el("div", { class: "row combatskill-row" }, [
          el("img", { src: A.combatSkill, alt: "" }),
          el("span", { class: "left weapon-name" }, [el("span", { class: "cs-name" }, c.name), el("small", { class: "weapon-sub", title: "Leiteigenschaft" }, c.guide)]),
          el("span", { class: "skill-fw" }, [minus, fwSpan, plus]),
          el("span", { class: "muted center" }, String(c.at)),
          el("span", { class: "muted center" }, String(c.pa)),
        ]);
      }),
    ]);

  const meleeSkills = COMBAT_SKILLS.filter((c) => c.pa !== "—");
  const rangedSkills = COMBAT_SKILLS.filter((c) => c.pa === "—");

  const search = el("input", { type: "search", class: "combat-skill-search", placeholder: "Kampftechniken suchen …", "aria-label": "Kampftechniken suchen", value: combatSkillQuery });
  search.addEventListener("input", () => { combatSkillQuery = search.value; applyCombatSkillFilter(wrap); });
  const wrap = el("div", {}, [el("div", { class: "search-bar" }, [search]), el("div", { class: "grid-2" }, [
    combatSkillsPanel("Nahkampftechniken", meleeSkills),
    combatSkillsPanel("Fernkampftechniken", rangedSkills),
  ])]);
  applyCombatSkillFilter(wrap);
  return wrap;
}

function renderCombat() {
  // "Körper" als Unterreiter (Nutzerwunsch 2026-09-28) — ob er die Übersicht ablöst, entscheidet der Nutzer später.
  if (currentCombatSection === "koerper") return renderBody();
  return currentCombatSection === "kampftalente" ? renderCombatSkills() : renderCombatMain();
}

// Erweiterungen-Icon (spell-section.hbs: item.extensions → Overlay-Icon mit Tooltip) und Mehrrunden-Auflade-
// Anzeige (item.LZ/item.progress, "showCharge"-Balken) — siehe SPELLS/LITURGIES/CEREMONIES-Kommentar in data.js.
// Statt des runden Conic-Gradient-Balkens aus dem System wird hier der schon vorhandene lineare Fill-Balken
// (wie structure-bar bei Waffen) wiederverwendet, das ist optisch konsistenter mit dem Rest des Bogens.
function advanceCharge(item) {
  item.progress = Math.min(item.LZ, (item.progress || 0) + 1);
  renderContent();
}

function magicIcon(item) {
  if (!item.extensions && !(item.LZ > 1)) return el("img", { src: item.img, alt: "" });
  const charging = item.LZ > 1 && item.progress < item.LZ;
  const wrap = el("div", { class: "magic-icon" }, [
    el("img", { src: item.img, alt: "" }),
    item.extensions ? el("span", { class: "ext-badge", role: "img", tabindex: "0", title: `Zaubererweiterung gelernt: ${item.extensions}`, "aria-label": `Zaubererweiterung gelernt: ${item.extensions}` }, "✦") : null,
    item.LZ > 1
      ? (() => {
          const pct = Math.min(100, (item.progress / item.LZ) * 100);
          const bar = el(
            "span",
            { class: "charge-bar" + (charging ? "" : " done"), title: charging ? `Aufladen ${item.progress}/${item.LZ}` : "Bereit" },
            [el("span", { class: "charge-fill", style: `width:${pct}%` })]
          );
          if (charging) bar.addEventListener("click", (e) => { e.stopPropagation(); advanceCharge(item); });
          return bar;
        })()
      : null,
  ]);
  return wrap;
}

// Zeilen-Lösch-"×" für Tabellenzeilen (magicTable/artifactTable) — analog zu deletableChip(), aber für ganze
// Grid-Zeilen statt Chips: `list` ist die Original-Array-Referenz, `item` der zu löschende Eintrag.
function rowDeleteBtn(list, item) {
  const label = `${item.name || "Eintrag"} löschen`;
  const btn = el("button", { type: "button", class: "row-delete edit-only", title: label, "aria-label": label }, "×");
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const idx = list.indexOf(item);
    if (idx !== -1) list.splice(idx, 1);
    renderContent();
  });
  return btn;
}

// Duplizieren (itemContextMenu → _getItemContextOptions() "SHEET.DuplicateItem", actor-sheet.js:1500-1503) — von
// den generischen Kontextmenü-Aktionen (Bearbeiten/Duplizieren/An Chat senden/Löschen) auf Zauber-/Liturgien-Zeilen
// (spell-section.hbs:65-67) ist nur Duplizieren ohne echtes Foundry-Item sinnvoll nachbaubar: "Bearbeiten" deckt
// unser Bogen schon per Inline-Editing der einzelnen Felder ab (kein zweiter Dialog nötig), "An Chat senden"
// braucht einen Chatlog, den es im Click-Dummy nicht gibt. Fügt eine tiefe Kopie direkt hinter dem Original ein.
function duplicateBtn(list, item) {
  const btn = el("button", { type: "button", class: "row-delete edit-only", title: "Duplizieren" }, "⧉");
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const idx = list.indexOf(item);
    if (idx === -1) return;
    list.splice(idx + 1, 0, JSON.parse(JSON.stringify(item)));
    renderContent();
  });
  return btn;
}

function rowActionsCell(list, item, lead = null) {
  return el("span", { class: "row-actions-cell" }, [lead, duplicateBtn(list, item), rowDeleteBtn(list, item)]);
}

// Gemeinsame Zeile/Tabelle für Zauber/Rituale/Liturgien/Zeremonien — im System (spell-section.hbs) identische
// Spalten für alle vier Proben-Listen: Bild/Name/Probe/FW(+/-)/Kosten/Wirkungsdauer/Reichweite. FW direkt
// editierbar UND per AP-gekoppeltem Stepper steigerbar (item.stf, echt aus dem Kompendium bzw. den vorgefertigten
// Akteuren der dsa5-magic-*-Module ausgelesen, siehe SPELLS-Kommentar in data.js), analog zu Talenten/Kampftalenten.
function magicRow(item, list) {
  const mode = document.querySelector(".sheet").getAttribute("data-mode");
  const [minus, plus] = advanceStepper(() => item.fw, (v) => { item.fw = v; }, item.stf, 0, () => { renderContent(); renderHeader(); }, item.name);
  const fwSpan = el("span", { class: "big val-editable" }, String(item.fw));
  if (mode === "edit") makeEditable(fwSpan, item.fw, (v) => { item.fw = v; renderContent(); renderHeader(); }, { type: "number", min: 0, max: 99 });
  return el("div", { class: "row magic-row" }, [
    magicIcon(item),
    el("span", { class: "left" }, item.name),
    probeDice(item.probe, item.name),
    el("span", { class: "skill-fw" }, [minus, fwSpan, plus]),
    el("span", { class: "center" }, String(item.cost)),
    el("span", { class: "muted center" }, item.dauer),
    el("span", { class: "muted center" }, item.reach),
    favStar(item),
    rowActionsCell(list, item),
  ]);
}

function magicTable(title, items) {
  // Legende nur, wenn überhaupt ein Eintrag das ✦ trägt (UI/UX-Review 2026-09-25: Zeichen zugänglich erklären).
  const hasExt = items.some((it) => it.extensions);
  return el("div", { class: "panel" }, [
    el("div", { class: "panel-title" }, title),
    el("div", { class: "row-head magic-row" }, head("", "Name", "Probe", "FW", "Kosten", "Aktionsdauer", "Reichweite", "", "")),
    ...items.map((it) => magicRow(it, items)),
    hasExt ? el("div", { class: "table-legend" }, [el("span", { class: "ext-badge-inline", "aria-hidden": "true" }, "✦"), " = Zaubererweiterung gelernt (Zeichen antippen oder mit der Maus darauf zeigen für Details)"]) : null,
  ]);
}

// Traditionsgegenstände (Magie) / Kirchengeräte (Religion) — tradition-items.hbs: Name/Kategorie(/Ladung bei
// showVolume), Fähigkeiten je Gegenstand als Chips darunter. Löschbar (BEARBEITEN.md: "Traditionsartefakte
// löschbar" — dieselbe Funktion bedient auch die strukturell identischen Kirchengeräte auf Tab Religion).
// AsP-Kosten einer Traditionsgegenstand-/Kirchengerät-Fähigkeit bezahlen (siehe TRADITION_ARTIFACTS-Kommentar in
// data.js) — reduziert die Astralenergie-Ressource direkt, exakt wie actor.applyMana(cost, 'AsP') im System (dort
// unabhängig davon, ob es sich um ein magisches oder geweihtes Traditionsobjekt handelt, siehe Kommentar dort).
function payTraditionAbilityCost(ability) {
  const res = RESOURCES.find((r) => r.label === "Astralenergie");
  if (!res || res.wert < ability.cost) return;
  res.wert -= ability.cost;
  renderContent();
  renderHeader();
}

function artifactTable(title, items, showVolume) {
  return el("div", { class: "panel" }, [
    el("div", { class: "panel-title flex" }, [el("span", {}, title), specHelpBtn()]),
    el("div", { class: "row-head artifact-row" }, head("", "", "Kategorie", showVolume ? "Ladung" : "", "")),
    ...items.flatMap((it) => [
      el("div", { class: "row artifact-row" }, [
        el("img", { src: it.img, alt: "" }),
        el("span", { class: "left" }, it.name),
        el("span", { class: "muted center" }, it.category),
        el("span", { class: "center" }, showVolume ? it.volume : ""),
        rowDeleteBtn(items, it),
      ]),
      it.abilities
        ? el(
            "div",
            { class: "chips" },
            it.abilities.map((a) => {
              const res = RESOURCES.find((r) => r.label === "Astralenergie");
              const affordable = res && res.wert >= a.cost;
              const payBtn = el("button", { type: "button", class: "chip chip-pay" + (affordable ? "" : " disabled"), title: `${a.cost} AsP zahlen` }, `${a.name} (${a.cost} AsP)`);
              if (affordable) payBtn.addEventListener("click", () => payTraditionAbilityCost(a));
              else payBtn.disabled = true;
              const use = onUseBtn(a.name);
              return use ? el("span", { class: "chip-with-use" }, [payBtn, use]) : payBtn;
            })
          )
        : null,
    ]),
  ]);
}

// Wohlgefällige Talente (Religion-Tab, t.happyTalents nur bei RELIGION_TRADITION gesetzt): nach einem
// Drei-Varianten-Vergleich (2026-09-17) hat sich der Nutzer für "B · Einklappbar" entschieden (Umschalter +
// Varianten A "Textzeile"/C "Kachel" entfernt, siehe archive/DECISIONS.md) — genau wie im echten Modul
// (dsa5h-happy-talents-toggle in religion.hbs) standardmäßig auf eine einzeilige Andeutung mit Anzahl
// ("Wohlgefällige Talente (3)") eingeklappt, Klick blendet den vollen Text ein/aus. Im Bearbeiten-Modus immer
// aufgeklappt, damit das Feld dort ohne einen zusätzlichen Klick editierbar bleibt. happyTalentsExpanded ist
// eigener State (nicht Teil von RELIGION_TRADITION in data.js), da es reine Darstellungs-, keine
// Fachdaten-Information ist.
let happyTalentsExpanded = false;

function renderHappyTalentsCollapse(t) {
  const mode = document.querySelector(".sheet").getAttribute("data-mode");
  const expanded = happyTalentsExpanded || mode === "edit";
  const count = t.happyTalents.split(",").map((s) => s.trim()).filter(Boolean).length;
  const toggleBtn = el("button", { type: "button", class: "happy-talents-toggle", "aria-expanded": String(expanded) }, [
    el("span", { class: "happy-talents-caret" }, expanded ? "▾" : "▸"),
    el("span", {}, `Wohlgefällige Talente (${count})`),
  ]);
  toggleBtn.addEventListener("click", () => { happyTalentsExpanded = !happyTalentsExpanded; renderContent(); });
  if (!expanded) return el("div", { class: "trad-tiles-note happy-talents-note-collapsed" }, [toggleBtn]);
  const span = el("span", {}, t.happyTalents);
  if (mode === "edit") makeEditable(span, t.happyTalents, (v) => { t.happyTalents = v; renderContent(); }, { type: "text" });
  return el("div", { class: "trad-tiles-note happy-talents-note-collapsed" }, [toggleBtn, el("div", { class: "happy-talents-expanded" }, span)]);
}

// Traditions-Kopfleiste ganz oben auf Magie/Religion (2026-09-13, Nutzerwunsch: "ganz oben auf beiden Tabs" statt
// rechter Sidebar-Box). Nutzer hat sich nach Vergleich dreier Optiken für die Kachel-Variante entschieden
// (Umschalter/Alternativen entfernt) — vier gleich breite Spalten mit Trennlinien statt frei fließender,
// unterschiedlich breiter Blöcke, damit die Leiste die volle Panel-Breite ruhig ausfüllt statt löchrig zu wirken.
// Leiteigenschaft/Merkmal/Faktor sind im Bearbeiten-Modus direkt editierbar (BEARBEITEN.md); "Tradition" selbst
// ist dort NICHT gelistet und bleibt bewusst reine Anzeige. happyTalents ("Wohlgefällige Talente", nur bei
// RELIGION_TRADITION vorhanden) ebenfalls editierbar, siehe BEARBEITEN.md Tab-Religion-Zusatzpunkt und
// renderHappyTalentsCollapse()-Kommentar oben.
// "Wappen-Badge"-Layout — Nutzer-Entscheidung 2026-09-18 nach Vergleich dreier Ansätze im Click-Dummy (siehe
// STATUS.md): Tradition soll klar herausstechen, die drei Nebenwerte (Leiteigenschaft/Merkmal/Faktor) sollen
// zweitrangig wirken. Tradition jetzt als akzentfarbene Pille mit passendem System-Icon (kind "magic" →
// icons/traditionen, "religion" → icons/months — Freitextfeld, daher nur Teilstring-Match, siehe
// A.magicTraditionIcon/A.godIcon in assets-map.js), die drei Nebenwerte als schmale Schlüssel-Wert-Spalte
// daneben (.trad-tile-meta).
function traditionHeader(t, kind) {
  const mode = document.querySelector(".sheet").getAttribute("data-mode");
  const tile = (label, rawValue, valClass, field, key) => {
    const type = typeof rawValue === "number" ? "number" : "text";
    const valEl = el("div", { class: "trad-tile-val" + (valClass ? " " + valClass : "") }, String(rawValue));
    if (field && mode === "edit") {
      makeEditable(valEl, rawValue, (v) => { t[field] = v; renderContent(); }, { type, min: type === "number" ? 0 : undefined, max: type === "number" ? 99 : undefined });
    }
    return el("div", { class: "trad-tile" + (key ? " trad-tile-" + key : "") }, [el("div", { class: "trad-tile-label" }, label), valEl]);
  };
  const traditionTile = tile("Tradition", t.tradition, "trad-tile-val-name", null, "tradition");
  const iconSrc = kind === "religion" ? A.godIcon(t.tradition) : A.magicTraditionIcon(t.tradition);
  if (iconSrc) traditionTile.prepend(el("img", { class: "trad-tile-icon", src: iconSrc, alt: "" }));
  // Klick öffnet die Tradition (in Foundry: Sonderfertigkeit „Tradition (…)“ im DSA5-Item-Sheet) — hier nur Hinweis.
  traditionTile.setAttribute("role", "button");
  traditionTile.title = "Tradition öffnen";
  traditionTile.addEventListener("click", () => flashNotice(`📜 Sonderfertigkeit „Tradition (${t.tradition})“ würde geöffnet`));
  const metaTiles = el("div", { class: "trad-tile-meta" }, [
    tile("Leiteigenschaft", t.guidevalue, null, "guidevalue", "guidevalue"),
    tile("Merkmal", t.feature, null, "feature", "feature"),
    tile("Faktor", t.energyfactor, "accent", "energyfactor", "energyfactor"),
  ]);
  const happyTalentsBelow = t.happyTalents !== undefined ? renderHappyTalentsCollapse(t) : null;
  return el("div", { class: "trad-header" }, [
    el("div", { class: "trad-tiles-grid" }, [traditionTile, metaTiles]),
    happyTalentsBelow,
  ]);
}

// Unter-Tab "Zauber": Traditions-Kopfleiste → Proben-Tabellen → Zaubertricks (TODOS.md: direkt unter Rituale,
// vor den Sonderfertigkeiten) → Sonderfertigkeiten (Kategorie "magical"). Traditionsgegenstände/Magische
// Zeichen sind auf den zweiten Unter-Tab gewandert (renderMagicItems).
function renderMagicSpells() {
  return el("div", {}, [
    traditionHeader(MAGIC_TRADITION, "magic"),
    magicTable("Zauber", SPELLS),
    magicTable("Rituale", RITUALS),
    el("div", { class: "panel" }, [
      el("div", { class: "panel-title" }, "Zaubertricks"),
      el("div", { class: "chips" }, TRICKS.map((t) => deletableChip(A.spellTrick, t, TRICKS, t))),
    ]),
    specialsBlock("Sonderfertigkeiten (Magie)", MAGIC_SPECIALS),
    PATRONS.length ? el("div", { class: "panel" }, [
      el("div", { class: "panel-title" }, "Patron"),
      el("div", { class: "chips" }, PATRONS.map((p) => el("span", { class: "chip" }, p))),
    ]) : null,
  ]);
}

// Unter-Tab "Ausrüstung": Traditions-Kopfleiste → Traditionsgegenstände → Magische Zeichen.
function renderMagicItems() {
  return el("div", {}, [
    traditionHeader(MAGIC_TRADITION, "magic"),
    artifactTable("Traditionsgegenstände", TRADITION_ARTIFACTS, true),
    el("div", { class: "panel" }, [
      el("div", { class: "panel-title" }, "Magische Zeichen"),
      el("div", { class: "chips" }, MAGICAL_SIGNS.map((s) => el("span", { class: "chip" }, s))),
    ]),
  ]);
}

function renderMagic() {
  return currentMagicSection === "items" ? renderMagicItems() : renderMagicSpells();
}

// Unter-Tab "Liturgien": Traditions-Kopfleiste → Proben-Tabellen → Segnungen (TODOS.md: direkt unter
// Zeremonien, vor den Sonderfertigkeiten) → Sonderfertigkeiten (Kategorie "clerical").
function renderReligionLiturgies() {
  return el("div", {}, [
    traditionHeader(RELIGION_TRADITION, "religion"),
    magicTable("Liturgien", LITURGIES),
    magicTable("Zeremonien", CEREMONIES),
    el("div", { class: "panel" }, [
      el("div", { class: "panel-title" }, "Segnungen"),
      el("div", { class: "chips" }, BLESSINGS.map((b) => deletableChip(A.blessing, b, BLESSINGS, b))),
    ]),
    specialsBlock("Sonderfertigkeiten (Religion)", RELIGION_SPECIALS),
  ]);
}

// Unter-Tab "Ausrüstung": Traditions-Kopfleiste → Kirchengeräte. Kein Äquivalent zu "Magische Zeichen" bei
// Religion, daher hier nur ein Panel statt zwei wie bei renderMagicItems.
function renderReligionItems() {
  return el("div", {}, [traditionHeader(RELIGION_TRADITION, "religion"), artifactTable("Kirchengeräte", CEREMONIAL_ITEMS, false)]);
}

function renderReligion() {
  return currentReligionSection === "items" ? renderReligionItems() : renderReligionLiturgies();
}

// Nahkampfwaffen/Fernkampfwaffen/Rüstung tragen hier dieselben structure-Werte wie ihr Gegenstück in
// MELEE/RANGED/ARMOR (data.js) und zeigen daher denselben Verschleiß-Rahmen+Balken (itemIcon()/wearLevel())
// wie auf dem Kampf-Tab — bisher fehlte die Struktur-Anzeige auf der allgemeinen Ausrüstungsliste komplett.
// Ausrüsten-Zelle (Schild, equipToggle()) ist anklickbar (schaltet i.eq um, in BEIDEN Modi — BEARBEITEN.md "Ausrüstung ist
// ausrüstbar"); `list` (die Original-Array-Referenz) macht die Zeile zusätzlich löschbar (nur Bearbeiten-Modus,
// rowDeleteBtn()). Wird sowohl für die Kategorie-Tabellen als auch für Taschen-Inhalte (openBagModal) genutzt.
// Mengen-Schnelländerung (actor-sheet.js:1007-1013 _quantityClick() → RuleChaos.increment(): Linksklick +1,
// Rechtsklick −1, mit Strg jeweils ×10, nie unter 0) — wie gripCell/eqCell in BEIDEN Modi bedienbar, da eine
// laufende Bestandsänderung (Munition verbraucht, Beute aufgesammelt) keine Bearbeiten-Modus-Einstellung ist.
function quantityCell(item) {
  const span = el("span", { class: "center qty-click" }, String(item.qty));
  span.title = "Klick: +1 · Rechtsklick: −1 · mit Strg: ×10";
  span.addEventListener("click", (e) => {
    e.stopPropagation();
    item.qty = Math.max(0, item.qty + (e.ctrlKey ? 10 : 1));
    renderContent();
  });
  span.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    e.stopPropagation();
    item.qty = Math.max(0, item.qty - (e.ctrlKey ? 10 : 1));
    renderContent();
  });
  return span;
}

// Offenes Griff-Menü (Rechtsklick aufs Ausrüsten-Schild einer Waffe), siehe equipToggle().
let openGripMenu = null;

// Ausrüsten-Schalter als Schild (wie icon-equip.hbs im Foundry-Modul, Nutzerwahl 2026-09-24 statt ✓/–):
// blasser Umriss = nicht ausgerüstet, gefülltes Schild in Akzentfarbe = ausgerüstet.
function equipToggle(item, extraClass = "") {
  const btn = el("button", { type: "button", class: "equip-toggle" + (extraClass ? " " + extraClass : ""), title: item.eq ? "Ablegen" : "Ausrüsten", "aria-pressed": String(!!item.eq) });
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 20 20");
  svg.setAttribute("class", "icon-equip");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M10 2l6.5 2.5v5c0 4-2.7 6.9-6.5 8.5-3.8-1.6-6.5-4.5-6.5-8.5v-5z");
  svg.appendChild(path);
  btn.appendChild(svg);
  btn.addEventListener("click", (e) => { e.stopPropagation(); item.eq = !item.eq; renderContent(); });
  if (!item.structType || !item.structType.endsWith("weapon")) return btn;
  // Waffen: Rechtsklick = Griffwahl (in Foundry das DSA5-Kontextmenü mit Haupthand/Nebenhand/Beidhändig/Ablegen).
  btn.title = "Ausrüsten · Rechtsklick: Haupthand / Nebenhand / Beidhändig";
  btn.addEventListener("contextmenu", (e) => { e.preventDefault(); e.stopPropagation(); openGripMenu = openGripMenu === item ? null : item; renderContent(); });
  if (openGripMenu !== item) return btn;
  const grip = item.grip || "main";
  const entry = (key, label) => {
    const b = el("button", { type: "button", class: "reload-btn" }, (item.eq && grip === key ? "✓ " : "") + label);
    b.addEventListener("click", (e) => { e.stopPropagation(); openGripMenu = null; if (key === "off") { item.eq = false; item.grip = "main"; } else { item.eq = true; item.grip = key; } renderContent(); });
    return b;
  };
  const menu = el("div", { class: "ammo-menu" }, [entry("main", "Haupthand"), entry("offhand", "Nebenhand"), item.structType === "meleeweapon" ? entry("both", "Beidhändig") : null, item.eq ? entry("off", "Ablegen") : null]);
  menu.addEventListener("click", (e) => e.stopPropagation());
  return el("span", { class: "grip-menu-wrap" }, [btn, menu]);
}

function inventoryRow(i, list) {
  const eqCell = i.eq === undefined ? el("span", {}) : el("span", { class: "center" }, [equipToggle(i)]);
  return el("div", { class: "row inv-row" }, [
    i.structure ? itemIcon(i.img, "", i.structure, i.structType) : el("img", { src: i.img, alt: "" }),
    el("span", { class: "left" }, i.name),
    eqCell,
    quantityCell(i),
    el("span", { class: "muted center" }, i.weight),
    el("span", { class: "center" }, i.price),
    list ? rowActionsCell(list, i, onUseBtn(i.name)) : el("span", {}, [onUseBtn(i.name)]),
  ]);
}

// Vorschlag 2026-09-13, überarbeitet nach Nutzer-Feedback (RUECKMELDUNG.md): Taschen/Rucksäcke stehen nicht mehr
// als Zeilen in der Kategorie-Tabelle mit auf-/zuklappbaren Unterzeilen, sondern als Kacheln oben im Tab; Klick
// auf eine Kachel öffnet den Inhalt in einem eigenen Fenster (siehe openModal()).
// Getrenntes Leer-/Inhaltsgewicht (actor-equipment.hbs:55-59 item.system.bagweight = Gewicht des tatsächlich
// getragenen Inhalts, separat vom Eigengewicht der leeren Tasche selbst = bag.weight) — Inhaltsgewicht ist hier aus
// den Kindergewichten aufsummiert statt eines eigenen Felds, da die Kindgewichte schon die Quelle der Wahrheit sind.
function bagFillPercent(bag) {
  return bag.capacity ? Math.round(parseFloat(bagContentWeight(bag).replace(",", ".")) / bag.capacity * 100) : 0;
}

function bagContentWeight(bag) {
  const sum = (bag.children || []).reduce((total, c) => total + (parseFloat(String(c.weight).replace(",", ".")) || 0), 0);
  return sum.toFixed(1).replace(".", ",");
}

// Steht im Click-Dummy stellvertretend für das DSA5-Item-Sheet des Behältnisses, das das Foundry-Modul beim Klick
// auf die Kachel öffnet (Nutzer-Feedback 2026-09-24) — dort Inhaltsliste + Drop-Zone zum Einpacken.
function openBagModal(bag) {
  const rows = bag.children && bag.children.length ? bag.children.map((c) => inventoryRow(c, bag.children)) : [el("div", { class: "drop-zone" }, "Leer")];
  const closeBtn = el("button", { type: "button", class: "modal-close" }, "✕");
  closeBtn.addEventListener("click", closeModal);
  openModal(
    el("div", { class: "panel" }, [
      el("div", { class: "panel-title flex" }, [el("span", {}, bag.name), closeBtn]),
      el("div", { class: "armor-sum-line" }, `Leergewicht ${bag.weight} Stein · Inhalt ${bagContentWeight(bag)} Stein`),
      el("div", { class: "row-head inv-row" }, head("", "Gegenstand", "Angelegt", "Anzahl", "Gewicht", "Wert", "")),
      ...rows,
      el("div", { class: "drop-zone" }, "Gegenstände hierher ziehen, um sie einzupacken"),
    ]),
    { label: bag.name }
  );
}

// Ein Geldbeutel-Wert (Dukaten/Silber/Heller/Kreuzer) — in BEIDEN Modi direkt editierbar (BEARBEITEN.md), analog
// zu den LeP/AsP/KaP-Werten in der Kopfzeile (vitalBar()).
// Geld-Panel „Zeile“ (Variante A, Nutzer-Entscheidung 2026-09-30 nach Vergleich mit Kacheln/Summe): eine gemeinsame
// Geldbörse, vier Segmente mit feinen Trennern, je Münze Bild + großer Wert + Kürzel.
const COINS = [
  { field: "d", name: "Dukaten", abbr: "D", img: () => A.moneyD, inSilver: 10 },
  { field: "s", name: "Silbertaler", abbr: "S", img: () => A.moneyS, inSilver: 1 },
  { field: "h", name: "Heller", abbr: "H", img: () => A.moneyH, inSilver: 0.1 },
  { field: "k", name: "Kreuzer", abbr: "K", img: () => A.moneyK, inSilver: 0.01 },
];

function coinValue(coin) {
  const span = el("span", { class: "coin-value" }, String(WALLET[coin.field]));
  makeEditable(span, WALLET[coin.field], (v) => { WALLET[coin.field] = v; renderContent(); }, { type: "number", min: 0, max: 99999 });
  span.setAttribute("aria-label", `${coin.name}: ${WALLET[coin.field]}`);
  return span;
}

function walletLine() {
  return el("div", { class: "wallet-line" }, COINS.map((c) =>
    el("span", { class: "wallet-coin", title: c.name }, [el("img", { src: c.img(), alt: "" }), coinValue(c), el("small", { "aria-hidden": "true" }, c.abbr)])
  ));
}


// Suchfunktion (bisher gefehlt, siehe BEARBEITEN.md-Kopfnotiz "Es fehlt hier noch eine Suchfunktion."): filtert
// alle Kategorie-Tabellen (nicht die Taschen-Kacheln) per Namens-Teilstring, Groß-/Kleinschreibung egal. Da
// renderContent() bei jeder Änderung den kompletten Content-Bereich neu aufbaut, geht sonst bei jedem Tastenanschlag
// der Fokus verloren — deshalb wird Fokus+Cursorposition nach dem Rendern explizit wiederhergestellt.
let inventorySearchQuery = "";

// Offenes ⋮-Menü einer Behältnis-Kachel (Platzhalter für das DSA5-Kontextmenü im Foundry-Modul).
let openBagMenu = null;

function renderInventory() {
  // Geld und Gewicht als zwei gleich aufgebaute Panels nebeneinander (Panel-Titel + Inhalt) wie im Foundry-Modul
  // (inventory.hbs): Münznamen nur als Tooltip, Gewicht = Balken, darunter aktuell/max und die Belastungsstufe.
  const top = el("div", { class: "info-cards" }, [
    el("div", { class: "panel wallet-panel" }, [
      el("div", { class: "panel-title" }, "Geld"),
      walletLine(),
    ]),
    el("div", { class: "panel carry-panel", title: "Tragkraft" }, [
      el("div", { class: "panel-title" }, "Gewicht"),
      el("div", { class: "carry-body" }, [
        el("div", { class: "carry-bar" }, [el("div", { class: "carry-fill", style: "width:66%" })]),
        el("div", { class: "carry-values" }, [el("span", {}, "14,5 / 22 Stein"), el("span", { class: "muted" }, "Belastung 0")]),
      ]),
    ]),
  ]);

  const searchInput = el("input", { type: "search", id: "inventorySearch", placeholder: "Ausrüstung suchen …", value: inventorySearchQuery });
  searchInput.addEventListener("input", () => {
    inventorySearchQuery = searchInput.value;
    const pos = searchInput.selectionStart;
    renderContent();
    const fresh = document.getElementById("inventorySearch");
    fresh.focus();
    fresh.setSelectionRange(pos, pos);
  });
  const searchBar = el("div", { class: "search-bar" }, [searchInput]);

  const bagsCategory = INVENTORY_CATEGORIES.find((cat) => cat.label === "Taschen & Behältnisse");
  const bagsPanel = bagsCategory && bagsCategory.items.length
    ? el("div", { class: "panel" }, [
        el("div", { class: "panel-title" }, bagsCategory.label),
        el("div", { class: "bag-tiles" }, bagsCategory.items.map((bag) => {
          // Kachel wie im Foundry-Modul: Klickfläche öffnet das Behältnis (dort das DSA5-Item-Sheet), darunter
          // Ausrüsten-Schild + ⋮-Menü (dort das System-Kontextmenü; hier nur ein Platzhalter-Menü).
          const open = el("div", { class: "bag-tile-open", role: "button", tabindex: "0", title: "Behältnis öffnen (Gegenstände hierher ziehen, um sie einzupacken)" }, [
            el("img", { src: bag.img, alt: "" }),
            el("span", { class: "bag-tile-name" }, bag.name),
            // Füllstand wie in Foundry (inventory.hbs): Inhaltsgewicht / Fassungsvermögen als Wert + Balken.
            el("span", { class: "bag-tile-meta" }, `${bagContentWeight(bag)} / ${bag.capacity}`),
            el("span", { class: "bag-fill-bar" + (bagFillPercent(bag) > 100 ? " over" : "") }, [el("span", { class: "bag-fill", style: `width:${Math.min(100, bagFillPercent(bag))}%` })]),
          ]);
          open.addEventListener("click", () => openBagModal(bag));
          const isMenuOpen = openBagMenu === bag;
          const menuBtn = el("button", { type: "button", class: "bag-action-btn" + (isMenuOpen ? " open" : ""), title: "Weitere Aktionen", "aria-label": "Weitere Aktionen" }, "⋮");
          menuBtn.addEventListener("click", (e) => { e.stopPropagation(); openBagMenu = isMenuOpen ? null : bag; renderContent(); });
          const actions = el("span", { class: "bag-tile-actions" }, [bag.eq === undefined ? null : equipToggle(bag, "bag-action-btn"), menuBtn]);
          if (isMenuOpen) {
            const entry = (label, fn) => {
              const b = el("button", { type: "button", class: "reload-btn" }, label);
              b.addEventListener("click", (e) => { e.stopPropagation(); openBagMenu = null; fn(); renderContent(); });
              return b;
            };
            const menu = el("div", { class: "ammo-menu" }, [
              entry("Bearbeiten", () => openBagModal(bag)),
              entry("Im Chat posten", () => flashNotice(`💬 ${bag.name} im Chat gepostet`)),
              entry("Löschen", () => bagsCategory.items.splice(bagsCategory.items.indexOf(bag), 1)),
            ]);
            menu.addEventListener("click", (e) => e.stopPropagation());
            actions.appendChild(menu);
          }
          return el("div", { class: "bag-tile" }, [open, actions]);
        })),
      ])
    : null;

  // Eine Gruppenbox je Ausrüstungs-Kategorie (Nahkampfwaffen/Fernkampfwaffen/Rüstung/Munition/…) statt einer
  // einzigen Tabelle mit Freitext-"Typ"-Spalte — siehe INVENTORY_CATEGORIES-Kommentar in data.js. Taschen &
  // Behältnisse laufen separat über bagsPanel oben. Leere Kategorien (auch nach der Suchfilterung) werden weggelassen.
  const q = inventorySearchQuery.trim().toLowerCase();
  const categoryPanels = INVENTORY_CATEGORIES.filter((cat) => cat !== bagsCategory)
    .map((cat) => ({ label: cat.label, items: q ? cat.items.filter((it) => it.name.toLowerCase().includes(q)) : cat.items }))
    .filter((cat) => cat.items.length)
    .map((cat) =>
      el("div", { class: "panel" }, [
        el("div", { class: "panel-title" }, cat.label),
        el("div", { class: "row-head inv-row" }, head("", "Gegenstand", "Angelegt", "Anzahl", "Gewicht", "Wert", "")),
        ...cat.items.map((it) => inventoryRow(it, INVENTORY_CATEGORIES.find((c) => c.label === cat.label).items)),
      ])
    );
  const noResults = q && categoryPanels.length === 0 ? el("div", { class: "drop-zone" }, `Keine Ausrüstung gefunden für „${inventorySearchQuery}“`) : null;

  return el("div", {}, [top, searchBar, ...(bagsPanel ? [bagsPanel] : []), ...categoryPanels, ...(noResults ? [noResults] : [])]);
}

// +/−-Knopf als echter <button> mit benanntem Ziel (UI/UX-Review 2026-09-25, Punkt 1 + 4): größere Trefferfläche
// über .step in style.css, am Limit sichtbar gedämpft.
// Am Limit nur aria-disabled statt disabled, damit der Tastaturfokus nach dem Neu-Rendern nicht verloren geht.
function stepButton(cls, glyph, label, disabled, fkey) {
  const btn = el("button", { type: "button", class: `step ${cls}`, title: label, "aria-label": label, "data-fkey": fkey }, glyph);
  if (disabled) {
    btn.setAttribute("aria-disabled", "true");
    btn.classList.add("disabled");
  }
  return btn;
}

// "−"-Schritt zum Reduzieren eines Zustands-/Effekt-Werts (BEARBEITEN.md "Effekte und Zustände Wert
// reduzieren") — in BEIDEN Modi bedienbar, anders als das Löschen (rowDeleteBtn(), nur Bearbeiten-Modus).
// `label` benennt den Wert im aria-label („Furcht senken“).
function reduceStep(getValue, setValue, min, onChange, label = "Wert") {
  const btn = stepButton("minus", "−", `${label} senken`, getValue() <= min, `minus:${label}`);
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const v = getValue();
    if (v <= min) return;
    setValue(v - 1);
    onChange();
  });
  return btn;
}

// "+"-Gegenstück zu reduceStep() — Zustand verschlimmern (z.B. durch Zauber/Falle/Verletzung), ebenfalls in
// BEIDEN Modi bedienbar.
function increaseStep(getValue, setValue, max, onChange, label = "Wert") {
  const btn = stepButton("plus", "+", `${label} erhöhen`, getValue() >= max, `plus:${label}`);
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const v = getValue();
    if (v >= max) return;
    setValue(v + 1);
    onChange();
  });
  return btn;
}

// Zustände- und Aktive-Effekte-Panel als eigene Funktionen (statt Inline in renderStatus), damit das Titelblatt
// (renderCover) dieselben Panels für seinen kompakten Status-Überblick wiederverwenden kann. Wert (gefüllte
// Pips) in BEIDEN Modi reduzierbar, ganze Zeile nur im Bearbeiten-Modus löschbar. `limit` (nur von
// renderCoverSidebar() übergeben, Status-Tab bleibt unlimitiert) deckelt die Liste auf dem Titelblatt — bei mehr
// Zuständen als `limit` erscheint statt weiterer Zeilen ein Sprung-Button zum Status-Tab (Nutzer-Feedback
// 2026-09-14, analog zu buildActiveEffectsSummary()), damit die linke Leiste nie scrollen muss.
function buildConditionsPanel(limit) {
  const capped = limit && CONDITIONS.length > limit;
  const shown = capped ? CONDITIONS.slice(0, limit) : CONDITIONS;
  const panel = el("div", { class: "panel" }, [
    el("div", { class: "panel-title" }, "Zustände"),
    ...shown.map((c) =>
      el("div", { class: "list-row" }, [
        el("span", { class: "name" }, c.name),
        reduceStep(() => c.filled, (v) => { c.filled = v; }, 0, () => renderContent(), c.name),
        el(
          "span",
          { class: "pips" },
          Array.from({ length: c.pips }, (_, i) => el("span", { class: `pip ${i < c.filled ? "filled" : "empty"}` }))
        ),
        el("span", { class: "cond-count", "aria-label": `Stufe ${c.filled} von ${c.pips}` }, `${c.filled}/${c.pips}`),
        increaseStep(() => c.filled, (v) => { c.filled = v; }, c.pips, () => renderContent(), c.name),
        rowDeleteBtn(CONDITIONS, c),
      ])
    ),
  ]);
  if (capped) {
    const more = el("button", { type: "button", class: "show-all-btn" }, `+${CONDITIONS.length - limit} weitere → Status`);
    more.addEventListener("click", () => setTab("status"));
    panel.appendChild(more);
  }
  return panel;
}

function buildActiveEffectsPanel() {
  return el("div", { class: "panel" }, [
    el("div", { class: "panel-title" }, "Aktive Effekte"),
    ...EFFECTS.map((e) => el("div", { class: "list-row" }, [el("span", { class: "name" }, e.name), el("span", { class: "cost" }, e.dur), rowDeleteBtn(EFFECTS, e)])),
  ]);
}

// Nutzer-Feedback 2026-09-14: auf dem Titelblatt sollen Aktive Effekte gar nicht mehr einzeln aufgelistet werden
// (auch die vorherige "erste 4 + Alle anzeigen"-Begrenzung machte die linke Leiste noch scrollbar) — nur noch ein
// knapper Hinweis, ob überhaupt welche aktiv sind, mit direktem Sprung zum Status-Tab (die volle Liste bleibt dort
// über buildActiveEffectsPanel() unverändert). Damit bleibt die Höhe der Leiste unabhängig von der Effekt-Anzahl
// konstant, siehe #coverSidebar-Kommentar in style.css.
function buildActiveEffectsSummary() {
  const count = EFFECTS.length;
  const btn = el(
    "button",
    { type: "button", class: "show-all-btn" },
    count ? `${count} aktive${count === 1 ? "r" : ""} Effekt${count === 1 ? "" : "e"} → Status` : "Keine aktiven Effekte"
  );
  if (count) btn.addEventListener("click", () => setTab("status"));
  else btn.disabled = true;
  return el("div", { class: "panel" }, [el("div", { class: "panel-title" }, "Aktive Effekte"), btn]);
}

function renderStatus() {
  const conditionsPanel = buildConditionsPanel();

  // Kumulative und übertragene Zustandseffekte sind im System eigene Blöcke neben den normalen Zuständen
  // (status_effects.hbs), bisher komplett ohne Entsprechung — siehe CUMULATIVE_CONDITIONS/TRANSFERRED_CONDITIONS
  // in data.js. Beide Panels erscheinen nur, wenn es tatsächlich Einträge gibt (im System genauso bedingt gerendert).
  const cumulativePanel = CUMULATIVE_CONDITIONS.length
    ? el("div", { class: "panel" }, [
        el("div", { class: "panel-title" }, "Kumulative Zustandseffekte"),
        ...CUMULATIVE_CONDITIONS.map((c) => el("div", { class: "list-row" }, [
          el("span", { class: "name" }, c.name),
          reduceStep(() => c.stacks, (v) => { c.stacks = v; }, 0, () => renderContent(), c.name),
          el("span", { class: "cost" }, `× ${c.stacks}`),
          rowDeleteBtn(CUMULATIVE_CONDITIONS, c),
        ])),
      ])
    : null;

  const transferredPanel = TRANSFERRED_CONDITIONS.length
    ? el("div", { class: "panel" }, [
        el("div", { class: "panel-title" }, "Übertragene Zustandseffekte"),
        ...TRANSFERRED_CONDITIONS.map((c) =>
          el("div", { class: "list-row-2line" }, [
            el("div", { class: "list-row-main" }, [
              el("span", { class: "name" }, c.name),
              el("span", { class: "cost" }, c.dur),
              rowDeleteBtn(TRANSFERRED_CONDITIONS, c),
            ]),
            el("div", { class: "source-line" }, `von ${c.source}`),
          ])
        ),
      ])
    : null;

  const effectsPanel = buildActiveEffectsPanel();

  // Modifikatoren-Tabelle (prepare.itemModifiers): zeigt für jeden aktiven Effekt/Gegenstand Ziel/Wert/Quelle —
  // bisher nirgends abgebildet, obwohl das oft der einzige Weg ist zu verstehen, warum ein Wert vom Grundwert abweicht.
  const modifiersPanel = MODIFIERS.length
    ? el("div", { class: "panel" }, [
        el("div", { class: "panel-title" }, "Modifikatoren"),
        el("div", { class: "row-head modifier-row" }, head("Ziel", "Wert", "Quelle")),
        ...MODIFIERS.map((m) =>
          el("div", { class: "row modifier-row" }, [el("span", { class: "left" }, m.target), el("span", { class: "big center" }, m.value), el("span", { class: "muted left" }, m.source)])
        ),
      ])
    : null;

  // Dämonenmal (siehe DEMONMARKS-Kommentar in data.js) — eigener bedingter Block, nur gerendert wenn befüllt.
  const demonmarkPanel = DEMONMARKS.length
    ? el("div", { class: "panel" }, [
        el("div", { class: "panel-title" }, "Dämonenmal"),
        el("div", { class: "row-head demonmark-row" }, head("", "Kreis", "Domänen")),
        ...DEMONMARKS.map((d) => el("div", { class: "row demonmark-row" }, [el("span", { class: "left" }, d.name), el("span", { class: "muted center" }, d.circle), el("span", { class: "muted center" }, d.domains)])),
      ])
    : null;

  // Jede Tabelle volle Breite, Zeilen abwechselnd links/rechts (Nutzer-Feedback 2026-09-28, wie "row-section wrap"
  // im Systembogen) — Krankheiten und Aktenkonfiguration bleiben einspaltig (keine Tabellen im engeren Sinn).
  return el("div", { class: "status-stack" }, [
    ...[conditionsPanel, cumulativePanel, transferredPanel, effectsPanel, modifiersPanel, demonmarkPanel].filter(Boolean).map(twoColPanel),
    renderDiseasePanel(),
    regenConfigPanel(),
  ]);
}

// Verteilt die Zeilen eines Panels (alles nach dem Titel) auf zwei Spalten; eine Kopfzeile wird für die rechte
// Spalte verdoppelt, Knöpfe wie "+N weitere" laufen über beide Spalten.
function twoColPanel(panel) {
  const [title, ...rows] = [...panel.children];
  const grid = el("div", { class: "two-col" });
  rows.forEach((r) => grid.appendChild(r));
  const headRow = grid.firstElementChild;
  if (headRow && headRow.classList.contains("row-head")) {
    const dup = headRow.cloneNode(true);
    dup.setAttribute("aria-hidden", "true");
    headRow.after(dup);
  }
  panel.appendChild(grid);
  return panel;
}

// Regeneration ein-/ausschaltbar (siehe REGEN_DISABLED-Kommentar in data.js) — eigenes "Aktenkonfiguration"-Panel
// (status_effects.hbs:401-441 "SHEET.actorConfig"), nur Zeilen für Ressourcen, die die Figur überhaupt hat.
function regenConfigPanel() {
  const rows = [
    { type: "wounds", label: "Lebenskraft", show: true },
    { type: "astralenergy", label: "Astralenergie", show: HAS_ASP },
    { type: "karmaenergy", label: "Karmaenergie", show: HAS_KAP },
  ].filter((r) => r.show);
  return el("div", { class: "panel" }, [
    el("div", { class: "panel-title" }, "Aktenkonfiguration"),
    ...rows.map((r) => {
      const disabled = REGEN_DISABLED[r.type];
      const btn = el(
        "button",
        { type: "button", class: "row-delete", style: `color:${disabled ? "var(--muted)" : "#3a8f3a"};font-size:16px`, title: disabled ? "Regeneration deaktiviert (klicken zum Aktivieren)" : "Regeneration aktiv (klicken zum Deaktivieren)" },
        disabled ? "☐" : "☑"
      );
      btn.addEventListener("click", () => { REGEN_DISABLED[r.type] = !REGEN_DISABLED[r.type]; renderContent(); });
      return el("div", { class: "list-row" }, [el("span", { class: "name" }, `Regeneration (${r.label})`), btn]);
    }),
  ]);
}

// Vorschlag 2026-09-13 (bisher deferred, "GM-only-Neugestaltung von Krankheiten/Vergiftungen") — siehe
// AFFLICTIONS-Kommentar in data.js. Da der Click-Dummy kein echtes Berechtigungssystem hat, wird die Spieler-/
// GM-Unterscheidung hier als Umschalter direkt im Panel simuliert statt tatsächlich verborgen. Zur Diskussion:
// ob GM-Ansicht wirklich "mehr Felder derselben Karte" sein soll (wie hier gebaut) oder eher eigene GM-Werkzeuge.
let diseaseView = "player";

function setDiseaseView(mode) {
  diseaseView = mode;
  renderContent();
}

function renderDiseasePanel() {
  const toggle = el(
    "div",
    { class: "panel-toggle" },
    ["player", "gm"].map((m) => {
      const active = diseaseView === m;
      const btn = el("button", { type: "button", class: active ? "active" : "", "aria-pressed": String(active) }, m === "player" ? "Spieler-Ansicht" : "GM-Ansicht");
      btn.addEventListener("click", () => setDiseaseView(m));
      return btn;
    })
  );
  // Umschalter unter der Überschrift statt daneben — daneben brach "Krankheiten & Gifte" ungünstig um (UI/UX-Review
  // 2026-09-25). Der Spieler-/GM-Umschalter ist nur ein Test-Schalter des Dummys; im Modul entscheidet die Rechteprüfung.
  const title = el("div", {}, [el("div", { class: "panel-title" }, "Krankheiten & Gifte"), el("div", { class: "panel-subbar" }, [el("small", { class: "muted" }, "Test-Ansicht:"), toggle])]);

  if (!AFFLICTIONS.length) {
    return el("div", { class: "panel" }, [
      title,
      el("div", { class: "drop-zone" }, [el("img", { src: A.disease, alt: "" }), "Krankheit oder Gift hierher ziehen"]),
    ]);
  }

  if (diseaseView === "player") {
    return el("div", { class: "panel" }, [
      title,
      ...AFFLICTIONS.map((a) => el("div", { class: "list-row" }, [el("span", { class: "name" }, a.name), el("span", { class: "cost" }, a.type)])),
    ]);
  }

  // GM-Ansicht: rollbarer Krankheits-Würfel (status_effects.hbs:334, rein dekorativ wie alle anderen Würfel-
  // Chips im Click-Dummy — es gibt nirgends echte Foundry-Rolls) und Schnellbutton "→ Zustand 'Krank' anlegen"
  // (status_effects.hbs:337 statusAdd data-id="sick"): legt die Bedingung in CONDITIONS an bzw. erhöht sie um 1
  // Stufe, falls schon vorhanden.
  function addSickCondition() {
    const existing = CONDITIONS.find((c) => c.name === "Krank");
    if (existing) existing.filled = Math.min(existing.pips, existing.filled + 1);
    else CONDITIONS.push({ name: "Krank", pips: 4, filled: 1 });
    renderContent();
  }

  const row = (label, value) => el("div", { class: "appearance-row" }, [el("span", { class: "k" }, label), el("span", {}, value)]);
  return el("div", { class: "panel" }, [
    title,
    ...AFFLICTIONS.flatMap((a) => [
      el("div", { class: "subhead flex" }, [
        el("span", {}, `${a.name} (${a.type}, Stufe ${a.step})`),
        el("span", { class: "disease-gm-actions" }, [
          el("span", { class: "die-qs", style: dieBg("d20mu"), title: "Krankheitsprobe (rein dekorativ, keine echten Rolls im Click-Dummy)" }),
          (() => {
            const btn = el("button", { type: "button", class: "row-delete", title: "Zustand 'Krank' anlegen/erhöhen" }, "☣");
            btn.addEventListener("click", addSickCondition);
            return btn;
          })(),
        ]),
      ]),
      row("Inkubationszeit", a.incubation),
      row("Schaden", a.damage),
      row("Dauer", a.duration),
      row("Resistenz", a.resistance),
      row("Behandlung", a.treatment),
      row("Gegenmittel", a.antidot),
    ]),
  ]);
}

// "alle Textfelder sollten hier bearbeitet werden können" (BEARBEITEN.md) — Aussehen-Werte, alle vier
// Notizen-Fließtexte und Verbindungen (Name+Rolle) sind daher alle im Bearbeiten-Modus editierbar (kein
// separater Spielmodus-Punkt dazu, also wie überall sonst nur dort).
function renderNotes() {
  const mode = document.querySelector(".sheet").getAttribute("data-mode");

  // Wie im Foundry-Modul (notes.hbs): oben das Persönliche-Daten-Grid, darunter genau EIN Freitextfeld je nach
  // Unter-Tab (Hintergrundgeschichte/Notizen/Private Notizen/GM-Notizen, Nutzer-Feedback 2026-09-19). Wesenszug,
  // GM-Geheimnisse und Verbindungen gibt es dort nicht (kommen im offiziellen Bogen nicht vor) — hier entfernt.
  const detailsPanel = el("div", { class: "panel" }, [
    el("div", { class: "panel-title" }, "Persönliche Daten"),
    el("div", { class: "details-grid" }, APPEARANCE.map((a) => {
      const valSpan = el("span", { class: "val-editable" }, a.v);
      if (mode === "edit") makeEditable(valSpan, a.v, (v) => { a.v = v; renderContent(); }, { type: "text" });
      return el("div", { class: "details-field" }, [el("span", { class: "k" }, a.k), valSpan]);
    })),
  ]);

  const renderParagraphs = (c, v) => v.split(/\n\n+/).forEach((para) => c.appendChild(el("p", {}, para)));
  const section = NOTES_SECTIONS.find((n) => n.id === currentNotesSection) || NOTES_SECTIONS[0];
  const textEl = el("div", { class: "notes-text" }, []);
  renderParagraphs(textEl, section.get());
  let editBtn = null;
  if (mode === "edit") {
    makeEditable(textEl, section.get(), (v) => { section.set(v); renderContent(); }, { type: "textarea", render: renderParagraphs });
    // Sichtbarer Bearbeiten-Knopf oben rechts wie im Foundry-Modul (dort Foundrys prose-mirror-Toggle, im
    // Bearbeiten-Modus dauerhaft eingeblendet — Nutzer-Feedback 2026-09-24).
    editBtn = el("button", { type: "button", class: "notes-edit-btn", title: "Bearbeiten", "aria-label": "Bearbeiten" }, "✎");
    editBtn.addEventListener("click", () => textEl.click());
  }
  // Wer sieht den Text? (UI/UX-Review 2026-09-25) — Hinweiszeile je Unterreiter; im Modul entspricht das den
  // Bedingungen owner/isGM in notes.hbs.
  const VISIBILITY = {
    biography: "Sichtbar für alle, die den Bogen sehen dürfen.",
    notes: "Sichtbar für alle, die den Bogen sehen dürfen.",
    ownernotes: "Privat: nur für Besitzer des Helden und die Spielleitung sichtbar.",
    gmnotes: "Nur für die Spielleitung sichtbar.",
  };
  const textPanel = el("div", { class: "panel" }, [
    el("div", { class: "panel-title" }, section.label),
    el("div", { class: "notes-visibility" }, ["👁 ", VISIBILITY[section.id] || ""]),
    el("div", { class: "notes-text-wrap" }, [textEl, editBtn]),
  ]);

  // Zwei Spalten (Nutzer-Feedback 2026-09-28): links schmal die persönlichen Daten, rechts der Text des Unterreiters.
  detailsPanel.classList.add("notes-details");
  textPanel.classList.add("notes-text");
  return el("div", { class: "notes-layout" }, [detailsPanel, textPanel]);
}

// Vorschlag 2026-09-13 (bisher deferred, "komplett neuer Gefährten-Tab") — siehe COMPANIONS-Kommentar in data.js.
// Reittier-Kachel im selben Stil wie die Rüstungskachel (renderArmorPanel: Bild + LeP-Badge), Kennwerte
// (appearance-row) rechts daneben statt darunter — Nutzer-Feedback 2026-09-13 (RUECKMELDUNG.md).
// Überarbeitet 2026-09-14: Name steht jetzt über dem Portrait statt darunter und ist deutlicher hervorgehoben
// (.companion-name); dieselbe Karte (Name über Bild, Kennwerte rechts) wird jetzt auch für jeden einzelnen
// Vertrauten/Begleiter verwendet (.companion-card = kompaktere Variante), da auch die ein Bild haben.
// Immer bedienbares <select> (nicht auf den Bearbeiten-Modus beschränkt wie selectWertCell) — Fortbewegungsart/
// Reitweise sind im System ganz normale, jederzeit umschaltbare <select>-Felder (parts/horse.hbs:36-43), keine
// Bearbeiten-Modus-Einstellung wie z.B. die Grundwerte-Aufschlüsselung.
function alwaysSelect(options, value, onChange) {
  const select = document.createElement("select");
  select.className = "val-select-input";
  options.forEach((o) => {
    const opt = document.createElement("option");
    opt.value = o;
    opt.textContent = o;
    if (o === value) opt.selected = true;
    select.appendChild(opt);
  });
  select.addEventListener("click", (e) => e.stopPropagation());
  select.addEventListener("change", () => onChange(select.value));
  return select;
}

// 14-Slot-Hotbar (companion-card.hbs:134-159, 2 Reihen à 7) — gefüllte Slots lösen im System die Fähigkeit direkt
// aus; hier (keine echten Rolls im Click-Dummy) entfernt ein Klick auf einen gefüllten Slot ihn stattdessen aus
// der Hotbar (kein Widerspruch zur Vereinfachung: Hinzufügen läuft über den Skill-Auswahl-Dialog per Klick statt
// Drag&Drop, Entfernen passiert im System ebenfalls per Klick in genau diesem Dialog, hier direkt in der Hotbar).
function companionHotbar(c) {
  const rows = [c.hotbar.slice(0, 7), c.hotbar.slice(7, 14)];
  return el(
    "div",
    { class: "companion-hotbar" },
    rows.map((row) =>
      el(
        "div",
        { class: "companion-hotbar-row" },
        row.map((slot, i) => {
          const el_ = el("div", { class: "companion-slot" + (slot ? "" : " empty"), title: slot ? slot.tooltip : "" }, slot ? [el("img", { src: slot.img, alt: "" })] : []);
          if (slot) {
            el_.addEventListener("click", () => {
              const idx = c.hotbar.indexOf(slot);
              if (idx !== -1) c.hotbar[idx] = null;
              renderContent();
            });
          }
          return el_;
        })
      )
    )
  );
}

// Skill-Auswahl-Dialog (companion-skill-selection.hbs) — vereinfacht: Klick auf eine verfügbare Fähigkeit legt sie
// in den ersten freien Hotbar-Slot, statt sie per Drag&Drop in einen bestimmten Slot zu ziehen.
function openCompanionSkillSelection(c) {
  const closeBtn = el("button", { type: "button", class: "modal-close" }, "✕");
  closeBtn.addEventListener("click", closeModal);
  const grid = el(
    "div",
    { class: "companion-skill-grid" },
    c.availableSkills.map((s) => {
      const slot = el("div", { class: "companion-slot" + (c.hotbar.includes(s) ? " active" : "") }, [el("img", { src: s.img, alt: "" })]);
      slot.title = s.name;
      slot.addEventListener("click", () => {
        if (c.hotbar.includes(s)) return;
        const freeIdx = c.hotbar.indexOf(null);
        if (freeIdx === -1) return;
        c.hotbar[freeIdx] = { name: s.name, img: s.img, tooltip: s.name };
        closeModal();
        renderContent();
      });
      return slot;
    })
  );
  openModal(
    el("div", { class: "panel" }, [
      el("div", { class: "panel-title flex" }, [el("span", {}, `Fähigkeiten von ${c.name}`), closeBtn]),
      el("p", { class: "notes-text", style: "padding:8px 11px 0" }, [el("span", {}, "Klick auf eine Fähigkeit belegt den nächsten freien Hotbar-Slot.")]),
      grid,
    ]),
    { label: `Fähigkeiten von ${c.name}` }
  );
}

// Ausbildung (companion-card.hbs:177-180 trainCompanion → companion-training-app.js/training.hbs): das echte
// System öffnet dafür einen eigenen Dialog mit Tierart-/Trick-Auswahl inkl. artspezifischer Trainingsmodifikatoren
// — hier bewusst vereinfacht auf eine kurze Demo-Auswahl neuer Tricks, da die volle Arten-/Modifikatortabelle für
// den Click-Dummy wenig Mehrwert hätte (Tierart steht bei einem bereits vorhandenen Begleiter ohnehin fest).
const TRICK_POOL = ["Männchen machen", "Bei Fuß", "Apportieren", "Wache halten"];

function openTrainingDialog(c) {
  const closeBtn = el("button", { type: "button", class: "modal-close" }, "✕");
  closeBtn.addEventListener("click", closeModal);
  const list = el(
    "div",
    { class: "chips" },
    TRICK_POOL.map((name) => {
      const btn = el("button", { type: "button", class: "chip chip-pay" }, name);
      btn.addEventListener("click", () => {
        c.trainingTests.push({ name: `Trick: ${name}`, interval: "1 Tag", used: 0, allowed: 5, qs: 0, apCost: 3 });
        closeModal();
        renderContent();
      });
      return btn;
    })
  );
  openModal(
    el("div", { class: "panel" }, [el("div", { class: "panel-title flex" }, [el("span", {}, `Neuen Trick trainieren: ${c.name}`), closeBtn]), list]),
    { label: `Neuen Trick trainieren: ${c.name}` }
  );
}

// Ausbildungs-Sammelproben-Tabelle (companion-card.hbs:195-273) — gleiche Struktur wie AGGREGATED auf dem
// Talente-Tab (renderAggregatedPanel()), nur pro Begleiter statt pro Hauptfigur. "Abschließen" erscheint erst,
// wenn cummulatedQS die 10 erreicht (isCompleted im System), entfernt den Trainingseintrag dann wieder.
function companionTrainingTable(c) {
  if (!c.trainingTests.length) return null;
  return el(
    "div",
    { class: "groupbox" },
    c.trainingTests.map((t) => {
      const completed = t.qs >= 10;
      const finishBtn = el("button", { type: "button", class: "row-delete", title: "Training abschließen", style: completed ? "color:#3a8f3a" : "opacity:.35" }, "✓");
      if (completed) finishBtn.addEventListener("click", () => { c.trainingTests.splice(c.trainingTests.indexOf(t), 1); renderContent(); });
      else finishBtn.disabled = true;
      const delBtn = el("button", { type: "button", class: "row-delete", title: "Abbrechen" }, "×");
      delBtn.addEventListener("click", () => { c.trainingTests.splice(c.trainingTests.indexOf(t), 1); renderContent(); });
      return el("div", { class: "row training-row" }, [
        el("span", { class: "left" }, t.name),
        el("span", { class: "muted center" }, t.interval),
        el("span", { class: "center" }, `${t.used} / ${t.allowed}`),
        el("span", { class: "center" }, `${t.qs} / 10`),
        el("span", { class: "muted center" }, `${t.apCost} AP`),
        el("span", { class: "row-actions-cell" }, [finishBtn, delBtn]),
      ]);
    })
  );
}

// Eine Begleiter-Karte (companion-card.hbs) — deckt Vertraute/Tierische Begleiter/Beschworene Kreaturen gleichermaßen
// ab, unterscheidet sich nur in Loyalität-vs-Dienste-Zeile (loyalty vs. services) und den Natur-/Arten-Badges.
function companionCard(c, list) {
  const badges = [];
  if (c.isFamiliar) badges.push(el("span", { class: "companion-badge", title: "Vertrauter" }, "🧹"));
  if (c.isHomunculus) badges.push(el("span", { class: "companion-badge", title: "Homunkulus" }, "⚗️"));

  let natureToggle = null;
  if (c.isDomesticated !== undefined) {
    const btn = el("button", { type: "button", class: "companion-badge companion-nature-btn", title: c.isDomesticated ? "Domestiziert (klicken für Wild)" : "Wild (klicken für Domestiziert)" }, c.isDomesticated ? "🏠" : "🌿");
    btn.addEventListener("click", () => { c.isDomesticated = !c.isDomesticated; renderContent(); });
    natureToggle = btn;
  }

  const loyaltyRow = c.loyalty
    ? el("div", { class: "companion-loyalty-row" }, [
        el("span", { class: "name" }, "Loyalität"),
        probeDice(c.loyalty.probe, `Loyalität (${c.name})`),
        el("span", { class: "big center" }, String(c.loyalty.value)),
      ])
    : el("div", { class: "companion-loyalty-row" }, [
        el("span", { class: "name" }, "Dienste"),
        reduceStep(() => c.services.value, (v) => { c.services.value = v; }, 0, () => renderContent(), "Dienste"),
        el("span", { class: "big center" }, `${c.services.value} / ${c.services.max}`),
        increaseStep(() => c.services.value, (v) => { c.services.value = v; }, c.services.max, () => renderContent(), "Dienste"),
      ]);

  // Symbol + kurze Beschriftung statt reiner Symbole (UI/UX-Review 2026-09-25: Buch/Knochen waren ohne Vorwissen unklar).
  const skillSelectBtn = el("button", { type: "button", class: "title-icon-btn labeled", title: "Fähigkeiten wählen" }, ["📖", el("span", {}, "Fähigkeiten")]);
  skillSelectBtn.addEventListener("click", () => openCompanionSkillSelection(c));
  const sideButtons = [skillSelectBtn];
  if (c.isTrainable) {
    const trainBtn = el("button", { type: "button", class: "title-icon-btn labeled", title: "Neuen Trick trainieren" }, ["🦴", el("span", {}, "Trick")]);
    trainBtn.addEventListener("click", () => openTrainingDialog(c));
    sideButtons.push(trainBtn);
  }
  if (c.isMountPossible) {
    const mountBtn = el("button", { type: "button", class: "title-icon-btn labeled" + (c.isMountActive ? " active" : ""), title: c.isMountActive ? "Als Reittier entfernen" : "Als Reittier verwenden" }, ["🐴", el("span", {}, "Reittier")]);
    mountBtn.addEventListener("click", () => { c.isMountActive = !c.isMountActive; renderContent(); });
    sideButtons.push(mountBtn);
  }

  return el("div", { class: "panel companion-full-card" }, [
    el("div", { class: "panel-title flex" }, [
      el("span", { title: c.name }, [c.name, ...badges, natureToggle]),
      el("div", { class: "panel-title-actions" }, [rowDeleteBtn(list, c)]),
    ]),
    el("div", { class: "companion-layout" }, [
      el("div", { class: "companion-portrait-col companion-portrait-col-flat" }, [el("div", { class: "armor-hero" }, [el("img", { src: c.img, alt: c.name })]), el("div", { class: "armor-name" }, c.role)]),
      // Name allein in der Titelzeile, Knöpfe als 2×2-Raster darunter (Rückmeldung 2026-09-30, zweite Runde: bei
      // langem Namen liefen die Knöpfe in Foundry rechts aus der Karte).
      el("div", { class: "companion-info-col" }, [loyaltyRow, el("div", { class: "companion-actions" }, sideButtons)]),
      companionHotbar(c),
    ]),
    companionTrainingTable(c),
  ]);
}

function companionSection(title, list, extraHeader) {
  if (!list.length && !extraHeader) return null;
  return el("div", { class: "panel" }, [
    el("div", { class: "panel-title flex" }, [el("span", {}, title), extraHeader || null]),
    ...(list.length ? list.map((c) => companionCard(c, list)) : [el("div", { class: "drop-zone" }, "Keiner zugeordnet")]),
  ]);
}

function renderCompanions() {
  const m = COMPANIONS.mount;
  const row = (label, value) => el("div", { class: "appearance-row" }, [el("span", { class: "k" }, label), el("span", {}, value)]);

  // TODOS.md: "Das Reittier kann aktuell nicht entfernt werden" — der Slot bekommt jetzt einen eigenen
  // Entfernen-Button im Panel-Titel (wie renderDiseasePanel()), der COMPANIONS.mount leert statt ihn aus einer
  // Liste zu splicen (rowDeleteBtn passt hier nicht, da mount kein Array-Eintrag ist). Danach fällt der Slot
  // auf den "Kein Reittier zugeordnet"-Zustand zurück.
  const removeMountBtn = el("button", { type: "button", class: "row-delete edit-only", title: "Reittier entfernen" }, "×");
  removeMountBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    COMPANIONS.mount = null;
    renderContent();
  });

  const mountPanel = !m
    ? el("div", { class: "panel" }, [el("div", { class: "panel-title" }, "Reittier"), el("div", { class: "drop-zone" }, "Kein Reittier zugeordnet")])
    : el("div", { class: "panel" }, [
        el("div", { class: "panel-title flex" }, [el("span", {}, "Reittier"), removeMountBtn]),
        el("div", { class: "companion-layout" }, [
          el("div", { class: "companion-portrait-col" }, [
            el("div", { class: "companion-name" }, m.name),
            el("div", { class: "armor-hero" }, [el("img", { src: m.img, alt: m.name }), el("span", { class: "badge-rs" }, `LeP ${m.lep.value}/${m.lep.max}`)]),
            el("div", { class: "armor-name" }, m.type),
          ]),
          el("div", { class: "companion-stats-col" }, [
            el("div", { class: "appearance-row" }, [el("span", { class: "k" }, "Gangart"), alwaysSelect(HORSE_SPEED_OPTIONS, m.speedKey, (v) => { m.speedKey = v; renderContent(); })]),
            el("div", { class: "appearance-row" }, [el("span", { class: "k" }, "Reitweise"), alwaysSelect(RIDING_MODE_OPTIONS, m.ridingMode, (v) => { m.ridingMode = v; renderContent(); })]),
            row("Höchstgeschwindigkeit", String(m.maxSpeed)),
            row("Initiative", String(m.initiative)),
            el("div", { class: "appearance-row" }, [el("span", { class: "k" }, "Loyalität"), el("span", { class: "loyalty-inline" }, [probeDice(m.loyalty.probe, "Loyalität"), el("span", { class: "big" }, String(m.loyalty.value))])]),
          ]),
        ]),
      ]);

  const summonHeader = COMPANIONS.canSummon
    ? (() => {
        const btn = el("button", { type: "button", class: "title-icon-btn", title: "Beschwörung starten" }, "🎩");
        const favs = COMPANIONS.conjurationFavorites.length
          ? el("div", { class: "companion-skill-grid" }, COMPANIONS.conjurationFavorites.map((f) => el("span", { class: "companion-slot", title: f.name }, [el("img", { src: f.img, alt: "" })])))
          : null;
        return el("div", { class: "panel-title-actions" }, favs ? [favs, btn] : [btn]);
      })()
    : null;

  return el("div", {}, [
    mountPanel,
    companionSection("Vertraute", COMPANIONS.companions.filter((c) => c.category === "familiar")),
    companionSection("Tierische Begleiter", COMPANIONS.companions.filter((c) => c.category === "regular")),
    companionSection("Beschworene Kreaturen", COMPANIONS.summoned, summonHeader),
  ]);
}

// Titelblatt (TITELBLATT.md) — eigenständige Startseite, die es im echten DSA5-Systembogen nicht gibt. Dritte
// Iteration 2026-09-14: Name/Badges/AP stehen weiter in der Kopfzeile (.head), die auf diesem Tab jetzt deutlich
// kleiner ausfällt, weil Porträt UND LeP/AsP/KaP/Schips in eine eigene, durchgehend dunkle linke Leiste
// (#coverSidebar in index.html) umgezogen sind — optisch identisch zur Kopfzeile (gleiches --head-Gradient) und
// nahtlos darunter anschließend, siehe [data-tab="cover"] in style.css. Nutzer-Feedback: "Die linke Leiste soll
// genau so aussehen wie der Header und nahtlos darin übergehen. So kann der Header deutlich kleiner sein, da nur
// der Name dort enthalten ist und das Portrait mit in die linke Leiste integriert wird." Das Porträt-Element
// (id="portrait") wird dafür per DOM-Umzug (kein zweites Element) zwischen .head-inner und #coverSidebar hin-
// und hergeschoben, siehe renderContent() unten. Die Leiste zeigt darunter Zustände/Aktive Effekte (wiederver-
// wendet aus buildConditionsPanel/buildActiveEffectsPanel); der normale Content-Bereich rechts zeigt nur noch
// die Favoriten-Übersicht (Sterne aus Talente/Kampf/Magie/Religion, siehe favStar()).

// Kurze Item-Vorschau im bestehenden Modal (openModal()), analog zu openBagModal() — der Click-Dummy hat keine
// echten Foundry-Dokumente, daher nur Bild+Beschreibungstext statt eines vollständigen Item-Sheets. Wird von den
// anklickbaren Spezies-/Kultur-/Profession-Badges in der Kopfzeile aufgerufen (renderHeadBadges()).
function openIdentityModal(data) {
  const closeBtn = el("button", { type: "button", class: "modal-close" }, "✕");
  closeBtn.addEventListener("click", closeModal);
  openModal(
    el("div", { class: "panel" }, [
      el("div", { class: "panel-title flex" }, [el("span", {}, data.name), closeBtn]),
      el("div", { class: "identity-modal-body" }, [el("img", { src: data.icon, alt: "" }), el("p", {}, data.desc)]),
    ]),
    { label: data.name }
  );
}

// IDEEN.md: simuliert den echten Foundry-FilePicker für das Kopfzeilen-Hintergrundbild — der Click-Dummy hat
// keinen echten Dateizugriff, zeigt daher statt eines Datei-Browsers eine feste Auswahl vorhandener
// DSA5-System-Assets (A.bgHeaderOptions in assets-map.js) als Kachel-Raster, analog zu openBagModal()/
// openIdentityModal(). Klick auf eine Kachel setzt HEADER_BG_IMG direkt und rendert die Kopfzeile neu.
function openHeaderBgPicker() {
  const closeBtn = el("button", { type: "button", class: "modal-close" }, "✕");
  closeBtn.addEventListener("click", closeModal);

  const grid = el(
    "div",
    { class: "filepicker-grid" },
    A.bgHeaderOptions.map((opt) => {
      const tile = el("button", { type: "button", class: "filepicker-tile" }, [el("img", { src: opt.img, alt: "" }), el("span", {}, opt.label)]);
      tile.addEventListener("click", () => {
        HEADER_BG_IMG = opt.img;
        closeModal();
        renderHeader();
      });
      return tile;
    })
  );

  const clearBtn = el("button", { type: "button", class: "fav-remove-btn" }, "Kein Hintergrundbild");
  clearBtn.addEventListener("click", () => {
    HEADER_BG_IMG = null;
    closeModal();
    renderHeader();
  });

  openModal(
    el("div", { class: "panel" }, [el("div", { class: "panel-title flex" }, [el("span", {}, "Hintergrundbild wählen"), closeBtn]), grid, clearBtn]),
    { label: "Hintergrundbild wählen" }
  );
}

function initHeaderBgPicker() {
  document.getElementById("headerBgBtn").addEventListener("click", openHeaderBgPicker);
}

// Ersetzt die früher statischen <span class="badge"> in index.html (#headBadges) — dieselbe Optik, aber
// anklickbar (öffnet die Item-Vorschau oben). Einmalig beim Laden gefüllt, siehe initHeadBadges() unten.
function identityBadge(data) {
  const btn = el("button", { type: "button", class: "badge", title: data.name }, data.name);
  btn.addEventListener("click", () => openIdentityModal(data));
  return btn;
}

// Heldenerschaffung (Issue #10): im Modul steht der Knopf statt der Spezies, solange der Held keine Spezies hat und
// der Charakterbauer (dsa5-core) installiert ist. Im Click-Dummy per ?chargen in der URL zu sehen.
const SHOW_CHARGEN = new URLSearchParams(location.search).has("chargen");

function chargenButton() {
  const btn = el("button", { type: "button", class: "badge chargen", title: "Charakterbauer starten" }, "✎ Heldenerschaffung");
  btn.addEventListener("click", () => alert("Im Modul öffnet sich hier der Charakterbauer des DSA5-Systems."));
  return btn;
}

function initHeadBadges() {
  const wrap = document.getElementById("headBadges");
  wrap.appendChild(SHOW_CHARGEN ? chargenButton() : identityBadge(IDENTITY.species));
  [IDENTITY.culture, IDENTITY.career].forEach((d) => wrap.appendChild(identityBadge(d)));
}

// Sammelt alle per favStar() markierten Einträge aus genau den vier auf dem Titelblatt geforderten Kategorien
// (TITELBLATT.md: "Favoriten (Auswahl Talente, Waffen, Zauber, Liturgien)"). Rituale/Zeremonien zählen als
// Unterarten von Zauber/Liturgie mit dazu, da sie in denselben Proben-Tabellen stehen (siehe magicRow()).
function collectFavorites() {
  return {
    talents: SKILL_GROUPS.flatMap((g) => g.items.filter((s) => s.fav)),
    weapons: [...MELEE, ...RANGED].filter((w) => w.fav),
    spells: [...SPELLS, ...RITUALS].filter((s) => s.fav),
    liturgies: [...LITURGIES, ...CEREMONIES].filter((l) => l.fav),
  };
}

// Favoriten-Zeile (Paket E, UI/UX-Review 2026-09-25 Punkt 5 + GitHub-Issue #5): statt unterschiedlich langer
// Etiketten ein gemeinsames Raster — feste Bereiche für Bild | Name | Wert | Probe | Stern, lange Namen brechen um,
// Wert und Würfel bleiben an ihrem Platz. Waffen zeigen ihre Werte beschriftet ("AT", "TP"). Die bestehende
// Entscheidung "Bild + Name + Stern + Wert + klickbare Würfel, kein Hover-Aufklappen" bleibt unverändert; im
// echten Modul lösen die Würfel echte Proben/Angriffe aus (skillSelect/chRollCombat, favorite-values.hbs).
function favCard(item, kind) {
  const icon = el("img", { class: "fav-card-icon", src: item.img, alt: "" });
  const name = el("span", { class: "fav-card-name" }, item.name);
  let value;
  let roll;
  if (kind === "weapon") {
    const ranged = RANGED.includes(item);
    const stats = ranged ? effectiveRangedStats(item) : effectiveMeleeStats(item);
    const atLabel = `${ranged ? "Fernkampf" : "Attacke"} mit ${item.name} würfeln`;
    const atDie = el("button", { type: "button", class: "probe-die fav-chip-roll", style: dieBg("d20mu"), title: atLabel, "aria-label": atLabel }, String(stats.at));
    atDie.addEventListener("click", () => flashNotice(`🎲 ${atLabel}`));
    roll = el("span", { class: "fav-card-roll fav-card-weapon" }, [el("small", {}, ranged ? "FK" : "AT"), atDie]);
    const dmgLabel = `Schaden von ${item.name} würfeln (${item.tp})`;
    const dmg = el("button", { type: "button", class: "damage-roll", title: dmgLabel, "aria-label": dmgLabel }, [el("small", {}, "TP"), item.tp]);
    dmg.addEventListener("click", () => flashNotice(`🎲 ${dmgLabel}`));
    value = el("span", { class: "fav-card-value" }, [dmg]);
  } else {
    value = el("span", { class: "fav-card-value", title: "Fertigkeitswert" }, String(item.fw));
    const dice = probeDice(item.probe, item.name);
    dice.classList.add("fav-chip-roll");
    roll = el("span", { class: "fav-card-roll" }, [dice]);
  }
  // Reihenfolge Name | Probe | Wert | Stern (Nutzer-Feedback 2026-09-28); Waffen: AT/FK-Würfel als Probe, TP als Wert.
  return el("div", { class: "fav-card" }, [icon, name, roll, value, favStar(item)]);
}

// Ein Panel "Favoriten" mit einer Unterüberschrift je Kategorie (Talente/Waffen/Zauber/Liturgien), analog zu
// specialsBlock()/traitsPanel — leere Kategorien werden weggelassen (wie bei specialsBlock), ein Gesamt-
// Platzhalter erscheint nur, wenn wirklich noch gar nichts markiert wurde.
function favoritesPanel() {
  const fav = collectFavorites();
  const groups = [
    { label: "Talente", items: fav.talents, kind: "talent" },
    { label: "Waffen", items: fav.weapons, kind: "weapon" },
    { label: "Zauber", items: fav.spells, kind: "spell" },
    { label: "Liturgien", items: fav.liturgies, kind: "liturgy" },
  ];
  const active = groups.filter((g) => g.items.length);
  return el("div", { class: "panel" }, [
    el("div", { class: "panel-title" }, "Favoriten"),
    ...(active.length
      ? active.flatMap((g) => [el("div", { class: "subhead" }, g.label), el("div", { class: "fav-grid" }, g.items.map((it) => favCard(it, g.kind)))])
      : [el("div", { class: "drop-zone" }, "Noch keine Favoriten markiert — Stern bei Talenten, Waffen, Zaubern oder Liturgien anklicken")]),
  ]);
}

function resourceByLabel(label) {
  return RESOURCES.find((r) => r.label === label);
}

// Eine LeP/AsP/KaP-Ressourcenleiste (Füllstand + "Aktuell / Max"-Zahl) — von renderHeader() (Kopfzeile) UND
// coverResourcesBlock() (Titelblatt-Leiste) genutzt, da beide dieselben RESOURCES-Werte zeigen (siehe Kommentar
// über #coverSidebar in index.html). Der aktuelle Wert ist laut BEARBEITEN.md in BEIDEN Modi editierbar (anders
// als z.B. die Mod/Zukauf-Felder auf dem Eigenschaften-Tab, die nur im Bearbeiten-Modus editierbar wirken) —
// daher hier fest verdrahtet statt über die dortigen editMod-Flags gesteuert.
function vitalBar(cls, label, prefix) {
  const r = resourceByLabel(label);
  const pct = Math.max(0, Math.min(100, Math.round((r.wert / r.max) * 100)));
  const valSpan = el("span", {}, String(r.wert));
  // Präfix (LeP/AsP/KaP) und Wert als getrennte Spans mit eigenem Gap (.bar-label), statt nur durch ein
  // Leerzeichen getrennter Text — Nutzer-Feedback 2026-09-14: "steht viel zu nah an den Werten".
  const labelEl = el("div", { class: "bar-label" }, [
    el("span", { class: "bar-label-prefix" }, prefix),
    el("span", { class: "bar-label-value" }, [valSpan, " / " + r.max]),
  ]);
  valSpan.dataset.fkey = `res:${prefix}`;
  makeEditable(valSpan, r.wert, (n) => { r.wert = n; renderHeader(); renderContent(); }, { type: "number", min: 0, max: r.max });
  return el("div", { class: "bar " + cls }, [el("div", { class: "bar-fill", style: `width:${pct}%` }), labelEl]);
}

// Testschalter (initOnlyLepToggle()): Vorschau einer Figur ohne Astral-/Karmaenergie (kein Zauberer/Geweihter) —
// rein visuell, blendet AsP/KaP in der Ressourcengruppe aus, ändert RESOURCES in data.js nicht.
let ONLY_LEP = false;

// Gemeinsamer Baustein für die LeP/AsP/KaP-Ressourcengruppe (Kopfzeile UND Titelblatt-Leiste, siehe vitalBar()-
// Kommentar) — jede Leiste steckt einzeln in einer eigenen goldgerahmten .res-card (.resource-frame/.res-card in
// style.css), dazu ein gemeinsamer Regenerations-Button. `colLayout` schaltet zwischen Zeilen- (Kopfzeile) und
// Spalten-Anordnung (schmale Titelblatt-Leiste) um.
function resourceGroup(colLayout) {
  const cards = [el("div", { class: "res-card res-lep" }, [vitalBar("bar-lep", "Lebenskraft", "LeP")])];
  if (!ONLY_LEP) {
    cards.push(el("div", { class: "res-card res-asp" }, [vitalBar("bar-asp", "Astralenergie", "AsP")]));
    cards.push(el("div", { class: "res-card res-kap" }, [vitalBar("bar-kap", "Karmaenergie", "KaP")]));
  }
  return el("div", { class: "resource-frame" + (colLayout ? " resource-frame-col" : "") }, [
    ...cards,
    el("button", { type: "button", class: "regen-btn", title: "Regeneration (LeP/AsP/KaP)" }, "☾"),
  ]);
}

// Schicksalspunkte-Symbolreihe (Kopfzeile UND Titelblatt-Leiste, siehe vitalBar()-Kommentar). Zeigt max Symbole,
// davon `used` ausgeblichen (bereits ausgegeben) — Klick auf ein Symbol schaltet es zwischen verfügbar/
// ausgegeben um (analog zu favStar()'s Klick-Umschaltung direkt auf dem Datenobjekt).
function fatePointsRow() {
  const r = resourceByLabel("Schicksalspunkte");
  const used = r.used || 0;
  const avail = r.max - used;
  const wrap = el("div", { class: "fate-points", role: "group", "aria-label": `Schicksalspunkte: ${avail} von ${r.max} verfügbar` });
  // Jeder Punkt ist ein echter <button> mit Zustand + Handlung im Label (UI/UX-Review 2026-09-25, Punkt 4).
  for (let i = 0; i < r.max; i++) {
    const isUsed = i >= r.max - used;
    const label = `${isUsed ? "Schicksalspunkt wiederherstellen" : "Schicksalspunkt ausgeben"} (${avail} von ${r.max} verfügbar)`;
    const btn = el("button", { type: "button", class: "fate-point-btn", title: label, "aria-label": label, "data-fkey": `fate:${i}` }, [
      el("img", { src: `../../../systems/dsa5/icons/${isUsed ? "gray_schip" : "schip"}.webp`, alt: "", class: isUsed ? "dim" : "" }),
    ]);
    btn.addEventListener("click", () => {
      r.used = isUsed ? used - 1 : used + 1;
      renderHeader();
      renderContent();
    });
    wrap.appendChild(btn);
  }
  return wrap;
}

// LeP/AsP/KaP/Schips auf der dunklen Titelblatt-Leiste (#coverSidebar) — dieselben Bausteine wie die Kopfzeile
// (resourceGroup()/fatePointsRow()), direkt auf dem dunklen Grund (kein eigenes .panel nötig, .bar/.bar-fill/
// .bar-label/.resource-frame/.res-card/.regen-btn sind ohnehin schon für diesen Untergrund gestaltet, siehe .head
// weiter oben in style.css).
function coverResourcesBlock() {
  return el("div", { class: "cover-resources" }, [
    resourceGroup(true),
    fatePointsRow(),
  ]);
}

// Kopfzeile (Charaktername + LeP/AsP/KaP-Leisten + Schicksalspunkte): einzige Stelle, die #headName/#bars/
// #fatePoints (index.html) befüllt — anders als der übrige Bogeninhalt liegt die Kopfzeile außerhalb von
// #content und wird daher nicht von renderContent() mit erneuert, sondern separat bei jeder Änderung aufgerufen
// (Werteditor-Commits, Modus-Umschalter). Name ist nur im Bearbeiten-Modus editierbar (BEARBEITEN.md
// Kopf-Abschnitt), die übrigen Werte in beiden Modi.
function renderHeader() {
  const restoreFocus = rememberFocus();
  const mode = document.querySelector(".sheet").getAttribute("data-mode");

  // IDEEN.md: optionales Hintergrundbild (HEADER_BG_IMG in data.js) — .has-bg blendet .head-bg-layer/
  // .head-bg-fade ein (siehe style.css), sonst bleibt die normale --head-Farbe wie bisher.
  const head = document.querySelector(".head");
  head.classList.toggle("has-bg", !!HEADER_BG_IMG);
  document.getElementById("headBgLayer").style.backgroundImage = HEADER_BG_IMG ? `url('${HEADER_BG_IMG}')` : "";

  const headName = document.getElementById("headName");
  headName.innerHTML = "";
  const h1 = el("h1", {}, CHARACTER_NAME);
  headName.appendChild(h1);
  if (mode === "edit") makeEditable(h1, CHARACTER_NAME, (v) => { CHARACTER_NAME = v; renderHeader(); }, { type: "text" });

  const bars = document.getElementById("bars");
  bars.innerHTML = "";
  bars.appendChild(resourceGroup(false));

  const fp = document.getElementById("fatePoints");
  fp.innerHTML = "";
  fp.appendChild(fatePointsRow());

  document.getElementById("apText").textContent = `AP ${formatNum(EXPERIENCE.total)} · ${formatNum(experienceAvailable())} frei`;
  restoreFocus();
}

// Befüllt #coverSidebar (Porträt + Werte + Status) und verschiebt das einzige Porträt-Element aus der Kopfzeile
// hierher. Wird von renderContent() bei jedem Wechsel auf/innerhalb des Titelblatts aufgerufen; leaveCoverSidebar()
// unten holt das Porträt beim Verlassen des Tabs wieder in die Kopfzeile zurück.
function renderCoverSidebar() {
  const sidebar = document.getElementById("coverSidebar");
  const portrait = document.getElementById("portrait");
  sidebar.innerHTML = "";
  sidebar.appendChild(portrait);
  sidebar.appendChild(coverResourcesBlock());
  sidebar.appendChild(buildConditionsPanel(4));
  sidebar.appendChild(buildActiveEffectsSummary());
}

// Gegenstück zu renderCoverSidebar(): Porträt zurück an seinen Stammplatz in der Kopfzeile, bevor die (dann
// wieder leere) Leiste beim nächsten Cover-Aufruf neu befüllt wird.
function leaveCoverSidebar() {
  const portrait = document.getElementById("portrait");
  const headInner = document.querySelector(".head-inner");
  if (portrait.parentElement !== headInner) headInner.prepend(portrait);
}

function renderCover() {
  return favoritesPanel();
}

// Steigerungsplaner (GitHub-Issue #17): im Modul ein eigener Reiter, wenn „Lyynix: DSA5 - Steigerungsplaner“ aktiv
// ist (Inhalt = dessen Template, Optik auf unsere Panels umgestellt). Im Click-Dummy per ?planner in der URL zu sehen,
// mit festen Demo-Schritten. Geplant wird im Modul per Shift-Klick auf „+“/„−“ im Bearbeiten-Modus (der Planer).
const SHOW_PLANNER = new URLSearchParams(location.search).has("planner");
if (SHOW_PLANNER) TABS.push({ id: "steigerungsplaner", label: "Steigerungsplaner", icon: A.career, title: "Steigerungsplaner", hint: "" });
const step = (from, to, cost) => ({ from, to, cost });
const PLANNER_DEMO = [
  { label: "Eigenschaften", groups: [{ label: "Mut", icon: ICONS + "/dice/d20mu.svg", steps: [step(13, 14, 15)] }] },
  { label: "Körpertalente", groups: [
    { label: "Körperbeherrschung", icon: A.tabSkills, steps: [step(8, 9, 4), step(9, 10, 4), step(10, 11, 4)] },
    { label: "Klettern", icon: A.tabSkills, steps: [step(4, 5, 2)] },
  ] },
  { label: "Zauber", groups: [{ label: "Balsam Salabunde", icon: A.tabMagic, steps: [step(7, 8, 6), step(8, 9, 6), step(9, 10, 6), step(10, 11, 6)] }] },
];

function renderPlanner() {
  const free = EXPERIENCE.total - EXPERIENCE.spent;
  const sections = PLANNER_DEMO.map((s) => ({ ...s, groups: s.groups.filter((g) => g.steps.length) })).filter((s) => s.groups.length);
  const total = sections.reduce((sum, s) => sum + s.groups.reduce((t, g) => t + g.steps.reduce((u, st) => u + st.cost, 0), 0), 0);
  const groupRow = (g) => {
    let left = free;
    let reachable = true;
    const tiles = g.steps.map((st, i) => {
      reachable = reachable && st.cost <= left;
      if (reachable) left -= st.cost;
      const tile = el("button", { type: "button", class: "planner-step" + (reachable ? "" : " unaffordable"), title: "Schritte bis hier anwenden" }, [el("span", { class: "planner-step-values" }, `${st.from} » ${st.to}`), el("span", { class: "planner-step-cost" }, `${st.cost} AP`)]);
      tile.addEventListener("click", () => { g.steps.splice(0, i + 1); renderContent(); });
      return tile;
    });
    const discard = el("button", { type: "button", class: "planner-discard", "aria-label": `Geplante Steigerungen für ${g.label} verwerfen` }, "🗑");
    discard.addEventListener("click", () => { g.steps.length = 0; renderContent(); });
    return el("div", { class: "row planner-row" }, [el("img", { src: g.icon, alt: "" }), el("span", { class: "left" }, g.label), el("span", { class: "planner-steps" }, tiles), discard]);
  };
  return el("div", { class: "planner-tab" }, [
    el("div", { class: "planner-summary" }, [el("span", {}, `Verfügbare AP: ${free}`), el("span", {}, `Geplante Kosten: ${total}`)]),
    ...(sections.length
      ? sections.map((s) => el("div", { class: "panel" }, [el("div", { class: "panel-title" }, s.label), ...s.groups.map(groupRow)]))
      : [el("p", { class: "panel planner-empty" }, "Keine Steigerungen geplant. Shift-Klick auf + im Charakterbogen um eine zu planen.")]),
  ]);
}

const RENDERERS = {
  cover: renderCover,
  main: renderMain,
  skills: renderSkills,
  combat: renderCombat,
  magic: renderMagic,
  religion: renderReligion,
  inventory: renderInventory,
  status: renderStatus,
  notes: renderNotes,
  companions: renderCompanions,
  steigerungsplaner: renderPlanner,
};

function renderContent() {
  const restoreFocus = rememberFocus();
  const content = document.getElementById("content");
  content.innerHTML = "";
  content.appendChild(RENDERERS[currentTab]());
  // Porträt+Werte+Status leben nur auf dem Titelblatt in #coverSidebar (siehe renderCoverSidebar()) — beim
  // Verlassen des Tabs holt leaveCoverSidebar() das Porträt zurück in die Kopfzeile.
  if (currentTab === "cover") renderCoverSidebar();
  else leaveCoverSidebar();
  restoreFocus();
}

// Tastaturfokus über ein Neu-Rendern retten (UI/UX-Review 2026-09-25, Punkt 4): Knöpfe mit data-fkey (Stepper,
// Schicksalspunkte, Favoritensterne) werden nach dem Neuaufbau über Schlüssel + Position wiedergefunden — sonst
// landet der Fokus nach jedem +/− wieder am Seitenanfang.
function rememberFocus() {
  const active = document.activeElement;
  const key = active?.dataset?.fkey;
  if (!key) return () => flashChanged();
  pendingFlash = key;
  const sel = `[data-fkey="${CSS.escape(key)}"]`;
  const idx = [...document.querySelectorAll(sel)].indexOf(active);
  return () => {
    if (document.activeElement?.dataset?.fkey !== key) document.querySelectorAll(sel)[idx]?.focus();
    flashChanged();
  };
}

// Kurzes Aufleuchten der geänderten Zeile/des geänderten Werts nach einer Änderung (UI/UX-Review 2026-09-25,
// Punkt 9). pendingFlash setzt rememberFocus() (Knöpfe mit data-fkey) bzw. makeEditable() beim Übernehmen;
// renderHeader() und renderContent() laufen oft direkt nacheinander, deshalb wird der Schlüssel erst im nächsten
// Tick gelöscht.
let pendingFlash = null;
function flashChanged() {
  if (!pendingFlash) return;
  const key = pendingFlash;
  document.querySelectorAll(`[data-fkey="${CSS.escape(key)}"]`).forEach((node) => {
    const target = node.closest(".list-row, .row, .bar, .fate-points, .companion-loyalty-row") || node;
    target.classList.remove("just-changed");
    void target.offsetWidth;
    target.classList.add("just-changed");
  });
  setTimeout(() => { if (pendingFlash === key) pendingFlash = null; }, 0);
}

// Befüllt #attrOverlay (siehe index.html) mit denselben Werten wie buildAttrTiles(), nur kompakter
// (.attr-die-mini) — auf jedem Tab sichtbar AUSSER dem Eigenschaften-Tab selbst (dort stehen die Eigenschaften
// bereits fest als volle Kacheln, Nutzer-Feedback 2026-09-15: "Baue die Eigenschaftswürfel überall ein, nur auf
// der Eigenschaftenseite nicht"). Auf dem Titelblatt bekommt #attrOverlay über
// [data-tab="cover"] #attrOverlay{grid-area:attrbar} (style.css) eine eigene Grid-Zeile zwischen Kopf und
// Tab-Titel, sonst würde es dort in die Grid-Spalte von #coverSidebar rutschen.
function renderAttrOverlay() {
  const host = document.getElementById("attrOverlay");
  if (!host) return;
  const show = currentTab !== "main";
  host.classList.toggle("show", show);
  host.innerHTML = "";
  if (!show) return;
  ATTRS.forEach((a) => {
    const value = a.initial + a.adv + a.mod;
    // Würfel-Icon als echtes Kind-Element (.attr-die-mini-face), nicht als eigener Hintergrund von
    // .attr-die-mini — siehe Kommentar bei .attr-die-mini in style.css (Hover-Zoom-Bug mit der Wachssiegel-
    // Fassung, Nutzer-Feedback 2026-09-15 dritte Runde).
    host.appendChild(
      makeRollable(
        el("span", { class: "attr-die-mini" }, [el("span", { class: "attr-die-mini-face", style: dieBg(a.die) }, String(value))]),
        `Probe auf ${ATTR_LABELS[a.k]} (${value}) würfeln`
      )
    );
  });
}

function initThemeToggle() {
  const sheet = document.querySelector(".sheet");
  const btn = document.getElementById("themeToggle");
  btn.addEventListener("click", () => {
    const dark = sheet.getAttribute("data-theme") === "dark";
    sheet.setAttribute("data-theme", dark ? "light" : "dark");
    btn.textContent = dark ? "Dunkles Thema" : "Helles Thema";
  });
}

// Spielmodus (schlank, nur Spielwerte) vs. Bearbeiten-Modus (zusätzliche/editierbare Detailwerte, z.B. Eigenschaften-Aufschlüsselung).
function initModeSwitch() {
  const sheet = document.querySelector(".sheet");
  const switcher = document.getElementById("modeSwitch");
  switcher.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-mode]");
    if (!btn) return;
    sheet.setAttribute("data-mode", btn.dataset.mode);
    switcher.querySelectorAll("button").forEach((b) => {
      b.classList.toggle("active", b === btn);
      b.setAttribute("aria-pressed", String(b === btn));
    });
    // Mehrere Editierbarkeiten hängen vom Modus ab (Name in der Kopfzeile, Mod/Zukauf/Trefferzone/Löschen im
    // Content-Bereich) und müssen beim Umschalten sofort neu gerendert werden, nicht erst beim nächsten Klick.
    renderHeader();
    renderContent();
  });
}

// Fensterrahmen + Titelleiste (GitHub-Issue #22, Nutzer-Entscheidung 2026-10-01): Nachbau des Systemrahmens mit
// breiterem oberem Band (styles/dsa5-helpers-frame.svg, wie im Modul), Knöpfe in einer aufgesetzten Plakette.
// Ziehen an der Plakette und am oberen Rahmenband (der Rand gehört der .sheet: Ereignisziel ist sie selbst, die
// Höhe prüft der Abstand zur Innenkante), Doppelklick minimiert — wie im Modul über Foundrys .window-header.
function initWindowFrame() {
  const sheet = document.querySelector(".sheet");
  const chrome = sheet.querySelector(".fake-window-chrome");
  chrome.querySelector(".fwc-title").textContent = CHARACTER_NAME;
  const onTopBorder = (ev) => ev.target === sheet && ev.clientY < sheet.getBoundingClientRect().top + parseFloat(getComputedStyle(sheet).borderTopWidth);
  const isHandle = (ev) => !ev.target.closest("button") && (chrome.contains(ev.target) || onTopBorder(ev));
  let drag = null;
  sheet.addEventListener("pointerdown", (ev) => {
    if (ev.button !== 0 || !isHandle(ev)) return;
    const [x, y] = (sheet.style.translate || "0px 0px").split(" ").map(parseFloat);
    drag = { sx: ev.clientX, sy: ev.clientY, x: x || 0, y: y || 0 };
    ev.preventDefault();
  });
  document.addEventListener("pointermove", (ev) => {
    if (drag) sheet.style.translate = `${drag.x + ev.clientX - drag.sx}px ${drag.y + ev.clientY - drag.sy}px`;
  });
  document.addEventListener("pointerup", () => { drag = null; });
  sheet.addEventListener("dblclick", (ev) => {
    if (isHandle(ev)) sheet.classList.toggle("minimized");
  });
}

// Fenstermenü „⋮“ (GitHub-Issue #21, Variante A): wie im Modul (_getHeaderControls) ein Eintrag, der den Reiter
// Gefährten für diesen Helden aus-/einblendet — im Modul als Actor-Flag hideCompanionTab gespeichert.
let companionTabHidden = false;

function initWindowMenu() {
  const btn = document.getElementById("windowMenuBtn");
  btn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    document.querySelector(".fwc-menu")?.remove();
    const item = el("button", { type: "button" }, companionTabHidden ? "🐾 Reiter Gefährten einblenden" : "🚫 Reiter Gefährten ausblenden");
    const menu = el("div", { class: "fwc-menu", role: "menu" }, [item]);
    item.addEventListener("click", () => {
      menu.remove();
      companionTabHidden = !companionTabHidden;
      if (companionTabHidden && currentTab === "companions") setTab("cover");
      else renderRail();
    });
    btn.closest(".fake-window-chrome").appendChild(menu);
    setTimeout(() => document.addEventListener("click", () => menu.remove(), { once: true }));
  });
}

// Testschalter "Nur LeP" (#onlyLepToggle in index.html) — siehe ONLY_LEP/resourceGroup()-Kommentar.
function initOnlyLepToggle() {
  const btn = document.getElementById("onlyLepToggle");
  btn.addEventListener("click", () => {
    ONLY_LEP = !ONLY_LEP;
    btn.classList.toggle("active", ONLY_LEP);
    btn.setAttribute("aria-pressed", String(ONLY_LEP));
    renderHeader();
    renderContent();
  });
}

// Ziehgriff unten rechts wie am Foundry-Fenster (Nutzerwunsch 2026-09-25): Standardgröße bleibt 770×740 (style.css
// .sheet), der Griff setzt nur width/height inline; Doppelklick stellt die Standardgröße wieder her. Die Breite
// wächst doppelt so schnell wie die Mausbewegung, weil .sheet-wrap Bogen + Rail zentriert (die rechte Kante wandert
// sonst nur um die halbe Strecke mit).
function initSheetResize() {
  const sheet = document.querySelector(".sheet");
  const handle = el("div", { class: "sheet-resize", title: "Größe ändern (Doppelklick: Standardgröße)" });
  sheet.appendChild(handle);
  handle.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    const start = { x: e.clientX, y: e.clientY, w: sheet.offsetWidth, h: sheet.offsetHeight };
    const move = (ev) => {
      sheet.style.width = `${Math.max(560, start.w + 2 * (ev.clientX - start.x))}px`;
      sheet.style.height = `${Math.max(480, start.h + ev.clientY - start.y)}px`;
    };
    const up = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
  });
  handle.addEventListener("dblclick", () => {
    sheet.style.width = "";
    sheet.style.height = "";
  });
}

// Munitionsmenü (renderAmmoCell) schließt sich bei jedem Klick außerhalb, wie ein normales Dropdown.
function initAmmoMenuOutsideClick() {
  document.addEventListener("click", () => {
    if (openAmmoWeapon) {
      openAmmoWeapon = null;
      renderContent();
    }
  });
}

function initModalEscape() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

setTab(currentTab);
initHeadBadges();
renderHeader();
initThemeToggle();
initModeSwitch();
initOnlyLepToggle();
initWindowMenu();
initWindowFrame();
initSkillScrollSpy();
initSheetResize();
initHeaderBgPicker();
initAmmoMenuOutsideClick();
initModalEscape();
