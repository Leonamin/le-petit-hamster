import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Group } from "three";

/**
 * A great clock tower for the Time planet — to a hamster it should read as a
 * Tower (oversized, per VISION). Built from primitives. The hands turn slowly,
 * so the whole planet quietly keeps time. Local +Y is up, +Z faces outward.
 */
export function ClockTower() {
  const minute = useRef<Group>(null!);
  const hour = useRef<Group>(null!);

  useFrame((_, dt) => {
    // Gentle, dreamlike pace — not real time.
    minute.current.rotation.z -= dt * 0.35;
    hour.current.rotation.z -= (dt * 0.35) / 12;
  });

  return (
    <group>
      {/* Base */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.95, 1.1, 0.6, 16]} />
        <meshStandardMaterial color="#6a5b46" roughness={0.95} />
      </mesh>
      {/* Tapered tower shaft */}
      <mesh position={[0, 1.9, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.78, 2.6, 16]} />
        <meshStandardMaterial color="#8a7a5e" roughness={0.95} />
      </mesh>
      {/* Clock head */}
      <mesh position={[0, 3.4, 0]} castShadow>
        <cylinderGeometry args={[0.78, 0.7, 1.0, 16]} />
        <meshStandardMaterial color="#9c8a68" roughness={0.9} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 4.1, 0]}>
        <coneGeometry args={[0.85, 0.7, 16]} />
        <meshStandardMaterial color="#5b4636" roughness={0.9} />
      </mesh>

      {/* Clock face on the +Z side, glowing softly so bloom catches it. */}
      <group position={[0, 3.4, 0.62]}>
        <mesh>
          <cylinderGeometry args={[0.52, 0.52, 0.08, 24]} />
          <meshStandardMaterial
            color="#f3e6c4"
            emissive="#e8c87a"
            emissiveIntensity={0.6}
          />
        </mesh>
        {/* The disc's flat side faces +Y; rotate so it faces +Z (outward). */}
        <group rotation={[Math.PI / 2, 0, 0]}>
          {/* Hands rotate about the face normal (local Z after the rotation). */}
          <group ref={hour} position={[0, 0, 0.06]}>
            <mesh position={[0, 0.16, 0]}>
              <boxGeometry args={[0.05, 0.34, 0.02]} />
              <meshStandardMaterial color="#4a3a2a" roughness={1} />
            </mesh>
          </group>
          <group ref={minute} position={[0, 0, 0.06]}>
            <mesh position={[0, 0.24, 0]}>
              <boxGeometry args={[0.035, 0.46, 0.02]} />
              <meshStandardMaterial color="#4a3a2a" roughness={1} />
            </mesh>
          </group>
        </group>
      </group>

      <pointLight position={[0, 3.4, 1.0]} intensity={3} distance={9} color="#ffdfa0" />
    </group>
  );
}
