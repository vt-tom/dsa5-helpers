/* NSC- und Kreaturbogen (Issues #53/#54, Nutzerentscheidung 2026-10-30): Grundlage ist das Heldenbogen-Gerüst,
   NSC und Kreatur getrennt entworfen. Beide haben nur die Reiter, die der Systembogen für den Typ kennt
   (npc-sheet.js / creature-sheet.js), plus eine Titelseite. Titelseite nach Rückmeldung 2026-10-31 (renderTypeCover):
   RS, INI, GS, SK, ZK; Angriffe nur mit ausgerüsteten Waffen (Kreatur: dazu die natürlichen Angriffe); Talente mit
   Wert, Anzahl per − / + wie bei den Vorschlägen des Heldenbogens, Sinnesschärfe und Willenskraft immer; alles
   Weitere über Favoriten (Sterne wie beim Helden). Kreatur seit 2026-11-12 ohne Anzahl und Favoriten: alle Talente mit Wert,
   dazu Zauber und Liturgien (creatureCoverLists).

   Aufruf: index.html?actor=nsc, ?actor=kreatur (&beispiel=ork) bzw. ?actor=gruppe (&variante=s|m|l setzt die Kachelgröße beim Laden); ohne Parameter der Heldenbogen. Diese Datei lädt nach data.js
   und vor script.js: Daten werden hier ersetzt, setup() läuft am Ende von script.js vor dem ersten Rendern und hängt
   die abweichenden Reiter ein. Alle Werte und Texte sind frei erfundene Platzhalter. */

const ACTOR_KIND = new URLSearchParams(location.search).get("actor");
// Kreatur-Beispiel (2026-11-12): ?actor=kreatur&beispiel=ork zeigt eine humanoide Kreatur mit Talenten, Kampftechniken
// und ausgerüsteten Waffen (Issue #54); ohne Parameter das Tier (Luchs).
const CREATURE_EXAMPLE = ACTOR_KIND === "kreatur" ? new URLSearchParams(location.search).get("beispiel") : null;

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
  COVER_SIDE_TAB = "values";
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

// Werte als Reiter der linken Spalte (Rückmeldung 2026-11-12: mehr Platz auf der Titelseite), neben Statuseffekten.
function typeSideValues() {
  return [el("dl", { class: "side-details" }, typeCoverValues().map(([key, label, value]) =>
    el("div", { title: `${label}: ${value}` }, [el("dt", {}, `${label} (${key})`), el("dd", {}, String(value))])))];
}
const typeCoverSideBody = (id) => (id === "values" ? typeSideValues() : null);

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

// Kreatur (Rückmeldung 2026-11-12): alle Talente mit Wert, dazu Zauber/Rituale und Liturgien/Zeremonien, falls
// vorhanden – ohne Anzahl-Regler und ohne Favoriten. Sinnesschärfe und Willenskraft stehen weiter immer oben.
function creatureCoverCard(item, kind) {
  const card = favCard(item, kind);
  card.querySelector(".fav-star")?.replaceWith(el("span", { class: "fav-star fixed-talent" }));
  return card;
}

function creatureCoverLists() {
  const all = SKILL_GROUPS.flatMap((g) => g.items);
  const fixed = FIXED_COVER_TALENTS.map((n) => all.find((s) => s.name === n)).filter(Boolean);
  const rest = all.filter((s) => s.fw > 0 && !fixed.includes(s)).sort((a, b) => b.fw - a.fw);
  const list = (title, items, kind) => (items.length ? el("div", { class: "panel" }, [
    el("div", { class: "panel-title" }, title),
    el("div", { class: "fav-grid" }, items.map((i) => creatureCoverCard(i, kind))),
  ]) : null);
  return [
    list(`Talente (${fixed.length + rest.length})`, [...fixed, ...rest], "talent"),
    list("Zauber und Rituale", [...SPELLS, ...RITUALS].filter((x) => x.fw > 0), "spell"),
    list("Liturgien und Zeremonien", [...LITURGIES, ...CEREMONIES].filter((x) => x.fw > 0), "liturgy"),
  ].filter(Boolean);
}

