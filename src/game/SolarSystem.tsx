import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { AmbientLight, Color, DoubleSide, Group, MathUtils, PointLight, Vector3 } from "three";
import { useGame } from "./state";
import { useSystemConfig } from "./systemConfig";
import { playerPosition } from "./playerPosition";
import { world } from "./world";
import { Atmosphere } from "./objects/Atmosphere";
import { Corona } from "./objects/Corona";
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
const STAR_RADIUS = 5; // small bright core; the Corona halo (not size) makes it
                       // read as a dazzling sun. Like the real sun, a neighbour
                       // planet can appear larger (Earthrise) — that's intended.
const SUN_INTENSITY = 3; // point light, decay 0 → uniform; tune to taste
const Y_AXIS = new Vector3(0, 1, 0);
const DAY_AMBIENT = new Color("#a8b6c4");
const NIGHT_AMBIENT = new Color("#2a3a55");

export function SolarSystem() {
  const index = useGame((s) => s.currentPlanet);
  const showOrbits = useSystemConfig((s) => s.showOrbits);

  const sky = useRef<Group>(null!);
  const star = useRef<Group>(null!);
  const sunLight = useRef<PointLight>(null!);
  const ambient = useRef<AmbientLight>(null!);
  const orbits = useRef<Group>(null!);
  const spheres = useRef<(Group | null)[]>([]);
  const clock = useRef(0); // celestial time (pausable / scalable)
  const weatherT = useRef(0); // throttle for auto-weather writes
  const scratch = useMemo(
    () => ({ active: new Vector3(), other: new Vector3(), sunDir: new Vector3(), up: new Vector3() }),
    [],
  );

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

    // --- Time of day: how high the sun sits in the hamster's sky ---
    // Sun direction in world = (−active) rotated by the sky's spin about Y.
    scratch.sunDir.copy(active).negate().applyAxisAngle(Y_AXIS, sky.current.rotation.y).normalize();
    const upDot = scratch.up.copy(playerPosition).normalize().dot(scratch.sunDir);
    const day = MathUtils.clamp(upDot + 0.15, 0, 1); // 0 night .. 1 day
    world.daylight = day;
    ambient.current.intensity = MathUtils.lerp(0.16, 0.42, day);
    ambient.current.color.copy(NIGHT_AMBIENT).lerp(DAY_AMBIENT, day);

    // Weather follows the time of day (darker = rainier), unless overridden.
    if (sys.weatherAuto) {
      weatherT.current += dt;
      if (weatherT.current > 0.2) {
        weatherT.current = 0;
        const target = 0.12 + 0.5 * (1 - day);
        useSystemConfig.setState({ rainIntensity: Math.round(target * 100) / 100 });
      }
    }
  });

  return (
    <group ref={sky}>
      <Stars radius={400} depth={80} count={3500} factor={5} fade speed={0} />
      <ambientLight ref={ambient} intensity={0.16} color="#2a3a55" />

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
      {/* The sun: a small, near-white hot core wrapped in a big additive corona
          so it dazzles like the real sun without being a giant disc. */}
      <group ref={star}>
        <mesh>
          <sphereGeometry args={[STAR_RADIUS, 32, 32]} />
          <meshBasicMaterial color="#fff4e0" toneMapped={false} />
        </mesh>
        <Corona size={STAR_RADIUS * 9} color="#ffd9a0" intensity={1.6} falloff={2.8} />
      </group>

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

      {/* The other planets, seen across the sky — each wrapped in atmosphere
          (the rim glow reads correctly when viewed from a distance). */}
      {PLANETS.map((planet, i) => (
        <group
          key={planet.id}
          ref={(el) => {
            spheres.current[i] = el;
          }}
        >
          <mesh>
            <sphereGeometry args={[planet.radius, 32, 32]} />
            <meshStandardMaterial color={planet.color} roughness={1} />
          </mesh>
          <Atmosphere radius={planet.radius} color={planet.atmosphere} intensity={1.1} />
        </group>
      ))}
    </group>
  );
}
