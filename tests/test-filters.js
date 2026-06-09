import { describe, it, expect } from './harness.js';
import { beerMatches } from '../js/filters.js';

const brewName = id => ({ clock: 'Clock', permon: 'Permon' }[id] || id);
const lezak = { id:'b1', brewery:'clock', name:'Hektor', style:'lezak', af:false, tap:false };
const nealko = { id:'b2', brewery:'permon', name:'Free IPA', style:'nealko', af:true, tap:false };
const tap = { id:'bt', brewery:'clock', name:'Rotující výčep', style:'', af:false, tap:true };
const ud = id => ({ b1:{rating:4,note:'',fav:true,taps:['2026-06-10T18:00']}, b2:{rating:0,note:'',fav:false,taps:[]} }[id] || {rating:0,note:'',fav:false,taps:[]});
const base = { q:'', taste:'all', brewery:'all', style:'all' };

describe('filters', () => {
  it('default zobrazí ochutnané i neochutnané', () => {
    expect(beerMatches(lezak, ud('b1'), base, brewName)).toBe(true);
    expect(beerMatches(nealko, ud('b2'), base, brewName)).toBe(true);
  });
  it('taste=tasted skryje neochutnaná', () => {
    expect(beerMatches(nealko, ud('b2'), {...base, taste:'tasted'}, brewName)).toBe(false);
    expect(beerMatches(lezak, ud('b1'), {...base, taste:'tasted'}, brewName)).toBe(true);
  });
  it('taste=fav nechá jen oblíbená', () => {
    expect(beerMatches(lezak, ud('b1'), {...base, taste:'fav'}, brewName)).toBe(true);
    expect(beerMatches(nealko, ud('b2'), {...base, taste:'fav'}, brewName)).toBe(false);
  });
  it('style filtruje napříč pivovary', () => {
    expect(beerMatches(nealko, ud('b2'), {...base, style:'nealko'}, brewName)).toBe(true);
    expect(beerMatches(lezak, ud('b1'), {...base, style:'nealko'}, brewName)).toBe(false);
  });
  it('q hledá v názvu piva i pivovaru', () => {
    expect(beerMatches(lezak, ud('b1'), {...base, q:'hek'}, brewName)).toBe(true);
    expect(beerMatches(lezak, ud('b1'), {...base, q:'clock'}, brewName)).toBe(true);
    expect(beerMatches(lezak, ud('b1'), {...base, q:'xyz'}, brewName)).toBe(false);
  });
  it('tap-dlaždice se ukáže jen bez aktivních filtrů', () => {
    expect(beerMatches(tap, ud('bt'), base, brewName)).toBe(true);
    expect(beerMatches(tap, ud('bt'), {...base, taste:'tasted'}, brewName)).toBe(false);
    expect(beerMatches(tap, ud('bt'), {...base, q:'hek'}, brewName)).toBe(false);
  });
});
