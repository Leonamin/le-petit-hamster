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
