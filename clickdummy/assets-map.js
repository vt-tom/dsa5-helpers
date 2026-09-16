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
  tabCover: ICONS + "/categories/DSA-Auge-Spieler.webp",
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
