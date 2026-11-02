/* NSC- und Kreaturbogen (Issues #53/#54, Nutzerentscheidung 2026-10-30): Grundlage ist das Heldenbogen-Gerüst,
   NSC und Kreatur getrennt entworfen. Beide haben nur die Reiter, die der Systembogen für den Typ kennt
   (npc-sheet.js / creature-sheet.js), plus eine Titelseite. Titelseite nach Rückmeldung 2026-10-31 (renderTypeCover):
   RS, INI, GS, SK, ZK; Angriffe nur mit ausgerüsteten Waffen (Kreatur: dazu die natürlichen Angriffe); Talente mit
   Wert, Anzahl per − / + wie bei den Vorschlägen des Heldenbogens, Sinnesschärfe und Willenskraft immer; alles
   Weitere über Favoriten (Sterne wie beim Helden).

   Aufruf: index.html?actor=nsc bzw. ?actor=kreatur (ohne Parameter der Heldenbogen). Diese Datei lädt nach data.js
   und vor script.js: Daten werden hier ersetzt, setup() läuft am Ende von script.js vor dem ersten Rendern und hängt
   die abweichenden Reiter ein. Alle Werte und Texte sind frei erfundene Platzhalter. */

const ACTOR_KIND = new URLSearchParams(location.search).get("actor");

// Reiter auf eine Liste von ids zurückschneiden (Reihenfolge bleibt), einzelne umbenennen.
function keepTabs(ids, rename = {}) {
  for (let i = TABS.length - 1; i >= 0; i--) if (!ids.includes(TABS[i].id)) TABS.splice(i, 1);
  TABS.forEach((t) => {
    if (rename[t.id]) Object.assign(t, rename[t.id]);
  });
}

function setAttrs(values) {
  ATTRS.forEach((a) => Object.assign(a, { initial: values[a.k], adv: 0, mod: 0 }));
}

function setSkills(values) {
  SKILL_GROUPS.forEach((g) => g.items.forEach((s) => {
    s.fw = values[s.name] ?? 0;
    s.fav = false;
  }));
}

// Gemeinsam für NSC und Kreatur: kein Steigern (keine AP im Systembogen), eigene Titelseite.
function nonHeroSetup() {
  delete MODE_INFO.advance;
  document.querySelector('#modeSwitch [data-mode="advance"]')?.remove();
  document.querySelector(".toolbar > span").textContent = ACTOR_TYPE.toolbar;
  document.querySelector(".sheet").dataset.actor = ACTOR_KIND;
  document.title = `DSA5-Helpers · ${ACTOR_TYPE.toolbar}`;
  RENDERERS.cover = renderTypeCover;
}

// Favoriten des Heldenbeispiels aus data.js zurücksetzen; jeder Typ setzt danach seine eigenen.
function clearFavorites() {
  [...MELEE, ...RANGED, ...SPELLS, ...RITUALS, ...LITURGIES, ...CEREMONIES].forEach((x) => { x.fav = false; });
  INVENTORY_CATEGORIES.forEach((c) => c.items.forEach((i) => [i, ...(i.children || [])].forEach((x) => { x.fav = false; })));
  FAV_SPECIALS.clear();
}

/* ------------------------------------------------------- Titelseite ---- */
// Talente immer oben, unabhängig vom Wert (Rückmeldung 2026-10-31).
const FIXED_COVER_TALENTS = ["Sinnesschärfe", "Willenskraft"];
// Anzahl der übrigen Talente (− / +, 2–12 wie die Vorschläge; im Modul je Benutzer und Akteur als User-Flag).
let typeCoverTalentCount = 6;

function typeCoverValues() {
  const max = (list, label) => list.find((v) => v.label === label)?.max ?? "–";
  if (ACTOR_KIND === "kreatur") {
    return [
      ["RS", "Rüstungsschutz", CREATURE.armor.reduce((s, a) => s + a.rs, 0)],
      ["INI", "Initiative", max(CREATURE.values, "Initiative")],
      ["GS", "Geschwindigkeit", max(CREATURE.values, "Geschwindigkeit")],
      ["SK", "Seelenkraft", max(CREATURE.values, "Seelenkraft")],
      ["ZK", "Zähigkeit", max(CREATURE.values, "Zähigkeit")],
    ];
  }
  return [
    ["RS", "Rüstungsschutz", computeArmorSum(wornArmor()).sum],
    ["INI", "Initiative", max(COMBAT_DERIVED, "Initiative")],
    ["GS", "Geschwindigkeit", max(BASICS, "Geschwindigkeit")],
    ["SK", "Seelenkraft", max(RESISTANCES, "Seelenkraft")],
    ["ZK", "Zähigkeit", max(RESISTANCES, "Zähigkeit")],
  ];
}

