import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, HemisphereLight, MathUtils } from "three";
import { world } from "../world";

/**
 * A hemisphere "sky" fill that brightens with the time of day — our cheap
 * stand-in for atmospheric scattering. Real daylight is bright and soft because
 * the whole sky acts as a huge fill light; without it a lone sun just gives
 * harsh light + black shadows (the "moon" look). Drives itself from
 * `world.daylight` (0 night .. 1 day, tied to the hamster's local day/night),
 * so as you walk into the sun the world warms up and brightens.
 *
 * Planets that should feel airless/lunar simply omit this and keep a low,
 * fixed hemisphere tint instead.
 */
export function SkyLight({
  daySky = "#cfe2f0",
  nightSky = "#16222f",
  dayGround = "#5d6b62",
  nightGround = "#0b1014",
  dayIntensity = 1.35,
  nightIntensity = 0.12,
}: {
  daySky?: string;
  nightSky?: string;
  dayGround?: string;
  nightGround?: string;
  dayIntensity?: number;
  nightIntensity?: number;
}) {
  const light = useRef<HemisphereLight>(null!);
  const c = useMemo(
    () => ({
      daySky: new Color(daySky),
      nightSky: new Color(nightSky),
      dayGround: new Color(dayGround),
      nightGround: new Color(nightGround),
    }),
    [daySky, nightSky, dayGround, nightGround],
  );

  useFrame(() => {
    const l = light.current;
    if (!l) return;
    const d = world.daylight;
    l.intensity = MathUtils.lerp(nightIntensity, dayIntensity, d);
    l.color.copy(c.nightSky).lerp(c.daySky, d);
    l.groundColor.copy(c.nightGround).lerp(c.dayGround, d);
  });

  return <hemisphereLight ref={light} args={[nightSky, nightGround, nightIntensity]} />;
}
