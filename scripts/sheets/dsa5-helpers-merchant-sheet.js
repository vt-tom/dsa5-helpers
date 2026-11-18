/** Händler- und Schatzbogen im Modul-Design (Issues #77/#78, Click-Dummy `index.html?actor=haendler|schatz`, Variante C
 *  „Ware und Beutel“, Nutzerentscheidung 2026-11-17).
 *
 *  Händler und Schatz sind im System kein eigener Akteurtyp, sondern `system.merchant.merchantType` an Held, NSC, Kreatur
 *  und Fahrzeug; jeder Typ hat im System einen Händlerbogen (`MerchantSheetMixin` über dem jeweiligen Bogen). Wir erben
 *  denselben Mixin über dem Helfer-Bogen des Typs, damit Handel, Preise, Kassenbuch, Zugriffe und Aktionen
 *  (`tradeWrapper`, `setShopChip`, `fillStock` …) die des Systems bleiben:
 *  - Besitzer/SL: der gewohnte Helfer-Bogen, im Reiter „Laden“ bzw. „Schatz“ (statt Ausrüstung) stehen Bestand,
 *    Einstellungen und Zugang mit den Vorlagen des Systems (parts/merchant-admin.hbs).
 *  - Kunde (Spieler mit eingeschränktem Zugriff, SL mit „Kundensicht“) und Garadan: statt der Reiter die Ladenansicht
 *    (parts/shop.hbs): Ware links, Beutel des Käufers rechts.
 *  Der Mixin ersetzt `static PARTS` und tauscht für Kunden ganze Teilsätze (`MERCHANTPARTS`); beides gilt bei uns nicht,
 *  weil unser Bogen nur ein Wurzelteil hat – die Ladenansicht ist ein Zweig in dessen Vorlage.
 *
 *  Fahrzeug: einen Helfer-Fahrzeugbogen gibt es noch nicht (#93). Dort erbt die Klasse vom Händlerbogen des Systems und
 *  ersetzt nur die Kundenteile durch dieselbe Ladenansicht.
 */
import { systemApi } from '../compat/runtime.js';

const MODULE_ID = 'dsa5-helpers';
const MERCHANT_TYPES = new Set(['merchant', 'loot', 'epic']);
// Händlerbögen des Systems je Akteurtyp (MerchantConfig.SHEET_CLASS_NAMES).
export const SYSTEM_MERCHANT_SHEETS = {
  character: 'dsa5.CharacterMerchantSheetDSA5',
  npc: 'dsa5.MerchantSheetDSA5',
  creature: 'dsa5.CreatureMerchantSheetDSA5',
  vehicle: 'dsa5.VehicleMerchantSheetDSA5',
};
// Namen unserer Klassen (Schlüssel in der Registrierung: dsa5-helpers.<Name>), gebraucht von merchant-return.js.
export const HELPER_MERCHANT_SHEETS = {
  character: 'Dsa5HelpersCharacterMerchantSheet',
  npc: 'Dsa5HelpersNpcMerchantSheet',
  creature: 'Dsa5HelpersCreatureMerchantSheet',
  vehicle: 'Dsa5HelpersVehicleMerchantSheet',
};

/** Reiter, die der Händlerbogen für Kunden zeigt: nichts (die Ladenansicht ersetzt den ganzen Bogen). */
export function merchantKind(actor) {
  const type = actor?.system?.merchant?.merchantType;
  return MERCHANT_TYPES.has(type) ? type : null;
}

function vehicleMerchantParts(parts) {
  const copy = foundry.utils.deepClone(parts);
  for (const kind of ['merchant', 'loot']) {
    if (!copy[kind]) continue;
    delete copy[kind].header;
    copy[kind].inventory = { ...copy[kind].inventory, template: `modules/${MODULE_ID}/templates/actors/merchant/shop-tab.hbs` };
  }
  return copy;
}

