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
    const s2 = createStore(m);
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
  it('spins: default 0, incSpin zvyšuje a persistuje', () => {
    const m = mockStorage(); const s = createStore(m);
    expect(s.getSpins()).toBe(0);
    s.incSpin(); s.incSpin();
    expect(s.getSpins()).toBe(2);
    expect(createStore(m).getSpins()).toBe(2);
  });
  it('wheelPicked: addWheelPick bez duplicit', () => {
    const s = createStore(mockStorage());
    s.addWheelPick('b1'); s.addWheelPick('b1'); s.addWheelPick('b2');
    expect(s.getWheelPicked()).toEqual(['b1', 'b2']);
  });
  it('export → import obnoví spins i wheelPicked', () => {
    const m1 = mockStorage(); const s1 = createStore(m1);
    s1.incSpin(); s1.incSpin(); s1.addWheelPick('b3');
    const json = s1.exportJSON();
    const s2 = createStore(mockStorage());
    s2.importJSON(json);
    expect(s2.getSpins()).toBe(2);
    expect(s2.getWheelPicked()).toEqual(['b3']);
  });
  it('reset vynuluje spins i wheelPicked', () => {
    const s = createStore(mockStorage());
    s.incSpin(); s.addWheelPick('b1'); s.reset();
    expect(s.getSpins()).toBe(0);
    expect(s.getWheelPicked()).toEqual([]);
  });
});
