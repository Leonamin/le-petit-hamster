import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { DirectionalLight, Mesh, Vector3 } from "three";
import { useGame } from "./state";
import { PLANETS, orbitPosition } from "./planets/registry";

/**
 * The star and the other planets, drawn around the active planet.
 *
 * The active planet stays at the origin (so the walk controller is simple), and
 * everything else is offset by −(active planet's orbital position). As the
 * active planet moves along its orbit, the star and the other worlds sweep
 * across the sky and the day/night terminator drifts — that's the "공전".
 */
const STAR_RADIUS = 7;

export function SolarSystem() {
  const index = useGame((s) => s.currentPlanet);
  const star = useRef<Mesh>(null!);
  const sunLight = useRef<DirectionalLight>(null!);
  const spheres = useRef<(Mesh | null)[]>([]);
  const scratch = useMemo(() => ({ active: new Vector3(), other: new Vector3() }), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const active = orbitPosition(PLANETS[index], t, scratch.active);

    // Star sits at the system centre → its position relative to us is −active.
    star.current.position.copy(active).multiplyScalar(-1);
    sunLight.current.position.copy(star.current.position);
    // Light aims at the active planet (the origin).
    sunLight.current.target.position.set(0, 0, 0);
    sunLight.current.target.updateMatrixWorld();

    // Other planets, positioned relative to the active one.
    PLANETS.forEach((planet, i) => {
      const mesh = spheres.current[i];
      if (!mesh) return;
      if (i === index) {
        mesh.visible = false; // the active planet is the diorama at the origin
        return;
      }
      mesh.visible = true;
      mesh.position.copy(orbitPosition(planet, t, scratch.other).sub(active));
    });
  });

  return (
    <>
      {/* Soft fill so the night side stays navigable. */}
      <ambientLight intensity={0.12} color="#6f86a0" />

      {/* Sunlight — parallel rays from the star toward the active planet. */}
      <directionalLight
        ref={sunLight}
        intensity={1.5}
        color="#fff2d8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={260}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />

      {/* The star itself — full-bright so bloom turns it into a glowing sun. */}
      <mesh ref={star}>
        <sphereGeometry args={[STAR_RADIUS, 32, 32]} />
        <meshBasicMaterial color="#ffe6a8" toneMapped={false} />
      </mesh>

      {/* The other planets, seen across the sky. */}
      {PLANETS.map((planet, i) => (
        <mesh
          key={planet.id}
          ref={(el) => {
            spheres.current[i] = el;
          }}
        >
          <sphereGeometry args={[planet.radius, 32, 32]} />
          <meshStandardMaterial color={planet.color} roughness={1} />
        </mesh>
      ))}
    </>
  );
}
