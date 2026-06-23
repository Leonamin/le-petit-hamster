/**
 * The Mouse Lighthouse Keeper's tower (PLANETS.md → Rain Planet).
 * Built entirely from primitives — no asset, no graphics tool. To a hamster a
 * lighthouse should read as a Tower, so it is deliberately oversized (VISION).
 * Local +Y is "up"; place it on the surface with placeOnSurface().
 */
export function Lighthouse() {
  return (
    <group>
      {/* Tapered tower */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.85, 3.2, 16]} />
        <meshStandardMaterial color="#e8e4dc" roughness={0.9} />
      </mesh>
      {/* Red band */}
      <mesh position={[0, 2.4, 0]}>
        <cylinderGeometry args={[0.62, 0.62, 0.5, 16]} />
        <meshStandardMaterial color="#b65b56" roughness={0.9} />
      </mesh>
      {/* Lantern room */}
      <mesh position={[0, 3.55, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.7, 12]} />
        <meshStandardMaterial color="#3a4a5a" roughness={0.6} />
      </mesh>
      {/* The light itself — emissive so bloom catches it. */}
      <mesh position={[0, 3.55, 0]}>
        <sphereGeometry args={[0.32, 16, 12]} />
        <meshStandardMaterial
          color="#ffe9b0"
          emissive="#ffd373"
          emissiveIntensity={2.4}
        />
      </mesh>
      <pointLight position={[0, 3.55, 0]} intensity={6} distance={14} color="#ffd9a0" />
      {/* Roof */}
      <mesh position={[0, 4.15, 0]}>
        <coneGeometry args={[0.6, 0.7, 12]} />
        <meshStandardMaterial color="#7a4f48" roughness={0.9} />
      </mesh>
    </group>
  );
}
