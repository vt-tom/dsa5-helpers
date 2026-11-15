/** NSC-Bogen im Modul-Design (Issue #53, Click-Dummy `index.html?actor=nsc`, Umsetzung in Foundry auf Nutzerwunsch
 *  2026-11-13, Feinschliff nach Rückmeldung). Erbt über dieselbe Fabrik wie der Heldenbogen vom NSC-Bogen des Systems
 *  (ActorSheetdsa5NPC, selbst ein Heldenbogen mit eigenem Eigenschaften-Reiter): Aktionen, Datenaufbereitung und
 *  Reiter bleiben die des Systems. Abweichungen zum Helden: kein Steigern (Spielen · Bearbeiten), kein AP-Band, keine
 *  Erfahrung, keine Talent-Vorschläge, keine Aufträge/Personen; Titelseite mit Angriffen, Talenten (Anzahl − / +) und
 *  Favoriten; links die Reiter Werte · Status · Person. */
import { systemApi } from '../compat/runtime.js';
import { createCharacterSheet } from './dsa5-helpers-character-sheet.js';

const MODULE_ID = 'dsa5-helpers';
// Reiter des Systembogens für NSC (npc-sheet.js PARTS) in unserer Reihenfolge, dazu die Titelseite.
const NPC_TABS = ['cover', 'main', 'skills', 'combat', 'magic', 'religion', 'inventory', 'status', 'notes', 'companion'];
// Stehen immer oben auf der Titelseite, auch mit Wert 0 (Rückmeldung 2026-10-31).
const FIXED_TALENTS = ['LocalizedIDs.perception', 'LocalizedIDs.willpower'];
// Anzahl der übrigen Talente auf der Titelseite (− / +, Zweierschritte wie die Vorschläge des Helden), je Benutzer und NSC.
export const NPC_TALENT_FLAG = 'npcTalentCount';
export const NPC_TALENT_MIN = 2;
export const NPC_TALENT_MAX = 12;
const NPC_TALENT_DEFAULT = 6;

export function npcTalentCount(actor) {
  const stored = Number(game.user?.getFlag?.(MODULE_ID, NPC_TALENT_FLAG)?.[actor.id]);
  return Number.isFinite(stored) && stored > 0 ? Math.min(NPC_TALENT_MAX, Math.max(NPC_TALENT_MIN, stored)) : NPC_TALENT_DEFAULT;
}

