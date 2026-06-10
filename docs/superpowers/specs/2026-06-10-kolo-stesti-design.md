# Kolo štěstí 🎰 — Návrhová specifikace

**Datum:** 2026-06-10
**Stav:** Schváleno k implementaci
**Kontext:** Rozšíření existující appky Lokáč (Pivní deník RFP 2026). Větev `kolo-stesti`.

---

## 1. Účel

Přidat do appky „kolo štěstí" ve stylu **casino automatu**, které vylosuje náhodné pivo.
Uživatel může přepínat, zda losuje z **neochutnaných** nebo ze **všech** piv, a opakovaně točit.
K funkci se vážou nové achievementy. Vše v češtině, v mužském rodě, offline, bez build-kroku.

## 2. Umístění a navigace

Nová (5.) záložka ve spodní liště. Pořadí:
**🍺 Piva · 🎰 Kolo · 📊 Statistiky · 🏅 Odznaky · ⚙️ Nastavení.**

## 3. Obrazovka „Kolo" (`js/screen-wheel.js`, `renderWheel(ctx, body)`)

- **Přepínač režimu** (chipy): `Neochutnaná piva` ↔ `Všechna piva`. Výchozí: „Neochutnaná piva".
- **Automat (slot)**: okénko s neonovým rámem a probleskujícími světýlky; uvnitř „válec",
  který při losování rychle roluje názvy piv, zpomalí a zastaví na vylosovaném.
- **Tlačítko** „Roztočit" (před prvním losováním) / „Točit znovu" (po výsledku) — stylizované
  jako blikající knoflík/páka automatu.
- **Výsledek**: karta vylosovaného piva (logo pivovaru, název, pivovar, tagy: styl, ABV, nealko) + akce:
  - **🍺 Dal jsem si (+1)** — `store.addTap(id)`, krátká odezva; pivo se tím stává ochutnaným.
  - **Detail piva** — otevře spodní list detailu (`ctx.openDetail(id)`).
  - **Točit znovu** — losuje znovu ze stejného režimu.
- **Prázdný stav** (režim „Neochutnaná" a vše ochutnáno): hláška
  „Všechno ochutnáno! 🏆 Není už co losovat." + pobídka přepnout na „Všechna piva".
- **Vzhled**: paleta appky (zlatá + rocková červeno-purpurová) s neonovým casino nádechem;
  funguje v tmavém i světlém režimu. Žádné externí závislosti.

## 4. Čistá logika (`js/wheel.js`) — testovaná

- `wheelPool(beers, userMap, mode)` → pole piv k losování:
  - vynechá rotující výčepy (`tap`),
  - `mode === 'untasted'` → jen piva s počítadlem 0 (`userMap[id]?.taps.length || 0 === 0`),
  - `mode === 'all'` → všechna reálná piva.
- `pickRandom(arr, rng = Math.random)` → náhodný prvek pole, nebo `null` pro prázdné pole.

Animaci a DOM řeší `screen-wheel.js`; `wheel.js` je bez DOM.

## 5. Ukládání (rozšíření `js/store.js`)

Do stavu (a do `blank()`, exportu/importu, resetu) přibývá:
- `spins` (number) — celkový počet roztočení.
- `wheelPicked` (pole `beerId`) — která piva kolo vylosovalo (bez duplicit).

Nové metody:
- `getSpins()` / `incSpin()` (spins++),
- `getWheelPicked()` / `addWheelPick(id)` (přidá id, pokud tam není).

Export/import a reset musí tato pole zahrnout; starší zálohy bez nich se načtou s prázdnými výchozími hodnotami.

## 6. Statistiky (rozšíření `js/stats.js`)

`computeStats(beers, userMap, days, meta = { spins: 0, wheelPicked: [] })` doplní:
- `spins` = `meta.spins`,
- `wheelTasted` = počet `meta.wheelPicked`, která mají v `userMap` počítadlo > 0.

Volající (`screen-stats.js`, `screen-ach.js`) předají
`{ spins: store.getSpins(), wheelPicked: store.getWheelPicked() }`.

## 7. Achievementy (rozšíření `js/achievements.js`) — celkem 30

K stávajícím 22 přibývá 8:

| Ikona | Název | Podmínka |
|---|---|---|
| 🎰 | Šťastlivec | roztoč kolo poprvé (`spins ≥ 1`) |
| 🎲 | Hazardér | 25 roztočení (`spins ≥ 25`) |
| 💰 | Jackpot | 50 roztočení (`spins ≥ 50`) |
| 🍀 | Osud rozhodl | ochutnej 1 vylosované pivo (`wheelTasted ≥ 1`) |
| 🃏 | Risk je zisk | ochutnej 5 vylosovaných piv (`wheelTasted ≥ 5`) |
| 🏛️ | Velvyslanec | pivo od 20 různých pivovarů (`brewsTasted ≥ 20`) |
| 🛢️ | Tank | celkem 50 piv (`totalDrinks ≥ 50`) |
| 🍏 | Cidrmaniak | ochutnej 3 cidery (`styleCounts.cider ≥ 3`) |

## 8. Integrace a další úpravy

- `js/app.js`: import `renderWheel`, přidat case `wheel` do `show()`, přidat ho na `ctx` (kvůli rerenderu).
  Tlačítko/akce kola volají `store.addTap`, `store.incSpin`, `store.addWheelPick`, pak `ctx.rerender()`/překreslení.
- `index.html`: přidat 5. tlačítko `.tab` s `data-scr="wheel"` na druhé místo (za Piva).
- `styles.css`: styly automatu (okénko, neon, válec, světýlka, tlačítko), `.fld` apod. už existují.
- `sw.js`: přidat `./js/wheel.js` a `./js/screen-wheel.js` do `ASSETS` a **zvýšit cache na `lokac-v2`**.
- FAB („+") zůstává jen na obrazovce „Piva".

## 9. Testy

- `tests/test-wheel.js` — `wheelPool` (oba režimy, vynechání tapů), `pickRandom` (prázdné/neprázdné, deterministicky s vlastním `rng`).
- `tests/test-store.js` — doplnit: `spins`/`incSpin`, `addWheelPick`/`getWheelPicked` (bez duplicit), export/import obnoví i tato pole.
- `tests/test-stats.js` — doplnit: `spins` a `wheelTasted` z `meta`.
- `tests/test-achievements.js` — počet odznaků 30; ověřit odemčení nových (Šťastlivec, Risk je zisk, Velvyslanec…).
- Naimportovat `test-wheel.js` v `tests/tests.html`.
- Cíl: `window.__TESTS__.failed === 0`.

## 10. Ověření

V živé appce (preview, mobilní viewport): nová záložka, přepínač režimů, animace rolování,
výsledková karta + tři akce, prázdný stav, casino vzhled v tmavém i světlém režimu, 30 odznaků
(„Odemčeno N z 30"), žádné chyby v konzoli. Service worker po bumpnutí cache načte nové soubory.

## 11. Nasazení

Práce na větvi `kolo-stesti` → PR → merge do `main` (GitHub Pages se přenasadí samo).
Po nasazení znovu „Přidat na plochu" není nutné — service worker s `lokac-v2` se aktualizuje sám.
