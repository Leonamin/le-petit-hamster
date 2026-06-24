import { RefObject, useLayoutEffect } from "react";
import { Group, Vector3 } from "three";
import { useGame } from "../state";
import { addCollider, removeCollider } from "../world";
import { surfaceRadius, surfaceNormal } from "../terrain";
import { placeOnSurface } from "../../lib/sphere";

const _normal = new Vector3();

interface Options {
  id: string;
  /** Surface direction (need not be normalised). */
  direction: Vector3;
  /** Spin about the surface normal when placed. */
  spin?: number;
  /** Interaction range in world units. */
  range: number;
  prompt: string;
  speaker?: string;
  lines?: string[];
  onInteract?: () => void;
  /** If set, also block the hamster from walking through this prop. */
  collideRadius?: number;
}

/**
 * Places a group on the planet surface (at the given planet radius) and
 * registers it as an interactable for its lifetime — auto-unregistered on
 * unmount, which is how planets clean up their NPCs when you travel away.
 */
export function useInteractableProp(
  ref: RefObject<Group>,
  planetRadius: number,
  opts: Options,
): void {
  useLayoutEffect(() => {
    const r = surfaceRadius(planetRadius, opts.direction);
    const n = surfaceNormal(opts.direction, planetRadius, _normal);
    placeOnSurface(ref.current!, opts.direction, r, opts.spin ?? 0, n);
    const position = opts.direction.clone().normalize().multiplyScalar(r);
    useGame.getState().register({
      id: opts.id,
      position,
      radius: opts.range,
      prompt: opts.prompt,
      speaker: opts.speaker,
      lines: opts.lines,
      onInteract: opts.onInteract,
    });
    if (opts.collideRadius) {
      addCollider({ id: opts.id, position: position.clone(), radius: opts.collideRadius });
    }
    return () => {
      useGame.getState().unregister(opts.id);
      if (opts.collideRadius) removeCollider(opts.id);
    };
    // Props are static per mount; intentionally run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
