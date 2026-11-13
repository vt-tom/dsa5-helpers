// Rückweg aus Schatz und Händler (#54, Nutzerentscheidung 2026-11-13): DSA5 8.2 setzt beim Verlassen des Händler-/
// Schatzmodus fest den Systembogen (MerchantModeHelper.applySheetClassToChange, dsa5-core LootHelper.transformBack
// „In Schatz umwandeln“). Foundry ruft erst _preUpdate des Systems, dann preUpdateActor — hier stehen die Änderungen
// also schon umgeschrieben. Darum beim Hinweg den bisherigen Bogen merken (Flag sheetBeforeMerchant, '' = Standard-
// Bogen, damit die Einstellung „Standard für alle …“ wieder greift) und beim Rückweg auf den Systembogen stattdessen
// diesen Bogen setzen. Ausdrückliche Wahl über unseren Umschalter (Option dsa5hSheetChoice) bleibt unangetastet.
import { clearModuleFlag, MERCHANT_SHEETS } from './runtime.js';

const FLAG = 'sheetBeforeMerchant';
const SYSTEM_SHEETS = { character: 'dsa5.ActorSheetdsa5Character', creature: 'dsa5.ActorSheetdsa5Creature' };
const DEFAULT_SETTINGS = { character: 'defaultSheet', creature: 'defaultCreatureSheet' };

// Rückgabe nur für Tests: 'remember' | 'restore' | undefined.
export function applyMerchantReturn(actor, changes, options = {}, ourDefault = false) {
  const { getProperty, hasProperty, setProperty } = foundry.utils;
  const merchant = MERCHANT_SHEETS[actor?.type];
  if (!merchant || !hasProperty(changes, 'flags.core.sheetClass')) return;
  const next = getProperty(changes, 'flags.core.sheetClass') ?? '';
  const current = actor.getFlag('core', 'sheetClass') ?? '';
  if (next === merchant && current !== merchant) {
    setProperty(changes, `flags.dsa5-helpers.${FLAG}`, current);
    return 'remember';
  }
  if (current !== merchant || next === merchant) return;
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
