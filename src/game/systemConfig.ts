import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Toggles for the star system, controllable at runtime (see useSystemControls):
 * pause/resume all celestial motion, show/hide orbit rings, and a speed scale.
 * Persisted so your preference survives a reload.
 */
interface SystemConfig {
  /** When false, all orbital + axial motion is frozen. */
  orbitOn: boolean;
  /** Draw the orbit rings. */
  showOrbits: boolean;
  /** Multiplier on celestial motion speed. */
  orbitScale: number;
  /** Rain density on the Rain Planet, 0..1. (Later: driven by time of day.) */
  rainIntensity: number;

  toggleOrbit: () => void;
  toggleOrbits: () => void;
  nudgeScale: (delta: number) => void;
  nudgeRain: (delta: number) => void;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const useSystemConfig = create<SystemConfig>()(
  persist(
    (set) => ({
      orbitOn: true,
      showOrbits: false,
      orbitScale: 1,
      rainIntensity: 0.35,
      toggleOrbit: () => set((s) => ({ orbitOn: !s.orbitOn })),
      toggleOrbits: () => set((s) => ({ showOrbits: !s.showOrbits })),
      nudgeScale: (delta) =>
        set((s) => ({ orbitScale: Math.round(clamp(s.orbitScale + delta, 0, 5) * 100) / 100 })),
      nudgeRain: (delta) =>
        set((s) => ({ rainIntensity: Math.round(clamp(s.rainIntensity + delta, 0, 1) * 100) / 100 })),
    }),
    { name: "lph-system" },
  ),
);
