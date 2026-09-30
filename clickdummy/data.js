/* Demo-Daten für den Click-Dummy (statische Platzhalterwerte, kein Foundry-Datenmodell) */

// Charaktername (Kopfzeile, editierbar nur im Bearbeiten-Modus, siehe BEARBEITEN.md "Kopf"-Abschnitt und
// makeEditable()/renderHeader() in script.js). "let" statt "const", da ein Primitiv (String) sich nicht wie die
// übrigen Datenobjekte per Property-Zuweisung in-place mutieren lässt.
let CHARACTER_NAME = "Layariel Wipfelglanz";

// IDEEN.md: Hintergrundbild im Kopfbereich, je Charakter über einen simulierten FilePicker wählbar (siehe
// openHeaderBgPicker() in script.js) — null = kein Bild (bisheriger Zustand, reine --head-Farbe). "let" statt
// "const", da per Auswahl ersetzbar.
let HEADER_BG_IMG = null;

const TABS = [
  // Titelblatt: eigenständige Startseite, kommt im echten DSA5-Systembogen nicht vor (siehe TITELBLATT.md) —
  // großes Porträt, Namen/Spezies/Kultur/Profession, LeP/AsP/KaP/Schips, Favoriten und Status auf einen Blick.
  { id: "cover", label: "Titelblatt", icon: A.tabCover, title: "Titelblatt", hint: "" },
  { id: "main", label: "Eigenschaften", icon: A.tabMain, title: "Eigenschaften", hint: "" },
  { id: "skills", label: "Talente", icon: A.tabSkills, title: "Talente", hint: "" }, // Hint entfällt: die Kategorien stehen ja direkt als Tabs daneben, Platz geht an größere Tabs.
  { id: "combat", label: "Kampf", icon: A.tabCombat, title: "Kampf", hint: "" },
  // "Körper" (GitHub-Issue #6) ist seit 2026-09-28 ein Unterreiter von Kampf (renderBody()), kein eigener Reiter mehr.
  { id: "magic", label: "Magie", icon: A.tabMagic, title: "Magie", hint: "" },
  { id: "religion", label: "Religion", icon: A.tabReligion, title: "Religion", hint: "" },
  { id: "inventory", label: "Ausrüstung", icon: A.tabInventory, title: "Ausrüstung", hint: "" },
  { id: "status", label: "Status", icon: A.tabStatus, title: "Status", hint: "" },
  { id: "notes", label: "Notizen", icon: A.tabNotes, title: "Notizen", hint: "" },
  // Vorschlag 2026-09-13 (bisher deferred, siehe PLANNING.md): 9. Tab für Reittier/Vertraute/Begleiter. Im echten
  // Systemsheet liegt der "Reittier"-Block (parts/horse.hbs) auf genau diesem Companion-Tab (actors/companions/
  // actor-companion.hbs), nicht auf dem Kampf-Tab — der ursprüngliche Gap-Report hatte die Quelle falsch als
  // actor-combat.hbs referenziert, hier korrigiert.
  { id: "companions", label: "Gefährten", icon: A.tabCompanion, title: "Gefährten", hint: "" },
];

// Spezies/Kultur/Profession als eigene Item-Referenzen (system.details.species/culture/career im echten System
// sind Drag&Drop-Item-Links, siehe actor-header.hbs) — füllen die anklickbaren Badges in der Kopfzeile
// (#headBadges in index.html, initHeadBadges() in script.js); Klick öffnet eine kompakte Item-Vorschau im
// bestehenden Modal (openIdentityModal(), siehe openModal()).
const IDENTITY = {
  species: { name: "Elf", icon: A.species, desc: "Hochgewachsen, schlank und kaum wahrnehmbar alternd — Elfen leben im Einklang mit den Wäldern und meiden die Städte der Menschen." },
  culture: { name: "Auelfen", icon: A.culture, desc: "Die Auelfen ziehen entlang der großen Flüsse und Auwälder, tief verbunden mit dem fließenden Wasser." },
  career: { name: "Waldläuferin", icon: A.career, desc: "Kundschafterin und Hüterin der Wildnis, geschult in Fährtenlese, Bogenschuss und Überlebenskunst." },
};

// initial = Ausgangswert (Rasse/Kultur/Profession), adv = per AP gesteigert, mod = temporärer Modifikator.
// Der angezeigte Wert (initial+adv+mod, analog zu systems/dsa5/templates/actors/parts/characteristics-large.hbs)
// wird live berechnet (siehe buildAttrTiles() in script.js), kein eigenes gespeichertes "v"-Feld mehr — sonst
// würde es nach dem Steigern/Editieren (Start/Fortschritte/Mod sind im Bearbeiten-Modus editierbar) veralten.
const ATTRS = [
  { k: "MU", initial: 8, adv: 5, mod: 0, die: "d20mu" },
  { k: "KL", initial: 8, adv: 4, mod: 0, die: "d20kl" },
  { k: "IN", initial: 8, adv: 6, mod: 0, die: "d20in" },
  { k: "CH", initial: 8, adv: 5, mod: 0, die: "d20ch" },
  { k: "FF", initial: 8, adv: 7, mod: 0, die: "d20ff" },
  { k: "GE", initial: 8, adv: 6, mod: 0, die: "d20ge" },
  { k: "KO", initial: 8, adv: 4, mod: 0, die: "d20ko" },
  { k: "KK", initial: 8, adv: 3, mod: 0, die: "d20kk" },
];

// Charakter hat Astralenergie/Karmaenergie (steuert, welche Grundwerte-Zeilen überhaupt erscheinen) —
// analog zu {{#if prepare.magic.hasSpells}}/{{#if prepare.magic.hasPrayers}} in actor-main.hbs.
const HAS_ASP = true;
const HAS_KAP = true;

// Wundschwelle/Trefferzone kommen aus dem optionalen Modul-Setting "dsa5-compendium.enableHitzones"
// (Standard im Modul: aus/false, DSASETTINGS.enableHitzones) — nur wenn aktiv, blendet das System die
// Zeile per Hook (renderActorSheetV2 → Hitzones.renderHitzones) überhaupt ein. In dieser Welt ist es an.
const HITZONES_ENABLED = true;

// Erfahrungsgrad-Bezeichnung (document.system.details.experience.description, z.B. "Erfahren"/"Sagenhaft") — im
// System ein berechnetes Label über den Gesamt/Verfügbar/Ausgegeben-Zahlen (experienceBox.hbs), bisher gefehlt.
const EXPERIENCE_LEVEL = "Erfahren";

// AP-Konto (system.details.experience.total/spent im echten System, siehe Actordsa5._updateAPs()/checkEnoughXP()
// in systems/dsa5/modules/actor/actor-dsa5.js). "Verfügbar" wird NIE gespeichert, sondern immer aus total-spent
// berechnet (BEARBEITEN.md: "AP verfügbar wird immer berechnet!") — siehe experienceAvailable() in script.js.
// total/spent sind direkt editierbar (Kopfzeile + xpPanel in renderMain()), spent wird zusätzlich automatisch
// erhöht, wenn per +/- Stepper (Eigenschaften/Talente/Kampftalente/Zauber/Liturgien) mit echten AP-Kosten
// gesteigert wird, siehe spendAP()/calcAdvCost() in script.js.
const EXPERIENCE = { total: 1320, spent: 1115 };

