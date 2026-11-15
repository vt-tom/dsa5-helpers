/* Händler- und Schatzbogen (Issues #77/#78, Click-Dummy Runde 1, 2026-11-13).

   Vorbild ist das System (DSA5 8.2, MerchantSheetMixin): Händler und Schatz sind kein eigener Akteurtyp, sondern
   system.merchant.merchantType = "merchant" | "loot" an NSC, Held oder Kreatur. Daraus folgen zwei Ansichten:
     - Besitzer/SL: der gewohnte Bogen (hier NSC bzw. Kreatur) bleibt, nur der Inventar-Reiter wird zum Reiter
       „Laden“ bzw. „Schatz“ mit den Abschnitten Bestand · Einstellungen (nur Händler) · Zugang (System: Unterreiter
       stock/shop/access in merchant-commerce.hbs). Bei uns Sprungmarken wie in allen Reitern (Issue #32).
     - Kunde (Spieler mit eingeschränktem Zugriff, oder SL mit Schalter „Kundensicht“, System playerView): nur
       Laden (+ Notizen beim Händler), System merchant_limited_header.hbs + merchant-limited.hbs bzw. -loot.hbs.
   Kundensicht in drei Varianten (Menü › Diese Seite, ?laden=a|b|c): A Kacheln wie im System, B Liste wie unser
   Inventar, C Ware und eigener Beutel nebeneinander. Kaufen, Verkaufen, Preise, Füllen und Ladentag kommen im
   Modul vom System (tradeWrapper, fillStock, applyDailyHide …); der Dummy zeigt nur die Bedienung.

   Aufruf: index.html?actor=haendler bzw. ?actor=schatz; Rolle (Menü › Ansicht) schaltet auf die Kundensicht.
   Wird vor actor-types.js geladen; actor-types.js übernimmt MERCHANT_TYPES in ACTOR_TYPES. Alle Namen, Preise und
   Texte sind frei erfundene Platzhalter. */

const MERCHANT_KIND = { haendler: "merchant", schatz: "loot" }[new URLSearchParams(location.search).get("actor")] || null;
const MERCHANT_VARIANT_PARAM = new URLSearchParams(location.search).get("laden");
let MERCHANT_VARIANT = ["a", "b", "c"].includes(MERCHANT_VARIANT_PARAM) ? MERCHANT_VARIANT_PARAM : "a";

const SHOP_IMG = (file) => `${ICONS}/categories/${file}`;
const MERCHANT = {
  shopName: MERCHANT_KIND === "loot" ? "Beute: Luchs" : "Schmiede am Grafenplatz",
  playerView: false, // System: document.system.playerView (SL sieht die Kundensicht)
  presentation: false, // System: merchant.presentationMode
  hideMoney: false,
  allowDetails: true,
  hidePlayer: false,
  locked: false, // nur Schatz: verschlossen
  temporary: true, // nur Schatz: nach dem Leeren löschen
  priceTier: 3,
  buyTier: 2,
  view: "cards", // Kundensicht: cards | list | log (System stall.viewMode)
  chip: "all",
  affordable: false,
  specials: false,
  sort: "featured",
  query: "",
  sellMode: false, // Verkaufen bzw. beim Schatz „Hineinlegen“ (System: sellMode / setLootInventory)
  wallet: { d: 4, s: 37, h: 12, k: 5 },
  buyer: { name: "Alrik Grimmwald", img: `${ICONS}/categories/Weltliche.webp`, wallet: { d: 1, s: 14, h: 6, k: 0 } },
  players: [["Spieler 1 (Alrik)", "Begrenzt"], ["Spieler 2 (Yasmina)", "Begrenzt"], ["Spieler 3 (Gerion)", "Keine"]],
  categories: [["Waffen", true], ["Rüstungen", true], ["Werkzeug", true], ["Kleidung", false], ["Proviant", true], ["Alchimie", false], ["Kräuter", false], ["Bücher", false]],
  log: [
    ["Gestern", "Yasmina kauft Wurfmesser (2)", "−1 S 6 H"],
    ["Gestern", "Gerion verkauft Wolfsfell", "+4 S"],
    ["Vor 3 Tagen", "Alrik kauft Seil, 10 Schritt", "−4 S 5 H"],
  ],
};

