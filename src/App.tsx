import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Bloom,
  BrightnessContrast,
  EffectComposer,
  HueSaturation,
  TiltShift2,
  Vignette,
} from "@react-three/postprocessing";
import { Hamster } from "./game/characters/Hamster";
import { InteractionMarker } from "./game/objects/InteractionMarker";
import { SolarSystem } from "./game/SolarSystem";
import { PLANETS } from "./game/planets/registry";
import { useGame } from "./game/state";
import { Hud } from "./ui/Hud";

/**
 * Root of the experience. A single star system lives in world space; the active
 * planet is rendered at the origin (simple controller) with the star and the
 * other planets drawn around it. App mounts the active planet's diorama plus
 * the persistent traveller (the hamster) and the global post-processing and UI.
 */
export function App() {
  const currentPlanet = useGame((s) => s.currentPlanet);
  const planet = PLANETS[currentPlanet];
  const ActivePlanet = planet.Component;

  // Tell the store how many planets exist, so travel can wrap around.
  useEffect(() => {
    useGame.setState({ planetCount: PLANETS.length });
  }, []);

  return (
    <>
      <Canvas shadows camera={{ fov: 60, near: 0.1, far: 2000 }}>
        <color attach="background" args={["#05060a"]} />

        <SolarSystem />
        <ActivePlanet radius={planet.radius} />
        <Hamster radius={planet.radius} />
        <InteractionMarker />

        <EffectComposer>
          <Bloom
            intensity={0.8}
            luminanceThreshold={0.55}
            luminanceSmoothing={0.3}
            mipmapBlur
          />
          {/* Tilt-shift = the "tiny world / miniature diorama" look: a sharp
              focus band through the middle, blurring sky and foreground. */}
          <TiltShift2 blur={0.16} taper={0.4} start={[0, 0.52]} end={[1, 0.52]} />
          {/* Storybook colour grading: a touch more saturation + contrast. */}
          <HueSaturation saturation={0.14} hue={0} />
          <BrightnessContrast brightness={0} contrast={0.1} />
          <Vignette eskil={false} offset={0.3} darkness={0.85} />
        </EffectComposer>
      </Canvas>

      <Hud />
    </>
  );
}
