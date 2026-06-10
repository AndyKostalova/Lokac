# Loga pivovarů

Aplikace zatím používá **stylizované placeholdery** (barevné kolečko se zkratkou pivovaru).
Kód je připravený na skutečná loga — funkce `logoHTML` v `js/format.js` použije obrázek,
jakmile má pivovar v `js/data.js` vyplněné pole `logo`.

## Jak doplnit skutečné logo

1. Ulož logo sem jako čtvercový PNG s průhledným pozadím, ideálně ≤ 200×200 px,
   pojmenované podle `id` pivovaru, např. `clock.png`, `prazdroj.png`, `hak.png`.
   (Seznam `id` je v `js/data.js` v poli `BREWERIES`.)
2. V `js/data.js` přidej k danému pivovaru cestu k logu, např.:
   ```js
   { id:"clock", name:"Clock", color:"#e63946", ini:"CL", logo:"./assets/logos/clock.png" },
   ```
3. Přidej cestu k logu do pole `ASSETS` v `sw.js` (kvůli offline cache)
   a zvyš verzi cache (`lokac-v1` → `lokac-v2`), ať se cache obnoví.

Pivovary bez vyplněného `logo` dál používají placeholder — můžeš tedy doplňovat
loga postupně, appka funguje i s částečnou sadou.
