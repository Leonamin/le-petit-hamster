import { useAudio } from "../audio/useAudio";
import { useInteraction } from "../game/systems/useInteraction";
import { useGame } from "../game/state";
import { CameraDebug } from "./CameraDebug";
import { Dialogue } from "./Dialogue";
import { Fade } from "./Fade";
import { PlanetTitle } from "./PlanetTitle";

/**
 * 2D overlay layer (lives outside the Canvas). Owns global interaction input
 * and ambience, and shows context-sensitive hints, dialogue, and the fade.
 */
export function Hud() {
  useInteraction();
  useAudio();
  const nearby = useGame((s) => (s.nearbyId ? s.interactables[s.nearbyId] : null));
  const dialogue = useGame((s) => s.dialogue);
  const departing = useGame((s) => s.departing);
  const observing = useGame((s) => s.observing);

  return (
    <>
      <PlanetTitle />
      <Dialogue />
      <Fade />
      <CameraDebug />
      {observing ? (
        <div className="hint">드래그로 둘러보기 · 휠로 줌 · V로 햄스터에게 돌아가기</div>
      ) : (
        !dialogue &&
        !departing && (
          <div className="hint">
            {nearby
              ? nearby.prompt
              : "WASD · 화살표 · 클릭(꾹)으로 이동 · V로 자유 관찰"}
          </div>
        )
      )}
    </>
  );
}
