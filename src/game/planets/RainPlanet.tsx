import { useLayoutEffect, useRef } from "react";
import { Group, Vector3 } from "three";
import { PLANET_RADIUS } from "../config";
import { placeOnSurface } from "../../lib/sphere";
import { Lighthouse } from "../objects/Lighthouse";

/**
 * Rain Planet — Theme: Waiting (PLANETS.md).
 * The whole diorama is hand-authored (no procedural generation, per VISION):
 * objects are placed at explicit directions on the sphere.
 */
export function RainPlanet() {
  const lighthouse = useRef<Group>(null!);
  const rocks = useRef<Group>(null!);

  useLayoutEffect(() => {
    placeOnSurface(lighthouse.current, new Vector3(0.2, 1, 0.3), PLANET_RADIUS);
    // A few scattered rocks for landmarks.
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
    </group>
  );
}
