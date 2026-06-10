import { describe, it, expect } from './harness.js';
import { wheelPool, pickRandom } from '../js/wheel.js';

const beers = [
  { id: 'b1', tap: false }, { id: 'b2', tap: false }, { id: 'b3', tap: false }, { id: 'bt', tap: true },
];
const userMap = { b1: { taps: ['x'] }, b2: { taps: [] } }; // b3 chybí => bráno jako neochutnané

describe('wheel', () => {
  it('wheelPool all = reálná piva bez rotujících výčepů', () => {
    expect(wheelPool(beers, userMap, 'all').map(b => b.id)).toEqual(['b1', 'b2', 'b3']);
  });
  it('wheelPool untasted = jen neochutnaná (počítadlo 0)', () => {
    expect(wheelPool(beers, userMap, 'untasted').map(b => b.id)).toEqual(['b2', 'b3']);
  });
  it('pickRandom vrací prvek podle rng', () => {
    const arr = ['a', 'b', 'c', 'd'];
    expect(pickRandom(arr, () => 0)).toBe('a');
    expect(pickRandom(arr, () => 0.99)).toBe('d');
    expect(pickRandom(arr, () => 0.5)).toBe('c');
  });
  it('pickRandom prázdné pole => null', () => {
    expect(pickRandom([], () => 0)).toBe(null);
  });
});
