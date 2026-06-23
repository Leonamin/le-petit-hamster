import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Group, MathUtils, Mesh, Vector3 } from "three";
import { useGame } from "../state";
import { useInteractableProp } from "../systems/useInteractableProp";

/**
 * A sleeping friend (PLANETS.md). Finding them is the heart of a planet, but
 * waking them is OPTIONAL (Golden Rule). Built from primitives. Curled up while
 * asleep; if you choose to come close, they gently stir and sit up.
 *
 * Generic now — each planet supplies its own id, place, lines and colour.
 */

interface FriendColors {
  body: string;
  head: string;
  ear: string;
}

interface Props {
  id: string;
  radius: number;
  direction: Vector3;
  lines: string[];
  spin?: number;
  colors?: FriendColors;
}

const DEFAULT_COLORS: FriendColors = {
  body: "#caa9d6",
  head: "#d6bce0",
  ear: "#bd9bca",
};

export function SleepingFriend({ id, radius, direction, lines, spin = 0.8, colors }: Props) {
  const root = useRef<Group>(null!);
  const body = useRef<Mesh>(null!);
  const head = useRef<Group>(null!);
  const wake = useRef(0); // 0 = curled asleep, 1 = sitting up
  const c = colors ?? DEFAULT_COLORS;

  useInteractableProp(root, radius, {
    id,
    direction,
    spin,
    range: 2.2,
    prompt: "스페이스 — 살며시 다가가기",
    speaker: "잠든 햄스터",
    lines,
    onInteract: () => useGame.getState().awakenFriend(id),
  });

  useFrame((_, dt) => {
    const awake = useGame.getState().awakenedFriends.includes(id);
    wake.current = MathUtils.damp(wake.current, awake ? 1 : 0, 4, dt);
    const t = wake.current;

    body.current.scale.set(0.5, 0.3 + 0.12 * t, 0.6);
    head.current.position.set(0, MathUtils.lerp(0.14, 0.5, t), MathUtils.lerp(0.34, 0.26, t));
    head.current.rotation.x = MathUtils.lerp(-0.7, 0, t);
    const breath = Math.sin(performance.now() * 0.0016) * (0.01 + 0.01 * t);
    body.current.position.y = 0.28 + breath;
  });

  return (
    <group ref={root}>
      <mesh ref={body} position={[0, 0.28, 0]}>
        <sphereGeometry args={[1, 18, 14]} />
        <meshStandardMaterial color={c.body} roughness={0.9} />
      </mesh>
      <group ref={head}>
        <mesh scale={0.28} castShadow>
          <sphereGeometry args={[1, 18, 14]} />
          <meshStandardMaterial color={c.head} roughness={0.9} />
        </mesh>
        <mesh position={[-0.16, 0.2, 0.04]} scale={0.11}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color={c.ear} roughness={0.95} />
        </mesh>
        <mesh position={[0.16, 0.2, 0.04]} scale={0.11}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color={c.ear} roughness={0.95} />
        </mesh>
      </group>
    </group>
  );
}
