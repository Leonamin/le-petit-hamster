import { useLayoutEffect, useRef } from "react";
import { Group, Vector3 } from "three";
import { removeCollider } from "../world";
import { placeProp } from "../systems/placeProp";
import { Lighthouse } from "../objects/Lighthouse";
import { Cottage } from "../objects/Cottage";
import { SkyLight } from "../objects/SkyLight";
import { AtmosphereHaze } from "../objects/AtmosphereHaze";
import { Tree } from "../objects/Tree";
import { Rain } from "../objects/Rain";
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
  const cottage = useRef<Group>(null!);
  const rocks = useRef<Group>(null!);
  const trees = useRef<Group>(null!);

  useLayoutEffect(() => {
    const ids: string[] = [];
    const place = (
      obj: Group,
      dir: [number, number, number],
      spin: number,
      collide?: { id: string; radius: number },
    ) => {
      const id = placeProp(obj, new Vector3(...dir), radius, { spin, collide });
      if (id) ids.push(id);
    };

    place(lighthouse.current, [0.2, 1, 0.3], 0, { id: "rain-lighthouse", radius: 1.3 });
    // A little cottage on the far side, a short walk from the lighthouse.
    place(cottage.current, [-0.5, 0.6, 0.65], 0.6, { id: "rain-cottage", radius: 1.6 });

    const rockDirs: [number, number, number, number][] = [
      [0.8, 0.3, -0.4, 0],
      [-0.3, 0.2, 0.9, 1.2],
      [0.1, -0.4, 0.9, 2.0],
      [-0.9, -0.2, -0.2, 0.5],
    ];
    rocks.current.children.forEach((rock, i) => {
      const [x, y, z, spin] = rockDirs[i % rockDirs.length];
      place(rock as Group, [x, y, z], spin);
    });

    // A scattered little grove — directions chosen by hand for a natural spread.
    // Each trunk gets a slim collider so the hamster bumps the trees.
    const treeDirs: [number, number, number, number][] = [
      [0.55, 0.7, 0.45, 0.4],
      [-0.2, 0.85, 0.5, 1.6],
      [0.7, 0.5, 0.5, 2.3],
      [-0.7, 0.4, 0.55, 0.9],
      [0.3, 0.2, -0.95, 1.1],
      [-0.5, 0.1, -0.85, 2.8],
      [0.95, 0.0, 0.1, 0.2],
    ];
    trees.current.children.forEach((tree, i) => {
      const [x, y, z, spin] = treeDirs[i % treeDirs.length];
      place(tree as Group, [x, y, z], spin, { id: `rain-tree-${i}`, radius: 0.7 });
    });

    return () => ids.forEach(removeCollider);
  }, [radius]);

  return (
    <group>
      {/* Atmospheric scattering fill: bright, soft, overcast-blue by day so the
          planet reads as daytime (not lunar); dim and cool at night. */}
      <SkyLight daySky="#c4dcec" dayGround="#5a6b61" dayIntensity={1.4} nightIntensity={0.14} />
      {/* Aerial perspective: a soft horizon haze + lifted sky by day so the
          planet doesn't meet hard black space. Fades out at night. */}
      <AtmosphereHaze color="#aac4d4" daySky="#2a3a47" maxDensity={0.02} />

      {/* The planet body */}
      <mesh receiveShadow>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial color="#3f5a52" roughness={1} metalness={0} />
      </mesh>

      <group ref={lighthouse}>
        <Lighthouse />
      </group>

      <group ref={cottage}>
        <Cottage />
      </group>

      {/* A small grove of cozy, faceted trees — deep wet greens. */}
      <group ref={trees}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <Tree
            key={i}
            scale={0.85 + (i % 3) * 0.2}
            foliage={i % 2 ? "#3f6b54" : "#356152"}
          />
        ))}
      </group>

      <group ref={rocks}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} scale={0.4 + (i % 2) * 0.2}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#4a5d63" roughness={1} flatShading />
          </mesh>
        ))}
      </group>

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
