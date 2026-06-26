import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { ElementRef, MutableRefObject, Suspense, useEffect, useMemo, useRef } from "react";
import {
  Box3,
  Group,
  MathUtils,
  Mesh,
  PerspectiveCamera,
  Raycaster,
  Sphere,
  Vector2,
  Vector3,
} from "three";
import { CAM_SMOOTH, WALK_SPEED } from "../config";
import { useCameraConfig } from "../cameraConfig";
import { useKeyboard } from "../systems/useKeyboard";
import { useGame } from "../state";
import { playerPosition, playerState } from "../playerPosition";
import { resolveCollisions } from "../world";
import { surfaceOrientation, turnToward, upAt } from "../../lib/sphere";

const ORIGIN = new Vector3(0, 0, 0);

/**
 * To use a real hamster model instead of the primitive one: drop a `.glb` into
 * `public/models/` and set MODEL_URL to e.g. "/models/hamster.glb". Then tweak
 * MODEL_SCALE / MODEL_ROT / MODEL_OFFSET so it stands ~1 unit tall, sits with
 * its feet near y=0, and faces +Z (the walk direction). No file → primitives.
 */
// Hero hamster from the concept → image-to-3D → retexture pipeline. The glb
// ships its own baked texture (golden fur, white belly, eyes), so we keep its
// materials and just auto-fit scale + ground from the bounding box. Facing is
// the only manual knob; head proportion is set by the concept (regenerate to
// change it).
const MODEL_URL: string | null = "/models/golden-hamster.glb";
const MODEL_HEIGHT = 1.0; // stands ~1 unit tall
const MODEL_ROT: [number, number, number] = [0, 0, 0]; // [0, Math.PI, 0] if it faces backward

/**
 * The hamster: a code-built placeholder body + the spherical-walk controller
 * and the follow camera. This is the "tracer bullet" — the one mechanic that
 * proves the whole game is buildable. When a CC0 rigged model is ready, swap
 * <HamsterMesh/> for a <primitive object={gltf.scene}/> and keep the controller.
 */