// Grundwerte-Neuordnung nach EIGENSCHAFTEN-TAB.md (2026-09-11), in 3 Kategorien statt einer langen Liste.
// Editierbarkeits-Regeln je Zeile (aus den Notizen):
//   - Wert und Max sind NIE editierbar (reine Anzeige, auch im Bearbeiten-Modus).
//   - Mod ist editierbar, wo editMod:true (gerahmtes Feld im Bearbeiten-Modus).
//   - Zukauf (vormals "Fortschritte") ist nur bei Ressourcen-Zeilen editierbar (editZukauf:true).
//   - +/- Stepper (stepper:true) NUR bei Lebenskraft/Astralenergie/Karmaenergie selbst, nicht bei deren
//     Regenerations-/perm.-Verlust-Unterzeilen und nicht bei Resistenzen/Grundwerten.
//   - selectWert:true → Wert wird im Bearbeiten-Modus als Auswahlliste dargestellt statt als Freitext-Feld.
//   - sameModMax:X → Kälteschutz/Hitzeschutz zeigen denselben Wert in Mod UND Max (1:1 wie im System-Template
//     parts/temperature.hbs), Wert-Spalte bleibt leer, nichts davon editierbar.
//   - hideInPlay:true → Zeile ist "nur im Edit sichtbar" (komplett ausgeblendet im Spielmodus, nicht nur die Stepper).
const RESOURCES = [
  { label: "Lebenskraft", wert: 28, mod: 0, zukauf: 6, max: 32, editMod: true, editZukauf: true, stepper: true },
  { label: "LeP-Regeneration", wert: "–", mod: 1, zukauf: 0, max: 7, editMod: true, editZukauf: true, hideInPlay: true },
  { label: "Astralenergie", wert: 24, mod: 0, zukauf: 5, max: 34, editMod: true, editZukauf: true, stepper: true, show: HAS_ASP },
  { label: "AsP-Regeneration", wert: "–", mod: 0, zukauf: 0, max: 6, editMod: true, editZukauf: true, hideInPlay: true, show: HAS_ASP },
  { label: "pAsP (perm. Verlust)", wert: "–", mod: 0, zukauf: 0, max: 0, editMod: true, editZukauf: true, hideInPlay: true, show: HAS_ASP },
  { label: "Karmaenergie", wert: 12, mod: 0, zukauf: 2, max: 18, editMod: true, editZukauf: true, stepper: true, show: HAS_KAP },
  { label: "KaP-Regeneration", wert: "–", mod: 0, zukauf: 0, max: 5, editMod: true, editZukauf: true, hideInPlay: true, show: HAS_KAP },
  { label: "pKaP (perm. Verlust)", wert: "–", mod: 0, zukauf: 0, max: 0, editMod: true, editZukauf: true, hideInPlay: true, show: HAS_KAP },
  // used = im aktuellen Spiel bereits ausgegebene Schicksalspunkte (Kopfzeile zeigt max-used als leuchtende,
  // used als ausgeblichene Symbole) — reine Kopfzeilen-/Titelblatt-Anzeige, siehe fatePointsRow() in script.js;
  // in dieser Eigenschaften-Tab-Tabelle selbst gibt es dafür keine eigene Spalte.
  { label: "Schicksalspunkte", wert: 3, mod: 0, max: 3, used: 1, editMod: true },
];

// Wundschwelle & Trefferzone kommen aus dem separaten Modul dsa5-compendium (modules/hitzone/hitzone.js,
// templates/hitzone-selector.hbs), nicht aus dem dsa5-Basissystem — daher zunächst nicht gefunden.
// Wundschwelle: Wert = aufgerundet KO/2 (hier KO 12 → 6), Mod = Ausrüstungsbonus (editierbar, system.woundThreshold),
// Max = Wert + Mod. Trefferzone: echtes <select> auf system.hitbox (Werteliste DSA5.hitboxes/HITBOX.*).
const RESISTANCES = [
  { label: "Seelenkraft", wert: 6, mod: 0, max: 6, editMod: true },
  { label: "Zähigkeit", wert: 6, mod: 0, max: 6, editMod: true },
  { label: "Kälteschutz", sameModMax: 2 },
  { label: "Hitzeschutz", sameModMax: 2 },
  { label: "Wundschwelle", wert: 6, mod: 0, max: 6, editMod: true, show: HITZONES_ENABLED },
  { label: "Trefferzone", wert: "Humanoid, mittel", selectWert: true, show: HITZONES_ENABLED },
];

const BASICS = [
  { label: "Geschwindigkeit", wert: 8, mod: 0, max: 8, editMod: true },
  { label: "Größenkategorie", wert: "mittel", selectWert: true },
];

// Wandert auf den Kampf-Tab (siehe EIGENSCHAFTEN-TAB.md, "Sollen auf den Kampf Tab wandern").
// BEARBEITEN.md fragte "prüfe einmal woher [Initiative-Mod.] kommt, da es darüber auch noch Initiative Mod
// gibt": im echten System (data/actor/templates/status.js: system.status.initiative) sind das zwei komplett
// verschiedene Felder, keine Dopplung —
//   - "Initiative" Mod-Spalte = initiative.modifier, ein fester Zahlen-Bonus (z.B. aus Vorteilen), der zum
//     berechneten Initiativewert (hier die Max-Spalte, 13) dazugezählt wird.
//   - "Initiative-Mod." ist dagegen system.status.initiative.diemodifier — KEINE Zahl, sondern ein ZUSÄTZLICHER
//     WÜRFEL (dieselbe Auswahlliste DSA5.initDies wie beim Initiativewürfel selbst: -/1W6/2W6/3W6/4W6), der bei
//     manchen Vorteilen zusätzlich zum Initiativewürfel geworfen wird. Beide Würfel-Zeilen sind daher echte
//     <select>-Felder (selectWert, siehe INIT_DIE_OPTIONS/selectWertCell() in script.js), keine Zahlenfelder.
const COMBAT_DERIVED = [
  { label: "Ausweichen", wert: 7, mod: 0, max: 7, editMod: true },
  { label: "Initiative", wert: "–", mod: 0, max: 13, editMod: true },
  { label: "Initiativewürfel", wert: "1d6", selectWert: true, hideInPlay: true },
  { label: "Initiative-Mod.", wert: "", selectWert: true, hideInPlay: true },
];

// Echte Werte aus dem Systembogen übernommen (specialabilities.hbs zeigt Vor-/Nachteile als Karten/Chips ohne AP-Kosten,
// nur mit Stufen-Suffix im Namen — daher wie Sonderfertigkeiten als reine Namensliste, nicht Zeilen mit Kostenspalte).
const ADVANTAGES = ["Altersresistenz", "Dunkelsicht I", "Gutaussehend I", "Nichtschläfer", "Wohlklang", "Zauberer", "Zweistimmiger Gesang"];

const DISADVANTAGES = ["Pech I", "Persönlichkeitsschwäche (Arroganz)", "Persönlichkeitsschwäche (Weltfremd)", "Sensibler Geruchssinn", "Unfähig (Zechen)"];

// Sonderfertigkeiten der "general"-Familie sind im System mehrere getrennte Kategorien (specblock.hbs
// currentCat="general" iteriert general/generalStyle/extGeneral/fatePoints einzeln, je mit eigener Überschrift) —
// nicht eine flache Liste. Jede Gruppe erscheint nur, wenn sie Einträge hat (siehe specialsBlock() in script.js).
const SPECIALS = [
  { label: "Allgemein", items: ["Abrichter", "Fertigkeitsspezialisierung (Fährtensuchen)", "Ortskenntnis (Heimatdorf)"] },
  { label: "Talentstilsonderfertigkeiten", items: ["Meisterhafte Wildnisführung"] },
  { label: "Erweiterte Talentsonderfertigkeiten", items: [] },
  { label: "Schicksalspunktesonderfertigkeiten", items: ["Schicksalskind"] },
];

// Vorprägung (specialabilities.hbs:31-42, TYPES.Item.imprint): eigener Kartenblock, nur bei Figuren mit einer
// entsprechenden Vorprägung sichtbar (z.B. Homunkuli/Sikaryan-Sonderregeln) — für "normale" Helden praktisch
// immer leer, daher hier wie andere optionale Kategorien (vgl. SPECIALS "Erweiterte Talentsonderfertigkeiten") als
// leeres Array, das Rendering (imprintPanel() in script.js) greift nur wenn befüllt.
const IMPRINT = [];

// "Sprache und Schrift" im System: eigene Sonderfertigkeiten-Kategorie (SpecCategory.language), analog zu Sonderfertigkeiten
// dargestellt, plus optional ein Sprachpunkte-Zähler aus der Profession (freeLanguagePoints) — nur sichtbar, wenn noch
// unverbrauchte Punkte da sind, sonst (wie hier) null/kein Zähler.
// Innerhalb der Tabelle getrennt nach Sprachen/Schriften, analog zu Vorteile/Nachteile.
const LANGUAGE_POINTS = null;
const LANGUAGES = ["Sprache (Garethi) II", "Sprache (Isdira) III"];
const SCRIPTS = ["Schrift (Isdira- und Asdharia-Zeichen)"];

