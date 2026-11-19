/* Fahrzeugbogen (Issue #93, Click-Dummy Runde 1, 2026-11-16) – in Foundry umgesetzt am 18.11.2026 (erste Fassung, Feedback aus der Beta folgt).

   Vorbild ist der Fahrzeugbogen des Systems (DSA5 8.2, Akteurtyp „vehicle“): Reiter Kampf · Besatzung · Ausrüstung ·
   Status · Beschreibung, im Kopf Fahrzeugtyp sowie die Leisten Strukturpunkte und Besatzung. Bei uns wie bei den
   anderen Helfer-Bögen zusätzlich ein Titelblatt; Kopf ohne Kugeln, Schips und Eigenschaftswürfel (ein Fahrzeug hat
   keine), dafür links der Überblick mit Strukturpunkten, Besatzung und den wichtigsten Werten.

   Aufbau (Rückmeldung 2026-11-18): Seekampf und Reise sind Reiter im selben Bogen, statt zweier Titelblatt-Varianten.
   Jeder Reiter beginnt mit einem kurzen Satz, was er am Tisch tut (Hinweiszeile in Foundry, damit die Community
   beurteilen kann, was sie braucht):
     Titelblatt: Überblick, die häufigsten Aktionen und wer an Bord ist.
     Seekampf: Aktionen der Helden, Bordwaffen, Rammen, Fortbewegung, Rumpfschutz – alles mit Würfeln.
     Reise: Tempo und Reisearten, Ladung mit Füllstand, Besatzung als Porträts.
   Aktionen, Würfe, Besatzung per Ziehen und alle Werte kommen im Modul vom System (navalHeroAction, navalBoarding,
   navalBroadside, navalRam, chRollCombat, assignWeaponCrew, prepare.*); der Dummy zeigt nur die Bedienung.

   Aufruf: index.html?actor=fahrzeug. Wird vor actor-types.js geladen; actor-types.js übernimmt VEHICLE_TYPE in
   ACTOR_TYPES. Alle Namen, Werte und Texte sind frei erfundene Platzhalter, keine Regeltexte. */

const VEHICLE_IMG = `${ICONS}/talents/BootSchifffe.webp`;

const VEHICLE = {
  name: "Seeschwalbe",
  type: "Kogge",
  size: "groß",
  propulsion: "Segel",
  armament: "leicht bewaffnet",
  travelModes: [["Wasser", true], ["Land", false], ["Luft", false]],
  stp: { value: 46, max: 60 },
  crew: { initial: 18, value: 14, wounded: 2 },
  hullArmor: 3,
  speed: { base: 6, ram: 4, water: 6, air: 0 },
  gunnery: 10,
  initiative: 9,
  actions: 1,
  distanceRE: 3,
  cargo: { used: 18.5, capacity: 40 },
  price: "2 400 D",
  heroActions: [
    ["repair", "Reparieren", "Strukturpunkte wiederherstellen"],
    ["sail", "Segeln", "Fortbewegung mit Segeln (nur bei Segelantrieb)"],
    ["commands", "Kommandos", "Befehle an die Besatzung"],
    ["heal", "Heilen", "verwundete Besatzung versorgen"],
    ["boarding", "Entern", "Enteraktion gegen ein anderes Fahrzeug"],
    ["broadside", "Breitseite", "alle Bordwaffen einer Seite abfeuern"],
  ],
  ranged: [
    { name: "Hornisse (leicht)", skill: "Geschütze", at: 11, tp: "2W6+4", stp: "1W6 StP", ammo: "Bolzen 12", operator: "Alrik Grimmwald", reload: "", img: A.rangeWeapon },
    { name: "Aal (Rotze)", skill: "Geschütze", at: 9, tp: "3W6", stp: "2W6 StP", ammo: "Steinkugeln 6", operator: null, reload: "lädt nach (1)", img: A.rangeWeapon },
  ],
  ram: { name: "Rammsporn", skill: "Boote & Schiffe", fw: 8, tp: "2W6", stp: "3W6 StP", operator: "Thorgrim Sohn des Thorbosch" },
  melee: [{ name: "Enterhaken", skill: "Hiebwaffen", at: 10, tp: "1W6+2", operator: null, img: A.meleeWeapon }],
  gunnery_skills: [{ name: "Geschütze", at: 10 }],
  locomotion: [{ name: "Boote & Schiffe", probe: ["FF", "GE", "KK"], fw: 8 }],
  armor: [{ name: "Eichenplanken", rs: 3 }],
  crewMembers: [
    { name: "Alrik Grimmwald", img: `${ICONS}/species/Mensch.webp`, ident: "Mensch · Söldner", owner: "Ben", color: "#b0563c", role: "Hornisse" },
    { name: "Thorgrim Sohn des Thorbosch", img: `${ICONS}/species/Zwerg.webp`, ident: "Zwerg · Kämpfer", owner: "David", color: "#8a6a2e", role: "Rammsporn" },
    { name: "Kapitänin Efferdane", img: `${ICONS}/species/Mensch.webp`, ident: "Mensch · Seefahrerin", owner: "SL", color: "#5a6a7a", role: "Steuer" },
    { name: "Matrosen (11)", img: `${ICONS}/categories/ability_command.webp`, ident: "Besatzung · NSC", owner: "SL", color: "#5a6a7a", role: "" },
  ],
  cargoItems: [
    { name: "Fass Trinkwasser", qty: 6, weight: "3,0", price: "1 S", img: A.tabInventory },
    { name: "Proviant (Woche)", qty: 2, weight: "1,5", price: "5 S", img: `${ICONS}/categories/consumable.webp` },
    { name: "Ersatzsegel", qty: 1, weight: "1,0", price: "20 S", img: A.armor },
    { name: "Bolzen für Hornisse", qty: 12, weight: "0,1", price: "2 S", img: A.rangeWeapon },
  ],
};

