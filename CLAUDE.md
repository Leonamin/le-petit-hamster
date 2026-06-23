# Le Petit Hamster — Engineering Notes

A playable storybook: a small hamster travels between tiny planets, meeting
friends. Cozy exploration, no combat/leveling/crafting. The design docs
(VISION, PRODUCT, WORLD, PLANETS, ART_DIRECTION) are the source of truth for
*feel*; this file is for *how the code works*.

## Stack
- **Vite + React + TypeScript** (package manager: **pnpm**)
- **Three.js** via **React Three Fiber** (`@react-three/fiber`) + **drei**
- **@react-three/postprocessing** for mood (bloom, vignette, fog)
- **zustand** for game state shared between the render loop and React UI
- **Howler.js** for audio (not wired up yet)
- Deploys as a static site (Vercel / Netlify / GitHub Pages)

## Architecture
- `src/game/config.ts` — gameplay tuning constants (radius, speed, camera).
- `src/lib/sphere.ts` — the math for living on a sphere (up vectors, surface
  orientation, placing props). **This is the heart of the game.**
- `src/game/systems/` — per-frame behaviour (input, controllers).
- `src/game/planets/` — one component per planet = one hand-authored diorama.
- `src/game/objects/` — reusable props built from primitives.
- `src/game/characters/` — the hamster + the spherical-walk controller.
- `src/ui/` — React overlays (dialogue, transitions). Keep UI minimal.

## Conventions
- **Per-frame code allocates nothing.** Reuse scratch `Vector3`s (see Hamster).
- Mutable game state lives in **refs**, not React state — the render loop reads
  refs without triggering re-renders.
- Planets are **hand-placed**, never procedurally generated (VISION rule).
- New visuals: try primitives + lighting + post first. Only reach for a CC0
  `.glb` (Kenney / Quaternius / Poly Pizza) for characters & complex hero props.
  Drop `.glb` files in `public/models/` and load with drei `useGLTF`.

## Commands
- `pnpm dev` — local dev server with HMR (binds 0.0.0.0 for LAN access)
- `pnpm build` — type-check + production build into `dist/`
- `pnpm preview` — serve the production build locally

## Where to read next
- `docs/ROADMAP.md` — what's planned
- `docs/DEVLOG.md` — what's been built (newest first)
- `docs/DECISIONS.md` — why we chose what we chose
- `docs/PITFALLS.md` — bugs hit + how to avoid repeating them
