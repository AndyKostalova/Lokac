import { BREWERIES, STYLES } from './data.js';

export function renderSettings(ctx, body, opts = {}) {
  body.innerHTML = `<h2 class="scr-title">⚙️ Nastavení</h2>
    <div class="setrow"><div class="l"><b>Tmavý režim</b><small>Šetří baterku, lepší na večer</small></div>
      <div class="switch" id="swTheme"><i></i></div></div>
    <div class="setrow"><div class="l"><b>Exportovat zálohu</b><small>Ulož svá data do souboru</small></div>
      <button class="btn gold" id="btnExport">Export</button></div>
    <div class="setrow"><div class="l"><b>Obnovit ze zálohy</b><small>Načti dříve uložený soubor</small></div>
      <button class="btn" id="btnImport">Obnovit</button>
      <input type="file" id="fileImport" accept="application/json" hidden></div>
    <div class="setrow"><div class="l"><b>Přidat vlastní pivo</b><small>Pro rotující výčepy a překvapení na place</small></div>
      <button class="btn" id="btnAdd">Přidat</button></div>
    <div id="addForm" style="display:${opts.openAddForm ? 'block' : 'none'}"></div>
    <div class="setrow"><div class="l"><b>Reset dat</b><small>Smaže všechna tvá hodnocení a záznamy</small></div>
      <button class="btn danger" id="btnReset">Reset</button></div>
    <div style="text-align:center;color:var(--dim);font-size:11px;margin-top:18px">Lokáč · Pivní deník RFP 2026</div>`;

  document.getElementById('swTheme').addEventListener('click', () => { ctx.toggleTheme(); ctx.rerender(); });

  document.getElementById('btnExport').addEventListener('click', () => {
    const blob = new Blob([ctx.store.exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `lokac-zaloha-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(a.href);
  });

  const file = document.getElementById('fileImport');
  document.getElementById('btnImport').addEventListener('click', () => file.click());
  file.addEventListener('change', () => {
    const f = file.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      if (confirm('Obnovit data ze zálohy? Přepíše současná data.')) {
        try { ctx.store.importJSON(r.result); ctx.rerender(); alert('Hotovo ✓'); }
        catch { alert('Soubor se nepodařilo načíst.'); }
      }
    };
    r.readAsText(f);
  });

  document.getElementById('btnReset').addEventListener('click', () => {
    if (confirm('Opravdu smazat všechna tvá data? Tohle nejde vrátit.')) {
      ctx.store.reset(); ctx.rerender();
    }
  });

  const addForm = document.getElementById('addForm');
  document.getElementById('btnAdd').addEventListener('click', () => {
    addForm.style.display = addForm.style.display === 'none' ? 'block' : 'none';
    if (addForm.innerHTML === '') drawAddForm();
  });
  if (opts.openAddForm) drawAddForm();

  function drawAddForm() {
    addForm.innerHTML = `<div class="panel">
      <input id="nbName" class="fld" placeholder="Název piva">
      <select id="nbBrew" class="fld">${BREWERIES.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}</select>
      <select id="nbStyle" class="fld">${Object.keys(STYLES).map(k => `<option value="${k}">${STYLES[k].label}</option>`).join('')}</select>
      <input id="nbAbv" class="fld" placeholder="Stupně/ABV (nepovinné), např. 12°">
      <label style="display:flex;gap:8px;align-items:center;margin:8px 0"><input type="checkbox" id="nbAf"> Nealko</label>
      <button class="btn gold" id="nbSave">Uložit pivo</button></div>`;
    document.getElementById('nbSave').addEventListener('click', () => {
      const name = document.getElementById('nbName').value.trim();
      if (!name) { alert('Zadej název piva.'); return; }
      ctx.store.addCustomBeer({
        brewery: document.getElementById('nbBrew').value,
        name, style: document.getElementById('nbStyle').value,
        abv: document.getElementById('nbAbv').value.trim(),
        af: document.getElementById('nbAf').checked,
      });
      alert('Pivo přidáno ✓'); ctx.rerender();
    });
  }
}
