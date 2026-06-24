/**
 * A stylized, cozy tree built from primitives (no asset). Foliage is faceted
 * (flatShading) icosahedra so it reads as a chunky storybook canopy rather than
 * a smooth ball. Local +Y is "up"; place it with placeOnSurface().
 *
 * Deliberately oversized to a hamster (VISION: "larger than life").
 */
export function Tree({
  scale = 1,
  trunk = "#5a4636",
  foliage = "#3f6b54",
}: {
  scale?: number;
  trunk?: string;
  foliage?: string;
}) {
  return (
    <group scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.28, 2, 8]} />
        <meshStandardMaterial color={trunk} roughness={1} />
      </mesh>
      {/* Canopy — a few stacked, offset blobs for a hand-piled look. */}
      <mesh position={[0, 2.3, 0]} castShadow>
        <icosahedronGeometry args={[1.05, 0]} />
        <meshStandardMaterial color={foliage} roughness={1} flatShading />
      </mesh>
      <mesh position={[0.45, 1.9, 0.3]} castShadow>
        <icosahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color={foliage} roughness={1} flatShading />
      </mesh>
      <mesh position={[-0.4, 2.0, -0.25]} castShadow>
        <icosahedronGeometry args={[0.62, 0]} />
        <meshStandardMaterial color={foliage} roughness={1} flatShading />
      </mesh>
    </group>
  );
}
