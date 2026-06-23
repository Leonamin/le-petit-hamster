import { useRef } from "react";
import { Group, Vector3 } from "three";
import { useInteractableProp } from "../systems/useInteractableProp";

/**
 * The Windup Artisan (Time planet). A small brass-coloured tinkerer who keeps
 * the great clock turning. Built from primitives. Local +Z faces forward.
 */

const ARTISAN_DIR = new Vector3(0.4, 1, -0.45);

const LINES = [
  "오, 손님. 조심히 걸어요. 이 행성에선 시간이… 조금 천천히 흐르거든.",
  "나는 저 큰 시계의 태엽을 감지. 멈추면 안 되니까. 하지만 가끔은, 멈춰도 괜찮지 않을까 싶기도 해.",
  "서두르지 말아요. 어차피 도착할 곳은 도착하게 되어 있으니까.",
  "여기서 잠든 친구는 말이야… 시간을 가장 잘 아는 아이란다. 깨우든 그냥 두든, 그건 당신 마음이고.",
];

export function ClockArtisan({ radius }: { radius: number }) {
  const ref = useRef<Group>(null!);

  useInteractableProp(ref, radius, {
    id: "clock-artisan",
    direction: ARTISAN_DIR,
    spin: -0.6,
    range: 2.6,
    prompt: "스페이스 — 말 걸기",
    speaker: "태엽쟁이 장인",
    lines: LINES,
  });

  return (
    <group ref={ref}>
      {/* Rounded body */}
      <mesh position={[0, 0.36, 0]} scale={[0.42, 0.46, 0.46]} castShadow>
        <sphereGeometry args={[1, 18, 14]} />
        <meshStandardMaterial color="#b08a4a" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.58, 0.26]} scale={0.27} castShadow>
        <sphereGeometry args={[1, 18, 14]} />
        <meshStandardMaterial color="#c39a55" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Little round goggles */}
      <mesh position={[-0.11, 0.62, 0.46]} scale={0.07}>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color="#3a2e1e" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0.11, 0.62, 0.46]} scale={0.07}>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color="#3a2e1e" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* A winding key sticking out of the back */}
      <mesh position={[0, 0.5, -0.36]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.03, 8, 16]} />
        <meshStandardMaterial color="#d9b25a" roughness={0.5} metalness={0.4} />
      </mesh>
    </group>
  );
}
