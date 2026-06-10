import { computeStats } from './stats.js';
import { logoHTML, starStr } from './format.js';

export function renderStats(ctx, body) {
  const { store, STYLES, DAYS, DAY_LBL } = ctx;
  const beers = ctx.allBeers();
  const s = computeStats(beers, store.getAllBeers(), DAYS);
  const pct = s.total ? s.tasted / s.total : 0;
  const R = 72, C = 2 * Math.PI * R, off = C * (1 - pct);

  const real = beers.filter(b => !b.tap);
  const rated = real
    .filter(b => store.getBeer(b.id).rating > 0)
    .sort((a, b) => store.getBeer(b.id).rating - store.getBeer(a.id).rating
      || store.getBeer(b.id).taps.length - store.getBeer(a.id).taps.length)
    .slice(0, 5);
  const most = real
    .filter(b => store.getBeer(b.id).taps.length > 0)
    .sort((a, b) => store.getBeer(b.id).taps.length - store.getBeer(a.id).taps.length)
    .slice(0, 5);

  const styleKeys = Object.keys(STYLES);
  const maxStyle = Math.max(1, ...styleKeys.map(k => s.styleCounts[k] || 0));
  const maxDay = Math.max(1, ...DAYS.map(d => s.dayCounts[d]));

  body.innerHTML = `<h2 class="scr-title">📊 Statistiky</h2>
    <div class="ring-wrap"><div class="ring">
      <svg width="170" height="170"><circle cx="85" cy="85" r="${R}" stroke="var(--border)" stroke-width="14" fill="none"/>
        <circle cx="85" cy="85" r="${R}" stroke="var(--gold)" stroke-width="14" fill="none" stroke-linecap="round"
          stroke-dasharray="${C}" stroke-dashoffset="${off}"/></svg>
      <div class="mid"><b>${s.tasted}</b><small>z ${s.total} piv</small><em>zbývá ${s.total - s.tasted}</em></div>
    </div></div>
    <div class="statcards">
      <div class="sc"><b>${s.totalDrinks}</b><small>celkem vypito</small></div>
      <div class="sc"><b>${s.brewsTasted}</b><small>pivovarů ochutnáno</small></div>
    </div>

    <div class="panel"><h3>⭐ Nejlépe hodnocená</h3>
      ${rated.length ? rated.map((b, i) => rankRow(ctx, i, b, starStr(store.getBeer(b.id).rating), false)).join('') : empty()}</div>

    <div class="panel"><h3>🔁 Nejčastěji pitá</h3>
      ${most.length ? most.map((b, i) => rankRow(ctx, i, b, '×' + store.getBeer(b.id).taps.length, true)).join('') : empty()}</div>

    <div class="panel"><h3>🍺 Rozložení podle stylu</h3>
      ${styleKeys.map(k => `<div class="barrow"><span class="lbl">${esc(STYLES[k].label)}</span>
        <span class="track"><i style="width:${(s.styleCounts[k] || 0) / maxStyle * 100}%;background:${STYLES[k].color}"></i></span>
        <span class="num">${s.styleCounts[k] || 0}</span></div>`).join('')}</div>

    <div class="panel"><h3>📅 Po dnech festivalu</h3>
      <div class="days">${DAYS.map((d, i) => `<div class="day">
        <div class="dv">${s.dayCounts[d]}</div>
        <div class="col" style="height:${s.dayCounts[d] / maxDay * 100}%"></div>
        <div class="dl">${esc(DAY_LBL[i])}</div></div>`).join('')}</div></div>`;
}

function rankRow(ctx, i, b, val, rock) {
  const br = ctx.brewById(b.brewery) || { name: b.brewery, color: '#888', ini: '?' };
  return `<div class="rank"><span class="n">${i + 1}.</span>${logoHTML(br)}
    <div class="nm">${esc(b.name)}<small>${esc(br.name)}</small></div>
    <span class="v ${rock ? 'rk' : ''}">${val}</span></div>`;
}
function empty() {
  return '<div style="color:var(--dim);font-size:12.5px;padding:6px 0">Zatím nic — ochutnej a ohodnoť nějaké pivo.</div>';
}
function esc(s) {
  return String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}
