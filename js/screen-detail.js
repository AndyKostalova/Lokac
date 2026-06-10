import { logoHTML, fmtDateTime } from './format.js';

export function openDetail(ctx, id) {
  const { store, STYLES } = ctx;
  const sheet = document.getElementById('sheet');
  const beer = ctx.allBeers().find(x => x.id === id);
  if (!beer) return;
  const br = ctx.brewById(beer.brewery) || { name: beer.brewery, color: '#888', ini: '?' };

  function draw() {
    const d = store.getBeer(id);
    const c = d.taps.length;
    sheet.innerHTML = `
      <div class="grip"></div>
      <div class="d-top">${logoHTML(br, 'logo')}<div><b>${esc(beer.name)}</b><small>${esc(br.name)}</small></div></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
        ${beer.style && STYLES[beer.style] ? `<span class="tag">${esc(STYLES[beer.style].label)}</span>` : ''}
        ${beer.abv ? `<span class="tag abv">${esc(beer.abv)}</span>` : ''}
        ${beer.af ? `<span class="tag naf">NEALKO</span>` : ''}
      </div>
      <button class="bigplus" id="dBigPlus">🍺 Dal jsem si +1</button>
      <div class="d-count">Měl jsem <b>${c}×</b></div>

      <div class="d-label">Hodnocení</div>
      <div class="d-stars" id="dStars">${[1, 2, 3, 4, 5].map(n => `<span data-n="${n}">${n <= d.rating ? '<b>★</b>' : '★'}</span>`).join('')}</div>

      <div class="d-label">Oblíbené</div>
      <button class="favbtn ${d.fav ? 'on' : ''}" id="dFav">${d.fav ? '❤ V oblíbených' : '♡ Přidat do oblíbených'}</button>

      <div class="d-label">Poznámka</div>
      <textarea id="dNote" placeholder="Napiš si poznámku…">${esc(d.note)}</textarea>

      <div class="d-label">Historie ťuknutí (${c})</div>
      <div class="hist">${c ? d.taps.map((t, i) => `<div class="h-item"><span>${esc(fmtDateTime(t))}</span><button data-i="${i}">smazat</button></div>`).join('') : '<div style="color:var(--dim);padding:6px 0">Zatím žádné — ťukni „Dal jsem si".</div>'}</div>

      ${beer.custom ? `<button class="btn danger" id="dDelBeer" style="margin-top:16px;width:100%">Smazat pivo</button>` : ''}
    `;

    sheet.querySelector('#dBigPlus').addEventListener('click', () => { store.addTap(id); draw(); });

    sheet.querySelector('#dStars').querySelectorAll('span').forEach(s => s.addEventListener('click', () => {
      store.setRating(id, Number(s.dataset.n)); draw();
    }));

    sheet.querySelector('#dFav').addEventListener('click', () => { store.toggleFav(id); draw(); });

    const note = sheet.querySelector('#dNote');
    note.addEventListener('input', () => { store.setNote(id, note.value); });

    sheet.querySelectorAll('.hist .h-item button').forEach(b => b.addEventListener('click', () => {
      store.removeTap(id, Number(b.dataset.i)); draw();
    }));

    const del = sheet.querySelector('#dDelBeer');
    if (del) del.addEventListener('click', () => {
      if (confirm('Opravdu smazat tohle pivo?')) { store.removeCustomBeer(id); ctx.closeSheet(); }
    });
  }

  draw();
  document.getElementById('sheetBg').classList.add('show');
  sheet.classList.add('show');
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}