function typeCoverStats() {
  return el("div", { class: "panel" }, [
    el("div", { class: "panel-title" }, "Werte"),
    el("div", { class: "creature-stats" }, typeCoverValues().map(([key, label, value]) =>
      el("div", { class: "creature-stat", title: `${label}: ${value}` }, [el("b", {}, String(value)), el("small", {}, key)]))),
  ]);
}

// Nur ausgerüstete Waffen (im System worn.value); Kreaturen zusätzlich mit ihren natürlichen Angriffen (traits).
function typeCoverAttacks() {
  const weapons = handWeapons().map((w) => {
    const ranged = RANGED.includes(w);
    const stats = ranged ? effectiveRangedStats(w) : effectiveMeleeStats(w);
    return { name: w.name, img: w.img, reach: w.reach, at: stats.at, pa: ranged ? undefined : stats.pa, tp: w.tp, ranged, note: w.group };
  });
  const natural = ACTOR_KIND === "kreatur" ? CREATURE.attacks : [];
  const rows = [...natural, ...weapons].map(creatureAttackRow);
  return el("div", { class: "panel" }, [
    el("div", { class: "panel-title" }, "Angriffe"),
    rows.length ? el("div", { class: "short-weapons" }, rows) : el("p", { class: "muted type-cover-empty" }, "Keine Waffe ausgerüstet."),
  ]);
}

function typeCoverTalents() {
  const all = SKILL_GROUPS.flatMap((g) => g.items);
  const fixed = FIXED_COVER_TALENTS.map((n) => all.find((s) => s.name === n)).filter(Boolean);
  const rest = all.filter((s) => s.fw > 0 && !s.fav && !fixed.includes(s)).sort((a, b) => b.fw - a.fw);
  const stepBtn = (step, label) => {
    const next = typeCoverTalentCount + step;
    const b = el("button", { type: "button", title: label, "aria-label": label }, step < 0 ? "−" : "+");
    b.disabled = next < 2 || next > 12;
    b.addEventListener("click", () => { typeCoverTalentCount = next; renderContent(); });
    return b;
  };
  const counter = el("span", { class: "suggest-count", role: "group", "aria-label": "Anzahl der Talente" }, [
    stepBtn(-2, "Weniger Talente"), el("span", {}, String(typeCoverTalentCount)), stepBtn(2, "Mehr Talente"),
  ]);
  // Feste Talente stehen immer da – ihr Stern entfiele ohne Wirkung, die Spalte bleibt fürs Zeilenraster.
  const fixedCard = (s) => {
    const card = favCard(s, "talent");
    card.querySelector(".fav-star").replaceWith(el("span", { class: "fav-star fixed-talent", title: "Steht immer auf der Titelseite" }));
    return card;
  };
  return el("div", { class: "panel" }, [
    el("div", { class: "panel-title suggest-head" }, [el("span", {}, "Talente"), counter]),
    el("div", { class: "fav-grid" }, [...fixed.map(fixedCard), ...rest.slice(0, typeCoverTalentCount).map((s) => favCard(s, "talent"))]),
  ]);
}

function renderTypeCover() {
  const frag = document.createDocumentFragment();
  frag.append(typeCoverStats(), typeCoverAttacks(), typeCoverTalents(), favoritesPanel());
  return frag;
}

// Notizen-Unterreiter je Typ austauschen (Sprungmarken folgen NOTES_SECTIONS).
function setNotesSections(list) {
  NOTES_SECTIONS.splice(0, NOTES_SECTIONS.length, ...list);
  SECTION_TABS.notes = NOTES_SECTIONS.map(({ id, label }) => [id, label]);
  currentSection.notes = SECTION_TABS.notes[0][0];
}

const textSection = (id, label, text, visibility) => {
  const box = { text };
  return { id, label, visibility, get: () => box.text, set: (v) => { box.text = v; } };
};

