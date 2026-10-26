// Kompatibilitätskorrektur für den System-Ladedialog: Effekt-IDs sind nur je Item eindeutig.
// Darstellung, Quellenauswahl und Datenmodell bleiben beim DSA5-System.
export function powerSourceUpdates(sources, values) {
  if (sources.length !== values.length) throw new Error('Incomplete power source form');
  const updates = new Map();
  sources.forEach((source, index) => {
    const value = Math.max(0, Math.min(source.max, Number(values[index]) || 0));
    if (value === source.value) return;
    if (!updates.has(source.itemId)) updates.set(source.itemId, []);
    updates.get(source.itemId).push({ _id: source.effectId, 'system.powersource.value': value });
  });
  return updates;
}

// Systemklasse nicht direkt aus /systems/... importieren: DSA5 wird als Bundle geladen.
// Ein zusätzlicher Import der Quelldateien startet einen zweiten, zyklischen Modulgraphen.
export async function savePowerCharges(event) {
  event?.preventDefault();
  if (this._saving || (!this.actor.isOwner && !game.user.isGM)) return;
  this._saving = true;
  try {
    const inputs = [...this.element.querySelectorAll('.powersource-charge-row input[type="number"]')];
    const updates = powerSourceUpdates(this.sources, inputs.map(input => input.value));
    for (const [itemId, effects] of updates) {
      const item = this.actor.items.get(itemId);
      if (!item || effects.some(effect => !item.effects.get(effect._id))) throw new Error('Power source no longer exists');
    }
    for (const [itemId, effects] of updates) {
      await this.actor.items.get(itemId).updateEmbeddedDocuments('ActiveEffect', effects);
    }
    // Öffentliche Dokument-API: berechnet den Actor über das bereits geladene System neu.
    this.actor.reset();
    await this.close();
    this.actor.render(false);
  } catch (error) {
    console.error('dsa5-helpers | Kraftspeicher konnten nicht gespeichert werden', error);
    ui.notifications.error(game.i18n.localize('DSA5HELPERS.PowerSources.SaveFailed'));
  } finally {
    this._saving = false;
  }
}

export async function openPowerSourceDialog(sheet) {
  const actor = sheet.actor;
  if (!actor?.isOwner && !game.user.isGM) return;
  const id = `powersource-charge-${actor.id}`;
  // Foundry registriert neue Applications erst während render(). Den Handler deshalb
  // spätestens beim generischen Render-Hook an die echte Systeminstanz hängen.
  return new Promise(resolve => {
    let hook;
    let timeout;
    const cleanup = () => { Hooks.off('renderApplicationV2', hook); clearTimeout(timeout); };
    const attach = app => {
      if (app.id !== id || app.actor !== actor) return false;
      app.options.actions.save = savePowerCharges;
      cleanup();
      resolve(app);
      return true;
    };
    hook = Hooks.on('renderApplicationV2', attach);
    timeout = setTimeout(() => {
      cleanup();
      const error = new Error('System power source dialog did not render');
      console.error('dsa5-helpers | Kraftspeicherdialog konnte nicht geöffnet werden', error);
      ui.notifications.error(game.i18n.localize('DSA5HELPERS.PowerSources.OpenFailed'));
      resolve(null);
    }, 10000);
    try {
      // Verwendet die im DSA5-Bundle initialisierte Klasse samt Systemvorlage.
      sheet.constructor._powersourceEdit.call(sheet);
      const existing = foundry.applications.instances.get(id);
      if (existing) attach(existing);
    } catch (error) {
      cleanup();
      console.error('dsa5-helpers | Kraftspeicherdialog konnte nicht geöffnet werden', error);
      ui.notifications.error(game.i18n.localize('DSA5HELPERS.PowerSources.OpenFailed'));
      resolve(null);
    }
  });
}
