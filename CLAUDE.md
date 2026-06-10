# CLAUDE.md

Pokyny pro práci na tomto projektu. Čti dřív, než začneš upravovat kód.

## Projekt

**Lokáč — Pivní deník RFP 2026.** Soukromá, plně offline PWA pro sledování, hodnocení
a počítání piv ochutnaných na festivalu Rock for People 2026 (10.–14. 6. 2026).
Běží na iOS i Androidu, instaluje se přes „Přidat na plochu", data zůstávají jen v telefonu.

## Klíčové konvence (DŮLEŽITÉ)

- **Jazyk UI: čeština, vždy v mužském rodě** (např. „Ochutnal jsi", „Vytrvalec", „Zodpovědný").
  Platí i pro názvy/popisy achievementů a všechny hlášky.
- **Žádný build, žádné závislosti.** Čisté HTML + CSS + JavaScript (ES moduly). Nepřidávej
  bundlery ani frameworky.
- **V prostředí NENÍ Node, npm ani funkční Python.** Nepoužívej je. Server i nástroje běží přes PowerShell.
- **Cesty jsou relativní (`./`)** — appka musí fungovat i z podsložky (GitHub Pages: `…github.io/<repo>/`).

## Spuštění a testy

- **Spuštění appky:** `powershell -ExecutionPolicy Bypass -File serve.ps1` → <http://localhost:8080/>
  (statický server přes `System.Net.HttpListener`, žádné závislosti).
- **Testy:** otevři <http://localhost:8080/tests/tests.html>. Jde o vlastní in-browser harness
  (žádný Node). Výsledky jsou i v `window.__TESTS__ = {passed, failed, failures}` — čitelné přes
  preview nástroje (`preview_eval`). Cíl: `failed === 0`.
- **Preview konfigurace** v `.claude/launch.json`: `app` (port 8080, appka) a `nahled` (port 8137, původní náhled).

## Struktura

```
index.html, styles.css          # kostra (fullscreen) a vzhled (motivy přes :root[data-theme])
js/
  data.js          # seed: STYLES (9), BREWERIES (23), BEERS (103+rotující), REALCOUNT, DAYS, DAY_LBL
  store.js         # createStore() – uživatelská data v localStorage (klíč 'lokac_v1'), export/import
  stats.js         # computeStats(beers, userMap, days) – čistá funkce
  achievements.js  # ACHIEVEMENTS (22) + evaluateAchievements(stats)
  filters.js       # beerMatches(beer, ud, filter, getBrewName)
  format.js        # shade, starStr, logoHTML, fmtDateTime
  screen-*.js      # renderList/openDetail/renderStats/renderAch/renderSettings(ctx, body)
  app.js           # bootstrap, navigace, motiv, registrace SW; vytváří `ctx`
sw.js, manifest.webmanifest, icons/   # PWA (offline cache, instalace, ikona)
assets/logos/                          # loga pivovarů (zatím placeholdery – viz README tam)
tests/                                 # harness.js + test-*.js + tests.html
docs/superpowers/{specs,plans}/        # návrhová specifikace a implementační plán
náhledy/                               # původní schválený vizuální náhled (zdroj pravdy pro vzhled)
```

## Architektura

- **Čistá logika** (`data`, `store`, `stats`, `achievements`, `filters`) je bez DOM a má jednotkové testy.
- **Obrazovky** (`screen-*.js`) exportují `render…(ctx, body)` a vykreslují do `#body`.
  Po změně stavu volej `ctx.rerender()`. Detail je spodní list (`#sheet` + `#sheetBg`).
- **`ctx`** (v `app.js`) drží: `store`, `BREWERIES`, `STYLES`, `REALCOUNT`, `DAYS`, `DAY_LBL`,
  `allBeers()` (seed + vlastní piva), `brewById`, `brewName`, `filter`, `openBrews`,
  `rerender`, `closeSheet`, `toggleTheme`, `openDetail`.
- **Bez globálů a bez inline `onclick`** — handlery přes `addEventListener`. Uživatelské texty
  (názvy vlastních piv, poznámky) prochází `esc()` proti rozbití markupu.

## Pravidla při úpravách

- Novou logiku piš **test-driven**: přidej `tests/test-*.js` a naimportuj ho v `tests/tests.html`.
- Když přidáš/změníš soubor appky, **přidej ho do `ASSETS` v `sw.js`** a **zvyš verzi cache**
  (`lokac-v1` → `lokac-v2` …), jinak se offline cache neobnoví.
- Statistiky musí zůstat konzistentní s tím, co se zobrazuje (např. `maxDayCount` se počítá
  z kalendářních `dayCounts`).
- Skutečná loga pivovarů: vlož PNG do `assets/logos/`, doplň `logo:` k pivovaru v `data.js`
  a cestu přidej do `sw.js` (viz `assets/logos/README.md`).

## Git a nasazení

- Vývoj probíhal na větvi `vyvoj`, slučuje se do `main`. Commit messages končí:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- **Nasazení:** GitHub Pages z větve `main` (root). Pak otevřít `https://<účet>.github.io/<repo>/`
  v telefonu → „Přidat na plochu". Repo: <https://github.com/AndyKostalova/Lokac>.

## Data festivalu

23 pivovarů, 103 reálných piv + 2 dlaždice „rotující výčep", 9 stylů, 22 achievementů,
festivalové dny 10.–14. 6. 2026. Zdroj: <https://rockforpeople.cz/en/beer-lineup/>.
