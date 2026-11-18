// Tooltips im Bogen (Issue #52, Umsetzung 2026-11-13) — Stellvertreter für die Karte des Systems.
// Im Modul ruft scripts/sheets/item-tooltips.js beim Überfahren eines Namens den GlobalToolTipHandler von DSA5 auf;
// die Karte (Kopf, Bild, Kernwerte, Effekttext aus dem Inhaltsmodul) kommt vom System. Der Dummy zeigt dieselbe Form
// mit Platzhaltertext (keine Regeltexte): Höhe begrenzt auf 60 % der Fensterhöhe, darunter der Hinweis bei
// abgeschnittenem Text; Mittelklick heftet an (dann scrollbar, Rechtsklick schließt). Schalter „Tooltips“ im Menü
// (Ansicht) entspricht der Benutzer-Einstellung unter „Darstellung und Geräte“. Nur Desktop: die Mobil-Dummys haben
// keine Tooltips.
(function () {
  const TARGETS = ".name, .fav-card-name, .weapon-name, .armor-name, .suggest-name, .cs-name, .hand-name, .armor-crest-name, .chip, .group-chip";
  const SHORT = "Platzhalter für den Effekttext aus dem Inhaltsmodul. In Foundry steht hier die Beschreibung des Systems.";
  const LONG = Array.from({ length: 14 }, (_, i) => `Absatz ${i + 1}: ${SHORT}`);
  let enabled = false; // Standard aus (Opt-in je Spieler), Schalter unten
  let tip = null;
  let anchor = null;

  const style = document.createElement("style");
  style.textContent = `
.dummy-tt { position: fixed; z-index: 9000; width: min(320px, 100vw - 16px); color: #e1d3c6; font: 13px/1.4 'GentiumBasic', Georgia, serif; pointer-events: none; box-shadow: 0 10px 28px rgba(0,0,0,.6); border: 1px solid #8a7058; border-radius: 4px; background: linear-gradient(180deg, #241d18 0%, #16110d 100%); }
.dummy-tt-body { max-height: 60vh; overflow: hidden; }
.dummy-tt.locked { pointer-events: auto; }
.dummy-tt.locked .dummy-tt-body { overflow-y: auto; }
.dummy-tt.locked .dummy-tt-more { display: none; }
.dummy-tt header { display: flex; gap: 8px; align-items: center; padding: 6px 10px; background: linear-gradient(180deg, #eadfce 0%, #d8c5ae 100%); color: #6a1212; font-weight: bold; }
.dummy-tt header img { width: 32px; height: 32px; }
.dummy-tt .dummy-tt-stats { display: flex; gap: 6px; padding: 6px 10px 0; flex-wrap: wrap; }
.dummy-tt .dummy-tt-stats span { padding: 1px 6px; border: 1px solid rgba(188,136,111,.42); border-radius: 8px; background: rgba(225,211,198,.06); font-size: 12px; }
.dummy-tt p { margin: 6px 10px; }
.dummy-tt-details { margin: 6px 10px 0; padding-top: 6px; border-top: 1px solid #8a7058; }
.dummy-tt-details h2 { margin: 4px 0 2px; font-size: 12px; letter-spacing: .06em; text-transform: uppercase; }
.dummy-tt-details p { margin: 0 0 4px; }
.dummy-tt-more { margin: 0; padding: 3px 8px; border-top: 1px solid #8a7058; background: #16110d; font-size: 12px; font-style: italic; text-align: center; }`;
  document.head.append(style);

  function hide() {
    if (tip && !tip.classList.contains("locked")) tip.remove();
    tip = null;
    anchor = null;
  }

  function show(target) {
    hide();
    const row = target.closest(".list-row, .row, .fav-card, .chip, .hand-card, .armor-crest-group") || target;
    const name = (target.textContent || "").replace(/[★☆✕×ⓘ]/g, "").trim().split("\n")[0].slice(0, 60) || "Eintrag";
    const img = row.querySelector("img")?.getAttribute("src");
    // Sonderfertigkeiten (Chips) zeigen den langen Fall: Text abgeschnitten, Hinweis darunter.
    const long = target.classList.contains("chip");
    tip = document.createElement("div");
    tip.className = "dummy-tt";
    tip.setAttribute("role", "tooltip");
    const body = document.createElement("div");
    body.className = "dummy-tt-body";
    body.innerHTML = `<header>${img ? `<img src="${img}" alt="">` : ""}<span></span></header><div class="dummy-tt-stats"><span>Wert</span><span>Probe</span><span>Kosten</span></div>`;
    body.querySelector("header span").textContent = name;
    for (const text of long ? LONG : [SHORT]) {
      const p = document.createElement("p");
      p.textContent = text;
      body.append(p);
    }
    // Talente, Sonderfertigkeiten, Vor- und Nachteile: Regel und Beschreibung des Eintrags unter der Karte (Platzhalter).
    if (!target.matches(".weapon-name, .armor-name, .hand-name, .armor-crest-name, .group-chip")) {
      const details = document.createElement("div");
      details.className = "dummy-tt-details";
      details.innerHTML = "<h2>Regel</h2><p></p><h2>Beschreibung</h2><p></p>";
      details.querySelectorAll("p").forEach((p) => { p.textContent = "Platzhalter für den Text aus den Daten des Eintrags."; });
      body.append(details);
    }
    tip.append(body);
    document.body.append(tip);
    if (body.scrollHeight > body.clientHeight + 2) {
      const more = document.createElement("p");
      more.className = "dummy-tt-more";
      more.textContent = "Weiterer Text: Mittelklick heftet an, Klick öffnet alles";
      tip.append(more);
    }
    // Wie im Modul: neben das Bogenfenster auf die Seite mit mehr Platz, senkrecht auf Höhe des Namens; passt sie
    // daneben nicht hin, unter (oder über) die Zeile wie Foundrys eigene Platzierung.
    const r = row.getBoundingClientRect();
    // Fensterfläche = Bogen + Rail (die .sheet-wrap ist breiter als das Fenster).
    const parts = [document.querySelector(".sheet"), document.getElementById("rail")].filter(Boolean).map((e) => e.getBoundingClientRect());
    const box = { left: Math.min(...parts.map((b) => b.left)), right: Math.max(...parts.map((b) => b.right)) };
    const roomRight = innerWidth - box.right - 5;
    const minLeft = document.body.getBoundingClientRect().left; // angedocktes Menü (pages.js) schiebt die Seite
    const roomLeft = box.left - minLeft - 5;
    if (Math.max(roomRight, roomLeft) >= tip.offsetWidth + 5) {
      tip.style.top = `${Math.min(Math.max(5, r.top + r.height / 2 - tip.offsetHeight / 2), innerHeight - tip.offsetHeight - 5)}px`;
      tip.style.left = roomRight >= roomLeft ? `${box.right + 5}px` : `${box.left - tip.offsetWidth - 5}px`;
    } else {
      const below = innerHeight - r.bottom >= r.top;
      tip.style.top = below ? `${r.bottom + 5}px` : `${Math.max(5, r.top - tip.offsetHeight - 5)}px`;
      tip.style.left = `${Math.min(Math.max(minLeft + 5, r.left), innerWidth - tip.offsetWidth - 5)}px`;
    }
    anchor = target;
  }

  document.addEventListener("pointerover", (event) => {
    if (!enabled || event.pointerType === "touch") return;
    const target = event.target.closest?.(TARGETS);
    if (!target || !target.closest(".sheet") || target === anchor) return;
    if (event.target.closest("button:not(.fav-card-name)") && !event.target.closest(".fav-card-name")) return; // Würfel, Stern, ✕
    show(target);
  });
  document.addEventListener("pointerout", (event) => {
    if (anchor && !anchor.contains(event.relatedTarget)) hide();
  });
  document.addEventListener("auxclick", (event) => {
    if (event.button !== 1 || !tip) return;
    event.preventDefault();
    tip.classList.add("locked");
    tip = null;
    anchor = null;
  });
  document.addEventListener("contextmenu", (event) => {
    const locked = event.target.closest(".dummy-tt.locked");
    if (!locked) return;
    event.preventDefault();
    locked.remove();
  });
  document.addEventListener("click", () => hide(), true);

  // Schalter „Tooltips“ (Menü › Ansicht): Benutzer-Einstellung an/aus.
  const toggle = document.getElementById("tooltipToggle");
  const syncToggle = () => {
    toggle.setAttribute("aria-pressed", String(!enabled));
    toggle.textContent = enabled ? "Tooltips aus (Benutzer)" : "Tooltips an (Benutzer)";
  };
  if (toggle) syncToggle();
  toggle?.addEventListener("click", () => {
    enabled = !enabled;
    syncToggle();
    hide();
  });
})();
