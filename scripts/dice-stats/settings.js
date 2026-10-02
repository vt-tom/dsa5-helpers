// Würfelstatistik (Issue #28): Einstellungen und Zustimmung.
// - Welt-Einstellung diceStatsEnabled (nur SL, Standard aus).
// - Benutzer-Einstellung diceStatsConsent (undecided/yes/no, scope "user": folgt dem Spieler auf jedes Gerät).
//   Gespiegelt als Flag am eigenen User, damit alle Clients wissen, wessen Statistik angezeigt werden darf.
// - Beim Verbinden (bzw. wenn die SL die Statistik einschaltet) fragt ein Dialog, solange nicht entschieden.
import { MODULE_ID, initRecorder, flush } from './recorder.js';

export const CONSENT_FLAG = 'diceStatsConsent';

export const isEnabled = () => game.settings.get(MODULE_ID, 'diceStatsEnabled');
export const consentOf = (user = game.user) => user === game.user ? game.settings.get(MODULE_ID, 'diceStatsConsent') : (user.getFlag(MODULE_ID, CONSENT_FLAG) ?? 'undecided');
export const isRecording = () => isEnabled() && consentOf() === 'yes';

let asking = false;

/** Fragt den Spieler einmalig, ob seine Würfe ausgewertet werden dürfen. */
export async function askConsent() {
  if (asking || !isEnabled() || consentOf() !== 'undecided') return;
  asking = true;
  try {
    const answer = await foundry.applications.api.DialogV2.confirm({
      window: { title: 'DSA5HELPERS.DiceStats.Title', icon: 'fas fa-dice-d20' },
      content: `<p><strong>${game.i18n.localize('DSA5HELPERS.DiceStats.Consent.Question')}</strong></p><p>${game.i18n.localize('DSA5HELPERS.DiceStats.Consent.Info')}</p><p class="hint">${game.i18n.localize('DSA5HELPERS.DiceStats.Consent.Change')}</p>`,
      yes: { label: 'DSA5HELPERS.DiceStats.Consent.Yes', icon: 'fas fa-check' },
      no: { label: 'DSA5HELPERS.DiceStats.Consent.No', icon: 'fas fa-xmark' },
      rejectClose: false,
    });
    // Schließen ohne Antwort (null) lässt die Frage offen; beim nächsten Verbinden wird erneut gefragt.
    if (answer === true || answer === false) await game.settings.set(MODULE_ID, 'diceStatsConsent', answer ? 'yes' : 'no');
  } finally {
    asking = false;
  }
}

// Nur schreiben, wenn sich etwas ändert; „undecided“ ohne Flag ist schon der richtige Stand.
async function mirrorConsent(value) {
  if ((game.user.getFlag(MODULE_ID, CONSENT_FLAG) ?? 'undecided') !== value) await game.user.setFlag(MODULE_ID, CONSENT_FLAG, value);
}

/** Im init-Hook aufrufen. */
export function registerDiceStatsSettings() {
  game.settings.register(MODULE_ID, 'diceStatsEnabled', {
    name: 'DSA5HELPERS.DiceStats.Settings.Enabled.Name', hint: 'DSA5HELPERS.DiceStats.Settings.Enabled.Hint',
    scope: 'world', config: true, restricted: true, type: Boolean, default: false,
    onChange: value => { if (value) askConsent(); Hooks.callAll('dsa5hDiceStatsChanged'); },
  });
  game.settings.register(MODULE_ID, 'diceStatsConsent', {
    name: 'DSA5HELPERS.DiceStats.Settings.Consent.Name', hint: 'DSA5HELPERS.DiceStats.Settings.Consent.Hint',
    scope: 'user', config: true, type: String, default: 'undecided',
    choices: { undecided: 'DSA5HELPERS.DiceStats.Settings.Consent.Undecided', yes: 'DSA5HELPERS.DiceStats.Settings.Consent.Yes', no: 'DSA5HELPERS.DiceStats.Settings.Consent.No' },
    onChange: async (value, _options, userId) => {
      if (userId && userId !== game.userId) return;
      // Bei Rückzug noch Gesammeltes verwerfen? Nein: bis zum Rückzug gewürfelte Werte gehören zur Statistik.
      if (value !== 'yes') await flush();
      await mirrorConsent(value);
    },
  });
  initRecorder(isRecording);
}

/** Im ready-Hook aufrufen. */
export async function readyDiceStats() {
  // Flag nachziehen, falls die Einstellung auf einem anderen Gerät geändert wurde.
  await mirrorConsent(consentOf());
  askConsent();
}