export function Hamster({ radius }: { radius: number }) {
  const group = useRef<Group>(null!);
  const keys = useKeyboard();
  const { camera, gl } = useThree();
  // Free observation camera: when on, the follow-cam detaches and OrbitControls
  // takes over. Subscribed (reactive) so we can mount/unmount the controls.
  const observing = useGame((s) => s.observing);
  const wasObserving = useRef(false);
  const orbit = useRef<ElementRef<typeof OrbitControls>>(null);

  // Latest active-planet radius, read inside the render loop.
  const radiusRef = useRef(radius);
  radiusRef.current = radius;

  // Click-to-move: while a pointer is held on the canvas, walk toward the point
  // under the cursor (raycast onto the planet sphere). Moving the cursor while
  // held re-aims; releasing stops.
  const pointer = useRef({ active: false, ndc: new Vector2() });
  useEffect(() => {
    const el = gl.domElement;
    const toNDC = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.current.ndc.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -(((e.clientY - r.top) / r.height) * 2 - 1),
      );
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return; // left button only
      // In observation mode the drag belongs to OrbitControls — don't capture it.
      if (useGame.getState().observing) return;
      pointer.current.active = true;
      toNDC(e);
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* capture is best-effort */
      }
    };
    const onMove = (e: PointerEvent) => {
      if (pointer.current.active) toNDC(e);
    };
    const onUp = () => {
      pointer.current.active = false;
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [gl]);

  // Controller state lives in refs (mutated every frame, never re-rendered).
  const position = useRef(new Vector3(0, radius, 0));
  const facing = useRef(new Vector3(0, 0, -1)); // body: where the hamster looks
  const camHeading = useRef(new Vector3(0, 0, -1)); // camera yaw; input frame
  const epoch = useRef(0);
  // Drives the mesh's procedural animation: 1 while walking, 0 while still.
  const anim = useRef({ speed: 0 });

  // Scratch vectors reused each frame to avoid per-frame allocation.
  const tmp = useMemo(
    () => ({
      up: new Vector3(),
      right: new Vector3(),
      move: new Vector3(),
      camPos: new Vector3(),
      lookAt: new Vector3(),
      hit: new Vector3(),
      raycaster: new Raycaster(),
      sphere: new Sphere(),
    }),
    [],
  );

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 30); // clamp to survive tab-out spikes
    const pos = position.current;
    const { up, right, move, camPos, lookAt, hit, raycaster, sphere } = tmp;
    const head = camHeading.current;
    const face = facing.current;

    const game = useGame.getState();

    // Leaving a planet bumps the epoch — snap the hamster back to the arrival
    // point while the screen is black, and snap (don't lerp) the camera too.
    const radius = radiusRef.current;
    let snapCamera = false;
    if (game.planetEpoch !== epoch.current) {
      epoch.current = game.planetEpoch;
      pos.set(0, radius, 0);
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

    // Movement is frozen while talking, leaving, or in observation mode.
    const observing = game.observing;
    const frozen = game.dialogue !== null || game.departing || observing;

    move.set(0, 0, 0);
    if (!frozen && pointer.current.active) {
      // Click-to-move: aim a ray at the planet sphere and head for the hit
      // point along the surface (great-circle direction). Stop once on top.
      raycaster.setFromCamera(pointer.current.ndc, camera);
      sphere.set(ORIGIN, radius);
      if (raycaster.ray.intersectSphere(sphere, hit) && pos.angleTo(hit) > 0.05) {
        move.copy(hit).sub(pos); // chord toward the target…
        move.addScaledVector(up, -move.dot(up)); // …projected onto the surface
      }
    } else if (!frozen) {
      // Camera-relative keyboard input. Vectors sum, so opposite keys (W+S,
      // A+D) cancel to a stop and adjacent keys (W+D, …) give diagonals.
      const k = keys.current;
      if (k.forward) move.add(head);
      if (k.backward) move.sub(head);
      if (k.right) move.add(right);
      if (k.left) move.sub(right);
    }

    const moving = move.lengthSq() > 1e-6;
    if (moving) {
      move.normalize();
      // Step directly in the input direction (no arc) — strafing, back-stepping
      // and diagonals all work as-is.
      pos.addScaledVector(move, WALK_SPEED * dt).setLength(radius);
      upAt(pos, up); // up changed after moving across the curve
      move.addScaledVector(up, -move.dot(up)).normalize(); // re-tangent
      // The body turns to face where it walks…
      turnToward(face, move, up, cam.turnRate * dt);
    }
    anim.current.speed = moving ? 1 : 0;
    playerState.speed = anim.current.speed; // shared with audio (footsteps)

    // Push out of solid props, then refresh the surface frame.
    resolveCollisions(pos, radius);
    upAt(pos, up);

    // Keep facing tangent, then let the camera heading trail it (decoupled, so
    // low camFollow = strafe-style fixed camera, high = turn-to-face).
    face.addScaledVector(up, -face.dot(up)).normalize();
    turnToward(head, face, up, cam.camFollow * dt);
    head.addScaledVector(up, -head.dot(up)).normalize();

    // Stand the hamster on the surface, facing its heading.
    group.current.position.copy(pos);
    group.current.quaternion.copy(surfaceOrientation(up, face));
    playerPosition.copy(pos); // share with effects (rain, …)

    // Keep FOV in sync with the (live-tunable) config.
    if (camera instanceof PerspectiveCamera && camera.fov !== cam.fov) {
      camera.fov = cam.fov;
      camera.updateProjectionMatrix();
    }

    // While observing, OrbitControls owns the camera — leave it alone. On the
    // first frame of observing, reset `up` to world-up so the orbit is upright;
    // on the frame we exit, snap the follow-cam back instead of lerping from afar.
    if (observing) {
      if (!wasObserving.current) {
        camera.up.set(0, 1, 0);
        // Frame the hamster: drop the camera behind + above it so the character
        // is in view immediately instead of pointing at empty space.
        camPos.copy(pos).addScaledVector(head, -3).addScaledVector(up, 2);
        camera.position.copy(camPos);
      }
      wasObserving.current = true;
      // Orbit the hamster, not the planet centre, so you can inspect it close up.
      if (orbit.current) {
        orbit.current.target.copy(pos);
        orbit.current.update();
      }
      return;
    }
    if (wasObserving.current) {
      wasObserving.current = false;
      snapCamera = true;
    }

    // Follow camera: trails behind the camera heading, raised, looking ahead/up.
    // During dialogue, push in a touch for an intimate framing.
    const talking = game.dialogue !== null;
    const dist = cam.distance * (talking ? 0.72 : 1);
    const lookUp = cam.lookUp + (talking ? 0.3 : 0);
    camPos
      .copy(pos)
      .addScaledVector(up, cam.height)
      .addScaledVector(head, -dist);
    if (snapCamera) camera.position.copy(camPos);
    else camera.position.lerp(camPos, CAM_SMOOTH);
    camera.up.copy(up);
    lookAt.copy(pos).addScaledVector(up, lookUp);
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
    <>
      <group ref={group}>
        {MODEL_URL ? (
          <Suspense fallback={<HamsterMesh anim={anim} />}>
            <HamsterModel url={MODEL_URL} anim={anim} />
          </Suspense>
        ) : (
          <HamsterMesh anim={anim} />
        )}
      </group>

      {/* Free observation camera — orbit the hamster to inspect it, or pull back
          to take in the planet/sky. */}
      {observing && (
        <OrbitControls
          ref={orbit}
          makeDefault
          enablePan
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.6}
          zoomSpeed={0.8}
          minDistance={0.5}
          maxDistance={radius * 8}
        />
      )}
    </>
  );
}

