# Dev Log

Append-only. Newest at the top. One short entry per working session:
what changed, and anything the next session should know.

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
