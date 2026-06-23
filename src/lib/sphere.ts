import { Matrix4, Object3D, Quaternion, Vector3 } from "three";

/**
 * Helpers for living on the surface of a sphere.
 *
 * Core idea: every point on a planet has an "up" vector = the normalised
 * position (pointing away from the planet centre). Walking means moving in the
 * tangent plane and re-projecting back onto the surface. Standing upright means
 * aligning the object's local +Y with that up vector.
 */

const _up = new Vector3();
const _right = new Vector3();
const _basis = new Matrix4();

/** Up vector at a given surface position (planet centre assumed at origin). */
export function upAt(position: Vector3, target = new Vector3()): Vector3 {
  return target.copy(position).normalize();
}

/**
 * Build a quaternion that stands an object on the surface, facing `forward`.
 * The model is assumed to face its local +Z. `forward` should be roughly
 * tangent to the surface; it is orthonormalised against `up` here.
 */
export function surfaceOrientation(
  up: Vector3,
  forward: Vector3,
  target = new Quaternion(),
): Quaternion {
  // Orthonormalise forward against up so the basis stays rigid.
  const f = _right.copy(forward).addScaledVector(up, -forward.dot(up));
  if (f.lengthSq() < 1e-6) {
    // Degenerate (looking straight up/down) — pick an arbitrary tangent.
    f.set(up.y, up.z, up.x).addScaledVector(up, -up.dot(_up.set(up.y, up.z, up.x)));
  }
  f.normalize();
  const x = _up.copy(up).cross(f).normalize(); // x = up × forward (right-handed)
  // Columns: local X→x, local Y→up, local Z→forward.
  _basis.makeBasis(x, up, f);
  return target.setFromRotationMatrix(_basis);
}

const _turnCross = new Vector3();

/**
 * Rotate the tangent vector `current` toward `target` about `up`, by at most
 * `maxRadians`. Both are assumed roughly tangent to the surface and normalised.
 * Mutates `current` in place. Used to ease headings without snapping.
 */
export function turnToward(
  current: Vector3,
  target: Vector3,
  up: Vector3,
  maxRadians: number,
): void {
  const dot = Math.min(1, Math.max(-1, current.dot(target)));
  if (dot > 0.99999) return; // already aligned
  const sign = up.dot(_turnCross.crossVectors(current, target)) >= 0 ? 1 : -1;
  const angle = Math.acos(dot) * sign;
  const step = Math.max(-maxRadians, Math.min(maxRadians, angle));
  current.applyAxisAngle(up, step);
}

/**
 * Place a static prop on the planet surface at a given direction (need not be
 * normalised), standing upright. `spin` rotates it about its own up axis.
 */
export function placeOnSurface(
  obj: Object3D,
  direction: Vector3,
  radius: number,
  spin = 0,
): void {
  const up = upAt(direction);
  obj.position.copy(up).multiplyScalar(radius);
  // Any tangent works for a static prop; derive one then spin around up.
  const tangent = new Vector3(0, 1, 0).cross(up);
  if (tangent.lengthSq() < 1e-6) tangent.set(1, 0, 0);
  tangent.normalize().applyAxisAngle(up, spin);
  obj.quaternion.copy(surfaceOrientation(up, tangent));
}