// Waren in Silbertalern (Preis = Ladenpreis nach Stufe; System: getItemPrice × sellingFactor).
const MERCHANT_GOODS = MERCHANT_KIND === "loot"
  ? [
      { name: "Luchsfell", cat: "Beute", img: A.armor, qty: 1, weight: "2,0" },
      { name: "Krallen", cat: "Beute", img: A.meleeWeapon, qty: 8, weight: "0,1" },
      { name: "Fleisch", cat: "Proviant", img: SHOP_IMG("consumable.webp"), qty: 4, weight: "1,0" },
      { name: "Pfeile", cat: "Munition", img: SHOP_IMG("arrow.webp"), qty: 3, weight: "0,1" },
      { name: "Silbertaler", cat: "Geld", img: A.moneyS, qty: 12, weight: "0,0" },
    ]
  : [
      { name: "Schmiedehammer", cat: "Waffen", img: A.rangeWeapon, price: 6, qty: 2, weight: "1,5", featured: true },
      { name: "Langschwert", cat: "Waffen", img: A.meleeWeapon, price: 180, qty: 1, weight: "1,6", hook: "Meisterarbeit" },
      { name: "Dolch", cat: "Waffen", img: A.meleeWeapon, price: 20, qty: 4, weight: "0,5" },
      { name: "Wurfmesser", cat: "Waffen", img: A.rangeWeapon, price: 8, qty: 6, weight: "0,3" },
      { name: "Kettenhemd", cat: "Rüstungen", img: A.armor, price: 300, qty: 1, weight: "6,0" },
      { name: "Lederrüstung", cat: "Rüstungen", img: A.armor, price: 80, qty: 2, weight: "4,0", hidden: true },
      { name: "Hufeisen", cat: "Werkzeug", img: A.tabInventory, price: 1.5, qty: 12, weight: "0,5" },
      { name: "Seil, 10 Schritt", cat: "Werkzeug", img: A.tabInventory, price: 4.5, qty: 3, weight: "1,5", featured: true },
      { name: "Schleifstein", cat: "Werkzeug", img: A.tabInventory, price: 2, qty: 5, weight: "0,3", tradeLocked: true },
      { name: "Proviant, 1 Tag", cat: "Proviant", img: SHOP_IMG("consumable.webp"), price: 0.5, qty: 20, weight: "1,0" },
    ];

// Eigener Beutel des Käufers (Verkaufen bzw. Hineinlegen); Ankaufpreis = Preis × Ankaufstufe.
const BUYER_GOODS = [
  { name: "Wolfsfell", cat: "Beute", img: A.armor, price: 4, qty: 2, weight: "2,0" },
  { name: "Waldläuferdolch", cat: "Waffen", img: A.meleeWeapon, price: 12, qty: 1, weight: "0,5" },
  { name: "Kräuterbündel", cat: "Kräuter", img: SHOP_IMG("plant.webp"), price: 1, qty: 5, weight: "0,1" },
];

const TIER_FACTORS = [0.6, 0.8, 1, 1.25, 1.6];
const BUY_FACTORS = [0.25, 0.4, 0.5, 0.6, 0.75];
const isLoot = () => MERCHANT_KIND === "loot";
const isCustomer = () => AS_PLAYER || MERCHANT.playerView;

/* ----------------------------------------------------------- Hilfen ---- */

// Silbertaler → „1 D 4 S 5 H“ (System: MoneyHelper / priceLabel).
function money(silver) {
  let k = Math.round(silver * 100);
  const parts = [];
  for (const [abbr, n] of [["D", 1000], ["S", 100], ["H", 10], ["K", 1]]) {
    const v = Math.floor(k / n);
    k -= v * n;
    if (v) parts.push(`${v} ${abbr}`);
  }
  return parts.join(" ") || "0 K";
}

const walletSilver = (w) => w.d * 10 + w.s + w.h / 10 + w.k / 100;
function setWallet(w, silver) {
  let k = Math.max(0, Math.round(silver * 100));
  w.d = Math.floor(k / 1000); k -= w.d * 1000;
  w.s = Math.floor(k / 100); k -= w.s * 100;
  w.h = Math.floor(k / 10); w.k = k - w.h * 10;
}

const shopPrice = (g) => g.price * TIER_FACTORS[MERCHANT.priceTier - 1];
const buyPrice = (g) => g.price * BUY_FACTORS[MERCHANT.buyTier - 1];

function purse(w, label) {
  return el("span", { class: "shop-purse", "aria-label": `${label}: ${money(walletSilver(w))}` }, COINS.map((c) =>
    el("span", { class: "shop-coin", title: c.name }, [el("img", { src: c.img(), alt: "" }), String(w[c.field])])));
}

function shopBtn(label, onClick, { cls = "", pressed, title } = {}) {
  const b = el("button", { type: "button", class: "shop-btn " + cls, ...(title ? { title } : {}) }, label);
  if (pressed !== undefined) b.setAttribute("aria-pressed", String(pressed));
  b.addEventListener("click", (e) => { e.stopPropagation(); onClick(); });
  return b;
}

