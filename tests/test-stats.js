import { describe, it, expect } from './harness.js';
import { computeStats } from '../js/stats.js';

const beers = [
  { id: 'b1', brewery: 'clock', style: 'lezak', af: false, tap: false },
  { id: 'b2', brewery: 'clock', style: 'ipa', af: false, tap: false },
  { id: 'b3', brewery: 'permon', style: 'nealko', af: true, tap: false },
  { id: 'bt', brewery: 'clock', style: '', af: false, tap: true },
];
const days = ['2026-06-10','2026-06-11'];
const userMap = {
  b1: { rating: 5, note: 'super', fav: true, taps: ['2026-06-10T18:00','2026-06-10T20:00','2026-06-11T01:00'] },
  b2: { rating: 0, note: '', fav: false, taps: ['2026-06-11T12:00'] },
  b3: { rating: 4, note: 'fajn', fav: false, taps: [] },
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

describe('stats – kolo (meta)', () => {
  const beersW = [
    { id: 'b1', brewery: 'clock', style: 'lezak', af: false, tap: false },
    { id: 'b2', brewery: 'clock', style: 'ipa', af: false, tap: false },
  ];
  const daysW = ['2026-06-10'];
  const umW = { b1: { rating: 0, note: '', fav: false, taps: ['2026-06-10T12:00'] } }; // b1 ochutnáno, b2 ne
  it('spins se přenese z meta', () => {
    expect(computeStats(beersW, umW, daysW, { spins: 7, wheelPicked: [] }).spins).toBe(7);
  });
  it('wheelTasted = vylosovaná piva, která jsou ochutnaná', () => {
    const s2 = computeStats(beersW, umW, daysW, { spins: 0, wheelPicked: ['b1', 'b2'] });
    expect(s2.wheelTasted).toBe(1);
  });
  it('bez meta => spins 0, wheelTasted 0', () => {
    const s2 = computeStats(beersW, umW, daysW);
    expect(s2.spins).toBe(0);
    expect(s2.wheelTasted).toBe(0);
  });
});
