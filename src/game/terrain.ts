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

const _sn = {
  up: new Vector3(),
  t1: new Vector3(),
  t2: new Vector3(),
  p0: new Vector3(),
  pa: new Vector3(),
  pb: new Vector3(),
  da: new Vector3(),
  db: new Vector3(),
  e1: new Vector3(),
  e2: new Vector3(),
};
const _UP = new Vector3(0, 1, 0);
const _RT = new Vector3(1, 0, 0);

function pointAt(dirUnit: Vector3, base: number, target: Vector3): void {
  const h = active ? active(dirUnit.x, dirUnit.y, dirUnit.z) : 0;
  target.copy(dirUnit).multiplyScalar(base + h);
}

/**
 * Surface normal at `dir` (need not be normalised), via finite differences on
 * the heightfield — this is what tilts the hamster/props to a slope (Phase 2).
 * Positioning still uses the radial direction; only orientation uses this.
 * Falls back to the radial direction when there's no terrain.
 */
export function surfaceNormal(dir: Vector3, base: number, target = new Vector3()): Vector3 {
  const up = _sn.up.copy(dir).normalize();
  if (!active) return target.copy(up);
  // A tangent basis at `up`.
  _sn.t1.copy(Math.abs(up.y) < 0.99 ? _UP : _RT).cross(up).normalize();
  _sn.t2.crossVectors(up, _sn.t1); // unit (up ⟂ t1)
  const eps = 0.02;
  pointAt(up, base, _sn.p0);
  pointAt(_sn.da.copy(up).addScaledVector(_sn.t1, eps).normalize(), base, _sn.pa);
  pointAt(_sn.db.copy(up).addScaledVector(_sn.t2, eps).normalize(), base, _sn.pb);
  _sn.e1.subVectors(_sn.pa, _sn.p0);
  _sn.e2.subVectors(_sn.pb, _sn.p0);
  target.crossVectors(_sn.e1, _sn.e2).normalize();
  if (target.dot(up) < 0) target.negate();
  return target;
}
