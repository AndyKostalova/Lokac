export function computeStats(beers, userMap, days) {
  const real = beers.filter(b => !b.tap);
  const styleKeys = [...new Set(real.map(b => b.style).filter(Boolean))];
  let tasted = 0, totalDrinks = 0, rated = 0, nealkoTasted = 0, favCount = 0, noteCount = 0, maxBeerTaps = 0, nightOwl = false;
  const brews = new Set(), styles = new Set(), daySet = new Set();
  const styleCounts = {}; styleKeys.forEach(k => styleCounts[k] = 0);
  const dayCounts = {}; days.forEach(d => dayCounts[d] = 0); let other = 0;
  const sessionCounts = {}; days.forEach(d => sessionCounts[d] = 0);

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
      // festival session: hours 0-3 belong to the previous festival day
      const dayIdx = days.indexOf(day);
      const sessionDay = (hr < 4 && dayIdx > 0) ? days[dayIdx - 1] : day;
      if (sessionCounts[sessionDay] != null) sessionCounts[sessionDay]++;
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

  const maxDayCount = Math.max(0, ...days.map(d => sessionCounts[d]));
  return {
    tasted, total: real.length, totalDrinks, rated, nealkoTasted, favCount, noteCount,
    maxBeerTaps, nightOwl, maxDayCount, styleCounts,
    brewsTasted: brews.size, stylesTasted: styles.size, daysActive: daySet.size,
    anyBreweryComplete: anyComplete, bestBrewery, dayCounts, other,
  };
}
