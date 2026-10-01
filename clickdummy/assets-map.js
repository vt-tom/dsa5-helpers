/*
 * Zentrale Zuordnung: Click-Dummy verweist ausschließlich auf bestehende Assets
 * im DSA5-Systemordner (systems/dsa5) statt eigene/neue Bilder anzulegen.
 * Basis-Pfad relativ zu clickdummy/: ../../../systems/dsa5/
 */
const DSA5_SYSTEM_PATH = "../../../systems/dsa5";
const ICONS = DSA5_SYSTEM_PATH + "/icons";

const A = {
  // Kategorie-/Ability-Icons
  fatePoint: ICONS + "/schip.webp",
  fatePointUsed: ICONS + "/gray_schip.webp",
  advantage: ICONS + "/categories/Vorteil.webp",
  disadvantage: ICONS + "/categories/Nachteil.webp",
  abilityGeneral: ICONS + "/categories/ability_general.webp",
  abilityLanguage: ICONS + "/categories/Ability_Language.webp",
  abilityStaff: ICONS + "/categories/ability_staff.webp",
  abilityCeremonial: ICONS + "/categories/ability_ceremonial.webp",
  aggregatedTest: ICONS + "/categories/aggregated_test.webp",
  armor: ICONS + "/categories/Armor.webp",
  dodge: ICONS + "/categories/Dodge.webp",
  combatSkill: ICONS + "/categories/Combat_Skill.webp",
  meleeWeapon: ICONS + "/categories/Meleeweapon.webp",
  rangeWeapon: ICONS + "/categories/Rangeweapon.webp",
  weaponless: ICONS + "/categories/attack_weaponless.webp",
  ritual: ICONS + "/categories/ritual.webp",
  ceremony: ICONS + "/categories/ceremony.webp",
  spellTrick: ICONS + "/categories/Spelltrick.webp",
  blessing: ICONS + "/categories/Blessing.webp",
  disease: ICONS + "/categories/disease.webp",
  moneyD: ICONS + "/money-D.webp",
  moneyS: ICONS + "/money-S.webp",
  moneyH: ICONS + "/money-H.webp",
  moneyK: ICONS + "/money-K.webp",
  // Reiter-Icons
  // "Spieler-Auge"-Variante des Systemlogos (fa-dsa5-player in dsa5.scss) statt der GM-Variante (tabMain) —
  // rein zur visuellen Unterscheidung vom Eigenschaften-Tab-Icon, keine eigene Bedeutung im System.
  tabCover: ICONS + "/categories/Spellextension.webp", // aufgeschlagenes Buch (Issue #20, Variante C)
  tabMain: ICONS + "/categories/DSA-Auge.webp",
  tabSkills: ICONS + "/categories/Skill.webp",
  tabCombat: ICONS + "/categories/ability_combat.webp",
  tabMagic: ICONS + "/categories/Spell.webp",
  tabReligion: ICONS + "/categories/Liturgy.webp",
  tabInventory: ICONS + "/categories/Equipment.webp",
  tabStatus: ICONS + "/categories/ability_ceremonial.webp",
  tabNotes: ICONS + "/categories/Ability_Language.webp",
  tabCompanion: ICONS + "/categories/ability_animal.webp",
  // Spezies/Kultur/Profession-Verweise auf dem Titelblatt (IDENTITY in data.js): thematisch passende, bereits
  // vorhandene Kategorie-Icons statt eigener Rasse-/Kultur-Symbole (die es im System nicht gibt).
  species: ICONS + "/categories/wesenszug.webp",
  // Artenbild mit zwei ganzen Figuren (icons/species/<Art>.webp) — Grundlage der Rüstungs-Silhouette (Paket F /
  // GitHub-Issue #6), per CSS auf die linke Figur zugeschnitten und abgedunkelt, kein eigenes Bild.
  speciesFigure: (name) => ICONS + "/species/" + name + ".webp",
  culture: ICONS + "/categories/praegung.webp",
  career: ICONS + "/categories/Career.webp",
  // Reittier-Porträt-Platzhalter (kein eigenes Bild angelegt, siehe Kommentar oben) — einziges brauchbares
  // Pferde-Icon im System liegt unter icons/thirdparty statt icons/categories.
  horseHead: DSA5_SYSTEM_PATH + "/icons/thirdparty/horse-head.svg",
  // Würfel
  die: (name) => ICONS + "/dice/" + name + ".svg",
  // Talente / Zauber / Liturgien
  talent: (name) => ICONS + "/talents/" + name + ".webp",
  spell: (name) => ICONS + "/spellicons/spells/" + name + ".webp",
  liturgy: (name) => ICONS + "/spellicons/liturgies/" + name + ".webp",
  // Hintergrund
  bgActor: ICONS + "/backgrounds/actor.webp",
  // Porträt-Zierrahmen ist seit der Nutzer-Entscheidung 2026-09-18 ("Ecken gekappt" + Gold-Saum, siehe STATUS.md)
  // reines CSS (.portrait in style.css: border/box-shadow/clip-path) — kein Bild-Asset mehr nötig.
  // IDEEN.md: Auswahlliste für den simulierten Foundry-FilePicker beim Kopfzeilen-Hintergrundbild
  // (openHeaderBgPicker() in script.js) — echte Systemgrafiken aus icons/backgrounds statt erfundener Bilder,
  // auch wenn es dort eigentlich UI-Texturen statt Szenerie-Artworks sind. Der echte FilePicker würde beliebige
  // vom Nutzer hochgeladene Bilder zeigen; das kann der Click-Dummy ohne Dateizugriff nicht simulieren.
  bgHeaderOptions: [
    { label: "Pergament", img: ICONS + "/backgrounds/anotherpaper.webp" },
    { label: "Kapitelanfang", img: ICONS + "/backgrounds/kapitelstart.webp" },
    { label: "Buchrand", img: ICONS + "/backgrounds/garadanb.webp" },
    { label: "DSA-Kopf", img: ICONS + "/backgrounds/dsahead.webp" },
  ],
};

