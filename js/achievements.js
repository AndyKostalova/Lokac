export const ACHIEVEMENTS = [
  { id:'prvo', em:'🍺', name:'Prvotřídní', desc:'Ochutnej první pivo', target:1, val:s=>s.tasted },
  { id:'rozjezd', em:'🚀', name:'Rozjezd', desc:'Ochutnej 5 různých piv', target:5, val:s=>s.tasted },
  { id:'deci', em:'🔟', name:'Decimálka', desc:'Celkem 10 piv', target:10, val:s=>s.totalDrinks },
  { id:'maraton', em:'🏃', name:'Maratonec', desc:'Celkem 25 piv', target:25, val:s=>s.totalDrinks },
  { id:'padesatka', em:'🏅', name:'Padesátka', desc:'Ochutnej 50 různých piv', target:50, val:s=>s.tasted },
  { id:'sto', em:'💯', name:'Stovkař', desc:'Ochutnej 100 různých piv', target:100, val:s=>s.tasted },
  { id:'kral', em:'👑', name:'Král festivalu', desc:'Ochutnej úplně všechna piva', target:s=>s.total, val:s=>s.tasted },
  { id:'cest', em:'🌍', name:'Cestovatel', desc:'Piva od 5 různých pivovarů', target:5, val:s=>s.brewsTasted },
  { id:'lokal', em:'🗺️', name:'Lokálpatriot', desc:'Piva od 10 různých pivovarů', target:10, val:s=>s.brewsTasted },
  { id:'verny', em:'🏭', name:'Věrný fanoušek', desc:'Všechna piva jednoho pivovaru', target:1,
    val:s=>s.anyBreweryComplete?1:0, prog:s=>s.bestBrewery },
  { id:'styl', em:'🌈', name:'Sběratel stylů', desc:'Piva ze 4 různých stylů', target:4, val:s=>s.stylesTasted },
  { id:'mistr', em:'🎨', name:'Mistr stylů', desc:'Ochutnej všech 9 stylů', target:9, val:s=>s.stylesTasted },
  { id:'chmel', em:'🌿', name:'Chmelová hlava', desc:'5 piv stylu IPA / APA', target:5, val:s=>s.styleCounts.ipa||0 },
  { id:'tma', em:'🌑', name:'Tmavá strana', desc:'3 tmavá / speciál piva', target:3, val:s=>s.styleCounts.dark||0 },
  { id:'zodp', em:'🚫', name:'Zodpovědný', desc:'Ochutnej 3 nealko piva', target:3, val:s=>s.nealkoTasted },
  { id:'stamgast', em:'🍻', name:'Štamgast', desc:'Dej si jedno pivo aspoň 5×', target:5, val:s=>s.maxBeerTaps },
  { id:'zizen', em:'🔥', name:'Žíznivý den', desc:'5 piv během jednoho dne', target:5, val:s=>s.maxDayCount },
  { id:'sova', em:'🦉', name:'Noční sova', desc:'Pivo mezi půlnocí a 4:00', target:1, val:s=>s.nightOwl?1:0 },
  { id:'krit', em:'⭐', name:'Kritik', desc:'Ohodnoť 20 piv', target:20, val:s=>s.rated },
  { id:'srdcar', em:'💗', name:'Srdcař', desc:'Označ 5 oblíbených', target:5, val:s=>s.favCount },
  { id:'recenzent', em:'📝', name:'Recenzent', desc:'Napiš poznámku k 10 pivům', target:10, val:s=>s.noteCount },
  { id:'vytr', em:'🌅', name:'Vytrvalec', desc:'Pivo v každý den festivalu', target:5, val:s=>s.daysActive },
];

export function evaluateAchievements(stats) {
  return ACHIEVEMENTS.map(a => {
    const value = a.val(stats);
    const target = typeof a.target === 'function' ? a.target(stats) : a.target;
    const unlocked = value >= target;
    const progressText = a.prog ? a.prog(stats) : `${Math.min(value, target)}/${target}`;
    return { id: a.id, em: a.em, name: a.name, desc: a.desc, value, target, unlocked, progressText };
  });
}
