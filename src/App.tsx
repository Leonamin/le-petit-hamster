import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Hamster } from "./game/characters/Hamster";
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

        <EffectComposer>
          <Bloom
            intensity={0.9}
            luminanceThreshold={0.55}
            luminanceSmoothing={0.3}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.3} darkness={0.8} />
        </EffectComposer>
      </Canvas>

      <Hud />
    </>
  );
}
