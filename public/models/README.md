# Models

Drop CC0 / free `.glb` models here and reference them as `/models/<name>.glb`.

## Hamster

1. Download a low-poly hamster (or small rodent) `.glb`:
   - Poly Pizza — https://poly.pizza/search/hamster (e.g. https://poly.pizza/m/3YtzEQ5TVUP)
   - Quaternius animated animals (CC0) — https://quaternius.com/packs/ultimateanimatedanimals.html
   - Kenney — https://kenney.nl/assets (Animal packs)
   - Sketchfab — filter Downloadable + CC0/CC-BY, search "hamster low poly"
2. Save it here as `hamster.glb`.
3. In `src/game/characters/Hamster.tsx`, set `MODEL_URL = "/models/hamster.glb"`.
4. Tweak `MODEL_SCALE` / `MODEL_ROT` / `MODEL_OFFSET` so it stands ~1 unit tall,
   feet near y=0, facing +Z (the walk direction).

Prefer low-poly, flat-colour models so they match the code-built planets.

## Licensing

- **CC0** — no attribution required.
- **CC-BY** — free to use, but credit the author. Add a line to this file.
