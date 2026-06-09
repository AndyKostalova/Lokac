export const STYLES = {
  lezak:{label:"Ležák / světlé", color:"#f4b836"},
  ipa:{label:"IPA / APA", color:"#6cc24a"},
  sour:{label:"Sour / kyselák", color:"#e85d9c"},
  summer:{label:"Summer Ale", color:"#ffa94d"},
  wheat:{label:"Pšeničné", color:"#e9c46a"},
  dark:{label:"Tmavé / speciál", color:"#a06a3c"},
  nealko:{label:"Nealko", color:"#4aa3e8"},
  cider:{label:"Cider", color:"#8ed11f"},
  radler:{label:"Radler / limo", color:"#c77dff"}
};

export const BREWERIES = [
 {id:"clock", name:"Clock", color:"#e63946", ini:"CL"},
 {id:"klenot", name:"Klenot", color:"#2a9d8f", ini:"KL"},
 {id:"permon", name:"Permon", color:"#f4a261", ini:"PE"},
 {id:"madcat", name:"MadCat", color:"#9d4edd", ini:"MC"},
 {id:"cerno", name:"Černokostelecký pivovar", color:"#457b9d", ini:"ČK"},
 {id:"budmik", name:"Budvar & Mikkeller", color:"#ffb703", ini:"B&M"},
 {id:"hak", name:"Hákův Parní Pivovar", color:"#06a77d", ini:"HÁ"},
 {id:"prazdroj", name:"Plzeňský Prazdroj", color:"#c1121f", ini:"PP"},
 {id:"opice", name:"Nachmelená Opice", color:"#8338ec", ini:"NO"},
 {id:"elektrarna", name:"Elektrárna", color:"#fb8500", ini:"EL"},
 {id:"tatuv", name:"Cider Tátův sad", color:"#80b918", ini:"TS"},
 {id:"heineken", name:"Heineken", color:"#2e933c", ini:"HK"},
 {id:"chotebor", name:"Chotěboř", color:"#3a6ea5", ini:"CH"},
 {id:"rampusak", name:"Rampušák", color:"#bc6c25", ini:"RA"},
 {id:"strongbow", name:"Strongbow", color:"#d62828", ini:"SB"},
 {id:"pocernice", name:"Dolní Počernice", color:"#6a994e", ini:"DP"},
 {id:"budvar", name:"Budějovický Budvar", color:"#0353a4", ini:"BV"},
 {id:"unetice", name:"Únětický Pivovar", color:"#7209b7", ini:"ÚN"},
 {id:"desperados", name:"Desperados", color:"#e85d04", ini:"DE"},
 {id:"amity", name:"Amity Drinks", color:"#43aa8b", ini:"AM"},
 {id:"staropramen", name:"Pivovary Staropramen", color:"#e09f3e", ini:"ST"},
 {id:"bernard", name:"Bernard", color:"#386641", ini:"BE"},
 {id:"budvarcraft", name:"Budvar craft beer stage", color:"#023e8a", ini:"BC"}
];

