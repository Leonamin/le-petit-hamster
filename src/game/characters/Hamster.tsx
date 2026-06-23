import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group, Vector3 } from "three";
import {
  CAM_DISTANCE,
  CAM_HEIGHT,
  CAM_LOOK_UP,
  CAM_SMOOTH,
  PLANET_RADIUS,
  WALK_SPEED,
} from "../config";
import { useKeyboard } from "../systems/useKeyboard";
import { useGame } from "../state";
import { surfaceOrientation, upAt } from "../../lib/sphere";

/**
 * The hamster: a code-built placeholder body + the spherical-walk controller
 * and the follow camera. This is the "tracer bullet" — the one mechanic that
 * proves the whole game is buildable. When a CC0 rigged model is ready, swap
 * <HamsterMesh/> for a <primitive object={gltf.scene}/> and keep the controller.
 */
export function Hamster() {
  const group = useRef<Group>(null!);
  const keys = useKeyboard();
  const { camera } = useThree();

  // Controller state lives in refs (mutated every frame, never re-rendered).
  const position = useRef(new Vector3(0, PLANET_RADIUS, 0));
  const forward = useRef(new Vector3(0, 0, -1));

  // Scratch vectors reused each frame to avoid per-frame allocation.
  const tmp = useMemo(
    () => ({
      up: new Vector3(),
      right: new Vector3(),
      move: new Vector3(),
      camPos: new Vector3(),
      lookAt: new Vector3(),
    }),
    [],
  );

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 30); // clamp to survive tab-out spikes
    const pos = position.current;
    const f = forward.current;
    const { up, right, move, camPos, lookAt } = tmp;

    upAt(pos, up);
    // Keep forward tangent to the surface.
    f.addScaledVector(up, -f.dot(up)).normalize();
    right.copy(f).cross(up).normalize(); // forward × up = right

    const game = useGame.getState();
    const talking = game.dialogue !== null;

    move.set(0, 0, 0);
    if (!talking) {
      // Movement is frozen while a dialogue is open — keep the moment quiet.
      const k = keys.current;
      if (k.forward) move.add(f);
      if (k.backward) move.sub(f);
      if (k.right) move.add(right);
      if (k.left) move.sub(right);
    }

    if (move.lengthSq() > 1e-6) {
      move.normalize();
      f.copy(move); // face the direction we walk
      pos.addScaledVector(move, WALK_SPEED * dt).setLength(PLANET_RADIUS);
      upAt(pos, up); // up changed after moving across the curve
      f.addScaledVector(up, -f.dot(up)).normalize();
    }

    // Stand the hamster on the surface, facing its heading.
    group.current.position.copy(pos);
    group.current.quaternion.copy(surfaceOrientation(up, f));

    // Follow camera: behind + low, looking slightly upward.
    camPos
      .copy(pos)
      .addScaledVector(up, CAM_HEIGHT)
      .addScaledVector(f, -CAM_DISTANCE);
    camera.position.lerp(camPos, CAM_SMOOTH);
    camera.up.copy(up);
    lookAt.copy(pos).addScaledVector(up, CAM_LOOK_UP);
    camera.lookAt(lookAt);

    // Proximity: find the closest in-range interactable and report it.
    let nearest: string | null = null;
    let bestDist = Infinity;
    for (const item of Object.values(game.interactables)) {
      const d = pos.distanceTo(item.position);
      if (d <= item.radius && d < bestDist) {
        bestDist = d;
        nearest = item.id;
      }
    }
    game.setNearby(nearest);
  });

  return (
    <group ref={group}>
      <HamsterMesh />
    </group>
  );
}

/** Placeholder hamster built from primitives. Local +Z is "front". */
function HamsterMesh() {
  return (
    <group>
      {/* Body — sits just above the surface (feet near local origin). */}
      <mesh position={[0, 0.42, 0]} scale={[0.55, 0.45, 0.7]} castShadow>
        <sphereGeometry args={[1, 20, 16]} />
        <meshStandardMaterial color="#d9b08c" roughness={0.85} />
      </mesh>
      {/* Head, leaning toward +Z. */}
      <mesh position={[0, 0.55, 0.45]} scale={0.34} castShadow>
        <sphereGeometry args={[1, 20, 16]} />
        <meshStandardMaterial color="#e6c4a0" roughness={0.85} />
      </mesh>
      {/* Ears */}
      <mesh position={[-0.16, 0.78, 0.42]} scale={0.12}>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color="#c79a78" roughness={0.9} />
      </mesh>
      <mesh position={[0.16, 0.78, 0.42]} scale={0.12}>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color="#c79a78" roughness={0.9} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 0.5, 0.78]} scale={0.05}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color="#6b4f3a" roughness={1} />
      </mesh>
    </group>
  );
}
