import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { Color, FogExp2 } from "three";
import { world } from "../world";

/**
 * Daylight-driven "air" for a planet WITH an atmosphere. Two cheap tricks that
 * together read as aerial perspective:
 *   • distance fog hazes the far limb + distant planets toward a sky colour, so
 *     the horizon glows instead of meeting hard black space;
 *   • the sky (scene background) lifts from near-black to a soft horizon tint.
 *
 * Both ramp with `world.daylight`, so it only shows by day and fades out at
 * night (stars return). Restored on unmount, so airless/lunar planets that omit
 * this stay crisp and black. Deliberately subtle.
 */
const NIGHT_SKY = new Color("#05060a"); // matches App's space background

export function AtmosphereHaze({
  color = "#9fb4c4", // daytime haze tint applied to distant geometry
  daySky = "#27333e", // daytime sky (background) — muted so stars still read
  maxDensity = 0.018,
}: {
  color?: string;
  daySky?: string;
  maxDensity?: number;
}) {
  const scene = useThree((s) => s.scene);
  const mem = useMemo(
    () => ({ fog: new FogExp2(color, 0), haze: new Color(color), day: new Color(daySky), bg: new Color() }),
    [color, daySky],
  );

  // Take over fog + background for this planet's lifetime; restore on unmount.
  useEffect(() => {
    const prevFog = scene.fog;
    const prevBg = scene.background;
    scene.fog = mem.fog;
    scene.background = mem.bg.copy(NIGHT_SKY);
    return () => {
      scene.fog = prevFog;
      scene.background = prevBg;
    };
  }, [scene, mem]);

  useFrame(() => {
    const d = world.daylight; // 0 night .. 1 day, at the hamster's position
    mem.fog.density = d * maxDensity;
    mem.fog.color.copy(NIGHT_SKY).lerp(mem.haze, d);
    if (scene.background instanceof Color) scene.background.copy(NIGHT_SKY).lerp(mem.day, d);
  });

  return null;
}
