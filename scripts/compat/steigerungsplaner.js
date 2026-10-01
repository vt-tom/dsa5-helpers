// Kompatibilität zu „Lyynix: DSA5 - Steigerungsplaner“ (Issue #17).
//
// Der Planer umhüllt per libWrapper die Systemklasse ActorSheetdsa5Character, von der unser Bogen erbt: Shift-Klick
// auf „+“/„−“, die +N-Badges, der Tooltip-Hinweis und das Nachführen des Plans laufen dadurch bei uns mit. Nur sein
// Reiter fehlt, weil er ihn in die PARTS/TABS der Systemklasse einträgt und wir eigene Reiter haben. Den bauen wir
// selbst als Reiter „Steigerungsplaner“ und füllen ihn mit Template, Daten und Listenern des Planers.
//
// Der Planer hat (Stand v0.4.0) keine öffentliche API — eine künftige `api.PlannerTab` hat Vorrang, sonst wird
// seine Datei direkt geladen. Dieselbe URL wie sein eigener Import = dieselbe Modulinstanz, gemeinsamer Zustand
// (z. B. gerade angewendete Schritte) bleibt also erhalten.
export const PLANNER_ID = 'dsa5-steigerungsplaner';
export const PLANNER_TAB_ID = 'steigerungsplaner';
export const PLANNER_TEMPLATE = `modules/${PLANNER_ID}/templates/planner-tab.hbs`;

let plannerTab = null;

export async function initSteigerungsplaner() {
  const planner = game.modules.get(PLANNER_ID);
  // Ohne libWrapper bleibt der Planer selbst inaktiv (siehe dessen main.js) — dann auch kein Reiter bei uns.
  if (!planner?.active || !game.modules.get('lib-wrapper')?.active) return;
  try {
    plannerTab = planner.api?.PlannerTab ?? (await import(foundry.utils.getRoute(`modules/${PLANNER_ID}/scripts/planner-tab.js`))).default;
    await foundry.applications.handlebars.loadTemplates([PLANNER_TEMPLATE]);
  } catch (err) {
    plannerTab = null;
    console.warn(`DSA5 Helpers | Steigerungsplaner gefunden, aber nicht einbindbar — Reiter bleibt aus.`, err);
  }
}

/** PlannerTab des Planers (prepareContext/attachListeners) oder null, wenn er nicht aktiv/einbindbar ist. */
export function getPlannerTab() {
  return plannerTab;
}
