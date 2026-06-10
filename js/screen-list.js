import { beerMatches } from './filters.js';
import { logoHTML, starStr } from './format.js';

export function renderList(ctx, body) {
  const { store, BREWERIES, STYLES, filter } = ctx;
  const filtering = filter.q || filter.taste !== 'all' || filter.style !== 'all' || filter.brewery !== 'all';
  const beers = ctx.allBeers();
  let visibleBeers = 0;
  let secHTML = '';

  const brewList = filter.brewery === 'all' ? BREWERIES : BREWERIES.filter(b => b.id === filter.brewery);
  brewList.forEach(br => {
    const all = beers.filter(b => b.brewery === br.id);
    const real = all.filter(b => !b.tap);
    const shown = all.filter(b => beerMatches(b, store.getBeer(b.id), filter, ctx.brewName));
    if (!shown.length) return;
    visibleBeers += shown.filter(b => !b.tap).length;
    const tasted = real.filter(b => store.getBeer(b.id).taps.length > 0).length;
    const pct = real.length ? Math.round(tasted / real.length * 100) : 0;
    const open = ctx.openBrews.has(br.id) || filtering;
    secHTML += `<div class="brew ${open ? 'open' : ''}" data-brew="${br.id}">
      <div class="brew-head" data-brew="${br.id}" style="--accent:${br.color}">
        ${logoHTML(br)}
        <div class="bn"><b>${esc(br.name)}</b><small>${real.length} piv</small></div>
        <div class="prog"><div class="bar"><i style="width:${pct}%"></i></div><small>${tasted}/${real.length}</small></div>
        <span class="caret">▶</span>
      </div>
      <div class="beers">${shown.map(b => beerRow(b, ctx)).join('')}</div>
    </div>`;
  });
  if (!secHTML) secHTML = `<div style="text-align:center;color:var(--dim);padding:40px 0">Nic nenalezeno 🤷</div>`;

  body.innerHTML = `
    <div class="search">
      <span class="ic">🔎</span>
      <input id="q" placeholder="Hledat pivo nebo pivovar…" value="${esc(filter.q)}">
    </div>
    <div class="seg">
      ${seg(filter, 'all', 'Vše')}${seg(filter, 'untasted', 'Neochutnáno')}${seg(filter, 'tasted', 'Ochutnáno')}${seg(filter, 'fav', '❤️ Oblíbené')}
    </div>
    <div class="selrow">
      <select id="fbrew">${optBrew(BREWERIES, filter)}</select>
      <select id="fstyle">${optStyle(STYLES, filter)}</select>
    </div>
    <div class="count"><span>${visibleBeers} piv${filtering ? ' • filtrováno' : ''}</span>${filtering ? '<a id="clearFilter">✕ zrušit filtry</a>' : ''}</div>
    ${secHTML}`;

  // search input — preserve focus + cursor across rerender
  const q = body.querySelector('#q');
  q.addEventListener('input', e => {
    filter.q = e.target.value;
    const pos = e.target.selectionStart;
    renderList(ctx, body);
    const i = body.querySelector('#q');
    i.focus();
    i.setSelectionRange(pos, pos);
  });

  body.querySelector('#fbrew').addEventListener('change', e => { filter.brewery = e.target.value; renderList(ctx, body); });
  body.querySelector('#fstyle').addEventListener('change', e => { filter.style = e.target.value; renderList(ctx, body); });

  body.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => { filter.taste = c.dataset.taste; renderList(ctx, body); }));

  const clear = body.querySelector('#clearFilter');
  if (clear) clear.addEventListener('click', () => {
    filter.q = ''; filter.taste = 'all'; filter.brewery = 'all'; filter.style = 'all';
    renderList(ctx, body);
  });

  body.querySelectorAll('.brew-head').forEach(h => h.addEventListener('click', () => {
    const id = h.dataset.brew;
    if (ctx.openBrews.has(id)) ctx.openBrews.delete(id); else ctx.openBrews.add(id);
    renderList(ctx, body);
  }));

  body.querySelectorAll('.beer .info').forEach(el => el.addEventListener('click', () => ctx.openDetail(el.dataset.id)));

  body.querySelectorAll('.plus').forEach(btn => btn.addEventListener('click', e => {
    e.stopPropagation();
    const id = btn.dataset.id;
    const foam = btn.querySelector('.foam');
    if (foam) { foam.innerHTML = '<i></i>'; setTimeout(() => { foam.innerHTML = ''; }, 500); }
    store.addTap(id);
    renderList(ctx, body);
  }));
}

function seg(filter, v, l) {
  return `<button class="chip ${filter.taste === v ? 'active' : ''}" data-taste="${v}">${l}</button>`;
}
function optBrew(BREWERIES, filter) {
  let o = `<option value="all">Všechny pivovary</option>`;
  BREWERIES.forEach(b => o += `<option value="${b.id}" ${filter.brewery === b.id ? 'selected' : ''}>${esc(b.name)}</option>`);
  return o;
}
function optStyle(STYLES, filter) {
  let o = `<option value="all">Všechny styly</option>`;
  Object.keys(STYLES).forEach(k => o += `<option value="${k}" ${filter.style === k ? 'selected' : ''}>${esc(STYLES[k].label)}</option>`);
  return o;
}
function beerRow(b, ctx) {
  const { STYLES, store } = ctx;
  if (b.tap) return `<div class="tapdle">🔄 <span>${esc(b.name)} — přidej si, co sis dal</span></div>`;
  const d = store.getBeer(b.id);
  const c = d.taps.length;
  return `<div class="beer">
    <div class="info" data-id="${b.id}">
      <b>${esc(b.name)}</b>
      <div class="meta">
        ${b.style && STYLES[b.style] ? `<span class="tag">${esc(STYLES[b.style].label)}</span>` : ''}
        ${b.abv ? `<span class="tag abv">${esc(b.abv)}</span>` : ''}
        ${b.af ? `<span class="tag naf">NEALKO</span>` : ''}
        ${d.rating ? `<span class="stars-mini">${starStr(d.rating)}</span>` : ''}
        ${d.fav ? `<span class="heart">❤</span>` : ''}
        ${c ? `<span class="cnt">×${c}</span>` : ''}
      </div>
    </div>
    <button class="plus" data-id="${b.id}">+1<span class="foam"></span></button>
  </div>`;
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}