// Tradition-Icon-Zuordnung (Nutzerwunsch 2026-09-18, Traditionsanzeige-Badge): MAGIC_TRADITION.tradition/
// RELIGION_TRADITION.tradition sind im echten System Freitextfelder ohne feste Werteliste (lang/de.json
// "traditionMagical": "z. B. Gildenmagier, Hexen." / "traditionClerical": "z. B. Praioskirche.") — die Zuordnung
// zu einem Icon (icons/traditionen bzw. icons/months) ist daher nur über Teilstring-Abgleich gegen die bekannten
// Dateinamen möglich, kein exaktes Enum-Match. 1:1 dieselbe Liste/Logik wie im echten Modul
// (dsa5hTraditionIcon-Handlebars-Helfer in scripts/dsa5-helpers.js).
const MAGIC_TRADITION_ICONS = ["animisten", "druiden", "elfen", "geoden", "gildenmagier", "hexen", "magiedilettanten", "scharlatane", "zauberalchimisten", "zauberbarden", "zaubertaenzer", "zibiljas"];
const GOD_ICONS = ["Achaz", "Angrosch", "Aves", "Boron", "Brazoragh", "Chrssirssr", "Efferd", "Ferkina", "Firun", "Fjarninger", "Gjalsker", "Gravesh", "Hesinde", "Hszint", "Ifirn", "Ingerimm", "Kor", "Namenloser", "Nandus", "Nivesen", "Peraine", "Phex", "Praios", "Rahja", "Rikai", "Rondra", "Shinxir", "Swafnir", "Tahaya", "Tairach", "Travia", "Trollzacker", "Tsa", "Zsahh", "levthan", "marbo", "numinoru"];
function findTraditionIcon(text, names, folder) {
  if (!text) return null;
  const lower = text.toLowerCase();
  const hit = names.find((n) => lower.includes(n.toLowerCase()));
  return hit ? `${DSA5_SYSTEM_PATH}/icons/${folder}/${hit}.webp` : null;
}
A.magicTraditionIcon = (text) => findTraditionIcon(text, MAGIC_TRADITION_ICONS, "traditionen");
A.godIcon = (text) => findTraditionIcon(text, GOD_ICONS, "months");
