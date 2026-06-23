import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Live-tunable camera + movement-feel parameters. Adjust them in-game with the
 * debug overlay (toggle with C), find values you like, then read them off the
 * panel. Persisted to localStorage so tuning survives a reload.
 *
 * When values are settled, bake them into DEFAULTS here.
 */

export type TunableKey =
  | "distance"
  | "height"
  | "lookUp"
  | "fov"
  | "turnRate"
  | "camFollow";

interface CameraConfig {
  /** Distance the camera trails behind the hamster (world units). */
  distance: number;
  /** Camera height above the hamster along the surface normal. */
  height: number;
  /** How far above the hamster the camera aims (higher = look further ahead). */
  lookUp: number;
  /** Field of view in degrees. */
  fov: number;
  /** How fast the hamster's body turns to face its movement direction (rad/s). */
  turnRate: number;
  /** How fast the camera trails the body's facing (rad/s). 0 = fixed strafe. */
  camFollow: number;

  debug: boolean;
  toggleDebug: () => void;
  nudge: (key: TunableKey, delta: number) => void;
  reset: () => void;
}

const DEFAULTS: Record<TunableKey, number> = {
  distance: 5.5,
  height: 2.6,
  lookUp: 2.0,
  fov: 60,
  turnRate: 10,
  camFollow: 2.5,
};

// [min, max] clamp ranges for each tunable.
const RANGES: Record<TunableKey, [number, number]> = {
  distance: [1, 15],
  height: [0, 10],
  lookUp: [-2, 8],
  fov: [30, 90],
  turnRate: [0.5, 16],
  camFollow: [0, 16],
};

const clamp = (v: number, [lo, hi]: [number, number]) =>
  Math.min(hi, Math.max(lo, v));

export const useCameraConfig = create<CameraConfig>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      debug: false,
      toggleDebug: () => set((s) => ({ debug: !s.debug })),
      nudge: (key, delta) =>
        set((s) => ({
          [key]: Math.round(clamp(s[key] + delta, RANGES[key]) * 100) / 100,
        })),
      reset: () => set({ ...DEFAULTS }),
    }),
    {
      name: "lph-camera-v2",
      // Only persist the numbers, not the debug toggle.
      partialize: (s) => ({
        distance: s.distance,
        height: s.height,
        lookUp: s.lookUp,
        fov: s.fov,
        turnRate: s.turnRate,
        camFollow: s.camFollow,
      }),
    },
  ),
);
