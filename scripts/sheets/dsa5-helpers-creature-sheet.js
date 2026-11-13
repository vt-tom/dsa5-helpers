/** Kreaturbogen im Modul-Design (Issue #54, Click-Dummy `index.html?actor=kreatur`, Entwurf bestätigt 2026-11-12).
 *  Erbt über dieselbe Fabrik wie der Heldenbogen vom Kreaturbogen des Systems (ActorSheetdsa5Creature): Aktionen,
 *  Datenaufbereitung (prepare), Eigenschaften (traits) und das Ablegen von Gegenständen bleiben die des Systems. Hier
 *  stehen nur die Abweichungen: Reiter wie im Systembogen (ohne Gefährten), Titelseite mit Angriffen, allen Talenten
 *  mit Wert und Zaubern/Liturgien, Werte links, Kopf mit Kreaturklasse, Kampfwerte, Beute und Notizen der Kreatur. */
import { systemApi } from '../compat/runtime.js';
import { createCharacterSheet } from './dsa5-helpers-character-sheet.js';

// Reiter des Systembogens für Kreaturen (creature-sheet.js PARTS) in unserer Reihenfolge. Der Reiter „Besitzer“
// (companions/actor-owner.hbs, nur bei Vertrauten/Begleitern) fehlt vorerst – im Click-Dummy ebenfalls nicht entworfen.
const CREATURE_TABS = ['cover', 'main', 'skills', 'combat', 'magic', 'religion', 'inventory', 'status', 'notes'];
// Stehen immer oben auf der Titelseite, auch mit Wert 0 (Rückmeldung 2026-10-31).
const FIXED_TALENTS = ['LocalizedIDs.perception', 'LocalizedIDs.willpower'];

