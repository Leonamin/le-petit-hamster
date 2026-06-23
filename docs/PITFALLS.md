# Pitfalls & Mistake-Prevention Log

Every non-obvious bug or trap we hit goes here, with the fix, so we never pay
for it twice. Add to this freely — it is the most valuable doc over time.

## Spherical movement
- **Forward must be re-projected onto the tangent plane every frame.** As you
  walk across the curve, "up" changes; a stale forward drifts off-surface.
  Fix: `forward -= up * (forward · up)` then normalise (see `lib/sphere.ts`).
- **After moving, recompute `up`** from the new position before orienting —
  otherwise the hamster tilts a frame behind the surface.
- **Camera needs `camera.up` set to the local up** before `lookAt`, or it rolls
  weirdly near the poles.

## R3F / performance
- **Do not allocate in `useFrame`.** New `Vector3()` every frame = GC stutter.
  Use module-level or `useMemo` scratch vectors.
- Keep mutable game state in **refs**, not `useState` — state changes re-render.

## Known things to watch (not yet hit)
- Looking straight along the planet's poles can make the tangent basis
  degenerate; `surfaceOrientation` has a fallback but verify when adding poles.
- StrictMode double-invokes effects in dev; keep effects idempotent.
