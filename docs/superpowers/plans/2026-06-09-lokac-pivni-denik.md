# Lokáč — Pivní deník RFP 2026 — Implementační plán

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Postavit soukromou, plně offline PWA „Lokáč" pro sledování, hodnocení a počítání piv ochutnaných na Rock for People 2026, instalovatelnou na iOS i Android.

**Architecture:** Čistá HTML/CSS/JS aplikace bez build-kroku. **Čistá logika** (data, úložiště, statistiky, odznaky, filtry) je oddělená do ES-modulů bez závislosti na DOM a testuje se jednotkovými testy. **Vykreslování (UI)** je v samostatných modulech a ověřuje se pozorováním v prohlížeči (preview). Uživatelská data jsou v `localStorage`; obsah festivalu je seed v kódu. Offline zajišťuje `service worker` (cache-first). Distribuce přes GitHub Pages.

**Tech Stack:** HTML5, CSS3 (custom properties pro motivy), JavaScript ES modules. Žádné runtime závislosti, žádný build, **žádný Node/npm** (v prostředí nejsou). Testy běží v prohlížeči přes lokální statický server. Verzování git, hosting GitHub Pages.

---

## Důležité pro vývojáře (přečíst jako první)

**Prostředí:** Windows, PowerShell. **Není** k dispozici Node, npm ani funkční Python — nepoužívej je. Statický server pro vývoj/testy už existuje: `náhledy/server.ps1` (slouží náhledu) — pro appku vytvoříme obdobný v Tasku 0, nebo použijeme stejný princip (`System.Net.HttpListener`).

**Spuštění appky/testů lokálně:**
- Appka se servíruje z kořene repozitáře přes statický server na `http://localhost:8080/`.
- Testy se otevřou na `http://localhost:8080/tests/tests.html`.
- ES moduly (`import`/`export`) **nefungují přes `file://`** (blokuje CORS) — proto vždy přes http server.

**Ověřování (verification):** K dispozici jsou nástroje `preview_*` (preview_start, preview_eval, preview_screenshot, preview_console_logs). Testy zapisují souhrn do `window.__TESTS__ = {passed, failed, failures:[...]}`, takže výsledek jde přečíst přes `preview_eval`. UI obrazovky se ověřují `preview_screenshot`.

**Zdroj pravdy pro vzhled a část logiky:** Soubor `náhledy/lokac-nahled.html` je **schválený, vizuálně ověřený prototyp**. Obsahuje funkční a otestovaný kód pro data (`RAW`, `BREWERIES`, `STYLES`), výpočty (`computeStats`), odznaky (`ACH`), filtr (`matchBeer`) i vykreslení každé obrazovky. Tyto části se do reálné appky **přenášejí (portují) z tohoto souboru** a refaktorují podle níže uvedených rozhraní (hlavně: globální proměnná `U` a globální funkce se nahradí importovaným `store` a čistými moduly). Kde plán říká „přenes z náhledu funkci X", jde o konkrétní existující kód, ne o placeholder.

