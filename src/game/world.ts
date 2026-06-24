import { Vector3 } from "three";
import { heightAt } from "./terrain";

/**
 * Non-React world state shared with systems. `daylight` (0 night .. 1 day) is
 * computed each frame from where the sun sits relative to the hamster, and read
 * by anything that wants to react to the time of day.
 */
export const world = { daylight: 1 };

const _push = new Vector3();

export interface Collider {
  id: string;
  /** World position (on the planet surface). */
  position: Vector3;
  /** Push-out radius (already includes a little margin for the hamster). */
  radius: number;
}

const colliders = new Map<string, Collider>();

export function addCollider(c: Collider): void {
  colliders.set(c.id, c);
}

export function removeCollider(id: string): void {
  colliders.delete(id);
}

/**
 * Kinematic push-out: if the hamster is inside any collider, shove it back to
 * the boundary and re-seat it on the surface. Cheap, for a handful of props.
 */
export function resolveCollisions(pos: Vector3, planetRadius: number): void {
  for (const c of colliders.values()) {
    const dist = pos.distanceTo(c.position);
    if (dist > 1e-4 && dist < c.radius) {
      _push.copy(pos).sub(c.position).multiplyScalar(c.radius / dist);
      pos.copy(c.position).add(_push);
      pos.setLength(planetRadius + heightAt(pos)); // re-seat onto the terrain
    }
  }
}
