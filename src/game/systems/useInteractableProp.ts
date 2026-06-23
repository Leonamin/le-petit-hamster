import { RefObject, useLayoutEffect } from "react";
import { Group, Vector3 } from "three";
import { PLANET_RADIUS } from "../config";
import { useGame } from "../state";
import { placeOnSurface } from "../../lib/sphere";

interface Options {
  id: string;
  /** Surface direction (need not be normalised). */
  direction: Vector3;
  /** Spin about the surface normal when placed. */
  spin?: number;
  /** Interaction radius in world units. */
  radius: number;
  prompt: string;
  speaker?: string;
  lines?: string[];
  onInteract?: () => void;
}

/**
 * Places a group on the planet surface and registers it as an interactable for
 * its lifetime (auto-unregistered on unmount — which is how planets clean up
 * their NPCs when you travel away). DRYs the boilerplate every prop repeated.
 */
export function useInteractableProp(ref: RefObject<Group>, opts: Options): void {
  useLayoutEffect(() => {
    placeOnSurface(ref.current!, opts.direction, PLANET_RADIUS, opts.spin ?? 0);
    const position = opts.direction.clone().normalize().multiplyScalar(PLANET_RADIUS);
    useGame.getState().register({
      id: opts.id,
      position,
      radius: opts.radius,
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