**Mužský rod:** Veškeré UI texty píš v češtině a **v mužském rodě** (např. „Ochutnal jsi", „Vytrvalec", „Zodpovědný").

**Cílová struktura souborů:**

```
RFP/
├── index.html              # vstupní HTML (shell: hlavička, tělo, tab-bar, sheet)
├── styles.css              # všechny styly + motivy (light/dark)
├── manifest.webmanifest    # PWA manifest
├── sw.js                   # service worker (offline cache)
├── js/
│   ├── data.js             # seed: STYLES, BREWERIES, RAW, BEERS, REALCOUNT, DAYS, DAY_LBL
│   ├── store.js            # createStore(): localStorage CRUD, custom piva, theme, export/import
│   ├── stats.js            # computeStats(beers, userMap, days) – čistá funkce
│   ├── achievements.js     # ACHIEVEMENTS[] + evaluateAchievements(stats)
│   ├── filters.js          # beerMatches(beer, ud, filter), filterAndGroup(...)
│   ├── format.js           # drobné helpery: starStr, fmtDateTime, shade, logoHTML
│   ├── screen-list.js      # render seznamu piv
│   ├── screen-detail.js    # render detailu (spodní list)
│   ├── screen-stats.js     # render statistik
│   ├── screen-ach.js       # render odznaků
│   ├── screen-settings.js  # render nastavení + formulář vlastního piva
│   └── app.js              # bootstrap, navigace mezi obrazovkami, motiv, SW registrace
├── assets/
│   └── logos/              # loga pivovarů (PNG/SVG) – Task 16
├── icons/
│   ├── icon-192.png        # ikona appky
│   ├── icon-512.png
│   └── icon-maskable-512.png
└── tests/
    ├── harness.js          # mini testovací framework (assert, describe, run)
    ├── tests.html          # spouštěč testů v prohlížeči
    ├── test-data.js
    ├── test-store.js
    ├── test-stats.js
    ├── test-achievements.js
    └── test-filters.js
```

---

## Task 0: Inicializace repozitáře a vývojový server

**Files:**
- Create: `.gitignore`
- Create: `serve.ps1`
- Create: `.claude/launch.json` (přidat konfiguraci `app`)
- Modify: (žádný)

- [ ] **Step 1: Inicializuj git**

Run:
```powershell
cd C:\Anet\Anet_ajtak_developer\RFP
git init
git add docs náhledy
git commit -m @'
chore: init repo with design spec and approved preview

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```
Expected: vznikne `.git`, první commit obsahuje specifikaci a náhled.

- [ ] **Step 2: Vytvoř `.gitignore`**

```
# OS
Thumbs.db
.DS_Store
# editor
.vscode/
# nic dalšího – appka nemá build artefakty
```

- [ ] **Step 3: Vytvoř `serve.ps1` (statický server pro celý repozitář)**

```powershell
$port = 8080
$root = $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Lokáč serving $root on http://localhost:$port/"
$types = @{
  '.html'='text/html; charset=utf-8'; '.js'='application/javascript; charset=utf-8';
  '.css'='text/css; charset=utf-8'; '.json'='application/json; charset=utf-8';
  '.webmanifest'='application/manifest+json; charset=utf-8';
  '.png'='image/png'; '.svg'='image/svg+xml; charset=utf-8'; '.ico'='image/x-icon'
}
while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.LocalPath.TrimStart('/'))
    if ([string]::IsNullOrEmpty($rel)) { $rel = 'index.html' }
    $file = Join-Path $root $rel
    if (Test-Path $file -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($file).ToLower()
      $ct = $types[$ext]; if (-not $ct) { $ct = 'application/octet-stream' }
      $ctx.Response.ContentType = $ct
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else { $ctx.Response.StatusCode = 404 }
    $ctx.Response.Close()
  } catch { }
}
```

- [ ] **Step 4: Přidej launch konfiguraci `app`** do `.claude/launch.json` (vedle stávající `nahled`)

```json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "nahled", "runtimeExecutable": "powershell",
      "runtimeArgs": ["-NoProfile","-ExecutionPolicy","Bypass","-File","náhledy/server.ps1"], "port": 8137 },
    { "name": "app", "runtimeExecutable": "powershell",
      "runtimeArgs": ["-NoProfile","-ExecutionPolicy","Bypass","-File","serve.ps1"], "port": 8080 }
  ]
}
```

- [ ] **Step 5: Commit**

```powershell
git add .gitignore serve.ps1 .claude/launch.json
git commit -m @'
chore: add static dev server and gitignore

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

---

## Task 1: Testovací harness (běží v prohlížeči, bez Node)

**Files:**
- Create: `tests/harness.js`
- Create: `tests/tests.html`

- [ ] **Step 1: Vytvoř `tests/harness.js`**

```javascript
// Minimal browser test harness. No dependencies.
const __suites = [];
let __current = null;

export function describe(name, fn) {
  __current = { name, tests: [] };
  __suites.push(__current);
  fn();
  __current = null;
}
export function it(name, fn) {
  __current.tests.push({ name, fn });
}
export function expect(actual) {
  return {
    toBe(exp) { if (actual !== exp) throw new Error(`expected ${JSON.stringify(actual)} to be ${JSON.stringify(exp)}`); },
    toEqual(exp) {
      const a = JSON.stringify(actual), b = JSON.stringify(exp);
      if (a !== b) throw new Error(`expected ${a} to equal ${b}`);
    },
    toBeTruthy() { if (!actual) throw new Error(`expected ${JSON.stringify(actual)} to be truthy`); },
    toBeFalsy() { if (actual) throw new Error(`expected ${JSON.stringify(actual)} to be falsy`); },
    toBeGreaterThanOrEqual(n) { if (!(actual >= n)) throw new Error(`expected ${actual} >= ${n}`); },
  };
}
export async function run(rootEl) {
  let passed = 0, failed = 0; const failures = [];
  for (const suite of __suites) {
    const sEl = document.createElement('div');
    sEl.innerHTML = `<h3>${suite.name}</h3>`;
    for (const t of suite.tests) {
      const line = document.createElement('div');
      try {
        await t.fn();
        passed++; line.textContent = `  ✅ ${t.name}`; line.style.color = 'green';
      } catch (e) {
        failed++; failures.push(`${suite.name} › ${t.name}: ${e.message}`);
        line.textContent = `  ❌ ${t.name} — ${e.message}`; line.style.color = 'red';
      }
      sEl.appendChild(line);
    }
    rootEl.appendChild(sEl);
  }
  const summary = document.createElement('h2');
  summary.textContent = `${passed} passed, ${failed} failed`;
  summary.style.color = failed ? 'red' : 'green';
  rootEl.prepend(summary);
  window.__TESTS__ = { passed, failed, failures };
}
```

- [ ] **Step 2: Vytvoř `tests/tests.html`**

```html
<!DOCTYPE html>
<html lang="cs"><head><meta charset="UTF-8"><title>Lokáč – testy</title>
<style>body{font-family:monospace;padding:20px;background:#111;color:#ddd} h3{color:#f4b836}</style>
</head><body><div id="out"></div>
<script type="module">
  import { run } from './harness.js';
  import './test-data.js';
  import './test-store.js';
  import './test-stats.js';
  import './test-achievements.js';
  import './test-filters.js';
  run(document.getElementById('out'));
</script>
</body></html>
```

> Pozn.: importy testů, které ještě neexistují, způsobí chybu načtení – to je v pořádku, soubory přidají další tasky. Pro průběžné spouštění odkomentuj jen existující importy, nebo vytvoř prázdné soubory s `export {}`.

- [ ] **Step 3: Vytvoř prázdné test-soubory, ať harness načte**

V `tests/` vytvoř `test-data.js`, `test-store.js`, `test-stats.js`, `test-achievements.js`, `test-filters.js`, každý zatím s obsahem:
```javascript
export {};
```

- [ ] **Step 4: Ověř, že harness běží**

Spusť server (`preview_start` name `app`) a otevři `http://localhost:8080/tests/tests.html`.
`preview_eval`: `window.__TESTS__` → očekávej `{passed:0, failed:0, failures:[]}` a žádné chyby v `preview_console_logs` (level error).

- [ ] **Step 5: Commit**

```powershell
git add tests/
git commit -m @'
test: add browser test harness

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

---

## Task 2: Datový modul (`js/data.js`)

**Files:**
- Create: `js/data.js`
- Test: `tests/test-data.js`

- [ ] **Step 1: Napiš padající test** `tests/test-data.js`

```javascript
import { describe, it, expect } from './harness.js';
import { STYLES, BREWERIES, BEERS, REALCOUNT, DAYS } from '../js/data.js';

describe('data', () => {
  it('má 9 stylů', () => expect(Object.keys(STYLES).length).toBe(9));
  it('má 23 pivovarů', () => expect(BREWERIES.length).toBe(23));
  it('každý pivovar má id, name, color, ini', () => {
    BREWERIES.forEach(b => { expect(!!(b.id && b.name && b.color && b.ini)).toBeTruthy(); });
  });
  it('každé reálné pivo má platný styl; tap-dlaždice nemá', () => {
    BEERS.forEach(b => {
      if (b.tap) return;
      expect(Object.keys(STYLES).includes(b.style)).toBeTruthy();
    });
  });
  it('REALCOUNT = počet ne-tap piv a je 100+', () => {
    expect(REALCOUNT).toBe(BEERS.filter(b => !b.tap).length);
    expect(REALCOUNT).toBeGreaterThanOrEqual(100);
  });
  it('festival má 5 dní', () => expect(DAYS.length).toBe(5));
  it('každé pivo odkazuje na existující pivovar', () => {
    const ids = new Set(BREWERIES.map(b => b.id));
    BEERS.forEach(b => expect(ids.has(b.brewery)).toBeTruthy());
  });
});
```

- [ ] **Step 2: Spusť testy, ověř FAIL**

`preview_eval` po reloadu `tests.html`: `window.__TESTS__.failed` → > 0 (modul `data.js` neexistuje / prázdný).

- [ ] **Step 3: Implementuj `js/data.js`**

Přenes pole `STYLES`, `BREWERIES` a `RAW` **doslova** z `náhledy/lokac-nahled.html` (sekce „DATA"). Přidej `export` a odvozené hodnoty. Výsledek:

```javascript
export const STYLES = { /* ...zkopíruj objekt STYLES z náhledu... */ };
export const BREWERIES = [ /* ...zkopíruj pole BREWERIES z náhledu (23 položek)... */ ];
// každé pivo: [pivovar, název, styl, abv, nealko?, tap?]
const RAW = [ /* ...zkopíruj celé pole RAW z náhledu... */ ];

export const BEERS = RAW.map((r, i) => ({
  id: 'b' + i, brewery: r[0], name: r[1], style: r[2] || '', abv: r[3] || '',
  af: !!r[4], tap: !!r[5]
}));
export const REALCOUNT = BEERS.filter(b => !b.tap).length;

export const DAYS = ['2026-06-10','2026-06-11','2026-06-12','2026-06-13','2026-06-14'];
export const DAY_LBL = ['St 10.6.','Čt 11.6.','Pá 12.6.','So 13.6.','Ne 14.6.'];
```

- [ ] **Step 4: Spusť testy, ověř PASS**

`preview_eval`: `window.__TESTS__` → `failed === 0`, `passed >= 7`.

- [ ] **Step 5: Commit**

```powershell
git add js/data.js tests/test-data.js
git commit -m @'
feat: add festival seed data module

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

---

## Task 3: Úložiště (`js/store.js`)

Spravuje uživatelská data v `localStorage` (s injektovatelným úložištěm kvůli testům): hodnocení, poznámka, oblíbené, ťuknutí (počítadlo + historie), vlastní piva, motiv, export/import.

**Files:**
- Create: `js/store.js`
- Test: `tests/test-store.js`

- [ ] **Step 1: Napiš padající test** `tests/test-store.js`

```javascript
import { describe, it, expect } from './harness.js';
import { createStore } from '../js/store.js';

function mockStorage() {
  const m = {};
  return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; } };
}

describe('store', () => {
  it('vrací prázdná data pro nové pivo', () => {
    const s = createStore(mockStorage());
    expect(s.getBeer('b1')).toEqual({ rating: 0, note: '', fav: false, taps: [] });
  });
  it('addTap přičte ťuknutí a počítá count', () => {
    const s = createStore(mockStorage());
    s.addTap('b1', '2026-06-10T18:00');
    s.addTap('b1', '2026-06-10T20:00');
    expect(s.getBeer('b1').taps.length).toBe(2);
  });
  it('removeTap odebere podle indexu', () => {
    const s = createStore(mockStorage());
    s.addTap('b1', '2026-06-10T18:00'); s.addTap('b1', '2026-06-10T20:00');
    s.removeTap('b1', 0);
    expect(s.getBeer('b1').taps).toEqual(['2026-06-10T20:00']);
  });
  it('setRating, setNote, toggleFav fungují a persistují', () => {
    const m = mockStorage();
    const s1 = createStore(m);
    s1.setRating('b1', 4); s1.setNote('b1', 'super'); s1.toggleFav('b1');
    const s2 = createStore(m); // nová instance nad stejným úložištěm
    const d = s2.getBeer('b1');
    expect(d.rating).toBe(4); expect(d.note).toBe('super'); expect(d.fav).toBe(true);
  });
  it('theme se ukládá a načítá (default dark)', () => {
    const m = mockStorage(); const s = createStore(m);
    expect(s.getTheme()).toBe('dark');
    s.setTheme('light');
    expect(createStore(m).getTheme()).toBe('light');
  });
  it('vlastní piva: add/list/remove', () => {
    const s = createStore(mockStorage());
    const beer = s.addCustomBeer({ brewery: 'clock', name: 'Moje IPA', style: 'ipa', abv: '13°', af: false });
    expect(beer.id.startsWith('c')).toBeTruthy();
    expect(s.getCustomBeers().length).toBe(1);
    s.removeCustomBeer(beer.id);
    expect(s.getCustomBeers().length).toBe(0);
  });
  it('export → import obnoví stav', () => {
    const m1 = mockStorage(); const s1 = createStore(m1);
    s1.setRating('b1', 5); s1.addTap('b1', '2026-06-11T12:00'); s1.setTheme('light');
    const json = s1.exportJSON();
    const s2 = createStore(mockStorage());
    s2.importJSON(json);
    expect(s2.getBeer('b1').rating).toBe(5);
    expect(s2.getBeer('b1').taps.length).toBe(1);
    expect(s2.getTheme()).toBe('light');
  });
  it('reset smaže data', () => {
    const s = createStore(mockStorage());
    s.setRating('b1', 3); s.reset();
    expect(s.getBeer('b1').rating).toBe(0);
  });
});
```

- [ ] **Step 2: Spusť testy, ověř FAIL**

`preview_eval`: `window.__TESTS__.failed > 0`.

- [ ] **Step 3: Implementuj `js/store.js`**

```javascript
const KEY = 'lokac_v1';

function blank() { return { v: 1, theme: 'dark', beers: {}, custom: [] }; }

export function createStore(storage = window.localStorage) {
  let state;
  try { state = JSON.parse(storage.getItem(KEY)) || blank(); }
  catch { state = blank(); }
  if (!state.beers) state.beers = {};
  if (!state.custom) state.custom = [];
  if (!state.theme) state.theme = 'dark';

  function persist() { storage.setItem(KEY, JSON.stringify(state)); }
  function rec(id) {
    if (!state.beers[id]) state.beers[id] = { rating: 0, note: '', fav: false, taps: [] };
    return state.beers[id];
  }

  return {
    getBeer(id) {
      const r = state.beers[id];
      return r ? { rating: r.rating, note: r.note, fav: r.fav, taps: [...r.taps] }
               : { rating: 0, note: '', fav: false, taps: [] };
    },
    getAllBeers() { return state.beers; },
    setRating(id, n) { rec(id).rating = (rec(id).rating === n ? 0 : n); persist(); },
    setNote(id, t) { rec(id).note = t; persist(); },
    toggleFav(id) { rec(id).fav = !rec(id).fav; persist(); return rec(id).fav; },
    addTap(id, iso) { rec(id).taps.push(iso || new Date().toISOString().slice(0, 16)); persist(); },
    removeTap(id, i) { rec(id).taps.splice(i, 1); persist(); },

    getTheme() { return state.theme; },
    setTheme(t) { state.theme = t; persist(); },

    getCustomBeers() { return state.custom.map(b => ({ ...b })); },
    addCustomBeer({ brewery, name, style, abv = '', af = false }) {
      const beer = { id: 'c' + Date.now() + Math.floor(Math.random() * 1000),
        brewery, name, style, abv, af, custom: true };
      state.custom.push(beer); persist(); return beer;
    },
    updateCustomBeer(id, patch) {
      const b = state.custom.find(x => x.id === id);
      if (b) { Object.assign(b, patch); persist(); }
    },
    removeCustomBeer(id) {
      state.custom = state.custom.filter(x => x.id !== id);
      delete state.beers[id]; persist();
    },

    exportJSON() { return JSON.stringify(state, null, 2); },
    importJSON(json) {
      const obj = JSON.parse(json);
      state = { ...blank(), ...obj };
      if (!state.beers) state.beers = {};
      if (!state.custom) state.custom = [];
      persist();
    },
    reset() { state = blank(); persist(); },
  };
}
```

- [ ] **Step 4: Spusť testy, ověř PASS** — `window.__TESTS__.failed === 0`.

- [ ] **Step 5: Commit**

```powershell
git add js/store.js tests/test-store.js
git commit -m @'
feat: add localStorage user-data store

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

---

## Task 4: Statistiky (`js/stats.js`)

Čistá funkce `computeStats(beers, userMap, days)` → souhrnný objekt pro statistiky i odznaky.

**Files:**
- Create: `js/stats.js`
- Test: `tests/test-stats.js`

- [ ] **Step 1: Napiš padající test** `tests/test-stats.js`

```javascript
import { describe, it, expect } from './harness.js';
import { computeStats } from '../js/stats.js';

const beers = [
  { id: 'b1', brewery: 'clock', style: 'lezak', af: false, tap: false },
  { id: 'b2', brewery: 'clock', style: 'ipa', af: false, tap: false },
  { id: 'b3', brewery: 'permon', style: 'nealko', af: true, tap: false },
  { id: 'bt', brewery: 'clock', style: '', af: false, tap: true }, // rotující výčep – ignorovat
];
const days = ['2026-06-10','2026-06-11'];
const userMap = {
  b1: { rating: 5, note: 'super', fav: true, taps: ['2026-06-10T18:00','2026-06-10T20:00','2026-06-11T01:00'] },
  b2: { rating: 0, note: '', fav: false, taps: ['2026-06-11T12:00'] },
  b3: { rating: 4, note: 'fajn', fav: false, taps: [] }, // ohodnoceno, ale neochutnáno
};

describe('stats', () => {
  const s = computeStats(beers, userMap, days);
  it('tasted = počet piv s aspoň 1 ťuknutím', () => expect(s.tasted).toBe(2));
  it('total = počet ne-tap piv', () => expect(s.total).toBe(3));
  it('totalDrinks = součet všech ťuknutí', () => expect(s.totalDrinks).toBe(4));
  it('rated = piva s rating > 0', () => expect(s.rated).toBe(2));
  it('nealkoTasted počítá jen ochutnaná nealka', () => expect(s.nealkoTasted).toBe(0));
  it('brewsTasted = různé pivovary s ochutnáním', () => expect(s.brewsTasted).toBe(1));
  it('stylesTasted = různé styly s ochutnáním', () => expect(s.stylesTasted).toBe(2));
  it('styleCounts.lezak = 1', () => expect(s.styleCounts.lezak).toBe(1));
  it('maxBeerTaps = nejvíc ťuknutí na jedno pivo', () => expect(s.maxBeerTaps).toBe(3));
  it('favCount = počet oblíbených', () => expect(s.favCount).toBe(1));
  it('noteCount = piva s neprázdnou poznámkou', () => expect(s.noteCount).toBe(2));
  it('nightOwl = true (ťuknutí v 01:00)', () => expect(s.nightOwl).toBe(true));
  it('daysActive = různé festivalové dny s ťuknutím', () => expect(s.daysActive).toBe(2));
  it('maxDayCount = max ťuknutí v jednom dni', () => expect(s.maxDayCount).toBe(2));
  it('dayCounts mapuje den → počet', () => expect(s.dayCounts['2026-06-10']).toBe(2));
});
```

- [ ] **Step 2: Spusť testy, ověř FAIL.**

- [ ] **Step 3: Implementuj `js/stats.js`**

Portuj logiku z `computeStats` v `náhledy/lokac-nahled.html`, ale jako **čistou funkci** s parametry (žádné globální `U`, `BEERS`, `DAYS`, `STYLES`). Styly se odvodí z dat (množina stylů z `beers`).

```javascript
export function computeStats(beers, userMap, days) {
  const real = beers.filter(b => !b.tap);
  const styleKeys = [...new Set(real.map(b => b.style).filter(Boolean))];
  let tasted = 0, totalDrinks = 0, rated = 0, nealkoTasted = 0, favCount = 0, noteCount = 0, maxBeerTaps = 0, nightOwl = false;
  const brews = new Set(), styles = new Set(), daySet = new Set();
  const styleCounts = {}; styleKeys.forEach(k => styleCounts[k] = 0);
  const dayCounts = {}; days.forEach(d => dayCounts[d] = 0); let other = 0;

  real.forEach(b => {
    const d = userMap[b.id]; if (!d) return;
    const c = d.taps.length;
    if (c > 0) {
      tasted++; brews.add(b.brewery);
      if (b.style) { styles.add(b.style); styleCounts[b.style] = (styleCounts[b.style] || 0) + 1; }
      if (b.af) nealkoTasted++;
    }
    if (c > maxBeerTaps) maxBeerTaps = c;
    totalDrinks += c;
    if (d.rating > 0) rated++;
    if (d.fav) favCount++;
    if (d.note && d.note.trim()) noteCount++;
    d.taps.forEach(t => {
      const day = t.slice(0, 10);
      if (dayCounts[day] != null) { dayCounts[day]++; daySet.add(day); } else other++;
      const hr = parseInt(t.slice(11, 13), 10);
      if (hr >= 0 && hr < 4) nightOwl = true;
    });
  });

  let bestFrac = 0, bestBrewery = '0/0', anyComplete = false;
  const brewIds = [...new Set(real.map(b => b.brewery))];
  brewIds.forEach(bid => {
    const list = real.filter(b => b.brewery === bid);
    const t = list.filter(b => userMap[b.id] && userMap[b.id].taps.length > 0).length;
    if (t / list.length > bestFrac) { bestFrac = t / list.length; bestBrewery = t + '/' + list.length; }
    if (t === list.length) anyComplete = true;
  });

  const maxDayCount = Math.max(0, ...days.map(d => dayCounts[d]));
  return {
    tasted, total: real.length, totalDrinks, rated, nealkoTasted, favCount, noteCount,
    maxBeerTaps, nightOwl, maxDayCount, styleCounts,
    brewsTasted: brews.size, stylesTasted: styles.size, daysActive: daySet.size,
    anyBreweryComplete: anyComplete, bestBrewery, dayCounts, other,
  };
}
```

- [ ] **Step 4: Spusť testy, ověř PASS** (`failed === 0`, `passed >= 15`).

- [ ] **Step 5: Commit**

```powershell
git add js/stats.js tests/test-stats.js
git commit -m @'
feat: add pure stats computation

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

---

## Task 5: Odznaky (`js/achievements.js`)

**Files:**
- Create: `js/achievements.js`
- Test: `tests/test-achievements.js`

- [ ] **Step 1: Napiš padající test** `tests/test-achievements.js`

```javascript
import { describe, it, expect } from './harness.js';
import { ACHIEVEMENTS, evaluateAchievements } from '../js/achievements.js';

describe('achievements', () => {
  it('má 22 odznaků', () => expect(ACHIEVEMENTS.length).toBe(22));
  it('každý má id, em, name, desc, target, val', () => {
    ACHIEVEMENTS.forEach(a => {
      expect(!!(a.id && a.em && a.name && a.desc)).toBeTruthy();
      expect(typeof a.val).toBe('function');
      expect(a.target !== undefined).toBeTruthy();
    });
  });
  it('evaluate vrací unlocked podle val >= target', () => {
    const stats = { tasted: 5, total: 103, totalDrinks: 5, rated: 0, nealkoTasted: 0,
      favCount: 0, noteCount: 0, maxBeerTaps: 1, nightOwl: false, maxDayCount: 1,
      styleCounts: { ipa: 0, dark: 0 }, brewsTasted: 1, stylesTasted: 1, daysActive: 1,
      anyBreweryComplete: false, bestBrewery: '1/4' };
    const res = evaluateAchievements(stats);
    const prvo = res.find(r => r.id === 'prvo');
    const rozjezd = res.find(r => r.id === 'rozjezd');
    const padesatka = res.find(r => r.id === 'padesatka');
    expect(prvo.unlocked).toBe(true);     // tasted 5 >= 1
    expect(rozjezd.unlocked).toBe(true);  // tasted 5 >= 5
    expect(padesatka.unlocked).toBe(false); // tasted 5 < 50
    expect(padesatka.progressText).toBe('5/50');
  });
  it('Král festivalu cílí na stats.total', () => {
    const res = evaluateAchievements({ tasted: 103, total: 103, totalDrinks: 0, rated: 0,
      nealkoTasted: 0, favCount: 0, noteCount: 0, maxBeerTaps: 0, nightOwl: false,
      maxDayCount: 0, styleCounts: {}, brewsTasted: 0, stylesTasted: 0, daysActive: 0,
      anyBreweryComplete: false, bestBrewery: '0/0' });
    expect(res.find(r => r.id === 'kral').unlocked).toBe(true);
  });
});
```

- [ ] **Step 2: Spusť testy, ověř FAIL.**

- [ ] **Step 3: Implementuj `js/achievements.js`**

Portuj pole `ACH` z `náhledy/lokac-nahled.html` a přejmenuj klíč `tgt` → `target`. Pro „Král festivalu" použij `target: s => s.total` (cíl závislý na statistikách). `val` funkce zůstávají stejné (čtou `stats.*`). Přidej `evaluateAchievements`.

```javascript
export const ACHIEVEMENTS = [
  { id:'prvo', em:'🍺', name:'Prvotřídní', desc:'Ochutnej první pivo', target:1, val:s=>s.tasted },
  { id:'rozjezd', em:'🚀', name:'Rozjezd', desc:'Ochutnej 5 různých piv', target:5, val:s=>s.tasted },
  { id:'deci', em:'🔟', name:'Decimálka', desc:'Celkem 10 piv', target:10, val:s=>s.totalDrinks },
  { id:'maraton', em:'🏃', name:'Maratonec', desc:'Celkem 25 piv', target:25, val:s=>s.totalDrinks },
  { id:'padesatka', em:'🏅', name:'Padesátka', desc:'Ochutnej 50 různých piv', target:50, val:s=>s.tasted },
  { id:'sto', em:'💯', name:'Stovkař', desc:'Ochutnej 100 různých piv', target:100, val:s=>s.tasted },
  { id:'kral', em:'👑', name:'Král festivalu', desc:'Ochutnej úplně všechna piva', target:s=>s.total, val:s=>s.tasted },
  { id:'cest', em:'🌍', name:'Cestovatel', desc:'Piva od 5 různých pivovarů', target:5, val:s=>s.brewsTasted },
  { id:'lokal', em:'🗺️', name:'Lokálpatriot', desc:'Piva od 10 různých pivovarů', target:10, val:s=>s.brewsTasted },
  { id:'verny', em:'🏭', name:'Věrný fanoušek', desc:'Všechna piva jednoho pivovaru', target:1,
    val:s=>s.anyBreweryComplete?1:0, prog:s=>s.bestBrewery },
  { id:'styl', em:'🌈', name:'Sběratel stylů', desc:'Piva ze 4 různých stylů', target:4, val:s=>s.stylesTasted },
  { id:'mistr', em:'🎨', name:'Mistr stylů', desc:'Ochutnej všech 9 stylů', target:9, val:s=>s.stylesTasted },
  { id:'chmel', em:'🌿', name:'Chmelová hlava', desc:'5 piv stylu IPA / APA', target:5, val:s=>s.styleCounts.ipa||0 },
  { id:'tma', em:'🌑', name:'Tmavá strana', desc:'3 tmavá / speciál piva', target:3, val:s=>s.styleCounts.dark||0 },
  { id:'zodp', em:'🚫', name:'Zodpovědný', desc:'Ochutnej 3 nealko piva', target:3, val:s=>s.nealkoTasted },
  { id:'stamgast', em:'🍻', name:'Štamgast', desc:'Dej si jedno pivo aspoň 5×', target:5, val:s=>s.maxBeerTaps },
  { id:'zizen', em:'🔥', name:'Žíznivý den', desc:'5 piv během jednoho dne', target:5, val:s=>s.maxDayCount },
  { id:'sova', em:'🦉', name:'Noční sova', desc:'Pivo mezi půlnocí a 4:00', target:1, val:s=>s.nightOwl?1:0 },
  { id:'krit', em:'⭐', name:'Kritik', desc:'Ohodnoť 20 piv', target:20, val:s=>s.rated },
  { id:'srdcar', em:'💗', name:'Srdcař', desc:'Označ 5 oblíbených', target:5, val:s=>s.favCount },
  { id:'recenzent', em:'📝', name:'Recenzent', desc:'Napiš poznámku k 10 pivům', target:10, val:s=>s.noteCount },
  { id:'vytr', em:'🌅', name:'Vytrvalec', desc:'Pivo v každý den festivalu', target:5, val:s=>s.daysActive },
];

export function evaluateAchievements(stats) {
  return ACHIEVEMENTS.map(a => {
    const value = a.val(stats);
    const target = typeof a.target === 'function' ? a.target(stats) : a.target;
    const unlocked = value >= target;
    const progressText = a.prog ? a.prog(stats) : `${Math.min(value, target)}/${target}`;
    return { id: a.id, em: a.em, name: a.name, desc: a.desc, value, target, unlocked, progressText };
  });
}
```

- [ ] **Step 4: Spusť testy, ověř PASS.**

- [ ] **Step 5: Commit**

```powershell
git add js/achievements.js tests/test-achievements.js
git commit -m @'
feat: add achievements definitions and evaluation

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

---

## Task 6: Filtr a hledání (`js/filters.js`)

**Files:**
- Create: `js/filters.js`
- Test: `tests/test-filters.js`

- [ ] **Step 1: Napiš padající test** `tests/test-filters.js`

```javascript
import { describe, it, expect } from './harness.js';
import { beerMatches } from '../js/filters.js';

const brewName = id => ({ clock: 'Clock', permon: 'Permon' }[id] || id);
const lezak = { id:'b1', brewery:'clock', name:'Hektor', style:'lezak', af:false, tap:false };
const nealko = { id:'b2', brewery:'permon', name:'Free IPA', style:'nealko', af:true, tap:false };
const tap = { id:'bt', brewery:'clock', name:'Rotující výčep', style:'', af:false, tap:true };
const ud = id => ({ b1:{rating:4,note:'',fav:true,taps:['2026-06-10T18:00']}, b2:{rating:0,note:'',fav:false,taps:[]} }[id] || {rating:0,note:'',fav:false,taps:[]});
const base = { q:'', taste:'all', brewery:'all', style:'all' };

describe('filters', () => {
  it('default zobrazí ochutnané i neochutnané', () => {
    expect(beerMatches(lezak, ud('b1'), base, brewName)).toBe(true);
    expect(beerMatches(nealko, ud('b2'), base, brewName)).toBe(true);
  });
  it('taste=tasted skryje neochutnaná', () => {
    expect(beerMatches(nealko, ud('b2'), {...base, taste:'tasted'}, brewName)).toBe(false);
    expect(beerMatches(lezak, ud('b1'), {...base, taste:'tasted'}, brewName)).toBe(true);
  });
  it('taste=fav nechá jen oblíbená', () => {
    expect(beerMatches(lezak, ud('b1'), {...base, taste:'fav'}, brewName)).toBe(true);
    expect(beerMatches(nealko, ud('b2'), {...base, taste:'fav'}, brewName)).toBe(false);
  });
  it('style filtruje napříč pivovary', () => {
    expect(beerMatches(nealko, ud('b2'), {...base, style:'nealko'}, brewName)).toBe(true);
    expect(beerMatches(lezak, ud('b1'), {...base, style:'nealko'}, brewName)).toBe(false);
  });
  it('q hledá v názvu piva i pivovaru', () => {
    expect(beerMatches(lezak, ud('b1'), {...base, q:'hek'}, brewName)).toBe(true);
    expect(beerMatches(lezak, ud('b1'), {...base, q:'clock'}, brewName)).toBe(true);
    expect(beerMatches(lezak, ud('b1'), {...base, q:'xyz'}, brewName)).toBe(false);
  });
  it('tap-dlaždice se ukáže jen bez aktivních filtrů', () => {
    expect(beerMatches(tap, ud('bt'), base, brewName)).toBe(true);
    expect(beerMatches(tap, ud('bt'), {...base, taste:'tasted'}, brewName)).toBe(false);
    expect(beerMatches(tap, ud('bt'), {...base, q:'hek'}, brewName)).toBe(false);
  });
});
```

- [ ] **Step 2: Spusť testy, ověř FAIL.**

- [ ] **Step 3: Implementuj `js/filters.js`**

```javascript
// filter: { q, taste:'all'|'untasted'|'tasted'|'fav', brewery:'all'|id, style:'all'|key }
// getBrewName: (breweryId) => string
export function beerMatches(beer, ud, filter, getBrewName) {
  const filtering = filter.q || filter.taste !== 'all' || filter.style !== 'all';
  if (beer.tap) return !filtering; // rotující výčep jen bez filtrů
  const tasted = ud && ud.taps.length > 0;
  if (filter.taste === 'tasted' && !tasted) return false;
  if (filter.taste === 'untasted' && tasted) return false;
  if (filter.taste === 'fav' && !(ud && ud.fav)) return false;
  if (filter.style !== 'all' && beer.style !== filter.style) return false;
  if (filter.q) {
    const q = filter.q.toLowerCase();
    const bn = (getBrewName(beer.brewery) || '').toLowerCase();
    if (!beer.name.toLowerCase().includes(q) && !bn.includes(q)) return false;
  }
  return true;
}
```

- [ ] **Step 4: Spusť testy, ověř PASS.**

- [ ] **Step 5: Commit**

```powershell
git add js/filters.js tests/test-filters.js
git commit -m @'
feat: add beer filter/search predicate

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

---

## Task 7: Vzhled a kostra appky (`index.html`, `styles.css`, `js/format.js`)

UI se neověřuje jednotkovými testy, ale **pozorováním v prohlížeči** (preview_screenshot). Markup a styly se přenášejí z ověřeného náhledu (bez „phone" rámu a úvodního textu — to byly jen kulisy náhledu).

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `js/format.js`

- [ ] **Step 1: Vytvoř `js/format.js`** — přenes helpery `shade`, `starStr`, `logoHTML` z náhledu a přidej `fmtDateTime`:

```javascript
export function shade(hex, p) {
  let n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + p, g = ((n >> 8) & 255) + p, b = (n & 255) + p;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
export function starStr(n) { return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n); }
export function logoHTML(br, cls = 'logo') {
  // br: {color, ini, logo?} – pokud má logo soubor, použij <img>, jinak barevný placeholder
  if (br.logo) return `<img class="${cls}" src="${br.logo}" alt="${br.name}">`;
  return `<div class="${cls}" style="background:linear-gradient(150deg,${br.color},${shade(br.color, -25)})">${br.ini}</div>`;
}
export function fmtDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
}
```

- [ ] **Step 2: Vytvoř `styles.css`** — přenes **celý obsah `<style>`** z `náhledy/lokac-nahled.html` a uprav:
  - Smaž styly náhledových kulis: `body{...}` přebarvení pozadí, `.intro`, `.poster-font`, `.phone`, `.notch`.
  - `body` nastav na: `margin:0; font-family:system-ui,"Segoe UI",Roboto,sans-serif;`.
  - Přesuň motivové proměnné z `.app[data-theme=...]` na `:root[data-theme=...]` (motiv se nastaví na `<html>`), nebo ponech na `.app` a `.app` bude `min-height:100vh; width:100%`. Zvol variantu „na `<html>`": přejmenuj selektory `.app[data-theme="dark"]` → `:root[data-theme="dark"]` a `.app[data-theme="light"]` → `:root[data-theme="light"]`, a `.app[data-theme="light"] .switch i` → `:root[data-theme="light"] .switch i`.
  - `.app` uprav na fullscreen: `position:fixed; inset:0; display:flex; flex-direction:column;` (místo rozměrů telefonu).
  - Zbytek (head, body, search, seg, brew, beer, sheet, ring, panel, badges, setrow, fab, tabs…) ponech beze změny.

- [ ] **Step 3: Vytvoř `index.html`** (shell bez „phone" rámu):

```html
<!DOCTYPE html>
<html lang="cs" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#0e0e12">
  <title>Lokáč</title>
  <link rel="manifest" href="./manifest.webmanifest">
  <link rel="apple-touch-icon" href="./icons/icon-192.png">
  <link rel="stylesheet" href="./styles.css">
</head>
<body>
  <div class="app" id="app">
    <div class="head">
      <div class="title"><b>L<i>O</i>KÁČ</b><small>PIVNÍ DENÍK RFP 2026</small></div>
      <button class="theme-btn" id="themeBtn" title="Přepnout motiv">🌙</button>
    </div>
    <div class="body" id="body"></div>
    <button class="fab" id="fab" title="Přidat vlastní pivo">+</button>
    <div class="tabs" id="tabs">
      <button class="tab active" data-scr="list"><span class="ti">🍺</span>Piva</button>
      <button class="tab" data-scr="stats"><span class="ti">📊</span>Statistiky</button>
      <button class="tab" data-scr="ach"><span class="ti">🏅</span>Odznaky</button>
      <button class="tab" data-scr="set"><span class="ti">⚙️</span>Nastavení</button>
    </div>
    <div class="sheet-bg" id="sheetBg"></div>
    <div class="sheet" id="sheet"></div>
  </div>
  <script type="module" src="./js/app.js"></script>
</body>
</html>
```

- [ ] **Step 4: Ověř shell v prohlížeči**

Spusť server `app`, otevři `http://localhost:8080/`. `preview_console_logs` (error) → po Tasku 8 bez chyb (teď `app.js` ještě neexistuje → očekávaná 404/chyba modulu; pokračuj Taskem 8). `preview_screenshot` ukáže hlavičku a tab-bar.

- [ ] **Step 5: Commit**

```powershell
git add index.html styles.css js/format.js
git commit -m @'
feat: add app shell, styles and format helpers

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

---

## Task 8: Bootstrap, navigace a motiv (`js/app.js`)

**Files:**
- Create: `js/app.js`

- [ ] **Step 1: Implementuj `js/app.js`** (centrální kontext + přepínání obrazovek)

```javascript
import { BREWERIES, BEERS, STYLES, REALCOUNT, DAYS, DAY_LBL } from './data.js';
import { createStore } from './store.js';
import { renderList } from './screen-list.js';
import { renderStats } from './screen-stats.js';
import { renderAch } from './screen-ach.js';
import { renderSettings } from './screen-settings.js';
import { openDetail } from './screen-detail.js';

const store = createStore();

// sjednocený seznam piv = seed + vlastní
export function allBeers() { return [...BEERS, ...store.getCustomBeers()]; }
export function brewById(id) { return BREWERIES.find(b => b.id === id); }
export function brewName(id) { const b = brewById(id); return b ? b.name : id; }

export const ctx = {
  store, BREWERIES, STYLES, REALCOUNT, DAYS, DAY_LBL,
  allBeers, brewById, brewName,
  filter: { q: '', taste: 'all', brewery: 'all', style: 'all' },
  openBrews: new Set(['', ]), // naplní se v Tasku 9 (default rozbalené)
  rerender,
  openDetail: (id) => openDetail(ctx, id),
};

let curScr = 'list';
const body = document.getElementById('body');

export function rerender() { show(curScr); }

function show(scr) {
  curScr = scr;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.scr === scr));
  document.getElementById('fab').style.display = scr === 'list' ? 'flex' : 'none';
  if (scr === 'list') renderList(ctx, body);
  else if (scr === 'stats') renderStats(ctx, body);
  else if (scr === 'ach') renderAch(ctx, body);
  else renderSettings(ctx, body);
}

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  document.getElementById('themeBtn').textContent = t === 'dark' ? '🌙' : '☀️';
  document.querySelector('meta[name="theme-color"]').setAttribute('content', t === 'dark' ? '#0e0e12' : '#f3ead8');
}
export function toggleTheme() {
  const t = store.getTheme() === 'dark' ? 'light' : 'dark';
  store.setTheme(t); applyTheme(t); if (curScr === 'set') rerender();
}

// wiring
document.querySelectorAll('.tab').forEach(t => t.onclick = () => show(t.dataset.scr));
document.getElementById('themeBtn').onclick = toggleTheme;
document.getElementById('sheetBg').onclick = () => { closeSheet(); };
document.getElementById('fab').onclick = () => renderSettings(ctx, body, { openAddForm: true });

export function closeSheet() {
  document.getElementById('sheetBg').classList.remove('show');
  document.getElementById('sheet').classList.remove('show');
  rerender();
}
ctx.closeSheet = closeSheet;

// init
applyTheme(store.getTheme());
show('list');

// service worker (Task 15)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
```

> Pozn.: importy `screen-*.js` ještě neexistují → appka poběží až po Taskech 9–13. Implementuj je v pořadí; mezi tasky lze dočasně zakomentovat dosud neexistující importy a jejich volání, aby šla obrazovka „list" ověřit dřív.

- [ ] **Step 2: Commit (částečný, doplní se v dalších taskech)**

```powershell
git add js/app.js
git commit -m @'
feat: add app bootstrap, navigation and theme switching

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

---

## Task 9: Obrazovka „Piva" (`js/screen-list.js`)

**Files:**
- Create: `js/screen-list.js`
- Modify: `js/app.js` (default rozbalené pivovary)

- [ ] **Step 1: Implementuj `js/screen-list.js`**

Portuj z náhledu funkce `renderList`, `seg`, `optBrew`, `optStyle`, `beerRow`, `setTaste`, `clearFilter`, `toggleBrew`, `quickTap` do jednoho modulu, který exportuje `renderList(ctx, body)`. Klíčové refaktory:
- místo globálních `BREWERIES`, `STYLES`, `BEERS`, `U` použij `ctx.BREWERIES`, `ctx.STYLES`, `ctx.allBeers()`, `ctx.store.getBeer(id)`;
- `matchBeer` nahraď `beerMatches(beer, ctx.store.getBeer(beer.id), ctx.filter, ctx.brewName)` z `./filters.js`;
- `logoHTML`/`starStr` importuj z `./format.js`;
- obslužné akce (hledání, chipy, selecty, rozbalení, +1, otevření detailu) navěs přes `addEventListener` na elementy po vykreslení (ne inline `onclick` se stringy), a po změně volej `ctx.rerender()`;
- „+1" volá `ctx.store.addTap(id)` + krátkou foam-animaci, pak `ctx.rerender()`;
- klik na kartu (mimo +1) volá `ctx.openDetail(id)`.

Struktura (rozhraní, vyplň tělo portovaným kódem):

```javascript
import { beerMatches } from './filters.js';
import { logoHTML, starStr } from './format.js';

export function renderList(ctx, body) {
  const { store, BREWERIES, STYLES, filter } = ctx;
  const filtering = filter.q || filter.taste !== 'all' || filter.style !== 'all';
  // 1) sestav HTML: search + chipy (Vše/Neochutnáno/Ochutnáno/❤️ Oblíbené) + selecty (pivovar, styl) + count
  // 2) pro každý pivovar (filtr.brewery) spočti shown = jeho piva splňující beerMatches(...)
  //    – pokud prázdné, sekci vynech; jinak vykresli hlavičku s progresem (tasted/total) a karty (beerRow)
  // 3) prázdný výsledek → hláška „Nic nenalezeno 🤷"
  body.innerHTML = /* sestavené HTML */ '';
  // 4) navěs eventy: #q (input, zachovej pozici kurzoru), .chip (setTaste), #fbrew/#fstyle (change),
  //    .brew-head (toggle rozbalení), .plus (quickTap), .beer .info (openDetail)
}
```

- [ ] **Step 2: Uprav default rozbalení v `app.js`**

V `ctx.openBrews` nastav rozumný default (např. první pivovar):
```javascript
openBrews: new Set([BREWERIES[0].id]),
```

- [ ] **Step 3: Ověř v prohlížeči**

Reload `http://localhost:8080/`. Ověř `preview_console_logs` (error) → prázdné. `preview_screenshot` → seznam s pivovary, kartami, +1.
Funkční ověření přes `preview_eval`:
```javascript
(function(){ document.querySelector('.brew-head').click(); return document.querySelectorAll('.beer').length; })()
```
→ > 0. Klik na `.plus` zvýší počítadlo: ověř, že po kliku `ctx`/store reflektuje ťuknutí (např. přes `localStorage.getItem('lokac_v1')`).

- [ ] **Step 4: Commit**

```powershell
git add js/screen-list.js js/app.js
git commit -m @'
feat: add beer list screen with filters and quick +1

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

---

## Task 10: Detail piva (`js/screen-detail.js`)

**Files:**
- Create: `js/screen-detail.js`

- [ ] **Step 1: Implementuj `js/screen-detail.js`**

Portuj z náhledu `openDetail`, `detailTap`, `setRating`, `toggleFav`, `saveNote`, `delTap`, `fmt` do modulu exportujícího `openDetail(ctx, id)`. Refaktory:
- data z `ctx.store.getBeer(id)`, pivo z `ctx.allBeers().find(...)`, pivovar z `ctx.brewById(...)`;
- akce volají store metody (`addTap`, `setRating`, `toggleFav`, `setNote`, `removeTap`) a překreslí detail; po zavření `ctx.closeSheet()` (ten volá `rerender`);
- `fmt` nahraď `fmtDateTime` z `./format.js`;
- u `custom` piva přidej tlačítka „upravit" (otevře formulář v nastavení/sheetu) a „smazat" (`ctx.store.removeCustomBeer(id)` → `ctx.closeSheet()`);
- eventy navěs přes `addEventListener`, ne inline.

```javascript
import { logoHTML, fmtDateTime } from './format.js';

export function openDetail(ctx, id) {
  const beer = ctx.allBeers().find(b => b.id === id);
  const br = ctx.brewById(beer.brewery);
  const sheet = document.getElementById('sheet');
  function draw() {
    const d = ctx.store.getBeer(id);
    sheet.innerHTML = /* hlavička s logem + tagy; bigplus „Dal jsem si +1"; „Měl jsem N×";
       hvězdičky 1–5; ❤️ oblíbené; poznámka <textarea>; historie ťuknutí s mazáním */ '';
    // navěs: .bigplus → store.addTap(id)+draw(); hvězdy → store.setRating; .favbtn → store.toggleFav;
    // #note → store.setNote (input); .h-item button → store.removeTap(id,i)+draw()
  }
  draw();
  document.getElementById('sheetBg').classList.add('show');
  sheet.classList.add('show');
}
```

- [ ] **Step 2: Ověř v prohlížeči**

Reload. `preview_eval`: `(function(){ document.querySelector('.beer .info').click(); return document.getElementById('sheet').classList.contains('show'); })()` → `true`. `preview_screenshot` → spodní list s hvězdami, poznámkou, historií. Klik na `.bigplus` zvýší „Měl jsem N×".

- [ ] **Step 3: Commit**

```powershell
git add js/screen-detail.js
git commit -m @'
feat: add beer detail bottom sheet

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

---

## Task 11: Statistiky (`js/screen-stats.js`)

**Files:**
- Create: `js/screen-stats.js`

- [ ] **Step 1: Implementuj `js/screen-stats.js`**

Portuj `renderStats` z náhledu do `renderStats(ctx, body)`. Refaktory:
- statistiky získej `const s = computeStats(ctx.allBeers(), ctx.store.getAllBeers(), ctx.DAYS)` z `./stats.js` (žádné lokální přepočítávání stylů — použij `s.styleCounts`);
- „celkem vypito" **bez** „(i opakování)";
- žebříčky (top hodnocená, nejčastěji pitá) počítej nad `ctx.allBeers()` a `ctx.store.getBeer(id)`;
- `DAY_LBL`, `STYLES`, `logoHTML`, `starStr` z ctx/format.

```javascript
import { computeStats } from './stats.js';
import { logoHTML, starStr } from './format.js';

export function renderStats(ctx, body) {
  const beers = ctx.allBeers();
  const s = computeStats(beers, ctx.store.getAllBeers(), ctx.DAYS);
  // kruh „tasted / total", „zbývá", karty (totalDrinks, brewsTasted),
  // panel Top hodnocená, panel Nejčastěji pitá, panel Rozložení podle stylu (s.styleCounts),
  // panel Po dnech festivalu (s.dayCounts + ctx.DAY_LBL)
  body.innerHTML = /* portované HTML */ '';
}
```

- [ ] **Step 2: Ověř v prohlížeči**

`preview_eval`: `(function(){ document.querySelector('.tab[data-scr="stats"]').click(); return !!document.querySelector('.ring'); })()` → `true`. `preview_screenshot` → kruh, karty, žebříčky, graf po dnech.

- [ ] **Step 3: Commit**

```powershell
git add js/screen-stats.js
git commit -m @'
feat: add statistics screen

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

---

## Task 12: Odznaky (`js/screen-ach.js`)

**Files:**
- Create: `js/screen-ach.js`

- [ ] **Step 1: Implementuj `js/screen-ach.js`**

```javascript
import { computeStats } from './stats.js';
import { evaluateAchievements } from './achievements.js';

export function renderAch(ctx, body) {
  const s = computeStats(ctx.allBeers(), ctx.store.getAllBeers(), ctx.DAYS);
  const res = evaluateAchievements(s);
  const unlocked = res.filter(r => r.unlocked).length;
  body.innerHTML = `<h2 class="scr-title">🏅 Odznaky</h2>
    <div style="color:var(--dim);font-size:12.5px;margin:0 2px 6px">Odemčeno ${unlocked} z ${res.length}</div>
    <div class="badges">${res.map(a => `
      <div class="badge ${a.unlocked ? 'unlocked' : 'locked'}">
        <div class="em">${a.em}</div><b>${a.name}</b><small>${a.desc}</small>
        <div class="pbar"><i style="width:${Math.min(100, a.value / a.target * 100)}%"></i></div>
        <small style="margin-top:5px">${a.unlocked ? 'Hotovo ✓' : a.progressText}</small>
      </div>`).join('')}</div>`;
}
```

- [ ] **Step 2: Ověř v prohlížeči**

`preview_eval`: `(function(){ document.querySelector('.tab[data-scr="ach"]').click(); return document.querySelectorAll('.badge').length; })()` → `22`. `preview_screenshot`.

- [ ] **Step 3: Commit**

```powershell
git add js/screen-ach.js
git commit -m @'
feat: add achievements screen

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

---

## Task 13: Nastavení + formulář vlastního piva (`js/screen-settings.js`)

**Files:**
- Create: `js/screen-settings.js`

- [ ] **Step 1: Implementuj `js/screen-settings.js`**

Obrazovka s řádky: motiv (přepínač → `ctx` toggleTheme přes `ctx.store`+`applyTheme`; nejjednodušší: importuj `toggleTheme` z `app.js`), **Export zálohy** (stáhne JSON), **Obnovit ze zálohy** (vybere soubor → `store.importJSON` → `ctx.rerender()`), **Přidat vlastní pivo** (rozbalí formulář), **Reset dat** (potvrzení → `store.reset()` → `applyTheme` + rerender). Volitelný parametr `opts.openAddForm` otevře rovnou formulář (volá FAB).

```javascript
import { BREWERIES, STYLES } from './data.js';
import { toggleTheme } from './app.js';

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

  document.getElementById('swTheme').onclick = () => { toggleTheme(); ctx.rerender(); };

  document.getElementById('btnExport').onclick = () => {
    const blob = new Blob([ctx.store.exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `lokac-zaloha-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(a.href);
  };

  const file = document.getElementById('fileImport');
  document.getElementById('btnImport').onclick = () => file.click();
  file.onchange = () => {
    const f = file.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      if (confirm('Obnovit data ze zálohy? Přepíše současná data.')) {
        try { ctx.store.importJSON(r.result); ctx.rerender(); alert('Hotovo ✓'); }
        catch { alert('Soubor se nepodařilo načíst.'); }
      }
    };
    r.readAsText(f);
  };

  document.getElementById('btnReset').onclick = () => {
    if (confirm('Opravdu smazat všechna tvá data? Tohle nejde vrátit.')) {
      ctx.store.reset(); ctx.rerender();
    }
  };

  const addForm = document.getElementById('addForm');
  document.getElementById('btnAdd').onclick = () => {
    addForm.style.display = addForm.style.display === 'none' ? 'block' : 'none';
    if (addForm.innerHTML === '') drawAddForm();
  };
  if (opts.openAddForm) drawAddForm();

  function drawAddForm() {
    addForm.innerHTML = `<div class="panel">
      <input id="nbName" class="fld" placeholder="Název piva">
      <select id="nbBrew" class="fld">${BREWERIES.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}</select>
      <select id="nbStyle" class="fld">${Object.keys(STYLES).map(k => `<option value="${k}">${STYLES[k].label}</option>`).join('')}</select>
      <input id="nbAbv" class="fld" placeholder="Stupně/ABV (nepovinné), např. 12°">
      <label style="display:flex;gap:8px;align-items:center;margin:8px 0"><input type="checkbox" id="nbAf"> Nealko</label>
      <button class="btn gold" id="nbSave">Uložit pivo</button></div>`;
    document.getElementById('nbSave').onclick = () => {
      const name = document.getElementById('nbName').value.trim();
      if (!name) { alert('Zadej název piva.'); return; }
      ctx.store.addCustomBeer({
        brewery: document.getElementById('nbBrew').value,
        name, style: document.getElementById('nbStyle').value,
        abv: document.getElementById('nbAbv').value.trim(),
        af: document.getElementById('nbAf').checked,
      });
      alert('Pivo přidáno ✓'); ctx.rerender();
    };
  }
}
```

- [ ] **Step 2: Přidej styl `.fld`** do `styles.css`:

```css
.fld{width:100%; background:var(--surface2); border:1px solid var(--border); color:var(--text);
  border-radius:11px; padding:11px; font-size:13.5px; margin-bottom:9px; outline:none}