const vehicleToast = (text) => groupToast(text);
const vehicleSystem = (what) => vehicleToast(`${what}: Dialog bzw. Wurf des Systems`);

/* ------------------------------------------------------------ Bausteine ---- */
// Leiste wie im Systembogen (vehicle-healthbar.hbs): Füllstand, aktueller Wert per − / + änderbar.
function vehicleBar(label, cur, max, onChange, cls) {
  const pct = max ? Math.round(cur / max * 100) : 0;
  const step = (d) => {
    const b = el("button", { type: "button", class: "vehicle-bar-step", title: `${label} ${d > 0 ? "erhöhen" : "senken"}` }, d > 0 ? "+" : "−");
    b.addEventListener("click", () => { onChange(Math.max(0, Math.min(max, cur + d))); renderContent(); });
    return b;
  };
  return el("div", { class: `vehicle-bar ${cls}` }, [
    el("span", { class: "group-side-label" }, label),
    el("div", { class: "vehicle-bar-row" }, [
      step(-1),
      el("div", { class: "vehicle-bar-track", title: `${label}: ${cur} von ${max}` }, [el("span", { class: "vehicle-bar-fill", style: `width:${pct}%` }), el("b", {}, `${cur} / ${max}`)]),
      step(1),
    ]),
  ]);
}

const crewAvailable = () => Math.max(0, VEHICLE.crew.value - VEHICLE.crew.wounded);

function vehicleCrewAvatar(name) {
  const m = VEHICLE.crewMembers.find((x) => x.name === name);
  if (!m) {
    const b = el("button", { type: "button", class: "vehicle-crew-add", title: "Bediener zuweisen (System: assignWeaponCrew)" }, "+ Bediener");
    b.addEventListener("click", () => vehicleToast("Auswahl der Besatzung öffnet sich (System)"));
    return b;
  }
  return el("span", { class: "vehicle-crew-op", title: `Bediener: ${m.name}` }, [groupPortrait(m, "round"), el("small", {}, m.name.split(" ")[0])]);
}

