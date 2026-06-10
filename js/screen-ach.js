import { computeStats } from './stats.js';
import { evaluateAchievements } from './achievements.js';

export function renderAch(ctx, body) {
  const s = computeStats(ctx.allBeers(), ctx.store.getAllBeers(), ctx.DAYS,
    { spins: ctx.store.getSpins(), wheelPicked: ctx.store.getWheelPicked() });
  const res = evaluateAchievements(s);
  const unlocked = res.filter(r => r.unlocked).length;
  body.innerHTML = `<h2 class="scr-title">🏅 Odznaky</h2>
    <div style="color:var(--dim);font-size:12.5px;margin:0 2px 6px">Odemčeno ${unlocked} z ${res.length}</div>
    <div class="badges">${res.map(a => `
      <div class="badge ${a.unlocked ? 'unlocked' : 'locked'}">
        <div class="em">${a.em}</div><b>${a.name}</b><small>${a.desc}</small>
        <div class="pbar"><i style="width:${Math.min(100, a.value / a.target * 100)}%"></i></div>
        <small style="margin-top:5px">${a.unlocked ? 'Hotovo ✓' : a.progressText}</small>
      </div>`).join('')}</div>`;
}
