# Lokáč — Pivní deník RFP 2026 — Návrhová specifikace

**Datum:** 2026-06-09
**Stav:** Schváleno k implementaci (čeká na finální revizi specifikace uživatelkou)

---

## 1. Účel a kontext

Soukromá mobilní aplikace pro sledování piv ochutnaných na festivalu **Rock for People 2026** (10.–14. 6. 2026, Park 360, Hradec Králové). Uživatelka si chce:

- odškrtávat ochutnaná piva ze seznamu z [oficiálního beer lineupu](https://rockforpeople.cz/en/beer-lineup/),
- dávat pivům hodnocení a psát poznámky,
- počítat, kolikrát které pivo měla,
- sledovat statistiky,
- sbírat pivní achievementy (odznaky).

**Klíčová omezení:**
- Funguje na **iOS i Androidu**.
- **100 % offline** (na festivalu nejistý signál).
- **Soukromá** — data jen v telefonu, nikam se neposílají, nepublikuje se do App Storu.
- Tvořeno **lokálně**; distribuce přes **GitHub Pages** jen pro jednorázovou instalaci.

**Jazyk a styl textů:** čeština, **vše v mužském rodě** (univerzálně — např. „Ochutnal jsi", „Vytrvalec", „Zodpovědný").

---

## 2. Architektura

- **Typ:** Progressive Web App (PWA). Instalace přes „Přidat na plochu" → ikona **Lokáč**, běh na celou obrazovku, jeden kód pro iOS i Android.
- **Technologie:** čisté HTML + CSS + JavaScript, **bez build-kroku a bez těžkých frameworků**. Celá appka = jedna složka nahratelná na GitHub Pages.
- **Offline:** `service worker` (cache-first) uloží celou appku včetně loga a fontů → funguje v letadlovém režimu. Manifest (`manifest.webmanifest`) pro instalaci a ikonu.
- **Cesty:** relativní (`./`), aby appka fungovala i z podsložky `ucet.github.io/lokac/`. Service worker scope = adresář appky.
- **Úložiště dat:**
  - **Obsah festivalu** (pivovary, piva, styly, loga) je zabudovaný v appce (seed data v JS) a stáhne se při instalaci.
  - **Uživatelská data** (hodnocení, poznámky, počítadla, časy ťuknutí, oblíbené, odemčené odznaky, vlastní piva, volba motivu) v **`localStorage`** prohlížeče (objem dat je malý). Datová vrstva izolovaná do jednoho modulu (`store.js`) s jasným rozhraním, aby šlo případně přejít na IndexedDB.

---

## 3. Datový model

### Pivovar (`brewery`)
- `id` (slug), `name`, `logo` (cesta k obrázku v `assets/logos/`), `color` (akcentní barva karty).

### Pivo (`beer`)
- `id`, `breweryId`, `name`, `style` (jedna z 9 kategorií níže), `abv` (volitelně, text jako „12°"/„5,2 %"), `alcoholFree` (bool), `custom` (bool — přidané uživatelkou), `placeholderTap` (bool — dlaždice rotujícího výčepu).

### Uživatelský záznam u piva (`userBeerData`, klíčováno `beerId`)
- `rating` (0–5, 0 = nehodnoceno),
- `note` (string),
- `favorite` (bool),
- `taps` (pole timestampů — každé „dal jsem si"). **Počítadlo = `taps.length`**, **ochutnáno = `taps.length > 0`**.

### Odznak (`achievement`)
- definice (id, název, popis „jak získat", ikona/emoji, podmínka, cílová hodnota pro progres),
- stav: `unlockedAt` (timestamp nebo null). Progres se počítá z dat za běhu.

### Styly piv (9 kategorií)
1. Ležák / světlé výčepní
2. IPA / APA / Pale Ale
3. Sour / kyselák
4. Summer / Session Ale
5. Pšeničné
6. Tmavé / polotmavé / speciál
7. Nealko
8. Cider
9. Radler / limo / ochucené

**Rotující výčepy** (Clock „15 druhů", Budvar craft stage „25 druhů") = dlaždice `placeholderTap` u daného pivovaru s textem „🔄 Rotující výčep — přidej si, co sis dal". Konkrétní piva si uživatelka doplní přes „přidat vlastní pivo".

### Seed obsah
Všech ~20 pivovarů a ~110 piv z lineupu (viz příloha A). Každé pivo dostane přiřazený styl a příznak nealko.

---

## 4. Obrazovky a navigace

Dolní lišta se 4 záložkami: **🍺 Piva · 📊 Statistiky · 🏅 Odznaky · ⚙️ Nastavení**. Detail piva se otevírá nad nimi.

### 4.1 Piva (domů)
- Záhlaví: **Lokáč** + podtitul „Pivní deník RFP 2026", přepínač 🌙/☀️.
- **Vyhledávání** (název piva / pivovar) + **řádek filtrů** (chipsy): `Vše / Neochutnáno / Ochutnáno / Oblíbené`, dále `Pivovar ▾`, `Styl ▾`. Vpravo počet výsledků. Filtry kombinovatelné, jedním ťuknutím smazatelné. **Filtry i hledání jsou globální (napříč pivovary).**
- **Sekce podle pivovarů**: logo + název + progres „2/6 ochutnáno", rozbalovací. Při aktivním filtru/hledání se zobrazí jen vyhovující piva a prázdné pivovary se schovají.
- **Karta piva**: název, styl, stupně; indikátory (hvězdičky když hodnoceno, počítadlo „×3", ❤️ když oblíbené, ✔ ochutnáno) + velké **+1** tlačítko (rychlé „dal jsem si"). Ťuknutí na kartu (mimo +1) → detail.
- Plovoucí **+** = přidat vlastní pivo.

### 4.2 Detail piva
- Logo pivovaru, název piva, pivovar, styl, stupně.
- Velké **+1 „Dal jsem si"** → `taps.push(now)`, krátká animace (dolití pěny).
- **„Měl jsem 3×"** + rozklikávací **historie ťuknutí** (čas; možnost jednotlivé smazat).
- **Hvězdičky 1–5** (ťuknutím nastavit/přepsat), **❤️ oblíbené**, **poznámka** (textové pole, autosave).
- U `custom` piva: tlačítka **upravit / smazat**.

### 4.3 Statistiky
- **Kruhový progres „Ochutnáno X / Y"** + „zbývá Z".
- **„Celkem vypito: N"** (součet `taps` přes všechna piva).
- **Top hodnocená** — žebříček podle hvězd (s počtem hvězd).
- **Nejčastěji pitá** — žebříček podle počítadla.
- **Rozložení podle stylu** — sloupcový/koláčový graf počtu ochutnaných piv dle 9 stylů.
- **Časová osa po dnech** festivalu (10.–14. 6. 2026) — počet ťuknutí v každý den (dny mimo festival se seskupí do „Ostatní").

### 4.4 Odznaky
Mřížka odznaků. Odemčené barevně + datum získání; zamčené šedě s popisem „jak získat" a progresem (např. „60/100 piv").

**Sada odznaků (v1) — 22 odznaků:**

*Postup v počtech piv:*
| Ikona | Název | Podmínka |
|---|---|---|
| 🍺 | Prvotřídní | první ochutnané pivo |
| 🚀 | Rozjezd | 5 různých ochutnaných piv |
| 🔟 | Decimálka | celkem 10 piv (součet ťuknutí) |
| 🏃 | Maratonec | celkem 25 piv |
| 🏅 | Padesátka | 50 různých ochutnaných piv |
| 💯 | Stovkař | 100 různých ochutnaných piv |
| 👑 | Král festivalu | ochutnána úplně všechna piva v seznamu |

*Pivovary a styly:*
| Ikona | Název | Podmínka |
|---|---|---|
| 🌍 | Cestovatel | piva od 5 různých pivovarů |
| 🗺️ | Lokálpatriot | piva od 10 různých pivovarů |
| 🏭 | Věrný fanoušek | všechna piva od jednoho pivovaru |
| 🌈 | Sběratel stylů | aspoň 1 pivo ze 4 různých stylů |
| 🎨 | Mistr stylů | aspoň 1 pivo ze všech 9 stylů |
| 🌿 | Chmelová hlava | 5 piv stylu IPA / APA |
| 🌑 | Tmavá strana | 3 tmavá / speciál piva |
| 🚫 | Zodpovědný | aspoň 3 nealko piva |

*Zápal, čas a zapojení:*
| Ikona | Název | Podmínka |
|---|---|---|
| 🍻 | Štamgast | jedno pivo dáno aspoň 5× |
| 🔥 | Žíznivý den | 5 piv během jednoho dne |
| 🦉 | Noční sova | pivo zaznamenané mezi půlnocí a 4:00 |
| ⭐ | Kritik | ohodnoceno 20 piv |
| 💗 | Srdcař | 5 oblíbených piv |
| 📝 | Recenzent | poznámka u 10 piv |
| 🌅 | Vytrvalec | pivo v každý den festivalu (10.–14. 6.) |

### 4.5 Nastavení
- Přepínač světlý/tmavý.
- **Export zálohy** (stáhne JSON se všemi uživatelskými daty) / **Obnovit ze zálohy** (nahraje JSON).
- Přidat vlastní pivo.
- **Reset dat** (s potvrzovacím dialogem).
- Verze / info.

---

## 5. Vzhled

- **Styl:** rockový, festivalový, „plakátový", výchozí **tmavý režim**, přepínatelný na světlý.
- **Tmavý režim:** uhlové/téměř černé pozadí, tmavě šedé karty.
- **Akcenty:** pivní **zlatá/jantarová** (hvězdičky, progres, „dal jsem si") + rocková **červeno-purpurová** (oblíbené, zvýraznění, odznaky).
- **Světlý režim:** krémové pozadí (pivní pěna), tmavý text, stejné akcenty.
- Každý **pivovar** má vlastní akcentní proužek/barvu na kartě.
- **Písmo:** výrazné kondenzované/plakátové pro nadpisy + čistý sans pro text; fonty přibalené (offline).
- **Animace:** +1 → dolití pěny / zlatá vlnka; odemčení odznaku → záblesk/konfety; jemně zaoblené karty, stíny, plynulé přechody.
- **Loga pivovarů:** skutečná, přibalená do `assets/logos/`; kde se nepovede, stylizovaná náhrada v barvě pivovaru.
- **Ikona appky:** půllitr s pěnou + rockový prvek (trsátko/blesk), jantarovo-černá.

---

## 6. Záloha dat

Uživatelská data žijí jen v telefonu → riziko ztráty při smazání dat prohlížeče / změně telefonu. Proto:
- **Export:** tlačítko v Nastavení uloží soubor `lokac-zaloha-RRRR-MM-DD.json` se všemi uživatelskými daty (hodnocení, poznámky, ťuknutí, oblíbené, odznaky, vlastní piva).
- **Import:** načte JSON a obnoví stav (s potvrzením o přepsání).

---

## 7. Distribuce (poslední krok, mimo samotnou appku)

1. Hotová složka appky se nahraje na **GitHub Pages** (HTTPS).
2. Odkaz se otevře na iPhonu i Androidu → „Přidat na plochu".
3. Service worker stáhne vše do telefonu → od té chvíle offline.
4. Odkaz lze poté zrušit; appka v telefonu funguje dál. Hosting je potřeba jen pro instalaci a případné aktualizace obsahu.

---

## 8. Náhled (deliverable na konci brainstormingu)

Před implementací se vygeneruje **interaktivní vizuální náhled** do `RFP/náhledy/` jako samostatný `.html` soubor (telefonní rám, přepínání záložek a motivu, ukázková data, stylizovaná loga). Skutečná loga a service worker přijdou až v implementaci.

---

## Příloha A — Seed obsah (pivovary a piva z lineupu)

> Styl se přiřadí každému pivu při implementaci dle 9 kategorií; „nealko" označeno příznakem.

- **Clock:** 10° Hektor; 10° Jackpot (tangerine NEIPA); 11° Vošta; Krystus Nealko IPA; 🔄 rotující výčep (15 druhů)
- **Klenot:** Polotmavé 11° festivalová; 12° nefiltr; Festivalový Hazy ALE 11°; Kyseláč mango&broskev 10°; IPA 15°; Pšeničné; Nealko grep; Komix cider; Sezonní speciál
- **Permon:** Těhotná Dvanáctka; Sokolovská Desítka; PAPA; Sherpa IPA; Summer ALE; Permon Tropical Fruit Sour
- **MadCat:** Summer ALE Jiskra; Fruit Sour Mango-Piňa-Coco; Ležák; Session NEIPA Juicy Cat; Nealko Madcat
- **Černokostelecký pivovar:** Dešťovka 10°; Vycpaná Vydra 12°; Rock Svině Summer ALE 9°; West Coast IPA 12°; Černá Svině 13°; Kyselátko Grep Limeta 12°; Tropival Yuzu Nealko
- **Budvar & Mikkeller:** Twogether Forever Summer ALE
- **Hákův Parní Pivovar:** Hák 10°; Hák 11°; POETA Hák Černá 13°; ASTRONAUT Galaxy IPA 15°; AMÍK APA 13°; BEACH BOY Summer Ale 8°; CELEBRITA Neipa 14°; ZAHRADNICE Pampeliška ALE 10°; Session ALE 9° Ovocný; ROŠŤÁK MangoSour 11°; CHULIGÁN Black Currant Sour Shake 10°; White APA 12°; GENTLEMAN RedAle 11°; Řezané
- **Plzeňský Prazdroj:** Pilsner Urquell; Radegast Rázná; Birell Pomelo&Grep; Birell Nealko; Radegast Rezist
- **Nachmelená Opice:** 11° Ležák; 12° Sun APA; Nealko IPA Free; 15° Pastry Kyseláč rybíz, vanilka, malina; 13° Nectaron Hazy Pale Ale
- **Elektrárna:** Pilsner Urquell; Radegast Rázná; Birell Pomelo&Grep; Birell Nealko; Radegast Rezist
- **Cider Tátův sad:** Craft Cider suchý; Craft Cider Veselá višeň
- **Heineken:** Heineken; Heineken 0,0
- **Chotěboř:** Prémium 12%; Plus 11%; Polo 11%; Patron Nealkoholický; Radler nealko; Radler; Bezinka Limo
- **Rampušák:** Dobrušská nefiltr 11°; Rampušák nefiltr 12°; Summer ALE 9°; Rock´n´ALE 11°; Sour ALE Mango-Maracuja 11°; Rampušák DryHop Nealkoholický; Rampušák Blood Orange Nealkoholický
- **Strongbow:** Gold Apple Cider
- **Dolní Počernice:** Počernická 12°; Kopřivový Speciál 12°; Barborka Černá 13°; Summer ALE 11°; Počernický Radler Meruňka; Limonáda Broňa
- **Národní pivovar Budějovický Budvar:** Budvar 33; Budvar Original; Redix
- **Únětický Pivovar:** Letní Speciál Únětická 8°; Únětická 10,7° filtrovaná; Skippy XPA; Únulka IPA Nealko
- **Desperados:** Desperados Original
- **Amity Drinks:** Cider Jablko-Hruška; Cider Polosuchý
- **Pivovary Staropramen:** Mustang 12° Hořký; Černá Barbora 13°; Cool Nealko 0,0 Grep
- **Bernard:** Bernard Jedenáctka; Bernard Grep; Bernard Švestka; Bernard Mix
- **Budvar craft beer stage:** 🔄 rotující výčep (25 druhů)
