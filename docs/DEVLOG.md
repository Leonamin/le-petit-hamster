# Dev Log

Append-only. Newest at the top. One short entry per working session:
what changed, and anything the next session should know.

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
