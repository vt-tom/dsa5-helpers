// Reiter „Aufträge“ und „Personen“ (Issue #39): Listen aus dem Almanach des Systems — dieselben Journale (dsa5-
// Einstellungen questlogJournals / calendarActors) und dieselben Sichtbarkeitsregeln wie QuestLogFeature und
// PersonaeDramatis. Bearbeitet wird nur im Almanach; ein Klick öffnet ihn am Eintrag (CalendarWidget.openCalendarPicker,
// wie die Almanach-Hinweise des Systems). Die SL schaltet die Reiter im Untermenü „Heldenbogen“ ab.
import { isFoundry13 } from '../compat/runtime.js';
const MODULE_ID = 'dsa5-helpers';
export const QUESTS_TAB = 'quests';
export const PERSONAE_TAB = 'personae';
// Einstellung des Moduls und Bereich des Almanachs (calendarFeatureVisibility) je Reiter.
const TAB_CONFIG = {
  [QUESTS_TAB]: { setting: 'questsTab', feature: 'questlog', journals: 'questlogJournals' },
  [PERSONAE_TAB]: { setting: 'personaeTab', feature: 'personae', journals: 'calendarActors' },
};
export const QUEST_PLACEHOLDER = 'systems/dsa5/icons/backgrounds/library.webp';

const setting = (scope, key, fallback) => { try { return game.settings.get(scope, key) ?? fallback; } catch { return fallback; } };

/** Sichtbar wie DSAQuestLogEntry.isVisibleToUser: SL alles, sonst freigegeben und Publikum alle bzw. der Spieler. */
export function questVisible(quest, user = game.user) {
  if (user?.isGM) return true;
  if (!quest?.visible) return false;
  const audience = Number(quest.audience) || 0;
  if (audience === 2) return false;
  if (audience === 1) return (quest.playerOwners ?? []).includes(user?.id);
  return true;
}

/** Zeigt der Bogen den Reiter? Moduleinstellung an, Almanach-Bereich für Spieler freigegeben, Journale eingerichtet. */
export function almanacTabEnabled(tab, user = game.user) {
  if (tab === QUESTS_TAB && isFoundry13()) return false;
  const config = TAB_CONFIG[tab];
  if (!config || setting(MODULE_ID, config.setting, true) === false) return false;
  if (!user?.isGM && setting('dsa5', 'calendarFeatureVisibility', {})?.[config.feature] === false) return false;
  return (setting('dsa5', config.journals, {})?.activated ?? []).length > 0;
}

async function activatedJournals(key) {
  const list = setting('dsa5', key, {})?.activated ?? [];
  return (await Promise.all(list.map(j => fromUuid(j.uuid).catch(() => null)))).filter(Boolean);
}

const sortValue = entry => Number(entry?.sort) || 0;

/** Ein Auftrag für die Karte: Ziele nach Reihenfolge, versteckte Ziele nur für die SL. */
export function questCard(quest, { pageUuid, key, isGM = game.user?.isGM } = {}) {
  const objectives = Object.values(quest.objectives ?? {})
    .filter(o => o && (o.visible !== false || isGM))
    .sort((a, b) => sortValue(a) - sortValue(b))
    .map(o => ({ text: o.text, status: Number(o.status) || 0 }));
  return {
    pageUuid, key,
    title: quest.title || '',
    priority: Number(quest.priority) || 0,
    status: Number(quest.status) || 0,
    pinned: !!quest.pinToTop,
    img: quest.image || QUEST_PLACEHOLDER,
    location: quest.location?.trim() || '',
    summary: quest.summary?.trim() || '',
    objectives,
    done: objectives.filter(o => o.status === 1).length,
    hidden: isGM && (!quest.visible || Number(quest.audience) === 2),
  };
}

/** Aufträge gruppiert: offene nach Priorität (Haupt-, Neben-, persönlich), abgeschlossene getrennt. */
export function groupQuests(cards) {
  const lang = game.i18n?.lang;
  const order = (a, b) => (b.pinned - a.pinned) || a.title.localeCompare(b.title, lang, { sensitivity: 'base' });
  const open = cards.filter(q => q.status === 0);
  return {
    groups: [0, 1, 2].map(priority => ({ priority, quests: open.filter(q => q.priority === priority).sort(order) })).filter(g => g.quests.length),
    closed: cards.filter(q => q.status !== 0).sort(order),
    empty: !cards.length,
  };
}

