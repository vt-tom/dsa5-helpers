// Schnittstellenanpassungen, keine eigene DSA-Regellogik.
export const systemApi = () => globalThis.dsa5 ?? globalThis.game?.dsa5;
export const isFoundry13 = () => Number(globalThis.game?.release?.generation ?? String(globalThis.game?.version ?? '14').split('.')[0]) === 13;

export function contextMenuEntries(entries) {
  if (!isFoundry13()) return entries;
  return entries.map(entry => ({
    ...entry,
    name: entry.label ?? entry.name,
    condition: entry.visible ?? entry.condition,
    callback: entry.onClick ? target => entry.onClick(null, target) : entry.callback,
  }));
}

// Wartezustand eines angegriffenen Ziels: DSA8 je Startnachricht (flags.opposes), DSA7 nur ein offener Angriff
// (flags.oppose mit startMessageId).
export function isOpposePending(actor, startMessageId) {
  return !!(actor?.flags?.opposes?.[startMessageId] || (startMessageId && actor?.flags?.oppose?.startMessageId === startMessageId));
}

// Wartezustand lösen. DSA7 kennt nur clearOpposed(actor) und löscht den einen offenen Angriff — dort nur, wenn er zu
// dieser Startnachricht gehört, sonst träfe es den Angriff eines späteren Angreifers.
export async function clearOpposedFor(OpposeDSA, actor, startMessageId) {
  if (!actor) return;
  if (!isFoundry13()) return OpposeDSA.clearOpposed(actor, { startMessageId });
  if (actor.flags?.oppose?.startMessageId === startMessageId) return OpposeDSA.clearOpposed(actor);
}

// Händlerbögen des Systems je Akteurtyp (MerchantConfig.SHEET_CLASS_NAMES, DSA5 8.2): Rückweg aus Schatz/Händler
// (merchant-return.js), Bogen-Umschalter und Hinweis im Bogen.
export const MERCHANT_SHEETS = { character: 'dsa5.CharacterMerchantSheetDSA5', creature: 'dsa5.CreatureMerchantSheetDSA5' };

// Modul-Flag innerhalb eines laufenden Updates löschen: v14 kennt ForcedDeletion, v13 nur den Schlüssel „-=name“.
export function clearModuleFlag(changes, key) {
  const ForcedDeletion = globalThis.foundry?.data?.operators?.ForcedDeletion;
  const path = ForcedDeletion ? `flags.dsa5-helpers.${key}` : `flags.dsa5-helpers.-=${key}`;
  if (!ForcedDeletion) {
    delete changes[`flags.dsa5-helpers.${key}`];
    if (changes.flags?.['dsa5-helpers']) delete changes.flags['dsa5-helpers'][key];
  }
  foundry.utils.setProperty(changes, path, ForcedDeletion ? new ForcedDeletion() : null);
}

export function clearCharacterBuilderFlag(changes) {
  clearModuleFlag(changes, 'preChargenSheet');
}
