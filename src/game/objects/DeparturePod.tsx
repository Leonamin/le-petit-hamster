import { useRef } from "react";
import { Group, Vector3 } from "three";
import { useGame } from "../state";
import { useInteractableProp } from "../systems/useInteractableProp";

/**
 * The little pod the hamster travels in. Approaching it and interacting leaves
 * the planet for the next one (Core Loop → "Leave Planet"). Each planet renders
 * its own, placed at that planet's radius. Glows so it is easy to find.
 */

const POD_DIR = new Vector3(-0.3, 0.85, 0.6);

export function DeparturePod({ radius }: { radius: number }) {
  const ref = useRef<Group>(null!);

  useInteractableProp(ref, radius, {
    id: "departure-pod",
    direction: POD_DIR,
    spin: 0.2,
    range: 2.4,
    collideRadius: 1.0,
    prompt: "스페이스 — 다음 행성으로 떠나기",
    onInteract: () => useGame.getState().leavePlanet(),
  });

  return (
    <group ref={ref}>
      {/* Body */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.42, 1.0, 14]} />
        <meshStandardMaterial color="#e8e4dc" roughness={0.7} />
      </mesh>
      {/* Nose cone */}
      <mesh position={[0, 1.25, 0]}>
        <coneGeometry args={[0.3, 0.55, 14]} />
        <meshStandardMaterial color="#b65b56" roughness={0.7} />
      </mesh>
      {/* Porthole — emissive so bloom makes it a beacon. */}
      <mesh position={[0, 0.7, 0.34]}>
        <sphereGeometry args={[0.12, 14, 12]} />
        <meshStandardMaterial color="#ffe9b0" emissive="#ffd373" emissiveIntensity={2} />
      </mesh>
      {/* Three little fins */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.4, 0.18, Math.sin(a) * 0.4]}
            rotation={[0, -a, 0]}
          >
            <boxGeometry args={[0.06, 0.36, 0.26]} />
            <meshStandardMaterial color="#7a4f48" roughness={0.8} />
          </mesh>
        );
      })}
      {/* Soft glow at the base */}
      <pointLight position={[0, 0.7, 0]} intensity={2.5} distance={6} color="#ffd9a0" />
    </group>
  );
}