// Vollständig aus dem Talent-Kompendium des Systems (packs/skills) übernommen: 5 Gruppen, 59 Talente insgesamt.
// Gruppenfarben (grad) 1:1 aus systems/dsa5/styles/css/dsa5.css (".skills.body/.social/.nature/.knowledge/.trade") übernommen.
// belastung: "yes"/"no"/"maybe" — entspricht system.burden.value im echten Skill-Datenmodell (DSA5.skillBurdens,
// systems/dsa5/modules/data/item/skill.js), gibt an, ob eine Rüstungs-Behinderung (BE) auf die Probe angerechnet
// wird. Wird nur auf dem Talente-Tab angezeigt (skillRow() in script.js), nicht auf Sammelproben.
// stf ("Steigerungsfaktor" A–D) direkt aus dem Kompendium ausgelesen (system.StF.value je Talent-Item in
// packs/skills) — steuert zusammen mit DSA5.advancementCosts (config-dsa5.js) die echten AP-Kosten beim Steigern
// per +/- Stepper, siehe ADVANCEMENT_COSTS/calcAdvCost()/wireAdvanceStepper() in script.js. Auf Nutzerwunsch
// 1:1 aus dem System übernommen, nicht neu erfunden.
const SKILL_GROUPS = [
  { name: "Körpertalente", grad: "linear-gradient(90deg,#4f6d65,transparent)", items: [
    { name: "Fliegen", icon: "Fliegen", probe: "MU/IN/GE", fw: 0, belastung: "yes", stf: "B" },
    { name: "Gaukeleien", icon: "Gaukeleien", probe: "MU/CH/FF", fw: 0, belastung: "yes", stf: "A" },
    { name: "Klettern", icon: "Klettern", probe: "MU/GE/KK", fw: 6, belastung: "yes", stf: "B" },
    { name: "Körperbeherrschung", icon: "Koerperbeherrschung", probe: "GE/GE/KO", fw: 8, fav: true, belastung: "yes", stf: "D" },
    { name: "Kraftakt", icon: "Kraftakt", probe: "KO/KK/KK", fw: 0, fav: true, belastung: "yes", stf: "B" },
    { name: "Reiten", icon: "Reiten", probe: "CH/GE/KK", fw: 0, belastung: "yes", stf: "B" },
    { name: "Schwimmen", icon: "Schwimmen", probe: "GE/KO/KK", fw: 3, belastung: "yes", stf: "B" },
    { name: "Selbstbeherrschung", icon: "Selbstbeherrschung", probe: "MU/MU/KO", fw: 0, fav: true, belastung: "no", stf: "D" },
    { name: "Singen", icon: "Singen", probe: "KL/CH/KO", fw: 0, belastung: "no", stf: "A" },
    { name: "Sinnesschärfe", icon: "Sinnesschaerfe", probe: "KL/IN/IN", fw: 9, fav: true, belastung: "maybe", stf: "D" },
    { name: "Tanzen", icon: "Tanzen", probe: "KL/CH/GE", fw: 0, belastung: "yes", stf: "A" },
    { name: "Taschendiebstahl", icon: "Taschendiebstahl", probe: "MU/FF/GE", fw: 0, belastung: "yes", stf: "B" },
    { name: "Verbergen", icon: "Verbergen", probe: "MU/IN/GE", fw: 7, belastung: "yes", stf: "C" },
    { name: "Zechen", icon: "Zechen", probe: "KL/KO/KK", fw: 0, belastung: "no", stf: "A" },
  ]},
  { name: "Gesellschaftstalente", grad: "linear-gradient(90deg,#85302e,transparent)", items: [
    { name: "Bekehren & Überzeugen", icon: "BekehrenundUeberzeugen", probe: "MU/KL/CH", fw: 0, belastung: "no", stf: "B" },
    { name: "Betören", icon: "Betoeren", probe: "MU/CH/CH", fw: 4, belastung: "no", stf: "B" },
    { name: "Einschüchtern", icon: "Einschuechtern", probe: "MU/IN/CH", fw: 0, belastung: "no", stf: "B" },
    { name: "Etikette", icon: "Etikette", probe: "KL/IN/CH", fw: 2, belastung: "no", stf: "B" },
    { name: "Gassenwissen", icon: "Gassenwissen", probe: "KL/IN/CH", fw: 0, belastung: "no", stf: "C" },
    { name: "Menschenkenntnis", icon: "Menschenkenntins", probe: "KL/IN/CH", fw: 8, belastung: "no", stf: "C" },
    { name: "Überreden", icon: "Ueberreden", probe: "MU/IN/CH", fw: 6, belastung: "no", stf: "C" },
    { name: "Verkleiden", icon: "Verkleiden", probe: "IN/CH/GE", fw: 0, belastung: "no", stf: "B" },
    { name: "Willenskraft", icon: "Willenskraft", probe: "MU/IN/CH", fw: 5, fav: true, belastung: "no", stf: "D" },
  ]},
  { name: "Naturtalente", grad: "linear-gradient(90deg,#535829,transparent)", items: [
    { name: "Fährtensuchen", icon: "Faehrtensuchen", probe: "MU/IN/GE", fw: 10, fav: true, belastung: "no", stf: "C" },
    { name: "Fesseln", icon: "Fesseln", probe: "KL/FF/KK", fw: 0, belastung: "yes", stf: "A" },
    { name: "Fischen & Angeln", icon: "FischenAngeln", probe: "FF/GE/KO", fw: 0, belastung: "maybe", stf: "A" },
    { name: "Orientierung", icon: "Orientierung", probe: "KL/IN/IN", fw: 9, belastung: "no", stf: "B" },
    { name: "Pflanzenkunde", icon: "Pflanzenkunde", probe: "KL/FF/KO", fw: 7, belastung: "no", stf: "C" },
    { name: "Tierkunde", icon: "Tierkunde", probe: "MU/MU/CH", fw: 6, belastung: "yes", stf: "C" },
    { name: "Wildnisleben", icon: "Wildnisleben", probe: "MU/GE/KO", fw: 11, belastung: "yes", stf: "C" },
  ]},
  { name: "Wissenstalente", grad: "linear-gradient(90deg,#4b6585,transparent)", items: [
    { name: "Brett- & Glücksspiel", icon: "BrettGluecksspiel", probe: "KL/KL/IN", fw: 0, belastung: "no", stf: "A" },
    { name: "Geographie", icon: "Geographie", probe: "KL/KL/IN", fw: 4, belastung: "no", stf: "B" },
    { name: "Geschichtswissen", icon: "Geschichtswissen", probe: "KL/KL/IN", fw: 0, belastung: "no", stf: "B" },
    { name: "Götter & Kulte", icon: "GoetterKulte", probe: "KL/KL/IN", fw: 6, belastung: "no", stf: "B" },
    { name: "Kriegskunst", icon: "Kriegskunst", probe: "MU/KL/IN", fw: 0, belastung: "no", stf: "B" },
    { name: "Magiekunde", icon: "Magiekunde", probe: "KL/KL/IN", fw: 5, belastung: "no", stf: "C" },
    { name: "Mechanik", icon: "Mechanik", probe: "KL/KL/FF", fw: 0, belastung: "no", stf: "B" },
    { name: "Rechnen", icon: "Rechnen", probe: "KL/KL/IN", fw: 0, belastung: "no", stf: "A" },
    { name: "Rechtskunde", icon: "Rechtskunde", probe: "KL/KL/IN", fw: 0, belastung: "no", stf: "A" },
    { name: "Sagen & Legenden", icon: "SagenLegenden", probe: "KL/KL/IN", fw: 3, belastung: "no", stf: "B" },
    { name: "Sphärenkunde", icon: "Sphaerenkunde", probe: "KL/KL/IN", fw: 0, belastung: "no", stf: "B" },
    { name: "Sternkunde", icon: "Sternenkunde", probe: "KL/KL/IN", fw: 2, belastung: "no", stf: "A" },
  ]},
  { name: "Handwerkstalente", grad: "linear-gradient(90deg,#cda25e,transparent)", items: [
    { name: "Alchimie", icon: "Alchimie", probe: "MU/KL/FF", fw: 3, belastung: "no", stf: "C" },
    { name: "Boote & Schiffe", icon: "BootSchifffe", probe: "FF/GE/KK", fw: 0, belastung: "yes", stf: "B" },
    { name: "Fahrzeuge", icon: "Fahrzeuge", probe: "CH/FF/KO", fw: 0, belastung: "yes", stf: "A" },
    { name: "Handel", icon: "Handel", probe: "KL/IN/CH", fw: 0, belastung: "no", stf: "B" },
    { name: "Heilkunde Gift", icon: "HeilkundeGift", probe: "MU/KL/IN", fw: 0, belastung: "no", stf: "B" },
    { name: "Heilkunde Krankheiten", icon: "HeilkundeKrankheiten", probe: "MU/IN/KO", fw: 0, belastung: "yes", stf: "B" },
    { name: "Heilkunde Seele", icon: "HeilkundeSeele", probe: "IN/CH/KO", fw: 0, belastung: "no", stf: "B" },
    { name: "Heilkunde Wunden", icon: "HeilkundeWunden", probe: "KL/FF/FF", fw: 0, belastung: "yes", stf: "D" },
    { name: "Holzbearbeitung", icon: "Holzbearbeitung", probe: "FF/GE/KK", fw: 5, belastung: "yes", stf: "B" },
    { name: "Lebensmittelbearbeitung", icon: "Lebensmittelbearbeitung", probe: "IN/FF/FF", fw: 0, belastung: "no", stf: "A" },
    { name: "Lederbearbeitung", icon: "Lederbearbeitung", probe: "FF/GE/KO", fw: 4, belastung: "yes", stf: "B" },
    { name: "Malen & Zeichnen", icon: "MalenundZeichnen", probe: "IN/FF/FF", fw: 2, belastung: "no", stf: "A" },
    { name: "Metallbearbeitung", icon: "Metallbearbeitung", probe: "FF/KO/KK", fw: 0, belastung: "yes", stf: "C" },
    { name: "Musizieren", icon: "Musizieren", probe: "CH/FF/KO", fw: 0, belastung: "no", stf: "A" },
    { name: "Schlösserknacken", icon: "Schloesserknacken", probe: "IN/FF/FF", fw: 1, belastung: "yes", stf: "C" },
    { name: "Steinbearbeitung", icon: "Steinbearbeitung", probe: "FF/FF/KK", fw: 0, belastung: "yes", stf: "A" },
    { name: "Stoffbearbeitung", icon: "Stoffbearbeitung", probe: "KL/FF/FF", fw: 0, belastung: "no", stf: "A" },
  ]},
];
SKILL_GROUPS.forEach(g => g.items.forEach(s => s.img = A.talent(s.icon)));

