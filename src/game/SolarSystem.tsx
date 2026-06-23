import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { DoubleSide, Group, Mesh, PointLight, Vector3 } from "three";
import { useGame } from "./state";
import { useSystemConfig } from "./systemConfig";
import { PLANETS, orbitPosition } from "./planets/registry";

/**
 * The star and the other planets, drawn around the active planet.
 *
 * The active planet stays at the origin (so the walk controller is simple), and
 * everything else is offset by −(active planet's orbital position). Everything
 * celestial lives in one `sky` group; the active planet's axial spin (자전) is
 * shown by counter-rotating that whole group — indistinguishable, from the
 * surface, from the planet itself turning. Distant planets also spin their own
 * mesh, and are lit by a real point-light "sun" at the system centre.
 */
const STAR_RADIUS = 7;
const SUN_INTENSITY = 3; // point light, decay 0 → uniform; tune to taste

export function SolarSystem() {
  const index = useGame((s) => s.currentPlanet);
  const showOrbits = useSystemConfig((s) => s.showOrbits);

  const sky = useRef<Group>(null!);
  const star = useRef<Mesh>(null!);
  const sunLight = useRef<PointLight>(null!);
  const orbits = useRef<Group>(null!);
  const spheres = useRef<(Mesh | null)[]>([]);
  const clock = useRef(0); // celestial time (pausable / scalable)
  const scratch = useMemo(() => ({ active: new Vector3(), other: new Vector3() }), []);

  useFrame((_, rawDelta) => {
    const sys = useSystemConfig.getState();
    const dt = Math.min(rawDelta, 1 / 30);
    if (sys.orbitOn) clock.current += dt * sys.orbitScale;
    const t = clock.current;

    const active = orbitPosition(PLANETS[index], t, scratch.active);

    // Active planet's axial spin → counter-rotate the whole sky.
    sky.current.rotation.y = -PLANETS[index].spinSpeed * t;

    // Star (with its light + orbit rings) sits at the system centre: −active.
    star.current.position.copy(active).multiplyScalar(-1);
    sunLight.current.position.copy(star.current.position);
    if (orbits.current) orbits.current.position.copy(star.current.position);

    PLANETS.forEach((planet, i) => {
      const mesh = spheres.current[i];
      if (!mesh) return;
      if (i === index) {
        mesh.visible = false; // the active planet is the diorama at the origin
        return;
      }
      mesh.visible = true;
      mesh.position.copy(orbitPosition(planet, t, scratch.other).sub(active));
      mesh.rotation.y = planet.spinSpeed * t; // its own axial spin
    });
  });

  return (
    <group ref={sky}>
      <Stars radius={400} depth={80} count={3500} factor={5} fade speed={0} />
      <ambientLight intensity={0.12} color="#6f86a0" />

      {/* The sun — a real point light so every body is lit from its position. */}
      <pointLight
        ref={sunLight}
        intensity={SUN_INTENSITY}
        decay={0}
        color="#fff2d8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={400}
      />
      <mesh ref={star}>
        <sphereGeometry args={[STAR_RADIUS, 32, 32]} />
        <meshBasicMaterial color="#ffe6a8" toneMapped={false} />
      </mesh>

      {/* Orbit rings, centred on the star. */}
      {showOrbits && (
        <group ref={orbits}>
          {PLANETS.map((planet) => (
            <mesh key={planet.id} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[planet.orbitRadius - 0.12, planet.orbitRadius + 0.12, 160]} />
              <meshBasicMaterial color="#9fb4c7" transparent opacity={0.22} side={DoubleSide} />
            </mesh>
          ))}
        </group>
      )}

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
    </group>
  );
}
