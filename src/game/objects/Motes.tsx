import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { InstancedMesh, Object3D, Vector3 } from "three";
import { playerPosition } from "../playerPosition";

/**
 * Ambient floating motes (dust / fireflies) that drift slowly in a volume
 * around the player and twinkle. Bright + toneMapped off so Bloom makes them
 * glow. Pure code — no asset. Tune per planet via props.
 */
interface Props {
  count?: number;
  color?: string;
  /** Tangent spread around the player. */
  area?: number;
  /** Height range above the surface. */
  height?: number;
  size?: number;
  /** How far each mote wanders from its home point. */
  drift?: number;
}

interface Mote {
  u: number;
  v: number;
  h: number;
  px: number;
  py: number;
  pz: number;
  fx: number;
  fy: number;
  fz: number;
}

export function Motes({
  count = 60,
  color = "#ffd9a0",
  area = 5,
  height = 4,
  size = 0.045,
  drift = 0.6,
}: Props) {
  const mesh = useRef<InstancedMesh>(null!);

  const motes = useMemo<Mote[]>(
    () =>
      Array.from({ length: count }, () => ({
        u: (Math.random() * 2 - 1) * area,
        v: (Math.random() * 2 - 1) * area,
        h: Math.random() * height,
        px: Math.random() * Math.PI * 2,
        py: Math.random() * Math.PI * 2,
        pz: Math.random() * Math.PI * 2,
        fx: 0.3 + Math.random() * 0.5,
        fy: 0.2 + Math.random() * 0.4,
        fz: 0.3 + Math.random() * 0.5,
      })),
    [count, area, height],
  );

  const s = useMemo(
    () => ({ up: new Vector3(), t1: new Vector3(), t2: new Vector3(), pos: new Vector3(), dummy: new Object3D() }),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { up, t1, t2, pos, dummy } = s;
    up.copy(playerPosition).normalize();
    t1.set(0, 0, 1);
    if (Math.abs(up.z) > 0.9) t1.set(1, 0, 0);
    t1.crossVectors(up, t1).normalize();
    t2.crossVectors(up, t1).normalize();

    for (let i = 0; i < count; i++) {
      const m = motes[i];
      const wu = m.u + Math.sin(t * m.fx + m.px) * drift;
      const wv = m.v + Math.sin(t * m.fz + m.pz) * drift;
      const wh = m.h + Math.sin(t * m.fy + m.py) * drift * 0.7;
      pos
        .copy(playerPosition)
        .addScaledVector(t1, wu)
        .addScaledVector(t2, wv)
        .addScaledVector(up, wh);
      dummy.position.copy(pos);
      dummy.scale.setScalar(size * (0.7 + 0.3 * Math.sin(t * 2 + m.px))); // twinkle
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.9} />
    </instancedMesh>
  );
}
