import { useLayoutEffect, useRef } from "react";
import { Group, Vector3 } from "three";
import { PLANET_RADIUS } from "../config";
import { placeOnSurface } from "../../lib/sphere";
import { ClockTower } from "../objects/ClockTower";
import { ClockArtisan } from "../characters/ClockArtisan";
import { SleepingFriend } from "../characters/SleepingFriend";

/**
 * Clock Planet — Theme: Time. Self-contained: warm amber dusk, a great clock
 * tower whose hands turn slowly, the windup artisan, and a sleeping friend.
 * Hand-authored, mounted by the planet registry when you travel here.
 */
export function ClockPlanet() {
  const tower = useRef<Group>(null!);
  const stones = useRef<Group>(null!);

  useLayoutEffect(() => {
    placeOnSurface(tower.current, new Vector3(0.15, 1, 0.25), PLANET_RADIUS);
    const dirs: [number, number, number, number][] = [
      [0.7, 0.4, -0.5, 0.3],
      [-0.4, 0.3, 0.85, 1.0],
      [0.2, -0.5, 0.8, 2.4],
      [-0.85, -0.1, -0.3, 0.8],
    ];
    stones.current.children.forEach((s, i) => {
      const [x, y, z, spin] = dirs[i % dirs.length];
      placeOnSurface(s, new Vector3(x, y, z), PLANET_RADIUS, spin);
    });
  }, []);

  return (
    <group>
      {/* Mood: warm amber dusk — slow, nostalgic, the light of late afternoon. */}
      <color attach="background" args={["#2a2018"]} />
      <fog attach="fog" args={["#2a2018", 12, 34]} />
      <hemisphereLight args={["#e6c48a", "#3a2c1e", 0.7]} />
      <directionalLight
        position={[5, 9, 5]}
        intensity={1.0}
        color="#ffe0b0"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* The planet body */}
      <mesh receiveShadow>
        <sphereGeometry args={[PLANET_RADIUS, 64, 64]} />
        <meshStandardMaterial color="#5b5142" roughness={1} metalness={0} />
      </mesh>

      <group ref={tower}>
        <ClockTower />
      </group>

      <group ref={stones}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} scale={0.45 + (i % 2) * 0.22}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#6a5d49" roughness={1} flatShading />
          </mesh>
        ))}
      </group>

      <ClockArtisan />
      <SleepingFriend
        id="clock-friend"
        direction={new Vector3(-0.55, 0.45, -0.75)}
        lines={[
          "…응…? 벌써 시간이… 그렇게 됐나….",
          "여긴 시간이 천천히 흘러서, 자다 보면 한참을 자게 돼.",
          "와줘서 고마워. 시간이 느린 곳에선, 누군가를 기다리는 일도 길어지니까.",
        ]}
        colors={{ body: "#d8b27a", head: "#e3c490", ear: "#c89a5e" }}
      />
    </group>
  );
}