/* ---------------------------------------------------------------- NSC ---- */
// Systembogen: wie der Heldenbogen (npc-sheet.js erbt von character-sheet.js), nur der Reiter Eigenschaften ist
// anders (npc-main.hbs): Grundwerte ohne Erfahrung/AP. Magie/Religion nur bei Zauberern/Geweihten, hier keiner.
// Keine Aufträge/Personen (Almanach gehört zu den Helden der Spieler).
function npcData() {
  CHARACTER_NAME = "Brandolf Eisenhauer";
  Object.assign(PORTRAIT_IMG, PORTRAIT_CUTOUT);
  Object.assign(IDENTITY.species, { name: "Mensch", desc: "Platzhalter für die Spezies des NSC." });
  Object.assign(IDENTITY.culture, { name: "Mittelreicher", desc: "Platzhalter für die Kultur des NSC." });
  Object.assign(IDENTITY.career, { name: "Schmied", desc: "Platzhalter für die Profession des NSC." });
  setAttrs({ MU: 13, KL: 11, IN: 12, CH: 11, FF: 14, GE: 11, KO: 14, KK: 15 });
  RESOURCES.forEach((r) => {
    if (/Astral|AsP|Karma|KaP/.test(r.label)) r.show = false;
  });
  Object.assign(RESOURCES[0], { wert: 34, zukauf: 0, max: 34 });
  setSkills({ Klettern: 3, Körperbeherrschung: 4, Kraftakt: 8, Selbstbeherrschung: 6, Sinnesschärfe: 5, Zechen: 7,
    Einschüchtern: 5, Menschenkenntnis: 4, Überreden: 3, Handel: 6, Metallbearbeitung: 12, Holzbearbeitung: 5 });
  APPEARANCE.splice(0, APPEARANCE.length,
    { k: "Geschlecht", v: "Männlich" }, { k: "Alter", v: "47 Jahre" }, { k: "Größe", v: "184 cm" },
    { k: "Haarfarbe", v: "grau, kurz" }, { k: "Heimat", v: "Gratenfels" });
  ADVANTAGES.splice(0, ADVANTAGES.length, "Hohe Lebenskraft I", "Zäher Hund");
  DISADVANTAGES.splice(0, DISADVANTAGES.length, "Schlechte Eigenschaft (Jähzorn)");
  SPECIALS.forEach((g) => g.items.splice(0, g.items.length));
  SPECIALS[0].items.push("Fertigkeitsspezialisierung (Metallbearbeitung)", "Ortskenntnis (Gratenfels)");
  LANGUAGES.splice(0, LANGUAGES.length, "Sprache (Garethi) III");
  SCRIPTS.splice(0, SCRIPTS.length);
  clearFavorites();
  FAV_SPECIALS.add("Ortskenntnis (Gratenfels)");
  Object.assign(MELEE[0], { name: "Schmiedehammer", group: "Hiebwaffen", tp: "1W6+4" });
  Object.assign(MELEE[1], { name: "Messer", group: "Dolche" });
  // Wurfbeil liegt im Gepäck (nicht ausgerüstet) und fehlt deshalb auf der Titelseite.
  RANGED.splice(0, RANGED.length, { name: "Wurfbeil", group: "Wurfwaffen", at: 10, tp: "1W6+3", reach: "2/5/10", ammo: "1", img: A.coreWeapon("meleeweapon/Wurfdolch.webp") });
  ARMOR.splice(0, ARMOR.length, { name: "Lederschürze", rs: 1, be: 0, zones: { value: 1 } });
  MAGIC_ARMOR.spell = 0;
  PERSONAE.length = 0;
}

function npcSetup() {
  nonHeroSetup();
  RENDERERS.main = renderNpcMain;
  ONLY_LEP = true;
  document.getElementById("onlyLepToggle").hidden = true;
}

// Wie renderMain() des Helden, ohne Erfahrung (npc-main.hbs hat keine experienceBox).
function renderNpcMain() {
  const wrap = renderMain();
  wrap.querySelectorAll(".panel").forEach((p) => {
    if (p.querySelector(".xp-grid")) p.remove();
  });
  return wrap;
}