// Sammelproben (actor-aggregatedtests.hbs): bis zu 3 ALTERNATIVE Talente stehen je Sammelprobe zur Wahl (die
// Spielerin würfelt auf eines davon, nicht auf eine feste 3-Attribut-Probe) — daher "talents"-Liste statt eines
// einzelnen probe-Felds. Was tatsächlich über Erfolg/Misserfolg entscheidet, sind die über mehrere Versuche
// angesammelten Qualitätsstufen bis max. 10 (cummulatedQS), nicht allein die Versuchszahl. usedTestCount/
// allowedTestCount ist das Versuchsbudget im aktuellen Intervall (das war zuvor fälschlich "progress" genannt).
const AGGREGATED = [
  {
    name: "Überlebenskunst (Reise)",
    talents: [
      { name: "Wildnisleben", probe: "MU/GE/KO", fw: 11 },
      { name: "Orientierung", probe: "KL/IN/IN", fw: 9 },
    ],
    interval: "über 3 Proben",
    usedTestCount: 2, allowedTestCount: 3,
    cummulatedQS: 6,
  },
  {
    name: "Spurenlese (Verfolgung)",
    talents: [{ name: "Fährtensuchen", probe: "MU/IN/GE", fw: 10 }],
    interval: "über 2 Proben",
    usedTestCount: 1, allowedTestCount: 2,
    cummulatedQS: 3,
  },
];

// Vier echte Schnellwürfe aus dem Systemsheet (actor-combat.hbs .combat-actions), nicht Angriff/Parade/Ausweichen/Finte
// (das waren die Kampftechnik-Proben, die stehen unten in den Waffentabellen). Werte hier: Ausweichen wie in
// COMBAT_DERIVED, Waffenloser Angriff/Waffenlose Verteidigung wie die Kampftechnik "Raufen" (fw 8, at 8, pa 6) unten.
const COMBAT_ACTIONS = [
  { label: "Ausweichen", value: 7, img: A.dodge },
  { label: "Waffenloser Angriff", value: 8, img: A.weaponless },
  { label: "Waffenlose Verteidigung", value: 6, img: A.armor },
  { label: "Sturzschaden", glyph: "↓" },
];

// Struktur (Waffen-/Rüstungsverschleiß, Hausregel-Baustein aus data/item/templates/structure.js +
// system/automation/equipment-damage.js): structure.value/max je Item, daraus im Click-Dummy per wearLevel()
// derselbe Verschleißgrad 0–4 wie im System (Math.floor((1 - value/max) * 4)), der wiederum AT/PA (Waffen) bzw.
// RS/BE (Rüstung) mindert (effectiveMelee/RangedStats()/effectiveArmor() in script.js) — die hier eingetragenen
// at/pa/rs/be-Werte sind bewusst die UNbeschädigten Basiswerte, die Anzeige rechnet den Abzug live dazu, genau wie
// im System (item.attack/item.parry kommen dort bereits mit eingerechnetem weaponWearModifier). Waffenlos hat kein
// Item und damit keine Struktur. Bruchfaktor(BF)/die Bruchfaktorprobe selbst (Dialog+Würfelwurf) sind reine
// Item-Sheet-Funktionalität und bleiben außerhalb des Bogens.
// worn.requiresBothHands/.offHand (system.worn im echten Waffen-Datenmodell, gripCell() in script.js, siehe
// combat_weapon.hbs/combat_rangeweapon.hbs ".combat-item-grip"): steuert, ob eine Waffe zweihändig geführt wird
// (fest, nicht umschaltbar) oder wahlweise in Haupt-/Nebenhand — in BEIDEN Modi bedienbar, da laufende
// Kampfentscheidung. Waffenlos hat im System kein Item und damit auch keine Griff-Einstellung.
// Wurfwaffen-Aktion (meleeweapon.js:27,185-198 THROWABLE_WEAPON_TYPES/getContextOptions/throwMelee): Nahkampfwaffen
// bestimmter Kampftechniken können improvisiert als Fernkampfangriff geworfen werden (AT −8, mit der
// Sonderfertigkeit "Wurfwaffen" nur −4 — unsere Demo-Figur hat diese SF nicht, siehe SPECIALS/COMBAT_SPECIALS,
// daher immer −8), Reichweite aus DSA5.meleeAsRangeReach je Kampftechnik. Nur als Kontextmenü-Aktion pro Zeile
// sichtbar (weaponContextMenu-Button in combat_weapon.hbs), keine eigene Spalte — siehe throwMeleeMenu() in
// script.js. Raufen/Waffenlos ist im System nicht wurfwaffenfähig.
const THROWABLE_GROUPS = { Schwerter: "1/3/10", Dolche: "1/5/12" };

const MELEE = [
  { name: "Elfischer Säbel", group: "Schwerter", at: 12, pa: 6, tp: "1W6+3", reach: "mittel", img: A.meleeWeapon, structure: { value: 6, max: 6 }, fav: true, worn: { requiresBothHands: false, offHand: false } },
  { name: "Waldläuferdolch", group: "Dolche", at: 11, pa: 5, tp: "1W6+1", reach: "kurz", img: A.meleeWeapon, structure: { value: 3, max: 5 }, worn: { requiresBothHands: false, offHand: false } },
  { name: "Waffenlos", group: "Raufen", at: 8, pa: 6, tp: "1W6-1", reach: "kurz", img: A.weaponless },
];

// Noch nicht ausgerüstete Waffen (system.worn.value:false im echten Item — hier als eigene kleine Demo-Pools statt
// eines vollen zweiten Item-Datensatzes, da MELEE/RANGED und die Ausrüstung-Tab-Liste (INVENTORY_CATEGORIES) im
// Click-Dummy bewusst getrennte Demo-Arrays sind, kein gemeinsames Item-Modell). "+"-Knopf (unequippedWeaponMenu,
// actor-combat.hbs:32,94) verschiebt einen Eintrag von hier direkt in MELEE/RANGED, siehe equipWeapon() in script.js.
const UNEQUIPPED_WEAPONS = {
  melee: [{ name: "Ersatzklinge", group: "Schwerter", at: 10, pa: 5, tp: "1W6+2", reach: "mittel", img: A.meleeWeapon, worn: { requiresBothHands: false, offHand: false } }],
  ranged: [],
};

// Handschuh-/Gliedmaßenlimit ignorieren (system.config.ignoreWeaponHandLimits, actor-combat.hbs:31,93 +
// actor-sheet.js:683-686 _toggleIgnoreWeaponHandLimits) — für Figuren mit mehr als zwei Händen/Extra-Gliedmaßen,
// die dadurch mehr Waffen gleichzeitig führen dürfen als das Handlimit sonst erlaubt. Ein Schalter für beide
// Waffentabellen (dieselbe Einstellung, im System zweimal angezeigt), siehe ignoreHandLimitsBtn() in script.js.
let IGNORE_WEAPON_HAND_LIMITS = false;

// Angeborene Kampfwerte (trait-Items, z.B. bei Verwandlungen, Flüchen oder Kreaturen mit natürlichen Waffen) —
// eigener Block neben den normalen Waffen-/Rüstungstabellen, nicht ausrüstbar (kein worn/grip), siehe
// actor-combat.hbs:39-69 (prepare.traits.meleeAttack), :101-148 (.rangeAttack), :184-200 (.armor). Unsere Demo-
// Figur hat keine solchen Traits — leere Arrays wie bei anderen optionalen Kategorien (vgl. SPECIALS "Erweiterte
// Talentsonderfertigkeiten": []), das Rendering (renderTraitRows() in script.js) greift nur wenn befüllt.
const TRAITS = { meleeAttack: [], rangeAttack: [], armor: [] };