export function createNpcSheet(BaseNpcSheet = systemApi()?.sheets?.ActorSheetdsa5NPC) {
  const Helper = BaseNpcSheet ? createCharacterSheet(BaseNpcSheet) : null;
  if (!Helper) return null;
  return class Dsa5HelpersNpcSheet extends Helper {
    static DEFAULT_OPTIONS = {
      classes: ['dsa5h-npc'],
      actions: { dsa5hNpcTalentCount: this._changeTalentCount },
    };
    static HELPER_TABS = super.HELPER_TABS.filter(tab => NPC_TABS.includes(tab.id));
    // Linke Spalte des Titelblatts: Werte | Status | Person (kurze Namen, drei Reiter passen sonst kaum).
    _coverSideTab = 'values';
    _coverSideTabs = ['values', 'conditions', 'details'];

    // Nur Spielen und Bearbeiten (Click-Dummy nonHeroSetup): NSC steigern im Systembogen nicht mit AP.
    static MODES = { play: super.MODES.play, edit: super.MODES.edit };

    // Schloss in der Titelleiste für jeden Besitzer – das System zeigt es nur bei system.canAdvance (wie beim Kreaturbogen).
    get canLockSheet() {
      return this.actor.isOwner;
    }

    _sheetMode(prepare = {}) {
      const mode = super._sheetMode(prepare);
      if (mode !== 'advance') return mode;
      return this._mayEdit() ? 'edit' : 'play';
    }

    _tabHint(id) {
      const key = `DSA5HELPERS.Npc.Hints.${id}`;
      return game.i18n.has(key) ? game.i18n.localize(key) : super._tabHint(id);
    }

    async _prepareContext(options) {
      const context = await super._prepareContext(options);
      const dsa5h = context.dsa5h;
      if (dsa5h.limited) {
        dsa5h.npc = { limited: true };
        return context;
      }
      const localize = key => game.i18n.localize(key);
      const prepare = context.prepare ?? {};
      const status = this.actor.system.status ?? {};
      // Talent-Vorschläge gehören zu den Helden der Spieler.
      dsa5h.suggestions = [];
      dsa5h.suggestionsCount = 0;
      // Talente: Sinnesschärfe und Willenskraft immer, dann die besten übrigen in der gewählten Anzahl; Favoriten stehen
      // unten bei den Favoriten und hier nicht doppelt.
      const skills = dsa5h.skillGroups.flatMap(group => group.items);
      const fixed = FIXED_TALENTS.map(localize).map(name => skills.find(item => item.name === name)).filter(Boolean);
      const count = npcTalentCount(this.actor);
      const rest = skills.filter(item => !fixed.includes(item) && !dsa5h.favorites[item._id] && Number(item.system?.talentValue?.value) > 0)
        .sort((a, b) => Number(b.system.talentValue.value) - Number(a.system.talentValue.value) || a.name.localeCompare(b.name, game.i18n.lang))
        .slice(0, count);
      // Angriffe: nur ausgerüstete Waffen (im System worn), dazu natürliche Angriffe aus Eigenschaften, falls vorhanden.
      const attacks = [
        ...(prepare.wornMeleeWeapons ?? []).map(item => ({ item, ranged: false })),
        ...(prepare.wornRangedWeapons ?? []).map(item => ({ item, ranged: true })),
        ...(prepare.traits?.meleeAttack ?? []).map(item => ({ item, ranged: false })),
        ...(prepare.traits?.rangeAttack ?? []).map(item => ({ item, ranged: true })),
      ];
      dsa5h.npc = {
        attacks,
        fixedTalents: fixed,
        talents: rest,
        talentCount: count,
        talentsFewer: count > NPC_TALENT_MIN,
        talentsMore: count < NPC_TALENT_MAX,
      };
      // Schips-Plakette nur, wenn der NSC Schicksalspunkte hat (wie beim Kreaturbogen).
      dsa5h.hideFate = !(Number(status.fatePoints?.max) > 0);
      // Reiter „Werte“ der linken Spalte (Rückmeldung 2026-11-12), gleiche Darstellung wie beim Kreaturbogen.
      dsa5h.sideValues = [
        { key: 'CHARAbbrev.RS', label: 'protection', value: Number(prepare.armorSum) || 0 },
        { key: 'CHARAbbrev.INI', label: 'initiative', value: dsa5h.initiative },
        { key: 'CHARAbbrev.GS', label: 'speed', value: status.speed?.max ?? 0 },
        { key: 'CHARAbbrev.SK', label: 'soulpower', value: status.soulpower?.max ?? 0 },
        { key: 'CHARAbbrev.ZK', label: 'toughness', value: status.toughness?.max ?? 0 },
      ].map(entry => ({ ...entry, short: localize(entry.key), label: localize(entry.label) }));
      return context;
    }

    // Anzahl der Talente auf der Titelseite ändern: User-Flag je NSC, danach neu zeichnen (ein User-Flag zeichnet nicht).
    static async _changeTalentCount(_event, target) {
      const next = Math.min(NPC_TALENT_MAX, Math.max(NPC_TALENT_MIN, npcTalentCount(this.actor) + Number(target.dataset.step || 0)));
      await game.user.setFlag(MODULE_ID, NPC_TALENT_FLAG, { [this.actor.id]: next });
      this.render();
    }
  };
}

export const Dsa5HelpersNpcSheet = createNpcSheet();