/* ------------------------------------------------------------ Kreatur ---- */
// Systembogen (creature-sheet.js): eigener Kopf mit Kreaturklasse statt Spezies/Kultur/Profession, Reiter
// Eigenschaften mit abgeleiteten Werten der Kreatur (creature-derived-attributes-small.hbs) und
// Kreatur-Eigenschaften (traits), Kampf mit natürlichen Angriffen und natürlicher Rüstung (traits), Talente,
// Magie/Religion nur bei Zaubern/Liturgien, „Beute“ statt Ausrüstung (creature-loot.hbs), Notizen mit
// Beschreibung, Verhalten, Flucht, Sonderregeln (creature-notes.hbs). Der Gefährten-Reiter heißt dort „Besitzer“
// (companions/actor-owner.hbs) und zählt nur bei Vertrauten/Begleitern – hier nicht gezeigt.
const CREATURE = {
  creatureClass: "Tier",
  size: "mittel",
  count: "1",
  actions: 1,
  defense: false, // false = Ausweichen, true = Verteidigung (Schalter defenseToggle im System)
  hunt: 2, // Jagd (Tiere) bzw. Beschwörungsschwierigkeit (übrige Kreaturen)
  values: [
    { label: "Seelenkraft", wert: -1, mod: 0, max: -1, editMod: true },
    { label: "Zähigkeit", wert: 0, mod: 0, max: 0, editMod: true },
    { label: "Ausweichen", wert: 7, mod: 0, max: 7, editMod: true },
    { label: "Geschwindigkeit", wert: 10, mod: 0, max: 10, editMod: true },
    { label: "Initiative", wert: 13, mod: 0, max: 13, editMod: true },
    { label: "Initiativewürfel", wert: "1W6", selectWert: true, hideInPlay: true },
  ],
  traits: ["Einzelgänger", "Gute Augen", "Nachtsicht", "Anspringen"],
  specials: [{ label: "Kampf", items: ["Finte I", "Wuchtschlag I"] }],
  attacks: [
    { name: "Biss", at: 12, pa: 6, tp: "1W6+3", reach: "kurz" },
    { name: "Pranke", at: 10, tp: "1W6+1", reach: "kurz", note: "nur nach Anspringen" },
  ],
  armor: [{ name: "Dichtes Fell", rs: 1, be: 0 }],
  loot: [
    { name: "Fell", qty: 1, weight: "2,0", price: "8 S", img: A.armor },
    { name: "Zähne", qty: 6, weight: "0,1", price: "2 H", img: A.meleeWeapon },
    { name: "Fleisch", qty: 4, weight: "1,0", price: "5 H", img: A.tabInventory },
  ],
};

function creatureData() {
  CHARACTER_NAME = "Luchs";
  Object.assign(PORTRAIT_IMG, { img: ICONS + "/categories/Tiere.webp", size: "cover", pos: "50% 50%" });
  setAttrs({ MU: 12, KL: 2, IN: 13, CH: 8, FF: 2, GE: 13, KO: 12, KK: 12 });
  RESOURCES.forEach((r) => {
    if (r.label !== "Lebenskraft" && r.label !== "Schicksalspunkte") r.show = false;
  });
  Object.assign(RESOURCES[0], { wert: 21, zukauf: 0, max: 21 });
  Object.assign(resourceByName("Schicksalspunkte"), { wert: 0, max: 0, used: 0 });
  setSkills({ Körperbeherrschung: 5, Kraftakt: 4, Selbstbeherrschung: 6, Sinnesschärfe: 8, Verbergen: 6, Einschüchtern: 4, Fährtensuchen: 9 });
  TRAITS.meleeAttack.splice(0, TRAITS.meleeAttack.length);
  clearFavorites();
  MELEE.length = 0; // keine ausgerüsteten Waffen, nur natürliche Angriffe
  RANGED.length = 0;
  CONDITIONS.forEach((c) => { c.filled = 0; });
  PERSONAE.length = 0;
}

function resourceByName(label) {
  return RESOURCES.find((r) => r.label === label);
}

function creatureSetup() {
  nonHeroSetup();
  ONLY_LEP = true;
  document.getElementById("onlyLepToggle").hidden = true;
  document.getElementById("armorOneToggle").hidden = true;
  RENDERERS.main = renderCreatureMain;
  RENDERERS.combat = renderCreatureCombat;
  RENDERERS.inventory = renderCreatureLoot;
  delete SECTION_TABS.combat;
  skillOnlyLearned = true;
  setNotesSections([
    textSection("description", "Beschreibung", "Platzhalter: Aussehen und Lebensraum der Kreatur.", "Sichtbar für alle, die den Bogen sehen dürfen."),
    textSection("behaviour", "Verhalten", "Platzhalter: wie sich die Kreatur im Kampf und außerhalb verhält.", "Sichtbar für alle, die den Bogen sehen dürfen."),
    textSection("flight", "Flucht", "Platzhalter: wann die Kreatur flieht.", "Sichtbar für alle, die den Bogen sehen dürfen."),
    textSection("specialRules", "Sonderregeln", "Platzhalter: besondere Regeln der Kreatur.", "Sichtbar für alle, die den Bogen sehen dürfen."),
    textSection("notes", "Notizen", "", "Sichtbar für alle, die den Bogen sehen dürfen."),
    textSection("ownernotes", "Private Notizen", "", "Privat: nur für Besitzer und die Spielleitung sichtbar."),
  ]);
}