```

- [ ] **Step 3: Ověř v prohlížeči**

`preview_eval`: klik na `.tab[data-scr="set"]`, ověř existenci `#btnExport`, `#swTheme`. Klik na FAB (`#fab`) přepne na nastavení s otevřeným formulářem. Přidání vlastního piva → po `ctx.rerender()` a přepnutí na „Piva" je nové pivo v seznamu daného pivovaru.

- [ ] **Step 4: Commit**

```powershell
git add js/screen-settings.js styles.css
git commit -m @'
feat: add settings screen with backup, reset and custom beer form

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

---

## Task 14: PWA manifest a ikony

**Files:**
- Create: `manifest.webmanifest`
- Create: `icons/icon-192.png`, `icons/icon-512.png`, `icons/icon-maskable-512.png`
- Create: `icons/generate-icon.html` (jednorázový generátor ikony)

- [ ] **Step 1: Vytvoř `manifest.webmanifest`**

```json
{
  "name": "Lokáč — Pivní deník RFP 2026",
  "short_name": "Lokáč",
  "description": "Soukromý pivní deník pro Rock for People 2026",
  "lang": "cs",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#0e0e12",
  "theme_color": "#0e0e12",
  "icons": [
    { "src": "./icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "./icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "./icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

- [ ] **Step 2: Vytvoř generátor ikony `icons/generate-icon.html`**

Canvas, který nakreslí ikonu „Lokáč" (jantarový půllitr s pěnou + blesk na uhlovém pozadí) a umožní stáhnout PNG v 192 a 512 px. Obsah:

```html
<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8"><title>Ikona Lokáč</title></head>
<body style="background:#222;color:#eee;font-family:sans-serif;padding:16px">
<canvas id="c" width="512" height="512"></canvas>
<div><button onclick="dl(192,'icon-192.png')">Stáhnout 192</button>
<button onclick="dl(512,'icon-512.png')">Stáhnout 512</button>
<button onclick="dl(512,'icon-maskable-512.png',true)">Stáhnout maskable 512</button></div>
<script>
const c=document.getElementById('c'),x=c.getContext('2d');
function draw(maskable){
  x.clearRect(0,0,512,512);
  // pozadí
  x.fillStyle='#0e0e12'; if(maskable){x.fillRect(0,0,512,512);} else {round(56,56,400,400,72); x.fillStyle='#16161c'; x.fill();}
  const pad=maskable?96:128;
  // sklenice
  x.fillStyle='#f4b836'; round(pad,150,512-2*pad,260,24); x.fill();
  // pěna
  x.fillStyle='#fff7e6'; x.beginPath(); x.arc(pad+40,150,38,0,7); x.arc(pad+110,140,46,0,7); x.arc(pad+190,150,40,0,7); x.fill();
  // blesk (rock)
  x.fillStyle='#ff3e74'; x.beginPath(); x.moveTo(270,180); x.lineTo(230,300); x.lineTo(270,300); x.lineTo(240,390);
  x.lineTo(320,260); x.lineTo(278,260); x.closePath(); x.fill();
}
function round(rx,ry,w,h,r){x.beginPath();x.moveTo(rx+r,ry);x.arcTo(rx+w,ry,rx+w,ry+h,r);x.arcTo(rx+w,ry+h,rx,ry+h,r);x.arcTo(rx,ry+h,rx,ry,r);x.arcTo(rx,ry,rx+w,ry,r);x.closePath();}
function dl(size,name,maskable){const t=document.createElement('canvas');t.width=t.height=size;const tx=t.getContext('2d');draw(maskable);tx.drawImage(c,0,0,size,size);const a=document.createElement('a');a.href=t.toDataURL('image/png');a.download=name;a.click();}
draw(false);
</script></body></html>
```

- [ ] **Step 3: Vygeneruj ikony**

Otevři `http://localhost:8080/icons/generate-icon.html` v běžném prohlížeči a stáhni všechny tři PNG do `icons/`. (Náhledové nástroje neumí stahovat soubory — tenhle krok udělej v reálném prohlížeči, nebo požádej uživatelku.)

- [ ] **Step 4: Ověř manifest**

`preview_eval` na `http://localhost:8080/`: `(function(){ return document.querySelector('link[rel=manifest]').href; })()` vrací URL; načti ji fetchem a zkontroluj, že je validní JSON.

- [ ] **Step 5: Commit**

```powershell
git add manifest.webmanifest icons/
git commit -m @'
feat: add PWA manifest and app icons

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

---

## Task 15: Service worker (offline) (`sw.js`)

**Files:**
- Create: `sw.js`

- [ ] **Step 1: Implementuj `sw.js`** (cache-first pro všechny vlastní soubory)

```javascript
const CACHE = 'lokac-v1';
const ASSETS = [
  './', './index.html', './styles.css', './manifest.webmanifest',
  './js/app.js', './js/data.js', './js/store.js', './js/stats.js',
  './js/achievements.js', './js/filters.js', './js/format.js',
  './js/screen-list.js', './js/screen-detail.js', './js/screen-stats.js',
  './js/screen-ach.js', './js/screen-settings.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png',
  // loga doplň v Tasku 16, např. './assets/logos/clock.png', ...
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
```

> Pozn.: registrace SW už je v `app.js` (Task 8). Při každé změně souborů zvyš `CACHE` (`lokac-v2`…), aby se cache obnovila.

- [ ] **Step 2: Ověř offline (manuálně v reálném prohlížeči)**

Otevři `http://localhost:8080/`, v DevTools → Application → Service Workers ověř „activated". Zaškrtni „Offline" a reload → appka stále funguje. (Náhledové nástroje SW spolehlivě netestují; udělej to v Chrome/Edge.)

- [ ] **Step 3: Commit**

```powershell
git add sw.js
git commit -m @'
feat: add service worker for offline support

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

---

## Task 16: Loga pivovarů

**Files:**
- Create: `assets/logos/*.png` (23 položek, best-effort)
- Modify: `js/data.js` (doplnit `logo:` k pivovarům, kde logo máme)
- Modify: `sw.js` (přidat loga do `ASSETS`)

- [ ] **Step 1: Sežeň loga**

Pro každý pivovar z `BREWERIES` najdi oficiální logo (web pivovaru / tiskové materiály) a ulož jako `assets/logos/<id>.png` (čtvercové, ideálně ≤ 200×200, s průhledným pozadím). Pro soukromé offline použití je to v pořádku. Kde logo nejde sehnat, nech barevný placeholder (žádný soubor → `logoHTML` použije iniciálu).

- [ ] **Step 2: Doplň cesty do `data.js`**

U pivovarů, kde logo máš, přidej pole `logo`:
```javascript
{ id:'clock', name:'Clock', color:'#e63946', ini:'CL', logo:'./assets/logos/clock.png' },
```
`logoHTML` (Task 7) už `logo` umí použít místo placeholderu.

- [ ] **Step 3: Přidej loga do `sw.js` ASSETS** a zvyš `CACHE` na `lokac-v2`.

- [ ] **Step 4: Ověř**

Reload appky, `preview_screenshot` seznamu → u pivovarů s logem je obrázek, u ostatních barevná iniciála. Žádné 404 v `preview_console_logs`.

- [ ] **Step 5: Commit**

```powershell
git add assets/logos js/data.js sw.js
git commit -m @'
feat: add brewery logos with placeholder fallback

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
```

---

## Task 17: Finální QA a nasazení na GitHub Pages

**Files:**
- Create: `README.md` (návod k instalaci do telefonu)

- [ ] **Step 1: Finální kontrola testů**

Otevři `http://localhost:8080/tests/tests.html`, `preview_eval`: `window.__TESTS__` → `failed === 0`. `preview_console_logs` (error) prázdné.

- [ ] **Step 2: Projetí všech obrazovek**

`preview_screenshot` pro list / detail / stats / ach / settings v tmavém i světlém režimu. Zkontroluj mužský rod ve všech textech.

- [ ] **Step 3: Napiš `README.md`** s návodem (krátce):

```markdown
# Lokáč — Pivní deník RFP 2026

Soukromá offline PWA. Lokálně: spusť `serve.ps1` a otevři http://localhost:8080/.

## Instalace do telefonu (přes GitHub Pages)
1. Vytvoř na GitHubu repozitář a nahraj obsah této složky.
2. Settings → Pages → Source: Deploy from a branch → `main` / root → Save.
3. Otevři vzniklou adresu `https://<účet>.github.io/<repo>/` na iPhonu (Safari) i Androidu (Chrome).
4. iPhone: Sdílet → „Přidat na plochu". Android: menu ⋮ → „Přidat na plochu / Nainstalovat aplikaci".
5. První otevření stáhne vše do telefonu → appka pak funguje offline. Odkaz lze poté zrušit.

## Záloha dat
Nastavení → Export zálohy (uloží JSON). Obnova: Nastavení → Obnovit ze zálohy.
```

- [ ] **Step 4: Commit + příprava na GitHub Pages**

```powershell
git add README.md
git commit -m @'
docs: add README with install and backup guide

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
'@
git branch -M main
```

- [ ] **Step 5: Nasazení (provede uživatelka, s asistencí)**

Vytvoř GitHub repo (přes web nebo `gh repo create`), pak:
```powershell
git remote add origin https://github.com/<účet>/<repo>.git
git push -u origin main
```
Zapni GitHub Pages (Settings → Pages → branch `main`, root). Po pár minutách je appka na `https://<účet>.github.io/<repo>/` — otevři v telefonu a „Přidat na plochu".

> Pozn.: protože `start_url`/`scope` a všechny cesty jsou relativní (`./`), appka funguje i z podsložky `…github.io/<repo>/`.

---

## Self-Review (vyplněno autorem plánu)

**Spec coverage:**
- Offline (PWA, service worker) → Task 15. ✓
- iOS+Android instalace → Task 14 (manifest), Task 17 (návod). ✓
- Seznam piv po pivovarech + filtry/hledání napříč → Task 9, predikát Task 6. ✓
- Vlastní piva (rotující výčepy) → Task 3 (store), Task 13 (formulář). ✓
- Hvězdy + poznámka + počítadlo + historie ťuknutí → Task 3 (store), Task 10 (detail). ✓
- Oblíbené (srdíčko) + filtr → Task 3, Task 6, Task 9/10. ✓
- Statistiky (1,2,4,5,6,7) → Task 4 (výpočty), Task 11 (obrazovka). ✓
- 22 odznaků → Task 5, Task 12. ✓
- Vzhled rock/tmavý + světlý přepínač → Task 7 (styly), Task 8 (motiv). ✓
- Záloha export/import → Task 3, Task 13. ✓
- Loga → Task 16. ✓
- Mužský rod → globální poznámka + kontrola v Task 17. ✓
- GitHub Pages → Task 17. ✓

**Placeholder scan:** UI tasky (9–13) odkazují na konkrétní existující kód v `náhledy/lokac-nahled.html` (ověřený prototyp) + uvádějí přesná rozhraní a refaktory — nejde o vágní „TODO". Logika a PWA infra mají kompletní kód. ✓

**Type consistency:** Rozhraní sjednotná napříč tasky: `createStore()` metody (`getBeer`, `getAllBeers`, `addTap`, `removeTap`, `setRating`, `setNote`, `toggleFav`, `getTheme`/`setTheme`, `getCustomBeers`/`addCustomBeer`/`updateCustomBeer`/`removeCustomBeer`, `exportJSON`/`importJSON`/`reset`); `computeStats(beers, userMap, days)`; `evaluateAchievements(stats)` → `{id,em,name,desc,value,target,unlocked,progressText}`; `beerMatches(beer, ud, filter, getBrewName)`; render funkce `render*(ctx, body)`; `openDetail(ctx, id)`; `ctx` tvar sjednocen v Task 8. Odznak používá `target` (ne `tgt`). ✓
