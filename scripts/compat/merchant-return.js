// Rückweg aus Schatz und Händler (#54, Nutzerentscheidung 2026-11-13): DSA5 8.2 setzt beim Verlassen des Händler-/
// Schatzmodus fest den Systembogen (MerchantModeHelper.applySheetClassToChange, dsa5-core LootHelper.transformBack
// „In Schatz umwandeln“). Foundry ruft erst _preUpdate des Systems, dann preUpdateActor — hier stehen die Änderungen
// also schon umgeschrieben. Darum beim Hinweg den bisherigen Bogen merken (Flag sheetBeforeMerchant, '' = Standard-
// Bogen, damit die Einstellung „Standard für alle …“ wieder greift) und beim Rückweg auf den Systembogen stattdessen
// diesen Bogen setzen. Ausdrückliche Wahl über unseren Umschalter (Option dsa5hSheetChoice) bleibt unangetastet.
import { clearModuleFlag, MERCHANT_SHEETS } from './runtime.js';
import { HELPER_MERCHANT_SHEETS } from '../sheets/dsa5-helpers-merchant-sheet.js';

const FLAG = 'sheetBeforeMerchant';
const MERCHANT_KINDS = new Set(['merchant', 'loot', 'epic']);
const SYSTEM_SHEETS = { character: 'dsa5.ActorSheetdsa5Character', npc: 'dsa5.ActorSheetdsa5NPC', creature: 'dsa5.ActorSheetdsa5Creature' };
const DEFAULT_SETTINGS = { character: 'defaultSheet', creature: 'defaultCreatureSheet' };

// Rückgabe nur für Tests: 'remember' | 'restore' | undefined.
// Seit #77/#78 gibt es unseren Händlerbogen je Typ (HELPER_MERCHANT_SHEETS): Wer vorher einen Helfer-Bogen nutzt (oder
// unseren Standard), bekommt beim Hinweg diesen statt des Händlerbogens des Systems; beim Rückweg zählen beide als
// „Händlerbogen“.
export function applyMerchantReturn(actor, changes, options = {}, ourDefault = false) {
  const { getProperty, hasProperty, setProperty } = foundry.utils;
  const merchant = MERCHANT_SHEETS[actor?.type];
  if (!merchant) return;
  const ours = HELPER_MERCHANT_SHEETS[actor.type] ? `dsa5-helpers.${HELPER_MERCHANT_SHEETS[actor.type]}` : null;
  const current = actor.getFlag('core', 'sheetClass') ?? '';
  // Typwechsel ohne Bogenwechsel durch das System: es stellt nur leere und eigene Systembögen um (MerchantModeHelper.
  // applySheetClassToChange), ein Helfer-Bogen bliebe also stehen. Wir wechseln dann selbst auf unseren Händlerbogen
  // und zurück (#77/#78).
  const newType = getProperty(changes, 'system.merchant.merchantType');
  if (ours && typeof newType === 'string' && !hasProperty(changes, 'flags.core.sheetClass')) {
    const wasMerchant = MERCHANT_KINDS.has(actor.system?.merchant?.merchantType);
    const willBe = MERCHANT_KINDS.has(newType);
    if (willBe && !wasMerchant && current.startsWith('dsa5-helpers.') && current !== ours) {
      setProperty(changes, `flags.dsa5-helpers.${FLAG}`, current);
      setProperty(changes, 'flags.core.sheetClass', ours);
      return 'remember';
    }
    if (!willBe && wasMerchant && current === ours) {
      const stored = actor.getFlag('dsa5-helpers', FLAG);
      if (stored !== undefined) clearModuleFlag(changes, FLAG);
      setProperty(changes, 'flags.core.sheetClass', stored ?? '');
      return 'restore';
    }
  }
  if (!hasProperty(changes, 'flags.core.sheetClass')) return;
  const next = getProperty(changes, 'flags.core.sheetClass') ?? '';
  const isMerchant = id => id === merchant || id === ours;
  if (next === merchant && !isMerchant(current)) {
    setProperty(changes, `flags.dsa5-helpers.${FLAG}`, current);
    // Unser Bogen (oder unser Standard) bleibt in unserem Design.
    if (ours && (current.startsWith('dsa5-helpers.') || (current === '' && ourDefault))) setProperty(changes, 'flags.core.sheetClass', ours);
    return 'remember';
  }
  // Typwechsel innerhalb von Händler/Schatz: System schreibt wieder seinen Händlerbogen, unseren behalten.
  if (next === merchant && current === ours) {
    setProperty(changes, 'flags.core.sheetClass', ours);
    return;
  }
  if (!isMerchant(current) || isMerchant(next)) return;
  const stored = actor.getFlag('dsa5-helpers', FLAG);
  if (stored !== undefined) clearModuleFlag(changes, FLAG);
  if (next !== SYSTEM_SHEETS[actor.type] || options.dsa5hSheetChoice) return;
  // Ohne Merkzettel (vor diesem Modulstand umgewandelt): zurück auf den Standard-Bogen, falls unserer Standard ist.
  const restore = stored ?? (ourDefault ? '' : undefined);
  if (restore === undefined) return;
  setProperty(changes, 'flags.core.sheetClass', restore);
  return 'restore';
}

export function initMerchantReturn() {
  Hooks.on('preUpdateActor', (actor, changes, options) => {
    const setting = DEFAULT_SETTINGS[actor.type];
    const ourDefault = !!setting && !!game.settings.settings.get(`dsa5-helpers.${setting}`) && !!game.settings.get('dsa5-helpers', setting);
    applyMerchantReturn(actor, changes, options, ourDefault);
  });
}