function visibleGoods() {
  const q = MERCHANT.query.trim().toLowerCase();
  let list = MERCHANT_GOODS.filter((g) => g.qty > 0 && !g.tradeLocked && (isCustomer() ? !g.hidden : true));
  if (MERCHANT.chip !== "all") list = list.filter((g) => g.cat === MERCHANT.chip);
  if (MERCHANT.specials) list = list.filter((g) => g.featured);
  if (MERCHANT.affordable) list = list.filter((g) => shopPrice(g) <= walletSilver(MERCHANT.buyer.wallet));
  if (q) list = list.filter((g) => g.name.toLowerCase().includes(q));
  const sorted = [...list];
  if (MERCHANT.sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
  if (MERCHANT.sort === "priceAsc") sorted.sort((a, b) => a.price - b.price);
  if (MERCHANT.sort === "priceDesc") sorted.sort((a, b) => b.price - a.price);
  if (MERCHANT.sort === "featured") sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  return sorted;
}

// Kaufen/Nehmen (System: tradeWrapper → buyItem, bei Anzahl > 1 Mengen-Dialog merchant-trade-amount.hbs).
function takeItem(g) {
  if (MERCHANT.presentation && !isLoot()) return flashNotice("Präsentation läuft: die SL zeigt gerade Ware, Kaufen ist gesperrt");
  if (isLoot() && MERCHANT.locked) return flashNotice("Die Truhe ist verschlossen");
  const price = isLoot() ? 0 : shopPrice(g);
  if (price > walletSilver(MERCHANT.buyer.wallet)) return flashNotice(`${MERCHANT.buyer.name} kann ${g.name} nicht bezahlen`);
  g.qty -= 1;
  setWallet(MERCHANT.buyer.wallet, walletSilver(MERCHANT.buyer.wallet) - price);
  setWallet(MERCHANT.wallet, walletSilver(MERCHANT.wallet) + price);
  const mine = BUYER_GOODS.find((b) => b.name === g.name);
  if (mine) mine.qty += 1; else BUYER_GOODS.push({ ...g, qty: 1, price: g.price ?? 1 });
  MERCHANT.log.unshift(["Eben", `${MERCHANT.buyer.name} ${isLoot() ? "nimmt" : "kauft"} ${g.name}`, isLoot() ? "" : `−${money(price)}`]);
  flashNotice(isLoot() ? `${g.name} genommen` : `${g.name} gekauft für ${money(price)}${g.qty ? "" : " (letztes Stück)"}`);
  renderContent();
}

// Verkaufen bzw. Hineinlegen (System: sellItem).
function giveItem(g) {
  const price = isLoot() ? 0 : buyPrice(g);
  if (price > walletSilver(MERCHANT.wallet) && !MERCHANT.hideMoney) return flashNotice("Der Händler hat nicht genug Geld");
  g.qty -= 1;
  if (!g.qty) BUYER_GOODS.splice(BUYER_GOODS.indexOf(g), 1);
  setWallet(MERCHANT.wallet, walletSilver(MERCHANT.wallet) - price);
  setWallet(MERCHANT.buyer.wallet, walletSilver(MERCHANT.buyer.wallet) + price);
  const there = MERCHANT_GOODS.find((x) => x.name === g.name);
  if (there) there.qty += 1; else MERCHANT_GOODS.push({ ...g, qty: 1 });
  MERCHANT.log.unshift(["Eben", `${MERCHANT.buyer.name} ${isLoot() ? "legt hinein" : "verkauft"}: ${g.name}`, isLoot() ? "" : `+${money(price)}`]);
  flashNotice(isLoot() ? `${g.name} hineingelegt` : `${g.name} verkauft für ${money(price)}`);
  renderContent();
}

// Name öffnet (wenn erlaubt) das Item-Fenster, beim Überfahren die Karte des Systems (#52, item-tooltips.js: .name).
function goodName(g) {
  if (!MERCHANT.allowDetails && isCustomer()) return el("span", { class: "shop-name" }, g.name);
  const b = el("button", { type: "button", class: "shop-name name" }, g.name);
  b.addEventListener("click", () => openItemWindow(g));
  return b;
}

/* ------------------------------------------------------ Kundensicht ---- */

// Kopf des Ladens: Laden ⇄ Käufer (System: dsa-shop-hero mit shop-purse + shop-buyer).
function shopParties() {
  const shop = el("div", { class: "shop-party" }, [
    el("img", { src: PORTRAIT_IMG.img, alt: "" }),
    el("div", {}, [el("b", {}, MERCHANT.ownerName ?? CHARACTER_NAME), isLoot() ? el("small", { class: "muted" }, MERCHANT.locked ? "verschlossen" : "offen")
      : MERCHANT.hideMoney ? el("small", { class: "muted" }, "Kasse verdeckt") : purse(MERCHANT.wallet, "Kasse")]),
  ]);
  const buyer = el("div", { class: "shop-party buyer" }, [
    el("img", { src: MERCHANT.buyer.img, alt: "" }),
    el("div", {}, [el("b", {}, MERCHANT.buyer.name), purse(MERCHANT.buyer.wallet, "Geldbeutel")]),
    shopBtn("Wechseln", () => flashNotice("Käufer wählen: eigener Held oder markiertes Token (System: choseTradefriend)"), { cls: "small", title: "Wer kauft? Eigener Held oder markiertes Token" }),
  ]);
  return el("div", { class: "panel shop-parties" }, [shop, buyer]);
}

function shopFilters() {
  const search = el("input", { type: "search", id: "shopSearch", placeholder: isLoot() ? "Schatz durchsuchen …" : "Ware suchen …", value: MERCHANT.query });
  search.addEventListener("input", () => {
    MERCHANT.query = search.value;
    const pos = search.selectionStart;
    renderContent();
    const fresh = document.getElementById("shopSearch");
    fresh.focus();
    fresh.setSelectionRange(pos, pos);
  });
  const sort = el("select", { "aria-label": "Sortieren" }, [["featured", "Empfohlen zuerst"], ["name", "Name"], ["priceAsc", "Preis aufsteigend"], ["priceDesc", "Preis absteigend"]]
    .filter(([v]) => !isLoot() || v === "featured" || v === "name")
    .map(([v, label]) => el("option", { value: v, ...(MERCHANT.sort === v ? { selected: "" } : {}) }, label)));
  sort.addEventListener("change", () => { MERCHANT.sort = sort.value; renderContent(); });
  const views = isLoot() ? null : el("div", { class: "seg", role: "group", "aria-label": "Ansicht" }, [["cards", "Ware"], ["log", "Kassenbuch"]]
    .map(([v, label]) => shopBtn(label, () => { MERCHANT.view = v; MERCHANT.sellMode = false; renderContent(); }, { pressed: MERCHANT.view === v })));
  const cats = [...new Set(MERCHANT_GOODS.filter((g) => g.qty && !g.tradeLocked).map((g) => g.cat))];
  const chip = (key, label) => shopBtn(label, () => { MERCHANT.chip = key; renderContent(); }, { cls: "shop-chip", pressed: MERCHANT.chip === key });
  const chips = el("div", { class: "shop-chips" }, [chip("all", "Alle"), ...cats.map((c) => chip(c, c)),
    isLoot() ? null : shopBtn("Bezahlbar", () => { MERCHANT.affordable = !MERCHANT.affordable; renderContent(); }, { cls: "shop-chip", pressed: MERCHANT.affordable }),
    MERCHANT_GOODS.some((g) => g.featured) ? shopBtn("Angebote", () => { MERCHANT.specials = !MERCHANT.specials; renderContent(); }, { cls: "shop-chip", pressed: MERCHANT.specials }) : null]);
  // Verkaufen (Händler) bzw. „Hineinlegen“ (Schatz); in Variante C stehen beide Seiten ohnehin nebeneinander.
  const sell = MERCHANT_VARIANT === "c" || MERCHANT.view === "log" ? null
    : shopBtn(isLoot() ? "Hineinlegen" : "Verkaufen", () => { MERCHANT.sellMode = !MERCHANT.sellMode; renderContent(); }, { pressed: MERCHANT.sellMode });
  // Beim Verkaufen gelten Suche und Filter nicht (System: shop-filters nur ohne sellMode).
  if (MERCHANT.sellMode) return el("div", { class: "shop-toolbar" }, [el("div", { class: "shop-toolbar-row" }, [views, sell])]);
  return el("div", { class: "shop-toolbar" }, [el("div", { class: "shop-toolbar-row" }, [el("div", { class: "search-bar" }, [search]), sort, views, sell]), chips]);
}

function tile(g, give) {
  const price = isLoot() ? null : give ? buyPrice(g) : shopPrice(g);
  const poor = !give && price !== null && price > walletSilver(MERCHANT.buyer.wallet);
  const act = shopBtn(give ? (isLoot() ? "Hineinlegen" : "Verkaufen") : (isLoot() ? "Nehmen" : "Kaufen"), () => (give ? giveItem(g) : takeItem(g)), { cls: "small" });
  return el("div", { class: "shop-tile" + (g.featured && !give ? " featured" : "") + (poor ? " poor" : "") }, [
    el("img", { src: g.img, alt: "" }),
    el("div", { class: "shop-tile-body" }, [goodName(g), g.hook ? el("small", { class: "muted" }, g.hook) : null]),
    el("div", { class: "shop-tile-meta" }, [price !== null ? el("b", {}, money(price)) : null, el("span", { class: "muted" }, `×${g.qty}`)]),
    act,
  ]);
}

function goodsRow(g, give) {
  const price = isLoot() ? null : give ? buyPrice(g) : shopPrice(g);
  return el("div", { class: "row shop-row" + (isLoot() ? " loot" : "") + (g.featured && !give ? " featured" : "") }, [
    el("img", { src: g.img, alt: "" }),
    el("span", { class: "left" }, [goodName(g), g.featured && !give ? el("small", { class: "shop-star" }, " Angebot") : null]),
    el("span", { class: "center" }, String(g.qty)),
    el("span", { class: "center muted" }, g.weight),
    isLoot() ? null : el("span", { class: "center" }, money(price)),
    shopBtn(give ? (isLoot() ? "Hinein" : "Verkaufen") : (isLoot() ? "Nehmen" : "Kaufen"), () => (give ? giveItem(g) : takeItem(g)), { cls: "small" }),
  ]);
}

function goodsList(list, give) {
  const cats = [...new Set(list.map((g) => g.cat))];
  return cats.map((cat) => el("div", { class: "panel" }, [
    el("div", { class: "panel-title" }, cat),
    el("div", { class: "row-head shop-row" + (isLoot() ? " loot" : "") }, head("", "Gegenstand", "Anzahl", "Gewicht", ...(isLoot() ? [] : [give ? "Ankauf" : "Preis"]), "")),
    ...list.filter((g) => g.cat === cat).map((g) => goodsRow(g, give)),
  ]));
}

function goodsBlock(list, give, layout) {
  if (!list.length) return el("div", { class: "drop-zone" }, give ? "Nichts dabei" : isLoot() ? "Der Schatz ist leer" : "Keine passende Ware");
  if (layout === "list") return el("div", {}, goodsList(list, give));
  return el("div", { class: "shop-grid" }, list.map((g) => tile(g, give)));
}

function shopLog() {
  return el("div", { class: "panel" }, [
    el("div", { class: "panel-title" }, "Kassenbuch"),
    ...MERCHANT.log.map(([when, what, sum]) => el("div", { class: "row shop-log-row" }, [el("span", { class: "muted" }, when), el("span", { class: "left" }, what), el("span", { class: "center" }, sum)])),
  ]);
}

function renderShopCustomer() {
  const blockers = [];
  if (MERCHANT.presentation && !isLoot()) blockers.push("Die SL präsentiert gerade Ware: alle sehen dasselbe, Kaufen ist gesperrt.");
  if (isLoot() && MERCHANT.locked) blockers.push("Die Truhe ist verschlossen. Erst nach dem Öffnen (SL oder Probe) lässt sich etwas nehmen.");
  const parts = [shopParties(), ...blockers.map((b) => el("p", { class: "notice shop-blocker", role: "note" }, b)), shopFilters()];
  if (MERCHANT.view === "log" && !isLoot()) return el("div", {}, [...parts, shopLog()]);
  const goods = visibleGoods();
  const mine = BUYER_GOODS.filter((g) => g.qty > 0);
  const giveTitle = isLoot() ? `Hineinlegen aus dem Beutel von ${MERCHANT.buyer.name}` : `Verkaufen: Beutel von ${MERCHANT.buyer.name}`;
  if (MERCHANT_VARIANT === "c") {
    // C: Ware links, eigener Beutel rechts, beides als kompakte Liste.
    return el("div", {}, [...parts, el("div", { class: "shop-split" }, [
      el("div", {}, [el("h3", { class: "shop-col-title" }, isLoot() ? "Im Schatz" : "Ware des Ladens"), goodsBlock(goods, false, "list")]),
      el("div", {}, [el("h3", { class: "shop-col-title" }, giveTitle), goodsBlock(mine, true, "list")]),
    ])]);
  }
  const layout = MERCHANT_VARIANT === "b" ? "list" : "cards";
  if (MERCHANT.sellMode) {
    return el("div", {}, [...parts, el("div", { class: "panel shop-drawer" }, [
      el("div", { class: "panel-title flex" }, [el("span", {}, giveTitle), shopBtn("Zurück zur Ware", () => { MERCHANT.sellMode = false; renderContent(); }, { cls: "small" })]),
      goodsBlock(mine, true, layout),
    ])]);
  }
  const specials = layout === "cards" && !MERCHANT.specials && MERCHANT.chip === "all" ? goods.filter((g) => g.featured) : [];
  return el("div", {}, [...parts,
    specials.length ? el("div", { class: "panel shop-specials" }, [el("div", { class: "panel-title" }, "Angebote"), goodsBlock(specials, false, "cards")]) : null,
    goodsBlock(specials.length ? goods.filter((g) => !g.featured) : goods, false, layout)]);
}

/* ------------------------------------------------------- SL-Ansicht ---- */

function stockRow(g) {
  const flag = (key, on, off, label) => {
    const b = el("button", { type: "button", class: "shop-flag" + (g[key] ? " on" : ""), title: label, "aria-label": `${g.name}: ${label}`, "aria-pressed": String(!!g[key]) }, g[key] ? on : off);
    b.addEventListener("click", () => { g[key] = !g[key]; renderContent(); });
    return b;
  };
  const qty = el("span", { class: "center" }, String(g.qty));
  makeEditable(qty, g.qty, (v) => { g.qty = v; renderContent(); }, { type: "number", min: 0, max: 999 });
  return el("div", { class: "row stock-row" + (isLoot() ? " loot" : "") + (g.hidden ? " is-hidden" : "") + (g.tradeLocked ? " is-locked" : "") }, [
    el("img", { src: g.img, alt: "" }),
    el("span", { class: "left" }, [goodName(g)]),
    isLoot() ? null : el("span", { class: "center muted", title: "Listenpreis" }, money(g.price)),
    isLoot() ? null : el("span", { class: "center" }, money(shopPrice(g))),
    qty,
    el("span", { class: "center muted" }, g.weight),
    el("span", { class: "shop-flags" }, [
      isLoot() ? null : flag("featured", "Angebot", "Angebot", "Angebot (oben im Laden)"),
      flag("hidden", "Heute weg", "Heute da", g.hidden ? "Heute nicht im Laden" : "Heute im Laden"),
      flag("tradeLocked", "Gesperrt", "Handel", g.tradeLocked ? "Nicht handelbar" : "Handelbar"),
    ]),
  ]);
}

function renderStock() {
  const tools = isLoot()
    ? [["Gegenstände hinzufügen", "Bibliothek des Systems öffnet sich"], ["Alles entfernen", "Rückfrage des Systems"]]
    : [["Füllen …", "Dialog des Systems: Ware nach Region und Kategorien"], ["Nachfüllen", "Ware nach den Vorgaben ergänzt"], ["Ladentag", "Ein Teil der Ware ist heute nicht im Laden, Preise schwanken"], ["Leeren", "Rückfrage des Systems"]];
  const bar = el("div", { class: "panel" }, [
    el("div", { class: "panel-title flex" }, [el("span", {}, isLoot() ? "Schatz verwalten" : "Ware"), gmTagShop()]),
    el("div", { class: "shop-gm-bar" }, [
      ...tools.map(([label, msg]) => shopBtn(label, () => flashNotice(`${label}: ${msg}`))),
      isLoot() ? null : shopBtn(MERCHANT.presentation ? "Präsentation: an" : "Präsentation: aus", () => { MERCHANT.presentation = !MERCHANT.presentation; renderContent(); }, { pressed: MERCHANT.presentation, title: "Alle Kunden sehen, was die SL zeigt" }),
      shopBtn("Kundensicht", () => { MERCHANT.playerView = true; applyMerchantRole(); }, { cls: "accent", title: "So sehen Spieler den Laden" }),
    ]),
    isLoot() ? null : el("div", { class: "armor-sum-line" }, ["Kasse ", purse(MERCHANT.wallet, "Kasse")]),
  ]);
  const cats = [...new Set(MERCHANT_GOODS.map((g) => g.cat))];
  const headCells = isLoot() ? ["", "Gegenstand", "Anzahl", "Gewicht", ""] : ["", "Gegenstand", "Liste", "Laden", "Anzahl", "Gewicht", ""];
  return [bar, ...cats.map((cat) => el("div", { class: "panel" }, [
    el("div", { class: "panel-title" }, cat),
    el("div", { class: "row-head stock-row" + (isLoot() ? " loot" : "") }, head(...headCells)),
    ...MERCHANT_GOODS.filter((g) => g.cat === cat).map(stockRow),
  ])), el("div", { class: "drop-zone" }, "Gegenstände hierher ziehen, um sie anzubieten")];
}

function gmTagShop() {
  return el("small", { class: "muted" }, "nur SL und Besitzer");
}

function tierPicker(label, value, factors, set, hint) {
  const names = ["sehr günstig", "günstig", "normal", "teuer", "sehr teuer"];
  return el("div", { class: "shop-setting" }, [
    el("span", { class: "shop-setting-label" }, label),
    el("div", { class: "seg", role: "group", "aria-label": label }, names.map((n, i) => shopBtn(n, () => { set(i + 1); renderContent(); }, { pressed: value === i + 1 }))),
    el("small", { class: "muted" }, `${hint} × ${String(factors[value - 1]).replace(".", ",")}`),
  ]);
}

function field(label, input) {
  return el("label", { class: "shop-setting" }, [el("span", { class: "shop-setting-label" }, label), input]);
}

function check(label, get, set) {
  const box = el("input", { type: "checkbox", ...(get() ? { checked: "" } : {}) });
  box.addEventListener("change", () => { set(box.checked); renderContent(); });
  return el("label", { class: "shop-check" }, [box, label]);
}

function renderShopSettings() {
  const name = el("input", { type: "text", value: MERCHANT.shopName });
  name.addEventListener("change", () => { MERCHANT.shopName = name.value || "Laden"; renderContent(); });
  return [
    el("div", { class: "panel" }, [el("div", { class: "panel-title" }, "Ladenschild"),
      field("Name des Ladens", name),
      el("div", { class: "shop-setting" }, [el("span", { class: "shop-setting-label" }, "Ladenbild"),
        el("div", { class: "shop-gm-bar" }, ["Bild wählen", "Ausschnitt", "Allen zeigen", "Bild des Akteurs", "Entfernen"].map((l) => shopBtn(l, () => flashNotice(`${l} (System)`), { cls: "small" })))])]),
    el("div", { class: "panel" }, [el("div", { class: "panel-title" }, "Preise"),
      tierPicker("Verkauf", MERCHANT.priceTier, TIER_FACTORS, (v) => { MERCHANT.priceTier = v; }, "Listenpreis"),
      tierPicker("Ankauf", MERCHANT.buyTier, BUY_FACTORS, (v) => { MERCHANT.buyTier = v; }, "Listenpreis"),
      el("p", { class: "muted shop-hint" }, `Beispiel: ein Gegenstand für 10 S kostet im Laden ${money(10 * TIER_FACTORS[MERCHANT.priceTier - 1])}, der Laden zahlt ${money(10 * BUY_FACTORS[MERCHANT.buyTier - 1])}.`)]),
    el("div", { class: "panel" }, [el("div", { class: "panel-title" }, "Vorgaben für das Füllen"),
      field("Region", el("input", { type: "text", value: "Kosch" })),
      field("Höchstpreis (S)", el("input", { type: "number", value: "400", min: "0" })),
      field("Chance auf Besonderes", el("input", { type: "range", min: "0", max: "100", value: "10" })),
      field("Auffüllen", el("select", {}, ["Von Hand", "Täglich", "Wöchentlich"].map((o) => el("option", {}, o)))),
      el("div", { class: "shop-checks" }, [check("Nur handelbare Ware", () => true, () => {}), check("Doppelte erlauben", () => false, () => {})]),
      el("div", { class: "shop-setting" }, [el("span", { class: "shop-setting-label" }, "Warengruppen"),
        el("div", { class: "shop-checks" }, MERCHANT.categories.map((c) => check(c[0], () => c[1], (v) => { c[1] = v; })))])]),
    el("div", { class: "panel" }, [el("div", { class: "panel-title" }, "Ladentag"),
      field("Heute nicht im Laden", el("input", { type: "range", min: "0", max: "100", value: "20" })),
      field("Preisschwankung", el("input", { type: "range", min: "0", max: "50", value: "10" }))]),
  ];
}

function renderShopAccess() {
  const kinds = [["none", "Kein"], ["merchant", "Händler"], ["loot", "Schatz"], ["epic", "Episch"]];
  const art = el("div", { class: "seg", role: "group", "aria-label": "Art" }, kinds.map(([k, label]) => shopBtn(label, () => {
    if (k === MERCHANT_KIND) return;
    if (k === "none") return flashNotice("Art „Kein“: Akteur wird wieder NSC, unser Hook führt in den vorherigen Bogen zurück (#54)");
    if (k === "epic") return flashNotice("Episch (Garadan) bleibt beim Systembogen");
    const p = new URLSearchParams(location.search);
    p.set("actor", k === "loot" ? "schatz" : "haendler");
    location.search = p.toString();
  }, { pressed: k === MERCHANT_KIND })));
  const options = [check("Für Spieler verbergen", () => MERCHANT.hidePlayer, (v) => { MERCHANT.hidePlayer = v; }),
    check("Spieler dürfen Gegenstände ansehen", () => MERCHANT.allowDetails, (v) => { MERCHANT.allowDetails = v; })];
  if (isLoot()) options.push(check("Verschlossen", () => MERCHANT.locked, (v) => { MERCHANT.locked = v; }), check("Nach dem Leeren löschen", () => MERCHANT.temporary, (v) => { MERCHANT.temporary = v; }));
  else options.push(check("Kasse verdecken", () => MERCHANT.hideMoney, (v) => { MERCHANT.hideMoney = v; }));
  return [
    el("div", { class: "panel" }, [el("div", { class: "panel-title flex" }, [el("span", {}, "Art des Akteurs"), gmTagShop()]),
      el("div", { class: "shop-setting" }, [el("span", { class: "shop-setting-label" }, "Art"), art]),
      el("div", { class: "shop-checks" }, options)]),
    el("div", { class: "panel" }, [el("div", { class: "panel-title" }, "Wer darf hinein"),
      el("p", { class: "muted shop-hint" }, "„Begrenzt“ zeigt den Laden bzw. die Schatzkiste, „Beobachter“ dazu den Bogen, „Besitzer“ alles."),
      ...MERCHANT.players.map((p) => {
        const sel = el("select", { "aria-label": `Zugang ${p[0]}` }, ["Keine", "Begrenzt", "Beobachter", "Besitzer"].map((o) => el("option", { ...(o === p[1] ? { selected: "" } : {}) }, o)));
        sel.addEventListener("change", () => { p[1] = sel.value; });
        return el("div", { class: "row shop-perm-row" }, [el("span", { class: "left" }, p[0]), sel]);
      })]),
  ];
}

function renderShopOwner() {
  return el("div", {}, [
    section("stock", renderStock()),
    isLoot() ? null : section("shop", renderShopSettings()),
    section("access", renderShopAccess()),
  ]);
}

/* ------------------------------------------------------- Umschalten ---- */

let MERCHANT_OWNER_TABS = null;
const MERCHANT_CUSTOMER_TABS = () => [
  { id: "shop", label: isLoot() ? "Schatz" : "Laden", icon: isLoot() ? SHOP_IMG("trap.webp") : A.tabInventory, title: isLoot() ? "Schatzkiste" : "Laden", hint: "" },
  ...(isLoot() ? [] : [MERCHANT_OWNER_TABS.find((t) => t.id === "notes")]),
];

// Rolle (Menü › Ansicht) bzw. Schalter „Kundensicht“: Reiter und Kopf tauschen.
function applyMerchantRole() {
  const customer = isCustomer();
  TABS.splice(0, TABS.length, ...(customer ? MERCHANT_CUSTOMER_TABS() : MERCHANT_OWNER_TABS));
  document.querySelector(".sheet").toggleAttribute("data-customer", customer);
  document.getElementById("shopBackBtn")?.remove();
  if (customer && MERCHANT.playerView && !AS_PLAYER) {
    // SL in der Kundensicht: Rückweg in der Reiterzeile (System: Schalter playerview in der Titelleiste).
    const back = el("button", { type: "button", id: "shopBackBtn", class: "shop-btn small" }, "Zurück zur SL-Ansicht");
    back.addEventListener("click", () => { MERCHANT.playerView = false; applyMerchantRole(); });
    document.getElementById("tabSubNav").after(back);
  }
  MERCHANT.ownerName ??= CHARACTER_NAME;
  CHARACTER_NAME = customer ? MERCHANT.shopName : MERCHANT.ownerName;
  document.querySelector(".fwc-title").textContent = CHARACTER_NAME;
  renderHeader();
  renderRail();
  setTab(customer ? "shop" : TABS.some((t) => t.id === currentTab) ? currentTab : "inventory");
}

function merchantSetup() {
  RENDERERS.inventory = renderShopOwner;
  RENDERERS.shop = renderShopCustomer;
  SECTION_TABS.inventory = isLoot() ? [["stock", "Bestand"], ["access", "Zugang"]] : [["stock", "Bestand"], ["shop", "Einstellungen"], ["access", "Zugang"]];
  currentSection.inventory = "stock";
  MERCHANT_OWNER_TABS = [...TABS];
  document.getElementById("merchantModeToggle").hidden = true;
  // Varianten der Kundensicht (Menü › Diese Seite, ?laden=a|b|c)
  const variants = el("fieldset", { "data-group": "laden" }, [el("legend", {}, "Kundensicht (Laden)"),
    ...[["a", "A · Kacheln"], ["b", "B · Liste"], ["c", "C · Ware und Beutel"]].map(([v, label]) => el("button", { type: "button", "data-v": v, "aria-pressed": String(v === MERCHANT_VARIANT) }, label))]);
  variants.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-v]");
    if (!b) return;
    MERCHANT_VARIANT = b.dataset.v;
    MERCHANT.sellMode = false;
    variants.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    renderContent();
  });
  document.querySelector(".toolbar")?.append(variants);
  document.getElementById("asPlayerToggle").addEventListener("click", () => setTimeout(applyMerchantRole));
  // Start im Laden-Reiter (Kopf erst nach renderHeader im nächsten Takt).
  setTimeout(() => { if (!new URLSearchParams(location.search).get("tab")) applyMerchantRole(); });
}

// Übernahme in ACTOR_TYPES (actor-types.js). Händler auf NSC-Grundlage, Schatz auf Kreatur-Grundlage (dsa5-core
// „In Schatz umwandeln“ an einer erlegten Kreatur).
const MERCHANT_TYPES = {
  haendler: {
    toolbar: "Händlerbogen · Click-Dummy",
    tabs: ["cover", "main", "skills", "combat", "inventory", "status", "notes"],
    rename: { inventory: { label: "Laden", title: "Laden", icon: A.tabInventory } },
    data: () => { npcData(); CHARACTER_NAME = "Hagen Eisenfaust"; },
    setup: () => { npcSetup(); merchantSetup(); },
    noAP: true,
  },
  schatz: {
    toolbar: "Schatzbogen · Click-Dummy",
    tabs: ["cover", "main", "skills", "combat", "inventory", "status", "notes"],
    rename: { inventory: { label: "Schatz", title: "Schatz", icon: SHOP_IMG("trap.webp") } },
    data: () => { creatureData(); CHARACTER_NAME = "Luchs (erlegt)"; },
    setup: () => { creatureSetup(); merchantSetup(); },
    noAP: true,
  },
};
