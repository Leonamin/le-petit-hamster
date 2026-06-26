# Decisions (lightweight ADR)

One entry per meaningful choice: the decision, why, and alternatives rejected.

## D1 — React Three Fiber over vanilla Three.js
**Decision:** Use R3F + drei.
**Why:** "Each planet = a diorama" maps cleanly to React components, and the
storybook has lots of UI overlays (dialogue, transitions) that React handles
well. drei gives loaders/camera/helpers for free.
**Rejected:** Vanilla Three.js (more control, but more boilerplate for scene
graph + UI). Babylon.js (heavier, less needed here).

## D2 — Hybrid asset strategy
**Decision:** Code-built primitives for terrain & simple props; CC0 `.glb`
(Kenney / Quaternius / Poly Pizza) reserved for characters & complex hero props.
**Why:** No graphics-tool skill required either way. Mood comes from lighting +
post-processing, not model detail. Hand-writing vertex arrays or rigging/
animating a character by code is not worth the time.
**Rejected:** 100% code (animation pain), full custom art (needs tooling skill).

## D3 — No physics engine for the MVP
**Decision:** Custom kinematic spherical controller; no Rapier/cannon yet.
**Why:** Full physics engines fight custom radial gravity. A kinematic
controller aligned to the surface normal is simpler and fully controllable.
**Revisit if:** we need rolling objects, stacking, or richer collisions.

## D4 — Static web deployment
**Decision:** Ship as a static client-side bundle (Vercel/Netlify/Pages).
**Why:** Everything runs in the browser; no backend needed. Lowest friction,
free hosting, instant share links.

## D5 — Meshy.ai pipeline, scoped to props/scenery (not cute characters)
**Decision:** Keep a Meshy text-to-3D pipeline (`scripts/meshy.mjs`,
`meshy-asset` skill) that emits untextured, flat-matte preview meshes. Reserve it
for **inanimate props/scenery** (rocks, plants, clocks, furniture). Characters
stay **code-built primitives** for now, animated **procedurally in code** on the
kinematic controller (no rig).
**Why:** Built and validated, but text-to-3D fought the game's cute, simplified
(HammyHome-ish) character look two ways: its "standard" engine leans realistic
(visible muscle/anatomy), and it hallucinates limb counts on quadrupeds (we got
an 8-legged, 2-tailed hamster). Those don't hurt inanimate props, where its
detail is an asset. Separately, Meshy auto-rig is humanoid/biped only + needs
textured meshes, so animals couldn't be rigged there anyway — hence procedural
code animation, which also keeps the flat-matte look (matches D2).
**Open:** the cute-character approach is unsettled — code primitives vs a Meshy
**image-to-3D** pass driven by a controlled cute concept (the likely fix for both
the anatomy errors and the style, since it follows a reference silhouette).
**Rejected:** Meshy text-to-3D for hero/animal characters; Quaternius pre-rigged
animals (style clash); Meshy rigging for animals (unsupported).
