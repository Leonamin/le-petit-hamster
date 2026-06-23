import { useLayoutEffect, useRef } from "react";
import { Group, Vector3 } from "three";
import { PLANET_RADIUS } from "../config";
import { useGame } from "../state";
import { placeOnSurface } from "../../lib/sphere";

/**
 * The Mouse Lighthouse Keeper (PLANETS.md → Rain Planet, theme: Waiting).
 * Stands beside the lighthouse. Walk close and press Space to hear them.
 * Built entirely from primitives — no asset needed.
 */

// Surface direction the keeper stands at (near the lighthouse at (0.2,1,0.3)).
const KEEPER_DIR = new Vector3(0.33, 1, 0.5);

const LINES = [
  "…아, 손님이구나. 이 행성엔 참 오랜만에 오는 발걸음이야.",
  "나는 이 등대를 지켜. 누가 올지는 몰라도, 불은 한 번도 꺼뜨린 적 없단다.",
  "기다린다는 건 외로운 일이지. 그래도 누군가 올 거라 믿으면, 밤도 그리 길지만은 않더구나.",
  "저 너머에 잠든 친구가 하나 있어. 굳이 깨우지 않아도 괜찮아. 그저 곁에 잠시 있어 주는 것만으로도, 충분할 때가 있으니까.",
];

export function LighthouseKeeper() {
  const ref = useRef<Group>(null!);

  useLayoutEffect(() => {
    placeOnSurface(ref.current, KEEPER_DIR, PLANET_RADIUS, 0.5);
    const position = KEEPER_DIR.clone().normalize().multiplyScalar(PLANET_RADIUS);
    useGame.getState().register({
      id: "lighthouse-keeper",
      position,
      radius: 2.6,
      prompt: "스페이스 — 말 걸기",
      speaker: "등대지기 쥐",
      lines: LINES,
    });
    return () => useGame.getState().unregister("lighthouse-keeper");
  }, []);

  return (
    <group ref={ref}>
      <KeeperMesh />
    </group>
  );
}

/** Placeholder grey mouse. Local +Z is "front". */
function KeeperMesh() {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.34, 0]} scale={[0.4, 0.42, 0.45]} castShadow>
        <sphereGeometry args={[1, 18, 14]} />
        <meshStandardMaterial color="#9aa0a8" roughness={0.85} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.55, 0.28]} scale={0.26} castShadow>
        <sphereGeometry args={[1, 18, 14]} />
        <meshStandardMaterial color="#a8aeb6" roughness={0.85} />
      </mesh>
      {/* Big round ears */}
      <mesh position={[-0.18, 0.74, 0.22]} scale={0.15}>
        <sphereGeometry args={[1, 14, 12]} />
        <meshStandardMaterial color="#c2a3a8" roughness={0.9} />
      </mesh>
      <mesh position={[0.18, 0.74, 0.22]} scale={0.15}>
        <sphereGeometry args={[1, 14, 12]} />
        <meshStandardMaterial color="#c2a3a8" roughness={0.9} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 0.5, 0.55]} scale={0.045}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color="#5a4a4e" roughness={1} />
      </mesh>
      {/* Long thin tail curling back */}
      <mesh position={[0, 0.2, -0.4]} rotation={[0.6, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.04, 0.7, 6]} />
        <meshStandardMaterial color="#c2a3a8" roughness={0.9} />
      </mesh>
    </group>
  );
}
