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
