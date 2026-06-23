import { ComponentType } from "react";
import { RainPlanet } from "./RainPlanet";
import { ClockPlanet } from "./ClockPlanet";

/**
 * The universe (WORLD.md): a hand-authored list of tiny planets. Travel visits
 * them in order, wrapping around. Add a planet by writing its component and
 * appending it here. No procedural generation — every planet is deliberate.
 */
export interface PlanetDef {
  id: string;
  /** Shown on arrival. */
  name: string;
  /** One-word theme, shown under the name. */
  theme: string;
  Component: ComponentType;
}

export const PLANETS: PlanetDef[] = [
  { id: "rain", name: "비의 행성", theme: "기다림", Component: RainPlanet },
  { id: "clock", name: "시간의 행성", theme: "시간", Component: ClockPlanet },
];
