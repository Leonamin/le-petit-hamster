import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { RainPlanet } from "./game/planets/RainPlanet";
import { Hamster } from "./game/characters/Hamster";
import { LighthouseKeeper } from "./game/characters/LighthouseKeeper";
import { SleepingFriend } from "./game/characters/SleepingFriend";
import { DeparturePod } from "./game/objects/DeparturePod";
import { Hud } from "./ui/Hud";

/**
 * Root of the experience. The mood (Melancholic / Warm / Quiet — PLANETS.md)
 * comes almost entirely from lighting + fog + post-processing rather than from
 * detailed models. That is the whole strategy for "no assets".
 */
export function App() {
  return (
    <>
      <Canvas shadows camera={{ fov: 55, near: 0.1, far: 100 }}>
        {/* Twilight rain sky + fog to make the small world feel vast and soft. */}
        <color attach="background" args={["#1a2230"]} />
        <fog attach="fog" args={["#1a2230", 12, 34]} />

        <hemisphereLight args={["#9fb4c7", "#2a3340", 0.6]} />
        <directionalLight
          position={[6, 10, 4]}
          intensity={1.1}
          color="#dfe7f0"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        <RainPlanet />
        <LighthouseKeeper />
        <SleepingFriend />
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
