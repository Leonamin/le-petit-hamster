import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { Group, Mesh } from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";

/**
 * Loads a Quaternius (CC0) animated animal .gltf and plays one of its clips.
 * Each model's origin is at its feet, faces +Z, and ships clips like
 * Idle / Walk / Gallop / Jump. Cloned via SkeletonUtils so the skinned mesh
 * stays intact if the same model is reused.
 */
interface Props {
  url: string;
  /** Animation clip name to loop (default "Idle"). */
  clip?: string;
  scale?: number;
  rotation?: [number, number, number];
}

export function AnimalModel({ url, clip = "Idle", scale = 1, rotation = [0, 0, 0] }: Props) {
  const { scene, animations } = useGLTF(url);
  const model = useMemo(() => {
    const cloned = cloneSkinned(scene);
    cloned.traverse((o) => {
      if ((o as Mesh).isMesh) o.castShadow = true;
    });
    return cloned;
  }, [scene]);

  const group = useRef<Group>(null!);
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    const action = actions[clip] ?? actions[names[0]];
    action?.reset().fadeIn(0.3).play();
    return () => {
      action?.fadeOut(0.2);
    };
  }, [actions, names, clip]);

  return (
    <group ref={group}>
      <primitive object={model} scale={scale} rotation={rotation} />
    </group>
  );
}
