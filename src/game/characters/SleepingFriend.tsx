import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import { Group, MathUtils, Mesh, Vector3 } from "three";
import { PLANET_RADIUS } from "../config";
import { useGame } from "../state";
import { placeOnSurface } from "../../lib/sphere";

/**
 * The sleeping hamster friend (PLANETS.md). Finding them is the heart of the
 * planet, but waking them is OPTIONAL (VISION / Golden Rule: "중요한 것은
 * 완료가 아니라 만남이다"). Built from primitives. Curled up while asleep; if
 * you choose to come close, they gently stir and sit up.
 */

const FRIEND_ID = "sleeping-hamster";
const FRIEND_DIR = new Vector3(-0.6, 0.5, -0.7);

const LINES = [
  "…음… 누가… 왔어…?",
  "아아… 나, 도대체 얼마나 잠들어 있었던 걸까.",
  "깨워줘서… 아니, 그냥 곁에 와줘서 고마워. 그거면 충분해.",
];

export function SleepingFriend() {
  const root = useRef<Group>(null!);
  const body = useRef<Mesh>(null!);
  const head = useRef<Group>(null!);
  const wake = useRef(0); // 0 = curled asleep, 1 = sitting up

  useLayoutEffect(() => {
    placeOnSurface(root.current, FRIEND_DIR, PLANET_RADIUS, 0.8);
    const position = FRIEND_DIR.clone().normalize().multiplyScalar(PLANET_RADIUS);
    useGame.getState().register({
      id: FRIEND_ID,
      position,
      radius: 2.2,
      prompt: "스페이스 — 살며시 다가가기",
      speaker: "잠든 햄스터",
      lines: LINES,
      onInteract: () => useGame.getState().awakenFriend(FRIEND_ID),
    });
    return () => useGame.getState().unregister(FRIEND_ID);
  }, []);

  useFrame((_, dt) => {
    const awake = useGame.getState().awakenedFriends.includes(FRIEND_ID);
    const target = awake ? 1 : 0;
    // Critically-damped-ish ease toward the target (frame-rate independent).
    wake.current = MathUtils.damp(wake.current, target, 4, dt);
    const t = wake.current;

    // Body un-squashes a little; head lifts and tilts up as they wake.
    body.current.scale.set(0.5, 0.3 + 0.12 * t, 0.6);
    head.current.position.set(0, MathUtils.lerp(0.14, 0.5, t), MathUtils.lerp(0.34, 0.26, t));
    head.current.rotation.x = MathUtils.lerp(-0.7, 0, t);
    // A soft breathing bob, calmer while asleep.
    const breath = Math.sin(performance.now() * 0.0016) * (0.01 + 0.01 * t);
    body.current.position.y = 0.28 + breath;
  });

  return (
    <group ref={root}>
      <mesh ref={body} position={[0, 0.28, 0]}>
        <sphereGeometry args={[1, 18, 14]} />
        <meshStandardMaterial color="#caa9d6" roughness={0.9} />
      </mesh>
      <group ref={head}>
        <mesh scale={0.28} castShadow>
          <sphereGeometry args={[1, 18, 14]} />
          <meshStandardMaterial color="#d6bce0" roughness={0.9} />
        </mesh>
        {/* Ears */}
        <mesh position={[-0.16, 0.2, 0.04]} scale={0.11}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color="#bd9bca" roughness={0.95} />
        </mesh>
        <mesh position={[0.16, 0.2, 0.04]} scale={0.11}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color="#bd9bca" roughness={0.95} />
        </mesh>
      </group>
    </group>
  );
}
