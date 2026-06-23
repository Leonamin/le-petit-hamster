# Dev Log

Append-only. Newest at the top. One short entry per working session:
what changed, and anything the next session should know.

## 2026-06-23 — Animated CC0 animals as NPCs
- Added the Quaternius Ultimate Animated Animals pack (CC0, self-contained
  .gltf, 12 clips each: Idle/Walk/Gallop/Jump…). It has no hamster, so animals
  are used as NPCs and the hamster hero stays primitive until a real one shows.
- New `AnimalModel` (useGLTF + useAnimations, SkeletonUtils.clone) loads a
  .gltf and loops a clip. Lighthouse Keeper → Deer, Windup Artisan → Stag,
  both playing Idle, scaled ~0.55 (towering over the hamster, "larger than
  life"). Origins are at feet, so no vertical offset.
- Reverted the hero hamster to the primitive (the elongated hamster.glb looked
  like a sausage). Deer.gltf/Stag.gltf copied into public/models/.
- NEXT: real hamster hero model; maybe animals for the sleeping friends too;
  per-NPC orientation tweaks once seen.

## 2026-06-23 — Drop-in .glb hamster loader (CC0 route)
- The primitive hamster didn't read as a hamster, so wired a model path: set
  `MODEL_URL` in Hamster.tsx to a `/models/*.glb` and it loads via useGLTF with
  the primitive as the Suspense fallback (no file → primitives, no crash).
  `MODEL_SCALE/ROT/OFFSET` align it; procedural bounce+lean still applied.
- `public/models/README.md` lists where to get CC0/low-poly hamsters (Poly
  Pizza, Quaternius CC0 animated packs, Kenney, Sketchfab) and how to wire one.
- TODO: if the chosen model has walk/idle clips, drive them with useAnimations.

## 2026-06-23 — Hamster looks like a hamster (code primitives)
- Reshaped the placeholder into a recognisable hamster, still all primitives:
  chubby round body + cream belly, big head with cheek pouches, dark eyes, pink
  nose, pale whiskers, small round ears, little front paws + hind feet, tiny
  tail nub. Stayed code-only to keep the low-poly diorama style cohesive (no
  asset / CC0 model needed for now; <HamsterMesh/> is still a clean swap point).
- Animation refs (body/head/ears/tail) unchanged, so the walk bounce/lean/ear
  flop/tail sway + idle breathing still drive it; ears now live under the head.

## 2026-06-23 — Hamster procedural animation
- The hamster is now alive: the controller exposes a 0..1 walk amount (`anim`),
  and the mesh drives a bounce + forward lean + waddle + ear flop + tail sway
  while walking, easing to a gentle breathing idle when still. No keyframes, no
  asset — all procedural in HamsterMesh's useFrame (eased with MathUtils.damp).
- Ears were made slightly elongated so their flop reads; head + nose grouped to
  nod together; added a little tail nub.
- NEXT (quality pass): real rain on the Rain Planet, then per-planet ambience.

## 2026-06-23 — Click-to-move
- Hold the left mouse button to walk toward the point under the cursor: a ray
  from the camera is intersected with the planet sphere, and the hamster heads
  for the hit along the surface (great-circle direction), stopping once on top.
  Moving the cursor while held re-aims; releasing stops. Pointer capture keeps
  it working when the cursor leaves the canvas. Pointer input takes precedence
  over the keyboard and respects the frozen (dialogue/departing) state.
- Reuses the existing move pipeline (turn-to-face + camera follow), so it feels
  consistent with keyboard movement.

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
