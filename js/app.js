import { BREWERIES, BEERS, STYLES, REALCOUNT, DAYS, DAY_LBL } from './data.js';
import { createStore } from './store.js';
import { renderList } from './screen-list.js';
import { renderStats } from './screen-stats.js';
import { renderAch } from './screen-ach.js';
import { renderSettings } from './screen-settings.js';
import { openDetail } from './screen-detail.js';
import { renderWheel } from './screen-wheel.js';

const store = createStore();

function allBeers() { return [...BEERS, ...store.getCustomBeers()]; }
function brewById(id) { return BREWERIES.find(b => b.id === id); }
function brewName(id) { const b = brewById(id); return b ? b.name : id; }

const body = document.getElementById('body');
let curScr = 'list';

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  document.getElementById('themeBtn').textContent = t === 'dark' ? '🌙' : '☀️';
  document.querySelector('meta[name="theme-color"]').setAttribute('content', t === 'dark' ? '#0e0e12' : '#f3ead8');
}
function toggleTheme() {
  const t = store.getTheme() === 'dark' ? 'light' : 'dark';
  store.setTheme(t); applyTheme(t); if (curScr === 'set') rerender();
}
function rerender() { show(curScr); }
function closeSheet() {
  document.getElementById('sheetBg').classList.remove('show');
  document.getElementById('sheet').classList.remove('show');
  rerender();
}

export const ctx = {
  store, BREWERIES, STYLES, REALCOUNT, DAYS, DAY_LBL,
  allBeers, brewById, brewName,
  filter: { q: '', taste: 'all', brewery: 'all', style: 'all' },
  openBrews: new Set([BREWERIES[0].id]),
  rerender, closeSheet, toggleTheme,
  openDetail: (id) => openDetail(ctx, id),
};

function show(scr) {
  curScr = scr;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.scr === scr));
  document.getElementById('fab').style.display = scr === 'list' ? 'flex' : 'none';
  if (scr === 'list') renderList(ctx, body);
  else if (scr === 'wheel') renderWheel(ctx, body);
  else if (scr === 'stats') renderStats(ctx, body);
  else if (scr === 'ach') renderAch(ctx, body);
  else renderSettings(ctx, body);
}

document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => show(t.dataset.scr)));
document.getElementById('themeBtn').addEventListener('click', toggleTheme);
document.getElementById('sheetBg').addEventListener('click', closeSheet);
document.getElementById('fab').addEventListener('click', () => { curScr = 'set'; renderSettings(ctx, body, { openAddForm: true }); document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.scr === 'set')); document.getElementById('fab').style.display = 'none'; });

applyTheme(store.getTheme());
show('list');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
