---
name: meshy-asset
description: Generate a 3D asset for Le Petit Hamster with Meshy.ai (text-to-3D) in the project's house style, archive the prompt, and adopt it into the game. Use when the user wants a new planet prop, scenery, NPC, or character model, or says "meshy", "generate a 3D model", "make an asset".
---

# Meshy asset pipeline

One workflow, four steps. The house style is baked into `scripts/meshy.mjs`
(smooth rounded matte, no texture — `preview` mode only). This matches
DECISIONS.md D2: mood comes from lighting + post, not model detail.

## Animation — Meshy only covers biped humanoids; read before rigging

Asset *type* does NOT change static generation (shape comes from the prompt).
It changes **animation**, and Meshy's auto-rig (`POST /openapi/v1/rigging`) is
**humanoid/biped only** and needs a *textured* glb:

- **Quadruped animals** (hamster, gerbil, deer — the protagonist!) and
  **non-humanoid** (octopus): Meshy can't rig them. Use pre-rigged CC0
  (Quaternius Ultimate Animated Animals, see `public/models/README.md`) or
  procedural code animation on the existing kinematic controller (idle bob, hop,
  emotes) — no rig needed.
- **Biped humanoid NPC**: Meshy rig + animation works. Generate with a `pose`
  arg (`a-pose`/`t-pose`), then run a textured refine pass before rigging, and
  ensure the face points +Z.

So the preview-only flat-matte default is for static props + animals. Only biped
NPCs you'll rig take the textured branch.

## 1. Intent → subject string
Turn the user's request into a short concrete subject (the script appends the
style words). e.g. user "a little mushroom for the rain planet" → subject
`"a small round mushroom"`, slug `rain-mushroom`.

## 2. Generate
```sh
MESHY_API_KEY=... node scripts/meshy.mjs <slug> "<subject>"
```
Needs `MESHY_API_KEY` (Meshy dashboard → API). If unset, tell the user to set
it — don't invent one. Writes `assets/meshy/raw/<slug>/` (gitignored) +
`assets/meshy/<slug>.json` (commit this).

## 3. Refine / decide
Preview is untextured geometry — that's the target look. Show the user the
thumbnail. If the silhouette is wrong, tweak the subject and re-run (new slug or
overwrite). Only run a textured `refine` pass (see ponytail note in the script)
if a planet genuinely needs baked colour.

## 4. Adopt
1. Optimize: decimate the `.glb`, flatten its material to a flat matte colour so
   it sits next to the code-built planets. Load with drei `useGLTF` — copy the
   pattern in `src/game/characters/Hamster.tsx` (MODEL_URL / SCALE / ROT /
   OFFSET).
2. Copy optimized `.glb` → `public/models/`, add a line to its README.
3. Set `"adopted": true` in `assets/meshy/<slug>.json`.

See `assets/meshy/README.md` for the commit-vs-ignore rule.