/* každé pivo: [pivovar, název, styl, abv, nealko?, tap?] */
const RAW = [
 ["clock","10° Hektor","lezak","10°"],
 ["clock","10° Jackpot (tangerine NEIPA)","ipa","10°"],
 ["clock","11° Vošta","lezak","11°"],
 ["clock","Krystus Nealko IPA","nealko","0,0%",true],
 ["clock","Rotující výčep (15 druhů)","",,, true],

 ["klenot","Polotmavé 11° festivalová","dark","11°"],
 ["klenot","12° nefiltr","lezak","12°"],
 ["klenot","Festivalový Hazy ALE 11°","ipa","11°"],
 ["klenot","Kyseláč mango & broskev 10°","sour","10°"],
 ["klenot","IPA 15°","ipa","15°"],
 ["klenot","Pšeničné","wheat"],
 ["klenot","Nealko grep","nealko","0,0%",true],
 ["klenot","Komix cider","cider"],
 ["klenot","Sezonní speciál","dark"],

 ["permon","Těhotná Dvanáctka","lezak","12°"],
 ["permon","Sokolovská Desítka","lezak","10°"],
 ["permon","PAPA","ipa"],
 ["permon","Sherpa IPA","ipa"],
 ["permon","Summer ALE","summer"],
 ["permon","Tropical Fruit Sour","sour"],

 ["madcat","Summer ALE Jiskra","summer"],
 ["madcat","Fruit Sour Mango-Piňa-Coco","sour"],
 ["madcat","Ležák","lezak"],
 ["madcat","Session NEIPA Juicy Cat","ipa"],
 ["madcat","Nealko Madcat","nealko","0,0%",true],

 ["cerno","Dešťovka 10°","lezak","10°"],
 ["cerno","Vycpaná Vydra 12°","lezak","12°"],
 ["cerno","Rock Svině Summer ALE 9°","summer","9°"],
 ["cerno","West Coast IPA 12°","ipa","12°"],
 ["cerno","Černá Svině 13°","dark","13°"],
 ["cerno","Kyselátko Grep Limeta 12°","sour","12°"],
 ["cerno","Tropival Yuzu Nealko","nealko","0,0%",true],

 ["budmik","Twogether Forever Summer ALE","summer"],

 ["hak","Hák 10°","lezak","10°"],
 ["hak","Hák 11°","lezak","11°"],
 ["hak","POETA Hák Černá 13°","dark","13°"],
 ["hak","ASTRONAUT Galaxy IPA 15°","ipa","15°"],
 ["hak","AMÍK APA 13°","ipa","13°"],
 ["hak","BEACH BOY Summer Ale 8°","summer","8°"],
 ["hak","CELEBRITA Neipa 14°","ipa","14°"],
 ["hak","ZAHRADNICE Pampeliška ALE 10°","summer","10°"],
 ["hak","Session ALE 9° Ovocný","summer","9°"],
 ["hak","ROŠŤÁK MangoSour 11°","sour","11°"],
 ["hak","CHULIGÁN Black Currant Sour Shake 10°","sour","10°"],
 ["hak","White APA 12°","ipa","12°"],
 ["hak","GENTLEMAN RedAle 11°","dark","11°"],
 ["hak","Řezané","dark"],

 ["prazdroj","Pilsner Urquell","lezak","12°"],
 ["prazdroj","Radegast Rázná","lezak"],
 ["prazdroj","Birell Pomelo & Grep","nealko","0,0%",true],
 ["prazdroj","Birell Nealko","nealko","0,0%",true],
 ["prazdroj","Radegast Rezist","lezak"],

 ["opice","11° Ležák","lezak","11°"],
 ["opice","12° Sun APA","ipa","12°"],
 ["opice","Nealko IPA Free","nealko","0,0%",true],
 ["opice","15° Pastry Kyseláč rybíz, vanilka, malina","sour","15°"],
 ["opice","13° Nectaron Hazy Pale Ale","ipa","13°"],

 ["elektrarna","Pilsner Urquell","lezak","12°"],
 ["elektrarna","Radegast Rázná","lezak"],
 ["elektrarna","Birell Pomelo & Grep","nealko","0,0%",true],
 ["elektrarna","Birell Nealko","nealko","0,0%",true],
 ["elektrarna","Radegast Rezist","lezak"],

 ["tatuv","Craft Cider suchý","cider"],
 ["tatuv","Craft Cider Veselá višeň","cider"],

 ["heineken","Heineken","lezak"],
 ["heineken","Heineken 0,0","nealko","0,0%",true],

 ["chotebor","Prémium 12%","lezak","12°"],
 ["chotebor","Plus 11%","lezak","11°"],
 ["chotebor","Polo 11%","dark","11°"],
 ["chotebor","Patron Nealkoholický","nealko","0,0%",true],
 ["chotebor","Radler nealko","radler","0,0%",true],
 ["chotebor","Radler","radler"],
 ["chotebor","Bezinka Limo","radler"],

 ["rampusak","Dobrušská nefiltr 11°","lezak","11°"],
 ["rampusak","Rampušák nefiltr 12°","lezak","12°"],
 ["rampusak","Summer ALE 9°","summer","9°"],
 ["rampusak","Rock´n´ALE 11°","summer","11°"],
 ["rampusak","Sour ALE Mango-Maracuja 11°","sour","11°"],
 ["rampusak","DryHop Nealkoholický","nealko","0,0%",true],
 ["rampusak","Blood Orange Nealkoholický","nealko","0,0%",true],

 ["strongbow","Gold Apple Cider","cider"],

 ["pocernice","Počernická 12°","lezak","12°"],
 ["pocernice","Kopřivový Speciál 12°","dark","12°"],
 ["pocernice","Barborka Černá 13°","dark","13°"],
 ["pocernice","Summer ALE 11°","summer","11°"],
 ["pocernice","Počernický Radler Meruňka","radler"],
 ["pocernice","Limonáda Broňa","radler"],

 ["budvar","Budvar 33","lezak"],
 ["budvar","Budvar Original","lezak"],
 ["budvar","Redix","radler"],

 ["unetice","Letní Speciál Únětická 8°","lezak","8°"],
 ["unetice","Únětická 10,7° filtrovaná","lezak","10,7°"],
 ["unetice","Skippy XPA","ipa"],
 ["unetice","Únulka IPA Nealko","nealko","0,0%",true],

 ["desperados","Desperados Original","lezak"],

 ["amity","Cider Jablko-Hruška","cider"],
 ["amity","Cider Polosuchý","cider"],

 ["staropramen","Mustang 12° Hořký","lezak","12°"],
 ["staropramen","Černá Barbora 13°","dark","13°"],
 ["staropramen","Cool Nealko 0,0 Grep","nealko","0,0%",true],

 ["bernard","Bernard Jedenáctka","lezak","11°"],
 ["bernard","Bernard Grep","nealko","0,0%",true],
 ["bernard","Bernard Švestka","nealko","0,0%",true],
 ["bernard","Bernard Mix","radler"],

 ["budvarcraft","Rotující výčep (25 druhů)","",,, true]
];

export const BEERS = RAW.map((r, i) => ({
  id: 'b' + i, brewery: r[0], name: r[1], style: r[2] || '', abv: r[3] || '',
  af: !!r[4], tap: !!r[5]
}));
export const REALCOUNT = BEERS.filter(b => !b.tap).length;

export const DAYS = ['2026-06-10','2026-06-11','2026-06-12','2026-06-13','2026-06-14'];
export const DAY_LBL = ['St 10.6.','Čt 11.6.','Pá 12.6.','So 13.6.','Ne 14.6.'];