function vehicleWeaponRow(w, kind) {
  const die = combatDie(w.at ?? w.fw, kind === "ram" ? "d20ko" : "d20mu", `${w.name} ${kind === "ram" ? "rammen" : "abfeuern"}`);
  return el("div", { class: "row vehicle-weapon-row" + (w.reload ? " unloaded" : "") }, [
    el("img", { src: w.img || A.combatSkill, alt: "" }),
    el("span", { class: "left weapon-name" }, [el("span", { title: w.name }, w.name), el("small", { class: "weapon-sub" }, [w.skill, w.ammo ? ` · ${w.ammo}` : "", w.reload ? ` · ${w.reload}` : ""].join(""))]),
    el("span", { class: "short-weapon-dice" }, [die]),
    el("span", { class: "vehicle-damage" }, [damageBtn(w.tp, w.name), w.stp ? el("small", {}, w.stp) : null]),
    vehicleCrewAvatar(w.operator),
  ]);
}

function vehicleWeaponsPanel(title, list, kind, hint) {
  return el("div", { class: "panel" }, [
    el("div", { class: "panel-title flex" }, [el("span", {}, title), hint ? el("small", {}, hint) : null]),
    el("div", { class: "row-head vehicle-weapon-row" }, head("", "Waffe", kind === "ram" ? "FW" : "AT", "TP · StP", "Bediener")),
    ...(list.length ? list.map((w) => vehicleWeaponRow(w, kind)) : [el("p", { class: "muted" }, "Keine Bordwaffen angelegt.")]),
  ]);
}

function vehicleActionsPanel() {
  const actions = VEHICLE.heroActions.filter(([id]) => id !== "sail" || VEHICLE.propulsion === "Segel");
  return el("div", { class: "panel" }, [
    el("div", { class: "panel-title flex" }, [el("span", {}, "Aktionen der Helden"), el("small", {}, "würfelt der Held, der den Bogen benutzt")]),
    el("div", { class: "vehicle-actions" }, actions.map(([id, label, hint]) => {
      const b = el("button", { type: "button", class: "vehicle-action", title: hint }, label);
      b.addEventListener("click", () => vehicleSystem(label));
      return b;
    })),
  ]);
}

function vehicleLocomotionPanel() {
  return el("div", { class: "panel" }, [
    el("div", { class: "panel-title" }, "Fortbewegung"),
    ...VEHICLE.locomotion.map((t) => el("div", { class: "row vehicle-skill-row" }, [
      el("span", { class: "left" }, t.name),
      el("span", { class: "vehicle-probe" }, t.probe.map((a) => combatDie(a, DIE_BY_ATTR[a], `Probe auf ${t.name} würfeln`))),
      el("b", { class: "center" }, String(t.fw)),
    ])),
  ]);
}

/* ---------------------------------------------------------- Titelblatt ---- */
// Kurzer Satz am Anfang jedes Reiters: was er am Tisch tut.
const vehicleIntro = (text) => el("p", { class: "muted vehicle-intro" }, text);

function vehicleCrewPanel() {
  return el("div", { class: "panel" }, [
    el("div", { class: "panel-title flex" }, [el("span", {}, "An Bord"), el("small", {}, `${crewAvailable()} von ${VEHICLE.crew.initial} einsatzbereit`)]),
    el("div", { class: "vehicle-crew-strip" }, VEHICLE.crewMembers.map((m) => el("span", { class: "vehicle-crew-op", title: `${m.name} · ${m.ident}${m.role ? ` · ${m.role}` : ""}` }, [groupPortrait(m, "round"), el("small", {}, m.name.split(" ")[0])]))),
  ]);
}

function renderVehicleCover() {
  return el("div", {}, [
    vehicleIntro("Überblick am Tisch: Zustand des Fahrzeugs links, hier die Aktionen, die fast jede Runde gebraucht werden, und wer an Bord ist. Kampf und Reise haben eigene Reiter."),
    vehicleActionsPanel(),
    vehicleCrewPanel(),
  ]);
}