function renderTypeCover() {
  const frag = document.createDocumentFragment();
  // Werte stehen seit 2026-11-12 links im Reiter „Werte“ (typeSideValues); im schmalen Fenster ebenso (Leiste unter dem Inhalt).
  if (ACTOR_KIND === "kreatur") frag.append(typeCoverAttacks(), ...creatureCoverLists());
  else frag.append(typeCoverAttacks(), typeCoverTalents(), favoritesPanel());
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
  document.getElementById("merchantModeToggle").hidden = true; // NSC-Bogen noch ohne Foundry-Umsetzung (#53)
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
  [SPELLS, RITUALS, LITURGIES, CEREMONIES].forEach((list) => { list.length = 0; });
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

function creatureCombatStats() {
  const defense = CREATURE.values.find((v) => v.label === "Ausweichen");
  const rs = CREATURE.armor.reduce((s, a) => s + a.rs, 0);
  const stat = (label, value, die) => el("div", { class: "creature-stat" }, [
    die ? combatDie(value, die, `${label} würfeln`) : el("b", {}, String(value)),
    el("small", {}, label),
  ]);
  return el("div", { class: "panel" }, [
    el("div", { class: "panel-title" }, "Kampfwerte"),
    el("div", { class: "creature-stats" }, [
      stat(CREATURE.defense ? "Verteidigung" : "Ausweichen", defense.max, "d20ge"),
      stat("Rüstungsschutz", rs),
      stat("Initiative", CREATURE.values.find((v) => v.label === "Initiative").max),
      stat("Aktionen", CREATURE.actions),
      stat("Geschwindigkeit", CREATURE.values.find((v) => v.label === "Geschwindigkeit").max),
    ]),
  ]);
}

function renderCreatureCombat() {
  const rs = CREATURE.armor.reduce((s, a) => s + a.rs, 0);
  return el("div", {}, [
    creatureCombatStats(),
    el("div", { class: "panel" }, [el("div", { class: "panel-title" }, "Angriffe"), el("div", { class: "short-weapons" }, CREATURE.attacks.map(creatureAttackRow))]),
    el("div", { class: "panel" }, [
      el("div", { class: "panel-title" }, "Natürliche Rüstung"),
      ...CREATURE.armor.map((a) => el("div", { class: "row simple-row" }, [el("span", { class: "left" }, a.name), el("span", { class: "muted center" }, `RS ${rs ? a.rs : 0}`), el("span", { class: "muted center" }, `BE ${a.be}`), el("span", {})])),
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

/* ----------------------------------------------- Kreatur, humanoid (Ork) ---- */
// Humanoide Kreatur (Rückmeldung #54, 2026-10-30; Annahme 3 bestätigt 2026-11-12): Kreaturbogen des Systems, aber mit
// Talenten, Kampftechniken und ausgerüsteten Waffen. Titelseite: natürlicher Angriff (gilt immer als ausgerüstet) und
// die Waffen in den Händen. Kampf-Reiter wie beim NSC (Hände, Kampftechniken), darüber die Kampfwerte der Kreatur; der
// natürliche Angriff steht dort bei den angeborenen Angriffen. Werte frei erfunden, keine Regeltexte.
function orcData() {
  creatureData();
  CHARACTER_NAME = "Ork-Schamane";
  Object.assign(PORTRAIT_IMG, { img: ICONS + "/Maske.webp", size: "contain", pos: "50% 50%" });
  setAttrs({ MU: 13, KL: 9, IN: 12, CH: 9, FF: 11, GE: 12, KO: 14, KK: 14 });
  Object.assign(RESOURCES[0], { wert: 30, zukauf: 0, max: 30 });
  setSkills({ Einschüchtern: 7, Kraftakt: 7, Körperbeherrschung: 5, Selbstbeherrschung: 7, Sinnesschärfe: 5, Willenskraft: 4,
    Fährtensuchen: 5, Wildnisleben: 6, Zechen: 5, Verbergen: 4 });
  Object.assign(CREATURE, {
    creatureClass: "Kulturschaffende",
    hunt: 2,
    traits: ["Dunkelsicht I", "Gute Nase"],
    specials: [{ label: "Kampf", items: ["Wuchtschlag I", "Belastungsgewöhnung I"] }],
    attacks: [{ name: "Faustschlag", at: 9, pa: 5, tp: "1W6", reach: "kurz", note: "natürlicher Angriff" }],
    armor: [{ name: "Lederharnisch", rs: 3, be: 1 }],
    loot: [
      { name: "Münzbeutel", qty: 1, weight: "0,2", price: "12 S", img: A.tabInventory },
      { name: "Knochenkette", qty: 1, weight: "0,1", price: "3 S", img: A.tabInventory },
    ],
  });
  CREATURE.values.forEach((v) => {
    const set = { Seelenkraft: 0, Zähigkeit: 1, Ausweichen: 6, Geschwindigkeit: 8, Initiative: 12 }[v.label];
    if (set !== undefined) Object.assign(v, { wert: set, max: set });
  });
  // Ausgerüstet: Säbel in der Haupthand, Rundschild in der Nebenhand; der Wurfspeer liegt im Gepäck (nicht auf der Titelseite).
  MELEE.splice(0, MELEE.length,
    { name: "Arbach", group: "Säbel", at: 12, pa: 6, tp: "1W6+4", reach: "mittel", img: A.meleeWeapon, worn: { requiresBothHands: false, offHand: false } },
    { name: "Rundschild", group: "Schilde", at: 8, pa: 10, tp: "1W6+1", reach: "kurz", img: A.armor, worn: { requiresBothHands: false, offHand: true } },
    { name: "Waffenlos", group: "Raufen", at: 9, pa: 5, tp: "1W6", reach: "kurz", img: A.weaponless });
  RANGED.splice(0, RANGED.length, { name: "Wurfspeer", group: "Wurfwaffen", at: 10, tp: "1W6+3", reach: "5/15/25", ammo: "1", img: A.meleeWeapon });
  TRAITS.meleeAttack.splice(0, TRAITS.meleeAttack.length, { ...CREATURE.attacks[0], group: "natürlich", img: A.weaponless });
  ARMOR.splice(0, ARMOR.length, { name: "Lederharnisch", rs: 3, be: 1, zones: { value: 3 } });
  // Zauber (Rückmeldung 2026-11-12: auf der Titelseite wie die Talente; im System dann auch der Reiter Magie)
  SPELLS.push(
    { name: "Blitz dich find", probe: "KL/FF/KO", cost: 8, fw: 6, dauer: "1 Aktion", reach: "Selbst", img: A.spell("blitz-dich-find"), stf: "A" },
    { name: "Balsam Salabunde", probe: "KL/IN/KO", cost: 8, fw: 4, dauer: "1 Aktion", reach: "Berührung", img: A.spell("balsam-salabunde"), stf: "B" });
  // Werte des Kampf-Reiters passend zu den Kreaturwerten; Körperfigur neutral (das System kennt nur Elf/Mensch/Zwerg).
  Object.assign(COMBAT_DERIVED.find((d) => d.label === "Ausweichen"), { wert: 6, max: 6 });
  Object.assign(COMBAT_DERIVED.find((d) => d.label === "Initiative"), { max: 12 });
  COMBAT_ACTIONS.forEach((a) => Object.assign(a, { Ausweichen: { value: 6 }, "Waffenloser Angriff": { value: 9 }, "Waffenlose Verteidigung": { value: 5 } }[a.label] ?? {}));
  IDENTITY.species.name = "Mensch";
}

function orcSetup() {
  const heroCombat = RENDERERS.combat;
  const combatSections = SECTION_TABS.combat;
  creatureSetup();
  RENDERERS.combat = () => {
    const wrap = heroCombat();
    wrap.prepend(creatureCombatStats());
    return wrap;
  };
  if (combatSections) SECTION_TABS.combat = combatSections;
  document.getElementById("armorOneToggle").hidden = false;
  // Magie-Reiter der Kreatur: nur die Zauberliste (Tradition, AsP-Werte usw. wie im Systembogen folgen bei der Umsetzung)
  RENDERERS.magic = () => el("div", {}, [el("div", { class: "panel" }, [
    el("div", { class: "panel-title" }, "Zauber"),
    el("div", { class: "fav-grid" }, SPELLS.map((x) => creatureCoverCard(x, "spell"))),
  ])]);
  delete SECTION_TABS.magic;
}

/* ------------------------------------------------------------- Gruppe ---- */
// Gruppenbogen (Issue #55, Entscheidungen 2026-11-12): Systemakteur „group“ (DSA5 8.x, nur Foundry v14). Titelblatt:
// oben Gruppenkasse, Gruppen-Schips und Reisetempo, darunter die Mitglieder mit Porträt, LeP/AsP/KaP, Zuständen und
// Schips – in zwei ruhigen Varianten (Menü › Diese Seite, ?variante=a|b). Werkzeuge der Spielleitung gesammelt
// auf einem eigenen Reiter, der Reiter „Lager“ zeigt Werkzeuge des Moduls (Vorschlag). Alle Namen und Werte sind frei
// erfundene Platzhalter; Aktionen erben wir im Modul vom Systembogen (GroupActorSheet), hier nur Rückmeldungen.
const MONEY_ICON = (k) => `${ICONS}/money-${k}.webp`;
const GROUP = {
  name: "Die Gefährten vom Bornwald",
  vis: { identity: true, lep: false, pools: false, cond: false },
  // Anfragen von Spielern an die SL (Rückmeldung 2026-11-12): im Modul eine Chat-Nachricht nur an die SL mit
  // „Ausführen“/„Ablehnen“; hier sammelt der Dummy sie und zeigt sie der SL oben im Lager-Reiter.
  requests: [{ who: "Ben", what: "Nahrungssuche", note: "Unser Proviant reicht nur noch einen Tag." }],
  purse: [["D", "Dukaten", 3], ["S", "Silbertaler", 41], ["H", "Heller", 18], ["K", "Kreuzer", 7]],
  schips: { max: 3, used: 1 },
  travel: [
    { mode: "Zu Fuß", value: 7, mod: 0, meilen: "3,2", note: "langsamstes Mitglied: Thorgrim (GS 6)" },
    { mode: "Fahrzeug", value: 10, mod: 0, meilen: "4,5", note: "Depot „Planwagen“" },
    { mode: "Fluss", value: 8, mod: 0, meilen: "3,6", note: "" },
    { mode: "See", value: 14, mod: 0, meilen: "6,3", note: "" },
  ],
  forcedMarch: 0,
  members: [
    { name: "Layariel Wipfelglanz", img: `${ICONS}/species/Elf.webp`, ident: "Elf · Waldläuferin", owner: "Anna", color: "#4a7fc0", lep: [28, 32], asp: [24, 34], cond: [["Schmerz", 1]], schips: [3, 1], ap: "1 320" },
    { name: "Alrik Grimmwald", img: `${ICONS}/species/Mensch.webp`, ident: "Mensch · Söldner", owner: "Ben", color: "#b0563c", lep: [38, 38], cond: [], schips: [3, 0], ap: "1 280" },
    { name: "Rhulana Kirschweiler", img: `${ICONS}/species/Mensch.webp`, ident: "Mensch · Geweihte der Travia", owner: "Clara", color: "#4f8a3e", lep: [22, 29], kap: [18, 24], cond: [["Furcht", 1]], schips: [3, 2], ap: "1 300" },
    { name: "Thorgrim Sohn des Thorbosch", img: `${ICONS}/species/Zwerg.webp`, ident: "Zwerg · Kämpfer", owner: "David", color: "#8a6a2e", lep: [14, 41], cond: [["Schmerz", 2], ["Betäubung", 1]], schips: [3, 3], ap: "1 260" },
    { name: "Sturmwind", img: `${ICONS}/categories/Tiere.webp`, ident: "Elfenpferd · Reittier von Layariel", owner: "Anna", color: "#4a7fc0", lep: [52, 52], cond: [], schips: null, ap: null },
  ],
  skills: [
    ["Körper", [["Sinnesschärfe", 12, "Layariel", [["Alrik", 6], ["Rhulana", 5], ["Thorgrim", 4]]], ["Kraftakt", 11, "Thorgrim", [["Alrik", 9], ["Layariel", 3]]], ["Verbergen", 9, "Layariel", [["Alrik", 2]]], ["Körperbeherrschung", 8, "Layariel", [["Alrik", 5], ["Thorgrim", 3]]]]],
    ["Gesellschaft", [["Menschenkenntnis", 9, "Rhulana", [["Layariel", 5], ["Alrik", 3]]], ["Überreden", 7, "Rhulana", [["Alrik", 4]]], ["Willenskraft", 8, "Rhulana", [["Layariel", 7], ["Thorgrim", 6], ["Alrik", 5]]]]],
    ["Natur", [["Fährtensuchen", 10, "Layariel", [["Alrik", 3]]], ["Wildnisleben", 11, "Layariel", [["Thorgrim", 4], ["Alrik", 4]]], ["Orientierung", 8, "Layariel", [["Rhulana", 3]]]]],
    ["Handwerk", [["Heilkunde Wunden", 9, "Rhulana", [["Layariel", 6]]], ["Metallbearbeitung", 10, "Thorgrim", []]]],
  ],
  depots: [
    { name: "Planwagen", kind: "Fahrzeug", locked: false, players: true, weight: "86,0 / 400", coins: "12 S", items: [["Zelt (4 Personen)", 1, "8,0"], ["Proviant (Tag)", 20, "10,0"], ["Fass Bier", 1, "25,0"], ["Werkzeugkiste", 1, "6,5"]] },
    { name: "Truhe im Gasthaus „Zum Krummen Kessel“", kind: "Lagerdepot", locked: true, players: false, weight: "12,5 / 50", coins: "2 D", items: [["Heiltrank", 3, "0,6"], ["Landkarte Bornland", 1, "0,1"]] },
  ],
  biography: "Platzhalter: wie sich die Gruppe gefunden hat und was sie zusammenhält.",
  notes: "Platzhalter: offene Fäden, Schulden, Versprechen.",
};
// Kachelgröße (Rückmeldung 2026-11-12): Umschalter auf dem Titelblatt, jede Gruppe wählt selbst; im Modul je Benutzer
// gespeichert (User-Flag am Gruppenakteur, wie die Anzahl der Vorschläge im Heldenbogen).
let GROUP_VARIANT = "m";
// Rollen wie im Systembogen (Rückmeldung 2026-11-12): Von fremden Mitgliedern sehen Spieler nur Porträt, Name und Spezies;
// Kultur, Profession und Schips nur, wenn die SL sie nicht ausblendet (canViewForeignIdentity); LeP/AsP/KaP und Zustände
// nur bei eigenen Helden (showStatusBars = canViewPrivateDetails). Gruppenkasse und Reise ändern alle Besitzer, Talente
// sehen alle; Depots sehen alle, handeln nur mit Rechten am Depot-Akteur. Nur SL: Hauptgruppe, Besitz teilen,
// Identität umschalten, Eigenschaftsproben, Gruppenprobe/Probe anfordern, Gruppen-Schips (isGM im Kopf), Depots
// verwalten. Testschalter: Menü › Ansicht › Rolle.
// Der Spieler im Dummy ist „Anna“ (Layariel und ihr Pferd Sturmwind).
const GROUP_PLAYER = "Anna";
const groupIsGM = () => !AS_PLAYER;
const groupOwn = (m) => groupIsGM() || m.owner === GROUP_PLAYER;
// Kennzeichen „nur SL“: zeigt der Spielleitung, was Spieler nicht sehen bzw. nicht ändern können.
const gmTag = (text = "nur SL") => (groupIsGM() ? el("span", { class: "group-gm-tag", title: "Spieler sehen bzw. ändern das nicht" }, text) : null);

const groupToast = (text) => {
  const t = el("div", { class: "group-toast", role: "status" }, text);
  document.querySelector(".sheet").append(t);
  setTimeout(() => t.remove(), 1800);
};
// Titelblatt, dritte Runde (Rückmeldung 2026-11-12): Kasse, Gruppen-Schips und Reisetempo links unter dem Überblick, rechts
// nur die Mitglieder als Kacheln. Drei Kachelgrößen zum Vergleich, was hineinpasst und wie groß die Schrift wird:
// S klein (drei Spalten, nur das Nötigste), M mittel (zwei Spalten), L groß (eine Spalte, alles inklusive Kugeln).
// Festes Raster, gleiche Höhen, „–“ für fehlende Werte, Farbe nur für Füllstände, Spieler im Tooltip.
const GROUP_POOLS = [["lep", "LeP"], ["asp", "AsP"], ["kap", "KaP"]];
const groupPortrait = (m, cls = "") => el("span", { class: "group-portrait " + cls, style: `background-image:url('${m.img}')`, title: `${m.name} · Spieler: ${m.owner}` });
const groupCondText = (m) => (m.cond.length ? m.cond.map(([n, l]) => `${n} ${["", "I", "II", "III", "IV"][l]}`).join(", ") : "keine Zustände");
// Was Spieler von fremden Mitgliedern sehen, stellt die SL im Bearbeiten-Modus ein (Rückmeldung 2026-11-12). Porträt,
// Name und Spezies sehen sie immer. „identity“ = Kultur, Profession, Schips (Systemeinstellung privacy.hideForeignIdentity,
// umgekehrt); LeP, AsP/KaP und Zustände sind Erweiterungen des Moduls (Flag am Gruppenakteur). Standard wie im System:
// Identität sichtbar, Werte und Zustände nicht. Ändern dürfen Spieler Werte weiterhin nur bei eigenen Helden.
const GROUP_VIS_OPTIONS = [["identity", "Kultur, Profession und Schips"], ["lep", "LeP"], ["pools", "AsP und KaP"], ["cond", "Zustände"]];
const groupSees = (m, what) => groupOwn(m) || GROUP.vis[what];
const groupPoolKey = (k) => (k === "lep" ? "lep" : "pools");
const groupHiddenTitle = "für Spieler nicht freigegeben";

function groupPool(m, k, label) {
  if (!m[k]) return el("span", { class: "group-pool empty", title: `kein ${label}` }, "–");
  const [cur, max] = m[k];
  if (!groupSees(m, groupPoolKey(k))) return el("span", { class: "group-pool empty", title: groupHiddenTitle }, "–");
  const own = groupOwn(m);
  const b = el(own ? "button" : "span", { ...(own ? { type: "button" } : {}), class: `group-pool ${k}${own ? "" : " readonly"}`, title: `${label} ${cur} von ${max}${own ? " – ändern" : ""}` }, [
    el("span", { class: "group-pool-num" }, [el("b", {}, String(cur)), el("small", {}, ` / ${max}`)]),
    el("span", { class: "group-pool-bar" }, el("i", { style: `width:${Math.round(100 * cur / max)}%` })),
  ]);
  if (own) b.addEventListener("click", () => groupToast(`${m.name}: ${label} ändern (Feld mit −/+ wie im Heldenbogen)`));
  return b;
}
const groupOrb = (m, k, label) => {
  if (!m[k] || !groupSees(m, groupPoolKey(k))) return null;
  const [cur, max] = m[k];
  const own = groupOwn(m);
  const b = el(own ? "button" : "span", { ...(own ? { type: "button" } : {}), class: `group-orb orb-${k}${own ? "" : " readonly"}`, style: `--p:${Math.round(100 * cur / max)}%`, title: `${label} ${cur} von ${max}${own ? " – ändern" : ""}` }, [el("i"), el("b", {}, [el("small", {}, label), String(cur)])]);
  if (own) b.addEventListener("click", () => groupToast(`${m.name}: ${label} ändern (Feld mit −/+ wie im Heldenbogen)`));
  return b;
};
const groupSchips = (m) => (!groupSees(m, "identity") ? el("span", { class: "group-pool empty", title: groupHiddenTitle }, "–") : m.schips ? el("span", { class: "group-schips", title: `Schicksalspunkte ${m.schips[0] - m.schips[1]} von ${m.schips[0]}` },
  Array.from({ length: m.schips[0] }, (_, i) => el("img", { src: `${ICONS}/${i >= m.schips[0] - m.schips[1] ? "gray_schip" : "schip"}.webp`, alt: "" }))) : el("span", { class: "group-pool empty" }, "–"));
const groupIdent = (m) => (groupSees(m, "identity") ? m.ident : m.ident.split(" · ")[0]);
const groupName = (m) => {
  const b = el("button", { type: "button", class: "group-name", title: `Bogen von ${m.name} öffnen` }, [el("b", {}, m.name), el("small", {}, groupIdent(m))]);
  b.addEventListener("click", () => groupToast(`Öffnet den Bogen von ${m.name}`));
  return b;
};
const groupCondCount = (m) => (!groupSees(m, "cond") ? el("span", { class: "group-pool empty", title: groupHiddenTitle }, "–") : m.cond.length
  ? el("span", { class: "group-cond-count", title: groupCondText(m) }, String(m.cond.length))
  : el("span", { class: "group-pool empty", title: "keine Zustände" }, "–"));
const groupCondLine = (m) => (groupSees(m, "cond") ? el("span", { class: "group-cond" + (m.cond.length ? " on" : "") }, groupCondText(m)) : el("span", { class: "group-cond" }, ""));
const groupAnyValues = (m) => groupOwn(m) || GROUP.vis.lep || GROUP.vis.pools;

// S: klein, drei Spalten – Porträt, Name, LeP, Zustände als Zahl
const groupTileS = (m) => el("div", { class: "group-tile size-s" }, [
  groupPortrait(m, "round"),
  el("button", { type: "button", class: "group-name center", title: `${m.name} · ${groupIdent(m)}` }, el("b", {}, m.name.split(" ")[0])),
  groupPool(m, "lep", "LeP"),
  el("div", { class: "group-tile-foot" }, [
    el("span", { class: "group-mini-pools" }, groupSees(m, "pools") ? GROUP_POOLS.slice(1).filter(([k]) => m[k]).map(([k, l]) => el("span", { class: `group-mini ${k}`, title: `${l} ${m[k][0]} / ${m[k][1]}` }, `${l} ${m[k][0]}`)) : []),
    groupCondCount(m),
  ]),
]);

// M: mittel, zwei Spalten – Name mit Herkunft, LeP/AsP/KaP nebeneinander, Schips und Zustände als Text
const groupTileM = (m) => el("div", { class: "group-tile size-m" }, [
  el("div", { class: "group-member" }, [groupPortrait(m), groupName(m)]),
  groupAnyValues(m) ? el("div", { class: "group-tile-pools" }, GROUP_POOLS.map(([k, l]) => el("div", {}, [el("small", {}, l), groupPool(m, k, l)])))
    : el("div", { class: "group-tile-pools hidden-values" }, el("small", {}, "Werte für Spieler nicht freigegeben")),
  el("div", { class: "group-tile-foot" }, [groupSchips(m), groupCondLine(m)]),
]);

// L: groß, eine Spalte – großes Porträt, Kugeln wie im Heldenbogen, Zustände als Chips, Knöpfe
function groupTileL(m) {
  const open = el("button", { type: "button", class: "group-tile-btn", title: `Bogen von ${m.name} öffnen` }, "Bogen öffnen");
  open.addEventListener("click", () => groupToast(`Öffnet den Bogen von ${m.name}`));
  const orbs = GROUP_POOLS.map(([k, l]) => groupOrb(m, k, l)).filter(Boolean);
  return el("div", { class: "group-tile size-l" }, [
    groupPortrait(m, "large"),
    el("div", { class: "group-tile-main" }, [
      el("div", { class: "group-tile-head" }, [el("div", { class: "group-name" }, [el("b", {}, m.name), el("small", {}, `${groupIdent(m)} · Spieler: ${m.owner}`)]), open]),
      el("div", { class: "group-tile-orbs" }, [...(orbs.length ? orbs : [el("span", { class: "muted" }, "Werte für Spieler nicht freigegeben")]), groupSchips(m)]),
      !groupSees(m, "cond") ? null : el("div", { class: "group-conds" }, m.cond.length ? m.cond.map(([n, l]) => el("span", { class: "chip" }, `${n} ${["", "I", "II", "III", "IV"][l]}`)) : [el("span", { class: "muted" }, "keine Zustände")]),
    ]),
  ]);
}

// Einstellung der SL im Bearbeiten-Modus (über den Kacheln): was Spieler von fremden Mitgliedern sehen
function groupVisibilityPanel() {
  if (!groupIsGM() || sheetMode() !== "edit") return null;
  const chips = GROUP_VIS_OPTIONS.map(([key, label]) => {
    const b = el("button", { type: "button", class: "group-gm-btn", "aria-pressed": String(GROUP.vis[key]) }, label);
    b.addEventListener("click", () => { GROUP.vis[key] = !GROUP.vis[key]; renderContent(); });
    return b;
  });
  return el("div", { class: "panel group-vis" }, [
    el("div", { class: "panel-title flex" }, [el("span", {}, "Spieler sehen bei anderen Mitgliedern"), gmTag()]),
    el("div", { class: "group-gm-grid" }, [el("span", { class: "muted" }, "immer: Porträt, Name, Spezies ·"), ...chips]),
  ]);
}

function groupSizeSwitch() {
  const wrap = el("div", { class: "group-size-switch", role: "group", "aria-label": "Größe der Kacheln" }, [
    ...[["s", "Klein"], ["m", "Mittel"], ["l", "Groß"]].map(([v, l]) => {
      const b = el("button", { type: "button", "aria-pressed": String(v === GROUP_VARIANT) }, l);
      b.addEventListener("click", () => { GROUP_VARIANT = v; renderContent(); });
      return b;
    })]);
  return wrap;
}

function renderGroupCover() {
  const tile = { s: groupTileS, m: groupTileM, l: groupTileL }[GROUP_VARIANT];
  // Umschalter rechts in der Titelzeile neben „Mitglieder“ (Rückmeldung 2026-11-12: spart eine Zeile)
  document.getElementById("tabHint").replaceChildren(groupSizeSwitch());
  return el("div", {}, [
    groupVisibilityPanel(),
    el("div", { class: `group-tiles size-${GROUP_VARIANT}` }, GROUP.members.map(tile)),
    el("p", { class: "muted group-drop" }, "Charakter, NSC oder Kreatur hierher ziehen, um ihn zur Gruppe hinzuzufügen."),
  ]);
}

// Linke Spalte: Gruppenkasse, Gruppen-Schips, Reisetempo (vorher Leiste über den Mitgliedern), darunter die Summen
function groupOverview() {
  const block = (label, value) => el("div", { class: "group-side-block" }, [el("span", { class: "group-side-label" }, label), value]);
  // Gruppenkasse ändern alle mit Besitzerrechten am Gruppenakteur („Besitz mit allen teilen“, Rückmeldung 2026-11-12).
  const purse = el("span", { class: "group-purse" }, GROUP.purse.map(([k, n, v]) => {
    const b = el("button", { type: "button", class: "group-coin", title: `${n}: ${v} – ändern` }, [el("img", { src: MONEY_ICON(k), alt: "" }), String(v)]);
    b.addEventListener("click", () => groupToast(`${n} ändern (Feld mit −/+, für alle mit Besitzerrechten)`));
    return b;
  }));
  const schips = el("span", { class: "group-schips large" }, Array.from({ length: GROUP.schips.max }, (_, i) => {
    const used = i >= GROUP.schips.max - GROUP.schips.used;
    const b = el("button", { type: "button", class: "group-schip", title: used ? "Gruppen-Schip wiederherstellen" : "Gruppen-Schip ausgeben" }, el("img", { src: `${ICONS}/${used ? "gray_schip" : "schip"}.webp`, alt: "" }));
    b.addEventListener("click", () => { GROUP.schips.used += used ? -1 : 1; renderContent(); });
    return b;
  }));
  const foot = GROUP.travel[0];
  const travel = el("button", { type: "button", class: "group-side-link", title: `${foot.note} – alle Reisearten unter „Reise“` }, `zu Fuß ${foot.meilen} Meilen/h`);
  travel.addEventListener("click", () => setTab("travel"));
  const sum = (k) => GROUP.members.filter((m) => m[k]).reduce((a, m) => [a[0] + m[k][0], a[1] + m[k][1]], [0, 0]).join(" / ");
  const heroes = GROUP.members.filter((m) => m.schips);
  const rows = [["Mitglieder", String(GROUP.members.length)], ...(groupIsGM() ? [["LeP gesamt", sum("lep")], ["AsP gesamt", sum("asp")], ["KaP gesamt", sum("kap")],
    ["Schips der Helden", `${heroes.reduce((a, m) => a + m.schips[0] - m.schips[1], 0)} / ${heroes.reduce((a, m) => a + m.schips[0], 0)}`], ["Ø AP", "1 290"]] : [])];
  return [
    block("Gruppenkasse", purse),
    groupIsGM() ? el("div", { class: "group-side-block" }, [el("span", { class: "group-side-label" }, ["Gruppen-Schips ", gmTag()]), schips]) : null,
    groupIsGM() ? el("div", { class: "group-side-block" }, [el("span", { class: "group-side-label" }, ["Probe anfordern ", gmTag()]), groupAttrRolls()]) : null,
    block("Reisetempo", travel),
    el("dl", { class: "side-details" }, rows.map(([k, v]) => el("div", {}, [el("dt", {}, k), el("dd", {}, v)]))),
  ];
}

// Proben der SL (Rückmeldung 2026-11-12) an denselben Stellen wie im Systembogen: je Talent „Gruppenprobe“
// (rollGroupCheck, Dialog des Systems) und „Anfordern“ (requestSkillRoll: Anfrage-Karte im Chat, jeder würfelt selbst),
// Eigenschaften auf dem Titelblatt (requestAttributeRoll). Spieler sehen die Knöpfe nicht.
function groupRollBtn(label, title, toast) {
  const b = el("button", { type: "button", class: "group-roll-btn", title }, label);
  b.addEventListener("click", () => groupToast(toast));
  return b;
}
const groupSkillRolls = (n) => (groupIsGM() ? el("span", { class: "group-roll-btns" }, [
  groupRollBtn("Gruppenprobe", `Gruppenprobe auf ${n} (Sammelprobe)`, `Gruppenprobe ${n}: Dialog des Systems`),
  groupRollBtn("Anfordern", `Probe auf ${n} bei der Gruppe anfordern`, `Anfrage ${n} im Chat – jeder würfelt selbst`),
]) : null);
const GROUP_ATTRS = [["MU", "Mut"], ["KL", "Klugheit"], ["IN", "Intuition"], ["CH", "Charisma"], ["FF", "Fingerfertigkeit"], ["GE", "Gewandtheit"], ["KO", "Konstitution"], ["KK", "Körperkraft"]];
// Eigenschaften als Würfel wie im Heldenbogen, im Würfel nur das Kürzel (Rückmeldung 2026-11-12)
const groupAttrRolls = () => el("span", { class: "group-attr-rolls" }, GROUP_ATTRS.map(([k, l]) => {
  const b = el("button", { type: "button", class: "group-attr-die", style: dieBg(DIE_BY_ATTR[k]), title: `Probe auf ${l} bei der Gruppe anfordern`, "aria-label": `Probe auf ${l} bei der Gruppe anfordern` }, k);
  b.addEventListener("click", () => groupToast(`Anfrage ${l} im Chat – jeder würfelt selbst`));
  return b;
}));

function renderGroupSkills() {
  const gm = groupIsGM();
  const cls = "group-skill-row" + (gm ? " gm" : "");
  return el("div", {}, [
    el("p", { class: "muted group-hint" }, gm ? ["Je Talent der beste Wert der Gruppe. Gruppenprobe: Sammelprobe der Gruppe; Anfordern: Anfrage im Chat, jeder würfelt selbst. ", gmTag()] : "Je Talent der beste Wert der Gruppe."),
    ...GROUP.skills.map(([cat, list]) => el("div", { class: "panel" }, [
      el("div", { class: "panel-title" }, cat),
      el("div", { class: "row-head " + cls }, head("Talent", "Bester", "Mitglied", "Übrige", ...(gm ? ["Proben"] : []))),
      ...list.map(([n, v, who, others]) => el("div", { class: "row " + cls }, [
        el("span", { class: "left" }, n), el("b", { class: "center" }, String(v)), el("span", {}, who),
        el("span", { class: "muted" }, others.map(([o, w]) => `${o} ${w}`).join(" · ") || "–"),
        groupSkillRolls(n),
      ])),
    ])),
  ]);
}

function renderGroupDepots() {
  const gmBtn = (label) => {
    const b = el("button", { type: "button", class: "chip-like" }, label);
    b.addEventListener("click", () => groupToast(`${label}: Dialog des Systems`));
    return b;
  };
  const visible = GROUP.depots;
  return el("div", {}, [
    ...visible.map((d) => el("div", { class: "panel" }, [
      el("div", { class: "panel-title flex" }, [el("span", {}, d.name), el("small", {}, `${d.kind} · Traglast ${d.weight} · ${d.coins}${d.locked ? " · gesperrt" : ""}`),
        groupIsGM() && !d.players ? gmTag("Spieler: nur ansehen") : null]),
      el("div", { class: "row-head group-depot-row" }, head("", "Gegenstand", "Anz.", "Gew.")),
      ...d.items.map(([n, q, w]) => el("div", { class: "row group-depot-row" }, [el("img", { src: A.tabInventory, alt: "" }), el("span", { class: "left" }, n), el("span", { class: "center" }, String(q)), el("span", { class: "center muted" }, w)])),
      el("div", { class: "panel-foot" }, [!groupIsGM() && !d.players ? el("span", { class: "muted" }, "Nur ansehen – keine Rechte am Depot") : el("button", { type: "button", class: "chip-like", title: d.locked ? "Depot ist gesperrt" : "Gegenstände tauschen" }, d.locked ? "Gesperrt" : "Handel mit Depot"),
        ...(groupIsGM() ? [gmBtn(d.locked ? "Entsperren" : "Sperren"), gmBtn("Berechtigungen"), gmBtn("Entfernen"), gmTag()] : [])]),
    ])),
    groupIsGM() ? el("p", { class: "muted group-drop" }, ["Fahrzeug-, Händler- oder Schatzakteur hierher ziehen, um ihn als Depot hinzuzufügen. ", gmTag()]) : null,
  ]);
}

function renderGroupTravel() {
  return el("div", {}, [
    el("div", { class: "panel" }, [
      el("div", { class: "panel-title" }, "Geschwindigkeit je Reiseart"),
      el("div", { class: "row-head group-travel-row" }, head("", "Wert", "Mod", "Meilen/h", "")),
      ...GROUP.travel.map((t) => el("div", { class: "row group-travel-row" }, [el("span", { class: "left" }, t.mode), el("span", { class: "center" }, String(t.value)), el("span", { class: "center" }, String(t.mod)), el("b", { class: "center" }, t.meilen), el("small", { class: "muted" }, t.note)])),
      el("div", { class: "row group-travel-row" }, [el("span", { class: "left" }, "Gewaltmarsch"), el("span", { class: "center" }, `${GROUP.forcedMarch} %`), el("span", {}), el("span", {}), el("small", { class: "muted" }, "erhöht alle Geschwindigkeiten")]),
    ]),
  ]);
}

// Spielleitung (Entscheidung 2: eigener Reiter): alle Werkzeuge des Systembogens an einer Stelle
function renderGroupGm() {
  const btn = (label, title) => {
    const b = el("button", { type: "button", class: "group-gm-btn", title }, label);
    b.addEventListener("click", () => groupToast(`${label}: Dialog des Systems`));
    return b;
  };
  const toggle = (label, on) => {
    const b = el("button", { type: "button", class: "group-gm-btn", "aria-pressed": String(on) }, label);
    b.addEventListener("click", () => { b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true")); });
    return b;
  };
  const section = (title, kids) => el("div", { class: "panel" }, [el("div", { class: "panel-title" }, title), el("div", { class: "group-gm-grid" }, kids)]);
  return el("div", {}, [
    el("p", { class: "muted group-hint" }, ["Der ganze Reiter fehlt bei Spielern. ", gmTag()]),
    section("Alle Mitglieder", [btn("Verdeckt würfeln", "Probe aller Mitglieder verdeckt"), btn("Regeneration", "Regeneration für alle"), btn("Zufälliges Mitglied", "Ein Mitglied zufällig wählen"), btn("AP vergeben", "Abenteuerpunkte an alle"), btn("Bezahlung", "Geld an alle auszahlen"), btn("Lohn einfordern", "Geld von allen einziehen")]),
    section("Proben", [btn("Gruppenprobe …", "Sammelprobe der Gruppe auf ein Talent"), btn("Probe anfordern …", "Talentprobe bei allen anfordern"), ...["MU", "KL", "IN", "CH", "FF", "GE", "KO", "KK"].map((k) => btn(k, `Eigenschaftsprobe ${k} für alle`)), el("span", { class: "muted" }, "auch je Talent im Reiter Talente und links auf dem Titelblatt")]),
    section("Gruppe", [toggle("★ Hauptgruppe", true), toggle("Besitz mit allen teilen", false), (() => {
      const b = toggle("Identität fremder Mitglieder ausblenden", !GROUP.vis.identity);
      b.title = "Spieler sehen bei fremden Mitgliedern dann nur die Spezies, keine Profession und keine Schips";
      b.addEventListener("click", () => { GROUP.vis.identity = b.getAttribute("aria-pressed") !== "true"; });
      return b;
    })(), btn("Ereignisjournal erstellen", "Journal für Ereignisse der Gruppe")]),
  ]);
}

// Lager (Entscheidung 4, Rückmeldung 2026-11-12: „super, dazu Funktionen aus dem DSA5-System“). Eingehängt über
// GroupAPI.registerHelper/registerPanel (Abschnitte „gm-tools“/„travel-camp“). Herkunft je Karte: „System“ = vorhandene
// Funktion von DSA5 (nur aufgerufen), „neu“ = müsste das Modul bauen, „Modul“ = gibt es bei uns schon.
// Was im System-Reiter schon steckt (geprüft 2026-11-12): Die offiziellen Inhaltsmodule registrieren dort Helfer –
// dsa5-core „Widrige Umstände“ (gmOnly: false, darum sehen Spieler den Reiter als „Lager“), dsa5-compendium
// „Nahrungssuche“ und „Jagd“ (gmOnly), dsa5-godsofaventuria2 „Schicksal und Verdammnis“ (gmOnly; Götter- und
// Erzdämonen-Schips zuweisen bzw. Spieler einen Schicksalspunkt tauschen lassen). Sie erscheinen nur, wenn das
// Modul installiert ist. Dazu unsere Vorschläge und die Werkzeuge des Moduls.
const GROUP_CAMP = [
  ["Aus DSA5-Inhaltsmodulen (vorhanden)", [
    ["ability_general", "Widrige Umstände", "Wetter, Kälte, Hitze und Gelände auf die Gruppe anwenden", "Grundregelwerk", "alle"],
    ["consumable", "Nahrungssuche", "Probe auf Wildnisleben bzw. Pflanzenkunde für die Gruppe", "Kompendium", "SL"],
    ["Rangeweapon", "Jagd", "Fährtensuchen und Jagd auf Wild", "Kompendium", "SL"],
    ["Geweihte", "Schicksal und Verdammnis", "Götter- und Erzdämonen-Schips zuweisen; Schicksalspunkt gegen einen Schip tauschen", "Götter Aventuriens 2", "SL"],
  ]],
  ["Vorschläge: Rast und Versorgung", [
    ["ability_ceremonial", "Rasten", "Regeneration für alle mit Lagerplatz und Störung der Nachtruhe; Rastdauer stellt die Zeit weiter", "System", "SL"],
    ["Spelltrick", "Wetter", "Wetter des Tages aus dem Kalender", "System", "alle"],
    ["Dodge", "Wache einteilen", "Wer wann wacht; eine Störung fließt in die Rast ein", "neu", "alle"],
    ["planthealing", "Pflanzen- und Kräutersuche", "Pflanzenkunde anfordern; Funde ins Gruppendepot", "neu", "SL"],
  ]],
  ["Werkzeuge des Moduls", [
    ["d20", "Würfelstatistik", "Würfe der Gruppe nach Tag", "DSA5 Helpers", "alle"],
    ["Spellextension", "Hausregelbuch", "Regeln der Runde nachlesen", "DSA5 Helpers", "alle"],
    ["ability_command", "Helfen", "Gegenseitige Hilfe bei Proben (Hausregel)", "DSA5 Helpers", "alle"],
    ["disease", "Wundeinschätzung", "Verdeckte Probe Heilkunde Wunden", "DSA5 Helpers", "SL"],
  ]],
];
// Anfrage an die SL mit optionalem Anlass (Rückmeldung 2026-11-12, für alle Anfragen). Im Modul: Chat-Nachricht nur an die
// SL mit Anlass und den Knöpfen „Ausführen“/„Ablehnen“; der Spieler sieht den Stand an seiner Karte.
function groupAskDialog(label) {
  const note = el("textarea", { rows: "3", placeholder: label === "Schicksal und Verdammnis" ? "z. B. Ich möchte einen Schicksalspunkt gegen einen Schip der Rondra tauschen." : "z. B. warum, wofür, für wen", "aria-label": "Anlass (freiwillig)" });
  const send = el("button", { type: "button", class: "group-gm-btn", "aria-pressed": "true" }, "Anfrage senden");
  const cancel = el("button", { type: "button", class: "group-gm-btn" }, "Abbrechen");
  send.addEventListener("click", () => {
    GROUP.requests.push({ who: GROUP_PLAYER, what: label, note: note.value.trim() });
    closeModal();
    groupToast(`Anfrage „${label}“ an die SL gesendet`);
    renderContent();
  });
  cancel.addEventListener("click", closeModal);
  openModal(el("div", { class: "panel group-ask" }, [
    el("div", { class: "panel-title" }, `Bei der SL anfragen: ${label}`),
    el("label", { class: "group-ask-body" }, [el("span", { class: "muted" }, "Anlass (freiwillig) – die SL sieht ihn mit der Anfrage"), note]),
    el("div", { class: "group-gm-grid" }, [send, cancel]),
  ]), { label: `Bei der SL anfragen: ${label}` });
  note.focus();
}

function renderGroupCamp() {
  const card = ([ico, label, hint, source, who]) => {
    const img = ico === "d20" ? `${ICONS}/d20.svg` : `${ICONS}/categories/${ico}.webp`;
    // SL-Funktion als Spieler: Anfrage an die SL statt Ausführen
    const ask = who === "SL" && !groupIsGM();
    const pending = ask && GROUP.requests.some((r) => r.who === GROUP_PLAYER && r.what === label);
    const b = el("button", { type: "button", class: "group-camp-card" + (ask ? " ask" : "") }, [el("img", { src: img, alt: "" }),
      el("b", {}, [label, " ", who === "SL" && groupIsGM() ? gmTag("SL · Spieler fragen an") : null]), el("small", {}, hint),
      el("span", { class: "group-camp-who" }, ask ? (pending ? "Anfrage gesendet – wartet auf die SL" : "Bei der SL anfragen") : source)]);
    b.addEventListener("click", () => {
      if (!ask) return groupToast(`${label}: ${source === "neu" ? "neue Funktion (Vorschlag)" : source === "System" ? "Dialog des Systems" : `Funktion aus „${source}“`}`);
      if (pending) return groupToast("Diese Anfrage liegt der SL schon vor");
      groupAskDialog(label);
    });
    return b;
  };
  // Anfragen der Spieler, nur für die SL: ausführen oder ablehnen
  const requests = groupIsGM() && GROUP.requests.length ? el("div", { class: "panel group-requests" }, [
    el("div", { class: "panel-title flex" }, [el("span", {}, `Anfragen der Spieler (${GROUP.requests.length})`), gmTag()]),
    ...GROUP.requests.map((r, i) => {
      const act = (label, done) => {
        const b = el("button", { type: "button", class: "group-gm-btn" }, label);
        b.addEventListener("click", () => { GROUP.requests.splice(i, 1); groupToast(done); renderContent(); });
        return b;
      };
      return el("div", { class: "row group-request-row" }, [el("span", { class: "left" }, [el("b", {}, r.who), ` möchte: ${r.what}`, r.note ? el("small", { class: "group-request-note" }, `„${r.note}“`) : null]),
        act("Ausführen", `${r.what}: Dialog des Systems öffnet sich für die SL`), act("Ablehnen", `${r.who} erhält eine Absage`)]);
    }),
  ]) : null;
  return el("div", {}, [
    el("p", { class: "muted group-hint" }, "Reiter, den das System für Module freihält: die SL sieht alle Funktionen, Spieler nur die für alle (im System „Lager“). Unter jeder Karte steht, woher sie kommt. Funktionen der SL können Spieler bei der SL anfragen."),
    requests,
    ...GROUP_CAMP.map(([title, cards]) => [title, cards])
      .map(([title, cards]) => el("div", { class: "panel" }, [el("div", { class: "panel-title" }, title), el("div", { class: "group-camp" }, cards.map(card))])),
  ]);
}

function groupData() {
  CHARACTER_NAME = GROUP.name;
  Object.assign(PORTRAIT_IMG, { img: `${ICONS}/categories/ability_command.webp`, size: "60%", pos: "50% 50%" });
  clearFavorites();
  PERSONAE.length = 0;
}

function groupSetup() {
  nonHeroSetup();
  const params = new URLSearchParams(location.search);
  if (["s", "m", "l"].includes(params.get("variante"))) GROUP_VARIANT = params.get("variante");
  RENDERERS.cover = renderGroupCover;
  RENDERERS.skills = renderGroupSkills;
  RENDERERS.inventory = renderGroupDepots;
  RENDERERS.travel = renderGroupTravel;
  RENDERERS.gm = renderGroupGm;
  RENDERERS.camp = renderGroupCamp;
  delete SECTION_TABS.skills;
  delete SECTION_TABS.inventory;
  COVER_SIDE_TAB = "overview";
  setNotesSections([
    textSection("biography", "Biografie", GROUP.biography, "Sichtbar für alle, die den Bogen sehen dürfen."),
    textSection("notes", "Notizen", GROUP.notes, "Sichtbar für alle, die den Bogen sehen dürfen."),
  ]);
  document.getElementById("onlyLepToggle").hidden = true;
  document.getElementById("armorOneToggle").hidden = true;
  document.getElementById("merchantModeToggle").hidden = true;
  // Rolle (Menü › Ansicht › Rolle): Reiter „Spielleitung“ fehlt bei Spielern, Inhalte nach Rechten neu aufbauen.
  document.getElementById("asPlayerToggle").addEventListener("click", () => setTimeout(applyGroupRole));
}

function applyGroupRole() {
  TABS.splice(0, TABS.length, ...GROUP_TABS.filter((t) => groupIsGM() || t.id !== "gm"));
  const camp = TABS.find((t) => t.id === "camp");
  if (camp) Object.assign(camp, { title: groupIsGM() ? "Lager · Werkzeuge" : "Lager" });
  renderRail();
  if (!TABS.some((t) => t.id === currentTab)) setTab("cover");
  else renderContent();
}

function groupBadges(wrap) {
  const sep = () => el("span", { class: "ident-sep", "aria-hidden": "true" }, "·");
  wrap.append(el("span", { class: "ident-text" }, `${GROUP.members.length} Mitglieder`), sep(), el("span", { class: "ident-text" }, "★ Hauptgruppe"), sep(), el("span", { class: "ident-text" }, `zu Fuß ${GROUP.travel[0].meilen} Meilen/h`));
}

// Reiter des Gruppenbogens (System: members, skills, inventory, travel, gmTools, notes). Titelblatt = Mitglieder.
const GROUP_TABS = [
  { id: "cover", label: "Titelblatt", icon: A.tabCover, title: "Mitglieder", hint: "" },
  { id: "skills", label: "Talente", icon: `${ICONS}/categories/Skill.webp`, title: "Talente der Gruppe", hint: "" },
  { id: "inventory", label: "Inventar", icon: A.tabInventory, title: "Inventar · Depots", hint: "" },
  { id: "travel", label: "Reise", icon: `${ICONS}/categories/arrow.webp`, title: "Reise", hint: "" },
  { id: "gm", label: "Spielleitung", icon: `${ICONS}/categories/secret.webp`, title: "Spielleitung", hint: "nur SL" },
  { id: "camp", label: "Lager", icon: `${ICONS}/categories/consumable.webp`, title: "Lager · Werkzeuge", hint: "Vorschlag" },
  { id: "notes", label: "Notizen", icon: `${ICONS}/categories/Ability_Language.webp`, title: "Notizen", hint: "" },
];

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
    coverTabs: [["values", "Werte"], ["conditions", "Statuseffekte"]],
    coverSideBody: typeCoverSideBody,
    noAP: true,
  },
};
ACTOR_TYPES.nsc.noAP = true;
// Drei Reiter in der schmalen Spalte: kurze Namen (Rückmeldung 2026-11-12, „Persönliche Daten“ passte kaum).
Object.assign(ACTOR_TYPES.nsc, { coverTabs: [["values", "Werte"], ["conditions", "Status"], ["details", "Person"]], coverSideBody: typeCoverSideBody });
ACTOR_TYPES.gruppe = {
  toolbar: "Gruppenbogen · Click-Dummy",
  replaceTabs: GROUP_TABS,
  data: groupData,
  setup: groupSetup,
  headBadges: groupBadges,
  coverTabs: [["overview", "Überblick"]],
  coverSideBody: groupOverview,
  noAP: true,
};

if (CREATURE_EXAMPLE === "ork") Object.assign(ACTOR_TYPES.kreatur, { toolbar: "Kreaturbogen, humanoid · Click-Dummy", data: orcData, setup: orcSetup, tabs: ["cover", "main", "skills", "combat", "magic", "inventory", "status", "notes"] });

const ACTOR_TYPE = ACTOR_TYPES[ACTOR_KIND] || null;
if (ACTOR_TYPE) {
  if (ACTOR_TYPE.replaceTabs) TABS.splice(0, TABS.length, ...ACTOR_TYPE.replaceTabs);
  else keepTabs(ACTOR_TYPE.tabs, ACTOR_TYPE.rename);
  ACTOR_TYPE.data();
}