// Kopf: Kreaturklasse statt Spezies · Kultur · Profession (creature-header.hbs), dazu Größe und Anzahl als Text.
function creatureBadges(wrap) {
  const sep = () => el("span", { class: "ident-sep", "aria-hidden": "true" }, "·");
  const cls = el("button", { type: "button", class: "ident-link", title: "Kreaturklasse – im System zeigt der Tooltip die Beschreibung der Klasse" }, CREATURE.creatureClass);
  wrap.append(cls, sep(), el("span", { class: "ident-text" }, `Größe ${CREATURE.size}`), sep(), el("span", { class: "ident-text" }, `Anzahl ${CREATURE.count}`));
}

function creatureValueRows() {
  const mode = document.querySelector(".sheet").getAttribute("data-mode");
  const defenseLabel = CREATURE.defense ? "Verteidigung" : "Ausweichen";
  const rows = CREATURE.values.map((d) => (d.label === "Ausweichen" ? { ...d, label: defenseLabel } : d));
  const extra = [
    { label: "Aktionen", wert: "–", max: CREATURE.actions },
    { label: CREATURE.creatureClass === "Tier" ? "Jagd" : "Beschwörungsschwierigkeit", wert: "–", max: CREATURE.hunt },
    { label: "Größenkategorie", wert: CREATURE.size, selectWert: true },
  ];
  const toggle = el("button", { type: "button", class: "chip-like defense-toggle", title: "Ausweichen oder Verteidigung (Schalter des Systems)", "aria-pressed": String(CREATURE.defense) }, CREATURE.defense ? "🛡 Verteidigung" : "🛡 Ausweichen");
  toggle.addEventListener("click", () => { CREATURE.defense = !CREATURE.defense; renderContent(); });
  return [
    el("div", { class: "subhead" }, "Ressourcen"),
    el("div", { class: "row-head derived-row" }, head("", "Aktuell", "Mod", "Zukauf", "Max")),
    ...RESOURCES.filter((d) => d.show !== false && d.label !== "Schicksalspunkte").map(buildResourceRow),
    el("div", { class: "subhead" }, "Werte"),
    el("div", { class: "row-head simple-row" }, head("", "Basis", "Mod", "Max")),
    ...rows.map(buildSimpleRow),
    ...extra.map(buildSimpleRow),
    mode === "edit" ? el("div", { class: "panel-foot" }, [toggle]) : null,
  ];
}

function renderCreatureMain() {
  const values = el("div", { class: "panel" }, [el("div", { class: "panel-title" }, "Werte"), ...creatureValueRows()]);
  const traits = el("div", { class: "panel" }, [
    el("div", { class: "panel-title flex" }, [el("span", {}, "Kreatur-Eigenschaften"), specHelpBtn()]),
    el("div", { class: "chips chips-fill" }, CREATURE.traits.map((t) => deletableChip(A.abilityGeneral, t, CREATURE.traits, t))),
  ]);
  return el("div", {}, [
    buildAttrTiles(),
    buildAttrDetailPanel(),
    el("div", { class: "grid-2" }, [
      el("div", { class: "col-gap" }, [traits, specialsBlock("Sonderfertigkeiten", CREATURE.specials, true)]),
      el("div", {}, [values]),
    ]),
  ]);
}

