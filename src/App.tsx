import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Hamster } from "./game/characters/Hamster";
import { DeparturePod } from "./game/objects/DeparturePod";
import { PLANETS } from "./game/planets/registry";
import { useGame } from "./game/state";
import { Hud } from "./ui/Hud";

/**
 * Root of the experience. Each planet is self-contained (its own mood + scenery
 * + characters); App just mounts the active one plus the persistent traveller
 * (the hamster + its pod) and the global post-processing and UI.
 */
export function App() {
  const currentPlanet = useGame((s) => s.currentPlanet);
  const ActivePlanet = PLANETS[currentPlanet].Component;

  // Tell the store how many planets exist, so travel can wrap around.
  useEffect(() => {
    useGame.setState({ planetCount: PLANETS.length });
  }, []);

  return (
    <>
      <Canvas shadows camera={{ fov: 60, near: 0.1, far: 100 }}>
        <ActivePlanet />

        {/* Persistent traveller — survives planet swaps. */}
        <DeparturePod />
        <Hamster />

        <EffectComposer>
          <Bloom
            intensity={0.7}
            luminanceThreshold={0.6}
            luminanceSmoothing={0.3}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.25} darkness={0.85} />
        </EffectComposer>
      </Canvas>

      <Hud />
    </>
  );
}