// Munition & Nachladen (combat_rangeweapon.hbs + combat_ammo_button/-menu.hbs): eine Fernkampfwaffe kann mehrere
// Munitionsarten besitzen (ammoTypes, genau eine davon "selected" — Pfeiltyp-Wechsel per Klick), und Waffen mit
// Ladezeit (reloadProgress/reloadTime, im System reloadTime.progress / "LZ") haben einen Nachlade-Fortschritt,
// geladen = progress ≥ LZ. Magazinmunition (Eisenwalder, ammunitiongroup "mag") hat zusätzlich einen Magazinstand
// (mag.current/mag.max, im System currentAmmo.system.mag) und "Magazin tauschen" (itemSwapMag). "Keine Munition"
// = keine Art ausgewählt (selectAmmo "clear"). Modell 2026-09-28 an das System angeglichen (vorher waren Magazin
// und Ladezustand in ammoCurrent/ammoMax vermischt).
// Waffen ohne eigene Munitionsgruppe (Wurfmesser verbrauchen sich selbst als Munition) behalten die einfache
// Anzahl (ammo) ohne Typenauswahl/Magazin, genau wie im System (ammunitiongroup "-").
// Zielen (rangeweapon.js:52-54 aimTime.progress, buildAimProgress(); dialog-combat-dsa5.js:1108-1133 "Zielen"-
// Knopf im Angriffsdialog) — ein von Nachladen unabhängiger zweiter Fortschritt 0–2, der die Trefferchance beim
// Fernkampfangriff erhöht. Im echten System nur erreichbar, wenn die Waffe bereits geladen ist, und wird in
// combat_rangeweapon.hbs GENAU an der Stelle des Nachlade-Rings angezeigt (ersetzt ihn, sobald >0). Waffen ohne
// eigenes Magazin/Munitionsauswahl (Wurfmesser) bekommen hier bewusst kein Zielen, da für sie im Click-Dummy
// noch keine Munitionsmenü-Infrastruktur existiert (renderAmmoCell() steigt für sie vorher aus).
// reach: Platzhalter im Format des Systems (item.system.reach.value, nah/mittel/weit in Schritt) — die Zahlen sind
// NICHT aus dem Kompendium, sie dienen nur dem Layout-Test der Waffenzeile (Paket C, 2026-09-25).
const RANGED = [
  {
    name: "Elfenbogen", group: "Bögen", at: 14, tp: "1W6+4", reach: "10/50/80", img: A.rangeWeapon,
    ammoTypes: [
      { name: "Jagdpfeile", count: 14, selected: true },
      { name: "Brandpfeile", count: 4, selected: false },
    ],
    aim: { progress: 1 },
    structure: { value: 5, max: 5 },
    fav: true,
    worn: { requiresBothHands: true, offHand: false },
  },
  {
    name: "Armbrust", group: "Armbrüste", at: 6, tp: "1W6+3", reach: "10/50/80", img: A.rangeWeapon,
    ammoTypes: [{ name: "Bolzen", count: 10, selected: true }],
    reloadTime: 3, reloadProgress: 1,
    aim: { progress: 0 },
    structure: { value: 2, max: 6 },
    worn: { requiresBothHands: true, offHand: false },
  },
  {
    name: "Eisenwalder", group: "Armbrüste", at: 11, tp: "1W6+4", reach: "10/50/80", img: A.rangeWeapon,
    ammoTypes: [{ name: "Magazin (Eisenwalder)", count: 2, selected: true, mag: { current: 10, max: 10 } }],
    reloadTime: 2, reloadProgress: 0,
    aim: { progress: 0 },
    worn: { requiresBothHands: false, offHand: false },
  },
  { name: "Wurfmesser", group: "Wurfwaffen", at: 10, tp: "1W6+1", reach: "2/5/10", ammo: "3", img: A.rangeWeapon, worn: { requiresBothHands: false, offHand: false } },
];

const ARMOR = [
  { name: "Waldläuferkluft", rs: 2, be: 0, structure: { value: 5, max: 8 } },
  { name: "Lederkappe", rs: 1, be: 0 },
  // Drittes Teil, damit „Körper“ die Rüstungstabelle (ab drei Teilen, 2026-09-30) zeigt.
  { name: "Lederhandschuhe", rs: 0, be: 0 },
];

// Gesamtschutz-Anzeige (actor-combat.hbs:158 "protection ({{prepare.armorSum}}...)"): Summe aller getragenen
// Rüstungsteile PLUS separat ausgewiesene magische Rüstungsboni aus aktiven Zaubern/Liturgien (spellArmor/
// liturgyArmor), die zusätzlich zur physischen Rüstung wirken. Demo-Wert hier: ein aktiver Schutzzauber.
const MAGIC_ARMOR = { spell: 1, liturgy: 0 };

// Kampfsonderfertigkeiten (specblock.hbs currentCat="combat", Kategorien combat + command) — im System direkt auf
// dem Kampf-Tab gerendert, bisher komplett ohne Entsprechung im Click-Dummy.
const COMBAT_SPECIALS = [
  { label: "Allgemein", items: ["Finte", "Kampfreflexe"] },
  { label: "Kommandosonderfertigkeiten", items: [] },
];

// Vollständig aus dem Kampftechnik-Kompendium des Systems (packs/skills, type "combatskill") übernommen: alle 21 Kampftechniken.
// "guide" = Leiteigenschaft (im System: guidevalue) — Basis-FW aller ungeübten Techniken ist im System 6, nicht 0
// (advanceMin im System, siehe combatskill.js — Refund-Stepper darf hier nie unter 6 senken, s. script.js).
// stf ("Steigerungsfaktor" A–D) ebenfalls 1:1 aus dem Kompendium (system.StF.value je combatskill-Item), s.
// SKILL_GROUPS-Kommentar oben.
const COMBAT_SKILLS = [
  { name: "Armbrüste", guide: "FF", fw: 6, at: 6, pa: "—", stf: "B" },
  { name: "Blasrohre", guide: "FF", fw: 6, at: 6, pa: "—", stf: "B" },
  { name: "Bögen", guide: "FF", fw: 14, at: 14, pa: "—", stf: "C" },
  { name: "Diskusse", guide: "FF", fw: 6, at: 6, pa: "—", stf: "C" },
  { name: "Dolche", guide: "GE", fw: 11, at: 11, pa: 5, stf: "B" },
  { name: "Fächer", guide: "GE", fw: 6, at: 6, pa: 6, stf: "C" },
  { name: "Fechtwaffen", guide: "GE", fw: 6, at: 6, pa: 6, stf: "C" },
  { name: "Feuerspeien", guide: "FF", fw: 6, at: 6, pa: "—", stf: "B" },
  { name: "Hiebwaffen", guide: "KK", fw: 6, at: 6, pa: 6, stf: "C" },
  { name: "Kettenwaffen", guide: "KK", fw: 6, at: 6, pa: 6, stf: "C" },
  { name: "Lanzen", guide: "KK", fw: 6, at: 6, pa: 6, stf: "B" },
  { name: "Peitschen", guide: "FF", fw: 6, at: 6, pa: 6, stf: "B" },
  { name: "Raufen", guide: "GE/KK", fw: 8, at: 8, pa: 6, stf: "B" },
  { name: "Schilde", guide: "KK", fw: 6, at: 6, pa: 6, stf: "C" },
  { name: "Schleudern", guide: "FF", fw: 6, at: 6, pa: "—", stf: "B" },
  { name: "Schwerter", guide: "GE/KK", fw: 12, at: 12, pa: 6, stf: "C" },
  { name: "Spießwaffen", guide: "KK", fw: 6, at: 6, pa: 6, stf: "C" },
  { name: "Stangenwaffen", guide: "GE/KK", fw: 6, at: 6, pa: 6, stf: "C" },
  { name: "Wurfwaffen", guide: "FF", fw: 6, at: 6, pa: "—", stf: "B" },
  { name: "Zweihandhiebwaffen", guide: "KK", fw: 6, at: 6, pa: 6, stf: "C" },
  { name: "Zweihandschwerter", guide: "KK", fw: 6, at: 6, pa: 6, stf: "C" },
];

// Magie-/Religions-Tabs nach dem Systemsheet aufgebaut (templates/actors/character/actor-magic.hbs und
// actor-religion.hbs + deren parts/spells.hbs, spell-section.hbs, liturgies.hbs, tradition-items.hbs,
// magicalSigns.hbs, specblock.hbs), zusätzlich 2026-09-13 auf Nutzerwunsch in zwei Unter-Tabs aufgeteilt (siehe
// currentMagicSection/currentReligionSection in script.js, gleiches Muster wie Kampf/Kampftalente):
//   Unter-Tab 1 ("Zauber"/"Liturgien"): Proben-Tabellen (Zauber/Rituale bzw. Liturgien/Zeremonien) →
//     Sonderfertigkeiten (Kategorie magical/clerical) → Zaubertricks bzw. Segnungen links, Traditions-Box rechts.
//   Unter-Tab 2 ("Ausrüstung"): Traditionsgegenstände + Magische Zeichen (bzw. nur Kirchengeräte bei Religion,
//     da es dort kein Äquivalent zu magischen Zeichen gibt) links, Traditions-Box rechts.
// Die Traditions-Box erscheint bewusst auf BEIDEN Unter-Tabs, da Leiteigenschaft/Merkmal/Energiefaktor für
// beide Blöcke relevanter Kontext sind, nicht nur für die Proben. Alle vier Proben-Tabellen (Zauber/Rituale/
// Liturgien/Zeremonien) haben im System identische Spalten (Bild/Name/Probe/FW/Kosten/Wirkungsdauer/Reichweite,
// kein "Merkmal" als eigene Spalte — spell-section.hbs zeigt es nicht inline).

