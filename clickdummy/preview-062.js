// Abgenommene Designreferenz #50/#47. Ausschließlich Demo-Daten und lokale Eingaben,
// keine Berechnung, Speicherung oder Simulation der DSA-Regeln.
const PREVIEW_062 = { zones: 'bar', count: 3, faith: true };

function previewMeter(value, max, cls = '') {
  return el('span', { class: `preview-meter ${cls}`, style: `--fill:${max ? Math.max(0, Math.min(100, value / max * 100)) : 0}%` },
    el('span', { class: 'preview-meter-fill' }));
}

// Dialoge überleben Neuaufbau des Bogens; Fokusziel deshalb erst beim Schließen suchen.
function previewModalReturn(selector) {
  modalTriggerEl = { focus: () => [...document.querySelectorAll(selector)].find(node => node.getClientRects().length)?.focus({ preventScroll: true }) };
}

function previewPowerEditor(selectedName) {
  const rows = POWER_SOURCE_DEMO.slice(0, PREVIEW_062.count).map(source => {
    const input = el('input', { type: 'number', min: 0, max: source.max, value: source.value, 'aria-label': `${source.name}: AsP` });
    input.addEventListener('change', () => {
      source.value = Math.max(0, Math.min(source.max, Number(input.value) || 0));
      input.value = source.value;
      renderHeader(); renderContent();
    });
    return el('label', { class: 'preview-editor-row' }, [el('span', {}, source.name), input, el('span', {}, `/ ${source.max} AsP`)]);
  });
  const done = el('button', { type: 'button', class: 'preview-done' }, 'Schließen');
  done.addEventListener('click', () => {
    // Auch das gerade noch aktive Zahlenfeld vor dem Schließen übernehmen.
    rows.forEach((row, index) => {
      const source = POWER_SOURCE_DEMO[index];
      source.value = Math.max(0, Math.min(source.max, Number(row.querySelector('input').value) || 0));
    });
    renderHeader(); renderContent();
    closeModal();
    queueMicrotask(() => [...document.querySelectorAll('.preview-power-satellite')].find(node => node.getClientRects().length)?.focus({ preventScroll: true }));
  });
  openModal(el('div', { class: 'preview-editor' }, [el('h2', {}, 'Kraftspeicher'), el('p', { class: 'muted' }, 'Vorschau: Werte nur für diesen Click-Dummy ändern.'), ...rows, done]), { label: 'Kraftspeicher bearbeiten – Vorschau' });
  previewModalReturn('.preview-power-satellite');
  if (selectedName) [...document.querySelectorAll('.preview-editor-row')].find(row => row.textContent.includes(selectedName))?.querySelector('input')?.focus();
}

let previewRadial = null;
let previewRadialTimer = null;

function closePreviewRadial(restoreFocus = false) {
  clearTimeout(previewRadialTimer);
  if (!previewRadial) return;
  const { anchor, panel } = previewRadial;
  previewRadial = null;
  anchor.setAttribute('aria-expanded', 'false');
  anchor.classList.remove('preview-power-open');
  panel.remove();
  if (restoreFocus && anchor.isConnected) anchor.focus({ preventScroll: true });
}

function openPreviewRadial(anchor, page = 0, keyboard = false) {
  closePreviewRadial();
  const sources = POWER_SOURCE_DEMO.slice(0, PREVIEW_062.count);
  const pageSize = 5;
  const visible = sources.slice(page * pageSize, (page + 1) * pageSize);
  const pages = Math.ceil(sources.length / pageSize);
  const total = sources.reduce((sum, source) => sum + source.value, 0);
  const max = sources.reduce((sum, source) => sum + source.max, 0);
  const panel = el('div', { class: 'preview-radial', id: 'previewRadial', role: 'dialog', 'aria-label': 'Kraftspeicher auswählen', 'data-theme': document.querySelector('.sheet').dataset.theme });
  panel.style.setProperty('--fs-meta', getComputedStyle(anchor).fontSize);
  const ring = el('div', { class: 'preview-radial-ring' });
  const center = el('button', { type: 'button', class: 'preview-radial-center', style: `--fill:${max ? total / max * 100 : 0}%`, 'aria-label': 'Alle Kraftspeicher bearbeiten' }, [el('span', {}, 'Kraftspeicher'), el('strong', {}, `${total} / ${max}`), el('small', {}, 'AsP gesamt')]);
  center.addEventListener('click', () => { closePreviewRadial(); previewPowerEditor(); });
  ring.append(center);
  visible.forEach((source, i) => {
    const angle = (-90 + 360 * i / visible.length) * Math.PI / 180;
    const node = el('button', { type: 'button', class: 'preview-radial-source', style: `--x:${Math.cos(angle) * 99}px;--y:${Math.sin(angle) * 99}px;--fill:${source.max ? source.value / source.max * 100 : 0}%`, title: `${source.name}: ${source.value} / ${source.max} AsP`, 'aria-label': `${source.name}: ${source.value} von ${source.max} AsP. Bearbeiten` }, [el('span', {}, source.name), el('strong', {}, `${source.value} / ${source.max}`)]);
    node.addEventListener('click', () => { closePreviewRadial(); previewPowerEditor(source.name); });
    ring.append(node);
  });
  const close = el('button', { type: 'button', class: 'preview-radial-close', 'aria-label': 'Kraftspeicher schließen' }, '×');
  close.addEventListener('click', () => closePreviewRadial(true));
  ring.append(close);
  panel.append(ring);
  if (pages > 1) {
    const pager = el('div', { class: 'preview-radial-pager' });
    for (const [step, label] of [[-1, '‹'], [1, '›']]) {
      const button = el('button', { type: 'button', 'aria-label': step < 0 ? 'Vorherige Speicher' : 'Weitere Speicher' }, label);
      button.disabled = page + step < 0 || page + step >= pages;
      button.addEventListener('click', () => openPreviewRadial(anchor, page + step, true));
      pager.append(button);
      if (step === -1) pager.append(el('span', {}, `${page + 1} / ${pages} · ${sources.length} Speicher`));
    }
    panel.append(pager);
  }
  document.body.append(panel);
  const rect = anchor.getBoundingClientRect();
  // Mittelpunkt bleibt exakt auf der kleinen Kugel – kein versetztes Popup.
  panel.style.left = `${rect.left + rect.width / 2 - 150}px`;
  panel.style.top = `${rect.top + rect.height / 2 - 150}px`;
  anchor.classList.add('preview-power-open');
  anchor.setAttribute('aria-expanded', 'true');
  previewRadial = { anchor, panel };
  const schedule = () => { clearTimeout(previewRadialTimer); previewRadialTimer = setTimeout(() => { if (previewRadial?.panel === panel && !panel.contains(document.activeElement)) closePreviewRadial(); }, 300); };
  panel.addEventListener('pointerenter', () => clearTimeout(previewRadialTimer));
  panel.addEventListener('pointerleave', schedule);
  panel.addEventListener('focusout', () => setTimeout(() => { if (previewRadial?.panel === panel && !panel.contains(document.activeElement) && document.activeElement !== anchor) closePreviewRadial(); }, 0));
  if (keyboard) center.focus({ preventScroll: true });
}

