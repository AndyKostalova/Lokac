const KEY = 'lokac_v1';

function blank() { return { v: 1, theme: 'dark', beers: {}, custom: [], spins: 0, wheelPicked: [] }; }

export function createStore(storage = window.localStorage) {
  let state;
  try { state = JSON.parse(storage.getItem(KEY)) || blank(); }
  catch { state = blank(); }
  if (!state.beers) state.beers = {};
  if (!state.custom) state.custom = [];
  if (!state.theme) state.theme = 'dark';
  if (typeof state.spins !== 'number') state.spins = 0;
  if (!Array.isArray(state.wheelPicked)) state.wheelPicked = [];

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

    getSpins() { return state.spins; },
    incSpin() { state.spins++; persist(); return state.spins; },
    getWheelPicked() { return [...state.wheelPicked]; },
    addWheelPick(id) { if (!state.wheelPicked.includes(id)) { state.wheelPicked.push(id); persist(); } },

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
      if (typeof state.spins !== 'number') state.spins = 0;
      if (!Array.isArray(state.wheelPicked)) state.wheelPicked = [];
      persist();
    },
    reset() { state = blank(); persist(); },
  };
}
