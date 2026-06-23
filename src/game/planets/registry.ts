import { ComponentType } from "react";
import { Vector3 } from "three";
import { RainPlanet } from "./RainPlanet";
import { ClockPlanet } from "./ClockPlanet";

/**
 * The star system (WORLD.md): a hand-authored list of tiny planets orbiting a
 * single star. You only ever walk on the active planet (rendered at the origin
 * for a simple controller); the rest of the system is drawn around it, so from
 * any planet you can see the star and the others drifting across the sky.
 *
 * Travel visits planets in order, wrapping around. No procedural generation —
 * every planet is deliberate.
 */
export interface PlanetProps {
  /** This planet's surface radius (world units). */
  radius: number;
}

export interface PlanetDef {
  id: string;
  name: string; // shown on arrival
  theme: string; // one word, shown under the name
  radius: number;
  /** Colour of this planet seen from afar (in another planet's sky). */
  color: string;
  /** Distance from the star. */
  orbitRadius: number;
  /** Angular speed of its orbit (rad/s) — keep small and calm. */
  orbitSpeed: number;
  /** Starting angle of its orbit. */
  orbitPhase: number;
  /** Axial self-rotation speed (rad/s). For the active planet this is shown by
   *  counter-rotating the sky; for distant planets the mesh itself spins. */
  spinSpeed: number;
  Component: ComponentType<PlanetProps>;
}

export const PLANETS: PlanetDef[] = [
  {
    id: "rain",
    name: "비의 행성",
    theme: "기다림",
    radius: 8,
    color: "#3f5a52",
    orbitRadius: 46,
    orbitSpeed: 0.05,
    orbitPhase: 0,
    spinSpeed: 0.06,
    Component: RainPlanet,
  },
  {
    id: "clock",
    name: "시간의 행성",
    theme: "시간",
    radius: 5.5,
    color: "#6a5d49",
    orbitRadius: 28,
    orbitSpeed: 0.085,
    orbitPhase: 2.2,
    spinSpeed: 0.1,
    Component: ClockPlanet,
  },
];

/** World-space position of a planet on its orbit at time `t` (star at origin). */
export function orbitPosition(p: PlanetDef, t: number, target = new Vector3()): Vector3 {
  const a = p.orbitPhase + p.orbitSpeed * t;
  return target.set(Math.cos(a) * p.orbitRadius, 0, Math.sin(a) * p.orbitRadius);
}
