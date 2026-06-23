# Dev Log

Append-only. Newest at the top. One short entry per working session:
what changed, and anything the next session should know.

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
