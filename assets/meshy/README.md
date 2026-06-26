# Meshy asset archive

Generated with [Meshy.ai](https://meshy.ai) text-to-3D. See `scripts/meshy.mjs`.

## What's committed vs ignored

- `*.json` — **committed.** Prompt, negative prompt, params, task id per asset.
  Tiny text, the real archive: regenerate or audit any asset from this.
- `raw/` — **gitignored.** Heavy source `.glb` + thumbnails, all variations.
  Local only — keeps the public repo small and doesn't give the assets away.
- Adopted, optimized models live in `public/models/` (committed — the game
  needs them to run/deploy).

## Generate

```sh
MESHY_API_KEY=... node scripts/meshy.mjs <slug> "<what the object is>"
```

The house style is baked into the script (smooth rounded matte, no texture —
preview mode only). Just describe the object.

## Adopt a result

1. Pick the good variation in `raw/<slug>/`.
2. Flatten its material to a flat matte colour + decimate (so it sits next to
   the code-built primitive planets — mood comes from lighting+post, not model
   detail; see DECISIONS.md D2). Load with drei `useGLTF` like `Hamster.tsx`.
3. Copy the optimized `.glb` to `public/models/`, add a line to its README.
4. Set `"adopted": true` in `assets/meshy/<slug>.json`.