export function createCreatureSheet(BaseCreatureSheet = systemApi()?.sheets?.ActorSheetdsa5Creature) {
  const Helper = BaseCreatureSheet ? createCharacterSheet(BaseCreatureSheet) : null;
  if (!Helper) return null;
  return class Dsa5HelpersCreatureSheet extends Helper {
    static DEFAULT_OPTIONS = { classes: ['dsa5h-creature'] };
    static HELPER_TABS = super.HELPER_TABS.filter(tab => CREATURE_TABS.includes(tab.id));
    // Linke Spalte des Titelblatts: Werte | Statuseffekte (keine persönlichen Daten bei Kreaturen).
    _coverSideTab = 'values';
    _coverSideTabs = ['values', 'conditions'];
    _subtabs = { ...this._subtabs, notes: 'description' };

    // Nur Spielen und Bearbeiten (Click-Dummy nonHeroSetup): Kreaturen steigern nicht mit AP.
    static MODES = { play: super.MODES.play, edit: super.MODES.edit };

    // Schloss in der Titelleiste (Spielen · Bearbeiten) für jeden Besitzer: Das System zeigt es nur, wenn der Akteur
    // steigern kann (system.canAdvance: Held, Vertrauter, Haustier). Ohne Schloss blieb eine gewöhnliche Kreatur fest
    // im Bearbeiten-Modus, weil sheetLocked dort mit false beginnt.
    get canLockSheet() {
      return this.actor.isOwner;
    }

    _sheetMode(prepare = {}) {
      const mode = super._sheetMode(prepare);
      if (mode !== 'advance') return mode;
      return this._mayEdit() ? 'edit' : 'play';
    }

    // Eigene Beschriftungen, wo die Kreatur vom Helden abweicht (Ausrüstung heißt „Beute“).
    _tabLabel(id) {
      const key = `DSA5HELPERS.Creature.Tabs.${id}`;
      return game.i18n.has(key) ? game.i18n.localize(key) : super._tabLabel(id);
    }

    // Kein Gefährten-Reiter, also auch kein Knopf zum Ein-/Ausblenden.
    _getHeaderControls() {
      return super._getHeaderControls().filter(control => control.action !== 'dsa5hToggleCompanionTab');
    }

    async _prepareContext(options) {
      const context = await super._prepareContext(options);
      if (context.dsa5h.limited) {
        context.dsa5h.creature = { limited: true };
        return context;
      }
      const localize = key => game.i18n.localize(key);
      const prepare = context.prepare ?? {};
      const system = this.actor.system;
      const status = system.status ?? {};
      const magic = prepare.magic ?? {};
      const dsa5h = context.dsa5h;
      // Talente: alle mit Wert, Sinnesschärfe und Willenskraft immer zuerst (Rückmeldung 2026-11-12, ohne Anzahl und Sterne).
      const skills = dsa5h.skillGroups.flatMap(group => group.items);
      const fixedNames = FIXED_TALENTS.map(localize);
      const fixed = fixedNames.map(name => skills.find(item => item.name === name)).filter(Boolean);
      const rest = skills.filter(item => !fixed.includes(item) && Number(item.system?.talentValue?.value) > 0)
        .sort((a, b) => Number(b.system.talentValue.value) - Number(a.system.talentValue.value) || a.name.localeCompare(b.name, game.i18n.lang));
      // Angriffe: natürliche (Eigenschaften) zuerst, dann die ausgerüsteten Waffen wie im Systembogen (worn).
      const attacks = [
        ...(prepare.traits?.meleeAttack ?? []).map(item => ({ item, ranged: false })),
        ...(prepare.traits?.rangeAttack ?? []).map(item => ({ item, ranged: true })),
        ...(prepare.wornMeleeWeapons ?? []).map(item => ({ item, ranged: false })),
        ...(prepare.wornRangedWeapons ?? []).map(item => ({ item, ranged: true })),
      ];
      // Größenkategorie: Auswahlfeld des Systems, angezeigt wird der übersetzte Name.
      let sizes = system.schema?.getField?.('status.size.value')?.choices;
      if (typeof sizes === 'function') sizes = sizes();
      const size = status.size?.value ? localize(sizes?.[status.size.value] ?? status.size.value) : '';
      // RS wie im Kampf-Reiter des Systems (prepare.armorSum: Rüstungen + totalArmor) plus natürliche Rüstung: DSA5 8.2.1
      // will Eigenschaften vom Typ „armor“ mitzählen, vergleicht dafür aber den Item-Typ statt traitType (immer falsch).
      const naturalArmor = prepare.traits?.armor ?? [];
      const armor = (Number(prepare.armorSum) || 0) + naturalArmor.reduce((sum, item) => sum + (Number(item.system?.at?.value) || 0), 0);
      // Humanoide Kreaturen (Ork, Rückmeldung #54) führen Waffen und Rüstung: dann der Kampf-Reiter des Helden mit Händen
      // und Körper, sonst die schlichte Fassung mit natürlichen Angriffen und natürlicher Rüstung.
      const gear = this.actor.items.some(item => ['meleeweapon', 'rangeweapon', 'armor'].includes(item.type));
      dsa5h.creature = {
        isAnimal: this._isAnimal(),
        size,
        count: system.count?.value ?? '',
        attacks,
        naturalArmor,
        // Schips-Plakette nur, wenn die Kreatur Schicksalspunkte hat (Click-Dummy: Tiere ohne).
        fatePoints: Number(status.fatePoints?.max) > 0,
        simpleCombat: !gear,
        talents: [...fixed, ...rest],
        fixedTalents: Object.fromEntries(fixed.map(item => [item._id, true])),
        spells: [...(magic.spellList ?? []), ...(magic.ritualList ?? [])],
        liturgies: [...(magic.liturgy ?? []), ...(magic.ceremony ?? [])],
        // Reiter „Werte“ der linken Spalte (Rückmeldung 2026-11-12) und Kampfwerte im Kampf-Reiter.
        values: [
          { key: 'CHARAbbrev.RS', label: 'protection', value: armor },
          { key: 'CHARAbbrev.INI', label: 'initiative', value: dsa5h.initiative },
          { key: 'CHARAbbrev.GS', label: 'speed', value: status.speed?.max ?? 0 },
          { key: 'CHARAbbrev.SK', label: 'soulpower', value: status.soulpower?.max ?? 0 },
          { key: 'CHARAbbrev.ZK', label: 'toughness', value: status.toughness?.max ?? 0 },
        ].map(entry => ({ ...entry, short: localize(entry.key), label: localize(entry.label) })),
        defenseLabel: localize(system.config?.defense ? 'defense' : 'dodge'),
        defense: status.dodge?.max ?? 0,
        armor,
        actions: system.actionCount?.value ?? 1,
        speed: status.speed?.max ?? 0,
      };
      // Notizen der Kreatur (creature-notes.hbs): Beschreibung, Verhalten, Flucht, Sonderregeln, Notizen, private Notizen.
      const notes = dsa5h.subnav.find(nav => nav.tab === 'notes');
      if (notes) {
        notes.items = [['description', 'Description'], ['behaviour', 'behaviour'], ['flight', 'flight'], ['specialRules', 'specialRules'], ['notes', 'Notes']]
          .map(([id, label]) => ({ id, label: localize(label) }));
        if (context.owner) notes.items.push({ id: 'ownernotes', label: localize('ownerNotes') });
      }
      // Ohne Waffen kein Körper-Reiter: der Kampf-Reiter ist dann eine Seite ohne Sprungmarken.
      if (dsa5h.creature.simpleCombat) dsa5h.subnav = dsa5h.subnav.filter(nav => nav.tab !== 'combat');
      return context;
    }

    // Wie der Systembogen (Helfer isAnimal in creature-derived-attributes-small.hbs): Jagd bei Tieren, sonst Beschwörungsschwierigkeit.
    _isAnimal() {
      const helper = Handlebars.helpers?.isAnimal;
      try {
        return helper ? !!helper(this.actor.system.creatureClass?.value ?? '') : false;
      } catch {
        return false;
      }
    }
  };
}

export const Dsa5HelpersCreatureSheet = createCreatureSheet();
