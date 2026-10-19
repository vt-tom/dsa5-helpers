// VORLÄUFIG – Entwürfe für die ausgerüsteten Waffen (Issue #40, 2026-10-19).
// Ersetzt handSlot() aus script.js durch eine Hülle: die Original-Hand wird gebaut (Auswahl, Griffwechsel, Seiten-
// wechsel, Fernkampf-Extras behalten ihre Listener) und für die Varianten D/E/F in eine neue Karte umgehängt.
// Umschalter unten links (oder ?hand=d|e|f), gemerkt in localStorage. Nach der Wahl des Nutzers wandert die gewählte
// Variante nach script.js/style.css und diese Datei samt hand-variants.css wird gelöscht.

// Echte Waffenbilder aus dsa5-core statt der Kategorie-Symbole, damit sich die Bildwirkung beurteilen lässt.
const HV_CORE = "../../dsa5-core/icons";
const HV_IMAGES = {
  "Elfischer Säbel": HV_CORE + "/meleeweapon/Saebel.webp",
  "Waldläuferdolch": HV_CORE + "/meleeweapon/Dolch.webp",
  "Elfenbogen": HV_CORE + "/rangeweapon/Elfenbogen.webp",
};
[...MELEE, ...RANGED].forEach((w) => { if (HV_IMAGES[w.name]) w.img = HV_IMAGES[w.name]; });
// Für den Vergleich: Dolch in der Nebenhand, damit beide Hände eine Karte zeigen (Bogen über ⇄ wählbar).
const hvDagger = MELEE.find((w) => w.name === "Waldläuferdolch");
if (hvDagger) { hvDagger.worn.offHand = true; HANDS.ready = false; }

const HV_VARIANTS = [
  ["x", "Jetzt"],
  ["d", "D Waffenschild"],
  ["e", "E Vitrine"],
  ["f", "F Banner"],
];
let HAND_VARIANT = (() => {
  const q = new URLSearchParams(location.search).get("hand");
  if (HV_VARIANTS.some(([id]) => id === q)) return q;
  try { return localStorage.getItem("dsa5h-hand-variant") || "d"; } catch { return "d"; }
})();

const hvOriginalHandSlot = handSlot;
// eslint-disable-next-line no-global-assign
handSlot = function (hand) {
  const slot = hvOriginalHandSlot(hand);
  const w = HANDS[hand];
  if (HAND_VARIANT === "x" || !w || slot.classList.contains("hand-slot-free")) return slot;
  return hvCard(slot, w, hand);
};

function hvCard(slot, w, hand) {
  const ranged = RANGED.includes(w);
  const pick = (sel) => slot.querySelector(sel);
  const handLabel = pick(".figure-col-title")?.textContent ?? "";
  const icon = pick(".hand-tile > .item-icon, .hand-tile > img");
  const onUse = pick(".hand-tile > .onuse-btn");
  const at = pick(".hand-tile-at");
  const pa = pick(".hand-tile-pa");
  const ct = pick(".ct-link");
  const side = pick(".hand-slot-side");
  const rangedBox = side.querySelector(".hand-ranged");
  const tp = rangedBox ? rangedBox.querySelector(".damage-roll") : side.querySelector(".damage-roll");
  const extras = rangedBox?.querySelector(".hand-ranged-extras");
  const select = side.querySelector("select");
  const buttons = [...side.querySelectorAll(".hand-swap-btn")];

  const die = (seal, label) => (seal ? el("span", { class: "hv-die" }, [seal, el("small", {}, label)]) : null);
  const swapBox = el("label", { class: "hv-swap", title: "Andere Waffe in diese Hand" }, [el("span", { "aria-hidden": "true" }, "⇄"), select]);
  const sub = el("span", { class: "hv-sub" }, [ct, el("span", { class: "hv-reach" }, `RW ${w.reach}`)]);
  const name = el("span", { class: "hv-name" }, [el("span", {}, w.name), favStar(w)]);
  const media = el("div", { class: "hv-media" }, [
    HAND_VARIANT === "f" ? el("img", { class: "hv-watermark", src: w.img, alt: "", "aria-hidden": "true" }) : null,
    icon,
    onUse,
  ]);
  const stats = el("div", { class: "hv-stats" }, [
    die(at, ranged ? "FK" : "AT"),
    die(pa, "PA"),
    el("span", { class: "hv-tp" }, [el("small", {}, "TP"), tp]),
  ]);
  const card = el("div", { class: `hand-slot hv-card hv-${HAND_VARIANT}` + (ranged ? " hv-ranged" : "") }, [
    HAND_VARIANT === "f" ? el("img", { class: "hv-bg", src: w.img, alt: "", "aria-hidden": "true" }) : null,
    el("small", { class: "hv-hand" }, handLabel),
    swapBox,
    media,
    el("div", { class: "hv-info" }, [name, sub]),
    stats,
    extras || buttons.length ? el("div", { class: "hv-extra" }, [extras, ...buttons]) : null,
  ]);
  return card;
}

// Umschalter (nur Click-Dummy)
(function hvSwitcher() {
  const bar = el("div", { class: "hv-switcher", role: "group", "aria-label": "Entwurf Waffenkarte" }, [
    el("strong", {}, "Waffenkarte (#40):"),
    ...HV_VARIANTS.map(([id, label]) => {
      const b = el("button", { type: "button", "aria-pressed": String(id === HAND_VARIANT), "data-hv": id }, label);
      b.addEventListener("click", () => {
        HAND_VARIANT = id;
        try { localStorage.setItem("dsa5h-hand-variant", id); } catch { /* egal */ }
        bar.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.hv === id)));
        renderContent();
      });
      return b;
    }),
  ]);
  document.body.append(bar);
  renderContent();
})();