function renderVehicleTravel() {
  const pct = Math.round(VEHICLE.cargo.used / VEHICLE.cargo.capacity * 100);
  const travel = el("div", { class: "panel" }, [
    el("div", { class: "panel-title" }, "Tempo und Reisearten"),
    el("div", { class: "vehicle-travel" }, [
      ...[["Grundtempo", VEHICLE.speed.base], ["zu Wasser", VEHICLE.speed.water], ["in der Luft", VEHICLE.speed.air || "–"], ["Rammtempo", VEHICLE.speed.ram]]
        .map(([l, v]) => el("div", { class: "creature-stat" }, [el("b", {}, String(v)), el("small", {}, l)])),
    ]),
    el("div", { class: "chips" }, VEHICLE.travelModes.map(([l, on]) => el("span", { class: "chip" + (on ? "" : " off"), title: on ? "Reiseart möglich" : "Reiseart nicht möglich" }, l))),
  ]);
  const cargo = el("div", { class: "panel" }, [
    el("div", { class: "panel-title flex" }, [el("span", {}, "Ladung"), el("small", {}, `${String(VEHICLE.cargo.used).replace(".", ",")} von ${VEHICLE.cargo.capacity} Stein · ${pct} %`)]),
    el("div", { class: "vehicle-cargo-track" }, el("span", { style: `width:${pct}%` })),
    ...VEHICLE.cargoItems.slice(0, 3).map((i) => el("div", { class: "row vehicle-cargo-row" }, [el("img", { src: i.img, alt: "" }), el("span", { class: "left" }, i.name), el("span", { class: "muted center" }, `× ${i.qty}`), el("span", {})])),
  ]);
  const more = el("button", { type: "button", class: "show-all-btn" }, "Ganze Ladung → Ladung");
  more.addEventListener("click", () => setTab("inventory"));
  cargo.append(more);
  return el("div", {}, [
    vehicleIntro("Für Fahrten über längere Strecken: wie schnell das Fahrzeug unterwegs ist, wo es fahren kann, wie voll es beladen ist und wer an Bord ist."),
    travel, cargo, vehicleCrewPanel(),
  ]);
}

// Linke Spalte: Leisten Strukturpunkte und Besatzung (System im Kopf), darunter die Werte, die man im Spiel sucht.
function vehicleOverview() {
  const rows = [
    ["einsatzbereit", `${crewAvailable()} von ${VEHICLE.crew.initial}`],
    ["verwundet", String(VEHICLE.crew.wounded)],
    ["Rumpfschutz", String(VEHICLE.hullArmor)],
    ["Tempo", `${VEHICLE.speed.base} (Rammen ${VEHICLE.speed.ram})`],
    ["Initiative", String(VEHICLE.initiative)],
    ["Aktionen", String(VEHICLE.actions)],
    ["Distanz", `${VEHICLE.distanceRE} RE`],
    ["Ladung", `${String(VEHICLE.cargo.used).replace(".", ",")} / ${VEHICLE.cargo.capacity} Stein`],
  ];
  return [
    vehicleBar("Strukturpunkte", VEHICLE.stp.value, VEHICLE.stp.max, (v) => { VEHICLE.stp.value = v; }, "stp"),
    vehicleBar("Besatzung", VEHICLE.crew.value, VEHICLE.crew.initial, (v) => { VEHICLE.crew.value = v; }, "crew"),
    el("dl", { class: "side-details" }, rows.map(([k, v]) => el("div", {}, [el("dt", {}, k), el("dd", {}, v)]))),
  ];
}

/* --------------------------------------------------------------- Reiter ---- */
function vehicleStatsPanels() {
  const panel = (title, rows) => el("div", { class: "panel" }, [el("div", { class: "panel-title" }, title),
    ...rows.map(([label, wert]) => el("div", { class: "row vehicle-stat-row" }, [el("span", { class: "left" }, label), el("b", { class: "center" }, String(wert))]))]);
  return el("div", { class: "grid-2" }, [
    el("div", { class: "col-gap" }, [
      panel("Einstufung", [["Antrieb", VEHICLE.propulsion], ["Bewaffnung", VEHICLE.armament], ["Größenkategorie", VEHICLE.size]]),
      panel("Struktur", [["Strukturpunkte (max.)", VEHICLE.stp.max], ["Rumpfschutz", VEHICLE.hullArmor]]),
      panel("Logistik", [["Ladekapazität", `${VEHICLE.cargo.capacity} Stein`], ["Preis", VEHICLE.price]]),
    ]),
    el("div", { class: "col-gap" }, [
      panel("Tempo", [["Grundtempo", VEHICLE.speed.base], ["Rammtempo", VEHICLE.speed.ram], ["zu Wasser", VEHICLE.speed.water], ["in der Luft", VEHICLE.speed.air]]),
      panel("Kampf", [["Geschützkunde", VEHICLE.gunnery], ["Initiative", VEHICLE.initiative], ["Aktionen", VEHICLE.actions], ["Distanz (RE)", VEHICLE.distanceRE]]),
    ]),
  ]);
}