// Vorschlag 2026-09-13 (bisher deferred): Erweiterungen (item.extensions, Overlay-Icon) und Mehrrunden-Auflade-
// Anzeige (item.LZ/item.progress, spell-section.hbs "showCharge") — siehe chargeBar()/extensionIcon() in script.js.
// stf ("Steigerungsfaktor" A–D) für Zauber/Rituale/Liturgien/Zeremonien: die dsa5-Basis-Systempackung selbst
// enthält keinen eigenen Zauber-/Liturgien-Kompendium-Pack (der ist Teil der kostenpflichtigen dsa5-magic-*-
// Regionalmodule) — daher hier aus den vorgefertigten Akteuren dieser Module ausgelesen (system.StF.value auf
// dem jeweiligen Item), nicht selbst erfunden; mehrfach über verschiedene Akteure hinweg mit demselben Ergebnis
// gegengeprüft, siehe [[project-dsa5-gap-analysis]] Notizen.
const SPELLS = [
  { name: "Balsam Salabunde", probe: "KL/IN/KO", cost: 8, fw: 8, dauer: "1 Aktion", reach: "Berührung", img: A.spell("balsam-salabunde"), stf: "B" },
  { name: "Flim Flam", probe: "KL/CH/FF", cost: 4, fw: 6, dauer: "1 Aktion", reach: "32 Schritt", img: A.spell("flim-flam"), stf: "A" },
  { name: "Blitz dich find", probe: "KL/FF/KO", cost: 8, fw: 5, dauer: "1 Aktion", reach: "Selbst", img: A.spell("blitz-dich-find"), stf: "A" },
  { name: "Axxeleratus", probe: "MU/KL/FF", cost: 8, fw: 4, dauer: "1 Aktion", reach: "Berührung", img: A.spell("axxeleratus"), stf: "B" },
  { name: "Duplicatus", probe: "KL/CH/FF", cost: 8, fw: 6, dauer: "3 Aktionen", reach: "8 Schritt", img: A.spell("duplicatus"), extensions: "Ipsos Zapt (Reichweite verdoppelt)", fav: true, stf: "C" },
];

const RITUALS = [
  { name: "Odem Arcanum", probe: "KL/IN/CH", cost: 6, fw: 5, dauer: "1 Std.", reach: "Selbst", img: A.ritual, LZ: 4, progress: 2, stf: "A" },
  { name: "Analys Arkanstruktur", probe: "KL/KL/IN", cost: 4, fw: 4, dauer: "10 Min.", reach: "Berührung", img: A.ritual, stf: "C" },
];

const TRICKS = ["Punktlicht", "Ignifaxius (Minimal)", "Kleiner Lärm", "Flimmerschein"];

// "magicalsign"-Items (z.B. Hexenzeichen, Merkzeichen) — im System nur sichtbar, wenn welche vorhanden sind
// ({{#if prepare.magic.magicalsign}} in magicalSigns.hbs); hier ein Demo-Eintrag, damit der Block überhaupt zu sehen ist.
const MAGICAL_SIGNS = ["Zeichen der Waldesruhe"];

// "patron"-Items: seit DSA5 8.1.8 eigene Liste prepare.patrons (patrons.hbs, nur sichtbar wenn vorhanden), vorher
// unter den magischen Sonderfertigkeiten. Platzhalter-Name, nur damit der Block im Click-Dummy zu sehen ist.
const PATRONS = ["Patron (Demo)"];

// Traditionsgegenstände (tradition-items.hbs, kind="magical", showVolume=true): Name/Kategorie (aus
// lang/de.json "traditionArtifacts", z.B. Magierstab/Lebensring/Zauberkleidung) + AE-Ladung Ist/Max, optional
// Fähigkeiten als Untereinträge. Ihr Amulett aus Silberbirke (siehe Notizen-Tab) ist ihr Zauberfokus.
// abilities-Fähigkeiten sind Objekte statt reiner Namen, da sie im System eine per Klick bezahlbare AsP-Kosten
// (tradition-items.hbs:43-44 "AEpayable" → actor-sheet.js:1645-1663 _payAeSpecialAbilityCost, zieht system.AsPCost
// von der Astralenergie ab) UND optional einen OnUseEffect-Würfel-Button haben können (seit Issue #9 umgesetzt,
// siehe ON_USE_ITEMS unten/onUseBtn() in script.js), Ersteres über payTraditionAbilityCost()
// in script.js).
// Items mit Anwendungseffekt (im System item.OnUseEffect, eine nicht-leere onUseActions-Makroaktion): zeigen den
// grünen W6-Knopf (Issue #9, 2026-09-30; Modul: parts/onuse.hbs, Systemaktion onUseItem). Hier einfach per Name,
// weil viele Demo-Listen reine Namenslisten sind.
const ON_USE_ITEMS = new Set(["Elfenbogen", "Waldläuferkluft", "Schicksalskind", "Naturverbundenheit I", "Reiseproviant", "Elfischer Säbel"]);

const TRADITION_ARTIFACTS = [
  { name: "Amulett aus Silberbirke", img: A.abilityStaff, category: "Lebensring", volume: "3 / 4", abilities: [{ name: "Naturverbundenheit I", cost: 2 }] },
];

// Sonderfertigkeiten der "magical"-Familie (specblock.hbs currentCat="magical") — getrennt von den allgemeinen
// Sonderfertigkeiten auf dem Eigenschaften-Tab (SPECIALS). Wie dort zerfällt "magical" im System in mehrere
// Kategorien (magical, magicalStyle "Zauberstilsonderfertigkeiten", extMagical, homunculus, sikaryan).
const MAGIC_SPECIALS = [
  { label: "Allgemein", items: ["Astrale Regeneration", "Harmonische Verbindung (Balsam Salabunde)"] },
  { label: "Zauberstilsonderfertigkeiten", items: ["Naturmagie-Virtuosin"] },
];

// Traditions-Kopfdaten (actor-tradition-Box): system.tradition.magical / guidevalue.magical / feature.magical /
// energyfactor.magical — alles editierbare Freitext-/Zahlenfelder im System, hier als Tradition-Box abgebildet.
const MAGIC_TRADITION = { tradition: "Elfen", guidevalue: "Intuition", feature: "Elementar, Hellsicht", energyfactor: 1 };

const LITURGIES = [
  { name: "Heilsegen", probe: "MU/KL/IN", cost: 4, fw: 8, dauer: "1 Aktion", reach: "Berührung", img: A.liturgy("heilsegen"), fav: true, stf: "B" },
  { name: "Bann der Furcht", probe: "MU/CH/CH", cost: 6, fw: 4, dauer: "1 Aktion", reach: "16 Schritt", img: A.liturgy("bann-der-furcht"), extensions: "Wirkung auf Gruppe erweitert", stf: "B" },
];

const CEREMONIES = [
  { name: "Krankheitsbann", probe: "KL/IN/CH", cost: 8, fw: 6, dauer: "10 Min.", reach: "Berührung", img: A.liturgy("krankheitsbann"), LZ: 3, progress: 1, stf: "B" },
  { name: "Pflanzenwuchs", probe: "KL/IN/KO", cost: 12, fw: 5, dauer: "1 Std.", reach: "Berührung", img: A.liturgy("pflanzenwuchs"), stf: "A" },
];

const BLESSINGS = ["Segenswort", "Peraines Auge", "Kräuterweihe", "Erntesegen"];

// Kirchengeräte (tradition-items.hbs, kind="ceremonial", showVolume=false): Name/Gottheits-Kategorie, keine Ladung.
const CEREMONIAL_ITEMS = [
  { name: "Peraine-Erntesichel", img: A.abilityCeremonial, category: "Peraine", abilities: [{ name: "Erntesegen", cost: 3 }] },
];

// Sonderfertigkeiten der "clerical"-Familie (specblock.hbs currentCat="clerical": clerical, clericalStyle
// "Liturgiestilsonderfertigkeiten", extClericalStyle, vision, prayer "Predigt-Sonderfertigkeiten").
const RELIGION_SPECIALS = [
  { label: "Allgemein", items: ["Prediger", "Wohlwollen der Göttin"] },
  { label: "Liturgiestilsonderfertigkeiten", items: ["Peraine-Segensspenderin"] },
];