export async function loadQuests(user = game.user) {
  const cards = [];
  for (const journal of await activatedJournals('questlogJournals')) {
    for (const page of journal.pages ?? []) {
      if (page.type !== 'dsaquestlog') continue;
      for (const [key, quest] of Object.entries(page.system?.quests ?? {})) {
        if (quest && questVisible(quest, user)) cards.push(questCard(quest, { pageUuid: page.uuid, key, isGM: !!user?.isGM }));
      }
    }
  }
  return groupQuests(cards);
}

/** Personen wie PersonaeDramatis: nur freigegebene (SL alle) mit verknüpftem Akteur; type 0 Dramatis Personae, 1 Bestiarium. */
export async function loadPersonae(user = game.user) {
  const lists = { 0: [], 1: [] };
  for (const journal of await activatedJournals('calendarActors')) {
    for (const page of journal.pages ?? []) {
      if (page.type !== 'dsapersonaedramatis') continue;
      for (const [key, entry] of Object.entries(page.system?.personae ?? {})) {
        if (!entry?.actor_uuid || (!entry.visible && !user?.isGM)) continue;
        const actor = globalThis.fromUuidSync?.(entry.actor_uuid);
        (lists[Number(entry.type) === 1 ? 1 : 0]).push({
          pageUuid: page.uuid, key,
          name: entry.name || actor?.name || '',
          img: entry.img || actor?.img || '',
          subtitle: entry.subtitle?.trim() || '',
          faction: entry.faction?.trim() || '',
          important: !!entry.important,
          hidden: !!user?.isGM && !entry.visible,
        });
      }
    }
  }
  const lang = game.i18n?.lang;
  const order = (a, b) => (b.important - a.important) || a.name.localeCompare(b.name, lang, { sensitivity: 'base' });
  return { dramatis: lists[0].sort(order), bestiary: lists[1].sort(order) };
}

/** Almanach öffnen, optional am Eintrag (tab: 'questlog' | 'personae'). */
export async function openAlmanac(tab, pageUuid, entryKey) {
  const widget = game.dsa5?.apps?.CalendarWidget?.constructor;
  if (isFoundry13() && tab === 'personae') {
    const picker = game.dsa5?.apps?.CalendarPicker;
    if (picker) {
      await picker.render(true);
      picker.changeTab('personae', 'sheet');
      return;
    }
  }
  if (!widget?.openCalendarPicker) return ui.notifications.warn('DSA5HELPERS.Almanac.Unavailable', { localize: true });
  await widget.openCalendarPicker(tab, pageUuid && entryKey ? { pageUuid, entryKey } : null);
}

/** Einstellungen (Untermenü „Heldenbogen“) und Neuzeichnen offener Bögen, wenn sich Aufträge oder Personen ändern. */
export function registerAlmanacTabs() {
  // onlyOpen: nur Bögen, die gerade einen der beiden Reiter zeigen (Änderung an einem Auftrag oder einer Person).
  const rerender = (onlyOpen = false) => {
    for (const app of foundry.applications.instances.values()) {
      if (!app.rendered || !app.options?.classes?.includes('dsa5-helpers-sheet')) continue;
      if (!onlyOpen || app._currentTab in TAB_CONFIG) app.render();
    }
  };
  for (const { setting: key } of Object.values(TAB_CONFIG)) {
    game.settings.register(MODULE_ID, key, {
      name: `DSA5HELPERS.Settings.${key[0].toUpperCase()}${key.slice(1)}.Name`, hint: `DSA5HELPERS.Settings.${key[0].toUpperCase()}${key.slice(1)}.Hint`,
      scope: 'world', config: false, restricted: true, type: Boolean, default: true, onChange: () => rerender(),
    });
  }
  const relevant = page => page?.type === 'dsaquestlog' || page?.type === 'dsapersonaedramatis';
  for (const hook of ['createJournalEntryPage', 'updateJournalEntryPage', 'deleteJournalEntryPage']) {
    Hooks.on(hook, page => { if (relevant(page)) rerender(true); });
  }
}
