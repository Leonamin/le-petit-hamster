import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group, PerspectiveCamera, Vector3 } from "three";
import { CAM_SMOOTH, PLANET_RADIUS, WALK_SPEED } from "../config";
import { useCameraConfig } from "../cameraConfig";
import { useKeyboard } from "../systems/useKeyboard";
import { useGame } from "../state";
import { surfaceOrientation, turnToward, upAt } from "../../lib/sphere";

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
  const facing = useRef(new Vector3(0, 0, -1)); // body: where the hamster looks
  const camHeading = useRef(new Vector3(0, 0, -1)); // camera yaw; input frame
  const epoch = useRef(0);

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
    const { up, right, move, camPos, lookAt } = tmp;
    const head = camHeading.current;
    const face = facing.current;

    const game = useGame.getState();

    // Leaving a planet bumps the epoch — snap the hamster back to the arrival
    // point while the screen is black, and snap (don't lerp) the camera too.
    let snapCamera = false;
    if (game.planetEpoch !== epoch.current) {
      epoch.current = game.planetEpoch;
      pos.set(0, PLANET_RADIUS, 0);
      face.set(0, 0, -1);
      head.set(0, 0, -1);
      snapCamera = true;
    }

    const cam = useCameraConfig.getState();

    upAt(pos, up);
    // The camera's heading defines the input frame: W = into the screen.
    // Keep it tangent to the surface every frame (up drifts as we walk).
    head.addScaledVector(up, -head.dot(up)).normalize();
    right.copy(head).cross(up).normalize(); // camHeading × up = right

    // Movement is frozen while talking or while leaving — keep moments quiet.
    const frozen = game.dialogue !== null || game.departing;

    // Camera-relative input. Vectors sum, so opposite keys (W+S, A+D) cancel
    // to a stop and adjacent keys (W+D, …) give true diagonal movement.
    move.set(0, 0, 0);
    if (!frozen) {
      const k = keys.current;
      if (k.forward) move.add(head);
      if (k.backward) move.sub(head);
      if (k.right) move.add(right);
      if (k.left) move.sub(right);
    }

    if (move.lengthSq() > 1e-6) {
      move.normalize();
      // Step directly in the input direction (no arc) — strafing, back-stepping
      // and diagonals all work as-is.
      pos.addScaledVector(move, WALK_SPEED * dt).setLength(PLANET_RADIUS);
      upAt(pos, up); // up changed after moving across the curve
      move.addScaledVector(up, -move.dot(up)).normalize(); // re-tangent
      // The body turns to face where it walks…
      turnToward(face, move, up, cam.turnRate * dt);
    }

    // Keep facing tangent, then let the camera heading trail it (decoupled, so
    // low camFollow = strafe-style fixed camera, high = turn-to-face).
    face.addScaledVector(up, -face.dot(up)).normalize();
    turnToward(head, face, up, cam.camFollow * dt);
    head.addScaledVector(up, -head.dot(up)).normalize();

    // Stand the hamster on the surface, facing its heading.
    group.current.position.copy(pos);
    group.current.quaternion.copy(surfaceOrientation(up, face));

    // Keep FOV in sync with the (live-tunable) config.
    if (camera instanceof PerspectiveCamera && camera.fov !== cam.fov) {
      camera.fov = cam.fov;
      camera.updateProjectionMatrix();
    }

    // Follow camera: trails behind the camera heading, raised, looking ahead/up.
    camPos
      .copy(pos)
      .addScaledVector(up, cam.height)
      .addScaledVector(head, -cam.distance);
    if (snapCamera) camera.position.copy(camPos);
    else camera.position.lerp(camPos, CAM_SMOOTH);
    camera.up.copy(up);
    lookAt.copy(pos).addScaledVector(up, cam.lookUp);
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