// Traditions-Kopfdaten wie MAGIC_TRADITION, plus happyTalents (Textfeld: Talente, für die ein Mirakel eingesetzt
// werden kann — "Talente, die der Gottheit wohlgefällig sind").
const RELIGION_TRADITION = {
  tradition: "Kirche der Peraine", guidevalue: "Charisma", feature: "Heilung, Landwirtschaft", energyfactor: 1,
  // Nutzer-Feedback 2026-09-19: für den Kompakt-/Kachel-Vergleich der wohlgefälligen Talente bewusst eine
  // realistisch lange Liste statt der ursprünglich kurzen drei Einträge, damit Einklappen/Ellipsis auch wirklich
  // etwas zu tun haben.
  happyTalents: "Schwerter, Stangenwaffen, Bögen, Hiebwaffen, Dolche, Lanzen, Raufen, Spießwaffen, Wurfwaffen, Fechtwaffen, Kettenwaffen, Peitschen, Schilde, Zweihandhiebwaffen, Zweihandschwerter, Einschüchtern, Götter & Kulte, Körperbeherrschung, Kraftakt, Kriegskunst, Selbstbeherrschung, Willenskraft",
};

// Geldbeutel (system.status.money: dukat/silver/heller/kreutzer im echten Datenmodell) — in BEIDEN Modi
// editierbar (BEARBEITEN.md), siehe walletItem() in script.js.
const WALLET = { d: 12, s: 8, h: 4, k: 6 };

// Ausrüstung ist im echten Systemsheet (actor-equipment.hbs) NICHT eine flache Liste mit Freitext-"Typ"-Spalte,
// sondern nach Item-Kategorie (system.category, "Equipment.*") in eigene Gruppenboxen sortiert (Nahkampfwaffen,
// Fernkampfwaffen, Rüstung, Munition, Taschen, Kleidung, Nahrung, Heilmittel, Licht, Alchimie, Bücher, Kostbarkeiten,
// Verschiedenes, Geweihtes, Automaten, …) — jede mit eigenem Panel-Titel statt einer Typ-Spalte. Nur Kategorien mit
// Einträgen werden gerendert (siehe renderInventory() in script.js). Taschen können Inhalte enthalten
// (containerContent.hbs, item.children) — die "Taschen & Behältnisse"-Kategorie wird abweichend von den anderen
// als Kachel-Reihe oben im Tab gerendert, Klick auf eine Kachel zeigt item.children im Modal (openBagModal()).
const INVENTORY_CATEGORIES = [
  { label: "Nahkampfwaffen", items: [
    { name: "Elfischer Säbel", eq: true, qty: 1, weight: "1,8", price: "180 D", img: A.meleeWeapon, structure: { value: 6, max: 6 }, structType: "meleeweapon" },
  ]},
  { label: "Fernkampfwaffen", items: [
    { name: "Elfenbogen", eq: true, qty: 1, weight: "1,2", price: "220 D", img: A.rangeWeapon, structure: { value: 5, max: 5 }, structType: "rangeweapon" },
  ]},
  { label: "Rüstung", items: [
    { name: "Waldläuferkluft", eq: true, qty: 1, weight: "4,0", price: "90 D", img: A.armor, structure: { value: 5, max: 8 }, structType: "armor" },
    { name: "Lederkappe", eq: true, qty: 1, weight: "0,5", price: "15 D", img: A.armor },
  ]},
  { label: "Munition", items: [
    { name: "Pfeile", eq: false, qty: 18, weight: "0,9", price: "18 S", img: A.rangeWeapon },
  ]},
  { label: "Taschen & Behältnisse", items: [
    { name: "Rucksack", eq: true, qty: 1, capacity: 20, weight: "1,0", price: "8 S", img: A.tabInventory, children: [
      { name: "Reiseproviant", qty: 4, weight: "2,0", price: "2 S", img: A.tabInventory },
      { name: "Zunderbüchse", qty: 1, weight: "0,1", price: "5 H", img: A.tabInventory },
    ]},
  ]},
];

const CONDITIONS = [
  { name: "Schmerz", pips: 4, filled: 0 },
  { name: "Betäubung", pips: 4, filled: 0 },
  { name: "Furcht", pips: 4, filled: 1 },
  { name: "Verwirrung", pips: 4, filled: 0 },
];

// Kumulative Zustandseffekte (status_effects.hbs "cumulativeConditions"): eigene, stapelbare Zustände (z.B.
// Blutung) statt der abgestuften Pip-Zustände oben — bisher komplett ohne Entsprechung im Click-Dummy.
const CUMULATIVE_CONDITIONS = [
  { name: "Blutung", stacks: 2 },
];

// Übertragene Zustandseffekte (status_effects.hbs "transferredConditions"): Zustände, die von einer fremden
// Quelle (Zauber/Item einer anderen Figur) übertragen wurden — im System mit Rücklink zur Quelle. Bisher komplett
// ohne Entsprechung im Click-Dummy, dabei für Spieler wichtig zu sehen ("wer hat mir das eingebrockt").
const TRANSFERRED_CONDITIONS = [
  { name: "Verwirrung", source: "Bannspruch von Klara Feuerauge", dur: "3 Runden" },
];

// Modifikatoren-Tabelle (prepare.itemModifiers): zeigt, welcher aktuell aktive Effekt/Gegenstand welchen Wert wie
// verändert — bisher nirgends im Click-Dummy abgebildet, obwohl das für Spieler oft der einzige Weg ist zu
// verstehen, warum ein Wert vom Basiswert abweicht.
const MODIFIERS = [
  { target: "Attacke", value: "+1", source: "Segen der Peraine" },
  { target: "Fernkampf-Sichtweite", value: "−2", source: "Dämmerung" },
];

// Fünf Beispieleinträge statt einem (2026-09-14, UI-UX-REVIEW.md Priorität 2 Punkt 9), damit die "Alle
// anzeigen"-Begrenzung von buildActiveEffectsPanel() im Click-Dummy auch tatsächlich sichtbar/prüfbar ist.
const EFFECTS = [
  { name: "Segen der Peraine (+1 auf Heilkunde)", dur: "8 h" },
  { name: "Verbessertes Nachtsicht", dur: "1 h" },
  { name: "Zauber des Neides (−2 auf Überreden)", dur: "3 SR" },
  { name: "Salbe der Schnellen Heilung", dur: "4 h" },
  { name: "Schutzgeist (Astralschutz +2)", dur: "12 h" },
];

// personalDetails (actor-notes.hbs) — Reihenfolge wie im Foundry-Modul (notes.hbs, Persönliche-Daten-Grid).
const APPEARANCE = [
  { k: "Geschlecht", v: "Weiblich" },
  { k: "Familie", v: "Clan Wipfelglanz" },
  { k: "Alter", v: "94 Jahre" },
  { k: "Größe", v: "182 cm" },
  { k: "Gewicht", v: "58 kg" },
  { k: "Heimat", v: "Auelfen-Bund am Großen Fluss" },
  { k: "Sozialer Stand", v: "Freie" },
  { k: "Haarfarbe", v: "Silberblond" },
  { k: "Augenfarbe", v: "Waldgrün" },
  { k: "Auffälligkeiten", v: "Amulett aus Silberbirke" },
];

// Freitext-Felder des Notizen-Tabs (actor-notes.hbs: "biography", "notes", "notes.ownerdescription",
// "notes.gmdescription") — vier eigenständige Felder statt bisher nur einem, siehe TODOS.md. Jeweils ein
// zusammenhängender String, Absätze durch eine Leerzeile getrennt (siehe renderNotes()/makeEditable()-
// render-Option in script.js) — "let" statt "const", da sie als Ganzes ersetzt werden (kein Array/Objekt zum
// In-Place-Mutieren). Alle vier sollen im Bearbeiten-Modus editierbar sein (BEARBEITEN.md).

// biography: die eigentliche Hintergrundgeschichte der Figur (bisher fälschlich im "Notizen"-Feld).
let BIOGRAPHY_TEXT =
  "Layariel verließ ihren Bund am Großen Fluss, nachdem eine Handelsflotte den heiligen Hain oberhalb der Stromschnellen gerodet hatte. Sie sucht die Verantwortlichen — bislang ohne Erfolg.\n\n" +
  "Trägt ein Amulett aus Silberbirke bei sich, Geschenk der Baumhirtin Alvaeriel. Meidet Städte, betritt Tempel nur, wenn Peraine dort geehrt wird.";

// notes: laufende Spielnotizen (für alle mit Zugriff auf den Bogen sichtbar).
let NOTES_TEXT =
  "Sucht in Kupferschmiede Kontakt zu einem Hehler namens \"Rabe\" — Hinweis von Alvaeriel.\n\n" +
  "Schulden bei der Reisegruppe: 12 Dukaten an Bertholdt für die Fährüberfahrt.";

