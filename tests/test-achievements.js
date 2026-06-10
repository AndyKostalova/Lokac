import { describe, it, expect } from './harness.js';
import { ACHIEVEMENTS, evaluateAchievements } from '../js/achievements.js';

describe('achievements', () => {
  it('má 30 odznaků', () => expect(ACHIEVEMENTS.length).toBe(30));
  it('každý má id, em, name, desc, target, val', () => {
    ACHIEVEMENTS.forEach(a => {
      expect(!!(a.id && a.em && a.name && a.desc)).toBeTruthy();
      expect(typeof a.val).toBe('function');
      expect(a.target !== undefined).toBeTruthy();
    });
  });
  it('evaluate vrací unlocked podle val >= target', () => {
    const stats = { tasted: 5, total: 103, totalDrinks: 5, rated: 0, nealkoTasted: 0,
      favCount: 0, noteCount: 0, maxBeerTaps: 1, nightOwl: false, maxDayCount: 1,
      styleCounts: { ipa: 0, dark: 0 }, brewsTasted: 1, stylesTasted: 1, daysActive: 1,
      anyBreweryComplete: false, bestBrewery: '1/4' };
    const res = evaluateAchievements(stats);
    const prvo = res.find(r => r.id === 'prvo');
    const rozjezd = res.find(r => r.id === 'rozjezd');
    const padesatka = res.find(r => r.id === 'padesatka');
    expect(prvo.unlocked).toBe(true);
    expect(rozjezd.unlocked).toBe(true);
    expect(padesatka.unlocked).toBe(false);
    expect(padesatka.progressText).toBe('5/50');
  });
  it('Král festivalu cílí na stats.total', () => {
    const res = evaluateAchievements({ tasted: 103, total: 103, totalDrinks: 0, rated: 0,
      nealkoTasted: 0, favCount: 0, noteCount: 0, maxBeerTaps: 0, nightOwl: false,
      maxDayCount: 0, styleCounts: {}, brewsTasted: 0, stylesTasted: 0, daysActive: 0,
      anyBreweryComplete: false, bestBrewery: '0/0' });
    expect(res.find(r => r.id === 'kral').unlocked).toBe(true);
  });
  it('odznaky kola reagují na spins a wheelTasted', () => {
    const base = { tasted: 0, total: 103, totalDrinks: 0, rated: 0, nealkoTasted: 0,
      favCount: 0, noteCount: 0, maxBeerTaps: 0, nightOwl: false, maxDayCount: 0,
      styleCounts: {}, brewsTasted: 0, stylesTasted: 0, daysActive: 0,
      anyBreweryComplete: false, bestBrewery: '0/0', spins: 0, wheelTasted: 0 };
    const none = evaluateAchievements(base);
    expect(none.find(r => r.id === 'stastlivec').unlocked).toBe(false);
    const spun = evaluateAchievements({ ...base, spins: 25, wheelTasted: 5 });
    expect(spun.find(r => r.id === 'stastlivec').unlocked).toBe(true);
    expect(spun.find(r => r.id === 'hazarder').unlocked).toBe(true);
    expect(spun.find(r => r.id === 'jackpot').unlocked).toBe(false);
    expect(spun.find(r => r.id === 'osud').unlocked).toBe(true);
    expect(spun.find(r => r.id === 'risk').unlocked).toBe(true);
  });
});
