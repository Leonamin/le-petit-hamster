---
name: meshy-asset
description: Generate a 3D asset for Le Petit Hamster with Meshy.ai in the project's flat-matte house style, archive the prompt, and adopt it into the game. Props/scenery use text-to-3D; cute characters use a gpt-image-2 concept → image-to-3D. Use when the user wants a new planet prop, scenery, NPC, or character model, or says "meshy", "generate a 3D model", "make an asset".
---

# Meshy asset pipeline

Two paths by asset class. Both emit **untextured** meshes (flat-matte house
style — we colour in-engine; matches DECISIONS D2: mood from lighting + post,
not model detail). Needs `MESHY_API_KEY`; the character path also needs
`OPENAI_API_KEY`. Both live in `.env` (run scripts with `node --env-file=.env`).
If a key is unset, tell the user — don't invent one.

## Pick the path

- **Props / scenery** (rocks, plants, clocks, furniture — inanimate): **text-to-3D**.
- **Cute characters** (hamster, animals, NPCs): **concept image → image-to-3D**.
  text-to-3D leans realistic and hallucinates limb counts on quadrupeds (it gave
  an 8-legged hamster); image-to-3D follows a concept silhouette, fixing both
  (DECISIONS D5).

## Props/scenery — text-to-3D
```sh
node --env-file=.env scripts/meshy.mjs <slug> "<subject>"
```
The style words are appended; just give a concrete subject (e.g. "a small round
mushroom", slug `rain-mushroom`). Untextured `preview` is the target look.

## Cute characters — concept → image-to-3D
```sh
node --env-file=.env scripts/concept.mjs <slug> "<subject>"      # gpt-image-2 concept
# review assets/meshy/concepts/<slug>.png with the user, coach the look, re-run
node --env-file=.env scripts/meshy.mjs <slug> --image assets/meshy/concepts/<slug>.png
```
Lock the cute look in 2D first (cheaper, full control), then convert. Head/pose/
proportions are set by the concept — to change them, edit the concept prompt and
regenerate, not the mesh.

## Tuning knobs
- `MESHY_MODEL_TYPE=standard|lowpoly` and `MESHY_POLYCOUNT=<int>` env overrides
  (lowpoly + low polycount strips realistic detail).
- `[a-pose|t-pose]` 3rd arg only for a biped you'll rig later (see Animation).

## Output / archive
Both write `assets/meshy/raw/<slug>/` (gitignored — heavy) + a committed
`assets/meshy/<slug>.json` (prompt + params + task id). Concept PNGs are
gitignored; their `.txt` prompt is committed. See `assets/meshy/README.md`.

## Adopt into the game
Copy the chosen `.glb` → `public/models/` (**commit it** — the deployed build
loads it). Load it the way `src/game/characters/Hamster.tsx` does: `HamsterModel`
auto-fits scale + ground from the bounding box, paints a height two-tone via
vertex colours, and overlays dark primitive eyes/nose (the mesh has no separate
eye material). Tune `MODEL_ROT` (face → +Z) first, then the eye/nose offsets.
Set `"adopted": true` in the `<slug>.json`.

## Animation
Characters are animated **procedurally in code** on the kinematic controller
(idle bob, hop, emotes) — no rig. Meshy auto-rig (`POST /openapi/v1/rigging`) is
**humanoid/biped only** and needs a textured glb, so quadrupeds/non-humanoids
can't use it. A biped NPC you intend to rig is the only case that takes a
`pose` arg + a textured refine pass with the face pointing +Z.