// notes.ownerdescription: nur für Besitzer/in sichtbar (im echten System rollengebunden ausgeblendet).
let PRIVATE_NOTES_TEXT =
  "Eigentlich misstraue ich Bertholdt — seine Geschichte über die Fähre passt nicht zusammen.";

// notes.gmdescription: nur für die Spielleitung sichtbar.
let GM_NOTES_TEXT =
  "Der Hehler \"Rabe\" ist ein Deckname für den Kult-Kontakt aus Abenteuer 3. Noch nicht enthüllen.";

// Vorschlag 2026-09-13 (bisher deferred, "GM-only-Neugestaltung von Krankheiten/Vergiftungen" — im echten System
// sieht die Spielerin hier nur den bloßen Zustand, während die SL-Ansicht die vollen Item-Sheet-Werte zeigt,
// siehe item-disease-sheet.hbs/item-poison-sheet.hbs: step/incubation/damage/duration/resistance/treatment/
// antidot). Ein echtes Berechtigungssystem gibt es im Click-Dummy nicht — stattdessen ein Ansicht-Umschalter
// direkt im Panel (renderDiseasePanel() in script.js), analog zum Spielmodus/Bearbeiten-Umschalter. Das ist ein
// Vorschlag zur Diskussion, keine fertige Entscheidung — insbesondere ob "GM-Ansicht" wirklich nur mehr Felder
// zeigen soll oder (wie im System angedeutet) eigene GM-Werkzeuge (Party-weite Übersicht etc.) bräuchte.
const AFFLICTIONS = [
  { name: "Fieberkrätze", type: "Krankheit", step: 2, incubation: "1W3 Tage", damage: "1W6 LeP (KO-Probe verhindert)", duration: "1W6 Wochen", resistance: "KO-Probe, um Stufe erschwert", treatment: "Bettruhe, fiebersenkende Kräuter", antidot: "–" },
];

// Regeneration ein-/ausschaltbar (status_effects.hbs:408-441 "SHEET.actorConfig"-Groupbox, data-action=
// "disableRegeneration") — z.B. wenn ein Fluch die natürliche LeP-/AsP-/KaP-Heilung blockiert. Nur die drei
// Ressourcen, die die Figur laut HAS_ASP/HAS_KAP überhaupt hat ("wounds" = LeP-Regeneration, im System intern so
// benannt); alle drei Schalter starten aktiv (false = nicht deaktiviert), wie im System der Normalzustand.
const REGEN_DISABLED = { wounds: false, astralenergy: false, karmaenergy: false };

// Dämonenmal (status_effects.hbs:264-301 prepare.demonmarks: Name/Kreis/Domänen eines Dämonenpakt-Mals) — seltenes
// Feature, für unsere Demo-Figur nicht relevant, daher leer wie andere optionale Kategorien (vgl. TRAITS/IMPRINT).
const DEMONMARKS = [];

// Vorschlag 2026-09-13 (bisher deferred, "Reittier-Sektion"): im echten System liegt der Reittier-Block
// (parts/horse.hbs: Bild, Wundleiste, Geschwindigkeit, Reitweise, Initiative, Loyalität) auf dem separaten
// Companion-Tab (actor-companion.hbs), nicht auf dem Kampf-Tab wie zunächst im Gap-Report vermutet — daher hier
// zusammen mit einem einfachen Vertraute/Begleiter-Abschnitt als neuer "Gefährten"-Tab statt als Kampf-Unterreiter.
//
// 2026-09-15 (Nutzer-Auftrag: Gefährten-Tab in voller Systemtiefe nachbauen, siehe NOTIZEN.md-Gap-Report):
// Fortbewegungsart/Reitweise (parts/horse.hbs:36-43, RIDING.speeds/RIDING.mountOptions in lang/de.json) als echte
// Auswahllisten statt fester Zahlen/Freitext. Loyalität ist im System eine echte 3-Attribut-Probe
// (companion-card.hbs:106-128, bei Vertrauten/Bittstellern MU/IN/CH "Fast-Talk" statt der Leiteigenschaften) —
// hier wie die Sammelproben-Talente über probeDice() dargestellt, der Würfel selbst bleibt dekorativ (wie jeder
// andere Würfel im Click-Dummy, es gibt nirgends echte Foundry-Rolls).
const HORSE_SPEED_OPTIONS = ["Stehend", "Schritt", "Trab", "Galopp"];
const RIDING_MODE_OPTIONS = ["Abgesattelt", "Aufgesattelt", "Fahrend"];

// Begleiter-Kategorien (companion-handler-class.js:853-863 companionSections): Vertraute/Tierische Begleiter/
// Beschworene Kreaturen — "Gruppenmitglied" (andere PCs/NPCs unter gemeinsamer Kontrolle) bewusst ausgelassen,
// da das eigenständige Akteure mit eigenem Bogen sind, nicht "Gefährten" dieser einen Figur im engeren Sinn
// (deckt sich mit der bereits dokumentierten Entscheidung, NPC-/Gruppen-Aktortypen komplett außen vor zu lassen).
//
// Jeder Begleiter kann eine 14-Slot-Hotbar (2×7, companion-card.hbs:134-159) haben, über die seine eigenen
// Talente/Zauber direkt ausgelöst werden können — hier als Array von 14 Einträgen (Objekt oder null) modelliert.
// availableSkills ist der Auswahl-Pool für companionSkillSelection.hbs — im Click-Dummy per Klick statt
// Drag&Drop in die Hotbar aufgenommen (gleiche Vereinfachung wie bei Taschen/Munition/Ausrüsten: kein Drag&Drop
// irgendwo im Bogen). isTrainable/isMountPossible/isMountActive steuern die Knochen-/Pferd-Knöpfe
// (companion-card.hbs:177-186); trainingTests ist dieselbe Sammelproben-Struktur wie AGGREGATED auf dem
// Talente-Tab, nur pro Begleiter statt pro Hauptfigur (companion-card.hbs:195-273).
const COMPANIONS = {
  mount: {
    name: "Windschatten", type: "Warmblut, Reitpferd", img: A.horseHead,
    lep: { value: 26, max: 30 },
    speedKey: "Trab", maxSpeed: 12,
    ridingMode: "Aufgesattelt",
    initiative: 9,
    loyalty: { probe: "MU/IN/KO", value: 12 },
  },
  companions: [
    {
      name: "Fuchsschwanz", role: "Vertrauter (Fuchs)", img: A.tabCompanion, category: "familiar", isFamiliar: true,
      loyalty: { probe: "MU/IN/CH", value: 11 },
      hotbar: [
        { name: "Sinnesschärfe", img: A.tabSkills, tooltip: "Sinnesschärfe FW 9" },
        { name: "Tarnung", img: A.tabSkills, tooltip: "Tarnung FW 7" },
        null, null, null, null, null,
        null, null, null, null, null, null, null,
      ],
      availableSkills: [{ name: "Fährtensuchen", img: A.tabSkills }, { name: "Klettern", img: A.tabSkills }],
      isTrainable: true, isMountPossible: false, isMountActive: false,
      trainingTests: [
        { name: "Trick: Männchen machen", interval: "1 Tag", used: 2, allowed: 5, qs: 6, apCost: 3 },
      ],
    },
    {
      name: "Grimbart", role: "Jagdhund", img: A.tabCompanion, category: "regular", isDomesticated: true,
      loyalty: { probe: "MU/KO/KK", value: 9 },
      hotbar: Array(14).fill(null),
      availableSkills: [{ name: "Sinnesschärfe", img: A.tabSkills }],
      isTrainable: true, isMountPossible: false, isMountActive: false,
      trainingTests: [],
    },
  ],
  // Beschwörungs-Werkzeug (actor-companion.hbs:11-38): Start-Button + Favoriten-Leiste häufig beschworener
  // Kreaturen, gehört im System zum Companion-Tab (nicht zum Magie-Tab, wie der Gap-Report vermutet hatte).
  // canSummon=true als Demo-Annahme (die Figur hat den Vorteil "Zauberer" — ein elementarbeschwörender Zauber ist
  // für einen elfischen Naturmagier plausibel), damit das Werkzeug im Click-Dummy überhaupt sichtbar ist.
  canSummon: true,
  conjurationFavorites: [{ name: "Waldgeist", img: A.tabCompanion }],
  // Beschworene Kreaturen tragen statt Loyalität einen Dienste-Zähler (companion-card.hbs:61-86 serviceCounter) —
  // wie viele Dienste sie dem Beschwörer noch schulden.
  summoned: [
    {
      name: "Erdling", role: "Gebundener Elementargeist", img: A.tabCompanion, category: "summoned",
      services: { value: 2, max: 6 },
      hotbar: Array(14).fill(null),
      availableSkills: [],
      isTrainable: false, isMountPossible: false, isMountActive: false,
      trainingTests: [],
    },
  ],
};
