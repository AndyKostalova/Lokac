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
