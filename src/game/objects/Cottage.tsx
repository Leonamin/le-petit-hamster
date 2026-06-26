/**
 * A tiny cottage built from primitives (no asset). A warm window glow makes it
 * feel lived-in against the Rain Planet's cool twilight. Local +Y is "up";
 * place it with placeOnSurface(). Oversized to a hamster (VISION).
 */
export function Cottage({
  wall = "#cdbfa6",
  roof = "#7a4f48",
}: {
  wall?: string;
  roof?: string;
}) {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 1.5, 1.7]} />
        <meshStandardMaterial color={wall} roughness={1} />
      </mesh>
      {/* Pyramid roof (4-sided cone), overhanging the walls a touch. */}
      <mesh position={[0, 1.95, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.7, 1.1, 4]} />
        <meshStandardMaterial color={roof} roughness={1} flatShading />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.5, 0.86]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.9, 0.05]} />
        <meshStandardMaterial color="#4a3527" roughness={1} />
      </mesh>
      {/* Window — emissive so bloom catches the warm glow inside. */}
      <mesh position={[0.62, 0.85, 0.86]}>
        <boxGeometry args={[0.45, 0.45, 0.05]} />
        <meshStandardMaterial color="#ffe9b0" emissive="#ffce82" emissiveIntensity={1.6} />
      </mesh>
      <pointLight position={[0.62, 0.85, 1.1]} intensity={1.6} distance={5} color="#ffd9a0" />
    </group>
  );
}
