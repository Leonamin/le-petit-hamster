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

  return (
    <>
      <PlanetTitle />
      <Dialogue />
      <Fade />
      <CameraDebug />
      {!dialogue && !departing && (
        <div className="hint">
          {nearby
            ? nearby.prompt
            : "WASD · 화살표 · 클릭(꾹)으로 햄스터를 움직여 보세요"}
        </div>
      )}
    </>
  );
}
