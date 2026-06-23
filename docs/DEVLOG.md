# Dev Log

Append-only. Newest at the top. One short entry per working session:
what changed, and anything the next session should know.

## 2026-06-23 — Self-rotation, point-light sun, orbit toggles
- **Point-light sun** (decay 0) replaces the directional light, so every body is
  lit from the star's actual position. Still casts the planet's shadows.
- **Self-rotation (자전):** all celestial objects live in one `sky` group; the
  active planet's spin is shown by counter-rotating that group (the surface
  dweller can't tell the difference). Distant planets also spin their own mesh.
  `spinSpeed` added per planet.
- **Runtime toggles** (`systemConfig` + `useSystemControls`, global keys):
  K = pause/resume celestial motion, L = orbit rings on/off, N/M = speed scale.
  Shown in the C panel; persisted to localStorage. Celestial motion uses a
  pausable/scalable time accumulator instead of raw clock.
- Stars moved into the sky group so the night sky turns with self-rotation.
- NEXT: tune sun intensity/spin/orbit feel; maybe axial tilt, a third planet.

## 2026-06-23 — Star system: sun, orbits, per-planet size
- The planets now share **one star system**. Trick: the active planet is always
  rendered at the origin (controller stays simple), and `SolarSystem` draws the
  star + other planets offset by −(active planet's orbital position). As the
  active planet orbits, the sun and other worlds sweep across the sky and the
  day/night terminator drifts.
- **Per-planet radius** threaded through: `PlanetDef.radius` → planet component
  prop → its scenery/NPC placement (`useInteractableProp` takes a planetRadius)
  → the Hamster controller (radius prop via a ref). Rain r=8, Clock r=5.5.
- Sun = full-bright (`toneMapped={false}`) sphere + bloom; a directional light
  positioned at the star, aimed at the origin, casts the planet's shadows.
- Replaced per-planet background/fog with a space backdrop + drei `<Stars>`;
  each planet keeps only a subtle hemisphere tint. Lighting is now the star.
- DeparturePod moved into each planet (placed at that planet's radius).
- PITFALLS: directional-light target must be updateMatrixWorld()'d each frame.
- NEXT: tune orbit speeds / sizes / sun feel; maybe planet self-spin, a third
  world, per-planet ambience.

## 2026-06-23 — Milestone 2: planet abstraction + travel
- **Planets are now self-contained components** (mood + terrain + scenery + NPC
  + friend), listed in `planets/registry.ts`. App mounts only the active one;
  the hamster + departure pod are persistent across swaps.
- **Travel:** the pod's `leavePlanet` now advances `currentPlanet` (wraps via
  `planetCount`, set by App) at the mid-fade black moment, so scenery/mood swap
  unseen. Per-planet interactables auto-register/unregister on mount/unmount.
- **Second planet: Clock Planet (Time)** — warm amber dusk, a clock tower with
  slowly turning hands, the windup artisan NPC, and its own sleeping friend.
- DRYed prop placement+registration into `useInteractableProp`; generalised
  `SleepingFriend` to take id/direction/lines/colours.
- Added `PlanetTitle` overlay — name + theme fade in on arrival (storybook).
- NEXT (M3 ideas): per-planet radius, a third planet, audio per planet, a
  smoother arrival beat, save visited planets.

## 2026-06-23 — Camera-relative 8-direction movement
- Switched from "turn toward movement" to **camera-relative strafe movement**:
  input vectors sum, so W+S / A+D cancel to a stop and W+D etc. give diagonals.
  The hamster steps directly (no arc) in side/back/diagonal directions.
- **Decoupled body-turn from camera-follow.** `facing` (body) turns toward the
  movement direction at `turnRate`; `camHeading` (camera yaw + input frame)
  trails `facing` at the new `camFollow` rate. camFollow=0 → fixed strafe
  camera; high → turn-to-face feel. Both are tunable in the C overlay.
- Added `turnToward()` tangent-rotation helper in lib/sphere.ts.
- Bumped localStorage key to lph-camera-v2 (new defaults incl. camFollow).

## 2026-06-23 — Camera fix + tuning tool
- **Fixed the A/S/D bug.** The controller used to snap the heading to the input
  direction every frame, which spun the camera and prevented movement (see
  PITFALLS → Character controller). Now: translate immediately along input,
  rotate the heading toward it at a capped `turnRate`. W=straight, D/A=smooth
  arc, S=turn around. No more camera whip.
- **Camera tuning tool** (`cameraConfig.ts` + `ui/CameraDebug.tsx`): press C to
  open an overlay; nudge distance/height/lookUp/fov/turnRate live with key
  pairs; values persist to localStorage. Fly around, find a view you like, read
  the numbers off the panel → bake into DEFAULTS in cameraConfig.ts.
- Camera offsets moved out of config.ts into the tunable store. Raised the
  starting defaults (height 2.6, lookUp 2.0, fov 60) to address "can't see
  ahead" — but these are placeholders to be dialed in via the tool.
- NEXT: bake in the camera values the player settles on, then Milestone 2.

## 2026-06-23 — Milestone 1 complete: friend + audio + leave-planet
- **Sleeping friend** (`SleepingFriend.tsx`): own interactable, waking is
  optional (Golden Rule). Approaching wakes them via `awakenFriend`; the body
  un-curls and the head lifts, eased with `MathUtils.damp` (frame-rate safe).
- **Procedural rain ambience** (`audio/`): looping filtered white noise with a
  slow LFO on the cutoff. No audio asset. Web Audio (not Howler) since it's
  synthesised. Starts on first gesture (`useAmbience`) per autoplay policy.
- **Leave-planet** (`DeparturePod.tsx` + store `leavePlanet`): glowing pod;
  interacting fades to black, bumps `planetEpoch`, resets the hamster to the
  arrival point, fades back in. One planet for now, so it loops — M2 swaps in a
  real next planet. CSS-driven `Fade` overlay.
- Store now supports action-only interactables (`onInteract`, no lines) and
  per-interactable `prompt`. Hamster freezes while talking or departing and
  snaps the camera on epoch change.
- Moved the friend out of `RainPlanet` (planet = static scenery; characters +
  interactables mounted in `App`).
- Verified: `pnpm build` clean, dev server serves all new modules.
- NEXT (M2): extract a Planet abstraction, add a real second planet + travel.

## 2026-06-23 — Milestone 1: NPC + dialogue
- Switched package manager to **pnpm** (esbuild build approval via
  `pnpm-workspace.yaml` → `allowBuilds`). Dev/preview bind `0.0.0.0`.
- Added **zustand** game store (`src/game/state.ts`): interactable registry,
  nearby tracking, dialogue stack. Bridge between useFrame and React UI.
- **Mouse Lighthouse Keeper** NPC (code-built) stands by the lighthouse and
  registers an interactable. Walk within 2.6 units → "스페이스 — 말 걸기".
- Dialogue UI overlay (`src/ui/`): storybook box, Space/Enter/click to advance.
  Hamster movement freezes while talking (keeps the moment quiet).
- Verified: `pnpm build` clean, dev server serves on 0.0.0.0.
- NEXT: sleeping-friend interaction + rain ambient audio + leave-planet fade.

## 2026-06-23 — Project scaffolded
- Set up Vite + React + TypeScript + React Three Fiber + drei + postprocessing.
- Folder structure under `src/game` (planets / objects / characters / systems).
- Wrote `src/lib/sphere.ts`: up vectors, surface orientation, prop placement.
- **Tracer bullet works**: a code-built hamster walks around the Rain Planet
  sphere with a low follow-camera; mood via fog + bloom + vignette.
- Placeholder Rain Planet diorama: oversized lighthouse, sleeping-friend blob,
  scattered rocks.
- Engineering docs created (this file, ROADMAP, DECISIONS, PITFALLS, CLAUDE.md).
- NEXT: deploy to a live URL, then build the NPC + dialogue (Milestone 1).
