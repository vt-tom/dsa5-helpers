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

export function clearCharacterBuilderFlag(changes) {
  const ForcedDeletion = globalThis.foundry?.data?.operators?.ForcedDeletion;
  const path = ForcedDeletion ? 'flags.dsa5-helpers.preChargenSheet' : 'flags.dsa5-helpers.-=preChargenSheet';
  if (!ForcedDeletion) {
    delete changes['flags.dsa5-helpers.preChargenSheet'];
    if (changes.flags?.['dsa5-helpers']) delete changes.flags['dsa5-helpers'].preChargenSheet;
  }
  foundry.utils.setProperty(changes, path, ForcedDeletion ? new ForcedDeletion() : null);
}