function previewPower() {
  closePreviewRadial();
  if (DUMMY_V13 || ONLY_LEP || !PREVIEW_062.count) return null;
  const sources = POWER_SOURCE_DEMO.slice(0, PREVIEW_062.count);
  const value = sources.reduce((sum, source) => sum + source.value, 0);
  const max = sources.reduce((sum, source) => sum + source.max, 0);
  const button = el('button', { type: 'button', class: 'preview-power-satellite', style: `--fill:${max ? value / max * 100 : 0}%`, 'aria-label': `Kraftspeicher: ${value} von ${max} AsP, ${sources.length} Speicher. Radialübersicht öffnen`, 'aria-expanded': 'false', 'aria-haspopup': 'dialog', 'aria-controls': 'previewRadial' }, [el('small', {}, 'KS'), el('strong', {}, String(value))]);
  button.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch' && matchMedia('(hover: hover)').matches) openPreviewRadial(button); });
  button.addEventListener('pointerleave', () => { previewRadialTimer = setTimeout(() => { if (previewRadial && !previewRadial.panel.matches(':hover') && !previewRadial.panel.contains(document.activeElement)) closePreviewRadial(); }, 300); });
  button.addEventListener('click', () => openPreviewRadial(button, 0, true));
  button.addEventListener('keydown', event => { if (event.key === 'ArrowDown') { event.preventDefault(); openPreviewRadial(button, 0, true); } });
  return button;
}

function previewZone(cell, zone, label) {
  if (DUMMY_V13) return cell;
  if (PREVIEW_062.zones === 'off') return cell;
  const data = ENERGY_ZONE_DEMO[zone];
  const value = el('span', { class: 'preview-zone-value' }, `${data.value} / ${data.max}`);
  const button = el('button', { type: 'button', class: 'preview-zone-energy', title: `${label}: Zonen-LeP bearbeiten (Vorschau)`, 'aria-label': `${label}: ${data.value} von ${data.max} Zonen-LeP${data.failed ? ', ausgefallen' : ''}${data.resistPenalty ? ', Widerstands-Malus ' + data.resistPenalty : ''}. Bearbeiten` }, [
    el('span', { class: 'preview-zone-caption' }, 'LeP'), value,
    el('span', { class: 'preview-zone-status' }, [el('span', { class: 'preview-zone-penalty' }, data.resistPenalty ? `−${data.resistPenalty}` : ''), el('span', { class: 'preview-zone-failed', title: data.failed ? 'Zone ausgefallen' : '' }, data.failed ? '×' : '')]),
    previewMeter(data.value, data.max, 'zone-meter'),
  ]);
  button.addEventListener('click', () => {
    const input = el('input', { type: 'number', min: 0, max: data.max, value: data.value, 'aria-label': `${label}: Zonen-LeP` });
    const save = el('button', { type: 'button', class: 'preview-done' }, 'Demo-Wert übernehmen');
    save.addEventListener('click', () => { data.value = Math.max(0, Math.min(data.max, Number(input.value) || 0)); renderContent(); closeModal(); });
    openModal(el('div', { class: 'preview-editor' }, [el('h2', {}, `${label} · Zonen-LeP`), el('p', { class: 'muted' }, 'Nur Darstellungsvorschau. Rüstung und Zonen-LeP haben getrennte Bedienelemente.'), el('label', { class: 'preview-editor-row' }, [el('span', {}, 'Aktueller Wert'), input, el('span', {}, `/ ${data.max}`)]), save]), { label: `${label}: Zonen-LeP bearbeiten – Vorschau` });
    previewModalReturn(`.preview-zone.zone-${zone} .preview-zone-energy`);
  });
  return el('div', { class: `preview-zone zone-${zone} preview-zone-${PREVIEW_062.zones}${data.failed ? ' failed' : ''}` }, [cell, button]);
}

function initPreview062() {
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && previewRadial) { event.stopPropagation(); closePreviewRadial(true); } });
  document.addEventListener('pointerdown', event => { if (previewRadial && !previewRadial.panel.contains(event.target) && event.target !== previewRadial.anchor && !previewRadial.anchor.contains(event.target)) closePreviewRadial(); });
  window.addEventListener('resize', () => closePreviewRadial());
  renderHeader(); renderContent();
}
