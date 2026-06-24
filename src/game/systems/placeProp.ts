import { Object3D, Vector3 } from "three";
import { placeOnSurface } from "../../lib/sphere";
import { addCollider } from "../world";
import { surfaceRadius } from "../terrain";

/**
 * Place a static prop on the planet surface, and — if `collide` is given —
 * register a push-out collider at the same spot so the hamster can't walk
 * through it. `placeOnSurface` already sets `obj.position` to the surface point,
 * so we read it back instead of recomputing the direction→position math.
 *
 * Returns the collider id (or null) so callers can `removeCollider` on cleanup.
 * This is the reusable path for scenery props (lighthouse, cottage, trees, …);
 * NPCs get the same collider via `useInteractableProp`'s `collideRadius`.
 */
export function placeProp(
  obj: Object3D,
  direction: Vector3,
  radius: number,
  opts: { spin?: number; collide?: { id: string; radius: number } } = {},
): string | null {
  // Sit on the terrain surface (= base radius + local height), not the sphere.
  placeOnSurface(obj, direction, surfaceRadius(radius, direction), opts.spin ?? 0);
  if (opts.collide) {
    addCollider({ id: opts.collide.id, position: obj.position.clone(), radius: opts.collide.radius });
    return opts.collide.id;
  }
  return null;
}
