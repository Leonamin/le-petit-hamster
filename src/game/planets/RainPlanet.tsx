import { useLayoutEffect, useRef } from "react";
import { Group, Vector3 } from "three";
import { PLANET_RADIUS } from "../config";
import { placeOnSurface } from "../../lib/sphere";
import { Lighthouse } from "../objects/Lighthouse";
import { LighthouseKeeper } from "../characters/LighthouseKeeper";
import { SleepingFriend } from "../characters/SleepingFriend";

/**
 * Rain Planet — Theme: Waiting (PLANETS.md). Self-contained: it sets its own
 * mood (twilight sky + fog + soft light) and hosts its own scenery, NPC and
 * sleeping friend. Mounted/unmounted by the planet registry as you travel.
 * Hand-authored, no procedural generation (VISION).
 */
export function RainPlanet() {
  const lighthouse = useRef<Group>(null!);
  const rocks = useRef<Group>(null!);

  useLayoutEffect(() => {
    placeOnSurface(lighthouse.current, new Vector3(0.2, 1, 0.3), PLANET_RADIUS);
    const dirs: [number, number, number, number][] = [
      [0.8, 0.3, -0.4, 0],
      [-0.3, 0.2, 0.9, 1.2],
      [0.1, -0.4, 0.9, 2.0],
      [-0.9, -0.2, -0.2, 0.5],
    ];
    rocks.current.children.forEach((rock, i) => {
      const [x, y, z, spin] = dirs[i % dirs.length];
      placeOnSurface(rock, new Vector3(x, y, z), PLANET_RADIUS, spin);
    });
  }, []);

  return (
    <group>
      {/* Mood: twilight rain sky + fog so the small world feels vast and soft. */}
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

      {/* The planet body */}
      <mesh receiveShadow>
        <sphereGeometry args={[PLANET_RADIUS, 64, 64]} />
        <meshStandardMaterial color="#3f5a52" roughness={1} metalness={0} />
      </mesh>

      <group ref={lighthouse}>
        <Lighthouse />
      </group>

      <group ref={rocks}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} scale={0.4 + (i % 2) * 0.2}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#4a5d63" roughness={1} flatShading />
          </mesh>
        ))}
      </group>

      <LighthouseKeeper />
      <SleepingFriend
        id="rain-friend"
        direction={new Vector3(-0.6, 0.5, -0.7)}
        lines={[
          "…음… 누가… 왔어…?",
          "아아… 나, 도대체 얼마나 잠들어 있었던 걸까.",
          "깨워줘서… 아니, 그냥 곁에 와줘서 고마워. 그거면 충분해.",
        ]}
      />
    </group>
  );
}
