import { RefObject, useLayoutEffect } from "react";
import { Group, Vector3 } from "three";
import { useGame } from "../state";
import { placeOnSurface } from "../../lib/sphere";

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
    placeOnSurface(ref.current!, opts.direction, planetRadius, opts.spin ?? 0);
    const position = opts.direction.clone().normalize().multiplyScalar(planetRadius);
    useGame.getState().register({
      id: opts.id,
      position,
      radius: opts.range,
      prompt: opts.prompt,
      speaker: opts.speaker,
      lines: opts.lines,
      onInteract: opts.onInteract,
    });
    return () => useGame.getState().unregister(opts.id);
    // Props are static per mount; intentionally run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
