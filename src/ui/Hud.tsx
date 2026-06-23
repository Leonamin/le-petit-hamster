import { useAmbience } from "../audio/useAmbience";
import { useInteraction } from "../game/systems/useInteraction";
import { useGame } from "../game/state";
import { Dialogue } from "./Dialogue";
import { Fade } from "./Fade";

/**
 * 2D overlay layer (lives outside the Canvas). Owns global interaction input
 * and ambience, and shows context-sensitive hints, dialogue, and the fade.
 */
export function Hud() {
  useInteraction();
  useAmbience();
  const nearby = useGame((s) => (s.nearbyId ? s.interactables[s.nearbyId] : null));
  const dialogue = useGame((s) => s.dialogue);
  const departing = useGame((s) => s.departing);

  return (
    <>
      <Dialogue />
      <Fade />
      {!dialogue && !departing && (
        <div className="hint">
          {nearby
            ? nearby.prompt
            : "WASD / 화살표로 햄스터를 움직여 행성을 거닐어 보세요"}
        </div>
      )}
    </>
  );
}