/**
 * Loads a .glb hamster and gives it the same procedural life (walk bounce +
 * lean). If the model ships its own walk/idle clips, swap this for drei's
 * useAnimations later. Cloned so HMR / reuse is safe.
 */
function HamsterModel({
  url,
  anim,
}: {
  url: string;
  anim: MutableRefObject<{ speed: number }>;
}) {
  const { scene } = useGLTF(url);
  // Clone (keeping the glb's baked texture) and auto-fit: scale so it's
  // MODEL_HEIGHT tall and drop it so its feet sit at y=0 — robust to whatever
  // scale Meshy emits.
  const { model, scale, footY } = useMemo(() => {
    const m = scene.clone(true);
    const box = new Box3().setFromObject(m);
    const size = new Vector3();
    box.getSize(size);
    return { model: m, scale: MODEL_HEIGHT / size.y, footY: box.min.y };
  }, [scene]);
  const root = useRef<Group>(null!);
  const spd = useRef(0);
  const phase = useRef(0);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    spd.current = MathUtils.damp(spd.current, anim.current.speed, 8, dt);
    const s = spd.current;
    phase.current += dt * (2 + 11 * s);
    root.current.position.y = Math.abs(Math.sin(phase.current)) * 0.13 * s;
    root.current.rotation.x = -0.12 * s; // lean into the walk
  });

  return (
    <group ref={root}>
      <primitive
        object={model}
        scale={scale}
        rotation={MODEL_ROT}
        position={[0, -footY * scale, 0]}
      />
    </group>
  );
}

const BODY_SCALE = new Vector3(0.64, 0.56, 0.74);

/**
 * Placeholder hamster built from primitives, with procedural animation.
 * Local +Z is "front". `anim.speed` (0..1) drives a walk bounce + lean +
 * ear/tail sway; when idle it just breathes. No keyframes, no asset.
 */
