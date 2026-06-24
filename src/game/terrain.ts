import { Vector3 } from "three";

/**
 * Terrain as a height offset over the sphere. The active planet registers a
 * `HeightField`; the walk controller, prop placement and collision read it so
 * the surface is no longer a perfect sphere — its distance from the centre at a
 * direction is `baseRadius + height(dir)`.
 *
 * Phase 1: height-follow only (the hamster still stands radially upright on
 * gentle hills). Hand-authored, never noise (VISION: no procedural generation).
 */
export type HeightField = (x: number, y: number, z: number) => number; // x,y,z = normalised dir

export interface Hill {
  /** Centre direction (need not be normalised). */
  dir: [number, number, number];
  /** Height in world units; negative = a basin. */
  amp: number;
  /** Angular falloff in radians — how wide the bump is. */
  width: number;
}

/** Build a heightfield as a sum of hand-placed Gaussian bumps over the sphere. */
export function makeHills(hills: Hill[]): HeightField {
  const cs = hills.map((h) => {
    const v = new Vector3(...h.dir).normalize();
    return { x: v.x, y: v.y, z: v.z, amp: h.amp, inv: 1 / (h.width * h.width) };
  });
  return (x, y, z) => {
    let h = 0;
    for (const c of cs) {
      const dot = Math.min(1, Math.max(-1, x * c.x + y * c.y + z * c.z));
      const ang = Math.acos(dot);
      h += c.amp * Math.exp(-ang * ang * c.inv);
    }
    return h;
  };
}

let active: HeightField | null = null;

export function setTerrain(fn: HeightField): void {
  active = fn;
}

/** Clear terrain. If `fn` is given, only clears when it's still the active one
 *  (so a newly-mounted planet's terrain survives the old planet's cleanup). */
export function clearTerrain(fn?: HeightField): void {
  if (!fn || active === fn) active = null;
}

const _d = new Vector3();

/** Height offset at a direction (need not be normalised). 0 when no terrain. */
export function heightAt(dir: Vector3): number {
  if (!active) return 0;
  _d.copy(dir).normalize();
  return active(_d.x, _d.y, _d.z);
}

/** Distance from the planet centre to the surface at `dir`. */
export function surfaceRadius(base: number, dir: Vector3): number {
  return base + heightAt(dir);
}
