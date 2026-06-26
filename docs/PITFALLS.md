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
- **Camera heading must NOT chase the body heading.** With both `face ← move`
  (capped turnRate) and `head ← face` (capped camFollow) wired together, the
  input frame `move = ±head` becomes a moving target: as the camera lags the
  body, the input direction rotates with the lag, and the body chases a
  moving target forever. Net result on W→S: body reaches ~57° in 0.1s, never
  the expected 180°, and after release keeps drifting (camera spins
  indefinitely). The only stable equilibria of the loop are `face=head=0`
  (no input) and `face=head=π/2` (the 90° trap). Fix: keep `head` world-fixed
  (Mario Galaxy style) — only re-project onto the tangent plane each frame,
  don't have it chase `face`. The camera POSITION still trails the body, so
  framing is unchanged; only the heading becomes independent.
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