function HamsterMesh({ anim }: { anim: MutableRefObject<{ speed: number }> }) {
  const root = useRef<Group>(null!);
  const body = useRef<Mesh>(null!);
  const head = useRef<Group>(null!);
  const earL = useRef<Mesh>(null!);
  const earR = useRef<Mesh>(null!);
  const tail = useRef<Group>(null!);
  const phase = useRef(0);
  const spd = useRef(0);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const time = performance.now() / 1000;
    // Ease the walk amount so starts/stops are soft.
    spd.current = MathUtils.damp(spd.current, anim.current.speed, 8, dt);
    const s = spd.current;
    phase.current += dt * (2 + 11 * s); // scurrying little legs

    const step = Math.sin(phase.current); // step cycle
    const hop = Math.abs(Math.sin(phase.current)) * 0.13 * s; // bounce each step
    const breathe = Math.sin(time * 1.8) * 0.03 * (1 - s); // only while still

    // Root: bounce up, lean into the walk (+Z is forward), gentle waddle.
    root.current.position.y = hop;
    root.current.rotation.x = -0.16 * s;
    root.current.rotation.z = step * 0.07 * s;

    // Body: squash/stretch with the bounce; breathe when idle.
    const stretch = 1 + hop * 0.7 + breathe;
    body.current.scale.set(
      BODY_SCALE.x / Math.sqrt(stretch),
      BODY_SCALE.y * stretch,
      BODY_SCALE.z / Math.sqrt(stretch),
    );

    // Head: tiny nod.
    head.current.rotation.x = step * 0.06 * s + breathe;

    // Ears: flop with each step (elongated, so the tilt reads).
    earL.current.rotation.z = 0.25 + step * 0.35 * s;
    earR.current.rotation.z = -0.25 - step * 0.35 * s;

    // Tail: sway side to side.
    tail.current.rotation.z = step * 0.5 * s;
  });

  return (
    <group ref={root}>
      {/* Chubby round body — sits just above the surface (feet near origin). */}
      <mesh ref={body} position={[0, 0.46, 0]} scale={[0.64, 0.56, 0.74]} castShadow>
        <sphereGeometry args={[1, 22, 18]} />
        <meshStandardMaterial color="#d9a86a" roughness={0.85} />
      </mesh>
      {/* Cream belly patch. */}
      <mesh position={[0, 0.32, 0.34]} scale={[0.44, 0.42, 0.42]}>
        <sphereGeometry args={[1, 18, 14]} />
        <meshStandardMaterial color="#efe2cf" roughness={0.9} />
      </mesh>

      {/* Head group (nods); holds the face, cheeks, eyes, nose, ears, whiskers.
          Local +Z is "front". */}
      <group ref={head}>
        <mesh position={[0, 0.56, 0.42]} scale={0.4} castShadow>
          <sphereGeometry args={[1, 22, 18]} />
          <meshStandardMaterial color="#e2b87e" roughness={0.85} />
        </mesh>
        {/* The iconic cheek pouches. */}
        <mesh position={[-0.28, 0.44, 0.5]} scale={0.22}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color="#ecd3a6" roughness={0.88} />
        </mesh>
        <mesh position={[0.28, 0.44, 0.5]} scale={0.22}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color="#ecd3a6" roughness={0.88} />
        </mesh>
        {/* Eyes — small, dark, shiny. */}
        <mesh position={[-0.15, 0.64, 0.68]} scale={0.055}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color="#16110d" roughness={0.25} />
        </mesh>
        <mesh position={[0.15, 0.64, 0.68]} scale={0.055}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color="#16110d" roughness={0.25} />
        </mesh>
        {/* Pink nose. */}
        <mesh position={[0, 0.55, 0.81]} scale={0.05}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color="#bb6f73" roughness={0.7} />
        </mesh>
        {/* Whiskers — thin and pale. */}
        {[
          [-1, 0.04],
          [-1, -0.03],
          [1, 0.04],
          [1, -0.03],
        ].map(([side, dy], i) => (
          <mesh
            key={i}
            position={[side * 0.1, 0.55 + dy, 0.74]}
            rotation={[Math.PI / 2, side * 0.55, 0]}
          >
            <cylinderGeometry args={[0.004, 0.004, 0.34, 4]} />
            <meshStandardMaterial color="#efe8e0" roughness={0.6} />
          </mesh>
        ))}
        {/* Ears — small and round, slightly elongated so the flop reads. */}
        <mesh ref={earL} position={[-0.17, 0.84, 0.4]} scale={[0.1, 0.13, 0.08]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color="#caa06a" roughness={0.9} />
        </mesh>
        <mesh ref={earR} position={[0.17, 0.84, 0.4]} scale={[0.1, 0.13, 0.08]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshStandardMaterial color="#caa06a" roughness={0.9} />
        </mesh>
      </group>

      {/* Little front paws. */}
      <mesh position={[-0.2, 0.16, 0.48]} scale={[0.1, 0.12, 0.13]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#e8c08a" roughness={0.85} />
      </mesh>
      <mesh position={[0.2, 0.16, 0.48]} scale={[0.1, 0.12, 0.13]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#e8c08a" roughness={0.85} />
      </mesh>
      {/* Stubby hind feet. */}
      <mesh position={[-0.22, 0.06, 0.18]} scale={[0.12, 0.07, 0.18]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#e8c08a" roughness={0.85} />
      </mesh>
      <mesh position={[0.22, 0.06, 0.18]} scale={[0.12, 0.07, 0.18]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial color="#e8c08a" roughness={0.85} />
      </mesh>

      {/* Tiny tail nub that sways. */}
      <group ref={tail} position={[0, 0.36, -0.62]}>
        <mesh scale={[0.08, 0.08, 0.1]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color="#d9a86a" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}
