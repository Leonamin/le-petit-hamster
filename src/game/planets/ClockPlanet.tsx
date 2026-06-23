import { useLayoutEffect, useRef } from "react";
import { Group, Vector3 } from "three";
import { addCollider, removeCollider } from "../world";
import { placeOnSurface } from "../../lib/sphere";
import { ClockTower } from "../objects/ClockTower";
import { Atmosphere } from "../objects/Atmosphere";
import { Motes } from "../objects/Motes";
import { DeparturePod } from "../objects/DeparturePod";
import { ClockArtisan } from "../characters/ClockArtisan";
import { SleepingFriend } from "../characters/SleepingFriend";
import { PlanetProps } from "./registry";

/**
 * Clock Planet — Theme: Time. A smaller world. Lit by the system's star; adds a
 * warm amber tint. A great clock tower whose hands turn slowly, the windup
 * artisan, a sleeping friend, and the departure pod. Hand-authored.
 */
export function ClockPlanet({ radius }: PlanetProps) {
  const tower = useRef<Group>(null!);
  const stones = useRef<Group>(null!);

  useLayoutEffect(() => {
    placeOnSurface(tower.current, new Vector3(0.15, 1, 0.25), radius);
    const towerPos = new Vector3(0.15, 1, 0.25).normalize().multiplyScalar(radius);
    addCollider({ id: "clock-tower", position: towerPos, radius: 1.5 });
    const dirs: [number, number, number, number][] = [
      [0.7, 0.4, -0.5, 0.3],
      [-0.4, 0.3, 0.85, 1.0],
      [0.2, -0.5, 0.8, 2.4],
      [-0.85, -0.1, -0.3, 0.8],
    ];
    stones.current.children.forEach((s, i) => {
      const [x, y, z, spin] = dirs[i % dirs.length];
      placeOnSurface(s, new Vector3(x, y, z), radius, spin);
    });
    return () => removeCollider("clock-tower");
  }, [radius]);

  return (
    <group>
      {/* Warm amber dusk tint on top of the star's light. */}
      <hemisphereLight args={["#e6c48a", "#3a2c1e", 0.3]} />

      {/* The planet body */}
      <mesh receiveShadow>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial color="#5b5142" roughness={1} metalness={0} />
      </mesh>

      <group ref={tower}>
        <ClockTower />
      </group>

      <group ref={stones}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} scale={0.4 + (i % 2) * 0.2}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#6a5d49" roughness={1} flatShading />
          </mesh>
        ))}
      </group>

      <Atmosphere radius={radius} color="#caa24a" />
      {/* Warm fireflies drifting in the slow amber dusk. */}
      <Motes count={70} color="#ffcf7a" area={5} height={3.5} size={0.05} drift={0.7} />

      <ClockArtisan radius={radius} />
      <SleepingFriend
        id="clock-friend"
        radius={radius}
        direction={new Vector3(-0.55, 0.45, -0.75)}
        lines={[
          "…응…? 벌써 시간이… 그렇게 됐나….",
          "여긴 시간이 천천히 흘러서, 자다 보면 한참을 자게 돼.",
          "와줘서 고마워. 시간이 느린 곳에선, 누군가를 기다리는 일도 길어지니까.",
        ]}
        colors={{ body: "#d8b27a", head: "#e3c490", ear: "#c89a5e" }}
      />
      <DeparturePod radius={radius} />
    </group>
  );
}
