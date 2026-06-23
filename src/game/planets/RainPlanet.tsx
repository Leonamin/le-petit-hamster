import { useLayoutEffect, useRef } from "react";
import { Group, Vector3 } from "three";
import { addCollider, removeCollider } from "../world";
import { placeOnSurface } from "../../lib/sphere";
import { Lighthouse } from "../objects/Lighthouse";
import { Rain } from "../objects/Rain";
import { Atmosphere } from "../objects/Atmosphere";
import { Motes } from "../objects/Motes";
import { DeparturePod } from "../objects/DeparturePod";
import { LighthouseKeeper } from "../characters/LighthouseKeeper";
import { SleepingFriend } from "../characters/SleepingFriend";
import { PlanetProps } from "./registry";

/**
 * Rain Planet — Theme: Waiting (PLANETS.md). Lit by the system's star; adds
 * only a cool sky tint of its own. Hosts its scenery, NPC, sleeping friend and
 * departure pod. Hand-authored, no procedural generation (VISION).
 */
export function RainPlanet({ radius }: PlanetProps) {
  const lighthouse = useRef<Group>(null!);
  const rocks = useRef<Group>(null!);

  useLayoutEffect(() => {
    placeOnSurface(lighthouse.current, new Vector3(0.2, 1, 0.3), radius);
    const lhPos = new Vector3(0.2, 1, 0.3).normalize().multiplyScalar(radius);
    addCollider({ id: "rain-lighthouse", position: lhPos, radius: 1.3 });
    const dirs: [number, number, number, number][] = [
      [0.8, 0.3, -0.4, 0],
      [-0.3, 0.2, 0.9, 1.2],
      [0.1, -0.4, 0.9, 2.0],
      [-0.9, -0.2, -0.2, 0.5],
    ];
    rocks.current.children.forEach((rock, i) => {
      const [x, y, z, spin] = dirs[i % dirs.length];
      placeOnSurface(rock, new Vector3(x, y, z), radius, spin);
    });
    return () => removeCollider("rain-lighthouse");
  }, [radius]);

  return (
    <group>
      {/* Cool twilight tint on top of the star's light. */}
      <hemisphereLight args={["#5a7088", "#10161e", 0.25]} />

      {/* The planet body */}
      <mesh receiveShadow>
        <sphereGeometry args={[radius, 64, 64]} />
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

      <Atmosphere radius={radius} color="#5a8fb0" />
      <Rain />
      {/* Sparse cool motes — like fine spray drifting in the rain. */}
      <Motes count={28} color="#bcd6ec" area={5} height={4} size={0.04} drift={0.4} />

      <LighthouseKeeper radius={radius} />
      <SleepingFriend
        id="rain-friend"
        radius={radius}
        direction={new Vector3(-0.6, 0.5, -0.7)}
        lines={[
          "…음… 누가… 왔어…?",
          "아아… 나, 도대체 얼마나 잠들어 있었던 걸까.",
          "깨워줘서… 아니, 그냥 곁에 와줘서 고마워. 그거면 충분해.",
        ]}
      />
      <DeparturePod radius={radius} />
    </group>
  );
}
