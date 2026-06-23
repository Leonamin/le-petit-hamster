import { Suspense, useRef } from "react";
import { Group, Vector3 } from "three";
import { useInteractableProp } from "../systems/useInteractableProp";
import { AnimalModel } from "./AnimalModel";

/**
 * The Lighthouse Keeper (Rain Planet, theme: Waiting) — a gentle deer that
 * stands by the lighthouse. Walk close and press Space to hear them. Uses a
 * CC0 animated model (Quaternius) playing its Idle clip.
 */

const KEEPER_DIR = new Vector3(0.33, 1, 0.5);

const LINES = [
  "…아, 손님이구나. 이 행성엔 참 오랜만에 오는 발걸음이야.",
  "나는 이 등대를 지켜. 누가 올지는 몰라도, 불은 한 번도 꺼뜨린 적 없단다.",
  "기다린다는 건 외로운 일이지. 그래도 누군가 올 거라 믿으면, 밤도 그리 길지만은 않더구나.",
  "저 너머에 잠든 친구가 하나 있어. 굳이 깨우지 않아도 괜찮아. 그저 곁에 잠시 있어 주는 것만으로도, 충분할 때가 있으니까.",
];

export function LighthouseKeeper({ radius }: { radius: number }) {
  const ref = useRef<Group>(null!);

  useInteractableProp(ref, radius, {
    id: "rain-keeper",
    direction: KEEPER_DIR,
    spin: 0.5,
    range: 3,
    prompt: "스페이스 — 말 걸기",
    speaker: "등대지기",
    lines: LINES,
  });

  return (
    <group ref={ref}>
      <Suspense fallback={null}>
        {/* A gentle deer keeps the lighthouse — towering, to a hamster. */}
        <AnimalModel url="/models/Deer.gltf" clip="Idle" scale={0.55} />
      </Suspense>
    </group>
  );
}