function create(type, Base, helper) {
  const Class = class extends Base {
    static DEFAULT_OPTIONS = { classes: ['dsa5h-merchant'] };

    // Ein Wurzelteil wie bei jedem Helfer-Bogen; die Teilsätze des Mixins (PARTS, MERCHANTPARTS) greifen nicht.
    static PARTS = helper ? { sheet: helper.PARTS.sheet } : super.PARTS;

    // Fahrzeug: Kundenteile des Systems, nur die Ladenansicht (inventory) ist unsere; den Kopf ersetzt sie mit.
    static MERCHANTPARTS = helper ? super.MERCHANTPARTS : vehicleMerchantParts(super.MERCHANTPARTS);

    _configureRenderParts(options) {
      if (!helper) return super._configureRenderParts(options);
      return helper.prototype._configureRenderParts.call(this, options);
    }

    // Reiter „Ausrüstung“ heißt bei Händler und Schatz „Laden“ bzw. „Schatz“.
    _tabLabel(id) {
      const kind = merchantKind(this.actor);
      if (id === 'inventory' && kind && kind !== 'epic') return game.i18n.localize(kind === 'loot' ? 'DSA5HELPERS.Merchant.TabLoot' : 'DSA5HELPERS.Merchant.TabShop');
      return super._tabLabel(id);
    }

    // Suche in der Ladenansicht: nur Zeilen ein- und ausblenden (die Suche des Systems hängt an dessen Inventarlisten).
    async _onRender(context, options) {
      await super._onRender(context, options);
      const search = this.element?.querySelector('.dsa5h-shop-search');
      search?.addEventListener('input', () => {
        const query = search.value.trim().toLowerCase();
        for (const row of this.element.querySelectorAll('.dsa5h-shop-row')) row.hidden = !!query && !row.textContent.toLowerCase().includes(query);
      });
    }

    async _prepareContext(options) {
      const context = await super._prepareContext(options);
      const kind = merchantKind(this.actor);
      const activated = !!kind && this.merchantSheetActivated();
      if (context.dsa5h) {
        context.dsa5h.limited = false;
        // Der Hinweis „Händlerbogen des Systems“ gilt für die Helfer-Bögen ohne Laden, hier ist der Laden der Bogen.
        context.dsa5h.merchantNotice = null;
        context.dsa5h.shop = activated ? { kind, loot: kind === 'loot', epic: kind === 'epic', gm: game.user.isGM } : null;
        context.dsa5h.merchantAdmin = kind && !activated ? { kind, loot: kind === 'loot', epic: kind === 'epic' } : null;
      }
      return context;
    }
  };
  Object.defineProperty(Class, 'name', { value: HELPER_MERCHANT_SHEETS[type] });
  return Class;
}

/** Im ready-Hook (die Klassen stehen erst dann in CONFIG.Actor.sheetClasses, wie beim Gruppenbogen). */
export async function registerMerchantSheets() {
  const Mixin = systemApi()?.sheets?.MerchantSheetMixin;
  const sheetClasses = CONFIG.Actor.sheetClasses ?? {};
  const registered = [];
  // Vorlagen der Händlerteile des Systems (Bestand, Einstellungen, Zugang, Laden), die unsere Vorlagen einbinden.
  const templates = new Set();
  for (const type of Object.keys(SYSTEM_MERCHANT_SHEETS)) {
    const parts = sheetClasses[type]?.[SYSTEM_MERCHANT_SHEETS[type]]?.cls;
    for (const group of [parts?.PARTS, ...Object.values(parts?.MERCHANTPARTS ?? {})]) {
      for (const part of Object.values(group ?? {})) for (const template of part?.templates ?? []) templates.add(template);
    }
  }
  if (templates.size) await foundry.applications.handlebars.loadTemplates([...templates]);
  for (const [type, systemKey] of Object.entries(SYSTEM_MERCHANT_SHEETS)) {
    const systemSheet = sheetClasses[type]?.[systemKey]?.cls;
    if (!systemSheet) continue;
    // Helfer-Bogen des Typs (vor unserem Händlerbogen registriert).
    const helperEntry = Object.entries(sheetClasses[type] ?? {}).find(([key]) => key.startsWith(`${MODULE_ID}.`) && !key.includes('Merchant'));
    const helper = helperEntry?.[1]?.cls ?? null;
    if (type !== 'vehicle' && (!helper || !Mixin)) continue;
    const Sheet = create(type, type === 'vehicle' ? systemSheet : Mixin(helper), type === 'vehicle' ? null : helper);
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.Actor, MODULE_ID, Sheet, {
      types: [type], makeDefault: false, label: 'DSA5HELPERS.Merchant.SheetLabel',
    });
    registered.push(type);
  }
  return registered;
}