function renderVehicleCombat() {
  return el("div", {}, [
    vehicleIntro("Für den Kampf zwischen Fahrzeugen: die Aktionen der Helden, Bordwaffen und Rammen mit Würfeln, Geschützkunde, Fortbewegung und Rumpfschutz."),
    vehicleActionsPanel(),
    vehicleWeaponsPanel("Bordwaffen Fernkampf", VEHICLE.ranged, "at"),
    vehicleWeaponsPanel("Rammen", [VEHICLE.ram], "ram"),
    vehicleWeaponsPanel("Bordwaffen Nahkampf", VEHICLE.melee, "at"),
    el("div", { class: "grid-2" }, [
      el("div", { class: "panel" }, [el("div", { class: "panel-title" }, "Geschützkunde"),
        ...VEHICLE.gunnery_skills.map((s) => el("div", { class: "row vehicle-skill-row" }, [el("span", { class: "left" }, s.name), combatDie(s.at, "d20mu", `${s.name} würfeln`), el("span", {})]))]),
      el("div", { class: "panel" }, [el("div", { class: "panel-title flex" }, [el("span", {}, "Rumpfschutz"), el("small", {}, `RS ${VEHICLE.armor.reduce((a, x) => a + x.rs, 0)}`)]),
        ...VEHICLE.armor.map((a) => el("div", { class: "row vehicle-skill-row" }, [el("span", { class: "left" }, a.name), el("b", { class: "center" }, `RS ${a.rs}`), el("span", {})]))]),
    ]),
    vehicleLocomotionPanel(),
    el("div", { class: "subhead" }, "Werte des Fahrzeugs"),
    vehicleStatsPanels(),
  ]);
}

function renderVehicleCrew() {
  const stat = (label, value, hint) => el("div", { class: "creature-stat", title: hint }, [el("b", {}, String(value)), el("small", {}, label)]);
  const card = (m) => el("div", { class: "group-tile size-m vehicle-crew-card" }, [
    el("div", { class: "group-member" }, [groupPortrait(m), el("div", { class: "group-name" }, [el("b", {}, m.name), el("small", {}, m.ident)])]),
    el("div", { class: "vehicle-crew-role" }, m.role ? `bedient: ${m.role}` : "ohne Posten"),
    el("small", { class: "muted" }, `Spieler: ${m.owner}`),
  ]);
  return el("div", {}, [
    vehicleIntro("Wer das Fahrzeug bemannt: Sollstärke, verwundete und einsatzbereite Besatzung sowie die Mitglieder mit ihrem Posten."),
    el("div", { class: "panel" }, [
      el("div", { class: "panel-title" }, "Stärke"),
      el("div", { class: "creature-stats" }, [
        stat("Sollstärke", VEHICLE.crew.initial, "Besatzung, die das Fahrzeug braucht"),
        stat("an Bord", VEHICLE.crew.value, "aktuelle Besatzung"),
        stat("verwundet", VEHICLE.crew.wounded, "verwundete Besatzung"),
        stat("einsatzbereit", crewAvailable(), "an Bord, nicht verwundet"),
      ]),
    ]),
    el("div", { class: "panel" }, [
      el("div", { class: "panel-title" }, "Mitglieder der Besatzung"),
      el("div", { class: "group-tiles size-m" }, VEHICLE.crewMembers.map(card)),
      el("p", { class: "muted group-drop" }, "Charakter, NSC oder Kreatur hierher ziehen, um ihn zur Besatzung hinzuzufügen."),
    ]),
  ]);
}

