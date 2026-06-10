import { wheelPool, pickRandom } from './wheel.js';
import { logoHTML } from './format.js';

// Stav obrazovky (drží se mezi překresleními v rámci session).
let mode = 'untasted';      // 'untasted' | 'all'
let lastResult = null;      // id naposledy vylosovaného piva
let spinning = false;

function esc(s) {
  return String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}

export function renderWheel(ctx, body) {
  const { store, STYLES } = ctx;
  const pool = wheelPool(ctx.allBeers(), store.getAllBeers(), mode);
  const emptyUntasted = (mode === 'untasted' && pool.length === 0);
  const resultBeer = lastResult ? ctx.allBeers().find(b => b.id === lastResult) : null;

  body.innerHTML = `<h2 class="scr-title">🎰 Kolo štěstí</h2>
    <div class="seg wheel-modes">
      <button class="chip ${mode === 'untasted' ? 'active' : ''}" data-mode="untasted">Neochutnaná piva</button>
      <button class="chip ${mode === 'all' ? 'active' : ''}" data-mode="all">Všechna piva</button>
    </div>
    ${emptyUntasted ? emptyHTML() : slotHTML(ctx, resultBeer)}`;

  body.querySelectorAll('.wheel-modes .chip').forEach(c => c.addEventListener('click', () => {
    if (spinning) return;
    mode = c.dataset.mode;
    lastResult = null;
    renderWheel(ctx, body);
  }));

  if (emptyUntasted) {
    const sw = body.querySelector('#switchAll');
    if (sw) sw.addEventListener('click', () => { mode = 'all'; lastResult = null; renderWheel(ctx, body); });
    return;
  }

  const spinBtn = body.querySelector('#spinBtn');
  if (spinBtn) spinBtn.addEventListener('click', () => { if (!spinning) spin(ctx, body); });

  if (resultBeer) {
    const tap = body.querySelector('#wTap');
    if (tap) tap.addEventListener('click', () => { store.addTap(resultBeer.id); renderWheel(ctx, body); });
    const det = body.querySelector('#wDetail');
    if (det) det.addEventListener('click', () => ctx.openDetail(resultBeer.id));
  }
}

function slotHTML(ctx, resultBeer) {
  const inner = resultBeer ? resultCardHTML(ctx, resultBeer) : `<div class="reel" id="reel">Roztoč a uvidíš…</div>`;
  const btnLabel = resultBeer ? '🎰 Točit znovu' : '🎰 Roztočit';
  return `
    <div class="slot">
      <div class="slot-lights">${'<i></i>'.repeat(7)}</div>
      <div class="slot-window">${inner}</div>
      <div class="slot-lights">${'<i></i>'.repeat(7)}</div>
    </div>
    <button class="spin-btn" id="spinBtn">${btnLabel}</button>
    ${resultBeer ? resultActionsHTML() : '<div class="wheel-hint">Co ti osud nadělí? 🍺</div>'}`;
}

function resultCardHTML(ctx, beer) {
  const br = ctx.brewById(beer.brewery) || { name: beer.brewery, color: '#888', ini: '?' };
  const STYLES = ctx.STYLES;
  return `<div class="wheel-result">
    ${logoHTML(br, 'logo')}
    <div class="wr-name">${esc(beer.name)}</div>
    <div class="wr-brew">${esc(br.name)}</div>
    <div class="wr-tags">
      ${beer.style && STYLES[beer.style] ? `<span class="tag">${esc(STYLES[beer.style].label)}</span>` : ''}
      ${beer.abv ? `<span class="tag abv">${esc(beer.abv)}</span>` : ''}
      ${beer.af ? `<span class="tag naf">NEALKO</span>` : ''}
    </div>
  </div>`;
}

function resultActionsHTML() {
  return `<div class="wheel-actions">
    <button class="btn gold" id="wTap">🍺 Dal jsem si</button>
    <button class="btn" id="wDetail">Detail piva</button>
  </div>`;
}

function emptyHTML() {
  return `<div class="wheel-empty">
    <div class="we-emoji">🏆</div>
    <div class="we-title">Všechno ochutnáno!</div>
    <div class="we-sub">Není už co losovat z neochutnaných piv.</div>
    <button class="btn gold" id="switchAll">Losovat ze všech piv</button>
  </div>`;
}

function spin(ctx, body) {
  const pool = wheelPool(ctx.allBeers(), ctx.store.getAllBeers(), mode);
  if (!pool.length) return;
  const finalBeer = pickRandom(pool);
  spinning = true;

  const win = body.querySelector('.slot-window');
  const slot = body.querySelector('.slot');
  const btn = body.querySelector('#spinBtn');
  if (slot) slot.classList.add('spinning');
  if (btn) btn.disabled = true;
  if (win) win.innerHTML = `<div class="reel rolling" id="reel"></div>`;

  let i = 0;
  const steps = 20;
  function step() {
    const reel = body.querySelector('#reel');
    if (!reel) { spinning = false; return; } // odešel z obrazovky — zruš
    if (i >= steps) {
      spinning = false;
      ctx.store.incSpin();
      ctx.store.addWheelPick(finalBeer.id);
      lastResult = finalBeer.id;
      renderWheel(ctx, body);
      return;
    }
    reel.textContent = pool[Math.floor(Math.random() * pool.length)].name;
    i++;
    setTimeout(step, 40 + i * i * 0.5); // rostoucí prodleva = zpomalování (~2,2 s celkem)
  }
  step();
}
