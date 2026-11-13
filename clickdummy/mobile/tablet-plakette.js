/* Fensterknöpfe der Bögen auf dem Tablet (Issue #76, Variante „Größer“, Nutzerentscheidung 2026-11-13) — nur Click-Dummy.
   Nachbau der Plakette, die Foundry auf dem Tablet oben rechts am Bogenfenster zeigt: Spieleransicht, Sperre, Thema,
   Bogen wechseln | ⋮, ✕, je 40 × 36 px mit Symbol 18 px (am Desktop 22 × 20 px). Modul: styles/dsa5-helpers-mobile.css
   Abschnitt 11, „Tablet: Fensterknöpfe in der Plakette fingergroß“.
   Eingebunden von heldenbogen.html, nsc-kreatur.html und gruppe.html; die Seite rendert per innerHTML neu, darum
   hängt ein MutationObserver die Plakette nach jedem Rendern wieder in den Tablet-Inhalt (main). */
(() => {
  const css = `
.tp-plakette { position: absolute; top: 8px; right: 8px; z-index: 6; display: flex; align-items: center; gap: 2px; height: 40px; padding: 0 4px; border: 1px solid #dcc6b8; border-radius: 4px; background: linear-gradient(180deg, #3a322b, #2c2622); box-shadow: 0 0 0 1.5px #4a372b, 0 2px 4px rgba(0, 0, 0, .5); }
.tp-plakette button { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 36px; padding: 0; border: 0; border-radius: 4px; background: none; color: rgba(244, 232, 214, .9); font-size: 18px; line-height: 1; text-shadow: 0 1px 1px rgba(0, 0, 0, .6); cursor: pointer; }
.tp-plakette button:active { background: rgba(224, 192, 128, .22); }
.tp-plakette svg { width: 1em; height: 1em; fill: currentColor; }
.tp-plakette .tp-sep { margin-left: 3px; background: linear-gradient(rgba(220, 198, 184, .35), rgba(220, 198, 184, .35)) no-repeat 0 50% / 1px 24px; }
.tp-toast { position: absolute; left: 50%; top: 64px; z-index: 11; max-width: 90%; padding: 8px 14px; border-radius: 18px; background: rgba(27, 23, 20, .92); color: #f4e8d6; font-size: 14px; transform: translateX(-50%); pointer-events: none; }
.device.tablet > main { position: relative; }`;
  document.head.append(Object.assign(document.createElement('style'), { textContent: css }));

  const LOCK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 7V5a4 4 0 0 1 8 0v2h1v8H3V7zm2 0h4V5a2 2 0 0 0-4 0z"/></svg>';
  const MODES = ['Spielen', 'Steigern', 'Bearbeiten'];
  const state = { mode: 0, dark: false };

  const btn = (act, title, label, extra = '') => `<button type="button" data-tp="${act}" title="${title}" aria-label="${title}" ${extra}>${label}</button>`;
  const html = () => btn('view', 'Spieleransicht', '◐') + btn('lock', `Modus: ${MODES[state.mode]} – wechseln`, LOCK)
    + btn('theme', state.dark ? 'Helles Thema' : 'Dunkles Thema', '☾') + btn('switch', 'Bogen wechseln', '⇄')
    + btn('menu', 'Fenstermenü', '⋮', 'class="tp-sep"') + btn('close', 'Schließen', '✕');

  function toast(device, text) {
    device.querySelector('.tp-toast')?.remove();
    const t = Object.assign(document.createElement('div'), { className: 'tp-toast', textContent: text });
    device.append(t);
    setTimeout(() => t.remove(), 1800);
  }

  const TEXT = {
    view: 'Spieleransicht umgeschaltet',
    switch: 'Liste der Heldenbögen geöffnet',
    menu: 'Fenstermenü: Bogen konfigurieren, Token bearbeiten …',
    close: 'Bogen geschlossen (im Dummy ohne Wirkung)'
  };

  function mount() {
    const main = document.querySelector('.device.tablet > main');
    if (!main || main.querySelector(':scope > .tp-plakette')) return;
    const box = document.createElement('div');
    box.className = 'tp-plakette';
    box.innerHTML = html();
    // Eigener Klick-Handler mit stopPropagation: die Seiten werten jeden Knopf im Dokument aus.
    box.addEventListener('click', ev => {
      const b = ev.target.closest('button[data-tp]');
      if (!b) return;
      ev.stopPropagation();
      const act = b.dataset.tp;
      const device = box.closest('.device');
      if (act === 'lock') state.mode = (state.mode + 1) % MODES.length;
      if (act === 'theme') state.dark = !state.dark;
      box.innerHTML = html();
      toast(device, act === 'lock' ? `Modus: ${MODES[state.mode]}` : act === 'theme' ? (state.dark ? 'Dunkles Thema' : 'Helles Thema') : TEXT[act]);
    });
    main.append(box);
  }

  new MutationObserver(mount).observe(document.getElementById('stage'), { childList: true });
  mount();
})();
