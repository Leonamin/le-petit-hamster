import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Group, Quaternion, Vector3 } from "three";
import { useGame } from "../state";

/**
 * A soft, bobbing chevron that hovers above the nearby interactable to say
 * "come talk". Lives in the scene; reads the nearby interactable's world
 * position from the store. Hidden during dialogue. Emissive so Bloom glows it.
 */
const UP_Y = new Vector3(0, 1, 0);
const HOVER = 3.2; // height above the interactable

export function InteractionMarker() {
  const group = useRef<Group>(null!);
  const nearby = useGame((s) => (s.nearbyId ? s.interactables[s.nearbyId] : null));
  const dialogue = useGame((s) => s.dialogue);
  const scratch = useRef({ up: new Vector3(), down: new Vector3(), q: new Quaternion() }).current;

  const visible = !!nearby && !dialogue;

  useFrame((state) => {
    if (!visible || !nearby) return;
    const { up, down, q } = scratch;
    up.copy(nearby.position).normalize();
    const bob = Math.sin(state.clock.elapsedTime * 2.5) * 0.14;
    group.current.position.copy(nearby.position).addScaledVector(up, HOVER + bob);
    // Point the chevron's tip down toward the interactable.
    q.setFromUnitVectors(UP_Y, down.copy(up).negate());
    group.current.quaternion.copy(q);
  });

  return (
    <group ref={group} visible={visible}>
      <mesh>
        <coneGeometry args={[0.16, 0.3, 4]} />
        <meshStandardMaterial
          color="#ffe9b0"
          emissive="#ffd373"
          emissiveIntensity={2.2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
