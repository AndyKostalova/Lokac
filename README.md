# Lokáč — Pivní deník RFP 2026 🍺⚡

Soukromá, plně offline PWA pro sledování, hodnocení a počítání piv ochutnaných na festivalu
**Rock for People 2026** (10.–14. 6. 2026). Funguje na iOS i Androidu, data zůstávají jen v telefonu.

## Funkce
- Seznam všech piv z [beer lineupu](https://rockforpeople.cz/en/beer-lineup/) seskupený podle pivovarů
- Vyhledávání a filtry (ochutnáno / neochutnáno / oblíbené / pivovar / styl) napříč všemi pivovary
- Odškrtávání „+1" s počítadlem (kolikrát jsem pivo měl) a historií ťuknutí
- Hodnocení 1–5 hvězd, poznámky, oblíbené (srdíčko)
- Statistiky (kolik ochutnáno / zbývá, celkem vypito, žebříčky, rozložení podle stylu, graf po dnech)
- 22 achievementů (odznaků)
- Tmavý i světlý režim
- Export / obnova zálohy dat
- Přidávání vlastních piv (rotující výčepy, překvapení na place)

## Spuštění lokálně (na PC)
Žádné závislosti, žádný build. Stačí statický server:
```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1
```
Pak otevři <http://localhost:8080/>. Testy: <http://localhost:8080/tests/tests.html>.

## Instalace do telefonu (přes GitHub Pages)
1. Vytvoř na GitHubu repozitář a nahraj do něj obsah této složky (větev `main`).
2. **Settings → Pages → Source: Deploy from a branch → `main` / root → Save.**
3. Po pár minutách vznikne adresa `https://<účet>.github.io/<repo>/`. Otevři ji:
   - **iPhone (Safari):** tlačítko Sdílet → **Přidat na plochu**.
   - **Android (Chrome):** menu ⋮ → **Přidat na plochu / Nainstalovat aplikaci**.
4. První otevření stáhne celou appku do telefonu (service worker) → od té chvíle funguje **offline**.
   Odkaz pak můžeš klidně zrušit; appka v telefonu funguje dál.

> Všechny cesty jsou relativní (`./`), takže appka funguje i z podsložky `…github.io/<repo>/`.

## Záloha dat
Data žijí jen v telefonu. V **Nastavení**:
- **Export zálohy** stáhne soubor `lokac-zaloha-RRRR-MM-DD.json`.
- **Obnovit ze zálohy** ho načte zpět (např. při výměně telefonu).

## Loga pivovarů
Zatím stylizované placeholdery (barva + zkratka). Skutečná loga lze doplnit kdykoli —
viz [`assets/logos/README.md`](assets/logos/README.md).

## Struktura
- `index.html`, `styles.css` — kostra a vzhled
- `js/` — logika (`data`, `store`, `stats`, `achievements`, `filters`, `format`) a obrazovky (`screen-*`, `app`)
- `sw.js`, `manifest.webmanifest`, `icons/` — PWA (offline, instalace, ikona)
- `tests/` — testy běžící v prohlížeči (bez Node)
- `docs/superpowers/` — návrhová specifikace a implementační plán
- `náhledy/` — původní schválený vizuální náhled
