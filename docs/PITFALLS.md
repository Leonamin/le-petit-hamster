# Pitfalls & Mistake-Prevention Log

Every non-obvious bug or trap we hit goes here, with the fix, so we never pay
for it twice. Add to this freely — it is the most valuable doc over time.

## Character controller
- **Never snap the heading to the input direction every frame.** The original
  controller did `forward.copy(moveDir)` each frame, and derived `right` from
  that same forward. Result: pressing S flipped the heading 180° per frame
  (camera whipped front↔back, net movement ≈ 0); A/D rotated 90°/frame (spun in
  place). Fix: translate immediately along the input direction, but rotate the
  heading TOWARD it at a capped rate (`turnRate`), within the tangent plane
  about `up`. See `Hamster.tsx`.

## Terrain (heightfield over the sphere)
- **Register the heightfield in `useMemo`, not in an effect.** A planet's NPCs
  are children, and React fires child effects BEFORE the parent's. If the
  planet registers its terrain in `useLayoutEffect`, the NPCs' placement effects
  have already run against the flat base radius and end up buried/floating.
  Registering in `useMemo` (render phase) sets it before any child renders/effects.
- **`clearTerrain(fn)` must be guarded.** On travel, the NEW planet's render
  (useMemo) runs before the OLD planet's unmount cleanup, so a blind
  `clearTerrain()` in cleanup would wipe the new planet's terrain. Clear only if
  the active field is still ours (`active === fn`).
- **Keep height-follow allocation-free.** `heightAt` reuses a module scratch
  Vector3; the controller calls it every frame. Don't `new Vector3()` in there.

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

## Star system / lighting
- **The active planet is rendered at the origin**, never at its true orbital
  position — everything else (star, other planets) is offset by −(active orbit
  position). Keeps the walk controller a simple "centre at origin" sphere.
- **A directional light's `target` must be in the scene graph (or have
  `updateMatrixWorld()` called)** for its direction to update. We move the sun
  light every frame and call `target.updateMatrixWorld()` so the rays re-aim at
  the origin. Forgetting this leaves the light pointing the wrong way.
- Make the sun `meshBasicMaterial` with `toneMapped={false}` so it stays bright
  enough for Bloom to pick it up as a glowing star.

## Audio
- **Browsers block audio until a user gesture.** Start the AudioContext from
  the first pointer/key event, not on mount (see `audio/useAmbience.ts`).
- StrictMode mounts effects twice in dev — keep `startAmbience` idempotent
  (a module-level `started` flag) so you don't build the graph twice.

## Animation
- **Frame-rate-independent easing:** use `MathUtils.damp(current, target, λ, dt)`
  instead of `current += (target - current) * 0.1`. The naive lerp moves faster
  at high FPS and feels different on every machine.

## Known things to watch (not yet hit)
- Looking straight along the planet's poles can make the tangent basis
  degenerate; `surfaceOrientation` has a fallback but verify when adding poles.
- StrictMode double-invokes effects in dev; keep effects idempotent.
