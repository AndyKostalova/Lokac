// Čistá logika kola štěstí (bez DOM).

// Vrátí piva, ze kterých lze losovat.
// mode: 'untasted' = jen piva s počítadlem 0; 'all' = všechna reálná piva.
// Rotující výčepy (tap) se vždy vynechají.
export function wheelPool(beers, userMap, mode) {
  return beers.filter(b => {
    if (b.tap) return false;
    if (mode === 'untasted') {
      const ud = userMap[b.id];
      return !ud || ud.taps.length === 0;
    }
    return true;
  });
}

// Náhodný prvek pole (rng lze injektovat kvůli testům). Prázdné pole => null.
export function pickRandom(arr, rng = Math.random) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(rng() * arr.length)];
}