function renderVehicleCargo() {
  const pct = Math.round(VEHICLE.cargo.used / VEHICLE.cargo.capacity * 100);
  return el("div", {}, [
    vehicleIntro("Alles, was geladen ist, mit Gewicht und Füllstand gegenüber der Ladekapazität."),
    el("div", { class: "panel" }, [
      el("div", { class: "panel-title flex" }, [el("span", {}, "Ladung"), el("small", {}, `${String(VEHICLE.cargo.used).replace(".", ",")} von ${VEHICLE.cargo.capacity} Stein · ${pct} %`)]),
      el("div", { class: "vehicle-cargo-track" }, el("span", { style: `width:${pct}%` })),
      el("div", { class: "row-head inv-row" }, head("", "Gegenstand", "", "Anz.", "Gew.", "Preis", "", "")),
      ...VEHICLE.cargoItems.map((i) => inventoryRow(i, VEHICLE.cargoItems)),
    ]),
  ]);
}

/* ---------------------------------------------------------------- Setup ---- */
const VEHICLE_TABS = [
  { id: "cover", label: "Titelblatt", icon: A.tabCover, title: "Titelblatt", hint: "" },
  { id: "combat", label: "Seekampf", icon: A.tabCombat, title: "Seekampf", hint: "" },
  { id: "travel", label: "Reise", icon: VEHICLE_IMG, title: "Reise", hint: "" },
  { id: "crew", label: "Besatzung", icon: `${ICONS}/categories/ability_command.webp`, title: "Besatzung", hint: "" },
  { id: "inventory", label: "Ladung", icon: A.tabInventory, title: "Ladung", hint: "" },
  { id: "status", label: "Status", icon: A.tabStatus, title: "Status", hint: "" },
  { id: "notes", label: "Beschreibung", icon: A.tabNotes, title: "Beschreibung", hint: "" },
];

function vehicleData() {
  CHARACTER_NAME = VEHICLE.name;
  Object.assign(PORTRAIT_IMG, { img: VEHICLE_IMG, size: "70%", pos: "50% 50%" });
  clearFavorites();
  PERSONAE.length = 0;
  CONDITIONS.forEach((c) => { c.filled = 0; });
}

function vehicleSetup() {
  nonHeroSetup();
  RENDERERS.cover = renderVehicleCover;
  RENDERERS.combat = renderVehicleCombat;
  RENDERERS.travel = renderVehicleTravel;
  RENDERERS.crew = renderVehicleCrew;
  RENDERERS.inventory = renderVehicleCargo;
  delete SECTION_TABS.combat;
  delete SECTION_TABS.inventory;
  COVER_SIDE_TAB = "overview";
  setNotesSections([
    textSection("description", "Beschreibung", "Platzhalter: Bauart, Geschichte und Eigenheiten des Fahrzeugs.", "Sichtbar für alle, die den Bogen sehen dürfen."),
  ]);
  ["onlyLepToggle", "armorOneToggle", "merchantModeToggle"].forEach((id) => { const n = document.getElementById(id); if (n) n.hidden = true; });
}

function vehicleBadges(wrap) {
  const sep = () => el("span", { class: "ident-sep", "aria-hidden": "true" }, "·");
  wrap.append(el("span", { class: "ident-text", title: "Fahrzeugtyp (Freitext im System)" }, VEHICLE.type), sep(),
    el("span", { class: "ident-text" }, `Größe ${VEHICLE.size}`), sep(), el("span", { class: "ident-text" }, VEHICLE.propulsion));
}

const VEHICLE_TYPE = {
  toolbar: "Fahrzeugbogen · Click-Dummy (Konzept)",
  replaceTabs: VEHICLE_TABS,
  data: vehicleData,
  setup: vehicleSetup,
  headBadges: vehicleBadges,
  coverTabs: [["overview", "Überblick"]],
  coverSideBody: (id) => (id === "overview" ? vehicleOverview() : null),
  noAP: true,
};