// Kampf: natürliche Angriffe als Zeilen wie „Weitere Waffen“ im Heldenbogen (Würfel AT/PA, Schadensknopf),
// natürliche Rüstung, Verteidigung, Passive Verteidigung (Hausregel) und Kampf-Sonderfertigkeiten. Keine Hände und
// keine Körperfigur – Kreaturen führen in der Regel keine Waffen.
// Auch für ausgerüstete Waffen auf der Titelseite (img, ranged).
function creatureAttackRow(a) {
  return el("div", { class: "row short-weapon-row" }, [
    el("img", { src: a.img || A.combatSkill, alt: "" }),
    el("span", { class: "left weapon-name" }, [el("span", { title: a.name }, a.name), el("small", { class: "weapon-sub" }, [`RW ${a.reach}`, a.note ? ` · ${a.note}` : ""].join(""))]),
    el("span", { class: "short-weapon-dice" }, [
      combatDie(a.at, "d20mu", `${a.ranged ? "Fernkampf" : "Attacke"} mit ${a.name} würfeln`),
      a.pa !== undefined ? combatDie(a.pa, "d20in", `Parade mit ${a.name} würfeln`) : null,
    ]),
    damageBtn(a.tp, a.name),
    el("span", {}),
    el("span", {}),
  ]);
}

function renderCreatureCombat() {
  const defense = CREATURE.values.find((v) => v.label === "Ausweichen");
  const rs = CREATURE.armor.reduce((s, a) => s + a.rs, 0);
  const stat = (label, value, die) => el("div", { class: "creature-stat" }, [
    die ? combatDie(value, die, `${label} würfeln`) : el("b", {}, String(value)),
    el("small", {}, label),
  ]);
  return el("div", {}, [
    el("div", { class: "panel" }, [
      el("div", { class: "panel-title" }, "Kampfwerte"),
      el("div", { class: "creature-stats" }, [
        stat(CREATURE.defense ? "Verteidigung" : "Ausweichen", defense.max, "d20ge"),
        stat("Rüstungsschutz", rs),
        stat("Initiative", CREATURE.values.find((v) => v.label === "Initiative").max),
        stat("Aktionen", CREATURE.actions),
        stat("Geschwindigkeit", CREATURE.values.find((v) => v.label === "Geschwindigkeit").max),
      ]),
    ]),
    el("div", { class: "panel" }, [el("div", { class: "panel-title" }, "Angriffe"), el("div", { class: "short-weapons" }, CREATURE.attacks.map(creatureAttackRow))]),
    el("div", { class: "panel" }, [
      el("div", { class: "panel-title" }, "Natürliche Rüstung"),
      ...CREATURE.armor.map((a) => el("div", { class: "row simple-row" }, [el("span", { class: "left" }, a.name), el("span", { class: "muted center" }, `RS ${a.rs}`), el("span", { class: "muted center" }, `BE ${a.be}`), el("span", {})])),
    ]),
    autoDefenseBlock(),
    specialsBlock("Kampfsonderfertigkeiten", CREATURE.specials),
  ]);
}

// Beute (creature-loot.hbs): Gegenstandsliste mit Suche, ohne Geldbörse, Traglast und Behältnis-Kacheln.
function renderCreatureLoot() {
  return el("div", {}, [
    el("div", { class: "panel" }, [
      el("div", { class: "panel-title flex" }, [el("span", {}, "Beute"), el("small", {}, "für die Helden nach dem Kampf")]),
      el("div", { class: "row-head inv-row" }, head("", "Gegenstand", "", "Anz.", "Gew.", "Preis", "", "")),
      ...CREATURE.loot.map((i) => inventoryRow(i, CREATURE.loot)),
    ]),
  ]);
}

/* ----------------------------------------------------------- Auswahl ---- */
const ACTOR_TYPES = {
  nsc: {
    toolbar: "NSC-Bogen · Click-Dummy",
    tabs: ["cover", "main", "skills", "combat", "inventory", "status", "notes", "companions"],
    data: npcData,
    setup: npcSetup,
  },
  kreatur: {
    toolbar: "Kreaturbogen · Click-Dummy",
    tabs: ["cover", "main", "skills", "combat", "inventory", "status", "notes"],
    rename: { inventory: { label: "Beute", title: "Beute" } },
    data: creatureData,
    setup: creatureSetup,
    headBadges: creatureBadges,
    coverTabs: [["conditions", "Statuseffekte"]],
    noAP: true,
  },
};
ACTOR_TYPES.nsc.noAP = true;

const ACTOR_TYPE = ACTOR_TYPES[ACTOR_KIND] || null;
if (ACTOR_TYPE) {
  keepTabs(ACTOR_TYPE.tabs, ACTOR_TYPE.rename);
  ACTOR_TYPE.data();
}
