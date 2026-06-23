import { useInteraction } from "../game/systems/useInteraction";
import { useGame } from "../game/state";
import { Dialogue } from "./Dialogue";

/**
 * 2D overlay layer (lives outside the Canvas). Owns global interaction input
 * and shows context-sensitive hints + the dialogue box.
 */
export function Hud() {
  useInteraction();
  const nearbyId = useGame((s) => s.nearbyId);
  const dialogue = useGame((s) => s.dialogue);

  return (
    <>
      <Dialogue />
      {!dialogue && (
        <div className="hint">
          {nearbyId
            ? "스페이스 — 말 걸기"
            : "WASD / 화살표로 햄스터를 움직여 행성을 거닐어 보세요"}
        </div>
      )}
    </>
  );
}
