import { Suspense, useRef } from "react";
import { Group, Vector3 } from "three";
import { useInteractableProp } from "../systems/useInteractableProp";
import { AnimalModel } from "./AnimalModel";

/**
 * The Windup Artisan (Time planet) — an old stag who keeps the great clock
 * turning. Walk close and press Space. Uses a CC0 animated model (Quaternius)
 * playing its Idle clip.
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
      <Suspense fallback={null}>
        {/* An old stag tends the clock — ancient, unhurried. */}
        <AnimalModel url="/models/Stag.gltf" clip="Idle" scale={0.55} />
      </Suspense>
    </group>
  );
}
