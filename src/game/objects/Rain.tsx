import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { InstancedMesh, Object3D, Quaternion, Vector3 } from "three";
import { playerPosition } from "../playerPosition";
import { useSystemConfig } from "../systemConfig";

/**
 * Rain for the Rain Planet. Instanced streaks that fall toward the planet
 * centre (the local "down" at the hamster) inside a volume that follows the
 * player, recycling to the top when they land. Pure code — no asset.
 *
 * COUNT is the max; the live `rainIntensity` (0..1) decides how many are
 * actually drawn (via instancedMesh.count), so the rain can go from a light
 * drizzle to a downpour — and later be driven by the time of day.
 */
const COUNT = 600;
const RADIUS = 5; // tangent spread around the player (kept small so the flat
//                   approximation stays close to the curved surface)
const HEIGHT = 6; // fall height above the surface
const SPEED = 13; // units / second

interface Drop {
  u: number;
  v: number;
  h: number;
}

export function Rain() {
  const mesh = useRef<InstancedMesh>(null!);

  const drops = useMemo<Drop[]>(
    () =>
      Array.from({ length: COUNT }, () => ({
        u: (Math.random() * 2 - 1) * RADIUS,
        v: (Math.random() * 2 - 1) * RADIUS,
        h: Math.random() * HEIGHT,
      })),
    [],
  );

  const s = useMemo(
    () => ({
      up: new Vector3(),
      t1: new Vector3(),
      t2: new Vector3(),
      pos: new Vector3(),
      q: new Quaternion(),
      yAxis: new Vector3(0, 1, 0),
      dummy: new Object3D(),
    }),
    [],
  );

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const { up, t1, t2, pos, q, yAxis, dummy } = s;

    // Only draw a fraction of the streaks, per the live intensity.
    const active = Math.floor(COUNT * useSystemConfig.getState().rainIntensity);
    mesh.current.count = active;
    if (active === 0) return;

    up.copy(playerPosition).normalize();
    // A tangent basis at the player so drops spread along the surface.
    t1.set(0, 0, 1);
    if (Math.abs(up.z) > 0.9) t1.set(1, 0, 0);
    t1.crossVectors(up, t1).normalize();
    t2.crossVectors(up, t1).normalize();
    q.setFromUnitVectors(yAxis, up); // streaks point along "up"

    for (let i = 0; i < active; i++) {
      const d = drops[i];
      d.h -= SPEED * dt;
      if (d.h < 0) {
        d.h += HEIGHT;
        d.u = (Math.random() * 2 - 1) * RADIUS;
        d.v = (Math.random() * 2 - 1) * RADIUS;
      }
      pos
        .copy(playerPosition)
        .addScaledVector(t1, d.u)
        .addScaledVector(t2, d.v)
        .addScaledVector(up, d.h);
      dummy.position.copy(pos);
      dummy.quaternion.copy(q);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <boxGeometry args={[0.015, 0.28, 0.015]} />
      <meshBasicMaterial color="#a9c4d8" transparent opacity={0.45} depthWrite={false} />
    </instancedMesh>
  );
}
